layui.define(["jquery", 'neatDataApi'], function (exports) {
    "use strict";

    var MODULE_NAME = 'roleAdminDataApi';


    var $ = layui.$;

    var RoleAdminDataApi = function () { };



    /**
     * 获取角色列表
     */
    /*
    返回:
    {
        "code": 200,
        "message": "ok",
        "result": {
            "totalCount": 7,
            "data": [
                {
                    "id": "",
                    "roleName": "普通管理员",
                    "roleLevel": 2
                }
            ]
        }
    }
    
    */

    RoleAdminDataApi.prototype.getRoles = function (token, domainID, enterpriseID, orderByColumn, isDescOrder,
        pageIndex, pageSize, okCallback, failCallback) {


        var url = "/OpenApi/RoleAdmin/GetRoles";

       
        if (!orderByColumn) {
            orderByColumn = "none";
        }
        if (typeof isDescOrder === "undefined") {
            isDescOrder = "true";
        }

        var data = {
            token: token,
            domainId: domainID,
            enterpriseId: enterpriseID,
            orderByColumn: orderByColumn,
            isDescOrder: isDescOrder,
            pageIndex: pageIndex,
            pageSize: pageSize,
        };

        layui.neatDataApi.sendGet(url, data, okCallback, failCallback);


    };

    //根据用户id获取指定用户的所有角色和备选角色列表
    /*
    返回:
    {
        "code": 200,
        "message": "ok",
        "result": [
            {
                "id": "",
                "roleName": "管理员",
                "roleLevel": 2,
                "selected": true
            }
        ]
    }
    */
    RoleAdminDataApi.prototype.getRolesAndCandidateRolesByUserId = function (token, userId, okCallback, failCallback) {

        var url = "/OpenApi/RoleAdmin/GetRolesAndCandidateRolesByUserId";

        var data = {
            token: token,
            userId: userId
        };

        layui.neatDataApi.sendGet(url, data, okCallback, failCallback);
    };
    //修改用户所属角色
    RoleAdminDataApi.prototype.updateUserRoles = function (token, userRoleInfo, okCallback, failCallback) {

        var url = "/OpenApi/RoleAdmin/updateUserRoles/?token=" + encodeURIComponent(token);

        layui.neatDataApi.sendPostJson(url, userRoleInfo, okCallback, failCallback);
    };
    

    //删除角色
    RoleAdminDataApi.prototype.deleteRoles = function (token, roleIds, okCallback, failCallback) {

        var url = "/OpenApi/RoleAdmin/deleteRoles/?token=" + encodeURIComponent(token);

        layui.neatDataApi.sendPostJson(url, roleIds, okCallback, failCallback);
    };

    //获取指定机构下是否可以新建管理角色
    /*
    返回:
    {
    "code": 200,
    "message": "ok",
    "result": false
    }
    */
    RoleAdminDataApi.prototype.canAddAdminRole = function (token, orgId, orgType, okCallback, failCallback) {
        
        var url = "/OpenApi/RoleAdmin/CanAddAdminRole";

        var data = {
            token: token,
            orgId: orgId,
            orgType: orgType
        };

        layui.neatDataApi.sendGet(url, data, okCallback, failCallback);
    };

    //获取当前用户的最大的机构服务范围
    /*
    返回;
    {
        "code": 200,
        "message": "ok",
        "result": [
            {
                "id": "f96c7500474dd8350",
                "parentID": "8912000ec6f9f8b3",
                "name": "海港区",
                "type": 1,
                "fullAccess": true
            }
        ]
    }
    */
    RoleAdminDataApi.prototype.getAllCandidateOrgScope = function (token, parentOrgId, okCallback, failCallback) {
       
        var url = "/OpenApi/RoleAdmin/GetAllCandidateOrgScope";

        var data = {
            token: token,
            parentOrgId: parentOrgId
        };

        layui.neatDataApi.sendGet(url, data, okCallback, failCallback);
    };

    //获取当前用户在指定类型客户端下能够访问的模块信息树
    /*
    返回:
    {
        "code": 200,
        "message": "ok",
        "result": [
            {
                "id": "2",
                "parentID": "00000000-000000000000",
                "name": "巡检系统",
                "type": 1
            }
        ]
    }
    */
    RoleAdminDataApi.prototype.getAllCandidateModuleScope = function (token, cleintCategory, roleLevel, okCallback, failCallback) {

        var url = "/OpenApi/RoleAdmin/GetAllCandidateModuleScope";

        var data = {
            token: token,
            cleintCategory: cleintCategory,
            roleLevel: roleLevel
        };

        layui.neatDataApi.sendGet(url, data, okCallback, failCallback);
    };


    //创建角色
    RoleAdminDataApi.prototype.createRole = function (token, roleData, okCallback, failCallback) {

        var url = "/OpenApi/RoleAdmin/createRole/?token=" + encodeURIComponent(token);

        layui.neatDataApi.sendPostJson(url, roleData, okCallback, failCallback);
    };

    //修改角色下的用户列表
    RoleAdminDataApi.prototype.updateRoleUsers = function (token, userIds, okCallback, failCallback) {

        var url = "/OpenApi/RoleAdmin/UpdateRoleUsers/?token=" + encodeURIComponent(token);

        layui.neatDataApi.sendPostJson(url, userIds, okCallback, failCallback);
    };


    //修改角色时根据角色编号获取角色详情
    /*
    返回:
    {
        "code": 200,
        "message": "ok",
        "result": {
            "roleId": "56d19c4430",
            "roleName": "接警员",
            "roleLevel": 1,
            "domainId": "8912b3",
            "entId": "00000000-0000-0000000",
            "orgName": "秦皇岛"
        }
    }
    
    */
    RoleAdminDataApi.prototype.getRoleDetailByIdForUpdate = function (token, roleId, okCallback, failCallback) {

        var url = "/OpenApi/RoleAdmin/GetRoleDetailByIdForUpdate";

        var data = {
            token: token,
            roleId: roleId
        };

        layui.neatDataApi.sendGet(url, data, okCallback, failCallback);
    };
    //获取指定角色的模块权限(包括已经选择的和备选的)
    /*
    返回:
    {
        "code": 200,
        "message": "ok",
        "result": [
            {
                "id": "2",
                "parentID": "0000000000000",
                "name": "巡检系统",
                "type": 1,
                "selected": false
            }
        ]
    }
    */
    RoleAdminDataApi.prototype.getRoleModuleScopeForUpdate = function (token, roleId, clientType, okCallback, failCallback) {

        var url = "/OpenApi/RoleAdmin/GetRoleModuleScopeForUpdate";

        var data = {
            token: token,
            roleId: roleId,
            clientType: clientType
        };

        layui.neatDataApi.sendGet(url, data, okCallback, failCallback);
    };


    //获取指定角色的机构权限(包括已经选择的和备选的)
    /*
    返回:
    {
        "code": 200,
        "message": "ok",
        "result": [
            {
                "id": "79b8faa7043",
                "parentID": "891200ff9f8b3",
                "name": "宁浩发展八八分公司",
                "type": 2,
                "selected": false
            }
        ]
    }
    */
    RoleAdminDataApi.prototype.getRoleOrgScopeForUpdate = function (token, roleId,  okCallback, failCallback) {

        var url = "/OpenApi/RoleAdmin/GetRoleOrgScopeForUpdate";

        var data = {
            token: token,
            roleId: roleId
        };

        layui.neatDataApi.sendGet(url, data, okCallback, failCallback);
    };


    //修改角色
    /*
    发送的数据:
    var roleData ={
        roleId:"40977f74-d5ce-488b-bb02-ba4b9e99b8bf",
        roleName:"测试普通角色2",
        orgScope:["c38f9b48-d3f9-41e1-a823-a64d0d49dff7"],
        desktopScope:[],
        webScope:[],
        appScope:[],
    }
    返回:
    {
        "code": 200,
        "message": "ok",
        "result": null
    }
    */
    RoleAdminDataApi.prototype.updateRole = function (token, roleData, okCallback, failCallback) {

        var url = "/OpenApi/RoleAdmin/UpdateRole/?token=" + encodeURIComponent(token);

        layui.neatDataApi.sendPostJson(url, roleData, okCallback, failCallback);
    };


    //全局都是这一个实例
    var roleAdminDataApi = new RoleAdminDataApi();

    //暴露接口
    exports(MODULE_NAME, roleAdminDataApi);
});