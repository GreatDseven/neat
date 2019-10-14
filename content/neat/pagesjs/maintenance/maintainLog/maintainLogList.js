//维保记录列表


layui.define(["jquery", 'element', 'laydate', 'form', 'table', 'laytpl', 'laypage','layer',
    'neat', 'neatNavigator', 'commonDataApi', 'maintainLogDataApi', 'neatUITools'
    ], function (exports) {

    "use strict";

    var $ = layui.$;
    var table = layui.table;
    var form = layui.form;
    var laytpl = layui.laytpl;
    var laydate = layui.laydate;

    var neat = layui.neat;
    var laypage = layui.laypage;
    var neatNavigator = layui.neatNavigator;


    var pageDataApi = layui.maintainLogDataApi;
    var uiTools = layui.neatUITools;


    var defaultPageSize = 16;

    var SubPage = function () {

       


    };


    SubPage.prototype._initDefaultValues = function () {
        this.currentPageIndex = 1;
        this.currentPageSize = defaultPageSize;
        this.currentSortColumn = "mtTime";
        this.currentSortOrder = "desc";

        this.optInContract = ""; //全部
        this.startDate = "";
        this.endDate = "";
    };



    //初始化 是否在合同期内
    SubPage.prototype._initInContract = function () {

        var that = this;

        form.on('select(optInContract)', function (data) {
            //console.log(data.elem); //得到select原始DOM对象
            //console.log(data.value); //得到被选中的值
            //console.log(data.othis); //得到美化后的DOM对象
            that.optInContract = data.value;
        });
    };
   




    SubPage.prototype._bindTable = function () {

        var that = this;

        /* 所有的数据列
        /*
            id
            entperiseName
            mtTime
            nextMtTime
            mtContent
            mtEntperise
            contactPerson
            tel
            inContractTerm
                    
        */

        /* 后端api要求的数据
            MTTime  开始时间
            EnterpriseName  企业名称
            ContactPerson  联系人
        */

        function getSortColApiValue(colValue) {
            switch (colValue) {
                case "mtTime":
                    return "MtTime";
                case "entperiseName":
                    return "EnterpriseName";
                case "contactPerson":
                    return "ContactPerson";
                default:
                    return "MtTime";

            }
        }

        function getDateStr(dateObj) {
            //var dateObj = {year: 2017, month: 8, date: 18, hours: 0, minutes: 0, seconds: 0}
            if (dateObj.year && dateObj.month && dateObj.date)
            {
                return dateObj.year + "-" + dateObj.month + "-" + dateObj.date;
            }
            else {
                return "";
            }
            
        }


        var token = neat.getUserToken();


        var txtEntName = $.trim($("#txtEntName").val());

        var startDate = "";
        if (that.startDate) {
            startDate = getDateStr(that.startDate);
        }
        var endDate = "";
        if (that.endDate) {
            endDate = getDateStr(that.endDate);
        }


        var orderByColumn = getSortColApiValue(that.currentSortColumn);

        var isDescOrder = that.currentSortOrder === "desc";

        var loadingIndex = layui.layer.load(1);

        pageDataApi.getMaintainLogList(token, 
            txtEntName,startDate,endDate,that.optInContract,
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
                     id
                    entperiseName
                    mtTime
                    nextMtTime
                    mtContent
                    mtEntperise
                    contactPerson
                    tel
                    inContractTerm
                    */

                    //{ type: 'checkbox', fixed: 'left' },
                    { field: 'entperiseName', title: '所属单位', sort: true, width: "220" },
                    { field: 'mtTime', title: '维保日期' ,width:"200" },
                    { field: 'nextMtTime', title: '下次维保日期', sort: true, width: "220" },
                    { field: 'mtContent', title: '维保内容', sort: true, width: "300" },
                    { field: 'mtEntperise', title: '维保单位',width: "180" },
                    { field: 'contactPerson', title: '联系人', width: "80" },
                    { field: 'tel', title: '联系电话', width: "150" },
                    { field: 'inContractTerm', title: '是否在合同期', width: "150", templet: function (d) { return uiTools.renderMaintainLogInContractStatus(d.inContractTerm); } },
                    //{ field: 'operation', fixed: 'right', title: '操作', align: 'center', toolbar: '#opColTemplate' }
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

        //监听表格复选框选择
        table.on('checkbox(resultTable)', function (obj) {
            //console.log(obj)
        });
        //监听工具条
        table.on('tool(resultTable)', function (obj) {
            var data = obj.data;
            if (obj.event === 'detail') {
                //layer.msg('ID：' + data.id + ' 的查看操作');
            } else if (obj.event === 'del') {
                //layer.confirm('真的删除行么', function (index) {
                //    obj.del();
                //    layer.close(index);
                //});
            } else if (obj.event === 'edit') {
                //layer.alert('编辑行：<br>' + JSON.stringify(data))
            }
        });
    }

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


    SubPage.prototype.init = function () {


        var that = this;

        this._initDefaultValues();

        $(window).on("hashchange", function () {
            //that._bindTable();
        });

        this._initDate();
        this._initInContract();

        this._initTable();
        this._initPager();

        $("#btnQuery").on("click", function () {
            that.currentPageIndex = 1;
            that._bindTable();
        });

        that._bindTable();
    };


    exports("pageMaintenanceLogList", new SubPage());

});