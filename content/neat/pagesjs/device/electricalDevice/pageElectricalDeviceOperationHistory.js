//智慧用电网关 运维记录 页面


layui.define(['jquery', 'layer', 'form', 'laytpl', 'element', 'table', 'neat', 'neatDataApi', 'electricalDeviceDataApi', 'neatNavigator', 'commonDataApi','neatWindowManager'], function (exports) {



    "use strict";
    var $ = layui.$;
    var MODULE_NAME = "pageElectricalDeviceOperationHistory";

    var element = layui.element;
    var form = layui.form;

    var laytpl = layui.laytpl;

    var layer = layui.layer;

    var neat = layui.neat;

    var table = layui.table;

    


    var neatNavigator = layui.neatNavigator;


    var pageDataApi = layui.electricalDeviceDataApi;
    
    // 返回的数据包含的属性
    var dataPropertyNames = {
        "id": "id",
        "type": "type",
        "addTime": "startTime",
        "finished": "finished",
        "finishTime": "endTime",
        "result": "description"
    };


    var SubPage = function () {

        this.id = "";

        this.historyDataList = [];

    };

    //初始化
    SubPage.prototype.init = function () {

        this.id = neatNavigator.getUrlParam("id");

        //初始化运维记录列表
        this.initOperationHistoryList();

        form.render();

    };

   


    // 初始化 操作历史列表
    SubPage.prototype.initOperationHistoryList = function () {
        var that = this;

        pageDataApi.getDeviceOperationHistory(neat.getUserToken(), this.id
            , function (result) {
     
                that.historyDataList = result;

                that.renderTable();

            }, function (failData) {
            
                layer.msg(failData.message, function () {

                    that.closeDialog();
                });

            });
    };


    // 渲染 运维记录列表
    SubPage.prototype.renderTable = function () {

        var that = this;

        var finishedData = [];
        var notFinishedData = [];

        $.each(this.historyDataList, function (index, item) {
            if (item[dataPropertyNames.finished]) {
                finishedData.push(item);
            }
            else {
                notFinishedData.push(item);
            }

        });

        //已经完成的
        var finishedTmpl = '{{#  layui.each(d.data, function(index, item){}}'
            + '  <tr>'
            //      类别
            + '     <td style="text-align:center;"><span >{{ item.' + dataPropertyNames.type + ' }}</span></td>'
            //      添加时间
            + '     <td style="text-align:center;"><span >{{ item.' + dataPropertyNames.addTime + '}}</span></td>'
            //      完成时间
            + '     <td style="text-align:center;"><span >{{ item.' + dataPropertyNames.finishTime + '}}</span></td>'
            //      结果
            + '     <td style="text-align:center;"><span >{{ item.' + dataPropertyNames.result + '}}</span></td>'
            + '  </tr>'
            + '{{#  }); }}';

        if (finishedData.length > 0) {

            var finishedD = {};
            finishedD.data = finishedData;

            laytpl(finishedTmpl).render(finishedD, function (html) {
                $("#finishedTable").html(html);

            });
        }

        //没有完成的
        var notFinishedTmpl = '{{#  layui.each(d.data, function(index, item){}}'
            + '  <tr>'
            //      类别
            + '     <td style="text-align:center;"><span >{{ item.' + dataPropertyNames.type + ' }}</span></td>'
            //      添加时间
            + '     <td style="text-align:center;"><span >{{ item.' + dataPropertyNames.addTime + '}}</span></td>'
            + '  </tr>'
            + '{{#  }); }}';

        if (notFinishedData.length > 0) {
            var notFinishedD = {};
            notFinishedD.data = notFinishedData;

            laytpl(notFinishedTmpl).render(notFinishedD, function (html) {
                $("#notFinishTable").html(html);

            });
        }

    };

    //关闭对话框
    SubPage.prototype.closeDialog = function () {
        var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
        parent.layer.close(index); //再执行关闭
    };

    exports(MODULE_NAME, new SubPage());

});