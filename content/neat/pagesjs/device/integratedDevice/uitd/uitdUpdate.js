layui.define(["jquery", 'form', 'table', 'laytpl', 'laypage', 'layer', 'commonDataApi', 'neatDataApi', 'neat', 'neatNavigator', 'integratedDeviceDataApi', 'neatValidators','neatUITools'], function (exports) {
    "use strict";

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
    var uiTools = layui.neatUITools;

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


        // 初始化表单
        that.initForm();

        // 初始化数据
        that.loadData();

        $('#btnCancel').click(function () {
            that.closeDialog();
        });
        //自动格式化地址码
        uiTools.initAutoFormatAddressCode("txtCode");

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
        domainId: "domainId",
        deviceId: "deviceId"
    };

    // 初始化数据
    SubPage.prototype.loadData = function () {
        var that = this;
        // 根据id 获取设备信息
        pageDataApi.getUITDById(base.getUserToken(), that.id, function (result) {


            that.detailObj = result;

            $("#txtCode").val(result[dataPropertyNames.code]);
            $("#txtName").val(result[dataPropertyNames.name]);

            //$("#optTransmissionProtocol").val(result.code);
            //$("#optMessageProtocol").val(result.code);
            //$("#optDeviceType").val(result.code);
            //$("#optManufacturer").val(result.code);

            $("#txtEnterpriseName").val(result[dataPropertyNames.enterpriseName]);
            //$("#optBuilding").val(result.code);
            //$("#optKeyPartList").val(result.code);



            // 绑定传输协议
            that.bindTransmissionProtocols();

            // 绑定报文协议
            that.bindMessageProtocols();

            // 绑定设备类型
            that.bindTransmissionDeviceTypes();


            // 绑定设备厂商
            that.bindManufacturers();

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

    

    // 实例化表单 （包含表单验证及提交）
    SubPage.prototype.initForm = function () {
        var that = this;
        // 表单验证 value：表单的值、item：表单的DOM对象
        form.verify({
            txtCode: function (value) {
                if (value.length == 0) {
                    return "请输入设备编码";
                }
                var errorMsg = pageValidate.validateDecCode6(value);
                if (errorMsg.length > 0) {
                    return errorMsg;
                }

            }, txtName: function (value) {
                if (value.length == 0) {
                    return "请输入设备名称";
                }


            }, optTransmissionProtocolList: function (value) {
                if (value.length == 0) {
                    return "请选择传输协议";
                }
            }, optMessageProtocol: function (value) {
                if (value.length == 0) {
                    return "请选择报文协议";
                }
            }, optDeviceType: function (value) {
                if (value.length == 0) {
                    return "请选择设备类型";
                }

            }, optManufacturer: function (value) {
                if (value.length == 0) {
                    return "请选择生产厂商";
                }
            }, optUseStatus: function (value) {
                if (value.length == 0) {
                    return "请选择使用状态";
                }
            }, txtAddr: function (value) {
                if (value.length == 0) {
                    return "请输入安装位置";
                }
            }
        });

        form.on('submit(btnSave)', function (data) {
            //console.log(data.elem) //被执行事件的元素DOM对象，一般为button对象
            //console.log(data.form) //被执行提交的form对象，一般在存在form标签时才会返回
            //console.log(data.field) //当前容器的全部表单字段，名值对形式：{name: value}

            $("#btnSave").attr("disabled", true);

            var uitdObj =
            {
                id: that.detailObj[dataPropertyNames.id],
                name: $.trim(data.field.txtName),
                code: $.trim(data.field.txtCode),
                transmissionProtocol: data.field.optTransmissionProtocolList,
                messageProtocol: data.field.optMessageProtocol,
                transportDeviceType: data.field.optDeviceType,
                manufacturer: data.field.optManufacturer,
                buildingId: data.field.optBuilding,
                keypartId: data.field.optKeyPartList,
                address: data.field.txtAddr,
                enterpriseId: that.detailObj[dataPropertyNames.enterpriseId],
                deviceID: that.detailObj[dataPropertyNames.deviceId]

            };

            pageDataApi.updateUITD(base.getUserToken(), uitdObj, function (result) {
                layer.msg("保存成功!", { time: 1500 }, function () {

                    $("#btnSave").attr("disabled", false);
                    that.closeDialog();
                });
            }, function (fd) {

                if (typeof fd.message === "string") {
                    layer.msg(fd.message);
                }
                else {
                    layer.msg("保存失败!");
                }

            });

            return false; //阻止表单跳转。如果需要表单跳转，去掉这段即可。
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
                $("#optBuilding").html(html);
                form.render('select', 'buildingForm');
            });

        });

    };

    // 初始化部位控件
    SubPage.prototype.initKeypartList = function () {
        var that = this;


        form.on('select(keypart)', function (data) {
            that.detailObj[dataPropertyNames.keypartId] = data.value;
        });

        this.bindKeypartList();
    };

    // 绑定部位数据
    SubPage.prototype.bindKeypartList = function () {
        var that = this;

        var token = base.getUserToken();

        if ( !that.detailObj[dataPropertyNames.buildingId]) {
            that.fillKeypartList({});
        }
        else {

            // 加载 重点部位数据
            commonDataApi.getKeypartByBuildingId(token, that.detailObj[dataPropertyNames.buildingId], function (resultData) {
                var d = {};
                d.data = resultData;
                d.selectedValue = that.detailObj[dataPropertyNames.keypartId];

                that.fillKeypartList(d);
            });
        }

    };

    SubPage.prototype.fillKeypartList = function (d) {
        laytpl($("#optKeyPartListTemplate").html()).render(d, function (html) {
            var parent = $("select[name=optKeyPartList]").html(html);
            form.render('select', 'keypartForm');
        });
    };



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
            var d = {};
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
            var d = {};
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

    exports("pageIntegratedUpdateUITD", new SubPage());
});