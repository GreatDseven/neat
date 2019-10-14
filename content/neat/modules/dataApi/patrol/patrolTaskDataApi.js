layui.define(["jquery", 'neatDataApi'], function (exports) {
    "use strict";

    var MODULE_NAME = 'patrolTaskDataApi';


    var $ = layui.$;

    var TaskDataApi = function () { };


    //=============================================================
    // 巡检任务页面需要的api
    //=============================================================

   


    /**
     * 获取任务列表
     */
    TaskDataApi.prototype.getTaskList = function (token, domainID, enterpriseID, taskName,
        frequencyID, uid, uidType,
        orderByColumn, isDescOrder,
        pageIndex, pageSize, okCallback,failCallback) {


        var url = "/OpenApi/TaskMod/GetTaskList";

        if (!taskName) {
            taskName = "";
        }
        if (!frequencyID) {
            frequencyID = "";
        }
        if (!uid) {
            uid = "";
        }
        if (!uidType) {
            uidType = "";
        }
        if (!orderByColumn) {
            orderByColumn = "none";
        }
        if (typeof isDescOrder ==="undefined") {
            isDescOrder = "true";
        }

        var data = {
            token: token,
            domainID: domainID,
            enterpriseID: enterpriseID,
            taskName: taskName,
            frequencyID: frequencyID,
            uid: uid,
            uidType: uidType,
            orderByColumn: orderByColumn,
            isDescOrder: isDescOrder,
            pageIndex: pageIndex,
            pageSize: pageSize,
        };

        layui.neatDataApi.sendGet(url, data, okCallback, failCallback);


    };


 
    //新建任务
    //taskData的格式为:
    //{
    //    "taskName": "测试任务",
    //    "rateId": "09679ca4-194a-4d90-8901-bd3e2b50c4f1",
    //    "entId": "009f420d-4f91-4d44-8b66-eac9630d0b75",
    //    "beginDate": "2018-12-01 00:00:00",
    //    "endDate": "2020-01-01 00:00:00",
    //    "beginTime": "2018-12-01 08:00:00",
    //    "endTime": "2018-12-01 17:00:00",
    //    "taskDes": "测试添加任务",
    //    "uId": "b95246b5-03ee-11e9-81a8-c85b76a0162a",
    //    "uIdType": 1,
    //    "pointInfoIds":[
    //        {"itemId":"a476bab0-01be-11e9-97ae-c85b76a0162a"},
    //        {"itemId":"f5ee34f0-01be-11e9-97ae-c85b76a0162a"},
    //        {"itemId":"f5f560a0-01be-11e9-97ae-c85b76a0162a"}
    //    ]
    //}
    TaskDataApi.prototype.addPatrolTask = function (token,taskData,okCallback,failCallback) {

        var url = "/OpenApi/TaskMod/AddOsiTask?token=" +token;

        layui.neatDataApi.sendPost(url, taskData, okCallback, failCallback);

    };

    //删除巡检任务
    //参数 taskIdArray 是 巡检任务id的数组.
    TaskDataApi.prototype.deletePatrolTasks = function (token, taskIdArray, okCallback, failCallback) {

        var url = "/OpenApi/TaskMod/DeleteTask/?token=" + encodeURIComponent(token);

        layui.neatDataApi.sendPostJson(url, taskIdArray, okCallback, failCallback);
    };

    //根据taskId获取Task详细信息
    //返回格式如下
    //{
         //"id": "23d75c5f-9b11-4a52-bb29-8a571c4d1de8",
         //"taskName": "新建测试任务2",
         //"rateId": "025a0730-6f03-45cf-983b-b1abcee3d397",
         //"entId": "79b8faa2-c960-41cc-8136-c76c3fb57043",
         //"beginDate": "2018-12-01 00:00:00",
         //"endDate": "2020-01-01 00:00:00",
         //"beginTime": "2018-12-27 00:00:00",
         //"endTime": "2018-12-27 12:00:00",
         //"taskDes": "顶顶顶顶",
         //"handleUId": "80556ac8-4697-4243-94bc-40e3417e5c01",
         //"handleUName": "管理员",
         //"uid": "c35c0357-08df-11e9-a2e9-c85b76a0162a",
         //"uidtype": 2,
         //"pointInfoIds": [
         //{
         //    "itemId": "91c79f49-cb46-4e49-9b9e-33a4de00b59c",
         //    "flag": 0
         //}
    //   ]
    //}
    TaskDataApi.prototype.getTaskById = function (token, taskId, okCallback, failCallback) {

        var url = "/OpenApi/TaskMod/GetOsiTaskById";

        var data = {
            token: token,
            taskId: taskId
        };

        layui.neatDataApi.sendGet(url, data, okCallback, failCallback);
    };
    //修改任务 ,任务不支持修改功能.
    //taskData的格式为:
    //{
    //    "id": "3e32d9e1-5852-4841-87a4-0bd9cc29a2b9",
    //    "taskName": "测试任务修改",
    //    "rateId": "09679ca4-194a-4d90-8901-bd3e2b50c4f1",
    //    "beginDate": "2018-12-01 00:00:00",
    //    "endDate": "2020-01-01 00:00:00",
    //    "beginTime": "2018-12-01 08:00:00",
    //    "endTime": "2018-12-01 17:00:00",
    //    "taskDes": "测试修改任务",
    //    "uId": "b95246b5-03ee-11e9-81a8-c85b76a0162a",
    //    "uIdType": 1,
    //    "pointInfoIds":[
    //        {"itemId":"a476bab0-01be-11e9-97ae-c85b76a0162a"},
    //        {"itemId":"f5ee34f0-01be-11e9-97ae-c85b76a0162a"},
    //        {"itemId":"f5f560a0-01be-11e9-97ae-c85b76a0162a"}
    //    ]
    //}
    //TaskDataApi.prototype.updatePatrolTask = function (token, taskData, okCallback, failCallback) {

    //    var url = "/OpenApi/TaskMod/UpdateTaskPointInfo?token=" + token;

    //    layui.neatDataApi.sendPost(url, taskData, okCallback, failCallback);


    //};

    //获取能够进行巡检的角色列表
    //返回
    //[
    //    {
    //        "id": "",
    //        "name": "管理员",
    //        "description": "管理员",
    //        "domainName": "秦皇岛",
    //        "entName": null
    //    }
    //]
    TaskDataApi.prototype.getPatrolTaskRoles = function (token, domainId, enterpriseId, okCallback, failCallback) {

        var url = "/OpenApi/UserInfo/GetRolesHasPatrolMoudle";

        var data = {
            token: token,
            domainId: domainId,
            enterpriseId: enterpriseId
        };

        layui.neatDataApi.sendGet(url, data, okCallback, failCallback);
    };

    //获取能够进行巡检的人员列表
    //返回;
    //[
    //    {
    //        "id": "",
    //        "userName": null,
    //        "name": "admin3",
    //        "jobNo": null,
    //        "domainName": "秦皇岛",
    //        "entName": null
    //    }
    //]
    TaskDataApi.prototype.getPatrolTaskUsers = function (token, domainId, enterpriseId, okCallback, failCallback) {

        var url = "/OpenApi/UserInfo/GetUsersHasPatrolMoudle"
        var data = {
            token: token,
            domainId: domainId,
            enterpriseId: enterpriseId
        };

        layui.neatDataApi.sendGet(url, data, okCallback, failCallback);
    };
    


    //全局都是这一个实例
    var taskDataApiInstance = new TaskDataApi();

    //暴露接口
    exports(MODULE_NAME, taskDataApiInstance);
});