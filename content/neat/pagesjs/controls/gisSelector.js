layui.define(["jquery","neatGIS", "neatNavigator"], function (exports) {

    "use strict";

    var MODULE_NAME = "pageGisSelector";

    var $ = layui.jquery;
    var neatNavigator = layui.neatNavigator;
    var gis = layui.neatGIS();


    var GisConfig = function () {

        
    };



    GisConfig.prototype.init = function () {

        var that = this;

        this.latitude = parseFloat(neatNavigator.getUrlParam("latitude"));
        this.longitude = parseFloat(neatNavigator.getUrlParam("longitude"));
        this.gisaddress = neatNavigator.getUrlParam("gisaddress");


        if (!this.gisAddr || !this.gisAddr === "undefined") {
            this.gisAddr = "";
        }

        this.search = neatNavigator.getUrlParam("search");
        if (!this.search || !this.search === "undefined") {
            this.search = "";
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
            isHotspot: false,
        };

        gis.init(mapContID, options, function () {

            that.mapObj = gis.getMapObj(mapContID);

            AMapUI.loadUI(['misc/PositionPicker', 'misc/PoiPicker'], function (PositionPicker, PoiPicker) {

                var tthat = that;
                var positionPicker = new PositionPicker({
                    mode: 'dragMap',
                    map: that.mapObj
                });

               

                positionPicker.on('success', function (positionResult) {
                    
                    window.GisResult.isNew = true;
                    window.GisResult.longitude = positionResult.position.getLng();
                    window.GisResult.latitude = positionResult.position.getLat();


                    window.GisResult.gisaddress = positionResult.regeocode.addressComponent.province
                    + positionResult.regeocode.addressComponent.city
                    + positionResult.regeocode.addressComponent.district
                    + positionResult.regeocode.addressComponent.township
                    + positionResult.regeocode.addressComponent.street
                    + positionResult.regeocode.addressComponent.streetNumber;
                  
                    // window.GisResult.gisaddress = positionResult.address;

                    
                    tthat.updatetNewResult();

                });

                positionPicker.on('fail', function (positionResult) {
                    //tthat.setResult('捕获失败');
                });

                positionPicker.start();

                var poiPicker = new PoiPicker({
                    input: 'searchInput',
                    placeSearchOptions: {
                        map: that.mapObj,
                        pageSize: 10
                    }
                    
                });

                poiPicker.on('poiPicked', function (poiResult) {

                    poiPicker.hideSearchResults();

                    var source = poiResult.source,
                        poi = poiResult.item;

                    if (source !== 'search') {

                        //suggest来源的，同样调用搜索
                        poiPicker.searchByKeyword(poi.name);

                    } 
                });

                //如果搜索关键词存在,则自动搜索
                if (that.search) {
                    poiPicker.searchByKeyword(that.search);
                }

                that.mapObj.panBy(0, 1);

                that.mapObj.addControl(new AMap.ToolBar({
                    liteStyle: true
                }))
            });

            //原来有点,标记出来.
            if (that.latitude) {
                that.oldMarker = that.createMarker(that.longitude, that.latitude);

                that.mapObj.setZoomAndCenter(18, that.oldMarker.getPosition());
            }
        });


       

       
    };


    GisConfig.prototype.updatetResult = function () {
        $("#txtLon").html(this.fixNumer(window.GisResult.longitude));
        $("#txtLat").html(this.fixNumer(window.GisResult.latitude));
        $("#txtAddr").html(window.GisResult.gisaddress);
        
    };
    GisConfig.prototype.updatetNewResult = function () {
        $("#txtNewLon").html(this.fixNumer(window.GisResult.longitude));
        $("#txtNewLat").html(this.fixNumer(window.GisResult.latitude));
        $("#txtNewAddr").html(window.GisResult.gisaddress);

    };

    GisConfig.prototype.fixNumer = function (v) {
        var myNum = new Number(v);
        return myNum.toFixed(6);

    };

    GisConfig.prototype.createMarker = function (lon, lat) {

        var marker = new AMap.Marker({
            icon: "/content/neat/images/gis/old.png",
            position: [lon, lat],
            title: "旧描点",
            cursor: "pointer"
        });

        marker.setMap(this.mapObj);

        return marker;
    }

    //function DelConfirm() {
    //    $("#dialogContent").html("确认删除该描点?<button type='button' class='btn btn-default btn-xs' onclick='Del()'>确认</button>");

    //    $('#dialogModal').modal('show');
    //}

 

    var instance = new GisConfig();


    //暴露接口
    exports(MODULE_NAME, instance);

});