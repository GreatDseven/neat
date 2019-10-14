//隐患处理页面

layui.define(["jquery", 'form', 'laytpl', 'commonDataApi', 'neatDataApi', 'neat', 'laydate', 'neatNavigator', 'patrolHiddenDangerDataApi', 'neatGroupDataMaker', 'neatFileViewer'], function (exports) {
   
    "use strict";

    var $ = layui.$;
    var form = layui.form;
    var laytpl = layui.laytpl;
    var laydate = layui.laydate;
    var commonDataApi = layui.commonDataApi;
    var neatDataApi = layui.neatDataApi;
    var neatNavigator = layui.neatNavigator;
    var base = layui.neat;
    var patrolHiddenDangerDataApi = layui.patrolHiddenDangerDataApi;
    var groupDataTools = layui.neatGroupDataMaker;

    var SubPage = function () {
        this.id = neatNavigator.getUrlParam("id");
        this.domainId = neatNavigator.getUrlParam("domainId");
        this.enterpriseId = neatNavigator.getUrlParam("enterpriseId");
        this.loginName = base.getCurrentUserInfo();

        this.optHandleResult = "1";
    };

    // 初始化相关事件和参数
    SubPage.prototype.init = function () {
        var that = this;

        // 加载数据
        that.setData();

        // 加载处理结果模板
        that.loadHandleResult();

        // 加载确认人
        that.loadConfirmUser();

        // 初始化监听事件
        that.initEventInfo();

        //渲染时间控件
        laydate.render({
            elem: 'input[name=confirmTime]', //指定元素
            min: that.getToday(),
            trigger:"click"
        });

        $('#btnCancel').on('click', function () {
            that.closeDialog();
        });

        $('input[name=confirmUser]').on('focus', function () {
            layer.open({resize:false,
                type: 1,
                skin: 'layui-layer-rim', //加上边框
                area: ['420px', '240px'], //宽高
                content: 'html内容'
            });
        });
    };
    // 获取今天
    SubPage.prototype.getToday = function () {
        var date = new Date();
        return date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();

    };


    // 加载数据
    SubPage.prototype.setData = function () {
        var that = this;

        // 设置经办人
        $('#txthandleName').val(that.loginName);

        // 获取上报信息
        patrolHiddenDangerDataApi.getHiddenDangerCreateInfo(base.getUserToken(), that.id, function (result) {

            /*
            {
    "code": 200,
    "message": "获取隐患上报信息成功",
    "result": {
        "id": "05ffe6c3-fa30-4f56-8f62-983296808bef",
        "entpriseName": "宁浩发展八八分公司",
        "pointInfoName": "ssss",
        "childTypeName": "防火门",
        "troubleContent": "隐患内容",
        "upTime": "2019-01-22 11:07:04",
        "numberOfUnsccessful": 2,
        "troubleItemList": [
            {
                "itemId": "c3fd3a98-148b-11e9-a414-c85b76a0162a",
                "troubleId": "05ffe6c3-fa30-4f56-8f62-983296808bef",
                "itemName": "防火门顺门器是否正常",
                "itemResult": 2
            }
        ],
        "troubleUploadInfoList": [
            {
                "id": "f3be1ff9-1df2-11e9-8644-c85b76a0162a",
                "fileUrl": "http://192.168.0.100:5400/Upload/2019-01/0a3404d5-8b8a-45c1-88d8-cf1ab66db696.png",
                "fileDataType": 1
            }
        ]
    }
}
            */
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

            // 加载内容
            $('#txtHiddenDangerContent').html(contentStr);

            if (result.troubleUploadInfoList.length > 0) {
                var imgData = {};
                imgData.data = result.troubleUploadInfoList;
                laytpl($('#imgTemplate').html()).render(imgData, function (html) {
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


    };

    // 加载处理结果
    SubPage.prototype.loadHandleResult = function () {

        var that = this;
        commonDataApi.getHiddenDangerHandleResult(function (result) {
            laytpl($('#optConfirmResultTemplate').html()).render(result, function (innerHtml) {
                $('select[name=handleResult]').html(innerHtml);
            });
            form.render('select', 'form');
        });

        form.on('select(handleResult)', function (data) {
            //console.log(data.elem); //得到select原始DOM对象
            //console.log(data.value); //得到被选中的值
            //console.log(data.othis); //得到美化后的DOM对象

            that.changeHandleResult(data);


        });
    };

    //改变处理结果
    SubPage.prototype.changeHandleResult = function (data) {

        if (this.optHandleResult == data.value)
            return;

        this.optHandleResult = data.value;

        if (data.value == "1") {
            //待确认
            $(".toConfirmInfo").show();


        }
        else {
            //已完成
            $(".toConfirmInfo").hide();
        }
    };

    // 加载 确认人
    SubPage.prototype.loadConfirmUser = function () {
        var that = this;
        commonDataApi.getHiddenDangerConfirmUserNameList(base.getUserToken(), that.domainId, that.enterpriseId, function (roleData) {

            var d = {};
            d.data = groupDataTools.make(roleData, ["entName", "domainName"]);
            laytpl($("#optUserListTemplate").html()).render(d, function (html) {
                $('select[name=confirmUser]').html(html);
                form.render('select', 'form');
            });
        });
    };

    // 初始化监听事件（form和table）
    SubPage.prototype.initEventInfo = function () {
        var that = this;
        // 提交
        form.on('submit(filterSubmit)', function (data) {
            var url = '/OpenApi/HDanger/HandleTrouble?token=' + base.getUserToken();
            var result =
            {
                troubleId: that.id,
                handleResult: data.field.handleResult,
                handleContent: data.field.handleContent

            };

            if (that.optHandleResult == "1") {
                //处理结果为待处理
                result.confirmTime = data.field.confirmTime + " 23:59:59";
                result.confirmUId = data.field.confirmUser;
                result.toConfirmContent = data.field.toConfirmContent;
            }
            else {
                result.confirmTime = "";
                result.confirmUId = "";
                result.toConfirmContent = "";
            }



            layui.neatDataApi.sendPost(url, result, function (result) {
                layer.msg('保存成功', function () {
                    that.closeDialog();
                });
            }, function (fd) {
                var msg = "";
                if (typeof fd.message === "string") {
                    msg = fd.message;
                }
                else {
                    msg = "保存失败!";
                }

                layer.msg(msg, function () {
                    that.closeDialog();
                });
            });
        });

        //自定义验证规则
        form.verify({
            handleResult: function (value) {
                if (value == '') {
                    return '请选择处理结果';
                }
            },
            confirmTime: function (value) {

                if (that.optHandleResult == "1" && value.length == 0) {
                    return '请选择待确认截止时间';
                }
            }
            , confirmUser: function (value) {
                if (that.optHandleResult == "1" && value == '') {
                    return '请选择待确认人';
                }
            }
            , toConfirmContent: function (value) {
                if (that.optHandleResult == "1" && value.length == 0) {
                    return '请输入待确认内容';
                }
            }, areaOrderDiscription: function (value) {
                if (value.length == 0) {
                    return '请输入处理内容';
                }
            }
            , content: function (value) {
                layedit.sync(editIndex);
            }
        });

        $("#historyCount").on("click", function () {
            var count = $("#historyCount").data("count");
            if (!count)
                return;

            that.showHistoryRecord();

        });
    };

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

    // 关闭窗口
    SubPage.prototype.closeDialog = function () {
        var index = parent.layer.getFrameIndex(window.name);
        parent.layer.close(index);
    };

    exports('handleHiddenDangerDialog', new SubPage());
});