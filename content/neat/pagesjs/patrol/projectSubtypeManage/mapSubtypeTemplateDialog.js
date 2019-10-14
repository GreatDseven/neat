//关联 子类型 模板
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
        this.status = '0';

        this.orderByCol = '';
        this.orderSort = 'desc';
        
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

        // 加载列表数据
        this.bindTable();

       
    };

    //绑定主表数据
    SubPage.prototype.bindTable = function () {
        var that = this;
        var loadingIndex = layer.load(1);

        that.getProjectSubTypeList(function (result) {
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

        //这里调用 保存接口     
        var that = this;

        //if (data.length == 0) {
        //    layer.msg("请勾选模板数据!");
        //    return;
        //}

        //最终发送的全部id
        var notSelectedIds = [];
        //最终发送的已经选择的id
        var selectedIds = [];



        var allData = table.cache["resultTable"];
        layui.each(allData, function (_, item) {
            
            var currentChecked= item["LAY_CHECKED"]?true:false;
            var oriChecked = item.status ===2;

            if(currentChecked === oriChecked)
            {
                //状态没有变化,原来没选,现在也没选 或者 原来选中,现在也选中
                return;
            }

            if (currentChecked) { //原来没选中,变成 现在选中,
                selectedIds.push(item.subTypeId);
            }
            else { //原来选中的,变成 现在没有选中
                notSelectedIds.push(item.subTypeId);
            }
        });

        if (selectedIds.length === 0 && notSelectedIds.length === 0) {
            return;
        }

        //发送的数据
        var data = {
            domainId: this.domainId,
            selectedIds: selectedIds,
            notSelectedIds: notSelectedIds

        };
          
        var url = "/OpenApi/OsiTmpl/AddDomainSubTypeMap/?token=" + base.getUserToken();

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
            , height:500
            , autoSort: false
            , loading:true
            , limit: 99999999999
            , data: []
            , cols: [[

              { type: 'checkbox', fixed: 'left', width: 100 }
            , { field: 'subTypeName', title: '项目子类型名称', width: 350 }
            , { field: 'typeName', title: '项目类型名称', width: 350 }
            , { field: 'domainName', title: '所属中心', width: 300 }
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

    // 加载项目子类型列表
    SubPage.prototype.getProjectSubTypeList = function (callback,failcallback) {
        var that = this;
        var url = "/OpenApi/OsiTmpl/GetSubTypeList";
       

        var data = {
            token: base.getUserToken(),
            domainId: this.domainId,
            subTypeName: $.trim($("#projectTypeName").val()),
            typeId: that.projectType,
            status: that.status,

        };

        layui.neatDataApi.sendGet(url, data, callback, failcallback);
    };



    exports("mapSubtypeTemplateDialog", new SubPage());
});