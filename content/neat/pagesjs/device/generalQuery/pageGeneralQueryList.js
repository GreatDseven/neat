//综合设备查询 列表页面


layui.define(["jquery", 'element', 'form', 'table', 'laytpl', 'laypage', 'layer',
    'neat', 'neatNavigator', 'commonDataApi', 'generalQueryDataApi', 'neatUITools', "neatPopupRepository", 'neatTools', 'neatUserFavoriteSetting'], function (exports) {

        "use strict";

        var MODULE_NAME = "pageGeneralQueryList";

        var $ = layui.$;
        var table = layui.table;
        var form = layui.form;
        var laytpl = layui.laytpl;
        var layer = layui.layer;

        var neat = layui.neat;
        var laypage = layui.laypage;
        var neatNavigator = layui.neatNavigator;
        var commonDataApi = layui.commonDataApi;
        var pageDataApi = layui.generalQueryDataApi;
        var uiTools = layui.neatUITools;

        var defaultPageSize = 15;


        var popups = layui.neatPopupRepository;

        var fav = layui.neatUserFavoriteSetting;



        var SubPage = function () {

        };

        SubPage.prototype.initDefaultValues = function () {

            this.currentPageIndex = 1;
            this.currentPageSize = defaultPageSize;
            this.currentSortColumn = "id";
            this.currentSortOrder = "desc";

            this.optEnt = "";
            this.optBuilding = "";
            this.optKeypart = "";
        };



        //初始化 单位列表
        SubPage.prototype.initOptEnt = function () {

            var that = this;

            form.on('select(optEnt)', function (data) {
                //console.log(data.elem); //得到select原始DOM对象
                //console.log(data.value); //得到被选中的值
                //console.log(data.othis); //得到美化后的DOM对象
                that.optEnt = data.value;

                that.bindBuilding();
            });

            that.bindEnt();

        };
        //绑定 单位列表
        SubPage.prototype.bindEnt = function () {

            var that = this;
            var token = neat.getUserToken();

            var treeData = neatNavigator.getSelectedTreeNodeInfo();
            if (!treeData)
                return;

            if (treeData.domainId == "") {
                //选中的是企业节点
                var d = {};
                d.data = [{ id: treeData.enterpriseId, name: treeData.name }];
                laytpl($("#optEntTemplate").html()).render(d, function (html) {

                    var parent = $("#optEnt").html(html);
                    form.render('select', 'optEntForm');
                });
            }
            else {
                commonDataApi.getEntByDomainId(token, treeData.domainId, function (resultData) {

                    var d = {};
                    d.data = resultData;
                    laytpl($("#optEntTemplate").html()).render(d, function (html) {

                        var parent = $("#optEnt").html(html);
                        form.render('select', 'optEntForm');
                    });


                });
            }
        };


        //初始化 建筑
        SubPage.prototype.initBuilding = function () {

            var that = this;

            laytpl($("#optBuildingTemplate").html()).render({}, function (html) {

                var parent = $("#optBuilding").html(html);
                form.render('select', 'optBuildingForm');
            });

            form.on('select(optBuilding)', function (data) {
                //console.log(data.elem); //得到select原始DOM对象
                //console.log(data.value); //得到被选中的值
                //console.log(data.othis); //得到美化后的DOM对象
                that.optBuilding = data.value;

                that.bindKeypart();
            });

        };

        //建筑 绑定数据
        SubPage.prototype.bindBuilding = function () {

            var that = this;

            if (that.optEnt === "") {
                laytpl($("#optBuildingTemplate").html()).render({}, function (html) {

                    var parent = $("#optBuilding").html(html);
                    form.render('select', 'optBuildingForm');
                });

            }
            else {
                var token = neat.getUserToken();

                commonDataApi.getBuildingByEntId(token, that.optEnt, function (resultData) {

                    var d = {};
                    d.data = resultData;
                    laytpl($("#optBuildingTemplate").html()).render(d, function (html) {

                        var parent = $("#optBuilding").html(html);
                        form.render('select', 'optBuildingForm');
                    });


                });
            }

        };


        //初始化 部位
        SubPage.prototype.initKeypart = function () {

            var that = this;

            laytpl($("#optKeypartTemplate").html()).render({}, function (html) {

                var parent = $("#optKeypart").html(html);
                form.render('select', 'optKeypartForm');
            });

            form.on('select(optKeypart)', function (data) {
                //console.log(data.elem); //得到select原始DOM对象
                //console.log(data.value); //得到被选中的值
                //console.log(data.othis); //得到美化后的DOM对象
                that.optKeypart = data.value;

            });

        };

        //部位 绑定数据
        SubPage.prototype.bindKeypart = function () {

            var that = this;

            if (that.optBuilding === "") {
                laytpl($("#optKeypartTemplate").html()).render({}, function (html) {

                    var parent = $("#optKeypart").html(html);
                    form.render('select', 'optKeypartForm');
                });
                return;
            }
            else {

                var token = neat.getUserToken();

                commonDataApi.getKeypartByBuildingId(token, that.optBuilding, function (resultData) {

                    var d = {};
                    d.data = resultData;
                    laytpl($("#optKeypartTemplate").html()).render(d, function (html) {

                        var parent = $("#optKeypart").html(html);
                        form.render('select', 'optKeypartForm');
                    });

                });
            }

        };


        SubPage.prototype.bindTable = function () {

            var that = this;
            /* 所有的数据列
                id
                status
                deviceCategory
                code
                name
                address
                domainName
                enterpriseName
                keypartName
                buildingName
                heartTime
                alarmStatus
            */

            /* 后端api要求的数据
    
            None = 0,
            Status = 1,
            HeartTime = 2,
            Name = 3,
            DomainName = 4,
            EntName = 5,
            BuildingName = 6,
            KeyPartName = 7,
            Code = 8,
            CreateTime = 9
            */

            function getSortColApiValue(colValue) {
                switch (colValue) {
                    case "id":
                        return "CreateTime";
                    case "status":
                        return "Status";
                    case "code":
                        return "Code";
                    case "name":
                        return "Name";
                        //case "address":
                        //    return "Address";
                        //case "enterpriseName":
                        //    return "EntName";
                        //case "buildingName":
                        //    return "BuildingName";
                        //case "keypartName":
                        //    return "KeyPartName";
                    case "heartTime":
                        return "HeartTime";
                    case "onlineStatus":
                        return "Status";
                    default:
                        return "None";

                }
            }

            var devTypesCtls = $("input[name='devType']");
            var devTypes = [];

            $.each(devTypesCtls, function (_, item) {
                if (item.checked) {
                    devTypes.push($(item).attr("dev-type-value"));
                }

            });

            if (devTypes.length == 0) {
                layui.layer.msg("请勾选设备类别!");
                return;
            }


            var token = neat.getUserToken();
            var treeData = neatNavigator.getSelectedTreeNodeInfo();
            if (!treeData) {
                return;
            }
            var keyword = $.trim($("#txtKeyword").val());


            var orderByColumn = getSortColApiValue(that.currentSortColumn);
            var isDescOrder = that.currentSortOrder === "desc";

            var loadingIndex = layui.layer.load(1);

            var domainId = "";
            var entId = "";

            if (treeData.type == 1) {
                domainId = treeData.id;
                entId = that.optEnt;
            }
            else {
                domainId = "";
                entId = treeData.id;
            }


            pageDataApi.queryDeviceList(token, keyword, domainId, entId, that.optBuilding, that.optKeypart, devTypes.join(),
                orderByColumn, isDescOrder, that.currentPageIndex, that.currentPageSize,
                function (resultData) {
                    layui.layer.close(loadingIndex);
                    //成功
                    table.reload("resultTable", {
                        data: resultData.data,
                        initSort: {
                            field: that.currentSortColumn,
                            type: that.currentSortOrder
                        }
                    });
                    that.initPager(resultData.totalCount, that.currentPageIndex);

                },
                function () { //失败
                    layui.layer.close(loadingIndex);
                    that.currentPageIndex = 1;
                    table.reload("resultTable", {
                        data: [],
                        initSort: {
                            field: that.currentSortColumn,
                            type: that.currentSortOrder
                        }
                    });
                    that.initPager(0, 1);

                    //layer.msg("查询设备信息发生错误!");
                });
        };

        //清空表格
        SubPage.prototype.clearTable = function () {

            var that = this;

            table.reload("resultTable", {
                data: [],
                initSort: {
                    field: that.currentSortColumn,
                    type: that.currentSortOrder
                }
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
                height: 630,
                autoSort: false,
                initSort: {
                    field: that.currentSortColumn,
                    type: that.currentSortOrder
                },
                cols: [
                    [

                        /*
                        "id": "15af8040-30d5-4e0c-bed3-dfe3daf288bc",
                "onlineStatus": 2,
                "deviceCategory": 6,
                "deviceCategoryName": "NB设备",
                "code": "01D7267E0003",
                "name": "NB测试设备",
                "address": "二楼测试部",
                "enterpriseName": "宁浩发展六七分公司",
                "buildingName": "建筑1",
                "keypartName": "软件开发中心7层",
                "heartTime": "2019-04-23 08:29:42",
                "alarmStatus": "None"
                        */
                        { field: 'id', hide: true },
                        { field: 'onlineStatus', title: '状态', sort: true, width: 80, templet: function (d) { return uiTools.renderDeviceOnlineStatus(d.onlineStatus); } },
                        { field: 'code', title: '设备编码', sort: true, width: 220 },
                        { field: 'name', title: '设备名称', sort: true, width: 180 },
                        { field: 'deviceCategoryName', title: '设备类别', width: 150 },
                        //{ field: 'address', title: '安装位置',width: 150 },
                        { field: 'keypartName', title: '所属部位', width: 120 },
                        { field: 'buildingName', title: '所属建筑', width: 120 },
                        { field: 'enterpriseName', title: '所属单位', width: 165 },
                        { field: 'heartTime', title: '最后通讯时间', sort: true, width: 190, templet: function (d) { return layui.neatTools.shortenTimeStr(d.heartTime); } },
                        { field: 'alarmStatus', title: '设备状态', width: 100, templet: function (d) { return uiTools.renderDeviceAlarmStatusByWord(d.alarmStatus); } },
                        { field: 'operation', fixed: 'right', title: '操作', width: 170, align: 'center', toolbar: '#opColTemplate' }
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


        SubPage.prototype.initHashChangedEvent = function () {

            var that = this;
            $(window).on("hashchange", function () {

                var treeData = neatNavigator.getSelectedTreeNodeInfo();
                if (!treeData) {
                    return;
                }
                if (!treeData.fullAccess) {
                    $("#btnDelete").attr("disabled", true);
                }
                else {
                    $("#btnDelete").attr("disabled", false);
                }

                that.domainId = treeData.domainId;
                that.optEnt = treeData.enterpriseId;

                that.currentPageIndex = 1;
                that.bindEnt();
                that.bindBuilding();
                that.bindKeypart();
                that.bindTable();

            });
        };


        //初始化表格操作列的事件
        SubPage.prototype.initTableOperateColEvent = function () {
            var that = this;

            table.on('tool(resultTable)', function (obj) {
                var data = obj.data;

                if (obj.event === 'detail') {

                    popups.showDeviceDetailInfoWindow(data.id, data.deviceCategory);

                } else if (obj.event === 'realtime-data') {

                    popups.showDeviceRealTimeDataWindow(data.id, data.deviceCategory);

                } else if (obj.event === 'history-data') {

                    popups.showDeviceHistoryDataWindow(data.id, data.deviceCategory);

                } else if (obj.event === 'location') {

                    popups.showDeviceMapLocationWindow(data.enterpriseId);

                } else if (obj.event === 'events') {

                    popups.showDeviceHistoryEventWindow(data.id, data.deviceCategory, data.name);
                }

            });
        };

        SubPage.prototype.initCheckboxState = function () {

            var ctls = $("[name='devType']");

            $.each(ctls, function (_, item) {
                var key = $(item).attr("dev-type-value");
              
                var oldState = fav.getGeneralDeviceQueryOption("k" + key);
                
                if (!oldState ) {
                    $(item).removeAttr("checked");
                }
                else {
                    $(item).attr("checked", "checked");
                }
            });

            form.render();


            form.on('checkbox(devType)', function (data) {
                //console.log(data.elem); //得到checkbox原始DOM对象
                //console.log(data.elem.checked); //是否被选中，true或者false
                //console.log(data.value); //复选框value值，也可以通过data.elem.value得到
                //console.log(data.othis); //得到美化后的DOM对象


                var key = $(data.elem).attr("dev-type-value");
               
                fav.setGeneralDeviceQueryOption("k" + key, data.elem.checked);
            });



        };

        SubPage.prototype.initQueryOptions = function () {

            var data = commonDataApi.getCommonQueryDeviceCategoryData();
            var d = {};
            d.data = data;
            var html = laytpl($("#queryConditionTemplate").html()).render(d);

            $("#queryCondition").html(html);
            

        };

        SubPage.prototype.init = function () {


            var that = this;

            this.initDefaultValues();

            //初始化查询 条件部分的html
            this.initQueryOptions();
            // 自动勾选上次选择的设备类型
            this.initCheckboxState();

            this.initHashChangedEvent();

            this.initOptEnt();
            this.initBuilding();
            this.initKeypart();

            this.initTable();
            this.initPager();


            //按钮事件

            //查询
            this.initQueryEvent();
            //刷新
            this.initRefreshEvent();

            //表格操作列事件
            this.initTableOperateColEvent();

            that.bindTable();
        };


        exports(MODULE_NAME, new SubPage());

    });