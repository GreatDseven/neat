
//添加单位页面


layui.define(['jquery', 'layer', 'form', 'laydate', 'laytpl', 'upload', 'neat', 'neatDataApi', 'neatDataApi', 'neatNavigator', 'commonDataApi', 'enterpriseDataApi', 'neatADCSelector', "neatValidators","neatGisSelector"], function (exports) {

    "use strict";

    var MODULE_NAME = "pageEnterpriseCreate";

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
                aDc:that.selectedAdc,
                address: $.trim(formData.field.address),
                joinDate: formData.field.joinDate+" 00:00:00",
                joinStatus: formData.field.optJoinStatus,
                superviseLevel: formData.field.optSuperviseLevel,
                inChargePerson: $.trim(formData.field.inChargePerson),
                mobilePhone: $.trim(formData.field.mobilePhone),
                telephone: $.trim(formData.field.telephone),
                fPRoomTel: $.trim(formData.field.fpRoomTel),
                latitude: that.latitude,
                longitude: that.longitude,
                gisAddress: $.trim($("#txtGisAddress").val())

            };
            
            var token = neat.getUserToken();
            var tthat = that;
            pageDataApi.createEnterprise(token, postData
                , function (sd) {//成功
                    if (tthat.uploadListIns.config.files) {
                        if (Object.getOwnPropertyNames(tthat.uploadListIns.config.files).length > 0) {
                            //开始上传图片
                            $("#btnStartUpload").click();
                            return;
                        }
                    }

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

            
            adcSelector.show(function (result) {
                
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

    //初始化上传控件
    SubPage.prototype.initFileUpload = function () {

        var that = this;
        var uploadUrl = neat.getDataApiBaseUrl() + "/OpenApi/Image/UploadImage?objType=2&token=" + neat.getUserToken() + "&objId=" + that.id;

        var fileListView = $('#fileList');
        var uploadListIns = upload.render({
            elem: '#btnSave'
            , url: uploadUrl
            , accept: 'file'
            , ext: "jpg|jpeg|png|doc|docx"
            , acceptMime:'image/jpeg,image/png,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document'
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
                        // , '<td>' + (file.size / 1014).toFixed(1) + 'kb</td>'
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
                that._showLoading();
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
                    that._showSaveOK();
                }
                else {
                    layer.msg("部分文件保存失败,请通过编辑页面重新上传文件!", { time: 1500 }, function () {

                        that._closeDialog();

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

            that.initFileUpload();
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

        that.initOptEnterpriseCategory();
        that.initOptJoinStatus();
        that.initOptSuperviseLevel();
        

        form.render();

    };


    exports(MODULE_NAME, new SubPage());

});