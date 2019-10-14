layui.define(["jquery", 'neatDataApi'], function (exports) {
    "use strict";

    var MODULE_NAME = 'patrolHiddenDangerDataApi';


    var $ = layui.$;

    var patrolHiddenDangerDataApi = function () { };

    // 获取 隐患上报信息
    patrolHiddenDangerDataApi.prototype.getHiddenDangerCreateInfo = function (token,id,okCallback,errorCallback) {
        var url = '/OpenApi/HDanger/GetTroubleHandleInfo';
        var sendData =
               {
                   token: token,
                   troubleId: id
               };

        layui.neatDataApi.sendGet(url, sendData, function (result) {
            okCallback(result);

        }, function (result) {
            errorCallback(result);
        });
    };

    // 获取 隐患处理信息
    patrolHiddenDangerDataApi.prototype.getHiddenDangerHandleInfo = function (token, id, okCallback, errorCallback) {
        var url = '/OpenApi/HDanger/GetOsiTroubleHandle';
        var sendData =
               {
                   token: token,
                   troubleId: id
               };

        layui.neatDataApi.sendGet(url, sendData, function (result) {
            okCallback(result);

        }, function (result) {
            errorCallback(result);
        });
    };

    // 获取 隐患确认信息
    patrolHiddenDangerDataApi.prototype.getHiddenDangerConfirmInfo = function (token, id, okCallback, errorCallback) {
        var url = '/OpenApi/HDanger/GetOsiTroubleConfirm';
        var sendData =
               {
                   token: token,
                   troubleId: id
               };

        layui.neatDataApi.sendGet(url, sendData, function (result) {
            okCallback(result);

        }, function (result) {
            errorCallback(result);
        });
    };

    // 获取 隐患处理历史信息
    patrolHiddenDangerDataApi.prototype.getTroubleHandleHistory = function (token, id, okCallback, errorCallback) {
        var url = '/OpenApi/HDanger/GetTroubleHandleHistory';
        var sendData =
               {
                   token: token,
                   troubleId: id
               };

        layui.neatDataApi.sendGet(url, sendData, function (result) {
            okCallback(result);

        }, function (result) {
            errorCallback(result);
        });
    };


    

    //全局都是这一个实例
    var patrolHiddenDangerDataApiInstance = new patrolHiddenDangerDataApi();

    //暴露接口
    exports(MODULE_NAME, patrolHiddenDangerDataApiInstance);
});