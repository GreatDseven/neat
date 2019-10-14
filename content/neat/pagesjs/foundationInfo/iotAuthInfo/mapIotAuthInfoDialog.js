//关联 巡检项目 的 模板
layui.define(["jquery", 'form', 'table', 'laytpl', 'laypage', 'layer', 'commonDataApi', 'neatDataApi', 'neat', 'neatNavigator', 'iotAuthInfoDataApi', "neatUITools"], function (exports) {

    "use strict";

    var MODULE_NAME = "pageMapIotAuthInfoDialog"

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

        this.selectedIsp = '';
        this.selectedEnv = '';
        this.status = '0';

        this.domainId = "";
        this.enterpriseId = "";

    };

    SubPage.prototype.init = function () {
        var that = this;

        this.selectedIsp = '';
        this.selectedEnv = '';
        this.status = '0';

        this.domainId = neatNavigator.getUrlParam("domainId");
        this.enterpriseId = neatNavigator.getUrlParam("enterpriseId");
        this.name = neatNavigator.getUrlParam("name");

        $("#txtOrgName").val(this.name);

        // 初始化表定义
        this.initTable();


        //按钮事件
        that.initButtonEvent();


        // 加载列表数据
        this.bindTable();


    };
 

    

    //绑定主表数据
    SubPage.prototype.bindTable = function () {
        var that = this;
        var loadingIndex = layer.load(1);


        var token = neat.getUserToken();
        var keyword = $.trim($("#txtkeyWord").val());


        var orgId = !this.enterpriseId ? this.domainId : this.enterpriseId;





        pageDataApi.getOrgAuthInfoCandidateList(token, orgId, keyword, function (result) {
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


        //最终发送的全部id
        var notSelectedIds = [];
        //最终发送的已经选择的id
        var selectedIds = [];

        var allData = table.cache["resultTable"];
        layui.each(allData, function (_, item) {

            var currentChecked = item["LAY_CHECKED"] ? true : false;
            var oriChecked = item.isChecked;

            if (currentChecked === oriChecked) {
                //状态没有变化,原来没选,现在也没选 或者 原来选中,现在也选中
                return;
            }

            if (currentChecked) { //原来没选中,变成 现在选中,
                selectedIds.push(item.id);
            }
            else { //原来选中的,变成 现在没有选中
                notSelectedIds.push(item.id);
            }
        });

        if (selectedIds.length === 0 && notSelectedIds === 0) {
            return;
        }

        var orgId = "";

        var orgType = 0;
        if (!this.enterpriseId) {
            orgId = this.domainId;
            orgType = 1;
        }
        else {
            orgId = this.enterpriseId;
            orgType = 2;
        }

        //不需要保存数据
        if (selectedIds.length == 0 && notSelectedIds.length == 0) {
            layer.msg("保存成功!", function () {
                that.closeDialog();
            });
            return;
        }


        //发送的数据
        var sendData = {
            orgId: orgId,
            orgType: orgType,
            addAuthInfoIds: selectedIds,
            deleteAuthInfoIds: notSelectedIds

        };

        pageDataApi.changeOrgAuthRelation(neat.getUserToken(), sendData
            , function () {
                layer.msg("保存成功!", function () {
                    that.closeDialog();
                });
            }
            , function (fd) {
                if (typeof fd.message === "string") {
                    layer.msg(fd.message);
                }
                else {
                    layer.msg("保存失败!");
                }
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
            , height: 400
            , autoSort: false
            , loading: true
            , limit: 99999999999
            , data: []
            , cols: [[
                { type: 'checkbox', fixed: 'left' },
                { field: 'id', title: '', hide: true, },
                { field: 'name', title: '应用名称', },
                { field: 'isp', title: '运营商', templet: function (d) { return uiTools.renderISP(d.isp) } },
                { field: 'envType', title: '使用环境', templet: function (d) { return uiTools.renderRuntimeEnv(d.envType); } }
            ]]

        });
    };




    // 重新加载列表
    SubPage.prototype.reloadTable = function (result) {
        var that = this;

        //把已经关联的设置为勾选
        layui.each(result, function (_, item) {
            if (item.isChecked) {
                item.LAY_CHECKED = true;
            }
        });

        table.reload("resultTable", {
            data: result,
        });

    }





    exports(MODULE_NAME, new SubPage());
});