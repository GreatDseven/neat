
layui.define(['layer', 'element', "neatNavList", "neatNavigator", "jquery"
    , "neatTime", 'treeview'
    , 'jquery', 'neatTools', 'neatLoginOp', 'neat', 'neatDataApi'
    , 'neatTreeDataMaker', "neatMenuDataMaker", 'form', 'neatEventPush', "jqueryNotyfy", 'neatSpeechSynthesis', 'neatFileViewer', 'autoRefresh','neatUITools'], function (exports) {

        "use strict";
        var layer = layui.layer;

        var neatNavList = layui.neatNavList;
        var neatNavigator = layui.neatNavigator;
        var $ = layui.$;
        var neatTime = layui.neatTime;



        var neatTools = layui.neatTools;
        var neatLoginOp = layui.neatLoginOp;
        var neat = layui.neat;
        var neatDataApi = layui.neatDataApi;

        var treeDataMaker = layui.neatTreeDataMaker();
        var neatMenuDataMaker = layui.neatMenuDataMaker;

        var form = layui.form;

        var uiTools = layui.neatUITools;

        var boardPageMode = {
            tree: "tree",
            map: "map"
        };

        var Page = function () {

            this.currentPageMode = "";
            this.refreshHandle = -1;
        };



        Page.prototype.init = function () {


         

            var that = this;

           

            $("#userInfoCtl").show();

            this.subPageLoaded = false;

            window.name = neat.appName;

            $("title").text(layui.neat.appName);

            //检查是否登录了
            neatLoginOp.checkLogin();


            //显示当前用户
            that.showCurrentUser();

            //开启登录用户改变的监听
            that.refreshHandle = layui.autoRefresh.autoRefresh(function () {

                that.checkUserChanged();

            }, 5000);

            //显示用户姓名
           

            //初始化树
            that.initTree();


            //初始化菜单
            that.initMenu();


            //开始网页底部时间计时
            neatTime({
                elem: "#currentTime"
            });


            //启动刷新token
            neatLoginOp.startAutoRefreshToken();

            
            //注销
            $("#logout").on("click", function () {
                neatLoginOp.logout();
            });

            //初始化事件推送
            layui.neatEventPush.init();

            this.initHashChangeEvent();

            $(window).on("unload", function () {

                $(window).off("hashchanged");
            });


            //加载一个页面
            if (location.hash === "") {
                var fakeIndexUrl = "/pages/monitoring/monitor.html#/mode=map";

                that.setPageMode(fakeIndexUrl);
            }
            else {
                that.setPageMode(location.hash);
            }


            layui.neatSpeechSynthesis.speak("欢迎访问" + neat.getAppName());

            //初始化自定义logo
            uiTools.renderCustomLogo(".logo");

        };


        //显示当前用户
        Page.prototype.showCurrentUser = function () {

            var userName = neat.getCurrentUserInfo();
           
            if (this.lastUserName != userName) {
                $("#userInfo").hide().html(userName).show();
                this.lastUserName = userName;
            }
        };

        //检查当前登录用户是否变化了,如果变化了,就重新加载当前页面
        Page.prototype.checkUserChanged = function () {

            var userName = neat.getCurrentUserInfo();

            //console.log("checkUserChanged...");
            if (this.lastUserName != userName) {

                window.location.reload();
            }
        };

        //给树绑定数据
        Page.prototype.bindTreeData = function (treeData) {
            var that = this;

            

            // 加载树
            var mytree = $('#treeview').treeview({
                levels: 2,
                data: treeData,
                onNodeSelected: function (event, node) {

                    //console.log("before setSelectedTreeNodeInfo ");
                    neatNavigator.setSelectedTreeNodeInfo(node);
                    //console.log("after setSelectedTreeNodeInfo ");

                    that.treeNodeClicked = true;
                    neatNavigator.setHashSearchData([{ key: "nodeId", value: node.id }, { key: "nodeType", value: node.type }, { key: "nodeText", value: node.text }, { key: "fullAccess", value: node.fullAccess }, { key: "__", value: new Date().valueOf().toString() }])

                    //console.log("after setHashSearchData ");
                }

            });


            var hashData = layui.router();
            if (!hashData.search.nodeId && hashData.hash !== "") {
                hashData = layui.router(hashData.hash);
            }

            //如果原来的url中有已经选中的节点,那么帮助用户选中这个节点.
            if (hashData.search.nodeId) {
                var nodes = $('#treeview').data('treeview').findNodes(hashData.search.nodeId.replace(/-/g, "\\-"), 'g', 'id');

                if (nodes.length == 1) {

                    //如果存在父节点,那么展开父节点.
                    var parent = $('#treeview').data('treeview').getParent(nodes[0]);
                    if (parent) {
                        $('#treeview').data('treeview').expandNode(parent);
                    }


                    $('#treeview').data('treeview').selectNode(nodes[0]);

                }
            }
            else {
                if (treeData.length > 0) {
                    $('#treeview').treeview('selectNode', [0]);
                }
            }

           
        };

        // 切换页面模式,tree或者map
        Page.prototype.setPageMode = function (url) {

            var that = this;

            var oldPageMode = this.currentPageMode;

            this.currentPageMode = this.getPageModeFromMenuUrl(url);



            var setContnet = function (html) {

                $(".template").remove();

                $(html).insertAfter(".top-row");

                form.render();

            };

            if (this.currentPageMode == boardPageMode.map) {
                if (oldPageMode != this.currentPageMode) {

                    setContnet($("#mapModeTemplate").html());
                }
                
                neatNavigator.setHashPathAndSearchData(url, { menutype: "", mode: boardPageMode.map});

            }
            else {
                if (oldPageMode != this.currentPageMode) {

                    setContnet($("#treeModeTemplate").html());
                }
                var treeMode = this.getTreeModeFromMenuUrl(url);
                
                neatNavigator.setHashPathAndSearchData(url, { menutype: treeMode.join(","), mode: boardPageMode.tree });
                $("#txtSearchTree").off("keydown").on("keydown", function (event) {
                    if (event.which === 13) {
                        that.initTree(undefined, true);
                    }
                });

                $("#btnSearchTree").off("click").on("click", function (event) {
                    
                    that.initTree(undefined,true);


                });

                this.initTree(treeMode, oldPageMode != this.currentPageMode);
            }

            this.loadSubPage(url);


        };

        //初始化菜单
        Page.prototype.initMenu = function () {
            var that = this;
            //var menuLoadingIndex = layer.load(1 /*, { offset: that.getLoadingOffset("menu-container") }*/);
            neatDataApi.loadMenuData(neat.getUserToken(), function (resultData) {

                var finalMenuData = neatMenuDataMaker.make(resultData, neatNavigator.getMenuData());
                that.menu = neatNavList({
                    elem: ".menu-container",
                    data: finalMenuData,
                    onMenuClicked: function (clickedMenu) {

                        if ($.trim(clickedMenu.current.url) === "") {
                            return;
                        }
                        that.menuClicked = true;
                        
                        that.setPageMode(clickedMenu.current.url);
                    }
                });

                //layer.close(menuLoadingIndex);

                that.menuLoading = false;
                //that.hidenLoading();

            }, function () {
                //layui.layer.close(menuLoadingIndex);
                that.menuLoading = false;
                //that.hidenLoading();
            });
        };

        //获取loading layer的中心点
        Page.prototype.getLoadingOffset = function (cssClass) {

            var elem = $("." + cssClass);
            if (elem.length == 0) {
                return "auto";
            }

            var top = $(elem[0]).offset().top;
            var left = $(elem[0]).offset().left;
            var width = $(elem[0]).width() / 2;
            var height = $(elem[0]).height() / 2;

            var result = [
             (top + height - 18.5) + "px",
             (left + width - 18.5) + "px"
            ];

            return result;

        };

        // 从当前菜单的url 获取 当前页面是需要初始化为全屏地图模式,还是左侧树模式
        Page.prototype.getPageModeFromMenuUrl = function (clickedMenuUrl) {
            var that = this;
            if (!clickedMenuUrl) {
                //应该是在刷新页面
                clickedMenuUrl = layui.router().href;
            }
            //从菜单中获取hash部分的数据.
            var routeData = layui.router(clickedMenuUrl);

            if (routeData.hash !== "") {
                //再次获取hash部分的数据.
                routeData = layui.router(routeData.hash)
                if (routeData.search.mode && routeData.search.mode === boardPageMode.map) {

                    return boardPageMode.map;

                }

            }

            return boardPageMode.tree;
        };

        //为当前菜单初始化左侧树
        Page.prototype.getTreeModeFromMenuUrl = function (clickedMenuUrl) {

            var that = this;

            if (!clickedMenuUrl) {
                //应该是在刷新页面
                clickedMenuUrl = layui.router().href;
            }
            //从菜单中获取hash部分的数据.
            var routeData = layui.router(clickedMenuUrl);

            if (routeData.hash !== "") {
                //再次获取hash部分的数据.
                routeData = layui.router(routeData.hash)
                if (routeData.search.menutype) {
                    var types = routeData.search.menutype.split(',');
                    var finalTypes = [];
                    $.each(types, function (_, item) {

                        try {
                            finalTypes.push(parseInt(item));

                        } catch (e) {
                            return;
                        }

                    });
                    return (finalTypes);

                }

            }

            return [1, 2];

        };


        Page.prototype.trimHash = function (url) {
            var index = url.indexOf("#");
            if (index == -1) {
                return url;
            }
            if (index == 0) {
                return this.trimHash(url.substr(1));
            }
            return url.substr(0, index);
        };



        //加载子页面
        Page.prototype.loadSubPage = function (url) {

            var that = this;

            url = this.trimHash(url);

            if (url == this.lastPageUrl) {
                return;
            }
            //console.log("loadSubPage");

            this.lastPageUrl = url;

            var tmpUrl = neatNavigator.addUrlPara(url, "__", new Date().valueOf().toString());

            //先取消掉 原有页面对于导航栏改变事件的监听
            $(window).off("hashchange");
            this.initHashChangeEvent();
            $.get(tmpUrl, function (ajaxResult) {

                $("#subpageContainer").html(ajaxResult);
           
                form.render(null, "subpageContainer");
                //$("#subpageContainer").show();
              

                //that.subpageLoading = false;
                //that.hidenLoading();


            }, "html");
        };



        Page.prototype.initHashChangeEvent = function () {

            var that = this;
            $(window).on("hashchange", function () {
               
                
                if (that.treeNodeClicked === true) {
                    that.treeNodeClicked = false;
                    return;
                }
                if (that.menuClicked === true) {
                    that.menuClicked = false;
                    return;
                }

                var routeData = layui.router();
                that.isMyInvokedHashChange = true;
                that.setPageMode(routeData.href);
                
                if (typeof (that.menu) !== "undefined") {
                    that.menu.initState();
                }
                

            });
        };


        // 刷新树
        Page.prototype.refreshTree = function () {
            if (this.currentPageMode === boardPageMode.tree) {
                this.initTree(null, true);
            }
        };

        //初始化树
        Page.prototype.initTree = function (nodeTypes, forceReload) {

            if (this.currentPageMode !== boardPageMode.tree) {
                return;
            }

            if (!nodeTypes) {
                nodeTypes = this.getTreeModeFromMenuUrl();
            }

            //如果菜单要求的树和现有的树相同,就不用重新绑定了.
            var newTreeTypeValue = nodeTypes.join(",");
            if (this.lastTreeType === newTreeTypeValue) {
                if (!forceReload) {
                    //如果菜单类型相同,又不是强制刷新,就不刷新了.
                    return;
                }

            }
            this.lastTreeType = newTreeTypeValue;

            var that = this;


            neatDataApi.loadOrgTreeData(neat.getUserToken(), function (treeRawData) {

                var txt = $.trim($("#txtSearchTree").val());

                addTreeNodeIcon(treeRawData);


                var finalTreeData = treeDataMaker.make(filterTreeData(treeRawData, nodeTypes), txt);

                that.bindTreeData(finalTreeData);

                //that.treeLoading = false;
                //that.hidenLoading();

            }, function () {
                //that.treeLoading = false;
                //that.hidenLoading();
            });
        };




        function addTreeNodeIcon(treeRawData) {
            layui.each(treeRawData, function (_, item) {

                if (item.type === 1) {
                    item.icon = "fas fa-star";
                }
                else if (item.type === 2) {
                    item.icon = "fas fa-landmark";
                }
                else if (item.type === 3) {
                    item.icon = "fas fa-building";
                }
                else if (item.type === 4) {
                    item.icon = "far fa-dot-circle";
                }

            });
        }


        function filterTreeData(treeRawData, returnNodeTypes) {

            if (returnNodeTypes.length == 2
                && returnNodeTypes.indexOf(1) > -1
                && returnNodeTypes.indexOf(2) > -1
               ) {
                return treeRawData;
            }

            var fildterTreeRawData = [];

            $.each(treeRawData, function (_, item) {

                if (returnNodeTypes.indexOf(item.type) > -1) {
                    fildterTreeRawData.push(item);
                }

            });

            return fildterTreeRawData;
        }



        var pageInstance = new Page();

        exports("pageBoard", pageInstance);
    });

