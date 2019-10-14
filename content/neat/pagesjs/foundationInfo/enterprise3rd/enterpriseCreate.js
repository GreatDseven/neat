
//添加单位页面


layui.define(['jquery', 'layer', 'form', 'laydate', 'laytpl', 'upload', 'neat', 'neatDataApi', 'neatDataApi', 'neatNavigator', 'common3rdDataApi', 'commonDataApi', 'enterprise3rdDataApi', 'neatADCSelector', "neatValidators", "neatGisSelector"], function (exports) {

    "use strict";

    var MODULE_NAME = "pageEnterprise3rdCreate";

    var $ = layui.$;

    var layer = layui.layer;

    var form = layui.form;

    var laydate = layui.laydate;

    var laytpl = layui.laytpl;

    var upload = layui.upload;

    var neat = layui.neat;

    var neatNavigator = layui.neatNavigator;

    var commonDataApi = layui.commonDataApi;
    var common3rdDataApi = layui.common3rdDataApi;
    var pageDataApi = layui.enterprise3rdDataApi;

    var adcSelector = layui.neatADCSelector;

    var gisSelector = layui.neatGisSelector;

    var SubPage = function () {

        this.parentDomainId = neatNavigator.getUrlParam("parentId");
        this.parentDomainName = neatNavigator.getUrlParam("parentName");

        this.joinDate = null;
        this.selectedAdc = null;

        this.id = "";
    };


    //关闭对话框
    SubPage.prototype._closeDialog = function () {
        var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
        parent.layer.close(index); //再执行关闭
    };

    //表单提交事件
    SubPage.prototype._initFormSubmit = function () {

        var that = this;
        form.on('submit(btnSave)', function (formData) {


            $("#btnSave").attr("disabled", true);

            var postData = {
                id: that.id,
                parentDomainId: that.parentDomainId,
                entName: $.trim(formData.field.entName),
                entType: formData.field.optEntType,
                aDc: that.selectedAdc,
                address: $.trim(formData.field.address),
                joinDate: formData.field.joinDate + " 00:00:00",
                joinStatus: formData.field.optJoinStatus,
                superviseLevel: formData.field.optSuperviseLevel,
                inChargePerson: $.trim(formData.field.inChargePerson),
                mobilePhone: $.trim(formData.field.mobilePhone),
                telephone: $.trim(formData.field.telephone),
                fPRoomTel: $.trim(formData.field.fpRoomTel),
                latitude: that.latitude,
                longitude: that.longitude,
                gisAddress: $.trim($("#txtGisAddress").val()),
                KindBH: $.trim(formData.field.optComKind),
                KindMC: $.trim($("#optComKind option:selected").text()),
                TypeBH: $.trim(formData.field.optComType),
                TypeMC: $.trim($("#optComType option:selected").text()),
                LbBH: formData.field.optEntType,
                LbMC: $.trim($("#optEntType option:selected").text()),
                IndustryDictBH: $.trim(formData.field.optIndustryDict),
                IndustryDictMC: $.trim($("#optIndustryDict option:selected").text()),
                AreaBH: that.selectedAdc,
                AreaMC: $.trim($("#txtAdcPath").val()),
                BuildArea: $.trim(formData.field.BuildArea),
                PersonNum: $.trim(formData.field.PersonNum),
                IndustryBH: $.trim(formData.field.optIndustry),
                IndustryMC: $.trim($("#optIndustry option:selected").text()),
                FireDeptBH: $.trim(formData.field.optFireDept),
                FireDeptMC: $.trim($("#optFireDept option:selected").text())
            };
            var token = neat.getUserToken();
            var tthat = that;
            pageDataApi.createEnterprise(token, postData
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

            entName: function (value) {
                if (value.length == 0) {
                    return "请输入单位名称";
                } else if (value.length > 64) {
                    return "单位名称(最长64个字)";
                }
            },
            optEntType: function (value) {
                if (value.length == 0) {
                    return "请选择单位类别";
                }
            },

            txtAdcPath: function (value) {
                if (value.length == 0) {
                    return "请选择行政区划";
                }
            },
            address: function (value) {
                if (value.length == 0) {
                    return "请输入单位地址";
                } else if (value.length > 64) {
                    return "单位地址超长(最长64个字)";
                }
            },
            joinDate: function (value) {
                if (value.length == 0) {
                    return "请选择入网时间";
                }
            },
            optJoinStatus: function (value) {
                if (value.length == 0) {
                    return "请选择联网状态";
                }
            },
            optSuperviseLevel: function (value) {
                if (value.length == 0) {
                    return "请选择监管等级";
                }
            },
            inChargePerson: function (value) {
                if (value.length == 0) {
                    return "请输入单位负责人";
                } else if (value.length > 15) {
                    return "单位负责人超长(最长15个字)";
                }
            },
            mobilePhone: function (value) {
                if (value.length == 0) {
                    return "请输入联系电话";
                }
                var vr = layui.neatValidators.validateContactInfo(value); //既可以手机也可以固定电话
                if (vr !== "") {
                    return vr;
                }

            },
            telephone: function (value) {
                if (value.length == 0) {
                    return "请输入固定电话";
                }
                var vr = layui.neatValidators.validateTelephone(value);
                if (vr !== "") {
                    return vr;
                }

            },
            fpRoomTel: function (value) {
                if (value.length == 0) {
                    return "请输入消防室电话";
                }
                var vr = layui.neatValidators.validateContactInfo(value); //既可以手机也可以固定电话
                if (vr !== "") {
                    return vr;
                }
            }

        });
    };

    //初始化行政区划选择事件
    SubPage.prototype._initSelecteAdcEvent = function () {

        var that = this;
        $("#btnSelectAdc").on("click", function () {


            adcSelector.show3rd("370", function (result) {

                that.selectedAdc = result.value;
                $("#txtAdcPath").val(result.name);

            });

        });
    };

    SubPage.prototype._initDate = function () {

        var that = this;

        laydate.render({
            elem: '#joinDate', //指定元素
            type: 'date',
            range: false,
            format: "yyyy-MM-dd",
            trigger: "click",
            done: function (value, startDate, endDate) {

                //console.log(value); //得到日期生成的值，如：2017-08-18
                //console.log(startDate); //得到日期时间对象：{year: 2017, month: 8, date: 18, hours: 0, minutes: 0, seconds: 0}
                //console.log(endDate); //得结束的日期时间对象，开启范围选择（range: true）才会返回。对象成员同上。

                that.joinDate = value;

            }

        });

    };

    //初始化潍坊单位性质
    SubPage.prototype.initOptComKindCategory = function () {
        var that = this;
        common3rdDataApi.getCodeType("WEIFANG_COMKIND", neat.getUserToken(), function (resultData) {

            var d = {};
            d.data = resultData;
            laytpl($("#optComKindTemplate").html()).render(d, function (html) {
                var parent = $("#optComKind").html(html);
                form.render('select', 'optComKindForm');
            });
        });
    };


    //初始化潍坊单位分级
    SubPage.prototype.initOptComTypeCategory = function () {
        var that = this;
        common3rdDataApi.getCodeType("WEIFANG_COMTYPE", neat.getUserToken(), function (resultData) {

            var d = {};
            d.data = resultData;
            laytpl($("#optComTypeTemplate").html()).render(d, function (html) {
                var parent = $("#optComType").html(html);
                form.render('select', 'optComTypeForm');
            });
        });
    };




    //初始化潍坊所属行业
    SubPage.prototype.initIndustryDictCategory = function () {
        var that = this;
        common3rdDataApi.getCodeType("WEIFANG_INDUSTRYDICT", neat.getUserToken(), function (resultData) {

            var d = {};
            d.data = resultData;
            laytpl($("#optIndustryDictTemplate").html()).render(d, function (html) {
                var parent = $("#optIndustryDict").html(html);
                form.render('select', 'optIndustryDictForm');
            });
        });
    };


    //初始化潍坊行业主管部门
    SubPage.prototype.initIndustryCategory = function () {
        var that = this;
        common3rdDataApi.getCodeType("WEIFANG_INDUSTRY", neat.getUserToken(), function (resultData) {

            var d = {};
            d.data = resultData;
            laytpl($("#optIndustryTemplate").html()).render(d, function (html) {
                var parent = $("#optIndustry").html(html);
                form.render('select', 'optIndustryForm');
            });
        });
    };

    //初始化潍坊消防主管部门
    SubPage.prototype.initFireDeptCategory = function () {
        var that = this;
        common3rdDataApi.getCodeType("WEIFANG_FIREDEPT", neat.getUserToken(), function (resultData) {

            var d = {};
            d.data = resultData;
            laytpl($("#optFireDeptTemplate").html()).render(d, function (html) {
                var parent = $("#optFireDept").html(html);
                form.render('select', 'optFireDeptForm');
            });
        });
    };






    //初始化单位类别
    SubPage.prototype.initOptEnterpriseCategory = function () {
        var that = this;
        commonDataApi.getEnterpriseCategoryList(neat.getUserToken(), function (resultData) {

            var d = {};
            d.data = resultData;
            laytpl($("#optEntTypeTemplate").html()).render(d, function (html) {
                var parent = $("#optEntType").html(html);
                form.render('select', 'optEntTypeForm');
            });

        });


    };

    //初始化单位联网状态
    SubPage.prototype.initOptJoinStatus = function () {
        var that = this;
        commonDataApi.getJoinStatusList(neat.getUserToken(), function (resultData) {

            var d = {};
            d.data = resultData;
            laytpl($("#optJoinStatusTemplate").html()).render(d, function (html) {
                var parent = $("#optJoinStatus").html(html);
                form.render('select', 'optJoinStatusForm');
            });

        });
    };
    //初始化单位监管等级
    SubPage.prototype.initOptSuperviseLevel = function () {
        var that = this;
        commonDataApi.getSuperviseLevelList(neat.getUserToken(), function (resultData) {

            var d = {};
            d.data = resultData;
            laytpl($("#optSuperviseLevelTemplate").html()).render(d, function (html) {
                var parent = $("#optSuperviseLevel").html(html);
                form.render('select', 'optSuperviseLevelForm');
            });

        });
    };

    //获取一个guid
    SubPage.prototype._initId = function (callback) {
        var that = this;
        commonDataApi.getGuid(neat.getUserToken(), function (resultData) {

            that.id = resultData;
            callback();

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

    // 定位按钮事件
    SubPage.prototype._initGisBrowse = function () {


        var that = this;

        $("#btnGisBrowse").on("click", function () {

            var tthat = that;

            if (tthat.latitude) {
                gisSelector.init(tthat.latitude
               , tthat.longitude
               , tthat.gisaddress);
            }
            else {
                gisSelector.init(""
              , ""
              , "", $.trim($("#entName").val()));
            }

            gisSelector.show(function (result) {

                tthat.latitude = result.latitude;
                tthat.longitude = result.longitude;
                tthat.gisaddress = result.gisaddress;

                $("#txtGisAddress").val(result.gisaddress);
                $("#btnGisBrowse").text("重新定位");

            });

        });


    };

    //初始化
    SubPage.prototype.init = function () {

        var that = this;



        that._initId(function () {
            //that.initFileUpload();
        });

        that._initGisBrowse();

        $("#parentDomain").val(that.parentDomainName);

        that._initSelecteAdcEvent();

        $("#btnCancel").on("click", function () {
            that._closeDialog();
        });

        that._initDate();
        that._initFormVerify();
        that._initFormSubmit();

        that.initOptComKindCategory();
        that.initOptComTypeCategory();
        that.initIndustryDictCategory();
        that.initIndustryCategory();
        that.initFireDeptCategory();


        that.initOptEnterpriseCategory();
        that.initOptJoinStatus();
        that.initOptSuperviseLevel();


        form.render();

    };


    exports(MODULE_NAME, new SubPage());

});