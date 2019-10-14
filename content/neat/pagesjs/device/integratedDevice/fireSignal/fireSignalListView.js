// 消防器件 列表 查看页面

layui.define(["jquery", 'form', 'table', 'laytpl', 'laypage', 'layer', 'commonDataApi', 'neat', 'neatNavigator', 'integratedDeviceDataApi', 'neatWindowManager'], function (exports) {

    "use strict"

    var $ = layui.$;

    var MODULE_NAME = "pageIntegratedFireSignalListView";

    var table = layui.table;
    var form = layui.form;
    var laytpl = layui.laytpl;
    var laypage = layui.laypage;
    var commonDataApi = layui.commonDataApi;

    var neatNavigator = layui.neatNavigator;
    var base = layui.neat;
    var pageDataApi = layui.integratedDeviceDataApi;

    var defaultPageSize = 15;





    var SubPage = function () {

        this.enterpriseId = '';
        this.hostId = '';
        this.uitdCode = '';
        this.hostCode = '';



        this.currentPageIndex = 1;
        this.currentPageSize = defaultPageSize;
        this.currentSortColumn = "id";
        this.currentSortOrder = "desc";

    };

    SubPage.prototype.init = function () {
        var that = this;


        this.currentPageIndex = 1;
        this.currentPageSize = defaultPageSize;
        this.currentSortColumn = "id";
        this.currentSortOrder = "desc";


        that.hostId = neatNavigator.getUrlParam("host_id");

        that.uitdCode = neatNavigator.getUrlParam("uitd_code");
        that.hostCode = neatNavigator.getUrlParam("host_code");

        that.enterpriseId = neatNavigator.getUrlParam("ent_id");

        $("#txtUITDCode").val(that.uitdCode);
        $("#txtHostCode").val(that.hostCode);

        this.initTable();
        this.initPager();


        $("#btnSearch").on("click", function () {

            that.bindTable();

        });
      

        $("#btnCancel").on("click", function () {
            that.closeDialog();
        });

        this.bindTable();
    };

    // 服务端返回的字段
    var dataPropertyNames = {
        id: "id",
        code: "code",
        name: "name",
        category: "category",
        address: "address",

    };

    SubPage.prototype.initPager = function (totalCount, pageIndex) {

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
                    that.bindTable(obj.curr, obj.limit);
                }
            }
        });
    };


    // 初始化 消防器件表格
    SubPage.prototype.initTable = function () {
        var that = this;

        // 渲染 用户信息传输装置列表
        table.render({
            elem: '#resultTable',
            id: 'resultTable',
            data: [],
            page: false,
            limit: defaultPageSize,
            autoSort: false,
            initSort: {
                field: that.currentSortColumn,
                type: that.currentSortOrder
            },
            height:380,
            cols: [[
               { type: 'checkbox', fixed: 'left' }
               , { field: dataPropertyNames.code, title: '器件编号' }
               , { field: dataPropertyNames.name, title: '器件名称', sort: true }
               , { field: dataPropertyNames.category, title: '器件类别', sort: true }
               , { field: dataPropertyNames.address, title: '安装位置' }
               , { fixed: 'right', title: '操作', toolbar: '#opColTemplate', align: 'center', width: 150 }
            ]]
        });

        //监听工具条
        table.on('tool(resultTable)', function (obj) {
            var data = obj.data;

            var url = "";

          if (obj.event === 'detail') {

                url = "/pages/device/integratedDevice/fireSignal/fireSignalDetail.html?id=" + data[dataPropertyNames.id]
                                + "&uitd_code=" + encodeURIComponent(that.uitdCode)
                                + "&host_code=" + encodeURIComponent(that.hostCode)
                               
                            + "&__=" + new Date().valueOf().toString();

                layui.neatWindowManager.openLayerInRootWindow({
                    resize: false,
                    type: 2,
                    title: '消防器件详情',
                    area: ["800px", "420px"],
                    content: url,
                    end: function () {
                        // 刷新数据
                        that.bindTable();
                    }
                });
            } 
        });

        // 监听排序列
        table.on('sort(resultTable)', function (obj) {
            that.currentSortColumn = obj.field;
            that.currentSortOrder = obj.type;
            // 绑定数据
            that.bindTable();
        });

        
    };

    // 加载列表数据
    SubPage.prototype.bindTable = function () {
        var that = this;

        function getSortColApiValue(colValue) {
            switch (colValue) {
                case "id":
                    return "ID";
                case "status":
                    return "Status";
                case "code":
                    return "Code";
                case "name":
                    return "Name";
                case "address":
                    return "Address";
                case "serviceName":
                    return "ServiceName";
                case "heartTime":
                    return "HeartTime";
                default:
                    return "None";

            }
        }

        var orderByColumn = getSortColApiValue(that.currentSortColumn);
        var isDescOrder = that.currentSortOrder === "desc";
        var keyword = $.trim($("#txtKeyword").val());
       
        var loadingIndex = layui.layer.load(1);
        pageDataApi.getFireSignalList(base.getUserToken(),keyword, this.uitdId, this.hostCode, orderByColumn, isDescOrder, that.currentPageIndex, that.currentPageSize,
            function (result) {
                that.reloadTable(result);

                layui.layer.close(loadingIndex);
            },
            function () { //失败
                layui.layer.close(loadingIndex);

                that.currentPageIndex = 1;
                that.reloadTable({ data: [], totalCount:0});

                //layer.msg("查询消防器件发生错误!");
            });
    };

    // 重新加载列表
    SubPage.prototype.reloadTable = function (resultData) {
        var that = this;

        table.reload("resultTable", {
            data: resultData.data,
            initSort: {
                field: that.currentSortColumn,
                type: that.currentSortOrder
            }
        });
        that.initPager(resultData.totalCount, that.currentPageIndex);
    }

    //关闭对话框
    SubPage.prototype.closeDialog = function () {
        var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
        parent.layer.close(index); //再执行关闭
    };
    exports(MODULE_NAME, new SubPage());
});