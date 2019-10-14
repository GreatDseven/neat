//nb平台应用信息 列表页面


layui.define(["jquery", 'element', 'form', 'table', 'laytpl', 'laypage', 'layer', 'neat'
    , 'neatNavigator', 'commonDataApi', 'iotAuthInfoDataApi', 'neatUITools', "neatWindowManager"
], function (exports) {

    "use strict";

    var MODULENAME = "pageIotAuthInfoList";

    var $ = layui.$;
    var table = layui.table;
    var form = layui.form;
    var laytpl = layui.laytpl;
    var element = layui.element;

    var neat = layui.neat;
    var uiTools = layui.neatUITools;

    var laypage = layui.laypage;
    var neatNavigator = layui.neatNavigator;
    var commonDataApi = layui.commonDataApi;
    var pageDataApi = layui.iotAuthInfoDataApi;


    var defaultPageSize = 14;

    var SubPage = function () {

        this.initDefaultValues();

    };

    SubPage.prototype.initDefaultValues = function () {


        this.selectedIsp = "";
        this.selectedEnv = "";
        this.selectedCascade = "Subtree";
        this.selectedTab = 0;

    };

    SubPage.prototype.init = function () {

        var that = this;

        this.initDefaultValues();

        this.initHashChangedEvent();

        this.initISPList();
        this.initEnvType();
        this.initQueryType();
        this.initTab();



        this.initTable();
        this.initPager();

        this.initTable2();
        this.initPager2();


        //三个按钮事件

        //查询
        this.initQueryEvent();

        //关联
        this.initSetRelationEvent();

        //添加
        this.initAddEvent();

        //删除
        this.initDeleteEvent();


        //表格1操作列事件
        this.initTable1OperateColEvent();

        //表格2操作列事件
        this.initTable2OperateColEvent();

        this.bindTable();

        this.bindTable2();

    };

    // 初始化 tab
    SubPage.prototype.initTab = function () {

        var that = this;
        element.on('tab(mytab)', function (data) {

            that.selectedTab = data.index;

            if (data.index == 0) {
                //机构关联
                $("#queryTypeContainer").show();
            }
            else {
                //应用管理
                $("#queryTypeContainer").hide();
            }
        });
    };




    //初始化 运营商 查询条件
    SubPage.prototype.initISPList = function () {

        var that = this;

        form.on('select(optISPList)', function (data) {
            //console.log(data.elem); //得到select原始DOM对象
            //console.log(data.value); //得到被选中的值
            //console.log(data.othis); //得到美化后的DOM对象
            that.selectedIsp = data.value;

        });

        this.bindISPList();

    };

    // 绑定运营商列表
    SubPage.prototype.bindISPList = function () {

        var that = this;

        commonDataApi.getISPDataList(neat.getUserToken(), function (resultData) {

            var d = {};
            d.data = resultData;

            laytpl($('#optISPListTemplate').html()).render(d, function (html) {
                var parent = $("#optISPList").html(html);
                form.render('select', 'optISPListForm');
            });

        });
    };

    //初始化 运行环境 查询条件
    SubPage.prototype.initEnvType = function () {

        var that = this;

        form.on('select(optEnvType)', function (data) {
            //console.log(data.elem); //得到select原始DOM对象
            //console.log(data.value); //得到被选中的值
            //console.log(data.othis); //得到美化后的DOM对象
            that.selectedEnv = data.value;

        });

        this.bindEnvType();

    };

 

    // 绑定 运行环境列表
        SubPage.prototype.bindEnvType = function () {

            var that = this;

            commonDataApi.getEnvTypeDataList(neat.getUserToken(), function (resultData) {

                var d = {};
                d.data = resultData;

                laytpl($('#optEnvTypeTemplate').html()).render(d, function (html) {
                    var parent = $("#optEnvType").html(html);
                    form.render('select', 'optEnvTypeForm');
                });

            });
        };


    //初始化 查询类型 查询条件
    SubPage.prototype.initQueryType = function () {

        var that = this;

        form.on('select(optQueryType)', function (data) {
            //console.log(data.elem); //得到select原始DOM对象
            //console.log(data.value); //得到被选中的值
            //console.log(data.othis); //得到美化后的DOM对象
            that.selectedCascade = data.value;

        });

        this.bindQueryType();

    };

    // 绑定 查询类型列表
    SubPage.prototype.bindQueryType = function () {

        var that = this;

        commonDataApi.getQueryCascadeDataList(neat.getUserToken(), function (resultData) {

            var d = {};
            d.data = resultData;

            laytpl($('#optQueryTypeTemplate').html()).render(d, function (html) {
                var parent = $("#optQueryType").html(html);
                form.render('select', 'optQueryTypeForm');
            });

        });
    }

    SubPage.prototype.bindTable = function () {

        var that = this;

        var token = neat.getUserToken();
        var treeData = neatNavigator.getSelectedTreeNodeInfo();
        if (!treeData) {
            return;
        }

        var keyword = $.trim($("#txtkeyWord").val());

        var isp = that.selectedIsp;
        var env = that.selectedEnv;
        var cascade = that.selectedCascade;


        var loadingIndex = layui.layer.load(1);
        pageDataApi.getOrgRelatedAuthInfos(token, treeData.domainId, treeData.enterpriseId, keyword, isp, env, cascade, that.currentPageIndex, that.currentPageSize,
            function (resultData) {
                layui.layer.close(loadingIndex);
                //成功
                table.reload("resultTable", {
                    data: resultData.data,

                });
                that.initPager(resultData.totalCount, that.currentPageIndex);

            },
            function () { //失败
                layui.layer.close(loadingIndex);
                that.currentPageIndex = 1;
                table.reload("resultTable", {
                    data: [],

                });
                that.initPager(0, 1);

                //layer.msg("查询应用发生错误!");
            });
    };

    //清空表格
    SubPage.prototype.clearTable = function () {

        var that = this;

        table.reload("resultTable", {
            data: [],

        });
        that.currentPageIndex = 1;
        that.initPager(0, 1);
    };


    SubPage.prototype.initPager = function (totalCount, pageIndex) {

        var that = this;

        if (!totalCount) {
            totalCount = 0;
        }
        if (!pageIndex) {
            pageIndex = 1;
        }

        laypage.render({
            elem: 'resultTablePager',
            count: totalCount, //数据总数，从服务端得到
            limit: that.currentPageSize,
            hash: false,
            layout: ['count', 'prev', 'page', 'next'],
            curr: pageIndex,
            jump: function (obj, first) {
                //obj包含了当前分页的所有参数，比如：
                //console.log(obj.curr); //得到当前页，以便向服务端请求对应页的数据。
                //console.log(obj.limit); //得到每页显示的条数

                that.currentPageIndex = obj.curr;
                that.currentPageSize = obj.limit;

                //首次不执行
                if (!first) {
                    //do something
                    that.bindTable(obj.curr, obj.limit);
                }
            }
        });
    };

    SubPage.prototype.initTable = function () {

        var that = this;
        that.table = table.render({
            elem: '#resultTable',
            id: "resultTable",
            data: [],
            page: false,
            limit: defaultPageSize,
            autoSort: false,

            height: 630,
            cols: [
                [

                    { field: 'id', title: '', hide: true },
                    { field: 'orgId', title: '', hide: true },

                    { field: 'orgName', title: '机构名称' },
                    { field: 'orgType', title: '机构类别', templet: function (d) { return uiTools.renderOrgType(d.orgType); } },
                    { field: 'name', title: '应用名称' },
                    { field: 'modelTypeName', title: '产品型号' },
                    { field: 'isp', title: '运营商', templet: function (d) { return uiTools.renderISP(d.isp); } },
                    { field: 'envType', title: '运行环境', templet: function (d) { return uiTools.renderRuntimeEnv(d.envType); } },

                    { field: 'operation', fixed: 'right', title: '操作', align: 'center', toolbar: '#opColTemplate' }
                ]
            ],
        });

        table.on('sort(resultTable)', function (obj) {
            //console.log(obj.field); //当前排序的字段名
            //console.log(obj.type); //当前排序类型：desc（降序）、asc（升序）、null（空对象，默认排序）
            //console.log(this); //当前排序的 th 对象
            that.currentSortColumn = obj.field;
            that.currentSortOrder = obj.type;

            that.bindTable();
        });

    }

    //添加
    SubPage.prototype.initAddEvent = function () {
        var that = this;
        $('#btnAdd').on('click', function () {

            var url = "/pages/foundationInfo/iotAuthInfo/iotAuthInfoCreate.html?"

                + "&__=" + new Date().valueOf().toString();

            layui.neatWindowManager.openLayerInRootWindow({
                resize: false,
                type: 2,
                title: '添加应用',
                area: ["600px", "480px"],
                shade: [0.7, '#000'],
                content: url,
                end: function () {
                    that.bindTable2();
                }
            });
        });
    };

    //查询
    SubPage.prototype.initQueryEvent = function () {
        var that = this;
        $("#btnQuery").on("click", function () {
            that.query();
        });

    };

    //关联
    SubPage.prototype.initSetRelationEvent = function () {
        var that = this;
        $("#btnSetRelation").on("click", function () {

            var treeData = neatNavigator.getSelectedTreeNodeInfo();
            if (!treeData) {
                return;
            }


            var url = "/pages/foundationInfo/iotAuthInfo/mapIotAuthInfoDialog.html?"
                + "&domainId=" + treeData.domainId
                + "&enterpriseId=" + treeData.enterpriseId
                + "&name=" + encodeURIComponent(treeData.name)
                + "&__=" + new Date().valueOf().toString();

            layui.neatWindowManager.openLayerInRootWindow({
                resize: false,
                type: 2,
                title: '关联管理',
                area: ["850px", "600px"],
                shade: [0.7, '#000'],
                content: url,
                end: function () {
                    that.bindTable();
                }
            });
        });

    };



    SubPage.prototype.query = function () {
        var that = this;

        if (that.selectedTab == 0) {
            that.currentPageIndex = 1;
            that.bindTable();
        }
        else {
            that.currentPageIndex2 = 1;
            that.bindTable2();
        }
    };

    //删除
    SubPage.prototype.initDeleteEvent = function () {
        var that = this;
        $('#btnDelete').on('click', function () {


            var checkStatus = table.checkStatus('resultTable2');
            var data = checkStatus.data;

            if (data.length === 0) {
                layer.msg("请勾选需要删除的应用!");
                return;
            }

            layer.confirm("确定要删除这些应用吗?", {}, function () {

                $("#btnDelete").attr("disabled", true);

                var ids = [];
                $.each(data, function (_, item) {
                    ids.push(item.id);
                });
                pageDataApi.deleteAuthInfo(neat.getUserToken(), ids

                    , function (sd) { //成功或者部分成功

                        $("#btnDelete").attr("disabled", false);
                        var alertMsg = "";

                        if (!sd || sd == null || sd.length === 0) {
                            alertMsg = "应用删除成功!";

                        }
                        else {

                            alertMsg = "以下应用未能成功删除:<br/>" + sd.join("<br/>");
                        }

                        layer.msg(alertMsg, function () {
                            that.bindTable2();
                        });
                    }
                    , function (fd) {

                        $("#btnDelete").attr("disabled", false);

                        layer.msg("删除失败!", function () {
                            that.bindTable2();

                        });

                    });
            });

        });
    };



    SubPage.prototype.initHashChangedEvent = function () {

        var that = this;
        $(window).on("hashchange", function () {

            var treeData = neatNavigator.getSelectedTreeNodeInfo();
            if (!treeData) {
                return;
            }
            if (!treeData.fullAccess) {
                $("#btnAdd").attr("disabled", true);
                $("#btnDelete").attr("disabled", true);
            }
            else {
                $("#btnAdd").attr("disabled", false);
                $("#btnDelete").attr("disabled", false);
            }

            that.initDefaultValues();

            that.query();


        });
    };

    //初始化表格1操作列的事件
    SubPage.prototype.initTable1OperateColEvent = function () {
        var that = this;

        table.on('tool(resultTable)', function (obj) {
            var data = obj.data;
            if (obj.event === 'del') {
                layer.confirm('确定要解除关联:' + data.name + "?", function (index) {
                    var sendData = {
                        "orgId": data.orgId,
                        "orgType": data.orgType,
                        "addAuthInfoIds": [],
                        "deleteAuthInfoIds": [data.id]
                    };

                    pageDataApi.changeOrgAuthRelation(neat.getUserToken(), sendData
                        , function () {
                            layer.msg("解除关联成功");


                        }, function (fd) {
                            if (typeof fd.message === "string") {
                                layer.msg(fd.message);
                            }
                            else {
                                layer.msg("解除关联失败!");
                            }
                        });

                    layer.close(index);
                });
            }
        });
    };



    //初始化表格2操作列的事件
    SubPage.prototype.initTable2OperateColEvent = function () {
        var that = this;

        table.on('tool(resultTable2)', function (obj) {
            var data = obj.data;
            if (obj.event === 'del') {
                layer.confirm('确定要删除应用:' + data.name + "?", function (index) {
                    var url = "";
                    var sendData = [];
                    sendData.push(data.id);
                    pageDataApi.deleteAuthInfo(neat.getUserToken(), sendData
                        , function (sd) { //成功或者部分成功

                            var alertMsg = "";

                            if (!sd || sd == null || sd.length === 0) {
                                alertMsg = "应用删除成功!";
                                obj.del();
                            }
                            else {

                                alertMsg = "以下应用未能成功删除:<br/>" + sd.join("<br/>");
                            }

                            layer.msg(alertMsg, function () {
                                that.bindTable2();
                            });


                        }, function (fd) { //失败
                            layer.msg("删除应用过程中发生错误!");
                        });
                    layer.close(index);
                });
            } else if (obj.event === 'edit') {


                var url = "/pages/foundationInfo/iotAuthInfo/iotAuthInfoUpdate.html?"
                    + "&id=" + data.id
                    + "&__=" + new Date().valueOf().toString();

                layui.neatWindowManager.openLayerInRootWindow({
                    resize: false,
                    type: 2,
                    title: '编辑应用',
                    area: ["600px", "480px"],
                    shade: [0.7, '#000'],
                    content: url,
                    end: function () {
                        that.bindTable2();
                    }
                });


            } else if (obj.event === "relOrg") {
                var url = "/pages/foundationInfo/iotAuthInfo/queryRelatedOrgListDialog.html?"
                    + "&id=" + data.id
                    + "&__=" + new Date().valueOf().toString();

                layui.neatWindowManager.openLayerInRootWindow({
                    resize: false,
                    type: 2,
                    title: '应用已关联机构',
                    area: ["850px", "620px"],
                    shade: [0.7, '#000'],
                    content: url,
                    end: function () {
                        that.bindTable2();
                    }
                });
            }

        });
    };


    //初始化建筑类型参数
    SubPage.prototype.initBuildingType = function () {

        var that = this;
        commonDataApi.getBuildingCategoryList(neat.getUserToken(), function (resultData) {

            var d = {};
            d.data = resultData;

            laytpl($('#optBuildingTypeTemplate').html()).render(d, function (html) {
                var parent = $("#optBuildingType").html(html);
                form.render('select', 'optBuildingTypeForm');
            });

        });

        form.on('select(optBuildingType)', function (data) {
            //console.log(data.elem); //得到select原始DOM对象
            //console.log(data.value); //得到被选中的值
            //console.log(data.othis); //得到美化后的DOM对象
            that.optBuildingType = data.value;

        });
    };

    //初始化第二个表格
    SubPage.prototype.initTable2 = function () {
        var that = this;
        that.table = table.render({
            elem: '#resultTable2',
            id: "resultTable2",
            data: [],
            page: false,
            limit: defaultPageSize,
            height: 630,
            cols: [
                [
                    { type: 'checkbox', fixed: 'left' },
                    { field: 'id', title: '', hide: true, },
                    { field: 'name', title: '应用名称', },
                    { field: 'modelTypeName', title: '产品型号' },
                    { field: 'isp', title: '运营商', templet: function (d) { return uiTools.renderISP(d.isp) } },
                    { field: 'buildingName', title: '使用环境', templet: function (d) { return uiTools.renderRuntimeEnv(d.envType); } },
                    { field: 'operation', fixed: 'right', title: '操作', align: 'center', toolbar: '#opCol2Template' }
                ]
            ],
        });


    };

    //初始化第二个分页控件
    SubPage.prototype.initPager2 = function (totalCount, pageIndex) {

        var that = this;

        if (!totalCount) {
            totalCount = 0;
        }
        if (!pageIndex) {
            pageIndex = 1;
        }

        laypage.render({
            elem: 'resultTablePager2',
            count: totalCount, //数据总数，从服务端得到
            limit: that.currentPageSize2,
            hash: false,
            layout: ['count', 'prev', 'page', 'next'],
            curr: pageIndex,
            jump: function (obj, first) {
                //obj包含了当前分页的所有参数，比如：
                //console.log(obj.curr); //得到当前页，以便向服务端请求对应页的数据。
                //console.log(obj.limit); //得到每页显示的条数

                that.currentPageIndex2 = obj.curr;
                that.currentPageSize2 = obj.limit;

                //首次不执行
                if (!first) {
                    //do something
                    that.bindTable2(obj.curr, obj.limit);
                }
            }
        });
    };

    SubPage.prototype.bindTable2 = function () {

        var that = this;


        var token = neat.getUserToken();



        var keyword = $.trim($("#txtkeyWord").val());

        var isp = that.selectedIsp;
        var env = that.selectedEnv;


        var loadingIndex = layui.layer.load(1);
        pageDataApi.getAuthInfoList(token, keyword, isp, env, that.currentPageIndex2, that.currentPageSize2,
            function (resultData) {
                layui.layer.close(loadingIndex);
                //成功
                table.reload("resultTable2", {
                    data: resultData.data,

                });
                that.initPager2(resultData.totalCount, that.currentPageIndex2);

            },
            function () { //失败
                layui.layer.close(loadingIndex);
                that.currentPageIndex2 = 1;
                table.reload("resultTable2", {
                    data: [],

                });
                that.initPager2(0, 1);

                //layer.msg("查询应用数据发生错误!");
            });
    };


    exports(MODULENAME, new SubPage());

});