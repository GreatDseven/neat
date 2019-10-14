//一体式 水设备添加页面


layui.define(['jquery', 'layer', 'form', 'laytpl', 'element', 'table', 'neat', 'waterDeviceDataApi', 'neatNavigator', 'commonDataApi', 'neatValidators', "neatGisSelector"], function (exports) {



    "use strict";
    var $ = layui.$;
    var MODULE_NAME = "pageUnibodyWaterGatewayCreate";

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


        this.enterpriseId = "";

        this.optServiceId = "";
        this.optBuildingId = "";
        this.optKeyPartId = "";

        this.manufacturer = "";

        //所有联网方式数据
        this.AllUnibodyWaterGatewayConnectionTypes = {};
    };


    //初始化
    SubPage.prototype.init = function () {



        var that = this;

        //获取所有联网方式数据,方便对界面元素进行针对性验证
        that.getAllUnibodyWaterGatewayConnectionTypes();

        that.enterpriseId = neatNavigator.getUrlParam("enterprise_id");

        that.enterpriseName = neatNavigator.getUrlParam("enterprise_name");

        $("#txtEnterpriseName").val(this.enterpriseName);

        //厂商
        that.initManufactorList();

        //联网方式
        that.initConnectionTypeList();

        //建筑
        that.initBuildingList();
        //部位
        that.initKeyPartList();

        //设备类型(液压液位室外消防栓)
        //that.initDeviceType();

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

 

    //获取所有的联网方式数据
    SubPage.prototype.getAllUnibodyWaterGatewayConnectionTypes = function () {
        var that = this;
        pageDataApi.getAllUnibodyWaterGatewayConnectionTypes(neat.getUserToken(), function (data) {
            that.AllUnibodyWaterGatewayConnectionTypes = data;
        });
    };

    //绑定联网方式列表
    SubPage.prototype.bindConnectionTypeList = function () {

        var that = this;

        if (!that.manufacturer ) {
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
        laytpl($("#optConnectionTypeTemplate").html()).render(d, function (html) {
            var parent = $("#optConnectionType").html(html);
            form.render('select', 'optConnectionTypeForm');
        });
    };


    //初始化建筑列表
    SubPage.prototype.initBuildingList = function () {

        var that = this;

        form.on('select(optBuilding)', function (data) {
            //console.log(data.elem); //得到select原始DOM对象
            //console.log(data.value); //得到被选中的值
            //console.log(data.othis); //得到美化后的DOM对象

            that.optBuildingId = data.value;
            that.bindKeyPartList();

        });
        that.bindBuildingList();
    };

    //绑定建筑列表
    SubPage.prototype.bindBuildingList = function () {

        var that = this;

        if (that.optEntId === "") {
            that.fillBuildingList([]);
        }
        else {

            //根据企业的id获取建筑列表,然后绑定到select中.
            commonDataApi.getBuildingByEntId(neat.getUserToken(), that.enterpriseId, function (resultData) {
                that.fillBuildingList(resultData);
            });
        }
    };

    //为建筑物列表填充数据
    SubPage.prototype.fillBuildingList = function (data) {
        var d = {};
        d.data = data;
        laytpl($("#optBuildingTemplate").html()).render(d, function (html) {
            var parent = $("#optBuilding").html(html);
            form.render('select', 'optBuildingForm');
        });
    };
    //初始化部位列表
    SubPage.prototype.initKeyPartList = function () {
        var that = this;

        form.on('select(optKeyPartList)', function (data) {
            //console.log(data.elem); //得到select原始DOM对象
            //console.log(data.value); //得到被选中的值
            //console.log(data.othis); //得到美化后的DOM对象
            that.optKeyPartId = data.value;

        });
    };

    //绑定关键部位列表
    SubPage.prototype.bindKeyPartList = function () {

        var that = this;

        if (that.optBuildingId === "") {
            that.fillKeyPartList([]);
        }
        else {

            //根据企业的id获取建筑列表,然后绑定到select中.
            commonDataApi.getKeypartByBuildingId(neat.getUserToken(), that.optBuildingId, function (resultData) {
                that.fillKeyPartList(resultData);
            });
        }
    };
    //向部位列表中填充数据
    SubPage.prototype.fillKeyPartList = function (data) {
        var that = this;
        var d = {};
        d.data = data;
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
                    return lblName+"超长";
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
                if ($("#divIMData").is(":hidden") ){
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
                code: $.trim(formData.field.txtCode),
                name: $.trim(formData.field.txtName),
                manufacturer: formData.field.optManufacturer,
                enterpriseId: that.enterpriseId,
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

            pageDataApi.createUnibodyWaterGateway(token, data
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


            //设备类型(液压液位室外消防栓)
            that.initDeviceType();
        });

        pageDataApi.getUnibodyWaterGatewayManufacture(neat.getUserToken(), function (resultData) {
            var that = this;
            var d = {};
            d.data = resultData;
            laytpl($("#optManufacturerTemplate").html()).render(d, function (html) {
                var parent = $("#optManufacturer").html(html);
                form.render('select', 'optManufacturerForm');
            });
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

    // 绑定液压/液位
    SubPage.prototype.initDeviceType = function () {
        var that = this;
        form.on("select(optDeviceType)", function (data) {

            that.ycDeviceType = data.value;

            $("#divGis").show();
            if (that.ycDeviceType !== "4") {
                $("#divGis").hide();
            }

            that.bindUnitList();
        });

        that.bindDeviceType();

    };

    // 绑定液压/液位
    SubPage.prototype.bindDeviceType = function () {

        commonDataApi.getDeviceTypeData(neat.getUserToken(), this.manufacturer, function (resultData) {
            var d = {};
            d.data = resultData;
            laytpl($("#optDeviceTypeTemplate").html()).render(d, function (html) {
                var parent = $("#optDeviceType").html(html);
                form.render('select', 'optDeviceTypeForm');
            });
        });

    };

    // 定位按钮事件
    SubPage.prototype._initGisBrowse = function () {


        var that = this;

        $("#btnGisBrowse").on("click", function () {

            var tthat = that;

            if (tthat.latitude) {
                gisSelector.init(tthat.latitude
                    , tthat.longitude
                    , tthat.gisaddress);
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


    //绑定模拟量单位列表
    SubPage.prototype.bindUnitList = function () {

        var that = this;

        if (that.ycDeviceType === "") {
            that.fillUnitList([]);
        }
        else {

            //根据企业的id获取建筑列表,然后绑定到select中.
            commonDataApi.getUnitListByDeviceType(neat.getUserToken(), that.ycDeviceType, function (resultData) {
                that.fillUnitList(resultData);
            });
        }
    };

    //为模拟量单位列表填充数据
    SubPage.prototype.fillUnitList = function (data) {
        var that = this;
        var d = {};
        d.data = data;
        laytpl($("#optUnitTemplate").html()).render(d, function (html) {
            var parent = $("#optUnit").html(html);
            form.render('select', 'optUnitForm');
        });
    };

    




    exports(MODULE_NAME, new SubPage());

});