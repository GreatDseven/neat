layui.define(['jquery'], function (exports) {
    "use strict";

    var MODULE_NAME = 'neatUserFavoriteSetting';

    var neatImpDataTableName = "NEAT_IMP";

    //地图样式
    var mapStyleKeyName = "NEAT_IMP_MAP_STYLE";

    //设备综合查询 的查询选项 
    var generalDeviceQueryOptionTableName = "NEAT_IMP_MAP_GDQO";


    var ModuleDefine = function () {

    };



    //记录地图样式
    ModuleDefine.prototype.setMapStyle = function (style) {
        layui.data(neatImpDataTableName, {
            key: mapStyleKeyName, value: style
        });
    };

    //获取地图样式
    ModuleDefine.prototype.getMapStyle = function () {
        var data = layui.data(neatImpDataTableName);
        return data[mapStyleKeyName];
    };

    //设置 设备综合查询 的查询选项 
    ModuleDefine.prototype.setGeneralDeviceQueryOption = function (key,value) {
        layui.data(generalDeviceQueryOptionTableName, {
            key: key, value: value
        });
    };

    //获取 设备综合查询 的查询选项 
    ModuleDefine.prototype.getGeneralDeviceQueryOption = function (key) {
        return layui.data(generalDeviceQueryOptionTableName)[key];
    };



    //暴露接口
    exports(MODULE_NAME, new ModuleDefine());
});