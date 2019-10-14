layui.define(["jquery", 'neatDataApi'], function (exports) {
    "use strict";

    var MODULE_NAME = 'patrolPointDataApi';


    var $ = layui.$;

    var PointDataApi = function () { };



    /**
     * 获取巡检点列表
     */
    PointDataApi.prototype.getPatrolPointList = function (token, domainId, enterpriseId,
        pointInfoName, typeId, childTypeId, bindingStatus, relationStatus,
        orderByColumn, isDescOrder,
        pageIndex, pageSize, okCallback,failCallback) {

        if (typeof typeId == 'undefined') {
            typeId = "";
        }

        if (typeof childTypeId == 'undefined') {
            childTypeId = "";
        }

        var url = "/OpenApi/Point/GetOsiPointList";


        var data = {
            token: token,
            domainId: domainId,
            enterpriseId: enterpriseId,

            pointInfoName: pointInfoName,
            typeId: typeId,
            childTypeId: childTypeId,
            bindingStatus: bindingStatus,
            relationStatus: relationStatus,

            orderByColumn: orderByColumn,
            isDescOrder: isDescOrder,

            pageIndex: pageIndex,
            pageSize: pageSize,
        };

        layui.neatDataApi.sendGet(url, data, okCallback, failCallback);


    };


    /**
    * 添加巡检点,
    patrolPointData数据格式如下:
         var patrolPointData =  {
                "pointName": "公司二楼",
                "proTypeId": "f446c4c6-7e4b-4911-bbba-98f480e80f0c",
                "childTypeID": "67577452-88d7-4f52-af7c-4f857ec52d1a",
                "entId": "00000000-0000-0000-0000-000000000000",
                "buildingId": "00000000-0000-0000-0000-000000000000",
                "keypartId": "00000000-0000-0000-0000-000000000000",
                "locationDes":"tttttt"
                "childTypes":[
    	            {"itemId":"a476bab0-01be-11e9-97ae-c85b76a0162a",
    	            "flag":"1"},
    	            {"itemId":"f5ee34f0-01be-11e9-97ae-c85b76a0162a",
    	            "flag":"1"},
    	            {"itemId":"f5f560a0-01be-11e9-97ae-c85b76a0162a",
    	            "flag":"1"}
                ]
            }
                         
    */
    PointDataApi.prototype.createPatrolPoint = function ( token,patrolPointData,okCallback,failCallback ) {

        var url = "/OpenApi/Point/AddOsiPoint/?token=" + encodeURIComponent(token);

        layui.neatDataApi.sendPost(url, patrolPointData, okCallback, failCallback);

    };


    //获取巡检点树列表
    // 返回数据格式
    //[{
    //  id:"",
    //  name:"",
    //  parentId:"",
    //  type:1
    //}]
    PointDataApi.prototype.getPatrolPointTree = function (token, domainId, enterpriseId, okCallback, failCallback) {


        var url = "/OpenApi/Point/GetPointInfoTree";

        var data = {
            token:token,
            domainId:domainId,
            enterpriseId:enterpriseId
        };

        layui.neatDataApi.sendGet(url, data, okCallback, failCallback);

    };

    //删除巡检点
    //参数 pointArray 是 巡检点id的数组.
    PointDataApi.prototype.deletePatrolPoints = function (token, pointIdArray, okCallback, failCallback) {

        var url = "/OpenApi/Point/DeletePointInfo/?token=" + encodeURIComponent(token);

        layui.neatDataApi.sendPostJson(url, pointIdArray, okCallback, failCallback);
    };


    //获取巡检点
    //返回信息如下:
    //   {
    //    "pointName": "公司二楼",
    //    "proTypeId": "f446c4c6-7e4b-4911-bbba-98f480e80f0c",
    //    "childTypeID": "67577452-88d7-4f52-af7c-4f857ec52d1a",
    //    "entId": "00000000-0000-0000-0000-000000000000",
    //    "buildingId": "00000000-0000-0000-0000-000000000000",
    //    "keypartId": "00000000-0000-0000-0000-000000000000",
    //    "locationDes":"tttttt"
    //    "childTypes":[
    //        {"itemId":"a476bab0-01be-11e9-97ae-c85b76a0162a", "flag":"1"},
    //        {"itemId":"f5ee34f0-01be-11e9-97ae-c85b76a0162a", "flag":"1"},
    //        {"itemId":"f5f560a0-01be-11e9-97ae-c85b76a0162a", "flag":"1"}
    //    ]
    //}

    PointDataApi.prototype.getPointInfoById = function (token, pointId, okCallback, failCallback) {

        var url = "/OpenApi/Point/GetPointInfoById";

        var data = {
            token: token,
            pointId: pointId
        };

        layui.neatDataApi.sendGet(url, data, okCallback, failCallback);

    };


    /**
   * 编辑时保存 巡检点,
   patrolPointData数据格式如下:
        var patrolPointData =  {
            "id":"f446c4c6-7e4b-4911-bbba-98f480e80f0c",
            "pointName": "公司二楼",
            "proTypeId": "f446c4c6-7e4b-4911-bbba-98f480e80f0c",
            "childTypeID": "67577452-88d7-4f52-af7c-4f857ec52d1a",
            "entId": "e5a9c860-cb2a-47dc-98d1-7b4be26acf5c",
            "buildingId": "24ec778a-68a8-45b4-91c3-f6ee767bdbf9",
            "keypartId": "0014f800-870d-464c-9855-6999a11bd925",
             "locationDes": "秦皇岛西港路66",
            "childTypes":[
    	        {"itemId":"a476bab0-01be-11e9-97ae-c85b76a0162a",
    	        "flag":"1"},
    	        {"itemId":"f5ee34f0-01be-11e9-97ae-c85b76a0162a",
    	        "flag":"1"},
    	        {"itemId":"f5f560a0-01be-11e9-97ae-c85b76a0162a",
    	        "flag":"1"}
            ]
        }
                        
   */
    PointDataApi.prototype.updatePatrolPoint = function (token, patrolPointData, okCallback, failCallback) {

        var url = "/OpenApi/Point/UpdatePointInfo/?token=" + encodeURIComponent(token);

        layui.neatDataApi.sendPost(url, patrolPointData, okCallback, failCallback);

    };


    //全局都是这一个实例
    var pointDataApiInstance = new PointDataApi();

    //暴露接口
    exports(MODULE_NAME, pointDataApiInstance);
});