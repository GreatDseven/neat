// 消防系统 列表  查看页面

layui.define(["jquery", 'form', 'table', 'laytpl', 'laypage', 'layer', 'commonDataApi', 'neat', 'neatNavigator', 'integratedDeviceDataApi', 'neatWindowManager'], function (exports) {
   
    "use strict"
    
    var $ = layui.$;

    var MODULE_NAME = "pageIntegratedFireHostListView";

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

    var uitdDataPropertyNames = {
        id: "id",
        code: "code",
        name: "name",
        transmissionProtocolId: "transmissionProtocol",
        messageProtocolId: "messageProtocol",
        deviceTypeId: "transportDeviceType",
        manufacturerId: "manufacturer",
        enterpriseId: "enterpriseId",
        enterpriseName: "enterpriseName",
        buildingId: "buildingId",
        keypartId: "keypartId",
        address: "address",
        domainId: "domainId"
    };


    SubPage.prototype.init = function () {
        var that = this;


        that.uitdId = neatNavigator.getUrlParam("uitd_id");

        pageDataApi.getUITDById(base.getUserToken(), that.uitdId, function (result) {

            that.uitdCode = result[uitdDataPropertyNames.code];
            that.uitdName = result[uitdDataPropertyNames.name];
            that.enterpriseId = result[uitdDataPropertyNames.enterpriseId];

            $("#txtUITDCode").val(that.uitdCode);
            $("#txtUITDName").val(that.uitdName);

        });



        this.initTable();


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
            ,height:480
            , data: []
            , cols: [[
                { type: 'checkbox', fixed: 'left' }
                , { field: dataPropertyNames.hostCode, title: '主机编号' }
                , { field: dataPropertyNames.hostName, title: '主机名称'  }
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

            if (obj.event === 'detail') {

                url = "/pages/device/integratedDevice/firehost/fireHostDetail.html?id=" + data[dataPropertyNames.id]
                    + "&uitd_id=" + that.uitdId
                    + "&uitd_code=" + that.uitdCode
                    + "&__=" + new Date().valueOf().toString();

                layui.neatWindowManager.openLayerInRootWindow({
                    resize: false,
                    type: 2,
                    title: '消防系统详情',
                    area: ["810px", "424px"],
                    content: url,
                    end: function () {
                        // 刷新数据
                        that.bindTable();
                    }
                });
            } else if (obj.event === 'firesignalmgr') {
                url = "/pages/device/integratedDevice/fireSignal/fireSignalListView.html?host_id=" + data[dataPropertyNames.id]
                    + "&uitd_code=" + that.uitdCode
                    + "&host_code=" + encodeURIComponent( data[dataPropertyNames.hostCode] )
                    + "&host_name=" + encodeURIComponent(data[dataPropertyNames.hostName])
                     + "&uitd_id=" + that.uitdId
                    + "&__="+ new Date().valueOf().toString();
                layui.neatWindowManager.openLayerInRootWindow({
                    resize: false,
                    type: 2,
                    title: '消防器件列表',
                    area: ["1000px", "700px"],
                    content: url
                });
            }
        });

        

        that.bindTable();
    };

    // 加载列表数据
    SubPage.prototype.bindTable = function () {

        var that = this;
        var loadingIndex = layui.layer.load(1);
        pageDataApi.getFireHostByUITDId(base.getUserToken(),this.uitdId,
            function (result) {
                
                that.reloadTable(result);

                layui.layer.close(loadingIndex);
            },
            function () { //失败
                layui.layer.close(loadingIndex);

                that.reloadTable( [] );

                //layer.msg("查询消防系统发生错误!");
            });
    };

    // 重新加载列表
    SubPage.prototype.reloadTable = function (result) {
        var that = this;
        
        table.reload("resultTable", {
            data: result,
           
        });
       
    }

    
    //关闭对话框
    SubPage.prototype.closeDialog = function () {
        var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
        parent.layer.close(index); //再执行关闭
    };
    exports(MODULE_NAME, new SubPage());
});