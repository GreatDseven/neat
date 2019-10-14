// 警情统计报表


layui.define(["jquery", 'element', 'form', 'laydate', 'table', 'laytpl', 'layer', 'neat', 'neatNavigator', 'commonDataApi', 'statDataApi', 'neatUITools', 'echarts', 'neatTools'], function (exports) {

    "use strict";

    var MODULE_NAME = "pageEventReport";

    var $ = layui.$;
    var table = layui.table;
    var form = layui.form;
    var laytpl = layui.laytpl;



    var neat = layui.neat;
    var laydate = layui.laydate;
    var neatNavigator = layui.neatNavigator;
    var commonDataApi = layui.commonDataApi;
    var pageDataApi = layui.statDataApi;
    var uiTools = layui.neatUITools;
    var neatTools = layui.neatTools;

    var echarts = layui.echarts;


    var finalDataPropertyNames = {
        name: "name",
        fireSys: "fireSys",
        waterSys: "waterSys",
        nbSys: "nbSys"
    };
    var dataItemPropertyNames = {
        name: "name",
        fireCount: "fireCount",
        alarmCount: "alarmCount",
        faultCount: "faultCount",
        misReportCount: "misReportCount",
        testReportCount: "testReportCount",
        notHandleCount: "notHandleCount"
    };

    var entInfoPropertyNames = {
        entName: "entName",
        address: "address",
        inChargePerson: "inChargePerson",
        mobilePhone: "mobilePhone"
    };


    // 把多个接口返回的数据 糅合成一个
    // 最终返回的是一个类{}
    // 结构如下 
    //var t = {
    //    entName: "",
    //    entAddress: "",
    //    entTel: "",
    //    reportUser: "",
    //    reportTime: "",
    //    reportData: [
    //        {
    //            name: "",
    //            fireSys: {
    //                fireCount: "0",
    //                alarmCount: "0",
    //                faultCount: "0",
    //                misReportCount: "0",
    //                testReportCount: "0",
    //                notHandleCount: "0"
    //            },
    //            waterSys: {
    //                fireCount: "0",
    //                alarmCount: "0",
    //                faultCount: "0",
    //                misReportCount: "0",
    //                testReportCount: "0",
    //                notHandleCount: "0"
    //            },
    //            nbSys: {
    //                fireCount: "0",
    //                alarmCount: "0",
    //                faultCount: "0",
    //                misReportCount: "0",
    //                testReportCount: "0",
    //                notHandleCount: "0"
    //            }
    //        }
    //    ]
    //};

    function makeEventReportData(fire, water, nb, ent, reportTime) {

        // 最终返回的结果


        var tmpResult = {};


        $.each(fire, function (_, item) {
            if (!(item.name in tmpResult)) {
                tmpResult[item[dataItemPropertyNames.name]] = {};
            }

            tmpResult[item[dataItemPropertyNames.name]][finalDataPropertyNames.fireSys] = item;
        });

        $.each(water, function (_, item) {
            if (!(item.name in tmpResult)) {
                tmpResult[item[dataItemPropertyNames.name]] = {};
            }

            tmpResult[item[dataItemPropertyNames.name]][finalDataPropertyNames.waterSys] = item;
        });
        $.each(nb, function (_, item) {
            if (!(item.name in tmpResult)) {
                tmpResult[item[dataItemPropertyNames.name]] = {};
            }

            tmpResult[item[dataItemPropertyNames.name]][finalDataPropertyNames.nbSys] = item;
        });

        var finalResult = [];

        $.each(tmpResult, function (name, value) {
            value.name = name;
            finalResult.push(value);
        });

        //按名称排序
        finalResult.sort(function (a, b) {
            return a.name < b.name ? -1 : 1;
        });


        //求和
        var sumRow = {};
        sumRow[finalDataPropertyNames.name] = "总计";
        sumRow[finalDataPropertyNames.fireSys] = {};
        sumRow[finalDataPropertyNames.waterSys] = {};
        sumRow[finalDataPropertyNames.nbSys] = {};
        $.each(finalResult, function (_, row) {

            $.each(dataItemPropertyNames, function (_, item) {
                if (item === dataItemPropertyNames.name)
                    return;

                sumRow[finalDataPropertyNames.fireSys][item] = (sumRow[finalDataPropertyNames.fireSys][item] || 0) + row[finalDataPropertyNames.fireSys][item];
                sumRow[finalDataPropertyNames.waterSys][item] = (sumRow[finalDataPropertyNames.waterSys][item] || 0) + row[finalDataPropertyNames.waterSys][item];
                sumRow[finalDataPropertyNames.nbSys][item] = (sumRow[finalDataPropertyNames.nbSys][item] || 0) + row[finalDataPropertyNames.nbSys][item];

            });
        });


        finalResult.push(sumRow);

        return {
            entName: ent[entInfoPropertyNames.entName],
            entAddress: ent[entInfoPropertyNames.address],
            entTel: ent[entInfoPropertyNames.mobilePhone],
            reportUser: neat.getCurrentUserInfo(),
            reportTime: reportTime,
            reportData: finalResult
        };


    }


    var SubPage = function () { };

    SubPage.prototype.init = function () {


        var that = this;

        this.initDefaultValues();

        this.initHashChangedEvent();

        this.initOptEnt();

        this.initReportType();

        this.ensureReportDateCtl();



        //按钮事件
        this.initGenerateEvent();
        this.initResetEvent();
        this.initExportExcelEvent();
        this.initExportPDFEvent();
        this.initExportEventDetailEvent();




        that.bindTable();
    };

    SubPage.prototype.initDefaultValues = function () {


        this.optEnt = "";
        this.optReportType = "week";

    };



    //初始化 单位列表
    SubPage.prototype.initOptEnt = function () {

        var that = this;

        form.on('select(optEnt)', function (data) {
            //console.log(data.elem); //得到select原始DOM对象
            //console.log(data.value); //得到被选中的值
            //console.log(data.othis); //得到美化后的DOM对象
            that.optEnt = data.value;


        });

        that.bindEnt();

    };
    //绑定 单位列表
    SubPage.prototype.bindEnt = function () {

        var that = this;
        var token = neat.getUserToken();
        var treeData = neatNavigator.getSelectedTreeNodeInfo();
        if (!treeData) {
            return;
        }



        that.optEnt = "";

        if (treeData.type == 2) {
            //选中的是企业节点
            var d = {};
            d.data = [{ id: treeData.enterpriseId, name: treeData.name }];
            that.optEnt = treeData.id;
            laytpl($("#optEntTemplate").html()).render(d, function (html) {

                var parent = $("#optEnt").html(html);
                form.render('select', 'optEntForm');
            });
        }
        else {
            commonDataApi.getEntByDomainId(token, treeData.domainId, function (resultData) {


                var d = {};
                d.data = resultData;
                if (resultData.length > 0) {
                    d.selectedValue = resultData[0].id;
                    that.optEnt = resultData[0].id;
                    that.bindTable();
                }
                laytpl($("#optEntTemplate").html()).render(d, function (html) {

                    var parent = $("#optEnt").html(html);
                    form.render('select', 'optEntForm');
                });


            });
        }
    };


    //初始化 报表类型
    SubPage.prototype.initReportType = function () {

        var that = this;

        form.on('select(optReportType)', function (data) {
            //console.log(data.elem); //得到select原始DOM对象
            //console.log(data.value); //得到被选中的值
            //console.log(data.othis); //得到美化后的DOM对象
            that.optReportType = data.value;


            that.ensureReportDateCtl();

        });
    };

    // 确认报表日期控件正常显示
    SubPage.prototype.ensureReportDateCtl = function () {

        var that = this;

        var dateCtlType = "date";
        switch (this.optReportType) {
            case "week":
                dateCtlType = "date";
                break;
            case "month":
                dateCtlType = "month";
                break;
            case "year":
                dateCtlType = "year";
                break;
        }

        if (that.reportDateCtl) {
            $("#txtDateCont").html(' <input type="text" id="txtDate" autocomplete="off" readonly class="layui-input">');
        }

        that.reportDateCtl = laydate.render({
            elem: '#txtDate', //指定元素
            type: dateCtlType,
            range: false,
            format: "yyyy-MM-dd",
            trigger: "click",
            min: "2018-1-1",
            max: 0,
            value: new Date()

        });



    };

    SubPage.prototype.bindTable = function () {

        var that = this;


        this.clearReport();
        this.clearChart();


        if (!this.optEnt) {


            return;
        }


        var dateTime = $("#txtDate").val();

        if (!dateTime) {
            return;
        }
        var token = neat.getUserToken();

        var loadingIndex = layui.layer.load(1);

        pageDataApi.generateEventReport(token, this.optEnt, this.optReportType, dateTime,
            function (totalData) {
                //成功
                layui.layer.close(loadingIndex);

                that.lastTableData = makeEventReportData(totalData.fire, totalData.water, totalData.nb, totalData.ent, totalData.reportDate);

                that.fillReportTable();


                that.lastFireChartData = that.processChartData(totalData.fire);
                that.lastWaterChartData = that.processChartData(totalData.water);
                that.lastNBChartData = that.processChartData(totalData.nb);


                that.createFireSysChart();

                that.createWaterSysChart();

                that.createNBSysChart();

            },
            function () { //失败
                layui.layer.close(loadingIndex);

            });



    };

    // 填充报表 表格
    SubPage.prototype.fillReportTable = function () {

        laytpl($("#reportTemplate").html()).render(this.lastTableData, function (html) {
            $("#reportTableCont").html(html);
        });

    };

    //清除报表
    SubPage.prototype.clearReport = function () {

        this.lastTableData = {
            entName: "",
            entAddress: "",
            entTel: "",
            reportUser: "",
            reportTime: "",
            reportData: [

            ]
        };

        this.fillReportTable();


    };

    SubPage.prototype.clearChart = function () {
        this.clearLastChartData(this.lastFireChartData);
        this.clearLastChartData(this.lastWaterChartData);
        this.clearLastChartData(this.lastNBChartData);


        this.createFireSysChart();
        this.createWaterSysChart();
        this.createNBSysChart();
    };

    SubPage.prototype.clearLastChartData = function (data) {

        if (!data)
            return;

        data.fireAlarmData = [];
        data.faultData = [];
        data.alarmData = [];

        var count = data.dayData.length;

        for (var i = 0; i < count; i++) {
            data.fireAlarmData[i] = 0;
            data.faultData[i] = 0;
            data.alarmData[i] = 0;

        }


    };

    //生成按钮事件
    SubPage.prototype.initGenerateEvent = function () {
        var that = this;
        $('#btnGenerate').on('click', function () {

            that.bindTable();
        });
    };

    //重置按钮事件
    SubPage.prototype.initResetEvent = function () {
        var that = this;
        $('#btnReset').on('click', function () {

            $("#txtDate").val("");
            that.clearReport();
            that.clearChart();
        });
    };

    //excel导出按钮事件
    SubPage.prototype.initExportExcelEvent = function () {
        var that = this;
        $('#btnExportExcel').on('click', function () {

            that.exportExcel();
        });
    };

    SubPage.prototype.exportExcel = function () {

        if (!this.optEnt) {
            return;
        }

        var dateTime = $("#txtDate").val();

        if (!dateTime) {
            return;
        }
        var token = neat.getUserToken();


        pageDataApi.exportEventReportToExcel(token, "1", this.optEnt, this.optReportType, dateTime, this.getExportReportFileName(".xls"));


    };

    //PDF导出按钮事件
    SubPage.prototype.initExportPDFEvent = function () {
        var that = this;
        $('#btnExportPDF').on('click', function () {

            that.exportPDF();
        });
    };

    SubPage.prototype.exportPDF = function () {

        if (!this.optEnt) {
            return;
        }

        var dateTime = $("#txtDate").val();

        if (!dateTime) {
            return;
        }
        var token = neat.getUserToken();


        pageDataApi.exportEventReportToExcel(token, "2", this.optEnt, this.optReportType, dateTime, this.getExportReportFileName(".pdf"));


    };

    SubPage.prototype.getExportReportFileName = function (ext) {

        var ent = $("#optEnt option:selected");
        var reportType = $("#optReportType  option:selected");

        var dateTime = $("#txtDate").val();
        if (reportType.val() == "week") {
            var mondayAndSonday = neatTools.getMondayAndSunday(dateTime);
            dateTime = mondayAndSonday[0] + "至" + mondayAndSonday[1];
        }
        var fileName = ent.text() + "-" + reportType.text() + "(" + dateTime + ")";

        if (ext) {
            fileName = fileName + ext;
        }

        return fileName;
    };

    SubPage.prototype.getExportReportDetailFileName = function () {

        var ent = $("#optEnt option:selected");
        var reportType = $("#optReportType  option:selected");

        var dateTime = $("#txtDate").val();
        if (reportType.val() == "week") {
            var mondayAndSonday = neatTools.getMondayAndSunday(dateTime);
            dateTime = mondayAndSonday[0] + "至" + mondayAndSonday[1];
        }
        var fileName = ent.text() + "-" + reportType.text() + "明细(" + dateTime + ")";
        return fileName;
    };

    //导出明细按钮事件
    SubPage.prototype.initExportEventDetailEvent = function () {
        var that = this;
        $('#btmExportDetail').on('click', function () {

            that.exportEventDetail();
        });
    };

    SubPage.prototype.exportEventDetail = function () {

        if (!this.optEnt) {
            return;
        }

        var dateTime = $("#txtDate").val();

        if (!dateTime) {
            return;
        }
        var token = neat.getUserToken();


        pageDataApi.exportEventDetailToExcel(token, this.optEnt, this.optReportType, dateTime, this.getExportReportDetailFileName());


    };

    SubPage.prototype.initHashChangedEvent = function () {



        var that = this;
        $(window).on("hashchange", function () {

            var treeData = neatNavigator.getSelectedTreeNodeInfo();
            if (!treeData) {
                return;
            }

            that.domainId = treeData.domainId;
            that.optEnt = treeData.enterpriseId;

            that.bindEnt();


            that.bindTable();

        });
    };


    // 基础chart选项
    SubPage.prototype.createChartBaseOption = function (xData, series) {
        var chartBaseOptionsTemplate = {
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    lineStyle: {
                        color: '#57617B'
                    }
                }
            },
            grid: {
                left: '25px',
                right: '40px',
                bottom: '10px',
                top: '20px',
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
                splitLine: {
                    show: true,
                    lineStyle: {
                        color: '#1d3764'
                    }
                },
                data: xData
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
            series: series
        };

        return chartBaseOptionsTemplate;
    };

    // 火警线
    SubPage.prototype.createFireAlarmSeries = function (data) {
        var fireAlarmSeriesTemplate = {
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
            data: data
        };

        return fireAlarmSeriesTemplate;
    };
    // 报警线
    SubPage.prototype.createAlarmSeries = function (data) {
        var alarmSeriesTemplate = {
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

            data: data
        };

        return alarmSeriesTemplate;
    };
    // 故障线
    SubPage.prototype.createFaultSeries = function (data) {
        var faultAlarmSeriesTemplate = {
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
            data: data,
        };

        return faultAlarmSeriesTemplate;
    };


    //创建 火警情曲线图 echart 图表
    SubPage.prototype.createFireSysChart = function () {
        var that = this;

        if (!that.lastFireChartData)
            return;

        var fireAlarmData = that.lastFireChartData.fireAlarmData;
        var alarmData = that.lastFireChartData.alarmData;
        var faultData = that.lastFireChartData.faultData;
        var dayData = that.lastFireChartData.dayData;


        if (!fireSysChart) {
            var fireSysChart = echarts.init(document.getElementById("fireSysChart"));

            var series1 = this.createFireAlarmSeries(fireAlarmData);

            var series2 = this.createAlarmSeries(alarmData);
            var series3 = this.createFaultSeries(faultData);

            var opt = this.createChartBaseOption(dayData, [series1, series2, series3]);

            fireSysChart.setOption(opt);

            this.fireSysChart = fireSysChart;

        } else {

            this.fireSysChart.setOption({
                xAxis: [{
                    data: dayData
                }],

                series: [{
                    name: '火警',
                    data: fireAlarmData
                }
                    , {
                        name: '报警',
                        data: alarmData
                    }
                    , {
                        name: '故障',
                        data: faultData
                    }]
            });
        }

    };



    //创建 水系统警情曲线图 echart 图表
    SubPage.prototype.createWaterSysChart = function () {
        var that = this;

        if (!that.lastWaterChartData)
            return;

        var alarmData = that.lastWaterChartData.alarmData;
        var faultData = that.lastWaterChartData.faultData;
        var dayData = that.lastWaterChartData.dayData;

        if (!waterSysChart) {
            var waterSysChart = echarts.init(document.getElementById("waterSysChart"));

            var series1 = this.createAlarmSeries(alarmData);

            var series2 = this.createFaultSeries(faultData);

            var opt = this.createChartBaseOption(dayData, [series1, series2]);


            waterSysChart.setOption(opt);

            this.waterSysChart = waterSysChart;
        }

        else {
            this.waterSysChart.setOption({
                xAxis: [{
                    data: dayData
                }],

                series: [
                    {
                        name: '报警',
                        data: alarmData
                    }, {
                        name: '故障',
                        data: faultData
                    }]
            });
        }
    };



    //创建 NB系统警情曲线图 echart 图表
    SubPage.prototype.createNBSysChart = function () {

        var that = this;

        if (!that.lastNBChartData)
            return;

        var fireAlarmData = that.lastNBChartData.fireAlarmData;
        var alarmData = that.lastNBChartData.alarmData;
        var faultData = that.lastNBChartData.faultData;
        var dayData = that.lastNBChartData.dayData;


        if (!this.nbSysChart) {

            var nbSysChart = echarts.init(document.getElementById("nbSysChart"));

            var series1 = this.createFireAlarmSeries(fireAlarmData);

            var series2 = this.createAlarmSeries(alarmData);

            var series3 = this.createFaultSeries(faultData);

            var opt = this.createChartBaseOption(dayData, [series1, series2, series3]);


            nbSysChart.setOption(opt);
            this.nbSysChart = nbSysChart;
        }
        else {
            this.nbSysChart.setOption({
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


    };


    //整理曲线图的数据
    SubPage.prototype.processChartData = function (data) {

        var faultData = [];
        var alarmData = [];
        var fireAlarmData = [];
        var dayData = [];


        for (var index in data) {
            var item = data[index];

            faultData.push(item[dataItemPropertyNames.faultCount]);
            alarmData.push(item[dataItemPropertyNames.alarmCount]);
            fireAlarmData.push(item[dataItemPropertyNames.fireCount]);
            dayData.push(item[dataItemPropertyNames.name]);
        }

        return {
            fireAlarmData: fireAlarmData,
            faultData: faultData,
            alarmData: alarmData,
            dayData: dayData
        };

    };


    exports(MODULE_NAME, new SubPage());

});