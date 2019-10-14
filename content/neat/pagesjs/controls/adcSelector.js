
layui.define(["jquery", 'element', 'form', 'table', 'laytpl' , 'layer', 'neat', 'neatNavigator', 'commonDataApi'], function (exports) {

    "use strict";
    var MODULENAME = "pageAdcSelector";

    var $ = layui.$;
    var form = layui.form;
    var laytpl = layui.laytpl;
    var layer = layui.layer;

    var neat = layui.neat;
    var commonDataApi = layui.commonDataApi;


    var PageAdcSelector = function () {

        var that = this;

        
        that.opt1Data = [];
        that.opt2Data = [];
        that.opt3Data = [];

        that.selectedOp1 = null;
        that.selectedOp2 = null;
        that.selectedOp3 = null;

        
    };

    //初始化行政区划数据
    PageAdcSelector.prototype.initData = function () {
        var that = this;
        commonDataApi.getADCList(neat.getUserToken(), function (resultData) {

            

            var opt1Data = [];
            var opt2Data = [];
            var opt3Data = [];

            $.each(resultData, function (_, item) {
                item.op1 = item.code.substring(0, 2);
                item.op2 = item.code.substring(2, 4);
                item.op3 = item.code.substring(4);

                if (item.op2 == "00" && item.op3 == "00") {
                    opt1Data.push(item); //省份数据
                }
                else if (item.op3 == "00") {
                    opt2Data.push(item); //市数据
                }else
                {
                    opt3Data.push(item); //区县数据
                }
            });
            that.adcListData = resultData;
            that.opt1Data = opt1Data;
            that.opt2Data = opt2Data;
            that.opt3Data = opt3Data;
            that.initOpt1();

        });
    };

    ///初始化省控件
    PageAdcSelector.prototype.initOpt1 = function () {

        

        var that = this;
        var d = {};
        d.data = that.opt1Data;
        laytpl($("#opt1Template").html()).render(d, function (html) {
            var parent = $("#opt1").html(html);
            form.render('select', 'opt1Form');
        });

        form.on("select(opt1)", function (data) {
            //console.log(data.elem); //得到select原始DOM对象
            //console.log(data.value); //得到被选中的值
            //console.log(data.othis); //得到美化后的DOM对象
            if (!that.selectedOp1 || that.selectedOp1.value !== data.value) {
                window.adcResult = null;
                that.selectedOp1 = data;
                that.selectedOp2 = null;
                that.selectedOp3 = null;
                that.bindOpt2();
                that.bindOpt3();
            }
        });

    };

    PageAdcSelector.prototype.getAdcDataByCode = function (code, targetArray) {


        //var result = undefined;
        for (var index in targetArray) {
            var item = targetArray[index];
            if (item.code === code)
                return item;
        }

    };

    //根据已有选择情况,获取市的数据
    PageAdcSelector.prototype.getOp2Data = function () {
        var that = this;
        if (that.selectedOp1 == null) {
            return [];
        }
        else {


            var op1Value = that.selectedOp1.value.substring(0, 2);

            var result = [];

            $.each(that.opt2Data, function (_, item) {
                if (item.op1 == op1Value) {
                    result.push(item);
                }

            });
            if (result.length === 0) {
                //特殊处理直辖市的情况
                var found = that.getAdcDataByCode(that.selectedOp1.value, that.opt1Data);
                if (found)
                {
                    result.push(found);
                }
               
            }

            return result;
        }

    };

    //根据已有选择情况,获取县区的数据
    PageAdcSelector.prototype.getOp3Data = function () {

        
        var that = this;
        if (that.selectedOp2 == null) {
            return [];
        }
        else {


            var op1Value = that.selectedOp2.value.substring(0, 2);
            var op2Value = that.selectedOp2.value.substring(2, 4);

            var result = [];

            $.each(that.opt3Data, function (_, item) {
                if (item.op1 == op1Value && (op2Value === "00" || item.op2 == op2Value)) {
                    result.push(item);
                }

            });


            return result;
        }

    };

    //初始化市控件
    PageAdcSelector.prototype.initOpt2 = function () {
        var that = this;

        form.on("select(opt2)", function (data) {
            //console.log(data.elem); //得到select原始DOM对象
            //console.log(data.value); //得到被选中的值
            //console.log(data.othis); //得到美化后的DOM对象

            if (!that.selectedOp2 || that.selectedOp2.value !== data.value) {
              
                that.selectedOp2 = data;
                window.adcResult = null;
                that.bindOpt3();
            }

           
        });

    };
    //给市控件绑定数据
    PageAdcSelector.prototype.bindOpt2 = function () {
        var that = this;
        var d = {};
        d.data = that.getOp2Data();
        laytpl($("#opt2Template").html()).render(d, function (html) {
            var parent = $("#opt2").html(html);
            form.render('select', 'opt2Form');
        });
    };


    //初始化区县控件
    PageAdcSelector.prototype.initOpt3 = function () {
        var that = this;
        

        form.on("select(opt3)", function (data) {
            //console.log(data.elem); //得到select原始DOM对象
            //console.log(data.value); //得到被选中的值
            //console.log(data.othis); //得到美化后的DOM对象
            that.selectedOp3 = data;
                     
            window.adcResult = { value: data.value, name: $(data.elem.options[data.elem.selectedIndex]).data("fullname") };
        });

    };

    //给县区控件绑定数据
    PageAdcSelector.prototype.bindOpt3 = function () {
        var that = this;
        var d = {};
        d.data = that.getOp3Data();
        laytpl($("#opt3Template").html()).render(d, function (html) {
            var parent = $("#opt3").html(html);
            form.render('select', 'opt3Form');
        });
    };

    //
    PageAdcSelector.prototype.init = function () {

        var that = this;

        this.initOpt3();
        this.initOpt2();

        this.initData();

    };





    exports(MODULENAME, new PageAdcSelector());

});