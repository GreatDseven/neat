
// 大屏展示到的数据访问api
layui.define(["jquery", 'neatDataApi'], function (exports) {
    "use strict";

    var MODULE_NAME = 'enterpriseInfoDataApi';

    var $ = layui.$;
    var layer = layui.layer;

    var ModuleDefine = function () { };


    // 查询未处理的警情
    ModuleDefine.prototype.getEntDataInMap = function (token, okCallback, failCallback) {
        var url = "/OpenApi/SDEnterprise/GetGisLayout?token=" + token;
        layui.neatDataApi.sendGet(url, null, okCallback, failCallback);
    };


    //全局都是这一个实例
    var dataApiInstance = new ModuleDefine();

    //暴露接口
    exports(MODULE_NAME, dataApiInstance);
});