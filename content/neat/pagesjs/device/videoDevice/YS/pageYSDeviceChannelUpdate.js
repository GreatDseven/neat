//萤石云 视频设备 通道修改页面


layui.define(['jquery', 'layer', 'form', 'laytpl', 'element', 'table', 'neat', 'neatDataApi', 'videoDeviceDataApi', 'neatNavigator', 'commonDataApi'], function (exports) {



    "use strict";
    var $ = layui.$;
    var MODULE_NAME = "pageYSDeviceChannelUpdate";

    var form = layui.form;
    var laytpl = layui.laytpl;

    var layer = layui.layer;

    var neat = layui.neat;

    var neatNavigator = layui.neatNavigator;

    var commonDataApi = layui.commonDataApi;

    var pageDataApi = layui.videoDeviceDataApi;



    var SubPage = function () {


        this.id = "";

        this.accountOrgId = "";
        this.accountOrgType = "";

        this.enterpriseId = "";
        this.enterpriseName = "";

        this.buildingId = "";
        this.keypartId = "";



    };


    //初始化
    SubPage.prototype.init = function () {


        var that = this;



        this.id = neatNavigator.getUrlParam("id");

        this.accountOrgType = neatNavigator.getUrlParam("account_org_type");
        this.accountOrgId = neatNavigator.getUrlParam("account_org_id");

        this.suggestEntId = neatNavigator.getUrlParam("suggest_ent_id");
        this.suggestBuildingId = neatNavigator.getUrlParam("suggest_building_id");
        this.suggestKeypartId = neatNavigator.getUrlParam("suggest_keypart_id");



        this.initDetailObj();

        $("#btnCancel").on("click", function () {
            that.closeDialog();
        });



        this.initSave();


        form.render();

    };

    var dataPropertyNames = {

        id: "id",
        deviceId: "deviceId",
        index: "index",
        name: "name",
        address: "address",
        videoLevel: "videoLevel",
        domainId: "domainId",
        enterpriseId: "enterpriseId",
        enterpriseName:"enterpriseName",
        buildingId: "buildingId",
        buildingName: "buildingName",
        keypartId: "keypartId",
        keypartName: "keypartName",

        serial: "serial",
        dataStatus: "dataStatus"
    };

    // 获取萤石云设备视频通道详细信息
    SubPage.prototype.initDetailObj = function () {

        var that = this;
        pageDataApi.getYSDeviceChannelDetailInfoById(neat.getUserToken(), that.id, function (resultData) {

            that.enterpriseId = resultData[dataPropertyNames.enterpriseId];
            that.enterpriseName = resultData[dataPropertyNames.enterpriseName];
            if (!that.enterpriseId || commonDataApi.isEmptyGuid(that.enterpriseId)) {
                that.enterpriseId = that.suggestEntId;
            }

            $("#txtChannelNo").val(resultData[dataPropertyNames.index]);
            $("#txtName").val(resultData[dataPropertyNames.name]);

            that.buildingId = resultData[dataPropertyNames.buildingId];

            if (!that.buildingId || commonDataApi.isEmptyGuid(that.buildingId)) {
                that.buildingId = that.suggestBuildingId;
            }

            that.keypartId = resultData[dataPropertyNames.keypartId];
           
            if (!that.keypartId || commonDataApi.isEmptyGuid(that.keypartId)) {
                that.keypartId = that.suggestKeypartId;
            }

          

            that.initEntList();
            that.initBuildingList();
            that.initKeyPartList();

            that.bindEntList();
            that.bindBuildingList();
            that.bindKeyPartList();

        }, function (fd) {

            layer.msg("获取通道信息失败!", function () {

                that.closeDialog();
            });
        });

    };





    //关闭对话框
    SubPage.prototype.closeDialog = function () {
        var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
        parent.layer.close(index); //再执行关闭
    };



    //初始化单位列表
    SubPage.prototype.initEntList = function () {

        var that = this;

        form.on('select(optEnt)', function (data) {
            //console.log(data.elem); //得到select原始DOM对象
            //console.log(data.value); //得到被选中的值
            //console.log(data.othis); //得到美化后的DOM对象

            that.enterpriseId = data.value;
            that.buildingId = "";
            that.bindBuildingList();
       
            that.keypartId = "";
            that.bindKeyPartList();
        });

    };

    //绑定企业列表
    SubPage.prototype.bindEntList = function () {
        var that = this;

        if (this.accountOrgType == "1") { //账号在中心下,企业必须可选
            commonDataApi.getEntByDomainId(neat.getUserToken(), that.accountOrgId, function (resultData) {

                var d = {};
                d.data = resultData;
                d.selectedValue = that.enterpriseId;
                laytpl($("#optEntTemplate").html()).render(d, function (html) {
                    var parent = $("#optEnt").html(html);
                    form.render('select', 'optEntForm');
                });


            });

        }
        else {

            var d = {
                data: [
                    {
                        id: that.enterpriseId,
                        name: that.enterpriseName
                    }
                ],
                selectedValue: that.enterpriseId
            };

            laytpl($("#optEntTemplate").html()).render(d, function (html) {
                var parent = $("#optEnt").html(html);
                form.render('select', 'optEntForm');
            });
        }


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

    };


    //初始化建筑列表
    SubPage.prototype.bindBuildingList = function () {

        var that = this;

        //根据企业的id获取建筑列表,然后绑定到select中.
        commonDataApi.getBuildingByEntId(neat.getUserToken(), that.enterpriseId, function (data) {
            var d = {};
            d.data = data;
            d.selectedValue = that.buildingId;
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
            that.keypartId = data.value;

        });
    };

    //绑定关键部位列表
    SubPage.prototype.bindKeyPartList = function () {

        var that = this;

        if (!that.buildingId) {
            that.fillKeyPartList([], that.keypartId);
        }
        else {
            //根据企业的id获取建筑列表,然后绑定到select中.
            commonDataApi.getKeypartByBuildingId(neat.getUserToken(), that.buildingId, function (data) {
                that.fillKeyPartList(data, that.keypartId);
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


    SubPage.prototype.initSave = function () {

        var that = this;

        form.on('submit(btnSave)', function (formData) {


            $("#btnSave").attr("disabled", true);

            var data = {
                id: that.id,
                enterpriseId: formData.field.optEnt,
                buildingId: formData.field.optBuilding,
                keypartId: formData.field.optKeyPartList

            };


            var token = neat.getUserToken();

            pageDataApi.updateYSDeviceChannel(token, data
                , function (sd) {


                    layer.msg("保存成功!", { time: 1500 }, function () {

                        that.closeDialog();

                    });
                }, function (fd) {

                    $("#btnSave").attr("disabled", false);

                    if (typeof fd.message === "string") {
                        layer.msg(fd.message);
                    }
                    else {
                        layer.msg("保存失败!");
                    }
                });

            return false;
        });
    };


    exports(MODULE_NAME, new SubPage());

});