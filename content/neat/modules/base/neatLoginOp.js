
layui.define(['jquery', 'neat', 'neatNavigator', 'neatTools', 'neatDataApi'], function (exports) {
    "use strict";

    var MODULE_NAME = 'neatLoginOp';

    var $ = layui.$;

    var neat = layui.neat;
    var neatNavigator = layui.neatNavigator;
    var neatTools = layui.neatTools;
    var dataApi = layui.neatDataApi;



    var NEATOP = function () { };


    //开始自动刷新token
    NEATOP.prototype.startAutoRefreshToken = function () {

        var that = this;
        //刷新token
        function _refreshToken() {

            var token = neat.getUserToken();

            if (!token) {
                conosole.log("startAutoRefreshToken 退出!");
                return;
            }

            dataApi.refreshToken(token, function (resultData) {
               
                neat.setLoginData(resultData.token, resultData.name, neatTools.convertToDate(resultData.expireTime),resultData.userId,resultData.domainId,resultData.enterpriseId);

            });
        }

        that._refreshTokenHandle = setInterval(_refreshToken, 300000);//5分钟刷新一次

        $(window).on("unload", function () {

            clearInterval(that._refreshTokenHandle);

        });
    };

   


    //校验是否已经登录
    NEATOP.prototype.checkLogin = function (callback) {

        var callCallback = function () {
            if (typeof (callback) === "function") {
                callback();
            }

        };


        var token = neat.getUserToken();

        if (token) {

            dataApi.refreshToken(token, function (resultData) {

                neat.setLoginData(resultData.token, resultData.name, neatTools.convertToDate(resultData.expireTime), resultData.userId, resultData.domainId, resultData.enterpriseId);
                dataApi.token = token;

                if (location.pathname === "/" || location.pathname == "/index.html") {
                    callCallback();
                    window.location.href = neatNavigator.getFullBoardPageUrl() + "?__=" + new Date().valueOf().toString();
                    return;
                }
                else {
                    callCallback();
                }
            });

            return;

        }
        else {
            token = neatNavigator.getTokenFromUrl();
            
            var userName = neatNavigator.getUserNameFromUrl();
            var expireTimeStr = neatNavigator.getExpireTimeFromUrl();
            if (token && userName) {
                
                //说明是登录后回调
                dataApi.token = token;

                var expireTime = null;
                if (expireTimeStr !== "") {
                    expireTime = neatTools.convertToDate(expireTimeStr);
                }

                var domainId =  neatNavigator.getDomainIdFromUrl();
                var enterpriseId = neatNavigator.getEnterpriseIdFromUrl();

                var userId = neatNavigator.getUserIdFromUrl();

                neat.setLoginData(token, userName, expireTime,userId, domainId, enterpriseId);

                callCallback();

                window.location.href = neatNavigator.getFullBoardPageUrl() + "?__=" + new Date().valueOf().toString();

            }
            else {
                callCallback();
                //跳转去登录
                neatNavigator.toLogin(neatNavigator.getBaseUrl());
            }
            
        }



    };

    //注销
    NEATOP.prototype.logout = function () {

        var token = neat.getUserToken();
        //删除本地cookie
        neat.removeAllLoginData();
        var url = location.origin;
        
        neatNavigator.toLogout(url,token);

    };

    var instance = new NEATOP();


    //暴露接口
    exports(MODULE_NAME, instance);
});