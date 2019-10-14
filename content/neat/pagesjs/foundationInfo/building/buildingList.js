//建筑管理列表页面


layui.define(["jquery", 'element', 'form', 'table', 'laytpl' , 'laypage','layer', 'neat', 'neatNavigator', 'commonDataApi', 'buildingDataApi'], function (exports) {

    "use strict";

    var $ = layui.$;
    var table = layui.table;
    var form = layui.form;
    var laytpl = layui.laytpl;

    var neat = layui.neat;
    var laypage = layui.laypage;
    var neatNavigator = layui.neatNavigator;
    var commonDataApi = layui.commonDataApi;
    var pageDataApi = layui.buildingDataApi;


    var defaultPageSize = 15;

    var SubPage = function () {

       

    };

    SubPage.prototype._initDefaultValues = function () {

        this.currentPageIndex = 1;
        this.currentPageSize = defaultPageSize;
        this.currentSortColumn = "id";
        this.currentSortOrder = "desc";

        this.optBuildingType = "";
    };






    SubPage.prototype._bindTable = function () {

        var that = this;

        /* 所有的数据列
                "id": "4ecabf9d-1ec3-43df-a3be-bcc0d8de2113",
                "buildingName": "test建筑11111",
                "buildingType": "超高层建筑",
                "archType": "砖木结构",
                "address": "1",
                "height": 1,
                "area": 10,
                "upFloorCount": 10,
                "downFloorCount": 1
        后端api要求的数据
        Id = 0,
Name ,
Address,

        */

        function getSortColApiValue(colValue) {
            switch (colValue) {
                case "buildingName":
                    return "Name";
                case "address":
                    return "Address";
               
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


        var orderByColumn = getSortColApiValue(that.currentSortColumn);
        var isDescOrder = that.currentSortOrder === "desc";

        var loadingIndex = layui.layer.load(1);

        pageDataApi.getBuildings(token, treeData.domainId, treeData.enterpriseId, keyword, that.optBuildingType,
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

                //layer.msg("查询建筑发生错误!");
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

                    /*
{
    "code": 200,
    "message": "ok",
    "result": {
        "totalCount": 1,
        "data": [
            {
                "id": "4ecabf9d-1ec3-43df-a3be-bcc0d8de2113",
                "buildingName": "test建筑11111",
                "buildingType": "超高层建筑",
                "archType": "砖木结构",
                "address": "1",
                "height": 1,
                "area": 10,
                "upFloorCount": 10,
                "downFloorCount": 1
            }
        ]
    }
}
                    */


                    { type: 'checkbox', fixed: 'left' },
                    { field: 'id', title: '',hide:true },
                    { field: 'buildingName', title: '建筑名称', sort: true },
                    { field: 'buildingType', title: '建筑类别' },
                    { field: 'archType', title: '结构类型' },
                    { field: 'address', title: '建筑地址', sort: true },
                    { field: 'height', title: '建筑高度(米)' },
                    { field: 'area', title: '建筑面积(平方米)' },
                     { field: 'upFloorCount', title: '地上层数' },
                     { field: 'downFloorCount', title: '地下层数' },
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

                layer.msg("请选择单位节点进行建筑添加!");
                return;
            }


            var url = "/pages/foundationInfo/building/buildingCreate.html?parentId=" + treeData.enterpriseId
                + "&parentName=" + treeData.name
                + "&__=" + new Date().valueOf().toString();

            layer.open({resize:false,
                type: 2,
                title: '添加建筑',
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
                layer.msg("请勾选需要删除的建筑!");
                return;
            }

            layer.confirm("确定要删除这些建筑吗?", {}, function () {

                $("#btnDelete").attr("disabled", true);

                var ids = [];
                $.each(data, function (_, item) {
                    ids.push(item.id);
                });
                pageDataApi.deleteBuilding(neat.getUserToken(), ids

                     , function (sd) { //成功或者部分成功

                         $("#btnDelete").attr("disabled", false);
                         var alertMsg = "";

                         if (!sd || sd == null || sd.length === 0) {
                             alertMsg = "建筑删除成功!";

                         }
                         else {

                             alertMsg = "以下建筑未能成功删除:<br/>" + sd.join("<br/>");
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

            that._bindTable();


        });
    };

    //初始化表格操作列的事件
    SubPage.prototype._initTableOperateColEvent = function () {
        var that = this;

        table.on('tool(resultTable)', function (obj) {
            var data = obj.data;
            if (obj.event === 'del') {
                layer.confirm('确定要删除建筑:' + data.buildingName + "?", function (index) {
                    var url = "";
                    var sendData = [];
                    sendData.push(data.id);
                    pageDataApi.deleteBuilding(neat.getUserToken(), sendData
                        , function (sd) { //成功或者部分成功

                            var alertMsg = "";

                            if (!sd || sd == null || sd.length === 0) {
                                alertMsg = "建筑删除成功!";
                                obj.del();
                            }
                            else {

                                alertMsg = "以下建筑未能成功删除:<br/>" + sd.join("<br/>");
                            }

                            layer.msg(alertMsg, function () {
                                that._bindTable();
                            });


                        }, function (fd) { //失败
                            layer.msg("删除建筑过程中发生错误!");
                        });

                    layer.close(index);
                });
            } else if (obj.event === 'edit') {

                var url = "/pages/foundationInfo/building/buildingUpdate.html?id=" + data.id

                    + "&__=" + new Date().valueOf().toString();

                layer.open({resize:false,
                    type: 2,
                    title: '编辑建筑',
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

        //初始化建筑类型参数
        this._initBuildingType();

       
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


    exports("pageBuildingList", new SubPage());

});