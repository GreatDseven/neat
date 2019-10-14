//巡检隐患管理


layui.define(["jquery", 'form', 'table', 'laytpl', 'laypage','layer', 'commonDataApi', 'neatDataApi', 'neat', 'neatNavigator'], function (exports) {


    "use strict";

    var $ = layui.$;
    var table = layui.table;
    var form = layui.form;
    var laytpl = layui.laytpl;
    var laypage = layui.laypage;
    var commonDataApi = layui.commonDataApi;
    var neatDataApi = layui.neatDataApi;
    var neatNavigator = layui.neatNavigator;
    var base = layui.neat;

    var limitCount = 16;

    var SubPage = function () {
        this.hiddenStatus = '';
        this.enterpriseId = '';

        this.currentPageIndex = 1;
        this.currentPageSize = limitCount;
        this.orderByCol = 'upTime';
        this.orderSort = 'desc';


    };

    SubPage.prototype.initDefaultValues = function () {
        this.hiddenStatus = '';
        this.enterpriseId = '';

        this.currentPageIndex = 1;
        this.currentPageSize = limitCount;
        this.orderByCol = 'upTime';
        this.orderSort = 'desc';
      

    };

    SubPage.prototype.init = function () {

        var that = this;

        this.initDefaultValues();

        that.hiddenStatus = 0;
        $(window).on("hashchange", function () {
            that.loadEnterprise();
            that.bindTable();
        });



        // 加载状态
        that.loadHiddenDangerStatus();

        // 加载单位列表
        that.loadEnterprise();

        // 实例化表格
        that.initTable();

        //初始化分页
        that.initPage();

        // 初始化监听事件
        that.initEventInfo();

        // 加载数据
        that.bindTable();

        // 查询事件
        $('#btnSearch').on('click', function () {
            that.currentPageIndex = 1;
            that.bindTable();
        });
    };

    SubPage.prototype.bindTable = function () {

        var that = this;
        var loadingIndex = layui.layer.load(1);

        that.loadHiddenData(function (result) {
            that.reloadTable(result);
            layui.layer.close(loadingIndex);
        }, function () {
                layui.layer.close(loadingIndex);
       });
    };




    // 加载所属单位列表
    SubPage.prototype.loadEnterprise = function () {

        var that = this;
        // 获取 选中左侧导航栏的相关数据
        var treeNodedata = neatNavigator.getSelectedTreeNodeInfo();
        if (!treeNodedata) {
            return;
        }
        if (treeNodedata.enterpriseId != '') {
            var htmls = '<option value=' + treeNodedata.enterpriseId + '>' + treeNodedata.name + '</option>';
            // 将模板数据添加到select组件上
            $('#slEnterpriseName').html(htmls);
            form.render('select', 'form');
            that.enterpriseId = treeNodedata.enterpriseId;
        } else {
            // 获取单位信息，并渲染单位列表
            commonDataApi.getEntByDomainId(base.getUserToken(), treeNodedata.domainId, function (result) {
                laytpl($('#optEnterpriseTemplate').html()).render(result, function (html) {
                    // 将模板数据添加到select组件上
                    $('#slEnterpriseName').html(html);

                    form.render('select', 'form');
                });
            });
            that.enterpriseId = "";
        }
    };

    // 加载状态
    SubPage.prototype.loadHiddenDangerStatus = function () {
        commonDataApi.getHiddenDangerStatus(function (result) {
            laytpl($('#optPatrolStatusTemplate').html()).render(result, function (html) {
                $("#slPatrolStatus").html(html);
            });

            form.render('select', 'form')
        });
    };

    // 初始化表格
    SubPage.prototype.initTable = function () {
        var that = this;

        // 渲染 项目类型列表
        table.render({
            elem: '#hiddenDangerList'
            , page: false
            , limit: limitCount
            , autoSort: false
            , initSort: {
                field: this.orderByCol,
                type: this.orderSort
            }
            , load: false
            , data: []
            , cols: [[
                 
                  { field: 'id', title: 'id', hide: true }
                 , { field: 'pointInfoName', title: '巡检点名称', sort: true }
                 , { field: 'childTypeName', title: '项目子类型' }
                 , { field: 'entpriseName', title: '所属单位名称' }
                 , { field: 'buildingName', title: '所属建筑物' }
                 , { field: 'keypartName', title: '所属部位' }
                 , { field: 'upUserName', title: '隐患上报人', sort: true }
                 , { field: 'upTime', title: '上报时间', sort: true, width: 200 }
                 , {
                     field: 'status', title: '当前状态', templet: '#statusnBar'
                 }
                 , { fixed: 'right', title: '操作', toolbar: '#operationBar', align: 'center', width: 200 }
            ]]

        });
    };

    // 初始化监听事件（from和table）
    SubPage.prototype.initEventInfo = function () {
        var that = this;
        var nodeData = neatNavigator.getSelectedTreeNodeInfo();
        if (!nodeData) {
            return;
        }
        // 单位名称选中改变
        form.on('select(enterpriseName)', function (data) {
            // 获取选中的项目类型
            that.enterpriseId = data.value
        });

        // 隐患状态选中改变
        form.on('select(patrolStatus)', function (data) {
            // 获取选中的项目子类型
            if (data.value == '') {
                that.hiddenStatus = 0;
            } else {
                that.hiddenStatus = data.value;
            }
        });


        //监听工具条
        table.on('tool(hiddenDangerList)', function (obj) {
            var data = obj.data;
            
            ////隐患 确认 功能 拿到了 手机端./
            //if (obj.event === 'confirm') {
            //    layer.open({resize:false,
            //        type: 2,
            //        title: "隐患确认",
            //        area: ["810px", "896px"],
            //        content: "/pages/patrol/hiddenDangerManage/confirmHiddenDangerDialog.html?id=" + data.id,
            //        end: function () {
            //            that.loadHiddenData(function (result) {
            //                that.reloadTable(result);
            //            });
            //        }
            //    });

            //} else

                if (obj.event === 'handle') {
                layer.open({resize:false,
                    type: 2,
                    title: "隐患处理",
                    area: ["806px", "700px"],
                    content: "/pages/patrol/hiddenDangerManage/handleHiddenDangerDialog.html?id=" + data.id
                        + "&domainId=" + nodeData.domainId
                        + "&enterpriseId=" + nodeData.enterpriseId
                        + "&__=" + new Date().valueOf().toString(),
                    shade: [0.7, '#000'],
                    end: function () {
                        that.bindTable();
                    }
                });

            } else if (obj.event === 'see') {
                layer.open({resize:false,
                    type: 2,
                    title: "隐患详情",
                    area: ["806px", "700px"],
                    content: "/pages/patrol/hiddenDangerManage/seeHiddenDangerDialog.html?id=" + data.id
                        + "&__=" + new Date().valueOf().toString(),
                    shade: [0.7, '#000'],
                    end: function () {
                        that.bindTable();
                    }
                });
            }
        });

        // 监听排序列
        table.on('sort(hiddenDangerList)', function (obj) {
            that.orderByCol = obj.field;
            that.orderSort = obj.type;
            that.bindTable();
        });
    };

    // 加载表格数据
    SubPage.prototype.reloadTable = function (result) {
        var that = this;
        table.reload("hiddenDangerList", {
            data: result.data,
            initSort: {
                field: that.orderByCol,
                type: that.orderSort
            }
        });
        that.initPage(result.totalCount, that.currentPageIndex);
    };

    // 初始化分页
    SubPage.prototype.initPage = function (totalCount, pageIndex) {
        var that = this;

        if (!totalCount) {
            totalCount = 0;
        }
        if (!pageIndex) {
            pageIndex = 1;
        }

        laypage.render({
            elem: 'tablehiddenDangerListPager',
            count: totalCount, //数据总数，从服务端得到
            limit: that.currentPageSize,
            hash: false,
            layout: ['count', 'prev', 'page', 'next'],
            curr: pageIndex,
            jump: function (obj, first) {
                that.currentPageIndex = obj.curr;
                that.currentPageSize = obj.limit;

                //首次不执行
                if (!first) {
                    that.bindTable();
                }
            }
        });
    };

    // 加载隐患数据列表
    SubPage.prototype.loadHiddenData = function (callback, failCallback) {
        var that = this;

        var url = '/OpenApi/HDanger/GetTroubleInfoList';
        // 获取 选中左侧导航栏的相关数据
        var treeNodedata = neatNavigator.getSelectedTreeNodeInfo();
        if (!treeNodedata) {
            return;
        }
        var result = -1;
        switch (that.orderByCol) {
            case 'upTime':
                result = 1;
                break;
            case 'pointInfoName':
                result = 2;
                break;
            case 'upUserName':
                result = 3;
                break;
        }

        // 构造请求参数
        var data = {
            token: base.getUserToken(),
            pointInfoName: $('#patrolPointName').val(),
            troubleStatus: that.hiddenStatus,
            domainID: treeNodedata.domainId,
            entpriseId: that.enterpriseId,
            enterpriseIds: that.enterpriseId,
            orderByColumn: result,
            isDescOrder: that.orderSort == 'desc',
            pageIndex: that.currentPageIndex,
            pageSize: that.currentPageSize
        };

        // 请求数据，并渲染列表框
        layui.neatDataApi.sendGet(url, data, callback, failCallback);
    };

    exports("pagePatrolHiddenDangerManage", new SubPage());

});