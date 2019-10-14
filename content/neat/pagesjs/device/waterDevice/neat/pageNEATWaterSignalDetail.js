//neat水信号 查看 页面


layui.define(['jquery', 'layer', 'form', 'laytpl', 'element', 'table', 'neat', 'waterDeviceDataApi', 'neatNavigator', 'commonDataApi','neatValidators'], function (exports) {



    "use strict";
    var $ = layui.$;

    var MODULE_NAME = "pageNEATWaterSignalDetail";

    var form = layui.form;
    var laytpl = layui.laytpl;

    var layer = layui.layer;

    var neat = layui.neat;

    var neatNavigator = layui.neatNavigator;

    var commonDataApi = layui.commonDataApi;

    var pageDataApi = layui.waterDeviceDataApi;

    var validators = layui.neatValidators;


    var SubPage = function () {


        this.signalId = "";

        this.detailObj = {};

    };

    //初始化
    SubPage.prototype.init = function () {
        var that = this;

        this.signalId = neatNavigator.getUrlParam("signal_id");

        



        //初始化设备类型 液压 /液位
        this.bindSignalValueType();

        //初始化信号类型选择改变事件
        this.initSignalValueTypeChangeEvent();

        //初始化 设备类型选择改变事件
        this.initYCSignalDeviceTypeChanageEvent();

        // 模拟量配置时使用.
        // 不勾选时,禁用后面的texbox,勾选时,启用后面的texbox
        this.initChangeDisableStateEvent();

        //单位 选择改变
        this.initYCUnitChangeEvent();

        //绑定单位
        this.bindYCUnitList();

        this.initDetail();




        $("#btnCancel").on("click", function () {
            that.closeDialog();
        });



        form.render();

    };





    //关闭对话框
    SubPage.prototype.closeDialog = function () {
        var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
        parent.layer.close(index); //再执行关闭
    };



    // 绑定液压/液位
    SubPage.prototype.bindSignalValueType = function () {

        var that = this;
       
        commonDataApi.getDeviceTypeData(neat.getUserToken(),  function (resultData) {
            var d = {};
            d.data = resultData;


            if (typeof that.detailObj[propertyNames.ycdetail] !== "undefined" && that.detailObj[propertyNames.ycdetail] != null) {
                d.selectedValue = that.detailObj[propertyNames.ycdetail][ycPropertyNames.signalValueType];
            }
           
            laytpl($("#optDeviceTypeTemplate").html()).render(d, function (html) {
                var parent = $("#optDeviceType").html(html);
                form.render('select', 'optDeviceTypeForm');
            });
        });
        
    };

    //初始化信号类型选择改变事件
    SubPage.prototype.initSignalValueTypeChangeEvent = function () {
        var that = this;
        form.on("radio(signalValueType)", function (data) {

            that.detailObj[propertyNames.signalType] = data.value;

            if (data.value === "YX") {
                $("#ycconfig").hide();
                $("#yxconfig").show();
            }
            else {
                $("#yxconfig").hide();
                $("#ycconfig").show();
            }

        });

    };


    //设备类型选择改变事件
    SubPage.prototype.initYCSignalDeviceTypeChanageEvent = function () {
        var that = this;
        form.on("select(optDeviceType)", function (data) {

            that.detailObj[propertyNames.ycdetail][ycPropertyNames.signalValueType] = data.value;
            that.bindYCUnitList();
        });

    };

    //绑定模拟量单位列表
    SubPage.prototype.bindYCUnitList = function () {

        var that = this;

        var yctype = undefined;


        if (that.detailObj[propertyNames.ycdetail] != null) {
            yctype= that.detailObj[propertyNames.ycdetail][ycPropertyNames.signalValueType];
        }


        if (typeof yctype === "undefined") {
            that.fillYCUnitList([]);
        }
        else {

            //根据企业的id获取建筑列表,然后绑定到select中.
            commonDataApi.getUnitListByDeviceType(neat.getUserToken()
                , yctype
                , function (resultData) {
                that.fillYCUnitList(resultData);
            });
        }
    };

    //为模拟量单位列表填充数据
    SubPage.prototype.fillYCUnitList = function (data) {
        var that = this;
        var d = {};
        d.data = data;
        if (typeof this.detailObj[propertyNames.ycdetail] !== "undefined" && this.detailObj[propertyNames.ycdetail] != null) {
            d.selectedValue = this.detailObj[propertyNames.ycdetail][ycPropertyNames.unit];
        }
        
        laytpl($("#optUnitTemplate").html()).render(d, function (html) {
            var parent = $("#optUnit").html(html);
            form.render('select', 'optUnitForm');

            that.fillUnitLables();
        });
    };

    //单位 选择改变
    SubPage.prototype.initYCUnitChangeEvent = function () {
        var that = this;
        form.on("select(optUnit)", function (data) {
            that.fillUnitLables();
        });

    };

    SubPage.prototype.fillUnitLables = function () {
        var checkText = $("#optUnit").find("option:selected").text()
        $("label[name='unitLabel']").html(checkText);
    };

    // 模拟量配置时使用.
    // 不勾选时,禁用后面的texbox,勾选时,启用后面的texbox
    SubPage.prototype.initChangeDisableStateEvent = function () {

        function changeState(data, id) {
            if (data.value == "on") {

                $("#" + id).val("");
                $("#" + id).removeAttr("disabled");
                $("#" + id).toggleClass("layui-disabled", false);
            }
            else {
                $("#" + id).attr("disabled", true);
                $("#" + id).toggleClass("layui-disabled", true);
            }
        }


        form.on("checkbox(hl2AlarmFlag)", function (data) {

            changeState(data, "txtHL2AlarmValue")

        });
        form.on("checkbox(hl1AlarmFlag)", function (data) {
            changeState(data, "txtHL1AlarmValue")
        });
        form.on("checkbox(ll1AlarmFlag)", function (data) {
            changeState(data, "txtLL1AlarmValue")
        });
        form.on("checkbox(ll2AlarmFlag)", function (data) {
            changeState(data, "txtLL2AlarmValue")
        });
    };

    var signalPropertyNames = {
        signalID: "signalID",
        code: "code",
        name: "name",
        address: "address",
        signalType: "signalType",
        ycdetail: "ycdetail",
        yxdetail: "yxdetail",
        deviceId:"deviceId"
    };


    var gatewayPropertyNames = {
        id: "id",
        code: "code",
        name: "name",
        domainId: "domainId",
        enterpriseId: "entId",
        buildingId: "buildingId",
        keypartId: "keypartId",
        address: "address",
        enterpriseName: "entName",
        buildingName: "buildingName",
        keypartName: "keypartName",
        status: "status",
        heartTime: "heartTime"
    };

    SubPage.prototype.initDetail = function () {

        var that = this;

        var loadingIndex = layer.load(1);

        pageDataApi.getNEATWaterSignalDetailById(neat.getUserToken(), this.signalId
            , function (data) {
                that.detailObj = data;
                that.fillObjectData();
                    
                pageDataApi.getNEATWaterGatewayById(neat.getUserToken(), that.detailObj[signalPropertyNames.deviceId]
                    , function (gatewayData) {

                        $("#txtGatewayCode").val(gatewayData[gatewayPropertyNames.name]);
                        $("#txtGatewayName").val(gatewayData[gatewayPropertyNames.code]);
                        layer.close(loadingIndex);
                    }
                    , function () {
                        layer.close(loadingIndex);

                    })

                
            }
            , function () {
                layer.close(loadingIndex);
            });
    };
    var propertyNames = {
        signalID: "signalID",
        code: "code",
        name: "name",
        address: "address",
        signalType: "signalType",
        systemCode: "systemCode",
        ycdetail: "ycdetail",
        yxdetail: "yxdetail"
    };
    var ycPropertyNames = {
        signalValueType: "signalValueType",
        unit: "unit",
        maxValue: "maxValue",
        minValue: "minValue",
        hl2value: "hl2value",
        hl1value: "hl1value",
        ll1value: "ll1value",
        ll2value: "ll2value",
    };

       
    var yxPropertyNames = {
        trueLabel: "trueLabel",
        trueAlarm:"trueAlarm",
        falseLabel:"falseLabel" ,
        falseAlarm:"falseAlarm" 
    };

    SubPage.prototype.fillObjectData = function () {


        $("#txtSignalCode").val(this.detailObj[propertyNames.code]);
        $("#txtSignalName").val(this.detailObj[propertyNames.name]);
        $("#txtAddr").val(this.detailObj[propertyNames.address]);

        if (this.detailObj[propertyNames.signalType] == "YC") {
            //模拟量
            $("#YCSignal").attr("checked", true);

            form.render("radio", "signalValueTypeForm");

            $("#ycconfig").show();


            //设备类型
            this.bindSignalValueType();
            //单位
            this.bindYCUnitList();
            //最大值
            $("#txtMaxValue").val(this.detailObj[propertyNames.ycdetail][ycPropertyNames.maxValue]);
            //最小值
            $("#txtMinValue").val(this.detailObj[propertyNames.ycdetail][ycPropertyNames.minValue]);


            var setValue = function(value, checkboxId, textBoxId, formId) {

                if (typeof value !== "undefined") {
                    $("#" + checkboxId).attr("checked",true);
                    $("#" + textBoxId).val(value)
                        .toggleClass("layui-disabled", false);
                }
                else {
                    $("#" + checkboxId).removeAttr("checked");
                    $("#" + textBoxId).val("")
                        .toggleClass("layui-disabled", true);
                }
                form.render(null,formId);
            }

            setValue(this.detailObj[propertyNames.ycdetail][ycPropertyNames.hl2value], "hl2AlarmFlag", "txtHL2AlarmValue", "hl2AlarmForm");
            setValue(this.detailObj[propertyNames.ycdetail][ycPropertyNames.hl1value], "hl1AlarmFlag", "txtHL1AlarmValue", "hl1AlarmForm");
            setValue(this.detailObj[propertyNames.ycdetail][ycPropertyNames.ll1value], "ll1AlarmFlag", "txtLL1AlarmValue", "ll1AlarmForm");
            setValue(this.detailObj[propertyNames.ycdetail][ycPropertyNames.ll2value], "ll2AlarmFlag", "txtLL2AlarmValue", "ll2AlarmForm");

            
        }
        else {
            //开关量 数字量
            $("#YXSignal").attr("checked", true);
            form.render("radio", "signalValueTypeForm");
            $("#yxconfig").show();
            
            $("#txtFalseLabel").val(this.detailObj[propertyNames.yxdetail][yxPropertyNames.falseLabel]);
            $("#txtTrueLabel").val(this.detailObj[propertyNames.yxdetail][yxPropertyNames.trueLabel]);

            if (this.detailObj[propertyNames.yxdetail][yxPropertyNames.falseAlarm]) {
                $("#falseAlarmFlag").attr("checked", true);
            }
            else {
                $("#falseAlarmFlag").removeAttr("checked");
            }

            form.render(null, "falseValueForm");

            if (this.detailObj[propertyNames.yxdetail][yxPropertyNames.trueAlarm]) {
                $("#trueAlarmFlag").attr("checked", true);
            }
            else {
                $("#trueAlarmFlag").removeAttr("checked");
            }

            form.render(null, "trueValueForm");
        }
       
    };


    



    exports(MODULE_NAME, new SubPage());

});