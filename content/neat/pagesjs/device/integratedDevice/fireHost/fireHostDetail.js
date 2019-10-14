//消防主机 详情页面


layui.define(['jquery', 'layer', 'form', 'laytpl', 'element', 'table', 'neat', 'integratedDeviceDataApi', 'neatNavigator', 'commonDataApi', 'neatValidators'], function (exports) {



    "use strict";
    var $ = layui.$;
    var MODULE_NAME = "pageIntegratedFireHostDetail";

    var form = layui.form;
    var laytpl = layui.laytpl;

    var layer = layui.layer;

    var neat = layui.neat;

    var neatNavigator = layui.neatNavigator;

    var commonDataApi = layui.commonDataApi;

    var pageDataApi = layui.integratedDeviceDataApi;

    var validators = layui.neatValidators;




    var SubPage = function () {

        this.optServiceId = "";
        this.optBuildingId = "";
        this.optKeyPartId = "";
        this.detailObj = {};
    };


    //初始化
    SubPage.prototype.init = function () {

        var that = this;
        this.detailObj = {};

        this.id = neatNavigator.getUrlParam("id");




        var loadingIndex = layui.layer.load(1);


        this.loadData(function () {
            layui.layer.close(loadingIndex);

        });


   




        $("#btnCancel").on("click", function () {
            that.closeDialog();
        });


        form.render();

    };

    // 返回的数据中的列名称
    var dataPropertyNames = {
        id: "id",
        code: "code",
        name: "name",
        address: "address",
        category: "deviceType",
        manufacturer: "manufacturer",
        enterpriseId: "enterpriseId",
        buildingId: "buildingId",
        keypartId: "keypartId",
        buildingName:"buildingName",
        keypartName: "keypartName",
        deviceID: "deviceID"
    };
  

    // 初始化数据
    SubPage.prototype.loadData = function (callback) {

        var that = this;
        // 根据id 获取主机信息
        pageDataApi.getFireHostById(neat.getUserToken(), that.id, function (result) {

            that.detailObj = result;


            $("#txtCode").val(that.detailObj[dataPropertyNames.code]);
            $("#txtName").val(that.detailObj[dataPropertyNames.name]);

           

            // 主机类别
            that.bindFireHostType();

            //厂商
            that.bindManufacturers();

            //建筑
            that.initBuildingList();

            //部位
            that.initKeyPartList();


            $("#txtAddr").val(that.detailObj[dataPropertyNames.address]);

           
            pageDataApi.getUITDById(neat.getUserToken(), that.detailObj[dataPropertyNames.deviceID]
                , function (uitdData) {
                    $("#txtUitdCode").val(uitdData.code);
                    form.render();
                    callback();
                }
                , function (failData) {
                    callback();
                })

        }, function (failData) {

            layer.msg(failData.message, function () {

                that.closeDialog();
            });

        });
    };



    //关闭对话框
    SubPage.prototype.closeDialog = function () {
        var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
        parent.layer.close(index); //再执行关闭
    };



    //初始化建筑列表
    SubPage.prototype.initBuildingList = function () {

        var that = this;

        form.on('select(optBuilding)', function (data) {
            //console.log(data.elem); //得到select原始DOM对象
            //console.log(data.value); //得到被选中的值
            //console.log(data.othis); //得到美化后的DOM对象

            that.detailObj[dataPropertyNames.buildingId] = data.value;
            that.bindKeyPartList();

        });
        that.bindBuildingList();
    };

    //绑定建筑列表
    SubPage.prototype.bindBuildingList = function () {

        var that = this;

        //根据企业的id获取建筑列表,然后绑定到select中.
        commonDataApi.getBuildingByEntId(neat.getUserToken(), that.detailObj[dataPropertyNames.enterpriseId], function (resultData) {

            that.fillBuildingList(resultData);
        });

    };

    //为建筑物列表填充数据
    SubPage.prototype.fillBuildingList = function (data) {
        var d = {};
        d.data = data;
        d.selectedValue = this.detailObj[dataPropertyNames.buildingId];
        laytpl($("#optBuildingTemplate").html()).render(d, function (html) {
            var parent = $("#optBuilding").html(html);
            form.render('select', 'optBuildingForm');
        });
    };


    //初始化部位列表
    SubPage.prototype.initKeyPartList = function () {
        var that = this;

        form.on('select(optKeyPartList)', function (data) {
            //console.log(data.elem); //得到select原始DOM对象
            //console.log(data.value); //得到被选中的值
            //console.log(data.othis); //得到美化后的DOM对象
            that.detailObj[dataPropertyNames.keypartId] = data.value;

        });
        this.bindKeyPartList();
    };

    //绑定关键部位列表
    SubPage.prototype.bindKeyPartList = function () {

        var that = this;

        //根据企业的id获取建筑列表,然后绑定到select中.
        commonDataApi.getKeypartByBuildingId(neat.getUserToken(), this.detailObj[dataPropertyNames.buildingId], function (resultData) {
            that.fillKeyPartList(resultData);
        });

    };
    //向部位列表中填充数据
    SubPage.prototype.fillKeyPartList = function (data) {
        var that = this;
        var d = {};
        d.data = data;
        d.selectedValue = that.detailObj[dataPropertyNames.keypartId];

        laytpl($("#optKeyPartListTemplate").html()).render(d, function (html) {
            var parent = $("#optKeyPartList").html(html);
            form.render('select', 'optKeyPartListForm');
        });
    };


    // 绑定生产厂商   
    SubPage.prototype.bindManufacturers = function () {
        var that = this;
        pageDataApi.queryFireHostManufacturers(neat.getUserToken(),

            function (result) {
                var d = {}
                d.data = result;
                d.selectedValue = that.detailObj[dataPropertyNames.manufacturer];
                laytpl($("#optManufacturerTemplate").html()).render(d, function (html) {

                    $("#optManufacturer").html(html);
                    form.render('select', 'optManufacturerForm');
                });
            },
            function () { //失败
                layer.msg("获取生产厂商发生错误!");
            });
    };

    // 绑定 主机类型  
    SubPage.prototype.bindFireHostType = function () {
        var that = this;
        pageDataApi.queryFireHostType(neat.getUserToken(),

            function (result) {
                var d = {}
                d.data = result;
                d.selectedValue = that.detailObj[dataPropertyNames.category];

                laytpl($("#optCategoryTemplate").html()).render(d, function (html) {

                    $("#optCategory").html(html);
                    form.render('select', 'optCategoryForm');
                });
            },
            function () { //失败
                layer.msg("获取生产厂商发生错误!");
            });
    };


    exports(MODULE_NAME, new SubPage());

});