//设备管理,neat水信号表
layui.define(["jquery", 'form', 'table', 'laytpl', 'layer', 'commonDataApi', 'neatDataApi', 'neat', 'neatNavigator', 'tppInfoDataApi', 'neatUITools', "neatWindowManager"], function (exports) {

    "use strict";

    var MODULE_NAME = "pagethirdPushPlatformInfoList";

    var $ = layui.$;
    var table = layui.table;
    var laytpl = layui.laytpl;
    var form = layui.form;

    var neatNavigator = layui.neatNavigator;
    var pageDataApi = layui.tppInfoDataApi;
    var commonDataApi = layui.commonDataApi;
    var laypage = layui.laypage;


    var neat = layui.neat;
    var uiTools = layui.neatUITools;


    var SubPage = function () {
        this.currentPageIndex = 1;
        this.currentPageSize = 15;
        this.currentSortColumn = "platformType";
        this.currentSortOrder = "desc";

        this.optPlatformType = "";
    };


    SubPage.prototype.init = function () {
        var that = this;

        this.initOnChangedEvent();

        // 加载平台类型
        this.initPlatformType();

        // 初始化表定义
        this.initTable();

        //表格编辑事件
        this.initTableOperateColEvent();

        //按钮事件
        that.initButtonEvent();

        // 加载列表数据
        this.bindTable();
    };

    SubPage.prototype.initOnChangedEvent = function () {

        var that = this;
        $(window).on("hashchange", function () {

            var treeData = neatNavigator.getSelectedTreeNodeInfo();
            if (!treeData) {
                return;
            }
            if (!treeData.fullAccess) {
                $("#btnDelete").attr("disabled", true);
            }
            else {
                $("#btnDelete").attr("disabled", false);
            }

            that.domainId = treeData.domainId;
            that.currentPageIndex = 1;
            that.bindTable();
        });
    };

    SubPage.prototype.initPlatformType = function () {
        var that = this;
        commonDataApi.getTPPTypes(function (data) {
            laytpl($('#optPlatformTypeTemplate').html()).render(data, function (html) {
                var parent = $("#optPlatformType").html(html);
                form.render('select', 'optPlatformTypeForm');
            });
        });

        form.on('select(optPlatformType)', function (data) {
            //console.log(data.elem); //得到select原始DOM对象
            //console.log(data.value); //得到被选中的值
            //console.log(data.othis); //得到美化后的DOM对象
            that.optPlatformType = data.value;
        });
    };


    // 加载 巡检项目列表，并监听相关的表格事件
    SubPage.prototype.initTable = function (data) {
        var that = this;

        // 渲染 项目类型列表
        table.render({
            elem: '#resultTable',
            id: "resultTable",
            data: [],
            page: false,
            limit: that.currentPageSize,
            autoSort: false,
            initSort: {
                field: that.currentSortColumn,
                type: that.currentSortOrder
            }
            , cols: [[
                /*

        SubPage.prototype.initTable = function (data) {
            {
                "id": "9fe434b3-df6f-11e9-a50b-c85b76a0162a",
                "domainId": "14e24cec-5c29-4799-b582-5d715b4b628d",
                "domainName": "尼特_中心1",
                "apiAddress": "192.168.0.100:5400/v2",
                "appId": "123",
                "appKey": "123",
                "token": "",
                "platformTypeDesc": 1,
                "createTime": "2019-09-25 16:37:31"
            }

                 */
                { type: 'checkbox', fixed: 'left', width: 100 }
                , { field: 'id', hide: true, }
                , { field: 'domainName', title: '中心名称', width: 280, sort: true }
                , { field: 'apiAddress', title: '接口地址', width: 280 }
                , { field: 'appId', title: 'APP_ID', width: 120 }
                , { field: 'appKey', title: 'APP_KEY', width: 120 }
                , { field: 'token', fixed: 'right', title: 'TOKEN', width: 150 }
                , { field: 'platformType', fixed: 'right', title: '平台类型', width: 150, sort: true }
                , { field: 'createTime', fixed: 'right', title: '创建时间', width: 150, sort: true }
                , { field: 'option', fixed: 'right', title: '操作', width: 150, align: 'center', toolbar: '#opColTemplate' }
            ]]
        });


        table.on('sort(resultTable)', function (obj) {
            //console.log(obj.field); //当前排序的字段名
            //console.log(obj.type); //当前排序类型：desc（降序）、asc（升序）、null（空对象，默认排序）
            //console.log(this); //当前排序的 th 对象

            //尽管我们的 table 自带排序功能，但并没有请求服务端。
            //有些时候，你可能需要根据当前排序的字段，重新向服务端发送请求，从而实现服务端排序，如：

            that.currentSortColumn = obj.field;
            that.currentSortOrder = obj.type;

            that.bindTable();

            //layer.msg('服务端排序。order by ' + obj.field + ' ' + obj.type);
        });

    };
    //绑定主表数据
    SubPage.prototype.bindTable = function () {
        var that = this;

        var treeData = neatNavigator.getSelectedTreeNodeInfo();
        function getSortColApiValue(colValue) {
            switch (colValue) {
                case "platformType":
                    return "PlatformType";
                case "createTime":
                    return "CreateTime";
                default:
                    return "CreateTime";

            }
        }
        var orderByColumn = getSortColApiValue(that.currentSortColumn);
        var isDescOrder = that.currentSortOrder === "desc";
        var loadingIndex = layui.layer.load(1);

        pageDataApi.getInfoLists(neat.getUserToken(), $('#txtkeyWord').val(), treeData.domainId, that.optPlatformType,
            orderByColumn, isDescOrder, that.currentPageIndex, that.currentPageSize, function (result) {            
                // 关闭窗口
                layui.layer.close(loadingIndex);
                //成功
                table.reload("resultTable", {
                    data: result.data,
                    initSort: {
                        field: that.currentSortColumn,
                        type: that.currentSortOrder
                    }
                });
                that._initPager(result.totalCount, that.currentPageIndex);

            }, function () {
                layui.layer.close(loadingIndex);
                that.currentPageIndex = 1;
                table.reload("resultTable", {
                    data: [],
                    initSort: {
                        field: that.currentSortColumn,
                        type: that.currentSortOrder
                    }
                });
                that._initPager(0, 1);
            });
    };

    SubPage.prototype._initPager = function (totalCount, pageIndex) {

        var that = this;

        if (!totalCount) {
            totalCount = 0;
        }
        if (!pageIndex) {
            pageIndex = 1;
        }

        laypage.render({
            elem: 'resultTablePager',
            count: totalCount, //数据总数，从服务端得到
            limit: that.currentPageSize,
            hash: false,
            layout: ['count', 'prev', 'page', 'next'],
            curr: pageIndex,
            jump: function (obj, first) {
                //obj包含了当前分页的所有参数，比如：
                //console.log(obj.curr); //得到当前页，以便向服务端请求对应页的数据。
                //console.log(obj.limit); //得到每页显示的条数

                that.currentPageIndex = obj.curr;
                that.currentPageSize = obj.limit;

                //首次不执行
                if (!first) {
                    //do something
                    that.bindTable();
                }
            }
        });
    };

    //按钮事件
    SubPage.prototype.initButtonEvent = function () {
        var that = this;

        //添加按钮事件
        var that = this;
        $('#btnQuery').on('click', function () {
            that.bindTable();
        });

        //添加按钮事件
        var that = this;
        $('#btnAdd').on('click', function () {
            var treeData = neatNavigator.getSelectedTreeNodeInfo();
            if (!treeData) {
                return;
            }

            var url = "/pages/foundationInfo/thirdPushPlatform/thirdPushPlatformCreate.html?domainId=" + treeData.domainId
                + "&__=" + new Date().valueOf().toString();

            layer.open({
                resize: false,
                type: 2,
                title: '添加第三方平台信息',
                area: ["800px", "300px"],
                shade: [0.7, '#000'],
                content: url,
                end: function () {
                    that.bindTable();
                }
            });
        });

        //删除按钮事件
        $("#btnDelete").on("click", function () {

            var checkStatus = table.checkStatus('resultTable');
            var data = checkStatus.data;

            if (data.length === 0) {
                layer.msg("请勾选需要删除的第三方平台信息!");
                return;
            }

            layer.confirm("确定要删除这些第三方平台信息吗?", {}, function (index) {

                $("#btnDelete").attr("disabled", true);

                var ids = [];
                $.each(data, function (_, item) {
                    ids.push(item.id);
                });

                that.RemoveTPPInfo(ids, function () {
                    $("#btnDelete").attr("disabled", false);
                    layer.close(index);
                });
            });
        });
    };

    // 关闭当前对话框
    SubPage.prototype.closeDialog = function () {
        var index = parent.layer.getFrameIndex(window.name);
        parent.layer.close(index);
    };

    //初始化表格操作列的事件
    SubPage.prototype.initTableOperateColEvent = function () {
        var that = this;

        var treeData = neatNavigator.getSelectedTreeNodeInfo();

        table.on('tool(resultTable)', function (obj) {
            var data = obj.data;
            if (obj.event === 'del') {
                layer.confirm('确定要删除:' + data.domainName + "'第三方平台信息?", function (index) {
                    var sendData = [];
                    sendData.push(data.id);
                    that.RemoveTPPInfo(sendData, function () {
                        layer.close(index);
                    });
                });
            } else if (obj.event === 'edit') {
                var url = "/pages/foundationInfo/thirdPushPlatform/thirdPushPlatformUpdate.html?id=" + data.id
                    + "&__=" + new Date().valueOf().toString();

                layui.neatWindowManager.openLayerInRootWindow({
                    resize: false,
                    type: 2,
                    title: '编辑第三方平台信息',
                    area: ["800px", "300px"],
                    shade: [0.7, '#000'],
                    content: url,
                    end: function () {
                        that.bindTable();
                    }
                });
            }
        });
    };

    // 重新加载列表
    SubPage.prototype.reloadTable = function (result) {
        table.reload("resultTable", {
            data: result,
        });
    };

    SubPage.prototype.RemoveTPPInfo = function (ids,callback)
    {
        var that = this;
        pageDataApi.deleteInfo(neat.getUserToken(), ids

            , function (sd) { //成功或者部分成功

                $("#btnDelete").attr("disabled", false);
                var alertMsg = "";

                if (!sd || sd == null || sd.length === 0) {
                    alertMsg = "第三方平台信息删除成功!";

                }
                else {
                    alertMsg = "以下第三方平台信息未能成功删除:<br/>" + sd.join("<br/>");
                }

                layer.msg(alertMsg, function () {
                    that.bindTable();
                    callback();
                });
            }
            , function (fd) {

                $("#btnDelete").attr("disabled", false);

                layer.msg("删除失败!", function () {
                    that.bindTable();
                });
            });
    };

    exports(MODULE_NAME, new SubPage());
});