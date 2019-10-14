
// 弹出窗口 大集合
layui.define(['layer', 'neat', 'generalQueryDataApi', 'neatGisViewer', 'neatWindowManager'], function (exports) {

    "use strict";

    var MODULENAME = "neatPopupRepository"; //neatPopups

    var layer = layui.layer;

    var neat = layui.neat;

    var generalQueryDataApi = layui.generalQueryDataApi;

    var gisViewer = layui.neatGisViewer;

    var windowMgr = layui.neatWindowManager;

    var ModuleDefine = function () {
    };

    var deviceCategories = {

        fireGateway: 1,//消防传输设备
        fireHost: 101, //消防主机
        neatWaterGateway: 2, //neat水网关
        neatWaterSignal: 201,//neat水信号

        unibodyWaterDevice: 3, //一体式水设备
        nbDevice: 6, //nb设备,

        electricalDevice: 4, //智慧用电设备

    };

    var emptyGuid = "00000000-0000-0000-0000-000000000000";


    // 弹出页面窗口
    ModuleDefine.prototype.popupPage = function (url, width, height, title, callback) {

        windowMgr.openLayerInRootWindow({
            resize: false,
            type: 2,
            title: title,
            area: [width, height],
            shade: [0.7, '#000'],
            content: url,
            end: function () {
                if (typeof (callback) === "function") {
                    callback();
                }
            }
        });
    };


    // 根据事件id和设备分类类别 显示处理事件的页面.

    ModuleDefine.prototype.showEventProcessWindow = function (eventId, deviceId, deviceIdType, systemCategory, callback) {
        var url = "";
        var width = "";
        var height = "";
        var title = "";
        width = "800px";
        height = "600px";
        title = "警情处理";
        url = "/pages/monitoring/monitorEventProcess.html?eventId=" + eventId +
            "&deviceId=" + deviceId +
            "&deviceIdType=" + deviceIdType +
            "&systemCategory=" + systemCategory +
            "&__=" + new Date().valueOf().toString();
        if (url !== "") {
            this.popupPage(url, width, height, title, callback);
        }
        else {
            //layer.msg("该设备类型的方法(showEventProcessWindow)尚未实现!");
        }
    };

    // 根据事件id和设备分类类别 显示事件处理结果查看的页面.
    ModuleDefine.prototype.showEventProcessResultWindow = function (eventId, deviceId, deviceIdType, systemCategory, callback) {
        var url = "";
        var width = "";
        var height = "";
        var title = "";
        width = "800px";
        height = "640px";
        title = "警情处理情况";
        url = "/pages/monitoring/monitorEventProcessResultWindow.html?eventId=" + eventId +
            "&deviceId=" + deviceId +
            "&deviceIdType=" + deviceIdType +
            "&systemCategory=" + systemCategory +
            "&__=" + new Date().valueOf().toString();

        if (url !== "") {
            this.popupPage(url, width, height, title, callback);
        }
        else {
            //layer.msg("该设备类型的方法(showEventProcessResultWindow)尚未实现!");
        }

    };



    // 根据设备id和设备分类类别 显示设备地图定位.
    ModuleDefine.prototype.showDeviceMapLocationWindow = function (deviceId, entId, callback) {

        generalQueryDataApi.queryDeviceMapLocation(neat.getUserToken(), deviceId, entId, function (resultData) {
            
            if (!resultData || !resultData.latitude || !resultData.longitude) {
                layer.msg("尚未标注");
                return;
            }

            gisViewer.init(resultData.latitude
                , resultData.longitude
                , resultData.gisAddress);

            gisViewer.show(function (result) {

                if (typeof (callback) === "function") {
                    callback();
                }

            });

        });

    };


    // 根据设备id和设备分类类别 显示设备详细信息
    ModuleDefine.prototype.showDeviceDetailInfoWindow = function (deviceId, deviceCategory, callback) {


        var url = "";

        var width = "";
        var height = "";
        var title = "";

        if (deviceCategory === deviceCategories.fireGateway) { // 消防传输设备

            url = "/pages/device/integratedDevice/uitd/uitdDetail.html?uitd_id=" + deviceId
                + "&__=" + new Date().valueOf().toString();
            width = "810px";
            height = "350px";
            title = "传输设备详情";
        } else if (deviceCategory === deviceCategories.fireHost) { // 消防主机

            url = "/pages/device/integratedDevice/fireHost/fireHostDetail.html?id=" + deviceId
                + "&__=" + new Date().valueOf().toString();
            width = "810px";
            height = "300px";
            title = "消防主机详情";
        }

        else if (deviceCategory === deviceCategories.neatWaterGateway) { // NEAT水网关

            url = "/pages/device/waterDevice/neat/NEATWaterGatewayDetail.html?wgw_id=" + deviceId
                + "&__=" + new Date().valueOf().toString();
            width = "806px";
            height = "260px";
            title = "NEAT水设备水信号详情";
        } else if (deviceCategory === deviceCategories.neatWaterSignal) { // NEAT水信号

            url = "/pages/device/waterDevice/neat/NEATWaterSignalDetail.html?signal_id=" + deviceId
                + "&__=" + new Date().valueOf().toString();
            width = "806px";
            height = "580px";
            title = "NEAT水设备水信号详情";


        } else if (deviceCategory === deviceCategories.unibodyWaterDevice) { // 一体式水源监测设备

            url = "/pages/device/waterDevice/unibody/UnibodyGatewayDetail.html?id=" + deviceId
                + "&__=" + new Date().valueOf().toString();
            width = "806px";
            height = "430px";
            title = "一体式水源监测设备详情";


        } else if (deviceCategory === deviceCategories.nbDevice) { // NB设备

            url = "/pages/device/nbDevice/NEATNBDeviceDetail.html?id=" + deviceId
                + "&__=" + new Date().valueOf().toString();
            width = "806px";
            height = "330px";
            title = "NB设备详情";


        } else if (deviceCategory === deviceCategories.electricalDevice) {//智慧用电设备

            url = "/pages/device/electricalDevice/ElectricalDeviceGatewayDetail.html?id=" + deviceId
                + "&__=" + new Date().valueOf().toString();
            width = "806px";
            height = "480px";
            title = "智慧用电设备详情";
        }

        if (url !== "") {
            this.popupPage(url, width, height, title, callback);
        }
        else {
            //layer.msg("该设备类型的方法(showDeviceDetailInfoWindow)尚未实现!");
        }
    };

    // 根据设备id和设备分类类别 显示设备实时数据
    ModuleDefine.prototype.showDeviceRealTimeDataWindow = function (deviceId, deviceCategory, callback) {

        var url = "/pages/device/generalQuery/deviceRealTimeStatus.html?id=" + deviceId
            + "&device_type=" + deviceCategory
            + "&__=" + new Date().valueOf().toString();

        var width = "";
        var height = "";
        var title = "";

        width = "680px";
        height = "380px";


        if (deviceCategory === deviceCategories.fireGateway) { // 消防传输设备
            title = "消防传输设备实时数据查看";
        } else if (deviceCategory === deviceCategories.fireHost) { // 消防主机
            title = "消防主机实时数据查看";
        } else if (deviceCategory === deviceCategories.neatWaterGateway) { // neat水网关
            title = "NEAT水网关实时数据查看";
        } else if (deviceCategory === deviceCategories.neatWaterSignal) { // neat水信号
            title = "NEAT水信号实时数据查看";
        } else if (deviceCategory === deviceCategories.unibodyWaterDevice) { // 一体式水设备
            title = "一体式水设备实时数据查看";
        } else if (deviceCategory === deviceCategories.nbDevice) { // NB设备
            title = "NB设备实时数据查看";
        } else if (deviceCategory === deviceCategories.electricalDevice) {//智慧用电设备
            var gateWayId = deviceId;
            url = "/pages/device/generalQuery/ElectricalDeviceLiveData.html?id=" + gateWayId
                + "&__=" + new Date().valueOf().toString();
            title = "智慧用电设备实时数据查看";
            width = "945px";
            height = "770px";

        }
        if (title !== "") {
            this.popupPage(url, width, height, title, callback);
        }
        else {
            //layer.msg("该设备类型的方法(showDeviceRealTimeDataWindow)尚未实现!");
        }
    };

    // 根据设备id和设备分类类别 显示设备历史数据
    ModuleDefine.prototype.showDeviceHistoryDataWindow = function (deviceId, deviceCategory, callback) {

        var url = "/pages/device/generalQuery/waterHistoryData.html?id=" + deviceId
            + "&device_type=" + deviceCategory
            + "&__=" + new Date().valueOf().toString();
        var width = "850px";
        var height = "750px";
        var title = "";

        if (deviceCategory === deviceCategories.neatWaterSignal) { // NEAT水信号
            title = "NEAT水信号历史数据";

        } else if (deviceCategory === deviceCategories.unibodyWaterDevice) { // 一体式水信号
            title = "一体式水设备历史数据";
        } else if (deviceCategory === deviceCategories.electricalDevice) {//智慧用电设备
            title = "智慧用电设备历史数据";

            url = "/pages/device/generalQuery/electricalDeviceHistoryData.html?id=" + deviceId
                + "&__=" + new Date().valueOf().toString();

            width = "1000px";
            height = "650px";
        }
        else {
            layer.msg("该设备不支持查询历史数据");
            return;
        }

        if (title !== "") {
            this.popupPage(url, width, height, title, callback);
        }
        else {
            layer.msg("该设备不支持查看历史数据!");
        }

    };

    //根据设备id和设备分类类别 显示设备历史事件
    ModuleDefine.prototype.showDeviceHistoryEventWindow = function (deviceId, deviceCategory, deviceName, callback) {

        var url = "/pages/device/generalQuery/deviceEventList.html?device_id=" + deviceId
            + "&device_category=" + deviceCategory
            + "&device_name=" + encodeURIComponent(deviceName)
            + "&__=" + new Date().valueOf().toString();

        var width = "1000px";
        var height = "500px";
        var title = "";

        if (deviceCategory == deviceCategories.fireGateway) {
            title = "消防传输设备历史警情";
        }
        else if (deviceCategory == deviceCategories.fireHost) {
            title = "消防主机历史警情";
        } else if (deviceCategory == deviceCategories.neatWaterGateway) {
            title = "NEAT水网关历史警情";
        } else if (deviceCategory == deviceCategories.neatWaterSignal) {
            title = "NEAT水信号历史警情";
        } else if (deviceCategory == deviceCategories.unibodyWaterDevice) {
            title = "一体式水设备历史警情";
        } else if (deviceCategory == deviceCategories.nbDevice) {
            title = "NB设备历史警情";
        } else if (deviceCategory == deviceCategories.electricalDevice) {//智慧用电设备
            title = "智慧用电设备历史警情";
        }

        if (title !== "") {
            this.popupPage(url, width, height, title, callback);
        } else {
            layer.msg("该设备不支持查看历史警情!");
        }

    };

    // 根据设备id和设备分类类别 显示平面图.
    ModuleDefine.prototype.showDevicePlanarGraphWindow = function (deviceId, callback) {

        var url = "/pages/foundationInfo/planImg/planImgViewByDeviceId.html?device_id=" + deviceId
            + "&__=" + new Date().valueOf().toString();

        var width = "1400px";
        var height = "780px";
        var title = "平面图查看";


        if (deviceId == emptyGuid) {
            layer.msg("无相关平面图信息!");
            return;
        }


        this.popupPage(url, width, height, title, callback);


    };

    // 根据设备id和设备分类类别 显示相关摄像头.
    ModuleDefine.prototype.showDeviceRelatedCameraWindow = function (deviceId, callback) {

        var url = "";

        var width = "1390px";
        var height = "780px";
        var title = "";
        title = "实时监控查看";
        url = "/pages/controls/videoPlay.html?deviceId=" + deviceId
            + "&__=" + new Date().valueOf().toString();

        if (url !== "") {
            this.popupPage(url, width, height, title, callback);
        }

    };

    // 查看通道视频
    ModuleDefine.prototype.showVideoChannelWindow = function (channelId, callback) {

        var url = "";

        var width = "1390px";
        var height = "780px";
        var title = "";
        title = "实时监控查看";
        url = "/pages/controls/videoPlay.html?channelId=" + channelId
            + "&__=" + new Date().valueOf().toString();

        if (url !== "") {
            this.popupPage(url, width, height, title, callback);
        }

    };

    // 根据企业id显示相关摄像头.
    ModuleDefine.prototype.showEnterpriseDeviceCameraWindow = function (entid, callback) {

        var url = "";

        var width = "1390px";
        var height = "780px";
        var title = "";
        title = "实时监控查看";
        url = "/pages/controls/videoPlay.html?entid=" + entid
            + "&__=" + new Date().valueOf().toString();

        if (url !== "") {
            this.popupPage(url, width, height, title, callback);
        }

    };


    // 根据企业id               显示企业的详情
    ModuleDefine.prototype.showEnterpriseDetailWindow = function (enterpriseId, callback) {

        var url = "/pages/foundationInfo/enterprise/enterpriseDetail.html?id=" + enterpriseId
            + "&__=" + new Date().valueOf().toString();

        var width = "800px";
        var height = "680px";
        var title = "单位详情";

        if (url !== "") {
            this.popupPage(url, width, height, title, callback);
        } else {
            //layer.msg("该方法(showEnterpriseDetailWindow)尚未实现!");
        }

    };

    //根据企业id               显示企业所有平面图
    ModuleDefine.prototype.showEnterprisePlanarGraphWindow = function (enterpriseId, callback) {

        var url = "/pages/foundationInfo/planImg/planImgViewByEnterpriseId.html?enterprise_id=" + enterpriseId
            + "&__=" + new Date().valueOf().toString();

        var width = "1400px";
        var height = "780px";
        var title = "平面图查看";

        if (enterpriseId == emptyGuid) {
            layer.msg("无相关平面图信息!");
            return;
        }

        if (url !== "") {
            this.popupPage(url, width, height, title, callback);
        } else {
            //layer.msg("该方法(showEnterprisePlanarGraphWindow)尚未实现!");
        }
    };

    //根据企业id               显示企业所有摄像头.
    ModuleDefine.prototype.showEnterpriseCameraWindow = function (enterpriseId, callback) {
        var url = "";

        var width = "";
        var height = "";
        var title = "";

        if (url !== "") {
            this.popupPage(url, width, height, title, callback);
        } else {
            //layer.msg("该方法(showEnterpriseCameraWindow)尚未实现!");
        }
    };


    // 根据企业id               显示企业范围内非正常状态的设备列表(fire,alarm,fault,offline)
    ModuleDefine.prototype.showEnterpriseAbnormalDeviceListWindow = function (enterpriseId, abnormalStatus, callback) {

        var url = "/pages/monitoring/enterpriseAbnormalDeviceList.html?enterprise_id=" + enterpriseId
            + "&abnormal_status=" + abnormalStatus
            + "&__=" + new Date().valueOf().toString();

        var getStatusText = function (deviceStatus) {

            if (deviceStatus === "fire") {
                return '火警';
            }
            else if (deviceStatus === "alarm") {
                return '报警';
            }
            else if (deviceStatus === "fault") {
                return '故障';
            }
            else if (deviceStatus === "offline") {
                return '离线';
            }

            return "";
        };

        var statusText = getStatusText(abnormalStatus);

        if (statusText === "") {
            layer.msg("不支持该状态的设备查询");
            return;
        }


        var width = "1030px";
        var height = "600px";
        var title = statusText + "设备列表";

        if (url !== "") {
            this.popupPage(url, width, height, title, callback);
        } else {
            // layer.msg("该方法(showEnterpriseAbnormalDeviceListWindow)尚未实现!");
        }
    };

    exports(MODULENAME, new ModuleDefine());

});