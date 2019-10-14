
//自定义logo上传
layui.define(['element', 'layer'], function (exports) {

    "use strict";

    var MODULENAME = "neatLogoUploader";

    var layer = layui.layer;

    var ModuleDefine = function () {
    };

    ModuleDefine.prototype.init = function (objId, objType) {

        this.objId = objId;
        this.objType = objType;

    };

    ModuleDefine.prototype.show = function (callback) {

        var url = "/pages/controls/uploadLogo.html?obj_id=" + encodeURIComponent(this.objId)
            + "&obj_type=" + this.objType
            + "&__=" + new Date().valueOf().toString();

        var width = "500px";
        var height = "350px";

        var layerIndex = 0;
        var targetWindow = parent;

        var config = {
            resize: false,
            type: 2,
            title: '上传Logo',
            area: [width, height],
            shade: [0.7, '#000'],
            content: url,
            btn: ['确定', '关闭'],
            yes: function (index) {

                //当点击‘确定’按钮的时候，获取弹出层返回的值
                var result = targetWindow["layui-layer-iframe" + index].UploadResult;
                //打印返回的值，看是否有我们想返回的值。
                //console.log(res);
                //最后关闭弹出层
                targetWindow.layer.close(layerIndex);

                callback(result);

            },
            cancel: function () {
                //右上角关闭回调
            }
        };

        if (parent) {
            layerIndex = window.parent.layer.open(config);
            targetWindow = window.parent;
        }
        else {
            layerIndex = layer.open(config);
            targetWindow = window;
        }

    };


    exports(MODULENAME, function () {
        return new ModuleDefine();
    });

});