//nb平台应用信息 添加页面


layui.define(['jquery', 'layer', 'form', 'laydate', 'laytpl', 'upload', 'neat', 'neatDataApi', 'neatDataApi', 'neatNavigator', 'commonDataApi', 'iotAuthInfoDataApi', "neatValidators"], function (exports) {

    "use strict";

    var MODULE_NAME = "pageIotAuthInfoCreate";

    var $ = layui.$;

    var layer = layui.layer;

    var form = layui.form;

    var laydate = layui.laydate;

    var laytpl = layui.laytpl;

    var upload = layui.upload;

    var neat = layui.neat;

    var neatNavigator = layui.neatNavigator;

    var commonDataApi = layui.commonDataApi;

    var pageDataApi = layui.iotAuthInfoDataApi;


    var SubPage = function () {

        this.id = "";

    };



    //初始化
    SubPage.prototype.init = function () {

        var that = this;

        $("#btnCancel").on("click", function () {
            that.closeDialog();
        });

        that.initISPList();
        that.initEnvList();
        that.initModelTypeList();

        that.initFormVerify();
        that.initFormSubmit();

        form.render();

    };

    //关闭对话框
    SubPage.prototype.closeDialog = function () {
        var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
        parent.layer.close(index); //再执行关闭
    };

    //表单提交事件
    SubPage.prototype.initFormSubmit = function () {

        var that = this;



        form.on('submit(btnSave)', function (formData) {

            $("#btnSave").attr("disabled", true);

            var postData = {
                isp: formData.field.optISPList,
                name: $.trim(formData.field.appName),
                modelType: $.trim(formData.field.optModelType)

            };

            if (postData.isp == "2") { //中国移动
                postData.apiMasterKey = $.trim(formData.field.apiMasterKey);
                postData.envType = true;
            }
            else// if (postData.isp == "3" || postData.isp == "4") //中国电信和潍坊平台
            {
                postData.appId = $.trim(formData.field.appId);
                postData.appSecret = $.trim(formData.field.appSecret);
                postData.envType = formData.field.optEnvType;
            }



            var token = neat.getUserToken();

            var tthat = that;

            pageDataApi.createAuthInfo(token, postData
                , function (sd) {//成功

                    layer.msg("保存成功!", { time: 1500 }, function () {
                        that.closeDialog();
                    });

                }, function (fd) {//失败
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

    //form表单校验
    SubPage.prototype.initFormVerify = function () {

        var that = this;

        form.verify({



            optISPList: function (value) {
                if (value.length == 0) {
                    return "请选择运营商";
                }
            },


            appName: function (value) {
                if (value.length == 0) {
                    return "请输入名称";
                } else if (value.length > 50) {
                    return "名称超长(最长50个字)";
                }
            },

            optModelType: function (value) {
                if (value.length == 0) {
                    return "请选择设备型号";
                }
            },

            optEnvType: function (value) {
                if (that.selectedIsp == "3") {
                    if (value.length == 0) {
                        return "请选择运行环境";
                    }
                }
            },

            appId: function (value) {

                if (that.selectedIsp == "3") {
                    if (value.length == 0) {
                        return "请输入AppId";
                    }
                }

            },


            appSecret: function (value) {
                if (that.selectedIsp == "3") {
                    if (value.length == 0) {
                        return "请输入AppSecret";
                    }
                }
            },


            apiMasterKey: function (value) {
                if (that.selectedIsp == "2") {
                    if (value.length == 0) {
                        return "请输入ApiMasterKey";
                    }
                }
            },


        });
    };


    //显示提交成功
    SubPage.prototype.showSaveOK = function () {

        this.hideLoading();
        var that = this;

        layer.msg("保存成功!", { time: 1500 }, function () {

            that.closeDialog();

        });

    };



    //初始化运营商列表
    SubPage.prototype.initISPList = function () {

        var that = this;

        form.on('select(optISPList)', function (data) {
            //console.log(data.elem); //得到select原始DOM对象
            //console.log(data.value); //得到被选中的值
            //console.log(data.othis); //得到美化后的DOM对象

            that.selectedIsp = data.value;


            if (that.selectedIsp == "2") { //中国移动

                $("#chinaTelCom").hide();
                $("#chinaMobile").show();
            }
            else {
                $("#chinaTelCom").show();
                $("#chinaMobile").hide();
            }

        });
        that.bindISPList();
    };

    //绑定运营商列表
    SubPage.prototype.bindISPList = function () {

        var that = this;

        //获取运营商列表
        commonDataApi.getISPDataList(neat.getUserToken(), function (data) {
            var d = {};
            d.data = data;
            laytpl($("#optISPListTemplate").html()).render(d, function (html) {
                var parent = $("#optISPList").html(html);
                form.render('select', 'optISPListForm');
            });
        });

    };

    //初始化 运行环境列表
    SubPage.prototype.initEnvList = function () {

        var that = this;

        //获取运营商列表
        commonDataApi.getEnvTypeDataList(neat.getUserToken(), function (data) {
            var d = {};
            d.data = data;
            laytpl($("#optEnvTypeTemplate").html()).render(d, function (html) {
                var parent = $("#optEnvType").html(html);
                form.render('select', 'optEnvTypeForm');
            });
        });
    };

    //初始化 设备类型
    SubPage.prototype.initModelTypeList = function () {

        var that = this;

        //获取设备类型列表
        commonDataApi.getNBDeviceTypeList(neat.getUserToken(), function (data) {
            var d = {};
            d.data = data;
            laytpl($("#optModelTypeTemplate").html()).render(d, function (html) {
                var parent = $("#optModelType").html(html);
                form.render('select', 'optModelTypeForm');
            });
        });
    };


    exports(MODULE_NAME, new SubPage());

});