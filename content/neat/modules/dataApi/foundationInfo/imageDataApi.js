
layui.define(["jquery", 'neat', 'neatDataApi','mockDataProvider'], function (exports) {
    "use strict";

    var MODULE_NAME = 'imageDataApi';

    var neat = layui.neat;

    var mockData = layui.mockDataProvider("ImageDataApi");



    var $ = layui.$;

    var ImageDataApi = function () { };

    //获取存储在数据中的附件在线查看的地址
    ImageDataApi.prototype.getDocFileViewOnlineUrl = function (imgId) {

        var url = neat.getDataApiBaseUrl() + "/OpenApi/DocConvert/ViewFileOnline?token=" + neat.getUserToken() + "&id=" + imgId;
        return url;
    };

    //获取 图片 /音频 /视频 的在线查看地址
    ImageDataApi.prototype.getMediaFileViewOnlineUrl = function (imgId) {

        var url = neat.getDataApiBaseUrl() + "/OpenApi/Image/GetImage?token=" + neat.getUserToken() + "&id=" + imgId;
        return url;
    };

    // =======================================平面图操作=========================================================

    // 获取平面图列表
    ImageDataApi.prototype.queryPlanImgList = function (token, domainId, enterpriseId, buildingId, keypartId,
        pageIndex, pageSize,okCallback, failCallback) {


        var url = "/OpenApi/Plan/GetPlanResultList";

        var data = {
            token: token,
            domainId: domainId,
            enterpriseId: enterpriseId,
            buildingId: buildingId,
            keypartId: keypartId,
            pageIndex: pageIndex,
            pageSize: pageSize
        };

        layui.neatDataApi.sendGet(url, data, okCallback, failCallback);
    };

    //删除平面图
    ImageDataApi.prototype.deletePlanImg = function (token, ids, okCallback, failCallback) {

        var url = "/OpenApi/Plan/DeletePlan/?token=" + encodeURIComponent(token);

        layui.neatDataApi.sendPostJson(url, ids, okCallback, failCallback);
    };


    //添加平面图关联关系
    ImageDataApi.prototype.addLinkage = function (token, data, okCallback, failCallback) {

        var url = "/OpenApi/Plan/AddLinkage/?token=" + encodeURIComponent(token);

        layui.neatDataApi.sendPostJson(url, data, okCallback, failCallback);
    };

    //修改设备布点位置
    ImageDataApi.prototype.updateLinkagePos = function (token, data, okCallback, failCallback) {

        var url = "/OpenApi/Plan/UpdateLinkagePos?token=" + encodeURIComponent(token);

        layui.neatDataApi.sendPostJson(url, data, okCallback, failCallback);
    };


    //获取平面图能够联动得所有设备
    ImageDataApi.prototype.getPlanLinkage = function (token, id,deviceType, okCallback, failCallback) {

        var url = "/OpenApi/Plan/GetPlanLinkage?token=" + encodeURIComponent(token) + "&planId=" + id + "&deviceType=" + deviceType;    

        layui.neatDataApi.sendGet(url, null, okCallback, failCallback);
    };

    //获取平面图能够已联动得设备
    ImageDataApi.prototype.getDevicesByPlanId = function (token, id, okCallback, failCallback) {

        var url = "/OpenApi/Plan/GetDevicesByPlanId?hasAlarm=null&token=" + encodeURIComponent(token) + "&planId=" + id;        

        layui.neatDataApi.sendGet(url, null, okCallback, failCallback);
    };

    //获取相关平面图列表,返回的是包括 企业,建筑,部位,和平面图的 一棵树数据
    //传入enterpriseId, 就是调取企业相关的平面图列表

    ImageDataApi.prototype.getReleatedPlanImgListByEntId = function (token, enterpriseId, okCallback, failCallback) {


         //调取企业相关平面图列表
        var    url = "/OpenApi/Plan/GetPlanByEntId";
        var data = {
            token: token
            ,entId : enterpriseId
        };
        
       

        layui.neatDataApi.sendGet(url, data, okCallback, failCallback);
    };

    //获取相关平面图列表,返回的是包括 企业,建筑,部位,和平面图的 一棵树数据
    // 传入deviceId, 就是调取设备相关的平面图列表
    ImageDataApi.prototype.getReleatedPlanImgListByDeviceId = function (token,  deviceId, okCallback, failCallback) {


        var url = "/OpenApi/Plan/GetPlanByDeviceId";
        var data = {
            token: token,
            deviceId : deviceId
        };
        layui.neatDataApi.sendGet(url, data, okCallback, failCallback);
    };

    //=================================平面图结束==========================================

   


    //全局都是这一个实例
    var imageDataApi = new ImageDataApi();

    //暴露接口
    exports(MODULE_NAME, imageDataApi);
});