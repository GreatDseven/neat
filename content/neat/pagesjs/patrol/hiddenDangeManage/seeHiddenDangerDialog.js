//查看隐患页面

layui.define(["jquery", 'commonDataApi', 'laytpl', 'neatDataApi', 'neat', 'neatNavigator', 'patrolHiddenDangerDataApi', 'layer','neatFileViewer'], function (exports) {

    "use strict";

    var $ = layui.$;
    var commonDataApi = layui.commonDataApi;
    var neatDataApi = layui.neatDataApi;
    var base = layui.neat;
    var neatNavigator = layui.neatNavigator;
    var patrolHiddenDangerDataApi = layui.patrolHiddenDangerDataApi;
    var layer = layui.layer;
    var laytpl = layui.laytpl;

    var SubPage = function () {
        this.id = neatNavigator.getUrlParam("id");
    };

    // 初始化相关事件和参数
    SubPage.prototype.init = function () {
        var that = this;

        // 加载数据
        that.setData();

        // 关闭方法
        $('#deleBtn').on('click', function () {
            that.closeDialog();
        });

        $('#btnCancel').on('click', function () {
            that.closeDialog();
        });

        $("#historyCount").on("click", function () {
            var count = $("#historyCount").data("count");
            if (!count)
                return;

            that.showHistoryRecord();

        });
    }

    //显示历史记录对话框
    SubPage.prototype.showHistoryRecord = function () {
        var url = "/pages/patrol/hiddenDangerManage/troubleProcessHistoryDialog.html?troubleId=" + this.id
                + "&__=" + new Date().valueOf().toString();

        layer.open({resize:false,
            type: 2,
            title: '历史记录',
            area: ["800px", "700px"],
            shade: [0.7, '#000'],
            content: url
        });
    };

    // 初始化数据
    SubPage.prototype.setData = function () {
        var that = this;

        // 获取上报信息
        patrolHiddenDangerDataApi.getHiddenDangerCreateInfo(base.getUserToken(), that.id, function (result) {
            
            $('#spanHiddenDangerTime').text(result.upTime);
            $('#lblEnterpriseName').text(result.entpriseName);
            $('#lblPointName').text(result.pointInfoName);
            $('#lblProjectSubtype').text(result.childTypeName);
            var contentStr = '';
            result.troubleItemList.forEach(function (currentValue) {
                contentStr += currentValue.itemName + "        否&#10;";
            });

            //拼接上用户数据的内容
            if (result.troubleContent) {
                contentStr += result.troubleContent;
            }

            $('#txtHiddenDangerContent').html(contentStr);

            // 加载上传资料
            if (result.troubleUploadInfoList.length > 0) {
                var imgData = {};
                imgData.data = result.troubleUploadInfoList;
                laytpl($('#uploadFilesTemplate').html()).render(imgData, function (html) {
                    $('#layer-photos-upload').html(html);
                   
                });
            }
            
            if (result.numberOfUnsccessful) {

                $('#historyCount').text("(" + result.numberOfUnsccessful.toString() + ")");
                $('#historyCount').data("count", result.numberOfUnsccessful)
            }
            else {
                $('#historyCount').text("( 0 )");
            }

        }, function (errorResult) { });

        // 获取处理隐患信息
        patrolHiddenDangerDataApi.getHiddenDangerHandleInfo(base.getUserToken(), that.id, function (result) {
           
            /*
{
    "code": 200,
    "message": "获取隐患处理信息成功",
    "result": {
        "id": "a6301bf7-cbc0-43b8-8d05-22ff85b86e07",
        "troubleId": "ef0724f7-e644-451f-9c02-a89a28fae71b",
        "handleUId": "80556ac8-4697-4243-94bc-40e3417e5c01",
        "handleUName": "管理员",
        "handleResult": 1,
        "handleTime": "2019-01-25 13:03:52",
        "confirmUId": null,
        "confirmUName": null,
        "confirmTime": null,
        "handleContent": "处理内容byy",
        "toConfirmContent": "待确认内容byy"
    }
}
            */
            if (result ) {

                if (result.handleTime){
                    $('#spanHandleHiddenDangerTime').text(result.handleTime);
                }

                if (result.handleUName) {
                    $('#txthandleName').val(result.handleUName);
                }

                if (result.handleResult == "1") {
                    $('#txthandleResult').val("待确认");
                }
                else {
                    $('#txthandleResult').val("已完成");
                }

                if (result.confirmTime){
                    $('#txtConfirmTime').val(result.confirmTime);
                }
               
                if (result.confirmUName){
                    $('#txtConfirmName').val(result.confirmUName);
                }

                if (result.toConfirmContent) {
                    $('#txtToConfirmContent').text(result.toConfirmContent);
                }
                
                if (result.handleContent) {
                    $('#txtHandleContent').text(result.handleContent);
                }

               

            }
            else
            {
                $('#historyCount').text("( 0 )");
            }
        }, function (errorResult) { });

        // 获取确认隐患信息
        patrolHiddenDangerDataApi.getHiddenDangerConfirmInfo(base.getUserToken(), that.id, function (result) {
            
            /*
{
    "code": 200,
    "message": "获取隐患确认信息成功",
    "result": {
        "id": "c8ff9b40-c276-4f81-ba19-6cf367194912",
        "troubleId": "05ffe6c3-fa30-4f56-8f62-983296808bef",
        "confirmUId": "80556ac8-4697-4243-94bc-40e3417e5c01",
        "confirmUName": "管理员",
        "confirmTime": "2019-12-31 23:59:59",
        "confirmRealTime": "2019-01-25 08:21:41",
        "handleResult": 2,
        "confirmContent": null,
        "uploadInfoList": []
    }
}
            */

            if (result) {

                if (result.confirmRealTime) {
                    $('#spanConfirmRealTime').text(result.confirmRealTime);
                }

                if (result.confirmUName) {
                    $('#txtConfirmName1').val(result.confirmUName);
                }

                if(result.handleResult){
                    if(result.handleResult == "1"){
                        $('#txtRealConfirmResult').val("待确认");
                    }
                    else if(result.handleResult == "2"){
                        $('#txtRealConfirmResult').val("已完成");
                    }
                    else if(result.handleResult == "3"){

                        $('#txtRealConfirmResult').val("未完成");
                    }
                }
                
                if (result.confirmContent) {
                    $('#txtConfirmContent').text(result.confirmContent);
                }

         
               
                // 加载上传资料
                if (result.uploadInfoList.length > 0) {
                    var imgData = {};
                    imgData.data = result.uploadInfoList;
                    laytpl($('#uploadFilesTemplate').html()).render(imgData, function (html) {
                        $('#layer-photos-upload2').html(html);
                       
                    });
                }
               
                
               
            }
        }, function (errorResult) { });
    }

    // 关闭窗口
    SubPage.prototype.closeDialog = function () {
        var index = parent.layer.getFrameIndex(window.name);
        parent.layer.close(index);
    };

    exports('seeHiddenDangerDialog', new SubPage());
});