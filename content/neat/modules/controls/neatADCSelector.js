
//行政区划选择封装
layui.define(['element', 'layer'], function (exports) {

    "use strict";

    var MODULENAME = "neatADCSelector";

    var layer = layui.layer;

    var AdcSelector = function () {
    };

    AdcSelector.prototype.show = function (callback) {

        var url = "/pages/controls/adcSelector.html?__=" + new Date().valueOf().toString();

        var layerIndex = layer.open({
            resize: false,
            type: 2,
            title: '选择行政区划',
            area: ["640px", "480px"],
            shade: [0.7, '#000'],
            content: url,
            btn: ['确定', '关闭'],
            yes: function (index) {
                //当点击‘确定’按钮的时候，获取弹出层返回的值
                var result = window["layui-layer-iframe" + index].adcResult;
                //打印返回的值，看是否有我们想返回的值。
                //console.log(res);
                //最后关闭弹出层
                layer.close(layerIndex);

                callback(result);

            },
            cancel: function () {
                //右上角关闭回调
            }
        });
    };

    AdcSelector.prototype.show3rd = function (zipcode, callback) {

        var url = "/pages/controls/adcSelector3rd.html?zipcode=" + zipcode + "&__=" + new Date().valueOf().toString();

        var layerIndex = layer.open({
            resize: false,
            type: 2,
            title: '选择行政区划',
            area: ["640px", "480px"],
            shade: [0.7, '#000'],
            content: url,
            btn: ['确定', '关闭'],
            yes: function (index) {
                //当点击‘确定’按钮的时候，获取弹出层返回的值
                var result = window["layui-layer-iframe" + index].adcResult;
                //打印返回的值，看是否有我们想返回的值。
                //console.log(res);
                //最后关闭弹出层
                layer.close(layerIndex);

                callback(result);

            },
            cancel: function () {
                //右上角关闭回调
            }
        });
    };


    exports(MODULENAME, new AdcSelector());

});