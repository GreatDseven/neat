layui.define(["jquery","neatGIS", "neatNavigator"], function (exports) {

    "use strict";

    var MODULE_NAME = "pageGisViewer";

    var $ = layui.jquery;
    var neatNavigator = layui.neatNavigator;
    var gis = layui.neatGIS();


    var GisViewer = function () {

        
    };



    GisViewer.prototype.init = function () {

        var that = this;

        this.latitude = parseFloat(neatNavigator.getUrlParam("latitude"));
        this.longitude = parseFloat(neatNavigator.getUrlParam("longitude"));
        this.gisaddress = neatNavigator.getUrlParam("gisaddress");


        if (!this.gisAddr || !this.gisAddr === "undefined") {
            this.gisAddr = "";
        }

        this.mapContID = undefined;
        this.mapObj = undefined;
        this.oldMarker = undefined;

        var mapContID = "mapContainer";

       

        window.GisResult = {
            isNew: false,
            longitude: this.longitude,
            latitude: this.latitude,
            gisaddress: this.gisaddress
        };

        this.updatetResult();

        var options = {
            animateEnable: true,
            resizeEnable: false,
            zoom: 13,
            scrollWheel: true,
            isHotspot: false
        };

        gis.init(mapContID, options, function () {

            that.mapObj = gis.getMapObj(mapContID);

            //原来有点,标记出来.
            if (that.latitude) {
                that.oldMarker = that.createMarker(that.longitude, that.latitude);

                that.mapObj.setZoomAndCenter(13, that.oldMarker.getPosition());
            }
        });
       
    };

    GisViewer.prototype.updatetResult = function () {
        $("#txtLon").html(this.fixNumer(window.GisResult.longitude));
        $("#txtLat").html(this.fixNumer(window.GisResult.latitude));
        $("#txtAddr").html(window.GisResult.gisaddress);
        
    };

    GisViewer.prototype.fixNumer = function (v) {
        var myNum = new Number(v);
        return myNum.toFixed(6);

    };

    GisViewer.prototype.createMarker = function (lon, lat) {

        var marker = new AMap.Marker({
            icon: "/content/neat/images/gis/poi-marker-red.png",
            position: [lon, lat],
            title: "所在位置",
            cursor: "pointer"
        });

        marker.setMap(this.mapObj);

        return marker;
    };


    var instance = new GisViewer();


    //暴露接口
    exports(MODULE_NAME, instance);

});