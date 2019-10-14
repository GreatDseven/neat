layui.define(["jquery", 'neatDataApi', 'neatNavigator', 'neat', 'waterDeviceDataApi'], function (exports) {
    "use strict";

    var $ = layui.$;
    var neatDataApi = layui.neatDataApi;
    var neatNavigator = layui.neatNavigator;
    var base = layui.neat;
    var waterDeviceDataApi = layui.waterDeviceDataApi;


    var CommonDataApi = function () { };
    // 获取 潍坊系统字典类型
    CommonDataApi.prototype.getCodeType = function (codeType, token, callback) {

        // 构造发送数据
        var data = {
            token: token,
            strType: codeType
        };

        // 获取项目类型URL
        var url = "/OpenApi/EnterpriseAdmin3rd/GetCode";
        layui.neatDataApi.sendGet(url, data, callback);
    };
   
    //=================================================================================================

    exports('common3rdDataApi', new CommonDataApi());
});