// 消防系统 列表页面

layui.define(["jquery", 'form', 'table', 'laytpl', 'laypage', 'layer', 'commonDataApi', 'neat', 'neatNavigator', 'integratedDeviceDataApi', 'neatWindowManager'], function (exports) {

    "use strict"

    var $ = layui.$;

    var MODULE_NAME = "pageIntegratedFireHostList";

    var table = layui.table;
    var form = layui.form;
    var laytpl = layui.laytpl;
    var laypage = layui.laypage;
    var commonDataApi = layui.commonDataApi;

    var neatNavigator = layui.neatNavigator;
    var base = layui.neat;
    var pageDataApi = layui.integratedDeviceDataApi;

    var limitCount = 999999999;




    var SubPage = function () {


        this.enterpriseId = '';
        this.uitdId = '';
        this.uitdName = '';
        this.uitdCode = '';
    };

    SubPage.prototype.init = function () {
        var that = this;

        that.uitdId = neatNavigator.getUrlParam("uitd_id");
        that.uitdCode = neatNavigator.getUrlParam("uitd_code");
        that.uitdName = neatNavigator.getUrlParam("uitd_name");
        that.enterpriseId = neatNavigator.getUrlParam("ent_id");

        $("#txtUITDCode").val(that.uitdCode);
        $("#txtUITDName").val(that.uitdName);

        this.initTable();

        // 工具栏中的删除事件
        $('#btnDelete').on('click', function () {

            var checkStatus = table.checkStatus('resultTable');
            var data = checkStatus.data;
            that.deleteById(data, null);


        });

        // 工具栏中的添加事件
        $('#btnAdd').on('click', function () {

            var url = "/pages/device/integratedDevice/firehost/fireHostCreate.html?uitd_id=" + that.uitdId
                + "&uitd_code=" + encodeURIComponent(that.uitdCode)
                + "&ent_id=" + that.enterpriseId
                + "&__=" + new Date().valueOf().toString();

            layui.neatWindowManager.openLayerInRootWindow({
                resize: false,
                type: 2,
                title: '添加消防系统',
                area: ["810px", "424px"],
                content: url,
                end: function () {
                    // 重新绑定数据   
                    that.bindTable();
                }
            });
        });

        $("#btnCancel").on("click", function () {
            that.closeDialog();
        });
    };

    // 服务端返回的字段
    var dataPropertyNames = {
        id: "id",
        hostCode: "code",
        hostName: "name",
        hostType: "deviceType",
        manufacturer: "manufacturer",
        address: "address",
        keypartName: "keypartName",
        buildingName: "buildingName",

    };


    // 初始化 消防系统表格
    SubPage.prototype.initTable = function () {
        var that = this;

        // 渲染 用户信息传输装置列表
        table.render({
            elem: '#resultTable',
            id: 'resultTable'
            , page: false
            , limit: limitCount
            , autoSort: false
            , loading: false
            , height: 480
            , data: []
            , cols: [[
                { type: 'checkbox', fixed: 'left' }
                , { field: dataPropertyNames.hostCode, title: '主机编号' }
                , { field: dataPropertyNames.hostName, title: '主机名称' }
                , { field: dataPropertyNames.hostType, title: '主机类别' }
                , { field: dataPropertyNames.manufacturer, title: '生产厂商' }
                , { field: dataPropertyNames.address, title: '安装位置' }
                , { field: dataPropertyNames.keypartName, title: '所在部位' }
                , { field: dataPropertyNames.buildingName, title: '所在建筑' }
                , { fixed: 'right', title: '操作', toolbar: '#opColTemplate', align: 'center', width: 150 }
            ]]
        });

        //监听工具条
        table.on('tool(resultTable)', function (obj) {
            var data = obj.data;

            var url = "";

            if (obj.event === 'del') {
                layer.confirm('确定要删除此消防系统吗？', { icon: 3, title: '提示' }, function (index) {
                    that.deleteById(new Array(data), obj);
                });
            } else if (obj.event === 'edit') {

                url = "/pages/device/integratedDevice/firehost/fireHostUpdate.html?id=" + data[dataPropertyNames.id]
                    + "&uitd_id=" + that.uitdId
                    + "&uitd_code=" + that.uitdCode
                    + "&__=" + new Date().valueOf().toString();

                layui.neatWindowManager.openLayerInRootWindow({
                    resize: false,
                    type: 2,
                    title: '编辑消防系统',
                    area: ["810px", "424px"],
                    content: url,
                    end: function () {
                        // 刷新数据
                        that.bindTable();
                    }
                });
            } else if (obj.event === 'firesignalmgr') {
                url = "/pages/device/integratedDevice/fireSignal/fireSignalList.html?host_id=" + data[dataPropertyNames.id]
                    + "&host_code=" + encodeURIComponent(data[dataPropertyNames.hostCode])
                    + "&uitd_code=" + that.uitdCode
                    + "&uitd_id=" + that.uitdId
                    + "&ent_id=" + that.enterpriseId
                    + "&__=" + new Date().valueOf().toString();
                layui.neatWindowManager.openLayerInRootWindow({
                    resize: false,
                    type: 2,
                    title: '消防器件管理',
                    area: ["1000px", "700px"],
                    content: url
                });
            }
        });

        // 监听排序列
        table.on('sort(resultTable)', function (obj) {
            that.orderByCol =
                obj.field;
            that.orderSort = obj.type;
            // 绑定数据
            that.bindTable();
        });

        that.bindTable();
    };

    // 加载列表数据
    SubPage.prototype.bindTable = function () {

        var that = this;
        var loadingIndex = layui.layer.load(1);
        pageDataApi.getFireHostByUITDId(base.getUserToken(), this.uitdId,
            function (result) {

                that.reloadTable(result);

                layui.layer.close(loadingIndex);
            },
            function () { //失败
                layui.layer.close(loadingIndex);

                that.reloadTable([]);

                //layer.msg("查询消防系统发生错误!");
            });
    };

    // 重新加载列表
    SubPage.prototype.reloadTable = function (resultData) {
        var that = this;

        table.reload("resultTable", {
            data: resultData


        });


    };

    // 删除消防系统
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

            $("#btnDelete").attr("disabled", true);

            pageDataApi.deleteFireHost(base.getUserToken(), { uitdId: that.uitdId, ids: datasArray }, function (result) {
                var messageStr = '';
                $("#btnDelete").attr("disabled", false);
                if (!result || result == null || result.length === 0) {
                    if (obj != null) {
                        obj.del();
                    }

                    messageStr = '消防系统删除成功';
                } else {
                    messageStr = "以下消防系统删除失败:<br/>" + result.join("<br/>");
                }
                layer.msg(messageStr, function (index) {
                    that.bindTable();
                });
            }, function (errorMsg) {
                $("#btnDelete").attr("disabled", false);

                layer.msg('消防系统删除失败！', function (index) {
                    that.bindTable();
                });
            });
        }
    };

    //关闭对话框
    SubPage.prototype.closeDialog = function () {
        var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
        parent.layer.close(index); //再执行关闭
    };
    exports(MODULE_NAME, new SubPage());
});