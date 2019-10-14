
//平面图 查看页面
layui.define(["jquery", 'element', 'form','layer', 'laytpl', 'neat', 'neatNavigator', 'commonDataApi', 'imageDataApi', 'treeview', 'neatUITools', 'tooltipster'], function (exports) {

    "use strict";

    var MODULE_NAME = "pagePlanImgLayoutViewByEnterpriseId";



    var $ = layui.$;

    var laytpl = layui.laytpl;

    var neat = layui.neat;

    var neatNavigator = layui.neatNavigator;

    var pageDataApi = layui.imageDataApi;

    var uiTools = layui.neatUITools;

    var form = layui.form;

    layui.tooltipster();

    // 加载树接口返回的
    var treeNodePropertyNames = {
        id: "id",
        name: "text",
        type: "nodeType"
    };

    //树节点类型
    var enumTreeNodeType = {
        enterprise: "1",
        building: "2",
        keypart: "3",
        planImg: "10"
    };

    // 平面图信息
    var planImagePropertyNames = {
        planUrl:"planUrl",
        planName: "planName",
        devices: "result"
    };

    // 设备信息
    var deviceInfoPropertyNames = {
        deviceId: "deviceId",
        name: "deviceName",
        deviceType: "deviceType",
        statusTime: "statusTime",
        status: "flag",
        statusDesc: "alarmDesc",
        componentType:"componentType",
        x:"posX",
        y: "posY",
       

        imageUrl:"imageUrl", //这个是自己添加的
    };

    //设备状态
    var enumDeviceStatus = {
        ok: "ok",
        fault: "fault",
        fire: "fire",
        alarm:"alarm"
    };

    var SubPage = function () {
        this.initDefaultValues();
    };




    

    // 初始化数据
    SubPage.prototype.init = function () {

        var that = this;




        this.initDefaultValues();

 

        this.deviceId = neatNavigator.getUrlParam("device_id");
        this.enterpriseId = neatNavigator.getUrlParam("enterprise_id");

        this.initShowAllChangeEvent();
       

        this.draw = SVG('#svgBackgroundImg').panZoom();
        // 缩放之前的方法
        this.draw.on('zoom', function (e) {
            //console.log("zoom");
            that.repositionTooltip();
        });




        this.draw.on('panEnd', function (e) {
            //console.log("panEnd");
            that.repositionTooltip();
        });
        this.draw.on('pinchZoomEnd', function (e) {
            //console.log("pinchZoomEnd");
            that.repositionTooltip();
        });
       
        this.buildTree();

    };




    SubPage.prototype.repositionTooltip = function () {
        var ins = $.tooltipster.instances();

        $.each(ins, function (_, item) {
            var status = item.status();
            //console.log(JSON.stringify(status));
            if (status.state == "stable") {
                item.reposition();
            }
        });
    };

    SubPage.prototype.closeTooltip = function () {
        var ins = $.tooltipster.instances();

        $.each(ins, function (_, item) {
            item.close();
        });
    };

    //初始化默认值
    SubPage.prototype.initDefaultValues = function () {

        this.backgroundRect = null;
        this.rectShowDeviceNameText = null;
        this.signalNameRec = "";
        this.deviceId = '';
        this.enterpriseId = "";
        this.draw = null;
        this.needShowAll = false;
    };

    // 绑定左侧树
    SubPage.prototype.buildTree = function () {
        var that = this;

  
        var token = neat.getUserToken();

        // 获取 平面图左侧树
        pageDataApi.getReleatedPlanImgListByEntId(token, this.enterpriseId,  function (data) {


            if (data.result.length == 0) {
                layer.msg("无相关平面图信息!", function () {
                    that.closeDialog();
                });
                return;
            }

            $("#enterpriseName").html(data["enterpriseName"]);

            // 加载树
            var mytree = $('#treeview').treeview({
                levels: 4,
                data: data.result,
                onNodeSelected: function (event, node) {

        
                    if (node[treeNodePropertyNames.type] != enumTreeNodeType.planImg) {
                        //选择的不是平面图,清空右侧的平面图
                        that.clearOldImg();
                    }
                    else {
                        //根据treeNode的id加载平面图相关的设备列表
                       
                        that.loadPlanImgeDetail(node[treeNodePropertyNames.id]);

                      
                    }


                }
            });

            var treeIns = $('#treeview').data('treeview');
            //nodeType: 10
            var planImgNodes = treeIns.findNodes(enumTreeNodeType.planImg, 'g', 'nodeType');

            if (planImgNodes.length > 0) {

                treeIns.selectNode(planImgNodes[0]);

            }
           

        }, function (error) {
                layer.msg("获取平面图失败!", function () {
                    that.closeDialog();
                });
        });
    };

    //关闭对话框
    SubPage.prototype.closeDialog = function () {
        var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
        parent.layer.close(index); //再执行关闭
    };

    // 清除掉原来的图片
    SubPage.prototype.clearOldImg = function () {
        if (this.panImage) {
            this.panImage.remove();
            this.panImage = null;
        }

        layer.closeAll(); //关闭所有的tips层  


        //销毁 原有的tooltip实例
        var ins = $.tooltipster.instances();

        $.each(ins, function (_, item) {
            item.destroy();
        });

        $(".device").remove();
    };

    // 加载 左侧点击树节点代表的平面图以及向关联的设备
    SubPage.prototype.loadPlanImgeDetail = function (id) {

        var that = this;

        var token = neat.getUserToken();
        // 获取 一张平面图和相应的数据
        pageDataApi.getDevicesByPlanId(token, id
            , function (data) {

                // 加载图纸
                that.loadPlanImage(data[planImagePropertyNames.planUrl]);

                // 加载已关联的设备
                that.renderDevieList(data[planImagePropertyNames.devices]);

            }, function (data) {
                //加载失败
            });
    };


    // 加载图纸
    SubPage.prototype.loadPlanImage = function (imageURL) {
        var that = this;

        this.clearOldImg();

        // 加载图纸
        this.panImage = that.draw.image(imageURL);
        this.panImage.attr({ width: 1000, height: 680 });


       

        //// 创建红色背景方块
        //var rect = that.draw.rect(28, 28);
        //rect.attr({ id: "recTemp", fill: "Red", opacity: 0 });
        //rect.draggable();
        //that.backgroundRect = rect;

        //// 创建显示设备名称的对话框
        //var rectShowDeviceNameText = that.draw.text("");

        //rectShowDeviceNameText.attr({ id: "showDeviceName", fill: "Red" });
        //that.rectShowDeviceNameText = rectShowDeviceNameText;
    };


    // 渲染设备列表
    SubPage.prototype.renderDevieList = function (deviceList) {

        var that = this;

        if (deviceList.length == 0) {
            layer.msg("平面图尚未布点!");
            return;
        }



        //所有的火警状态的设备
        var fireStatusDevice = [];

        $.each(deviceList, function (index, item) {

            if (item[deviceInfoPropertyNames.status] == enumDeviceStatus.fire) {
                fireStatusDevice.push(item);
            }
            else {
                item[deviceInfoPropertyNames.imageUrl] = that.getDeviceImageUrl(item[deviceInfoPropertyNames.deviceType]
                    , item[deviceInfoPropertyNames.status]
                    , item[deviceInfoPropertyNames.componentType]
                    , undefined);
            }

        });

        // 对火警状态的设备排序
        var sortFireDevice = function (a, b) {
            return a[deviceInfoPropertyNames.statusTime] > b[deviceInfoPropertyNames.statusTime] ? 1 : -1;
        };

        fireStatusDevice.sort(sortFireDevice);


        $.each(fireStatusDevice, function (index, item) {

            if (index < 2) { //按时间升序排序,前两个使用不同的图片,其他的使用相同的图片
                item[deviceInfoPropertyNames.imageUrl] = that.getDeviceImageUrl(item[deviceInfoPropertyNames.deviceType]
                    , item[deviceInfoPropertyNames.status]
                    , item[deviceInfoPropertyNames.componentType]
                    , index + 1);
            }
            else {
                item[deviceInfoPropertyNames.imageUrl] = that.getDeviceImageUrl(item[deviceInfoPropertyNames.deviceType]
                    , item[deviceInfoPropertyNames.status]
                    , item[deviceInfoPropertyNames.componentType]
                    , 3);
            }

        });
        $.each(deviceList, function (index, item) {

            that.addDeviceToImg(item);
        });

        this.initTooltip();
    };

    //初始化tooltip
    SubPage.prototype.initTooltip = function () {

        $('.device').tooltipster({
            theme: 'tooltipster-punk',
            'maxWidth': 270, // set max width of tooltip box
            contentAsHTML: true, // set title content to html
            trigger: 'custom', // add custom trigger
            arrow: true,
            triggerOpen: { // open tooltip when element is clicked, tapped (mobile) or hovered
                click: true,
                tap: true,
                mouseenter: true
            },
            triggerClose: { // close tooltip when element is clicked again, tapped or when the mouse leaves it
                click: false,
                scroll: true, // ensuring that scrolling mobile is not tapping!
                tap: true,
                mouseleave: true
            }
        });

        setTimeout(function () {
            $('.current-device').tooltipster('open');
        }, 1000);
       

    };

    // 把设备渲染到平面图中
    SubPage.prototype.addDeviceToImg = function (deviceInfo) {
        var that = this;

        var className = "device";
        var id = deviceInfo[deviceInfoPropertyNames.deviceId];
        if (id == this.deviceId) {
            className = "device current-device";
        }

      

        var deviceLayoutImg = that.draw.image(deviceInfo[deviceInfoPropertyNames.imageUrl], 22, 22);

        var config = {
            x: deviceInfo[deviceInfoPropertyNames.x]
            , y: deviceInfo[deviceInfoPropertyNames.y]
           
            , title: "<span class='highlight-white-text'>" + deviceInfo[deviceInfoPropertyNames.name] + "</span>"
        };



        var isNormalDevice = this.getDeviceIsNormalDevice(deviceInfo[deviceInfoPropertyNames.status]);

        if (isNormalDevice){
            className += " normal-device";
        } else {
            className += " abnormal-device";
        }

        config.class = className;

        if (this.needShowAll == false && isNormalDevice) {
            config.style = "display: none;";
        }

        deviceLayoutImg.attr(config);
    };

    // 返回设备图片是否需要显示.
    SubPage.prototype.getDeviceIsNormalDevice = function (status) {

        if (status == "none" || status == "" || status == "ok") {
            return true;
        }
        else {
            return false;
        }
    };

    // 获取 设备 tooltip信息
    SubPage.prototype.getDeviceTooltip = function (deviceInfo) {

        
        var d = {
            name: deviceInfo[deviceInfoPropertyNames.name],
            status: uiTools.renderDeviceAlarmStatusByWord(deviceInfo[deviceInfoPropertyNames.status]),
            statusDesc: deviceInfo[deviceInfoPropertyNames.statusDesc],
            statusTime: deviceInfo[deviceInfoPropertyNames.statusTime]
        };

        return laytpl($("#toolTipTemplate").html()).render(d);

    };

    // 获取 设备的图片的地址
    SubPage.prototype.getDeviceImageUrl = function (deviceType, status,componentTypeType,extra) {

       
        var addFileName = function (name1 ) {
            var result = "/content/neat/images/planImg/";

            if (name1) {
                result += name1;
            }
            if (status && status != "ok" && status != "none") {
                result += "-" + status;
            }
            if (extra) {
                result += "-" + extra;
            }
            return result + ".png";
        };

        
        var imageURL = "";
        switch (deviceType) {
            // 传输设备
            case 1:
                imageURL = addFileName("uitd");
                break;
            // NEAT水设备
            case 2:
                imageURL = addFileName("wgw");
                break;
            // 一体式水源监测
            case 3:
                imageURL = addFileName("wgw");
                break;
            // NB设备
            case 6:
                imageURL = addFileName("nbgy");
                break;
            // 视频设备
            case 7:
                imageURL = addFileName("video");
                break;
            // 火主机
            case 101:
                imageURL = addFileName("firehost");
                break;
            // 火器件
            case 102:
                // 手报
                if (componentTypeType == 61) {
                    imageURL = addFileName("firealarmbutton");
                } else if (componentTypeType == 21) {
                    imageURL = addFileName("nbgy");
                } else {
                    // 默认
                    imageURL = addFileName("uitd");
                }
                break;
            // 水信号
            case 201:
                imageURL = addFileName("watersignal");
                break;
            // 视频通道
            case 701:
                imageURL = addFileName("video");
                break;
            // 默认
            default:
                imageURL = addFileName("uitd");
                break;
        }

        return imageURL;
    };

    // 显示所有还是显示异常器件
    SubPage.prototype.initShowAllChangeEvent = function () {

        var that = this;

        $("#btnShowHidenNormalDevice").on("click", function () {


            that.needShowAll = !that.needShowAll;

            $('.normal-device').each(function () {

        
                if (that.needShowAll) {
                    this.instance.show();
                }
                else {
                    this.instance.hide();
                }

            });

        });
    };


    exports(MODULE_NAME, new SubPage());
});
