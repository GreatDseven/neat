//应用关联的机构列表
layui.define(["jquery", 'form', 'table', 'laytpl', 'laypage', 'layer', 'commonDataApi', 'neatDataApi', 'neat', 'neatNavigator', 'iotAuthInfoDataApi', "neatUITools"], function (exports) {
   
    "use strict";

    var MODULE_NAME = "pageQueryRelatedOrgListDialog"

    
    var $ = layui.$;
    var table = layui.table;
    var form = layui.form;
    var laytpl = layui.laytpl;
    var laypage = layui.laypage;
    var layer = layui.layer;
    var commonDataApi = layui.commonDataApi;
    var neatDataApi = layui.neatDataApi;
    var neatNavigator = layui.neatNavigator;
    var neat = layui.neat;
    var pageDataApi = layui.iotAuthInfoDataApi;
    var uiTools = layui.neatUITools;


    var SubPage = function () {



    };

    SubPage.prototype.init = function () {

        var that = this;

        this.id = neatNavigator.getUrlParam("id");

        this.initAuthInfoDetail();

       
        // 初始化表定义
        this.initTable();


        //按钮事件
        that.initButtonEvent();


        // 加载列表数据
        this.bindTable();


    };

    // 初始化 应用详情
    SubPage.prototype.initAuthInfoDetail = function () {

        pageDataApi.getAuthInfoById(neat.getUserToken(), this.id, function (result) {
            
            $("#txtName").val(result.name);
            $("#txtISP").val(uiTools.renderISP(result.isp));
            $("#txtEnvType").val(uiTools.renderRuntimeEnv(result.envType));
            $("#txtModelType").val(result.modelTypeName);
            
            
        }, function () {
            layui.layer.close(loadingIndex);
        });
    };

    

 

    

    //初始化 应用关联机构的列表
    SubPage.prototype.bindTable = function () {
        var that = this;
        var loadingIndex = layer.load(1);

        var token = neat.getUserToken();


        pageDataApi.getAuthInfoRelatedOrgList(token, this.id,  function (result) {
            table.reload("resultTable", {
                data: result,
            });

            layer.close(loadingIndex);
        }, function () {
            layui.layer.close(loadingIndex);
        });
    };

    //按钮事件
    SubPage.prototype.initButtonEvent = function () {
        var that = this;

        //关闭按钮事件
        $("#btnCancel").on("click", function () {
            that.closeDialog();
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
            , height: 320
            , autoSort: false
            , loading: true
            , limit: 99999999999
            , data: []
            , cols: [[
                { field: 'id', title: '', hide: true },
                { field: 'orgName', title: '机构名称' },
                { field: 'orgType', title: '机构类别', templet: function (d) { return uiTools.renderOrgType(d.orgType); } }
              
            ]]

        });
    };



    exports(MODULE_NAME, new SubPage());
});