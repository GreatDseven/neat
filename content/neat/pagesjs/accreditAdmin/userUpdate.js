﻿//修改用户页面


layui.define(['jquery', 'layer', 'form', 'laytpl', 'treeview', 'laydate',
             'neat', 'neatDataApi', 'neatDataApi', 'neatNavigator', "userAdminDataApi", "neatValidators"], function (exports) {

                 "use strict";

                 var MODULE_NAME = "pageAccreditAdminUserUpdate";

                 var $ = layui.$;

                 var form = layui.form;
                 var laytpl = layui.laytpl;

                 var layer = layui.layer;

                 var neat = layui.neat;

                 var neatDataApi = layui.neatDataApi;

                 var userDataApi = layui.userAdminDataApi;

                 var neatNavigator = layui.neatNavigator;

                 var SubPage = function () {

                     this.userId = neatNavigator.getUrlParam("userId");
                     this.userDetail = null;
                 };

                 //任何地方不要修改此值
                 var defaultPwd = "******";



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
                             id:that.userId,
                             name: $.trim(formData.field.txtName),
                             jobNo: $.trim(formData.field.txtJobNo),
                             telephone: $.trim(formData.field.txtTelephone),
                             pwd:null
                         };
                         var pwd = $.trim(formData.field.txtPwd);
                         if (pwd !== defaultPwd){
                             postData.pwd = pwd;
                         }

                         var token = neat.getUserToken();

                         userDataApi.updateUser(token, postData
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
                         
                         pwd: function (value) {
                             if (value.length == 0) {
                                 return "请输入密码";
                             }
                             if (value.length < 6) {
                                 return "密码太简单,至少6位";
                             }
                         },
                         pwdConfirm: function (value) {
                             if (value.length == 0) {
                                 return "请输入确认密码";
                             }

                             if ($("#txtPwd").val() != ($("#txtPwdConfirm").val())) {
                                 return "密码与确认密码不一致";
                             }
                         },
                         name: function (value) {
                             if (value.length == 0) {
                                 return "请输入真实姓名";
                             } else if (value.length > 22) {
                                 return "真实姓名超长(最长22个字)";
                             }
                         },
                         telephone: function (value) {
                             var vr = layui.neatValidators.validateContactInfo(value);
                             if (vr !== "") {
                                 return vr;
                             }
                         }

                     });
                 };

                 SubPage.prototype._initUserData = function (callback) {
                     var that = this;

                     userDataApi.getUserDetailById(neat.getUserToken(), that.userId
                         , function (sd) {//获取成功
                             that.userDetail = sd;
                             callback();
                         }
                         , function () {
                             layer.msg("获取用户信息失败!", function () {
                                 that._closeDialog();
                             });
                         });
                 };

                 //初始化
                 SubPage.prototype.init = function () {

                     var that = this;

                     that._initUserData(function () {

                         $("#txtUserName").val(that.userDetail.userName);
                         $("#txtJobNo").val(that.userDetail.jobNo);
                         $("#txtPwd").val(defaultPwd);
                         $("#txtPwdConfirm").val(defaultPwd);
                         $("#txtName").val(that.userDetail.name);
                         $("#txtTelephone").val(that.userDetail.telephone);
                         $("#txtOrg").val(that.userDetail.orgName);

                     });
                  

                     that._initFormVerify();

                     that._initFormSubmit();


                     $("#btnCancel").on("click", function () {
                         that._closeDialog();
                     });

                     form.render();

                 };


                 exports(MODULE_NAME, new SubPage());

             });