
layui.define(['jquery', 'form', 'neat', 'neatDataApi', 'commonDataApi', "laytpl", 'neatTools'], function (exports) {
    "use strict";

    var MODULE_NAME = 'neatUITools';

    var $ = layui.$;
    var form = layui.form;
    var commonDataApi = layui.commonDataApi;
    var laytpl = layui.laytpl;
    var neat = layui.neat;
    var neatDataApi = layui.neatDataApi;
    var tools = layui.neatTools;


    var notUse = "不适用";

    var linkageDeviceTypeDictionary = [];

    var NeatUITools = function () {

        //初始化 linkageDeviceTypeDictionary
        layui.each(commonDataApi.getLinkageDeviceCategoryData(), function (_, item) {

            linkageDeviceTypeDictionary[item.id] = item.name;
        });

    };

    //渲染巡检任务完成情况
    NeatUITools.prototype.renderTaskInstanceFinishStatus = function (data) {

        //1    待完成
        //2    已超期
        //3    已完成


        if (data == null) {
            data = "";
        }
        if (typeof data === 'undefined') {
            data = "";
        }

        switch (data.toString()) {
            case "1":
                return "<span class='task-finish-1'> 待完成 </span>";
            case "2":
                return "<span class='task-finish-2'> 已超期 </span>";
            case "3":
                return "<span class='task-finish-3'> 已完成 </span>";
            default:
                return "";
        }

    };
    //渲染巡检任务完成情况
    NeatUITools.prototype.renderMaintainLogInContractStatus = function (data) {

        //true    是
        //false   否

        if (data == null) {
            data = "";
        }
        if (typeof data === 'undefined') {
            data = "";
        }

        switch (data.toString()) {
            case "true":
                return "<span class='in-contract-true'> 是 </span>";
            case "false":
                return "<span class='in-contract-false'> 否 </span>";
            default:
                return "";
        }

    };

    //渲染 维保 工单状态
    NeatUITools.prototype.renderMaintainWorkOrdersStatus = function (data) {

        //未受理
        //已受理
        //已处理
        //已解决
        //未解决

        if (data == null) {
            data = "";
        }
        if (typeof data === 'undefined') {
            data = "";
        }

        switch (data.toString()) {
            case "1":
                return "<span class='work-orders-status-1'> 未受理 </span>";
            case "2":
                return "<span class='work-orders-status-2' >已受理 </span>";
            case "3":
                return "<span class='work-orders-status-3'> 已处理 </span>";
            case "4":
                return "<span class='work-orders-status-4'> 已解决 </span>";
            case "5":
                return "<span class='work-orders-status-5'> 未解决 </span>";
            default:
                return "";
        }

    };


    //渲染 维保 工单 操作
    NeatUITools.prototype.renderMaintainWorkOrdersOperation = function (data) {
        if (data == null) {
            data = "";
        }
        if (typeof data === 'undefined') {
            data = "";
        }

        var result1 = '<a lay-event="detail" title="查看" href="javascript:void(0)" style="color:#babdc9;"><i class="far fa-eye"></i></a>';

        var result2 = '<a lay-event="confirm" title="去确认" href="javascript:void(0)" style="color:#babdc9;"><i class="fas fa-check"></i></a>';


        switch (data.toString()) {
            case "1": //未受理
                return result1;
            case "2"://已受理
                return result1;
            case "3"://已处理
                return result1 + "&nbsp;&nbsp;" + result2;
            case "4"://已解决
                return result1;
            case "5"://未解决
                return result1;
            default:
                return "";
        }

    };

    //渲染 巡检点 巡检结果
    NeatUITools.prototype.renderPatrolPointResult = function (data) {

        if (data == null) {
            data = "";
        }
        if (typeof data === 'undefined') {
            data = "";
        }
        switch (data.toString()) {
            case "0":
                return "<span class='patrol-point-result-0'> 未知 </span>";
            case "1":
                return "<span class='patrol-point-result-1'> 正常 </span>";
            case "2":
                return "<span class='patrol-point-result-2' >隐患 </span>";
            default:
                return "";
        }



    };

    //渲染 巡检项目 巡检结果
    NeatUITools.prototype.renderPatrolProjectResult = function (data) {

        if (data == null) {
            data = "";
        }
        if (typeof data === 'undefined') {
            data = "";
        }
        switch (data.toString()) {
            case "0":
                return "<span class='patrol-project-result-0'> 未知 </span>";
            case "1":
                return "<span class='patrol-project-result-1'> 正常 </span>";
            case "2":
                return "<span class='patrol-project-result-2' >隐患 </span>";
            default:
                return "";
        }



    };

    //渲染 角色级别
    NeatUITools.prototype.renderRoleLevel = function (data) {



        if (data == null) {
            data = "";
        }
        if (typeof data === 'undefined') {
            data = "";
        }
        switch (data.toString()) {

            case "1":
                return "普通用户";
            case "2":
                return "管理员";
            default:
                return "";
        }



    };




    //渲染 水信号 设备类型 (液位,液压,温度等)
    NeatUITools.prototype.renderWaterSignalValueCategory = function (data) {

        if (data == null) {
            data = "";
        }
        if (typeof data === 'undefined') {
            data = "";
        }
        switch (data.toString()) {
            case "1":
                return "<span> 液压 </span>";
            case "2":
                return "<span> 液位 </span>";
            case "3":
                return "<span> 温度 </span>";
            default:
                return "";
        }



    };

    //渲染 水信号类型( 模拟量,信号量等)
    NeatUITools.prototype.renderPhysicalSignalCategory = function (data) {

        if (data == null) {
            data = "";
        }
        if (typeof data === 'undefined') {
            data = "";
        }
        switch (data.toString()) {
            case "1":
                return "<span> 数字量 </span>";
            case "2":
                return "<span> 模拟量 </span>";

            default:
                return "";
        }



    };







    //渲染 通用设备在线状态 
    NeatUITools.prototype.renderDeviceOnlineStatus = function (data) {


        if (data == null) {
            data = "";
        }
        if (typeof data === 'undefined') {
            data = "";
        }


        switch (data.toString()) {
            case "1":
                return "<span class='device-online-status-1'> 离线 </span>";
            case "2":
                return "<span class='device-online-status-2'> 在线 </span>";
            case "-1":
                return "<span class='device-online-status--1'> " + notUse + " </span>";
            default:
                return "";
        }



    };



    //渲染 设备警报状态 
    NeatUITools.prototype.renderEventTypeByWord = function (data) {

        if (data == null) {
            data = "";
        }
        if (typeof data === 'undefined') {
            data = "";
        }
        switch (data.toString()) {
            case "ok":
                return "<span class='event-normal'> 正常 </span>";
            case "none":
                return "<span class='event-normal'> 正常 </span>";
            case "fire":
                return "<span class='event-fire'> 火警 </span>";
            case "fault":
                return "<span class='event-fault'> 故障 </span>";
            case "alarm":
                return "<span class='event-alarm'> 报警 </span>";
            default:
                return "";
        }

    };
    //根据英文渲染设备报警状态, fire , alarm ,falut,ok,none等
    NeatUITools.prototype.renderDeviceAlarmStatusByWord = function (data) {
        if (data == null) {
            data = "";
        }
        if (typeof data === 'undefined') {
            data = "";
        }

        switch (data.toString().toLowerCase()) {
            case "none":
                return "<span class='das das-normal'>正常</span>";
            case "0":
                return "<span class='das das-normal'>正常</span>";
            case "ok":
                return "<span class='das das-normal'>正常</span>";
            case "fire":
                return "<span class='das das-fire'>火警</span>";
            case "alarm":
                return "<span class='das das-alarm'>报警</span>";
            case "fault":
                return "<span class='das das-fault'>故障</span>";
            case "notfound":
                return "<span class='das das-notfound'>设备未录入或已删除</span>";
            default:
                return "";
        }

    };




    //获取根据英文,获取设备报警状态的文字
    NeatUITools.prototype.getDeviceAlarmStatusTextByWord = function (data) {
        if (data == null) {
            data = "";
        }
        if (typeof data === 'undefined') {
            data = "";
        }
        switch (data.toString().toLowerCase()) {
            case "0":
                return "正常";
            case "ok":
                return "正常";
            case "none":
                return "正常";
            case "fire":
                return "火警";
            case "fault":
                return "故障";
            case "alarm":
                return "报警";
            default:
                return "";
        }
    };

    //获取设备在线状态的文字
    NeatUITools.prototype.getDeviceOnlineStatusText = function (data) {

        if (data == null) {
            data = "";
        }
        if (typeof data === 'undefined') {
            data = "";
        }
        switch (data.toString()) {
            case "1":
                return "离线";
            case "2":
                return "在线";
            case "-1":
                return notUse;

            default:
                return "";
        }



    };


    //转义火系统事件类型 1->fire
    NeatUITools.prototype.transformFireEventNum2Word = function (val) {
        switch (val.toString()) {
            case "1":
                return "fire";
            case "2":
                return "fault";
            case "5":
                return "alarm";
            case "3":
                return "status";
        }
    };

    //转义水系统事件 1->alarm
    NeatUITools.prototype.transformWaterEventNum2Word = function (val) {
        switch (val.toString()) {
            case "1":
                return "alarm";
            case "2":
                return "fault";
            case "3":
                return "status";

        }
    };

    //转义智慧用电事件 1->alarm
    NeatUITools.prototype.transformElectricEventNum2Word = function (val) {
        switch (val.toString()) {

            case "2":
                return "fault";
            case "5":
                return "alarm";

        }
    };

    //转义小微场所事件
    NeatUITools.prototype.transformSmallplaceEventNum2Word = function (val) {
        switch (val.toString()) {
            case "1":
                return "fire";
            case "2":
                return "fault";
            case "6":
                return "alarm";

        }
    };

    /**
 * 把事件类型中文文字变成标识值
 * @param {String} text  文本,可能的值如下: 火警 故障 报警
 * @returns {string} fire  fault  alarm
 */
    NeatUITools.prototype.transformEventTypeText2Word = function (text) {
        if (text === "火警") {
            return "fire";
        } else if (text === "故障") {
            return "fault";
        } else if (text === "报警") {
            return "alarm";
        } else if (text === "正常") {
            return "normal";
        }

    };
    //翻译事件类型的英文表述为中文  fire->火警
    NeatUITools.prototype.transformEventWord2Text = function (eventTypeId) {

        var str = eventTypeId.toString().toLowerCase();

        if (str === "fire") {
            return "火警";
        }
        else if (str === "alarm") {
            return "报警";
        }
        else if (str === "fault") {
            return "故障";
        }
        else if (str === "normal") {
            return "正常";
        }
        else if (str === "status") {
            return "状态";
        } else {
            return eventTypeId;
        }
    };

    //串接字符串
    NeatUITools.prototype.conStr = function (str1, str2, str3, str4, str5, str6) {
        var result = "";
        if (str1) {
            result = result + str1;
        }
        if (str2) {
            result = result + str2;
        }
        if (str3) {
            result = result + str3;
        }
        if (str4) {
            result = result + str4;
        }
        if (str5) {
            result = result + str5;
        }
        if (str6) {
            result = result + str6;
        }
        return result;

    };


    // null 返回 "" undefined 返回""
    NeatUITools.prototype.nullIF = function (str1, str2) {
        if (str2 == null || typeof str2 === "undefined") {
            str2 = "　"; //全角空格
        }
        if (str1 == null || typeof str1 === "undefined") {
            return str2;
        }
        else {
            return str1.toString();
        }
    };

    //渲染 设备信号强度
    NeatUITools.prototype.renderSignalStatus = function (data) {

        if (data == null) {
            data = "-999999";
        }
        if (typeof data === 'undefined') {
            data = "-999999";
        }

        var realData = parseInt(data);

        var tmpl = "<div class='signal-status signal-status-{{d.status}} ' title='{{d.num}}dBm'></div>";

        var d = {};
        d.num = realData;
        if (realData < -113) {
            d.status = 0;
        }
        else if (realData < -107) {
            d.status = 1;

        } else if (realData < -103) {
            d.status = 2;

        } else if (realData < -101) {
            d.status = 3;

        } else if (realData < -91) {
            d.status = 4;

        } else {
            d.status = 5;
        }
        return laytpl(tmpl).render(d);
    };







    // 渲染 机构类别
    NeatUITools.prototype.renderOrgType = function (data) {
        if (data == null) {
            data = "";
        }
        if (typeof data === 'undefined') {
            data = "";
        }
        switch (data.toString()) {
            case "1":
                return "中心";
            case "2":
                return "单位";
            case "3":
                return "建筑";
            case "4":
                return "部位";

            default:
                return "";
        }

    };

    // 渲染 运营商
    NeatUITools.prototype.renderISP = function (data) {
        if (data == null) {
            data = "";
        }
        if (typeof data === 'undefined') {
            data = "";
        }
        switch (data.toString()) {
            case "1":
                return "";
            case "2":
                return "中国移动";
            case "3":
                return "中国电信";
            case "4":
                return "潍坊平台";

            default:
                return "";
        }

    };

    // 渲染 运行环境
    NeatUITools.prototype.renderRuntimeEnv = function (data) {
        if (data == null) {
            data = "";
        }
        if (typeof data === 'undefined') {
            data = "";
        }
        switch (data.toString()) {
            case "true":
                return "正式环境";
            case "false":
                return "测试环境";
            default:
                return "";
        }

    };

    //渲染视频设备类别
    NeatUITools.prototype.renderVideoDeviceType = function (data) {
        if (data == null) {
            data = "";
        }
        if (typeof data === 'undefined') {
            data = "";
        }

        switch (data.toString()) {
            case "dvr":
                return "硬盘录像机(DVR)";
            case "ipc":
                return "网络摄像机(IPC)";
            case "nvr":
                return "网络录像机(NVR)";
            default:
                return "";
        }
    };

    //渲染 萤石云视频设备与本地数据库设备的比较结果
    NeatUITools.prototype.renderVideoDeviceCompareResult = function (data) {
        if (data == null) {
            data = "";
        }
        if (typeof data === 'undefined') {
            data = "";
        }
        switch (data.toString()) {
            case "1": //蓝色
                return "<span class=\"layui-badge-dot  layui-bg-blue\" title='云端新增设备'></span>";
            case "2": //黄色
                return "<span class=\"layui-badge-dot layui-bg-orange\"  title='云端修改设备'></span>";
            case "3": //红色
                return "<span class=\"layui-badge-dot \"  title='云端删除设备'></span>";
            default: //绿色
                return "<span class=\"layui-badge-dot layui-bg-green\" title='本地与云端相同' ></span>";
        }
    };

    //获取 两个字符串中不是空的那个 返回
    NeatUITools.prototype.getRealString = function (str1, str2) {
        return !str1 ? str2 : str1;
    };


    //翻译警情联动绑定设备的设备类型
    NeatUITools.prototype.renderLinkageDeviceTypeText = function (str1) {

        return linkageDeviceTypeDictionary[str1];

    };


    // 渲染初始化自定义logo
    NeatUITools.prototype.renderCustomLogo = function (logoClass) {

        var setDefaultLogo = function () {
            //background:  left center no-repeat;
            $(logoClass).css("background", "url('/content/neat/images/neat-common/logo.png') left center no-repeat");
        };

        var setCustomLogo = function (logoId) {
            //background:  left center no-repeat;

            var logoUrl = neatDataApi.getLogoFileUrl(logoId);

            $(logoClass).css("background", "url('" + logoUrl + "') left center no-repeat");
        };

        neatDataApi.getLogo(neat.getUserToken()
            , function (resultData) {
                if (resultData && resultData != "00000000-0000-0000-0000-000000000000") {
                    setCustomLogo(resultData);
                }
                else {
                    setDefaultLogo();
                }
            }
            , function (fail) {
                setDefaultLogo();
            });
    };


    // 自动格式化地址码
    NeatUITools.prototype.initAutoFormatAddressCode = function (ctlId) {

        var ctl = $("#" + ctlId);

        ctl.on("keydown blur", function (event) {

            if (event.type == "keydown" && event.which != 13) {
                return;
            }
            ctl.val(tools.formatDECAddrCode(ctl.val()));

        });
    };


    // 渲染  绑定状态
    NeatUITools.prototype.renderBindStatus = function (data) {

        var that = this;

        if (data == null) {
            data = "";
        }
        if (typeof data === 'undefined') {
            data = "";
        }



        if (!this.allBindStatusData) {
            that.allBindStatusData = {};

            var alldata = commonDataApi.getBindStatusData();

            $.each(alldata, function (_, value) {
                that.allBindStatusData[value.id] = value.name;
            });

        }

        return this.allBindStatusData[data];

    };



    //暴露接口
    exports(MODULE_NAME, new NeatUITools());
});