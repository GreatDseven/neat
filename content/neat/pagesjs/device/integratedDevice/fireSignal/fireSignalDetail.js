// 消防部件 查看


layui.define(["jquery", 'form', 'table', 'laytpl', 'laypage', 'layer', 'commonDataApi', 'neatDataApi', 'neat', 'neatNavigator', 'integratedDeviceDataApi', 'neatValidators'], function (exports) {

    "use strict";

    var MODULE_NAME = "pageIntegratedFireSignalDetail";

    var $ = layui.$;
    var table = layui.table;
    var form = layui.form;
    var laytpl = layui.laytpl;
    var laypage = layui.laypage;
    var commonDataApi = layui.commonDataApi;
    var neatDataApi = layui.neatDataApi;
    var neatNavigator = layui.neatNavigator;
    var base = layui.neat;
    var pageDataApi = layui.integratedDeviceDataApi;
    var pageValidate = layui.neatValidators;

    var SubPage = function () {
        this.uitdCode = "";
        this.hostCode = "";
        this.id = "";
        this.detailObj = {};
    };

    var dataPropertyNames = {
        id: "id",
        code: "code",
        name: "name",
        category: "category",
        address: "address",
        deviceID: "deviceID",
        systemCode: "systemCode",
    };

    // 初始化数据及事件
    SubPage.prototype.init = function () {
        var that = this;

        that.id = neatNavigator.getUrlParam("id");

        that.uitdCode = neatNavigator.getUrlParam("uitd_code");
        that.hostCode = neatNavigator.getUrlParam("host_code");

        $("#txtUITDCode").val(that.uitdCode);
        $("#txtHostCode").val(that.hostCode);

        this.getDetailData();

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


   


    // 绑定 消防器件的 类别
    SubPage.prototype.bindCategory = function () {
        var that = this;
        pageDataApi.getFireSignalCategoryData(base.getUserToken(), function (result) {
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