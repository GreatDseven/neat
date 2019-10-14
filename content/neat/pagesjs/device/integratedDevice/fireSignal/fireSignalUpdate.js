//修改 消防部件


layui.define(["jquery", 'form', 'table', 'laytpl', 'laypage', 'layer', 'commonDataApi', 'neatDataApi', 'neat', 'neatNavigator', 'integratedDeviceDataApi', 'neatValidators', 'neatUITools'], function (exports) {

    "use strict";

    var MODULE_NAME = "pageIntegratedFireSignalUpdate";

    var $ = layui.$;
    var table = layui.table;
    var form = layui.form;
    var laytpl = layui.laytpl;
    var laypage = layui.laypage;
    var commonDataApi = layui.commonDataApi;
    var neatDataApi = layui.neatDataApi;
    var neatNavigator = layui.neatNavigator;
    var neat = layui.neat;
    var pageDataApi = layui.integratedDeviceDataApi;
    var pageValidate = layui.neatValidators;
    var uiTools = layui.neatUITools;

    var SubPage = function () {
        this.uitdCode = "";
        this.hostCode = "";
        this.hostId = "";
        this.id = "";
        this.detailObj = {};
    };

    var dataPropertyNames = {
        id: "id",
        code: "code",
        name: "name",
        category: "category",
        address:"address",
        deviceID:"deviceID",
        systemCode:"systemCode",

    };

    // 初始化数据及事件
    SubPage.prototype.init = function () {
        var that = this;

        that.id = neatNavigator.getUrlParam("id");

        that.uitdCode = neatNavigator.getUrlParam("uitd_code");
        that.hostCode = neatNavigator.getUrlParam("host_code");

        that.hostId = neatNavigator.getUrlParam("host_id");

        $("#txtUITDCode").val(that.uitdCode);
        $("#txtHostCode").val(that.hostCode);


        this.getDetailData();

        // 初始化form 事件
        that.initForm();
        //自动格式化地址码
        uiTools.initAutoFormatAddressCode("txtCode");

        $('#btnCancel').click(function () {
            that.closeDialog();
        });

        // 刷新form
        form.render();

        $("#txtCode").focus();
    };




    SubPage.prototype.getDetailData = function () {

        var that = this;

        var loadingIndex = layer.load(1);

        pageDataApi.getFireSignalDetailById(neat.getUserToken(), this.id
            , function (data) {
          
                that.detailObj = data;

                $("#txtCode").val(data[dataPropertyNames.code]);
                $("#txtName").val(data[dataPropertyNames.name]);
                $("#txtAddr").val(data[dataPropertyNames.address]);

                that.bindCategory();

                layer.close(loadingIndex);


            }
            , function () {
                layer.close(loadingIndex);
            })
    };


    // 实例化表单 （包含表单验证及提交）
    SubPage.prototype.initForm = function () {
        var that = this;
        // 表单验证 value：表单的值、item：表单的DOM对象
        form.verify({
            txtCode: function (value) {
                if (value.length == 0) {
                    return "请输入器件编码";
                }
                var errorMsg = pageValidate.validateDecCode4(value);
                if (errorMsg.length > 0) {
                    return errorMsg;
                }

            }, txtName: function (value) {
                if (value.length == 0) {
                    return "请输入器件名称";
                }

            }, optCategory: function (value) {
                if (value.length == 0) {
                    return "请选择器件类别";
                }

            }, txtAddr: function (value) {
                if (value.length == 0) {
                    return "请输入安装位置";
                }
            }
        });

        form.on('submit(btnSave)', function (data) {
            //console.log(data.elem) //被执行事件的元素DOM对象，一般为button对象
            //console.log(data.form) //被执行提交的form对象，一般在存在form标签时才会返回
            //console.log(data.field) //当前容器的全部表单字段，名值对形式：{name: value}

            $("#btnSave").attr("disabled", true);

            var obj =
            {
                id:that.id,
                name: $.trim(data.field.txtName),
                code: $.trim(data.field.txtCode),
                category: data.field.optCategory,
                address: data.field.txtAddr,
                deviceID:that.detailObj[dataPropertyNames.deviceID],
                hostID:that.hostId
            };


            pageDataApi.updateFireSignal(neat.getUserToken(), obj, function (result) {
                layer.msg("修改成功!", { time: 1500 }, function () {

                    $("#btnSave").attr("disabled", false);
                    that.closeDialog();
                });
            }, function (result) {
                

                    if (typeof fd.message === "string") {
                        layer.msg(fd.message);
                    }
                    else {
                        layer.msg("修改失败!");
                    }
                
            });

            return false; //阻止表单跳转。如果需要表单跳转，去掉这段即可。
        });
    };


    // 绑定 消防器件的 类别
    SubPage.prototype.bindCategory = function () {
        var that = this;
        pageDataApi.getFireSignalCategoryData(neat.getUserToken(), function (result) {
            var d = {}
            d.data = result;
            d.selectedValue = that.detailObj[dataPropertyNames.category];

            laytpl($("#optCategoryTemplate").html()).render(d, function (html) {
                var parent = $("#optCategory").html(html);
                form.render('select', 'optCategoryForm');
            });
        });
    };



    //关闭对话框
    SubPage.prototype.closeDialog = function () {
        var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
        parent.layer.close(index); //再执行关闭
    };

    exports(MODULE_NAME, new SubPage());
}); 