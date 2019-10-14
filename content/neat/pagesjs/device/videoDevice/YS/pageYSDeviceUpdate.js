//萤石云视频设备修改页面


layui.define(['jquery', 'layer', 'form', 'laytpl', 'element', 'table', 'neat', 'neatDataApi', 'videoDeviceDataApi', 'neatNavigator', 'commonDataApi'], function (exports) {



    "use strict";
    var $ = layui.$;
    var MODULE_NAME = "pageYSDeviceUpdate";

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


        this.domainId = "";
        this.domainName = "";

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
        this.accountOrgId = neatNavigator.getUrlParam("account_org_Id");

        this.initDetailObj();

        $("#btnCancel").on("click", function () {
            that.closeDialog();
        });

        this.initVerify();
        this.initSave();


        form.render();

    };


    var dataPropertyNames = {
        "id": "id",
        "serial": "serial",
        "buildingName": "buildingName",
        "keypartName": "keypartName",
        "deviceName": "deviceName",
        "categoryName": "categoryName",
        "category": "category",
        "domainId": "domainId",
        "enterpriseId": "enterpriseId",
        "buildingId": "buildingId",
        "keypartId": "keypartId",
        "domainName": "domainName",
        "enterpriseName": "enterpriseName"
    };

    SubPage.prototype.initDetailObj = function () {
        var that = this;


        pageDataApi.getYSDeviceDetailById(neat.getUserToken(), this.id
            , function (resultData) {
                that.domainId = resultData[dataPropertyNames.domainId];
                that.enterpriseId = resultData[dataPropertyNames.enterpriseId];
                that.enterpriseName = resultData[dataPropertyNames.enterpriseName];
                that.domainName = resultData[dataPropertyNames.domainName];

                $("#txtSerialNo").val(resultData[dataPropertyNames.serial]);
                $("#txtDeviceName").val(resultData[dataPropertyNames.deviceName]);

                that.buildingId = resultData[dataPropertyNames.buildingId];
                that.keypartId = resultData[dataPropertyNames.keypartId];
                that.initDomainList();


                that.initEntList();
                that.initBuildingList();
                that.initKeyPartList();

                that.bindDomainList();
                that.bindEntList();
                that.bindBuildingList();
                that.bindKeyPartList();

            }
            , function () {

                layer.msg("加载设备信息时发生错误!", function () {

                    that.closeDialog();
                });

            });
    };

    //关闭对话框
    SubPage.prototype.closeDialog = function () {
        var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
        parent.layer.close(index); //再执行关闭
    };


    //初始化中心列表
    SubPage.prototype.initDomainList = function () {

        var that = this;


        if (this.accountOrgType == "1") { //中心账户下的设备
            form.on('select(optDomain)', function (data) {
                //console.log(data.elem); //得到select原始DOM对象
                //console.log(data.value); //得到被选中的值
                //console.log(data.othis); //得到美化后的DOM对象

                that.domainId = data.value;
                that.enterpriseId = "";
                that.buildingId = "";
                that.keypartId = "";
                that.bindEntList();
                that.bindBuildingList();
                that.bindKeyPartList();
            });
        }
        else {
            $("#optDomain").attr("disabled", "disabled").toggleClass("layui-disabled", true);

            form.render('select', 'optDomainForm');
        }



    };

    // 绑定中心列表
    SubPage.prototype.bindDomainList = function () {
        var that = this;


        if (this.accountOrgType == "1") { //账号在中心下,中心必须可选

            commonDataApi.getChildrenDomains(neat.getUserToken(), that.accountOrgId, function (childrenDomains) {

                var dd = {};
                dd.data = childrenDomains;
                dd.selectedValue = that.domainId;
                laytpl($("#optDomainTemplate").html()).render(dd, function (html) {
                    var parent = $("#optDomain").html(html);
                    form.render('select', 'optDomainForm');
                });

            });



        }
        else {
            //账号在企业下,中心不可选


            var d = {
                data: [
                    {
                        id: that.domainId,
                        name: that.domainName
                    }
                ],
                selectedValue: that.domainId
            };

            laytpl($("#optDomainTemplate").html()).render(d, function (html) {
                var parent = $("#optDomain").html(html);
                form.render('select', 'optDomainForm');
            });
        }


    };


    //初始化单位列表
    SubPage.prototype.initEntList = function () {

        var that = this;
        if (this.accountOrgType == "1") { //中心账户下的设备

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
        }
        else {
            $("#optEnt").attr("disabled", "disabled").toggleClass("layui-disabled", true);

            form.render('select', 'optEntForm');
        }

    };




    SubPage.prototype.bindEntList = function () {
        var that = this;


        if (this.accountOrgType == "1") { //账号在中心下,企业必须可选
            commonDataApi.getEntByDomainId(neat.getUserToken(), that.domainId, function (resultData) {

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



    //绑定建筑列表
    SubPage.prototype.bindBuildingList = function () {

        var that = this;

        if (!that.enterpriseId) {
            that.fillBuildingList([], that.buildingId);
        }
        else {
            //根据企业的id获取建筑列表,然后绑定到select中.
            commonDataApi.getBuildingByEntId(neat.getUserToken(), that.enterpriseId, function (data) {

                that.fillBuildingList(data, that.buildingId);

            });
        }

    };

    //建筑列表填充数据
    SubPage.prototype.fillBuildingList = function (data, selectedData) {
        var d = {};
        d.data = data;
        d.selectedValue = selectedData;
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

    SubPage.prototype.initVerify = function () {
        var that = this;
        //自定义验证规则
        form.verify({


            optEnt: function (value) {
                if (value.length === 0) {
                    return "请输入选择所属单位";
                }

            }

        });
    };

    SubPage.prototype.initSave = function () {

        var that = this;

        form.on('submit(btnSave)', function (formData) {


            $("#btnSave").attr("disabled", true);

            var data = {
                id: that.id,
                enterpriseId: $.trim(formData.field.optEnt),
                buildingId: $.trim(formData.field.optBuilding),
                keypartId: $.trim(formData.field.optKeyPartList)

            };


            var token = neat.getUserToken();

            pageDataApi.updateYSDevice(token, data
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