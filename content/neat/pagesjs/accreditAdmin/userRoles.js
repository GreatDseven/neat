//用户所属角色页面


layui.define(['jquery', 'layer', 'form', 'laytpl', 'table',
             'neat', 'neatDataApi', 'neatDataApi', 'neatNavigator', "roleAdminDataApi",'neatUITools'], function (exports) {

                 "use strict";

                 var MODULE_NAME = "pageAccreditAdminUserRoles";

                 var $ = layui.$;

                 var form = layui.form;
                 var laytpl = layui.laytpl;

                 var layer = layui.layer;

                 var neat = layui.neat;

                 var table = layui.table;

                 var neatDataApi = layui.neatDataApi;

                 var roleDataApi = layui.roleAdminDataApi;

                 var neatNavigator = layui.neatNavigator;

                 var uiTools = layui.neatUITools;

                 var SubPage = function () {

                 
                     this.userId = neatNavigator.getUrlParam("userId");
                     this.userName = neatNavigator.getUrlParam("userName");
                     this.allRoles = [];
                 };


                 //关闭对话框
        SubPage.prototype._closeDialog = function () {
            var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
            parent.layer.close(index); //再执行关闭
        };

                 //表单提交事件
                 SubPage.prototype._initFormSubmit = function () {

                     var that = this;
                     $("#btnSave").on('click', function (formData) {


                         $("#btnSave").attr("disabled", true);
                         
                         var postData = {
                             userId: that.userId,
                             roleIds:[]
                         };

                         //获取勾选的角色
                         var checkStatus = table.checkStatus('resultTable');
                         //没有勾选角色,提示
                         //if (checkStatus.data.length === 0) {
                         //    layui.msg("请为用户: "+that.userName+" 指定角色!");
                         //    return;
                         //}
                         
                         $.each(checkStatus.data, function (_, item) {
                             postData.roleIds.push(item.id);
                         });

                         var token = neat.getUserToken();

                         roleDataApi.updateUserRoles(token, postData
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

                 //获取用户角色的数据
                 SubPage.prototype._initUserRoleData = function (callback) {
                     var that = this;

                     roleDataApi.getRolesAndCandidateRolesByUserId(neat.getUserToken(), that.userId
                         , function (sd) {//获取成功
                             that.allRoles = sd;
                             callback();
                         }
                         , function () {
                             layer.msg("获取用户信息失败!", function () {
                                 that._closeDialog();
                             });
                         });
                 };

                 //初始化用户角色表
                 SubPage.prototype._initTable = function () {

                     var that = this;
                     that.table = table.render({
                         elem: '#resultTable',
                         id: "resultTable",
                         data: [],
                         page: false,
                         autoSort: false,
                         loading: false,
                         height: 320,
                         limit: 99999999,
                         cols: [
                             [
                                 { type: 'checkbox', fixed: 'left' },
                                 { field: 'roleName', title: '角色名称', sort: true },
                                 { field: 'roleLevel', title: '角色类型', sort: true, templet: function (d) { return uiTools.renderRoleLevel(d.roleLevel); } },
                             ]
                         ],
                     });
                 }

                 //初始化
                 SubPage.prototype.init = function () {

                     var that = this;
            

                     $("#userName").text("当前用户:"+that.userName);

                     that._initTable();

                     that._initUserRoleData(function () {

                         //为已经授权的角色,打勾
                         $.each(that.allRoles,function(_,item){
                             if (item.isChecked) {
                                 item.LAY_CHECKED = true;
                             }
                         });


                         table.reload("resultTable", {
                             data: that.allRoles
                         });
                     });
                  

                     that._initFormSubmit();


                     $("#btnCancel").on("click", function () {
                         that._closeDialog();
                     });

                     form.render();

                 };


                 exports(MODULE_NAME, new SubPage());

             });