//水设备 历史数据页面


layui.define(['jquery', 'layer', 'form', 'laydate', 'element', 'laytpl', 'neat', 'electricalDeviceDataApi'
    , 'neatNavigator', 'echarts', 'neatTools', 'commonDataApi'], function (exports) {



        "use strict";
        var $ = layui.$;
        var MODULE_NAME = "pageElectricalDeviceHistoryData";

        var form = layui.form;

        var layer = layui.layer;

        var neat = layui.neat;
        var laydate = layui.laydate;

        var neatNavigator = layui.neatNavigator;

        var pageDataApi = layui.electricalDeviceDataApi;
        var neatTools = layui.neatTools;
        var echarts = layui.echarts;
        var commonDataApi = layui.commonDataApi;
        var laytpl = layui.laytpl;

        //存储通道信息的字典
        var channelDataDic = {};

        //获取chanell类型名称
        function initChannelDataDic() {
            var channelTypeConfig = commonDataApi.getElectricalDeviceChannelTypeConfigData();

            $.each(channelTypeConfig, function (_, item) {

                channelDataDic[item.id] = item;

            });
        }

        initChannelDataDic();

        //返回的数据的列名称



        var SubPage = function () {


            this.id = "";

            this.detailObj = {};
            this.chartObj = undefined;

            this.startDate = "";
            this.endDate = "";

        };

        //初始化
        SubPage.prototype.init = function () {
            var that = this;

            this.id = neatNavigator.getUrlParam("id");

            var now = new Date();

            //* 天以前 = 3天
            var startDate = new Date(new Date().valueOf() - 259200000);

            var nowStr = neatTools.dateToString(now);
            //*天以前当前时间的字符串标识.
            var startDateStr = neatTools.dateToString(startDate);
            // 今天的开始时间
            var todayStr = neatTools.getDatePartStr(nowStr);
            // 7天前的开始时间
            var startDateStart = neatTools.getDatePartStr(startDateStr);

            this.startDate = startDateStart + " 00:00:00";
            this.endDate = todayStr + " 23:59:59";

            this.initDate();

            this.queryChannel();






            form.render();

        };

        var dataPropertyNames = {
            occurTime: "occurTime",
            value: "value"

        };



        //查询通道列表
        SubPage.prototype.queryChannel = function () {

            if (this.startDate == "" || this.endDate == "") {
                layer.msg("请选择时间!");
                return;
            }
            var that = this;

            pageDataApi.getSettingsById(neat.getUserToken(), this.id, function (resultData) {
                if (resultData.totalCount == 0) {
                    layer.msg("无数据!");
                }
                //翻译通道类型
                $.each(resultData.componets, function (_, item) {
                    var ch = channelDataDic[item["analogueType"]];
                    item.typeName = ch.name + "(" + ch.unit + ")";//+"[" + ch.min + " - " + ch.max+"]";
                });

                var tmpl = '{{#  layui.each(d.data, function(index, item){}}'
                + '<button class="layui-btn" style="margin:0px 10px 10px 0px;"  data-cid="{{item.id}}" >通道{{item.code}}-{{item.typeName}}</button>'
                + '{{#  }); }}';

                var d = {};
                d.data = resultData.componets;

                var html = laytpl(tmpl).render(d);

                $("#channeldiv").html(html);

                that.getData(d.data[0].id);

                $("#channeldiv").find(".layui-btn").on("click", function (s, e) {
                    var channelId = $(this).data("cid");
                    that.getData(channelId);
                });
            });
        };
        //变换按钮颜色
        SubPage.prototype.changeButton = function (channelId) {
            $("#channeldiv").find(".layui-btn").toggleClass("layui-btn-normal", false);
            $("#channeldiv").find(".layui-btn[data-cid='" + channelId + "']").toggleClass("layui-btn-normal", true);
        }

        SubPage.prototype.getData = function (channel) {
            if (this.startDate == "" || this.endDate == "") {
                layer.msg("请选择时间!");
                return;
            }
            var that = this;
            this.changeButton(channel);
            pageDataApi.getCompnetHistroyDataById(neat.getUserToken(), channel, this.startDate, this.endDate
                , function (resultData) {
                    if (resultData == null || resultData.length == 0) {
                        layer.msg("无数据!");
                        return;
                    }

                    var yData = [];

                    var xData = [];

                    layui.each(resultData, function (_, item) {
                        yData.push(item.y);
                        xData.push(neatTools.shortenTimeStr(item.x));
                    });

                    that.createChart(yData, xData);

                }
                , function (fd) {
                    if (typeof fd.message === "string") {
                        layer.msg(fd.message);
                    }
                    else {
                        //layer.msg("查询失败!");
                    }
                });
        }

        SubPage.prototype.createChart = function (yData, xData) {
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
                    left: '30px',
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
                series: [
                    {
                        name: '历史数据',
                        type: 'line',
                        smooth: true,
                        symbol: 'circle',

                        symbolSize: 2,

                        showSymbol: false,

                        lineStyle: {
                            normal: {
                                width: 1,
                                color: "#00A0E9",
                                opacity: 0.3
                            }
                        },

                        areaStyle: {
                            normal: {
                                color: new echarts.graphic.LinearGradient(0, 1, 0, 0, [{
                                    offset: 0,
                                    color: 'rgba(0, 160, 233, 0.1)'
                                }, {
                                    offset: 1,
                                    color: 'rgba(0, 160, 233, 0.6)'
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

                        data: yData
                    }

                ]
            };

            this.chartObj = echarts.init($("#historyDataChart")[0]);


            if (option) {
                this.chartObj.setOption(option);
            }

        };




        //关闭对话框
        SubPage.prototype._closeDialog = function () {
            var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
            parent.layer.close(index); //再执行关闭
        };

        //初始化两个日期控件
        SubPage.prototype.initDate = function () {

            var sepStr = " ~ ";

            var that = this;
            var defaultValue = this.startDate + sepStr + this.endDate;

            function splitDateTimeSpan(str) {
                return str.split(sepStr);
            }

            laydate.render({
                elem: '#dateSpan', //指定元素
                type: 'datetime',
                range: "~",
                format: "yyyy-MM-dd",
                value: defaultValue,
                done: function (value, startDate, endDate) {

                    //console.log(value); //得到日期生成的值，如：2017-08-18
                    //console.log(startDate); //得到日期时间对象：{year: 2017, month: 8, date: 18, hours: 0, minutes: 0, seconds: 0}
                    //console.log(endDate); //得结束的日期时间对象，开启范围选择（range: true）才会返回。对象成员同上。
                    var values = splitDateTimeSpan(value);
                    that.startDate = values[0];
                    that.endDate = values[1];
                    var channel = $("#channeldiv").find(".layui-btn-normal").attr("data-cid");
                    that.getData(channel);

                },
                trigger: "click"

            });

        };

        exports(MODULE_NAME, new SubPage());

    });