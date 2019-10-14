//巡检详情查看 


layui.define(["jquery", 'element', 'laydate', 'form', 'table', 'laytpl', 'laypage','layer',
    'neat', 'neatNavigator', 'commonDataApi', 'patrolTaskInstanceDataApi', 'neatUITools'], function (exports) {

    "use strict";

    var $ = layui.$;
    var table = layui.table;
    var form = layui.form;
    var laytpl = layui.laytpl;

    var neat = layui.neat;
    var laydate = layui.laydate;

    var laypage = layui.laypage;
    var neatNavigator = layui.neatNavigator;
    var commonDataApi = layui.commonDataApi;
    var taskInstanceDataApi = layui.patrolTaskInstanceDataApi;

    var uiTools = layui.neatUITools;


    var defaultPageSize = 16;

    var SubPage = function () {



        this.currentPageIndex = 1;
        this.currentPageSize = defaultPageSize;
        this.currentSortColumn = "";
        this.currentSortOrder = "desc";


        this.optFrequence = "";
        this.startDate = null;
        this.endDate = null;
        this.optFinishStatus = 0;
    };

    SubPage.prototype._initDefaultValues = function () {

        this.currentPageIndex = 1;
        this.currentPageSize = defaultPageSize;
        this.currentSortColumn = "";
        this.currentSortOrder = "desc";


        this.optFrequence = "";
        this.startDate = null;
        this.endDate = null;
        this.optFinishStatus = 0;

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
    //初始化任务完成情况
    SubPage.prototype._initFinishStatus = function () {

        var that = this;

        commonDataApi.getFinishStatusData(function (resultData) {

            var d = {};
            d.data = resultData;
            laytpl($("#optCommonTemplate").html()).render(d, function (html) {
                var parent = $("#optFinishStatus").html(html);
                form.render('select', 'optFinishStatusForm');
            });


        });

        form.on('select(optFinishStatus)', function (data) {
            //console.log(data.elem); //得到select原始DOM对象
            //console.log(data.value); //得到被选中的值
            //console.log(data.othis); //得到美化后的DOM对象
            that.optFinishStatus = data.value;

        });
    };

    //初始化两个日期控件
    SubPage.prototype._initDate = function () {

        var that = this;

        laydate.render({
            elem: '#dateSpan', //指定元素
            type: 'date',
            range: "~",
            format: "yyyy-MM-dd",
            trigger: "click",
            done: function (value, startDate, endDate) {

                //console.log(value); //得到日期生成的值，如：2017-08-18
                //console.log(startDate); //得到日期时间对象：{year: 2017, month: 8, date: 18, hours: 0, minutes: 0, seconds: 0}
                //console.log(endDate); //得结束的日期时间对象，开启范围选择（range: true）才会返回。对象成员同上。

                that.startDate = startDate;
                that.endDate = endDate;
            }
            
        });
     
    };
    


    SubPage.prototype._bindTable = function () {

        var that = this;
        /*
               id
        taskid
        taskResultName 8
        beginTime
        endTime
        patrolTime 8
        isDone
        handleUid
        handleUName 8
        handleTime
        isSuccess
        frequencyName
        entpriseName 8


        webapi需要的排序名称
        TaskName 
        PatrolUserName 
        EntName 
        PatrolTime
        BeginTime
        EndTime
        RealEndTime
        */

        function getSortColApiValue(colValue) {
            switch (colValue) {
                case "taskResultName":
                    return "TaskName";
                case "handleUName":
                    return "PatrolUserName";
                case "entpriseName":
                    return "EntName";
                case "patrolTime":
                    return "PatrolTime";
                case "beginTime":
                    return "BeginTime";
                case "endTime":
                    return "EndTime";
                case "realEndTime":
                    return "RealEndTime";
                default:
                    return "None";

            }
        }


        var token = neat.getUserToken();
        var treeData = neatNavigator.getSelectedTreeNodeInfo();
        if (!treeData) {
            return;
        }
        var taskName = $.trim($("#txtTaskName").val());


        var orderByColumn = getSortColApiValue(that.currentSortColumn);
        var isDescOrder = that.currentSortOrder === "desc";


        function getDateStr(dateObj) {
            //var dateObj = {year: 2017, month: 8, date: 18, hours: 0, minutes: 0, seconds: 0}
            if (dateObj.year && dateObj.month && dateObj.date) {
                return dateObj.year + "-" + dateObj.month + "-" + dateObj.date;
            }
            else {
                return "";
            }
        }

        var startDate = "";
        if (that.startDate) {
            startDate = getDateStr(that.startDate);
        }
        var endDate = "";
        if (that.endDate) {
            endDate = getDateStr(that.endDate);
        }

        var loadingIndex = layui.layer.load(1);
        taskInstanceDataApi.getTaskInstanceList(token, treeData.domainId, treeData.enterpriseId,
            taskName, that.optFrequence,startDate,endDate,that.optFinishStatus,
            orderByColumn, isDescOrder, that.currentPageIndex, that.currentPageSize,
            function (resultData) {
                

                layui.layer.close(loadingIndex);

                table.reload("resultTable", {
                    data: resultData.data,
                    initSort: {
                        field: that.currentSortColumn,
                        type: that.currentSortOrder
                    }
                });
                that._initPager(resultData.totalCount, that.currentPageIndex);

            }, function () {
                layui.layer.close(loadingIndex);
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
                "id": "f448ecba-706a-4ff3-a7e5-ef755cf1e368",
                "taskid": "5dfd2ba0-312f-4391-bf31-f906f002e4c6",
                "taskResultName": "巡检任务zyy1",
                "beginTime": "2019-02-01 08:00:00",
                "endTime": "2019-02-01 09:59:59",
                "realBeginTime": null,
                "realEndTime": null,
                "isDone": false,
                "handleUid": "2feeeed6-42a9-4901-9cd6-0e3b37e836da",
                "handleUName": "111",
                "userIdType": 2,
                "isSuccess": 1,
                "frequencyName": "每2小时1次",
                "entpriseName": "宁浩发展八八分公司"
*/
                    
                    { field: 'entpriseName', title: '所属单位名称', sort: true, width: "180" },
                    { field: 'taskResultName', title: '巡检任务名称', sort: true, width: "240" },
                    { field: 'frequencyName', title: '巡检频率',  width: "160"},
                    { field: 'handleUName', title: '巡检人员', sort: true,  width: "180"},
                    { field: 'beginTime', title: '开始时间', width: "190" ,sort: true},
                    { field: 'endTime', title: '结束时间', width: "190", sort: true },
                    { field: 'realEndTime', title: '实际完成时间', width: "190", sort: true },
                    { field: 'isSuccess', title: '完成情况', width: "100", templet: function (d) { return uiTools.renderTaskInstanceFinishStatus(d.isSuccess); } },
                    { field: 'operation', fixed: 'right', title: '操作', align: 'center', toolbar: '#opColTemplate' ,width:"80" }
                ]
            ],
        });
        //, templet: function (d) { return getStartTime(d); }
        function getStartTime(d) {
            if(d.isDone){
                return d.realBeginTime;
            }
            else{
                return d.beginTime;
            }
        }
        //templet: function (d) { return getEndTime(d); }
        function getEndTime(d) {
            if(d.isDone){
                return d.realEndTime;
            }
            else{
                return d.endTime;
            }
        }

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

        //监听表格复选框选择
        table.on('checkbox(resultTable)', function (obj) {
            console.log(obj)
        });
        //监听工具条
        table.on('tool(resultTable)', function (obj) {
            var data = obj.data;
            if (obj.event === 'detail') {

                var url = "/pages/patrol/taskInstanceManage/taskInstanceView.html?taskInstId=" + data.id

                   + "&__=" + new Date().valueOf().toString();

                layer.open({resize:false,
                    type: 2,
                    title: '巡检详情查看',
                    area: ["860px", "600px"],
                    shade: [0.7, '#000'],
                    content: url

                });

            }
        });
    }


    SubPage.prototype.init = function () {

        var that = this;

        this._initDefaultValues();

        $(window).on("hashchange", function () {
            that._bindTable();
        });

        this._initFrequency();
        this._initFinishStatus();
        this._initDate();

        this._initTable();
        this._initPager();

        $("#btnQuery").on("click", function () {
            that.currentPageIndex = 1;
            that._bindTable();
        });

        //form.render();

        that._bindTable();
    };


    exports("pagePatrolTaskInstanceList", new SubPage());

});