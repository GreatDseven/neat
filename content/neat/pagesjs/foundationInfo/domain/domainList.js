//中心管理


layui.define(["jquery", 'element', 'form', 'table', 'laytpl', 'laypage','layer', 'neat', 'neatNavigator', 'commonDataApi', 'domainDataApi','pageBoard'], function (exports) {

    "use strict";

    var $ = layui.$;
    var table = layui.table;
    var form = layui.form;
    var laytpl = layui.laytpl;

    var neat = layui.neat;
    var laypage = layui.laypage;
    var neatNavigator = layui.neatNavigator;
    var commonDataApi = layui.commonDataApi;
    var pageDataApi = layui.domainDataApi;


    var defaultPageSize = 15;

    var SubPage = function () {

        this._initDefaultValues();

    };

    SubPage.prototype._initDefaultValues = function () {

        this.currentPageIndex = 1;
        this.currentPageSize = 15;
        this.currentSortColumn = "name";
        this.currentSortOrder = "desc";

    };

        //绑定表格数据
    SubPage.prototype._bindTable = function () {

        var that = this;
        /* 所有的数据列
                             
address: null
id: "f96c7500-a63d-44fd-8714-c40474dd8350"
inChangePerson: "胡静"
mobilePhone: "15803345687"
name: "海港区"
parantDomainName: "秦皇岛"
telephone: null
                 

        后端api要求的数据
        Id = 0,
        Name ,
        Address ,
        InChargePerson ,
        ParentDomain 
        */

        function getSortColApiValue(colValue) {
            switch (colValue) {
                case "name":
                    return "Name";
                case "address":
                    return "Address";
                case "inChangePerson":
                    return "InChargePerson";
                case "parentDomainName":
                    return "ParentDomain";
                default:
                    return "Id";

            }
        }


        var token = neat.getUserToken();
        var treeData = neatNavigator.getSelectedTreeNodeInfo();
        if (!treeData) {
            return;
        }

        if (!treeData.domainId)
        {
            return;
        }

        var keyword = $.trim($("#txtDomainName").val());


        var orderByColumn = getSortColApiValue(that.currentSortColumn);
        var isDescOrder = that.currentSortOrder === "desc";

        var loadingIndex = layui.layer.load(1);

        pageDataApi.getDomains(token, treeData.domainId, keyword,
            
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

                //layer.msg("查询中心发生错误!");
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
                    address: null
id: "f96c7500-a63d-44fd-8714-c40474dd8350"
inChangePerson: "胡静"
mobilePhone: "15803345687"
name: "海港区"
parentDomainName: "秦皇岛"
telephone: null
                    */

                    { type: 'checkbox', fixed: 'left' },
                    { field: 'name', title: '中心名称', sort: true },
                    { field: 'address', title: '中心地址', sort: true },
                    { field: 'inChangePerson', title: '负责人', sort: true },
                    { field: 'mobilePhone', title: '联系电话', },
                    { field: 'telephone', title: '固定电话', },
                    { field: 'parentDomainName', title: '上级中心', sort: true },
                    { field: 'operation', fixed: 'right', title: '操作', align: 'center', toolbar: '#opColTemplate' }
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

            that._bindTable();

            //layer.msg('服务端排序。order by ' + obj.field + ' ' + obj.type);
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

            if (!treeData.domainId) {

                layer.msg("请选择中心节点进行中心添加!");
                return;
            }


            var url = "/pages/foundationInfo/domain/domainCreate.html?parentId=" + treeData.domainId
                + "&parentName=" + treeData.name
                + "&__=" + new Date().valueOf().toString();

            layer.open({resize:false,
                type: 2,
                title: '添加中心',
                area: ["806px", "370px"],
                shade: [0.7, '#000'],
                content: url,
                end: function () {
                    that._bindTable();
                    that._refreshPageTree();
                }
            });
        });
    };

        //刷新左侧的树
    SubPage.prototype._refreshPageTree = function () {

        layui.pageBoard.refreshTree();
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
                layer.msg("请勾选需要删除的中心!");
                return;
            }

            layer.confirm("确定要删除这些中心吗?", {}, function () {

                $("#btnDelete").attr("disabled", true);

                var ids = [];
                $.each(data, function (_, item) {
                    ids.push(item.id);
                });
                pageDataApi.deleteDomain(neat.getUserToken(), ids

                     , function (sd) { //成功或者部分成功

                         $("#btnDelete").attr("disabled", false);
                         var alertMsg = "";

                         if (!sd || sd == null || sd.length === 0) {
                             alertMsg = "中心删除成功!";

                         }
                         else {

                             alertMsg = "以下中心未能成功删除:<br/>" + sd.join("<br/>");
                         }

                         layer.msg(alertMsg, function () {
                             that._bindTable();
                             that._refreshPageTree();
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
                layer.confirm('确定要删除中心:' + data.name + "?", function (index) {
                    var url = "";


                    var sendData = [];
                    sendData.push(data.id);
                    pageDataApi.deleteDomain(neat.getUserToken(), sendData
                        , function (sd) { //成功或者部分成功

                            var alertMsg = "";

                            if (!sd || sd == null || sd.length === 0) {
                                alertMsg = "中心删除成功!";
                                obj.del();
                            }
                            else {

                                alertMsg = "以下中心未能成功删除:<br/>" + sd.join("<br/>");
                            }

                            layer.msg(alertMsg, function () {
                                that._bindTable();
                                that._refreshPageTree();
                            });


                        }, function (fd) { //失败
                            layer.msg("删除中心过程中发生错误!");
                        });

                    layer.close(index);
                });
            } else if (obj.event === 'edit') {

                var url = "/pages/foundationInfo/domain/domainUpdate.html?id=" + data.id

                    + "&__=" + new Date().valueOf().toString();

                layer.open({resize:false,
                    type: 2,
                    title: '编辑中心',
                    area: ["806px", "370px"],
                    shade: [0.7, '#000'],
                    content: url,
                    end: function () {
                        that._bindTable();
                        that._refreshPageTree();
                    }
                });


            }
        });
    };

   

    SubPage.prototype.init = function () {

        var that = this;

        this._initDefaultValues();

        this._initHashChangedEvent();

       
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


    exports("pageDomainList", new SubPage());

});