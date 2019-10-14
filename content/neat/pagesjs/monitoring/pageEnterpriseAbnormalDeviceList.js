// 企业非正常设备列表
layui.define(["jquery", 'form', 'table', 'laytpl', 'laypage', 'layer',
    'commonDataApi', 'neatDataApi', 'neat', 'neatNavigator', 'monitorDataApi', 'neatUITools',"neatPopupRepository"], function (exports) {

        "use strict";


    var MODULE_NAME = "pageEnterpriseAbnormalDeviceList";

    var $ = layui.$;
    var table = layui.table;

    var layer = layui.layer;
    var laypage = layui.laypage;

    var neatNavigator = layui.neatNavigator;
    var pageDataApi = layui.monitorDataApi;

    var neat = layui.neat;
    var uiTools = layui.neatUITools;

    var popups = layui.neatPopupRepository;


    var defaultPageSize = 999999999;

    var SubPage = function () {};

    SubPage.prototype.init = function () {

        var that = this;




        this.enterpriseId = neatNavigator.getUrlParam("enterprise_id");
        //this.enterpriseName = neatNavigator.getUrlParam("enterprise_name");
        this.abnormalStatus = neatNavigator.getUrlParam("abnormal_status");

        //if (!this.enterpriseName && this.enterpriseName != "") {
        //    $("#txtEntName").val(this.enterpriseName);
        //}


        // 初始化表定义
        this.initTable();

        //表格操作列事件
        //this.initTableOperateColEvent();

        //按钮事件
        that.initButtonEvent();

        // 加载列表数据
        this.bindTable();


    };

    //绑定主表数据
    SubPage.prototype.bindTable = function () {
        var that = this;
        var loadingIndex = layer.load(1);

        pageDataApi.queryEnterpriseAbnormalDeviceList(neat.getUserToken(), that.enterpriseId, that.abnormalStatus, function (result) {
            table.reload("resultTable", {
                data: result.data
            });
           
            layer.close(loadingIndex);
        },
            function () { //失败
                layui.layer.close(loadingIndex);
     
                table.reload("resultTable", {
                    data: [],
                });

                //layer.msg("查询发生错误!");
            });
    };

    ////初始化表格操作列的事件
    //SubPage.prototype.initTableOperateColEvent = function () {
    //    var that = this;

    //    table.on('tool(resultTable)', function (obj) {
    //        var data = obj.data;

    //        if (obj.event === 'detail') {

    //            popups.showDeviceDetailInfoWindow(data.id, data.deviceCategory);

    //        } else if (obj.event === 'realtime-data') {

    //            popups.showDeviceRealTimeDataWindow(data.id, data.deviceCategory);

    //        } else if (obj.event === 'history-data') {

    //            popups.showDeviceHistoryDataWindow(data.id, data.deviceCategory);

    //        } else if (obj.event === 'location') {

    //       popups.showDeviceMapLocationWindow(data.enterpriseId);

    //        } else if (obj.event === 'events') {

    //            popups.showDeviceHistoryEventWindow(data.id, data.deviceCategory, data.name);
    //        }

    //    });
    //};

    //按钮事件
    SubPage.prototype.initButtonEvent = function () {
        var that = this;

        //关闭按钮事件
        $("#btnCancel").on("click", function () {
            that.closeDialog();
        });

      
       
    };


    var dataPropertyName = {
        
        deviceName: "name",
        code:"code",
        address:"address",
        keypartName:"keypartName",
        buildingName:"buildingName",
        deviceId: "id",
        deviceCategory: "systemCategory",
        deviceType: "deviceType"
    };


    // 关闭当前对话框
    SubPage.prototype.closeDialog = function () {
        var index = parent.layer.getFrameIndex(window.name);
        parent.layer.close(index);
    };

    // 加载 巡检项目列表，并监听相关的表格事件
    SubPage.prototype.initTable = function (data) {
        var that = this;

        table.render({
            elem: '#resultTable'
            , page: false
            , autoSort: false
            , data: []
            , limit: defaultPageSize
            , loading: true
            , height:"450px"
            , cols: [[
               
                { field: dataPropertyName.deviceName, title: '设备名称', width: 180 }
                , { field: dataPropertyName.code, title: '设备编码', width: 250 }
                , { field: dataPropertyName.address, title: '安装位置', width: 180 }
                , { field: dataPropertyName.keypartName, title: '所属部位', width: 180 }
                , { field: dataPropertyName.buildingName, title: '所属建筑', width: 190 }
              
                //, { fixed: 'right', title: '操作', width: 170, align: 'center', toolbar: '#opColTemplate' }
            ]]


        });
    };



    exports(MODULE_NAME, new SubPage());
});