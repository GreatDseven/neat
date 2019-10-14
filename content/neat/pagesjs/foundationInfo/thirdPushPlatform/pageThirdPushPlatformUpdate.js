
//添加单位页面


layui.define(['jquery', 'layer', 'form', 'laytpl', 'commonDataApi', 'tppInfoDataApi'], function (exports) {

    "use strict";

    var MODULE_NAME = "pageThirdPushPlatformUpdate";

    var $ = layui.$;
    var layer = layui.layer;
    var form = layui.form;
    var neat = layui.neat;
    var neatNavigator = layui.neatNavigator;
    var pageDataApi = layui.tppInfoDataApi;
    var commonDataApi = layui.commonDataApi;
    var laytpl = layui.laytpl;

    var SubPage = function () {
        this.id = neatNavigator.getUrlParam("id");
        this.optPlatformType = "";
    };

    //关闭对话框
    SubPage.prototype._closeDialog = function () {
        var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
        parent.layer.close(index); //再执行关闭
    };

    // 初始化 第三方平台类型
    SubPage.prototype.initPlatformType = function () {
        var that = this;

        commonDataApi.getTPPTypes(function (data) {
            data.selectedValue = that.optPlatformType;
          
            laytpl($('#optPlatformTypeTemplate').html()).render(data, function (html) {
                $("#optPlatformType").html(html);
                form.render('select', 'optPlatformTypeForm');
                //form.render('select','optPlatformType');
            });
        });

        form.on('select(optPlatformType)', function (data) {
            //console.log(data.elem); //得到select原始DOM对象
            //console.log(data.value); //得到被选中的值
            //console.log(data.othis); //得到美化后的DOM对象          

            that.optPlatformType = data.value;
            that.platformTypeSetting();
        });
    };

    //表单提交事件
    SubPage.prototype._initFormSubmit = function () {

        var that = this;
        form.on('submit(btnSave)', function (formData) {

            $("#btnSave").attr("disabled", true);

            var postData = {
                id: that.id,
                apiAddress: $.trim(formData.field.apiAddress),
                platformType: formData.field.optPlatformType,
                token: $.trim(formData.field.apiToken),
                appKey: $.trim(formData.field.appKey),
                appId: $.trim(formData.field.appID)
            };

            var token = neat.getUserToken();
            var tthat = that;
            pageDataApi.updateInfo(token, postData
                , function (sd) {//成功
                    tthat._showSaveOK();
                }, function (fd) {//失败
                    $("#btnSave").attr("disabled", false);

                    tthat._hideLoading();

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
    SubPage.prototype._initFormVerify = function () {
        form.verify({
            apiAddress: function (value) {
                if (value.length == 0) {
                    return "请输平台接口地址";
                } else if (value.length > 100) {
                    return "平台接口地址(最长64个字)";
                } else if (value.indexOf('.') == -1) {
                    return "平台接口地址格式不正确";
                }
            },
            optPlatformType: function (value) {
                if (value.length == 0) {
                    return "请选平台类型";
                }
            }
        });
    };

    //隐藏正在加载的动画
    SubPage.prototype._hideLoading = function () {
        if (this.loadingLayerIndex) {
            parent.layer.close(this.loadingLayerIndex)
        }
    };
    //显示正在加载的动画
    SubPage.prototype._showLoading = function () {
        this.loadingLayerIndex = parent.layer.load(1);
    };

    //显示提交成功
    SubPage.prototype._showSaveOK = function () {

        this._hideLoading();
        var that = this;

        layer.msg("保存成功!", { time: 1500 }, function () {

            that._closeDialog();

        });

    };

    SubPage.prototype.loadInfo = function () {
        var that = this;
        pageDataApi.getInfoById(neat.getUserToken(), that.id, function (result) {
            
            //"id": "175fd686-3e1a-4ddf-a987-4af716226e06",主键 <string>
            //"domainName": "尼特云中心",中心名称 <string>
            //"apiAddress": "123.",接口地址 <string>
            //"appId": "2312312",APPID <string>
            //"appKey": "23123123",APPkey <string>
            //"token": "",Token <string>
            //"platformType": 1平台类型（1：甘肃，2：潍坊） <number>

            $("#apiAddress").val(result.apiAddress);

            $("#optPlatformType").val(result.parentDomain);
            $("#appID").val(result.appId);
            $("#appKey").val(result.appKey);
            $("#apiToken").val(result.token);
            that.optPlatformType = result.platformType;


            that.initPlatformType();

            that.platformTypeSetting();
        },
            function (errorMsg) { });
    };

    SubPage.prototype.platformTypeSetting = function () {
        if (this.optPlatformType == 1) {
            $('#idkeyRow').show();
            $('#tokenRow').hide();

        } else if (this.optPlatformType == 2) {
            $('#idkeyRow').hide();
            $('#tokenRow').show();
        }
    }

    //初始化
    SubPage.prototype.init = function () {
        var that = this;

        that.loadInfo();

        $("#btnCancel").on("click", function () {
            that._closeDialog();
        });

        that._initFormVerify();
        that._initFormSubmit();

        form.render();
    };

    exports(MODULE_NAME, new SubPage());

});