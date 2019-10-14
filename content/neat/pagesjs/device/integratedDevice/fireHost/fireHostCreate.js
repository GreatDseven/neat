//消防主机 添加页面


layui.define(['jquery', 'layer', 'form', 'laytpl', 'element', 'table', 'neat', 'integratedDeviceDataApi', 'neatNavigator', 'commonDataApi', 'neatValidators','neatUITools'], function (exports) {



    "use strict";
    var $ = layui.$;
    var MODULE_NAME = "pageIntegratedFireHostCreate";

    var form = layui.form;
    var laytpl = layui.laytpl;

    var layer = layui.layer;

    var neat = layui.neat;

    var neatNavigator = layui.neatNavigator;

    var commonDataApi = layui.commonDataApi;

    var pageDataApi = layui.integratedDeviceDataApi;

    var validators = layui.neatValidators;

    var uiTools = layui.neatUITools;


    var SubPage = function () {


        this.entId = "";

        this.optServiceId = "";
        this.optBuildingId = "";
        this.optKeyPartId = "";
    };


    //初始化
    SubPage.prototype.init = function () {

        var that = this;


        this.entId = neatNavigator.getUrlParam("ent_id");
        this.uitdId = neatNavigator.getUrlParam("uitd_id");
        this.uitdCode = neatNavigator.getUrlParam("uitd_code");

        $("#txtUitdCode").val(this.uitdCode);
        //厂商
        this.bindManufacturers();

        //建筑
        this.initBuildingList();
        //部位
        this.initKeyPartList();

        // 主机类别
        this.bindFireHostType();

        this.initVerify();

        this.initSave();

        //自动格式化地址码
        uiTools.initAutoFormatAddressCode("txtCode");


        $("#btnCancel").on("click", function () {
            that.closeDialog();
        });

        

        form.render();

        $("#txtCode").focus();

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

            that.optBuildingId = data.value;
            that.bindKeyPartList();

        });
        that.bindBuildingList();
    };

    //绑定建筑列表
    SubPage.prototype.bindBuildingList = function () {

        var that = this;

        //根据企业的id获取建筑列表,然后绑定到select中.
        commonDataApi.getBuildingByEntId(neat.getUserToken(), that.entId, function (resultData) {
            that.fillBuildingList(resultData);
        });

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


    // 绑定生产厂商   
    SubPage.prototype.bindManufacturers = function () {
        pageDataApi.queryFireHostManufacturers(neat.getUserToken(),

            function (result) {
                var d = {}
                d.data = result;
                laytpl($("#optManufacturerTemplate").html()).render(d, function (html) {

                    $("#optManufacturer").html(html);
                    form.render('select', 'optManufacturerForm');
                });
            },
            function () { //失败
                layer.msg("获取生产厂商发生错误!");
            });
    };

    // 绑定 主机类型  
    SubPage.prototype.bindFireHostType = function () {
        pageDataApi.queryFireHostType(neat.getUserToken(),

            function (result) {
                var d = {}
                d.data = result;
                laytpl($("#optCategoryTemplate").html()).render(d, function (html) {

                    $("#optCategory").html(html);
                    form.render('select', 'optCategoryForm');
                });
            },
            function () { //失败
                layer.msg("获取生产厂商发生错误!");
            });
    };


    SubPage.prototype.initVerify = function () {
        var that = this;
        //自定义验证规则
        form.verify({
            txtCode: function (value) {
                if (value.length === 0) {
                    return "请输入主机编号";
                }
                var vr = validators.validateDecCode2(value);
                if (vr != "") {
                    return "主机编号错误";
                }
            },
            txtName: function (value) {
                if (value.length === 0) {
                    return "请输入主机名称";
                }
                else if (value.length > 64) {
                    return "主机名称超长";
                }
            },
            optCategory: function (value) {
                if (value.length === 0) {
                    return "请选择主机类别";
                }
            },
            optManufacturer: function (value) {
                if (value.length === 0) {
                    return "请选择生产厂商";
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

    SubPage.prototype.initSave = function () {

        var that = this;

        form.on('submit(btnSave)', function (formData) {


            $("#btnSave").attr("disabled", true);

            var data = {
                deviceID: that.uitdId,
                code: $.trim(formData.field.txtCode),
                name: $.trim(formData.field.txtName),
                deviceType: formData.field.optCategory,
                manufacturer: formData.field.optManufacturer,
                enterpriseId: that.entId,
                buildingId: formData.field.optBuilding,
                keypartId: formData.field.optKeyPartList,
                address: $.trim(formData.field.txtAddr),
                
            };


            var token = neat.getUserToken();

            pageDataApi.createFireHost(token, data
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