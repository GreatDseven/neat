//大屏展示
layui.define(["jquery", 'element', 'laytpl', 'layer', 'neat', 'neatNavigator', 'neatUITools',
    'neatGIS', 'neatTreeDataMaker', 'treeview', "neatTime", 'enterpriseInfoDataApi', 'enterpriseDataApi', 'neatWindowManager', 'neatPopupRepository'], function (exports) {

        "use strict";

        var MODULE_NAME = "pageEnterpriseInfo";
        var $ = layui.$;
        var neat = layui.neat;
        var gis = layui.neatGIS();
        var treeDataMaker = layui.neatTreeDataMaker();
        var neatTime = layui.neatTime;
        var neatDataApi = layui.neatDataApi;
        var maplayer = {};
        var treeview = layui.treeview;
        var pageDataApi = layui.enterpriseInfoDataApi;
        var laytpl = layui.laytpl;
        var popUps = layui.neatPopupRepository;


        var SubPage = function () {
            this.map = null;
            this.satellite = null;

            this.zoomIndex = null;
            this.centerPoint = null;

            this.mapTdPoints = {};
            this.mapPoints = {};
        };

        SubPage.prototype.init = function () {
            var that = this;

            that.buildMap('2D');

            that.initTree();

            neatTime({ elem: "#currentTime" });

            that.initEvent();
        };

        // 初始化地图
        SubPage.prototype.buildMap = function (viewMode) {
            var that = this;

            var options = {
                animateEnable: true,
                resizeEnable: false,
                zoom: 10,
                scrollWheel: true,
                isHotspot: false
            };

            //初始化地图
            gis.initMapSatellite('map', options, function () { that.mapLoadComplete(); }, function (mapObj) {
                that.map = mapObj;

                that.satellite = new AMap.TileLayer.Satellite({
                    map: mapObj,
                });
                that.satellite.hide();

            }, viewMode);
        };

        //初始化树
        SubPage.prototype.initTree = function () {

            var that = this;

            neatDataApi.loadOrgTreeData(neat.getUserToken(), function (treeRawData) {

                var txt = $.trim($("#txtSearchTree").val());

                that.addTreeNodeIcon(treeRawData);

                // 只显示到企业
                var finalTreeData = treeDataMaker.make(that.filterTreeData(treeRawData, "1,2"), txt);

                that.bindTreeData(finalTreeData);

            }, function () {
            });
        };

        //点击的如果是企业,地图导航到企业
        SubPage.prototype.mapNavigateToEnt = function (treeNodeData) {
            var that = this;
            var entId = treeNodeData.id;
            var nodeType = treeNodeData.type;

            if (nodeType !== 2) {
                return;
            }
            //找到地图   
            var mapMode = that.map.getViewMode_();
            if (mapMode == '2D') {

                //找到标记
                var marker = that.mapPoints[that._getKey(entId)];

                if (!marker) {                  
                    return;
                } 

           
                that.zoomIndex = 15;
                that.map.setZoom(that.zoomIndex);
                that.map.setCenter(marker.getPosition());
                //点击marker ,打开信息窗体
                that.clickMarker(marker);
            } else {
                //找到标记
                var point3DObj = that.mapTdPoints[that._getKey(entId)];

                if (!point3DObj)
                    return;

                that.zoomIndex = 15;
                that.map.setZoom(that.zoomIndex);
                that.map.setCenter(point3DObj.point3D);

                that._showPointPopul(point3DObj);
            }
        }

        // 添加tree的图标
        SubPage.prototype.addTreeNodeIcon = function (treeRawData) {
            layui.each(treeRawData, function (_, item) {

                if (item.type === 1) {
                    item.icon = "fas fa-star";
                }
                else if (item.type === 2) {
                    item.icon = "fas fa-landmark";
                }
                else if (item.type === 3) {
                    item.icon = "fas fa-building";
                }
                else if (item.type === 4) {
                    item.icon = "far fa-dot-circle";
                }

            });
        }

        // 筛选tree数据
        SubPage.prototype.filterTreeData = function (treeRawData, returnNodeTypes) {

            if (returnNodeTypes.length == 2
                && returnNodeTypes.indexOf(1) > -1
                && returnNodeTypes.indexOf(2) > -1
            ) {
                return treeRawData;
            }

            var fildterTreeRawData = [];

            $.each(treeRawData, function (_, item) {

                if (returnNodeTypes.indexOf(item.type) > -1) {
                    fildterTreeRawData.push(item);
                }

            });

            return fildterTreeRawData;
        }

        //给树绑定数据
        SubPage.prototype.bindTreeData = function (treeData) {
            var that = this;

            // 加载树
            var mytree = $('#treeview').treeview({
                levels: 2,
                data: treeData,
                onNodeSelected: function (event, node) {
                    that.mapNavigateToEnt(node);
                }
            });


            var hashData = layui.router();
            if (!hashData.search.nodeId && hashData.hash !== "") {
                hashData = layui.router(hashData.hash);
            }

            //如果原来的url中有已经选中的节点,那么帮助用户选中这个节点.
            if (hashData.search.nodeId) {
                var nodes = $('#treeview').data('treeview').findNodes(hashData.search.nodeId.replace(/-/g, "\\-"), 'g', 'id');

                if (nodes.length == 1) {

                    //如果存在父节点,那么展开父节点.
                    var parent = $('#treeview').data('treeview').getParent(nodes[0]);
                    if (parent) {
                        $('#treeview').data('treeview').expandNode(parent);
                    }


                    $('#treeview').data('treeview').selectNode(nodes[0]);

                }
            }
            else {
                if (treeData.length > 0) {
                    $('#treeview').treeview('selectNode', [0]);
                }
            }


        };

        SubPage.prototype.mapLoadComplete = function (obj) {
            var that = this;
            pageDataApi.getEntDataInMap(neat.getUserToken(), function (jsonData) {             
                //找到地图
                if (jsonData.constructor === Array) {                   
                    $.each(jsonData, function (index, value) {
                        // 当前 单位的状态信息
                        var entStatus = that.getEnterpriseStatus(value);
                        // 构造地图Marker信息
                        var finaldata = {
                            id: value.id,
                            entId: value.id,
                            titleText: that.transformEventWord2Text(entStatus),

                            bodyText: value.name,
                            footLabel: "详细地址:",
                            footText: value.address,
                            lon: value.lon,
                            lat: value.lat,
                            type: entStatus
                        };
                        var viewMode = that.map.getViewMode_();
                        if (viewMode == '2D') {
                            that.addEnterInfoToMap2D(finaldata);
                        } else {
                            that.addEnterInfoToMap3D(finaldata);
                        }
                    });
                }
            }, function (error) { });
        };

        SubPage.prototype.transformEventWord2Text = function (eventTypeId) {

            var str = eventTypeId.toString().toLowerCase();

            if (str === "fire") {
                return "火警";
            }
            else if (str === "alarm") {
                return "报警";
            }
            else if (str === "fault") {
                return "故障";
            }
            else if (str === "normal") {
                return "正常";
            }
            else if (str === "status") {
                return "状态";
            } else {
                return eventTypeId;
            }
        }

        // 添加单位的3D数据
        SubPage.prototype.addEnterInfoToMap3D = function (data) {
            var that = this;

            // 获取当前地图的弹框信息模板
            if (typeof (AMap) === 'undefined') { return; }
            //获取Map对象        
            if (typeof (that.map) === 'undefined') { return; }

            var object3Dlayer = new AMap.Object3DLayer({ zIndex: 110, opacity: 1 });
            that.map.add(object3Dlayer);

            var points3D = new AMap.Object3D.Points();
            points3D.transparent = true;
            var geometry = points3D.geometry;

            var lnglat = that.map.lngLatToGeodeticCoord(new AMap.LngLat(data.lon, data.lat, true));
            // 高度为 0
            geometry.vertices.push(AMap.Util.format(lnglat.x, 3), AMap.Util.format(lnglat.y, 3), 0);
            geometry.pointSizes.push(30);
            geometry.vertexColors.push(0.6, 0.8, 1, 1);

            points3D.borderColor = [0.6, 0.8, 1, 1];
            points3D.borderWeight = 3;

            object3Dlayer.add(points3D);


            laytpl($("#mapEnterpriseInfoWindowTemplate").html()).render(data, function (html) {
                var point3dTemp = {
                    html: html,
                    point3D: new AMap.LngLat(data.lon, data.lat, true)
                };

                // 将当前的点添加到地图上
                that.mapTdPoints[that._getKey(data.entId)] = point3dTemp;
            });
        };

        // 添加单位的2D数据
        SubPage.prototype.addEnterInfoToMap2D = function (data) {
            var that = this;
            //从缓存中拿marker数据,如果拿到,就使用原来的.拿不到构造新的.
            var marker = new AMap.Marker({
                position: new AMap.LngLat(data.lon, data.lat),
                title: data.titleText,
                offset: new AMap.Pixel(-18, -18),
                extraData: { id: data.entId, }
            });
            marker.setContent('<div class="marker-{0} neatmarker"><div></div><div></div></div>'.replace("{0}", data.type));
            laytpl($("#mapEnterpriseInfoWindowTemplate").html()).render(data, function (html) {
                
                marker.infoWindowContent = html;

                var key1 = that._getKey(data.entId);
                if (typeof that.mapPoints[key1] === "undefined") {
                    that.mapPoints[key1] = {};
                }
                //添加到缓存
                that.mapPoints[key1] = marker;

                if (!that.map.myInfoWindow) {
                   
                    that.map.myInfoWindow = new AMap.InfoWindow({
                        content: html,
                        isCustom: true, //使用自定义窗体
                        offset: new AMap.Pixel(18, -5)
                    });
                    AMap.event.addListener(that.map.myInfoWindow, 'close', function (e) {
                        that._setMarkerBiggerSizeClass(that.map.myInfoWindow.currentMarker, false);
                    });
                }

                //添加marker
                that.map.add(marker);              
                //点击 marker时显示信息窗体
                AMap.event.addListener(marker, 'click', function (e) {
                    that.clickMarker(e.target);
                });
            });
        };

        // 构造Key
        SubPage.prototype._getKey = function (id) {
            return "k" + id.replace(/-/g, "");
        };

        //地图Marker点击事件
        SubPage.prototype.clickMarker = function (marker) {
            var that = this;
            that.map.setCenter(marker.getPosition());
            that.map.myInfoWindow.setContent(marker.infoWindowContent);
            that.map.myInfoWindow.currentMarker = marker;
            that.map.myInfoWindow.open(that.map, marker.getPosition());

            that._setMarkerBiggerSizeClass(marker, true);

            var otherMarkers = that.map.getAllOverlays("marker");
            for (var index in otherMarkers) {
                if (otherMarkers[index] !== marker) {

                    that._setMarkerBiggerSizeClass(otherMarkers[index], false);
                }
            }
        }

        SubPage.prototype._setMarkerBiggerSizeClass = function (marker, toggle) {
            var html = marker.getContent();

            marker.setContent($(html).toggleClass("marker-bigger", toggle)[0].outerHTML);
        };

        SubPage.prototype._showPointPopul = function (point3DObj) {
            var that = this;

            var infoWindow = new AMap.InfoWindow({
                content: point3DObj.html,  //使用默认信息窗体框样式，显示信息内容
                autoMove: true,
                isCustom: true,
            });

            infoWindow.open(that.map, point3DObj.point3D);
        };

        // 获取当前单位的状态信息
        SubPage.prototype.getEnterpriseStatus = function (data) {
            /**
            * var data = {
            *  Actions: []
               Address: "河北省秦皇岛市海港区文化路号"
               Category: 1
               FaultCount: 0
               FireCount: 0
               FireTel: "5908888,5908888"
               ID: "4d6b9fdb-4855-4f6a-8ea3-d359c5ee8458"
               Image: "file://E:\Src\Neat\Source\NEATIMP\IMPS\NEAT.IMP.IMPS\Resources\LGIS\enterprise_0.gif"
               Lat: 39.939067
               Lon: 119.601292
               MaxLevel: 0
               MinLevel: 0
               Name: "秦皇岛市"
               Tel: "5908888,5908888"
               Visible: true
            * }
            */
            if (
                (typeof data.fireCount !== "undefined" && data.fireCount > 0)
                ||
                (typeof data.FireCount !== "undefined" && data.FireCount > 0)
            ) {
                return "fire";
            }
            if (
                (typeof data.alarmCount !== "undefined" && data.alarmCount > 0)
                ||
                (typeof data.AlarmCount !== "undefined" && data.AlarmCount > 0)
            ) {
                return "alarm";
            }
            if (
                (typeof data.faultCount !== "undefined" && data.faultCount > 0)
                ||
                (typeof data.FaultCount !== "undefined" && data.FaultCount > 0)
            ) {
                return "fault";
            }

            return "normal";
        };

        // 初始化页面的元素事件
        SubPage.prototype.initEvent = function () {
            var that = this;

            //初始化地图     
            var options = {
                animateEnable: true,
                resizeEnable: false,
                scrollWheel: true,
                isHotspot: false
            };

            // tree 搜索事件
            $('#btnSearchTree').click(function () {
                that.initTree();
            });

            // 三维按钮事件
            $('#td').click(function () {

                // 如果2d跳转的需要销毁地图
                var viewMode = that.map.getViewMode_();
                if (viewMode == "2D") {
                    //$.neat.ui.mapMarkerDataCache.clearMarker("map");
                    that.map && that.map.destroy();
                    // 重新加载3D地图
                    that.buildMap('3D');
                }
            });

            // 卫星按钮事件
            $('#wx').click(function () {
                var viewMode = that.map.getViewMode_();
                if (viewMode == "3D") {
                    // 如果是三维跳转的需要清空
                    that.map && that.map.destroy();
                    // $.neat.ui.mapMarkerDataCache.clearMarker("map");

                    //初始化地图
                    gis.initMapSatellite('map', options, that.mapLoadComplete, function (mapObj) {
                        that.map = mapObj;

                        that.satellite = new AMap.TileLayer.Satellite({
                            map: mapObj,
                        });

                    }, '2D');

                } else {
                    that.satellite.show();
                }
            });

            // 地图按钮事件
            $('#map1').click(function () {
                var viewMode = that.map.getViewMode_();
                if (viewMode == "3D") {
                    // 如果是三维跳转的需要清空
                    that.map && that.map.destroy();
                    //$.neat.ui.mapMarkerDataCache.clearMarker("map");                   

                    //初始化地图
                    gis.initMapSatellite('map', options, that.mapLoadComplete, function (mapObj) {
                        that.map = mapObj;

                        that.satellite = new AMap.TileLayer.Satellite({
                            map: mapObj,
                        });
                        that.satellite.hide();

                    }, '2D');
                } else {
                    that.satellite.hide();
                }
            });
        };

        // 打开详细信息
        SubPage.prototype.showEntInfoDialog = function (id) {
            popUps.showEnterpriseDetailWindow(id);
        }

        //关闭信息窗体
        SubPage.prototype.closeInfoWindow = function () {
            this.map.clearInfoWindow();
        };

        exports(MODULE_NAME, new SubPage());

    });