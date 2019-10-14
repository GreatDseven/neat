
//维保管理 >> 维保记录 的数据访问

layui.define(["jquery", 'neatDataApi'], function (exports) {
    "use strict";


    var MODULE_NAME = 'maintainLogDataApi';


    var $ = layui.$;

    var MaintainLogDataApi = function () { };



    /**
     * 获取巡检记录列表
     */
    MaintainLogDataApi.prototype.getMaintainLogList = function (token,
        mtEntprise, mtTimeStart, mtTimeEnd, inContractTerm,
        orderByColumn, isDescOrder, pageIndex, pageSize, callback) {


        var url = "/OpenApi/Maintenance/GetMaintenanceLogList";


        var data = {
            token: token,
            mtEntprise: mtEntprise,
            mtTimeStart: mtTimeStart,
            mtTimeEnd: mtTimeEnd,
            inContractTerm: inContractTerm,
            orderByColumn: orderByColumn,
            isDescOrder: isDescOrder,
            pageIndex: pageIndex,
            pageSize: pageSize,
        };

        layui.neatDataApi.sendGet(url, data, callback);


    };




    //全局都是这一个实例
    var maintainLogDataApi = new MaintainLogDataApi();

    //暴露接口
    exports(MODULE_NAME, maintainLogDataApi);
});