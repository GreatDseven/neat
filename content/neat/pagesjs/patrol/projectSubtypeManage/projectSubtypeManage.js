
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
        this.currentPageSize = -1;
        this.currentPageIndex = 1;
        this.currentPageSize = 15;
        this.orderByCol = 'typeName';
        this.orderSort = 'desc';
    };

    SubPage.prototype.initDefaultValues = function () {

        this.projectType = '';
        this.currentPageSize = -1;
        this.currentPageIndex = 1;
        this.currentPageSize = 15;
        this.orderByCol = 'typeName';
        this.orderSort = 'desc';
    };

    SubPage.prototype.init = function () {
        var that = this;

        this.initDefaultValues();

        that.showHidenFunction();

        that.initHashChangedEvent();

        // 加载项目类型
        that.loadAllProjectType();
        // 实例化数据列表
        that.initTable();
        // 实例化分页
        that.initPage();
        // 实例化 监听事件
        that.initEventInfo();

        // 加载数据
        that.bindTable();

        // 工具栏中的删除事件
        $('#checkedDelete').on('click', function () {

            var type = $(this).data('type');
            if (type == 'delete') {
                var checkStatus = table.checkStatus('projectSubtypeList')
                  , data = checkStatus.data;

                that.deleteById(data, null);
            }
        });

        // 工具栏中的添加事件
        $('#addProject').on('click', function () {
            var treeNodedata = neatNavigator.getSelectedTreeNodeInfo();
            if (!treeNodedata) {
                return;
            }
            layer.open({resize:false,
                type: 2,
                title:'添加巡检子类型',
                area: ["464px", "360px"],
                content: "/pages/patrol/projectSubtypeManage/createProjectSubtypeDialog.html?domainId=" + treeNodedata.domainId + "&enterpriseId=" + treeNodedata.enterpriseId + "&name=" + treeNodedata.name,
                shade: [0.7, '#000'],
                end: function () {
                    // 监听 关闭后的事件
                    that.bindTable();
                }
            });
        });

        $('#search').on('click', function () {
            that.currentPageIndex = 1;
            that.bindTable();
        });


        $('#btnMapTemplate').on('click', function () {
            var treeNodedata = neatNavigator.getSelectedTreeNodeInfo();
            if (!treeNodedata) {
                return;
            }
            layer.open({resize:false,
                type: 2,
                title: '关联巡检子类型模板',
                area: ["1100px", "700px"],
                content: "/pages/patrol/projectSubtypeManage/mapSubtypeTemplateDialog.html?domainId=" + treeNodedata.domainId + "&enterpriseId=" + treeNodedata.enterpriseId ,
                shade: [0.7, '#000'],
                end: function () {
                    // 监听 关闭后的事件
                    that.bindTable();
                }
            });
        });
        
    };

    // 查询并将填充表格数据
    SubPage.prototype.bindTable = function () {
        var that = this;
        var loadingIndex = layui.layer.load(1);
        that.getProjectSubTypeList(function (result) {
            layui.layer.close(loadingIndex);
            that.reloadTable(result);
        }, function () {
            layui.layer.close(loadingIndex);
        });
    };

    // 左侧导航栏发生改变的时候，项目子类型刷新数据
    SubPage.prototype.initHashChangedEvent = function (e) {

        var that = this;
        $(window).on("hashchange", function () {
            that.projectType = '';


            var treeData = neatNavigator.getSelectedTreeNodeInfo();
            if (!treeData) {
                return;
            }
            if (!treeData.fullAccess) {
                $("#addProject").attr("disabled", true);
                $("#checkedDelete").attr("disabled", true);
                $("#btnMapTemplate").attr("disabled", true);
            }
            else {
                $("#addProject").attr("disabled", false);
                $("#checkedDelete").attr("disabled", false);
                $("#btnMapTemplate").attr("disabled", false);

            }
           
            that.loadAllProjectType();
            that.bindTable();
            that.showHidenFunction();

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
                var parent = $("#slProjectType").html(html);
            });

            // 刷新下表单
            form.render(null, "first");
        });
    };

    // 加载 巡检项目列表，并监听相关的表格事件
    SubPage.prototype.initTable = function (data) {
        var that = this;

        // 渲染 项目子类型列表
        table.render({
            elem: '#projectSubtypeList'
            , page: false
            , limit: limitCount
            , autoSort: false
            , initSort: {
                field: 'typeName',
                type: 'desc'
            }
            , load: false
            , data: []
            , cols: [[
               { type: 'checkbox', fixed: 'left' }
            , { field: 'entId', title: '单位ID', hide: true }
            , { field: 'domainId', title: 'domainId', hide: true }
            , { field: 'typeName', title: '项目子类型名称', sort: true }
            , { field: 'parentTypeName', title: '项目类型名称', sort: true }
            , { field: 'domainName', title: '所属中心' }
            , { field: 'entName', title: '所属单位' }
            , { field: 'proTypeTime', title: '创建时间', sort: true }
            , { fixed: 'right', title: '操作', toolbar: '#operationBar', align: 'center', width: 150 }
            ]]
        });
    };

    // 重新加载巡检子项列表
    SubPage.prototype.reloadTable = function (result) {
        var that = this;

        layui.each(result.data, function (_, item) {

            if (!item.editable) { //禁用勾选
                item.LAY_DISABLE_CHECK = true;
            }
        });

        table.reload("projectSubtypeList", {
            data: result.data,
            initSort: {
                field: that.orderByCol,
                type: that.orderSort
            }
        });

        that.initPage(result.totalCount, that.currentPageIndex);
    }

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
            elem: 'tableProjectSubListPager',
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

    // 初始化监听事件（from和table）
    SubPage.prototype.initEventInfo = function () {
        var that = this;
        // 项目类型选中改变
        form.on('select(projectType)', function (data) {
            // 获取选中的项目类型
            that.projectType = data.value;
        });


        //监听工具条
        table.on('tool(projectSubTypeItem)', function (obj) {


            var data = obj.data;
            if (obj.event === 'del') {


                layer.confirm('确定删除此项目子类型', { title: '提示' }, function (index) {
                    that.deleteById(new Array(data), obj);
                });
            } else if (obj.event === 'edit') {
                layer.open({resize:false,
                    type: 2,
                    title: "编辑巡检子类型",
                    area: ["464px", "360px"],
                    content: "/pages/patrol/projectSubtypeManage/editProjectSubtypeDialog.html?id=" + data.id + "&domainId=" + data.domainId + "&enterpriseId=" + data.entId,
                    end: function () {
                        // 监听 关闭后的事件
                        that.bindTable();
                    }
                });
            }
        });

        // 监听排序列
        table.on('sort(projectSubTypeItem)', function (obj) {
            that.orderByCol = obj.field;
            that.orderSort = obj.type;
            that.bindTable();
        });
    };

    // 加载项目子类型列表
    SubPage.prototype.getProjectSubTypeList = function (callback,failcallbak) {
        var that = this;
        var url = "/OpenApi/OsiItem/GetOsiSubTypeItem";
        // 获取 选中左侧导航栏的相关数据
        var treeNodedata = neatNavigator.getSelectedTreeNodeInfo();
        if (!treeNodedata) {
            return;
        }
        var result = -1;
        switch (that.orderByCol) {
            case 'proTypeTime':
                result = 1;
                break;
            case 'parentTypeName':
                result = 2;
                break;
            case 'typeName':
                result = 3;
                break;
        }

        var data = {
            token: base.getUserToken(),
            childTypeName: $.trim($("#projectTypeName").val()),
            typeId: that.projectType,
            childTypeId: that.projectSubType,
            domainId: treeNodedata.domainId,
            enterpriseId: treeNodedata.enterpriseId,
            orderByColumn: result,
            isDescOrder: that.orderSort === "desc",
            pageIndex: that.currentPageIndex,
            pageSize: limitCount
        };

        layui.neatDataApi.sendGet(url, data, callback,failcallbak);
    };

    // 删除项目子类型
    SubPage.prototype.deleteById = function (data, obj) {
        var that = this;

       

        if (data.length == 0) {
            layer.confirm('请勾选删除项', {}, function (index) {
                layer.close(index);
            });
        } else {
            $("#checkedDelete").attr("disabled", true);

            var datasArray = new Array(data.length);
            for (var i = 0; i < data.length; i++) {
                datasArray[i] = data[i].id;
            }

            var url = '/OpenApi/OsiItem/DeleteChildProType?token=' + base.getUserToken();
            layui.neatDataApi.sendPostJson(url, datasArray, function (result) {
                $("#checkedDelete").attr("disabled", false);
                var messageStr = '';
                if (!result || result == null || result.length === 0) {
                    if (obj != null) {
                        obj.del();
                    }

                    messageStr = '项目子类型删除成功';
                } else {
                    messageStr = "以下项目子删除失败:<br/>" + result.join("<br/>");
                }
                layer.msg(messageStr, function (index) {
                    that.bindTable();
                });
            }, function (errorMsg) {
                $("#checkedDelete").attr("disabled", false);

                layer.msg('删除失败', function (index) {
                    that.bindTable();
                });
            });
        }
    };

    exports('projectSubtypeManage', new SubPage());
});