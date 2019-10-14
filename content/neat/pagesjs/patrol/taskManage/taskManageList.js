//巡检任务管理 


layui.define(["jquery", 'element', 'form', 'table', 'laytpl', 'laypage', 'layer'
    , 'neat', 'patrolTaskDataApi', 'neatNavigator', 'commonDataApi', 'neatGroupDataMaker'], function (exports) {

    "use strict";

    var $ = layui.$;
    var table = layui.table;
    var form = layui.form;
    var laytpl = layui.laytpl;
    var taskDataApi = layui.patrolTaskDataApi;
    var neat = layui.neat;
    var laypage = layui.laypage;
    var neatNavigator = layui.neatNavigator;
    var commonDataApi = layui.commonDataApi;
    var groupDataTools = layui.neatGroupDataMaker;

    var defaultPageSize = 15;

    var SubPage = function () {

       
    };

    SubPage.prototype._initDefaultValues = function () {

        this.currentPageIndex = 1;
        this.currentPageSize = defaultPageSize;
        this.currentSortColumn = "beginDate";
        this.currentSortOrder = "desc";

    };



    //初始化任务执行频率
    SubPage.prototype._initFrequency = function () {

        var that = this;

        var data = neatNavigator.getSelectedTreeNodeInfo();
        if (!data) {
            return;
        }
        //nodeId=79b8faa2-c960-41cc-8136-c76c3fb57043/nodeType=2
        //获取频率
        commonDataApi.getFrequency(neat.getUserToken(), data.domainId, data.enterpriseId, function (frequenceData) {

            var d = {};
            d.data = frequenceData;
            laytpl($("#optFrequenceTemplate").html()).render(d, function (html) {

                var parent = $("#optFrequence").html(html);
                form.render('select', 'optFrequenceForm');
            });


        });

        form.on('select(optFrequence)', function (data) {
            //console.log(data.elem); //得到select原始DOM对象
            //console.log(data.value); //得到被选中的值
            //console.log(data.othis); //得到美化后的DOM对象
            that.optFrequence = data.value;

        });
    };

    //初始化任务执行人类型(角色或者人员)
    SubPage.prototype._initExecutorType = function () {
        var that = this;
 
       
        form.on('select(optExecutorType)', function (data) {
            //console.log(data.elem); //得到select原始DOM对象
            //console.log(data.value); //得到被选中的值
            //console.log(data.othis); //得到美化后的DOM对象
            that.optExecutorType = data.value;
            that._bindExecutorList();

        });

        this._bindExecutorType();
    };


    SubPage.prototype._bindExecutorType = function () {

        var that = this;
        commonDataApi.getTaskExecutorTypeData(function (resultData) {

            var d = {};
            d.data = resultData;
            laytpl($("#optExecutorTypeTemplate").html()).render(d, function (html) {

                var parent = $("#optExecutorType").html(html);
                form.render('select', 'optExecutorTypeForm');
            });


        });


    };

    //初始化任务执行人/角色列表
    SubPage.prototype._initExecutorList = function () {
        var that = this;
        form.on('select(optExecutorList)', function (data) {
            //console.log(data.elem); //得到select原始DOM对象
            //console.log(data.value); //得到被选中的值
            //console.log(data.othis); //得到美化后的DOM对象
            that.optExecutorList = data.value;

        });
    };

    //绑定任务执行人/角色列表
    SubPage.prototype._bindExecutorList = function () {
        var that = this;



        var data = neatNavigator.getSelectedTreeNodeInfo();
        if (!data) {
            return;
        }
        

        if (that.optExecutorType == "1") {//角色

            taskDataApi.getPatrolTaskRoles(neat.getUserToken(), data.domainId, data.enterpriseId, function (roleData) {

               

                var d = {};
                d.data = groupDataTools.make(roleData, ["entName", "domainName"]);;
                laytpl($("#optRoleListTemplate").html()).render(d, function (html) {

                    var parent = $("#optExecutorList").html(html);
                    form.render('select', 'optExecutorListForm');
                });


            });
        }
        else if (that.optExecutorType == "2") { //人员

            taskDataApi.getPatrolTaskUsers(neat.getUserToken(), data.domainId, data.enterpriseId, function (roleData) {
               
                var d = {};
                d.data = groupDataTools.make(roleData, ["entName", "domainName"])
                laytpl($("#optUserListTemplate").html()).render(d, function (html) {

                    var parent = $("#optExecutorList").html(html);
                    form.render('select', 'optExecutorListForm');
                });


            });
        }
        else {

            laytpl($("#optExecutorListTemplate").html()).render({}, function (html) {

                var parent = $("#optExecutorList").html(html);
                form.render('select', 'optExecutorListForm');
            });
        }


    };

    //清空表格
    SubPage.prototype._clearTable = function () {

        table.reload("tableTaskList", {
            data: [],
            initSort: {
                field: that.currentSortColumn,
                type: that.currentSortOrder
            }
        });
        that.currentPageIndex = 1;
        that._initPager(0, 1);
    };

    SubPage.prototype._bindTable = function () {

        var that = this;
        /*
        token,domainID,enterpriseID,taskName,
        frequencyID,uid,uidType,
        orderByColumn, isDescOrder,
        pageIndex,pageSize
        */

        function getSortColApiValue(colValue) {
            switch (colValue) {
                case "taskName":
                    return "TaskName";
                case "beginDate":
                    return "BeginDate";
                case "endDate":
                    return "EndDate";
                default:
                    return "BeginDate";

            }
        }


        var token = neat.getUserToken();
        var treeData = neatNavigator.getSelectedTreeNodeInfo();
        if (!treeData) {
            return;
        }
        var taskName = $.trim($("#txtTaskName").val());
        var frequencyID = that.optFrequence;
        var uidType = that.optExecutorType;
        var uid = that.optExecutorList;
        var orderByColumn = getSortColApiValue(that.currentSortColumn);
        var isDescOrder = that.currentSortOrder === "desc";


        var loadingIndex = layui.layer.load(1);
        taskDataApi.getTaskList(token, treeData.domainId, treeData.enterpriseId, taskName,
            frequencyID, uid, uidType, orderByColumn, isDescOrder, that.currentPageIndex, that.currentPageSize,
            function (resultTaskData) {
                layui.layer.close(loadingIndex);
                table.reload("tableTaskList", {
                    data: resultTaskData.data,
                    initSort: {
                        field: that.currentSortColumn,
                        type: that.currentSortOrder
                    }
                });
                that._initPager(resultTaskData.totalCount, that.currentPageIndex);

            }, function () {
                layui.layer.close(loadingIndex);
                that.currentPageIndex = 1;
                table.reload("tableTaskList", {
                    data: [],
                    initSort: {
                        field: that.currentSortColumn,
                        type: that.currentSortOrder
                    }
                });
                that._initPager(0, 1);
                //layer.msg("查询巡检任务发生错误!");
            });
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
            elem: 'tableTaskListPager',
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
            elem: '#tableTaskList',
            id: "tableTaskList",
            data: [],
            page: false,
            limit: defaultPageSize,
            autoSort: false,
            initSort: {
                field: that.currentSortColumn,
                type: that.currentSortOrder
            },
            loading: false,
            cols: [
                [
                    { type: 'checkbox', fixed: 'left' },
                    { field: 'taskName', title: '巡检任务名称', sort: true },
                    { field: 'enterpriseName', title: '所属单位名称' },
                    { field: 'freName', title: '巡检频率' },
                    { field: 'uname', title: '巡检人员' },
                    { field: 'beginDate', title: '开始日期', align: 'center', sort: true },
                    { field: 'endDate', title: '结束日期', align: 'center', sort: true },
                    { field: 'beginTime', title: '开始时间', align: 'center' },
                    { field: 'endTime', title: '结束时间', align: 'center' },
                    { field: 'operation', fixed: 'right', title: '操作', align: 'center', toolbar: '#opColTemplate' }
                ]
            ],
        });

        table.on('sort(tableTaskList)', function (obj) {
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




    SubPage.prototype._initAddEvent = function () {

        var that = this;

        $('#btnAdd').on('click', function () {

            var treeData = neatNavigator.getSelectedTreeNodeInfo();
            if (!treeData) {
                return;
            }

            if (!treeData.enterpriseId) {

                layer.msg("请选择单位节点进行任务添加!");
                return;
            }


            var url = "/pages/patrol/taskManage/taskCreate.html?domainId=" + treeData.domainId + "&enterpriseId=" + treeData.enterpriseId + "&__=" + new Date().valueOf().toString();

            layer.open({resize:false,
                type: 2,
                title: '添加巡检任务',
                area: ["806px", "640px"],
                shade: [0.7, '#000'],
                content: url,
                end: function () {
                    that._bindTable();
                }
            });
        });
    };

    SubPage.prototype._initQueryEvent = function () {
        var that = this;
        
        $("#btnQuery").on("click", function () {
            that.currentPageIndex = 1;
            that._bindTable();
        });
    };
    SubPage.prototype._initDeleteEvent = function () {
        var that = this;
        $('#btnDelete').on('click', function () {


            var checkStatus = table.checkStatus('tableTaskList');
            var data = checkStatus.data;

            if (data.length === 0) {
                layui.msg("请勾选需要删除的巡检任务!");
                return;
            }

            layer.confirm("确定要删除这些巡检任务吗?", {}, function () {

                $("#btnDelete").attr("disabled", true);

                var ids = [];
                $.each(data, function (_, item) {
                    ids.push(item.id);
                });
                taskDataApi.deletePatrolTasks(neat.getUserToken(), ids

                     , function (sd) { //成功或者部分成功

                         $("#btnDelete").attr("disabled", false);
                         var alertMsg = "";

                         if (!sd || sd == null || sd.length === 0) {
                             alertMsg = "巡检任务删除成功!";

                         }
                         else {

                             alertMsg = "以下巡检任务未能成功删除:<br/>" + sd.join("<br/>");
                         }

                         layer.msg(alertMsg, function () {
                             that._bindTable();
                         });
                     }
                    , function (fd) {

                        $("#btnDelete").attr("disabled", false);

                        layer.msg("巡检任务删除失败!", function () {
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
            that._bindExecutorType();
            that._bindExecutorList();
            that._bindTable();
        });
    };


    //初始化表格操作列的事件
    SubPage.prototype._initTableOperateColEvent = function () {
        var that = this;

        table.on('tool(tableTaskList)', function (obj) {
            var data = obj.data;
            if (obj.event === 'del') {
                layer.confirm('确定要删除巡检任务:' + data.taskName + "?", function (index) {
                    var url = "";


                    var sendData = [];
                    sendData.push(data.id);
                    taskDataApi.deletePatrolTasks(neat.getUserToken(), sendData
                        , function (sd) { //成功或者部分成功

                            var alertMsg = "";

                            if (!sd || sd == null || sd.length === 0) {
                                alertMsg = "巡检任务删除成功!";
                                obj.del();
                            }
                            else {

                                alertMsg = "以下巡检任务未能成功删除:<br/>" + sd.join("<br/>");
                            }

                            layer.msg(alertMsg, function () {
                                that._bindTable();
                            });


                        }, function (fd) { //失败
                            layer.msg("删除巡检任务过程中发生错误!");
                        });

                    layer.close(index);
                });
            } else if (obj.event === 'clone') {

                var url = "/pages/patrol/taskManage/taskClone.html?taskId=" + data.id
                
                  + "&__=" + new Date().valueOf().toString();

                layer.open({resize:false,
                    type: 2,
                    title: '克隆巡检任务',
                    area: ["806px", "640px"],
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

        this._initDefaultValues();

        this._initHashChangedEvent();

        this._initFrequency();
        this._initExecutorType();
        this._initExecutorList();


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


    exports("pagePatrolTaskManageList", new SubPage());

});