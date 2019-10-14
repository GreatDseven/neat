// 萤石云设备 通道 列表页面

layui.define(["jquery", 'form', 'table', 'laytpl', 'laypage', 'layer', 'commonDataApi', 'neat', 'neatNavigator', 'videoDeviceDataApi', 'neatWindowManager', 'neatUITools','neatPopupRepository'], function (exports) {

    "use strict";

    var $ = layui.$;

    var MODULE_NAME = "pageYSDeviceChannelList";

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



    var SubPage = function () {



        this.id = '';

        this.accountOrgType = "";
        this.accountOrgId = "";
    };

    SubPage.prototype.init = function () {

        var that = this;


        this.id = neatNavigator.getUrlParam("id");
        this.accountOrgType = neatNavigator.getUrlParam("account_org_type");
        this.accountOrgId = neatNavigator.getUrlParam("account_org_id");

        this.deviceEntId = neatNavigator.getUrlParam("device_ent_id");
        this.deviceBuildingId = neatNavigator.getUrlParam("device_building_id");
        this.deviceKeypartId = neatNavigator.getUrlParam("device_keypart_id");





        $("#txtCode").val(neatNavigator.getUrlParam("serial_no"));
        $("#txtName").val(neatNavigator.getUrlParam("name"));



        this.initTable();

    };

    // 服务端返回的字段
    var dataPropertyNames = {
        id: "id",
        name: "channelName",
        channelNo: "channelNo",
        videoLevel: "videoLevel",
        entId: "enterpriseId",
        entName:"entName",
        buildingId: "buildingId",
        buildingName: "buildingName",
        keypartId: "keypartId",
        keypartName: "keypartName",
        domainId:"domainId"
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
                { field: dataPropertyNames.id, hide: true }
                , { field: dataPropertyNames.channelNo, title: '通道编号',width:100 }
                , { field: dataPropertyNames.name, title: '通道名称' }
                //, { field: dataPropertyNames.videoLevel, title: '视频质量' }
                , { field: dataPropertyNames.keypartName, title: '所在部位' }
                , { field: dataPropertyNames.buildingName, title: '所在建筑' }
                , { fixed: 'right', title: '操作', toolbar: '#opColTemplate', align: 'center', width: 150 }
            ]]
        });

        //监听工具条
        table.on('tool(resultTable)', function (obj) {

            var data = obj.data;

            var url = "";

            if (obj.event === 'edit') {


                url = "/pages/device/videoDevice/YS/YSDeviceChannelUpdate.html?id=" + data[dataPropertyNames.id]
                    + "&account_org_type=" + encodeURIComponent(that.accountOrgType)
                    + "&account_org_id=" + encodeURIComponent(that.accountOrgId)
                    + "&suggest_ent_id=" + encodeURIComponent(that.deviceEntId)
                    + "&suggest_building_id=" + encodeURIComponent(that.deviceBuildingId)
                    + "&suggest_keypart_id=" + encodeURIComponent(that.deviceKeypartId)
                    + "&__=" + new Date().valueOf().toString();



                layui.neatWindowManager.openLayerInRootWindow({
                    resize: false,
                    type: 2,
                    title: '通道修改',
                    area: ["640px", "480px"],
                    content: url,
                    end: function () {
                        // 刷新数据
                        that.bindTable();
                    }
                });
            } else if (obj.event === 'video') {
              
                layui.neatPopupRepository.showVideoChannelWindow(data[dataPropertyNames.id]);
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
        $("#channelCount").html("0");
        pageDataApi.getYSDeviceChannels(neat.getUserToken(), this.id, 
            function (result) {


                $("#channelCount").html(result.totalCount);

                that.reloadTable(result.data);

                layui.layer.close(loadingIndex);
            },
            function () { //失败
                layui.layer.close(loadingIndex);

                that.reloadTable([]);

                //layer.msg("查询设备通道发生错误!");
            });

    };

    // 重新加载列表
    SubPage.prototype.reloadTable = function (resultData) {
        var that = this;

        table.reload("resultTable", {
            data: resultData

        });


    };

    //关闭对话框
    SubPage.prototype.closeDialog = function () {
        var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
        parent.layer.close(index); //再执行关闭
    };
    exports(MODULE_NAME, new SubPage());
});