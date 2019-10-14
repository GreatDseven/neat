
layui.define(["jquery", 'neatDataApi', 'mockDataProvider'], function (exports) {
    "use strict";

    var MODULE_NAME = 'electricalDeviceDataApi';

    var $ = layui.$;

    var mock = layui.mockDataProvider("electricalDeviceDataApi");

    var ModuleDefine = function () { };

    // 查询 智慧用电网关列表
    ModuleDefine.prototype.queryGatewayList = function (token, keyword, bindStatus, domainId, enterpriseId, buildingId, keypartId,
        orderByColumn, isDescOrder,
        pageIndex, pageSize, okCallback, failCallback) {

        var url = "/OpenApi/ElectricGateway/GetGatewayList";


        if (!orderByColumn) {
            orderByColumn = "None";
        }

        if (typeof isDescOrder === "undefined") {
            isDescOrder = "true";
        }

        var data = {
            token: token,
            keyword: keyword,
            bindStatus: bindStatus,
            domainId: domainId,
            entId: enterpriseId,
            buildingId: buildingId,
            keypartId: keypartId,
            orderByColumn: orderByColumn,
            isDescOrder: isDescOrder,
            pageIndex: pageIndex,
            pageSize: pageSize
        };

        layui.neatDataApi.sendGet(url, data, okCallback, failCallback);

    };


    // 根据id获取智慧用电网关的详细信息
    ModuleDefine.prototype.getGatewayDetailById = function (token, id, okCallback, failCallback) {

        var url = "/OpenApi/ElectricGateway/GetGateway";

        var data = {
            token: token,
            id: id
        };

        layui.neatDataApi.sendGet(url, data, okCallback, failCallback);
    };


    // 修改 智慧用电网关
    ModuleDefine.prototype.updateGateway = function (token, data, okCallback, failCallback) {
        var url = "/OpenApi/ElectricGateway/PostGateway/?token=" + encodeURIComponent(token);


        layui.neatDataApi.sendPostJson(url, data, okCallback, failCallback);
    };

    // 删除 智慧用电网关
    ModuleDefine.prototype.deleteGateway = function (token, gatewayIds, okCallback, failCallback) {
        var url = "/OpenApi/ElectricGateway/ClearExtInfo/?token=" + encodeURIComponent(token);


        layui.neatDataApi.sendPostJson(url, gatewayIds, okCallback, failCallback);
    };



    // 复位 智慧用电网关
    ModuleDefine.prototype.resetGateway = function (token, id, okCallback, failCallback) {
        var url = "/OpenApi/ElectricGateway/ResetGateway/?token=" + encodeURIComponent(token)
            + "&id=" + encodeURIComponent(id);


        layui.neatDataApi.sendPostJson(url, {}, okCallback, failCallback);
    };


    // 根据id获取智慧用电网关和通道的配置信息
    ModuleDefine.prototype.getSettingsById = function (token, id, okCallback, failCallback) {

        var url = "/OpenApi/ElectricGateway/GetComponetList";

        var data = {
            token: token,
            gatewayId: id
        };

        layui.neatDataApi.sendGet(url, data, okCallback, failCallback);
    };

    // 根据id查询通道的历史数据
    ModuleDefine.prototype.getCompnetHistroyDataById = function (token, id, startTime, endTime, okCallback, failCallback) {

        //mock.getMockData("getCompnetHistroyDataById", okCallback, failCallback);

        //return;
        var url = "/OpenApi/ElectricDeviceData/GetCompnetHistroyDataById";

        var data = {
            token: token,
            id: id,
            startTime: startTime,
            endTime: endTime
        };

        layui.neatDataApi.sendGet(url, data, okCallback, failCallback);
    };

    // 保存 智慧用电 通道设置
    ModuleDefine.prototype.updateGatewayChannelConfig = function (token, data, okCallback, failCallback) {
        var url = "/OpenApi/ElectricGateway/PostComponetList/?token=" + encodeURIComponent(token);



        layui.neatDataApi.sendPostJson(url, data, okCallback, failCallback);
    };


    // 根据id获取智慧用电网关和通道的屏蔽信息
    ModuleDefine.prototype.getChannelMaskSettingsById = function (token, id, okCallback, failCallback) {

        var url = "/OpenApi/ElectricGateway/GetShieldComponetList/";


        var data = {
            token: token,
            gatewayId: id
        };

        layui.neatDataApi.sendGet(url, data, okCallback, failCallback);
    };

    // 保存智慧用电网关通道的屏蔽设置
    ModuleDefine.prototype.changeMaskSettings = function (token, data, okCallback, failCallback) {

        var url = "/OpenApi/ElectricGateway/PostComponetShiedList/?token=" + encodeURIComponent(token);


        layui.neatDataApi.sendPostJson(url, data, okCallback, failCallback);
    };


    // 获取智慧用电网关 升级文件列表
    ModuleDefine.prototype.getUpdateFileList = function (token, okCallback, failCallback) {

        var url = "/OpenApi/ElectricUpgradeFile/Get";


        var data = {
            token: token
        };

        layui.neatDataApi.sendGet(url, data, okCallback, failCallback);
    };


    // 智慧用电网关 派发升级任务
    ModuleDefine.prototype.addUpdateTask = function (token, gatewayId,fileId, okCallback, failCallback) {

        var url = "/OpenApi//ElectricGateway/PutTask/?token=" + encodeURIComponent(token)
            + "&gatewayId=" + encodeURIComponent(gatewayId)
            + "&fileId=" + encodeURIComponent(fileId);
            


        layui.neatDataApi.sendPost(url, {}, okCallback, failCallback);
    };

    // 智慧用电网关 删除升级文件
    ModuleDefine.prototype.deleteUpdateFile = function (token, id, okCallback, failCallback) {

        var url = "/OpenApi/ElectricUpgradeFile/Delete/?token=" + encodeURIComponent(token)
            + "&id=" + encodeURIComponent(id);
            

        layui.neatDataApi.sendPost(url, {}, okCallback, failCallback);


    };


    // 获取智慧用电网关运维记录
    ModuleDefine.prototype.getDeviceOperationHistory = function (token, id, okCallback, failCallback) {

        var url = "/OpenApi/ElectricGateway/GetTaskInfos";

        var data = {
            token: token,
            id: id
        };

        layui.neatDataApi.sendGet(url, data, okCallback, failCallback);
    };

    // 查询智慧用电实时数据
    ModuleDefine.prototype.queryEFDeviceRealTimeData = function (token, gateWayId, okCallback, failCallback) {

        var url = "/OpenApi/ElectricDeviceData/GetComponetDataByGatewayId";

        var data = {
            token: token,
            gateWayId: gateWayId
        };

        layui.neatDataApi.sendGet(url, data, okCallback, failCallback);

    };

    //全局都是这一个实例
    var instance = new ModuleDefine();

    //暴露接口
    exports(MODULE_NAME, instance);
});