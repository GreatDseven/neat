//NB实时监控
layui.define(["jquery", 'element', 'form', 'table', 'laytpl', 'laypage', 'layer', 'neat', 'neatNavigator', 'commonDataApi', 'nbDeviceDataApi', 'neatUITools', 'echarts', 'nbDeviceMonitoringDataApi', 'autoRefresh'], function (exports) {

    "use strict";

    var MODULE_NAME = "pageNBDeviceMonitoring";

    var $ = layui.$;
    var table = layui.table;
    var form = layui.form;
    var laytpl = layui.laytpl;

    var neat = layui.neat;
    var laypage = layui.laypage;
    var neatNavigator = layui.neatNavigator;
    var commonDataApi = layui.commonDataApi;
    var pageDataApi = layui.nbDeviceMonitoringDataApi;
    var uiTools = layui.neatUITools;
    var autoRefresh = layui.autoRefresh;

    var echarts = layui.echarts;

    var SubPage = function () {

    };
    var token = neat.getUserToken();

    SubPage.prototype.NBdeviceMonthEventChart = function () {
        var option = {

            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    lineStyle: {
                        color: '#57617B'
                    }
                }
            },
            grid: {
                left: '20px',
                right: '20px',
                bottom: '10px',
                top: '25px',
                containLabel: true
            },
            xAxis: [{
                type: 'category',
                boundaryGap: false,
                axisLine: {
                    lineStyle: {
                        color: '#1d3764'
                    }
                },
                axisLabel: {
                    margin: 10,
                    textStyle: {
                        fontSize: 12,
                        color: '#16a7f6'
                    }
                },
                axisTick: {
                    show: false
                },
                splitLine: { //网格y轴
                    show: true,
                    lineStyle: {
                        color: '#1d3764'
                    }
                },
                data: ['3.20', '3.21', '3.22']//dayData
            }],
            yAxis: [{
                type: 'value',

                axisTick: {
                    show: false
                },
                axisLine: {
                    lineStyle: {
                        color: '#1d3764'
                    }
                },
                axisLabel: {
                    margin: 10,
                    textStyle: {
                        fontSize: 12,
                        color: '#16a7f6'
                    }
                },
                splitLine: {
                    show: true,
                    lineStyle: {
                        color: '#1d3764'
                    }
                },

                minInterval: 1,
                boundaryGap: [0, 0.1]

            }],
            series: [{
                name: '火警',
                type: 'line',
                smooth: true,
                symbol: 'circle',
                symbolSize: 2,
                showSymbol: false,
                // markPoint: {
                //     data: [{
                //         type: 'max',
                //         name: '最大值',
                //         coord: 'max'
                //     }],
                //     silent: true,
                // },
                lineStyle: {
                    normal: {
                        width: 1,
                        color: "#E74E4E",
                        opacity: 0.5
                    }
                },
                areaStyle: {
                    normal: {
                        color: new echarts.graphic.LinearGradient(0, 1, 0, 0, [{
                            offset: 0,
                            color: 'rgba(19, 28 ,64, 0.1)'
                        }, {
                            offset: 1,
                            color: 'rgba(231, 78, 78, 0.35)'
                        }], false),
                        shadowColor: 'rgba(0, 0, 0, 0.1)',
                        shadowBlur: 10
                    }
                },
                itemStyle: {
                    normal: {
                        color: 'rgb(181,43,43)',
                        borderColor: 'rgba(181,43,43,0.27)',
                        borderWidth: 8

                    }
                },
                data: [5, 20, 36, 10, 10, 20]//fireAlarmData
            },
            {
                name: '报警',
                type: 'line',
                smooth: true,
                symbol: 'circle',

                symbolSize: 2,

                showSymbol: false,
                lineStyle: {
                    normal: {
                        width: 1,
                        color: "#814DF4",
                        opacity: 0.5
                    }
                },
                areaStyle: {
                    normal: {
                        color: new echarts.graphic.LinearGradient(0, 1, 0, 0, [{
                            offset: 0,
                            color: 'rgba(19, 28 ,64, 0.1)'
                        }, {
                            offset: 1,
                            color: 'rgba(129,77,244, 0.35)'
                        }], false),
                        shadowColor: 'rgba(0, 0, 0, 0.2)',
                        shadowBlur: 10
                    }
                },
                itemStyle: {
                    normal: {
                        color: 'rgb(129,77,244)',
                        borderColor: 'rgba(129,77,244,0.27)',
                        borderWidth: 8

                    }
                },

                data: [5, 10, 16, 18, 15, 20]//alarmData
            },
            {
                name: '故障',
                type: 'line',
                smooth: true,

                symbol: 'circle',
                symbolSize: 2,
                showSymbol: false,

                lineStyle: {
                    normal: {
                        width: 1,
                        color: "#F4BA5D",
                        opacity: 0.5
                    }
                },


                areaStyle: {
                    normal: {
                        color: new echarts.graphic.LinearGradient(0, 1, 0, 0, [{
                            offset: 0,
                            color: 'rgba(19, 28, 64, 0.1)'
                        }, {
                            offset: 1,
                            color: 'rgba(244, 186,93, 0.35)'
                        }], false),


                    }
                },
                itemStyle: {
                    normal: {
                        color: 'rgb(244, 186,93)',
                        borderColor: 'rgba(4244, 186,93,0.27)',
                        borderWidth: 8

                    }
                },
                data: [8, 16, 13, 12, 11, 10]//faultData,
            }

            ]
        };

        var chart = echarts.init(document.getElementById('monthEventChart'));
        // 使用刚指定的配置项和数据显示图表。
        chart.setOption(option);
    };


    //绑定数据 30天警情曲线图 echart 图表
    function bindMonthEventChart() {

        $.neat.dataApi.fire.getMonthEventTrend(function (data) {
            /**
             * var data =[{"FireAlarmNum":0,"AlarmNum":0,"FaultNum":0,"Label":"5.13"}]
             * 
             */

            var chartData = processMonthEventChartData(data);


            var chart = $.neat.ui.getEchartObj("monthEventChart");

            if (!chart) {
                create_monthEventChart(chartData.fireAlarmData, chartData.alarmData,
                    chartData.faultData, chartData.dayData);
            } else {
                bind_monthEventChart(chartData.fireAlarmData, chartData.alarmData, chartData
                    .faultData, chartData.dayData);
            }

        });
    }



    //绑定数据 30天警情曲线图 echart 图表
    function bind_monthEventChart(fireAlarmData, alarmData, faultData, dayData) {

        var chart = $.neat.ui.getEchartObj("monthEventChart");
        chart.setOption({
            xAxis: [{
                data: dayData
            }],

            series: [{
                name: '火警',
                data: fireAlarmData
            }, {
                name: '报警',
                data: alarmData
            }, {
                name: '故障',
                data: faultData
            }]
        });
    }



    //创建 donut 图
    function createDonutChart(ctlId, notHandledData, handledData) {
        var option = {
            tooltip: {
                show: true
            },
            series: [{
                type: 'pie',
                radius: ['90%', '70%'],
                center: ['50%', '50%'],
                label: {
                    normal: {
                        position: 'center',
                        color: '#148FEE'
                    }
                },
                hoverAnimation: false,//注释 鼠标移动不可改变
                data: [{
                    value: notHandledData,
                    name: '',
                    label: {
                        normal: {
                            formatter: '{c}',
                            left: 'center',
                            top: 'middle',
                            icon: 'none',

                            textStyle: {
                                color: '#02E6FF',
                                fontSize: 13,
                                fontWeight: 'bold'
                            }
                        }
                    },
                    tooltip: {
                        trigger: 'item',
                        formatter: "未处理 : {c}"
                    },
                    itemStyle: {
                        normal: {
                            color: '#02E6FF'
                        },
                        emphasis: {
                            color: '#02E6FF'
                        }
                    }
                }, {
                    value: handledData,
                    label: {
                        normal: {
                            formatter: '',
                            textStyle: {
                                color: '#02E6FF',
                                fontSize: 13,
                                fontWeight: 'bold'
                            }
                        },
                        position: "center"
                    },
                    tooltip: {
                        trigger: 'item',
                        formatter: "已处理 : {c}"
                    },
                    itemStyle: {
                        normal: {
                            color: '#027BA5'
                        },
                        emphasis: {
                            color: '#027BA5'
                        }
                    }
                }]
            }]
        };

        createEChartCtl(ctlId, option);
    }
    //绑定数据 donut 图
    function bindDonutChart(ctlId, notHandledData, handledData) {
        var chart = getEchartObj(ctlId);

        var echartData = [{
            value: notHandledData,
            name: '未处理'
        }, {
            value: handledData,
            name: '已处理'
        }];

        chart.setOption({
            legend: {
                data: [echartData[0].name],
                formatter: function (name) {
                    return '{total|' + echartData[0].value + '}';
                }
            },
            series: [{
                data: echartData
            }]
        });
    }
    //生成 echart key
    function _getEchartCtlKey(ctlId) {
        return "neat_echarts_" + ctlId;
    }
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


    SubPage.prototype.BindNotHandledEventDonutChart = function () {
        pageDataApi.QueryUntreatedCountInfo(token, function (data) {
            var chart = getEchartObj("fireNumChart");
            if (!chart) {
                createDonutChart("fireNumChart", data.untreatedFireAlarmCount, data.treatedFireAlarmCount);
                createDonutChart("CallThePoliceNumChart", data.untreatedCallThePoliceCount, data.treatedCallThePoliceCount);
                createDonutChart("faultNumChart", data.untreatedFaultCount, data.treatedFaultCount);
            } else {
                bindDonutChart("fireNumChart", data.untreatedFireAlarmCount, data.treatedFireAlarmCount);
                bindDonutChart("CallThePoliceNumChart", data.untreatedCallThePoliceCount, data.treatedCallThePoliceCount);
                bindDonutChart("faultNumChart", data.untreatedFaultCount, data.treatedFaultCount);
            }

        });

    };


    SubPage.prototype.BindDeviceCount = function () {
        pageDataApi.QueryDeviceMonitorCountInfo(token, function (data) {
            $("#NbDeviceNum").text(data.nbDeviceSumCount);//NB设备总数
            $("#fireDeviceNum").text(data.nbDeviceFireAlarmCount);//火警设备数
            $("#faultDeviceNum").text(data.nbDeviceFaultCount);//故障设备数
            $("#OffLineDeviceNum").text(data.nbDeviceOffLineCount);//离线设备数
            $("#normalDeviceNum").text(data.nbDeviceNormalCount);//正常设备数
        });
    };

    SubPage.prototype._initHashChangedEvent = function () {

        var that = this;
        $(window).on("hashchange", function () {

            //that.BindDeviceCount();
            that.BindNotHandledEventDonutChart();

        });
    };


    //当前未处理事件
    SubPage.prototype.TodayDeviceUnEventData = function () {
        var that = this;
        that.table = table.render({
            elem: '#deviceUnEventDataElem',
            id: "deviceUnEventDataElem",
            data: [],
            page: false,
            autoSort: false,
            loading: false,
            cols: [
                [
                    { field: 'EventCategory', title: '所属单位名称', width: 230, unresize: true },
                    { field: 'DeviceName', title: '火警数量', width: 110, unresize: true },
                    { field: 'EntAddress', title: '报警数量', width: 110, unresize: true },
                    { field: 'OccurTime', title: '故障数量', width: 110, unresize: true }
                ]
            ]
        });

        table.on('sort(deviceUnEventDataElem)', function (obj) {
            //console.log(obj.field); //当前排序的字段名
            //console.log(obj.type); //当前排序类型：desc（降序）、asc（升序）、null（空对象，默认排序）
            //console.log(this); //当前排序的 th 对象


            // that._bindRoleTable();

            //layer.msg('服务端排序。order by ' + obj.field + ' ' + obj.type);
        });
    };


    //生成设备今日事件列表
    SubPage.prototype.TodayDeviceEventData = function () {

        var data = {
            "ID": "2a2cfa85-6ea7-4a48-8482-06d9a255431b"
            , "EntName": "宁浩发展二二分公司"
            , "DeviceName": "二二公司1号信息传输装置"
            , "EventCategory": "Fire"
            , "KeyPartName": "重点1643号部位"
            , "Status": "在线"
            , "OccurTime": "2018-11-09 08:24:56"
            , "Is_handled": 0
            , "EntAddress": "单位详细地址"
            , "BuildingName": "22号楼", "UitdName": "二二公司1号信息传输装置"
        };
        var that = this;
        that.table = table.render({
            elem: '#deviceEventDataElem',
            id: "deviceEventDataElem",
            data: [],
            page: false,
            autoSort: false,
            loading: false,
            cols: [
                [
                    { field: 'EventCategory', title: '类型', width: 100, unresize: true },
                    { field: 'DeviceName', title: '设备名称', width: 100, unresize: true },
                    { field: 'EntAddress', title: '状态', width: 110, unresize: true },
                    { field: 'OccurTime', title: '时间', width: 100, unresize: true },
                    { field: 'unt', title: '所属单位名称', width: 280, unresize: true },
                    { field: 'EntAddress', title: '操作', width: 140, unresize: true }
                ]
            ]
        });

        table.on('sort(deviceEventDataElem)', function (obj) {
            //console.log(obj.field); //当前排序的字段名
            //console.log(obj.type); //当前排序类型：desc（降序）、asc（升序）、null（空对象，默认排序）
            //console.log(this); //当前排序的 th 对象


            // that._bindRoleTable();

            //layer.msg('服务端排序。order by ' + obj.field + ' ' + obj.type);
        });
    };

    function HistoricalAlarmDialog() {
        $('#history').on('click', function () {
            layer.open({
                resize: false,
                type: 2,
                title: '历史警情信息',
                area: ["800px", "560px"],
                shade: [0.7, '#000'],
                content: "/pages/monitoring/nbdevice/historicalAlarmDialog.html",
                end: function () {
                    //that._bindTable();
                }
            });
        });
    }

    SubPage.prototype.testauto = function () {
        autoRefresh.autoRefresh(function () {
            console.log(Date.now().toString());
        }, 2000);
    }

    SubPage.prototype.init = function () {
        var that = this;
        this.NBdeviceMonthEventChart();
        this.TodayDeviceUnEventData();
        this.TodayDeviceEventData();
        this.BindNotHandledEventDonutChart();
        HistoricalAlarmDialog();
        this.BindDeviceCount();
        this._initHashChangedEvent();
        this.testauto();
        //this._initHashChangedEvent();
        //this._initOptEnt();
        //this._initBuilding();
        //this._initKeypart();
        //this._initTable();
        //this._initPager();
        //that._bindTable();
    };


    exports(MODULE_NAME, new SubPage());

});


