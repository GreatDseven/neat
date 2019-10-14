//neat水信号 添加页面


layui.define(['jquery', 'layer', 'form', 'laytpl', 'element', 'table', 'neat', 'waterDeviceDataApi', 'neatNavigator', 'commonDataApi','neatValidators'], function (exports) {



    "use strict";
    var $ = layui.$;
    var MODULE_NAME = "pageNEATWaterSignalCreate";

    var form = layui.form;
    var laytpl = layui.laytpl;

    var layer = layui.layer;

    var neat = layui.neat;

    var neatNavigator = layui.neatNavigator;

    var commonDataApi = layui.commonDataApi;

    var pageDataApi = layui.waterDeviceDataApi;

    var validators = layui.neatValidators;


    var SubPage = function () {

  
        this.gatewayId = "";
        this.gatewayName = "";
        this.gatewayCode = "";

        this.signalValueType = "YC";

        //模拟量的设备类型, 液压还是液位
        this.ycDeviceType = "1";


        this.hl2AlarmFlag = false;
        this.hl1AlarmFlag = false;
        this.ll1AlarmFlag = false;
        this.ll2AlarmFlag = false;
    };




    //关闭对话框
    SubPage.prototype.closeDialog = function () {
        var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
        parent.layer.close(index); //再执行关闭
    };


    SubPage.prototype.initVerify = function () {
        var that = this;
        //自定义验证规则
        form.verify({
            txtSignalCode: function (value) {
                if (value.length === 0) {
                    return "请输入信号编码";
                } 
                var vr = validators.validateNEATWaterSignalCode(value);
                if (vr !== "") {
                    return "信号编码错误,格式如下:00.01.01.0#,其中#为1-7的数字";
                }
            },
            txtSignalName: function (value) {
                if (value.length === 0) {
                    return "请输入信号名称";
                }
                else if (value.length > 64) {
                    return "信号名称超长";
                }
            },

            //optService: function (value) {
            //    if (value.length === 0) {
            //        return "请选择所属服务";
            //    }
            //},

            txtAddr: function (value) {
                if (value.length === 0) {
                    return "请输入安装位置";
                } else if (value.length > 64) {
                    return "安装位置超长";
                }
            }

            //数字量
            , txtTrueLabel: function (value) {
                if (that.signalValueType == "YC")
                    return;
                if (value.length === 0) {
                    return "请输入真值(1)含义";
                } else if (value.length > 64) {
                    return "真值(1)含义超长";
                }
            }
            , txtFalseLabel: function (value) {
                if (that.signalValueType == "YC")
                    return;
                if (value.length === 0) {
                    return "请输入假值(0)含义";
                } else if (value.length > 64) {
                    return "假值(0)含义超长";
                }
            }
            //模拟量

            , optDeviceType: function (value) {
                if (that.signalValueType == "YX")
                    return;
                if (value.length === 0) {
                    return "请选择设备类型";
                }
            }
            , optUnit: function (value) {
                if (that.signalValueType == "YX")
                    return;
                if (value.length === 0) {
                    return "请选择单位";
                }
            }
             , txtMaxValue: function (value) {
                 if (that.signalValueType == "YX")
                     return;
                 if (value.length === 0) {
                     return "请输入阈值上限";
                 }
                 var v = parseFloat(value)
                 if (isNaN(v) || v < 0 || v.toString() !== value) {
                     return "阈值上限错误";
                 }
                
             }
            , txtMinValue: function (value) {
                if (that.signalValueType == "YX")
                    return;
                if (value.length === 0) {
                    return "请输入阈值下限";
                }
                var v = parseFloat(value);
                if (isNaN(v) || v < 0 || v.toString() !== value) {
                    return "阈值下限错误";
                }

            }
            , txtHL2AlarmValue: function (value) {
                 if (that.signalValueType == "YX")
                    return;

                 if (!that.hl2AlarmFlag ) {
                     return;
                 }
                
                 if (value.length === 0) {
                     return "请输入【上上限】报警值";
                 }
                var v = parseFloat(value); 
                 if (isNaN(v) || v < 0 || v.toString() !== value) {
                     return "【上上限】报警值错误";
                 }

            }
              , txtHL1AlarmValue: function (value) {
                  if (that.signalValueType == "YX")
                      return;



                  if (!that.hl1AlarmFlag) {
                      return;
                  }

                  if (value.length === 0) {
                      return "请输入【上限】报警值";
                  }
                  var v = parseFloat(value);
                  if (isNaN(v) || v < 0 || v.toString() !== value) {
                      return "【上限】报警值错误";
                  }

              }
            , txtLL1AlarmValue: function (value) {
                if (that.signalValueType == "YX")
                    return;

                if (!that.ll1AlarmFlag) {
                    return;
                }

                if (value.length === 0) {
                    return "请输入【下限】报警";
                }
                var v = parseFloat(value);
                if (isNaN(v) || v < 0 || v.toString() !== value) {
                    return "【下限】报警值错误";
                }

            }, txtLL2AlarmValue: function (value) {
                if (that.signalValueType == "YX")
                    return;

                if (!that.ll2AlarmFlag) {
                    return;
                }

                if (value.length === 0) {
                    return "请输入【下下限】报警";
                }
                var v = parseFloat(value);
                if (isNaN(v) || v < 0 || v.toString() !== value) {
                    return "【下下限】报警值错误";
                }

            }
        });
    };

    

    SubPage.prototype.initSave = function () {

        var that = this;

        form.on('submit(btnSave)', function (formData) {


            var data = {

                gatewayID: that.gatewayId,
                code : $.trim(formData.field.txtSignalCode),
                name : $.trim(formData.field.txtSignalName),
                systemCode : "00.01",
                address: $.trim(formData.field.txtAddr)
            };

            var methodName = "";

            if (that.signalValueType == "YC") {

                methodName = "createNEATYCWaterSignal";

                var maxValue = parseFloat(formData.field.txtMaxValue);
                var minValue = parseFloat(formData.field.txtMinValue);

                if (minValue >= maxValue) {
                    layer.msg("阈值上限/阈值下限错误!");
                    return;
                }


                data.deviceType =formData.field.optDeviceType;
                data.unit =formData.field.optUnit;
                data.maxValue =maxValue;
                data.minValue = minValue;

                if (formData.field.hl2AlarmFlag == "on") {
                    data.hL2Value = parseFloat($.trim(formData.field.txtHL2AlarmValue));
                }

                if (formData.field.hl1AlarmFlag == "on") {
                    data.hL1Value = parseFloat($.trim(formData.field.txtHL1AlarmValue));
                }

                if (formData.field.ll1AlarmFlag == "on") {
                    data.lL1Value = parseFloat($.trim(formData.field.txtLL1AlarmValue));
                }
                
                if (formData.field.ll2AlarmFlag == "on") {
                    data.lL2Value = parseFloat($.trim(formData.field.txtLL2AlarmValue));
                }
                if (data.hL2Value) {
                    if (data.hL1Value && data.hL2Value <= data.hL1Value) {
                        layer.msg("【上上限】报警值 应 大于 【上限】报警值!");
                        return;
                    }

                    if (data.lL1Value && data.hL2Value <= data.lL1Value) {
                        layer.msg("【上上限】报警值  应 大于【下限】报警值!");
                        return;
                    }

                    if (data.lL2Value && data.hL2Value <= data.lL2Value) {
                        layer.msg("【上上限】报警值 应 大于【下下限】报警值!");
                        return;
                    }
                }
                if (data.hL1Value) {
                   

                    if (data.lL1Value && data.hL2Value <= data.lL1Value) {
                        layer.msg("【上限】报警值  应 大于【下限】报警值!");
                        return;
                    }

                    if (data.lL2Value && data.hL2Value <= data.lL2Value) {
                        layer.msg("【上限】报警值 应 大于【下下限】报警值!");
                        return;
                    }
                }
                if (data.lL1Value) {

                    if (data.lL2Value && data.hL2Value <= data.lL2Value) {
                        layer.msg("【下限】报警值 应 大于【下下限】报警值!");
                        return;
                    }
                }
                
            } else {
                methodName = "createNEATYXWaterSignal";
                data.trueLabel=$.trim(formData.field.txtTrueLabel);
                data.falseLabel=$.trim(formData.field.txtFalseLabel);

                if (formData.field.trueAlarmFlag == "on") {
                    data.trueAlarm = true;
                }
                else {
                    data.trueAlarm = false;
                }

                if (formData.field.falseAlarmFlag == "on") {
                    data.falseAlarm = true;
                }
                else {
                    data.falseAlarm = false;
                }
            }
 
            var token = neat.getUserToken();

            $("#btnSave").attr("disabled", true);

            pageDataApi[methodName](token, data
                , function (sd) {

                    layer.msg("保存成功!", { time: 1500 }, function () {

                        that.closeDialog();

                    });
                }, function (fd) {

                    $("#btnSave").attr("disabled", false);

                    if (typeof fd.message === "string") {
                        layer.msg(fd.message);
                    }
                    else {
                        layer.msg("保存失败!");
                    }
                });

            return false;
        });
    };


    // 绑定液压/液位
    SubPage.prototype.bindDeviceType = function () {

       
        commonDataApi.getDeviceTypeData(neat.getUserToken(),  function (resultData) {
            var d = {};
            d.data = resultData;
            laytpl($("#optDeviceTypeTemplate").html()).render(d, function (html) {
                var parent = $("#optDeviceType").html(html);
                form.render('select', 'optDeviceTypeForm');
            });
        });
        
    };

    //初始化信号类型选择改变事件 模拟量/信号量 
    SubPage.prototype.initSignalValueTypeChangeEvent = function () {
        var that = this;
        form.on("radio(signalValueType)", function (data) {

            that.signalValueType = data.value;

            if (that.signalValueType === "YX") {
                $("#ycconfig").hide();
                $("#yxconfig").show();
            }
            else {
                $("#yxconfig").hide();
                $("#ycconfig").show();
            }

        });

    };


    //设备类型选择改变事件  液压/液位/温度 改变
    SubPage.prototype.initYCSignalDeviceTypeChanageEvent = function () {
        var that = this;
        form.on("select(optDeviceType)", function (data) {

            that.ycDeviceType = data.value;
            that.bindYCUnitList();
        });

    };

    //绑定模拟量单位列表
    SubPage.prototype.bindYCUnitList = function () {

        var that = this;

        if (that.ycDeviceType === "") {
            that.fillYCUnitList([]);
        }
        else {

            //根据企业的id获取建筑列表,然后绑定到select中.
            commonDataApi.getUnitListByDeviceType(neat.getUserToken(), that.ycDeviceType, function (resultData) {
                that.fillYCUnitList(resultData);
            });
        }
    };

    //为模拟量单位列表填充数据
    SubPage.prototype.fillYCUnitList = function (data) {
        var that = this;
        var d = {};
        d.data = data;
        laytpl($("#optUnitTemplate").html()).render(d, function (html) {
            var parent = $("#optUnit").html(html);
            form.render('select', 'optUnitForm');

            that.fillUnitLables();
        });
    };

    //单位 选择改变
    SubPage.prototype.initYCUnitChangeEvent = function () {
        var that = this;
        form.on("select(optUnit)", function (data) {
            that.fillUnitLables();
        });

    };

    SubPage.prototype.fillUnitLables = function () {
        var checkText = $("#optUnit").find("option:selected").text()
        $("label[name='unitLabel']").html(checkText);
    };

    // 模拟量配置时使用.
    // 不勾选时,禁用后面的texbox,勾选时,启用后面的texbox
    SubPage.prototype.initChangeDisableStateEvent = function () {

        var that = this;
        function changeState(data, id) {

            if (data.elem.checked) {
                
                $("#" + id).val("");
                $("#" + id).removeAttr("disabled");
                $("#" + id).toggleClass("layui-disabled", false);
            }
            else {
                $("#" + id).val("");
                $("#" + id).attr("disabled", true);
                $("#" + id).toggleClass("layui-disabled", true);
            }
        }


        form.on("checkbox(hl2AlarmFlag)", function (data) {
            //console.log(data.elem); //得到checkbox原始DOM对象
            //console.log(data.elem.checked); //是否被选中，true或者false
            //console.log(data.value); //复选框value值，也可以通过data.elem.value得到
            //console.log(data.othis); //得到美化后的DOM对象
            
            that.hl2AlarmFlag = data.elem.checked;
            changeState(data, "txtHL2AlarmValue");
            
        });
        form.on("checkbox(hl1AlarmFlag)", function (data) {
            that.hl1AlarmFlag = data.elem.checked;
            changeState(data, "txtHL1AlarmValue");
        });
        form.on("checkbox(ll1AlarmFlag)", function (data) {
            that.ll1AlarmFlag = data.elem.checked;
            changeState(data, "txtLL1AlarmValue");
        });
        form.on("checkbox(ll2AlarmFlag)", function (data) {
            that.ll2AlarmFlag = data.elem.checked;
            changeState(data, "txtLL2AlarmValue");
        });
    };

    //初始化
    SubPage.prototype.init = function () {
        var that = this;

        this.gatewayId = neatNavigator.getUrlParam("gateway_id");
        this.gatewayName = neatNavigator.getUrlParam("gateway_name");
        this.gatewayCode = neatNavigator.getUrlParam("gateway_code");

        $("#txtGatewayCode").val(this.gatewayCode);
        $("#txtGatewayName").val(this.gatewayName);

        $("#txtSignalCode").val("00.01.01.0").focus();


        //初始化设备类型 液压 /液位
        this.bindDeviceType();

        //初始化信号类型选择改变事件 模拟量/信号量 
        this.initSignalValueTypeChangeEvent();

        //初始化 设备类型选择改变事件 液压/液位/温度 改变
        this.initYCSignalDeviceTypeChanageEvent();

        //挑勾 改变控件可用不可用
        this.initChangeDisableStateEvent();

        //单位 选择改变
        this.initYCUnitChangeEvent();

        //绑定单位
        this.bindYCUnitList();

        this.initVerify();

        this.initSave();



        $("#btnCancel").on("click", function () {
            that.closeDialog();
        });


       
        form.render();

    };




    exports(MODULE_NAME, new SubPage());

});