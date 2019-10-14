
layui.define(["jquery", 'neatDataApi'], function (exports) {
    "use strict";

    var MODULE_NAME = 'integratedDeviceDataApi';


    var $ = layui.$;

    var ModuleDefine = function () { };

    //===============================================传输设备========================================================================

    // 查询UITD设备列表
    ModuleDefine.prototype.queryUITDDeviceList = function (token, keyword, domainId, enterpriseId, buildingId, keypartId,
        orderByColumn, isDescOrder,
        pageIndex, pageSize, okCallback, failCallback) {



        var url = "/OpenApi/FireUITD/GetNeatFireUitd";

       

        if (!orderByColumn) {
            orderByColumn = "None";
        }

        if (typeof isDescOrder === "undefined") {
            isDescOrder = "true";
        }


        var data = {
            token: token,
            keyword: keyword,
            domainId: domainId,
            enterpriseId: enterpriseId,
            buildingId: buildingId,
            keypartId: keypartId,
            orderByColumn: orderByColumn,
            isDescOrder: isDescOrder,
            pageIndex: pageIndex,
            pageSize: pageSize,
        };


        /*
        
        */

        layui.neatDataApi.sendGet(url, data, okCallback, failCallback);

    };

    // 根据id获取传输设备信息
    ModuleDefine.prototype.getUITDById = function (token, id, okCallback, failCallback) {
        var url = "/OpenApi/FireUITD/GetUitdDetailById";

        var data = {
            token: token,
            id: id
        };

        layui.neatDataApi.sendGet(url, data, okCallback, failCallback);
    };

    // 添加UITD设备列表
    ModuleDefine.prototype.createUITD = function (token, data, okCallback, failCallback) {

        var url = "/OpenApi/FireUITD/AddUitd/?token=" + encodeURIComponent(token);

        layui.neatDataApi.sendPostJson(url, data, okCallback, failCallback);
    };

    // 修改 用户信息传输装置
    ModuleDefine.prototype.updateUITD = function (token, data, okCallback, failCallback) {
        var url = "/OpenApi/FireUITD/UpdateUitd/?token=" + encodeURIComponent(token);
        layui.neatDataApi.sendPostJson(url, data, okCallback, failCallback);
    };


    // 删除UITD设备列表
    ModuleDefine.prototype.deleteUITDById = function (token, data, okCallback, failCallback) {

        var url = "/OpenApi/FireUITD/DeleteUitd?token=" + encodeURIComponent( token);
        layui.neatDataApi.sendPostJson(url, data, okCallback, failCallback);

    };
    // 查询UITD设备厂商列表
    ModuleDefine.prototype.queryUITDManufacturers = function (token, okCallback, failCallback) {

        var url = "/OpenApi/SysAuth/GetSysCodeList";

        var data = {
            token: token,
            category: "FIRE_MANUFACTURE"
        };

        layui.neatDataApi.sendGet(url, data, okCallback, failCallback);


    };

    // 查询主机设备厂商列表
    ModuleDefine.prototype.queryFireHostManufacturers = function (token, okCallback, failCallback) {
       
        var url = "/OpenApi/SysAuth/GetSysCodeList";

        var data = {
            token: token,
            category: "FIRE_SYSTEM_MANUFACTURE"
        };

        layui.neatDataApi.sendGet(url, data, okCallback, failCallback);


    };

    // 查询主机类别列表
    ModuleDefine.prototype.queryFireHostType = function (token, okCallback, failCallback) {

        var url = "/OpenApi/SysAuth/GetSysCodeList";

        var data = {
            token: token,
            category: "FIRE_SYSTEM_CODE"
        };

        layui.neatDataApi.sendGet(url, data, okCallback, failCallback);


    };
    

   //===============================================消防主机========================================================================


    // 根据用户信息传输装置 编号 获取 该 用户信息传输装置下 消防系统列表,获取全部,不分页
    ModuleDefine.prototype.getFireHostByUITDId = function (token, uitdId, okCallback, failCallback) {

        var url = "/OpenApi/FireUITD/GetFireSystemsByUitdId";

        var data = {
            token: token,
            id: uitdId
        };

        layui.neatDataApi.sendGet(url, data, okCallback, failCallback);
    };

    // 添加 消防主机
    ModuleDefine.prototype.createFireHost = function (token, data, okCallback, failCallback) {

        var url = "/OpenApi/FireUITD/AddFireSystem?token=" + encodeURIComponent(token);

        layui.neatDataApi.sendPostJson(url, data, okCallback, failCallback);
    };


    // 根据消防系统id 获取消防系统详细信息
    ModuleDefine.prototype.getFireHostById = function (token, id, okCallback, failCallback) {

        var url = "/OpenApi/FireUITD/GetFireSystemsById";

        var data = {
            token: token,
            id: id
        };

        layui.neatDataApi.sendGet(url, data, okCallback, failCallback);
    };

    // 修改 消防主机
    ModuleDefine.prototype.updateFireHost = function (token, data, okCallback, failCallback) {

        var url = "/OpenApi/FireUITD/UpdateFireSystem?token=" + encodeURIComponent(token);


        layui.neatDataApi.sendPostJson(url, data, okCallback, failCallback);
    };
    
    // 删除 消防主机
    ModuleDefine.prototype.deleteFireHost = function (token, data, okCallback, failCallback) {

        var url = "/OpenApi/FireUITD/DeleteFireSystem?token=" + encodeURIComponent(token);


        layui.neatDataApi.sendPostJson(url, data, okCallback, failCallback);
    };
    

    //==============================消防部件=========================================

    // 根据消防系统id 获取消防部件列表
    ModuleDefine.prototype.getFireSignalList = function (token,keyword, uitdId,hostCode,
        orderByColumn, isDescOrder,
        pageIndex, pageSize, okCallback, failCallback) {

        var url = "/OpenApi/FireUITD/GetFireSignalList";


        if (!orderByColumn) {
            orderByColumn = "None";
        }

        if (typeof isDescOrder === "undefined") {
            isDescOrder = "true";
        }


        var data = {
            token: token,

            deviceID: uitdId,
            systemCode: hostCode,
            keyWord: keyword,
            orderByColumn: orderByColumn,
            isDescOrder: isDescOrder,
            pageIndex: pageIndex,
            pageSize: pageSize
        };

        layui.neatDataApi.sendGet(url, data, okCallback, failCallback);

    };

    // 获取 消防器件的类别数据
    ModuleDefine.prototype.getFireSignalCategoryData = function (token, okCallback, failCallback) {

        var url = "/OpenApi/SysAuth/GetSysCodeList";

        var data = {
            token: token,
            category: "FIRE_SYSTEM_GB_COMPONENT_CODE"
        };

        layui.neatDataApi.sendGet(url, data, okCallback, failCallback);
    };

    // 添加 消防部件
    ModuleDefine.prototype.createFireSignal = function (token, data, okCallback, failCallback) {

        var url = "/OpenApi/FireUITD/AddFireSignal/?token=" + encodeURIComponent(token);// 

        layui.neatDataApi.sendPostJson(url, data, okCallback, failCallback);
    };

    // 根据id 获取 消防部件 详情
    ModuleDefine.prototype.getFireSignalDetailById = function (token, id, okCallback, failCallback) {

        var url = "/OpenApi/FireUITD/GetFireSignalDetail";// 

        var data = {
            token: token,
            id: id
        };

        layui.neatDataApi.sendGet(url, data, okCallback, failCallback);
    };
    

    // 修改 消防部件
    ModuleDefine.prototype.updateFireSignal = function (token, data, okCallback, failCallback) {

        var url = "/OpenApi/FireUITD/UpdateFireSignal/?token="+ encodeURIComponent(token);// 


        layui.neatDataApi.sendPostJson(url, data, okCallback, failCallback);
    };

    // 删除 消防部件
    ModuleDefine.prototype.deleteFireSignal = function (token, data, okCallback, failCallback) {

        var url = "/OpenApi/FireUITD/DeleteFireSignal/?token=" + encodeURIComponent(token);// 

        layui.neatDataApi.sendPostJson(url, data, okCallback, failCallback);
    };
    // 删除 所有消防部件
    ModuleDefine.prototype.deleteAllFireSignal = function (token, data, okCallback, failCallback) {

        var url = "/OpenApi/FireUITD/DeleteFireSignalAll/?token=" + encodeURIComponent(token);// 

        layui.neatDataApi.sendPostJson(url, data, okCallback, failCallback);
    };    

    var instance = new ModuleDefine();

    //暴露接口
    exports(MODULE_NAME, instance);
});