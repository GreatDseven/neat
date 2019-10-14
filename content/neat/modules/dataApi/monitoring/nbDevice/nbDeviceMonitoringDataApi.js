
layui.define(["jquery", 'neatDataApi'], function (exports) {
    "use strict";

    var MODULE_NAME = 'nbDeviceMonitoringDataApi';

    var $ = layui.$;

    var NBDeviceMonitoringDataApi = function () { };


    // 查询页面右侧上边数据
    NBDeviceMonitoringDataApi.prototype.QueryDeviceMonitorCountInfo = function (token, okCallback, failCallback) {
        var url = "/OpenApi/DeviceMonitor/QueryCountInfo";
        var data = {
            token: token
        };
        layui.neatDataApi.sendGet(url, data, okCallback, failCallback);
        
    };
    // 查询页面左侧上边数据
    NBDeviceMonitoringDataApi.prototype.QueryUntreatedCountInfo = function (token, okCallback, failCallback) {
        var url = "/OpenApi/DeviceMonitor/QueryUntreatedCountInfo";
        var data = {
            token: token
        };
        layui.neatDataApi.sendGet(url, data, okCallback, failCallback);
    };





    //全局都是这一个实例
    var instance = new NBDeviceMonitoringDataApi();

    //暴露接口
    exports(MODULE_NAME, instance);
});