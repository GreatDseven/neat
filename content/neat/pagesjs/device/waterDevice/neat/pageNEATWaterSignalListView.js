//设备管理,neat水信号表 查看页面
layui.define(["jquery", 'form', 'table', 'laytpl', 'layer', 'commonDataApi', 'neatDataApi', 'neat', 'neatNavigator', 'waterDeviceDataApi', 'neatUITools', "neatWindowManager"], function (exports) {
    "use strict";

    var MODULE_NAME = "pageNEATWaterSignalListView";

    var $ = layui.$;
    var table = layui.table;

    var layer = layui.layer;

    var neatNavigator = layui.neatNavigator;
    var pageDataApi = layui.waterDeviceDataApi;

    var neat = layui.neat;
    var uiTools = layui.neatUITools;


    var SubPage = function () {


        this.gatewayId = "";
        this.gatewayName = "";
        this.gatewayCode = "";

    };



    SubPage.prototype.init = function () {


        var that = this;

        this.gatewayId = neatNavigator.getUrlParam("gateway_id");



        this.getWatewayInfo();

        // 初始化表定义
        this.initTable();

        //表格编辑事件
        this.initTableOperateColEvent();

        //按钮事件
        that.initButtonEvent();

        // 加载列表数据
        this.bindTable();


    };

    //获取并绑定网关信息
    SubPage.prototype.getWatewayInfo = function () {
        var that = this;
       
        pageDataApi.getNEATWaterGatewayById(neat.getUserToken(), that.gatewayId, function (result) {

            that.gatewayName = result.code;
            that.gatewayCode = result.name;

            $("#txtGatewayCode").val(result.code);
            $("#txtGatewayName").val(result.name);
           
        });
    };

    //绑定主表数据
    SubPage.prototype.bindTable = function () {
        var that = this;
        var loadingIndex = layer.load(1);

        pageDataApi.queryNEATWaterSignalInGateway(neat.getUserToken(), that.gatewayId, function (result) {
            that.reloadTable(result);

            layer.close(loadingIndex);
        }, function () {
            layui.layer.close(loadingIndex);
        });
    };

    //按钮事件
    SubPage.prototype.initButtonEvent = function () {
        var that = this;

        //关闭按钮事件
        $("#btnCancel").on("click", function () {
            that.closeDialog();
        });

        
       
    };


    // 关闭当前对话框
    SubPage.prototype.closeDialog = function () {
        var index = parent.layer.getFrameIndex(window.name);
        parent.layer.close(index);
    };

    // 加载 巡检项目列表，并监听相关的表格事件
    SubPage.prototype.initTable = function (data) {
        var that = this;

        // 渲染 项目类型列表
        table.render({
            elem: '#resultTable'
            , page: false
            , height: 320
            , autoSort: false
            , loading: true
            , limit: 99999999999
            , data: []
            , cols: [[
                /*
                  "id": "47dee7f7-d28c-4e9b-8438-07c781a42d7f",
                            "code": "00.00.00.01",
                            "name": "信号1",
                            "signalValueType": 2,
                            "signalCategory": 2,
                            "address": "地址1"
                 */
                { type: 'checkbox', fixed: 'left', width: 100 }
                , { field: 'id', hide: true, }
                , { field: 'code', title: '信号编码', width: 150 }
                , { field: 'name', title: '信号名称', width: 280 }
                , { field: 'signalValueType', title: '设备类型', width: 120, templet: function (d) { return uiTools.renderWaterSignalValueCategory(d.signalValueType); } }
                , { field: 'signalCategory', title: '信号类型', width: 120, templet: function (d) { return uiTools.renderPhysicalSignalCategory(d.signalCategory); } }
                , { field: 'address', title: '安装位置', width: 300 }
                , { field: 'operation', fixed: 'right', title: '操作', width: 150, align: 'center', toolbar: '#opColTemplate' }
            ]]


        });
    };


    //初始化表格操作列的事件
    SubPage.prototype.initTableOperateColEvent = function () {
        var that = this;

        table.on('tool(resultTable)', function (obj) {
            var data = obj.data;
            if (obj.event === 'detail') {

                var url = "/pages/device/waterDevice/neat/NEATWaterSignalDetail.html?"
                    + "signal_id=" + encodeURIComponent(data.id)
                    + "&gateway_code=" + encodeURIComponent(that.gatewayCode)
                    + "&gateway_name=" + encodeURIComponent(that.gatewayName);


                layui.neatWindowManager.openLayerInRootWindow({
                    resize: false,
                    type: 2,
                    title: 'NEAT水信号详情',
                    area: ["806px", "580px"],
                    shade: [0.7, '#000'],
                    content: url
                    
                });

            }
        });
    };



    // 重新加载列表
    SubPage.prototype.reloadTable = function (result) {
        var that = this;


        table.reload("resultTable", {
            data: result
        });

    };




    exports(MODULE_NAME, new SubPage());
});