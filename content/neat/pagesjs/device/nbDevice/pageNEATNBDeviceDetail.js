//nb设备详情页面


layui.define(['jquery', 'layer', 'form', 'laytpl', 'element', 'table', 'neat', 'neatDataApi', 'nbDeviceDataApi', 'neatNavigator', 'commonDataApi', 'neatValidators', "neatUITools","neatGisSelector"], function (exports) {



    "use strict";
    var $ = layui.$;
    var MODULE_NAME = "pageNEATNBDeviceDetail";

    var form = layui.form;
    var laytpl = layui.laytpl;

    var layer = layui.layer;

    var neat = layui.neat;

    var neatNavigator = layui.neatNavigator;

    var commonDataApi = layui.commonDataApi;

    var pageDataApi = layui.nbDeviceDataApi;

    var validators = layui.neatValidators;

    var uiTools = layui.neatUITools;

    var gisSelector = layui.neatGisSelector;

    //返回的数据的列名称
    var propertyNames = {

        "id": "id",
        "code": "code",
        "name": "name",
        "deviceTypeId": "deviceTypeId",
        "deviceTypeName": "deviceTypeName",
        "domainId": "domainId",
        "domainName": "domainName",
        "enterpriseId": "enterpriseId",
        "enterpriseName": "enterpriseName",
        "buildingId": "buildingId",
        "buildingName": "buildingName",
        "keypartId": "keypartId",
        "keypartName": "keypartName",
        "address": "address",
        "onlineStatus": "onlineStatus",
        "alarmStatus": "alarmStatus",
        "signalStatus": "signalStatus",
        "batteryStatus": "batteryStatus",
        "latitude": "latitude",
        "longitude": "longitude",
        "gisaddress": "gisaddress"
        
    }


    var SubPage = function () {

        
      

        
    };


    SubPage.prototype._initDetail = function (callback) {
        var that = this;

        var loadingIndex = layer.load(1);

        pageDataApi.queryNBDeviceDetailInfo(neat.getUserToken(), this.id
            , function (result) {
                that.detailObj = result;
                layer.close(loadingIndex);
                callback();


            }, function (failData) {
                layer.close(loadingIndex);
                layer.msg(failData.message, function () {

                    that._closeDialog();
                });

            });

    };



    //关闭对话框
    SubPage.prototype._closeDialog = function () {
        var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
        parent.layer.close(index); //再执行关闭
    };



    //初始化建筑列表
    SubPage.prototype._initBuildingList = function () {

        var that = this;

        form.on('select(optBuilding)', function (data) {
            //console.log(data.elem); //得到select原始DOM对象
            //console.log(data.value); //得到被选中的值
            //console.log(data.othis); //得到美化后的DOM对象

            that.detailObj.buildingId = data.value;
            that._bindKeyPartList();

        });
        
    };

    //绑定建筑列表
    SubPage.prototype._bindBuildingList = function () {

        var that = this;

        if (!that.detailObj.enterpriseId ) {
            that._fillBuildingList([]);
        }
        else {

            //根据企业的id获取建筑列表,然后绑定到select中.
            commonDataApi.getBuildingByEntId(neat.getUserToken(), that.detailObj.enterpriseId, function (data) {
                var d = {};
                d.data = data;
                d.selectedValue = that.detailObj[propertyNames.buildingId];
                laytpl($("#optBuildingTemplate").html()).render(d, function (html) {
                    var parent = $("#optBuilding").html(html);
                    form.render('select', 'optBuildingForm');
                });
            });
        }
    };


    //初始化部位列表
    SubPage.prototype._initKeyPartList = function () {
        var that = this;

        form.on('select(optKeyPartList)', function (data) {
            //console.log(data.elem); //得到select原始DOM对象
            //console.log(data.value); //得到被选中的值
            //console.log(data.othis); //得到美化后的DOM对象
            that.detailObj.keypartId = data.value;

        });
    };

    //绑定关键部位列表
    SubPage.prototype._bindKeyPartList = function () {

        var that = this;

        if (!that.detailObj.buildingId) {
            that._fillKeyPartList([]);
        }
        else {

            //根据企业的id获取建筑列表,然后绑定到select中.
            commonDataApi.getKeypartByBuildingId(neat.getUserToken(), that.detailObj.buildingId, function (data) {
                that._fillKeyPartList(data, that.detailObj[propertyNames.keypartId]);
            });
        }
    };

    SubPage.prototype._fillKeyPartList = function (data, selectedData) {
        var d = {};
        d.data = data;
        d.selectedValue = selectedData;
        laytpl($("#optKeyPartListTemplate").html()).render(d, function (html) {
            var parent = $("#optKeyPartList").html(html);
            form.render('select', 'optKeyPartListForm');
        });
    };


    SubPage.prototype._initGisBrowse = function () {

        
        var that = this;

        $("#btnGisBrowse").on("click", function () {

            gisSelector.init(that.detailObj[propertyNames.latitude]
                , that.detailObj[propertyNames.longitude]
                , that.detailObj[propertyNames.gisaddress]);

            var tthat = that;

            gisSelector.show(function (result) {

            });

        });
        

    };

    //绑定 设备类型
    SubPage.prototype._bindDeviceType = function () {

        var that = this;

        pageDataApi.getNBDeviceTypeListForMobile(neat.getUserToken(), function (resultData) {

            var d = {};
            d.data = resultData;
            d.SelectedValue = that.detailObj[propertyNames.deviceTypeId];

            laytpl($("#optDeviceTypeTemplate").html()).render(d, function (html) {
                var parent = $("#optDeviceType").html(html);
                form.render('select', 'optDeviceTypeForm');
            });
        });
    };



  

    //初始化
    SubPage.prototype.init = function () {

        var that = this;

        this.id = neatNavigator.getUrlParam("id");
        this.detailObj = {};

        this._initDetail(
            function () {

                that._bindDeviceType();
                that._bindBuildingList();
                that._bindKeyPartList();


                $("#txtCode").val(that.detailObj.code);
                $("#txtName").val(that.detailObj.name);
                $("#txtDeviceType").val(that.detailObj[propertyNames.deviceTypeName]);
                $("#txtAddr").val(that.detailObj.address);
                $("#txtDomainName").val(that.detailObj[propertyNames.domainName]);
                $("#txtEnterpriseName").val(that.detailObj[propertyNames.enterpriseName]);

                $("#txtGisAddress").val(that.detailObj[propertyNames.gisaddress]);
            }
        );

        $("#btnCancel").on("click", function () {
            that._closeDialog();
        });
        this._initBuildingList();
        this._initKeyPartList();

        this._initGisBrowse();

        form.render();

    };




    exports(MODULE_NAME, new SubPage());

});