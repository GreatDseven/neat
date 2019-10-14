

layui.define(['jquery'], function (exports) {
    "use strict";

    var MODULE_NAME = "neatTools";
    var $ = layui.$;

    var NeatTools = function () { };

    //把数组中的值拼接成分隔符间隔的字符串,拼接过程中,忽略空字符串元素.
    //例如:contact(["a","b","","c"],,'/')
    //返回 "a/b/c" 而不是 "a/b//c"
    NeatTools.prototype.join = function (array, sep) {
        var str = "";
        layui.each(array, function (index, item) {
            if (item === "") {
                return;
            }
            if (index == 0) {
                str = item;
            }
            else {
                str = str + "/" + item;
            }

        });
        return str;
    };

    //传入一个  时间的格式为: yyyy-MM-dd HH:mm:ss  的字符串,返回一个Date对象.
    NeatTools.prototype.convertToDate = function (dateStr) {


        if (!dateStr) {
            return new Date();
        }

        var dateItems = dateStr.split(/[\-\s:]/g);
        return new Date(parseInt(dateItems[0]), parseInt(dateItems[1]) - 1, parseInt(dateItems[2])
            , parseInt(dateItems[3])
            , parseInt(dateItems[4])
            , parseInt(dateItems[5])
            , 0
        );

    };

  
    //传入一个Date类型的对象,返回 yyyy-MM-dd HH:mm:ss 格式的字符串数据
    NeatTools.prototype.dateToString = function (objD) {

        var date = this.getDateData(objD);

        return date.year + "-" + date.month + "-" + date.day + " " + date.hour + ":" + date.minute + ":" + date.second;

    };
    //把日期对象拆开各个字符串的属性,objD 为Date类型
    NeatTools.prototype.getDateData = function (objD) {

        var yy = objD.getYear();
        if (yy < 1900) yy = yy + 1900;
        var MM = objD.getMonth() + 1;
        if (MM < 10) MM = '0' + MM;
        var dd = objD.getDate();
        if (dd < 10) dd = '0' + dd;
        var hh = objD.getHours();
        if (hh < 10) hh = '0' + hh;
        var mm = objD.getMinutes();
        if (mm < 10) mm = '0' + mm;
        var ss = objD.getSeconds();
        if (ss < 10) ss = '0' + ss;

        return {
                year: yy,
                month: MM,
                day: dd,
                hour: hh,
                minute: mm,
                second: ss,
                obj: objD
            };

    };

    //从格式为 yyyy-MM-dd HH:mm:ss 格式的日期字符串中截取日期部分
    NeatTools.prototype.getDatePartStr = function (dateStr) {

        if (dateStr) {
            
            var result = dateStr.split(' ');
            if (result.length > 0)
            {
                return result[0];
            }
            else {
                return "";
            }
        }
        else {
            return "";
        }

    };

    //从格式为 yyyy-MM-dd HH:mm:ss 格式的日期字符串中截取时间部分
    NeatTools.prototype.getTimeTimePart = function (dateStr) {

        if (dateStr) {

            var result = dateStr.split(' ');
            if (result.length > 1) {
                return result[1];
            }
            else {
                return "";
            }

        }
        else {
            return "";
        }
    };

    //把日期对象拆开各个字符串的属性
    NeatTools.prototype.getLocaleTimeData = function (objD) {

        var yy = objD.getYear();
        if (yy < 1900) yy = yy + 1900;
        var MM = objD.getMonth() + 1;
        if (MM < 10) MM = '0' + MM;
        var dd = objD.getDate();
        if (dd < 10) dd = '0' + dd;
        var hh = objD.getHours();
        if (hh < 10) hh = '0' + hh;
        var mm = objD.getMinutes();
        if (mm < 10) mm = '0' + mm;
        var ss = objD.getSeconds();
        if (ss < 10) ss = '0' + ss;

        return {
            year: yy,
            month: MM,
            day: dd,
            hour: hh,
            minute: mm,
            second: ss,
            obj: objD
        };

    };

    NeatTools.prototype.shortenTimeStr = function (timeStr) {

        if (!timeStr) {
            return "";
        }

        if (timeStr === "0001-01-01 00:00:00") {
            return "";
        }

        if (timeStr === "1970-01-01 08:00:00" || timeStr === "1970-01-01 00:00:00") {
            return "";
        }



        var current = new Date();
        if (!this.todayDate) {
            this.todayDate = this.getLocaleTimeData(current);
        }
        if (this.todayDate.obj.getDate() != current.getDate()) {
            this.todayDate = this.getLocaleTimeData(current);
        }

        var dateObj = this.convertToDate(timeStr);

        var result = "";

        //年份不同,直接返回原值
        if (dateObj.getFullYear() != this.todayDate.obj.getFullYear()) {
            return timeStr;
        }

        var localDateObj = this.getLocaleTimeData(dateObj);

        //到这里,年相同了,看月是否相同,月不同,显示月日时分秒
        if (dateObj.getMonth() != this.todayDate.obj.getMonth()) {

            return localDateObj.month + "-" + localDateObj.day + " " + localDateObj.hour + ":" + localDateObj.minute + ":" + localDateObj.second;
        }

        //到这里应该是月也相同,比较天是否相同,日不相同,显示 月日时分秒

        if (dateObj.getDate() != this.todayDate.obj.getDate()) {

            return localDateObj.month + "-" + localDateObj.day + " " + localDateObj.hour + ":" + localDateObj.minute + ":" + localDateObj.second;
        }

        //到这里应该是当前的,只显示 时:分:秒
        return localDateObj.hour + ":" + localDateObj.minute + ":" + localDateObj.second;


    };

    // 获取指定日期所在周的周一和周日
    NeatTools.prototype.getMondayAndSunday = function (datevalue) {



        var dateValue = datevalue;

        var arr = dateValue.split("-");

        //月份-1 因为月份从0开始 构造一个Date对象
        var date = new Date(parseInt(arr[0], 10), parseInt(arr[1], 10) - 1, parseInt(arr[2], 10));

        var dateOfWeek = date.getDay();//返回当前日期的在当前周的某一天（0～6--周日到周一）

        var dateOfWeekInt = parseInt(dateOfWeek, 10);//转换为整型

        if (dateOfWeekInt === 0) {//如果是周日
            dateOfWeekInt = 7;
        }

        var aa = 7 - dateOfWeekInt;//当前于周末相差的天数

        var temp2 = parseInt(arr[2], 10);

        var sunDay = temp2 + aa;//当前日期的周日的日期

        var monDay = sunDay - 6;//当前日期的周一的日期

        var startDate = new Date(arr[0], arr[1] - 1, monDay);
        var endDate = new Date(arr[0], arr[1] - 1, sunDay);

        var sm = parseInt(startDate.getMonth()) + 1;//月份+1 因为月份从0开始
        var em = parseInt(endDate.getMonth()) + 1;

        //  alert("星期一的日期："+startDate.getFullYear()+"-"+sm+"-"+startDate.getDate());
        //  alert("星期日的日期："+endDate.getFullYear()+"-"+em+"-"+endDate.getDate());
        var start = startDate.getFullYear() + "-" + sm + "-" + startDate.getDate();
        var end = endDate.getFullYear() + "-" + em + "-" + endDate.getDate();

        var result = [];
        result.push(start);
        result.push(end);

        return result;
    };

    //传入日期对象,返回yyyy-MM-dd
    NeatTools.prototype.formatDate = function (date) {

        return date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
    };

    //格式化10进制地址编码
    NeatTools.prototype.formatDECAddrCode = function (addStr) {

        var subCodes = addStr.split(".");

        var result = [];
        var isSubCodeOK = true;

        var regex = new RegExp(/^[0-9]{1,3}$/);

        layui.each(subCodes, function (_, v) {

            if (v == "") {
                return;
            }
            //判断 最长是3位数字
                if (regex.test(v) === false) {
                isSubCodeOK = false;
                return;
            }
            if (!isSubCodeOK)
                return;
            //必须是在0-255之间的整数
            var realVal = parseInt(v);
            if (isNaN(realVal) || realVal < 0 || realVal > 255) {
                isSubCodeOK = false;
                return;
            }

            var tmp = "000" + realVal;

            result.push(tmp.substr(tmp.length - 3, 3));

        });

        if (isSubCodeOK) {
            return result.join(".");
        }
        else {
            return addStr;
        }
    };

    //暴露接口
    exports(MODULE_NAME, new NeatTools());
});