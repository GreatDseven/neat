//neat水网关 列表页面


layui.define(["jquery", 'element', 'form', 'table', 'laytpl', 'laypage', 'layer', 'neat', 'neatNavigator', 'commonDataApi', 'waterDeviceDataApi', 'neatUITools', "neatWindowManager",'neatTools'], function (exports) {

    "use strict";

    var MODULE_NAME = "pageNEATWaterGatewayList";

    var $ = layui.$;
    var table = layui.table;
    var form = layui.form;
    var laytpl = layui.laytpl;



    var neat = layui.neat;
    var laypage = layui.laypage;
    var neatNavigator = layui.neatNavigator;
    var commonDataApi = layui.commonDataApi;
    var pageDataApi = layui.waterDeviceDataApi;
    var uiTools = layui.neatUITools;

    var defaultPageSize = 15;

    var SubPage = function () {

        this.initDefaultValues();

    };


    SubPage.prototype.init = function () {


        var that = this;

        this.initDefaultValues();

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


        //添加
        this.initAddEvent();
        //删除
        this.initDeleteEvent();

        //表格操作列事件
        this.initTableOperateColEvent();



        that.bindTable();
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
        if (!treeData) {
            return;
        }

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
            "id": "48b6d202-1e0d-4858-bacb-c27f25851acd",
                "code": "02.06.01.01.01.01",
                "name": "neat水网关",
                "manufacturer": "尼特",
                "domainId": "00000000-0000-0000-0000-000000000000",
                "entId": "5ebc62e3-3ee6-4d88-a335-b077f5504961",
                "buildingId": "48b6d202-1e0d-4858-bacb-c27f25851acd",
                "keypartId": "48b6d202-1e0d-4858-bacb-c27f25851acd",
                "entName": "研发楼",
                "buildingName": null,
                "keypartName": null,
                "address": "安装位置",
                "status": 0,
                "heartTime": "1970-01-01 08:00:00"
        */

        /* 后端api要求的数据


 None,
    ID,
    Status,
    Code,
    Name,
    Address,
    LastCommunicationTime,
    CreateTime
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
                case "address":
                    return "Address";
                case "heartTime":
                    return "LastCommunicationTime";
                default:
                    return "None";

            }
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


        pageDataApi.queryNEATWaterGateway(token, keyword, domainId, entId, that.optBuilding, that.optKeypart,

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

                //layer.msg("查询NEAT水设备发生错误!");
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
            autoSort: false,
             height:640,
            initSort: {
                field: that.currentSortColumn,
                type: that.currentSortOrder
            },
            cols: [
                [
                    { type: 'checkbox', fixed: 'left' },

                    /*
"id": "48b6d202-1e0d-4858-bacb-c27f25851acd",
                "code": "02.06.01.01.01.01",
                "name": "neat水网关",
                "manufacturer": "",
                "domainId": "00000000-0000-0000-0000-000000000000",
                "entId": "5ebc62e3-3ee6-4d88-a335-b077f5504961",
                "buildingId": "48b6d202-1e0d-4858-bacb-c27f25851acd",
                "keypartId": "48b6d202-1e0d-4858-bacb-c27f25851acd",
                "entName": "",
                "buildingName": "",
                "keypartName": "",
                "address": "安装位置",
                "status": 0
                     */
                    { field: 'id', hide:true },
                    { field: 'status', title: '联网状态', sort: true, width: 120, templet: function (d) { return uiTools.renderDeviceOnlineStatus(d.status); } },
                    { field: 'code', title: '设备编码', sort: true, width: 170 },
                    { field: 'name', title: '设备名称', sort: true, width: 200 },
                    { field: 'address', title: '安装位置', sort: true, width: 180 },
                    { field: 'keypartName', title: '所属部位', width: 220 },
                    { field: 'buildingName', title: '所属建筑', width: 220 },
                    { field: 'heartTime', title: '最后通讯时间',sort: true,  width: 200, templet: function (d) { return layui.neatTools.shortenTimeStr(d.heartTime); } },
                    { field: 'operation', fixed: 'right', title: '操作', width: 150, align: 'center', toolbar: '#opColTemplate' }
                ]
            ],
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



    }




    //添加
    SubPage.prototype.initAddEvent = function () {
        var that = this;
        $('#btnAdd').on('click', function () {

            var treeData = neatNavigator.getSelectedTreeNodeInfo();
            if (!treeData) {
                return;
            }

            if (!treeData.enterpriseId) {

                layer.msg("请选择单位节点进行NEAT水设备添加!");
                return;
            }


            var url = "/pages/device/waterDevice/neat/NEATWaterGatewayCreate.html?"
                + "enterprise_id=" + treeData.enterpriseId
                + "&enterprise_name=" + treeData.name
                + "&__=" + new Date().valueOf().toString();

            layui.neatWindowManager.openLayerInRootWindow({
                resize: false,
                type: 2,
                title: '添加NEAT水设备',
                area: ["806px", "360px"],
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
                layer.msg("请勾选需要删除的NEAT水设备!");
                return;
            }

            layer.confirm("确定要删除这些NEAT水设备吗?", {}, function () {

                $("#btnDelete").attr("disabled", true);

                var ids = [];
                $.each(data, function (_, item) {
                    ids.push(item.id);
                });
                pageDataApi.deleteNEATWaterGateway(neat.getUserToken(), ids

                    , function (sd) { //成功或者部分成功
                       
                        $("#btnDelete").attr("disabled", false);
                        var alertMsg = "";

                        if (!sd || sd == null || sd.length === 0) {
                            alertMsg = "NEAT水设备删除成功!";

                        }
                        else {

                            alertMsg = "以下NEAT水设备未能成功删除:<br/>" + sd.join("<br/>");
                        }

                        layer.msg(alertMsg, function () {
                            that.bindTable();
                        });
                    }
                   , function (fd) {


                       $("#btnSave").attr("disabled", false);

                       if (typeof fd.message === "string") {
                           layer.msg(fd.message);
                       }
                       else {
                           layer.msg("NEAT水设备删除失败!");
                       }
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
            if (obj.event === 'del') {
                layer.confirm('确定要删除NEAT水设备:' + data.name + "?", function (index) {

                    var sendData = [];
                    sendData.push(data.id);
                    pageDataApi.deleteNEATWaterGateway(neat.getUserToken(), sendData
                        , function (sd) { //成功或者部分成功

                            var alertMsg = "";

                            if (!sd || sd == null || sd.length === 0) {
                                alertMsg = "NEAT水设备删除成功!";
                                obj.del();
                            }
                            else {

                                alertMsg = "以下NEAT水设备未能成功删除:<br/>" + sd.join("<br/>");
                            }

                            layer.msg(alertMsg, function () {
                                that.bindTable();
                            });


                        }, function (fd) {

                            if (typeof fd.message === "string") {
                                layer.msg(fd.message);
                            }
                            else {
                                layer.msg("NEAT水设备删除失败!");
                            }
                        });

                    layer.close(index);
                });
            } else if (obj.event === 'edit') {

                var url = "/pages/device/waterDevice/neat/NEATWaterGatewayUpdate.html?wgw_id=" + data.id

                    + "&__=" + new Date().valueOf().toString();

                layui.neatWindowManager.openLayerInRootWindow({
                    resize: false,
                    type: 2,
                    title: '编辑NEAT水设备',
                    area: ["806px", "360px"],
                    shade: [0.7, '#000'],
                    content: url,
                    end: function () {
                        that.bindTable();
                    }
                });


            } else if (obj.event === 'mgr') {
                var url = "/pages/device/waterDevice/neat/NEATWaterSignalList.html?gateway_id=" + data.id
                    + "&gateway_name=" + encodeURIComponent(data.name)
                    + "&gateway_code=" + encodeURIComponent(data.code)
                    + "&__=" + new Date().valueOf().toString();

                layui.neatWindowManager.openLayerInRootWindow({
                    resize: false,
                    type: 2,
                    title: '水信号管理',
                    area: ["1100px", "600px"],
                    shade: [0.7, '#000'],
                    content: url,
                    end: function () {
                        that.bindTable();
                    }
                });
            }

        });
    };

   


    exports(MODULE_NAME, new SubPage());

});