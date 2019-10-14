//设备管理,neat水信号表
layui.define(["jquery", 'form', 'table', 'laytpl', 'layer', 'commonDataApi', 'neatDataApi', 'neat', 'neatNavigator', 'waterDeviceDataApi', 'neatUITools', "neatWindowManager"], function (exports) {

    "use strict";

    var MODULE_NAME = "pageNEATWaterSignalList";

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
        this.gatewayName = neatNavigator.getUrlParam("gateway_name");
        this.gatewayCode = neatNavigator.getUrlParam("gateway_code");

        $("#txtGatewayCode").val(this.gatewayCode);
        $("#txtGatewayName").val(this.gatewayName);


        // 初始化表定义
        this.initTable();

        //表格编辑事件
        this.initTableOperateColEvent();

        //按钮事件
        that.initButtonEvent();

        // 加载列表数据
        this.bindTable();


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

        //添加按钮事件
        var that = this;
        $('#btnAdd').on('click', function () {


            var url = "/pages/device/waterDevice/neat/NEATWaterSignalCreate.html?"
                + "gateway_id=" + encodeURIComponent( that.gatewayId)
                + "&gateway_code=" +  encodeURIComponent(that.gatewayCode)
                + "&gateway_name=" + encodeURIComponent(that.gatewayName)
                + "&__=" + new Date().valueOf().toString();


            layui.neatWindowManager.openLayerInRootWindow({
                resize: false,
                type: 2,
                title: '添加NEAT水信号',
                area: ["806px", "580px"],
                shade: [0.7, '#000'],
                content: url,
                end: function () {
                    that.bindTable();
                }
            });
        });

        //删除按钮事件
        $("#btnDelete").on("click", function () {

            var checkStatus = table.checkStatus('resultTable');
            var data = checkStatus.data;

            if (data.length === 0) {
                layer.msg("请勾选需要删除的NEAT水信号!");
                return;
            }

            layer.confirm("确定要删除这些NEAT水信号吗?", {}, function (index) {

                $("#btnDelete").attr("disabled", true);

                var ids = [];
                $.each(data, function (_, item) {
                    ids.push(item.id);
                });

                that.delSignal(ids, function () {
                    $("#btnDelete").attr("disabled", false);
                    layer.close(index);
                });
                

            });
        });
       
    };

    SubPage.prototype.delSignal = function (ids,callback) {
        var that = this;
        pageDataApi.deleteNEATWaterSignal(neat.getUserToken(), ids

            , function (sd) { //成功或者部分成功

                callback();
                
                var alertMsg = "";

                if (!sd || sd == null || sd.length === 0) {
                    alertMsg = "NEAT水信号删除成功!";

                }
                else {

                    alertMsg = "以下NEAT水信号未能成功删除:<br/>" + sd.join("<br/>");
                }

                layer.msg(alertMsg, function () {
                    that.bindTable();
                });
            }
            , function (fd) {

                callback();

                layer.msg("删除失败!", function () {
                    that.bindTable();

                });



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

    "id": "0a668570-f40c-4de2-b699-e7492061556d",
            "code": "00.01.01.07",
            "name": "00.01.01.07@00.00.00.00.23.7D",
            "deviceType": 0,
            "deviceTypeName": "数字量",
            "signalTypeName": "数字量",
            "address": "00.00.00.00.23.7D地址",
            "wgwId": "8f0b5fdb-b495-4a81-ab01-e5b9d5c1e795",
            "domainID": "891200fd-360a-11e5-bee7-000ec6f9f8b3",
            "entpriseID": "b3940577-3c8c-43a2-9fa8-3fb3673b97bc",
            "buildingID": "ed3090ea-f62e-4188-bcfe-86edf14a7f40",
            "keypartID": "46e8fed8-d91c-4d1e-89a4-562d574aaed7"

                 */
                { type: 'checkbox', fixed: 'left', width: 100 }
                , { field: 'id', hide: true, }
                , { field: 'code', title: '信号编码', width: 150 }
                , { field: 'name', title: '信号名称', width: 280 }
                , { field: 'deviceTypeName', title: '设备类型', width: 120  }
                , { field: 'signalTypeName', title: '信号类型', width: 120 }
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
            if (obj.event === 'del') {
                layer.confirm('确定要删除NEAT水信号:' + data.name + "?", function (index) {

                    var sendData = [];
                    sendData.push(data.id);
                    that.delSignal(sendData, function () {
                        layer.close(index);
                    });

                    
                });
            } else if (obj.event === 'edit') {

                var url = "/pages/device/waterDevice/neat/NEATWaterSignalUpdate.html?"
                + "signal_id=" + encodeURIComponent(data.id)
                + "&gateway_code=" + encodeURIComponent(that.gatewayCode)
                + "&gateway_name=" + encodeURIComponent(that.gatewayName)
                 + "&__=" + new Date().valueOf().toString();

                layui.neatWindowManager.openLayerInRootWindow({
                    resize: false,
                    type: 2,
                    title: '编辑NEAT水信号',
                    area: ["806px", "580px"],
                    shade: [0.7, '#000'],
                    content: url,
                    end: function () {
                        that.bindTable();
                    }
                });

              

            }
        });
    };



    // 重新加载列表
    SubPage.prototype.reloadTable = function (result) {
        var that = this;


        table.reload("resultTable", {
            data: result,
        });

    }




    exports(MODULE_NAME, new SubPage());
});