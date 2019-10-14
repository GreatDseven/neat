//编辑中心页面


layui.define(['jquery', 'layer', 'form', 'neat', 'neatDataApi', 'neatNavigator', 'domainDataApi', "neatValidators"
    , "neatLogoUploader"], function (exports) {

        "use strict";

        var MODULE_NAME = "pageDomainUpdate";

        var $ = layui.$;

        var layer = layui.layer;

        var form = layui.form;

        var neat = layui.neat;

        var neatNavigator = layui.neatNavigator;

        var pageDataApi = layui.domainDataApi;

        var logoUploader = layui.neatLogoUploader();


        var SubPage = function () {

            this.domainId = neatNavigator.getUrlParam("id");
            this.domainDetail = null;

            //保存自定义logo的id
            this.currentLogoId = "";
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
                    domainId: that.domainDetail.id,
                    domainName: $.trim(formData.field.txtDomainName),
                    address: $.trim(formData.field.txtAddress),
                    inChargePerson: $.trim(formData.field.txtInChargePerson),
                    mobilePhone: $.trim(formData.field.txtMobilePhone),
                    telephone: $.trim(formData.field.txtTelephone),
                    logoId: that.currentLogoId
                };

                var token = neat.getUserToken();

                pageDataApi.updateDomain(token, postData
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


            form.verify({
                domainName: function (value) {
                    if (value.length == 0) {
                        return "请输入中心名称";
                    } else if (value.length > 64) {
                        return "中心名称(最长64个字)";
                    }
                },
                address: function (value) {
                    if (value.length == 0) {
                        return "请输入中心地址";
                    } else if (value.length > 64) {
                        return "中心地址超长(最长64个字)";
                    }
                },
                inChargePerson: function (value) {
                    if (value.length == 0) {
                        return "请输入负责人";
                    } else if (value.length > 22) {
                        return "负责人超长(最长22个字)";
                    }
                },
                mobilePhone: function (value) {
                    if (value.length == 0) {
                        return "请输入联系电话";
                    }
                    var vr = layui.neatValidators.validateMobile(value);
                    if (vr !== "") {
                        return vr;
                    }

                },
                telephone: function (value) {
                    if (value.length == 0) {
                        return "请输入固定电话";
                    }
                    var vr = layui.neatValidators.validateTelephone(value);
                    if (vr !== "") {
                        return vr;
                    }

                }

            });
        };

        SubPage.prototype.initDomainInfo = function (callback) {

            var that = this;

            pageDataApi.getDomainById(neat.getUserToken(), that.domainId
                , function (sd) {//获取成功
                    that.domainDetail = sd;
                    callback();
                }
                , function () {
                    layer.msg("获取中心信息失败!", function () {
                        that.closeDialog();
                    });
                });
        };

        //初始化
        SubPage.prototype.init = function () {

            var that = this;


            that.initDomainInfo(function () {
                $("#txtDomainName").val(that.domainDetail.domainName);
                $("#txtAddress").val(that.domainDetail.address);
                $("#txtInChargePerson").val(that.domainDetail.inChargePerson);
                $("#txtMobilePhone").val(that.domainDetail.mobilePhone);
                $("#txtTelephone").val(that.domainDetail.telephone);
                $("#txtParentDomainName").val(that.domainDetail.parentDomainName);
                that.initLogoUpload();
            });

            that.initFormVerify();

            that.initFormSubmit();

            


            $("#btnCancel").on("click", function () {
                that.closeDialog();
            });

            form.render();

        };

        // 改变上传控件的状态
        SubPage.prototype.changeUploadControlState = function (hasLogo) {

            if (!hasLogo) {
                $("#btnUpload").show();
                $("#btnReupload").hide();
                $("#btnDeleteLogo").hide();
            }
            else {
                $("#btnUpload").hide();
                $("#btnReupload").show();
                $("#btnDeleteLogo").show();
            }

        };

        // 初始化上传logo相关的控件
        SubPage.prototype.initLogoUpload = function () {

            var that = this;

            this.currentLogoId = that.domainDetail.logoId;

            that.changeUploadControlState(this.currentLogoId);

            $("#btnUpload").on("click", function () {
                that.UploadImpl();
            });

            $("#btnReupload").on("click", function () {
                that.UploadImpl();
            });

            //清除自定义logo
            $("#btnDeleteLogo").on("click", function () {

                that.currentLogoId = "";

                that.changeUploadControlState(false);

            });

        };

        //调用上传控件上传
        SubPage.prototype.UploadImpl = function () {
            var that = this;
            logoUploader.init(that.domainId, "1");
            logoUploader.show(function (result) {

                if (result) {
                    that.currentLogoId = result;
                    that.changeUploadControlState(true);
                }
                


            });

        };

        exports(MODULE_NAME, new SubPage());

    });