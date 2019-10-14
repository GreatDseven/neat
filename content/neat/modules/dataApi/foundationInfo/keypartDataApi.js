
layui.define(["jquery", 'neatDataApi'], function (exports) {
    "use strict";

    var MODULE_NAME = 'keypartDataApi';



    var $ = layui.$;

    var KeypartDataApi = function () { };


    //获取部位列表
    KeypartDataApi.prototype.getKeyparts = function (token, domainId,enterpriseId, keyword,buildingId,floorIndex, orderByColumn, isDescOrder,
        pageIndex, pageSize, okCallback, failCallback) {
        var url = "/OpenApi/KeypartAdmin/GetKeyparts";


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
            buildingId: buildingId,
            floorIndex:floorIndex,
            orderByColumn: orderByColumn,
            isDescOrder: isDescOrder,
            pageIndex: pageIndex,
            pageSize: pageSize,
        };

        layui.neatDataApi.sendGet(url, data, okCallback, failCallback);
    };


    //获取机构下所有的建筑信息
    /*返回信息如下:
    {
    "code": 200,
    "message": "ok",
    "result": [
        {
            "id": "ef689f87-ad79-4bdc-8d1e-7c01783f43b6",
            "buildingName": "2号楼",
            "enterpriseName": "宁浩发展一零零分公司"
        }
    ]
}
    */
    KeypartDataApi.prototype.getAllBuildings = function (token, domainId, enterpriseId, okCallback, failCallback) {
        var url = "/OpenApi/KeypartAdmin/GetAllBuildings";
        var data = {
            token: token,
            domainId: domainId,
            enterpriseId: enterpriseId,
        };

        layui.neatDataApi.sendGet(url, data, okCallback, failCallback);
    };

    //新增关键部位
    KeypartDataApi.prototype.createKeypart = function (token, keypartInfo, okCallback, failCallback) {

        var url = "/OpenApi/KeypartAdmin/CreateKeypart/?token=" + encodeURIComponent(token);

        layui.neatDataApi.sendPostJson(url, keypartInfo, okCallback, failCallback);
    };

    //删除部位
    KeypartDataApi.prototype.deleteKeypart = function (token, keypartIds, okCallback, failCallback) {

        var url = "/OpenApi/KeypartAdmin/DeleteKeypart/?token=" + encodeURIComponent(token);

        layui.neatDataApi.sendPostJson(url, keypartIds, okCallback, failCallback);
    };

    //根据部位id获取部位详细信息,用于编辑部位

    /* 返回值
    {
        "code": 200,
        "message": "ok",
        "result": {
            "id": "0fdacd24-5fbb-4b3c-a2a0-c67c2f50228f",
            "name": "重点704号部位",
            "buildingName": "171号楼",
            "enterpriseName": "宁浩发展三四分公司",
            "fpinfo": "",
            "floorArea": 1,
            "floorIndex": 1,
            "inchargePerson": "",
            "telephone": "",
            "images": []
        }
    }
    */

    KeypartDataApi.prototype.getKeypartById = function (token, keypartId, okCallback, failCallback) {

        var url = "/OpenApi/KeypartAdmin/GetKeypartById/";

        var data = {
            token: token,
            id: keypartId,
        };

        layui.neatDataApi.sendGet(url, data, okCallback, failCallback);
    };

    //修改建筑
    KeypartDataApi.prototype.updateKeypart = function (token, keypartInfo, okCallback, failCallback) {

        var url = "/OpenApi/KeypartAdmin/UpdateKeypart/?token=" + encodeURIComponent(token);

        layui.neatDataApi.sendPostJson(url, keypartInfo, okCallback, failCallback);
    };
    
    

    //全局都是这一个实例
    var keypartDataApi = new KeypartDataApi();

    //暴露接口
    exports(MODULE_NAME, keypartDataApi);
});