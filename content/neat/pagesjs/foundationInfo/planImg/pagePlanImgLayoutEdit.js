//平面图页面
layui.define(["jquery", 'element', 'form', 'table', 'laytpl', 'laypage', 'layer', 'neat', 'neatNavigator', 'commonDataApi', 'imageDataApi', 'treeview', 'tooltipster'], function (exports) {

    "use strict";

    var MODULE_NAME = "pagePlanImgLayoutEdit";

    var $ = layui.jquery;
    var form = layui.form;
    var neat = layui.neat;
    var neatNavigator = layui.neatNavigator;
    var pageDataApi = layui.imageDataApi;
    var tree = layui.treeview;

    layui.tooltipster;


    var SubPage = function () {
        this.backgroundRect = null;
        this.signalNameRec = "";
        this.id = '';
        this.draw = SVG('#svgBackgroundImg').panZoom();
        this.deviceType = -1;
    };

    // 初始化数据
    SubPage.prototype.init = function () {
        var that = this;
        that.id = neatNavigator.getUrlParam("id");
        that.name = neatNavigator.getUrlParam("name");
        // 加载左侧树
        that._buildTree(true);
        // 初始化事件
        that.initEvent();
    };

    // 绑定左侧树
    SubPage.prototype._buildTree = function (isLoadPlanSignal) {
        
        var that = this;

        var token = neat.getUserToken();
        // 获取 关联得设备
        pageDataApi.getPlanLinkage(token, that.id, that.deviceType, function (data) {
            // 加载单位名称
            $('#enterpriseName').text(data.enterpriseName);

            var result = new Array();
            result.push(data.devices);

            // 加载树
            var mytree = $('#treeview').treeview({
                levels: 4,
                data: result,
                onNodeSelected: function (event, node) {
                    // 如果点击得节点为设备，则判断设备在平面图是否存在，则不存在需要创建
                    that.createDevice(node, that, pageDataApi, token);
                }
            });
            
            if (isLoadPlanSignal) {
                // 加载图纸
                that.loadPlanImage(data.uri);

                // 加载已关联得设备
                if (result.length > 0) {
                    result.forEach(function (item, index, array) {
                        // 加载已关联得设备
                        that._foreachDeviceItem(item);
                    });

                    that.createTooltip();
                }
            }

        }, function (error) {
            console.log(error.message);
        });
    }

    // 递归加载设备
    SubPage.prototype._foreachDeviceItem = function (item) {
        var that = this;
        if (item.nodes == null) {
            if (item.deviceType > 0 && item.isLink) {
                that.LoadDeviceLayoutInfo(item.id, item.text, item.deviceType, item.x, item.y, false);
            }

            return true;

        } else {
            item.nodes.forEach(function (item, index, array) {
                that._foreachDeviceItem(item);
            });
        }
    };

    // 根据左侧导航树单击事件处理右侧平面图得设备布点业务
    SubPage.prototype.createDevice = function (node) {
        var that = this;
        var token = neat.getUserToken();

        if (node.deviceType > 0) {
            var currentDevice = SVG("#d" + node.id);
            // 如果设备在平面图中存在，则需要启动该设备得闪烁动画
            if (currentDevice != null) {
                that.backgroundRect.attr({ x: currentDevice.x() - 3, y: currentDevice.y() - 3, opacity: 0 });
                that.backgroundRect.attr({ opacity: 0 }).animate(150).attr({ opacity: 1 }).loop(3);
            }
            // 建立该设备得布点信息
            else {
                var data = {
                    deviceId: node.id,
                    planId: that.id,
                    deviceType: node.deviceType,
                    componentType: node.componentType,
                    deviceName: node.text,
                    planName: that.name,
                    posX: 3,
                    posY: 3,
                };
                // 创建 设备得布点关系
                pageDataApi.addLinkage(token, data, function (id) {
                    data.id = id;
                    // 加载设备布点信息
                    that.LoadDeviceLayoutInfo(data.deviceId, data.deviceName, data.deviceType, data.posX, data.posY, true);

                    that.createTooltip();
                }, function () { });
            }
        }
    }

    // 加载图纸
    SubPage.prototype.loadPlanImage = function (imageURL) {
        var that = this;
        // 加载图纸
        var panImage = that.draw.image(imageURL);
        panImage.attr({ width: 1000, height: 680 });

        // 创建红色背景方块
        var rect = that.draw.rect(28, 28);
        rect.attr({ id: "recTemp", fill: "Red", opacity: 0 });
        rect.draggable();
        that.backgroundRect = rect;
    }

    // 在图纸中加载设备布点信息
    SubPage.prototype.LoadDeviceLayoutInfo = function (id, name, deviceType, x, y, isAnimate) {
        var that = this;
        var token = neat.getUserToken();

        // 创建 设备图标
        var deviceLayoutImg = that.draw.image(that.getImageURLByDeviceId(deviceType));
        deviceLayoutImg.attr({
            x: x
            , y: y
            , id: "d" + id
            , width: 22
            , height: 22
            , title: "<span class='highlight-white-text'>" + name + "</span>"
            , class: "tooltip"
        });

        if (isAnimate) {
            // 更新背景图片位置
            that.backgroundRect.attr({ x: x - 3, y: y - 3, opacity: 0 });
            that.backgroundRect.attr({ opacity: 1 }).animate(150).attr({ opacity: 0 }).loop(4);
        }

        // 拖动之前的位置X
        var imagStartPointX = x;
        // 拖动之前的位置Y
        var imagStartPointY = y;

        // 拖动之前的方法
        deviceLayoutImg.on('dragstart .namespace', function (e) {
            imagStartPointX = e.detail.box.x;
            imagStartPointY = e.detail.box.y;
        });

        // 拖动方法
        deviceLayoutImg.on('dragmove.namespace', function (e) {
            that.backgroundRect.animate(1).attr({ opacity: 0 });
            if (e.detail.box.x < 0 || e.detail.box.y < 0) {
                layer.msg("该器件已经超出拖动图纸的范围");
                var imgObj = this;

                // 将该设备回复到上一个位置
                imgObj.animate(1).attr({ x: imagStartPointX, y: imagStartPointY });
                that.backgroundRect.attr({ x: imagStartPointX - 3, y: imagStartPointY - 3, opacity: 0 });
                that.backgroundRect.attr({ opacity: 1 }).animate(150).attr({ opacity: 0 }).loop(4);
            } else {
                imagStartPointX = e.detail.box.x;
                imagStartPointY = e.detail.box.y;
            }
        });

        // 拖动结束
        deviceLayoutImg.draggable().on('dragend', function (e) {
            var r = e.target;
            var data =
            {
                deviceId: r.id.substring(1, r.id.length),
                planId: that.id,
                posX: imagStartPointX, //e.detail.box.x,
                posY: imagStartPointY,//e.detail.box.y
            };
            // 更新设备位置
            pageDataApi.updateLinkagePos(token, data, function (data) {

            }, function (error) {
                console.log(error.message);
            });
        });

        deviceLayoutImg.mousemove(function (e) {
            // 显示红色背景框动画
            that.backgroundRect.attr({ x: this.x() - 3, y: this.y() - 3 });
            that.backgroundRect.animate(1).attr({ opacity: 1 });
        });
        deviceLayoutImg.mouseout(function () {
            that.backgroundRect.animate().attr({ opacity: 0 })
        });
    };

    SubPage.prototype.initEvent = function () {
        var that = this;
        $("#btnSearchTree").off("click").on("click", function (event) {
            // 如果选择的和上一个值一样，则不需要更新查询
            if ($('#optQuery').value != that.deviceType) {
                that._buildTree(false);
            }
        });

        form.on('select(optQuery)', function (data) {
            //console.log(data.elem); //得到select原始DOM对象
            //console.log(data.value); //得到被选中的值
            //console.log(data.othis); //得到美化后的DOM对象
            that.deviceType = data.value;
        });
    };

    // 创建对话框
    SubPage.prototype.createTooltip = function () {
        $('.tooltip').tooltipster({
            theme: 'tooltipster-punk',
            'maxWidth': 270, // set max width of tooltip box
            contentAsHTML: true, // set title content to html
            trigger: 'custom', // add custom trigger
            triggerOpen: { // open tooltip when element is clicked, tapped (mobile) or hovered
                click: true,
                tap: true,
                mouseenter: true
            },
            triggerClose: { // close tooltip when element is clicked again, tapped or when the mouse leaves it
                click: true,
                scroll: false, // ensuring that scrolling mobile is not tapping!
                tap: true,
                mouseleave: true
            }
        });
    };

    // 根据设备类型获取设备得URL地址
    SubPage.prototype.getImageURLByDeviceId = function (deviceType, componentTypeType) {

        var imageURL = "";
        switch (deviceType) {
            // 传输设备
            case 1:
                imageURL = "/Content/neat/images/planImg/uitd.png";
                break;
            // NEAT水设备
            case 2:
                imageURL = "/Content/neat/images/planImg/wgw.png";
                break;
            // 一体式水源监测
            case 3:
                imageURL = "/Content/neat/images/planImg/wgw.png";
                break;
            // NB设备
            case 6:
                imageURL = "/Content/neat/images/planImg/nbgy.png";
                break;
            // 视频设备
            case 7:
                imageURL = "/Content/neat/images/planImg/video.png";
                break;
            // 火主机
            case 101:
                imageURL = "/Content/neat/images/planImg/firehost.png";
                break;
            // 火器件
            case 102:
                // 手报
                if (componentTypeType == 61) {
                    imageURL = "/Content/neat/images/planImg/firealarmbutton.png";
                } else if (componentTypeType == 21) {
                    imageURL = "/Content/neat/images/planImg/nbgy.png";
                } else {
                    // 默认得
                    imageURL = "/Content/neat/images/planImg/uitd.png";
                }
                break;
            // 水信号
            case 201:
                imageURL = "/Content/neat/images/planImg/watersignal.png";
                break;
            // 视频通道
            case 701:
                imageURL = "/Content/neat/images/planImg/video.png";
                break;
            // 默认
            default:
                imageURL = "/Content/neat/images/planImg/uitd.png";
                break;
        }

        return imageURL;
    };

    exports(MODULE_NAME, new SubPage());
});
