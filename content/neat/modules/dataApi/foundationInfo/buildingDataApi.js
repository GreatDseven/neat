
layui.define(["jquery", 'neatDataApi'], function (exports) {
    "use strict";

    var MODULE_NAME = 'buildingDataApi';



    var $ = layui.$;

    var BuildingDataApi = function () { };


    //获取建筑列表
    BuildingDataApi.prototype.getBuildings = function (token, domainId,enterpriseId, keyword, buildingType, orderByColumn, isDescOrder,
        pageIndex, pageSize, okCallback, failCallback) {
        var url = "/OpenApi/BuildingAdmin/GetBuildings";


        if (!orderByColumn) {
            orderByColumn = "Id";
        }
        if (typeof isDescOrder === "undefined") {
            isDescOrder = "true";
        }

        var data = {
            token: token,
            domainId: domainId,
            enterpriseId:enterpriseId,
            keyword: keyword,
            buildingType: buildingType,
            orderByColumn: orderByColumn,
            isDescOrder: isDescOrder,
            pageIndex: pageIndex,
            pageSize: pageSize,
        };

        layui.neatDataApi.sendGet(url, data, okCallback, failCallback);
    };

    //新增建筑
    BuildingDataApi.prototype.createBuilding = function (token, buildingInfo, okCallback, failCallback) {

        var url = "/OpenApi/BuildingAdmin/CreateBuilding/?token=" + encodeURIComponent(token);

        layui.neatDataApi.sendPostJson(url, buildingInfo, okCallback, failCallback);
    };

    //删除建筑
    BuildingDataApi.prototype.deleteBuilding = function (token, buildingIds, okCallback, failCallback) {

        var url = "/OpenApi/BuildingAdmin/DeleteBuilding/?token=" + encodeURIComponent(token);

        layui.neatDataApi.sendPostJson(url, buildingIds, okCallback, failCallback);
    };

    //根据建筑id获取建筑详细信息,用户编辑建筑

    /* 返回值
    {
    "code": 200,
    "message": "ok",
    "result": {
        "id": "33c801f2-669c-4f7e-8cea-90d7f3b7c278",
        "buildingName": "1",
        "parentName": "宁浩发展八八分公司",
        "address": "1",
        "buildingType": "01",
        "archType": "3",
        "area": 1,
        "height": 1,
        "upFloorCount": 1,
        "downFloorCount": 1,
        "images": [
            {
                "id": "9f423542-09c1-4a79-b804-e6e0a4be42cf",
                "name": "捕获.PNG"
            }
        ]
    }
}
}
    */

    BuildingDataApi.prototype.getBuildingById = function (token, buildingId, okCallback, failCallback) {

        var url = "/OpenApi/BuildingAdmin/GetBuildingById/";

        var data = {
            token: token,
            id: buildingId,
        };

        layui.neatDataApi.sendGet(url, data, okCallback, failCallback);
    };

    //修改建筑
    BuildingDataApi.prototype.updateBuilding = function (token, buildingInfo, okCallback, failCallback) {

        var url = "/OpenApi/BuildingAdmin/UpdateBuilding/?token=" + encodeURIComponent(token);

        layui.neatDataApi.sendPostJson(url, buildingInfo, okCallback, failCallback);
    };
    
    

    //全局都是这一个实例
    var buildingDataApi = new BuildingDataApi();

    //暴露接口
    exports(MODULE_NAME, buildingDataApi);
});