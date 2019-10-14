
// 大屏展示到的数据访问api
layui.define(["jquery", 'neatDataApi'], function (exports) {
    "use strict";

    var MODULE_NAME = 'boardShowDataApi';

    var $ = layui.$;
    var layer = layui.layer;

    var ModuleDefine = function () { };


    // 查询未处理的警情
    ModuleDefine.prototype.getNotHandledAlarmData = function (token, okCallback, failCallback) {
        var url = "/OpenApi/SDDashBoard/GetNotHandledAlarm";
        var data = {
            token: token
        };
        layui.neatDataApi.sendGet(url, data, okCallback, failCallback);
    };
    //左侧第二行
    ModuleDefine.prototype.getDeviceStatisticInfoData = function (token, okCallback, failCallback) {
        var url = "/OpenApi/SDDashBoard/GetDeviceInfo";
        var data = {
            token: token
        };
        layui.neatDataApi.sendGet(url, data, okCallback, failCallback);
    };
    //左侧第三行 巡检统计
    ModuleDefine.prototype.getInspectionStatisticInfoData = function (token, okCallback, failCallback) {
        var url = "/OpenApi/SDDashBoard/GetInspections";
        var data = {
            token: token
        };
        layui.neatDataApi.sendGet(url, data, okCallback, failCallback);
    };

    //左侧第四行 历年报警趋势
    ModuleDefine.prototype.getGetAlarmTrendYearData = function (token, okCallback, failCallback) {
        var url = "/OpenApi/SDDashBoard/GetAlarmTrendYear";
        var data = {
            token: token
        };
        layui.neatDataApi.sendGet(url, data, okCallback, failCallback);
    };
    //中间第二行 近一年警情趋势
    ModuleDefine.prototype.getAlarmTrendYears = function (token, okCallback, failCallback) {
        var url = "/OpenApi/SDDashBoard/GetAlarmTrendMonth";
        var data = {
            token: token
        };
        layui.neatDataApi.sendGet(url, data, okCallback, failCallback);
    };

    //右侧第一行 联网在线主机统计
    ModuleDefine.prototype.getOnlineDeviceStatInfo = function (token, systemType, okCallback, failCallback) {
        var url = "/OpenApi/SDDashBoard/GetOnLineDevice";
        var data = {
            token: token,
            systemType: systemType
        };
        layui.neatDataApi.sendGet(url, data, okCallback, failCallback);
    };

    //右侧第二行 联网单位统计
    ModuleDefine.prototype.GetNetUnitStatisticsData = function (token, okCallback, failCallback) {
        var url = "/OpenApi/SDDashBoard/GetNetUnitStatistics";
        var data = {
            token: token
        };
        layui.neatDataApi.sendGet(url, data, okCallback, failCallback);
    };
    
    //设备事件列表
    ModuleDefine.prototype.queryEventTypeList = function (token, okCallback, failCallback) {
        var url = "/OpenApi/EventHandler/GetEventList";
        var data = {
            token: token
        };
        layui.neatDataApi.sendGet(url, data, okCallback, failCallback);
    };




    //全局都是这一个实例
    var dataApiInstance = new ModuleDefine();

    //暴露接口
    exports(MODULE_NAME, dataApiInstance);
});