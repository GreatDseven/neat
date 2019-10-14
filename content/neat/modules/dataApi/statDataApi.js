
// 统计报表用到的数据访问api
layui.define(["jquery", 'neat', 'neatDataApi', 'layer'], function (exports) {
    "use strict";

    var MODULE_NAME = 'statDataApi';

    var $ = layui.$;
    var neat = layui.neat;
    var layer = layui.layer;

    var ModuleDefine = function () { };





    //生成警情信息报表
    ModuleDefine.prototype.generateEventReport = function (token, enterpriseId, reportType, datePara, okCallback, failCallback) {
        var urlWeekReport = "/OpenApi/Statistics/GetStatisticsWeek";
        var urlMonthReport = "/OpenApi/Statistics/GetStatisticsMonth";
        var urlYearReport = "/OpenApi/Statistics/GetStatisticsYear";

        var url = "";

        var data = {
            token: token,
            enterpriseId: enterpriseId,
        };

        switch (reportType) {
            case "week":
                url = urlWeekReport;
                data.dateTime = datePara;
                break;
            case "month":
                url = urlMonthReport;
                data.yearMonth = datePara;
                break;
            case "year":
                url = urlYearReport;
                data.year = datePara;
                break;
        }
        var fireReportAjax = $.ajax({
            method: "GET",
            cache: false,
            url: neat.getDataApiBaseUrl() + url,
            data: $.extend({ eventCategory: "fire" }, data),
            dataType: "json",
            crossDomain: true
        });

        var waterReportAjax = $.ajax({
            method: "GET",
            cache: false,
            url: neat.getDataApiBaseUrl() + url,
            data: $.extend({ eventCategory: "water" }, data),
            dataType: "json",
            crossDomain: true
        });

        var nbReportAjax = $.ajax({
            method: "GET",
            cache: false,
            url: neat.getDataApiBaseUrl() + url,
            data: $.extend({ eventCategory: "nb" }, data),
            dataType: "json",
            crossDomain: true
        });


        var entInfoAjax = $.ajax({
            method: "GET",
            cache: false,
            url: neat.getDataApiBaseUrl() + "/OpenApi/EnterpriseAdmin/GetEnterpriseById/",
            data: {
                token: token,
                id: enterpriseId
            },
            dataType: "json",
            crossDomain: true
        });



        $.when(
            fireReportAjax,
            waterReportAjax,
            nbReportAjax,
            entInfoAjax
        ).done(function (fire, water, nb, ent) {


            if (typeof okCallback === "function") {
                okCallback({
                    fire: fire[0].result.reportData,
                    water: water[0].result.reportData,
                    nb: nb[0].result.reportData,
                    ent: ent[0].result,
                    reportDate: fire[0].result.reportDate

                });
            }

        }).fail(function (f, w, n, ent) {

            if (typeof failCallback === "function") {
                failCallback();
            }
        });
    };

    //警情信息导出excel
    ModuleDefine.prototype.exportEventReportToExcel = function (token, type, enterpriseId, reportType, datePara, saveName) {

        var url = neat.getDataApiBaseUrl();

        var urlWeekReport = "/OpenApi/Statistics/ExportStatisticsWeek";
        var urlMonthReport = "/OpenApi/Statistics/ExportStatisticsMonth";
        var urlYearReport = "/OpenApi/Statistics/ExportStatisticsYear";

        var data = {
            token: token,
            enterpriseId: enterpriseId,
            type: type

        };

        switch (reportType) {
            case "week":

                data.dateTime = datePara;
                url += urlWeekReport;
                break;
            case "month":
                data.yearMonth = datePara;
                url += urlMonthReport;
                break;
            case "year":
                data.year = datePara;
                url += urlYearReport;
                break;
        }


        var queryStr = "?";

        $.each(data, function (name, value) {

            queryStr = queryStr + "&" + name + "=" + encodeURIComponent(value);
        });

        exportFileByHTML5(url + queryStr, data, saveName);
    };

    //使用html form提交的方式 下载
    function exportFileByHTMLForm(url, data) {

        var form = $("<form/>").attr("action", url).attr("method", "get");

        $.each(data, function (name, value) {
            form.append($("<input/>").attr("type", "hidden").attr("name", name).attr("value", value));
        });
        form.appendTo('body').submit().remove();

    }

    //使用html5 a 标记结合 blob api 下载
    function exportFileByHTML5(url, sendData, saveName) {

        var a = document.createElement('a');

        if (!("download" in a)) {

            exportFileByHTMLForm(url, sendData);
            return;
        }


        var layIndex = layer.load(1);
        var xhr = new XMLHttpRequest();
        xhr.open('get', url, true);
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xhr.responseType = "blob";   //返回类型blob
        xhr.onerror = function (err) {

            layer.close(layIndex);
            layer.msg('导出失败');
        },
        xhr.onload = function () {   //定义请求完成的处理函数

            layer.close(layIndex);

            if (this.status === 200) {
                var blob = this.response;
                var reader = new FileReader();
                reader.readAsDataURL(blob);   // 转换为base64，可以直接放入a标签href
                reader.onload = function (e) {
                    // 转换完成，创建一个a标签用于下载
                    a.download = saveName ;
                    a.href = e.target.result;
                    $("body").append(a);    // 修复firefox中无法触发click
                    a.click();
                    $(a).remove();
                };
            } else if (this.status === 504) {
                //alert('导出失败，请求超时');
                layer.msg('导出失败，请求超时');
            } else {
                //alert('导出失败');
                layer.msg('导出失败');
            }
        };
        xhr.send(sendData);

    }



    //警情明细导出excel
    ModuleDefine.prototype.exportEventDetailToExcel = function (token, enterpriseId, reportType, datePara, saveName) {

        var url = neat.getDataApiBaseUrl();

        var urlWeekReport = "/OpenApi/Statistics/ExportDetailWeek";
        var urlMonthReport = "/OpenApi/Statistics/ExportDetailMonth";
        var urlYearReport = "/OpenApi/Statistics/ExportDetailYear";

        var data = {
            token: token,
            enterpriseId: enterpriseId
        };

        switch (reportType) {
            case "week":

                data.dateTime = datePara;
                url += urlWeekReport;
                break;
            case "month":
                data.yearMonth = datePara;
                url += urlMonthReport;
                break;
            case "year":
                data.year = datePara;
                url += urlYearReport;
                break;
        }


        var queryStr = "?";

        $.each(data, function (name, value) {

            queryStr = queryStr + "&" + name + "=" + encodeURIComponent(value);
        });

        exportFileByHTML5(url + queryStr, data, saveName);
    };

    //=============================================================
    // 
    //=============================================================


    //全局都是这一个实例
    var dataApiInstance = new ModuleDefine();

    //暴露接口
    exports(MODULE_NAME, dataApiInstance);
});