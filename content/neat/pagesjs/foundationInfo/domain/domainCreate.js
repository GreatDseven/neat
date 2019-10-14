//添加中心页面


layui.define(['jquery', 'layer', 'form', 'neat', 'neatDataApi', 'neatDataApi', 'neatNavigator', 'domainDataApi', "neatValidators"], function (exports) {

    "use strict";

    var MODULE_NAME = "pageDomainCreate";

    var $ = layui.$;

    var layer = layui.layer;

    var form = layui.form;

    var neat = layui.neat;

    var neatNavigator = layui.neatNavigator;

    var pageDataApi = layui.domainDataApi;



    var SubPage = function () {

        this.parentDomainId = neatNavigator.getUrlParam("parentId");
        this.parentDomainName = neatNavigator.getUrlParam("parentName");

    };


    //关闭对话框
    SubPage.prototype._closeDialog = function () {
        var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
        parent.layer.close(index); //再执行关闭
    };

    //表单提交事件
    SubPage.prototype._initFormSubmit = function () {

        var that = this;
        form.on('submit(btnSave)', function (formData) {


            $("#btnSave").attr("disabled", true);

            var postData = {
                parentId: that.parentDomainId,
                domainName: $.trim(formData.field.txtDomainName),
                address: $.trim(formData.field.txtAddress),
                inChargePerson: $.trim(formData.field.txtInChargePerson),
                mobilePhone: $.trim(formData.field.txtMobilePhone),
                telephone: $.trim(formData.field.txtTelephone)

            };

            var token = neat.getUserToken();

            pageDataApi.createDomain(token, postData
                , function (sd) {//成功

                    layer.msg("保存成功!", { time: 1500 }, function () {

                        that._closeDialog();

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
    SubPage.prototype._initFormVerify = function () {


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

    //初始化
    SubPage.prototype.init = function () {

        var that = this;

        $("#txtParentDomainName").val(that.parentDomainName);


        that._initFormVerify();

        that._initFormSubmit();


        $("#btnCancel").on("click", function () {
            that._closeDialog();
        });

        form.render();

    };


    exports(MODULE_NAME, new SubPage());

});