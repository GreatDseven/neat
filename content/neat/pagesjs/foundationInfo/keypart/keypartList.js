﻿//关键部位列表页面


layui.define(["jquery", 'element', 'form', 'table', 'laytpl' , 'laypage','layer', 'neat', 'neatNavigator', 'commonDataApi', 'keypartDataApi'], function (exports) {

    "use strict";

    var MODULENAME = "pageKeypartList";

    var $ = layui.$;
    var table = layui.table;
    var form = layui.form;
    var laytpl = layui.laytpl;

    var neat = layui.neat;
    var laypage = layui.laypage;
    var neatNavigator = layui.neatNavigator;
    var commonDataApi = layui.commonDataApi;
    var pageDataApi = layui.keypartDataApi;


    var defaultPageSize = 15;

    var SubPage = function () {

        this._initDefaultValues();

    };

    SubPage.prototype._initDefaultValues = function () {

        this.currentPageIndex = 1;
        this.currentPageSize = defaultPageSize;

        this.currentSortColumn = "id";
        this.currentSortOrder = "desc";

        this.optBuildingList = "";
    };

    //初始化建筑列表
    SubPage.prototype._initBuildingList = function () {

        var that = this;

        form.on('select(optBuildingList)', function (data) {
            //console.log(data.elem); //得到select原始DOM对象
            //console.log(data.value); //得到被选中的值
            //console.log(data.othis); //得到美化后的DOM对象
            that.optBuildingList = data.value;

        });
    };

    // 绑定建筑列表
    SubPage.prototype._bindBuildingList = function () {

        var that = this;
        var treeData = neatNavigator.getSelectedTreeNodeInfo();
        if (!treeData) {
            return;
        }

        pageDataApi.getAllBuildings(neat.getUserToken(), treeData.domainId, treeData.enterpriseId, function (resultData) {

            var d = {};
            d.data = resultData;

            laytpl($('#optBuildingListTemplate').html()).render(d, function (html) {
                var parent = $("#optBuildingList").html(html);
                form.render('select', 'optBuildingListForm');
            });

        });
    }

    SubPage.prototype._bindTable = function () {

        var that = this;

        /* 所有的数据列
                              

                "id": "ffb7e9a0-54c5-4339-a3a1-90e6875a5c56",
                "name": "重点1379号部位",
                "floorIndex": 1,
                "buildingName": "25号楼",
                "enterpriseName": "宁浩发展一六分公司",
                "fpinfo": "",
                "address": "25号楼",
                "inChargePerson": ""

        后端api要求的数据
Id 
Name ,
FloorIndex ,
BuildingName,
EnterpriseName,
Address,
InChargePerson

        */

        function getSortColApiValue(colValue) {
            switch (colValue) {
                case "id":
                    return "Id";
                case "name":
                    return "Name";
                case "floorIndex":
                    return "FloorIndex";
                case "buildingName":
                    return "BuildingName";
                case "enterpriseName":
                    return "EnterpriseName";
                case "address":
                    return "Address";
                case "inChargePerson":
                    return "InChargePerson";
                default:
                    return "Id";

            }
        }


        var token = neat.getUserToken();
        var treeData = neatNavigator.getSelectedTreeNodeInfo();
        if (!treeData) {
            return;
        }


        var keyword = $.trim($("#txtkeyWord").val());

        var buildingId = that.optBuildingList;
        var floorIndex = $("#txtFloorIndex").val();


        var orderByColumn = getSortColApiValue(that.currentSortColumn);
        var isDescOrder = that.currentSortOrder === "desc";

        var loadingIndex = layui.layer.load(1);
        pageDataApi.getKeyparts(token, treeData.domainId, treeData.enterpriseId, keyword,buildingId,floorIndex, 
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
                that._initPager(resultData.totalCount, that.currentPageIndex);

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
                that._initPager(0, 1);

                //layer.msg("查询关键部位发生错误!");
            });
    };

    //清空表格
    SubPage.prototype._clearTable = function () {

        var that = this;

        table.reload("resultTable", {
            data: [],
            initSort: {
                field: that.currentSortColumn,
                type: that.currentSortOrder
            }
        });
        that.currentPageIndex = 1;
        that._initPager(0, 1);
    };


    SubPage.prototype._initPager = function (totalCount, pageIndex) {

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
                    that._bindTable(obj.curr, obj.limit);
                }
            }
        });
    };

    SubPage.prototype._initTable = function () {

        var that = this;
        that.table = table.render({
            elem: '#resultTable',
            id: "resultTable",
            data: [],
            page: false,
            limit: defaultPageSize,
            autoSort: false,
            initSort: {
                field: that.currentSortColumn,
                type: that.currentSortOrder
            },
            cols: [
                [
                    { type: 'checkbox', fixed: 'left' },
                    { field: 'id', title: '', hide: true, sort: true },
                    { field: 'name', title: '部位名称', sort: true },
                    { field: 'floorIndex', title: '所在楼层', sort: true },
                    { field: 'buildingName', title: '所属建筑', sort: true },
                    { field: 'enterpriseName', title: '所属单位', sort: true },
                    { field: 'fpinfo', title: '消防设备情况' },
                    { field: 'address', title: '详细位置' },
                     { field: 'inChargePerson', title: '负责人' },
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

            that._bindTable();
        });

    }

    //添加
    SubPage.prototype._initAddEvent = function () {
        var that = this;
        $('#btnAdd').on('click', function () {

            var treeData = neatNavigator.getSelectedTreeNodeInfo();
            if (!treeData) {
                return;
            }

            if (!treeData.enterpriseId) {

                layer.msg("请选择单位节点进行重点部位添加!");
                return;
            }


            var url = "/pages/foundationInfo/keypart/keypartCreate.html?parentId=" + treeData.enterpriseId
                + "&parentName=" + treeData.name
                + "&__=" + new Date().valueOf().toString();

            layer.open({resize:false,
                type: 2,
                title: '添加部位',
                area: ["800px", "530px"],
                shade: [0.7, '#000'],
                content: url,
                end: function () {
                    that._bindTable();
                }
            });
        });
    };

    //查询
    SubPage.prototype._initQueryEvent = function () {
        var that = this;
        $("#btnQuery").on("click", function () {
            that.currentPageIndex = 1;
            that._bindTable();
        });
    };

    //删除
    SubPage.prototype._initDeleteEvent = function () {
        var that = this;
        $('#btnDelete').on('click', function () {


            var checkStatus = table.checkStatus('resultTable');
            var data = checkStatus.data;

            if (data.length === 0) {
                layer.msg("请勾选需要删除的重点部位!");
                return;
            }

            layer.confirm("确定要删除这些重点部位吗?", {}, function () {

                $("#btnDelete").attr("disabled", true);

                var ids = [];
                $.each(data, function (_, item) {
                    ids.push(item.id);
                });
                pageDataApi.deleteKeypart(neat.getUserToken(), ids

                     , function (sd) { //成功或者部分成功

                         $("#btnDelete").attr("disabled", false);
                         var alertMsg = "";

                         if (!sd || sd == null || sd.length === 0) {
                             alertMsg = "重点部位删除成功!";

                         }
                         else {

                             alertMsg = "以下重点部位未能成功删除:<br/>" + sd.join("<br/>");
                         }

                         layer.msg(alertMsg, function () {
                             that._bindTable();
                         });
                     }
                    , function (fd) {

                        $("#btnDelete").attr("disabled", false);

                        layer.msg("删除失败!", function () {
                            that._bindTable();

                        });

                    });
            });

        });
    };



    SubPage.prototype._initHashChangedEvent = function () {

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

            that._initDefaultValues();

            that._bindBuildingList();

            that._bindTable();


        });
    };

    //初始化表格操作列的事件
    SubPage.prototype._initTableOperateColEvent = function () {
        var that = this;

        table.on('tool(resultTable)', function (obj) {
            var data = obj.data;
            if (obj.event === 'del') {
                layer.confirm('确定要删除重点部位:' + data.name + "?", function (index) {
                    var url = "";
                    var sendData = [];
                    sendData.push(data.id);
                    pageDataApi.deleteKeypart(neat.getUserToken(), sendData
                        , function (sd) { //成功或者部分成功

                            var alertMsg = "";

                            if (!sd || sd == null || sd.length === 0) {
                                alertMsg = "重点部位删除成功!";
                                obj.del();
                            }
                            else {

                                alertMsg = "以下重点部位未能成功删除:<br/>" + sd.join("<br/>");
                            }

                            layer.msg(alertMsg, function () {
                                that._bindTable();
                            });


                        }, function (fd) { //失败
                            layer.msg("删除重点部位中发生错误!");
                        });

                    layer.close(index);
                });
            } else if (obj.event === 'edit') {

                var url = "/pages/foundationInfo/keypart/keypartUpdate.html?id=" + data.id

                    + "&__=" + new Date().valueOf().toString();

                layer.open({resize:false,
                    type: 2,
                    title: '编辑重点部位',
                    area: ["800px", "530px"],
                    shade: [0.7, '#000'],
                    content: url,
                    end: function () {
                        that._bindTable();
                    }
                });


            }
        });
    };

    //初始化建筑类型参数
    SubPage.prototype._initBuildingType = function () {

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

    SubPage.prototype.init = function () {

        var that = this;

        this._initDefaultValues();

        this._initHashChangedEvent();

        //初始化建筑列表
        this._initBuildingList();

        this._bindBuildingList();

       
        this._initTable();
        this._initPager();


        //三个按钮事件

        //查询
        this._initQueryEvent();
        //添加
        this._initAddEvent();
        //删除
        this._initDeleteEvent();

        //表格操作列事件
        this._initTableOperateColEvent();



        that._bindTable();
    };


    exports(MODULENAME, new SubPage());

});