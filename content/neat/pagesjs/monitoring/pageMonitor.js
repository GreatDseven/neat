layui.define(["jquery", 'form', 'table', 'laytpl', 'layer', "neat", "neatGIS", "neatNavigator", "monitorDataApi", "neatUITools", "neatPopupRepository", "autoRefresh", "neatEventPush"], function (exports) {

    "use strict";

    var MODULE_NAME = "pageMonitor";

    var $ = layui.jquery;
    var laytpl = layui.laytpl;
    var table = layui.table;
    var layer = layui.layer;
    var refresh = layui.autoRefresh;
    var uiTools = layui.neatUITools;
    var neatNavigator = layui.neatNavigator;
    var popUps = layui.neatPopupRepository;
    var gis = layui.neatGIS();
    var pageDataApi = layui.monitorDataApi;
    var neat = layui.neat;
    var token = neat.getUserToken();
    var SubPage = function () {
        this.needRefresh = 1;
    };
    var maplayer = {};


    SubPage.prototype.CheckNeedRefresh = function () {
        return $("#day3-fire-data").length > 0;
    };
    //3日内警情数量统计
    SubPage.prototype.Bind3DaysCount = function () {
        pageDataApi.query3DayData(token, function (data) {
            $("#day3-fire-data").text(formatNum(data.fire3Days));//3日火警总数
            $("#day3-fault-data").text(formatNum(data.fault3Days));//3日故障总数
            $("#day3-alarm-data").text(formatNum(data.alarm3Days));//3日报警总数
        });
    };

    //查询基础信息统计
    SubPage.prototype.BaseInfoCount = function () {
        pageDataApi.BaseInfoCount(token, function (d) {
            $("#baseinfo-linknet").text(d.data.entCount);
            $("#baseinfo-total-buildings").text(d.data.buildingCount);
            $("#baseinfo-total-parts").text(d.data.keypartCount);
            $("#baseinfo-total-devices").text(d.data.deviceTotal);
            $("#baseinfo-offline-devices").text(d.data.offlineDeviceCount);
            $("#baseinfo-normal-devices").text(d.data.normalDeviceCount);
            var ratepercent = parseFloat(d.data.osiTaskRate.finishCount / d.data.osiTaskRate.all).toFixed(2) * 100;
            if (!isNaN(ratepercent)) {
                $("#baseinfo-inspection-completion").text(ratepercent + "%");
            }
            else {
                $("#baseinfo-inspection-completion").text("0%");
            }

            $("#baseinfo-hidden-units").text(d.data.troubleEntCount);
            $("#baseinfo-hidden-danger-point").text(d.data.troublePointCount);
        });
    };
    //联网主机在线设备统计
    SubPage.prototype.BindLinkNetMainHostCount = function () {
        pageDataApi.BindLinkNetMainHostCount(token, function (d) {

            var onlinedata = d.data;
            for (var i = 0; i < onlinedata.length; i++) {
                var num100 = parseFloat(onlinedata[i].totalResult.onlineDeviceCount / onlinedata[i].totalResult.totalDeviceCount).toFixed(2) * 100;
                var onlinedatadivice = onlinedata[i].totalResult.onlineDeviceCount;
                switch (onlinedata[i].id) {
                    case 0:
                        //自动火灾系统
                        var firesys = $("#firesys-progress");
                        var firesysnum = $("#firesys-progress-num");
                        firesys.attr("lay-percent", num100 + "%");
                        firesys.css("width", num100 + "%");
                        firesysnum.text(onlinedatadivice + "/" + onlinedata[i].totalResult.totalDeviceCount);
                        break;
                    case 1:
                        //水源监测系统
                        var watersys = $("#watersys-progress");
                        var watersysnum = $("#watersys-progress-num");
                        watersys.attr("lay-percent", num100 + "%");
                        watersys.css("width", num100 + "%");
                        watersysnum.text(onlinedatadivice + "/" + onlinedata[i].totalResult.totalDeviceCount);
                        break;
                    case 2:
                        //电器火灾系统
                        var electricsys = $("#electricsys-progress");
                        var electricsysnum = $("#electricsys-progress-num");
                        electricsys.attr("lay-percent", num100 + "%");
                        electricsys.css("width", num100 + "%");
                        electricsysnum.text(onlinedatadivice + "/" + onlinedata[i].totalResult.totalDeviceCount);
                        break;
                    case 5:
                        //消防电源系统
                        var firecontrolsys = $("#fire-controlsys-progress");
                        var firecontrolsysnum = $("#fire-controlsys-progress-num");
                        firecontrolsys.attr("lay-percent", num100 + "%");
                        firecontrolsys.css("width", num100 + "%");
                        firecontrolsysnum.text(onlinedatadivice + "/" + onlinedata[i].totalResult.totalDeviceCount);
                        break;
                    case 7:
                        //可燃气体系统
                        var combustiblegassys = $("#combustible-gassys-progress");
                        var combustiblegassysnum = $("#combustible-gassys-progress-num");
                        combustiblegassys.attr("lay-percent", num100 + "%");
                        combustiblegassys.css("width", num100 + "%");
                        combustiblegassysnum.text(onlinedatadivice + "/" + onlinedata[i].totalResult.totalDeviceCount);
                        break;
                    case 8:
                        //防火门系统
                        var fireproofdoorsys = $("#fire-proofdoorsys-progress");
                        var fireproofdoorsysnum = $("#fire-proofdoorsys-progress-num");
                        fireproofdoorsys.attr("lay-percent", num100 + "%");
                        fireproofdoorsys.css("width", num100 + "%");
                        fireproofdoorsysnum.text(onlinedatadivice + "/" + onlinedata[i].totalResult.totalDeviceCount);
                        break;
                    case 13:
                        //智慧用电系统
                        var electricalsys = $("#electrical-controlsys-progress");
                        var electricalsysnum = $("#electrical-controlsys-progress-num");
                        electricalsys.attr("lay-percent", num100 + "%");
                        electricalsys.css("width", num100 + "%");
                        electricalsysnum.text(onlinedatadivice + "/" + onlinedata[i].totalResult.totalDeviceCount);
                        break;

                }
            }
        });
    };
    // 加载 巡检项目列表，并监听相关的表格事件
    SubPage.prototype.initTable = function (data) {
        var that = this;

        // 渲染 项目类型列表
        table.render({
            elem: '#eventtypelist'
            , id: "eventtypelist"
            , page: false
            , height: 360
            , autoSort: false
            , loading: false
            , limit: 99999999999
            , data: []
            , cols: [[
                /*
                "id": "004b75ba-977a-465e-aadc-a4b9a6a2231e",
                "deviceId": "848ec535-d143-4532-a63b-c09a9bba462a",
                "deviceName": "NB测试设备1",
                "deviceIdType": 3,
                "eventCategory": "fire",
                "systemCategory": "10",
                "occurTime": "14:28:31",
                "isHandled": false
                 */
                 {
                     field: 'eventCategory', title: '类型', width: 70, align: 'center', templet: function (d) { return uiTools.renderEventTypeByWord(d.eventCategory); }
                 }
                , {
                    field: 'deviceName', title: '设备名称', width: 120, align: 'center'
                }
                , {
                    field: 'occurTime', title: '时间', width: 120, align: 'center'
                }
                , { field: 'operation', fixed: 'right', title: '操作', width: 150, align: 'center', toolbar: '#opColTemplate' }
            ]]


        });
    };


    //绑定主表数据
    SubPage.prototype.bindTable = function () {
        var that = this;
        //var loadingIndex = layer.load(1);
        pageDataApi.queryEventTypeList(token, function (result) {
            that.reloadTable(result.data);
            $("#todayUntreatedNum").text(result.totalCount);
            //layer.close(loadingIndex);
        }, function () {
            //layui.layer.close(loadingIndex);
        });
    };
    function compare(property) {
        return function (a, b) {
            var value1 = a[property];
            var value2 = b[property];
            return value1 - value2;
        }
    };
    // 重新加载列表
    SubPage.prototype.reloadTable = function (result) {
        var that = this;
        table.reload("eventtypelist", {
            data: result
        });
    }
    //初始化表格操作列的事件
    SubPage.prototype.initTableOperateColEvent = function () {
        var that = this;
        table.on('tool(eventtypelist)', function (obj) {
            var data = obj.data;
            if (obj.event === 'event-process') {
                popUps.showEventProcessWindow(data.id, data.deviceId, data.deviceIdType, data.systemCategory, function () {
                    that.bindTable();
                });
            } else if (obj.event === 'event-detail') {//是件的处理结果详情
                popUps.showEventProcessResultWindow(data.id, data.deviceId, data.deviceIdType, data.systemCategory);
            } else if (obj.event === 'planar-graph') {//平面图
                popUps.showDevicePlanarGraphWindow(data.deviceId);
            } else if (obj.event === 'gis-locate') {//弹出地图GIS

                var marker = getentMarker(data.transferId);
                if (!marker) {
                    marker = getentMarker(data.enterpriseId);
                    if (!marker)
                        return;
                }
                var zoomIndex = 15;
                maplayer.setZoom(zoomIndex);
                maplayer.setCenter(marker.getPosition());
                //点击marker ,打开信息窗体
                openInfoWindows(marker);
            } else if (obj.event === 'camera') {//视频摄像头
                if (data.systemCategory == 13) {//智慧用电弹框
                    popUps.showDeviceRelatedCameraWindow(data.transferId);
                } else {
                    popUps.showDeviceRelatedCameraWindow(data.deviceId);
                }
            }
        });
    };

    function getentMarker(id) {
        var result = null;
        $.each(markers, function (_, item) {
            if (item.id == id) {
                result = item;
            }
        })
        return result;
    }

    //3日警情信息 数字格式化方法
    function formatNum(num) {
        var numstr = "00000" + num;
        return numstr.substr(numstr.length - 5, 5);
    }
    //地图描点 弹框中 详情按钮事件
    window.entdetailsbutton = function (e) {
        var entid = $(e).attr("attrid");
        popUps.showEnterpriseDetailWindow(entid);
    };
    //地图描点 弹框中 视频按钮事件
    window.entvideobutton = function (e) {
        var entid = $(e).attr("attrid");
        popUps.showEnterpriseDeviceCameraWindow(entid);
    };
    //地图描点 弹框中 平面图按钮事件
    window.entplanbutton = function (e) {
        var entid = $(e).attr("attrid");
        popUps.showEnterprisePlanarGraphWindow(entid);
    };

    //地图描点 弹框中 火警数 报警数 离线数 点击弹框
    window.eventbuttoncount = function (e, eve) {
        if ($(e).text() != "0") {
            var entid = $(e).attr("attrid");
            popUps.showEnterpriseAbnormalDeviceListWindow(entid, eve);
        }
    };

    function initwindowsinfo(data) {
        //实例化信息窗体
        var getTpl = $("#maplocationinfo").html();

        var infoWindow = new AMap.InfoWindow({
            isCustom: true,  //使用自定义窗体
            content: createInfoWindow(data.name, '#f8b62d', laytpl(getTpl).render(data)),
            offset: new AMap.Pixel(-13, -20)
        });
        return infoWindow;
    }

    function initwindowsinfoDevice(data) {
        //实例化信息窗体
        var getTpl = $("#maplocationinfoDevice").html();

        var fontColor = getFontColor(data.status);
        //var content1 = content.toString().replace('statusfontcolor', fontColor);
        //var content2 = content1.replace('valuefontcolor', fontColor);

        var infoWindow = new AMap.InfoWindow({
            isCustom: true,  //使用自定义窗体
            content: createInfoWindow(data.name, fontColor, laytpl(getTpl).render(data)),
            //content: content2,
            offset: new AMap.Pixel(-13, -20)
        });
        return infoWindow;
    }

    //构建自定义信息窗体
    function createInfoWindow(title, fontColor, content) {
        var info = document.createElement("div");
        info.className = "custom-info input-card content-window-card";

        //可以通过下面的方式修改自定义窗体的宽高
        info.style.width = "320px";
        info.style.height = "200px";

        // 定义中部内容
        var middle = document.createElement("div");
        middle.className = "info-middle";

        var content1 = content.replace('statusfontcolor', fontColor);
        var content2 = content1.replace('valuefontcolor', fontColor);
        content = content2;

        middle.innerHTML = content;

        info.appendChild(middle);

        // 定义底部内容
        var bottom = document.createElement("div");
        bottom.className = "info-bottom";
        var sharp = document.createElement("img");
        sharp.src = "/content/neat/images/receiveThePolice/sharp.png";
        bottom.appendChild(sharp);
        info.appendChild(bottom);

        
        return info;
    }
    //关闭信息窗体
    function closeInfoWindow() {
        maplayer.clearInfoWindow();
    }

    var cluster, markers = [];
    var count = 0;
    //判断地图描点 事件类型
    var findClusterEventType = function (context) {
        var eventType = "ok";
        for (var i = 0; i < context.markers.length; i++) {
            if (eventType === "ok") {
                if (context.markers[i].eventType === "fire") {
                    eventType = "fire";
                    break;
                }
                else if (context.markers[i].eventType === "alarm") {
                    eventType = "alarm";

                }
                else if (context.markers[i].eventType === "fault") {
                    eventType = "fault";
                }
            }
            else if (eventType === "fault") {
                if (context.markers[i].eventType === "fire") {
                    eventType = "fire";
                    break;
                }
                else if (context.markers[i].eventType === "alarm") {
                    eventType = "alarm";
                }
            }
            else if (eventType === "alarm") {
                if (context.markers[i].eventType === "fire") {
                    eventType = "fire";
                    break;
                }
            }
            else if (eventType === "fire") {
                break;
            }
        }
        return eventType;
    };

    var getcolor = function (eventType) {
        var bgColor = '';
        if (eventType === "fire") {
            bgColor = '#e74e4e';
        }
        else if (eventType === "fault") {
            bgColor = '#f8b62d';
        }
        else if (eventType === "alarm") {
            bgColor = '#814df4';
        }
        else {
            bgColor = '#04ad70';
        }
        return bgColor;
    };

    var getFontColor = function (status) {
        var fontColor = '';
        if (status === "fire") {
            fontColor = '#e74e4e';
        }
        else if (status === "故障") {
            fontColor = '#f8b62d';
        }
        else if (status === "报警") {
            fontColor = '#814df4';
        }
        else {
            fontColor = '#04ad70';
        }
        return fontColor;
    };

    var getMarkEventType = function (d) {
        if (d.fireCount > 0) {
            return "fire";
        }
        if (d.alarmCount > 0) {
            return "alarm";
        }
        if (d.faultCount > 0) {
            return "fault";
        }
        return "ok";
    };
    var _renderClusterMarker = function (context) {
        context.marker.eventType = findClusterEventType(context);
        var factor = Math.pow(context.count / count, 1 / 18);
        var div = document.createElement('div');
        var bgColor = '';
        var bgsize = '';

        bgColor = getcolor(context.marker.eventType);
        var fontColor = '#fff';
        var size = Math.round(30 + Math.pow(context.count / count, 1 / 5) * 20);
        div.style.width = div.style.height = size + 'px';
        div.style.borderRadius = size / 2 + 'px';
        div.style.background = bgColor;
        div.innerHTML = context.count;
        div.style.lineHeight = size + 'px';
        div.style.color = fontColor;
        div.style.fontSize = '14px';
        div.style.fontWeight = 'bold';
        div.style.textAlign = 'center';
        context.marker.setOffset(new AMap.Pixel(-size / 2, -size / 2));
        context.marker.setContent(div);

    };

    var addCluster = function (tag) {
        if (cluster) {
            cluster.setMap(null);
        }
        if (tag == 2) {//完全自定义
            cluster = new AMap.MarkerClusterer(maplayer, markers, {
                gridSize: 80,
                renderClusterMarker: _renderClusterMarker
            });
        }
    };
    var removeMapPoint = function () {

        if (!maplayer)
            return;
        if (typeof (maplayer.remove) === "function") {
            maplayer.remove(markers);

        }

    }
    function displayMapPoint() {
        pageDataApi.queryMapLocationData(token, function (data) {
            var pointslocation = data;
            markers = [];
            count = 0;
            for (var i = 0; i < pointslocation.length; i += 1) {

                var eventType = getMarkEventType(pointslocation[i]);
                //var markerEventCount = getEntEventCount(pointslocation[i]);
                var location = [pointslocation[i]['lon'], pointslocation[i]['lat']];

                var marker = new AMap.Marker({
                        position: ["" + pointslocation[i]['lon'], "" + pointslocation[i]['lat']],
                        content: '<div id="' + pointslocation[i]['id'] + '" class="pointsmall" style="background-color: ' + getcolor(eventType) + ';"></div>',
                        offset: new AMap.Pixel(-15, -15)
                    });

                marker.eventType = eventType;
                markers.push(marker);
                marker.category = pointslocation[i]['category'];
                marker.id = pointslocation[i]['id'];
                
                //鼠标点击marker弹出自定义的信息窗体
                AMap.event.addListener(marker, 'click', function (thismarker) {
                    openInfoWindows(thismarker.target);
                });
            }
            count = markers.length;
            addCluster(2);
        });
    };

    function openInfoWindows(marker) {
        switch (marker.category) {
            case 1:
                pageDataApi.queryEntMapInfoData(token, marker.id, function (data) {
                    var infowindow = initwindowsinfo(data);
                    infowindow.open(maplayer, marker.getPosition());
                });
                break;
            case 10:
                pageDataApi.queryDeviceMapInfoData(token, marker.id, marker.category, function (data) {
                    var infowindow = initwindowsinfoDevice(data);
                    infowindow.open(maplayer, marker.getPosition());
                });
                break;
        }
    }

    SubPage.prototype.BindMap = function () {
        var that = this;

        var mapContID = "mapContainer";
        var options = {
            animateEnable: true,
            resizeEnable: false,
            zoom: 10,
            scrollWheel: true,
            isHotspot: false
        };

        gis.init(mapContID, options, function () {
            maplayer = gis.getMapObj(mapContID);
            maplayer.on('zoomstart', closeInfoWindow);
            maplayer.on('movestart', closeInfoWindow);
            maplayer.on('click', closeInfoWindow);

            displayMapPoint();

            that.initRefresh();
        });

        $("#normalchange").on("click", function () {
            gis.changeSytleNormal(mapContID);
        });
        $("#darkchange").on("click", function () {
            gis.changeSytleDark(mapContID);
        });
        $(".deviceDventsLayer-leftTip").on("click", function () {
            $(".deviceDventsLayer").toggle();
        });
        $(".baseinfo-right-tip").on("click", function () {
            $(".right-layer-top").toggle();
        });
        $(".linknet-right-tip").on("click", function () {
            $(".right-layer-down").toggle();
            $(".layui-progress").toggle();
        });
    };


    SubPage.prototype.initRefresh = function () {

        var that = this;
        this.refreshHandle = refresh.autoRefresh(function () {

            if (that.needRefresh == 1) {
                //把刷新内容的代码单独提出去了
                that.refreshImpl();
                that.needRefresh = 0;
            }

        }, 5000);

    };

    //刷新时加载数据的整个过程.
    SubPage.prototype.refreshImpl = function () {
        var that = this;

        if (!that.CheckNeedRefresh()) {
            refresh.autoRefreshStop(that.refreshHandle);
        }

        that.Bind3DaysCount();
        that.BaseInfoCount();
        that.bindTable();
        that.BindLinkNetMainHostCount();
        removeMapPoint();
        closeInfoWindow();
        displayMapPoint();
    };

    //通知页面需要刷新
    SubPage.prototype.setRefreshFlag = function () {
        this.needRefresh = 1;
    };


    SubPage.prototype.init = function () {
        var that = this;
        this.BindMap();
        this.initTable();
        this.initTableOperateColEvent();
        //this.Bind3DaysCount();
        //this.BaseInfoCount();
        //this.bindTable();
        //this.BindLinkNetMainHostCount();

        //console.log("neatEventPushFlag:" + layui.neatEventPush.instanceFlag);

        layui.neatEventPush.addMsgArraivalCallback("pageMonitor", that, that.setRefreshFlag);

        $(".right-layer-top").toggle();
        $(".right-layer-down").toggle();

        //防止缓存
        $("#lnkHistoryAlarm").attr("href", "/pages/monitoring/historyEventQuery.html?__=" + new Date().valueOf().toString());

    };
    var instance = new SubPage();
    //暴露接口
    exports(MODULE_NAME, instance);

});