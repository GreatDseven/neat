layui.define(["jquery", "layer"], function (exports) {
    "use strict";

    var MODULE_NAME = 'mockDataProvider';

    var $ = layui.$;
    var layer = layui.layer;


    var ModuleDefine = function () { };

    var baseDir = "/content/neat/modules/dataApi/mockData";

    //获取 测试数据
    ModuleDefine.prototype.getMockData = function( action, okcallback,failCallback){
        var jsonFileUrl = baseDir + [
            "/",
            this.controller,
            "/",
            action,
            ".json",
            "?__="+new Date().valueOf().toString()
        ].join("");

        layer.msg("正在使用测试数据:" + jsonFileUrl);

        $.getJSON(jsonFileUrl, {}, function (data ) {
                if (typeof (okcallback) === "function") {
                    okcallback(data);
                }
            })
            .fail(function (a, b, c) {
                if (typeof (failCallback) === "function") {
                    failCallback();
                }
                
        });
    };





    //暴露接口
    exports(MODULE_NAME, function (controller) {
           
        var moduleInstance = new ModuleDefine();
        moduleInstance.controller = controller;
        return moduleInstance;

    });
});