layui.define(["jquery", 'neatDataApi'], function (exports) {
    "use strict";

    var MODULE_NAME = 'tppInfoDataApi';



    var $ = layui.$;

    var tppInfoDataApi = function () { };


    //获取第三方推送
    tppInfoDataApi.prototype.getInfoLists = function (token, keyword,domainID, platformType,orderByColumn, isDescOrder,
        pageIndex, pageSize, okCallback, failCallback) {
        var url = "/OpenApi/TPPInfo/GetList";


        if (!orderByColumn) {
            orderByColumn = "Id";
        }
        if (typeof isDescOrder === "undefined") {
            isDescOrder = "true";
        }

        var data = {
            token: token,
            keyword: keyword,
            domainId: domainID,
            platformType: platformType,
            orderByColumn: orderByColumn,
            isDescOrder: isDescOrder,
            pageIndex: pageIndex,
            pageSize: pageSize,
        };

        layui.neatDataApi.sendGet(url, data, okCallback, failCallback);
    };

    //新增第三方推送给平台
    tppInfoDataApi.prototype.createInfo = function (token, domainInfo, okCallback, failCallback) {

        var url = "/OpenApi/TPPInfo/Put/?token=" + encodeURIComponent(token);

        layui.neatDataApi.sendPostJson(url, domainInfo, okCallback, failCallback);
    };

    //删除第三方推送给平台
    tppInfoDataApi.prototype.deleteInfo = function (token, domainIds, okCallback, failCallback) {

        var url = "/OpenApi/TPPInfo/Remove/?token=" + encodeURIComponent(token);

        layui.neatDataApi.sendPostJson(url, domainIds, okCallback, failCallback);
    };

    //根据id获取第三方推送给平台
    tppInfoDataApi.prototype.getInfoById = function (token, id, okCallback, failCallback) {

        var url = "/OpenApi/TPPInfo/GetById/";

        var data = {
            token: token,
            id: id,
        };

        layui.neatDataApi.sendGet(url, data, okCallback, failCallback);
    };

    //修改第三方推送给平台
    tppInfoDataApi.prototype.updateInfo = function (token, domainInfo, okCallback, failCallback) {

        var url = "/OpenApi/TPPInfo/Post/?token=" + encodeURIComponent(token);

        layui.neatDataApi.sendPostJson(url, domainInfo, okCallback, failCallback);
    };

    //全局都是这一个实例
    var domainExtemdDataApi = new tppInfoDataApi();

    //暴露接口
    exports(MODULE_NAME, domainExtemdDataApi);
});