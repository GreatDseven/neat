//巡检点管理


layui.define(["jquery", 'element', 'form', 'table', 'laytpl', 'laypage','layer', 'neat', 'neatNavigator', 'commonDataApi'
    , 'workOrdersDataApi', 'neatUITools'], function (exports) {

        "use strict";

        var $ = layui.$;
        var table = layui.table;
        var form = layui.form;
        var laytpl = layui.laytpl;

        var neat = layui.neat;
        var laypage = layui.laypage;
        var neatNavigator = layui.neatNavigator;

        var commonDataApi = layui.commonDataApi;
        var pageDataApi = layui.workOrdersDataApi;

        var uiTools = layui.neatUITools;

        var defaultPageSize = 15;

        var SubPage = function () {

            this.currentPageIndex = 1;
            this.currentPageSize = defaultPageSize;
            this.currentSortColumn = "startTime";
            this.currentSortOrder = "desc";

            this.optOrderStatus = "0";


        };



        //初始化 工单状态
        SubPage.prototype._initOrderStatus = function () {

            var that = this;

            commonDataApi.getWorkOrderStatusData(function (resultData) {

                var d = {};
                d.data = resultData;
                laytpl($("#optCommonTemplate").html()).render(d, function (html) {
                    var parent = $("#optOrderStatus").html(html);
                    form.render('select', 'optOrderStatusForm');
                });


            });

            form.on('select(optOrderStatus)', function (data) {
                //console.log(data.elem); //得到select原始DOM对象
                //console.log(data.value); //得到被选中的值
                //console.log(data.othis); //得到美化后的DOM对象
                that.optOrderStatus = data.value;
            });
        };
        
        SubPage.prototype._bindTable = function () {

            var that = this;
            /* 所有的数据列
                id
                orderNo
                entperiseName
                content
                starter
                startTime
                receiver
                receiveTime
                receiveComment
                handler
                handlerTime
                handleResult
                confirmer
                confirmTime
                confirmResult
                status
            */

            /* 后端api要求的数据
                OrderNo  工单编号
                StartTime  发起时间
                EnterpriseName  企业名称
                Receiver  工单受理人
                Status  工单状态
                ConfirmTime 确认时间
            */

            function getSortColApiValue(colValue) {
                switch (colValue) {
                    case "startTime":
                        return "StartTime";
                    case "entperiseName":
                        return "EnterpriseName";
                    case "orderNo":
                        return "OrderNo";
                    case "confirmTime":
                        return "ConfirmTime";
                    default:
                        return "StartTime";

                }
            }


            var token = neat.getUserToken();

            var orderNo = $.trim($("#txtOrderNo").val());

            var submitUser = $.trim($("#txtSubmitUser").val());

            var orderByColumn = getSortColApiValue(that.currentSortColumn);
            var isDescOrder = that.currentSortOrder === "desc";

            var loadingIndex = layui.layer.load(1);

            pageDataApi.getWorkOrdersList(token,
                 orderNo, submitUser, that.optOrderStatus,
                orderByColumn, isDescOrder, that.currentPageIndex, that.currentPageSize,
                function (resultData) {
                    layui.layer.close(loadingIndex);

                    table.reload("resultTable", {
                        data: resultData.data,
                        initSort: {
                            field: that.currentSortColumn,
                            type: that.currentSortOrder
                        }
                    });
                    that._initPager(resultData.totalCount, that.currentPageIndex);

                }, function () {
                    layui.layer.close(loadingIndex);
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
                        that._bindTable(obj.curr, obj.limit);
                    }
                }
            });
        };

        SubPage.prototype._initTable = function () {

            var that = this;
            that.table = table.render({
                elem: '#resultTable',
                id: "resultTable",
                data: [],
                page: false,
                limit: defaultPageSize,
                autoSort: false,
                initSort: {
                    field: that.currentSortColumn,
                    type: that.currentSortOrder
                },
                cols: [
                    [
                        { type: 'checkbox', fixed: 'left' },
                        { field: 'orderNo', title: '工单编号', sort: true, width: "180" },
                        { field: 'entperiseName', title: '维保单位名称', sort: true, width: "180" },
                        { field: 'starter', title: '工单发起人', width: "120" },
                        { field: 'startTime', title: '发起时间', sort: true, width: "200" },
                        { field: 'receiver', title: '工单受理人', width: "120" },
                        { field: 'handler', title: '现场处理人', width: "120" },
                         { field: 'confirmer', title: '工单确认人', width: "120" },
                         { field: 'confirmTime', title: '确认时间', sort: true, width: "200" },
                         { field: 'status', title: '工单状态', align: 'center', width: "120", templet: function (d) { return uiTools.renderMaintainWorkOrdersStatus(d.status); } },

                        { field: 'status', fixed: 'right', title: '操作', width: "80", align: 'left', templet: function (d) { return uiTools.renderMaintainWorkOrdersOperation(d.status); } }
                    ]
                ],
            });

            table.on('sort(resultTable)', function (obj) {
                //console.log(obj.field); //当前排序的字段名
                //console.log(obj.type); //当前排序类型：desc（降序）、asc（升序）、null（空对象，默认排序）
                //console.log(this); //当前排序的 th 对象

                //尽管我们的 table 自带排序功能，但并没有请求服务端。
                //有些时候，你可能需要根据当前排序的字段，重新向服务端发送请求，从而实现服务端排序，如：



                that.currentSortColumn = obj.field;
                that.currentSortOrder = obj.type;

                that._bindTable();

                //layer.msg('服务端排序。order by ' + obj.field + ' ' + obj.type);
            });

            //监听表格复选框选择
            table.on('checkbox(resultTable)', function (obj) {
                //console.log(obj)
            });
            //监听工具条
            table.on('tool(resultTable)', function (obj) {
                var data = obj.data;
                if (obj.event === 'detail') {
                    layer.open({resize:false,
                        type: 2,
                        title: '工单详情',
                        area: ["808px", "650px"],
                        shade: [0.7, '#000'],
                        content: "/pages/maintenance/workOrders/seeWorkOrderDialog.html",
                        end: function () {
                            that._bindTable();
                        }, success: function (layero, index) {
                            var body = layer.getChildFrame('body', index);
                            var iframeWin = window[layero.find('iframe')[0]['name']];
                            // 调用 iframe里的js函数
                            iframeWin.loadData(data.id);
                        }
                    });
                } else if (obj.event === 'del') {
                    //layer.confirm('真的删除行么', function (index) {
                    //    obj.del();
                    //    layer.close(index);
                    //});
                } else if (obj.event === 'edit') {
                    //layer.alert('编辑行：<br>' + JSON.stringify(data))
                } else if (obj.event === 'confirm') {
                    layer.open({resize:false,
                        type: 2,
                        title:'工单确认',
                        area: ["808px", "650px"],
                        shade: [0.7, '#000'],
                        content: "/pages/maintenance/workOrders/confirmOrderDialog.html",
                        end: function () {
                            that._bindTable();
                        }, success: function (layero, index) {
                            var body = layer.getChildFrame('body', index);
                            var iframeWin = window[layero.find('iframe')[0]['name']];
                            // 调用 iframe里的js函数
                            iframeWin.loadData(data.id);
                        }
                    });
                }
            });
        }





        SubPage.prototype.init = function () {


            var that = this;

            //$(window).on("hashchange", function () {
            //    that._bindTable();
            //});

            this._initOrderStatus();

            this._initTable();
            this._initPager();

            $("#btnQuery").on("click", function () {
                that.currentPageIndex = 1;
                that._bindTable();
            });

            that._bindTable();

            $('#add').on('click', function () {
                layer.open({resize:false,
                    type: 2,
                    title: '发起工单',
                    area: ["808px", "405px"],
                    shade: [0.7, '#000'],
                    content: "/pages/maintenance/workOrders/createWorkerOrder.html",
                    end: function () {
                        that._bindTable();
                    }
                });
            });
        }
        exports("pageMaintenanceWorkOrderList", new SubPage());

    });