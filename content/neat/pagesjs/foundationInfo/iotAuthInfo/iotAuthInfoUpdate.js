//nb平台应用信息 修改页面


layui.define(['jquery', 'layer', 'form', 'laydate', 'laytpl', 'upload', 'neat', 'neatDataApi', 'neatDataApi', 'neatNavigator', 'commonDataApi', 'iotAuthInfoDataApi', "neatValidators"], function (exports) {

    "use strict";

    var MODULE_NAME = "pageIotAuthInfoUpdate";

    var $ = layui.$;

    var layer = layui.layer;

    var form = layui.form;

    var laydate = layui.laydate;

    var laytpl = layui.laytpl;

    var upload = layui.upload;

    var neat = layui.neat;

    var neatNavigator = layui.neatNavigator;

    var commonDataApi = layui.commonDataApi;

    var pageDataApi = layui.iotAuthInfoDataApi;


    var SubPage = function () {

        this.id = "";
        this.detailObj = {};

    };






    //初始化
    SubPage.prototype.init = function () {

        var that = this;


        this.id = neatNavigator.getUrlParam("id");

        this.initDetail();

        $("#btnCancel").on("click", function () {
            that.closeDialog();
        });

        that.initFormVerify();
        that.initFormSubmit();

        form.render();

    };

    var dataPropertyNames = {
        id: "id",
        isp: "isp",
        envType: "envType",
        name: "name",
        appId: "appId",
        appSecret: "appSecret",
        apiMasterKey: "apiMasterKey",
        modelType: "modelType"
    }


    //获取已有的数据
    SubPage.prototype.initDetail = function () {
        var that = this;
        pageDataApi.getAuthInfoById(neat.getUserToken(), that.id, function (resultData) {

            that.detailObj = resultData;

            that.fillOldValues();
        }, function () {

            layer.msg("获取数据失败", function () {
                that.closeDialog();
            })
        });
    };

    // 把原有的值填充到界面
    SubPage.prototype.fillOldValues = function () {


        var that = this;

        that.initISPList();
        that.initEnvList();
        that.initModelTypeList();

        $("#appName").val(that.detailObj[dataPropertyNames.name]);
        if (that.detailObj[dataPropertyNames.isp] == "2") //中国移动
        {
            $("#chinaMobile").show();

            $("#apiMasterKey").val(that.detailObj[dataPropertyNames.apiMasterKey]);
        }
        else {

            $("#chinaTeleCom").show();
            $("#appId").val(that.detailObj[dataPropertyNames.appId]);
            $("#appSecret").val(that.detailObj[dataPropertyNames.appSecret]);
        }

    };

    //初始化 设备类型
    SubPage.prototype.initModelTypeList = function () {

        var that = this;

        //获取设备类型列表
        commonDataApi.getNBDeviceTypeList(neat.getUserToken(), function (data) {
            var d = {};
            d.data = data;
            d.selectedValue = that.detailObj[dataPropertyNames.modelType];
            laytpl($("#optModelTypeTemplate").html()).render(d, function (html) {
                var parent = $("#optModelType").html(html);
                form.render('select', 'optModelTypeForm');
            });
        });
    };

    //关闭对话框
    SubPage.prototype.closeDialog = function () {
        var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
        parent.layer.close(index); //再执行关闭
    };

    //表单提交事件
    SubPage.prototype.initFormSubmit = function () {

        var that = this;



        form.on('submit(btnSave)', function (formData) {

            $("#btnSave").attr("disabled", true);



            var postData = {
                id: that.detailObj.id,
                isp: formData.field.optISPList,
                name: $.trim(formData.field.appName),
                modelType: $.trim(formData.field.optModelType)

            };

            if (postData.isp == "2") { //中国移动
                postData.apiMasterKey = $.trim(formData.field.apiMasterKey);
                postData.envType = true;
            }
            else //if (postData.isp == "3" || postData.isp == "4") //中国电信& 和 潍坊平台
            {
                postData.appId = $.trim(formData.field.appId);
                postData.appSecret = $.trim(formData.field.appSecret);
                envType: formData.field.optEnvType;
            }

            var token = neat.getUserToken();

            var tthat = that;

            pageDataApi.updateAuthInfo(token, postData
                , function (sd) {//成功

                    layer.msg("保存成功!", { time: 1500 }, function () {
                        that.closeDialog();
                    });

                }, function (fd) {//失败
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

    //form表单校验
    SubPage.prototype.initFormVerify = function () {
        var that = this;

        form.verify({

            optISPList: function (value) {
                if (value.length == 0) {
                    return "请选择运营商";
                }
            },
            optEnvType: function (value) {
                if (value.length == 0) {
                    return "请选择运行环境";
                }
            },

            appName: function (value) {
                if (value.length == 0) {
                    return "请输入名称";
                } else if (value.length > 50) {
                    return "名称超长(最长50个字)";
                }
            },

            appId: function (value) {

                if (that.selectedIsp == "3") {
                    if (value.length == 0) {
                        return "请输入AppId";
                    }
                }


            },

            appSecret: function (value) {
                if (that.selectedIsp == "3") {
                    if (value.length == 0) {
                        return "请输入AppSecret";
                    }
                }
            },


            apiMasterKey: function (value) {
                if (that.selectedIsp == "2") {
                    if (value.length == 0) {
                        return "请输入ApiMasterKey";
                    }
                }
            },


        });
    };


    //显示提交成功
    SubPage.prototype.showSaveOK = function () {

        this.hideLoading();
        var that = this;

        layer.msg("保存成功!", { time: 1500 }, function () {

            that.closeDialog();

        });

    };



    //初始化运营商列表
    SubPage.prototype.initISPList = function () {

        var that = this;

        form.on('select(optISPList)', function (data) {
            //console.log(data.elem); //得到select原始DOM对象
            //console.log(data.value); //得到被选中的值
            //console.log(data.othis); //得到美化后的DOM对象

            that.selectedIsp = data.value;

            if (selectedIsp === "2") { //中国移动

                $("#chinaTeleCom").hide();
                $("#chinaMobile").show();
            }
            else {
                $("#chinaTeleCom").hide();
                $("#chinaMobile").show();
            }

        });
        that.bindISPList();
    };

    //绑定运营商列表
    SubPage.prototype.bindISPList = function () {

        var that = this;

        //获取运营商列表
        commonDataApi.getISPDataList(neat.getUserToken(), function (data) {
            var d = {};
            d.data = data;
            d.selectedValue = that.detailObj[dataPropertyNames.isp];
            laytpl($("#optISPListTemplate").html()).render(d, function (html) {
                var parent = $("#optISPList").html(html);
                form.render('select', 'optISPListForm');
            });
        });

    };

    //初始化 运行环境列表
    SubPage.prototype.initEnvList = function () {

        var that = this;

        //获取运营商列表
        commonDataApi.getEnvTypeDataList(neat.getUserToken(), function (data) {


            var d = {};
            d.data = data;
            d.selectedValue = that.detailObj[dataPropertyNames.envType].toString();
            laytpl($("#optEnvTypeTemplate").html()).render(d, function (html) {
                var parent = $("#optEnvType").html(html);
                form.render('select', 'optEnvTypeForm');
            });
        });
    };


    exports(MODULE_NAME, new SubPage());

});