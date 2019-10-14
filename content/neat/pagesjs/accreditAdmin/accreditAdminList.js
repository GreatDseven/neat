//用户权限列表页


layui.define(["jquery", 'element', 'form', 'table', 'laytpl', 'laypage','layer',
   'neat', 'neatNavigator', 'commonDataApi', 'neatGroupDataMaker', 'userAdminDataApi', 'roleAdminDataApi', 'neatUITools'], function (exports) {

        "use strict";

        var $ = layui.$;
        var table = layui.table;
        var form = layui.form;
        var laytpl = layui.laytpl;

        var neat = layui.neat;
        var laypage = layui.laypage;
        var neatNavigator = layui.neatNavigator;
        var commonDataApi = layui.commonDataApi;
        var groupDataTools = layui.neatGroupDataMaker;

        var userDataApi = layui.userAdminDataApi;
        var roleDataApi = layui.roleAdminDataApi;
        var uiTools = layui.neatUITools;

        var defaultPageSize = 17;

        var SubPage = function () {

            this._initDefaultValues();
        };

        SubPage.prototype._initDefaultValues = function () {

            this.currentRolePageIndex = 1;
            this.currentRolePageSize = defaultPageSize;
            this.currentRoleSortColumn = "roleName";
            this.currentRoleSortOrder = "desc";

            this.currentSelectedRoleId = "";
            this.currentSelectedRoleName = "";



            this.currentUserPageIndex = 1;
            this.currentUserPageSize = defaultPageSize;
            this.currentUserSortColumn = "name";
            this.currentUserSortOrder = "desc";

        };

        SubPage.prototype._setCurrentSelectedRole = function (roleRowObj) {

            if (roleRowObj) {
                this.currentSelectedRoleId = roleRowObj.id;
                this.currentSelectedRoleName = roleRowObj.roleName;
            }
            else {
                this.currentSelectedRoleId = "";
                this.currentSelectedRoleName = "全部";
            }
          
        };



        //角色相关
        SubPage.prototype._clearRoleTable = function () {

            table.reload("roleResultTable", {
                data: [],
                initSort: {
                    field: that.currentRoleSortColumn,
                    type: that.currentRoleSortOrder
                }
            });
            that.currentRolePageIndex = 1;
            that._initRolePager(0, 1);
        };

        SubPage.prototype._bindRoleTable = function () {

            var that = this;
    
            function getSortColApiValue(colValue) {
                switch (colValue) {
                    case "roleName":
                        return "RoleName";
                    case "roleLevel":
                        return "RoleLevel";
                    case "id":
                    default:
                        return "None";

                }
            }


            var token = neat.getUserToken();
            var treeData = neatNavigator.getSelectedTreeNodeInfo();

            if (!treeData) {
                layer.msg("请选择左侧机构树节点");
                return;
            }

            var orderByColumn = getSortColApiValue(that.currentRoleSortColumn);
            var isDescOrder = that.currentRoleSortOrder === "desc";

            var loadingIndex = layui.layer.load(1);
            roleDataApi.getRoles(token, treeData.domainId, treeData.enterpriseId, orderByColumn, isDescOrder, that.currentRolePageIndex, that.currentRolePageSize,
                function (resultData) {
                    layui.layer.close(loadingIndex);
                    table.reload("roleResultTable", {
                        data: resultData.data,
                        initSort: {
                            field: that.currentRoleSortColumn,
                            type: that.currentRoleSortOrder
                        }
                    });
                    that._initRolePager(resultData.totalCount, that.currentRolePageIndex);

                }, function () {
                    layui.layer.close(loadingIndex);
                    that.currentRolePageIndex = 1;
                    table.reload("roleResultTable", {
                        data: [],
                        initSort: {
                            field: that.currentRoleSortColumn,
                            type: that.currentRoleSortOrder
                        }
                    });
                    that._initRolePager(0, 1);
                    //layer.msg("查询角色发生错误!");
                });
        };

        SubPage.prototype._initRolePager = function (totalCount, pageIndex) {

            var that = this;

            if (!totalCount) {
                totalCount = 0;
            }
            if (!pageIndex) {
                pageIndex = 1;
            }

            laypage.render({
                elem: 'roleResultTablePager',
                count: totalCount, //数据总数，从服务端得到
                limit: that.currentRolePageSize,
                hash: false,
                layout: ['count', 'prev', 'page', 'next'],
                curr: pageIndex,
                jump: function (obj, first) {
                    //obj包含了当前分页的所有参数，比如：
                    //console.log(obj.curr); //得到当前页，以便向服务端请求对应页的数据。
                    //console.log(obj.limit); //得到每页显示的条数

                    that.currentRolePageIndex = obj.curr;
                    that.currentRolePageSize = obj.limit;

                    //首次不执行
                    if (!first) {
                        //do something
                        that._bindRoleTable(obj.curr, obj.limit);
                    }
                }
            });
        };

        SubPage.prototype._initRoleTable = function () {

            var that = this;
            that.table = table.render({
                elem: '#roleResultTable',
                id: "roleResultTable",
                data: [],
                page: false,
                limit: defaultPageSize,
                autoSort: false,
                initSort: {
                    field: that.currentRoleSortColumn,
                    type: that.currentRoleSortOrder
                },
                loading: false,
                cols: [
                    [
                        { type: 'checkbox', fixed: 'left' },
                        { field: 'roleName', title: '角色名称', sort: true },
                        { field: 'roleLevel', title: '角色类型', sort: true,templet: function (d) { return uiTools.renderRoleLevel(d.roleLevel); } },
                        { field: 'operation', fixed: 'right', title: '操作', align: 'center', toolbar: '#opColRoleTemplate' }
                    ]
                ],
            });

            table.on('sort(roleResultTable)', function (obj) {
                //console.log(obj.field); //当前排序的字段名
                //console.log(obj.type); //当前排序类型：desc（降序）、asc（升序）、null（空对象，默认排序）
                //console.log(this); //当前排序的 th 对象

                that.currentRoleSortColumn = obj.field;
                that.currentRoleSortOrder = obj.type;

                that._bindRoleTable();

                //layer.msg('服务端排序。order by ' + obj.field + ' ' + obj.type);
            });



        }

        SubPage.prototype._initAddRoleEvent = function () {

            var that = this;

            $('#btnAddRole').on('click', function () {

                var treeData = neatNavigator.getSelectedTreeNodeInfo();
                if (!treeData) {
                    return;
                }

                var url = "/pages/accreditAdmin/roleCreate.html?domainId=" + treeData.domainId
                    + "&enterpriseId=" + treeData.enterpriseId
                    + "&nodetext=" + treeData.name
                    + "&__=" + new Date().valueOf().toString();
                layer.open({resize:false,
                    type: 2,
                    title: '添加角色',
                    area: ["800px", "640px"],
                    shade: [0.7, '#000'],
                    content: url,
                    end: function () {
                        that._bindRoleTable();
                    }
                });
            });
        };

   
        SubPage.prototype._initDeleteRoleEvent = function () {
            var that = this;
            $('#btnDeleteRole').on('click', function () {


                var checkStatus = table.checkStatus('roleResultTable');
                var data = checkStatus.data;

                if (data.length === 0) {
                    layui.msg("请勾选需要删除的角色!");
                    return;
                }

                layer.confirm("确定要删除这些角色吗?", {}, function () {

                    $("#btnDeleteRole").attr("disabled", true);

                    var ids = [];
                    $.each(data, function (_, item) {
                        ids.push(item.id);
                    });
                    roleDataApi.deleteRoles(neat.getUserToken(), ids

                          , function (sd) { //成功或者部分成功

                              $("#btnDeleteRole").attr("disabled", false);
                              var alertMsg = "角色删除成功!";

                              layer.msg(alertMsg, function () {
                                  that._bindRoleTable();
                              });
                          }
                        , function (fd) {

                            $("#btnDeleteRole").attr("disabled", false);

                            layer.msg(fd.message, function () {
                                that._bindRoleTable();

                            });
                        });
                });
            });
        };

        //初始化角色表格操作列的事件
        SubPage.prototype._initRoleTableOperateColEvent = function () {
            var that = this;

            table.on('tool(roleResultTable)', function (obj) {
                var data = obj.data;
                if (obj.event === 'del') {
                    layer.confirm('确定要删除角色:' + data.roleName + "?", function (index) {
                        var url = "";


                        var sendData = [];
                        sendData.push(data.id);
                        roleDataApi.deleteRoles(neat.getUserToken(), sendData
                            , function (sd) { //成功或者部分成功

                                var alertMsg = "角色删除成功!";
                                obj.del();

                                layer.msg(alertMsg, function () {
                                    that._bindRoleTable();
                                });


                            }, function (fd) { //失败
                                layer.msg(fd.message);
                            });

                        layer.close(index);
                    });
                } else if (obj.event === 'edit') {

                    var url = "/pages/accreditAdmin/roleUpdate.html?roleId=" + data.id

                      + "&__=" + new Date().valueOf().toString();

                    layer.open({resize:false,
                        type: 2,
                        title: '编辑角色',
                        area: ["800px", "640px"],
                        shade: [0.7, '#000'],
                        content: url,
                        end: function () {
                            that._bindRoleTable();
                        }
                    });

                }
                else if (obj.event === "selectUser") {
                    
                    //选择用户
                    var url = "/pages/accreditAdmin/roleUsers.html?roleId=" + data.id
                     + "&roleName=" + encodeURIComponent(data.roleName)
                     + "&__=" + new Date().valueOf().toString();

                    layer.open({resize:false,
                        type: 2,
                        title: '角色选择用户',
                        area: ["800px", "500px"],
                        shade: [0.7, '#000'],
                        content: url,
                        end: function () {
                            that._bindUserTable();
                       }
                    });
                }
            });
        };

        //人员相关

        SubPage.prototype._clearUserTable = function () {

            table.reload("userResultTable", {
                data: [],
                initSort: {
                    field: that.currentUserSortColumn,
                    type: that.currentUserSortOrder
                }
            });
            that.currentUserPageIndex = 1;
            that._initUserPager(0, 1);
        };

        SubPage.prototype._bindUserTable = function () {

            var that = this;
            /*
            token,domainID,enterpriseID,taskName,
            frequencyID,uid,uidType,
            orderByColumn, isDescOrder,
            pageIndex,pageSize
            */

            function getSortColApiValue(colValue) {
                switch (colValue) {
                    case "name":
                        return "name";
                    case "jobNo":
                        return "JobNo";
                    case "telephone":
                        return "Telephone";
                    default:
                        return "None";

                }
            }


            var token = neat.getUserToken();
            var treeData = neatNavigator.getSelectedTreeNodeInfo();
            if (!treeData) {
                return;
            }

            var orderByColumn = getSortColApiValue(that.currentUserSortColumn);
            var isDescOrder = that.currentUserSortOrder === "desc";

            var loadingIndex = layui.layer.load(1);
            userDataApi.getUsers(token, treeData.domainId, treeData.enterpriseId,that.currentSelectedRoleId, orderByColumn, isDescOrder, that.currentUserPageIndex, that.currentUserPageSize,
                function (resultData) {
                    layui.layer.close(loadingIndex);
                    table.reload("userResultTable", {
                        data: resultData.data,
                        initSort: {
                            field: that.currentUserSortColumn,
                            type: that.currentUserSortOrder
                        }
                    });
                    that._initUserPager(resultData.totalCount, that.currentUserPageIndex);

                }, function () {
                    layui.layer.close(loadingIndex);
                    that.currentUserPageIndex = 1;
                    table.reload("userResultTable", {
                        data: [],
                        initSort: {
                            field: that.currentUserSortColumn,
                            type: that.currentUserSortOrder
                        }
                    });
                    that._initUserPager(0, 1);
                    //layer.msg("查询用户发生错误!");
                });
        };

        SubPage.prototype._initUserPager = function (totalCount, pageIndex) {

            var that = this;

            if (!totalCount) {
                totalCount = 0;
            }
            if (!pageIndex) {
                pageIndex = 1;
            }

            laypage.render({
                elem: 'userResultTablePager',
                count: totalCount, //数据总数，从服务端得到
                limit: that.currentUserPageSize,
                hash: false,
                layout: ['count', 'prev', 'page', 'next'],
                curr: pageIndex,
                jump: function (obj, first) {
                    //obj包含了当前分页的所有参数，比如：
                    //console.log(obj.curr); //得到当前页，以便向服务端请求对应页的数据。
                    //console.log(obj.limit); //得到每页显示的条数

                    that.currentUserPageIndex = obj.curr;
                    that.currentUserPageSize = obj.limit;

                    //首次不执行
                    if (!first) {
                        //do something
                        that._bindUserTable(obj.curr, obj.limit);
                    }
                }
            });
        };

        SubPage.prototype._initUserTable = function () {

            var that = this;
            that.table = table.render({
                elem: '#userResultTable',
                id: "userResultTable",
                data: [],
                page: false,
                limit: defaultPageSize,
                autoSort: false,
                initSort: {
                    field: that.currentUserSortColumn,
                    type: that.currentUserSortOrder
                },
                loading: false,
                cols: [
                    [
                        { type: 'checkbox', fixed: 'left' },
                        { field: 'userName', title: '用户名', sort: true },
                         { field: 'name', title: '真实姓名', sort: true },
                        { field: 'jobNo', title: '工号' },
                         { field: 'telephone', title: '电话' },
                        { field: 'operation', fixed: 'right', title: '操作', align: 'center', toolbar: '#opColUserTemplate' }
                    ]
                ],
            });

            table.on('sort(userResultTable)', function (obj) {
                //console.log(obj.field); //当前排序的字段名
                //console.log(obj.type); //当前排序类型：desc（降序）、asc（升序）、null（空对象，默认排序）
                //console.log(this); //当前排序的 th 对象

                that.currentUserSortColumn = obj.field;
                that.currentUserSortOrder = obj.type;

                that._bindUserTable();

                //layer.msg('服务端排序。order by ' + obj.field + ' ' + obj.type);
            });



        }

        SubPage.prototype._initAddUserEvent = function () {

            var that = this;

            $('#btnAddUser').on('click', function () {

                var treeData = neatNavigator.getSelectedTreeNodeInfo();
                if (!treeData) {
                    return;
                }
                var url = "/pages/accreditAdmin/userCreate.html?domainId="+ treeData.domainId
                    + "&enterpriseId=" + treeData.enterpriseId
                    + "&nodetext="+treeData.name
                    + "&__=" + new Date().valueOf().toString();
                layer.open({resize:false,
                    type: 2,
                    title: '添加用户',
                    area: ["800px", "450px"],
                    shade: [0.7, '#000'],
                    content: url,
                    end: function () {
                        that._bindUserTable();
                    }
                });
            });
        };

        SubPage.prototype._initDeleteUserEvent = function () {
            var that = this;
            $('#btnDeleteUser').on('click', function () {


                var checkStatus = table.checkStatus('userResultTable');
                var data = checkStatus.data;

                if (data.length === 0) {
                    layui.msg("请勾选需要删除的用户!");
                    return;
                }

                layer.confirm("确定要删除这些用户吗?", {}, function () {

                    $("#btnDeleteUser").attr("disabled", true);

                    var ids = [];
                    $.each(data, function (_, item) {
                        ids.push(item.id);
                    });
                    userDataApi.deleteUsers(neat.getUserToken(), ids

                          , function (sd) { //成功或者部分成功

                              $("#btnDeleteUser").attr("disabled", false);
                              var alertMsg = "";

                              if (!sd || sd == null || sd.length === 0) {
                                  alertMsg = "用户删除成功!";

                              }
                              else {

                                  alertMsg = "以下用户未能成功删除:<br/>" + sd.join("<br/>");
                              }

                              layer.msg(alertMsg, function () {
                                  that._bindUserTable();
                              });
                          }
                        , function (fd) {

                            $("#btnDeleteUser").attr("disabled", false);

                            layer.msg("用户删除失败!", function () {
                                that._bindUserTable();

                            });
                        });
                });
            });
        };

        //初始化人员表格操作列的事件
        SubPage.prototype._initUserTableOperateColEvent = function () {
            var that = this;

            table.on('tool(userResultTable)', function (obj) {
                var data = obj.data;
                if (obj.event === 'del') {
                    layer.confirm('确定要删除用户:' + data.name + "?", function (index) {
                        var url = "";
                        var sendData = [];
                        sendData.push(data.id);
                        userDataApi.deleteUsers(neat.getUserToken(), sendData
                            , function (sd) { //成功或者部分成功

                                var alertMsg = "";

                                if (!sd || sd == null || sd.length === 0) {
                                    alertMsg = "用户删除成功!";
                                    obj.del();
                                }
                                else {

                                    alertMsg = "以下用户未能成功删除:<br/>" + sd.join("<br/>");
                                }

                                layer.msg(alertMsg, function () {
                                    that._bindUserTable();
                                });


                            }, function (fd) { //失败
                                layer.msg("删除用户过程中发生错误!");
                            });

                        layer.close(index);
                    });
                }
                else if (obj.event === 'edit') {

                    var url = "/pages/accreditAdmin/userUpdate.html?userId=" + data.id

                      + "&__=" + new Date().valueOf().toString();

                    layer.open({resize:false,
                        type: 2,
                        title: '编辑用户',
                        area: ["800px", "450px"],
                        shade: [0.7, '#000'],
                        content: url,
                        end: function () {
                            that._bindUserTable();
                        }
                        //,yes: function () { alert("yes"); }
                        //,cancel:function(){alert("cancel");}
                    });

                }
                else if (obj.event === "selectRole") {
                    
                    var url = "/pages/accreditAdmin/userRoles.html?userId=" + data.id
                      + "&userName="+ encodeURIComponent( data.name)
                      + "&__=" + new Date().valueOf().toString();

                    layer.open({resize:false,
                        type: 2,
                        title: '用户选择角色',
                        area: ["800px", "500px"],
                        shade: [0.7, '#000'],
                        content: url
                    });
                }
            });
        };

        //url hash 改变事件
        SubPage.prototype._initHashChangedEvent = function () {
            var that = this;

            $(window).on("hashchange", function () {

                var treeData = neatNavigator.getSelectedTreeNodeInfo();
                if (!treeData) {
                    return;
                }
                if (!treeData.fullAccess) {

                    $("#btnAddUser").attr("disabled", true);
                    $("#btnDeleteUser").attr("disabled", true);

                    $("#btnAddRole").attr("disabled", true);
                    $("#btnDeleteRole").attr("disabled", true);
                }
                else {

                    $("#btnAddUser").attr("disabled", false);
                    $("#btnDeleteUser").attr("disabled", false);

                    $("#btnAddRole").attr("disabled", false);
                    $("#btnDeleteRole").attr("disabled", false);
                }

                that._initDefaultValues();

                that._bindRoleTable();
                that._bindUserTable();
            });
        };

        //角色表行点击事件
        SubPage.prototype._initRoleTableRowClickEvent = function () {

            var that = this;
            table.on('row(roleResultTable)', function (obj) {
                var data = obj.data;
                
                that._setCurrentSelectedRole(data);

                that._bindUserTable();
                

                //标注选中样式
                obj.tr.addClass('layui-table-click').siblings().removeClass('layui-table-click');
            });
        };

        SubPage.prototype.init = function () {


            var that = this;

            //url hash 值改变
            this._initHashChangedEvent();

            //=======================
            
            //角色相关
            this._initAddRoleEvent();

            this._initDeleteRoleEvent();

            this._initRoleTable();

            
            this._initRolePager();

            this._bindRoleTable();

            //角色表格操作列事件
            this._initRoleTableOperateColEvent();

            //角色表行点击事件
            this._initRoleTableRowClickEvent();

            //=======================

            //用户相关
            this._initAddUserEvent();

            this._initDeleteUserEvent();

            this._initUserTable();

            this._initUserPager();

            this._bindUserTable();

            //用户表格操作列事件
            this._initUserTableOperateColEvent();

           

        };


        exports("pageAccreditAdminList", new SubPage());

    });