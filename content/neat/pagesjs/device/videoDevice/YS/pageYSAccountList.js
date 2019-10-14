//萤石云账号 列表页面


layui.define(["jquery", 'element', 'form', 'table', 'laytpl', 'laypage', 'layer', 'neat', 'neatNavigator', 'commonDataApi', 'videoDeviceDataApi', 'neatUITools','neatWindowManager'], function (exports) {

    "use strict";

    var MODULE_NAME = "pageYSAccountList";

    var $ = layui.$;
    var table = layui.table;
    var form = layui.form;
    var laytpl = layui.laytpl;



    var neat = layui.neat;
    var laypage = layui.laypage;
    var neatNavigator = layui.neatNavigator;
    var commonDataApi = layui.commonDataApi;
    var pageDataApi = layui.videoDeviceDataApi;
    var uiTools = layui.neatUITools;

    var defaultPageSize = 9999999999;

    var SubPage = function () {



    };

    SubPage.prototype.initDefaultValues = function () {

        this.currentPageIndex = 1;
        this.currentPageSize = defaultPageSize;
        //this.currentSortColumn = "id";
        //this.currentSortOrder = "desc";

        this.optEnt = "";
        this.optBuilding = "";
        this.optKeypart = "";
    };







    SubPage.prototype.bindTable = function () {

        var that = this;


        var token = neat.getUserToken();
        var treeData = neatNavigator.getSelectedTreeNodeInfo();
        if (!treeData) {
            return;
        }

        var keyword = $.trim($("#txtKeyword").val());



        var loadingIndex = layui.layer.load(1);

        pageDataApi.queryYSAccountList(token, keyword, treeData.domainId, treeData.enterpriseId,
           
            function (resultData) {
                layui.layer.close(loadingIndex);
                //成功
                table.reload("resultTable", {
                    data: resultData.data,
                    //initSort: {
                    //    field: that.currentSortColumn,
                    //    type: that.currentSortOrder
                    //}
                });
                that.initPager(resultData.totalCount, that.currentPageIndex);

            },
            function () { //失败
                layui.layer.close(loadingIndex);
                that.currentPageIndex = 1;
                table.reload("resultTable", {
                    data: [],
                    //initSort: {
                    //    field: that.currentSortColumn,
                    //    type: that.currentSortOrder
                    //}
                });
                that.initPager(0, 1);

                //layer.msg("查询视频设备发生错误!");
            });
    };

    //清空表格
    SubPage.prototype.clearTable = function () {

        var that = this;

        table.reload("resultTable", {
            data: [],
            //initSort: {
            //    field: that.currentSortColumn,
            //    type: that.currentSortOrder
            //}
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


    var dataProperty = {
        appId:"id",
        appKey: "appkey",
        appSecret: "appSecret",
        appName: "appName",
        orgName: "organizationName",
        orgId: "organizationId",
        orgType:"objType"
       
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
            height: 640,
            //initSort: {
            //    field: that.currentSortColumn,
            //    type: that.currentSortOrder
            //},
            cols: [
                [
                    { type: 'checkbox', fixed: 'left' },
                    { field: dataProperty.id, hide:true },
                    { field: dataProperty.appName, title: '备注' },
                    { field: dataProperty.appKey, title: 'AppKey' },
                    { field: dataProperty.appSecret, title: 'AppSecret' },
                    { field: dataProperty.orgName, title: '所属机构' },
        
                    { fixed: 'right', title: '操作', width: 150, align: 'center', toolbar: '#opColTemplate' }
                ]
            ]
        });




        table.on('sort(resultTable)', function (obj) {
            //console.log(obj.field); //当前排序的字段名
            //console.log(obj.type); //当前排序类型：desc（降序）、asc（升序）、null（空对象，默认排序）
            //console.log(this); //当前排序的 th 对象

            //尽管我们的 table 自带排序功能，但并没有请求服务端。
            //有些时候，你可能需要根据当前排序的字段，重新向服务端发送请求，从而实现服务端排序，如：



            that.currentSortColumn = obj.field;
            that.currentSortOrder = obj.type;

            that.bindTable();

            //layer.msg('服务端排序。order by ' + obj.field + ' ' + obj.type);
        });



    };




    //添加
    SubPage.prototype.initAddEvent = function () {
        var that = this;
        $('#btnAdd').on('click', function () {

            var treeData = neatNavigator.getSelectedTreeNodeInfo();
            if (!treeData) {
                return;
            }

            //if (!treeData.enterpriseId) {

            //    layer.msg("请选择单位节点进行账号添加!");
            //    return;
            //}



            var url = "/pages/device/videoDevice/YS/YSAccountCreate.html?org_id=" + treeData.id
                + "&org_name=" + encodeURIComponent(treeData.name)
                + "&org_type=" + treeData.type
                + "&__=" + new Date().valueOf().toString();

            layui.neatWindowManager.openLayerInRootWindow({
                resize: false,
                type: 2,
                title: '添加萤石云账号',
                area: ["640px", "350px"],
                shade: [0.7, '#000'],
                content: url,
                end: function () {
                    that.bindTable();
                }
            });
        });
    };

    //查询
    SubPage.prototype.initQueryEvent = function () {
        var that = this;
        $("#btnQuery").on("click", function () {
            that.currentPageIndex = 1;
            that.bindTable();
        });
    };
    //刷新
    SubPage.prototype.initRefreshEvent = function () {
        var that = this;
        $("#btnRefresh").on("click", function () {
            that.bindTable();
        });
    };

    var deleteAlarmMsgPrefix = "<span style='color:red'>删除账号时,系统将自动移除该账号下所有视频设备!</span> <br />";


    //删除
    SubPage.prototype.initDeleteEvent = function () {
        var that = this;
        $('#btnDelete').on('click', function () {


            var checkStatus = table.checkStatus('resultTable');
            var data = checkStatus.data;

            if (data.length === 0) {
                layer.msg("请勾选需要删除的萤石云账号!");
                return;
            }

            layer.confirm(deleteAlarmMsgPrefix+"确定要删除萤石云账号吗?", {}, function () {

                $("#btnDelete").attr("disabled", true);

                var ids = [];
                $.each(data, function (_, item) {
                    ids.push(item.id);
                });
                pageDataApi.deleteYSAccount(neat.getUserToken(), ids

                    , function (sd) { //成功或者部分成功

                        $("#btnDelete").attr("disabled", false);
                        var alertMsg = "";

                        if (!sd || sd == null || sd.length === 0) {
                            alertMsg = "萤石云账号删除成功!";

                        }
                        else {

                            alertMsg = "以下萤石云账号未能成功删除:<br/>" + sd.join("<br/>");
                        }

                        layer.msg(alertMsg, function () {
                            that.bindTable();
                        });
                    }
                    , function (fd) {

                        $("#btnDelete").attr("disabled", false);

                        layer.msg("删除失败!", function () {
                            that.bindTable();

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

            that.domainId = treeData.domainId;
            that.optEnt = treeData.enterpriseId;

            that.currentPageIndex = 1;

            that.bindTable();

        });
    };

    //初始化表格操作列的事件
    SubPage.prototype.initTableOperateColEvent = function () {
        var that = this;

        table.on('tool(resultTable)', function (obj) {
            var data = obj.data;
            if (obj.event === 'del') {
                layer.confirm(deleteAlarmMsgPrefix+'确定要删除萤石云账号:' + data[dataProperty.appName] + "? ", function (index) {

                    var sendData = [];
                    sendData.push(data.id);
                    pageDataApi.deleteYSAccount(neat.getUserToken(), sendData
                        , function (sd) { //成功或者部分成功

                            var alertMsg = "";

                            if (!sd || sd == null || sd.length === 0) {
                                alertMsg = "萤石云账号删除成功!";
                                obj.del();
                            }
                            else {

                                alertMsg = "以下萤石云账号未能成功删除:<br/>" + sd.join("<br/>");
                            }

                            layer.msg(alertMsg, function () {
                                that.bindTable();
                            });


                        }, function (fd) { //失败
                            layer.msg("删除萤石云账号过程中发生错误!");
                        });

                    layer.close(index);
                });
            } else if (obj.event === 'edit') {



                var url2 = "/pages/device/videoDevice/YS/YSAccountUpdate.html?id=" + data[dataProperty.appId]
                  
                    + "&__=" + new Date().valueOf().toString();

                layui.neatWindowManager.openLayerInRootWindow({
                    resize: false,
                    type: 2,
                    title: '编辑萤石云账号',
                    area: ["640px", "350px"],
                    shade: [0.7, '#000'],
                    content: url2,
                    end: function () {
                        that.bindTable();
                    }
                });


            } else if (obj.event === 'device-list') {
               
                var url3 = "/pages/device/videoDevice/YS/YSDeviceList.html?app_id=" + data[dataProperty.appId]
                    + "&app_name=" + encodeURIComponent(data[dataProperty.appName])
                    + "&org_id=" + encodeURIComponent(data[dataProperty.orgId])
                    + "&org_name=" + encodeURIComponent(data[dataProperty.orgName])
                    + "&org_type=" + encodeURIComponent(data[dataProperty.orgType])
                    + "&__=" + new Date().valueOf().toString();

                layui.neatWindowManager.openLayerInRootWindow({
                    resize: false,
                    type: 2,
                    title: '视频设备列表',
                    area: ["1200px", "768px"],
                    shade: [0.7, '#000'],
                    content: url3
                   
                });
            }
        });
    };

    SubPage.prototype.init = function () {


        var that = this;

        this.initDefaultValues();

        this.initHashChangedEvent();


        this.initTable();
        this.initPager();


        //按钮事件

        //查询
        this.initQueryEvent();
        //刷新
        this.initRefreshEvent();


        //添加
        this.initAddEvent();
        //删除
        this.initDeleteEvent();

        //表格操作列事件
        this.initTableOperateColEvent();



        that.bindTable();
    };


    exports(MODULE_NAME, new SubPage());

});