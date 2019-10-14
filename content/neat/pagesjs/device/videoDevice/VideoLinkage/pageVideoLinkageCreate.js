//添加视频联动
layui.define(["jquery", 'form', 'table', 'laytpl', 'laypage', 'layer', 'commonDataApi', 'neatDataApi', 'neat', 'neatNavigator', 'videoDeviceDataApi','neatUITools'], function (exports) {

    "use strict";

    var MODULE_NAME = "pageVideoLinkageCreate";

    var $ = layui.$;
    var table = layui.table;
    var form = layui.form;
    var laytpl = layui.laytpl;
    var laypage = layui.laypage;
    var layer = layui.layer;
    var commonDataApi = layui.commonDataApi;

    var neatNavigator = layui.neatNavigator;
    var neat = layui.neat;
    var uiTools = layui.neatUITools;

    var pageDataApi = layui.videoDeviceDataApi;



    //列表页面的数据列
    var dataPropertyNames = {
        id: "id",
        deviceId: "deviceId",
        deviceTypeId: "sourceCategory",
        deviceName: "deviceName",
        deviceAddress: "deviceAddress",
        keypartName: "keypartName",
        buildingName: "buildingName",

        //-----------多余的字段
        enterpriseName: "enterpriseName",
        channelNo: "channelNo",
        channelName: "channelName",
        domainId: "domainId",
        enterpriseId: "enterpriseId",
        buildingId:"buildingId",
        keypartId:"keypartId"
    };




    //从设备选择对话框选回来的设备信息包含的数据列
    var selectedDevicePropertyNames = {

        deviceCategory: "sourceCategory",

        id: "id",

    };



    var SubPage = function () {

        this.projectType = '';
        this.status = '0';

        this.orderByCol = 'id';
        this.orderSort = 'desc';

        this.enterpriseId = "";
        this.buildingId = "";
        this.keypartId = "";
        this.videoDeviceId = "";
        this.videoChannelId = "";


    };


    SubPage.prototype.init = function () {
        var that = this;

        this.enterpriseId = neatNavigator.getUrlParam("enterprise_id");

        this.initBuildingList();
        this.initKeyPartList();
        this.initVideoDeviceList();
        this.initVideoChannelList();

        // 初始化表定义
        this.initTable();

        //按钮事件
        that.initButtonEvent();


    };


    //初始化建筑列表
    SubPage.prototype.initBuildingList = function () {

        var that = this;

        form.on('select(optBuilding)', function (data) {
            //console.log(data.elem); //得到select原始DOM对象
            //console.log(data.value); //得到被选中的值
            //console.log(data.othis); //得到美化后的DOM对象

            that.buildingId = data.value;
            that.bindKeyPartList();
            that.bindVideoDeviceList();

        });
        that.bindBuildingList();
    };

    //绑定建筑列表
    SubPage.prototype.bindBuildingList = function () {

        var that = this;

        //根据企业的id获取建筑列表,然后绑定到select中.
        commonDataApi.getBuildingByEntId(neat.getUserToken(), this.enterpriseId, function (resultData) {
            var d = {};
            d.data = resultData;

            laytpl($("#optBuildingTemplate").html()).render(d, function (html) {
                var parent = $("#optBuilding").html(html);
                form.render('select', 'optBuildingForm');
            });
        });

    };

    //初始化建筑列表
    SubPage.prototype.initKeyPartList = function () {

        var that = this;

        form.on('select(optKeyPartList)', function (data) {
            //console.log(data.elem); //得到select原始DOM对象
            //console.log(data.value); //得到被选中的值
            //console.log(data.othis); //得到美化后的DOM对象

            that.keypartId = data.value;
            that.bindVideoDeviceList();
        });

    };

    //绑定关键部位列表
    SubPage.prototype.bindKeyPartList = function () {

        var that = this;
        var d = {};

        if (!that.buildingId) {
            d.data = [];
            that.fillKeypartList(d);
        }
        else {
            //根据企业的id获取建筑列表,然后绑定到select中.
            commonDataApi.getKeypartByBuildingId(neat.getUserToken(), that.buildingId, function (resultData) {
               
                d.data = resultData;
                that.fillKeypartList(d);
                
            });
        }

       

    };
    SubPage.prototype.fillKeypartList = function (d) {

        laytpl($("#optKeyPartListTemplate").html()).render(d, function (html) {
            var parent = $("#optKeyPartList").html(html);
            form.render('select', 'optKeyPartListForm');
        });
    };

    //初始化视频设备列表
    SubPage.prototype.initVideoDeviceList = function () {
        var that = this;

        form.on('select(optVideoDeviceList)', function (data) {
            //console.log(data.elem); //得到select原始DOM对象
            //console.log(data.value); //得到被选中的值
            //console.log(data.othis); //得到美化后的DOM对象

            that.videoDeviceId = data.value;
            that.bindVideoChannelList();
        });
        that.bindVideoDeviceList();
    };
    //视频设备列表绑定数据
    SubPage.prototype.bindVideoDeviceList = function () {
        var that = this;


        //加载符合条件的视频设备
        pageDataApi.searchVideoDevice(neat.getUserToken(), that.enterpriseId, that.buildingId, that.keypartId, function (resultData) {
            var d = {};
            d.data = resultData;

            laytpl($("#optVideoDeviceListTemplate").html()).render(d, function (html) {
                var parent = $("#optVideoDeviceList").html(html);
                form.render('select', 'optVideoDeviceListForm');
            });
        });
    };



    //初始化视频通道列表
    SubPage.prototype.initVideoChannelList = function () {
        var that = this;

        form.on('select(optVideoChannelList)', function (data) {
            //console.log(data.elem); //得到select原始DOM对象
            //console.log(data.value); //得到被选中的值
            //console.log(data.othis); //得到美化后的DOM对象

            that.videoChannelId = data.value;
            
            that.bindTable();
        });

    };

    //视频通道列表绑定数据
    SubPage.prototype.bindVideoChannelList = function () {
        var that = this;
        var d = {};

        if (!that.videoDeviceId) {
            d.data = [];
            that.fillVideoChannelList(d);
        }
        else {
            //加载视频设备id加载的视频通道
            pageDataApi.getVideoChannelsByVideoDeviceId(neat.getUserToken(), that.videoDeviceId, function (resultData) {
                d.data = resultData;
                that.fillVideoChannelList(d);
            });
        }
        
    };

    //填充视频通道下拉列表数据
    SubPage.prototype.fillVideoChannelList = function (d) {

        laytpl($("#optVideoChannelListTemplate").html()).render(d, function (html) {
            var parent = $("#optVideoChannelList").html(html);
            form.render('select', 'optVideoChannelListForm');
        });
    };


    //按钮事件
    SubPage.prototype.initButtonEvent = function () {
        var that = this;



        // 添加关联设备按钮事件
        $('#btnBrowse').on('click', function () {
            that.browseDevice();
        });

        // 添加关联设备按钮事件
        $('#btnDelete').on('click', function () {
            that.deleteLinkage();
        });
        

    };

    //删除联动
    SubPage.prototype.deleteLinkage = function () {
        var that = this;

        var checkStatus = table.checkStatus('resultTable');
        var data = checkStatus.data;

        if (data.length === 0) {
            return;
        }

        var ids = [];

        layui.each(data, function (_, item) {
            ids.push(item[dataPropertyNames.id]);
        });

        pageDataApi.deleteVideoLinkage(neat.getUserToken(), ids, function () {

            that.bindTable();
        });
        


        

        
    };

    ///添加联动设备
    SubPage.prototype.browseDevice = function () {
        var that = this;


        if (!this.videoChannelId || commonDataApi.isEmptyGuid(this.videoChannelId)) {
            layer.msg("请选择视频通道!");
            return;
        }


        var channelId = this.videoChannelId;

        var url = "/pages/device/videoDevice/VideoLinkage/DeviceSelector.html?enterprise_id=" + that.enterpriseId
            + "&building_id=" + that.buildingId
            + "&keypart_id=" + that.keypartId
            + "&__=" + new Date().valueOf().toString();


        var rootWindow = layui.neatWindowManager.getWindowRootParent();

        layui.neatWindowManager.openLayerInRootWindow({
            resize: false,
            type: 2,
            title: '添加关联设备',
            area: ["1200px", "750px"],
            shade: [0.7, '#000'],
            content: url,
            btn: ['确定', '关闭'],
            yes: function (index) {
                //当点击‘确定’按钮的时候，获取弹出层返回的值
                var selectedDevices = rootWindow["layui-layer-iframe" + index].deviceSelectResult;


                /* 
                 * //数据列
address: "工位测试机00机"
alarmStatus: "Fault"
buildingName: "147号楼"
code: "00.00"
deviceCategory: 101
deviceCategoryName: "传输主机"
enterpriseId: "79b8faa2-c960-41cc-8136-c76c3fb57043"
enterpriseName: "宁浩发展八八分公司"
heartTime: "1970-01-01 08:00:00"
id: "58a688ef-5876-4b6a-a6ab-c6c8f85e6e30"
keypartName: "重点1802号部位"
name: "00号测试主机"
onlineStatus: -1
                 
                 */


                that.addNewSelectedDevice(selectedDevices, channelId);

                
                //打印返回的值，看是否有我们想返回的值。
                //console.log(res);
                //最后关闭弹出层
                rootWindow.layer.close(index);
            },
            cancel: function () {
                //右上角关闭回调
            }
        });
    };

    

    //把从弹窗返回的设备数据,转换成当前列表需要的数据.
    SubPage.prototype.addNewSelectedDevice = function (selectedDevice,channelId) {

        var that = this;

        if (!selectedDevice || selectedDevice.length===0) {
            return;
        }

        var sendData = [];

        layui.each(selectedDevice, function (_, item) {

            var adevice = {};
            adevice.sourceId = item[selectedDevicePropertyNames.id];
            adevice.videoChannelId = channelId,
            adevice.sourceCategory = item[selectedDevicePropertyNames.deviceCategory];
          

            sendData.push(adevice);
        });

        pageDataApi.createVideoLinkage(neat.getUserToken(), sendData, function () {

            that.bindTable();
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
            , page: {
                hash: false,
                layout: ['count'  /*, 'prev', 'page', 'next'*/],
            }
            , height: 500
            , autoSort: false
            , loading: true
            , limit: 99999999999
            , data: []
            , cols: [[

                { type: 'checkbox', fixed: 'left', width: 100 }
                , { field: dataPropertyNames.deviceTypeId, title: '设备类别', templet: function (d) { return uiTools.renderLinkageDeviceTypeText(d[dataPropertyNames.deviceTypeId]); } }
                , { field: dataPropertyNames.deviceName, title: '设备名称'  }
                //, { field: dataPropertyNames.deviceAddress, title: '安装位置' }
                , { field: dataPropertyNames.keypartName, title: '所属部位' }
                , { field: dataPropertyNames.keypartName, title: '所属建筑' }


            ]]

        });
    };


    // 选定视频通道后,加载已经绑定的 视频联动设备 bindOldLinkageDevices
    SubPage.prototype.bindTable = function () {
        var that = this;

        if (!that.videoChannelId) {

            table.reload("resultTable", {
                data: []
            });
        }
        else {
            //加载加载已经绑定的 视频联动设备
            pageDataApi.getLinkageByChannelId(neat.getUserToken(), that.videoChannelId, function (resultData) {

                table.reload("resultTable", {
                    data: resultData
                });
            });
        }


       
    };




    exports(MODULE_NAME, new SubPage());
});