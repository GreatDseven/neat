//单位详情查看页面


layui.define(['jquery', 'layer', 'form', 'laydate', 'laytpl', 'neat', 'upload', 'neatDataApi', 'neatDataApi', 'neatNavigator', 'commonDataApi', 'enterpriseDataApi', 'neatADCSelector', "neatValidators", 'neatFileViewer', 'imageDataApi', "neatGisViewer"], function (exports) {

    "use strict";

    var MODULE_NAME = "pageEnterpriseDetail";

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

    var gisViewer = layui.neatGisViewer;

    var SubPage = function () {

        this.entId = neatNavigator.getUrlParam("id");
       
        this.entDetail = null;
        this.joinDate = null;
        this.selectedAdc = null;

        //上传文件的组件实例
        this.uploadListIns = null;
    };


    //关闭对话框
    SubPage.prototype._closeDialog = function () {
        var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
        parent.layer.close(index); //再执行关闭
    };

   
    



    //初始化单位类别
    SubPage.prototype.initOptEnterpriseCategory = function () {
        var that = this;
        commonDataApi.getEnterpriseCategoryList(neat.getUserToken(), function (resultData) {
         
            var d = {};
            d.data = resultData;
            d.selectedValue =  that.entDetail.entType;
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

    SubPage.prototype._initEnterpriseInfo = function () {

        var that = this;

       // var index = layer.load(1);

        pageDataApi.getEnterpriseById(neat.getUserToken(), that.entId
            , function (sd) {//获取成功
                that.entDetail = sd;
                that._fillForm();
                //layer.close(index);
            }
            , function () {
                //layer.close(index);
                layer.msg("获取单位信息失败!", function () {
                    that._closeDialog();
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
    SubPage.prototype._hideLoading = function () {
        if (this.loadingLayerIndex) {
            parent.layer.close(this.loadingLayerIndex)
        }
    };
    SubPage.prototype._showLoading = function () {
        this.loadingLayerIndex = parent.layer.load(1);
    };
    SubPage.prototype._showSaveOK = function () {

        this._hideLoading();
        var that = this;

        layer.msg("保存成功!", { time: 1500 }, function () {

            that._closeDialog();

        });

    };
    //渲染 已经上传的附件
    SubPage.prototype._renderFiles = function () {

        var that = this;
        var fileListView = $('#fileList');

        for (var i = 0; i < this.entDetail.images.length; i++) {
            var file = this.entDetail.images[i];
            var tr = $(['<tr data-imgindex="' + i + '">'
                , '<td>' + file.name + '</td>'
                , '<td>已经上传</td>'
                , '<td>'
                , '<button class="layui-btn layui-btn-xs layui-btn-warm file-view" data-imgid="' + file.id + '" data-ext="' + file.ext + '">查看</button>'
                , '</td>'
                , '</tr>'].join(''));


            //查看
            tr.find('.file-view').on('click', function () {

                var imgId = $(this).data("imgid");
                var ext = $(this).data("ext").toLowerCase();

                that._viewImage(imgId, ext);

            });
            fileListView.append(tr);
        }

    };
    SubPage.prototype._viewImage = function (imgId, ext) {

        if (ext == ".doc" || ext == ".docx") {
            var url = imageDataApi.getDocFileViewOnlineUrl(imgId);
            layui.neatFileViewer.lookFileByUrl(url);
        }
        else {
            var url = imageDataApi.getMediaFileViewOnlineUrl(imgId);
            layui.neatFileViewer.lookImageByUrl(url);
        }

        
    };

    SubPage.prototype._fillForm = function () {

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
        this._initGisBrowse();

        $("#entName").val(this.entDetail.entName);
        
        $("#parentDomain").val(this.entDetail.parentDomain);
        $("#txtAdcPath").val(this.entDetail.adcname);
        $("#address").val(this.entDetail.address);
        $("#joinDate").val(this.entDetail.joinDate.replace(" 00:00:00",""));
        
        this.selectedAdc = this.entDetail.adc;

        $("#inChargePerson").val(this.entDetail.inChargePerson);
        $("#mobilePhone").val(this.entDetail.mobilePhone);
        $("#telephone").val(this.entDetail.telephone);
        $("#fpRoomTel").val(this.entDetail.fproomtel);

        $("#txtGisAddress").val(this.entDetail.gisAddress);

        this.initOptEnterpriseCategory();
        this.initOptJoinStatus();
        this.initOptSuperviseLevel();

        this._renderFiles();

    };

    // 定位按钮事件
    SubPage.prototype._initGisBrowse = function () {


        var that = this;

        $("#btnGisBrowse").on("click", function () {
            var tthat = that;
            ;
            if (that.entDetail.latitude) {
                gisViewer.init(that.entDetail.latitude
                , that.entDetail.longitude
                    , that.entDetail.gisAddress);
                gisViewer.show(function (result) { });
            }
            else {
                layer.msg("当前单位尚未标注!");
            }

        });


    };

    //初始化
    SubPage.prototype.init = function () {

        var that = this;

        that.initFileUpload();

        that._initEnterpriseInfo();


        $("#btnCancel").on("click", function () {
            that._closeDialog();
        });


        form.render();

    };


    exports(MODULE_NAME, new SubPage());

});