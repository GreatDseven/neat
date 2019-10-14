//设备事件列表
layui.define(["jquery", 'form', 'table', 'laytpl','laypage', 'layer', 'commonDataApi', 'neatDataApi', 'neat', 'neatNavigator', 'generalQueryDataApi', 'neatUITools'], function (exports) {
    "use strict";

    var MODULE_NAME = "pageDeviceEventList";

    var $ = layui.$;
    var table = layui.table;

    var layer = layui.layer;
    var laypage = layui.laypage;

    var neatNavigator = layui.neatNavigator;
    var pageDataApi = layui.generalQueryDataApi;

    var neat = layui.neat;
    var uiTools = layui.neatUITools;


    var SubPage = function () {

        this.deviceId = "";
        this.deviceCategory = "";
        this.deviceName = "";
    };

    SubPage.prototype.init = function () {

        var that = this;

        this.deviceId = neatNavigator.getUrlParam("device_id");
        this.deviceCategory = neatNavigator.getUrlParam("device_category");
        this.deviceName = neatNavigator.getUrlParam("device_name");
      
        $("#txtDeviceName").html(this.deviceName);

        // 初始化表定义
        that.initTable();

        //按钮事件
        that.initButtonEvent();

        // 加载列表数据
        that.bindTable();

    };

    //绑定主表数据
    SubPage.prototype.bindTable = function () {
        var that = this;
        var loadingIndex = layer.load(1);

        pageDataApi.queryDeviceEventList(neat.getUserToken(), that.deviceId,that.deviceCategory, function (result) {

            $("#lblTotalCount").html(result.data.length + "条");

            table.reload("resultTable", {
                data: result.data
            });

            layer.close(loadingIndex);
        },
            function () { //失败
                layui.layer.close(loadingIndex);
                that.currentPageIndex = 1;
                table.reload("resultTable", {
                    data: []
                });
                //layer.msg("查询设备发生错误!");
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

        var isWaterDevice = false;
        var waterDeviceTypes = [
            "3","201"
        ];

        if (waterDeviceTypes.indexOf(this.deviceCategory) != -1) {
            isWaterDevice = true;
        }

        table.render({
            elem: '#resultTable'
            , page: false
            , height: 320
            , autoSort: false
            , data: []
            , limit: 999999
            , loading: true
            , cols: [[
          
                { field: 'category', title: '事件类型',  templet: function (d) { return uiTools.renderDeviceAlarmStatusByWord(d.category); } }
                , { field: 'souceCategory', title: '内容' }
                , { field: 'eventData', title: '数值',  hide: !isWaterDevice }
                , { field: 'threshold', title: '阀值',  hide: !isWaterDevice }
                , { field: 'occurTime', title: '报警时间',  hide: isWaterDevice }
                , { field: 'firstOccurTime', title: '首次报警时间',  hide: !isWaterDevice }
                , { field: 'lastOccurTime', title: '末次报警时间',  hide: !isWaterDevice }
                , { field: 'occurCount', title: '报警次数',  hide: !isWaterDevice }
               
            ]]


        });
    };

    exports(MODULE_NAME, new SubPage());
});