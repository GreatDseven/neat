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

            this.taskInstanceId = neatNavigator.getUrlParam("taskInstId");

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
                        
                        { field: 'pointName', title: '巡检点名称',width:'140' },
                        { field: 'buildingName', title: '所属建筑', width: '140' },
                        { field: 'keypartName', title: '所属部位', width: '120' },
                        { field: 'handleTime', title: '巡检时间',width:'200' },
                        { field: 'result', title: '巡检结果', width: '100', templet: function (d) { return uiTools.renderPatrolPointResult(d.result); } },
                        { title: '巡检项目', align: 'center', width: '140', toolbar: '#opColTemplate' }
                       
                    ]
                ],
            });

            table.on('tool(resultTable)', function (obj) {
                var data = obj.data;
               if (obj.event === 'detail') {

                   var url = "/pages/patrol/taskInstanceManage/taskInstancePointView.html?taskInstancePointId=" + data.id

                      + "&__=" + new Date().valueOf().toString();

                    layer.open({resize:false,
                        type: 2,
                        title: "巡检项目",
                        area: ["660px", "540px"],
                        shade: [0.7, '#000'],
                        content: url
                       
                    });

                }
            });

        };

        SubPage.prototype._bindTable = function () {

            var that = this;
            taskInstanceDataApi.getTaskInstancePointList(neat.getUserToken(), this.taskInstanceId
                    ,function (resultData) {
                        
                        table.reload("resultTable", {
                            data: resultData
                        });

                    }, function () {
               
                        layer.msg("获取巡检详情发生错误!", function () {

                            that._closeDialog();

                        });
                    });
        };

        SubPage.prototype.init = function () {
            var that = this;

           
            that._initTable();
            that._bindTable();

          
        };


        exports("pagePatrolTaskInstanceView", new SubPage());
    });