//萤石云账号修改页面


layui.define(['jquery', 'layer', 'form',  'element', 'table', 'neat', 'neatNavigator', 'videoDeviceDataApi'], function (exports) {



    "use strict";
    var $ = layui.$;
    var MODULE_NAME = "pageYSAccountUpdate";

    var form = layui.form;


    var layer = layui.layer;

    var neat = layui.neat;

    var neatNavigator = layui.neatNavigator;

    var pageDataApi = layui.videoDeviceDataApi;



    var SubPage = function () {

        this.id = "";
        this.detailObj = {};
    };


    //初始化
    SubPage.prototype.init = function () {

        var that = this;

        this.id = neatNavigator.getUrlParam("id");
        this.initDetailObj();

        $("#btnCancel").on("click", function () {
            that.closeDialog();
        });


        this.initVerify();

        this.initSave();

        form.render();

    };

    SubPage.prototype.initDetailObj = function () {
        var that = this;

        pageDataApi.getYSAccountDetailInfoById(neat.getUserToken(), this.id
            , function (result) {
                that.detailObj = result;

                that.fillDataToControl();


            }, function (failData) {

                layer.msg(failData.message, function () {

                    that.closeDialog();
                });

            });
    };

    var dataPropertyNames = {
        id: "id",
        appName: "appName",
        appKey: "appkey",
        appSecret: "appSecret",
        orgName: "organizationName",
        orgId: "organizationId",
        orgType: "objType"
    };



    SubPage.prototype.fillDataToControl = function () {


        $("#txtName").val(this.detailObj[dataPropertyNames.appName]);
        $("#txtAppKey").val(this.detailObj[dataPropertyNames.appKey]);
        $("#txtAppSecret").val(this.detailObj[dataPropertyNames.appSecret]);
        $("#txtOrgName").val(this.detailObj[dataPropertyNames.orgName]);

    };



    //关闭对话框
    SubPage.prototype.closeDialog = function () {
        var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
        parent.layer.close(index); //再执行关闭
    };






    SubPage.prototype.initVerify = function () {
        var that = this;
        //自定义验证规则
        form.verify({
           
            txtName: function (value) {
                if (value.length === 0) {
                    return "请输入名称";
                }
                else if (value.length > 64) {
                    return "名称超长";
                }
            },
            txtAppKey: function (value) {
                if (value.length === 0) {
                    return "请输入AppKey";
                }
                else if (value.length > 64) {
                    return "AppKey超长";
                }
            }
            , txtAppSecret: function (value) {
                if (value.length === 0) {
                    return "请输入AppSecret";
                }
                else if (value.length > 64) {
                    return "AppSecret超长";
                }
            }
          
        });
    };

   

    SubPage.prototype.initSave = function () {

        var that = this;

        form.on('submit(btnSave)', function (formData) {


            $("#btnSave").attr("disabled", true);

            var data = {
                id: that.id,
                appName: $.trim(formData.field.txtName),
                appkey: $.trim(formData.field.txtAppKey),
                appSecret: $.trim(formData.field.txtAppSecret)
            };

            var token = neat.getUserToken();

            pageDataApi.updateYSAccount(token, data
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