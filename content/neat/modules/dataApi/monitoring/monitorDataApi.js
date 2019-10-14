//接处警情 相关页面 查询数据访问接口
layui.define(["jquery", 'neatDataApi'], function (exports) {
    "use strict";

    var MODULE_NAME = 'monitorDataApi';

    var $ = layui.$;

    var ModuleDefine = function () { };

    // 查询历史事件列表
    ModuleDefine.prototype.queryHistoryEvent = function (token, keyword, warnType, eventHandler, from, to, domainId, enterpriseId,
        orderByColumn, isDescOrder,
        pageIndex, pageSize, okCallback, failCallback) {

        var url = "/OpenApi/EventHandler/GetEventHistoryList";


        if (!orderByColumn) {
            orderByColumn = "0";
        }

        if (typeof isDescOrder === "undefined") {
            isDescOrder = "true";
        }


        var data = {
            token: token,
            keyword: keyword,
            domainId: domainId,
            enterpriseId: enterpriseId,
            warnType: warnType,
            eventHandler: eventHandler,
            from: from,
            to: to,
            orderByColumn: orderByColumn,
            isDescOrder: isDescOrder,
            pageIndex: pageIndex,
            pageSize: pageSize,
        };

        layui.neatDataApi.sendGet(url, data, okCallback, failCallback);

    };

    // 查询3天警情数据
    ModuleDefine.prototype.query3DayData = function (token, okCallback, failCallback) {
        var url = "/OpenApi/EventHandler/GetAlarm3DaysCount";
        var data = {
            token: token
        };
        layui.neatDataApi.sendGet(url, data, okCallback, failCallback);
    };

    //查询基础信息统计
    ModuleDefine.prototype.BaseInfoCount = function (token, okCallback, failCallback) {
        var url = "/OpenApi/EventHandler/GetBasicMessageTotal";
        var data = {
            token: token
        };
        layui.neatDataApi.sendGet(url, data, okCallback, failCallback);
    };
    // 联网主机在线设备统计
    ModuleDefine.prototype.BindLinkNetMainHostCount = function (token, okCallback, failCallback) {
        var url = "/OpenApi/EventHandler/GetNetworkHostOnlineTotal";
        var data = {
            token: token
        };
        layui.neatDataApi.sendGet(url, data, okCallback, failCallback);
    };

    // 查询取企业地图信息地图坐标
    ModuleDefine.prototype.queryMapLocationData = function (token, okCallback, failCallback) {
        var url = "/OpenApi/EventHandler/GetGisLayout";
        var data = {
            token: token
        };
        layui.neatDataApi.sendGet(url, data, okCallback, failCallback);
    };

    // 查询取企业地图弹框详细信息
    ModuleDefine.prototype.queryEntMapInfoData = function (token, entId, okCallback, failCallback) {
        var url = "/OpenApi/EventHandler/GetEnterpriseTip";
        var data = {
            token: token,
            entId: entId
        };
        layui.neatDataApi.sendGet(url, data, okCallback, failCallback);
    };

    // 取设备地图弹框详细信息
    ModuleDefine.prototype.queryDeviceMapInfoData = function (token, id, category, okCallback, failCallback) {
        var url = "/OpenApi/EventHandler/GetDeviceTip";
        var data = {
            token: token,
            id: id,
            category: category
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
    // 查询企业非正常设备列表
    ModuleDefine.prototype.queryEnterpriseAbnormalDeviceList = function (token, entId, eventType, okCallback, failCallback) {

        var url = "/OpenApi/EventHandler/GetMapDialogEnterpriseFireDeviceList";

        var data = {
            token: token,
            entId: entId,
            eventType: eventType

        };
        layui.neatDataApi.sendGet(url, data, okCallback, failCallback);
    };

    //全局都是这一个实例
    var moduleInstance = new ModuleDefine();

    //暴露接口
    exports(MODULE_NAME, moduleInstance);
});