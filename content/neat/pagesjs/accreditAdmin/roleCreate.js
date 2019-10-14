//添加角色页面


layui.define(['jquery', 'layer', 'element', 'form', 'laytpl', 'treeview', 'laydate', 'neat', 'neatDataApi', 'neatDataApi', 'neatNavigator', "roleAdminDataApi", "neatTreeDataMaker"], function (exports) {

    "use strict";

    var MODULE_NAME = "pageAccreditAdminRoleCreate";

    var $ = layui.$;

    var element = layui.element;

    var form = layui.form;
    var laytpl = layui.laytpl;

    var layer = layui.layer;

    var neat = layui.neat;

    var neatDataApi = layui.neatDataApi;

    var roleDataApi = layui.roleAdminDataApi;

    var neatNavigator = layui.neatNavigator;

    var treeDataMaker = layui.neatTreeDataMaker();

    var SubPage = function () {

        this.domainId = neatNavigator.getUrlParam("domainId");
        this.enterpriseId = neatNavigator.getUrlParam("enterpriseId");
        this.orgName = neatNavigator.getUrlParam("nodetext");
        this.optRoleType = "";

        this.orgTree = null;
        this.desktopTree = null;
        this.webTree = null;
        this.appTree = null;

    };

    //获取当前角色的归属机构id
    SubPage.prototype.getRoleParentOrgId = function () {

        if (this.enterpriseId !== "") {
            return this.enterpriseId;
        }
        else {
            return this.domainId;
        }
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
                roleName: $.trim(formData.field.txtRoleName),
                roleType: that.optRoleType,
                domainId: that.domainId,
                entId: that.enterpriseId,
                orgScope: [],
                desktopScope: [],
                webScope: [],
                appScope: []
            };



            var orgNodes = that.orgTree.treeview("getChecked");

            $.each(orgNodes, function (_, item) {
                postData.orgScope.push(item.id);
            });

            //var desktopNodes = that.desktopTree.treeview("getChecked");

            //$.each(desktopNodes, function (_, item) {
            //    if (item.type == "3") {
            //        postData.desktopScope.push(item.id);
            //    }

            //});

            var webNodes = that.webTree.treeview("getChecked");

            $.each(webNodes, function (_, item) {
                if (item.type == "3") {
                    postData.webScope.push(item.id);
                }

            });
            var appNodes = that.appTree.treeview("getChecked");
            $.each(appNodes, function (_, item) {
                if (item.type == "3") {
                    postData.appScope.push(item.id);
                }

            });
            var token = neat.getUserToken();

            roleDataApi.createRole(token, postData
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
            roleName: function (value) {
                if (value.length == 0) {
                    return "请输入角色名称";
                } else if (value.length > 22) {
                    return "角色名称超长(最长22个字)";
                }
            },
            roleType: function (value) {
                if (value.length == 0) {
                    return "请选择角色类型";
                }
            }

        });
    };

    //初始化角色类型/级别
    SubPage.prototype.initRoleType = function () {

        var that = this;

        var orgType = 2;
        var orgId = that.enterpriseId;

        if (that.enterpriseId === '') {
            orgType = 1;
            orgId = that.domainId;
        }


        roleDataApi.canAddAdminRole(neat.getUserToken(), orgId, orgType, function (resultData) {

            var d = {};
            d.data = [];

            if (resultData === true) {
                d.data.push({ id: "2", name: "管理员用户" });
            }

            d.data.push({ id: "1", name: "普通用户" });

            laytpl($("#optRoleTypeTemplate").html()).render(d, function (html) {
                var parent = $("#optRoleType").html(html);
                form.render('select', 'optRoleTypeForm');
            });

            that.roleTypeChanged(d.data[0].id);

        });



        form.on('select(optRoleType)', function (data) {
            //console.log(data.elem); //得到select原始DOM对象
            //console.log(data.value); //得到被选中的值
            //console.log(data.othis); //得到美化后的DOM对象

            //console.log(data.value);

            if (!data.value)
                return;

            that.roleTypeChanged(data.value);
        });
    };

    //角色类型改变了
    SubPage.prototype.roleTypeChanged = function (typeId) {

        var that = this;
        if (that.optRoleType != typeId) {

            that.optRoleType = typeId;
            //角色类型改变了,需要重新加载模块树,因为有一些模块是只能管理员角色才能使用的.
            that.initModuleTree();

            that.ensureOrgTree();
        }
    };

    //确认机构树和当前角色类型的要求符合一致.
    //管理员角色,必须勾选所属机构,不能修改.
    //普通管理角色,有操作人员自己决定选择哪个.
    SubPage.prototype.ensureOrgTree = function () {

        var that = this;

        if (that.optRoleType == "2") {

            //管理员角色

            if (that.orgTree) {

                //禁用所有节点.
                that.orgTree.treeview('disableAll', { silent: true });
                //默认选中根节点
                setTimeout(function () {
                    that.orgTree.treeview('checkNode', [0, { silent: true }]);
                }, 300);
                
                


            }
        }
        else {
            if (that.orgTree) {
                //启用所有节点.
                that.orgTree.treeview('enableAll', { silent: true });
                that.orgTree.treeview('expandAll', { levels: 2, silent: true });
                that.orgTree.treeview('uncheckAll', { silent: true });
            }
        }

    };


    //给机构树绑定数据
    SubPage.prototype.bindOrgTreeData = function (treeData) {

        var that = this;

        // 加载树
        that.orgTree = $('#orgTreeview').treeview({

            showCheckbox: true,
            data: treeData


        });

        this.ensureOrgTree();


    };

    //给desktop客户端树绑定数据
    //SubPage.prototype.bindDesktopTreeData = function (treeData) {

    //    var that = this;

    //    // 加载树
    //    that.desktopTree = $('#desktopTreeview').treeview({
    //        showCheckbox: true,
    //        data: treeData,
    //        onNodeChecked: function (event, data) {
    //            $.each(data.nodes, function (_, item) {
    //                that.desktopTree.treeview('checkNode', [item.nodeId, { silent: false }]);
    //            });
    //        },
    //        onNodeUnchecked: function (event, data) {
    //            $.each(data.nodes, function (_, item) {
    //                that.desktopTree.treeview('uncheckNode', [item.nodeId, { silent: false }]);
    //            });
    //        }

    //    });

    //};

    //给机构树绑定数据
    SubPage.prototype.bindWebTreeData = function (treeData) {

        var that = this;

        // 加载树
        that.webTree = $('#webTreeview').treeview({
            showCheckbox: true,
            data: treeData,
            onNodeChecked: function (event, data) {
                $.each(data.nodes, function (_, item) {
                    that.webTree.treeview('checkNode', [item.nodeId, { silent: false }]);
                });
            },
            onNodeUnchecked: function (event, data) {
                $.each(data.nodes, function (_, item) {
                    that.webTree.treeview('uncheckNode', [item.nodeId, { silent: false }]);
                });
            }

        });

    };

    //给机构树绑定数据
    SubPage.prototype.bindAppTreeData = function (treeData) {

        var that = this;

        // 加载树
        that.appTree = $('#appTreeview').treeview({
            data: treeData,
            showCheckbox: true,
            onNodeChecked: function (event, data) {
                $.each(data.nodes, function (_, item) {
                    that.appTree.treeview('checkNode', [item.nodeId, { silent: false }]);
                });
            },
            onNodeUnchecked: function (event, data) {
                $.each(data.nodes, function (_, item) {
                    that.appTree.treeview('uncheckNode', [item.nodeId, { silent: false }]);
                });
            }

        });

    };

    //初始化模块权限树
    SubPage.prototype.initModuleTree = function () {
        var that = this;
        //roleDataApi.getAllCandidateModuleScope(neat.getUserToken(), 1, that.optRoleType, function (treeRawData) {

        //    var finalTreeData = treeDataMaker.make(treeRawData, "");

        //    that.bindDesktopTreeData(finalTreeData);
        //});

        roleDataApi.getAllCandidateModuleScope(neat.getUserToken(), 2, that.optRoleType, function (treeRawData) {

            var finalTreeData = treeDataMaker.make(treeRawData, "");

            that.bindWebTreeData(finalTreeData);
        });

        roleDataApi.getAllCandidateModuleScope(neat.getUserToken(), 3, that.optRoleType, function (treeRawData) {

            var finalTreeData = treeDataMaker.make(treeRawData, "");

            that.bindAppTreeData(finalTreeData);
        });
    };

    //初始化机构权限树
    SubPage.prototype.initOrgTree = function () {
        var that = this;

        roleDataApi.getAllCandidateOrgScope(neat.getUserToken(), that.getRoleParentOrgId(), function (treeRawData) {

            var finalTreeData = treeDataMaker.make(treeRawData, "");

            that.bindOrgTreeData(finalTreeData);


        });

        

    };




    //初始化
    SubPage.prototype.init = function () {

        var that = this;

        $("#txtOrg").val(that.orgName);

        that.initRoleType();

        that.initOrgTree();


        that.initFormVerify();

        that.initFormSubmit();


        $("#btnCancel").on("click", function () {
            that.closeDialog();
        });

        form.render();

    };


    exports(MODULE_NAME, new SubPage());

});