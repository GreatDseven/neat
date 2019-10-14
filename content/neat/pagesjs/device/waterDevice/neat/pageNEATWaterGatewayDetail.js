//neat水网关 详情界面


layui.define(['jquery', 'layer', 'form', 'laytpl', 'element', 'table', 'neat', 'neatDataApi', 'waterDeviceDataApi', 'neatNavigator', 'commonDataApi', 'neatValidators'], function (exports) {



    "use strict";
    var $ = layui.$;
    var MODULE_NAME = "pageNEATWaterGatewayDetail";

    var form = layui.form;
    var laytpl = layui.laytpl;

    var layer = layui.layer;

    var neat = layui.neat;

    var neatDataApi = layui.neatDataApi;

    var neatNavigator = layui.neatNavigator;

    var commonDataApi = layui.commonDataApi;

    var pageDataApi = layui.waterDeviceDataApi;

    var validators = layui.neatValidators;




    var SubPage = function () {


        this.wgwId = "";
        this.detailObj = {};


    };
    //初始化
    SubPage.prototype.init = function () {

        var that = this;


        this.wgwId = neatNavigator.getUrlParam("wgw_id");

        this.initDetail(
            function () {

                that.bindBuildingList();
                that.bindKeyPartList();

                $("#txtEnterpriseName").val(that.detailObj[dataPropertyNames.enterpriseName]);
                $("#txtCode").val(that.detailObj[dataPropertyNames.code]);
                $("#txtName").val(that.detailObj[dataPropertyNames.name]);
                $("#txtAddr").val(that.detailObj[dataPropertyNames.address]);


            }
        );

        $("#btnCancel").on("click", function () {
            that.closeDialog();
        });
        this.initBuildingList();
        this.initKeyPartList();


        form.render();

    };



    SubPage.prototype.initDetail = function (callback) {
        var that = this;

        pageDataApi.getNEATWaterGatewayById(neat.getUserToken(), this.wgwId
            , function (result) {
                that.detailObj = result;
                callback();


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

            that.detailObj.buildingId = data.value;
            that.bindKeyPartList();

        });

    };

    //绑定建筑列表
    SubPage.prototype.bindBuildingList = function () {

        var that = this;
        //根据企业的id获取建筑列表,然后绑定到select中.
        commonDataApi.getBuildingByEntId(neat.getUserToken(), that.detailObj[dataPropertyNames.enterpriseId], function (data) {
            var d = {};
            d.data = data;
            d.selectedValue = that.detailObj[dataPropertyNames.buildingId];
            laytpl($("#optBuildingTemplate").html()).render(d, function (html) {
                var parent = $("#optBuilding").html(html);
                form.render('select', 'optBuildingForm');
            });
        });

    };


    //初始化部位列表
    SubPage.prototype.initKeyPartList = function () {
        var that = this;

        form.on('select(optKeyPartList)', function (data) {
            //console.log(data.elem); //得到select原始DOM对象
            //console.log(data.value); //得到被选中的值
            //console.log(data.othis); //得到美化后的DOM对象
            that.detailObj.keypartId = data.value;

        });
    };

    //绑定关键部位列表
    SubPage.prototype.bindKeyPartList = function () {

        var that = this;

        if (!that.detailObj.buildingId) {
            that.fillKeyPartList([]);
        }
        else {

            //根据企业的id获取建筑列表,然后绑定到select中.
            commonDataApi.getKeypartByBuildingId(neat.getUserToken(), that.detailObj.buildingId, function (data) {
                that.fillKeyPartList(data, that.detailObj[dataPropertyNames.keypartId]);
            });
        }
    };

    SubPage.prototype.fillKeyPartList = function (data, selectedData) {
        var d = {};
        d.data = data;
        d.selectedValue = selectedData;
        laytpl($("#optKeyPartListTemplate").html()).render(d, function (html) {
            var parent = $("#optKeyPartList").html(html);
            form.render('select', 'optKeyPartListForm');
        });
    };



    var dataPropertyNames = {
        id: "id",
        code: "code",
        name: "name",
        domainId: "domainId",
        enterpriseId: "entId",
        buildingId: "buildingId",
        keypartId: "keypartId",
        address: "address",
        enterpriseName: "entName",
        buildingName: "buildingName",
        keypartName: "keypartName",
        status: "status",
        heartTime: "heartTime"
    };


    



    exports(MODULE_NAME, new SubPage());

});