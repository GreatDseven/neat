//关联 巡检项目 的 模板
layui.define(["jquery", 'form', 'table', 'laytpl', 'laypage','layer', 'commonDataApi', 'neatDataApi', 'neat', 'neatNavigator'], function (exports) {

    "use strict";

    var $ = layui.$;
    var table = layui.table;
    var form = layui.form;
    var laytpl = layui.laytpl;
    var laypage = layui.laypage;
    var layer = layui.layer;
    var commonDataApi = layui.commonDataApi;
    var neatDataApi = layui.neatDataApi;
    var neatNavigator = layui.neatNavigator;
    var base = layui.neat;


    var SubPage = function () {

        this.projectType = '';
        this.projectSubType = '';
        this.status = '0';


        
        this.domainId = neatNavigator.getUrlParam("domainId");
        this.enterpriseId = neatNavigator.getUrlParam("enterpriseId");

    };

    SubPage.prototype.init = function () {
        var that = this;

        // 初始化表定义
        this.initTable();

        //按钮事件
        that.initButtonEvent();

        // 初始化监听事件
        this.initEventInfo();

        // 填充项目类型下拉框
        this.initProjectType();

        //填充子类型下拉框
        this.bindProjectSubType();


        // 加载列表数据
        this.bindTable();

       
    };

    //绑定主表数据
    SubPage.prototype.bindTable = function () {
        var that = this;
        var loadingIndex = layer.load(1);

        that.getProjectList(function (result) {
            that.reloadTable(result);

            layer.close(loadingIndex);
        }, function () {
            layui.layer.close(loadingIndex);
        });
    };

    //按钮事件
    SubPage.prototype.initButtonEvent = function () {
        var that = this;

        // 底部的保存按钮事件
        $('#btnSave').on('click', function () {
            that.saveData();
        });

        // 搜索事件
        $('#btnSearch').on('click', function () {
            that.bindTable();
        });
        //关闭按钮事件
        $("#btnCancel").on("click", function () {
            that.closeDialog();
        });
    };

    //保存数据
    SubPage.prototype.saveData = function () {

        var that = this;
        var checkStatus = table.checkStatus('resultTable');
        var data = checkStatus.data;

        //if (data.length == 0) {
        //    layer.msg("请勾选模板数据!");
        //    return;
        //}

        //这里调用 保存接口        
        var url = "/OpenApi/OsiTmpl/AddDomainItemMap/?token=" + base.getUserToken();

        //最终发送的全部id
        var notSelectedIds = [];
        //最终发送的已经选择的id
        var selectedIds = [];


        var allData = table.cache["resultTable"];
        layui.each(allData, function (_, item) {

            var currentChecked = item["LAY_CHECKED"] ? true : false;
            var oriChecked = item.status === 2;

            if (currentChecked === oriChecked) {
                //状态没有变化,原来没选,现在也没选 或者 原来选中,现在也选中
                return;
            }

            if (currentChecked) { //原来没选中,变成 现在选中,
                selectedIds.push(item.itemId);
            }
            else { //原来选中的,变成 现在没有选中
                notSelectedIds.push(item.itemId);
            }
        });

        if (selectedIds.length === 0 && notSelectedIds === 0) {
            return;
        }

        //发送的数据
        var data = {
            domainId: this.domainId,
            selectedIds: selectedIds,
            notSelectedIds: notSelectedIds

        };


        layui.neatDataApi.sendPostJson(url, data, function () {

            layer.msg("保存成功!", function () {
                that.closeDialog();
            });
        });
        
    };

    

    // 初始化 项目类型
    SubPage.prototype.initProjectType = function () {
        // 获取 选中左侧导航栏的相关数据
        commonDataApi.getProjectType('', base.getUserToken(), this.domainId, this.enterpriseId, function (result) {
            var resultData = {};
            resultData.data = result;

            laytpl($('#optProjectTypeTemplate').html()).render(resultData, function (html) {
               $("#projectType").html(html);
            });

            // 刷新下表单
            form.render('select', "first");
        });
    };

    //绑定项目子类型数据
    SubPage.prototype.bindProjectSubType = function () {
        // 获取 选中左侧导航栏的相关数据
        // 获取 选中左侧导航栏的相关数据
        var that = this;
        commonDataApi.getParentDomainSubTypeList(base.getUserToken(), this.domainId, this.projectType, function (result) {
            var resultData = {};
            resultData.data = result;
            laytpl($('#optProjectSubTypeTemplate').html()).render(resultData, function (html) {
               $("#projectSubType").html(html);
            });

            // 刷新表单
            form.render(null, "first");
        });
    };


    // 关闭当前对话框
    SubPage.prototype.closeDialog = function () {
        var index = parent.layer.getFrameIndex(window.name);
        parent.layer.close(index);
    };

    // 加载 巡检项目列表，并监听相关的表格事件
    SubPage.prototype.initTable = function (data) {
        var that = this;

        // 渲染 项目类型列表
        table.render({
            elem: '#resultTable'
             , page: {
                 hash: false,
                 layout: ['count'  /*, 'prev', 'page', 'next'*/],
             }
            , height: 500
            , autoSort: false
            , loading: true
            , limit: 99999999999
            , data: []
            , cols: [[

              { type: 'checkbox', fixed: 'left', width: 100 }
            , { field: 'itemName', title: '巡检项目名称', width: 250 }
            , { field: 'description', title: '项目描述', width: 300 }
            , { field: 'subTypeName', title: '项目子类型', width: 200 }
            , { field: 'typeName', title: '项目类型', width: 200 }
            , { field: 'domainName', title: '所属中心', width: 250 }
            ]]

        });
    };

    // 初始化监听事件（from和table）
    SubPage.prototype.initEventInfo = function () {
        var that = this;

        // 项目类型选中改变
        form.on('select(projectType)', function (data) {
            // 获取选中的项目类型
            that.projectType = data.value
            that.bindProjectSubType();
        });
        //项目子类型选中改变
        form.on('select(projectSubType)', function (data) {
            // 获取选中的项目子类型
            that.projectSubType = data.value

        });
        

        // 当前状态改变
        form.on('select(optStatus)', function (data) {
            // 获取选中的项目类型
            that.status = data.value
        });

        //// 监听排序列
        //table.on('sort(resultTable)', function (obj) {
        //    that.orderByCol = obj.field;
        //    that.orderSort = obj.type;

        //    //调用接口绑定数据
            
        //});
    };



    // 重新加载列表
    SubPage.prototype.reloadTable = function (result) {
        var that = this;

        //把已经关联的设置为勾选
        layui.each(result, function (_, item) {
            if (item.status === 2) {
                item.LAY_CHECKED = true;
            }
        });

        table.reload("resultTable", {
            data: result,
        });
        
    }

    // 加载项目列表
    SubPage.prototype.getProjectList = function (callback,failcallback) {
        var that = this;
        var url = "/OpenApi/OsiTmpl/GetItemList";
       

        var data = {
            token: base.getUserToken(),
            domainId: this.domainId,
            itemName: $.trim($("#projectName").val()),
            typeId: that.projectType,
            subTypeId: that.projectSubType,
            status: that.status,

        };

        layui.neatDataApi.sendGet(url, data, callback, failcallback);
    };



    exports("mapProjectTemplateDialog", new SubPage());
});