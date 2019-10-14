//设备综合查询数据访问接口
layui.define(["jquery", 'neatDataApi'], function (exports) {
    "use strict";

    var MODULE_NAME = 'generalQueryDataApi';

    var $ = layui.$;

    var GeneralQueryDataApi = function () { };

    // 查询设备列表
    GeneralQueryDataApi.prototype.queryDeviceList = function (token, keyword, domainId, enterpriseId, buildingId, keypartId, deviceCategories,
        orderByColumn, isDescOrder,
        pageIndex, pageSize, okCallback, failCallback) {
        var url = "/OpenApi/DeviceQuery/QueryDeviceList";

        if (!orderByColumn) {
            orderByColumn = "None";
        }

        if (typeof isDescOrder === "undefined") {
            isDescOrder = "true";
        }
        var deviceCategoriesArray = "";
        if (typeof deviceCategories === 'string') {
            deviceCategoriesArray = deviceCategories;
        }
        else if (typeof deviceCategories === "undefined") {
            deviceCategoriesArray = "";
        }
        else {
            deviceCategoriesArray = deviceCategories.join();
        }

        var data = {
            token: token,
            keyword: keyword,
            domainId: domainId,
            enterpriseId: enterpriseId,
            buildingId: buildingId,
            keypartId: keypartId,
            deviceCategories: deviceCategoriesArray,
            orderByColumn: orderByColumn,
            isDescOrder: isDescOrder,
            pageIndex: pageIndex,
            pageSize: pageSize,
        };

        layui.neatDataApi.sendGet(url, data, okCallback, failCallback);

    };

    // 查询设备地图位置信息
    GeneralQueryDataApi.prototype.queryDeviceMapLocation = function (token, id, entId, okCallback, failCallback) {
        var url = "/OpenApi/DeviceQuery/QueryDeviceMapLocation";


        var data = {
            token: token,
            id: id,
            entId: entId,
        };

        layui.neatDataApi.sendGet(url, data, okCallback, failCallback);

    };

    // 查询设备历史事件
    GeneralQueryDataApi.prototype.queryDeviceEventList = function (token, deviceId, deviceCategory, okCallback, failCallback) {

        var url = "/OpenApi/DeviceQuery/GetAlarmInfo";

        var data = {
            token: token,
            deviceId: deviceId,
            deviceCategory: deviceCategory,
        };

        layui.neatDataApi.sendGet(url, data, okCallback, failCallback);

    };
    // 查询设备实时数据
    GeneralQueryDataApi.prototype.queryDeviceRealTimeData = function (token, deviceId, deviceCategory, okCallback, failCallback) {

        var url = "/OpenApi/DeviceQuery/GetRealTimeInfo";

        var data = {
            token: token,
            deviceId: deviceId,
            deviceCategory: deviceCategory,

        };

        layui.neatDataApi.sendGet(url, data, okCallback, failCallback);

    };
   
    // 查询设备历史数据
    GeneralQueryDataApi.prototype.queryDeviceHistoryData = function (token, deviceId, deviceCategory, startTime, endTime, okCallback, failCallback) {

        var url = "/OpenApi/DeviceQuery/GetHistoryData";

        var data = {
            token: token,
            deviceId: deviceId,
            deviceCategory: deviceCategory,
            from: startTime,
            to: endTime
        };

        layui.neatDataApi.sendGet(url, data, okCallback, failCallback);

    };


    //全局都是这一个实例
    var generalQueryDataApi = new GeneralQueryDataApi();

    //暴露接口
    exports(MODULE_NAME, generalQueryDataApi);
});