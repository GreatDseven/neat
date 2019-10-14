
layui.define([], function (exports) {
    "use strict";

    var MODULE_NAME = 'neatConfig';

    var configInfo = {

        //" + window.location.hostname + "
        //====================================可修改区域=================================

        //这些配置中的IP地址,
        //"不可以填写localhost" "或者","127.0.0.1" 这些本机才能访问的地址.,
        //因为这些配置在远程客户端浏览器中执行,并非在服务器端执行.,

        //应用名称
        appName: "尼特云智慧消防平台",

        //登录地址
        loginUrl: "http://192.168.0.100:8089/",

        //注销地址
        logoutUrl: "http://192.168.0.100:8089/logout.html",

        //webApi访问地址
        dataApiBaseUrl: "http://192.168.0.100:5400", //"http://localhost:22222"

        //signalr 事件推送服务端地址
        signalRBaseUrl: "http://192.168.0.100:8086",

        //系统编号
        systemIds: [
            /*巡检管理*/
            2,
            /*维保管理*/
            4,
            /*用户权限*/
            6,
            /*基础信息*/
            7,
            /*设备管理*/
            9,
            /*接处警情*/
            11
        ]

        //====================================可修改区域结束=================================
    };

    exports(MODULE_NAME, configInfo);
});