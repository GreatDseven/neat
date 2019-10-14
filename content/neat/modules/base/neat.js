layui.define(['jquery', 'neatConfig'], function (exports) {
    "use strict";

    var MODULE_NAME = 'neat';

    var neatImpDataTableName = "NEAT_IMP";

    var tokenKeyName = "NEAT_IMP_TOKEN";
    var userNameKeyName = "NEAT_IMP_USERNAME";
    var expireTimeKeyName = "NEAT_IMP_EXPIRE";
    var userIdKeyName = "NEAT_IMP_UID";
    var domainIdKeyName = "NEAT_IMP_DID";
    var enterpriseIdKeyName = "NEAT_IMP_EID";


    var Neat = function () {

    };

    //获取登录地址
    Neat.prototype.getLoginUrl = function () {

        return layui.neatConfig.loginUrl;
    };
    //获取注销地址
    Neat.prototype.getLogoutUrl = function () {
        return layui.neatConfig.logoutUrl;
    };

    //获取系统ID
    Neat.prototype.getSystemIds = function () {
        return layui.neatConfig.systemIds;
    };

    Neat.prototype.getSignalRBaseUrl = function () {
        return layui.neatConfig.signalRBaseUrl;
    };
    
    //获取dataApi的基地址
    Neat.prototype.getDataApiBaseUrl = function () {
        return layui.neatConfig.dataApiBaseUrl;
    };

    //获取应用名称
    Neat.prototype.getAppName = function () {
        return layui.neatConfig.appName;
    };


    //删除所有记录的登录信息
    Neat.prototype.removeAllLoginData = function removeAllLoginData() {

        layui.data(neatImpDataTableName, null);

    };

    //记录登录信息
    Neat.prototype.setLoginData = function (token, userName, expireDate, userId, domainId, enterpriseId) {
        layui.data(neatImpDataTableName, {
            key: tokenKeyName, value: token
        });
        layui.data(neatImpDataTableName, {
            key: userNameKeyName, value: userName
        });
        layui.data(neatImpDataTableName, {
            key: expireTimeKeyName, value: expireDate
        });

        layui.data(neatImpDataTableName, {
            key: userIdKeyName, value: userId
        });

        layui.data(neatImpDataTableName, {
            key: domainIdKeyName, value: domainId
        });

        layui.data(neatImpDataTableName, {
            key: enterpriseIdKeyName, value: enterpriseId
        });


    };



    //获取当前登录人信息
    Neat.prototype.getCurrentUserInfo = function () {

        var data = layui.data(neatImpDataTableName);
        return data[userNameKeyName];

    };

    //获取用户登陆后的Token
    Neat.prototype.getUserToken = function () {
        var data = layui.data(neatImpDataTableName);
        return data[tokenKeyName];
    };

    //获取用户Id
    Neat.prototype.getUserId = function () {
        var data = layui.data(neatImpDataTableName);
        return data[userIdKeyName];
    };



    //暴露接口
    exports(MODULE_NAME, new Neat());
});