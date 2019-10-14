
// 历史警情 列表
layui.define(["jquery", 'element', 'form', 'table', 'laytpl', 'laypage', 'layer', 'laydate', 'neat', "neatLoginOp"
    , 'neatNavigator', 'commonDataApi', 'monitorDataApi', 'neatUITools', "neatPopupRepository"
    , "neatTime"
], function (exports) {
    "use strict";

    var MODULE_NAME = "pageHistoryEventQuery";

    var $ = layui.$;
    var table = layui.table;
    var form = layui.form;
    var laytpl = layui.laytpl;
    var laydate = layui.laydate;

    var neat = layui.neat;
    var laypage = layui.laypage;
    var neatNavigator = layui.neatNavigator;
    var commonDataApi = layui.commonDataApi;
    var pageDataApi = layui.monitorDataApi;
    var uiTools = layui.neatUITools;
    var neatTime = layui.neatTime;
    var popups = layui.neatPopupRepository;

    var defaultPageSize = 16;

    var SubPage = function () { };


    SubPage.prototype.init = function () {

        var that = this;




        var loginOp = layui.neatLoginOp;
        loginOp.checkLogin();


        $("title").text(layui.neat.appName);

        //开始网页底部时间计时
        neatTime({
            elem: "#currentTime"
        });

        this.initDefaultValues();

        this.initAlarmType();
        this.initProcessResult();
        this.initDate();

        this.initOptDomain();
        this.initOptEnt();

        this.initTable();
        this.initPager();


        //查询
        this.initQueryEvent();
        //刷新
        this.initRefreshEvent();



        //表格操作列事件
        this.initTableOperateColEvent();

        this.bindTable();

        //渲染自定义logo
        uiTools.renderCustomLogo(".logo");

        form.render();

    };

    //初始化 中心列表
    SubPage.prototype.initOptDomain = function () {

        var that = this;

        form.on('select(optDomain)', function (data) {
            //console.log(data.elem); //得到select原始DOM对象
            //console.log(data.value); //得到被选中的值
            //console.log(data.othis); //得到美化后的DOM对象
            that.domainId = data.value;

            that.bindEnt();
        });

        that.bindDomain();

    };

    //绑定 中心列表
    SubPage.prototype.bindDomain = function () {

        var that = this;
        var token = neat.getUserToken();

        commonDataApi.getDomainList(token, function (resultData) {

            var d = {};
            d.data = resultData;
            laytpl($("#optDomainTemplate").html()).render(d, function (html) {

                var parent = $("#optDomain").html(html);
                form.render('select', 'optDomainForm');
            });


        });

    };


    //初始化 单位列表
    SubPage.prototype.initOptEnt = function () {

        var that = this;

        form.on('select(optEnt)', function (data) {
            //console.log(data.elem); //得到select原始DOM对象
            //console.log(data.value); //得到被选中的值
            //console.log(data.othis); //得到美化后的DOM对象
            that.entId = data.value;
        });

        that.bindEnt();

    };
    //绑定 单位列表
    SubPage.prototype.bindEnt = function () {

        var that = this;
        var token = neat.getUserToken();


        if (!this.domainId || this.domainId === "") {
            //选中的是企业节点
            var d = {};
            d.data = [];
            laytpl($("#optEntTemplate").html()).render(d, function (html) {

                var parent = $("#optEnt").html(html);
                form.render('select', 'optEntForm');
            });
        }
        else {
            commonDataApi.getEntByDomainId(token, this.domainId, function (resultData) {

                var d = {};
                d.data = resultData;
                laytpl($("#optEntTemplate").html()).render(d, function (html) {

                    var parent = $("#optEnt").html(html);
                    form.render('select', 'optEntForm');
                });


            });
        }
    };

    //初始化表格操作列的事件
    SubPage.prototype.initTableOperateColEvent = function () {
        var that = this;

        table.on('tool(resultTable)', function (obj) {
            var data = obj.data;
            var tthat = that;
            if (obj.event === 'event-process') {
                popups.showEventProcessWindow(data[dataPropertyNames.eventId], data[dataPropertyNames.deviceId], data[dataPropertyNames.deviceCategory], data[dataPropertyNames.eventCategory], function () {

                    tthat.bindTable();

                });

            } else if (obj.event === 'event-detail') {

                popups.showEventProcessResultWindow(data[dataPropertyNames.eventId], data[dataPropertyNames.deviceId], data[dataPropertyNames.deviceCategory], data[dataPropertyNames.eventCategory]);

            } else if (obj.event === 'planar-graph') {

                popups.showDevicePlanarGraphWindow(data[dataPropertyNames.deviceId]);

            } else if (obj.event === 'gis-locate') {

                popups.showDeviceMapLocationWindow(data[dataPropertyNames.transferId], data[dataPropertyNames.enterpriseId]);

            } else if (obj.event === 'camera') {
                if (data.systemCategory == 13) {//智慧用电弹框
                    popups.showDeviceRelatedCameraWindow(data[dataPropertyNames.transferId]);
                } else {
                    popups.showDeviceRelatedCameraWindow(data[dataPropertyNames.deviceId]);
                }
               

            }

        });
    };

    //初始化 警情类型
    SubPage.prototype.initAlarmType = function () {

        var that = this;

        form.on('select(optAlarmType)', function (data) {
            //console.log(data.elem); //得到select原始DOM对象
            //console.log(data.value); //得到被选中的值
            //console.log(data.othis); //得到美化后的DOM对象
            that.optAlarmType = data.value;
        });

        that.bindAlarmType();

    };
    //绑定 警情类型
    SubPage.prototype.bindAlarmType = function () {

        var that = this;
        var token = neat.getUserToken();

        commonDataApi.getAlarmTypeData(token, function (resultData) {

            var d = {};
            d.data = resultData;
            laytpl($("#optAlarmTypeTemplate").html()).render(d, function (html) {

                var parent = $("#optAlarmType").html(html);
                form.render('select', 'optAlarmTypeForm');
            });


        });

    };

    //初始化 处理情况
    SubPage.prototype.initProcessResult = function () {

        var that = this;

        form.on('select(optProcessResult)', function (data) {
            //console.log(data.elem); //得到select原始DOM对象
            //console.log(data.value); //得到被选中的值
            //console.log(data.othis); //得到美化后的DOM对象
            that.optProcessResult = data.value;
        });

        that.bindProcessResult();

    };
    //绑定 处理情况
    SubPage.prototype.bindProcessResult = function () {

        var that = this;
        var token = neat.getUserToken();

        commonDataApi.getProcessResultData(token, function (resultData) {

            var d = {};
            d.data = resultData;
            laytpl($("#optProcessResultTemplate").html()).render(d, function (html) {

                var parent = $("#optProcessResult").html(html);
                form.render('select', 'optProcessResultForm');
            });


        });

    };


    SubPage.prototype.initDefaultValues = function () {

        this.currentPageIndex = 1;
        this.currentPageSize = defaultPageSize;


        this.optAlarmType = "0";
        this.optProcessResult = "0";
        this.startDate = "";
        this.endDate = "";

        this.domainId = "";
        this.entId = "";
    };

    SubPage.prototype.bindTable = function () {

        var that = this;
        /* 所有的数据列

        */

        /* 后端api要求的数据

        */

        

        var token = neat.getUserToken();

        var deviceName = $.trim($("#txtDeviceName").val());

        var orderByColumn = "0";
        var isDescOrder = "true";

        var loadingIndex = layui.layer.load(1);


        pageDataApi.queryHistoryEvent(token, deviceName, this.optAlarmType, this.optProcessResult, this.startDate, this.endDate, this.domainId, this.entId,
            orderByColumn, isDescOrder, that.currentPageIndex, that.currentPageSize,
            function (resultData) {
                layui.layer.close(loadingIndex);
                //成功
                table.reload("resultTable", {
                    data: resultData.data
                   
                });
                that.initPager(resultData.totalCount, that.currentPageIndex);

            },
            function () { //失败
                layui.layer.close(loadingIndex);
                that.currentPageIndex = 1;
                table.reload("resultTable", {
                    data: []
                   
                });
                that.initPager(0, 1);

                //layer.msg("查询历史警情发生错误!");
            });
    };

    //初始化两个日期控件
    SubPage.prototype.initDate = function () {

        var that = this;

        laydate.render({
            elem: '#dateSpan', //指定元素
            type: 'date',
            range: "~",
            format: "yyyy-MM-dd",
            trigger: "click",
            done: function (value, startDate, endDate) {

                //console.log(value); //得到日期生成的值，如：2017-08-18
                //console.log(startDate); //得到日期时间对象：{year: 2017, month: 8, date: 18, hours: 0, minutes: 0, seconds: 0}
                //console.log(endDate); //得结束的日期时间对象，开启范围选择（range: true）才会返回。对象成员同上。
                
                that.startDate = startDate.year+"-"+startDate.month+"-"+startDate.date;
                that.endDate = endDate.year + "-" + endDate.month + "-" + endDate.date;;
            }

        });

    };

    //清空表格
    SubPage.prototype.clearTable = function () {

        var that = this;

        table.reload("resultTable", {
            data: []
           
        });
        that.currentPageIndex = 1;
        that.initPager(0, 1);
    };


    SubPage.prototype.initPager = function (totalCount, pageIndex) {

        var that = this;

        if (!totalCount) {
            totalCount = 0;
        }
        if (!pageIndex) {
            pageIndex = 1;
        }

        laypage.render({
            elem: 'resultTablePager',
            count: totalCount, //数据总数，从服务端得到
            limit: that.currentPageSize,
            hash: false,
            layout: ['count', 'prev', 'page', 'next'],
            curr: pageIndex,
            jump: function (obj, first) {
                //obj包含了当前分页的所有参数，比如：
                //console.log(obj.curr); //得到当前页，以便向服务端请求对应页的数据。
                //console.log(obj.limit); //得到每页显示的条数

                that.currentPageIndex = obj.curr;
                that.currentPageSize = obj.limit;

                //首次不执行
                if (!first) {
                    //do something
                    that.bindTable(obj.curr, obj.limit);
                }
            }
        });
        };


        /*
         * 
         address: null
alarmDesc: "火警"
alarmType: "fire"
buildingName: null
deviceId: "3b60d144-3f21-41a4-b8f8-546edd6fbc5b"
deviceIdType: 1
deviceName: "用户信息传输装置01"
domainName: "尼特云中心"
enterpriseName: "宁浩发展六七分公司"
eventId: "ff75e54c-a4be-45a7-b847-da1a72bdb03b"
handledResult: 1
isHandled: false
keypartName: null
occurTime: "2019-04-13 14:23:26"
systemCategory: "0"
         */
    var dataPropertyNames = {

        alarmType: "alarmType",
        deviceName: "deviceName",
        alarmSourceType: "alarmDesc",
        eventTime: "occurTime",
        address: "address",
        keypartName: "keypartName",
        buildingName: "buildingName",
        entName: "enterpriseName",
        domainName: "domainName",
        deviceId: "deviceId",
        deviceCategory: "deviceIdType",
        eventId: "eventId",
        eventCategory:"systemCategory",
        isHandled: "isHandled",
        handledResult: "handledResult",
        enterpriseId: "enterpriseId",
        transferId: "transferId"
    };

    SubPage.prototype.initTable = function () {

        var that = this;
        that.table = table.render({
            elem: '#resultTable',
            id: "resultTable",
            data: [],
            page: false,
            limit: defaultPageSize,
            autoSort: false,
            height: "700px",
           
            cols: [
                [

                    { field: dataPropertyNames.alarmType, title: '警情类型',  width: 120, templet: function (d) { return uiTools.renderEventTypeByWord(d[dataPropertyNames.alarmType]); } },
                    { field: dataPropertyNames.deviceName, title: '设备名称',  width: 220 },
                    { field: dataPropertyNames.alarmSourceType, title: '内容',  width: 180 },
                    { field: dataPropertyNames.eventTime, title: '发生时间',  width: 190 },
                    { field: dataPropertyNames.address, title: '安装位置',  width: 250 },
                    { field: dataPropertyNames.keypartName, title: '所属部位', width: 200 },
                    { field: dataPropertyNames.buildingName, title: '所属建筑',  width: 200 },
                    { field: dataPropertyNames.entName, title: '所属单位',  width: 200 },
                    { field: dataPropertyNames.domainName, title: '所属中心',  width: 200 },
                    { field: 'operation', fixed: 'right', title: '操作', width: 180, align: 'center', toolbar: '#opColTemplate' }
                ]
            ]
        });

    };


    //查询
    SubPage.prototype.initQueryEvent = function () {
        var that = this;
        $("#btnQuery").on("click", function () {
            that.currentPageIndex = 1;
            that.bindTable();
        });
    };
    //刷新
    SubPage.prototype.initRefreshEvent = function () {
        var that = this;
        $("#btnRefresh").on("click", function () {
            that.bindTable();
        });



    };


    var instance = new SubPage();


    //暴露接口
    exports(MODULE_NAME, instance);

});