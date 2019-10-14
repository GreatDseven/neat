layui.define(["jquery", 'neatDataApi'], function (exports) {
    "use strict";

    var MODULE_NAME = 'userAdminDataApi';


    var $ = layui.$;

    var UserAdminDataApi = function () { };



    /**
     * 获取人员列表
     */

    /*
    返回:

    {
        "code": 200,
        "message": "ok",
        "result": {
            "totalCount": 11,
            "data": [
                {
                    "id": "02aaf7d0-5ec5-4855-9b99-533065449dac",
                    "name": "管理员3",
                    "jobNo": "000001",
                    "telephone": "admin3"
                }
            ]
        }
    }
    */
    UserAdminDataApi.prototype.getUsers = function (token, domainId, enterpriseId,roleId, orderByColumn, isDescOrder,
        pageIndex, pageSize, okCallback, failCallback) {


        var url = "/OpenApi/UserAdmin/GetUsers";

       
        if (!orderByColumn) {
            orderByColumn = "none";
        }
        if (typeof isDescOrder === "undefined") {
            isDescOrder = "true";
        }

        var data = {
            token: token,
            domainId: domainId,
            enterpriseId: enterpriseId,
            roleId:roleId,
            orderByColumn: orderByColumn,
            isDescOrder: isDescOrder,
            pageIndex: pageIndex,
            pageSize: pageSize,
        };

        layui.neatDataApi.sendGet(url, data, okCallback, failCallback);


    };

    //添加用户
    // userData的格式如下
    //var userData = {
    //    userName: "",
    //    pwd: "",
    //    name: "",
    //    jobNo: "",
    //    telephone: "",
    //    domainId: "",
    //    enterpriseId: "",
    //};
    UserAdminDataApi.prototype.createUser = function (token, userData, okCallback, failCallback) {

        var url = "/OpenApi/UserAdmin/CreateUser?token=" + encodeURIComponent(token);

        layui.neatDataApi.sendPost(url, userData, okCallback, failCallback);
    };

    //修改用户
    UserAdminDataApi.prototype.updateUser = function (token, userData, okCallback, failCallback) {

        var url = "/OpenApi/UserAdmin/UpdateUser?token=" + encodeURIComponent(token);

        layui.neatDataApi.sendPost(url, userData, okCallback, failCallback);
    };

    //根据用户id获取用户信息
    UserAdminDataApi.prototype.getUserDetailById = function (token, userId, okCallback, failCallback) {

        var url = "/OpenApi/UserAdmin/GetUserDetailById";

        var data = {
            token: token,
            userId: userId
        };

        layui.neatDataApi.sendGet(url, data, okCallback, failCallback);
    };



    //删除人员
    UserAdminDataApi.prototype.deleteUsers = function (token, userIds, okCallback, failCallback) {

        var url = "/OpenApi/UserAdmin/DeleteUsers/?token=" + encodeURIComponent(token);

        layui.neatDataApi.sendPostJson(url, userIds, okCallback, failCallback);
    };

    //获取指定角色下已有人员以及待选人员列表.

    /*
    返回:
    {
        "code": 200,
        "message": "ok",
        "result": [
            {
                "id": "f040ab9e-d689-4629-9980-2a08f407950c",
                "name": "兰州演示",
                "selected": true,
                "jobNo": "000013",
                "telephone": "111"
            }
        ]
    }
    */
    UserAdminDataApi.prototype.getUsersAndCandidateUsersByRoleId = function (token, roleId, okCallback, failCallback) {

        var url = "/OpenApi/UserAdmin/GetUsersAndCandidateUsersByRoleId";

        var data = {
            token: token,
            roleId: roleId
        };

        layui.neatDataApi.sendGet(url, data, okCallback, failCallback);
    };



    

    //全局都是这一个实例
    var userAdminDataApi = new UserAdminDataApi();

    //暴露接口
    exports(MODULE_NAME, userAdminDataApi);
});