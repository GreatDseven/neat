//设备选择 弹窗
layui.define(["jquery", 'form', 'table', 'laytpl', 'laypage', 'layer', 'commonDataApi', 'neatDataApi', 'neat', 'neatNavigator', 'videoDeviceDataApi','neatUITools'], function (exports) {

    "use strict";

    var MODULE_NAME = "pageDeviceSelector";

    var $ = layui.$;
    var table = layui.table;
    var form = layui.form;
    var laytpl = layui.laytpl;
    var laypage = layui.laypage;
    var layer = layui.layer;
    var commonDataApi = layui.commonDataApi;

    var neatNavigator = layui.neatNavigator;
    var neat = layui.neat;

    var pageDataApi = layui.videoDeviceDataApi;

    var uiTools = layui.neatUITools;




    var SubPage = function () {

        this.projectType = '';
        this.status = '0';

        this.orderByCol = 'id';
        this.orderSort = 'desc';
        
        this.enterpriseId = "";
        this.buildingId = "";
        this.keypartId = "";

        this.deviceCategory = "";

       
    };


    SubPage.prototype.init = function () {
        var that = this;



        this.enterpriseId = neatNavigator.getUrlParam("enterprise_id");
        this.buildingId = neatNavigator.getUrlParam("building_id");
        this.keypartId = neatNavigator.getUrlParam("keypart_id");

        this.initDeviceCategoryList();
        this.initBuildingList();
        this.initKeyPartList();


        // 初始化表定义
        this.initTable();

        //按钮事件
        that.initButtonEvent();

        // 初始化监听事件
        this.initEventInfo();

    };

    //初始化建筑列表
    SubPage.prototype.initDeviceCategoryList = function () {

        var that = this;

        form.on('select(optDeviceCategory)', function (data) {
            //console.log(data.elem); //得到select原始DOM对象
            //console.log(data.value); //得到被选中的值
            //console.log(data.othis); //得到美化后的DOM对象

            that.deviceCategory = data.value;

        });
        that.bindDeviceCategoryList();
    };

    //绑定建筑列表
    SubPage.prototype.bindDeviceCategoryList = function () {

        var that = this;

        //获取设备类列数据
        commonDataApi.getLinkageDeviceCategoryData(neat.getUserToken(), function (resultData) {

            var d = {};
            d.data = resultData;
        
            laytpl($("#optDeviceCategoryTemplate").html()).render(d, function (html) {
                var parent = $("#optDeviceCategory").html(html);
                form.render('select', 'optDeviceCategoryForm');
            });
        });

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
            d.selectedValue = that.buildingId;
            laytpl($("#optBuildingTemplate").html()).render(d, function (html) {
                var parent = $("#optBuilding").html(html);
                form.render('select', 'optBuildingForm');
            });
        });

    };

    //初始化建筑列表
    SubPage.prototype.initKeyPartList = function () {

        var that = this;

        form.on('select(optKeyPartListTemplate)', function (data) {
            //console.log(data.elem); //得到select原始DOM对象
            //console.log(data.value); //得到被选中的值
            //console.log(data.othis); //得到美化后的DOM对象

            that.keypartId = data.value;

        });
        this.bindKeyPartList();
    };

    //绑定关键部位列表
    SubPage.prototype.bindKeyPartList = function () {


        var that = this;
        var d = {};

        if (!that.buildingId) {
            d.data = [];
            that.fillKeypartList(d);
            return;
        }

        //根据企业的id获取建筑列表,然后绑定到select中.
        commonDataApi.getKeypartByBuildingId(neat.getUserToken(), that.buildingId, function (resultData) {
          
            d.data = resultData;
            d.selectedValue = that.keypartId;
            that.fillKeypartList(d);
        });

    };

    SubPage.prototype.fillKeypartList = function (d) {
        laytpl($("#optKeyPartListTemplate").html()).render(d, function (html) {
            var parent = $("#optKeyPartList").html(html);
            form.render('select', 'optKeyPartListForm');
        });
    };



    SubPage.prototype.reloadTable = function () {

        var that = this;
      

        if (!this.deviceCategory) {
            layer.msg("请选择设备类别!");
            return;
        }
       
        var token = neat.getUserToken();
     
        var keyword = $.trim($("#txtKeyword").val());

        var loadingIndex = layui.layer.load(1);


        pageDataApi.searchDevice(token, keyword, this.deviceCategory, "", this.enterpriseId, this.buildingId, this.keypartId, 
            function (resultData) {
       
                layui.layer.close(loadingIndex);
                //成功
                table.reload("resultTable", {
                    data: resultData
                  
                });

            },
            function () { //失败
                layui.layer.close(loadingIndex);
                
                table.reload("resultTable", {
                    data: []
                   
                });
               

                //layer.msg("查询设备信息发生错误!");
            });
    };


    //按钮事件
    SubPage.prototype.initButtonEvent = function () {
        var that = this;

        // 底部的保存按钮事件
        $('#btnSave').on('click', function () {
            that.saveData();
        });

        // 搜索事件
        $('#btnSearch').on('click', function () {
            that.bindTable();
        });
        //关闭按钮事件
        $("#btnCancel").on("click", function () {
            that.closeDialog();
        });
    };

    //保存数据
    SubPage.prototype.saveData = function () {

        //这里调用 保存接口     
        var that = this;

        //if (data.length == 0) {
        //    layer.msg("请勾选模板数据!");
        //    return;
        //}

        //最终发送的全部id
        var notSelectedIds = [];
        //最终发送的已经选择的id
        var selectedIds = [];



        var allData = table.cache["resultTable"];
        layui.each(allData, function (_, item) {
            
            var currentChecked= item["LAY_CHECKED"]?true:false;
            var oriChecked = item.status ===2;

            if(currentChecked === oriChecked)
            {
                //状态没有变化,原来没选,现在也没选 或者 原来选中,现在也选中
                return;
            }

            if (currentChecked) { //原来没选中,变成 现在选中,
                selectedIds.push(item.subTypeId);
            }
            else { //原来选中的,变成 现在没有选中
                notSelectedIds.push(item.subTypeId);
            }
        });

        if (selectedIds.length === 0 && notSelectedIds.length === 0) {
            return;
        }

      
        
    };


 

    // 关闭当前对话框
    SubPage.prototype.closeDialog = function () {
        var index = parent.layer.getFrameIndex(window.name);
        parent.layer.close(index);
    };


    var dataPropertyNames = {
        deviceId:"id",
        deviceCategoryId:"sourceCategory",
        deviceName: "deviceName",
        deviceCode:"deviceCode",

        keypartName: "keypartName",
        buildingName: "buildingName",
        enterpriseName:"enterpriseName"
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
            , height:500
            , autoSort: false
            , loading:true
            , limit: 99999999999
            , data: []
            , cols: [[

                { type: 'checkbox', fixed: 'left', width: 80 }
                , { field: dataPropertyNames.deviceName, title: '设备名称' }
                , { field: dataPropertyNames.deviceCode, title: '设备编码' }
                , { field: dataPropertyNames.deviceCategoryId, title: '设备类别',  templet: function (d) { return uiTools.renderLinkageDeviceTypeText(d[dataPropertyNames.deviceCategoryId]); } }
                //, { field: dataPropertyNames.deviceAddress, title: '安装位置' }
                , { field: dataPropertyNames.keypartName, title: '所属部位' }
                , { field: dataPropertyNames.buildingName, title: '所属建筑' }

         
            ]]

        });
    };



    // 初始化监听事件（from和table）
    SubPage.prototype.initEventInfo = function () {
        var that = this;

        $("#btnQuery").on("click", function () {
            that.reloadTable();

        });

      

        table.on('checkbox(resultTable)', function (obj) {
            //console.log(obj.checked); //当前是否选中状态
            //console.log(obj.data); //选中行的相关数据
            //console.log(obj.type); //如果触发的是全选，则为：all，如果触发的是单选，则为：one


            var checkStatus = table.checkStatus('resultTable');
            var data = checkStatus.data;

            if (data.length === 0) {
                window.deviceSelectResult = null;
            }
            else {
                window.deviceSelectResult = data;
            }
        });

    };




    exports(MODULE_NAME, new SubPage());
});