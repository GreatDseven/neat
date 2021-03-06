﻿//修改重点部位页面


layui.define(['jquery', 'layer', 'form', 'laydate', 'laytpl', 'upload', 'neat', 'neatDataApi', 'neatDataApi', 'neatNavigator', 'commonDataApi', 'keypartDataApi', 'neatFileViewer', "neatValidators","imageDataApi"], function (exports) {

    "use strict";

    var MODULE_NAME = "pageKeypartUpdate";

    var $ = layui.$;

    var layer = layui.layer;

    var form = layui.form;

    var laydate = layui.laydate;

    var laytpl = layui.laytpl;

    var upload = layui.upload;

    var neat = layui.neat;

    var neatNavigator = layui.neatNavigator;

    var pageDataApi = layui.keypartDataApi;

    var imageDataApi = layui.imageDataApi;


    var SubPage = function () {

        this.id = neatNavigator.getUrlParam("id");

        this.loadingLayerIndex = -1;

        //上传文件的组件实例
        this.uploadListIns = null;
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
                id:that.id,
                name: $.trim(formData.field.keypartName),
                address: $.trim(formData.field.address),
                fPInfo: formData.field.fpInfo,
                floorArea: formData.field.floorArea,
                floorIndex: formData.field.floorIndex,
                inchargePerson: formData.field.inchargePerson,
                telephone: formData.field.telephone,
            };

            postData.images = [];
            $.each(that.keypartDetail.images, function (_, item) {
                if (typeof item !== "undefined") {
                    postData.images.push(item.id);
                }

            });

            var token = neat.getUserToken();

            var tthat = that;

            pageDataApi.updateKeypart(token, postData
                , function (sd) {//成功

                    if (tthat.uploadListIns.config.files )
                    {
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
            keypartName: function (value) {
                if (value.length === 0) {
                    return "请输入部位名称";
                } else if (value.length > 64) {
                    return "部位名称超长(最长64个字)";
                }
            },
            floorIndex: function (value) {
                if (value.length > 0) {
                    var v = parseFloat(value)
                    if (isNaN(v) || v.toString() !== value) {
                        return "请正确输入所在楼层";
                    }
                }
            },
            floorArea: function (value) {
                if (value.length === 0) {
                    var v = parseFloat(value)
                    if (isNaN(v) || v < 0 || v.toString() !== value) {
                        return "请正确输入所在楼层面积";
                    }
                }
            },
            fpInfo: function (value) {
                if (value.length === 0) {
                    return "请输入消防设备情况";
                } else if (value.length > 200) {
                    return "详细位置超长(最长200个字)";
                }
                
            },
            inchargePerson: function (value) {
                if (value.length === 0) {
                    return "请输入部位负责人";
                } else if (value.length > 15) {
                    return "部位负责人超长(最长15个字)";
                }

            },
            telephone: function (value) {
                if (value.length === 0) {
                    return "请输入联系电话";
                }
                var vr = layui.neatValidators.validateContactInfo(value); //既可以手机也可以固定电话
                if (vr !== "") {
                    return vr;
                }

            },
            address: function (value) {
                if (value.length === 0) {
                    return "请输入详细位置";
                } else if (value.length > 64) {
                    return "详细位置超长(最长64个字)";
                }
            },

        });
    };
    


    //初始化上传控件
    SubPage.prototype._initFileUpload = function () {

        var that = this;
        var uploadUrl = neat.getDataApiBaseUrl()+"/OpenApi/Image/UploadImage?objType=4&token=" + neat.getUserToken() + "&objId="+that.id;
        
        var fileListView = $('#fileList');
        var uploadListIns = upload.render({
            elem: '#btnSave'
          , url: uploadUrl
            , accept: 'images'
            , ext: "jpg|jpeg|png"
            , acceptMime: 'image/jpeg,image/png'
          , multiple: true
          , auto: false
          , bindAction: '#btnStartUpload'
         
          , choose: function (obj) {

              var files = this.files = obj.pushFile(); //将每次选择的文件追加到文件队列
              //读取本地文件
              obj.preview(function (index, file, result) {
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

              if (res.code === 200) { //上传成功
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

              
              if (obj.total === obj.successful) {
                  that._showSaveOK();
              }
              else
              {
                  layer.msg("部分图片保存失败,请通过编辑页面重新上传图片!", { time: 1500 }, function () {

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

    //显示提交成功
    SubPage.prototype._showSaveOK = function () {

        this._hideLoading();
        var that = this;

        layer.msg("保存成功!", { time: 1500 }, function () {

            that._closeDialog();

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



    //获取已有的数据
    SubPage.prototype._initKeypartDetail = function () {
        var that = this;
        pageDataApi.getKeypartById(neat.getUserToken(), that.id, function (resultData) {

            that.keypartDetail = resultData;
           
            that._fillOldValues();
        });
    };

    //渲染 已经和当前建筑关联的图片附件
    SubPage.prototype._renderFiles = function () {

        var that = this;
        var fileListView = $('#fileList');

        for (var i = 0; i < this.keypartDetail.images.length; i++) {
            var file = this.keypartDetail.images[i];
            var tr = $(['<tr data-imgindex="' + i + '">'
                   , '<td>' + file.name + '</td>'
                   , '<td>已经上传</td>'
                   , '<td>'
                   , '<button class="layui-btn layui-btn-xs layui-btn-danger file-delete">删除</button>'
                   , '<button class="layui-btn layui-btn-xs layui-btn-warm file-view" data-imgid="' + file.id + '">查看</button>'
                   , '</td>'
                   , '</tr>'].join(''));

            //删除
            tr.find('.file-delete').on('click', function () {

                var curTr = $(this).parent().parent();
                //从keypartDetail的 images数据中移除文件
                var index = curTr.data("imgindex");
                delete that.keypartDetail.images[index];
                curTr.remove();

            });
            //查看
            tr.find('.file-view').on('click', function () {

                var imgId = $(this).data("imgid");

                that._viewImage(imgId);

            });
            fileListView.append(tr);
        }

    };

    SubPage.prototype._viewImage = function (imgId) {
        var url = imageDataApi.getMediaFileViewOnlineUrl(imgId);
        //var url = neat.getDataApiBaseUrl() + "/OpenApi/Image/GetImage?token=" + neat.getUserToken() + "&id=" + imgId;

        layui.neatFileViewer.lookImageByUrl(url);
    };

    //把原有的值填充到界面
    SubPage.prototype._fillOldValues = function () {
       
        var that = this;

        $("#keypartName").val(that.keypartDetail.name);
        $("#buildingName").val(that.keypartDetail.buildingName);
        $("#entName").val(that.keypartDetail.enterpriseName);
        $("#floorIndex").val(that.keypartDetail.floorIndex);
        $("#floorArea").val(that.keypartDetail.floorArea);
        $("#fpInfo").val(that.keypartDetail.fpinfo);
        $("#inchargePerson").val(that.keypartDetail.inchargePerson);
        $("#telephone").val(that.keypartDetail.telephone);
        $("#address").val(that.keypartDetail.address);

        that._renderFiles();

        form.render();
    };


    //初始化
    SubPage.prototype.init = function () {

        var that = this;
        that._initKeypartDetail();
        that._initFileUpload();
        $("#btnCancel").on("click", function () {
            that._closeDialog();
        });
        that._initFormVerify();
        that._initFormSubmit();

        form.render();

    };


    exports(MODULE_NAME, new SubPage());

});