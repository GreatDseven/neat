//巡检任务详情查看(巡检点列表) 


layui.define(["jquery",'table', 'laytpl',
    'neat', 'neatNavigator', 'patrolTaskInstanceDataApi', 'neatUITools'], function (exports) {


        "use strict";


        var $ = layui.$;
        var table = layui.table;
      
        var laytpl = layui.laytpl;

        var neat = layui.neat;
      
        var neatNavigator = layui.neatNavigator;
       
        var taskInstanceDataApi = layui.patrolTaskInstanceDataApi;

        var uiTools = layui.neatUITools;

        var SubPage = function () {

            this.taskInstancePointId = neatNavigator.getUrlParam("taskInstancePointId");

        };

        //关闭对话框
        SubPage.prototype._closeDialog = function () {
            var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
            parent.layer.close(index); //再执行关闭
        };

        SubPage.prototype._initTable = function () {

            var that = this;

            that.table = table.render({
                elem: '#resultTable',
                id: "resultTable",
                data: [],
                page: false,
                limit: 999999,
                autoSort: false,
                loading: false,
                cols: [
                    [
                        
                        { field: 'itemName', title: '巡检项目名称' },
                        { field: 'result', title: '状态', templet: function (d) { return uiTools.renderPatrolProjectResult(d.result); } },
                      
                       
                    ]
                ],
            });

           

        };

        SubPage.prototype._bindTable = function () {

            var that = this;
            taskInstanceDataApi.getTaskInstancePointProjectsList(neat.getUserToken(), this.taskInstancePointId
                    ,function (resultData) {
                        
                        table.reload("resultTable", {
                            data: resultData
                        });

                    }, function () {
               
                        layer.msg("获取巡检点详情发生错误!", function () {

                            that._closeDialog();

                        });
                    });
        };

        SubPage.prototype.init = function () {
            var that = this;

           
            that._initTable();
            that._bindTable();

           
        };


        exports("pagePatrolTaskInstancePointView", new SubPage());
    });