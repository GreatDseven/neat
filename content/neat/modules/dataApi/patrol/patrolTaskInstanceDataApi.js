layui.define(["jquery", 'neatDataApi'], function (exports) {
    "use strict";

    var MODULE_NAME = 'patrolTaskInstanceDataApi';


    var $ = layui.$;

    var TaskInstanceDataApi = function () { };



    /**
     * 获取巡检任务详情列表 
     */
    TaskInstanceDataApi.prototype.getTaskInstanceList = function (token, domainId, enterpriseId,
        taskResultName, patrolFrequencyId, beginTime, endTime, taskSuccessStatus,
        orderByColumn, isDescOrder,
        pageIndex, pageSize, callback) {

        var url = "/OpenApi/TaskMod/GetTaskResultList";

        var data = {
            token: token,
            domainId: domainId,
            enterpriseId: enterpriseId,

            taskResultName: taskResultName,
            patrolFrequencyId: patrolFrequencyId,
            beginTime: beginTime,
            endTime: endTime,
            taskSuccessStatus: taskSuccessStatus,
           
            orderByColumn: orderByColumn,
            isDescOrder: isDescOrder,

            pageIndex: pageIndex,
            pageSize: pageSize,
        };

        layui.neatDataApi.sendGet(url, data, callback);


    };


   /**
   * 获取巡检任务实例的巡检点列表

   返回结果如下:
   [
    {
        "id": "6ebef5bd-0b1d-11e9-a2e9-c85b76a0162a",
        "pointName": "任务1",
        "buildingName": "",
        "keypartName": "",
        "result": 1
    }
   ]
   */
   
    TaskInstanceDataApi.prototype.getTaskInstancePointList = function (token, taskInstanceId, okCallback, failCallback) {

        var url = "/OpenApi/Point/GetResultPointDetail";

        var data = {
            token: token,
            taskResultid: taskInstanceId
        };

        layui.neatDataApi.sendGet(url, data, okCallback, failCallback);
    };

  /**
  * 获取巡检任务实例中巡检点下巡检项目情况列表

  返回结果如下:
  [
      {
    "id": "6ec5b95e-0b1d-11e9-a2e9-c85b76a0162a",
    "itemId": "f5ee34f0-01be-11e9-97ae-c85b76a0162a",
    "itemName": "防火门闭门器是否正常",
    "result": 1
    }
  ]
  */
    TaskInstanceDataApi.prototype.getTaskInstancePointProjectsList = function (token, taskInstancePointId, okCallback, failCallback) {

        var url = "/OpenApi/Point/GetResultItemDetail";

        var data = {
            token: token,
            resultPointId: taskInstancePointId
        };

        layui.neatDataApi.sendGet(url, data, okCallback, failCallback);
    };





    //全局都是这一个实例
    var taskInstanceDataApi = new TaskInstanceDataApi();

    //暴露接口
    exports(MODULE_NAME, taskInstanceDataApi);
});