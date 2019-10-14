//编辑单位页面


layui.define(['jquery', 'layer', 'form', 'laydate', 'laytpl'
    , 'neat', 'upload', 'neatDataApi', 'neatDataApi', 'neatNavigator', 'common3rdDataApi', 'commonDataApi', 'enterprise3rdDataApi'
    , 'neatADCSelector', "neatValidators", 'neatFileViewer', 'imageDataApi', "neatGisSelector"
    , "neatLogoUploader"], function (exports) {

        "use strict";

        var MODULE_NAME = "pageEnterprise3rdUpdate";

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

        var imageDataApi = layui.imageDataApi;

        var gisSelector = layui.neatGisSelector;

        var logoUploader = layui.neatLogoUploader();

        var SubPage = function () {

            this.entId = neatNavigator.getUrlParam("id");

            this.entDetail = null;
            this.joinDate = null;
            this.selectedAdc = null;

            //上传文件的组件实例
            this.uploadListIns = null;

            //保存自定义logo的id
            this.currentLogoId = "";
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
                    entId: that.entId,
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
                    latitude: that.entDetail.latitude,
                    longitude: that.entDetail.longitude,
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
                postData.images = [];
                $.each(that.entDetail.images, function (_, item) {
                    if (typeof item !== "undefined") {
                        postData.images.push(item.id);
                    }

                });
                var token = neat.getUserToken();
                var tthat = that;
                pageDataApi.updateEnterprise(token, postData
                    , function (sd) {//成功



                        tthat.showSaveOK();

                    }, function (fd) {//失败
                        $("#btnSave").attr("disabled", false);

                        tthat.hideLoading();

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
        SubPage.prototype.initSelecteAdcEvent = function () {

            var that = this;
            $("#btnSelectAdc").on("click", function () {


                adcSelector.show(function (result) {

                    that.selectedAdc = result.value;
                    $("#txtAdcPath").val(result.name);

                });

            });
        };

        SubPage.prototype.initDate = function () {

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
                d.selectedValue = that.entDetail.kindBH;
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
                d.selectedValue = that.entDetail.typeBH;
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
                d.selectedValue = that.entDetail.industryDictBH;
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
                d.selectedValue = that.entDetail.industryBH;
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
                d.selectedValue = that.entDetail.fireDeptBH;
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
                d.selectedValue = that.entDetail.entType;
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
                d.selectedValue = that.entDetail.joinStatus;
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
                d.selectedValue = that.entDetail.superviseLevel;
                laytpl($("#optSuperviseLevelTemplate").html()).render(d, function (html) {
                    var parent = $("#optSuperviseLevel").html(html);
                    form.render('select', 'optSuperviseLevelForm');
                });

            });
        };

        SubPage.prototype.initEnterpriseInfo = function () {

            var that = this;

            pageDataApi.getEnterpriseById(neat.getUserToken(), that.entId
                , function (sd) {//获取成功
                    that.entDetail = sd;

                    that.fillForm();

                }
                , function () {

                    layer.msg("获取单位信息失败!", function () {
                        that.closeDialog();
                    });
                });
        };


        SubPage.prototype.hideLoading = function () {
            if (this.loadingLayerIndex) {
                parent.layer.close(this.loadingLayerIndex);
            }
        };
        SubPage.prototype.showLoading = function () {
            this.loadingLayerIndex = parent.layer.load(1);
        };
        SubPage.prototype.showSaveOK = function () {

            this.hideLoading();
            var that = this;

            layer.msg("保存成功!", { time: 1500 }, function () {

                that.closeDialog();

            });

        };



        SubPage.prototype.fillForm = function () {

            /*
            "entName": "宁浩发展六七分公司",
            "entType": "01",
            "parentDomain": "测试中心",
            "adc": "110101",
            "adcname": "北京市东城区",
            "address": "单位详细地址",
            "joinDate": "2018-05-30 00:00:00",
            "joinStatus": 0,
            "superviseLevel": 1,
            "inChargePerson": "111",
            "mobilePhone": "111",
            "telephone": "111",
            "fproomtel": "111"
            
            */
            this.initGisBrowse();

            if (this.entDetail.latitude) {
                $("#btnGisBrowse").text("重新定位");
            }

            $("#entName").val(this.entDetail.entName);

            $("#parentDomain").val(this.entDetail.parentDomain);
            $("#txtAdcPath").val(this.entDetail.adcname);
            $("#address").val(this.entDetail.address);
            $("#joinDate").val(this.entDetail.joinDate.replace(" 00:00:00", ""));

            this.selectedAdc = this.entDetail.adc;

            $("#inChargePerson").val(this.entDetail.inChargePerson);
            $("#mobilePhone").val(this.entDetail.mobilePhone);
            $("#telephone").val(this.entDetail.telephone);
            $("#fpRoomTel").val(this.entDetail.fproomtel);

            $("#txtGisAddress").val(this.entDetail.gisAddress);

            $("#PersonNum").val(this.entDetail.personNum);
            $("#BuildArea").val(this.entDetail.buildArea);
         

            this.initOptEnterpriseCategory();
            this.initOptJoinStatus();
            this.initOptSuperviseLevel();

            this.initOptComKindCategory();
            this.initOptComTypeCategory();
            this.initIndustryDictCategory();
            this.initIndustryCategory();
            this.initFireDeptCategory();


        };

        // 定位按钮事件
        SubPage.prototype.initGisBrowse = function () {


            var that = this;

            $("#btnGisBrowse").on("click", function () {
                var tthat = that;
                ;
                if (that.entDetail.latitude) {
                    gisSelector.init(that.entDetail.latitude
                        , that.entDetail.longitude
                        , that.entDetail.gisAddress);
                }
                else {
                    gisSelector.init(""
                        , ""
                        , ""
                        , tthat.entDetail.entName);
                }





                gisSelector.show(function (result) {

                    that.entDetail.latitude = result.latitude;
                    that.entDetail.longitude = result.longitude;
                    that.entDetail.gisAddress = result.gisaddress;

                    $("#txtGisAddress").val(result.gisaddress);

                    $("#btnGisBrowse").text("重新定位");

                });

            });


        };

        //初始化
        SubPage.prototype.init = function () {

            var that = this;


            that.initEnterpriseInfo();



            that.initSelecteAdcEvent();

            $("#btnCancel").on("click", function () {
                that.closeDialog();
            });

            that.initDate();
            that.initFormVerify();
            that.initFormSubmit();



            form.render();

        };


        // 改变上传控件的状态
        SubPage.prototype.changeUploadControlState = function (hasLogo) {

            if (!hasLogo) {
                $("#btnUpload").show();
                $("#btnReupload").hide();
                $("#btnDeleteLogo").hide();
            }
            else {
                $("#btnUpload").hide();
                $("#btnReupload").show();
                $("#btnDeleteLogo").show();
            }

        };

        exports(MODULE_NAME, new SubPage());

    });