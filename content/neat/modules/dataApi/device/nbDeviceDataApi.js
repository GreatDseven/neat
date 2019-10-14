
layui.define(["jquery", 'neatDataApi'], function (exports) {
    "use strict";

    var MODULE_NAME = 'nbDeviceDataApi';

    var $ = layui.$;

    var NBDeviceDataApi = function () { };

    // 查询nb设备列表
    NBDeviceDataApi.prototype.queryNBDeviceList = function (token, keyword, domainId, enterpriseId, buildingId, keypartId,
        orderByColumn, isDescOrder,
        pageIndex, pageSize, okCallback, failCallback) {
        var url = "/OpenApi/NBDevice/QueryNBDeviceList";

        if (!orderByColumn) {
            orderByColumn = "None";
        }

        if (typeof isDescOrder === "undefined") {
            isDescOrder = "true";
        }

        var data = {
            token: token,
            keyword: keyword,
            domainId: domainId,
            enterpriseId: enterpriseId,
            buildingId: buildingId,
            keypartId: keypartId,
            orderByColumn: orderByColumn,
            isDescOrder: isDescOrder,
            pageIndex: pageIndex,
            pageSize: pageSize,
        };

        layui.neatDataApi.sendGet(url, data, okCallback, failCallback);

    };


    // 删除 nb设备
    NBDeviceDataApi.prototype.deleteNBDevice = function (token, gatewayIds, okCallback, failCallback) {
        var url = "/OpenApi/NBDevice/DeleteNBDevice/?token=" + encodeURIComponent(token);
        layui.neatDataApi.sendPostJson(url, gatewayIds, okCallback, failCallback);
    };


    // 根据id获取nb设备信息
    NBDeviceDataApi.prototype.queryNBDeviceDetailInfo = function (token, id, okCallback, failCallback) {
        var url = "/OpenApi/NBDevice/QueryNBDeviceDetailInfo";
        var data = {
            token: token,
            id: id
        };

        layui.neatDataApi.sendGet(url, data, okCallback, failCallback);
    };

    // 更新 nb设备信息
    NBDeviceDataApi.prototype.updateNBDevice = function (token, deviceData, okCallback, failCallback) {

        var url = "/OpenApi/NBDevice/updateNBDevice/?token=" + encodeURIComponent(token);

        layui.neatDataApi.sendPostJson(url, deviceData, okCallback, failCallback);
    };


    // 获取nb设备类型信息列表
    NBDeviceDataApi.prototype.getNBDeviceTypeListForMobile = function (token,  okCallback, failCallback) {
        var url = "/OpenApi/NBDevice/GetNBDeviceTypeListForMobile";
        var data = {
            token: token
        };

        layui.neatDataApi.sendGet(url, data, okCallback, failCallback);
    };



    //全局都是这一个实例
    var instance = new NBDeviceDataApi();

    //暴露接口
    exports(MODULE_NAME, instance);
});