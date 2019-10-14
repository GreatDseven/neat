//智慧用电网关 修改页面


layui.define(['jquery', 'layer', 'form', 'laytpl', 'element', 'table', 'neat', 'neatDataApi', 'electricalDeviceDataApi', 'neatNavigator', 'commonDataApi', 'neatValidators'], function (exports) {



    "use strict";
    var $ = layui.$;
    var MODULE_NAME = "pageElectricalDeviceGatewayUpdate";

    var form = layui.form;
    var laytpl = layui.laytpl;

    var layer = layui.layer;

    var neat = layui.neat;

    var neatDataApi = layui.neatDataApi;

    var neatNavigator = layui.neatNavigator;

    var commonDataApi = layui.commonDataApi;

    var pageDataApi = layui.electricalDeviceDataApi;

    var validators = layui.neatValidators;


    var dataPropertyNames = {
        id: "id",
        code: "code",
        name:"name",
        iccid: "sim",
        softwareVersion: "version",
        uploadInterval: "timeout",//?
        chargePerson: "owner",
        tel: "phone",
        ratio: "ratio", //变比系数
        domainId: "domainId",
        domainName: "domainName",
        enterpriseId: "enterpriseId",
        enterpriseName: "enterpriseName",
        buildingId: "buildingId",
        buildingName: "buildingName",
        keypartId: "keypartId",
        keypartName: "keypartName",
        address: "address"

    };

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
        this.initBuildingList();
        this.initKeyPartList();

        this.initVerify();

        this.initSave();

        form.render();

    };

    SubPage.prototype.initDetail = function () {
        var that = this;

        pageDataApi.getGatewayDetailById(neat.getUserToken(), this.id
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
        that.bindBuildingList();
        that.bindKeyPartList();

        $("#txtCode").val(that.detailObj[dataPropertyNames.code]);
        $("#txtName").val(that.detailObj[dataPropertyNames.name]);
        $("#txtSIM").val(that.detailObj[dataPropertyNames.iccid]);
        
        $("#txtUploadInterval").val(that.detailObj[dataPropertyNames.uploadInterval]);

        $("#txtChargePersion").val(that.detailObj[dataPropertyNames.chargePerson]);
        $("#txtTel").val(that.detailObj[dataPropertyNames.tel]);

        $("#txtSoftwareVersion").val(that.detailObj[dataPropertyNames.softwareVersion]);
        $("#txtRatio").val(that.detailObj[dataPropertyNames.ratio]);

        //$("#txtDomainName").val(that.detailObj[dataPropertyNames.domainName]);
        $("#txtEnterpriseName").val(that.detailObj[dataPropertyNames.enterpriseName]);

        $("#txtAddr").val(that.detailObj[dataPropertyNames.address]);
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

            that.detailObj.buildingId = data.value;
            that.bindKeyPartList();

        });

    };

    //绑定建筑列表
    SubPage.prototype.bindBuildingList = function () {

        var that = this;
        //根据企业的id获取建筑列表,然后绑定到select中.
        commonDataApi.getBuildingByEntId(neat.getUserToken(), that.detailObj[dataPropertyNames.enterpriseId], function (data) {
            var d = {};
            d.data = data;
            d.selectedValue = that.detailObj[dataPropertyNames.buildingId];
            laytpl($("#optBuildingTemplate").html()).render(d, function (html) {
                var parent = $("#optBuilding").html(html);
                form.render('select', 'optBuildingForm');
            });
        });

    };

    //初始化部位列表
    SubPage.prototype.initKeyPartList = function () {
        var that = this;

        form.on('select(optKeyPartList)', function (data) {
            //console.log(data.elem); //得到select原始DOM对象
            //console.log(data.value); //得到被选中的值
            //console.log(data.othis); //得到美化后的DOM对象
            that.detailObj.keypartId = data.value;

        });
    };

    //绑定关键部位列表
    SubPage.prototype.bindKeyPartList = function () {

        var that = this;

        if (!that.detailObj.buildingId) {
            that.fillKeyPartList([]);
        }
        else {

            //根据企业的id获取建筑列表,然后绑定到select中.
            commonDataApi.getKeypartByBuildingId(neat.getUserToken(), that.detailObj.buildingId, function (data) {
                that.fillKeyPartList(data, that.detailObj[dataPropertyNames.keypartId]);
            });
        }
    };

    SubPage.prototype.fillKeyPartList = function (data, selectedData) {
        var d = {};
        d.data = data;
        d.selectedValue = selectedData;
        laytpl($("#optKeyPartListTemplate").html()).render(d, function (html) {
            var parent = $("#optKeyPartList").html(html);
            form.render('select', 'optKeyPartListForm');
        });
    };

    SubPage.prototype.initVerify = function () {
        var that = this;
        //自定义验证规则
        form.verify({
            txtName: function (value) {
                if (value.length === 0) {
                    return "请输入设备名称";
                }
            },
            txtChargePersion: function (value) {
                if (value.length === 0) {
                    return "请输入负责人";
                }

            },
            txtTel: function (value) {
                if (value.length === 0) {
                    return "请输入联系电话";
                }
                
            },
            txtRatio: function (value) {
                
                if (value.length === 0) {
                    return "请输入变比系数";
                }

                var v = that.parseIntValue(value);
                if (typeof v === "undefined" || v <= 0 || v > 1200) {
                    return "变比系数错误";
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
            }

        });
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
        if (isNaN(v) || v.toString() !== value) {
            return undefined;
        }

        return v;
    };

    SubPage.prototype.initSave = function () {

        var that = this;

        form.on('submit(btnSave)', function (formData) {


            $("#btnSave").attr("disabled", true);

            var data = {
                id: that.detailObj[dataPropertyNames.id],
                name: $.trim(formData.field.txtName),
                owner: $.trim(formData.field.txtChargePersion),
                phone: $.trim(formData.field.txtTel),
                ratio: $.trim(formData.field.txtRatio),
                buildingId: $.trim(formData.field.optBuilding),
                keypartId: $.trim(formData.field.optKeyPartList),
                address: $.trim(formData.field.txtAddr)
            };


            var token = neat.getUserToken();

            pageDataApi.updateGateway(token, data
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