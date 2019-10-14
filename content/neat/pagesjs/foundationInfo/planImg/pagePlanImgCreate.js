//添加平面图页面


layui.define(['jquery', 'layer', 'form', 'laytpl', 'element', 'table', 'upload', 'neat', 'imageDataApi', 'neatNavigator', 'commonDataApi', 'neatValidators'], function (exports) {



    "use strict";
    var $ = layui.$;
    var MODULE_NAME = "pagePlanImgCreate";

    var form = layui.form;
    var laytpl = layui.laytpl;

    var layer = layui.layer;

    var neat = layui.neat;

    var neatNavigator = layui.neatNavigator;

    var commonDataApi = layui.commonDataApi;

    var pageDataApi = layui.imageDataApi;

    var upload = layui.upload;



    var SubPage = function () {


        this.enterpriseId = "";
        this.optBuildingId = "";
        this.optKeyPartId = "";
    };

    //初始化
    SubPage.prototype.init = function () {

        var that = this;

        this.enterpriseId = neatNavigator.getUrlParam("enterprise_id");

        this.enterpriseName = neatNavigator.getUrlParam("enterprise_name");

        $("#txtEnterpriseName").val(this.enterpriseName);

        this.generateImgName();

        //建筑
        this.initBuildingList();
        //部位
        this.initKeyPartList();


        $("#btnCancel").on("click", function () {
            that.closeDialog();
        });

        this.initFileUpload();

        this.initVerify();

        this.initSave();

        form.render();

    };


    SubPage.prototype.generateImgName = function () {

        var entName = $.trim(this.enterpriseName);
        var building = $("#optBuilding  option:selected");
        var keypart = $("#optKeyPartList  option:selected");

        var name = entName;

        if (building.val()) {
            name = name + "-" + $.trim(building.text());
        }
        if (keypart.val()) {
            name = name + "-" + $.trim(keypart.text());
        }

        name = name + "-平面图";
        $("#txtName").val(name);
    };


    //关闭对话框
    SubPage.prototype.closeDialog = function () {
        var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
        parent.layer.close(index); //再执行关闭
    };



    //初始化建筑列表
    SubPage.prototype.initBuildingList = function () {

        var that = this;

        form.on('select(optBuilding)', function (data) {
            //console.log(data.elem); //得到select原始DOM对象
            //console.log(data.value); //得到被选中的值
            //console.log(data.othis); //得到美化后的DOM对象

            that.optBuildingId = data.value;
            that.bindKeyPartList();
            that.generateImgName();

        });
        that.bindBuildingList();
    };

    //绑定建筑列表
    SubPage.prototype.bindBuildingList = function () {

        var that = this;

        if (that.optEntId === "") {
            that.fillBuildingList([]);
        }
        else {

            //根据企业的id获取建筑列表,然后绑定到select中.
            commonDataApi.getBuildingByEntId(neat.getUserToken(), that.enterpriseId, function (resultData) {
                that.fillBuildingList(resultData);
            });
        }
    };

    //为建筑物列表填充数据
    SubPage.prototype.fillBuildingList = function (data) {
        var d = {};
        d.data = data;
        laytpl($("#optBuildingTemplate").html()).render(d, function (html) {
            var parent = $("#optBuilding").html(html);
            form.render('select', 'optBuildingForm');
        });
    };
    //初始化部位列表
    SubPage.prototype.initKeyPartList = function () {
        var that = this;

        form.on('select(optKeyPartList)', function (data) {
            //console.log(data.elem); //得到select原始DOM对象
            //console.log(data.value); //得到被选中的值
            //console.log(data.othis); //得到美化后的DOM对象
            that.optKeyPartId = data.value;
            that.generateImgName();
        });
    };

    //绑定关键部位列表
    SubPage.prototype.bindKeyPartList = function () {

        var that = this;

        if (that.optBuildingId === "") {
            that.fillKeyPartList([]);
        }
        else {

            //根据企业的id获取建筑列表,然后绑定到select中.
            commonDataApi.getKeypartByBuildingId(neat.getUserToken(), that.optBuildingId, function (resultData) {
                that.fillKeyPartList(resultData);
            });
        }
    };
    //向部位列表中填充数据
    SubPage.prototype.fillKeyPartList = function (data) {
        var that = this;
        var d = {};
        d.data = data;
        laytpl($("#optKeyPartListTemplate").html()).render(d, function (html) {
            var parent = $("#optKeyPartList").html(html);
            form.render('select', 'optKeyPartListForm');
        });
    };



    SubPage.prototype.initVerify = function () {
        var that = this;
        //自定义验证规则
        form.verify({
          

            txtName: function (value) {
                if (value.length === 0) {
                    return "请输入名称";
                }
               
            },
            txtFile: function (value) {
                if (value.length === 0) {
                    return "请选择文件";
                } 
            }

           
        });
    };

    

    SubPage.prototype.initSave = function () {

        var that = this;

        form.on('submit(btnSave)', function (formData) {

            //上传文件
            $("#btnUpload").click();

            $("#btnSave").attr("disabled", true);

            
            return false;
        });
    };


    SubPage.prototype.initFileUpload = function () {
        var that = this;
        //选完文件后不自动上传
        upload.render({
            elem: '#btnBrowse'
            , url: neat.getDataApiBaseUrl() + '/OpenApi/Plan/AddPlan/?token=' + neat.getUserToken()
            , auto: false
            , multiple: false
            , accept: 'images' //普通文件
            , exts: 'jpg|png|bmp|jpeg|gif' //只允许上传这些文件类型
            , bindAction: '#btnUpload'
            , data: {
                PlanName: function () {
                    return $.trim($("#txtName").val());
                },
                EnterpriseId: function () {
                    return that.enterpriseId;
                },
                BuildingId: function () {
                    return $("#optBuilding").val();
                },
                KeypartId: function () {
                    return $("#optKeyPartList").val();
                }

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
                    layer.msg("保存成功!", { time: 1500 }, function () {

                        that.closeDialog();

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

    //SubPage.prototype.savePlanImgInfo = function (imgId) {

    //    var data = {
    //        name: $.trim($("#txtName").val()),
    //        enterpriseId: that.enterpriseId,
    //        buildingId: $("#optBuilding").val(),
    //        keypartId: $("#optKeyPartList").val(),
    //        ImgId: imgId
    //    };

    //    var token = neat.getUserToken();

    //    pageDataApi.createPlanImg(token, data
    //        , function (sd) {


    //            layer.msg("保存成功!", { time: 1500 }, function () {

    //                that.closeDialog();

    //            });
    //        }, function (fd) {

    //            $("#btnSave").attr("disabled", false);

    //            if (typeof fd.message === "string") {
    //                layer.msg(fd.message);
    //            }
    //            else {
    //                layer.msg("保存失败!");
    //            }
    //        });

    //};

   




    exports(MODULE_NAME, new SubPage());

});