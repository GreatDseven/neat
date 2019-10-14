//角色中的用户列表页面


layui.define(['jquery', 'layer', 'form', 'laytpl', 'table',
             'neat', 'neatDataApi', 'neatDataApi', 'neatNavigator', "userAdminDataApi", "roleAdminDataApi"], function (exports) {

                 "use strict";

                 var MODULE_NAME = "pageAccreditAdminRoleUsers";

                 var $ = layui.$;

                 var form = layui.form;
                 var laytpl = layui.laytpl;

                 var layer = layui.layer;

                 var neat = layui.neat;

                 var table = layui.table;

                 var neatDataApi = layui.neatDataApi;

                 var userDataApi = layui.userAdminDataApi;

                 var neatNavigator = layui.neatNavigator;

                 var roleDataApi = layui.roleAdminDataApi;

                 var SubPage = function () {
               
                     this.roleId = neatNavigator.getUrlParam("roleId");
                   
                     this.rolerName = neatNavigator.getUrlParam("roleName");
                     this.allUsers = [];
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
                             roleId: that.roleId,
                             userIds:[]
                         };

                         //获取勾选的角色
                         var checkStatus = table.checkStatus('resultTable');
                         //没有勾选角色,提示
                         //if (checkStatus.data.length === 0) {
                         //    layui.msg("请为角色: "+that.userName+" 选择用户!");
                         //    return;
                         //}
                         
                         $.each(checkStatus.data, function (_, item) {
                             postData.userIds.push(item.id);
                         });

                         var token = neat.getUserToken();

                         roleDataApi.updateRoleUsers(token, postData
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

                 //获取当前机构下人员信息数据
                 SubPage.prototype._initUserRoleData = function (callback) {
                     var that = this;

                     userDataApi.getUsersAndCandidateUsersByRoleId(neat.getUserToken(), that.roleId
                         , function (sd) {//获取成功
                             that.allUsers = sd;
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
                         height:320,
                         limit:99999999,
                         autoSort: false,
                         loading: false,
                         cols: [
                             [
                                 { type: 'checkbox', fixed: 'left' },
                                 { field: 'name', title: '用户姓名', sort: true },
                                 { field: 'jobNo', title: '工号', sort: true },
                                 { field: 'telephone', title: '联系电话', sort: true },
                             ]
                         ],
                     });
                 }

                 //初始化
                 SubPage.prototype.init = function () {

                     var that = this;
                        
                   
                     $("#roleName").text("当前角色名称:" + that.rolerName);

                     that._initTable();

                     that._initUserRoleData(function () {

                         //为已经授权的角色,打勾
                         $.each(that.allUsers,function(_,item){
                             if (item.isChecked) {
                                 item.LAY_CHECKED = true;
                             }
                         });


                         table.reload("resultTable", {
                             data: that.allUsers
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