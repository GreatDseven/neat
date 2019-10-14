
//地图标注查看
layui.define(['element', 'layer'], function (exports) {

    "use strict";

    var MODULENAME = "neatGisViewer";

    var layer = layui.layer;

    var NeatGisViewer = function () {
    };

    NeatGisViewer.prototype.init = function (lat, lon, gisAddr) {

        this.lat = lat;
        this.lon = lon;
        this.gisAddr = gisAddr;

        if (!this.gisAddr || !this.gisAddr === "undefined") {
            this.gisAddr = "";
        }

       

    };

    NeatGisViewer.prototype.show = function (callback) {

        var url = "/pages/controls/gisViewer.html?latitude=" + encodeURIComponent(this.lat)
            + "&longitude=" + encodeURIComponent(this.lon)
            + "&gisaddress=" + encodeURIComponent(this.gisAddr)
            + "&__=" + new Date().valueOf().toString();

        var width = "800px";
        var height = "600px";

        var layerIndex = 0;
        var targetWindow = parent;

        var config = {
            resize:false,
            type: 2,
            title: '地图定位',
            area: [width, height],
            shade: [0.7, '#000'],
            content: url,
            btn: ['关闭'],
            yes: function (index) {
               
                //当点击‘确定’按钮的时候，获取弹出层返回的值
                var result = targetWindow["layui-layer-iframe" + index].GisResult;
                //打印返回的值，看是否有我们想返回的值。
                //console.log(res);
                //最后关闭弹出层
                targetWindow.layer.close(layerIndex);

                callback(result);

            },
            cancel: function () {
                //右上角关闭回调
            }
        };

        if (parent) {
            layerIndex = window.parent.layer.open(config);
            targetWindow = window.parent;
        }
        else {
            layerIndex = layer.open(config);
            targetWindow = window;
        }

    };


    exports(MODULENAME, new NeatGisViewer());

});