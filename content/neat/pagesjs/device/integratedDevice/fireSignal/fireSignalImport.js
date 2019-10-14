//添加平面图页面


layui.define(['jquery', 'layer', 'form', 'element', 'upload', 'neat', 'neatNavigator', 'neatValidators'], function (exports) {



    "use strict";
    var $ = layui.$;
    var MODULE_NAME = "pageIntegratedFireSignalImport";

    var form = layui.form;
    var laytpl = layui.laytpl;

    var layer = layui.layer;

    var base = layui.neat;

    var neatNavigator = layui.neatNavigator;

    var commonDataApi = layui.commonDataApi;

    var pageDataApi = layui.imageDataApi;

    var upload = layui.upload;



    var SubPage = function () {
        uitd_id: "";
        host_code: "";
    };

    //初始化
    SubPage.prototype.init = function () {
        var that = this;
        that.host_id = neatNavigator.getUrlParam("host_id");
        that.uitd_id = neatNavigator.getUrlParam("uitd_id");

        that.initFileUpload();
        that.initVerify();

        form.render();
    };

    //关闭对话框
    SubPage.prototype.closeDialog = function () {
        var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
        parent.layer.close(index); //再执行关闭
    };

    SubPage.prototype.initVerify = function () {
        var that = this;
        //自定义验证规则
        form.verify({
            txtFile: function (value) {
                if (value.length === 0) {
                    return "请选择文件";
                }
            }
        });
    };

    SubPage.prototype.initFileUpload = function () {
        var that = this;

        var url = base.getDataApiBaseUrl() + "/OpenApi/FireUITD/BathImportFireSignal/?token=" + base.getUserToken();
        //选完文件后不自动上传
        upload.render({
            elem: '#btnBrowse'
            , url: url
            , auto: false
            , multiple: false
            , accept: 'file' //普通文件
            , exts: 'xls' //只允许上传这些文件类型
            , bindAction: '#btnUpload'
            , data: {
                uitd_id: function () {
                    return encodeURIComponent(that.uitd_id);
                },
                host_id: function () {
                    return encodeURIComponent(that.host_id);
                },
            }
            , choose: function (obj) {
                //将每次选择的文件追加到文件队列
                //var files = obj.pushFile();

                //预读本地文件，如果是多文件，则会遍历。(不支持ie8/9)
                obj.preview(function (index, file, result) {
                    //console.log(index); //得到文件索引
                    //console.log(file); //得到文件对象
                    //console.log(result); //得到文件base64编码，比如图片

                    $("#txtFile").val(file.name);

                    //obj.resetFile(index, file, '123.jpg'); //重命名文件名，layui 2.3.0 开始新增

                    //这里还可以做一些 append 文件列表 DOM 的操作

                    //obj.upload(index, file); //对上传失败的单个文件重新上传，一般在某个事件中使用
                    // delete files[index]; //删除列表中对应的文件，一般在某个事件中使用
                });
            }
            , done: function (res) {

                //console.log(res);
                /*
                code: 200
                message: "事件处理成功"
                result: "2f328212-b00e-457e-b08c-47b2ca47e8ab"
                */

                if (res.code == 200) {

                    if (res.result.failData.length > 0) {
                        var msgContent = '<div style="padding: 20px; color: #fff; font-weight: 300;">' + "<h3>导入成功【" + res.result.success + "】条数据</h3><br/>";
                        msgContent += "<h3>未导入数据具体信息如下：</h3></br>";

                        $(res.result.failData).each(function (index, item) {
                            msgContent += "<p>" + item + "</p><br/>";
                        });

                        msgContent += "</div>";
                        layui.neatWindowManager.openLayerInRootWindow({
                            resize: false,
                            type: 1,
                            title: '导入完成提示',
                            area: ["700px", "400px"],
                            btn: ['确定'],
                            content: '<div style="padding: 20px; color: #fff; font-weight: 300;">' + msgContent + "</div>",
                            end: function () {
                                // 重新绑定数据   
                                that.closeDialog();
                            }
                        });
                    } else {
                        layer.msg("导入成功!", { time: 1500 }, function () {
                            that.closeDialog();
                        });
                    }
                }
                else {
                    layer.msg("导入失败,错误信息如下:" + res.message, { time: 1500 });
                    return;
                }

            }, error: function () {
                $("#btnSave").attr("disabled", false);
                layer.msg("文件上传失败");
            }
        });

    };

    exports(MODULE_NAME, new SubPage());

});