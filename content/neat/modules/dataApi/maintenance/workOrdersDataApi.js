
//维保管理 >> 工单管理 的数据访问

layui.define(["jquery", 'neatDataApi'], function (exports) {
    "use strict";


    var MODULE_NAME = 'workOrdersDataApi';


    var $ = layui.$;

    var WorkOrdersDataApi = function () { };



    /**
     * 获取工单列表
     */
    WorkOrdersDataApi.prototype.getWorkOrdersList = function (token, 
  
        orderNo, starter, orderStatus,
        orderByColumn, isDescOrder,
        pageIndex, pageSize, callback) {



        var url = "/OpenApi/Maintenance/GetMtOrdersList";


        var data = {
            token: token,
            orderNo: orderNo,
            starter: starter,
            orderStatus: orderStatus,
            orderByColumn: orderByColumn,
            isDescOrder: isDescOrder,
            pageIndex: pageIndex,
            pageSize: pageSize,
        };

        layui.neatDataApi.sendGet(url, data, callback);


    };




    //全局都是这一个实例
    var workOrdersDataApi = new WorkOrdersDataApi();

    //暴露接口
    exports(MODULE_NAME, workOrdersDataApi);
});