//logo自定义上传界面

layui.define(['jquery', 'form', 'upload', 'element','layer', 'neat', 'neatNavigator'], function (exports) {
    "use strict";

    var MODULE_NAME = "pageLogoUploader";

    var $ = layui.jquery;
    var neat = layui.neat;
    var neatNavigator = layui.neatNavigator;
    var upload = layui.upload;

    var layer = layui.layer;


    var LogoUploader = function () {

    };


    LogoUploader.prototype.init = function () {



        this.objId = neatNavigator.getUrlParam("obj_id");
        this.objType = neatNavigator.getUrlParam("obj_type");

        this.uploadUrl = neat.getDataApiBaseUrl() + "/OpenApi/Image/UploadImage?objType=" + this.objType + "&token=" + neat.getUserToken() + "&objId=" + this.objId;


        this.initUpload();

    };

    LogoUploader.prototype.initUpload = function () {

        var that = this;

        //普通图片上传
        var uploadInst = upload.render({
            elem: '#logoUploader'
            , url: that.uploadUrl
            , accept: "images"
            , acceptMime: "image/jpg, image/png"
            , exts: "jpg|png"
            , auto: false
            , choose: function (obj) {
                //将每次选择的文件追加到文件队列
                

                //预读本地文件，如果是多文件，则会遍历。(不支持ie8/9)
                obj.preview(function (index, file, result) {


                    //console.log(index); //得到文件索引
                    //console.log(file); //得到文件对象
                    //console.log(result); //得到文件base64编码，比如图片

                    //obj.resetFile(index, file, '123.jpg'); //重命名文件名，layui 2.3.0 开始新增

                    //这里还可以做一些 append 文件列表 DOM 的操作

                    //obj.upload(index, file); //对上传失败的单个文件重新上传，一般在某个事件中使用
                    //delete files[index]; //删除列表中对应的文件，一般在某个事件中使用

                    var image = new Image();
                    image.onload = function () {


                        var width = image.width;
                        var height = image.height;
                        if (width != 420 || height != 60) {
                            layer.msg("文件尺寸不符合要求:宽度:420像素,高度60像素");
                        } else {
                            obj.upload(index, file);
                        }
                    };
                    image.src = result;

                });
            }
            , before: function (obj) {

                window.UploadResult = "";

                //预读本地文件示例，不支持ie8
                obj.preview(function (index, file, result) {
                    $('#imgPreview').attr('src', result); //图片链接（base64）
                    
                });
            }
            ,done: function (res) {
                //上传失败

                //code: 401
                //message: "【1】:值“btnUpload”对于 Guid 无效；"
                //result: false

                //上传成功
                //code: 200
                //message: "ok"
                //result: Array(1)
                //    0: "ae1e275b-2fdc-40ce-b725-93b431989679"

                if (res.code == 200 && res.result.length > 0) {
                    window.UploadResult = res.result[0];
                }
                else {
                    layer.msg("上传失败,请重试!");
                }

              
                
            }
            , error: function () {
                window.UploadResult = "";
            }
        });
    };


    var instance = new LogoUploader();

    //暴露接口
    exports(MODULE_NAME, instance);
});