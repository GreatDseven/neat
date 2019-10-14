//平面图页面
layui.define(["jquery", 'element', 'form', 'table', 'laytpl', 'laypage', 'layer', 'neat', 'neatNavigator', 'commonDataApi', 'imageDataApi','neatWindowManager'], function (exports) {

    "use strict";

    var MODULE_NAME = "pagePlanImgList";

    var $ = layui.$;
    var table = layui.table;
    var form = layui.form;
    var laytpl = layui.laytpl;

    var neat = layui.neat;
    var laypage = layui.laypage;
    var neatNavigator = layui.neatNavigator;
    var commonDataApi = layui.commonDataApi;
    var pageDataApi = layui.imageDataApi;



    var defaultPageSize = 15;

    var SubPage = function () {

    };

    SubPage.prototype.initDefaultValues = function () {

        this.currentPageIndex = 1;
        this.currentPageSize = defaultPageSize;
        this.currentSortColumn = "id";
        this.currentSortOrder = "desc";

        this.optEnt = "";
        this.optBuilding = "";
        this.optKeypart = "";
    };

   

    //初始化 单位列表
    SubPage.prototype.initOptEnt = function () {

        var that = this;

        form.on('select(optEnt)', function (data) {
            //console.log(data.elem); //得到select原始DOM对象
            //console.log(data.value); //得到被选中的值
            //console.log(data.othis); //得到美化后的DOM对象
            that.optEnt = data.value;

            that.bindBuilding();
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

        if (treeData.domainId == "") {
            //选中的是企业节点
            var d = {};
            d.data = [{ id: treeData.enterpriseId, name: treeData.name }];
            laytpl($("#optEntTemplate").html()).render(d, function (html) {

                var parent = $("#optEnt").html(html);
                form.render('select', 'optEntForm');
            });
        }
        else {
            commonDataApi.getEntByDomainId(token, treeData.domainId, function (resultData) {

                var d = {};
                d.data = resultData;
                laytpl($("#optEntTemplate").html()).render(d, function (html) {

                    var parent = $("#optEnt").html(html);
                    form.render('select', 'optEntForm');
                });


            });
        }
    };


    //初始化 建筑
    SubPage.prototype.initBuilding = function () {

        var that = this;

        laytpl($("#optBuildingTemplate").html()).render({}, function (html) {

            var parent = $("#optBuilding").html(html);
            form.render('select', 'optBuildingForm');
        });

        form.on('select(optBuilding)', function (data) {
            //console.log(data.elem); //得到select原始DOM对象
            //console.log(data.value); //得到被选中的值
            //console.log(data.othis); //得到美化后的DOM对象
            that.optBuilding = data.value;

            that.bindKeypart();
        });

    };

    //建筑 绑定数据
    SubPage.prototype.bindBuilding = function () {

        var that = this;

        if (that.optEnt === "") {
            laytpl($("#optBuildingTemplate").html()).render({}, function (html) {

                var parent = $("#optBuilding").html(html);
                form.render('select', 'optBuildingForm');
            });

        }
        else {
            var token = neat.getUserToken();

            commonDataApi.getBuildingByEntId(token, that.optEnt, function (resultData) {

                var d = {};
                d.data = resultData;
                laytpl($("#optBuildingTemplate").html()).render(d, function (html) {

                    var parent = $("#optBuilding").html(html);
                    form.render('select', 'optBuildingForm');
                });


            });
        }

    };


    //初始化 部位
    SubPage.prototype.initKeypart = function () {

        var that = this;

        laytpl($("#optKeypartTemplate").html()).render({}, function (html) {

            var parent = $("#optKeypart").html(html);
            form.render('select', 'optKeypartForm');
        });

        form.on('select(optKeypart)', function (data) {
            //console.log(data.elem); //得到select原始DOM对象
            //console.log(data.value); //得到被选中的值
            //console.log(data.othis); //得到美化后的DOM对象
            that.optKeypart = data.value;

        });

    };

    //部位 绑定数据
    SubPage.prototype.bindKeypart = function () {

        var that = this;

        if (that.optBuilding === "") {
            laytpl($("#optKeypartTemplate").html()).render({}, function (html) {

                var parent = $("#optKeypart").html(html);
                form.render('select', 'optKeypartForm');
            });
            return;
        }
        else {

            var token = neat.getUserToken();

            commonDataApi.getKeypartByBuildingId(token, that.optBuilding, function (resultData) {

                var d = {};
                d.data = resultData;
                laytpl($("#optKeypartTemplate").html()).render(d, function (html) {

                    var parent = $("#optKeypart").html(html);
                    form.render('select', 'optKeypartForm');
                });

            });
        }

    };



    // 绑定表格
    SubPage.prototype.bindTable = function () {

        var that = this;

        var token = neat.getUserToken();
        var treeData = neatNavigator.getSelectedTreeNodeInfo();
        if (!treeData) {
            return;
        }
        var domainId = "";
        var entId = "";

        if (treeData.type == 1) {
            domainId = treeData.id;
            entId = that.optEnt;
        }
        else {
            domainId = "";
            entId = treeData.id;
        }

        var loadingIndex = layui.layer.load(1);
        pageDataApi.queryPlanImgList(token, domainId, entId, that.optBuilding, that.optKeypart,
            that.currentPageIndex, that.currentPageSize,
            function (resultData) {

                layui.layer.close(loadingIndex);
                that.fillImgTable(resultData);

                that.initPager(resultData.totalCount, that.currentPageIndex);

            },
            function () { //失败
                layui.layer.close(loadingIndex);
                that.currentPageIndex = 1;

                that.fillImgTable([]);
                that.initPager(0, 1);

            });
    };

    // 填充 图片表
    SubPage.prototype.fillImgTable = function (d) {

        var that = this;

        laytpl($("#planImgTableTemplate").html()).render(d, function (html) {
            $("#planImgTable").html(html);
            form.render();
            that.addImgClickEvent();
        });
    };

    SubPage.prototype.addImgClickEvent = function () {
        var that = this;

        $("img[name='plimg']").on("click", function () {

            var url = "/pages/foundationInfo/planImg/planImgEdit.html?"
                + "id=" + $(this).data("imgid") + "&name=" + this.title
                + "&__=" + new Date().valueOf().toString();

            var width = 1400;//screen.availWidth * 0.8;
            var height = 780; //screen.availHeight * 0.8;

            layui.neatWindowManager.openLayerInRootWindow(
                {
                    resize: false,
                    type: 2,
                    title: '平面图描点',
                    area: [width + "px", height+"px"],
                    shade: [0.7, '#000'],
                    content: url
                   
                }
            );

        });
    };

    //清空表格
    SubPage.prototype.clearTable = function () {

        var that = this;

        table.reload("resultTable", {
            data: [],
            initSort: {
                field: that.currentSortColumn,
                type: that.currentSortOrder
            }
        });
        that.currentPageIndex = 1;
        that.initPager(0, 1);
    };


    SubPage.prototype.initPager = function (totalCount, pageIndex) {

        var that = this;

        if (!totalCount) {
            totalCount = 0;
        }
        if (!pageIndex) {
            pageIndex = 1;
        }

        laypage.render({
            elem: 'resultTablePager',
            count: totalCount, //数据总数，从服务端得到
            limit: that.currentPageSize,
            hash: false,
            layout: ['count', 'prev', 'page', 'next'],
            curr: pageIndex,
            jump: function (obj, first) {
                //obj包含了当前分页的所有参数，比如：
                //console.log(obj.curr); //得到当前页，以便向服务端请求对应页的数据。
                //console.log(obj.limit); //得到每页显示的条数

                that.currentPageIndex = obj.curr;
                that.currentPageSize = obj.limit;

                //首次不执行
                if (!first) {
                    //do something
                    that.bindTable(obj.curr, obj.limit);
                }
            }
        });
    };

    
    //添加
    SubPage.prototype.initAddEvent = function () {
        var that = this;
        $('#btnAdd').on('click', function () {

            var treeData = neatNavigator.getSelectedTreeNodeInfo();
            if (!treeData) {
                return;
            }

            if (!treeData.enterpriseId) {

                layer.msg("请选择单位节点添加平面图!");
                return;
            }


            var url = "/pages/foundationInfo/planImg/planImgCreate.html?"
                + "enterprise_id=" + treeData.enterpriseId
                + "&enterprise_name=" + treeData.name
                + "&__=" + new Date().valueOf().toString();

            layer.open({
                resize: false,
                type: 2,
                title: '添加平面图',
                area: ["640px", "420px"],
                shade: [0.7, '#000'],
                content: url,
                end: function () {
                    that.bindTable();
                }
            });
        });
    };

    //查询
    SubPage.prototype.initQueryEvent = function () {
        var that = this;
        $("#btnQuery").on("click", function () {
            that.currentPageIndex = 1;
            that.bindTable();
        });
    };

    //删除
    SubPage.prototype.initDeleteEvent = function () {

        var that = this;

        $('#btnDelete').on('click', function () {

            var allchecked = $("input[name=plchk]:checked");

            var ids = [];
            var names = [];
            $.each(allchecked, function (_, item) {

                ids.push(item.value);
                names.push(item.title);
            });

            if (ids.length === 0) {
                layer.msg("请勾选需要删除的平面图!");
                return;
            }
            layer.confirm("<span style='color:red'>确定要删除这些平面图?</span>:<br/>" + names.join(",") , {}, function () {

                $("#btnDelete").attr("disabled", true);

            
                pageDataApi.deletePlanImg(neat.getUserToken(), ids

                    , function (sd) { //成功或者部分成功

                        $("#btnDelete").attr("disabled", false);
                        var alertMsg = "";

                        if (!sd || sd == null || sd.length === 0) {
                            alertMsg = "平面图删除成功!";

                        }
                        else {

                            alertMsg = "以下平面图未能成功删除:<br/>" + sd.join("<br/>");
                        }

                        layer.msg(alertMsg, function () {
                            that.bindTable();
                        });
                    }
                    , function (fd) {

                        $("#btnDelete").attr("disabled", false);

                        layer.msg("删除失败!", function () {
                            that.bindTable();

                        });

                    });
            });

        });
    };



    SubPage.prototype.initHashChangedEvent = function () {

        var that = this;
        $(window).on("hashchange", function () {

            var treeData = neatNavigator.getSelectedTreeNodeInfo();
            if (!treeData) {
                return;
            }
            if (!treeData.fullAccess) {
                $("#btnAdd").attr("disabled", true);
                $("#btnDelete").attr("disabled", true);
            }
            else {
                $("#btnAdd").attr("disabled", false);
                $("#btnDelete").attr("disabled", false);
            }

            that.domainId = treeData.domainId;
            that.optEnt = treeData.enterpriseId;

            that.currentPageIndex = 1;
            that.bindEnt();
            that.bindBuilding();
            that.bindKeypart();

            that.bindTable();

        });
    };

   

    SubPage.prototype.init = function () {


        var that = this;

        this.initDefaultValues();

        this.initHashChangedEvent();

        this.initOptEnt();
        this.initBuilding();
        this.initKeypart();

        this.initPager();


        //按钮事件

        //查询
        this.initQueryEvent();
        //添加
        this.initAddEvent();
        //删除
        this.initDeleteEvent();

        this.bindTable();

       
    };

    exports(MODULE_NAME, new SubPage());
});