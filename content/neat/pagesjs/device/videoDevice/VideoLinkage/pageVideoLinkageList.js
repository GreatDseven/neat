//视频联动 列表页面


layui.define(["jquery", 'element', 'form', 'table', 'laytpl', 'laypage', 'layer', 'neat', 'neatNavigator', 'commonDataApi', 'videoDeviceDataApi', 'neatUITools', 'neatWindowManager','neatPopupRepository'], function (exports) {

    "use strict";

    var MODULE_NAME = "pageVideoLinkageList";

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

    var defaultPageSize = 15;

    var SubPage = function () {

       

    };

    SubPage.prototype.init = function () {


        var that = this;

        this.addDeviceCategoryQueryOptions();

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

    // 添加设备类型查询选项的控件
    SubPage.prototype.addDeviceCategoryQueryOptions = function () {

        commonDataApi.getLinkageDeviceCategoryData(neat.getUserToken(), function (resultData) {

           var d = {};
           d.data = resultData;

           laytpl($("#deviceCategoryTemplate").html()).render(d, function (html) {
               
               $(html).insertAfter($("#lblDeviceCategory"));

               form.render(null, "query");
           });
       });
    };

    SubPage.prototype.initDefaultValues = function () {

        this.currentPageIndex = 1;
        this.currentPageSize = defaultPageSize;
        this.currentSortColumn = "id";
        this.currentSortOrder = "desc";


    };



    SubPage.prototype.bindTable = function () {

        var that = this;


        var devTypesCtls = $("input[name='devType']");
        var devTypes = [];

        $.each(devTypesCtls, function (_, item) {
            if (item.checked) {
                devTypes.push($(item).attr("dev-type-value"));
            }

        });

        if (devTypes.length == 0) {
            layui.layer.msg("请勾选联动设备!");
            return;
        }

        var token = neat.getUserToken();
        var treeData = neatNavigator.getSelectedTreeNodeInfo();
        if (!treeData) {
            return;
        }

        var keyword = $.trim($("#txtKeyword").val());


       

        var loadingIndex = layui.layer.load(1);

        pageDataApi.queryVideoLinkageDeviceList(token, keyword, treeData.domainId, treeData.enterpriseId, devTypes.toString(),

            that.currentPageIndex, that.currentPageSize,
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

                //layer.msg("查询联动发生错误!");
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
        //主键
        id: "id",

        //联动信息

        videoDeviceName: "videoName",
        videoChannelName: "videoChannelName",
        videoDeviceAddress: "videoChannelAddress",
        videoChannelId:"videoChannelId",

        //被监控的设备信息
        monitorDeviceTypeId: "sourceCategory",
        monitorDeviceName: "deviceName",
        monitorDeviceAddress:"deviceAddress"
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
                    { field: dataProperty.id, hide: true },
                    { field: dataProperty.videoDeviceName, title: '视频设备名称', width: 250 },
                    { field: dataProperty.videoChannelName, title: '通道名称', width: 250 },
                    { field: dataProperty.videoDeviceAddress, title: '视频所属', width: 250 },
                    { field: dataProperty.monitorDeviceTypeId, title: '设备类别',  width: 120, templet: function (d) { return uiTools.renderLinkageDeviceTypeText(d[dataProperty.monitorDeviceTypeId]); }},
                    { field: dataProperty.monitorDeviceName, title: '设备名称', width: 200 },
                    { field: dataProperty.monitorDeviceAddress, title: '设备所属', width: 250 },
                    { fixed: 'right', title: '操作', width: 150, align: 'center', toolbar: '#opColTemplate' }
                ]
            ]
        });

        //table.on('sort(resultTable)', function (obj) {
        //    //console.log(obj.field); //当前排序的字段名
        //    //console.log(obj.type); //当前排序类型：desc（降序）、asc（升序）、null（空对象，默认排序）
        //    //console.log(this); //当前排序的 th 对象

        //    that.currentSortColumn = obj.field;
        //    that.currentSortOrder = obj.type;

        //    that.bindTable();

        //    //layer.msg('服务端排序。order by ' + obj.field + ' ' + obj.type);
        //});

    };


    //添加
    SubPage.prototype.initAddEvent = function () {
        var that = this;
        $('#btnAdd').on('click', function () {

            var treeData = neatNavigator.getSelectedTreeNodeInfo();
            if (!treeData) {
                return;
            }

            if (!treeData.enterpriseId) {

                layer.msg("请选择单位节点添加视频联动!");
                return;
            }


            var url = "/pages/device/videoDevice/VideoLinkage/VideoLinkageCreate.html?"
                + "enterprise_id=" + treeData.enterpriseId
                + "&enterprise_name=" + treeData.name
                + "&__=" + new Date().valueOf().toString();

            layui.neatWindowManager.openLayerInRootWindow({resize:false,
                type: 2,
                title: '添加联动',
                area: ["1200px", "750px"],
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

    //删除
    SubPage.prototype.initDeleteEvent = function () {
        var that = this;
        $('#btnDelete').on('click', function () {


            var checkStatus = table.checkStatus('resultTable');
            var data = checkStatus.data;

            if (data.length === 0) {
                layer.msg("请勾选需要删除的联动!");
                return;
            }

            layer.confirm("确定要删除这些联动吗?", {}, function () {

                $("#btnDelete").attr("disabled", true);

                var ids = [];
                $.each(data, function (_, item) {
                    ids.push(item[dataProperty.id]);
                });
                pageDataApi.deleteVideoLinkage(neat.getUserToken(), ids

                    , function (sd) { //成功或者部分成功

                        $("#btnDelete").attr("disabled", false);
                        var alertMsg = "";

                        if (!sd || sd == null || sd.length === 0) {
                            alertMsg = "联动删除成功!";

                        }
                        else {

                            alertMsg = "以下联动未能成功删除:<br/>" + sd.join("<br/>");
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
                layer.confirm('确定要删除联动?', function (index) {

                    var sendData = [];
                    sendData.push(data[dataProperty.id]);
                    pageDataApi.deleteVideoLinkage(neat.getUserToken(), sendData
                        , function (sd) { //成功或者部分成功

                            var alertMsg = "";

                            if (!sd || sd == null || sd.length === 0) {
                                alertMsg = "联动删除成功!";
                                obj.del();
                            }
                            else {

                                alertMsg = "以下联动未能成功删除:<br/>" + sd.join("<br/>");
                            }

                            layer.msg(alertMsg, function () {
                                that.bindTable();
                            });


                        }, function (fd) { //失败
                            layer.msg("删除联动过程中发生错误!");
                        });

                    layer.close(index);
                });
            } 
            else if(obj.event === "video"){
                layui.neatPopupRepository.showVideoChannelWindow(data[dataProperty.videoChannelId]);
            }

        });
    };

    


    exports(MODULE_NAME, new SubPage());

});