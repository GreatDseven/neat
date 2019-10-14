//一体式 水设备 详情 页面


layui.define(['jquery', 'layer', 'form', 'laytpl', 'element', 'table', 'neat', 'waterDeviceDataApi', 'neatNavigator', 'commonDataApi','neatValidators'], function (exports) {



    "use strict";
    var $ = layui.$;
    var MODULE_NAME = "pageUnibodyWaterGatewayDetail";

    var form = layui.form;
    var laytpl = layui.laytpl;

    var layer = layui.layer;

    var neat = layui.neat;

    var neatNavigator = layui.neatNavigator;

    var commonDataApi = layui.commonDataApi;

    var pageDataApi = layui.waterDeviceDataApi;

    var validators = layui.neatValidators;




    var SubPage = function () {

        this.Id = "";

        this.detailObj = {};

    };

    //初始化
    SubPage.prototype.init = function () {

        var that = this;

        this.Id = neatNavigator.getUrlParam("id");


        //建筑
        this.initBuildingList();

        this.initDeviceType();

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



    //初始化建筑列表
    SubPage.prototype.initBuildingList = function () {

        var that = this;

        form.on('select(optBuilding)', function (data) {
            //console.log(data.elem); //得到select原始DOM对象
            //console.log(data.value); //得到被选中的值
            //console.log(data.othis); //得到美化后的DOM对象

            that.detailObj[propertyNames.buildingId] = data.value;
            that.bindKeyPartList();

        });

    };

    //绑定建筑列表
    SubPage.prototype.bindBuildingList = function () {

        var that = this;

        //根据企业的id获取建筑列表,然后绑定到select中.
        commonDataApi.getBuildingByEntId(neat.getUserToken(), that.detailObj[propertyNames.enterpriseId], function (resultData) {
            that.fillBuildingList(resultData);
        });

    };

    //为建筑物列表填充数据
    SubPage.prototype.fillBuildingList = function (data) {
        var d = {};
        d.data = data;
        if (typeof this.detailObj[propertyNames.buildingId] !== "undefined"
            && this.detailObj[propertyNames.buildingId] != null) {
            d.selectedValue = this.detailObj[propertyNames.buildingId];
        }

        laytpl($("#optBuildingTemplate").html()).render(d, function (html) {
            var parent = $("#optBuilding").html(html);
            form.render('select', 'optBuildingForm');
        });
    };


    //绑定关键部位列表
    SubPage.prototype.bindKeyPartList = function () {

        var that = this;


        if (!that.detailObj[propertyNames.buildingId] ) {
            that.fillKeyPartList([]);
        }
        else {
            //根据企业的id获取建筑列表,然后绑定到select中.
            commonDataApi.getKeypartByBuildingId(neat.getUserToken(), that.detailObj[propertyNames.buildingId], function (resultData) {
                
                that.fillKeyPartList(resultData);
            });
        }
    };
    //向部位列表中填充数据
    SubPage.prototype.fillKeyPartList = function (data) {
        var that = this;
        var d = {};
        d.data = data;
        if (typeof this.detailObj[propertyNames.keypartId] !== "undefined"
            && this.detailObj[propertyNames.keypartId] != null) {
            d.selectedValue = this.detailObj[propertyNames.keypartId];
        }
        laytpl($("#optKeyPartListTemplate").html()).render(d, function (html) {
            var parent = $("#optKeyPartList").html(html);
            form.render('select', 'optKeyPartListForm');
        });
    };

    
    // 填充 生产厂商 列表
    SubPage.prototype.bindManufactorList = function () {

        var that = this;
        pageDataApi.getUnibodyWaterGatewayManufacture(neat.getUserToken(), function (resultData) {

            var d = {};
            d.data = resultData;
            d.selectedValue = that.detailObj[propertyNames.manufacturer];
            that.manufacturer = that.detailObj[propertyNames.manufacturer];
           
            laytpl($("#optManufacturerTemplate").html()).render(d, function (html) {
                var parent = $("#optManufacturer").html(html);
                form.render('select', 'optManufacturerForm');
            });
            that.setElementMode();
            that.bindConnectionTypeList();
        });
    };

    //根据厂商,调整页面显示
    SubPage.prototype.setElementMode = function () {

        var that = this;
        pageDataApi.getAllUnibodyWaterGatewayManufactures(neat.getUserToken(), function (allData) {
            if (that.manufacturer == allData.TOPSAIL.id) {
                $("#lblDeviceCode").html("设备编码");
                $("#divIMData").hide();
                $("#txtIMEI").val("");
                $("#txtIMSI").val("");

            } else if (that.manufacturer == allData.SENEX.id) {
                $("#lblDeviceCode").html("SIM卡号");
                $("#divIMData").show();
            }

        });
    };

    //绑定联网方式列表
    SubPage.prototype.bindConnectionTypeList = function () {

        var that = this;

        if (!that.manufacturer) {
            that.fillConnectionTypeList([]);
        }
        else {

            //根据厂商id获取联网方式列表,然后绑定到select中.
            pageDataApi.getUnibodyWaterGatewayConnectionType(neat.getUserToken(), that.manufacturer, function (resultData) {
                that.fillConnectionTypeList(resultData);
            });
        }
    };

    //为联网方式列表填充数据
    SubPage.prototype.fillConnectionTypeList = function (data) {
       
        var d = {};
        d.data = data;
        d.selectedValue = this.detailObj[propertyNames.connectionType];
        this.optConnectionType = this.detailObj[propertyNames.connectionType];
       
        laytpl($("#optConnectionTypeTemplate").html()).render(d, function (html) {
            var parent = $("#optConnectionType").html(html);
            form.render('select', 'optConnectionTypeForm');
        });
    };

    // 绑定液压/液位
    SubPage.prototype.initDeviceType = function () {
        var that = this;
        form.on("select(optDeviceType)", function (data) {

            that.detailObj[propertyNames.deviceType] = data.value;
            that.bindUnitList();
        });

      

    };

    // 绑定液压/液位
    SubPage.prototype.bindDeviceType = function () {

        var that = this;
        commonDataApi.getDeviceTypeData(neat.getUserToken(), function (resultData) {
            var d = {};
            d.data = resultData;
            if (typeof that.detailObj[propertyNames.deviceType] !== "undefined"
                && that.detailObj[propertyNames.deviceType] != null) {
                d.selectedValue = that.detailObj[propertyNames.deviceType];
            }
            laytpl($("#optDeviceTypeTemplate").html()).render(d, function (html) {
                var parent = $("#optDeviceType").html(html);
                form.render('select', 'optDeviceTypeForm');
            });
        });

    };


    //绑定模拟量单位列表
    SubPage.prototype.bindUnitList = function () {

        var that = this;

        if (!that.detailObj[propertyNames.deviceType]) {
            that.fillUnitList([]);
        }
        else {

            //根据企业的id获取建筑列表,然后绑定到select中.
            commonDataApi.getUnitListByDeviceType(neat.getUserToken(), that.detailObj[propertyNames.deviceType], function (resultData) {
                that.fillUnitList(resultData);
            });
        }
    };

    //为模拟量单位列表填充数据
    SubPage.prototype.fillUnitList = function (data) {
        var that = this;
        var d = {};
        d.data = data;
        if (typeof this.detailObj[propertyNames.unit] !== "undefined" && this.detailObj[propertyNames.unit] != null) {
            d.selectedValue = this.detailObj[propertyNames.unit];
        }
        laytpl($("#optUnitTemplate").html()).render(d, function (html) {
            var parent = $("#optUnit").html(html);
            form.render('select', 'optUnitForm');
        });
    };

    //获取原有的数据项
    SubPage.prototype.initDetail = function () {

        var that = this;

        var loadingIndex = layer.load(1);

        pageDataApi.getUnibodyWaterGatewayById(neat.getUserToken(), this.Id
            , function (data) {
                that.detailObj = data;
                that.fillObjectData();
                layer.close(loadingIndex);
            }
            , function () {
                layer.close(loadingIndex);
            });
    };

    //把原有数据填充到界面
    SubPage.prototype.fillObjectData = function () {

        $("#txtCode").val(this.detailObj[propertyNames.code]);
        $("#txtName").val(this.detailObj[propertyNames.name]);

        //厂商
        this.bindManufactorList();

        $("#txtIMEI").val(this.detailObj[propertyNames.imei]);
        $("#txtIMSI").val(this.detailObj[propertyNames.imsi]);

        $("#txtEnterpriseName").val(this.detailObj[propertyNames.enterpriseName]);
        //建筑optBuilding
        this.bindBuildingList();

        //部位 optKeyPartList
        this.bindKeyPartList();

        $("#txtAddr").val(this.detailObj[propertyNames.address]);

        //设备类型 液压液位 optDeviceType
        this.bindDeviceType();
        //单位 optUnit
        this.bindUnitList();

        //$("#txtMaxValue").val(this.detailObj[propertyNames.maxValue]);
        //$("#txtMinValue").val(this.detailObj[propertyNames.minValue]);
      
    };

    var propertyNames = {
        "id": "id",
        "code": "code",
        "name": "name",
        "enterpriseId": "enterpriseId",
        "manufacturer": "manufacturer",
        "enterpriseName": "enterpriseName",
        "buildingId": "buildingId",
        "keypartId": "keypartId",
        "address": "address",
        "deviceType": "deviceType",
        "unit": "unit",
        "maxValue": "maximum",
        "minValue": "minimum",
        "connectionType": "connectionType",
        "imei": "imei",
        "imsi":"imsi"
        
    };





    exports(MODULE_NAME, new SubPage());

});