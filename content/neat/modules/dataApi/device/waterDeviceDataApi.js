
layui.define(["jquery", 'neatDataApi', 'laytpl'], function (exports) {
    "use strict";

    var MODULE_NAME = 'waterDeviceDataApi';

    var $ = layui.$;

    var WaterDeviceDataApi = function () { };

    // 查询neat水网关列表
    WaterDeviceDataApi.prototype.queryNEATWaterGateway = function (token, keyword, domainId, enterpriseId, buildingId, keypartId ,
        orderByColumn, isDescOrder,
        pageIndex, pageSize, okCallback, failCallback) {
        var url = "/OpenApi/WaterDevice/GetWGWList";


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
            entId: enterpriseId,
            buildingId: buildingId,
            keypartId: keypartId,
            orderByColumn: orderByColumn,
            isDescOrder: isDescOrder,
            pageIndex: pageIndex,
            pageSize: pageSize,
        };

        layui.neatDataApi.sendGet(url, data, okCallback, failCallback);

    };


    // 删除 neat水网关
    WaterDeviceDataApi.prototype.deleteNEATWaterGateway = function (token, gatewayIds, okCallback, failCallback) {
        var url = "/OpenApi/WaterDevice/DeleteWGW/?token=" + encodeURIComponent(token);
        layui.neatDataApi.sendPostJson(url, gatewayIds, okCallback, failCallback);
    };



    // 添加 neat水网关
    WaterDeviceDataApi.prototype.createNEATWaterGateway = function (token, gatewayData, okCallback, failCallback) {
        var url = "/OpenApi/WaterDevice/PutNeatWGW/?token=" + encodeURIComponent(token);
        layui.neatDataApi.sendPostJson(url, gatewayData, okCallback, failCallback);
    };

    // 根据id获取NEAT水设备信息
    WaterDeviceDataApi.prototype.getNEATWaterGatewayById = function (token,id, okCallback, failCallback) {
        var url = "/OpenApi/WaterDevice/GetWGWById";
        var data = {
            token: token,
            id: id
        };

        layui.neatDataApi.sendGet(url, data, okCallback, failCallback);
    };
    
    // 更新 NEAT水设备 
    WaterDeviceDataApi.prototype.updateNEATWaterGateway = function (token, gatewayData, okCallback, failCallback) {

        var url = "/OpenApi/WaterDevice/PostNeatWGW/?token=" + encodeURIComponent(token);

        layui.neatDataApi.sendPostJson(url, gatewayData, okCallback, failCallback);
    };

    // 查询NEAT水网关下所有水信号
    WaterDeviceDataApi.prototype.queryNEATWaterSignalInGateway = function (token, gatewayId, okCallback, failCallback) {
        var url = "/OpenApi/WaterDevice/GetWaterSignalList";
        var data = {
            token: token,
            deviceId: gatewayId,
            orderByColumn: "Code",
            isDescOrder:false
        };

        layui.neatDataApi.sendGet(url, data, okCallback, failCallback);
    };

    // 生成模拟量 配置的xml
    WaterDeviceDataApi.prototype.makeYCXML = function (data) {

        /*

data.unit
data.maxValue
data.minValue 
data.hL2Value 
data.hL1Value 
data.lL1Value 
data.lL2Value 

        */

        data.hL2HasValue = typeof (data.hL2Value) !== 'undefined';
        data.hL1HasValue = typeof (data.hL1Value) !== 'undefined';
        data.lL1HasValue = typeof (data.lL1Value) !== 'undefined';
        data.lL2HasValue = typeof (data.lL2Value) !== 'undefined';

        var tmpl = '<?xml version="1.0" encoding="utf-16"?>'+
             "<WYCE>" +
             "<Unit>{{d.unit}}</Unit>" +
             "<Max>{{d.maxValue}}</Max>" +
             "<Min>{{d.minValue}}</Min>" +
             "<EHL2A>{{d.hL2HasValue}}</EHL2A>" +
             "<HL2>{{d.hL2Value}}</HL2>" +
             "<EHL1A>{{d.hL1HasValue}}</EHL1A>" +
             "<HL1>{{d.hL1Value}}</HL1>" +
             "<ELL1A>{{d.lL1HasValue}}</ELL1A>" +
             "<LL1>{{d.lL1Value}}</LL1>" +
             "<ELL2A>{{d.lL2HasValue}}</ELL2A>" +
             "<LL2>{{d.lL2Value}}</LL2>" +
             "</WYCE>";
        return layui.laytpl(tmpl).render(data);
    };
   

    WaterDeviceDataApi.prototype.makeYXXML = function (data) {
        /*
data.trueLabel
data.falseLabel
data.trueAlarm
data.falseAlarm
        */
        var tmpl = '<?xml version="1.0" encoding="utf-16"?>' +
        '<WYXE>' +
        '<TM>{{d.trueLabel}}</TM>' +
        '<FM>{{d.falseLabel}}</FM>' +
        '<ETA>{{d.trueAlarm}}</ETA>' +
        '<EFA>{{d.falseAlarm}}</EFA>' +
        '</WYXE>';
        return layui.laytpl(tmpl).render(data);
    };

    // 删除 NEAT水信号 
    WaterDeviceDataApi.prototype.deleteNEATWaterSignal = function (token, signalIds, okCallback, failCallback) {

        var url = "/OpenApi/WaterDevice/DeleteWaterSignalById/?token=" + encodeURIComponent(token);

        layui.neatDataApi.sendPostJson(url, signalIds, okCallback, failCallback);
    };

    // 添加NEAT数字量水信号
    WaterDeviceDataApi.prototype.createNEATYXWaterSignal = function (token, signalData, okCallback, failCallback) {

        var url = "/OpenApi/WaterDevice/PutWaterSignal/?token=" + encodeURIComponent(token);

        /*signalData的字段
                gatewayID
                code 
                name 
                systemCode 
                address
                trueLabel
                falseLabel
                trueAlarm
                falseAlarm
        */


        var finalData = {
            "address": signalData.address,
            "deviceID": signalData.gatewayID,
            "code": signalData.code,
            "name": signalData.name,
            "deviceType": 0,
            "isYC": false,
            "trueMeaning": signalData.trueLabel,
            "enableTrueAlarm": signalData.trueAlarm,                                         //新添
            "falseMeaning": signalData.falseLabel,
            "enableFalseAlarm": signalData.falseAlarm,
        };

        layui.neatDataApi.sendPostJson(url, finalData, okCallback, failCallback);
    };

    // 添加NEAT模拟量水信号
    WaterDeviceDataApi.prototype.createNEATYCWaterSignal = function (token, signalData, okCallback, failCallback) {

        var url = "/OpenApi/WaterDevice/PutWaterSignal/?token=" + encodeURIComponent(token);

        /*signalData的字段
               gatewayID
               code 
               name 
               systemCode 
               address
                unit
                maxValue
                minValue 
                hL2Value 
                hL1Value 
                lL1Value 
                lL2Value 
       */


        var hL2HasValue = typeof (signalData.hL2Value) !== 'undefined';
        var hL1HasValue = typeof (signalData.hL1Value) !== 'undefined';
        var lL1HasValue = typeof (signalData.lL1Value) !== 'undefined';
        var lL2HasValue = typeof (signalData.lL2Value) !== 'undefined';

        var finalData = {

            "address": signalData.address,
            "deviceID": signalData.gatewayID,
            "code": signalData.code,
            "name": signalData.name,
            "deviceType": signalData.deviceType,
            "enableHighLimit1Alarm": hL1HasValue,
            "enableHighLimit2Alarm": hL2HasValue,
            "enableLowLimit1Alarm": lL1HasValue,
            "enableLowLimit2Alarm": lL2HasValue,
            "lowLimit1": signalData.lL1Value,
            "lowLimit2": signalData.lL2Value,
            "maximum": signalData.maxValue,
            "minimum": signalData.minValue,
            "isYC": true,
            "unit": signalData.unit,
            "highLimit1": signalData.hL1Value,
            "highLimit2": signalData.hL2Value

        };


        layui.neatDataApi.sendPostJson(url, finalData, okCallback, failCallback);
    };

    // 获取水信号详情
    WaterDeviceDataApi.prototype.getNEATWaterSignalDetailById = function (token, signalId, okCallback, failCallback) {
        var url = "/OpenApi/WaterDevice/GetWaterSignalDetail";
        var data = {
            token: token,
            id: signalId
        };



        var myPropertyNames = {
            signalID: "signalID",
            code: "code",
            name: "name",
            address: "address",
            signalType: "signalType",
            ycdetail: "ycdetail",
            yxdetail: "yxdetail",
            deviceId:"deviceId"
        };
        var myYCPropertyNames = {
            signalValueType: "signalValueType",
            unit: "unit",
            maxValue: "maxValue",
            minValue: "minValue",
            hl2value: "hl2value",
            hl1value: "hl1value",
            ll1value: "ll1value",
            ll2value: "ll2value",
        };


        var myYXPropertyNames = {
            trueLabel: "trueLabel",
            trueAlarm: "trueAlarm",
            falseLabel: "falseLabel",
            falseAlarm: "falseAlarm"
        };

        /*



        */


        var svrPropertyNames = {
            id:"id",
            code:"code",
            name:"name",
            address:"address",
            deviceType: "deviceType",
            deviceId:"deviceId",
            unit: "unit",
            isYC: "isYC",
            
        };

        var svrYCPropertyNames = {
            enableHighLimit1Alarm: "enableHighLimit1Alarm",
            enableHighLimit2Alarm: "enableHighLimit2Alarm",
            enableLowLimit1Alarm: "enableLowLimit1Alarm",
            enableLowLimit2Alarm: "enableLowLimit2Alarm",
            highLimit1: "highLimit1",
            highLimit2: "highLimit2",
            lowLimit1: "lowLimit1",
            lowLimit2: "lowLimit2",
            maximum: "maximum",
            minimum: "minimum",
        };
        var svrYXPropertyNames = {
            trueMeaning: "trueMeaning",
            enableTrueAlarm: "enableTrueAlarm",
            falseMeaning: "falseMeaning",
            enableFalseAlarm: "enableFalseAlarm"
        };
     
        layui.neatDataApi.sendGet(url, data, function (resultData) {

            //进行数据格式转换. 把后台给回的数据,转换成页面需要的数据格式.

            var finalResult = {};

          
            finalResult[myPropertyNames.address] = resultData[svrPropertyNames.address];
            finalResult[myPropertyNames.code] = resultData[svrPropertyNames.code];
            finalResult[myPropertyNames.name] = resultData[svrPropertyNames.name];
            finalResult[myPropertyNames.signalID] = resultData[svrPropertyNames.id];
            finalResult[myPropertyNames.deviceId] = resultData[svrPropertyNames.deviceId];
            if (resultData[svrPropertyNames.isYC]) {
                finalResult[myPropertyNames.signalType] = "YC";
                finalResult[myPropertyNames.ycdetail] = {};

                var ycExtObj = resultData;

                if (ycExtObj[svrYCPropertyNames.enableHighLimit1Alarm]) {
                    finalResult[myPropertyNames.ycdetail][myYCPropertyNames.hl1value] = ycExtObj[svrYCPropertyNames.highLimit1];
                }
                if (ycExtObj[svrYCPropertyNames.enableHighLimit2Alarm]) {
                    finalResult[myPropertyNames.ycdetail][myYCPropertyNames.hl2value] = ycExtObj[svrYCPropertyNames.highLimit2];
                }
                if (ycExtObj[svrYCPropertyNames.enableLowLimit1Alarm]) {
                    finalResult[myPropertyNames.ycdetail][myYCPropertyNames.ll1value] = ycExtObj[svrYCPropertyNames.lowLimit1];
                }
                if (ycExtObj[svrYCPropertyNames.enableLowLimit2Alarm]) {
                    finalResult[myPropertyNames.ycdetail][myYCPropertyNames.ll2value] = ycExtObj[svrYCPropertyNames.lowLimit2];
                }

                finalResult[myPropertyNames.ycdetail][myYCPropertyNames.maxValue] = ycExtObj[svrYCPropertyNames.maximum];
                finalResult[myPropertyNames.ycdetail][myYCPropertyNames.minValue] = ycExtObj[svrYCPropertyNames.minimum];
                finalResult[myPropertyNames.ycdetail][myYCPropertyNames.signalValueType] = resultData[svrPropertyNames.deviceType];
                finalResult[myPropertyNames.ycdetail][myYCPropertyNames.unit] = resultData[svrPropertyNames.unit];
               
               
            }
            else {
                finalResult[myPropertyNames.signalType] = "YX";
                finalResult[myPropertyNames.yxdetail] = {};

                var yxExtObj = resultData;

                finalResult[myPropertyNames.yxdetail][myYXPropertyNames.falseAlarm] = yxExtObj[svrYXPropertyNames.enableFalseAlarm];
                finalResult[myPropertyNames.yxdetail][myYXPropertyNames.falseLabel] = yxExtObj[svrYXPropertyNames.falseMeaning];

                finalResult[myPropertyNames.yxdetail][myYXPropertyNames.trueAlarm] = yxExtObj[svrYXPropertyNames.enableTrueAlarm];
                finalResult[myPropertyNames.yxdetail][myYXPropertyNames.trueLabel] = yxExtObj[svrYXPropertyNames.trueMeaning];

            }
            
   
            okCallback(finalResult);
            

        }, failCallback);
    };

    // 修改NEAT数字量水信号
    WaterDeviceDataApi.prototype.updateNEATYXWaterSignal = function (token, signalData, okCallback, failCallback) {

        var url = "/OpenApi/WaterDevice/PostWaterSignal/?token=" + encodeURIComponent(token);

        /*signalData的字段
                id
               gatewayID
               code 
               name 
               systemCode 
               address
               trueLabel
               falseLabel
               trueAlarm
               falseAlarm
       */


        var finalData = {
            "id": signalData.id,
            "address": signalData.address,
            "deviceID": signalData.gatewayID,
            "code": signalData.code,
            "name": signalData.name,
            "deviceType": 0,
            "isYC": false,
            "trueMeaning": signalData.trueLabel,
            "enableTrueAlarm": signalData.trueAlarm,                                         //新添
            "falseMeaning": signalData.falseLabel,
            "enableFalseAlarm": signalData.falseAlarm,
        };


        layui.neatDataApi.sendPostJson(url, finalData, okCallback, failCallback);
    };

    // 修改NEAT模拟量水信号
    WaterDeviceDataApi.prototype.updateNEATYCWaterSignal = function (token, signalData, okCallback, failCallback) {

        var url = "/OpenApi/WaterDevice/PostWaterSignal/?token=" + encodeURIComponent(token);

        /*signalData的字段
                id
              gatewayID
              code 
              name 
              systemCode 
              address
               unit
               maxValue
               minValue 
               hL2Value 
               hL1Value 
               lL1Value 
               lL2Value 
      */


        var hL2HasValue = typeof (signalData.hL2Value) !== 'undefined';
        var hL1HasValue = typeof (signalData.hL1Value) !== 'undefined';
        var lL1HasValue = typeof (signalData.lL1Value) !== 'undefined';
        var lL2HasValue = typeof (signalData.lL2Value) !== 'undefined';

        var finalData = {
            "id": signalData.id,
            "address": signalData.address,
            "deviceID": signalData.gatewayID,
            "code": signalData.code,
            "name": signalData.name,
            "deviceType": signalData.deviceType,
            "enableHighLimit1Alarm": hL1HasValue,
            "enableHighLimit2Alarm": hL2HasValue,
            "enableLowLimit1Alarm": lL1HasValue,
            "enableLowLimit2Alarm": lL2HasValue,
            "lowLimit1": signalData.lL1Value,
            "lowLimit2": signalData.lL2Value,
            "maximum": signalData.maxValue,
            "minimum": signalData.minValue,
            "isYC": true,
            "unit": signalData.unit,
            "highLimit1": signalData.hL1Value,
            "highLimit2": signalData.hL2Value

        };



        layui.neatDataApi.sendPostJson(url, finalData, okCallback, failCallback);
    };


    //===============一体式水设备===============

    // 查询一体式水设备列表
    WaterDeviceDataApi.prototype.queryUnibodyWaterGateway = function (token, keyword, domainId, enterpriseId, buildingId, keypartId,
        orderByColumn, isDescOrder,
        pageIndex, pageSize, okCallback, failCallback) {
        var url = "/OpenApi/WaterDevice/GetIntegratedWGWList";


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
            entId: enterpriseId,
            buildingId: buildingId,
            keypartId: keypartId,
            orderByColumn: orderByColumn,
            isDescOrder: isDescOrder,
            pageIndex: pageIndex,
            pageSize: pageSize,
        };

        layui.neatDataApi.sendGet(url, data, okCallback, failCallback);

    };

    // 获取水设备生产厂商列表
    WaterDeviceDataApi.prototype.getWaterDeviceManufactoryList = function (token, okCallback, failCallback) {
        var url = "/OpenApi/SysAuth/GetSysCodeList";

        var data = {
            token: token,
            category: "WATER_DEVICE_MANUFACTURE"
        };
        layui.neatDataApi.sendGet(url, data, okCallback, failCallback);
    };

    // 添加一体式水设备
    WaterDeviceDataApi.prototype.createUnibodyWaterGateway = function (token, gatewayData, okCallback, failCallback) {
        var url = "/OpenApi/WaterDevice/PutIntegratedNeatWGW/?token=" + encodeURIComponent(token);
        layui.neatDataApi.sendPostJson(url, gatewayData, okCallback, failCallback);
    };

    // 删除 一体式水设备
    WaterDeviceDataApi.prototype.deleteUnibodyWaterGateway = function (token, ids, okCallback, failCallback) {

        var url = "/OpenApi/WaterDevice/DeleteIntegratedWGW/?token=" + encodeURIComponent(token);

        layui.neatDataApi.sendPostJson(url, ids, okCallback, failCallback);
   
    };

    // 获取一体式水设备详情
    WaterDeviceDataApi.prototype.getUnibodyWaterGatewayById = function (token, id, okCallback, failCallback) {
        var url = "/OpenApi/WaterDevice/GetIntegratedWGWById";

        var data = {
            token: token,
            id: id
        };

        layui.neatDataApi.sendGet(url, data, okCallback, failCallback);
    };



    // 修改一体式水设备
    WaterDeviceDataApi.prototype.updateUnibodyWaterGateway = function (token, wgwData, okCallback, failCallback) {

        var url = "/OpenApi/WaterDevice/PostIntegratedWGW/?token=" + encodeURIComponent(token);

        layui.neatDataApi.sendPostJson(url, wgwData, okCallback, failCallback);
    };

    // 一体式水厂商列表
    var UnibodyWaterGatewayManufactures = {
        TOPSAIL:{ id: "4001", name: "陕西拓普索尔" },
        SENEX:{ id: "4003", name: "万讯森纳士" }
    };

    // 获取 所有 一体式水厂商列表
    WaterDeviceDataApi.prototype.getAllUnibodyWaterGatewayManufactures=  function (token, okCallback) {

        var copy = JSON.parse(JSON.stringify(UnibodyWaterGatewayManufactures));
        if (typeof okCallback === "function") {
            okCallback(copy);
        }
        else {
            return copy;
        }
    };

    // 获取一体式水厂商列表
    WaterDeviceDataApi.prototype.getUnibodyWaterGatewayManufacture = function (token,  okCallback, failCallback) {

        var data = [
            UnibodyWaterGatewayManufactures.TOPSAIL,
            UnibodyWaterGatewayManufactures.SENEX
        ];

        if (typeof okCallback === "function") {
            okCallback(data);
        }
        else {
            return data;
        }
    };

    // 一体式水设备联网方式列表 1:UDP, 2:OneNet, 3:电信平台
    var UnibodyWaterGatewayConnectionTypes = {
        DirectConnection: { id: "1", name: "直连" },
        ChinaMobile: { id: "2", name: "中国移动" },
        ChinaTelecom: { id: "3", name: "中国电信" }
    };

    // 获取 所有 一体式水设备联网方式列表
    WaterDeviceDataApi.prototype.getAllUnibodyWaterGatewayConnectionTypes = function (token, okCallback) {

        var copy = JSON.parse(JSON.stringify(UnibodyWaterGatewayConnectionTypes));
        if (typeof okCallback === "function") {
            okCallback(copy);
        }
        else {
            return copy;
        }
    };

    // 根据厂商获取一体式水设备联网方式
    WaterDeviceDataApi.prototype.getUnibodyWaterGatewayConnectionType = function (token, manufactureId, okCallback, failCallback) {

        var data = [];

        if (manufactureId == UnibodyWaterGatewayManufactures.TOPSAIL.id) { //拓扑索尔
            data.push(UnibodyWaterGatewayConnectionTypes.DirectConnection);
        }
        else if (manufactureId == UnibodyWaterGatewayManufactures.SENEX.id) { //万讯
            data.push(UnibodyWaterGatewayConnectionTypes.ChinaTelecom);
            //data.push(UnibodyWaterGatewayConnectionTypes.ChinaMobile);

        }
        if (typeof okCallback === "function") {
            okCallback(data);
        }
        else {
            return data;
        }
    };



    //==================

    //全局都是这一个实例
    var waterDeviceDataApi = new WaterDeviceDataApi();

    //暴露接口
    exports(MODULE_NAME, waterDeviceDataApi);
});