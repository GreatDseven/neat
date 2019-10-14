//智慧用电网关 通道 屏蔽 设置界面


layui.define(['jquery', 'layer', 'form', 'laytpl', 'element', 'table', 'neat', 'neatDataApi', 'electricalDeviceDataApi', 'neatNavigator', 'commonDataApi', 'neatValidators'], function (exports) {



    "use strict";
    var $ = layui.$;
    var MODULE_NAME = "pageElectricalDeviceChannelMask";

    var form = layui.form;
    var laytpl = layui.laytpl;

    var layer = layui.layer;

    var neat = layui.neat;

    var table = layui.table;

    var neatDataApi = layui.neatDataApi;

    var neatNavigator = layui.neatNavigator;

    var commonDataApi = layui.commonDataApi;

    var pageDataApi = layui.electricalDeviceDataApi;

    var validators = layui.neatValidators;


    // 返回的数据包含的属性
    var dataPropertyNames = {
        id: "gatewayId",
        code: "code",
        name: "gatewayName",
        channelData: "channels"

    };

    // 通道数据包含的属性
    var channelDataPropertyNames = {
        id: "id",
        name: "code",
        type: "analogueType",
        mask: "isShield"
    };


    //存储通道信息的字典
    var channelDataDic = {};

    //获取chanell类型名称
    function initChannelDataDic() {
        var channelTypeConfig = commonDataApi.getElectricalDeviceChannelTypeConfigData();

        $.each(channelTypeConfig, function (_, item) {

            channelDataDic[item.id] = item;

        });
    }

    initChannelDataDic();


    var SubPage = function () {


        this.id = "";
        this.detailObj = {};

    };

    //初始化
    SubPage.prototype.init = function () {

        var that = this;


        this.id = neatNavigator.getUrlParam("id");

        this.initDetail();

        this.initButtonEvent();

        form.render();

    };

    SubPage.prototype.initDetail = function () {
        var that = this;

        pageDataApi.getChannelMaskSettingsById(neat.getUserToken(), this.id
            , function (result) {
                that.detailObj = result;

                that.fillForm();

            }, function (failData) {

                layer.msg(failData.message, function () {

                    that.closeDialog();
                });

            });
    };

    //把对象的值填充到界面
    SubPage.prototype.fillForm = function () {
        var that = this;


        $("#txtDeviceInfo").val(that.detailObj[dataPropertyNames.name] + "(" + that.detailObj[dataPropertyNames.code] + ")");


        this.renderTable(that.detailObj[dataPropertyNames.channelData]);


    };

    SubPage.prototype.renderTable = function (data) {

        var that = this;

        $.each(data, function (_, item) {
            var ch = channelDataDic[item[channelDataPropertyNames.type]];
            item.typeName = ch.name + "(" + ch.unit + ")";//+"[" + ch.min + " - " + ch.max+"]";

        });

        var tmpl = '{{#  layui.each(d.data, function(index, item){}}'
            + '<tr>'
            //通道列
            + '<td><span class="channel-name">通道{{ item.' + channelDataPropertyNames.name + ' }}</span></td>'
            //类型列
            + '<td ><span>{{ item.typeName}}</span></td>'

            + '{{# if(item.' + channelDataPropertyNames.mask + '){}}'
            // 屏蔽状态的 状态列
            + '     <td style="text-align:center;"><span class="status-text"> 屏蔽 <span></td>'
            // 屏蔽状态的 操作列
            + '     <td style="text-align:center;"><i data-channel-id="{{item.' + channelDataPropertyNames.id + '}}" class="fa fa-eye-slash ele-channel-mask ele-channel-masked"><i></td>'
            + '{{#}else{}}'
            // 未屏蔽状态的 状态列
            + '     <td style="text-align:center;"><span class="status-text"> - <span></td>'
            // 未屏蔽状态的 操作列
            + '     <td style="text-align:center;"><i data-channel-id="{{item.' + channelDataPropertyNames.id + '}}" class="fa fa-eye-slash ele-channel-mask"><i></td>'
            + '{{#} }}'

            + '</tr>'
            + '{{#  }); }}';

        var d = {};
        d.data = data;

        laytpl(tmpl).render(d, function (html) {
            $("#resultTable").html(html);
            $("#resultTable").find(".ele-channel-mask")
                .on("click", function () {
                    that.changeMaskStatusSingle(this);
                });
        });

    };

    //改变通道屏蔽状态
    SubPage.prototype.changeMaskStatusSingle = function (ctl) {

        var className = "ele-channel-masked";
        var oThis = $(ctl);
        var channelRow = oThis.parent().parent();
        var statusTextCtl = channelRow.find(".status-text");

        var channelId = oThis.data("channel-id");
        var newStatus = !oThis.hasClass(className);

        var sendData = [{
            id: channelId,
            isSheild: newStatus
        }];

        this.saveChange(sendData
            , function () {
                if (!newStatus) {
                    oThis.toggleClass(className, false);
                    oThis.attr("title", "点击屏蔽通道");
                    statusTextCtl.html("-");
                }
                else {
                    oThis.toggleClass(className, true);
                    statusTextCtl.html("屏蔽");
                    oThis.attr("title", "点击取消屏蔽");
                }
            }
            , function () {
                layer.msg("操作失败!");

            });





    };


    // 批量改变通道屏蔽状态
    SubPage.prototype.changeMaskStatusMulti = function (newMaskStatus, okCallback, failCallback) {
        var allChannels = $("#resultTable").find(".ele-channel-mask");

        var sendData = [];
        var className = "ele-channel-masked";

        //拼接 向后台发送的值
        $.each(allChannels, function (_, ch) {

            var oThis = $(ch);
            var channelRow = oThis.parent().parent();


            var channelId = oThis.data("channel-id");
            sendData.push({
                id: channelId,
                isSheild: newMaskStatus
            });
        });

        //调用后台方法,保存数据
        this.saveChange(sendData
            //保存成功后,修改页面元素
            , function () {
                $.each(allChannels
                    , function (_, ch) {

                        var oThis = $(ch);
                        var channelRow = oThis.parent().parent();
                        var statusTextCtl = channelRow.find(".status-text");
                        if (!newMaskStatus) {
                            oThis.toggleClass(className, false);
                            oThis.attr("title", "点击屏蔽通道");
                            statusTextCtl.html("-");
                        }
                        else {
                            oThis.toggleClass(className, true);
                            statusTextCtl.html("屏蔽");
                            oThis.attr("title", "点击取消屏蔽");
                        }


                    });
                okCallback();
            }
            , failCallback);

    };

    SubPage.prototype.saveChange = function (data, okCallback, failCallback) {
        pageDataApi.changeMaskSettings(neat.getUserToken(), data
            , okCallback
            , failCallback);
    };


    //关闭对话框
    SubPage.prototype.closeDialog = function () {
        var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
        parent.layer.close(index); //再执行关闭
    };


    SubPage.prototype.initButtonEvent = function () {

        var that = this;

        //全部屏蔽
        $("#btnMaskAll").on("click", function () {

            $("#btnMaskAll").attr("disabled", true);

            //批量屏蔽
            that.changeMaskStatusMulti(true
                , function () {
                    $("#btnMaskAll").attr("disabled", false);
                    layer.msg("屏蔽全部通道成功!");
                }
                , function () {
                    $("#btnMaskAll").attr("disabled", false);
                    layer.msg("屏蔽全部失败!");
                });


            return false;
        });

        //取消屏蔽
        $("#btnMaskNone").on("click", function () {

            $("#btnMaskNone").attr("disabled", true);

            //批量取消屏蔽
            that.changeMaskStatusMulti(false
                , function () {
                    $("#btnMaskNone").attr("disabled", false);
                    layer.msg("全部通道取消屏蔽成功!");
                }
                , function () {
                    $("#btnMaskNone").attr("disabled", false);
                    layer.msg("全部通道取消屏蔽失败!");
                });

            return false;
        });



    };

    exports(MODULE_NAME, new SubPage());

});