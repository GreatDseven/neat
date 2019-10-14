layui.define(['jquery', 'neat', 'neatTools', 'neatWindowManager'], function (exports) {
    "use strict";

    var $ = layui.$;

    var MODULE_NAME = 'neatNavigator';

    var tools = layui.neatTools;
    var neat = layui.neat;
    var windowMgr = layui.neatWindowManager;


    var menuData = [

        {
            id:"a3cf124b-54d7-11e9-bac6-c85b76a0162a",
            parentId:"00000000-0000-0000-0000-000000000000",
            name: '警情处理',
            sequence: 0,
            entryPoint: "/pages/monitoring/monitor.html#/menutype=/mode=map"
        }
        //, {
        //    text: '基础信息',
        //    sequence:2
        //}, {
        //    text: '用户权限',
        //    sequence:3
        //}, {
        //    text: '巡检管理',
        //    sequence:4
        //},
        //{
        //    text: '维保管理',
        //    sequence:5
        //},
        //{
        //    text: '设备管理',
        //    sequence: 6
        //}
    ];


    var boardPage = {
        text: '首页',
        url: "/pages/board.html"
    };
    var loginPage = {
        text: "登录",
        url: "/login.html"
    };

    //回调地址
    var returnUrlParaName = "ru";
    //登陆成功后获得的token
    var tokenUrlParaName = "token";
    //用户姓名
    var userNameParaName = "uname";
    //过期时间
    var expireTimeParaName = "expire";
    //用户id
    var userIdParaName = "uid";
    //中心id
    var domaindIdParaName = "did";
    //企业id
    var enterpriseIdParaName = "eid";


    var NeatNavigator = function () { };

    NeatNavigator.prototype.getMenuData = function () {
        return menuData;
    };


    //获取主操作页面的全url地址,结果形如: http://localhost:8080/pages/board.html
    NeatNavigator.prototype.getFullBoardPageUrl = function () {
        return this.getBaseUrl() + boardPage.url;
    };

    //获取主操作页面的path,结果形如: /pages/board.html
    NeatNavigator.prototype.getBoardPageUrl = function () {
        return boardPage.url;
    };

    //获取网站的部署地址,结果形如:  http://localhost:8080
    NeatNavigator.prototype.getBaseUrl = function () {
        return location.protocol + "//" + location.host;
    };



    //跳转到登录页
    NeatNavigator.prototype.toLogin = function (returnUrl) {

        var url = neat.getLoginUrl();

        if (typeof returnUrl === "undefined") {
            returnUrl = this.getFullBoardPageUrl();
        }

        url = this.addUrlPara(url, returnUrlParaName, returnUrl);

        var rootWindow = windowMgr.getWindowRootParent();

        rootWindow.location.href = url;

    };

    //跳转到注销页面
    NeatNavigator.prototype.toLogout = function (returnUrl, token) {
        var url = neat.getLogoutUrl();

        url = this.addUrlPara(url, returnUrlParaName, returnUrl);
        url = this.addUrlPara(url, tokenUrlParaName, token);

        window.location.href = url;

    };

    //在指定的url中添加一个参数
    NeatNavigator.prototype.addUrlPara = function (url, paraName, paraValue) {
        var result = url;
        if (url.indexOf("?") == -1) {

            result = result + "?";
        }
        result = result + "&" + encodeURIComponent(paraName) + "=" + encodeURIComponent(paraValue);

        return result;
    };

    //获取随机参数
    NeatNavigator.prototype.getRandomPara = function () {
        return "__=" + new Date().valueOf().toString();
    };

    //获取url参数
    NeatNavigator.prototype.getUrlParam = function (name, url) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return decodeURIComponent(r[2]);
        return null;
    };

    //从url中获取token参数值
    NeatNavigator.prototype.getTokenFromUrl = function () {
        var value = this.getUrlParam(tokenUrlParaName);
        return value;
    };

    //从url中获取用户名参数值
    NeatNavigator.prototype.getUserNameFromUrl = function () {
        var value = this.getUrlParam(userNameParaName);
        return value;
    };

    //从url中获取过期时间参数值
    NeatNavigator.prototype.getExpireTimeFromUrl = function () {
        var value = this.getUrlParam(expireTimeParaName);
        return value;
    };

    
    //从url中获取所属中心id的参数值
    NeatNavigator.prototype.getUserIdFromUrl = function () {
        var value = this.getUrlParam(userIdParaName);
        return value;
    };

    //从url中获取所属中心id的参数值
    NeatNavigator.prototype.getDomainIdFromUrl = function () {
        var value = this.getUrlParam(domaindIdParaName);
        return value;
    };
    //从url中获取所属单位id的参数值
    NeatNavigator.prototype.getEnterpriseIdFromUrl = function () {
        var value = this.getUrlParam(enterpriseIdParaName);
        return value;
    };



    //登录成功后,跳转回原来的页面
    NeatNavigator.prototype.loginContinue = function () {
        var returnUrl = this.getUrlParam(returnUrlParaName);
        if (!returnUrl) {
            returnUrl = boardPage.url;
        }
        window.location.href = returnUrl;
    };

    // 设置tree选中的节点,
    NeatNavigator.prototype.setSelectedTreeNodeInfo = function (treeNode) {

        this.currentTreeNode = JSON.parse(JSON.stringify(treeNode));
    };

    //获取当前选中的树节点信息,返回 data = { domainId:"", enterpriseId:""}
    NeatNavigator.prototype.getSelectedTreeNodeInfo = function () {
       
        /*
        {
            "id":"7fc0a2cb-d23e-4a67-b183-464c77fcaf9d"
            ,"parentID":"891200fd-360a-11e5-bee7-000ec6f9f8b3"
            ,"name":"北京分中心"
            ,"type":1
            ,"fullAccess":true
        }
        */

        if (!this.currentTreeNode) {
            return null;
        }

        var data = {
            id: this.currentTreeNode.id,
            domainId:"",
            enterpriseId: "",
            buildingId: "",
            keypartId:"",
            name: this.currentTreeNode.name,
            parentId:this.currentTreeNode.parentID,
            fullAccess: this.currentTreeNode.fullAccess,
            type: this.currentTreeNode.type
        };

        if (this.currentTreeNode.type === 1) {
            data.domainId = this.currentTreeNode.id;
            
        }
        else if (this.currentTreeNode.type === 2) {
            data.enterpriseId = this.currentTreeNode.id;
        }
        else if (this.currentTreeNode.type === 3) {
            data.buildingId = this.currentTreeNode.id;
        }
        else if (this.currentTreeNode.type === 4) {
            data.keypartId = this.currentTreeNode.id;
        }

        return data;
    };

    //获取location.hash中指示的页面
    //依据location.hash中的内容获取当前页面
    //例如 http://localhost/test/index.html#/fold1/page1.html/:method1/id=34/er=45
    //应该返回 /folder1/page1.html
    NeatNavigator.prototype.getHashPath = function () {
        var routerData = layui.router();

        // 当前的location是:http://localhost/test/index.html#/folder1/mypage1.html/id=6/er=34
        // 那么此时 routerData 为:
        // hash: ""
        // href: "/folder1/mypage1.html/id=6/er=34"
        // path: (3) ["folder1", "mypage1.html"]
        // search: {id: "6", er: "34"}

        var result = "/";
        result = result + tools.join(routerData.path, '/');
        return result;

    };


    //设置hash的Search部分,data是一个数组,每个数组元素都是{key:"",value:""}
    NeatNavigator.prototype.setHashSearchData = function (data) {

        var routerData = layui.router();

        var tmpQueryDic = {};

        //先取一遍
        layui.each(routerData.search, function (key, value) {
            tmpQueryDic[key] = value;
        });

        //再取一遍
        if (routerData.hash !== "") {
            layui.each(layui.router(routerData.hash).search, function (key, value) {
                tmpQueryDic[key] = value;
            });
        }

        var result = "/";

        result = result + tools.join(routerData.path, '/');
        //使用新值覆盖一遍
        layui.each(data, function (_, item) {
            tmpQueryDic[encodeURIComponent(item.key)] = encodeURIComponent(item.value);
        });

        var query = [];
        layui.each(tmpQueryDic, function (pkey, pvalue) {
            query.push(pkey + "=" + pvalue);
        });

        if (result.indexOf("#") < 0) {
            result = result + "#";
        }
        result = result + "/" + query.join('/');

        location.hash = result;


    };

    //设置hash中的path部分和searchData部分
    NeatNavigator.prototype.setHashPathAndSearchData = function (url, searchData) {

        // console.log("url:" + url);
        // console.log("searchData:" + JSON.stringify(searchData));

        var getHash = function (aurl) {
            var index = aurl.indexOf("#");
            if (index == -1) {
                return "";
            }
            return aurl.toString().substr(index);
        };

        var getUrl = function (aurl) {
            var index = aurl.indexOf("#");
            if (index == -1) {
                return aurl;
            }
            if (index == 0) {
                return getUrl(aurl.substr(1));
            }
            return aurl.toString().substr(0, index);
        };

        var routerData = layui.router();

        var result = "";

        result = getUrl(url);

        var queryDic = {};

        layui.each(routerData.search, function (pkey, pvalue) {
            queryDic[pkey] = pvalue;
        });

        layui.each(layui.router(routerData.hash).search, function (pkey, pvalue) {

            queryDic[pkey] = pvalue;
        });

        if (searchData) {
            layui.each(searchData, function (pkey, pvalue) {
                queryDic[pkey] = pvalue;
            });
        }

        var routerData2 = layui.router(getHash(url));
        layui.each(routerData2.search, function (pkey, pvalue) {
            queryDic[pkey] = pvalue;
        });

        var query = [];
        layui.each(queryDic, function (pkey, pvalue) {
            query.push(pkey + "=" + pvalue);
        });

        if (query.length > 0) {
            if (result.indexOf("#") < 0) {
                result = result + "#";
            }
            result = result + "/" + query.join('/');
        }

        location.hash = result;

    };

    //暴露接口
    exports(MODULE_NAME, new NeatNavigator());
});