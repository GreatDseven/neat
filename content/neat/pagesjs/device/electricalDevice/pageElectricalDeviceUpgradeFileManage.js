//智慧用电网关 升级版本文件 管理


layui.define(['jquery', 'layer', 'form', 'laytpl', 'element', 'table','upload', 'neat', 'neatDataApi', 'electricalDeviceDataApi', 'neatNavigator', 'commonDataApi', 'neatValidators'], function (exports) {



    "use strict";
    var $ = layui.$;
    var MODULE_NAME = "pageElectricalDeviceUpgradeFileManage";

    var form = layui.form;
    var laytpl = layui.laytpl;

    var layer = layui.layer;

    var neat = layui.neat;

    var table = layui.table;

    var neatDataApi = layui.neatDataApi;

    var neatNavigator = layui.neatNavigator;

    var commonDataApi = layui.commonDataApi;

    var pageDataApi = layui.electricalDeviceDataApi;

    var validators = layui.neatValidators;

    var upload = layui.upload;

    // 返回的数据包含的属性
    var dataPropertyNames = {
        id: "id",
        version: "version",
        addTime: "datetime"

    };


    var SubPage = function () {

        this.fileList = [];

    };

    //初始化
    SubPage.prototype.init = function () {

        var that = this;

        //初始化已有升级文件列表
        this.initUpdateFileList();

        //初始化上传控件
        this.initFileUpload();

        form.render();

    };

    // 初始化 升级文件列表
    SubPage.prototype.initUpdateFileList = function () {
        var that = this;

        pageDataApi.getUpdateFileList(neat.getUserToken()
            , function (result) {

                that.fileList = result;

                that.renderTable();

            }, function (failData) {

                layer.msg(failData.message, function () {

                    that.closeDialog();
                });

            });
    };


    // 渲染 升级文件列表
    SubPage.prototype.renderTable = function () {

        var that = this;

        var tmpl = '{{#  layui.each(d.data, function(index, item){}}'
            + '  <tr>'
            //      版本名称
            + '     <td><span class="verion-name">{{ item.' + dataPropertyNames.version + ' }}</span></td>'
            //      添加时间
            + '     <td style="text-align:center;"><span class="add-time">{{ item.' + dataPropertyNames.addTime + '}}</span></td>'
            //      操作列
            + '     <td style="text-align:center;"><i data-file-version="{{item.' + dataPropertyNames.version+'}}"  data-file-id="{{item.' + dataPropertyNames.id + '}}" class="fas fa-trash-alt update-file"><i></td>'
            + '  </tr>'
            + '{{#  }); }}';

        var d = {};
        d.data = this.fileList;


        laytpl(tmpl).render(d, function (html) {
            $("#resultTable").html(html);
            $("#resultTable").find(".update-file")
                .on("click", function () {
                    var fileId = $(this).data("file-id");
                    var fileVersion = $(this).data("file-version");

                    layer.confirm("确定要删除版本升级文件:" + fileVersion + "?", function () { 
                        
                        pageDataApi.deleteUpdateFile(neat.getUserToken(), fileId
                            , function () {
                                layer.msg("删除版本升级文件成功!", function () {
                                    that.initUpdateFileList();
                                });
                            }
                            , function (fd) {
                                if (typeof fd.message === "string") {
                                    layer.msg(fd.message);
                                }
                                else {
                                    layer.msg("版本升级文件失败!");
                                }
                            });
                    });
                    
                   
                });
        });

    };

    //初始化文件上传
    SubPage.prototype.initFileUpload = function () {
        var that = this;

        //btnAddFile按钮做上传前的校验,btnAddFileImple才是真正的上传控件
        $("#btnAddFile").on("click", function () {

            var nameTxt = $.trim($("#txtSoftwareVersion").val());
            if (nameTxt == "") {
               
                layer.msg("请填写版本名称!");
                $("#txtSoftwareVersion").select().focus();

                return;
            }
            var reg = /NT8126[a-zA-Z]{0,1}\-[Vv][0-9]{1,2}\.[0-9]{1,3}(\-[a-zA-Z0-9]{1,3})*/g;

            if (reg.test(nameTxt) == false) {
                layer.msg("版本名称错误!");
                $("#txtSoftwareVersion").select().focus();
                return;
            }

            $("#btnAddFileImple").click();

        });

        //选完文件后自动上传
        upload.render({
            elem: '#btnAddFileImple'
            , url: neat.getDataApiBaseUrl() + '/OpenApi/ElectricUpgradeFile/Put/?token=' + neat.getUserToken()
            , auto: true
            , multiple: false
            , accept: 'file' //普通文件
            , exts: 'bin' //只允许上传这些文件类型
            , data: {
                version: function () {
                    return $.trim($("#txtSoftwareVersion").val());
                }
            }
          
            , done: function (res) {
                //console.log(res);
                /*
                code: 200
                message: "事件处理成功"
                result: "2f328212-b00e-457e-b08c-47b2ca47e8ab"
                */


                if (res.code == 200) {
                    layer.msg("保存成功!", { time: 1500 }, function () {

                        that.initUpdateFileList();

                    });
                }
                else {
                    layer.msg("保存失败,错误信息如下:" + res.message, { time: 1500 });
                    return;
                }

            }, error: function () {
                $("#btnSave").attr("disabled", false);
                layer.msg("文件上传失败");
            }
        });

    };


    //关闭对话框
    SubPage.prototype.closeDialog = function () {
        var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
        parent.layer.close(index); //再执行关闭
    };


    exports(MODULE_NAME, new SubPage());

});