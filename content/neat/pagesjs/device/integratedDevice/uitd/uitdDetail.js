layui.define(["jquery", 'form', 'table', 'laytpl', 'laypage', 'layer', 'commonDataApi', 'neatDataApi', 'neat', 'neatNavigator', 'integratedDeviceDataApi', 'neatValidators'], function (exports) {

    "use strict";
    var MODULE_NAME = "pageIntegratedDetailUITD";

    var $ = layui.$;
    var table = layui.table;
    var form = layui.form;
    var laytpl = layui.laytpl;
    var laypage = layui.laypage;
    var commonDataApi = layui.commonDataApi;
    var neatDataApi = layui.neatDataApi;
    var neatNavigator = layui.neatNavigator;
    var base = layui.neat;
    var pageDataApi = layui.integratedDeviceDataApi;
    var pageValidate = layui.neatValidators;

    var SubPage = function () {
        this.id = '';
        this.selectedBuildingId = '';
        this.selectKeypartId = '';
        this.entId = '';
        this.detailObj = {};

    };

    // 初始化数据及事件
    SubPage.prototype.init = function () {
        var that = this;
        that.id = neatNavigator.getUrlParam("uitd_id");

        // 初始化数据
        that.loadData();

        $('#btnCancel').click(function () {
            that.closeDialog();
        });

        // 刷新form
        form.render();
    };


    var dataPropertyNames = {
        id: "id",
        code: "code",
        name: "name",
        transmissionProtocolId: "transmissionProtocol",
        messageProtocolId: "messageProtocol",
        deviceTypeId: "deviceType",
        manufacturerId: "manufacturer",
        enterpriseId: "enterpriseId",
        enterpriseName: "enterpriseName",
        buildingId: "buildingId",
        keypartId: "keypartId",
        address: "address",
        domainId: "domainId"
    };

  

    // 初始化数据
    SubPage.prototype.loadData = function () {
        var that = this;
        // 根据id 获取设备信息
        pageDataApi.getUITDById(base.getUserToken(), that.id, function (result) {

            that.detailObj = result;

            $("#txtCode").val(result[dataPropertyNames.code]);
            $("#txtName").val(result[dataPropertyNames.name]);

            // 绑定传输协议
            that.bindTransmissionProtocols();

            // 绑定报文协议
            that.bindMessageProtocols();

            // 绑定设备类型
            that.bindTransmissionDeviceTypes();


            // 绑定设备厂商
            that.bindManufacturers();

            $("#txtEnterpriseName").val(result[dataPropertyNames.enterpriseName]);

            // 初始化建筑物数据
            that.initBuilding();

            // 初始化部位数据
            that.initKeypartList();

            $("#txtAddr").val(result[dataPropertyNames.address]);

            form.render();


        }, function (failData) {

            layer.msg(failData.message, function () {

                that.closeDialog();
            });

        });
    };

  

    // 初始化建筑数据
    SubPage.prototype.initBuilding = function () {
        var that = this;

        form.on('select(optBuilding)', function (data) {
            that.detailObj[dataPropertyNames.buildingId] = data.value;
            // 绑定部件数据
            that.bindKeypartList();
        });


        var token = base.getUserToken();
        commonDataApi.getBuildingByEntId(token, that.detailObj[dataPropertyNames.enterpriseId], function (resultData) {

            var d = {};
            d.data = resultData;
            d.selectedValue = that.detailObj[dataPropertyNames.buildingId];

            laytpl($("#optBuildingTemplate").html()).render(d, function (html) {
                var parent = $("#optBuilding").html(html);
                form.render('select', 'optBuildingForm');
            });

        });

    };

    // 初始化部位控件
    SubPage.prototype.initKeypartList = function () {
        var that = this;


        form.on('select(optKeyPartList)', function (data) {
            that.detailObj[dataPropertyNames.keypartId] = data.value;
        });

        this.bindKeypartList();
    }

    // 绑定部位数据
    SubPage.prototype.bindKeypartList = function () {
        var that = this;

        if (!that.detailObj[dataPropertyNames.buildingId]) {
            return;
        }
        var token = base.getUserToken();

        // 加载 重点部位数据
        commonDataApi.getKeypartByBuildingId(token, that.detailObj[dataPropertyNames.buildingId], function (resultData) {
            var d = {};
            d.data = resultData;
            d.selectedValue = that.detailObj[dataPropertyNames.keypartId];
            laytpl($("#optKeyPartListTemplate").html()).render(d, function (html) {
                var parent = $("#optKeyPartList").html(html);
                form.render('select', 'optKeyPartListForm');
            });
        });

    }



    // 绑定传输协议
    SubPage.prototype.bindTransmissionProtocols = function () {
        var that = this;
        commonDataApi.getUITDTransmissionProtocols(base.getUserToken(), function (result) {
            var d = {}
            d.data = result;
            d.selectedValue = that.detailObj[dataPropertyNames.transmissionProtocolId];
            laytpl($("#optTransmissionProtocolTemplate").html()).render(d, function (html) {
                $("#optTransmissionProtocol").html(html);
                form.render('select', 'transmissionProtocolForm');
            });
        });
    };

    // 绑定报文协议
    SubPage.prototype.bindMessageProtocols = function () {
        var that = this;
        commonDataApi.getUITDMessageProtocols(base.getUserToken(), function (result) {
            var d = {}
            d.data = result;
            d.selectedValue = that.detailObj[dataPropertyNames.messageProtocolId];

            laytpl($("#optMessageProtocolTemplate").html()).render(d, function (html) {
                $("#optMessageProtocol").html(html);
                form.render('select', 'optMessageProtocolForm');
            });
        });
    };

    // 绑定传输设备类型
    SubPage.prototype.bindTransmissionDeviceTypes = function () {
        var that = this;
        commonDataApi.getTransmissionDeviceTypes(base.getUserToken(), function (result) {
            var d = {}
            d.data = result;
            d.selectedValue = that.detailObj[dataPropertyNames.deviceTypeId];

            laytpl($("#optTransmissionDeviceTypeTemplate").html()).render(d, function (html) {
                var parent = $("#optDeviceType").html(html);
                form.render('select', 'optDeviceTypeForm');
            });
        });
    };

    // 绑定设备厂商   
    SubPage.prototype.bindManufacturers = function () {
        var that = this;
        pageDataApi.queryUITDManufacturers(base.getUserToken(),
            function (result) {
                var d = {}
                d.data = result;
                d.selectedValue = that.detailObj[dataPropertyNames.manufacturerId];

                laytpl($("#optDeviceManufacturerTemplate").html()).render(d, function (html) {
                    $("#optManufacturer").html(html);
                    form.render('select', 'optManufacturerForm');
                });
            },
            function () { //失败
                //layer.msg("查询设备厂商发生错误!");
            });
    };

    //关闭对话框
    SubPage.prototype.closeDialog = function () {
        var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
        parent.layer.close(index); //再执行关闭
    };

    exports(MODULE_NAME, new SubPage());
});