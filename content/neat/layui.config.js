layui.config({
    base: '/content/neat/', //假设这是你存放拓展模块的根目录
    version: true,
    debug: true
}).extend({ //设定模块别名

    neatConfig: "../../config",

    //第三方jquery插件,修改了,以适应layui.
    treeview: "modules/3rdmod/bootstrap-treeview",

    cookie: 'modules/3rdmod/js.cookie',
    md5: "modules/3rdmod/md5",
    //日期操纵 //文档见:https://github.com/datejs/Datejs
    datejs: "modules/3rdmod/datejs",

    //echarts
    echarts: 'modules/3rdmod/echarts',

    //tooltip
    tooltipster: 'modules/3rdmod/tooltipster',

    //弹窗控件
    jqueryNotyfy: 'modules/3rdmod/jquery.notyfy',

    //signalr封装
    signalR: "modules/3rdmod/jquery.signalR-2.4.0",

    // signalR Hubs
    neatSignalRHub: "modules/base/neatSignalRHub",

    //事件推送
    neatEventPush: "modules/base/neatEventPush",

    //菜单
    neatNavList: 'modules/base/neatNavList',

    //底部时间
    neatTime: 'modules/base/neatTime',

    //neat基础
    neat: "modules/base/neat",
    //工具性方法
    neatTools: "modules/base/neatTools",

    //和地图相关的方法
    neatGIS: "modules/base/neatGIS",

    //语音合成
    neatSpeechSynthesis: "modules/base/neatSpeechSynthesis",

    //验证方法
    neatValidators: "modules/base/neatValidators",

    //上传附件预览工具
    neatFileViewer: "modules/base/neatFileViewer",
    //ui工具
    neatUITools: "modules/base/neatUITools",

    //树数据整理工具类
    neatTreeDataMaker: "modules/base/neatTreeDataMaker",
    //菜单数据整理工具类
    neatMenuDataMaker: "modules/base/neatMenuDataMaker",
    //对数据根据某些属性进行分组的工具类
    neatGroupDataMaker: "modules/base/neatGroupDataMaker",

    //登录注销相关的方法
    neatLoginOp: "modules/base/neatLoginOp",

    //导航
    neatNavigator: "modules/base/neatNavigator",

    //窗口管理器
    neatWindowManager: "modules/base/neatWindowManager",

    //用户喜好记录
    neatUserFavoriteSetting: "modules/base/neatUserFavoriteSetting",

    //行政区划
    neatADCSelector: "modules/controls/neatADCSelector",
    //描点
    neatGisSelector: "modules/controls/neatGisSelector",
    //描点查看
    neatGisViewer: "modules/controls/neatGisViewer",

    //自定义logo上传组件
    neatLogoUploader: "modules/controls/neatLogoUploader",

    // 各种与 设备/事件/企业等详细信息相关的弹出小窗口
    neatPopupRepository: "modules/controls/neatPopupRepository",

    //自动刷新
    autoRefresh: "modules/controls/refresher",



    //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ 数据访问 $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
    neatDataApi: "modules/dataApi/neatDataApi",
    // 获取公共数据的接口，包含获取项目类型等
    commonDataApi: "modules/dataApi/commonDataApi",

    // 获取第三方公共数据的接口，包含获取项目类型等
    common3rdDataApi: "modules/dataApi/common3rdDataApi",
    //测试数据提供者
    mockDataProvider: "modules/dataApi/mockDataProvider",




    //=============== 巡检管理子系统 数据访问接口 ===============

    //巡检任务管理用的数据访问接口
    patrolTaskDataApi: "modules/dataApi/patrol/patrolTaskDataApi",
    //巡检点管理用的数据访问接口
    patrolPointDataApi: "modules/dataApi/patrol/patrolPointDataApi",
    //巡检任务详情用到的数据访问接口
    patrolTaskInstanceDataApi: "modules/dataApi/patrol/patrolTaskInstanceDataApi",
    // 隐患处理页面
    patrolHiddenDangerDataApi: "modules/dataApi/patrol/patrolHiddenDangerDataApi",


    //=============== 维保管理子系统 数据访问接口 ===============

    //维保记录模块数据访问接口
    maintainLogDataApi: "modules/dataApi/maintenance/maintainLogDataApi",
    //工单管理模块数据访问接口
    workOrdersDataApi: "modules/dataApi/maintenance/workOrdersDataApi",


    //=============== 用户权限系统 数据访问接口 ===============
    //角色管理的数据访问接口
    roleAdminDataApi: "modules/dataApi/accreditAdmin/roleAdminDataApi",
    //用户管理的数据访问接口
    userAdminDataApi: "modules/dataApi/accreditAdmin/userAdminDataApi",

    //=============== 基础信息系统 数据访问接口 ===============
    //维护中心用的数据访问接口
    domainDataApi: "modules/dataApi/foundationInfo/domainDataApi",
    //维护单位用的数据访问接口
    enterpriseDataApi: "modules/dataApi/foundationInfo/enterpriseDataApi",
    //维护第三方单位用的数据访问接口
    enterprise3rdDataApi: "modules/dataApi/foundationInfo/enterprise3rdDataApi",
    //维护建筑用到的数据访问接口
    buildingDataApi: "modules/dataApi/foundationInfo/buildingDataApi",
    //维护重点部位用到数据访问接口
    keypartDataApi: "modules/dataApi/foundationInfo/keypartDataApi",
    //运营商平台授权信息数据访问接口
    iotAuthInfoDataApi: "modules/dataApi/foundationInfo/iotAuthInfoDataApi",
    //获取图片用到的数据访问接口
    imageDataApi: "modules/dataApi/foundationInfo/imageDataApi",

    // 第三方推送平台中心扩展表数据访问接口
    tppInfoDataApi: "modules/dataApi/foundationInfo/tppInfoDataApi",

    //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ 各个页面 $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$


    //=============== 公共页面 ===============

    pageIndex: "pagesjs/index",
    pageLogin: "pagesjs/login",
    pageBoard: "pagesjs/board",



    //=============== 巡检管理子系统 页面 ===============

    //=================== 巡检隐患管理 ==================
    pagePatrolHiddenDangerManage: "pagesjs/patrol/hiddenDangeManage/hiddenDangerManage",
    handleHiddenDangerDialog: "pagesjs/patrol/hiddenDangeManage/handleHiddenDangerDialog",
    seeHiddenDangerDialog: "pagesjs/patrol/hiddenDangeManage/seeHiddenDangerDialog",
    troubleProcessHistoryDialog: "pagesjs/patrol/hiddenDangeManage/troubleProcessHistoryDialog",
    //=============================================

    //=================== 巡检点 ==================
    //巡检点管理列表页
    pagePatrolPointManageList: "pagesjs/patrol/pointManage/pointManageList",
    //巡检点创建对话框
    pagePatrolPointCreate: "pagesjs/patrol/pointManage/pointCreate",
    //巡检点编辑对话框
    pagePatrolPointEdit: "pagesjs/patrol/pointManage/pointEdit",
    //=============================================

    //================== 巡检详情==================
    //巡检详情查看列表页
    pagePatrolTaskInstanceList: "pagesjs/patrol/taskInstanceManage/taskInstanceManageList",
    //巡检任务详情查看(任务巡检点结果列表)
    pagePatrolTaskInstanceView: "pagesjs/patrol/taskInstanceManage/taskInstanceView",
    //巡检点详情查看(巡检点下项目的结果列表)
    pagePatrolTaskInstancePointView: "pagesjs/patrol/taskInstanceManage/taskInstancePointView",
    //=============================================


    //================== 巡检任务==================
    //任务管理列表页
    pagePatrolTaskManageList: "pagesjs/patrol/taskManage/taskManageList",
    //任务创建对话框
    pagePatrolTaskCreate: "pagesjs/patrol/taskManage/taskCreate",
    //任务克隆对话框
    pagePatrolTaskClone: "pagesjs/patrol/taskManage/taskClone",
    //=============================================

    //=============== 巡检项目类型 ===============
    pagePatrolProjectManage: "pagesjs/patrol/projectManage/projectManage",
    createProjectDialog: "pagesjs/patrol/projectManage/createProjectDialog",
    editProjectDialog: "pagesjs/patrol/projectManage/editProjectDialog",
    //关联巡检项目模板弹出页面
    mapProjectTemplateDialog: "pagesjs/patrol/projectManage/mapProjectTemplateDialog",
    //=============================================

    //============== 巡检项目子类型================
    projectSubtypeManage: "pagesjs/patrol/projectSubtypeManage/projectSubtypeManage",
    createProjectSubtypeDialog: "pagesjs/patrol/projectSubtypeManage/createProjectSubtypeDialog",
    editProjectSubtypeDialog: "pagesjs/patrol/projectSubtypeManage/editProjectSubtypeDialog",
    //关联子类型模板弹出页面
    mapSubtypeTemplateDialog: "pagesjs/patrol/projectSubtypeManage/mapSubtypeTemplateDialog",
    //=============================================


    //=============== 维保管理子系 ===============
    //维保记录模块列表页面
    pageMaintenanceLogList: "pagesjs/maintenance/maintainLog/maintainLogList",
    //工单管理模块列表页面
    pageMaintenanceWorkOrderList: "pagesjs/maintenance/workOrders/workOrderList",
    //=============================================

    //=============== 用户权限子系统===============
    //用户权限列表页面
    pageAccreditAdminList: "pagesjs/accreditAdmin/accreditAdminList",
    //-------------------
    //添加用户界面
    pageAccreditAdminUserCreate: "pagesjs/accreditAdmin/userCreate",
    //修改用户界面
    pageAccreditAdminUserUpdate: "pagesjs/accreditAdmin/userUpdate",
    //用户所属角色界面
    pageAccreditAdminUserRoles: "pagesjs/accreditAdmin/userRoles",
    //-------------------------
    //添加角色界面
    pageAccreditAdminRoleCreate: "pagesjs/accreditAdmin/roleCreate",
    //角色中的用户列表界面
    pageAccreditAdminRoleUsers: "pagesjs/accreditAdmin/roleUsers",
    //修改角色界面
    pageAccreditAdminRoleUpdate: "pagesjs/accreditAdmin/roleUpdate",
    //=============================================



    //=============== 基础信息子系统===============
    //中心列表页面
    pageDomainList: "pagesjs/foundationInfo/domain/domainList",
    //中心添加页面
    pageDomainCreate: "pagesjs/foundationInfo/domain/domainCreate",
    //中心编辑页面
    pageDomainUpdate: "pagesjs/foundationInfo/domain/domainUpdate",

    //----------------------------
    //单位列表页面
    pageEnterpriseList: "pagesjs/foundationInfo/enterprise/enterpriseList",
    //单位添加页面
    pageEnterpriseCreate: "pagesjs/foundationInfo/enterprise/enterpriseCreate",
    //单位编辑页面
    pageEnterpriseUpdate: "pagesjs/foundationInfo/enterprise/enterpriseUpdate",
    //单位详情页面
    pageEnterpriseDetail: "pagesjs/foundationInfo/enterprise/enterpriseDetail",

    //----------------------------
    //单位列表页面
    pageEnterprise3rdList: "pagesjs/foundationInfo/enterprise3rd/enterpriseList",
    //单位添加页面
    pageEnterprise3rdCreate: "pagesjs/foundationInfo/enterprise3rd/enterpriseCreate",
    //单位编辑页面
    pageEnterprise3rdUpdate: "pagesjs/foundationInfo/enterprise3rd/enterpriseUpdate",
    //单位详情页面
    pageEnterprise3rdDetail: "pagesjs/foundationInfo/enterprise3rd/enterpriseDetail",

    //----------------------------
    //建筑列表页面
    pageBuildingList: "pagesjs/foundationInfo/building/buildingList",
    //建筑添加页面
    pageBuildingCreate: "pagesjs/foundationInfo/building/buildingCreate",
    //建筑编辑页面
    pageBuildingUpdate: "pagesjs/foundationInfo/building/buildingUpdate",

    //----------------------------
    // 重点部位列表页面
    pageKeypartList: "pagesjs/foundationInfo/keypart/keypartList",
    // 重点部位添加页面
    pageKeypartCreate: "pagesjs/foundationInfo/keypart/keypartCreate",
    // 重点部位编辑页面
    pageKeypartUpdate: "pagesjs/foundationInfo/keypart/keypartUpdate",

    //----------------------------
    //nb平台应用列表页面
    pageIotAuthInfoList: "pagesjs/foundationInfo/iotAuthInfo/iotAuthInfoList",
    //nb平台应用添加页面
    pageIotAuthInfoCreate: "pagesjs/foundationInfo/iotAuthInfo/iotAuthInfoCreate",
    //nb平台应用修改页面
    pageIotAuthInfoUpdate: "pagesjs/foundationInfo/iotAuthInfo/iotAuthInfoUpdate",
    //设置nb平台应用 与机构 关联关系页面
    pageMapIotAuthInfoDialog: "pagesjs/foundationInfo/iotAuthInfo/mapIotAuthInfoDialog",
    //查询nb平台应用关联的机构
    pageQueryRelatedOrgListDialog: "pagesjs/foundationInfo/iotAuthInfo/queryRelatedOrgListDialog",
    //----------------------------

    //-------------第三方推送平台得---------------
    pagethirdPushPlatformInfoList: "pagesjs/foundationInfo/thirdPushPlatform/pagethirdPushPlatformInfoList",
    pageThirdPushPlatformCreate: "pagesjs/foundationInfo/thirdPushPlatform/pageThirdPushPlatformCreate",
    pageThirdPushPlatformDetail: "pagesjs/foundationInfo/thirdPushPlatform/pageThirdPushPlatformDetail",
    pageThirdPushPlatformUpdate: "pagesjs/foundationInfo/thirdPushPlatform/pageThirdPushPlatformUpdate",

    //----------------------------





    //----------------------------
    // 平面图列表页面
    pagePlanImgList: "pagesjs/foundationInfo/planImg/pagePlanImgList",
    // 添加平面图页面
    pagePlanImgCreate: "pagesjs/foundationInfo/planImg/pagePlanImgCreate",
    //平面图编辑页面
    pagePlanImgLayoutEdit: "pagesjs/foundationInfo/planImg/pagePlanImgLayoutEdit",

    //查看设备相关的平面图
    pagePlanImgLayoutViewByDeviceId: "pagesjs/foundationInfo/planImg/pagePlanImgLayoutViewByDeviceId",
    //查看企业相关的平面图
    pagePlanImgLayoutViewByEnterpriseId: "pagesjs/foundationInfo/planImg/pagePlanImgLayoutViewByEnterpriseId",


    //================公用控件=============================
    //选择行政区划的页面
    pageAdcSelector: "pagesjs/controls/adcSelector",
    //选择第三方行政区划的页面
    pageAdcSelector3rd: "pagesjs/controls/adcSelector3rd",
    //描点控件
    pageGisSelector: "pagesjs/controls/gisSelector",
    //描点查看
    pageGisViewer: "pagesjs/controls/gisViewer",
    //视频播放
    pagevideoPlay: "pagesjs/controls/videoPlay",

    //上传自定义Logo
    pageLogoUploader: "pagesjs/controls/logoUploader",

    //=============== 设备管理子系统=======================

    //----------------------------------------
    //数据访问接口
    //----------------------------------------
    //水设备管理相关数据访问接口
    waterDeviceDataApi: "modules/dataApi/device/waterDeviceDataApi",
    //NB设备相关数据访问接口
    nbDeviceDataApi: "modules/dataApi/device/nbDeviceDataApi",
    //设备综合查询数据访问接口
    generalQueryDataApi: "modules/dataApi/device/generalQueryDataApi",
    // 一体式设备数据访问接口
    integratedDeviceDataApi: "modules/dataApi/device/integratedDeviceDataApi",
    //视频设备数据访问接口
    videoDeviceDataApi: "modules/dataApi/device/videoDeviceDataApi",
    //智慧用电数据访问接口
    electricalDeviceDataApi: "modules/dataApi/device/electricalDeviceDataApi",
    //---------------------------------------
    //页面模块列表
    //---------------------------------------

    //-----------------neat水--------------
    //neat水网关列表页面
    pageNEATWaterGatewayList: "pagesjs/device/waterDevice/neat/pageNEATWaterGatewayList",
    //新增neat水网关
    pageNEATWaterGatewayCreate: "pagesjs/device/waterDevice/neat/pageNEATWaterGatewayCreate",
    //修改neat水网关
    pageNEATWaterGatewayUpdate: "pagesjs/device/waterDevice/neat/pageNEATWaterGatewayUpdate",
    // neat 水网关 查看页面
    pageNEATWaterGatewayDetail: "pagesjs/device/waterDevice/neat/pageNEATWaterGatewayDetail",
    //neat水信号列表页面
    pageNEATWaterSignalList: "pagesjs/device/waterDevice/neat/pageNEATWaterSignalList",
    //新增neat水信号
    pageNEATWaterSignalCreate: "pagesjs/device/waterDevice/neat/pageNEATWaterSignalCreate",
    //修改neat水信号
    pageNEATWaterSignalUpdate: "pagesjs/device/waterDevice/neat/pageNEATWaterSignalUpdate",
    // neat水信号列表页面查看页面
    pageNEATWaterSignalListView: "pagesjs/device/waterDevice/neat/pageNEATWaterSignalListView",

    //neat 水信号查看页面
    pageNEATWaterSignalDetail: "pagesjs/device/waterDevice/neat/pageNEATWaterSignalDetail",



    //-------------一体式水源监测--------------------
    // 一体式水源监测 列表页面
    pageUnibodyWaterGatewayList: "pagesjs/device/waterDevice/unibody/pageUnibodyWaterGatewayList",
    // 一体式水源监测 新建页面
    pageUnibodyWaterGatewayCreate: "pagesjs/device/waterDevice/unibody/pageUnibodyWaterGatewayCreate",
    // 一体式水源监测 修改页面
    pageUnibodyWaterGatewayUpdate: "pagesjs/device/waterDevice/unibody/pageUnibodyWaterGatewayUpdate",
    // 一体式水源监测 查看页面
    pageUnibodyWaterGatewayDetail: "pagesjs/device/waterDevice/unibody/pageUnibodyWaterGatewayDetail",

    //-------------nb设备--------------------
    // nb设备列表页面
    pageNEATNBDeviceList: "pagesjs/device/nbDevice/pageNEATNBDeviceList",
    // nb设备信息修改页面
    pageNEATNBDeviceUpdate: "pagesjs/device/nbDevice/pageNEATNBDeviceUpdate",

    // nb设备详情页面
    pageNEATNBDeviceDetail: "pagesjs/device/nbDevice/pageNEATNBDeviceDetail",

    //-------------一体化设备--------------------
    // 用户信息传输设备页面
    pageIntegratedUITDList: "pagesjs/device/integratedDevice/uitd/uitdList",
    pageIntegratedUpdateUITD: "pagesjs/device/integratedDevice/uitd/uitdUpdate",
    pageIntegratedCreateUITD: "pagesjs/device/integratedDevice/uitd/uitdCreate",
    pageIntegratedDetailUITD: "pagesjs/device/integratedDevice/uitd/uitdDetail",

    // 消防主机设备页面
    pageIntegratedFireHostList: "pagesjs/device/integratedDevice/fireHost/fireHostList",
    pageIntegratedFireHostCreate: "pagesjs/device/integratedDevice/fireHost/fireHostCreate",
    pageIntegratedFireHostUpdate: "pagesjs/device/integratedDevice/fireHost/fireHostUpdate",
    pageIntegratedFireHostDetail: "pagesjs/device/integratedDevice/fireHost/fireHostDetail",
    pageIntegratedFireHostListView: "pagesjs/device/integratedDevice/fireHost/fireHostListView",


    // 消防部件页面
    pageIntegratedFireSignalList: "pagesjs/device/integratedDevice/fireSignal/fireSignalList",
    pageIntegratedFireSignalCreate: "pagesjs/device/integratedDevice/fireSignal/fireSignalCreate",
    pageIntegratedFireSignalUpdate: "pagesjs/device/integratedDevice/fireSignal/fireSignalUpdate",
    pageIntegratedFireSignalDetail: "pagesjs/device/integratedDevice/fireSignal/fireSignalDetail",
    pageIntegratedFireSignalListView: "pagesjs/device/integratedDevice/fireSignal/fireSignalListView",
    pageIntegratedFireSignalImport: "pagesjs/device/integratedDevice/fireSignal/fireSignalImport",


    //-------------综合设备查询--------------------
    // 综合设备查询 列表页面
    pageGeneralQueryList: "pagesjs/device/generalQuery/pageGeneralQueryList",
    // 设备事件列表页面
    pageDeviceEventList: "pagesjs/device/generalQuery/pageDeviceEventList",

    // 设备实时数据页面
    pageDeviceRealTimeStatus: "pagesjs/device/generalQuery/pageDeviceRealTimeStatus",

    //水设备历史数据
    pageWaterHistoryData: "pagesjs/device/generalQuery/pageWaterHistoryData",

    //智慧用电历史数据
    pageElectricalDeviceHistoryData: "pagesjs/device/generalQuery/pageElectricalDeviceHistoryData",


    //-------------萤石云视频设备--------------------
    //萤石云 账号 列表 页面
    pageYSAccountList: "pagesjs/device/videoDevice/YS/pageYSAccountList",
    //萤石云 账号 添加 页面
    pageYSAccountCreate: "pagesjs/device/videoDevice/YS/pageYSAccountCreate",
    //萤石云 账号 修改 页面
    pageYSAccountUpdate: "pagesjs/device/videoDevice/YS/pageYSAccountUpdate",

    //萤石云 设备 列表页面
    pageYSDeviceList: "pagesjs/device/videoDevice/YS/pageYSDeviceList",
    //萤石云 设备 修改页面
    pageYSDeviceUpdate: "pagesjs/device/videoDevice/YS/pageYSDeviceUpdate",


    //萤石云 通道 列表页面
    pageYSDeviceChannelList: "pagesjs/device/videoDevice/YS/pageYSDeviceChannelList",
    //萤石云 通道 修改页面
    pageYSDeviceChannelUpdate: "pagesjs/device/videoDevice/YS/pageYSDeviceChannelUpdate",

    //-------------直连视频设备--------------------
    //直连视频设备 列表 页面
    pageDirectVideoDeviceList: "pagesjs/device/videoDevice/Direct/pageDirectVideoDeviceList",
    //直连视频设备 添加 页面
    pageDirectVideoDeviceCreate: "pagesjs/device/videoDevice/Direct/pageDirectVideoDeviceCreate",
    //直连视频设备 修改 页面
    pageDirectVideoDeviceUpdate: "pagesjs/device/videoDevice/Direct/pageDirectVideoDeviceUpdate",

    //直连视频设备 通道 列表 页面
    pageDirectVideoDeviceChannelList: "pagesjs/device/videoDevice/Direct/pageDirectVideoDeviceChannelList",
    //直连视频设备 通道 添加 页面
    pageDirectVideoDeviceChannelCreate: "pagesjs/device/videoDevice/Direct/pageDirectVideoDeviceChannelCreate",
    //直连视频设备 通道 修改 页面
    pageDirectVideoDeviceChannelUpdate: "pagesjs/device/videoDevice/Direct/pageDirectVideoDeviceChannelUpdate",

    //-------------视频联动--------------------
    //视频联动 列表 页面
    pageVideoLinkageList: "pagesjs/device/videoDevice/VideoLinkage/pageVideoLinkageList",
    //视频联动 添加 页面
    pageVideoLinkageCreate: "pagesjs/device/videoDevice/VideoLinkage/pageVideoLinkageCreate",
    //设备选择页面
    pageDeviceSelector: "pagesjs/device/videoDevice/VideoLinkage/pageDeviceSelector",

    //----------------智慧用电------------------
    //智慧用电 网关 列表 页面
    pageElectricalDeviceGatewayList: "pagesjs/device/electricalDevice/pageElectricalDeviceGatewayList",
    // 智慧用电 网关 修改 页面
    pageElectricalDeviceGatewayUpdate: "pagesjs/device/electricalDevice/pageElectricalDeviceGatewayUpdate",
    // 智慧用电 通道 设置 页面
    pageElectricalDeviceChannelSetting: "pagesjs/device/electricalDevice/pageElectricalDeviceChannelSetting",
    // 智慧用电 通道 屏蔽设置 页面
    pageElectricalDeviceChannelMask: "pagesjs/device/electricalDevice/pageElectricalDeviceChannelMask",
    //  智慧用电 网关 升级 页面
    pageElectricalDeviceUpgrade: "pagesjs/device/electricalDevice/pageElectricalDeviceUpgrade",
    // 智慧用电 升级版本文件管理 页面
    pageElectricalDeviceUpgradeFileManage: "pagesjs/device/electricalDevice/pageElectricalDeviceUpgradeFileManage",
    // 智慧用电 运维记录 页面
    pageElectricalDeviceOperationHistory: "pagesjs/device/electricalDevice/pageElectricalDeviceOperationHistory",

    //智慧用电 网关详情 页面
    pageElectricalDeviceGatewayDetail: "pagesjs/device/electricalDevice/pageElectricalDeviceGatewayDetail",
    //=============== 实时监控子系统=======================

    //----------------------------------------
    //数据访问接口
    //----------------------------------------
    //实时监控 相关数据访问接口
    nbDeviceMonitoringDataApi: "modules/dataApi/monitoring/nbDevice/nbDeviceMonitoringDataApi",
    monitorDataApi: "modules/dataApi/monitoring/monitorDataApi",
    //---------------------------------------
    //页面模块列表
    //---------------------------------------
    // nb设备
    pageNBDeviceMonitoring: "pagesjs/monitoring/nbDevice/nbDeviceMonitoring",
    // 历史警情列表页面
    pageHistoryEventQuery: "pagesjs/monitoring/pageHistoryEventQuery",
    // 企业非正常设备列表
    pageEnterpriseAbnormalDeviceList: "pagesjs/monitoring/pageEnterpriseAbnormalDeviceList",
    //====================================================

    //接处警情
    pageMonitor: "pagesjs/monitoring/pageMonitor",
    //警情处理
    pagemonitorEventProcess: "pagesjs/monitoring/pagemonitorEventProcess",
    monitorEventProcessDataApi: "modules/dataApi/monitoring/monitorEventProcessDataApi",
    pagemonitorEventProcessResultWindow: "pagesjs/monitoring/pagemonitorEventProcessResultWindow",

    //================统计报表===========================
    //----------------------------------------
    // 数据访问接口
    //----------------------------------------
    //事件统计报表数据访问接口
    statDataApi: "modules/dataApi/statDataApi",
    enterpriseInfoDataApi: "modules/dataApi/statistics/enterpriseInfoDataApi",
    //---------------------------------------
    //页面模块列表
    //---------------------------------------
    //警情统计报表页面
    pageEventReport: "pagesjs/statistics/pageEventReport",

    //================大屏展示===========================
    //大屏展示页面
    pageBoardShow: "pagesjs/statistics/pageBoardShow",
    //大屏展示页面
    pageEnterpriseInfo: "pagesjs/statistics/pageEnterpriseInfo",
    //大屏展示数据访问接口
    boardShowDataApi: "modules/dataApi/statistics/boardShowDataApi",

    pageEnterpriseDialog: "pagesjs/statistics/dialog/pageEnterpriseDialog",

});