layui.define(['jquery', 'neatConfig','layer'], function (exports) {
    "use strict";

    var MODULE_NAME = 'neatWindowManager';

    var $ = layui.jquery;

    var layer = layui.layer;
  

    var ModuleDefine = function () {

    };

    //获取最基础的窗体.
    ModuleDefine.prototype.getWindowRootParent = function () {
        var result = window;
        while (result.parent) {
            if (result === result.parent) {
                break;
            }
            result = result.parent;
        }
        return result;
        
    };

    // 在 最 基础的窗口 弹出layer 
    ModuleDefine.prototype.openLayerInRootWindow = function (options) {
        
        var parent = this.getWindowRootParent();
        return parent.layer.open(options);

    };
    


    //暴露接口
    exports(MODULE_NAME, new ModuleDefine());
});