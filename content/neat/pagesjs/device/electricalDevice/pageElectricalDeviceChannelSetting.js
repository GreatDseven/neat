//智慧用电网关 通道设置界面


layui.define(['jquery', 'layer', 'form', 'laytpl', 'element', 'table', 'neat', 'neatDataApi', 'electricalDeviceDataApi', 'neatNavigator', 'commonDataApi', 'neatValidators'], function (exports) {



    "use strict";
    var $ = layui.$;
    var MODULE_NAME = "pageElectricalDeviceChannelSetting";

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
        code: "gateWayCode",
        name:"gatewayName",
        uploadInterval: "timeOut",
        channelData:"componets"

    };

    // 通道数据包含的属性
    var channelDataPropertyNames = {
        id: "id",
        name: "code",
        type: "analogueType",
        min: "lowerLimitValue",
        max: "uperLimitValue"
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

        $("#btnCancel").on("click", function () {
            that.closeDialog();
        });
      

        this.initSave();

        form.render();

    };

    SubPage.prototype.initDetail = function () {
        var that = this;

        pageDataApi.getSettingsById(neat.getUserToken(), this.id
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
      

        $("#txtUploadInterval").val(that.detailObj[dataPropertyNames.uploadInterval]);


        this.renderTable(that.detailObj[dataPropertyNames.channelData]);


    };

    SubPage.prototype.renderTable = function (data) {


        $.each(data, function (_, item) {
            var ch = channelDataDic[item[channelDataPropertyNames.type]];
            item.typeName = ch.name + "(" + ch.unit + ")";//+"[" + ch.min + " - " + ch.max+"]";

        });

        var tmpl = '{{#  layui.each(d.data, function(index, item){}}'
            + '<tr data-channel-id="{{item.' + channelDataPropertyNames.id + '}}" data-channel-name="{{item.' + channelDataPropertyNames.name + '}}"  data-channel-type="{{item.' + channelDataPropertyNames.type + '}}">'
            + '<td><span class="channel-name">通道{{ item.' + channelDataPropertyNames.name + ' }}</span></td>'
            + '<td><span>{{ item.typeName}}</span></td>'
          
            + '<td><input type="text" class="layui-input max-value" value="{{item.' + channelDataPropertyNames.max + '}}" /></td>'
            + '<td><input type="text" class="layui-input min-value" value="{{item.' + channelDataPropertyNames.min + '}}" /></td>'
            + '</tr>'
            + '{{#  }); }}';

        var d = {};
        d.data = data;

        laytpl(tmpl).render(d, function (html) {
            $("#resultTable").html(html);
        });

    };



    //关闭对话框
    SubPage.prototype.closeDialog = function () {
        var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
        parent.layer.close(index); //再执行关闭
    };

 

    //校验
    SubPage.prototype.verify = function () {

        var result = {
            valid: false,
            timeout: 0,
            gatewayId:this.id,
            channels: [
              
            ]
        };

        var returnFun = function (ctl) {

            $(ctl).focus();
            $(ctl).select();

            return result;
        };


        var intervalStr = $("#txtUploadInterval").val();
        var interval = this.parseFloatValue(intervalStr);

        if (typeof interval === "undefined" || interval <= 0 || interval >= 2147483647) {
            layer.msg("周期频率错误!");           
            return returnFun($("#txtUploadInterval")[0]);
        }


        result.timeout = interval;

        var channels = $("tr[data-channel-id]");

        for (var i = 0; i < channels.length; i++) {
            var channel = $(channels[i]);
            var channelName = channel.find(".channel-name").html();
            var channelType = channel.data("channel-type");

            var channelValidator = channelDataDic[channelType];

            //校验上限值
            var maxCtl = channel.find(".max-value");
            var maxStr = maxCtl.val();

            var max = this.parseFloatValue(maxStr);
            if (typeof max === "undefined") {
                layer.msg(channelName + "的上限值不正确");
                return returnFun(maxCtl);
            }


            var minCtl = channel.find(".min-value");
            //校验下限值
            var minStr = minCtl.val();
            
            var min = this.parseFloatValue(minStr);
            if (typeof min === "undefined") {
                layer.msg(channelName + "的下限值不正确");
                return returnFun(minCtl);
            }
            if (min < 0) {
                layer.msg(channelName + "的下限值不正确,不能小于0");
                return returnFun(minCtl);
            }
                       

            //下限和上限比较
            if (max<=min) {
                layer.msg(channelName + "的上限值不能小于等于下限值");
                return returnFun(maxCtl);
            }

            var channlId = channel.data("channel-id");

            result.channels.push({
                id: channlId,
                lowerLimitValue: min,
                uperLimitValue: max
             
            });
        }

        result.valid = true;

        return result;
        

    };

    //解析为float
    SubPage.prototype.parseFloatValue = function (value) {

        if (typeof value === "undefined") {
            return undefined;
        }

        if (value.length === 0) {
            return undefined;
        }
        var v = parseFloat(value);
        if (isNaN(v) ||  v.toString() !== value) {
            return undefined;
        }

        return v;
    };
    //解析为int
    SubPage.prototype.parseIntValue = function (value) {

        if (typeof value === "undefined") {
            return undefined;
        }

        if (value.length === 0) {
            return undefined;
        }
        var v = parseInt(value);
        if (isNaN(v) ||  v.toString() !== value) {
            return undefined;
        }

        return v;
    };


    SubPage.prototype.initSave = function () {

        var that = this;

        $("#btnSave").on("click", function () {

            var validResult = that.verify();
            if (validResult.valid == false) {
                return;
            }

            $("#btnSave").attr("disabled", true);

            delete validResult.valid;

            var token = neat.getUserToken();

            pageDataApi.updateGatewayChannelConfig(token, validResult
                , function (sd) {


                    layer.msg("保存成功!", { time: 1500 }, function () {

                        that.closeDialog();

                    });
                }, function (fd) {

                    $("#btnSave").attr("disabled", false);

                    if (typeof fd.message === "string") {
                        layer.msg(fd.message);
                    }
                    else {
                        layer.msg("保存失败!");
                    }
                });

            return false;
        });
       


            
       
    };

    exports(MODULE_NAME, new SubPage());

});