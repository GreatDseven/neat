layui.define(["jquery", 'neatDataApi'], function (exports) {
    "use strict";

    var MODULE_NAME = 'domainDataApi';



    var $ = layui.$;

    var DomainDataApi = function () { };


    //获取中心列表
    DomainDataApi.prototype.getDomains = function (token, domainID, keyword, orderByColumn, isDescOrder,
        pageIndex, pageSize, okCallback, failCallback) {
        var url = "/OpenApi/DomainAdmin/GetDomains";


        if (!orderByColumn) {
            orderByColumn = "Id";
        }
        if (typeof isDescOrder === "undefined") {
            isDescOrder = "true";
        }

        var data = {
            token: token,
            domainId: domainID,
            keyword:keyword,
            orderByColumn: orderByColumn,
            isDescOrder: isDescOrder,
            pageIndex: pageIndex,
            pageSize: pageSize,
        };

        layui.neatDataApi.sendGet(url, data, okCallback, failCallback);
    };

    //新增中心
    DomainDataApi.prototype.createDomain = function (token, domainInfo, okCallback, failCallback) {

        var url = "/OpenApi/DomainAdmin/CreateDomain/?token=" + encodeURIComponent(token);

        layui.neatDataApi.sendPostJson(url, domainInfo, okCallback, failCallback);
    };

    //删除中心
    DomainDataApi.prototype.deleteDomain = function (token, domainIds, okCallback, failCallback) {

        var url = "/OpenApi/DomainAdmin/DeleteDomain/?token=" + encodeURIComponent(token);

        layui.neatDataApi.sendPostJson(url, domainIds, okCallback, failCallback);
    };

    //根据中心id获取中心详细信息,用户编辑中心
    DomainDataApi.prototype.getDomainById = function (token, domainId, okCallback, failCallback) {

        var url = "/OpenApi/DomainAdmin/GetDomainById/";

        var data = {
            token: token,
            id: domainId,
        };

        layui.neatDataApi.sendGet(url, data, okCallback, failCallback);
    };

    //修改中心
    DomainDataApi.prototype.updateDomain = function (token, domainInfo, okCallback, failCallback) {

        var url = "/OpenApi/DomainAdmin/UpdateDomain/?token=" + encodeURIComponent(token);

        layui.neatDataApi.sendPostJson(url, domainInfo, okCallback, failCallback);
    };
    
    

    //全局都是这一个实例
    var domainDataApi = new DomainDataApi();

    //暴露接口
    exports(MODULE_NAME, domainDataApi);
});