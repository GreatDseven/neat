//接处警情 相关页面 查询数据访问接口
layui.define(["jquery", 'neatDataApi'], function (exports) {
    "use strict";

    var MODULE_NAME = 'monitorEventProcessDataApi';

    var $ = layui.$;



    var ModuleDefine = function () { };
    //获取警情处理数据接口
    ModuleDefine.prototype.BindEventProcessData = function (token, eventId, deviceId, deviceIdType, systemCategory, okCallback, failCallback) {
        var url = "/OpenApi/EventHandler/GetDeviceStatusByEvent";
        var data = {
            token: token,
            eventId: eventId,
            deviceId: deviceId,
            deviceIdType: deviceIdType,
            systemCategory: systemCategory
        };
        layui.neatDataApi.sendGet(url, data, okCallback, failCallback);
    }

    //警情处理数据接口
    ModuleDefine.prototype.HandleEventProcessData = function (token, d, okCallback, failCallback) {
        var url = "/OpenApi/EventHandler/EventHandle?token="+token;
        layui.neatDataApi.sendPostJson(url, d, okCallback, failCallback);
    }

    //全局都是这一个实例
    var moduleInstance = new ModuleDefine();

    //暴露接口
    exports(MODULE_NAME, moduleInstance);
});