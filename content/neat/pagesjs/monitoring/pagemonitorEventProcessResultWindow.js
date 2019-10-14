//接处警处理页面
layui.define(['jquery', 'layer', 'form', 'neat', 'laytpl', 'neatUITools', 'neatNavigator', 'neatFileViewer', 'neatDataApi'], function (exports) {

    "use strict";
    var $ = layui.$;
    var MODULE_NAME = "pagemonitorEventProcessResultWindow";
    var laytpl = layui.laytpl;
    var form = layui.form;
    var uiTools = layui.neatUITools;
    var layer = layui.layer;
    var neatNavigator = layui.neatNavigator;
    var neat = layui.neat;

    var token = neat.getUserToken();

    var SubPage = function () { };


    //绑定警情处理数据接口
    SubPage.prototype.GetEventDetail = function (okCallback, failCallback) {
        var that = this;
        var url = "/OpenApi/EventHandler/GetEventDetail";

        var data = {
            token: token,
            eventId: that.eventId,
            deviceId: that.deviceId,
            deviceIdType: that.deviceIdType,
            systemCategory: that.systemCategory
        };

        layui.neatDataApi.sendGet(url, data, okCallback, failCallback);

    };

    SubPage.prototype.BindEventData = function () {
        var that = this;
       
        this.GetEventDetail(function (resultData) {
            //值
            $("#lbldeviceName").text(resultData.deviceName);//设备名称
            $("#lbldeviceCode").text(resultData.deviceCode);//设备编码
            $("#lbldeviceIdType").text(resultData.deviceIdTypeString);//设备类型
            $("#lblEnterpriseName").text(resultData.enterpriseName);//所属单位
            $("#lblbuildingName").text(resultData.buildingName);//所属建筑
            $("#lblkeypartName").text(resultData.keypartName);//所属部位
            $("#lbladdress").text(resultData.address);//安装位置

            //填充中间的警情信息
            that.fillAlarmInfo(resultData);

            //填充 最下面的 处理信息
            if (resultData.eventHandler != null) {
                $("#hiddeninfolayer").show();
                $("#spanHiddenDangerTime").text(resultData.eventHandler.handleTime);//处理时间
                $("#lblhandleUName").text(resultData.eventHandler.handleUName);//处理人
                $("#handleContent").text(resultData.eventHandler.handleContent);
                $("input[name=eventradio][value=" + resultData.eventHandler.handleResult + "]").attr("checked", true);
            
                if (resultData.eventHandler.uploadInfo != null) {
                    $("#medialayer").html(initwindowsinfo(resultData.eventHandler.uploadInfo));
                }

            }

            form.render(); //更新全部    
        }
            , function (fd) {
                var tthat = that;
                var msg = "获取数据发生错误!";
                if (typeof fd.message === "string") {
                    msg = fd.message;
                }
                layer.msg(msg, function () {
                    tthat._closeDialog();
                });
            });
    };
    function initwindowsinfo(data) {
        //实例化信息窗体
        var getTpl = $("#imgTemplate").html();
        return laytpl(getTpl).render(data);
    }

    //关闭对话框
    SubPage.prototype._closeDialog = function () {
        var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
        parent.layer.close(index); //再执行关闭
    };

    //填充警情信息
    SubPage.prototype.fillAlarmInfo = function (resultData) {
        //警情信息数据,用于填充到界面
        var d = {};
        d.alarmCategory = uiTools.renderDeviceAlarmStatusByWord(resultData.alarmCategoryStr);
        d.alarmContent = resultData.alarmDesc; //警情内容
        d.firstOccurTime = resultData.occurTime; //发生时间 或者 首次发生时间
        d.onlineStatus = uiTools.getDeviceOnlineStatusText(resultData.onlineStatus);////联网状态

        var templateId = "otherAlarmTemplate";

        if (this.systemCategory == "1") //水系统的
        {
            d.occurCount = resultData.times;//发生次数
            d.lastOccurTime = resultData.lastOccurTime;//末次发生时间

            if (resultData.alarmCategoryStr == "alarm") {//水报警

                d.threshold = resultData.threshold;//阈值
                d.currentValue = resultData.value;//当前值
                templateId = 'waterAlarmTemplate';
            }
            else {//水故障
                templateId = 'waterFaultTemplate';
            }

        }

        //拿模板生成html
        var getTpl = $("#" + templateId).html();
        var finalHtml = laytpl(getTpl).render(d);
        //把生成的html填充到容器中.
        $("#alarmInfoContainer").html(finalHtml);
    }

    //初始化
    SubPage.prototype.init = function () {
        var that = this;
        this.eventId = neatNavigator.getUrlParam("eventId");
        this.deviceId = neatNavigator.getUrlParam("deviceId");
        this.deviceIdType = neatNavigator.getUrlParam("deviceIdType");
        this.systemCategory = neatNavigator.getUrlParam("systemCategory");
        this.BindEventData();
    };
    exports(MODULE_NAME, new SubPage());
});