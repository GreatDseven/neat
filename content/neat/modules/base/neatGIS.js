
layui.define(["jquery", "neatUserFavoriteSetting"], function (exports) {

    "use strict";
    var MODULE_NAME = "neatGIS";

    var $ = layui.jquery;

    var favor = layui.neatUserFavoriteSetting;

    //所有的地图样式
    var mapStyles = [
        'amap://styles/normal',  //标准样式
        'amap://styles/ebfa0ae6f5c3e8c2f7c1b31f3912c232'  //自定义样式
    ];



    var NeatGis = function () {

        this.mapObjs = {};
    };




    //获取地图在window对象中存储时的key.参数是html控件的id
    NeatGis.prototype.getMapKey = function (ctlId) {
        return ctlId + "_MapCtl";
    }

    //获取地图javascript对象
    NeatGis.prototype.getMapObj = function (ctlId) {

        return this.mapObjs[this.getMapKey(ctlId)];

    }

    // 保存 地图对象
    NeatGis.prototype.setMapObj = function (mapId, mapObj) {

        this.mapObjs[mapId] = mapObj;

    };


    NeatGis.prototype.init = function (ctlId, options, callback) {
        var that = this;

        $(window).on("unload", function () {

            $.each(that.mapObjs, function (index, map) {

                map && map.destroy();
            });
            that.mapObjs = {};

        });

        var initFunName = "neat_map_init_" + new Date().valueOf().toString();


        window[initFunName] = function () {

            delete window[initFunName];

            if (!ctlId) {
                ctlId = "mapContainer";
            }

            if (!options) {
                options = {
                    zoom: 13, //级别
                };
            }

            var lastMapStyle = favor.getMapStyle();

            if (!lastMapStyle) {
                lastMapStyle = mapStyles[1];

            }

            options.mapStyle = lastMapStyle;


            var objKey = that.getMapKey(ctlId);

            var mapobj = new AMap.Map(ctlId, options);

            that.setMapObj(objKey, mapobj);

            if (typeof initAMapUI === "function") {
                initAMapUI();
            }

            if (typeof callback !== "undefined") {
                mapobj.on("complete", callback);
            }

        };
        addScript("//webapi.amap.com/maps?v=1.4.14&key=33a80f88db1b55fabf5b1a864cf4bf1c&callback=" + initFunName + "&plugin=AMap.ToolBar,AMap.Geocoder,AMap.MarkerClusterer");
        addScript("//webapi.amap.com/ui/1.0/main-async.js");

    };

    NeatGis.prototype.initMapSatellite = function (ctlId, options,complete, addSateliteCallback, viewMode) {
        var that = this;

        $(window).on("unload", function () {

            $.each(that.mapObjs, function (index, map) {

                map && map.destroy();
            });
            that.mapObjs = {};

        });

        var initFunName = "neat_map_init_" + new Date().valueOf().toString();

        window[initFunName] = function () {

            delete window[initFunName];

            if (!ctlId) {
                ctlId = "mapContainer";
            }

            if (!options) {
                options = {
                    zoom: 13, //级别
                };
            }

            options.mapStyle = "amap://styles/normal";
            options.viewMode = viewMode;

            var objKey = that.getMapKey(ctlId);

            var mapobj = null;
            if (viewMode == '2D') {
                mapobj = new AMap.Map(ctlId, options);
            } else {
                mapobj = new AMap.Map(ctlId, {
                    viewMode: '3D',
                    buildingAnimation: true,//楼块出现是否带动画
                });

                mapobj.addControl(new AMap.ControlBar({
                    showZoomBar: false,
                    showControlButton: true,
                    position: {
                        right: '10px',
                        top: '10px'
                    }
                }));
            }

            that.setMapObj(objKey, mapobj);

            addSateliteCallback(mapobj);

            if (typeof complete !== "undefined") {
                mapobj.on("complete", complete(mapobj));
            }
        };

        var url = 'http://webapi.amap.com/maps?v=1.4.14&key=33a80f88db1b55fabf5b1a864cf4bf1c&callback=' + initFunName+'&plugin=AMap.ControlBar,Map3D';

        addScript(url);
    };

    NeatGis.prototype.changeSytleNormal = function (ctlId) {
        var map = this.getMapObj(ctlId);
        map.setMapStyle(mapStyles[0]);
        favor.setMapStyle(mapStyles[0]);
    };

    NeatGis.prototype.changeSytleDark = function (ctlId) {
        var map = this.getMapObj(ctlId);
        map.setMapStyle(mapStyles[1]);
        favor.setMapStyle(mapStyles[1]);
    };


    function addScript(url) {

        var jsapi = document.createElement('script');
        jsapi.charset = 'utf-8';
        jsapi.src = url;
        var parent = document.getElementById("neatBoardContentRow");
        if (!parent) {//如果是在弹出页面中使用时走这个分支.
            parent = document.body;
        }
        parent.appendChild(jsapi);
    }

    //暴露接口
    exports(MODULE_NAME, function () {

        return new NeatGis();
    });



});