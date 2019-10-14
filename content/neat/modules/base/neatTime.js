layui.define(['jquery','neatTools'], function (exports) {
    "use strict";

    var $ = layui.$;
    var neatTools = layui.neatTools;


    var NeatTime = function(options){
        this.options = options;
        this.timeHandle = -1;
    };

    NeatTime.prototype.init = function () {
        this.tick();
    };

    //NeatTime.prototype.showLocaleTime = function (objD) {

    //    var date = this.getLocaleTimeData(objD);

    //    return date.year + "-" + date.month + "-" + date.day + " " + date.hour + ":" + date.minute + ":" + date.second;

    //};

    ////把日期对象拆开各个字符串的属性
    //NeatTime.prototype.getLocaleTimeData = function (objD) {

    //    var yy = objD.getYear();
    //    if (yy < 1900) yy = yy + 1900;
    //    var MM = objD.getMonth() + 1;
    //    if (MM < 10) MM = '0' + MM;
    //    var dd = objD.getDate();
    //    if (dd < 10) dd = '0' + dd;
    //    var hh = objD.getHours();
    //    if (hh < 10) hh = '0' + hh;
    //    var mm = objD.getMinutes();
    //    if (mm < 10) mm = '0' + mm;
    //    var ss = objD.getSeconds();
    //    if (ss < 10) ss = '0' + ss;

    //    return {
    //        year: yy,
    //        month: MM,
    //        day: dd,
    //        hour: hh,
    //        minute: mm,
    //        second: ss,
    //        obj: objD
    //    };

    //};

    NeatTime.prototype.tick = function () {
        var that = this;
        $(that.options.elem).html(neatTools.dateToString(new Date()));

        var tickImpl = function(){
            window.clearTimeout(that.timeHandle);
            $(that.options.elem).html(neatTools.dateToString(new Date()));
            
            that.timeHandle = window.setTimeout(tickImpl,1000);
        };
        that.timeHandle = window.setTimeout(tickImpl, 1000);
    };


    //暴露接口
    exports('neatTime', function (options) {

        var neatTime = new NeatTime(options = options || {});

        var elem = $(options.elem);
        
        neatTime.init(elem);
    });
});