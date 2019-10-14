//一体式 水设备 修改 页面


layui.define(['jquery', 'layer', 'form', 'laytpl', 'element', 'table', 'neat', 'waterDeviceDataApi', 'neatNavigator', 'commonDataApi', 'neatValidators', "neatGisSelector"], function (exports) {



    "use strict";
    var $ = layui.$;
    var MODULE_NAME = "pageUnibodyWaterGatewayUpdate";

    var form = layui.form;
    var laytpl = layui.laytpl;

    var layer = layui.layer;

    var neat = layui.neat;

    var neatNavigator = layui.neatNavigator;

    var commonDataApi = layui.commonDataApi;

    var pageDataApi = layui.waterDeviceDataApi;

    var validators = layui.neatValidators;

    var gisSelector = layui.neatGisSelector;


    var SubPage = function () {

        this.Id = "";

        this.detailObj = {};

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
        "imsi": "imsi",
        "gisAddress": "gisAddress",
        "latitude": "latitude",
        "longitude": "longitude",
    };

    //初始化
    SubPage.prototype.init = function () {

        var that = this;

        //获取所有联网方式数据,方便对界面元素进行针对性验证
        that.getAllUnibodyWaterGatewayConnectionTypes();

        that.Id = neatNavigator.getUrlParam("id");

        that.initBuildingList();
        that.initDeviceType();
        that.initDetail();

        that._initGisBrowse();

        $("#btnCancel").on("click", function () {
            that.closeDialog();
        });

        that.initVerify();

        that.initSave();

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


        if (!that.detailObj[propertyNames.buildingId]) {
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



    SubPage.prototype.initVerify = function () {
        var that = this;
        //自定义验证规则
        form.verify({
            optManufacturer: function (value) {
                if (value.length === 0) {
                    return "请选择生产厂商";
                }
            },
            optConnectionType: function (value) {
                if (value.length === 0) {
                    return "请选择联网方式";
                }
            },
            txtCode: function (value) {
                var lblName = $("#lblDeviceCode").html();
                if (value.length === 0) {
                    return "请输入" + lblName;
                }
                else if (value.length > 20) {
                    return lblName + "超长";
                }
            },
            txtName: function (value) {
                if (value.length === 0) {
                    return "请输入设备名称";
                }
                else if (value.length > 64) {
                    return "设备名称超长";
                }
            },
            txtIMEI: function (value) {
                if ($("#divIMData").is(":hidden")) {
                    return;
                }
                if (value.length === 0) {
                    return "请输入IMEI";
                }
            },
            txtIMSI: function (value) {
                if ($("#divIMData").is(":hidden")) {
                    return;
                }
                //选择 移动时,IMSI必填
                if (that.optConnectionType == that.AllUnibodyWaterGatewayConnectionTypes.ChinaMobile.id) {
                    if (value.length === 0) {
                        return "请输入IMSI";
                    }
                }
            },
            

            //optBuilding: function (value) {
            //    if (value.length === 0) {
            //        return "请选择所属建筑";
            //    }
            //},
            //optKeyPartList: function (value) {
            //    if (value.length === 0) {
            //        return "请选择所属部位";
            //    }
            //},
            txtAddr: function (value) {
                if (value.length === 0) {
                    return "请输入安装位置";
                } else if (value.length > 64) {
                    return "安装位置超长";
                }
            },
            optDeviceType: function (value) {
                if (value.length === 0) {
                    return "请选择设备类型";
                }
            },
            optUnit: function (value) {
                if (value.length === 0) {
                    return "请选择计量单位";
                }
            },
            //txtMaxValue: function (value) {

            //    if (value.length === 0) {
            //        return "请输入阈值上限";
            //    }
            //    var v = that.parseFloatValue(value);
            //    if (typeof v === "undefined") {
            //        return "阈值上限错误";
            //    }

            //},
            //txtMinValue: function (value) {

            //    if (value.length === 0) {
            //        return "请输入阈值下限";
            //    }
            //    var min = that.parseFloatValue(value);
            //    if (typeof min === "undefined") {
            //        return "阈值下限错误";
            //    }

            //    var max = that.parseFloatValue($("#txtMaxValue").val());
            //    if (max <= min) {
            //        return "阈值下限应小于阈值上限";
            //    }


            //}
        });
    };

    //解决值为float
    SubPage.prototype.parseFloatValue = function (value) {

        if (typeof value === "undefined") {
            return undefined;
        }

        if (value.length === 0) {
            return undefined;
        }
        var v = parseFloat(value);
        if (isNaN(v) || v < 0 || v.toString() !== value) {
            return undefined;
        }

        return v;
    };

    SubPage.prototype.initSave = function () {

        var that = this;

        form.on('submit(btnSave)', function (formData) {


            $("#btnSave").attr("disabled", true);

            var data = {
                id: that.Id,
                code: $.trim(formData.field.txtCode),
                name: $.trim(formData.field.txtName),
                //manufacturer: formData.field.optManufacturer,
                enterpriseId: that.detailObj[propertyNames.enterpriseId],
                buildingId: formData.field.optBuilding,
                keypartId: formData.field.optKeyPartList,
                address: $.trim(formData.field.txtAddr),
                deviceType: formData.field.optDeviceType,
                unit: formData.field.optUnit,
                maximum: 1,
                minimum: 0,
                connectionType: $.trim(formData.field.optConnectionType),
                imei: $.trim(formData.field.txtIMEI),
                imsi: $.trim(formData.field.txtIMSI),

                latitude: that.latitude,
                longitude: that.longitude,
                gisAddress: $.trim($("#txtGisAddress").val())
            };

            var token = neat.getUserToken();

            pageDataApi.updateUnibodyWaterGateway(token, data
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

    // 填充 生产厂商 列表
    SubPage.prototype.initManufactorList = function () {

        var that = this;

        form.on("select(optManufacturer)", function (data) {

            that.manufacturer = data.value;
            that.setElementMode();
            that.bindConnectionTypeList();
        });

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


    //初始化联网方式列表
    SubPage.prototype.initConnectionTypeList = function () {

        var that = this;

        form.on('select(optConnectionType)', function (data) {
            //console.log(data.elem); //得到select原始DOM对象
            //console.log(data.value); //得到被选中的值
            //console.log(data.othis); //得到美化后的DOM对象

            that.optConnectionType = data.value;

        
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

            that.ycDeviceType = data.value;

            $("#divGis").show();
            if (that.ycDeviceType !== "4") {
                $("#divGis").hide();
            }

            that.bindUnitList();
        });



    };

    // 绑定液压/液位
    SubPage.prototype.bindDeviceType = function () {

        var that = this;
        commonDataApi.getDeviceTypeData(neat.getUserToken(), that.manufacturer, function (resultData) {
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
                //建筑optBuilding

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
        this.initManufactorList();

        //联网方式
        this.initConnectionTypeList();

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

        $("#txtMaxValue").val(this.detailObj[propertyNames.maxValue]);
        $("#txtMinValue").val(this.detailObj[propertyNames.minValue]);

        //$("#txtGisAddress").val(this.entDetail.gisAddress);
        $("#txtGisAddress").val(this.detailObj[propertyNames.gisAddress]);
    };

    // 定位按钮事件
    SubPage.prototype._initGisBrowse = function () {


        var that = this;

        $("#btnGisBrowse").on("click", function () {

            var tthat = that;

            if (that.detailObj[propertyNames.latitude]) {
                gisSelector.init(that.detailObj[propertyNames.latitude]
                    , that.detailObj[propertyNames.longitude]
                    , that.detailObj[propertyNames.gisaddress]);
            }
            else {
                gisSelector.init(""
                    , ""
                    , "", $.trim($("#txtName").val()));
            }

            gisSelector.show(function (result) {

                tthat.latitude = result.latitude;
                tthat.longitude = result.longitude;
                tthat.gisaddress = result.gisaddress;

                $("#txtGisAddress").val(result.gisaddress);
                $("#btnGisBrowse").text("重新定位");

            });

        });
    };

    //获取所有的联网方式数据
    SubPage.prototype.getAllUnibodyWaterGatewayConnectionTypes = function () {
        var that = this;
        pageDataApi.getAllUnibodyWaterGatewayConnectionTypes(neat.getUserToken(), function (data) {
            that.AllUnibodyWaterGatewayConnectionTypes = data;
        });
    };

    exports(MODULE_NAME, new SubPage());

});