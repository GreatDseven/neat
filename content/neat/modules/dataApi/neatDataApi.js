layui.define(["jquery", "neat", 'neatNavigator', 'layer'], function (exports) {
    "use strict";

    var MODULE_NAME = 'neatDataApi';



    var neat = layui.neat;
    var neatNavigator = layui.neatNavigator;

    var $ = layui.$;

    


    //wepApi返回的结果编码定义
    var responseResultEnum =
    {
        /// <summary>
        /// 成功
        /// </summary>
        success: 200,

        /// <summary>
        /// 验证错误
        /// </summary>
        validateError: 401,
  
        /// <summary>
        /// token验证错误
        /// </summary>
        tokenValidateError: 402,
        
        /// <summary>
        /// 拒绝访问
        /// </summary>
        forbidden : 403,

        /// <summary>
        /// 没找到
        /// </summary>
        notFound: 404,

        /// <summary>
        /// token过期
        /// </summary>
        tokenTimeOut: 405,

        /// <summary>
        /// 错误
        /// </summary>
        error: 500,


    };

    var formContentType = "application/x-www-form-urlencoded; charset=UTF-8";
    var jsonContentType = "application/json";


    var DataApi = function () {

    };

    //发送请求
    DataApi.prototype._send = function (url, method, senddata, contentType, okCB, failCB) {


        if (!contentType) {
            contentType = formContentType;
        }

     

        var okCallback = okCB;
        var errorCallback = failCB;

        $.ajax({
            method: method,
            cache: false,
            url: neat.getDataApiBaseUrl() + url,
            data: senddata,
            dataType: "json",
            crossDomain: true,
            contentType: contentType,
            success: function (resultData, textStatus, jqXHR) {

              
               
                if (resultData.code !== responseResultEnum.success) {

                    if (resultData.code === responseResultEnum.tokenValidateError
                        || resultData.code === responseResultEnum.tokenTimeOut) {
                        //token过期或者无效,清除旧数据后导航到登录
                        layui.neat.removeAllLoginData();
                        layui.neatNavigator.toLogin();
                    }
                    if (typeof errorCallback === "function") {
                        errorCallback(resultData);
                    } else {
                        if (typeof resultData.message != "undefined") {
                            layui.layer.msg(resultData.message);
                        }
                        //console.error(resultData.message);
                    }
                } else {
                    if (typeof okCallback === "function") {
                        okCallback(resultData.result);
                    }

                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                

                if (jqXHR.responseJSON) {
                    if (jqXHR.responseJSON.code === responseResultEnum.tokenValidateError
                        || jqXHR.responseJSON.code === responseResultEnum.tokenTimeOut) {
                        //token过期或者无效,清除旧数据后导航到登录
                        layui.neat.removeAllLoginData();
                        layui.neatNavigator.toLogin();
                    }

                    if (typeof errorCallback === "function") {
                        errorCallback(jqXHR.responseJSON);
                    } else {
                        // console.error(jqXHR.responseText);
                        layui.layer.msg(jqXHR.responseJSON.message);
                    }
                } else {
                    if (typeof errorCallback === "function") {
                        errorCallback();
                    }
                }
            }
        }).fail(function (jqXHR, textStatus, errorThrown) {
           
            if (jqXHR.responseJSON) {
                if (jqXHR.responseJSON.code === responseResultEnum.tokenValidateError
                    || jqXHR.responseJSON.code === responseResultEnum.tokenTimeOut) {
                    //token过期或者无效,清除旧数据后导航到登录
                    layui.neat.removeAllLoginData();
                    layui.neatNavigator.toLogin();
                }

                if (typeof errorCallback === "function") {
                    errorCallback(jqXHR.responseJSON);
                } else {
                    // console.error(jqXHR.responseText);
                    layui.layer.msg(jqXHR.responseJSON.message);
                }
            } else {
                if (typeof errorCallback === "function") {
                    errorCallback();
                }
            }

        });
    };

    //发送GET请求,没有缓存
    DataApi.prototype.sendGet = function (url, senddata, okCallback, errorCallbock) {
        this._send(url, "GET", senddata, formContentType, okCallback, errorCallbock);
    };

    //发送POST请求
    DataApi.prototype.sendPost = function (url, senddata, okCallback, errorCallbock) {
        this._send(url, "POST", senddata, formContentType, okCallback, errorCallbock);
    };

    ////发送PUT请求
    //DataApi.prototype.sendPut = function (url, senddata, okCallback, errorCallbock) {
    //    this._send(url, "PUT", senddata, okCallback, errorCallbock);
    //}

    //发送Post请求,数据为json
    DataApi.prototype.sendPostJson = function (url, senddata, okCallback, errorCallbock) {

        var finalSendData = "";

        if (typeof senddata === "string") {
            finalSendData = senddata;
        }
        else {
            finalSendData = JSON.stringify(senddata);
        }

        this._send(url, "POST", finalSendData, jsonContentType, okCallback, errorCallbock);
    };



    //返回值是否是成功
    DataApi.prototype.IsOKResult = function (resultData) {
        if (!resultData) {
            return false;
        }
        if (typeof resultData.code === responseResultEnum.success) {
            return true;
        }

        return false;
    };

    //=============================================================
    // board页面需要的api
    //=============================================================

    /**
     * @description 刷新token
     * @param  {string} token 原有的token
     * @param  {function} okCallback 成功后的回调
     * @param  {function} failCallback 失败后的回调
     */
    DataApi.prototype.refreshToken = function (token, okCallback, failCallback) {

        var that = this;
        var url = '/OpenApi/Auth/RefreshToken';
        var data = {
            token: token
        };
        this.sendGet(url, data, function (resultData) {

            okCallback({
                token: resultData.id,
                expireTime: resultData.expireTime,
                userName: resultData.userName, //登录名
                name: resultData.name,  //中文人名
                userId: resultData.userId,
                domainId: resultData.domainId,
                enterpriseId:resultData.enterpriseId
            });
        }, failCallback);
    };

    //加载树数据
    DataApi.prototype.loadOrgTreeData = function (token, callback, failCallback) {
        var that = this;

        var url = '/OpenApi/SysAuth/GetSysScopeTree';
        var data = {
            token: token
        };

        //结果
        //[{
        //    "id": "eb58ea4b-c567-48e1-bb7b-0b3e66a60b86",
        //    "parentID": "891200fd-360a-11e5-bee7-000ec6f9f8b3",
        //    "name": "宁浩发展九八分公司",
        //    "type": 2,
        //    "fullAccess": true
        //}]
        this.sendGet(url, data, callback, failCallback);
    };

    //加载菜单数据
    DataApi.prototype.loadMenuData = function (token, callback,failCallback) {
        var that = this;

        var url = '/OpenApi/SysAuth/GetSysMenu';
        var data = {
            token: token,
            systemIds: neat.getSystemIds().toString(),
            terminalId: 2
        };

        //结果
        //[{
        //    "id": "2c93bfe8-feb2-11e8-a374-c85b76a0162a",
        //    "name": "隐患处理",
        //    "description": "隐患处理",
        //    "styleId": "",
        //    "entryPoint": "/pages/patrol/hiddenDangerManage.html",
        //    "assembly": "",
        //    "sequence": 1,
        //    "parentId": "2cff926e-feaa-11e8-a374-c85b76a0162a"
        //},
        //{
        //    "id": "2c9a97f0-feb2-11e8-a374-c85b76a0162a",
        //    "name": "巡检详情查看",
        //    "description": "巡检详情查看",
        //    "styleId": "",
        //    "entryPoint": "/pages/patrol/taskInstanceList.html",
        //    "assembly": "",
        //    "sequence": 2,
        //    "parentId": "2cff926e-feaa-11e8-a374-c85b76a0162a"
        //}]
        this.sendGet(url, data, callback, failCallback);
    };

    //=================================自定义logo相关接口==========================================


    // 获取当前用户应该显示的自定义logo
    DataApi.prototype.getLogo = function (token, okCallback, failCallback) {


        var url = "/OpenApi/SysAuth/GetLogo";
        var data = {
            token: token
        };
        layui.neatDataApi.sendGet(url, data, okCallback, failCallback);
    };

    //获取logo 图片 的 url
    DataApi.prototype.getLogoFileUrl = function (imgId) {

        var url = neat.getDataApiBaseUrl() + "/OpenApi/Image/GetImage?token=" + neat.getUserToken() + "&id=" + imgId;
        return url;
    };



    //=============================================================
    // 
    //=============================================================

    //全局都是这一个实例
    var dataApiInstance = new DataApi();

    //暴露接口
    exports(MODULE_NAME, dataApiInstance);
});