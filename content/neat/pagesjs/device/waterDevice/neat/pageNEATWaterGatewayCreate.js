//neat水设备添加页面


layui.define(['jquery', 'layer', 'form', 'laytpl', 'element', 'table', 'neat', 'waterDeviceDataApi', 'neatNavigator', 'commonDataApi','neatValidators'], function (exports) {



    "use strict";
    var $ = layui.$;
    var MODULE_NAME = "pageNEATWaterGatewayCreate";

    var form = layui.form;
    var laytpl = layui.laytpl;

    var layer = layui.layer;

    var neat = layui.neat;

    var neatNavigator = layui.neatNavigator;

    var commonDataApi = layui.commonDataApi;

    var pageDataApi = layui.waterDeviceDataApi;

    var validators = layui.neatValidators;




    var SubPage = function () {

        
        this.enterpriseId = "";

        this.optServiceId = "";
        this.optBuildingId = "";
        this.optKeyPartId = "";
    };




    //关闭对话框
    SubPage.prototype.closeDialog = function () {
        var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
        parent.layer.close(index); //再执行关闭
    };


    //绑定 服务列表
    SubPage.prototype.initServiceList = function () {

        var that = this;

        form.on('select(optService)', function (data) {
            //console.log(data.elem); //得到select原始DOM对象
            //console.log(data.value); //得到被选中的值
            //console.log(data.othis); //得到美化后的DOM对象

            that.optServiceId = data.value;
           

        });

        that.BindServiceList();
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
            txtCode: function (value) {
                if (value.length === 0) {
                    return "请输入设备编码";
                } 
                var vr = validators.validateHexCode6(value);
                if (vr != "") {
                    return "设备编码错误";
                }
                vr = validators.isValidNEATWaterAddrCode(value);
                if (!vr) {
                    return "设备编码错误";
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

                code: $.trim(formData.field.txtCode),
                name: $.trim(formData.field.txtName),
                entId: that.enterpriseId,
                buildingId: $.trim(formData.field.optBuilding),
                keypartId: $.trim(formData.field.optKeyPartList),
                address: $.trim(formData.field.txtAddr),
                manufacturer:"4000"
            };

 
            var token = neat.getUserToken();

            pageDataApi.createNEATWaterGateway(token, data
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


    //初始化
    SubPage.prototype.init = function () {

        var that = this;

        this.enterpriseId = neatNavigator.getUrlParam("enterprise_id");
        this.enterpriseName = neatNavigator.getUrlParam("enterprise_name");

        $("#txtEnterpriseName").val(this.enterpriseName);
        this.initBuildingList();
        this.initKeyPartList();


        $("#btnCancel").on("click", function () {
            that.closeDialog();
        });


        this.initVerify();

        this.initSave();

        form.render();

    };




    exports(MODULE_NAME, new SubPage());

});