//设备 实时数据页面


layui.define(['jquery', 'layer', 'form', 'laytpl', 'element', 'table', 'neat', 'neatDataApi', 'generalQueryDataApi', 'neatNavigator', 'commonDataApi', "neatUITools",'neatTools'], function (exports) {



    "use strict";
    var $ = layui.$;
    var MODULE_NAME = "pageDeviceRealTimeStatus";

    var form = layui.form;
    var laytpl = layui.laytpl;

    var layer = layui.layer;

    var neat = layui.neat;

    var neatNavigator = layui.neatNavigator;

    var commonDataApi = layui.commonDataApi;

    var pageDataApi = layui.generalQueryDataApi;


    var uiTools = layui.neatUITools;


    //返回的数据的列名称



    var SubPage = function () {


        this.id = "";
        this.deviceType = "";
        this.detailObj = {};

    };

    //初始化
    SubPage.prototype.init = function () {


        this.id = neatNavigator.getUrlParam("id");
        this.deviceType = neatNavigator.getUrlParam("device_type");
        this.fillDataMethod = "processDeviceType" + this.deviceType + "Data";

        $("#dataContainer").html($("#deviceType" + this.deviceType + "Template").html());


        var that = this;
        //图片


        this._initDetail();




        form.render();

    };


    SubPage.prototype._initDetail = function () {
        var that = this;

        var loadingIndex = layer.load(1);

        pageDataApi.queryDeviceRealTimeData(neat.getUserToken(), this.id, this.deviceType
            , function (result) {
                that.detailObj = result;

                layer.close(loadingIndex);

                that[that.fillDataMethod]();


            }, function (failData) {
                layer.close(loadingIndex);
                layer.msg(failData.message, function () {

                    that._closeDialog();
                });

            });

    };


    //关闭对话框
    SubPage.prototype._closeDialog = function () {
        var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
        parent.layer.close(index); //再执行关闭
    };

    var deviceType = {
        //消防传输设备
        FireGateway : 1,
        //NEAT水网关
        NeatWaterGateway : 2,
        //一体式水源监测
        UnibodyWater : 3,
        //NB设备
        NB : 6,
        //消防主机
        FireHost :101,
        //neat水信号
        NEATWaterSignal: 201,
    }

    var commonDataPropertyName = {
        id: "id",
        code: "code",
        name: "name",
        deviceType: "deviceType",
        onlineStatus: "onlineStatus",
        alarmStatus: "alarmStatus",
        heartTime: "heartTime",
        pictureUrl: "pictureUrl",
    };


    //处理图片
    SubPage.prototype.processPicture = function (data) {

        $("#devicePic").attr("src", data+"&token="+encodeURIComponent(neat.getUserToken()));
    };
    //处理名称
    SubPage.prototype.processName = function (name,code) {

        var title = name;
        if(typeof(code) != "undefined"){
            title = title +"("+ code+")";
        }

        //名称
        $("#deviceName").text(name).attr("title",title);
    };

    //处理报警状态
    SubPage.prototype.processAlarmStatus = function (data) {
        //状态
        $("#alarmStatus").text(uiTools.getDeviceAlarmStatusTextByWord(data))
            .toggleClass("device_alarm_status_text_" + data);
    };

    //处理在线状态
    SubPage.prototype.processOnlineStatus = function (data) {
        
        var text = uiTools.getDeviceOnlineStatusText(data);

        if (!text) {
            text = "离线";
            data = 1;
        }
        //在线状态
        $("#onlineStatus").text(text)
             .toggleClass("device_online_status_text_" + data);


    };

    //处理 信号强度 状态
    SubPage.prototype.processSignalStatus = function (data) {

        var tag = $(uiTools.renderSignalStatus(data));

        //信号强度
        $("#signalStatus").addClass(tag.attr("class")).attr("title",tag.attr("title"));
    };

    //处理 剩余电量 状态
    SubPage.prototype.processBatteryStatus = function (data) {

        var unknown = "未知";
        var battery = uiTools.nullIF(data, "未知");
        if (battery !== unknown) {
            battery = battery + " %";
        }
        //电池
        $("#batteryStatus").text(battery);
    };
    //处理 最后通讯时间
    SubPage.prototype.processHeartTimeStatus = function (data) {

        var formatTime = layui.neatTools.shortenTimeStr(data);
        if (!formatTime) {
            formatTime = "未知";
        }
        $("#heartTime").text(formatTime);
    };
    
    //处理 信号数
    SubPage.prototype.processSignalCount = function (data) {

        $("#signalCount").text(data);
    };

    //处理 实时值
    SubPage.prototype.processRealTimeData = function (data) {
        if (typeof data === "undefined" || data == null) {
            data = "未知";
        }
        $("#realTimeData").text(data);
    };
    

    //消防传输设备
    SubPage.prototype.processDeviceType1Data = function () {

        var data = this.detailObj;

        this.processPicture(data[commonDataPropertyName.pictureUrl]);
        this.processName(data[commonDataPropertyName.name], data[commonDataPropertyName.code]);
        this.processAlarmStatus(data[commonDataPropertyName.alarmStatus]);

        this.processOnlineStatus(data[commonDataPropertyName.onlineStatus]);
        this.processHeartTimeStatus(data[commonDataPropertyName.heartTime]);


    };

    //消防主机
    SubPage.prototype.processDeviceType101Data = function () {

        var data = this.detailObj;

        this.processPicture(data[commonDataPropertyName.pictureUrl]);
        this.processName(data[commonDataPropertyName.name], data[commonDataPropertyName.code]);
        this.processAlarmStatus(data[commonDataPropertyName.alarmStatus]);

        this.processOnlineStatus(data[commonDataPropertyName.onlineStatus]);
        this.processHeartTimeStatus(data[commonDataPropertyName.heartTime]);
    };

    //NEAT水网关
    SubPage.prototype.processDeviceType2Data = function () {

        var data = this.detailObj;
        var dataPropertyNames = {
          
            signalStatus: "signalStatus",
            signalCount: "signalCount"
           
        };

        this.processPicture(data[commonDataPropertyName.pictureUrl]);
        this.processName(data[commonDataPropertyName.name], data[commonDataPropertyName.code]);
        this.processAlarmStatus(data[commonDataPropertyName.alarmStatus]);

        this.processOnlineStatus(data[commonDataPropertyName.onlineStatus]);
        this.processSignalCount(data[dataPropertyNames.signalCount]);
        this.processHeartTimeStatus(data[commonDataPropertyName.heartTime]);
    };

    //neat水信号
    SubPage.prototype.processDeviceType201Data = function () {
       
        var data = this.detailObj;
        var dataPropertyNames = {
          
            signalStatus: "signalStatus",
            realTimeValue:"realTimeValue"
        };

        this.processPicture(data[commonDataPropertyName.pictureUrl]);
        this.processName(data[commonDataPropertyName.name], data[commonDataPropertyName.code]);
        this.processAlarmStatus(data[commonDataPropertyName.alarmStatus]);

        this.processOnlineStatus(data[commonDataPropertyName.onlineStatus]);
        this.processRealTimeData(data[dataPropertyNames.realTimeValue]);
        this.processHeartTimeStatus(data[commonDataPropertyName.heartTime]);
        //realTimeData
    };

    //一体式水源监测
    SubPage.prototype.processDeviceType3Data = function () {

        var data = this.detailObj;

        var dataPropertyNames = {
          
            signalStatus: "signalStatus",
            realTimeValue: "realTimeValue"
        };

        this.processPicture(data[commonDataPropertyName.pictureUrl]);
        this.processName(data[commonDataPropertyName.name], data[commonDataPropertyName.code]);
        this.processAlarmStatus(data[commonDataPropertyName.alarmStatus]);

        this.processOnlineStatus(data[commonDataPropertyName.onlineStatus]);
        this.processSignalStatus(data[dataPropertyNames.signalStatus]);

        this.processRealTimeData(data[dataPropertyNames.realTimeValue]);

        this.processHeartTimeStatus(data[commonDataPropertyName.heartTime]);
    };

    //NB设备
    SubPage.prototype.processDeviceType6Data = function () {

        var data = this.detailObj;

        var dataPropertyNames = {
           
            signalStatus: "signalStatus",
           
            batteryStatus: "batteryStatus"
        };

        this.processPicture(data[commonDataPropertyName.pictureUrl]);
        this.processName(data[commonDataPropertyName.name], data[commonDataPropertyName.code]);
        this.processAlarmStatus(data[commonDataPropertyName.alarmStatus]);

        this.processOnlineStatus(data[commonDataPropertyName.onlineStatus]);

        this.processSignalStatus(data[dataPropertyNames.signalStatus]);
        this.processBatteryStatus(data[dataPropertyNames.batteryStatus]);
    };

    exports(MODULE_NAME, new SubPage());

});