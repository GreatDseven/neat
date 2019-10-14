//编辑单位页面


layui.define(['jquery', 'layer', 'form', 'laydate', 'laytpl'
    , 'neat', 'upload', 'neatDataApi', 'neatDataApi', 'neatNavigator', 'commonDataApi', 'enterpriseDataApi'
    , 'neatADCSelector', "neatValidators", 'neatFileViewer', 'imageDataApi', "neatGisSelector"
    , "neatLogoUploader"], function (exports) {

        "use strict";

        var MODULE_NAME = "pageEnterpriseUpdate";

        var $ = layui.$;

        var layer = layui.layer;

        var form = layui.form;

        var laydate = layui.laydate;

        var laytpl = layui.laytpl;

        var upload = layui.upload;

        var neat = layui.neat;

        var neatNavigator = layui.neatNavigator;

        var commonDataApi = layui.commonDataApi;

        var pageDataApi = layui.enterpriseDataApi;

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
                    gisaddress: $.trim($("#txtGisAddress").val()),
                    logoId: that.currentLogoId
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

                        if (tthat.uploadListIns.config.files) {
                            if (Object.getOwnPropertyNames(tthat.uploadListIns.config.files).length > 0) {
                                //开始上传图片
                                $("#btnStartUpload").click();
                                return;
                            }
                        }

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

        SubPage.prototype.initFileUpload = function () {

            var that = this;
            var uploadUrl = neat.getDataApiBaseUrl() + "/OpenApi/Image/UploadImage?objType=2&token=" + neat.getUserToken() + "&objId=" + that.entId;

            var fileListView = $('#fileList');
            var uploadListIns = upload.render({
                elem: '#btnSave'
                , url: uploadUrl
                , accept: 'file'
                , ext: "jpg|jpeg|png|doc|docx"
                , acceptMime: 'image/jpeg,image/png,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                , multiple: true
                , auto: false
                , bindAction: '#btnStartUpload'

                , choose: function (obj) {

                    var files = this.files = obj.pushFile(); //将每次选择的文件追加到文件队列

                    //读取本地文件
                    obj.preview(function (index, file, result) {

                        if (file.size == 0) {
                            layer.msg("文件无内容,请重新选择");
                            delete files[index];
                            return;
                        }

                        var tr = $(['<tr id="upload-' + index + '">'
                            , '<td>' + file.name + '</td>'
                            , '<td>等待上传</td>'
                            , '<td>'
                            , '<button class="layui-btn layui-btn-xs layui-btn-danger file-delete">删除</button>'

                            , '</td>'
                            , '</tr>'].join(''));



                        //删除
                        tr.find('.file-delete').on('click', function () {
                            delete files[index]; //删除对应的文件
                            tr.remove();
                            uploadListIns.config.elem.next()[0].value = ''; //清空 input file 值，以免删除后出现同名文件不可选
                        });

                        fileListView.append(tr);
                    });
                }
                , before: function (obj) { //obj参数包含的信息，跟 choose回调完全一致，可参见上文。
                    that.showLoading();
                }
                , done: function (res, index, upload) {

                    if (res.code == 200) { //上传成功
                        var tr = fileListView.find('tr#upload-' + index)
                            , tds = tr.children();
                        tds.eq(1).html('<span style="color: #5FB878;">上传成功</span>');
                        tds.eq(2).html(''); //清空操作
                        return delete this.files[index]; //删除文件队列已经上传成功的文件
                    }
                    this.error(index, upload);
                }
                , allDone: function (obj) { //当文件全部被提交后，才触发
                    //console.log(obj.total); //得到总文件数
                    //console.log(obj.successful); //请求成功的文件数
                    //console.log(obj.aborted); //请求失败的文件数


                    if (obj.total == obj.successful) {
                        that.showSaveOK();
                    }
                    else {
                        layer.msg("部分文件保存失败,请通过编辑页面重新上传文件!", { time: 1500 }, function () {

                            that.closeDialog();

                        });
                    }

                }
                , error: function (index, upload) {

                    var tr = fileListView.find('tr#upload-' + index)
                        , tds = tr.children();
                    tds.eq(2).html('<span style="color: #FF5722;">上传失败</span>');
                    tds.eq(3).find('.demo-reload').removeClass('layui-hide'); //显示重传
                }
            });

            that.uploadListIns = uploadListIns;

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
        //渲染 已经上传的附件
        SubPage.prototype.renderFiles = function () {

            var that = this;
            var fileListView = $('#fileList');

            for (var i = 0; i < this.entDetail.images.length; i++) {
                var file = this.entDetail.images[i];
                var tr = $(['<tr data-imgindex="' + i + '">'
                    , '<td>' + file.name + '</td>'
                    , '<td>已经上传</td>'
                    , '<td>'
                    , '<button class="layui-btn layui-btn-xs layui-btn-danger file-delete">删除</button>'
                    , '<button class="layui-btn layui-btn-xs layui-btn-warm file-view" data-imgid="' + file.id + '" data-ext="' + file.ext + '">查看</button>'
                    , '</td>'
                    , '</tr>'].join(''));

                //删除
                tr.find('.file-delete').on('click', function () {

                    var curTr = $(this).parent().parent();
                    //从buildingDetail的 images数据中移除文件
                    var index = curTr.data("imgindex");
                    delete that.entDetail.images[index];
                    curTr.remove();

                });
                //查看
                tr.find('.file-view').on('click', function () {

                    var imgId = $(this).data("imgid");
                    var ext = $(this).data("ext").toLowerCase();

                    that.viewImage(imgId, ext);

                });
                fileListView.append(tr);
            }

        };
        SubPage.prototype.viewImage = function (imgId, ext) {

            if (ext == ".doc" || ext == ".docx") {
                var url = imageDataApi.getDocFileViewOnlineUrl(imgId);
                layui.neatFileViewer.lookFileByUrl(url);
            }
            else {
                var url = imageDataApi.getMediaFileViewOnlineUrl(imgId);
                layui.neatFileViewer.lookImageByUrl(url);
            }


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

            this.initOptEnterpriseCategory();
            this.initOptJoinStatus();
            this.initOptSuperviseLevel();

            this.renderFiles();

            this.initLogoUpload();

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



            that.initFileUpload();
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

        // 初始化上传logo相关的控件
        SubPage.prototype.initLogoUpload = function () {

            var that = this;

            this.currentLogoId = that.entDetail.logoId;

            that.changeUploadControlState(this.currentLogoId);

            $("#btnUpload").on("click", function () {
                that.UploadImpl();
            });

            $("#btnReupload").on("click", function () {
                that.UploadImpl();
            });

            //清除自定义logo
            $("#btnDeleteLogo").on("click", function () {

                that.currentLogoId = "";

                that.changeUploadControlState(false);

            });

        };

        //调用上传控件上传
        SubPage.prototype.UploadImpl = function () {
            var that = this;
            logoUploader.init(that.entId, "2");
            logoUploader.show(function (result) {

                if (result) {
                    that.currentLogoId = result;
                    that.changeUploadControlState(true);
                }



            });

        };


        exports(MODULE_NAME, new SubPage());

    });