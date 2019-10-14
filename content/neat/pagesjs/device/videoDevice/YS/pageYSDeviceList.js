// 萤石云设备 列表页面

layui.define(["jquery", 'form', 'table', 'laytpl', 'laypage', 'layer', 'commonDataApi', 'neat', 'neatNavigator', 'videoDeviceDataApi', 'neatWindowManager', 'neatUITools'], function (exports) {

    "use strict";

    var $ = layui.$;

    var MODULE_NAME = "pageYSDeviceList";

    var table = layui.table;
    var form = layui.form;
    var laytpl = layui.laytpl;
    var laypage = layui.laypage;
    var commonDataApi = layui.commonDataApi;

    var neatNavigator = layui.neatNavigator;
    var neat = layui.neat;
    var pageDataApi = layui.videoDeviceDataApi;

    var uiTools = layui.neatUITools;

    var limitCount = 999999999;

    //数据加载模式
    var enumLoadDataMode = {
        loadFromDb: 1,
        loadFromYS: 2
    };

    //数据比对结果
    var enumDataCompareResult = {
        add: 1,
        update: 2,
        delete: 3,
        same: 4
    };

    var SubPage = function () {

        this.orgId = ''; //账号所属机构的id

        this.appId = ''; //账号id
        this.orgType = "";//账号所属机构的类型 1 中心,2机构


    };

    SubPage.prototype.init = function () {

        var that = this;

        this.orgId = neatNavigator.getUrlParam("org_id");
        this.orgType = neatNavigator.getUrlParam("org_type");

        $("#appName").html(neatNavigator.getUrlParam("app_name"));

        this.appId = neatNavigator.getUrlParam("app_id");



        this.initTable();

        // 工具栏中的删除失效的设备事件
        $('#btnDelete').on('click', function () {

            that.deleteVoidDevices();

        });

        // 工具栏中的同步萤石云按钮事件
        $('#btnSync').on('click', function () {

            that.currentLoadDataMode = enumLoadDataMode.loadFromYS;

            that.bindTableFromYS();
        });

        $("#btnCancel").on("click", function () {
            that.closeDialog();
        });
    };

    // 服务端返回的字段
    var dataPropertyNames = {
        id: "id",
        compareResult: "status",
        serialNo: "serial",
        name: "deviceName",
        deviceType: "categoryName",
        deviceTypeId:"category",
        channelNum: "channelCount",
        
        entId: "enterpriseId",
        entName:"enterpriseName",
        buildingId: "buildingId",
        buildingName: "buildingName",
        keypartId: "keypartId",
        keypartName: "keypartName",

        domainId: ""

    };


    // 初始化 视频设备表格
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
            , height: 560
            , data: []
            , cols: [[
                { field: dataPropertyNames.compareResult, title: '', width:"30", templet: function (d) { return uiTools.renderVideoDeviceCompareResult(d[dataPropertyNames.compareResult]); } }

                , { field: dataPropertyNames.name, title: '设备名称', width: "180" }
                , { field: dataPropertyNames.serialNo, title: '设备系列号', width: "130" }
                , { field: dataPropertyNames.deviceType, title: '设备类别', width: "150" }
                , { field: dataPropertyNames.channelNum, title: '通道数', width: "80" }
                , { field: dataPropertyNames.keypartName, title: '所在部位',  width: "150"}
                , { field: dataPropertyNames.buildingName, title: '所在建筑', width: "150" }
                , { field: dataPropertyNames.entName, title: '所在单位', width: "180" }
                , { fixed: 'right', title: '操作', toolbar: '#opColTemplate', align: 'center', width: "120" }
            ]]
        });

        //监听工具条
        table.on('tool(resultTable)', function (obj) {


            var data = obj.data;

            var url = "";

            if (obj.event === 'del') {

                that.deleteRow(data);

            } else if (obj.event === 'edit') {


                url = "/pages/device/videoDevice/YS/YSDeviceUpdate.html?id=" + data[dataPropertyNames.id]
                    + "&account_org_type=" + encodeURIComponent(that.orgType)
                    + "&account_org_Id=" + encodeURIComponent(that.orgId)
                    + "&__=" + new Date().valueOf().toString();

                layui.neatWindowManager.openLayerInRootWindow({
                    resize: false,
                    type: 2,
                    title: '编辑视频设备',
                    area: ["640px", "480px"],
                    content: url,
                    end: function () {
                        // 刷新数据
                        that.bindTableFromDb();
                    }
                });
            } else if (obj.event === 'channelmgr') { //通道管理

                url = "/pages/device/videoDevice/YS/YSDeviceChannelList.html?id=" + data[dataPropertyNames.id]
                    + "&name=" + encodeURIComponent(data[dataPropertyNames.name])
                    + "&serial_no=" + encodeURIComponent(data[dataPropertyNames.serialNo])
                    + "&account_org_type=" + encodeURIComponent(that.orgType)
                    + "&account_org_id=" + encodeURIComponent(that.orgId)
                    + "&device_ent_id=" + encodeURIComponent(data[dataPropertyNames.entId])
                    + "&device_building_id=" + encodeURIComponent(data[dataPropertyNames.buildingId])
                    + "&device_keypart_id=" + encodeURIComponent(data[dataPropertyNames.keypartId])
                    + "&__=" + new Date().valueOf().toString();
                layui.neatWindowManager.openLayerInRootWindow({
                    resize: false,
                    type: 2,
                    title: '通道管理',
                    area: ["1100px", "760px"],
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
            that.bindTableFromDb();
        });

        that.bindTableFromDb();
    };

    //删除一条无效的视频设备
    SubPage.prototype.deleteRow = function (data) {

        var that = this;

        //不是 云端删除的设备不允许删除
        if (data[dataPropertyNames.compareResult] !== enumDataCompareResult.delete) {
            return;
        }

        var shouldDeleteItemIds = [];
        shouldDeleteItemIds.push(data[dataPropertyNames.id]);

        layer.confirm('确定要删除此视频设备吗？', { icon: 3, title: '提示' }, function (index) {

            pageDataApi.deleteYSDevice(neat.getUserToken(), shouldDeleteItemIds, function (result) {
                var messageStr = '';
               
                if (!result || result == null || result.length === 0) {
                    messageStr = '视频设备删除成功';
                } else {
                    messageStr = "以下视频设备删除失败:<br/>" + result.join("<br/>");
                }
                layer.msg(messageStr, function () {
                    that.bindTableFromDb();
                });
            }, function (errorMsg) {
              
                layer.msg('视频设备删除失败！', function () {
                    that.bindTableFromDb();
                });
            });
        });
    };

    //从数据库中加载设备数据
    SubPage.prototype.bindTableFromDb = function () {

        var that = this;
        var loadingIndex = layui.layer.load(1);
        $("#deviceCount").html("0");
        pageDataApi.loadYSVideoDeviceFromDb(neat.getUserToken(), this.appId,
            function (result) {
               

                $("#deviceCount").html(result.totalCount);

                that.reloadTable(result.data);

                layui.layer.close(loadingIndex);
            },
            function () { //失败
                layui.layer.close(loadingIndex);

                that.reloadTable([]);

                //layer.msg("查询视频设备发生错误!");
            });
    };

    //从萤石云中加载设备数据
    SubPage.prototype.bindTableFromYS = function () {

        var that = this;
        var loadingIndex = layui.layer.load(1);
        $("#deviceCount").html("0");
        pageDataApi.loadYSVideoDeviceFromYS(neat.getUserToken(), this.appId, 
            function (result) {

                $("#deviceCount").html(result.totalCount);

                that.reloadTable(result.data);

                layui.layer.close(loadingIndex);
            },
            function () { //失败
                layui.layer.close(loadingIndex);

                that.reloadTable([]);

                layer.msg("从萤石云同步视频设备发生错误!");
            });
    };


    // 重新加载列表
    SubPage.prototype.reloadTable = function (resultData) {
        var that = this;

        table.reload("resultTable", {
            data: resultData

        });


    };

    // 删除无效的视频设备
    SubPage.prototype.deleteVoidDevices = function () {
        var that = this;

        var data = table.cache["resultTable"];

        var shouldDeleteItemIds = [];
        var shouldDeleteItemNames = [];

        layui.each(data, function (_, item) {
            if (item[dataPropertyNames.compareResult] === enumDataCompareResult.delete) {
                shouldDeleteItemIds.push(item[dataPropertyNames.id]);
                shouldDeleteItemNames.push(item[dataPropertyNames.name]);
            }

        });


        if (shouldDeleteItemIds.length === 0) {
            layer.msg("暂无失效设备!");
            return;
        }

        layer.confirm("即将删除以下无效设备:<br/>" + shouldDeleteItemNames.join("<br/>")
            , function (index) {
                $("#btnDelete").attr("disabled", true);

                pageDataApi.deleteYSDevice(neat.getUserToken(), shouldDeleteItemIds, function (result) {
                    var messageStr = '';
                    $("#btnDelete").attr("disabled", false);
                    if (!result || result == null || result.length === 0) {
                      
                        messageStr = '视频设备删除成功';
                    } else {
                        messageStr = "以下视频设备删除失败:<br/>" + result.join("<br/>");
                    }
                    layer.msg(messageStr, function () {
                        that.bindTableFromDb();
                    });
                }, function (errorMsg) {
                        $("#btnDelete").attr("disabled", false);

                    layer.msg('视频设备删除失败！', function () {
                        that.bindTableFromDb();
                    });
                });

            layer.close(index);
        });
        

       

    };

    //关闭对话框
    SubPage.prototype.closeDialog = function () {
        var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
        parent.layer.close(index); //再执行关闭
    };

    exports(MODULE_NAME, new SubPage());
});