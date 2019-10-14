//巡检点管理


layui.define(["jquery", 'element', 'form', 'table', 'laytpl', 'laypage','layer', 'neat', 'neatNavigator', 'commonDataApi', 'patrolPointDataApi'], function (exports) {

    "use strict";

    var $ = layui.$;
    var table = layui.table;
    var form = layui.form;
    var laytpl = layui.laytpl;
 
    var neat = layui.neat;
    var laypage = layui.laypage;
    var neatNavigator = layui.neatNavigator;
    var commonDataApi = layui.commonDataApi;
    var pointDataApi = layui.patrolPointDataApi;


    var defaultPageSize = 15;

    var SubPage = function () {

        this._initDefaultValues();
       
    };

    SubPage.prototype._initDefaultValues = function () {

        this.currentPageIndex = 1;
        this.currentPageSize = 15;
        this.currentSortColumn = "pointName";
        this.currentSortOrder = "desc";

        this.optBindType = "0";
        this.optUseType = "0";

        this.optPrjType = "";
        this.optSubType = "";
    };



    //初始化 项目类型
    SubPage.prototype._initPrjType = function () {

        var that = this;

        form.on('select(optPrjType)', function (data) {
            //console.log(data.elem); //得到select原始DOM对象
            //console.log(data.value); //得到被选中的值
            //console.log(data.othis); //得到美化后的DOM对象
            that.optPrjType = data.value;

            that._bindPrjSubType();
        });

        that._bindPrjType();
    };
    //绑定 项目类型
    SubPage.prototype._bindPrjType = function () {

        var that = this;
        var token = neat.getUserToken();
        var treeData = neatNavigator.getSelectedTreeNodeInfo();
        if (!treeData) {
            return;
        }

        commonDataApi.getProjectType("", token, treeData.domainId, treeData.enterpriseId, function (resultData) {

            var d = {};
            d.data = resultData;
            laytpl($("#optPrjTypeTemplate").html()).render(d, function (html) {

                var parent = $("#optPrjType").html(html);
                form.render('select', 'optPrjTypeForm');
            });


        });
    };


    //初始化 项目子类型
    SubPage.prototype._initPrjSubType = function () {

        var that = this;

        laytpl($("#optPrjSubTypeTemplate").html()).render({}, function (html) {

            var parent = $("#optSubType").html(html);
            form.render('select', 'optSubTypeForm');
        });

        form.on('select(optSubType)', function (data) {
            //console.log(data.elem); //得到select原始DOM对象
            //console.log(data.value); //得到被选中的值
            //console.log(data.othis); //得到美化后的DOM对象
            that.optSubType = data.value;

        });
      
    };

    //项目子类型 绑定数据
    SubPage.prototype._bindPrjSubType = function () {

        var that = this;

        if (that.optPrjType === "")
        {
            laytpl($("#optPrjSubTypeTemplate").html()).render({}, function (html) {

                var parent = $("#optSubType").html(html);
                form.render('select', 'optSubTypeForm');
            });
            return;
        }

        var token = neat.getUserToken();
        var treeData = neatNavigator.getSelectedTreeNodeInfo();
        if (!treeData) {
            return;
        }

        commonDataApi.getProjectType(that.optPrjType, token, treeData.domainId,treeData.enterpriseId, function (resultData) {

            var d = {};
            d.data = resultData;
            laytpl($("#optPrjSubTypeTemplate").html()).render(d, function (html) {

                var parent = $("#optSubType").html(html);
                form.render('select', 'optSubTypeForm');
            });


        });

    };



    SubPage.prototype._bindTable = function () {

        var that = this;
        /* 所有的数据列
            id
            pointName
            flag
            domainName
            enterpriseName
            buildingName
            keyPartName
            proTypeName
            proChildTypeName
        */

        /* 后端api要求的数据
            None,
            PointInfoName,
            ProChildTypeName,
            EntName
        */

        function getSortColApiValue(colValue) {
            switch (colValue) {
                case "pointName":
                    return "PointInfoName";
                case "enterpriseName":
                    return "EntName";
                case "proChildTypeName":
                    return "ProChildTypeName";
                default:
                    return "PointInfoName";

            }
        }


        var token = neat.getUserToken();
        var treeData = neatNavigator.getSelectedTreeNodeInfo();
        if (!treeData) {
            return;
        }

        var pointName = $.trim($("#txtPointName").val());

      
        var orderByColumn = getSortColApiValue(that.currentSortColumn);
        var isDescOrder = that.currentSortOrder === "desc";

        var loadingIndex = layui.layer.load(1);

        pointDataApi.getPatrolPointList(token, treeData.domainId, treeData.enterpriseId, pointName,
            that.optPrjType, that.optSubType,  that.optBindType, that.optUseType,

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

                //layer.msg("查询巡检点发生错误!");
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
                    { field: 'pointName', title: '巡检点名称', sort: true, },
                    { field: 'proTypeName', title: '项目类型' },
                    { field: 'proChildTypeName', title: '项目子类型' ,sort: true,},
                    { field: 'enterpriseName', title: '所属单位名称', sort: true, },
                    { field: 'buildingName', title: '所属建筑' },
                    { field: 'keyPartName', title: '所属部位' },
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


    //初始化是否已 绑定
    SubPage.prototype._initBindType = function () {
        var that = this;

        
        commonDataApi.getPointTagBindStatusData(function (resultData) {

            var d = {};
            d.data = resultData;
            laytpl($("#optCommonTemplate").html()).render(d, function (html) {
                var parent = $("#optBindType").html(html);
                form.render('select', 'optBindTypeForm');
            });


        });


        form.on('select(optBindType)', function (data) {
            //console.log(data.elem); //得到select原始DOM对象
            //console.log(data.value); //得到被选中的值
            //console.log(data.othis); //得到美化后的DOM对象
            that.optBindType = data.value;

        });
    };

    //初始化 是否已经关联(使用)
    SubPage.prototype._initUseType = function () {
        var that = this;
       
        commonDataApi.getPointUseStatusData(function (resultData) {
            var d = {};
            d.data = resultData;
            laytpl($("#optCommonTemplate").html()).render(d, function (html) {
                var parent = $("#optUseType").html(html);
                form.render('select', 'optUseTypeForm');
            });
        });

        form.on('select(optUseType)', function (data) {
            //console.log(data.elem); //得到select原始DOM对象
            //console.log(data.value); //得到被选中的值
            //console.log(data.othis); //得到美化后的DOM对象
            that.optUseType = data.value;
            
        });
    };

    //添加
    SubPage.prototype._initAddEvent = function () {
        var that = this;
        $('#btnAdd').on('click', function () {

            var treeData = neatNavigator.getSelectedTreeNodeInfo();
            if (!treeData) {
                return;
            }

            if (!treeData.enterpriseId) {

                layer.msg("请选择单位节点进行巡检点添加!");
                return;
            }


            var url = "/pages/patrol/pointManage/pointCreate.html?domainId=" + treeData.domainId
                + "&enterpriseId=" + treeData.enterpriseId
                + "&name=" + treeData.name
                + "&__=" + new Date().valueOf().toString();

            layer.open({resize:false,
                type: 2,
                title: '添加巡检点',
                area: ["806px", "578px"],
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
                layer.msg("请勾选需要删除的巡检点!");
                return;
            }

            layer.confirm("确定要删除这些巡检点吗?", {}, function () {

                $("#btnDelete").attr("disabled", true);

                var ids = [];
                $.each(data, function (_, item) {
                    ids.push(item.id);
                });
                pointDataApi.deletePatrolPoints(neat.getUserToken(), ids

                     , function (sd) { //成功或者部分成功

                         $("#btnDelete").attr("disabled", false);
                         var alertMsg = "";

                         if (!sd || sd == null || sd.length === 0) {
                             alertMsg = "巡检点删除成功!";

                         }
                         else {

                             alertMsg = "以下巡检点未能成功删除:<br/>" + sd.join("<br/>");
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

            that._bindPrjType();
            that._bindPrjSubType();
            that._bindTable();


        });
    };

    //初始化表格操作列的事件
    SubPage.prototype._initTableOperateColEvent = function () {
        var that = this;
        
        table.on('tool(resultTable)', function (obj) {
            var data = obj.data;
            if (obj.event === 'del') {
                layer.confirm('确定要删除巡检点:' + data.pointName +"?", function (index) {
                    var url = "";


                    var sendData = [];
                    sendData.push(data.id);
                    pointDataApi.deletePatrolPoints(neat.getUserToken(), sendData
                        , function (sd) { //成功或者部分成功

                            var alertMsg = "";

                            if (!sd || sd == null || sd.length === 0) {
                                alertMsg = "巡检点删除成功!";
                                obj.del();
                            }
                            else {

                                alertMsg = "以下巡检点未能成功删除:<br/>" + sd.join("<br/>");
                            }

                            layer.msg(alertMsg, function () {
                                that._bindTable();
                            });

                        
                    }, function (fd) { //失败
                        layer.msg("删除巡检点过程中发生错误!");
                    });
                    
                    layer.close(index);
                });
            } else if (obj.event === 'edit') {

                var url = "/pages/patrol/pointManage/pointEdit.html?pointId=" + data.id
                 
                    + "&__=" + new Date().valueOf().toString();

                layer.open({resize:false,
                    type: 2,
                    title: '编辑巡检点',
                    area: ["806px", "578px"],
                    shade: [0.7, '#000'],
                    content: url,
                    end: function () {
                        that._bindTable();
                    }
                });


            }
        });
    };

    SubPage.prototype.init = function () {


        var that = this;

        this._initHashChangedEvent();                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         

        this._initPrjType();
        this._initPrjSubType();

        this._initBindType();
        this._initUseType();

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


    exports("pagePatrolPointManageList", new SubPage());

});