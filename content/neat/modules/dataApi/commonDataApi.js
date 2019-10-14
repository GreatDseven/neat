layui.define(["jquery", 'neatDataApi', 'neatNavigator', 'neat', 'waterDeviceDataApi'], function (exports) {
    "use strict";

    var $ = layui.$;
    var neatDataApi = layui.neatDataApi;
    var neatNavigator = layui.neatNavigator;
    var base = layui.neat;
    var waterDeviceDataApi = layui.waterDeviceDataApi;


    var CommonDataApi = function () { };
    // 获取 项目类型
    CommonDataApi.prototype.getProjectType = function (parentId, token, domainId, enterpriseId, callback) {

        // 构造发送数据
        var data = {
            token: token,
            domainId: domainId,
            enterpriseId: enterpriseId,
            parentId: parentId
        };

        // 获取项目类型URL
        var url = "/OpenApi/OsiItem/GetProType";
        layui.neatDataApi.sendGet(url, data, callback);
    };

    // 获取频率列表
    CommonDataApi.prototype.getFrequency = function (token, domainID, enterpriseID, callback) {

        var url = "/OpenApi/TaskMod/GetFrequency";

        var data = {
            token: token,
            domainID: domainID,
            enterpriseID: enterpriseID
        };



        layui.neatDataApi.sendGet(url, data, callback);

    };

    //获取角色列表
    CommonDataApi.prototype.getRoleList = function (token, domainId, enterpriseId, callback) {
        var url = "/OpenApi/UserInfo/GetRoleList";
        var data = {
            token: token,
            domainId: domainId,
            enterpriseId: enterpriseId
        };
        layui.neatDataApi.sendGet(url, data, callback);
    };

    //获取人员列表
    CommonDataApi.prototype.getHiddenDangerConfirmUserNameList = function (token, domainId, enterpriseId, callback) {
        var url = "/OpenApi/UserInfo/GetUsersHasTroubleConfirmMoudle";
        var data = {
            token: token,
            domainId: domainId,
            enterpriseId: enterpriseId
        };
        layui.neatDataApi.sendGet(url, data, callback);
    };

    //根据中心列表
    CommonDataApi.prototype.getDomainList = function (token, callback) {
        var url = "/OpenApi/SysAuth/GetDomainIdList";
        var data = {
            token: token

        };
        //返回值:
        //[
        //  {
        //  "id": "a3775987-bb02-4cd1-9e63-c85a9c4295be",
        //  "name": "api测试单位"
        //  }
        // ]
        layui.neatDataApi.sendGet(url, data, callback);
    };

    //根据中心编号查询企业
    CommonDataApi.prototype.getEntByDomainId = function (token, domainId, callback) {
        var url = "/OpenApi/SysAuth/GetEntByDomainId";
        var data = {
            token: token,
            domainId: domainId
        };
        //返回值:
        //[
        //  {
        //  "id": "a3775987-bb02-4cd1-9e63-c85a9c4295be",
        //  "domainId": "891200fd-360a-11e5-bee7-000ec6f9f8b3",
        //  "name": "api测试单位"
        //  }
        // ]
        layui.neatDataApi.sendGet(url, data, callback);
    };

    //根据企业id获取建筑列表
    CommonDataApi.prototype.getBuildingByEntId = function (token, entId, callback) {
        var url = "/OpenApi/SysAuth/GetBuildingByEntId";
        var data = {
            token: token,
            entId: entId
        };

        //返回值:
        //  [
        //    {
        //        "id": "0e9d8098-15b0-4ef1-ac84-196ae6deb6fd",
        //        "name": "api测试建筑"
        //    }
        //  ]

        layui.neatDataApi.sendGet(url, data, callback);
    };

    //根据建筑id获取部位列表
    CommonDataApi.prototype.getKeypartByBuildingId = function (token, buildingId, callback) {
        var url = "/OpenApi/SysAuth/GetKeypartByBuildingId";
        var data = {
            token: token,
            buildingId: buildingId
        };

        //返回值:
        //[
        //  {
        //    "id": "fec0aeee-d4bd-43d0-a749-0e61573b3af4",
        //    "name": "api测试部位",
        //    "address": "123"
        //  }
        //]

        layui.neatDataApi.sendGet(url, data, callback);
    };

    //根据巡检项目子类型获取巡检项目
    CommonDataApi.prototype.GetOsiProjectItemsBySubjectType = function (token, domainId, enterpriseId, childTypeId, callback) {

        var url = "/OpenApi/SysAuth/GetOsiItems";
        var data = {
            token: token,
            childTypeId: childTypeId,
            domainId: domainId,
            enterpriseId: enterpriseId
        };

        //返回值:
        //[
        //  {
        //    "id": "a476bab0-01be-11e9-97ae-c85b76a0162a",
        //    "name": "防火门常闭式防火门是否关闭",
        //    "flag": 1
        //  }
        //]

        layui.neatDataApi.sendGet(url, data, callback);
    };


    //获取巡检项目类型 或者 巡检项目子类型
    CommonDataApi.prototype.getProChildType = function (token, domainId, enterpriseId, parentId, callback) {

        var url = "/OpenApi/SysAuth/GetProChildType";
        var data = {
            token: token,
            parentId: parentId,
            domainId: domainId,
            enterpriseId: enterpriseId
        };

        //返回值:
        //[
        //  {
        //    "id": "a476bab0-01be-11e9-97ae-c85b76a0162a",
        //    "name": "防火门常闭式防火门是否关闭",
        //    "flag": 1
        //  }
        //]

        layui.neatDataApi.sendGet(url, data, callback);
    };

    //获取父中心的子类型列表
    CommonDataApi.prototype.getParentDomainSubTypeList = function (token, domainId, itemTypeId, callback) {

        var url = "/OpenApi/OsiTmpl/GetParentDomainSubTypeList";
        var data = {
            token: token,
            itemTypeId: itemTypeId,
            domainId: domainId
        };

        //返回值:
        //[
        //  {
        //    "id": "a476bab0-01be-11e9-97ae-c85b76a0162a",
        //    "name": "防火门常闭式防火门是否关闭",
        //  }
        //]

        layui.neatDataApi.sendGet(url, data, callback);
    };

    //获取单位类型参数列表
    CommonDataApi.prototype.getEnterpriseCategoryList = function (token, callback) {

        var url = "/OpenApi/FoundationParameter/GetEnterpriseCategoryList";
        var data = {
            token: token
        };

        //返回值:
        //[
        //  {
        //    "value": "",
        //    "name": ",
        //  }
        //]

        layui.neatDataApi.sendGet(url, data, callback);
    };

    //获取单位联网状态参数列表
    CommonDataApi.prototype.getJoinStatusList = function (token, callback) {

        var url = "/OpenApi/FoundationParameter/GetJoinStatusList";
        var data = {
            token: token
        };

        //返回值:
        //[
        //  {
        //    "value": "",
        //    "name": ",
        //  }
        //]

        layui.neatDataApi.sendGet(url, data, callback);
    };

    //获取单位监管级别参数列表
    CommonDataApi.prototype.getSuperviseLevelList = function (token, callback) {

        var url = "/OpenApi/FoundationParameter/GetSuperviseLevelList";
        var data = {
            token: token
        };

        //返回值:
        //[
        //  {
        //    "value": "",
        //    "name": ",
        //  }
        //]

        layui.neatDataApi.sendGet(url, data, callback);
    };

    //获取行政区划列表
    CommonDataApi.prototype.getADCList = function (token, callback) {

        var url = "/OpenApi/FoundationParameter/GetADCList";
        var data = {
            token: token
        };

        //返回值:
        //[
        //  {
        //    "code": "",
        //    "name": ",
        //    "fullName": ",
        //  }
        //]

        layui.neatDataApi.sendGet(url, data, callback);
    };

    //获取第三方行政区划列表
    CommonDataApi.prototype.getADCList3rd = function (zipcode, token, callback) {

        var url = "/OpenApi/FoundationParameter/GetADCList";
        var data = {
            zipcode:zipcode,
            token: token
    };

    //返回值:
    //[
    //  {
    //    "code": "",
    //    "name": ",
    //    "fullName": ",
    //  }
    //]

    layui.neatDataApi.sendGet(url, data, callback);
};

//获取建筑类别列表
CommonDataApi.prototype.getBuildingCategoryList = function (token, callback) {

    var url = "/OpenApi/FoundationParameter/GetBuildingCategoryList";
    var data = {
        token: token
    };

    //返回值:
    //[
    //  {
    //    "value": "",
    //    "name": ",
    //    
    //  }
    //]

    layui.neatDataApi.sendGet(url, data, callback);
};

//获取建筑物结构类型列表
CommonDataApi.prototype.getBuildingStructureTypeList = function (token, callback) {

    var url = "/OpenApi/FoundationParameter/GetBuildingStructureTypeList";
    var data = {
        token: token
    };

    //返回值:
    //[
    //  {
    //    "value": "",
    //    "name": ",
    //    
    //  }
    //]

    layui.neatDataApi.sendGet(url, data, callback);
};

//获取一个Guid
CommonDataApi.prototype.getGuid = function (token, callback) {

    var url = "/OpenApi/FoundationParameter/GetGuid";
    var data = {
        token: token
    };


    layui.neatDataApi.sendGet(url, data, callback);
};

//根据设备类型ID获取该设备类型的图片
CommonDataApi.prototype.getDeviceImageByDeviceTypeId = function (token, deviceTypeId) {

    return layui.neat.getDataApiBaseUrl() + "/OpenApi/GlobalParameter/GetDeviceImageByDeviceTypeId?token=" + encodeURIComponent(token)
        + "&deviceTypeId=" + deviceTypeId
        + "&__=" + new Date().valueOf().toString();


};


// 获取nb设备类型信息列表,nb平台配置使用,返回所有需要
CommonDataApi.prototype.getNBDeviceTypeList = function (token, okCallback, failCallback) {
    var url = "/OpenApi/SysAuth/GetSysCodeList";

    var data = {
        token: token,
        category: "NB_PLATFORM_CLASS"
    };

    layui.neatDataApi.sendGet(url, data, okCallback, failCallback);
};



// 获取视频设备类型列表
CommonDataApi.prototype.getVideoDeviceType = function (token, okCallback, failCallback) {
    var url = "/OpenApi/SysAuth/GetSysCodeList";

    var data = {
        token: token,
        category: "VIDEO_DEVICE_CATEGORY"
    };

    layui.neatDataApi.sendGet(url, data, okCallback, failCallback);
};

// 获取 视频设备 厂商
CommonDataApi.prototype.getVideoDeviceManufacture = function (token, okCallback, failCallback) {
    var url = "/OpenApi/SysAuth/GetSysCodeList";

    var data = {
        token: token,
        category: "VIDEO_DEVICE_MANUFACTURE"
    };

    layui.neatDataApi.sendGet(url, data, okCallback, failCallback);
};

// 获取 中心的子中心列表
CommonDataApi.prototype.getChildrenDomains = function (token, domainId, okCallback, failCallback) {
    var url = "/OpenApi/DomainAdmin/GetChildrenDomains";

    var data = {
        token: token,
        domainId: domainId
    };

    layui.neatDataApi.sendGet(url, data, okCallback, failCallback);
};



//=============================下面都是用到的枚举值=====================================

// 获取 隐患点状态
CommonDataApi.prototype.getHiddenDangerStatus = function (callback) {
    var result = new Object();
    result.data = [
        { name: '全部状态', id: '0' },
        { name: '待处理', id: '1' },
        { name: '待确认', id: '2' },
        { name: '已完成', id: '3' }
    ];
    callback(result);
};

// 获取 隐患点状态
CommonDataApi.prototype.getTPPTypes = function (callback) {
    var result = new Object();
    result.data = [
        { name: '甘肃平台', id: '1' },
        { name: '潍坊平台', id: '2' }
    ];
    callback(result);
};


//获取巡检任务的执行人类型枚举值
CommonDataApi.prototype.getTaskExecutorTypeData = function (callback) {
    var data = [
        { id: "1", name: "角色" },
        { id: "2", name: "人员" }
    ];
    if (typeof callback === "function") {
        callback(data);
    } else {
        return data;
    }
};

//获取巡检点 tag 绑定状态数据
CommonDataApi.prototype.getPointTagBindStatusData = function (callback) {
    /*
    <option value="0">全部</option>
    <option value="1">二维码已绑定</option>
    <option value="2">NFC已绑定</option>
    <option value="3">二维码未绑定</option>
    <option value="4">NFC未绑定</option>
    <option value="5">未绑定</option>
    
    */

    var data = [
        { id: "0", name: "全部" },
        { id: "1", name: "二维码已绑定" },
        { id: "2", name: "NFC已绑定" },
        { id: "3", name: "二维码未绑定" },
        { id: "4", name: "NFC未绑定" },
        { id: "5", name: "未绑定" }
    ];
    if (typeof callback === "function") {
        callback(data);
    } else {
        return data;
    }
};

//获取巡检点关联状态数据
CommonDataApi.prototype.getPointUseStatusData = function (callback) {

    //<option value="0">全部</option>
    //<option value="1">已关联</option>
    //<option value="2">未关联</option>

    var data = [
        { id: "0", name: "全部" },
        { id: "1", name: "已关联" },
        { id: "2", name: "未关联" }
    ];
    if (typeof callback === "function") {
        callback(data);
    } else {
        return data;
    }
};


//获取巡检任务完成情况数据
CommonDataApi.prototype.getFinishStatusData = function (callback) {

    /*
    <option value="0">全部</option>
    <option value="1">待完成</option>
    <option value="2">已超期</option>
    <option value="3">已完成</option>
    */

    var data = [
        { id: "0", name: "全部" },
        { id: "1", name: "待完成" },
        { id: "2", name: "已超期" },
        { id: "3", name: "已完成" }
    ];
    if (typeof callback === "function") {
        callback(data);
    } else {
        return data;
    }
};

//获取 维保 工单 状态数据
CommonDataApi.prototype.getWorkOrderStatusData = function (callback) {

    var data = [
        { id: "0", name: "全部" },
        { id: "1", name: "未受理" },
        { id: "2", name: "已受理" },
        { id: "3", name: "已处理" },
        { id: "4", name: "已解决" },
        { id: "5", name: "未解决" }

    ];
    if (typeof callback === "function") {
        callback(data);
    } else {
        return data;
    }
};

// 获取 隐患点处理结果
CommonDataApi.prototype.getHiddenDangerHandleResult = function (callback) {

    var data = [
        { id: "1", name: "待确认" },
        { id: "2", name: "已完成" }

    ];
    if (typeof callback === "function") {
        callback(data);
    } else {
        return data;
    }
};

//获取角色类型数据
CommonDataApi.prototype.getRoleLevelData = function (callback) {
    var data = [
        { id: "1", name: "普通角色" },
        { id: "2", name: "管理员数据" }
    ];
    if (typeof callback === "function") {
        callback(data);
    } else {
        return data;
    }
};

//获取水设备类型
//2019-09-17加入manufacturer，不同厂家设备类型不同
CommonDataApi.prototype.getDeviceTypeData = function (token, manufacturer, callback) {

    var resultData = [];
    waterDeviceDataApi.getAllUnibodyWaterGatewayManufactures(token, function (allData) {
        if (manufacturer == allData.TOPSAIL.id) {
            resultData = [
                {
                    id: "1",
                    name: "液压"
                },
                {
                    id: "2",
                    name: "液位"
                },
                {
                    id: "4",
                    name: "室外消防栓"
                },
            ];

        } else if (manufacturer == allData.SENEX.id) {
            resultData = [
                {
                    id: "1",
                    name: "液压"
                },
                {
                    id: "2",
                    name: "液位"
                },
            ];
        }

        if (typeof callback === "function") {
            callback(resultData);
        } else {
            return resultData;
        }

    });
};

//根据水设备类型获取单位列表
CommonDataApi.prototype.getUnitListByDeviceType = function (token, deviceType, callback) {
    /* 液压
    Pressure = 1,

    /// <summary>
    /// 液位
    /// </summary>
    LiquidLevel,

    /// <summary>
    /// 温度
    /// </summary>
    Temperature
    */


    var resultData = [];
    if (deviceType == "1") {
        //液压
        resultData.push({
            id: "MPa",
            name: "兆帕(MPa)"
        });
    } else if (deviceType == "2") {
        //液位
        resultData.push({
            id: "cm",
            name: "厘米(cm)"
        });
    }
    else if (deviceType == "3") {
        //温度
        resultData.push({
            id: "℃",
            name: "摄氏度(℃)"
        });
    }
    else if (deviceType == "4") {
        //液压
        resultData.push({
            id: "MPa",
            name: "兆帕(MPa)"
        });
    }

    if (typeof callback === "function") {
        callback(resultData);
    } else {
        return resultData;
    }

};

//获取 报警类型 数据
CommonDataApi.prototype.getAlarmTypeData = function (token, callback) {

    var resultData = [
        {
            id: "all",
            name: "全部"
        },
        {
            id: "fire",
            name: "火警"
        },
        {
            id: "fault",
            name: "故障"
        },
        {
            id: "alarm",
            name: "报警"
        }


    ];


    if (typeof callback === "function") {
        callback(resultData);
    } else {
        return resultData;
    }

};

//获取 处理情况 数据
CommonDataApi.prototype.getProcessResultData = function (token, callback) {

    var resultData = [
        {
            id: "All",
            name: "全部"
        },
        {
            id: "NotHandle",
            name: "未处理"
        },
        {
            id: "Real",
            name: "真实警情"
        },
        {
            id: "Test",
            name: "系统测试"
        },
        {
            id: "FalseAlarm",
            name: "系统误报"
        }

    ];


    if (typeof callback === "function") {
        callback(resultData);
    } else {
        return resultData;
    }

};



//==========================================一体式设备============================================

// 获取 设备使用状态
CommonDataApi.prototype.getDeviceUseStatus = function (token, callback) {

    var resultData = [
        {
            id: "-1",
            name: "禁用"
        },
        {
            id: "0",
            name: "启用"
        },
        {
            id: "1",
            name: "屏蔽"
        },
        {
            id: "2",
            name: "空置"
        }

    ];


    if (typeof callback === "function") {
        callback(resultData);
    } else {
        return resultData;
    }
};

// 获取 传输协议
CommonDataApi.prototype.getUITDTransmissionProtocols = function (token, callback) {
    var resultData = [
        {
            id: "tcp",
            name: "TCP"
        },
        {
            id: "udp",
            name: "UDP"
        }
    ];

    if (typeof callback === "function") {
        callback(resultData);
    } else {
        return resultData;
    }
};

// 获取 报文协议
CommonDataApi.prototype.getUITDMessageProtocols = function (token, callback) {
    var resultData = [
        {
            id: "gb26875",
            name: "GB26875"
        }
    ];

    if (typeof callback === "function") {
        callback(resultData);
    } else {
        return resultData;
    }
};

// 获取 传输设备类型
CommonDataApi.prototype.getTransmissionDeviceTypes = function (token, callback) {
    var resultData = [
        {
            id: "0",
            name: "用户信息传输装置"
        }, {
            id: "1",
            name: "CRT"
        }
    ];

    if (typeof callback === "function") {
        callback(resultData);
    } else {
        return resultData;
    }
};

// 获取 运营商列表
CommonDataApi.prototype.getISPDataList = function (token, callback) {
    var resultData = [
        {
            id: "2",
            name: "中国移动"
        }, {
            id: "3",
            name: "中国电信"
        }, {
            id: "4",
            name: "潍坊平台"
        }
    ];

    if (typeof callback === "function") {
        callback(resultData);
    } else {
        return resultData;
    }
};

// 获取 运行环境类型
CommonDataApi.prototype.getEnvTypeDataList = function (token, callback) {
    var resultData = [
        {
            id: "true",
            name: "正式环境"
        }, {
            id: "false",
            name: "测试环境"
        }
    ];

    if (typeof callback === "function") {
        callback(resultData);
    } else {
        return resultData;
    }
};

// 获取 级联查询类型选项
CommonDataApi.prototype.getQueryCascadeDataList = function (token, callback) {
    var resultData = [
        {
            id: "subtree",
            name: "是"
        }, {
            id: "onelevel",
            name: "否"
        }
    ];

    if (typeof callback === "function") {
        callback(resultData);
    } else {
        return resultData;
    }
};

// 警情联动页面显示的设备类型
var linkageDeviceCategoryData = {
    uitd: { id: "100", name: "传输设备" },
    fireHost: { id: "101", name: "消防主机" },
    fireSignal: { id: "102", name: "消防部件" },
    neatWaterGateway: { id: "201", name: "水网关" },
    neatWaterSignal: { id: "202", name: "水信号" },
    unibodyWaterGateway: { id: "300", name: "一体式水源" },
    nbDevice: { id: "400", name: "NB设备" },
    electricGateway: { id: "500", name: "智慧用电设备" }
};

// 获取 视频联动被绑定设备查询类型选项
CommonDataApi.prototype.getLinkageDeviceCategoryData = function (token, callback) {

    var data = [
        linkageDeviceCategoryData.uitd,
        linkageDeviceCategoryData.fireHost,
        linkageDeviceCategoryData.fireSignal,
        linkageDeviceCategoryData.neatWaterGateway,
        linkageDeviceCategoryData.neatWaterSignal,
        linkageDeviceCategoryData.unibodyWaterGateway,
        linkageDeviceCategoryData.nbDevice,
        linkageDeviceCategoryData.electricGateway

    ];

    if (typeof callback === "function") {
        callback(data);
    } else {
        return data;
    }
};



// 获取 综合查询的设备类型 选项
CommonDataApi.prototype.getCommonQueryDeviceCategoryData = function (token, callback) {
    //综合查询的设备类型
    var commonQueryDeviceCategoryData = {
        fire: { id: "1", name: "一体化设备" },
        neatWater: { id: "2", name: "NEAT水设备" },
        unibodyWater: { id: "3", name: "一体式水源监测设备" },
        electric: { id: "4", name: "智慧用电网关" },
        homeGateway: { id: "5", name: "家用网关" },
        nb: { id: "6", name: "NB设备" },
        homeFire: { id: "7", name: "家用火灾报警控制器" }
    };

    var data = [
        commonQueryDeviceCategoryData.fire,
        commonQueryDeviceCategoryData.neatWater,
        commonQueryDeviceCategoryData.unibodyWater,
        commonQueryDeviceCategoryData.electric,
        //commonQueryDeviceCategoryData.homeGateway
        commonQueryDeviceCategoryData.nb,
        //commonQueryDeviceCategoryData.homeFire
    ];

    if (typeof callback === "function") {
        callback(data);
    } else {
        return data;
    }
};


var emptyGUID = "00000000-0000-0000-0000-000000000000";

CommonDataApi.prototype.isEmptyGuid = function (data) {

    return emptyGUID == data;
};



// 获取 绑定状态数据
CommonDataApi.prototype.getBindStatusData = function (token, callback) {

    //绑定状态
    var bindStatusData = {
        notBind: { id: "false", name: "未绑定" },
        binded: { id: "true", name: "已绑定" }

    };

    if (typeof callback === "function") {
        callback(bindStatusData);
    } else {
        return bindStatusData;
    }
};


// 获取 智慧用电 通道配置信息
CommonDataApi.prototype.getElectricalDeviceChannelTypeConfigData = function (callback) {

    var channelTypeConfig = {
        //温度
        temperature: {
            id: "3",
            name: "温度",
            unit: "℃",
            alt: 0.1 //最小计量单位
        },
        //漏电流
        leakageCurrent: {
            id: "128",
            name: "漏电流",
            unit: "mA",
            alt: 1
        },
        //电流
        workingCurrent: {
            id: "9",
            name: "电流",
            unit: "A",
            alt: 0.1
        }

    };

    if (typeof callback === "function") {
        callback(channelTypeConfig);
    } else {
        return channelTypeConfig;
    }
};



//=================================================================================================

exports('commonDataApi', new CommonDataApi());
});