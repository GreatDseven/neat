layui.define(["layer", 'slider', 'laydate', "jquery", "laytpl", "videoDeviceDataApi", "neat", 'neatNavigator'], function (exports) {

    "use strict";

    var MODULE_NAME = "pagevideoPlay";

    var $ = layui.jquery;
    var neat = layui.neat;
    var slider = layui.slider;
    var laydate = layui.laydate;
    var laytpl = layui.laytpl;
    var pageDataApi = layui.videoDeviceDataApi;
    var token = neat.getUserToken();
    var neatNavigator = layui.neatNavigator;

    var slidervalue = 1;
    var decoder;
    var channelId = '';
    var videoplay = function () {
        this.begintimestr = '';
        this.endtimestr = '';
        this.deviceId = "";
        this.entid = "";
        this.videodata;
    };
    //地图描点 弹框中 火警数 报警数 离线数 点击弹框
    window.playnowurl = '';
    window.playVideo = function (e, token, playURL, cid) {
        if (window.playnowurl == playURL)
            return;
        channelId = cid;
        window.playnowurl = playURL;
        $('.menu_body').children().each(function () {
            $(this).removeClass("current");
        });

        $(e).addClass("current");
        var url = playURL;
        var accessToken = token;

        decoder = new EZUIKit.EZUIPlayer({
            id: 'playWind',
            autoplay: true,
            url: url,
            accessToken: accessToken,
            decoderPath: '/content/3rd',
            width: 1100,
            height: 718
            //handleError: handleError,
        });

    };


    videoplay.prototype.init = function () {
        var that = this;

        this.deviceId = neatNavigator.getUrlParam("deviceId");
        channelId = neatNavigator.getUrlParam("channelId");
        this.entid = neatNavigator.getUrlParam("entid");
        //渲染
        var sliderobj = slider.render({
            elem: '#slideSpeed',  //绑定元素
            min: 1,
            max: 2,
            value: 1,
            theme: "#00a0e9",
            change: function (value) {
                slidervalue = value;
            }
        });

        var laydateobj = laydate.render({
            elem: '#recinputdate'
            , type: 'datetime'
            , range: '~'
            , format: 'yyyy-MM-dd HH:mm:ss'
              , done: function (value, date, endDate) {
                  //20190601000000 - 20190601000000
                  var datetimelist = value.split('~');
                  that.begintimestr = $.trim(datetimelist[0]);
                  that.endtimestr = $.trim(datetimelist[1]);
              }
        });

        $("#recbutton").click(function () {
            pageDataApi.getVideoPlayDeatil(token, that.deviceId, that.entid, channelId, 2, that.begintimestr, that.endtimestr, function (data) {
                //实例化信息窗体
                var getTpl = $("#videoListTemplate").html();
                $("#firstpane").html(laytpl(getTpl).render(data));
                $(".menu_body").children().first().click();
            });
        });

        pageDataApi.getVideoPlayDeatil(token, that.deviceId, that.entid, channelId, 1, "", "", function (data) {
            //实例化信息窗体
            var getTpl = $("#videoListTemplate").html();
            $("#firstpane").html(laytpl(getTpl).render(data));
            that.videodata = data;
            if (channelId == null) {
                channelId = that.videodata.channelList[0].channelId;
            }
            $(".menu_body").children().first().click();
        });
        //云台 控制 左上
        $(".button1").mousedown(function () {
            pageDataApi.YsPlayStart(token, channelId, "4", slidervalue, function (data) {
            });
        }).mouseup(function () {
            pageDataApi.YsPlayStop(token, channelId, "4", function (data) {
            });
        });
        //云台 控制 上
        $(".button2").mousedown(function () {
            pageDataApi.YsPlayStart(token, channelId, "0", slidervalue, function (data) {
            });
        }).mouseup(function () {
            pageDataApi.YsPlayStop(token, channelId, "0", function (data) {
            });
        });
        //云台 控制 右上
        $(".button3").mousedown(function () {
            pageDataApi.YsPlayStart(token, channelId, "6", slidervalue, function (data) {
            });
        }).mouseup(function () {
            pageDataApi.YsPlayStop(token, channelId, "6", function (data) {
            });
        });
        //云台 控制 左
        $(".button4").mousedown(function () {
            pageDataApi.YsPlayStart(token, channelId, "2", slidervalue, function (data) {
            });
        }).mouseup(function () {
            pageDataApi.YsPlayStop(token, channelId, "2", function (data) {
            });
        });
        //云台 控制 旋转
        $(".button5").click(function () {
            $(this).toggleClass("button5_selected");
            if ($(this).hasClass("button5_selected")) {
                pageDataApi.YsPlayStart(token, channelId, "3", slidervalue, function (data) { });
            } else {
                pageDataApi.YsPlayStop(token, channelId, "3", function (data) { });

            }
        });

        //云台 控制 右
        $(".button6").mousedown(function () {
            pageDataApi.YsPlayStart(token, channelId, "3", slidervalue, function (data) {
            });
        }).mouseup(function () {
            pageDataApi.YsPlayStop(token, channelId, "3", function (data) {
            });
        });
        //云台 控制 左下
        $(".button7").mousedown(function () {
            pageDataApi.YsPlayStart(token, channelId, "5", slidervalue, function (data) {
            });
        }).mouseup(function () {
            pageDataApi.YsPlayStop(token, channelId, "5", function (data) {
            });
        });
        //云台 控制 下
        $(".button8").mousedown(function () {
            pageDataApi.YsPlayStart(token, channelId, "1", slidervalue, function (data) {
            });
        }).mouseup(function () {
            pageDataApi.YsPlayStop(token, channelId, "1", function (data) {
            });
        });
        //云台 控制 右下
        $(".button9").mousedown(function () {
            pageDataApi.YsPlayStart(token, channelId, "7", slidervalue, function (data) {
            });
        }).mouseup(function () {
            pageDataApi.YsPlayStop(token, channelId, "7", function (data) {
            });
        });

        //云台 控制 缩小
        $(".button10").mousedown(function () {
            pageDataApi.YsPlayStart(token, channelId, "9", slidervalue, function (data) {
            });
        }).mouseup(function () {
            pageDataApi.YsPlayStop(token, channelId, "9", function (data) {
            });
        });

        //云台 控制 放大
        $(".button11").mousedown(function () {
            pageDataApi.YsPlayStart(token, channelId, "8", slidervalue, function (data) {
            });
        }).mouseup(function () {
            pageDataApi.YsPlayStop(token, channelId, "8", function (data) {
            });
        });

        //云台 控制 焦距-
        $(".button12").mousedown(function () {
            pageDataApi.YsPlayStart(token, channelId, "10", slidervalue, function (data) {
            });
        }).mouseup(function () {
            pageDataApi.YsPlayStop(token, channelId, "10", function (data) {
            });
        });

        //云台 控制 焦距+
        $(".button13").mousedown(function () {
            pageDataApi.YsPlayStart(token, channelId, "11", slidervalue, function (data) {
            });
        }).mouseup(function () {
            pageDataApi.YsPlayStop(token, channelId, "11", function (data) {
            });
        });
        //截图
        $(".button14").click(function () {
            decoder.capturePicture(0, 'default');
        });
        //录像
        $(".button15").click(function () {
            $(this).toggleClass("button15_selected");
            if ($(this).hasClass("button15_selected")) {
                decoder.startSave(0, 'default');
            } else {
                decoder.stopSave(0);
            }
        });

    };
    var instance = new videoplay();
    //暴露接口
    exports(MODULE_NAME, instance);
});