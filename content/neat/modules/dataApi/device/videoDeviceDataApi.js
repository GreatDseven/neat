
layui.define(["jquery", 'neatDataApi', 'laytpl'], function (exports) {
    "use strict";

    var MODULE_NAME = 'videoDeviceDataApi';

    var $ = layui.$;

    var VideoDeviceDataApi = function () { };




    //=================萤石云相关====================

    // 查询萤石云账号列表
    VideoDeviceDataApi.prototype.queryYSAccountList = function (token, keyword,domainId,enterpriseId, 
        okCallback, failCallback) {

        var url = "/OpenApi/VideoYsAccount/Search";

        //if (url == "") {
        //    mockData.getMockData("queryYSAccountList", okCallback, failCallback);
        //    return;
        //}

        //if (!orderByColumn) {
        //    orderByColumn = "None";
        //}

        //if (typeof isDescOrder === "undefined") {
        //    isDescOrder = "true";
        //}

        var data = {
            token: token,
            keyword: keyword,
            domainId: domainId,
            enterpriseId: enterpriseId
          
            //orderByColumn: orderByColumn,
            //isDescOrder: isDescOrder,
            //pageIndex: pageIndex,
            //pageSize: pageSize
        };

        layui.neatDataApi.sendGet(url, data, okCallback, failCallback);

    };



    // 新增萤石云账号
    VideoDeviceDataApi.prototype.createYSAccount = function (token, data, okCallback, failCallback) {

        var url = "/OpenApi/VideoYsAccount/Put/?token=" + encodeURIComponent(token);

        //if (url == "") {
        //    mockData.getMockData("createYSAccount", okCallback, failCallback);
        //    return;
        //}


        layui.neatDataApi.sendPostJson(url, data, okCallback, failCallback);
    };

    // 根据id获取萤石云账号详细信息
    VideoDeviceDataApi.prototype.getYSAccountDetailInfoById=function(token, id, okCallback, failCallback) {

        var url = "/OpenApi/VideoYsAccount/Get";

        var data = {
            token: token,
            id: id
        };

        layui.neatDataApi.sendGet(url, data, okCallback, failCallback);

    };

    // 修改萤石云账号
    VideoDeviceDataApi.prototype.updateYSAccount = function (token, data, okCallback, failCallback) {

        var url = "/OpenApi/VideoYsAccount/Post/?token=" + encodeURIComponent(token);

        //if (url == "") {
        //    mockData.getMockData("updateYSAccount", okCallback, failCallback);
        //    return;
        //}


        layui.neatDataApi.sendPostJson(url, data, okCallback, failCallback);
    };


    // 删除萤石云账号
    VideoDeviceDataApi.prototype.deleteYSAccount = function (token, ids, okCallback, failCallback) {
        var url = "/OpenApi/VideoYsAccount/Delete/?token=" + encodeURIComponent(token);

        //if (url == "") {
        //    mockData.getMockData("deleteYSAccount", okCallback, failCallback);
        //    return;
        //}

        layui.neatDataApi.sendPostJson(url, ids, okCallback, failCallback);
    };



    //从数据库中获取指定账号下的设备
    VideoDeviceDataApi.prototype.loadYSVideoDeviceFromDb = function (token, accountId,  
         okCallback, failCallback) {

        var url = "/OpenApi/VideoDevice/GetYsDeviceList";

       

        var data = {
            token: token,
            accountId: accountId
        };

        layui.neatDataApi.sendGet(url, data, okCallback, failCallback);
    };


    //从萤石云中获取指定账号下的设备
    VideoDeviceDataApi.prototype.loadYSVideoDeviceFromYS = function (token, accountId,
        okCallback, failCallback) {

        var url = "/OpenApi/VideoDevice/SyncYsDevice";


        var data = {
            token: token,
            accountId: accountId,

        };

        layui.neatDataApi.sendGet(url, data, okCallback, failCallback);
    };

    //删除萤石云的账号
    VideoDeviceDataApi.prototype.deleteYSDevice = function (token, ids, okCallback, failCallback) {

        var url = "/OpenApi/VideoDevice/DeleteInvalidYsDevice/?token=" + encodeURIComponent(token);


        layui.neatDataApi.sendPostJson(url, ids, okCallback, failCallback);
    };


    //根据Id获取萤石云设备详情
    VideoDeviceDataApi.prototype.getYSDeviceDetailById = function (token, id, 
        okCallback, failCallback) {

        var url = "/OpenApi/VideoDevice/GetYsDevice";

        var data = {
            token: token,
            id: id
          
        };

        layui.neatDataApi.sendGet(url, data, okCallback, failCallback);
    };

    


    //修改萤石云视频设备
    VideoDeviceDataApi.prototype.updateYSDevice = function (token, data, okCallback, failCallback) {
        var url = "/OpenApi/VideoDevice/PostYsDevice/?token=" + encodeURIComponent(token);


        layui.neatDataApi.sendPostJson(url, data, okCallback, failCallback);
    };


    // 获取萤石云设备下的通道信息.
    VideoDeviceDataApi.prototype.getYSDeviceChannels = function (token, deviceId, 
        okCallback, failCallback) {

        var url = "/OpenApi/VideoDevice/GetYsVideoChannelList";

        var data = {
            token: token,
            videoId: deviceId
        };

        layui.neatDataApi.sendGet(url, data, okCallback, failCallback);
    };

    // 获取萤石云设备视频通道详细信息
    VideoDeviceDataApi.prototype.getYSDeviceChannelDetailInfoById = function (token, channelId,
        okCallback, failCallback) {

        var url = "/OpenApi/VideoDevice/GetYsVideoChannelDetail";

        var data = {
            token: token,
            videoChannelId: channelId
        };

        layui.neatDataApi.sendGet(url, data, okCallback, failCallback);
    };
    

    //修改萤石云 通道
    VideoDeviceDataApi.prototype.updateYSDeviceChannel = function (token, data, okCallback, failCallback) {
        var url = "/OpenApi/VideoDevice/PostYsVideoChannel/?token=" + encodeURIComponent(token);

        layui.neatDataApi.sendPostJson(url, data, okCallback, failCallback);
    };
    

   

    //========视频联动========================
    //

    //查询视频联动列表数据
    VideoDeviceDataApi.prototype.queryVideoLinkageDeviceList = function (token, keyword, domainId, enterpriseId,deviceTypes,
        pageIndex, pageSize, okCallback, failCallback) {

        var url = "/OpenApi/VideoLinkage/GetVideoLinkageList";



        var data = {
            token: token,
            keyword: keyword,
            domainId: domainId,
            enterpriseId: enterpriseId,
            deviceType: deviceTypes,
            pageIndex: pageIndex,
            pageSize: pageSize
        };

        layui.neatDataApi.sendGet(url, data, okCallback, failCallback);

    };


    //删除视频联动
    VideoDeviceDataApi.prototype.deleteVideoLinkage = function (token, data, okCallback, failCallback) {
        var url = "/OpenApi/VideoLinkage/DeleteVideoLinkage/?token=" + encodeURIComponent(token);

        layui.neatDataApi.sendPostJson(url, data, okCallback, failCallback);
    };

    //添加视频联动
    VideoDeviceDataApi.prototype.createVideoLinkage = function (token, data, okCallback, failCallback) {

        var url = "/OpenApi/VideoLinkage/AddVideoLinkage/?token=" + encodeURIComponent(token);

        layui.neatDataApi.sendPostJson(url, data, okCallback, failCallback);
    };

    


    // 根据安装位置查询视频设备,返回直连视频设备和萤石云视频设备
    VideoDeviceDataApi.prototype.searchVideoDevice = function (token,  enterpriseId,buildingId,keypartId,
        okCallback, failCallback) {

        var url = "/OpenApi/VideoLinkage/GetVideoOptions";


        var data = {
            token: token,
            entId: enterpriseId,
            buildingId: buildingId,
            keypartId: keypartId
         
        };

        layui.neatDataApi.sendGet(url, data, okCallback, failCallback);

    };

    // 加载视频设备id加载的视频通道
    VideoDeviceDataApi.prototype.getVideoChannelsByVideoDeviceId = function (token,deviceId,
        okCallback, failCallback) {

        var url = "/OpenApi/VideoLinkage/GetVideoChannelOptions";


        var data = {
            token: token,
            deviceId: deviceId
        };

        layui.neatDataApi.sendGet(url, data, okCallback, failCallback);

    };

    // 加载视频设备id和通道id,加载的绑定的视频联动消防设备
    VideoDeviceDataApi.prototype.getLinkageByChannelId = function (token, channelId,
        okCallback, failCallback) {

        var url = "/OpenApi/VideoLinkage/GetVideoLinkageDeviceList";

        var data = {
            token: token,
            channelId: channelId
        };

        layui.neatDataApi.sendGet(url, data, okCallback, failCallback);

    };

    // 视频联动选择消防设备时,搜索设备
    VideoDeviceDataApi.prototype.searchDevice = function (token, keyword, sourceCategory, domainId, enterpriseId, buildingId, keypartId,
        okCallback, failCallback) {

        var url = "/OpenApi/VideoLinkage/GetVideoLinkageDevice";

        var data = {
            token: token,
            keyword: keyword,
            sourceCategory: sourceCategory,
            domainId: domainId,
            enterpriseId: enterpriseId,
            buildingId: buildingId,
            keypartId: keypartId
        };

        layui.neatDataApi.sendGet(url, data, okCallback, failCallback);

    };
    //获取视频播放详细信息  
    VideoDeviceDataApi.prototype.getVideoPlayDeatil = function (token, deviceId, enterpriseId, channelId, videoPlayType, beginTime, endTime,
        okCallback, failCallback) {

        var url = "/OpenApi/VideoDevice/GetVideoPlayDeatil";

        var data = {
            token: token,
            deviceId: deviceId,
            enterpriseId: enterpriseId,
            channelId: channelId,
            videoPlayType: videoPlayType,
            beginTime: beginTime,
            endTime: endTime
        };

        layui.neatDataApi.sendGet(url, data, okCallback, failCallback);

    };
    //播放萤石云的通道设备
    VideoDeviceDataApi.prototype.YsPlayStart = function (token, channelId, direction, speed,
        okCallback, failCallback) {

        var url = "/OpenApi/VideoDevice/YsPlayStart";

        var data = {
            token: token,
            channelId: channelId,
            direction: direction,
            speed: speed
        };

        layui.neatDataApi.sendGet(url, data, okCallback, failCallback);

    };
    //播放萤石云的通道设备
    VideoDeviceDataApi.prototype.YsPlayStop = function (token, channelId, direction,
        okCallback, failCallback) {

        var url = "/OpenApi/VideoDevice/YsPlayStop";

        var data = {
            token: token,
            channelId: channelId,
            direction: direction
        };

        layui.neatDataApi.sendGet(url, data, okCallback, failCallback);

    };
    

    //==================

    //全局都是这一个实例
    var videoDeviceDataApi = new VideoDeviceDataApi();

    //暴露接口
    exports(MODULE_NAME, videoDeviceDataApi);
});