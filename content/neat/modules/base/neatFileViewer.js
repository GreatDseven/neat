
layui.define(['jquery','neatWindowManager'], function (exports) {
    "use strict";

    var $ = layui.$;
    var windowMgr = layui.neatWindowManager;

    function lookimg(e) {
        var that = $(e);
        var url = that.attr("layer-src");
        lookImageByUrl(url);
    }
    function mp3voice(e) {
        var that = $(e);
        var url = that.attr("layer-src");
        windowMgr.openLayerInRootWindow({resize:false,
            type: 1,
            title: false,
            offset: 'auto',
            area: 0,
            skin: 'layui-layer-nobg', //没有背景色
            shadeClose: true, //开启遮罩关闭
            content: '<audio controls><source src="' + url + '" type="audio/mpeg">您的浏览器不支持 audio 元素。</audio>'
        });
    }
    function lookvideo(e) {
        var that = $(e);
        var url = that.attr("layer-src");
        windowMgr.openLayerInRootWindow({resize:false,
            type: 1,
            title: false,
            offset: 'auto',
            area: ['700px', '500px'],
            skin: 'layui-layer-nobg', //没有背景色
            shadeClose: true, //开启遮罩关闭
            shade: 0.8,
            content: '<video style="width:98%;height:98%;text-align:center;position:relative;"  src="' + url + '" controls="controls">您的浏览器不支持 video 标签,请使用常规浏览器查看。</video>'
        });
    }

    //以弹出方式显示指定地址的图片
    function lookImageByUrl(imgSrc, maxWidth, maxHeigth) {

        var configWidth = maxWidth;
        if (!configWidth) {
            configWidth = "800px;";
        }
        var configHeight = maxHeigth;
        if (!configHeight) {
            configHeight = "600px;";
        }
        var config = {
            resize:false,
            type: 1,
            title: false,
            offset: 'auto',
            area: [configWidth, configHeight],
            skin: 'layui-layer-nobg', //没有背景色
            shadeClose: true,
            shade :0.8,
            content: '<div style="width:100%;height:100%;text-align:center;position:relative;"><img src="' + imgSrc + '" style="max-width:' + configWidth + ';max-height:' + configHeight + ';margin: auto;  position: absolute;  top: 0; left: 0; bottom: 0; right: 0;"></div>'
        };


        windowMgr.openLayerInRootWindow(config);
        

    }


    //以弹出方式显示指定地址
    function lookFileByUrl(fileUrl, maxWidth, maxHeigth) {


        var configWidth = maxWidth;
        if (!configWidth) {
            configWidth = screen.availWidth * 0.8 + "px;";
        }
        var configHeight = maxHeigth;
        if (!configHeight) {
            configHeight = screen.availHeight * 0.8 + "px;";
        }
        var config = {
            resize: false,
            type: 2,
            title: false,
            offset: 'auto',
            area: [configWidth, configHeight],
            skin: 'layui-layer-nobg', //没有背景色
            shadeClose: true,
            shade: 0.8,
            content: fileUrl
        };

        
        windowMgr.openLayerInRootWindow(config);
        

    }


    //暴露接口
    exports('neatFileViewer', {
        lookimg: lookimg,
        mp3voice: mp3voice,
        lookvideo: lookvideo,

        lookImageByUrl: lookImageByUrl,
        lookFileByUrl: lookFileByUrl
    });
});