//隐患处理历史弹出页面

layui.define(["jquery", 'form', 'laytpl', 'neatDataApi', 'neat', 'laydate', 'neatNavigator', 'patrolHiddenDangerDataApi', 'neatFileViewer'], function (exports) {

    "use strict";

    var $ = layui.$;
    var form = layui.form;
    var laytpl = layui.laytpl;
    var laydate = layui.laydate;

    var neatNavigator = layui.neatNavigator;
    var neat = layui.neat;
    var pageDataApi = layui.patrolHiddenDangerDataApi;


    var SubPage = function () {
        this.troubleId = neatNavigator.getUrlParam("troubleId");
        
    };


    SubPage.prototype.init = function () {

        var that = this;

        pageDataApi.getTroubleHandleHistory(neat.getUserToken(), this.troubleId
            , function (resultData) {
                /*
                {

    "resultData": [
        {
            "id": "3864f830-054e-41b6-a032-a9698fea72ca",
            "troubleId": "05ffe6c3-fa30-4f56-8f62-983296808bef",
            "handleUName": "管理员",
            "handleTime": "2019-01-25 08:18:41",
            "handleContent": "处理内容",
            "confirmUName": "管理员",
            "confirmTime": null,
            "confirmContent": null
        }
    ]
                */

                var d = {};
                d.data = [];

                $.each(resultData, function (_, item) {

                    item.handleUName = that.checkValue(item.handleUName);
                    item.handleTime = that.checkValue(item.handleTime);
                    item.handleContent = that.checkValue(item.handleContent);
                    item.confirmUName = that.checkValue(item.confirmUName);
                    item.confirmTime = that.checkValue(item.confirmTime);
                    item.confirmContent = that.checkValue(item.confirmContent);

                    d.data.push(item);

                });

                laytpl($("#historyItemTmpl").html()).render(d, function (html) {

                    $("#tabCont").html(html);
                    
                });


            }
            , function (failData) {

                that.closeDialog();
            });
    };

    // 关闭窗口
    SubPage.prototype.closeDialog = function () {
        var index = parent.layer.getFrameIndex(window.name);
        parent.layer.close(index);
    };

    SubPage.prototype.checkValue = function (value) {
        if(!value)
        {
            return "";
        }
        else
        {
            return value;
        }
    };

    exports('troubleProcessHistoryDialog', new SubPage());
});