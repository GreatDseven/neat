layui.define(["jquery",'neat', "neatLoginOp", "neatNavigator","layer"], function (exports) {

    "use strict";

    var $ = layui.$;

    var loginOp = layui.neatLoginOp;

    var layer = layui.layer;

    var Page = function () { };


    Page.prototype.init = function () {

        var loadingIndex = layer.load(1);

        $("title").text(layui.neat.appName);

        loginOp.checkLogin(function () {

            layer.close(loadingIndex);
        });
       
    };

    exports("pageIndex",  new Page());

});