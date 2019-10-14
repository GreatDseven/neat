
//大屏展示
layui.define(["jquery", 'element', 'form', 'laydate', 'table', 'laytpl', 'layer', 'neat', 'neatNavigator', 'commonDataApi', 'boardShowDataApi', 'neatUITools', 'echarts', 'neatTools', 'neatGIS', 'monitorDataApi', 'autoRefresh', 'neatPopupRepository', 'neatLoginOp', 'neatTime'], function (exports) {

    "use strict";

    var MODULE_NAME = "pageBoardShow";
    var $ = layui.$;
    var table = layui.table;
    var form = layui.form;
    var laytpl = layui.laytpl;
    var refresh = layui.autoRefresh;
    var neat = layui.neat;
    var laydate = layui.laydate;
    var gis = layui.neatGIS();
    var neatNavigator = layui.neatNavigator;
    var commonDataApi = layui.commonDataApi;
    var pageBoardDataApi = layui.boardShowDataApi;
    var pageDataApi = layui.monitorDataApi;
    var uiTools = layui.neatUITools;
    var neatTools = layui.neatTools;
    var echarts = layui.echarts;
    var popUps = layui.neatPopupRepository;
    var token = neat.getUserToken();
    var neatLoginOp = layui.neatLoginOp;
    var neatTime = layui.neatTime;
    var maplayer = {};
    var cluster, markers = [];
    var count = 0;


    var SubPage = function () {
    };

    SubPage.prototype.init = function () {
        var that = this;
        this.optSysType = "fire";
        //检查是否登录了
        neatLoginOp.checkLogin();
        this.BindMap();
        this.initOptSysTypeEvent();
        this.initTable();
        this.initRefresh();
        //开始网页头部时间计时
        neatTime({
            elem: "#currentTime"
        });
    };


    //左侧第一行
    SubPage.prototype.getNotHandledAlarm = function () {
        pageBoardDataApi.getNotHandledAlarmData(token, function (data) {
            setScaleNum("uFireCount", data.notHandledFireAlarmNum);
            setScaleNum("uAlarmCount", data.notHandledAlarmNum);
            setScaleNum("uFaultCount", data.notHandledFaultNum);
            setScaleNum("uHiddenCount", data.notHandledHiddenNum);
        });
    };
    //左侧第二行
    SubPage.prototype.getDeviceStatisticInfo = function () {
        pageBoardDataApi.getDeviceStatisticInfoData(token, function (data) {
            setScaleNum("gatewayCount", data.wgwNum);
            setScaleNum("alarmGatewayCount", data.alarmWgwNum);
            setScaleNum("keypartCount", data.keypartNum);
            setScaleNum("nbiotCount", data.nbiotNum);
        });
    };

    //左侧第三行
    SubPage.prototype.getInspectionStatisticInfo = function () {
        pageBoardDataApi.getInspectionStatisticInfoData(token, function (data) {

            //"taskDoneNum": 100,
            //"taskNotDoneNum": 0,
            //"enterpriseHasHiddenNum": 100,
            //"enterpriseNoHiddenNum": 0,
            //"patrolPTNum": 100,
            //"notPatrolPTNum": 0,
            //"hiddenPTNum": 100,
            //"noHiddenPTNum": 0

            //巡检任务完成情况
            initXJ_1(data.taskDoneNum, data.taskNotDoneNum);
            //隐患单位
            initXJ_2(data.enterpriseHasHiddenNum, data.enterpriseNoHiddenNum);
            //巡查点位
            initXJ_3(data.patrolPTNum, data.notPatrolPTNum);
            //隐患点位
            initXJ_4(data.noHiddenPTNum, data.hiddenPTNum);
        });
    };

    //右侧第一行 联网主机在线统计
    SubPage.prototype.bindLWZJZXTJ = function () {
        //这里需要添加绑定数据的代码
        var ctlId = 'lwzjzxtj';
        pageBoardDataApi.getOnlineDeviceStatInfo(token, this.optSysType, function (data) {
            //var data = [{"DevType":"气体灭火系统","OnlineCount":2,"TotalCount":2}]
            var categoryData = [];
            var dataOnline = [];
            var dataTotal = [];
            var fakeTotalData = [];

            $.each(data, function (_, value) {
                //"devType": "NB传感器",
                //"onlineCount": 0,
                //"totalCount": 20
                categoryData.push(value.devType);
                dataOnline.push(value.onlineCount);
                dataTotal.push(value.totalCount);
                fakeTotalData.push(100);
            });

            create_LWZJZXTJ_bar_chart(ctlId, categoryData, dataOnline, dataTotal, fakeTotalData);
        });

    };

    // 初始化系统类型选择事件
    SubPage.prototype.initOptSysTypeEvent = function () {
        //这里需要添加绑定数据的代码

        var that = this;

        form.on('select(optSysType)', function (data) {

            that.optSysType = data.value;

            that.bindLWZJZXTJ();
        });
    };
    /*************实时警情列表****************/
    // 加载 巡检项目列表，并监听相关的表格事件
    SubPage.prototype.initTable = function (data) {
        var that = this;
        // 渲染 项目类型列表
        table.render({
            elem: '#ssjqlb'
            , id: "ssjqlb"
            , page: false
            , height: 180
            , width: 500
            , autoSort: false
            , loading: false
            , limit: 99999999999
            , data: []
            , cols: [[
                /*
                "id": "004b75ba-977a-465e-aadc-a4b9a6a2231e",
                "deviceId": "848ec535-d143-4532-a63b-c09a9bba462a",
                "deviceName": "NB测试设备1",
                "deviceIdType": 3,
                "eventCategory": "fire",
                "systemCategory": "10",
                "occurTime": "14:28:31",
                "isHandled": false
                 */
                 {
                     field: 'eventCategory', title: '类型', width: 80, align: 'center', templet: function (d) { return uiTools.renderEventTypeByWord(d.eventCategory); }
                 }
                , {
                    field: 'deviceName', title: '设备名称', width: 220, align: 'left'
                }
                , {
                    field: 'occurTime', title: '时间', width: 200, align: 'center'
                }
            ]]


        });
    };


    //绑定主表数据
    SubPage.prototype.bindTable = function () {
        var that = this;

        pageDataApi.queryEventTypeList(token, function (result) {
            that.reloadTable(result.data);
        }, function () {
        });
    };

    // 重新加载列表
    SubPage.prototype.reloadTable = function (result) {
        var that = this;
        table.reload("ssjqlb", {
            data: result
        });
    }

    //构造联网主机在线统计图表
    function create_LWZJZXTJ_bar_chart(ctlId, labelData, onLineData, totalData, fakeTotalData) {

        var option = {
            tooltip: {
                trigger: 'axis',
                axisPointer: { // 坐标轴指示器，坐标轴触发有效
                    type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
                },
                formatter: function (data) {
                    var _str = labelData[data[0].dataIndex] + "<br>";

                    _str += "在线主机： " + onLineData[data[0].dataIndex] + "<br>";
                    _str += "主机总数： " + totalData[data[0].dataIndex] + "<br>";
                    _str += "在线率： " + (onLineData[data[0].dataIndex] * 100 / totalData[data[0].dataIndex])
                        .toFixed(
                            2) + "%";

                    return _str;
                }
            },

            grid: {
                show: true,
                left: 160,
                bottom: 20,
                top: 20,
                right: 20,
                borderWidth: 0,


            },
            xAxis: {
                type: 'value',
                show: true,
                max: 100,
                axisLine: {
                    show: false
                },
                axisTick: {
                    show: false
                },
                axisLabel: {
                    show: false
                },
                splitLine: {
                    show: false
                }
            },
            yAxis: [{
                type: 'category',
                position: "left",
                data: labelData,
                axisLabel: {
                    textStyle: {
                        color: "#15A9F6",
                        fontSize: 14
                    }
                },
                splitLine: {
                    show: false
                },
                axisTick: {
                    show: false
                },
                axisLine: {
                    show: false
                },

            }, {
                type: 'category',
                position: "left",
                data: labelData,
                axisLabel: {
                    textStyle: {
                        color: "#15A9F6",
                        fontSize: 14
                    }
                },
                splitLine: {
                    show: false
                },
                axisTick: {
                    show: false
                },
                axisLine: {
                    show: false
                },
            }],
            series: [{
                name: '主机总数',
                type: 'bar',
                yAxisIndex: 0,
                label: {
                    normal: {
                        show: true,
                        formatter: function (data) {
                            return totalData[data.dataIndex];
                        },
                        position: 'insideRight'
                    }
                },
                itemStyle: {
                    emphasis: {
                        barBorderRadius: 30
                    },
                    normal: {
                        barBorderRadius: 30,
                        color: new echarts.graphic.LinearGradient(
                            0, 0, 1, 0,
                            [{
                                offset: 0,
                                color: 'rgba(38,54,80,0.3)'
                            },
                                {
                                    offset: 1,
                                    color: 'rgba(181,43,43,0.3)'
                                },

                            ]
                        )
                    }
                },
                barWidth: 10,
                barGap: '30%',

                data: fakeTotalData
            }, {
                name: '在线主机',
                type: 'bar',
                yAxisIndex: 1,
                label: {
                    normal: {
                        show: false,
                        /*formatter: function (data) {
                            return onLineData[data.dataIndex] + "(" + (onLineData[data.dataIndex] *
                                100 / totalData[data.dataIndex]).toFixed(2) + " %) ";
                        },*/
                        position: 'insideRight'
                    }
                },
                itemStyle: {
                    emphasis: {
                        barBorderRadius: 30
                    },
                    normal: {
                        barBorderRadius: 30,
                        color: new echarts.graphic.LinearGradient(
                            0, 0, 1, 0,
                            [{
                                offset: 0,
                                color: '#118caf'
                            },
                                {
                                    offset: 1,
                                    color: '#02E6FF'
                                }

                            ]
                        )
                    }
                },
                barWidth: 10,
                barGap: '30%',

                data: onLineData.map(function (item, index) {
                    return parseInt(item) / totalData[index] * 100;
                })
            }]
        };

        var chart = getEchartObj(ctlId);
        if (!chart) {
            createEChartCtl(ctlId, option);
        } else {
            chart.setOption(option);
        }

    };

    /*************联网单位统计****************/

    //绑定数据,联网单位统计
    function bindLWDWTJ() {
        pageBoardDataApi.GetNetUnitStatisticsData(token, function (data) {

            var chartData = [];

            var legentData = [];


            data.sort(function (a, b) {

                return a.typeCode.localeCompare(b.typeCode);
            })

            $.each(data, function (index, item) {
                //{typeCode: "01",typeCount: 46,typeName: "公共娱乐场所"}

                if (!item)
                    return;

                if (item.typeCount === 0)
                    return;

                legentData.push(item.typeName);
                chartData.push({
                    value: item.typeCount,
                    name: item.typeName
                });

            });

            var ctlId = 'lwdwtj';


            var chart = getEchartObj(ctlId);
            if (!chart) {
                create_LWDWTJ_pie_chart(ctlId, chartData, legentData);
            } else {
                bind_LWDWTJ_pie_chart(ctlId, chartData, legentData);
            }


        });

    }

    //绑定数据 联网单位统计 图表
    function bind_LWDWTJ_pie_chart(ctlId, data, legentData) {
        var chart = getEchartObj(ctlId);
        chart.setOption({
            series: [{
                name: '联网单位',
                data: data.sort(function (a, b) {
                    return a.value - b.value;
                })
            }]
        });
    }


    //构造 联网单位统计 图表
    function create_LWDWTJ_pie_chart(ctlId, data, legentData) {

        var option = {

            tooltip: {
                trigger: 'item',
                formatter: "{a} <br/>{b} : {c} ({d}%)"
            },

            legend: {
                y: 'center',
                orient: 'vertical',
                right: 10,

                //data: legentData,
                textStyle: {
                    color: '#2d9fd7'
                },
                selectedMode: false


            },
            series: [{
                name: '联网单位',
                type: 'pie',
                radius: '78%',
                center: ['30%', '53.2%'],
                data: data.sort(function (a, b) {
                    return a.value - b.value;
                }),
                roseType: 'radius',

                label: {
                    color: '#2d9fd7',
                    formatter: '{c} 家 '
                },
                labelLine: {
                    normal: {
                        lineStyle: {
                            color: '#2d9fd7'
                        },
                        smooth: 0.2,
                        length: 10,
                        length2: 20
                    }
                },

                animationType: 'scale',
                animationEasing: 'elasticOut',
                animationDelay: function (idx) {
                    return Math.random() * 200;
                }
            }],
            color: ["#0588ca", "#164d71", "#172a88", "#813b4e", "#05d3ed"]
        };

        createEChartCtl(ctlId, option);
    }


    //巡检任务完成情况
    function initXJ_1(data1, data2) {
        if (!data1)
            data1 = 0;
        if (!data2)
            data2 = 0;
        //getdata here

        createXJ_Pie_Chart('xj_ctl_1', '巡检任务完成情况', data1, data2, "已完成", "未完成");

        $("#xj_ctl_1_lbl").text(getAPercent(data1, data2));
    }

    //隐患单位
    function initXJ_2(data1, data2) {
        if (!data1)
            data1 = 0;
        if (!data2)
            data2 = 0;
        createXJ_Pie_Chart('xj_ctl_2', '隐患单位统计', data1, data2, "隐患单位", "无隐患单位");
        $("#xj_ctl_2_lbl").text(getAPercent(data1, data2));
    }

    //巡查点位
    function initXJ_3(data1, data2) {
        if (!data1)
            data1 = 0;
        if (!data2)
            data2 = 0;
        createXJ_Pie_Chart('xj_ctl_3', '点位巡查情况', data1, data2, "已巡查点位", "未巡查点位");
        $("#xj_ctl_3_lbl").text(getAPercent(data1, data2));
    }

    //隐患点位
    function initXJ_4(data1, data2) {
        if (!data1)
            data1 = 0;
        if (!data2)
            data2 = 0;
        createXJ_Pie_Chart('xj_ctl_4', '隐患点位情况', data2, data1, "隐患点位", "无隐患点位");
        $("#xj_ctl_4_lbl").text(getAPercent(data1, data2));
    }

    //计算a占a+b总和的百分比
    function getAPercent(a, b) {

        var sum = a + b;
        if (sum == 0) {
            return "100%";
        }

        return (Math.round(a*1.0 / sum * 100).toString()) + "%";
    }

    // 创建 巡检统计的 饼图
    function createXJ_Pie_Chart(ctlId, title, data1, data2, data1Title, data2Title) {

        // 指定图表的配置项和数据
        var option = {
            tooltip: {
                trigger: 'item',
                formatter: "{a} <br/>{b}: {c} ({d}%)",
                show: true,
            },

            series: [{
                name: title,
                type: 'pie',
                hoverAnimation: false,
                radius: [0, '76%'],

                label: {
                    normal: {
                        show: false
                    }
                },
                labelLine: {
                    normal: {
                        show: false
                    }
                },
                startAngle: 270,
                data: [{
                    value: data1,
                    name: data1Title + " "
                },
                    {
                        value: data2,
                        name: data2Title + " "
                    }

                ],
                color: [

                    {
                        type: 'linear',
                        x: 0,
                        y: 0,
                        x2: 1,
                        y2: 0,
                        colorStops: [{
                            offset: 0,
                            color: '#263650' // 0% 处的颜色
                        }, {
                            offset: 1,
                            color: '#B52B2B' // 100% 处的颜色
                        }],
                        globalCoord: false // 缺省为 false
                    },
                    "#1a4e81"

                ]

            },
                {
                    name: title,
                    type: 'pie',
                    hoverAnimation: false,
                    radius: ['80%', '87%'],
                    label: {
                        normal: {

                            show: false,

                        }
                    },
                    startAngle: 270,
                    data: [{
                        value: data1,
                        name: data1Title
                    },
                        {
                            value: data2,
                            name: data2Title
                        }

                    ],
                    color: ["#02e6ff", "#0f87a7"]

                }
            ]
        };

        var chart = getEchartObj(ctlId);
        if (!chart) {
            createEChartCtl(ctlId, option);
        } else {
            chart.setOption(option);
        }

    }
    //生成 echart key
    function _getEchartCtlKey(ctlId) {
        return "neat_echarts_" + ctlId;
    };

    //获取echart javascript对象
    function getEchartObj(ctlId) {
        return window[_getEchartCtlKey(ctlId)];
    }
    //设置echart javascript对象
    function _setEchartObj(ctlId, echartObj) {
        var key = _getEchartCtlKey(ctlId);
        window[key] = echartObj;
    }

    //初始化echart
    function createEChartCtl(ctlId, option) {
        var myChart = echarts.init(document.getElementById(ctlId));
        _setEchartObj(ctlId, myChart);
        if (option) {
            myChart.setOption(option);
        }
        return myChart;
    }
    /***********************************历年报警趋势************************************/
    function process_LNBJQS_Data(data) {
        var yearData = [];

        var fireData = [];
        var faultData = [];
      

        $.each(data, function (index, value) {
            //"fireNum": 0,
            //"alarmNum": 0,
            //"faultNum": 0,
            //"label": "2012"
            yearData.push(value.label);
            fireData.push(value.fireNum);
            faultData.push(value.faultNum);
        });

        return {
            yearData: yearData,
            fireData: fireData,
            faultData: faultData
            
        };
    }


    //绑定数据 历年报警趋势
    function bindLNBJQS() {

        var cltId = 'lnbjqs';


        pageBoardDataApi.getGetAlarmTrendYearData(token, function (data) {
            var chartData = process_LNBJQS_Data(data);

            var chart = getEchartObj(cltId);

            if (!chart) {
                create_LNBJQS_Bar_chart(cltId, chartData.yearData, chartData.fireData, chartData.faultData);
            } else {
                bind_LNBJQS_Bar_chart(cltId, chartData.yearData, chartData.fireData, chartData.faultData);
            }
        });

    }

    //历年报警趋势柱状图
    function bind_LNBJQS_Bar_chart(ctlId, yearData, fireData, faultData) {
        var chart = getEchartObj(ctlId);

        chart.setOption({
            xAxis: {
                data: yearData,
            },
            series: [{
                name: "故障",
                data: faultData
            },
                {
                    name: "火警",
                    data: fireData
                }
               
            ]
        });
    };



    //历年报警趋势柱状图
    function create_LNBJQS_Bar_chart(ctlId, yearData, fireData, faultData) {


        var option = {
            title: {
                text: "历年报警趋势",
                show: false
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow'
                }
            },
            xAxis: {
                type: 'category',
                data: yearData,
                axisLabel: {
                    color: '#1789cc'
                },

                splitLine: {
                    lineStyle: {
                        color: '#144575'
                    },
                    show: true

                },
                axisLine: {
                    lineStyle: {
                        color: '#144575'
                    },

                    show: true
                },
                axisTick: {
                    show: false
                }
            },
            yAxis: {
                type: 'value',
                axisLabel: {
                    color: '#1789cc'
                },
                splitLine: {
                    lineStyle: {
                        color: '#144575'
                    },
                    show: true
                },
                axisLine: {
                    lineStyle: {
                        color: '#144575'
                    },
                    show: true
                },
                axisTick: {
                    show: false
                }
            },
            grid: {
                show: true,
                left: 40,
                bottom: 20,
                top: 20,
                right: 20,
                borderColor: "#144575",
                width: 480,
                borderWidth: 0,
            },
            series: [{
                data: faultData,
                type: 'bar',
                name: "故障",

                color: ["#07c0dc"],
                itemStyle: {
                    barBorderRadius: 50
                },
                barWidth: 10

            },
                {
                    data: fireData,
                    type: 'bar',
                    name: "火警",
                    itemStyle: {
                        barBorderRadius: 50
                    },
                    barWidth: 10,

                    color: [{
                        type: 'linear',
                        x: 0,
                        y: 0,
                        x2: 0,
                        y2: 1,
                        colorStops: [{
                            offset: 0,
                            color: '#B52B2B' // 0% 处的颜色
                        }, {
                            offset: 1,
                            color: '#263650' // 100% 处的颜色
                        }],
                        globalCoord: false // 缺省为 false
                    }]
                }
            ]
        };

        createEChartCtl(ctlId, option);

    }
    /***********************************历年报警趋势end************************************/
    /***********************************地图部分************************************/
    //地图描点 弹框中 详情按钮事件
    window.entdetailsbutton = function (e) {
        var entid = $(e).attr("attrid");
        popUps.showEnterpriseDetailWindow(entid);
    };
    //地图描点 弹框中 视频按钮事件
    window.entvideobutton = function (e) {
        var entid = $(e).attr("attrid");
        popUps.showEnterpriseDeviceCameraWindow(entid);
    };
    //地图描点 弹框中 平面图按钮事件
    window.entplanbutton = function (e) {
        var entid = $(e).attr("attrid");
        popUps.showEnterprisePlanarGraphWindow(entid);
    };

    //地图描点 弹框中 火警数 报警数 离线数 点击弹框
    window.eventbuttoncount = function (e, eve) {
        if ($(e).text() != "0") {
            var entid = $(e).attr("attrid");
            popUps.showEnterpriseAbnormalDeviceListWindow(entid, eve);
        }
    };

    function getentMarker(entid) {
        var result = null;
        $.each(markers, function (_, item) {
            if (item.entid == entid) {
                result = item;
            }
        })
        return result;
    }
    function initwindowsinfo(data) {
        //实例化信息窗体
        var getTpl = $("#maplocationinfo").html();
        var infoWindow = new AMap.InfoWindow({
            isCustom: true,  //使用自定义窗体
            content: createInfoWindow(data.name, laytpl(getTpl).render(data)),
            offset: new AMap.Pixel(-13, -20)
        });
        return infoWindow;
    }



    //构建自定义信息窗体
    function createInfoWindow(title, content) {
        var info = document.createElement("div");
        info.className = "custom-info input-card content-window-card";

        //可以通过下面的方式修改自定义窗体的宽高
        info.style.width = "260px";
        info.style.height = "200px";

        // 定义中部内容
        var middle = document.createElement("div");
        middle.className = "info-middle";
        middle.innerHTML = content;
        info.appendChild(middle);

        // 定义底部内容
        var bottom = document.createElement("div");
        bottom.className = "info-bottom";
        var sharp = document.createElement("img");
        sharp.src = "/content/neat/images/receiveThePolice/sharp.png";
        bottom.appendChild(sharp);
        info.appendChild(bottom);
        return info;
    }
    //关闭信息窗体
    function closeInfoWindow() {
        if (typeof maplayer.clearInfoWindow === 'function')
            maplayer.clearInfoWindow();
    }


    //判断地图描点 事件类型
    var findClusterEventType = function (context) {
        var eventType = "ok";
        for (var i = 0; i < context.markers.length; i++) {
            if (eventType === "ok") {
                if (context.markers[i].eventType === "fire") {
                    eventType = "fire";
                    break;
                }
                else if (context.markers[i].eventType === "alarm") {
                    eventType = "alarm";

                }
                else if (context.markers[i].eventType === "fault") {
                    eventType = "fault";
                }
            }
            else if (eventType === "fault") {
                if (context.markers[i].eventType === "fire") {
                    eventType = "fire";
                    break;
                }
                else if (context.markers[i].eventType === "alarm") {
                    eventType = "alarm";
                }
            }
            else if (eventType === "alarm") {
                if (context.markers[i].eventType === "fire") {
                    eventType = "fire";
                    break;
                }
            }
            else if (eventType === "fire") {
                break;
            }
        }
        return eventType;
    };
    var getcolor = function (eventType) {
        var bgColor = '';
        if (eventType === "fire") {
            bgColor = '#e74e4e';
        }
        else if (eventType === "fault") {
            bgColor = '#f8b62d';
        }
        else if (eventType === "alarm") {
            bgColor = '#814df4';
        }
        else {
            bgColor = '#04ad70';
        }
        return bgColor;
    };

    var getMarkEventType = function (d) {
        if (d.fireCount > 0) {
            return "fire";
        }
        if (d.alarmCount > 0) {
            return "alarm";
        }
        if (d.faultCount > 0) {
            return "fault";
        }
        return "ok";
    };
    var _renderClusterMarker = function (context) {
        context.marker.eventType = findClusterEventType(context);
        var factor = Math.pow(context.count / count, 1 / 18);
        var div = document.createElement('div');
        var bgColor = '';
        var bgsize = '';
        bgColor = getcolor(context.marker.eventType);
        var fontColor = '#fff';
        var size = Math.round(30 + Math.pow(context.count / count, 1 / 5) * 20);
        div.style.width = div.style.height = size + 'px';
        div.style.borderRadius = size / 2 + 'px';
        div.style.background = bgColor;
        div.innerHTML = context.count;
        div.style.lineHeight = size + 'px';
        div.style.color = fontColor;
        div.style.fontSize = '14px';
        div.style.fontWeight = 'bold';
        div.style.textAlign = 'center';
        context.marker.setOffset(new AMap.Pixel(-size / 2, -size / 2));
        context.marker.setContent(div);

    };

    var addCluster = function (tag) {
        if (cluster) {
            cluster.setMap(null);
        }
        if (tag == 2) {//完全自定义
            cluster = new AMap.MarkerClusterer(maplayer, markers, {
                gridSize: 80,
                renderClusterMarker: _renderClusterMarker
            });
        }
    };
    var removeMapPoint = function () {

        if (!maplayer)
            return;
        if (typeof (maplayer.remove) === "function") {
            maplayer.remove(markers);

        }

    }
    function displayMapPoint() {

        pageDataApi.queryMapLocationData(token, function (data) {

            //如果没有地图对象 return
            if (typeof AMap === "undefined" || typeof AMap.Marker === "undefined") {
                return;
            }

            var pointslocation = data;
            markers = [];
            count = 0;
            for (var i = 0; i < pointslocation.length; i += 1) {
                var eventType = getMarkEventType(pointslocation[i]);
                //var markerEventCount = getEntEventCount(pointslocation[i]);
                var location = [pointslocation[i]['lon'], pointslocation[i]['lat']];
                var marker = new AMap.Marker({
                    position: ["" + pointslocation[i]['lon'], "" + pointslocation[i]['lat']],
                    content: '<div id="' + pointslocation[i]['id'] + '" class="pointsmall" style="background-color: ' + getcolor(eventType) + ';"></div>',
                    offset: new AMap.Pixel(-15, -15)
                });

                marker.eventType = eventType;
                markers.push(marker);
                marker.entid = pointslocation[i]['id'];
                //鼠标点击marker弹出自定义的信息窗体
                AMap.event.addListener(marker, 'click', function (thismarker) {
                    openInfoWindows(thismarker.target);
                });
            }
            count = markers.length;
            addCluster(2);
        });
    };
    function openInfoWindows(marker) {
        pageDataApi.queryEntMapInfoData(token, marker.entid, function (data) {
            var infowindow = initwindowsinfo(data);
            infowindow.open(maplayer, marker.getPosition());

        });
    }
    SubPage.prototype.BindMap = function () {
        var that = this;

        var mapContID = "mapContainer";
        var options = {
            animateEnable: true,
            resizeEnable: false,
            zoom: 10,
            scrollWheel: true,
            isHotspot: false
        };

        gis.init(mapContID, options, function () {
            maplayer = gis.getMapObj(mapContID);
            maplayer.on('zoomstart', closeInfoWindow);
            maplayer.on('movestart', closeInfoWindow);
            maplayer.on('click', closeInfoWindow);

            displayMapPoint();

        });

        $("#normalchange").on("click", function () {
            gis.changeSytleNormal(mapContID);
        });
        $("#darkchange").on("click", function () {
            gis.changeSytleDark(mapContID);
        });
        $(".deviceDventsLayer-leftTip").on("click", function () {
            $(".deviceDventsLayer").toggle();
        });
        $(".baseinfo-right-tip").on("click", function () {
            $(".right-layer-top").toggle();
        });
        $(".linknet-right-tip").on("click", function () {
            $(".right-layer-down").toggle();
            $(".layui-progress").toggle();
        });
    };

    /***********************************地图部分end************************************/

    /******************近一年警情趋势***************************/


    //绑定数据 近一年警情趋势
    function bindHJGZQST() {
        pageBoardDataApi.getAlarmTrendYears(token, function (data) {
            var monthData = [];
            var fireData = [];
            var faultData = [];
            $.each(data, function (_, value) {
                monthData.push(value.label);
                fireData.push(value.fireNum);
                faultData.push(value.faultNum);
            });
            var cltId = 'hjgzqst';
            var chart = getEchartObj(cltId);
            if (!chart) {
                create_HJGZQST_line_chart(cltId, monthData, fireData, faultData);
            } else {
                bind_HJGZQST_line_chart(cltId, monthData, fireData, faultData);
            }
        });
    }

    //绑定数据 近一年警情趋势
    function bind_HJGZQST_line_chart(ctlId, monthData, fireData, faultData) {
        var chart = getEchartObj(ctlId);
        chart.setOption({
            xAxis: {
                data: monthData
            },
            series: [{
                data: fireData,
                name: '火警',
            }, {
                data: faultData,
                name: '故障',
            }
            ]
        });
    }

    //近一年警情趋势
    function create_HJGZQST_line_chart(ctlId, monthData, fireData, faultData) {

        var option = {
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow'
                }
            },
            xAxis: {
                type: 'category',
                boundaryGap: false,
                data: monthData,
                axisLabel: {
                    color: '#1789cc'
                },
                axisLine: {
                    lineStyle: {
                        color: '#144575'
                    },
                    show: true
                },
                splitLine: {
                    lineStyle: {
                        color: '#144575'
                    },
                    show: true
                },
                axisTick: {
                    show: false
                }
            },
            yAxis: {
                type: 'value',
                axisLabel: {
                    color: '#1789cc'
                },
                axisLine: {
                    lineStyle: {
                        color: '#144575'
                    },
                    show: true
                },
                splitLine: {
                    lineStyle: {
                        color: '#144575'
                    },
                    show: true
                },
                axisTick: {
                    show: false
                },
                minInterval: 1,
                boundaryGap: [0, 0.1]
            },
            grid: {
                show: true,
                left: 50,
                bottom: 20,
                top: 20,
                right: 0,
                width: 650,
                borderWidth: 0,
                borderColor: "#144575",
            },
            label: {
                show: false,
                color: ['#1789cc']
            },

            series: [{
                data: fireData,
                name: '火警',
                type: 'line',
                smooth: true,
                symbol: 'circle',

                symbolSize: 2,

                showSymbol: false,

                // markPoint: {
                //     data: [
                //         { type: 'max', name: '最大值', coord:'max'}
                //     ],
                //     silent:true,


                // },
                lineStyle: {
                    normal: {
                        width: 0
                    }
                },
                areaStyle: {
                    normal: {
                        color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [{
                            offset: 0,
                            color: 'rgba(38, 54, 80, 0.6)'
                        }, {
                            offset: 1,
                            color: 'rgba(181, 43, 43, 0.6)'
                        }], false),
                        shadowColor: 'rgba(0, 0, 0, 0.1)',
                        shadowBlur: 10
                    }
                },
                itemStyle: {
                    normal: {
                        color: 'rgb(181,43,43)',
                        borderColor: 'rgba(181,43,43,0.2)',
                        borderWidth: 8

                    }
                },

            }, {
                data: faultData,
                name: '故障',
                type: 'line',
                smooth: true,

                symbol: 'circle',
                symbolSize: 2,
                showSymbol: false,
                lineStyle: {
                    normal: {
                        width: 0
                    }
                },
                areaStyle: {
                    normal: {
                        color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [{
                            offset: 0,
                            color: 'rgba(38, 54, 80, 0.6)'
                        }, {
                            offset: 1,
                            color: 'rgba(46, 167,224, 0.6)'
                        }], false),


                    }
                },
                itemStyle: {
                    normal: {
                        color: 'rgb(46, 167,224)',
                        borderColor: 'rgba(46, 167,224,0.27)',
                        borderWidth: 8

                    }
                },
            }]
        };

        createEChartCtl(ctlId, option);

    }


    SubPage.prototype.initRefresh = function () {
        var that = this;
        this.refreshHandle = refresh.autoRefresh(function () {
            //把刷新内容的代码单独提出去了
            that.refreshImpl();
        }, 50000);
    };

    //刷新时加载数据的整个过程.
    SubPage.prototype.refreshImpl = function () {
        var that = this;
        bindLNBJQS();
        bindHJGZQST();
        bindLWDWTJ();
        this.getNotHandledAlarm();
        this.getDeviceStatisticInfo();
        this.getInspectionStatisticInfo();
        this.bindLWZJZXTJ();
        removeMapPoint();
        closeInfoWindow();
        displayMapPoint();
        this.bindTable();

    };

    //自动缩放文字大小的形式,弹出统计数字.
    function setScaleNum(ctlId, num) {

        var maxWidth = 46;
        var maxHeight = 30;

        var container = $("#" + ctlId);

        container.html("");

        var canvas = $("<canvas />").attr("width", maxWidth).attr("height", maxHeight);

        canvas.appendTo(container);

        var canvasWidth = canvas[0].width;
        var canvasHeight = canvas[0].height;
        var context = canvas[0].getContext("2d");

        context.font = "16px MicrosoftYaHei";
        context.fillStyle = "#00ffff";


        var measureResult = context.measureText(num);
        var textWidth = measureResult.width;

        if (textWidth > canvasWidth) {
            var scaled = canvasWidth * 1.0 / textWidth;
            context.scale(scaled, scaled);

        }

        context.textAlign = "center";

        context.fillText(num, 23, 20, maxWidth);


    }

    exports(MODULE_NAME, new SubPage());

});