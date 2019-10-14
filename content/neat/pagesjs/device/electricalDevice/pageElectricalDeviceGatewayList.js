//智慧用电网关 列表页面


layui.define(["jquery", 'element', 'form', 'table', 'laytpl', 'laypage', 'layer', 'neat', 'neatNavigator', 'commonDataApi', 'electricalDeviceDataApi', 'neatUITools', "neatWindowManager", 'neatTools'], function (exports) {

    "use strict";

    var MODULE_NAME = "pageElectricalDeviceGatewayList";

    var $ = layui.$;
    var table = layui.table;
    var form = layui.form;
    var laytpl = layui.laytpl;



    var neat = layui.neat;
    var laypage = layui.laypage;
    var neatNavigator = layui.neatNavigator;
    var commonDataApi = layui.commonDataApi;
    var pageDataApi = layui.electricalDeviceDataApi;
    var uiTools = layui.neatUITools;

    var defaultPageSize = 16;

    var SubPage = function () {

        this.initDefaultValues();

    };

    //绑定状态的数据
    var bindStatusData = commonDataApi.getBindStatusData(neat.getUserToken());

    var dataPropertyNames = {

        id: "id",
        status: "status", //是否在线
        code: "code",
        name: "name",
        chargePerson: "owner",
        address: "address",
        keypart: "keypartName",
        building: "buildingName",
        bindStatus: "isRelate", //绑定状态
        lastTime: "heartTime"
    };

    SubPage.prototype.init = function () {

        var that = this;

        this.initDefaultValues();

        this.initHashChangedEvent();

        this.initOptBindStatus();
        this.initOptEnt();
        this.initBuilding();
        this.initKeypart();

        this.initTable();
        this.initPager();

        //查询
        this.initQueryEvent();
        //刷新
        this.initRefreshEvent();

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
        this.optBindStatus = bindStatusData.binded.id; //已绑定
    };

    //初始化 绑定状态
    SubPage.prototype.initOptBindStatus = function () {

        var that = this;

        form.on('select(optBindStatus)', function (data) {
            //console.log(data.elem); //得到select原始DOM对象
            //console.log(data.value); //得到被选中的值
            //console.log(data.othis); //得到美化后的DOM对象
            that.optBindStatus = data.value;

           
        });

        that.bindOptBindStatus();

    };

    SubPage.prototype.bindOptBindStatus = function () {

        var d = {};
        d.data = [
            bindStatusData.binded,
            bindStatusData.notBind
        ];
        d.selectedValue = this.optBindStatus;

        laytpl($("#optBindStatusTemplate").html()).render(d, function (html) {

            var parent = $("#optBindStatus").html(html);
            form.render('select', 'optBindStatusForm');
        });

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
        function getSortColApiValue(colValue) {
            switch (colValue) {
                case dataPropertyNames.code:
                    return "Code";
                case dataPropertyNames.bindStatus:
                    return "BindStatus";
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


        pageDataApi.queryGatewayList(token, keyword, that.optBindStatus, domainId, entId, that.optBuilding, that.optKeypart,

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

                //layer.msg("查询智慧用电设备发生错误!");
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

        var colTmpl = function (d) {

            var html = "";
            
            if (d[dataPropertyNames.bindStatus].toString() == bindStatusData.binded.id) { //已绑定
                html = '<a lay-event="edit" title="编辑" href="javascript:void(0)" style="color:#babdc9;"><i class="far fa-edit"></i></a>'
                    + ' <a lay-event="reset" title="设备复位" href="javascript:void(0)" style="color:#babdc9;"><i class="fas fa-redo-alt"></i></a>'
                    + ' <a lay-event="upgrade" title="升级" href="javascript:void(0)" style="color:#babdc9;"><i class="fa fa-upload"></i></a>'
                    + ' <a lay-event="maintain-history" title="运维记录" href="javascript:void(0)" style="color:#babdc9;"><i class="fas fa-list-ul"></i></a>'
                    + ' <a lay-event="setting" title="设置" href="javascript:void(0)" style="color:#babdc9;"><i class="fas fa-cog"></i></a>'
                    + ' <a lay-event="mask" title = "屏蔽管理" href = "javascript:void(0)" style = "color:#babdc9;" > <i class="fa fa-eye-slash"></i></a>'
                    + ' <a lay-event="del" title = "删除" href = "javascript:void(0)" style = "color:#babdc9;" > <i class="fas fa-trash-alt"></i></a>';

            }

            return html;
        };

        that.table = table.render({
            elem: '#resultTable',
            id: "resultTable",
            data: [],
            page: false,
            limit: defaultPageSize,
            autoSort: false,
            height: 680,
            initSort: {
                field: that.currentSortColumn,
                type: that.currentSortOrder
            },
            cols: [
                [
                   
                    { field: dataPropertyNames.id, hide: true },
                    { field: dataPropertyNames.status, title: '状态', sort: false, width: 80, templet: function (d) { return uiTools.renderDeviceOnlineStatus(d[dataPropertyNames.status]); } },
                    { field: dataPropertyNames.code, title: '设备编码', sort: true, width: 150 },
                    { field: dataPropertyNames.name, title: '设备名称', sort: false, width: 150 },
                    { field: dataPropertyNames.chargePerson, title: '负责人', sort: false, width: 120 },
                    { field: dataPropertyNames.address, title: '安装位置', sort: false, width: 150 },
                    { field: dataPropertyNames.keypart, title: '所属部位', width: 150 },
                    { field: dataPropertyNames.building, title: '所属建筑', width: 150 },
                    { field: dataPropertyNames.bindStatus, title: '绑定状态', sort: true, width: 120, templet: function (d) { return uiTools.renderBindStatus(d[dataPropertyNames.bindStatus]); } },
                    { field: dataPropertyNames.lastTime, title: '最后通讯时间', sort: false, width: 200, templet: function (d) { return layui.neatTools.shortenTimeStr(d[dataPropertyNames.lastTime]); } },
                    { field: 'operation', fixed: 'right', title: '操作', width: 180, align: 'center', templet: function (d) { return colTmpl(d); } }
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

        var url = "";

        table.on('tool(resultTable)', function (obj) {
            var data = obj.data;
            if (obj.event === 'del') {
                layer.confirm('确定要删除智慧用电设备:' + data.name + "?", function (index) {

                    var sendData = [];
                    sendData.push(data.id);
                    pageDataApi.deleteGateway(neat.getUserToken(), sendData
                        , function (sd) { //成功或者部分成功

                            var alertMsg = "";

                            if (!sd || sd == null || sd.length === 0) {
                                alertMsg = "智慧用电设备删除成功!";
                                obj.del();
                            }
                            else {

                                alertMsg = "以下智慧用电设备未能成功删除:<br/>" + sd.join("<br/>");
                            }

                            layer.msg(alertMsg, function () {
                                that.bindTable();
                            });


                        }, function (fd) {

                            if (typeof fd.message === "string") {
                                layer.msg(fd.message);
                            }
                            else {
                                layer.msg("智慧用电设备删除失败!");
                            }
                        });

                    layer.close(index);
                });
            }
            else if (obj.event === 'edit') {

                url = "/pages/device/electricalDevice/ElectricalDeviceGatewayUpdate.html?id=" + data.id

                    + "&__=" + new Date().valueOf().toString();

                layui.neatWindowManager.openLayerInRootWindow({
                    resize: false,
                    type: 2,
                    title: '编辑智慧用电设备',
                    area: ["806px", "480px"],
                    shade: [0.7, '#000'],
                    content: url,
                    end: function () {
                        that.bindTable();
                    }
                });


            }
            else if (obj.event === "reset") { //复位

                //if (data[dataPropertyNames.status] != "2") {
                //    layer.msg("设备离线,无法发送复位指令!");
                //    return;
                //}

                var layerIndex = layer.load(1);
                pageDataApi.resetGateway(neat.getUserToken(), data[dataPropertyNames.id]
                    , function () {
                        layer.close(layerIndex);

                        layer.msg("复位指令已发送!");
                    }
                    , function (fd) {
                        layer.close(layerIndex);

                        layer.msg(fd.result);
                    }
                );
            }
            else if (obj.event === "setting") {//设置

                url = "/pages/device/electricalDevice/ElectricalDeviceChannelSetting.html?id=" + data.id

                    + "&__=" + new Date().valueOf().toString();

                layui.neatWindowManager.openLayerInRootWindow({
                    resize: false,
                    type: 2,
                    title: '智慧用电设备通道设置',
                    area: ["806px", "720px"],
                    shade: [0.7, '#000'],
                    content: url,
                    end: function () {
                        that.bindTable();
                    }
                });
            
            }
            else if (obj.event === "mask") {//屏蔽管理

                url = "/pages/device/electricalDevice/ElectricalDeviceChannelMask.html?id=" + data.id

                    + "&__=" + new Date().valueOf().toString();

                layui.neatWindowManager.openLayerInRootWindow({
                    resize: false,
                    type: 2,
                    title: '智慧用电设备通道屏蔽管理',
                    area: ["806px", "620px"],
                    shade: [0.7, '#000'],
                    content: url,
                    end: function () {
                        that.bindTable();
                    }
                });

            }
            else if (obj.event === "upgrade") {//升级

                url = "/pages/device/electricalDevice/ElectricalDeviceUpgrade.html?id=" + data.id

                    + "&__=" + new Date().valueOf().toString();

                layui.neatWindowManager.openLayerInRootWindow({
                    resize: false,
                    type: 2,
                    title: '升级文件',
                    area: ["806px", "620px"],
                    shade: [0.7, '#000'],
                    content: url,
                    end: function () {
                        that.bindTable();
                    }
                });

            }
            else if (obj.event === "maintain-history") {//运维记录

                url = "/pages/device/electricalDevice/ElectricalDeviceOperationHistory.html?id=" + data.id

                    + "&__=" + new Date().valueOf().toString();

                layui.neatWindowManager.openLayerInRootWindow({
                    resize: false,
                    type: 2,
                    title: '用电网关运维记录',
                    area: ["806px", "620px"],
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