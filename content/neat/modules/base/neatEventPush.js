layui.define(['neat', 'neatSignalRHub', "neatUITools", 'jquery', 'jqueryNotyfy', 'neatPopupRepository','neatSpeechSynthesis'], function (exports) {
    "use strict";

    var MODULE_NAME = 'neatEventPush';

    var $ = layui.jquery;

    var neat = layui.neat;

    var uiTools = layui.neatUITools;

    var layer = layui.layer;


    
    var eventPrefix = {
        fire: "evefire",
        water: "evewater",
        electric: "electronicevent",
        smallplace: "smallplaceevent",
     
    };

   
    var EventPush = function () { 
    
        this.receiveMsgHandlers = {};

        //this.instanceFlag = new Date().valueOf().toString();

        //console.log("EventPush Instance:" + this.instanceFlag);
    };

    EventPush.prototype.init = function () {
        var that = this;

        //console.log("EventPush init");

        var signalBaseUrl = neat.getSignalRBaseUrl();

        $.connection.hub.url = signalBaseUrl + "/signalr";

        $.connection.hub.error(function (error) {
            console.log('SignalR error: ' + error);

            $.connection.hub.start();
        });
        $.connection.hub.connectionSlow(function () {
            console.log('SignalR :We are currently experiencing difficulties with the connection.');
        });

        var svc = $.signalR.broadcastHub;

        svc.client.receiveMsg = function (msgType, msgContent) {


            //console.log("signalr receiveMsg :" + msgType + ":" +msgContent);
           
            that.receiveMsg(msgType, msgContent);
        };

        $.connection.hub.start().done(function () {
            
            //console.log("SignalR start done ");

            var token =  neat.getUserToken();
            if (!token)
                return;
            svc.server.register(token);

        });
    };

    //添加消息到来的回调
    EventPush.prototype.addMsgArraivalCallback = function (pageName,instance,callback) {
        if (typeof callback === "function") {
            this.receiveMsgHandlers[pageName] = { callback: callback, instance: instance };
        }
    };


    //消息来了,通知各个回调
    EventPush.prototype.notifyAllMsgArraivalCallback = function (msgData) {

        $.each(this.receiveMsgHandlers, function (_, callbackItem) {
            
            try{

                callbackItem.callback.call(callbackItem.instance,msgData);
            }
            catch (e) {
                console.log(e.toString());
            }
        });
    };


    //被后台调用的方法,接收消息全靠它
    EventPush.prototype.receiveMsg =  function (msgType,msgContent) {


        /**
        message 内容如下: 
        
        eveFire:{
        "ID":"bf654a97-5d20-4063-8a81-a5b8b642cc8f",
        "OCCUR_DATETIME":"2018-11-02T13:19:50",
        "RECEIVE_DATETIME":"2018-11-02T13:19:50.992103+08:00",
        "CATEGORY":1,
        "SOURCE_CATEGORY":1000,
        "DOMAIN_ID":"891200fd-360a-11e5-bee7-000ec6f9f8b3",
        "ENTERPRISE_ID":"5ea25f46-ab81-45db-9e3d-8cd05f5d650e",
        "BUILDING_ID":"ec3751a7-81df-4829-99b1-1affef69b862",
        "KEYPART_ID":"00000000-0000-0000-0000-000000000000",
        "UITD_ID":"a3e71345-655e-4197-bc10-9b957fbcb8d5",
        "SYSTEM_ID":"4c231ae8-b6d5-4de7-81c9-04ead2444e80",
        "SIGNAL_ID":"1583bded-b8d7-4d23-a529-15d6d442c40c",
        "IS_HANDLED":false,
        "RESULT":0,
        "HANDLED_DATETIME":null,
        "Note":null,
        "SystemCategory":0,
        "DomainName":"秦皇岛",
        "EnterpriseName":"",
        "EnterpriseAddress":null,
        "BuildingName":"",
        "KeyPartName":"",
        "UitdName":"传输设备1",
        "FireSystemName":"火灾自动报警系统",
        "FireSignalName":"典型离子探测器",
        "DataStatus":0
        }


        */



        var typeText = msgType.toLowerCase();

        var msgData = $.parseJSON(msgContent);

        var data = null;

            
        //通知各个回调
        this.notifyAllMsgArraivalCallback(msgData);

        if (typeText === eventPrefix.fire) {
            data = this.processFireEvent(msgData);
        }
        else if (typeText === eventPrefix.water) {
            data = this.processWaterEvent(msgData);
        }
        else if (typeText === eventPrefix.electric) {
            data = this.processElectricEvent(msgData);
        }
        else if (typeText === eventPrefix.smallplace) {
            data = this.processSmallplaceEvent(msgData);
        }
      

        /*
        var data = {
            id: 1,
            title: "设备发生火警",
            titleClass: 'notyfy_icon_fire',
            msg: "这里是提醒文字这里是提醒文字这里是提醒文字这里是提醒文字这里是提醒文字",
            system: "fire",
            status: eventType
        };
        */

        if (data)
        {
            this.showNotify(data);
            layui.neatSpeechSynthesis.speak(data.title);
        }
        
    };

    EventPush.prototype.showNotify = function (data) {

        var that = this;

        var notyfy = window.notyfy({
            title: data.title,
            titleIconClass: data.titleClass,
            text: data.msg,
            layout: 'bottomRight',
            type: 'neat-alert',
            timeout: 10000,
            closeWith: ['button'],
            data: data,
            detailButtons: [{
                text: '详情',
                onClick: function ($notyfy) {
                    layui.neatPopupRepository.showEventProcessWindow(
                        data.id,
                        data.deviceId,
                        data.deviceLevel,
                        data.eventCategory,
                        function () {
                            that.notifyAllMsgArraivalCallback({});
                        }
                        );
                }
            }]


        });
    };

    
    var emptyGuid = "00000000-0000-0000-0000-000000000000";

    //判断 id是否为guid.empty
    EventPush.prototype.isEmptyId = function(val){
        
        if(val && val ===emptyGuid)
            return true;
        
        return false;
    };

    //设备的级别: 网关,系统,器件 3个级别
    var enumDeviceLevel = {
        gateway: 1,
        system: 2,
        signal:3
    };

    // 获取 事件的发生的真实设备id,如果器件存在,取器件,系统存在取系统,网关存在取网关
    EventPush.prototype.getTargetEventDeviceInfo = function (gateway, system, signal,signalName) {
        if (this.isEmptyId(signal) && signalName) {
            //器件未录入,且器件报警
            return { deviceId: signal, deviceLevel: enumDeviceLevel.signal };
        }

        if (!this.isEmptyId(signal)) {
            //器件已经录入,且器件报警
            return { deviceId: signal, deviceLevel: enumDeviceLevel.signal };
        }
        if (!this.isEmptyId(system)) {
            //主机报警
            return { deviceId: system, deviceLevel: enumDeviceLevel.system };
        }

        //传输设备报警
        return { deviceId: gateway, deviceLevel: enumDeviceLevel.gateway };
    };


    //火灾报警消息处理
    EventPush.prototype.processFireEvent =function(msg) {
        /**
       message 内容如下: 
       
       eveFire:{
       {
	"ID": "3df5ed1a-2913-42b6-a67a-b554da54cd37",
	"OCCUR_DATETIME": "2019-03-30T09:33:50.0707558+08:00",
	"RECEIVE_DATETIME": "2019-03-30T09:33:50.2582183+08:00",
	"CATEGORY": 1,
	"SOURCE_CATEGORY": 1000,
	"DOMAIN_ID": "0b802ccf-1ad4-4e7e-b845-e5807a8e5a7e",
	"ENTERPRISE_ID": "8da8674f-672f-4c52-b8e9-04b4abcf47dd",
	"BUILDING_ID": "2cdc1c4d-c02d-40cc-9117-8ce575b60f1e",
	"KEYPART_ID": "6c1e84a9-094e-4827-8473-2a30f0b55cc8",
	"UITD_ID": "848ec535-d143-4532-a63b-c09a9bba462a",
	"SYSTEM_ID": "00000000-0000-0000-0000-000000000000",
	"SIGNAL_ID": "848ec535-d143-4532-a63b-c09a9bba462a",
	"IS_HANDLED": false,
	"RESULT": 0,
	"HANDLED_DATETIME": null,
	"Note": "",
	"SystemCategory": 10,
	"FLAG": 1,
	"DOMAIN_NAME": "李阳疯狂英语",
	"ENTERPRISE_NAME": "李阳疯狂英语秦皇岛分部",
	"BUILDING_NAME": "建筑1",
	"KEYPART_NAME": "软件开发中心7层",
	"UITD_NAME": "NB测试设备1",
	"SYSTEM_NAME": "",
	"SIGNAL_NAME": "NB测试设备1",
	//"DomainName": null,
	//"EnterpriseName": null,
	//"EnterpriseAddress": null,
	//"BuildingName": null,
	//"KeyPartName": null,
	//"UitdName": null,
	//"UitdCode": null,
	//"FireSystemName": null,
	//"FireSignalName": null,
	//"FireSignalCode": null,
	//"FireSystemCode": null,
	//"DeviceCategory": null,
	"DataStatus": 0
}
       


       */


  
        var eventType = uiTools.transformFireEventNum2Word(msg.CATEGORY);

        var eventTypeText = uiTools.transformEventWord2Text(eventType);

        var eventDeviceInfo = this.getTargetEventDeviceInfo(msg.UITD_ID, msg.SYSTEM_ID, msg.SIGNAL_ID, msg.SIGNAL_NAME);

        var result = {
            id: msg.ID,
            title: "设备发生" + eventTypeText,
            titleClass: "notyfy_icon_" + eventType,
            //msg: /*"【火灾报警】" +*/ uiTools.conStr(msg.ENTERPRISE_NAME, msg.BUILDING_NAME, msg.KEYPART_NAME, msg.UITD_NAME, msg.SIGNAL_NAME) + "发生了" + eventTypeText + ",请立即前往查看",
            system: "fire",
            status: eventType,
            deviceId: eventDeviceInfo.deviceId,
            deviceLevel: eventDeviceInfo.deviceLevel,
            eventCategory: msg.SystemCategory
        };




        if (typeof (msg.DOMAIN_NAME) === "undefined") { //兼容老版本数据推送

            result.msg = /*"【火灾报警】" +*/ uiTools.conStr(msg.EnterpriseName, msg.BuildingName, msg.KeyPartName, msg.UitdName, msg.FireSystemName, msg.FireSignalName) + "发生了" + eventTypeText + ",请立即前往查看";


        }
        else { //新版推送
            result.msg = /*"【火灾报警】" +*/ uiTools.conStr(msg.ENTERPRISE_NAME, msg.BUILDING_NAME, msg.KEYPART_NAME, msg.UITD_NAME, msg.SYSTEM_NAME, msg.SIGNAL_NAME) + "发生了" + eventTypeText + ",请立即前往查看";
           
        }


        return result;
    };

    //水源监测系统消息处理
    EventPush.prototype.processWaterEvent = function(msg) {
        /*
        {
"ID": "5eef05be-1041-416f-aad8-aa73aebad2a7",
"OCCUR_DATETIME": "2018-11-10T10:47:20",
"RECEIVE_DATETIME": "2018-11-10T10:47:20",
"CATEGORY": 1,
"SOURCE_CATEGORY": 1004,
"DOMAIN_ID": "54b270e5-d854-4d6b-b74a-d2529096190a",
"ENTERPRISE_ID": "c4627d45-32e6-48a7-9c58-533e983f8fdb",
"BUILDING_ID": "06a6baa7-81a5-43a7-91e7-a2e1e45e8258",
"KEYPART_ID": "67b8241d-85fd-4a32-9c2e-5e45d1746781",
"WGW_ID": "1b9f7545-e15d-455a-86da-65274f39050b",
"SIGNAL_ID": "68e3ee04-ad2a-48a6-94a5-e2f94cb492cd",
"VALUE": 70.62,
"THRESHOLD": 100.0,
"DESCRIPTION": "下限",
"IS_HANDLED": false,
"RESULT": 0,
"HANDLED_DATETIME": null,
"END_DATETIME": "2018-11-10T11:30:51",
"TIMES": 32,
"DomainName": "海港区虚拟子中心2",
"EnterpriseName": "宁浩发展二二分公司",
"EnterpriseAddress": null,
"BuildingName": "22号楼",
"KeyPartName": "重点1643号部位",
"WGWCode": null,
"WGWName": "二二公司1号水网关",
"SignalName": "大厅南侧",
"DataStatus": 0
}

新版 推送以下字段,去掉相应的骆驼命名法的字段:

    "DOMAIN_NAME": "海港区虚拟子中心2",
    "ENTERPRISE_NAME": "宁浩发展二二分公司",
    "BUILDING_NAME": "22号楼",
    "KEYPART_NAME": "重点1643号部位",
    "WGW_NAME": "二二公司1号水网关",
    "SIGNAL_NAME": "大厅南侧",

        */


        var eventType = uiTools.transformWaterEventNum2Word(msg.CATEGORY);

        var eventTypeText = uiTools.transformEventWord2Text(eventType);

        

        var eventDeviceInfo = this.getTargetEventDeviceInfo(msg.WGW_ID, undefined, msg.SIGNAL_ID);

        var result = {
            id: msg.ID,
            title: "设备发生" + eventTypeText,
            titleClass: "notyfy_icon_" + eventType,
            //msg: /*"【水源监测】" + */ uiTools.conStr(msg.EnterpriseName, msg.BuildingName, msg.KeyPartName, msg.WGWName, msg.SignalName) + "发生了" + eventTypeText + ",请立即前往查看",
            system: "water",
            status: eventType,
            deviceId: eventDeviceInfo.deviceId,
            deviceLevel: eventDeviceInfo.deviceLevel,
            eventCategory: "1" //只能写死啦
        };

        //如果 说明文字和事件类别 文字不能,那么 在后面 括号中 详细说明
        if (eventTypeText != msg.DESCRIPTION) {
            eventTypeText = eventTypeText +  "(" + msg.DESCRIPTION +")";
        }

        if (typeof (msg.DOMAIN_NAME) === "undefined") { //兼容老版本数据推送
            result.msg = /*"【水源监测】" + */ uiTools.conStr(msg.EnterpriseName, msg.BuildingName, msg.KeyPartName, msg.WGWName, msg.SignalName) + "发生了" +eventTypeText+ ", 请立即前往查看";
        }
        else { //新版推送
            result.msg = /*"【水源监测】" + */ uiTools.conStr(msg.ENTERPRISE_NAME, msg.BUILDING_NAME, msg.KEYPART_NAME, msg.WGW_NAME, msg.SIGNAL_NAME) + "发生了"+ eventTypeText+", 请立即前往查看";
        }
        return result;
    };

    //智慧用电消息处理
    EventPush.prototype.processElectricEvent = function(msg) {
        /*
        msg =   {
{
    "ID": "294371ce-025f-4217-adf5-70f02ee6c076",
    "OCCUR_DATETIME": "2019-09-03T14:01:25.4077723+08:00",
    "RECEIVE_DATETIME": "2019-09-03T14:01:25.4179842+08:00",
    "CATEGORY": 2,
    "SOURCE_CATEGORY": 2015,
    "DOMAIN_ID": "cd13171c-fc2c-49cb-8ea6-c6fcf3d8134f",
    "ENTERPRISE_ID": "82f7e559-e9a0-46a3-9649-d7afb55973f3",
    "BUILDING_ID": "d036c5f8-ea8b-4e9e-b236-eb0c52169f31",
    "KEYPART_ID": "6a1cbea6-a2fb-4651-80df-d3f6758c69a8",
    "DOMAIN_NAME": "华莱凯悦",
    "ENTERPRISE_NAME": "喜徕大厦股份有限公司",
    "BUILDING_NAME": "喜徕大厦",
    "KEYPART_NAME": null,
    "ADDRESS": "大门口",
    "GATEWAY_ID": "0953c214-53e9-47ca-b44a-dc2c5aed553c",
    "GATEWAY_CODE": "01EB26E10027",
    "COMPONET_ID": "db459a77-3ae6-4f55-99d9-72a29029d595",
    "COMPONET_CODE": 2,
    "VALUE": 0.0,
    "UNIT": "℃",
    "ALALOG_TYPE": 3,
    "IS_HANDLED": false,
    "RESULT": 1,
    "HANDLED_DATETIME": "0001-01-01T00:00:00",
    "EXT": "温度自检故障",
    "GATEWAY_NAME": " 我的真设备",
    "SourceCategoryName": null,
    "CategoryName": null,
    "Leader": null,
    "Telephone": null,
    "PictureId": 0,
    "HeartTime": "0001-01-01T00:00:00",
    "OnlineStatus": 0,
    "DataStatus": 0
}
}
        */

        var eventType = uiTools.transformElectricEventNum2Word(msg.CATEGORY);

        var eventTypeText = uiTools.transformEventWord2Text(eventType);

        var eventDeviceInfo = this.getTargetEventDeviceInfo(msg.GID, undefined, msg.COMPONET_ID);

        var result = {
            id: msg.ID,
            title: "设备发生" + eventTypeText,
            titleClass: "notyfy_icon_" + eventType,
            msg: /*"【智慧用电】" + */ uiTools.conStr(msg.ENTERPRISE_NAME, msg.BUILDING_NAME, msg.KEYPART_NAME, msg.GATEWAY_NAME, msg.COMPONET_CODE) + "发生了" + eventTypeText + "(" + msg.EXT + ")" + ",请立即前往查看",
            system: "electric",
            status: eventType,
            deviceId: eventDeviceInfo.deviceId,
            deviceLevel: eventDeviceInfo.deviceLevel,
            eventCategory: "13" 

        };
        return result;
    };


    // 这个和 火推过来的数据结构一致.

    //小微场所消息处理
    EventPush.prototype.processSmallplaceEvent = function(msg) {

        /*
       {
"ID": "5eef05be-1041-416f-aad8-aa73aebad2a7",
"OCCUR_DATETIME": "2018-11-10T10:47:20",
"RECEIVE_DATETIME": "2018-11-10T10:47:20",
"CATEGORY": 1,
"SOURCE_CATEGORY": 1004,
"DOMAIN_ID": "54b270e5-d854-4d6b-b74a-d2529096190a",
"ENTERPRISE_ID": "c4627d45-32e6-48a7-9c58-533e983f8fdb",
"BUILDING_ID": "06a6baa7-81a5-43a7-91e7-a2e1e45e8258",
"KEYPART_ID": "67b8241d-85fd-4a32-9c2e-5e45d1746781",
"WGW_ID": "1b9f7545-e15d-455a-86da-65274f39050b",
"SIGNAL_ID": "68e3ee04-ad2a-48a6-94a5-e2f94cb492cd",
"VALUE": 70.62,
"THRESHOLD": 100.0,
"DESCRIPTION": "下限",
"IS_HANDLED": false,
"RESULT": 0,
"HANDLED_DATETIME": null,
"END_DATETIME": "2018-11-10T11:30:51",
"TIMES": 32,
"DomainName": "海港区虚拟子中心2",
"EnterpriseName": "宁浩发展二二分公司",
"EnterpriseAddress": null,
"BuildingName": "22号楼",
"KeyPartName": "重点1643号部位",
"WGWCode": null,
"WGWName": "二二公司1号水网关",
"SignalName": "大厅南侧",
"DataStatus": 0
}

新版 推送以下字段,去掉相应的骆驼命名法的字段:

   "DOMAIN_NAME": "海港区虚拟子中心2",
   "ENTERPRISE_NAME": "宁浩发展二二分公司",
   "BUILDING_NAME": "22号楼",
   "KEYPART_NAME": "重点1643号部位",
   "WGW_NAME": "二二公司1号水网关",
   "SIGNAL_NAME": "大厅南侧",

       */
        var eventType = uiTools.transformFireEventNum2Word(msg.CATEGORY);

        var eventTypeText = uiTools.transformEventWord2Text(eventType);

        var eventDeviceInfo = this.getTargetEventDeviceInfo(msg.UITD_ID, msg.SYSTEM_ID, msg.SIGNAL_ID);

        var result = {
            id: msg.ID,
            title: "设备发生" + eventTypeText,
            titleClass: "notyfy_icon_" + eventType,
            msg: /*"【小微场所】" +*/ uiTools.conStr(msg.ENTERPRISE_NAME, msg.BUILDING_NAME, msg.KEYPART_NAME, msg.UITD_NAME, msg.SIGNAL_NAME) + "发生了" + eventTypeText + ",请立即前往查看",
            system: "fire",
            status: eventType,
            deviceId: eventDeviceInfo.deviceId,
            deviceLevel: eventDeviceInfo.deviceLevel,
            eventCategory: msg.SystemCategory
        };


        return result;
    };

 

    //暴露接口
    exports(MODULE_NAME, new EventPush());
});