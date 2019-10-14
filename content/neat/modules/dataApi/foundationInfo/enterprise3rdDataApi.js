layui.define(["jquery", 'neatDataApi'], function (exports) {
    "use strict";

    var MODULE_NAME = 'enterprise3rdDataApi';



    var $ = layui.$;

    var EntDataApi = function () { };


    //获取单位列表
    EntDataApi.prototype.getEnterprises = function (token, domainId, keyword, entType, orderByColumn, isDescOrder,
        pageIndex, pageSize, okCallback, failCallback) {
        var url = "/OpenApi/EnterpriseAdmin3rd/GetEnterprises";

        if (!orderByColumn) {
            orderByColumn = "Id";
        }
        if (typeof isDescOrder === "undefined") {
            isDescOrder = "true";
        }

        var data = {
            token: token,
            domainId: domainId,
            keyword: keyword,
            entType: entType,
            orderByColumn: orderByColumn,
            isDescOrder: isDescOrder,
            pageIndex: pageIndex,
            pageSize: pageSize,
        };

        layui.neatDataApi.sendGet(url, data, okCallback, failCallback);
    };

    //新增单位
    EntDataApi.prototype.createEnterprise = function (token, entInfo, okCallback, failCallback) {

        var url = "/OpenApi/EnterpriseAdmin3rd/CreateEnterprise/?token=" + encodeURIComponent(token);
        
        layui.neatDataApi.sendPostJson(url, entInfo, okCallback, failCallback);
    };

    //删除单位
    EntDataApi.prototype.deleteEnterprise = function (token, entIds, okCallback, failCallback) {

        var url = "/OpenApi/EnterpriseAdmin3rd/DeleteEnterprise/?token=" + encodeURIComponent(token);

        layui.neatDataApi.sendPostJson(url, entIds, okCallback, failCallback);
    };

    //根据单位id获取单位详细信息,用户编辑单位
    EntDataApi.prototype.getEnterpriseById = function (token, entId, okCallback, failCallback) {
        var url = "/OpenApi/EnterpriseAdmin3rd/GetEnterpriseById/";

        var data = {
            token: token,
            id: entId,
        };

        layui.neatDataApi.sendGet(url, data, okCallback, failCallback);
    };

    //根据单位id获取单位详细信息,用户编辑单位
    EntDataApi.prototype.getEnterpriseInfo = function (token, entId, okCallback, failCallback) {
        var url = "/OpenApi/EnterpriseAdmin3rd/GetEnterpriseInfo/";
        var data = {
            token: token,
            id: entId,
        };

        layui.neatDataApi.sendGet(url, data, okCallback, failCallback);
    };

    //修改单位
    EntDataApi.prototype.updateEnterprise = function (token, entInfo, okCallback, failCallback) {

        var url = "/OpenApi/EnterpriseAdmin3rd/UpdateEnterprise/?token=" + encodeURIComponent(token);

        layui.neatDataApi.sendPostJson(url, entInfo, okCallback, failCallback);
    };

    //全局都是这一个实例
    var entDataApi = new EntDataApi();

    //暴露接口
    exports(MODULE_NAME, entDataApi);
});