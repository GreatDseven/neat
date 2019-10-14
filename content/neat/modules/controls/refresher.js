layui.define(['jquery'], function (exports) {

    "use strict";
    var $ = layui.$;
    var MODULENAME = "autoRefresh";

    var AutoRefresh = function () {

    };

    //600秒10分钟
    var defaultInterval = 600000;

    //所有setInterval的handle,
    //存储的内容格式如下: 
    //例如 test()
    //会存储为: timeoutHandlers["test"]= {handle:1,function:func}
    var timeoutHandlers = {};
    var counter = 0;


    $(window).on("unload", function () {
        for (var index in timeoutHandlers) {
            var item = timeoutHandlers[index];
            clearInterval(item.handle);
        }
        timeoutHandlers = {};
        counter = 0;
    });

    //获取 函数的key
    function getFuncKey(func) {
        return func.name + "_" + (++counter);

    }
    //添加 自动刷新
    AutoRefresh.prototype.autoRefresh = function (funcToCall, intval) {

        if (!intval) {
            intval = defaultInterval;
        }

        var handle = setInterval(funcToCall, intval);
        timeoutHandlers[getFuncKey(funcToCall)] = {
            handle: handle,
            function: funcToCall
        };

        try {
            funcToCall();
        } catch (e) {
            console.error(funcToCall.name + " fail to exec !" + e);
        }
        return handle;
    };
    AutoRefresh.prototype.autoRefreshStop = function (handle) {
        clearInterval(handle);
    };
    exports(MODULENAME, new AutoRefresh());

});