// 通讯平台 账号信息用到的api


layui.define(["jquery", 'neatDataApi'], function (exports) {
    "use strict";

    var MODULE_NAME = 'iotAuthInfoDataApi';



    var $ = layui.$;

    var ModuleDefine = function () { };


    //添加
    ModuleDefine.prototype.createAuthInfo = function (token, data, okCallback, failCallback) {

        var url = "/OpenApi/IOTAuthInfoAdmin/CreateAuthInfo/?token=" + encodeURIComponent(token);

        layui.neatDataApi.sendPostJson(url, data, okCallback, failCallback);
    };

    //根据id获取授权信息详情
    ModuleDefine.prototype.getAuthInfoById = function (token, id, okCallback, failCallback) {

        var url = "/OpenApi/IOTAuthInfoAdmin/GetAuthInfoById"

        var data = {
            token: token,
            id: id,
        };

        layui.neatDataApi.sendGet(url, data, okCallback, failCallback);
    };

    

    //修改
    ModuleDefine.prototype.updateAuthInfo = function (token, data, okCallback, failCallback) {

        var url = "/OpenApi/IOTAuthInfoAdmin/UpdateAuthInfo/?token=" + encodeURIComponent(token);

        layui.neatDataApi.sendPostJson(url, data, okCallback, failCallback);
    };


    //删除
    ModuleDefine.prototype.deleteAuthInfo = function (token, data, okCallback, failCallback) {

        var url = "/OpenApi/IOTAuthInfoAdmin/DeleteAuthInfo/?token=" + encodeURIComponent(token);

        layui.neatDataApi.sendPostJson(url, data, okCallback, failCallback);
    };

    //获取 与指定机构 关联的授权信息列表
    ModuleDefine.prototype.getOrgRelatedAuthInfos = function (token,domainId,enterpriseId, keyword, enumISP, envType,queryType,pageIndex,pageSize, okCallback, failCallback) {

        var url = "/OpenApi/IOTAuthInfoAdmin/GetOrgRelatedAuthInfos" 

        var data = {
            token: token,
            domainId: domainId,
            enterpriseId: enterpriseId,
            keyword: keyword,
            enumISP: enumISP,
            envType: envType,
            queryType: queryType,
            pageIndex: pageIndex,
            pageSize: pageSize
        };

        layui.neatDataApi.sendGet(url, data, okCallback, failCallback);
    };

    //获取授权信息列表
    ModuleDefine.prototype.getAuthInfoList = function (token, keyword, enumISP, envType, pageIndex, pageSize, okCallback, failCallback) {

        var url = "/OpenApi/IOTAuthInfoAdmin/GetAuthInfoList"

        var data = {
            token: token,
            keyword: keyword,
            enumISP: enumISP,
            envType: envType,
            pageIndex: pageIndex,
            pageSize: pageSize
        };

        layui.neatDataApi.sendGet(url, data, okCallback, failCallback);
    };


    //修改机构与授权信息的对应关系
    ModuleDefine.prototype.changeOrgAuthRelation = function (token, postData, okCallback, failCallback) {

        var url = "/OpenApi/IOTAuthInfoAdmin/ChangeOrgAuthRelation/?token=" + encodeURIComponent(token);

        layui.neatDataApi.sendPostJson(url, postData, okCallback, failCallback);
    };


    //获取机构关联的应用的待选列表
    ModuleDefine.prototype.getOrgAuthInfoCandidateList = function (token, orgId,keyword, okCallback, failCallback) {

        var url = "/OpenApi/IOTAuthInfoAdmin/GetAuthInfoListWithOrgRelationMark"

        var data = {
            token: token,
            orgId:orgId,
            keyword: keyword,
          
        };

        layui.neatDataApi.sendGet(url, data, okCallback, failCallback);
    };

    //获取与应用关联的机构列表
    ModuleDefine.prototype.getAuthInfoRelatedOrgList = function (token, id,  okCallback, failCallback) {

        var url = "/OpenApi/IOTAuthInfoAdmin/GetAuthInfoRelatedOrgList"

        var data = {
           token: token,
           id:id
        };

        layui.neatDataApi.sendGet(url, data, okCallback, failCallback);
    };


    //全局都是这一个实例
    var moduleInstance = new ModuleDefine();

    //暴露接口
    exports(MODULE_NAME, moduleInstance);
});