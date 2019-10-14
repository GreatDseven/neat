//添加建筑页面


layui.define(['jquery', 'layer', 'form', 'laydate', 'laytpl', 'upload', 'neat', 'neatDataApi', 'neatDataApi', 'neatNavigator', 'commonDataApi', 'buildingDataApi'], function (exports) {

    "use strict";

    var MODULE_NAME = "pageBuildingCreate";

    var $ = layui.$;

    var layer = layui.layer;

    var form = layui.form;

    var laydate = layui.laydate;

    var laytpl = layui.laytpl;

    var upload = layui.upload;

    var neat = layui.neat;

    var neatNavigator = layui.neatNavigator;

    var commonDataApi = layui.commonDataApi;

    var pageDataApi = layui.buildingDataApi;


    var SubPage = function () {

        this.id = "";
        this.entId = neatNavigator.getUrlParam("parentId");
        this.entName = neatNavigator.getUrlParam("parentName");

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
                buildingName: $.trim(formData.field.buildingName),
                parentEntId: that.entId,
                address: $.trim(formData.field.address),
                buildingType: formData.field.optBuildingType,
                archType: formData.field.optArchType,
                area: formData.field.area,
                height: formData.field.height,
                upFloorCount: formData.field.onFloorCount,
                downFloorCount: formData.field.underFloorCount

            };

            var token = neat.getUserToken();

            var tthat = that;

            pageDataApi.createBuilding(token, postData
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
            buildingName: function (value) {
                if (value.length == 0) {
                    return "请输入建筑名称";
                } else if (value.length > 64) {
                    return "建筑名称超长(最长64个字)";
                }
            },
            address: function (value) {
                if (value.length == 0) {
                    return "请输入建筑地址";
                } else if (value.length > 64) {
                    return "建筑地址超长(最长64个字)";
                }
            },
            optBuildingType: function (value) {
                if (value.length == 0) {
                    return "请选择建筑类别";
                }
            },
            optArchType: function (value) {
                if (value.length == 0) {
                    return "请选择结构类型";
                }
            },
            area: function (value) {
                if (value.length == 0) {
                    return "请输入建筑面积";
                }
                var v = parseFloat(value)
                if (isNaN(v) || v < 0 || v.toString() !== value) {
                    return "建筑面积错误";
                }
               
            },
           
            height: function (value) {
                if (value.length == 0) {
                    return "请输入建筑高度";
                }
               
                var v = parseFloat(value)

                if (isNaN(v) || v.toString() !== value) {
                    return "建筑高度错误";
                }
               
               
            },

            onFloorCount: function (value) {
                if (value.length == 0) {
                    return "请输入地上层数";
                }
                var v = parseInt(value)
                if (isNaN(v) || v < 0 || v.toString() !== value) {
                    return "地上层数错误";
                }
            },

            underFloorCount: function (value) {
                if (value.length == 0) {
                    return "请输入地下层数";
                }
                var v = parseInt(value)
                if (isNaN(v) || v < 0 || v.toString() !== value) {
                    return "地下层数错误";
                }
            }

        });
    };

    
    
    //初始化建筑类别
    SubPage.prototype._initOptBuildingType = function () {
        var that = this;
        commonDataApi.getBuildingCategoryList(neat.getUserToken(), function (resultData) {
            
            var d = {};
            d.data = resultData;
            laytpl($("#optBuildingTypeTemplate").html()).render(d, function (html) {
                var parent = $("#optBuildingType").html(html);
                form.render('select', 'optBuildingTypeForm');
            });

        });
    };

    //初始化结构类型
    SubPage.prototype._initOptArchType = function () {
        var that = this;
        commonDataApi.getBuildingStructureTypeList(neat.getUserToken(), function (resultData) {

            var d = {};
            d.data = resultData;
            laytpl($("#optArchTypeTemplate").html()).render(d, function (html) {
                var parent = $("#optArchType").html(html);
                form.render('select', 'optArchTypeForm');
            });

        });
    };

    //初始化上传控件
    SubPage.prototype.initFileUpload = function () {

        var that = this;
        var uploadUrl = neat.getDataApiBaseUrl()+"/OpenApi/Image/UploadImage?objType=3&token=" + neat.getUserToken() + "&objId="+that.id;
        
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

    //获取一个guid
    SubPage.prototype._initId = function (callback) {
        var that = this;
        commonDataApi.getGuid(neat.getUserToken(), function (resultData) {

            that.id = resultData;
            callback();

        });
    };

    //初始化
    SubPage.prototype.init = function () {

        var that = this;

        that._initId(function () {

            that.initFileUpload();
        });

        $("#orgName").val(that.entName);

        $("#btnCancel").on("click", function () {
            that._closeDialog();
        });

     
        that._initFormVerify();
        that._initFormSubmit();

        that._initOptBuildingType();
        that._initOptArchType();
        

        form.render();

    };


    exports(MODULE_NAME, new SubPage());

});