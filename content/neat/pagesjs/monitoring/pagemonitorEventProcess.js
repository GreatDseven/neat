//接处警处理页面
layui.define(['jquery', 'layer', 'form', 'laytpl', 'neat', 'neatUITools', 'neatNavigator', 'commonDataApi', 'neatValidators', 'monitorEventProcessDataApi'], function (exports) {

    "use strict";
    var $ = layui.$;
    var MODULE_NAME = "pagemonitorEventProcess";

    var form = layui.form;
    var laytpl = layui.laytpl;
    var uiTools = layui.neatUITools;
    var layer = layui.layer;

    var neat = layui.neat;

    var neatNavigator = layui.neatNavigator;
    var token = neat.getUserToken();
    var commonDataApi = layui.commonDataApi;
    var monitorEventProcessDataApi = layui.monitorEventProcessDataApi;
    var validators = layui.neatValidators;

    var SubPage = function () { };

    //关闭对话框
    SubPage.prototype._closeDialog = function () {
        var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
        parent.layer.close(index); //再执行关闭
    };
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

    //绑定警情处理数据接口
    SubPage.prototype.BindEventProcessData = function () {
        var that = this;
        monitorEventProcessDataApi.BindEventProcessData(token, that.eventId, that.deviceId, that.deviceIdType, that.systemCategory, function (d) {

            $("#devicePic").attr("src", d.pictureUrl + "&token=" + token);
            $("#enterpriseName").val(d.enterpriseName);
            $("#leader").val(d.leader);
            $("#telephone").val(d.telephone);
            $("#address").val(d.address);
            $("#CurrentUsername").val(neat.getCurrentUserInfo());
            $("#deviceName").text(d.name);
            var onlinestr = uiTools.getDeviceOnlineStatusText(d.onlineStatus);
            //事件状态
            $("#alarmStatusspan").append(uiTools.renderDeviceAlarmStatusByWord(d.alarmStatus));
            that.GetEventDetail(function (resultData) {
                var desstr = resultData.occurTime + " ";
                //水网关
                if (that.deviceIdType == 1 && that.systemCategory == 1) {
                    $("#onlineStatus").text(onlinestr);
                    $("#onlineStatusspan").show();
                    desstr += !resultData.keypartName ? "" : ("，" + resultData.keypartName) + "，发生 " + resultData.alarmDesc  + resultData.times + "次，当前值为" + resultData.value + "末次报警时间为" + resultData.lastOccurTime + "，请立即处理";
                }
                    //水信号
                else if (that.deviceIdType == 3 && that.systemCategory == 1) {
                    $("#currentValue").text(d.currentValue);
                    $("#onlineStatus").text(onlinestr);
                    desstr += !resultData.keypartName ? "" : ("，" + resultData.keypartName) + "，发生 " + resultData.alarmDesc  + resultData.times + "次，当前值为" + resultData.value + "末次报警时间为" + resultData.lastOccurTime + "，请立即处理";
                    $("#currentValuespan").show();
                    $("#onlineStatusspan").show();
                }
                    //NB设备
                else if (that.deviceIdType == 3 && (that.systemCategory == 10 || that.systemCategory == 11 || that.systemCategory == 12)) {
                    $("#onlineStatus").text(onlinestr);

                    //信号强度
                    var html = $(uiTools.renderSignalStatus(d.signalStatus)).css({ "display": "inline-block", "height": "16px", "width": "32px" })[0].outerHTML;
                    $("#signalStatus").html(html);

                    //$("#signalStatus").text(d.signalStatus + "dBm");
                    $("#batteryStatus").text(d.batteryStatus + "%");
                    desstr += resultData.address + " ，发生" + resultData.alarmDesc + "，请立即处理";
                    $("#onlineStatusspan").show();
                    $("#signalStatusspan").show();
                    $("#batteryStatusspan").show();
                    //智慧用电
                } else if (that.systemCategory == 13 && that.deviceIdType == 3) {
                    desstr += resultData.address + " 【" + resultData.uitdName + "】，发生" + resultData.alarmDesc + "，请立即处理";
                }
                else {
                    //火器件
                    if (that.deviceIdType == 3) {

                        desstr += resultData.address + " 【" + resultData.uitdName + "】 下属 【" + resultData.hostName + "】 的器件 ，发生" + resultData.alarmDesc + "，请立即处理";
                    }
                    //火系统  主机
                    if (that.deviceIdType == 2) {
                        $("#onlineStatus").text(onlinestr);
                        desstr += resultData.address + " ，发生" + resultData.alarmDesc + "，请立即处理";
                        $("#onlineStatusspan").show();
                    }
                    //UITD 传输装置
                    if (that.deviceIdType == 1) {
                        $("#onlineStatus").text(onlinestr);
                        desstr += resultData.address + " ，发生" + resultData.alarmDesc + "，请立即处理";
                        $("#onlineStatusspan").show();
                    }
                }
                $("#AlarmDes").text(desstr);
            });



        }, function (fd) {
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

    //form表单校验
    SubPage.prototype._initFormVerify = function () {
        form.verify({
            //domainName: function (value) {
            //    if (value.length == 0) {
            //        return "请输入中心名称";
            //    } else if (value.length > 64) {
            //        return "中心名称(最长64个字)";
            //    }
            //},
            //}

        });
    }


    //表单提交事件
    SubPage.prototype._initFormSubmit = function () {

        var that = this;
        form.on('submit(btnSave)', function (formData) {
            //"EventId": "",
            //"HandleResult": "3",
            //"HandleContent": "警情处理输入内容:系统测试",
            //"AlarmSystemCategory": "1"
            if (formData.field.HandleContent.length > 125) {
                layer.msg("处理说明字数超出系统限制.");
                return false;
            }
            if (formData.field.eventradio === undefined) {
                layer.msg("请选择处理结果");
                return false;
            }
            $("#btnSave").attr("disabled", true);

            var postData = {
                EventId: that.eventId,
                HandleResult: $.trim(formData.field.eventradio),
                HandleContent: $.trim(formData.field.HandleContent),
                AlarmSystemCategory: that.systemCategory

            };

            monitorEventProcessDataApi.HandleEventProcessData(token, postData
                , function (sd) {//成功

                    layer.msg("处理成功!", { time: 1500 }, function () {

                        that._closeDialog();

                    });

                }, function (fd) {//失败
                    $("#btnSave").attr("disabled", false);


                    if (typeof fd.message === "string") {
                        layer.msg(fd.message);
                    }
                    else {
                        layer.msg("处理失败!");
                    }

                });

            return false;
        });
    };

    //初始化
    SubPage.prototype.init = function () {

        var that = this;
        $("#btnCancel").on("click", function () {
            that._closeDialog();
        });

        form.on('radio(eventradio)', function (data) {
            $("#HandleContent").val(data.elem.title);
        });

        this.eventId = neatNavigator.getUrlParam("eventId");
        this.deviceId = neatNavigator.getUrlParam("deviceId");
        this.deviceIdType = neatNavigator.getUrlParam("deviceIdType");
        this.systemCategory = neatNavigator.getUrlParam("systemCategory");
        this.BindEventProcessData();


        that._initFormVerify();

        that._initFormSubmit();

    };
    exports(MODULE_NAME, new SubPage());
});