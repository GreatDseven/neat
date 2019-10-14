//巡检项目管理 
layui.define(["jquery", 'form', 'table', 'laytpl', 'laypage','layer', 'commonDataApi', 'neatDataApi', 'neat', 'neatNavigator'], function (exports) {

    "use strict";

    var $ = layui.$;
    var table = layui.table;
    var form = layui.form;
    var laytpl = layui.laytpl;
    var laypage = layui.laypage;
    var commonDataApi = layui.commonDataApi;
    var neatDataApi = layui.neatDataApi;
    var neatNavigator = layui.neatNavigator;
    var base = layui.neat;

    var limitCount = 15;

    var SubPage = function () {
        this.projectType = '';
        this.projectSubType = '';
        this.currentPageSize = -1;
        this.currentPageIndex = 1;
        this.currentPageSize = 15;
        this.orderByCol = 'proName';
        this.orderSort = 'desc';
    };

    SubPage.prototype.initDefaultValues = function () {

        this.projectType = '';
        this.projectSubType = '';
        this.currentPageSize = -1;
        this.currentPageIndex = 1;
        this.currentPageSize = 15;
        this.orderByCol = 'proName';
        this.orderSort = 'desc';

    };

    SubPage.prototype.init = function () {
        var that = this;

        this.initDefaultValues();

        that.showHidenFunction();

        that.hashChanged();

        // 加载 巡检项目列表
        this.initTable();

        // 初始化监听事件
        this.initEventInfo();

        // 填充项目类型下拉框
        this.loadAllProjectType();

        // 加载列表数据
        this.bindTable();

        // 工具栏中的删除事件
        $('#del').on('click', function () {
            var type = $(this).data('type');
            if (type == 'del') {
                var checkStatus = table.checkStatus('projectManageList');
                var data = checkStatus.data;
                that.deleteById(data, null);
            };

        });

        // 工具栏中的添加事件
        $('#add').on('click', function () {
            // 获取 选中左侧导航栏的相关数据
            var treeNodedata = neatNavigator.getSelectedTreeNodeInfo();
            if (!treeNodedata) {
                return;
            }

            layer.open({resize:false,
                type: 2,
                title: '添加巡检项目',
                area: ["810px", "424px"],
                content: "/pages/patrol/projectManage/createProjectDialog.html?enterpriseId=" + treeNodedata.enterpriseId
                    + "&name=" + treeNodedata.name
                    + "&domainId=" + treeNodedata.domainId,
                end: function () {
                    // 刷新数据
                    that.getProjectList(function (result) {
                        that.reloadTable(result);
                    });
                }
            });
           
        });

        //关联模板按钮事件
        $('#btnMapTemplate').on('click', function () {
            var treeNodedata = neatNavigator.getSelectedTreeNodeInfo();
            if (!treeNodedata) {
                return;
            }
            layer.open({resize:false,
                type: 2,
                title: '关联巡检项目模板',
                area: ["1350px", "700px"],
                content: "/pages/patrol/projectManage/mapProjectTemplateDialog.html?domainId=" + treeNodedata.domainId + "&enterpriseId=" + treeNodedata.enterpriseId,
                shade: [0.7, '#000'],
                end: function () {
                    // 监听 关闭后的事件
                    that.getProjectList(function (result) {
                        that.reloadTable(result);
                    });
                }
            });
        });

        // 搜索事件
        $('#btnSearch').on('click', function () {
            that.currentPageIndex = 1;
            that.getProjectList(function (result) {
                that.reloadTable(result);
            });
        });
    };

    // 加载列表数据
    SubPage.prototype.bindTable = function () {

        var that = this;

        var loadingIndex = layui.layer.load(1);

        that.getProjectList(function (result) {

            layui.layer.close(loadingIndex);

            that.reloadTable(result);
        }, function () {
            layui.layer.close(loadingIndex);
        });
    };

    SubPage.prototype.hashChanged = function (e) {
        var that = this;
        $(window).on("hashchange", function () {

            var treeData = neatNavigator.getSelectedTreeNodeInfo();
            if (!treeData) {
                return;
            }
            if (!treeData.fullAccess) {
                $("#add").attr("disabled", true);
                $("#del").attr("disabled", true);
                $("#btnMapTemplate").attr("disabled", true);
            }
            else {
                $("#add").attr("disabled", false);
                $("#del").attr("disabled", false);
                $("#btnMapTemplate").attr("disabled", false);

            }

            that.loadAllProjectType();
            that.showHidenFunction();
            that.bindTable();

        });
    };

    //显示隐藏 关联模板的 按钮 ,树选中心时 显示,树选企业时隐藏
    SubPage.prototype.showHidenFunction = function () {

        var treeNodedata = neatNavigator.getSelectedTreeNodeInfo();//{ domainId:"", enterpriseId:""}
        if (!treeNodedata) {
            return;
        }
        if (!treeNodedata.domainId) {
            $("#btnMapTemplate").hide();
        }
        else {
            $("#btnMapTemplate").show();
        }

    };

    // 获取项目子类型
    SubPage.prototype.loadAllProjectSubType = function (projectType) {
        if (projectType == '') {
            laytpl($('#optProjectSubTypeTemplate').html()).render({}, function (html) {
                var parent = $("#slProjectSubType").html('');
                // 刷新表单
                form.render(null, "first");
            });

        } else {
            // 获取 选中左侧导航栏的相关数据
            var treeNodedata = neatNavigator.getSelectedTreeNodeInfo();
            if (!treeNodedata) {
                return;
            }
            commonDataApi.getProChildType(base.getUserToken(), treeNodedata.domainId, treeNodedata.enterpriseId, projectType, function (result) {
                var resultData = {};
                resultData.data = result;

                laytpl($('#optProjectSubTypeTemplate').html()).render(resultData, function (html) {
                    var parent = $("#slProjectSubType").html(html);
                });

                // 刷新表单
                form.render(null, "first");
            });
        }
    };



    // 获取搜索框中的项目类型集合
    SubPage.prototype.loadAllProjectType = function () {
        // 获取 选中左侧导航栏的相关数据
        var treeNodedata = neatNavigator.getSelectedTreeNodeInfo();
        if (!treeNodedata) {
            return;
        }
        commonDataApi.getProjectType('', base.getUserToken(), treeNodedata.domainId, treeNodedata.enterpriseId, function (result) {
            var resultData = {};
            resultData.data = result;

            laytpl($('#optProjectTypeTemplate').html()).render(resultData, function (html) {
               $("#slProjectType").html(html);
            });

            // 刷新下表单
            form.render('select', "first");
        });
    };


    // 加载 巡检项目列表，并监听相关的表格事件
    SubPage.prototype.initTable = function (data) {
        var that = this;

        // 渲染 项目类型列表
        table.render({
            elem: '#projectManageList'
            , page: false
            , limit: limitCount
            , autoSort: false
            , initSort: {
                field: this.orderByCol,
                type: this.orderSort
            }
            , load: false
            , data: []
            , cols: [[
                   { type: 'checkbox', fixed: 'left' }
                 , { field: 'entName', title: '所属单位名称' }
                 , { field: 'entId', title: '单位ID', hide: true }
                 , { field: 'domainId', title: 'domainId', hide: true }
                 , { field: 'proName', title: '巡检项目名称', sort: true }
                 , { field: 'typeName', title: '项目类型' }
                 , { field: 'childTypeName', title: '项目子类型', sort: true }
                 , { field: 'desContent', title: '项目描述' }
                 , { fixed: 'right', title: '操作', toolbar: '#operationBar', align: 'center', width: 150 }
            ]]

        });
    };

    // 初始化监听事件（from和table）
    SubPage.prototype.initEventInfo = function () {
        var that = this;

        // 项目类型选中改变
        form.on('select(projectType)', function (data) {
            // 获取选中的项目类型
            that.projectType = data.value
            that.projectSubType = "";


            // 填充项目类型下拉框
            that.loadAllProjectSubType(that.projectType);
        });

        // 项目类型选中改变
        form.on('select(projectSubType)', function (data) {
            // 获取选中的项目类型
            that.projectSubType = data.value
        });

        //监听工具条
        table.on('tool(projectManageListItem)', function (obj) {
            var data = obj.data;
            if (obj.event === 'del') {
                layer.confirm('确定的删除巡检项目么？', { icon: 3, title: '提示' }, function (index) {
                    that.deleteById(new Array(data), obj);
                });
            } else if (obj.event === 'edit') {
                layer.open({resize:false,
                    type: 2,
                    title: '编辑巡检项目',
                    area: ["810px", "424px"],
                    content: "/pages/patrol/projectManage/editProjectDialog.html?id=" + data.id + "&domainId=" + data.domainId + "&enterpriseId=" + data.entId,
                    end: function () {
                        // 刷新数据
                        that.bindTable();
                    }
                });
            }
        });

        // 监听排序列
        table.on('sort(projectManageListItem)', function (obj) {
            that.orderByCol = obj.field;
            that.orderSort = obj.type;
            that.bindTable();
        });
    };

    // 加载项目列表
    SubPage.prototype.getProjectList = function (callback,failcallback) {
        var that = this;
        var url = "/OpenApi/OsiItem/GetOsiItem";
        // 获取 选中左侧导航栏的相关数据
        var treeNodedata = neatNavigator.getSelectedTreeNodeInfo();
        if (!treeNodedata) {
            return;
        }
        var result = -1;
        switch (this.orderByCol) {
            case 'typeName':
                result = 2;
                break;
            case 'childTypeName':
                result = 3;
                break;
            case 'proName':
                result = 1;
                break;
        }

        var data = {
            token: base.getUserToken(),
            itemName: $.trim($("#projectTypeName").val()),
            typeId: that.projectType,
            childTypeId: that.projectSubType,
            domainId: treeNodedata.domainId,
            enterpriseId: treeNodedata.enterpriseId,
            orderByColumn: result,
            isDescOrder: that.orderSort === "desc",
            pageIndex: that.currentPageIndex,
            pageSize: limitCount
        };

        layui.neatDataApi.sendGet(url, data, callback, failcallback);
    };

    // 重新加载列表
    SubPage.prototype.reloadTable = function (result) {
        var that = this;
        layui.each(result.data, function (_, item) {

            if (!item.editable) { //禁用勾选
                item.LAY_DISABLE_CHECK = true;
            }
        });
        table.reload("projectManageList", {
            data: result.data,
            initSort: {
                field: that.orderByCol,
                type: that.orderSort
            }
        });
        that.initPage(result.totalCount, that.currentPageIndex);
    }

    // 删除巡检项目类型
    SubPage.prototype.deleteById = function (data, obj) {
        var that = this;
       
        if (data.length == 0) {
            layer.confirm('请勾选删除项', {}, function (index) {
                layer.close(index);
            });
        } else {
            var datasArray = new Array(data.length);
            for (var i = 0; i < data.length; i++) {
                datasArray[i] = data[i].id;
            }
            $("#del").attr("disabled", true);
            var url = '/OpenApi/OsiItem/DeleteOsiItem?token=' + base.getUserToken();
            layui.neatDataApi.sendPostJson(url, datasArray, function (result) {
                var messageStr = '';
                $("#del").attr("disabled", false);
                if (!result || result == null || result.length === 0) {
                    if (obj != null) {
                        obj.del();
                    }

                    messageStr = '巡检项目删除成功';
                } else {
                    messageStr = "以下巡检项目删除失败:<br/>" + result.join("<br/>");
                }

                layer.msg(messageStr, function (index) {
                    that.bindTable();
                });
            }, function (errorMsg) {
                $("#del").attr("disabled", false);

                layer.msg('删除失败', function (index) {
                    that.bindTable();
                });
            });
        }
    };

    // 初始化分页
    SubPage.prototype.initPage = function (totalCount, pageIndex) {
        var that = this;

        if (!totalCount) {
            totalCount = 0;
        }
        if (!pageIndex) {
            pageIndex = 1;
        }

        laypage.render({
            elem: 'tableProjectListPager',
            count: totalCount, //数据总数，从服务端得到
            limit: that.currentPageSize,
            hash: false,
            layout: ['count', 'prev', 'page', 'next'],
            curr: pageIndex,
            jump: function (obj, first) {
                that.currentPageIndex = obj.curr;
                that.currentPageSize = obj.limit;

                //首次不执行
                if (!first) {
                    that.bindTable();
                }
            }
        });
    }


    exports("pagePatrolProjectManage", new SubPage());
});