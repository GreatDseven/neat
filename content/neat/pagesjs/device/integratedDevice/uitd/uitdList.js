//用户信息传输装置 列表页面 
layui.define(["jquery", 'form', 'table', 'laytpl', 'laypage', 'layer'
    , 'commonDataApi', 'neatDataApi', 'neat', 'neatNavigator', 'integratedDeviceDataApi', "neatUITools", "neatTools", "neatWindowManager",'neatTools'], function (exports) {

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
        var pageDataApi = layui.integratedDeviceDataApi;
        var uiTools = layui.neatUITools;
        var tools = layui.neatTools;

        var limitCount = 15;

        //返回的所有字段名称
        var dataPropertyNames = {
            id: "id",
            domainId: "domainId",
            entId: "enterpriseId",
            domainName: "domainName",
            entName: "entName",
            status: "onlineStatus",
            code: "code",
            name: "name",
            deviceType: "deviceType",
            manufacturer: "manufacturer",
            address: "address",
            keypartName: "keypartName",
            buildingName: "buildingName",
            lastCommunicationTime: "lastCommunicationTime",
            buildingId: "buildingId",
            keypartId: "keypartId",
        };
      

        var SubPage = function () {
            this.enterpriseId = '';
            this.buildingId = '';
            this.keypartId = '';
            this.currentPageSize = -1;
            this.currentPageIndex = 1;
            this.currentPageSize = 15;
            this.orderByCol = dataPropertyNames.id;
            this.orderSort = 'desc';
        };

        SubPage.prototype.init = function () {
            var that = this;


            that.initSortColMapping();

            

            that.hashChanged();

            // 初始化单位信息
            this.initEnterprise();

            // 初始化建筑信息
            this.initBuildingList();

            // 填充建筑信息
            this.initKeypartList();

            this.initTable();

            // 工具栏中的删除事件
            $('#del').on('click', function () {
                var type = $(this).data('type');
                if (type == 'del') {
                    var checkStatus = table.checkStatus('uitdList');
                    var data = checkStatus.data;
                    that.deleteById(data, null);
                };

            });

            // 工具栏中的添加事件
            $('#add').on('click', function () {

                var treeData = neatNavigator.getSelectedTreeNodeInfo();
                if (!treeData) {
                    return;
                }
                if (treeData.enterpriseId == '') {
                    layer.msg("请选择单位节点进行传输设备添加!");
                    return;
                }

                var url = "/pages/device/integratedDevice/uitd/uitdCreate.html?ent_id=" + treeData.enterpriseId
                    + "&ent_name=" + encodeURIComponent(treeData.name)
                    + "&__=" + new Date().valueOf().toString();

                layer.open({
                    resize: false,
                    type: 2,
                    title: '添加传输设备',
                    area: ["810px", "424px"],
                    content: url,
                    end: function () {
                        // 重新绑定数据   
                        that.bindTable();
                    }
                });
            });

            // 搜索事件
            $('#btnSearch').on('click', function () {
                that.currentPageIndex = 1;
                that.bindTable();
            });
        };

        // 初始化单位控件
        SubPage.prototype.initEnterprise = function () {
            var that = this;

            // 下拉框发生选中改变得事件
            form.on('select(enterprise)', function (data) {
                that.enterpriseId = data.value;
                that.buildBuildingList();
            });

            // 初始化数据
            that.buildEnterprise();
        };

        // 绑定单位数据
        SubPage.prototype.buildEnterprise = function () {
            var that = this;
            var token = base.getUserToken();

            var treeData = neatNavigator.getSelectedTreeNodeInfo();
            if (!treeData) {
                return;
            }
            if (treeData.domainId == "") {
                //选中的是企业节点
                var d = {};
                d.data = [{ id: treeData.enterpriseId, name: treeData.name }];
                laytpl($("#optEnterpriseListTemplate").html()).render(d, function (html) {
                    var parent = $("select[name=enterprise]").html(html);
                    form.render('select', 'enterprise');
                });
            }
            else {
                commonDataApi.getEntByDomainId(token, treeData.domainId, function (resultData) {
                    var d = {};
                    d.data = resultData;
                    laytpl($("#optEnterpriseListTemplate").html()).render(d, function (html) {
                        var parent = $("select[name=enterprise]").html(html);
                        form.render('select', 'enterprise');
                    });
                });
            }
        };

        // 初始化建筑控件
        SubPage.prototype.initBuildingList = function () {
            var that = this;
            laytpl($("#optBuildingListTemplate").html()).render({}, function (html) {

                $("select[name=building]").html(html);
                form.render('select', 'building');
            });

            form.on('select(building)', function (data) {
                //console.log(data.elem); //得到select原始DOM对象
                //console.log(data.value); //得到被选中的值
                //console.log(data.othis); //得到美化后的DOM对象
                that.buildingId = data.value;
                // 绑定部位数据
                that.buildKeypartList();
            });
        }

        // 绑定建筑列表
        SubPage.prototype.buildBuildingList = function () {
            var that = this;

            if (that.enterpriseId === "") {
                laytpl($("#optBuildingListTemplate").html()).render({}, function (html) {
                    var parent = $("select[name=building]").html(html);
                    form.render('select', 'building');
                });
            }
            else {
                var token = base.getUserToken();

                commonDataApi.getBuildingByEntId(token, that.enterpriseId, function (resultData) {
                    var d = {};
                    d.data = resultData;
                    laytpl($("#optBuildingListTemplate").html()).render(d, function (html) {
                        var parent = $("select[name=building]").html(html);
                        form.render('select', 'building');
                    });
                });
            }
        }

        // 初始化部位控件
        SubPage.prototype.initKeypartList = function () {
            var that = this;
            laytpl($("#optKeypartListTemplate").html()).render({}, function (html) {
                var parent = $("select[name=keypart]").html(html);
                form.render('select', 'keypart');
            });

            form.on('select(keypart)', function (data) {
                //console.log(data.elem); //得到select原始DOM对象
                //console.log(data.value); //得到被选中的值
                //console.log(data.othis); //得到美化后的DOM对象
                that.keypartId = data.value;
            });
        }

        // 绑定部位数据
        SubPage.prototype.buildKeypartList = function () {
            var that = this;

            if (that.buildingId === "") {
                laytpl($("#optKeypartListTemplate").html()).render({}, function (html) {
                    var parent = $("select[name=keypart]").html(html);
                    form.render('select', 'keypart');
                });
                return;
            }
            else {
                var token = base.getUserToken();

                commonDataApi.getKeypartByBuildingId(token, that.buildingId, function (resultData) {
                    var d = {};
                    d.data = resultData;
                    laytpl($("#optKeypartListTemplate").html()).render(d, function (html) {
                        var parent = $("select[name=keypart]").html(html);
                        form.render('select', 'keypart');
                    });
                });
            }
        }

      


        // 加载 用户信息传输设备列表，并监听相关的表格事件
        SubPage.prototype.initTable = function () {
            var that = this;

            // 渲染 用户信息传输装置列表
            table.render({
                elem: '#uitdList',
                id: 'uitdList'
                , page: false
                , limit: limitCount
                , autoSort: false
                , height:640
                , initSort: {
                    field: this.orderByCol,
                    type: this.orderSort
                }
                
                , loading: false
                , data: []
                , cols: [[
                    { type: 'checkbox', fixed: 'left' }
                    , { field: dataPropertyNames.id,hide:true }
                    , { field: dataPropertyNames.status, title: '状态', width: 80, templet: function (d) { return uiTools.renderDeviceOnlineStatus(d[dataPropertyNames.status]); } }
                    , { field: dataPropertyNames.code, title: '设备编码', sort: true, width: 220 }
                    , { field: dataPropertyNames.name, title: '设备名称', sort: true, width: 180 }
                    , { field: dataPropertyNames.deviceType, title: '设备类型', sort: true, width: 150 }
                    , { field: dataPropertyNames.manufacturer, title: '生产厂商', width: 120 }
                    //, { field: dataPropertyNames.address, title: '安装位置', width: 150 }
                    , { field: dataPropertyNames.keypartName, title: '所属部位', width: 180 }
                    , { field: dataPropertyNames.buildingName, title: '所属建筑', width: 180 }
                    , { field: dataPropertyNames.lastCommunicationTime, title: '最后通讯时间', width: 190, templet: function (d) { return layui.neatTools.shortenTimeStr(d[dataPropertyNames.lastCommunicationTime]); } }
                    , { fixed: 'right', title: '操作', toolbar: '#operationBar', align: 'center', width: 150 }
                ]]
            });

            //监听工具条
            table.on('tool(uitdList)', function (obj) {
                var data = obj.data;
                var url = "";
                if (obj.event === 'del') {
                    layer.confirm('确定的删除此传输设备么？', { icon: 3, title: '提示' }, function (index) {
                        that.deleteById(new Array(data), obj);
                    });
                } else if (obj.event === 'edit') {
                    url = "/pages/device/integratedDevice/uitd/uitdUpdate.html?uitd_id=" + data[dataPropertyNames.id]
                        + "&__=" + new Date().valueOf().toString();

                    layer.open({
                        resize: false,
                        type: 2,
                        title: '编辑传输设备',
                        area: ["810px", "424px"],
                        content: url,
                        end: function () {
                            // 刷新数据
                            that.bindTable();
                        }
                    });
                } else if (obj.event === 'firehostmgr') {

                    url = "/pages/device/integratedDevice/fireHost/fireHostList.html?uitd_id=" + data[dataPropertyNames.id]
                        + "&uitd_code=" + data[dataPropertyNames.code]
                        + "&uitd_name=" + data[dataPropertyNames.name]
                        + "&ent_id=" + data[dataPropertyNames.entId]
                        + "&__=" + new Date().valueOf().toString();

                    layui.neatWindowManager.openLayerInRootWindow({
                        resize: false,
                        type: 2,
                        title: '消防主机管理',
                        area: ["1200px", "700px"],
                        content: url
                    });
                }
            });

            // 监听排序列
            table.on('sort(uitdList)', function (obj) {
                that.orderByCol = obj.field;
                that.orderSort = obj.type;
                // 绑定数据
                that.bindTable();
            });

            that.bindTable();
        };

        //排序转换的字典
        var sortColNameMap = {};

        //服务端需要的排序字段名称
        var serverSortCol = {
            ID:"ID",
            Status:"Status",
            Code:"Code",
            Name:"Name",
            Address:"Address",
            LastCommunicationTime: "LastCommunicationTime",
            CreateTime: "CreateTime"

        };

        // 初始化排序映射字段.
        SubPage.prototype.initSortColMapping = function () {

            sortColNameMap[dataPropertyNames.id] = serverSortCol.CreateTime;
            sortColNameMap[dataPropertyNames.status] = serverSortCol.Status;
            sortColNameMap[dataPropertyNames.code] = serverSortCol.Code;
            sortColNameMap[dataPropertyNames.name] = serverSortCol.Name;
            sortColNameMap[dataPropertyNames.address] = serverSortCol.Address;
            sortColNameMap[dataPropertyNames.lastCommunicationTime] = serverSortCol.LastCommunicationTime;

        };

        // 加载列表数据
        SubPage.prototype.bindTable = function () {

            var that = this;

            /* 所有的数据列
               id
               status
               code
               name
               deviceType
               manufacturer
               address
               KeypartName
               buildingName
               lastCommunicationTime
                        HeartTime
            */

            function getSortColApiValue(colName) {
                if (typeof (sortColNameMap[colName]) === "undefined") {
                    return "None";
                }
                return sortColNameMap[colName];
            }
           
            var orderByColumn = getSortColApiValue(that.orderByCol);
            var isDescOrder = that.orderSort === "desc";

            var loadingIndex = layui.layer.load(1);
            var treeData = neatNavigator.getSelectedTreeNodeInfo();
            if (!treeData) {
                return;
            }

            var domainId = "";
            var entId = "";

            if (treeData.type == 1) {
                domainId = treeData.id;
                entId = that.enterpriseId;
            }
            else {
                domainId = "";
                entId = treeData.id;
            }



            pageDataApi.queryUITDDeviceList(base.getUserToken(), $.trim($("#txtkeyword").val()),
                domainId, entId, that.buildingId, that.keypartId,
                orderByColumn, isDescOrder, that.currentPageIndex, limitCount,
                function (result) {

                    that.reloadTable(result);
                    layui.layer.close(loadingIndex);
                },
                function () { //失败

                    layui.layer.close(loadingIndex);
                    that.currentPageIndex = 1;

                    that.reloadTable({ data: [], totalCount: 0 });

                    //layer.msg("查询传输设备发生错误!");
                });
        };

        // 重新加载列表
        SubPage.prototype.reloadTable = function (result) {
            var that = this;

            table.reload("uitdList", {
                data: result.data,
                initSort: {
                    field: that.orderByCol,
                    type: that.orderSort
                }
            });
            that.initPage(result.totalCount, that.currentPageIndex);
        }

        // 删除用户信息传输设备类型
        SubPage.prototype.deleteById = function (data, obj) {
            var that = this;

            if (data.length == 0) {
                layer.confirm('请勾选删除项', {}, function (index) {
                    layer.close(index);
                });
            } else {
                var datasArray = new Array(data.length);
                for (var i = 0; i < data.length; i++) {
                    datasArray[i] = data[i].id;
                }

                $("#del").attr("disabled", true);

                pageDataApi.deleteUITDById(base.getUserToken(), datasArray, function (result) {
                    var messageStr = '';
                    $("#del").attr("disabled", false);
                    if (!result || result == null || result.length === 0) {
                        if (obj != null) {
                            obj.del();
                        }

                        messageStr = '传输设备删除成功';
                    } else {
                        messageStr = "以下传输设备删除失败:<br/>" + result.join("<br/>");
                    }

                    layer.msg(messageStr, function (index) {
                        that.bindTable();
                    });
                }, function (errorMsg) {
                    $("#del").attr("disabled", false);

                    layer.msg('传输设备删除失败！', function (index) {
                        that.bindTable();
                    });
                });
            }
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
                elem: 'tableUitdListPager',
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
        }



        SubPage.prototype.hashChanged = function (e) {
            var that = this;
            $(window).on("hashchange", function () {

                var treeData = neatNavigator.getSelectedTreeNodeInfo();
                if (!treeData) {
                    return;
                }
               
                that.domainId = treeData.domainId;
                that.enterpriseId = treeData.enterpriseId;
                that.buildingId = '';
                that.keypartId = '';
                that.currentPageSize = -1;
                that.currentPageIndex = 1;
                that.currentPageSize = 15;
                //that.orderByCol = 'uitdName';
                //that.orderSort = 'desc';

                that.buildEnterprise();
                that.buildBuildingList();
                that.buildKeypartList();
                that.bindTable();
            });
        };


        exports("pageIntegratedUITDList", new SubPage());
    });