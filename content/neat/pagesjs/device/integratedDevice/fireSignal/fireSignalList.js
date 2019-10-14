// 消防器件 列表页面

layui.define(["jquery", 'form', 'table', 'laytpl', 'laypage', 'layer', 'commonDataApi', 'neat', 'neatNavigator', 'integratedDeviceDataApi', 'neatWindowManager', 'upload'], function (exports) {

    "use strict"

    var $ = layui.$;

    var MODULE_NAME = "pageIntegratedFireSignalList";

    var table = layui.table;
    var form = layui.form;
    var laytpl = layui.laytpl;
    var laypage = layui.laypage;
    var commonDataApi = layui.commonDataApi;
    var upload = layui.upload;
    var neatNavigator = layui.neatNavigator;
    var base = layui.neat;
    var pageDataApi = layui.integratedDeviceDataApi;

    var defaultPageSize = 15;





    var SubPage = function () {

        this.enterpriseId = '';
        this.hostId = '';
        this.uitdName = '';
        this.hostCode = '';
        this.uitdId = "";



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
        that.uitdId = neatNavigator.getUrlParam("uitd_id");

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


        // 工具栏中的删除事件
        $('#btnDelete').on('click', function () {
            var checkStatus = table.checkStatus('resultTable');
            var data = checkStatus.data;
            that.deleteById(data, null);
        });

        // 工具栏中的添加事件
        $('#btnAdd').on('click', function () {

            var url = "/pages/device/integratedDevice/fireSignal/fireSignalCreate.html?uitd_id=" + that.uitdId
                + "&uitd_code=" + encodeURIComponent(that.uitdCode)
                + "&host_code=" + encodeURIComponent(that.hostCode)
                + "&host_id=" + that.hostId
                + "&__=" + new Date().valueOf().toString();

            layui.neatWindowManager.openLayerInRootWindow({
                resize: false,
                type: 2,
                title: '添加消防器件',
                area: ["800px", "420px"],
                content: url,
                end: function () {
                    // 重新绑定数据   
                    that.bindTable();
                }
            });
        });

        // 导入器件
        $('#btnTemplateDownload').on('click', function () {
            var url = base.getDataApiBaseUrl() +"/OpenApi/FireUITD/DownloadFileSignalTemplate?token=" + base.getUserToken();
            that.exportFileByHTMLForm(url);
        });

        // 导入器件
        $('#btnImport').on('click', function () {
            var url = "/pages/device/integratedDevice/fireSignal/fireSignalImport.html?uitd_id=" + that.uitdId
                + "&host_id=" + that.hostId
                + "&__=" + new Date().valueOf().toString();

            layui.neatWindowManager.openLayerInRootWindow({
                resize: false,
                type: 2,
                title: '导入消防器件',
                area: ["700px", "180px"],
                content: url,
                end: function () {
                    // 重新绑定数据   
                    that.bindTable();
                }
            });
        });

        // 删除器件
        $('#btnDeleteAll').on('click', function () {
            that.deleteByAll();
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
        deviceID: "deviceID",
        systemCode: "systemCode"
    };


    //使用html form提交的方式 下载
    SubPage.prototype.exportFileByHTMLForm = function (url) {

        var form = $("<form/>").attr("action", url).attr("method", "post");

        form.appendTo('body').submit().remove();
    }


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
            height: 380,
            cols: [[


                { type: 'checkbox', fixed: 'left' }
                , { field: dataPropertyNames.id, hide: true }
                , { field: dataPropertyNames.code, title: '器件编号', sort: true }
                , { field: dataPropertyNames.name, title: '器件名称', sort: true }
                , { field: dataPropertyNames.category, title: '器件类别' }
                , { field: dataPropertyNames.address, title: '安装位置' }
                , { fixed: 'right', title: '操作', toolbar: '#opColTemplate', align: 'center', width: 150 }
            ]]
        });

        //监听工具条
        table.on('tool(resultTable)', function (obj) {
            var data = obj.data;

            var url = "";

            if (obj.event === 'del') {
                layer.confirm('确定要删除此消防器件吗？', { icon: 3, title: '提示' }, function (index) {
                    that.deleteById(new Array(data), obj);
                });
            } else if (obj.event === 'edit') {

                url = "/pages/device/integratedDevice/fireSignal/fireSignalUpdate.html?id=" + data[dataPropertyNames.id]
                    + "&uitd_code=" + encodeURIComponent(that.uitdCode)
                    + "&host_code=" + encodeURIComponent(that.hostCode)
                    + "&host_id=" + encodeURIComponent(that.hostId)
                    + "&__=" + new Date().valueOf().toString();

                layui.neatWindowManager.openLayerInRootWindow({
                    resize: false,
                    type: 2,
                    title: '编辑消防器件',
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


        /*
        返回的字段:

        "id": "848ec535-d143-4532-a63b-c09a9bba462a",
                "deviceID": "ee906706-0cb4-4fd5-82b6-57c2a2db2fc7",
                "systemCode": "00.55",
                "code": "00.55.01.00",
                "name": "手报1",
                "category": "61",
                "address": null
        */

        /*
        排序字段
            None = 0,
    Status = 1,
    HeartTime = 2,
    Name = 3,
    DomainName = 4,
    EntName = 5,
    BuildingName = 6,
    KeyPartName = 7,
    Code = 8,
        */

        function getSortColApiValue(colValue) {
            switch (colValue) {
                case "code":
                    return "Code";
                case "name":
                    return "Name";
                default:
                    return "None";

            }
        }

        var orderByColumn = getSortColApiValue(that.currentSortColumn);
        var isDescOrder = that.currentSortOrder === "desc";

        var keyword = $.trim($("#txtKeyword").val());

        var loadingIndex = layui.layer.load(1);
        pageDataApi.getFireSignalList(base.getUserToken(), keyword, this.uitdId, this.hostCode, orderByColumn, isDescOrder, that.currentPageIndex, that.currentPageSize,
            function (result) {
                that.reloadTable(result);

                layui.layer.close(loadingIndex);
            },
            function () { //失败
                layui.layer.close(loadingIndex);

                that.currentPageIndex = 1;
                that.reloadTable({ data: [], totalCount: 0 });

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
    };

    // 删除消防器件
    SubPage.prototype.deleteById = function (data, obj) {
        var that = this;

        if (data.length == 0) {
            layer.msg('请勾选删除项');
            return;
        } else {
            var datasArray = new Array(data.length);
            for (var i = 0; i < data.length; i++) {
                datasArray[i] = data[i][dataPropertyNames.id];
            }

            $("#del").attr("disabled", true);

            var finalData = {
                "deviceId": that.uitdId,
                "hostCode": that.hostCode,
                "ids": datasArray
            };

            pageDataApi.deleteFireSignal(base.getUserToken(), finalData, function (result) {
                var messageStr = '';
                $("#del").attr("disabled", false);
                if (!result || result == null || result.length === 0) {
                    if (obj != null) {
                        obj.del();
                    }

                    messageStr = '消防器件删除成功';
                } else {
                    messageStr = "以下消防器件删除失败:<br/>" + result.join("<br/>");
                }

                layer.msg(messageStr, function (index) {
                    that.bindTable();
                });
            }, function (errorMsg) {
                $("#del").attr("disabled", false);

                layer.msg('消防器件删除失败！', function (index) {
                    that.bindTable();
                });
            });
        }
    };

    // 删除所有消防器件
    SubPage.prototype.deleteByAll = function () {
        var that = this;

        $("#btnDeleteAll").attr("disabled", true);

        var finalData = {
            "deviceId": that.uitdId,
            "hostCode": that.hostCode,
            "ids": []
        };

        pageDataApi.deleteAllFireSignal(base.getUserToken(), finalData, function (result) {
            var messageStr = '';
            $("#btnDeleteAll").attr("disabled", false);
            if (!result || result == null || result.length === 0) {
                messageStr = '消防器件全部删除成功';
            } else {
                messageStr = "以下消防器件全部删除失败:<br/>" + result.join("<br/>");
            }

            layer.msg(messageStr, function (index) {
                that.bindTable();
            });
        }, function (errorMsg) {
            $("#btnDeleteAll").attr("disabled", false);

            layer.msg('消防器件全部删除失败！', function (index) {
                that.bindTable();
            });
        });
    };

    //关闭对话框
    SubPage.prototype.closeDialog = function () {
        var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
        parent.layer.close(index); //再执行关闭
    };
    exports(MODULE_NAME, new SubPage());
});