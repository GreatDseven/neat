layui.define(['jquery'], function (exports) {
    "use strict";

    var $ = layui.$;




    var NeatNavList = function (options) {
        this.options = options;
    };

    NeatNavList.prototype.init = function (elem) {


        var that = this;
        var options = that.options;

        var subMenuContainer = options.subMenuContainer;

        $(subMenuContainer).addClass("sub-nav-container");

        that.createDom();

        that.initEvent();

        that.initState();

    };

    NeatNavList.prototype.createDom = function () {
        /*
        var data = [{
                text: '首页',
                url: "/index.html"
            },
            {
                text: '第2个菜单',
                children: [{
                        text: '第2个菜单子菜单1',
                        url: '/index21.html',
                    },
                    {
                        text: '第2个菜单子菜单2',
                        url: '/index22.html',
                    }
                ]
            },
            {
                text: '第3个菜单',
                children: [{
                        text: '第3个菜单子菜单1',
                        url: '/index31.html',
                    },
                    {
                        text: '第2个菜单子菜单2',
                        url: '/index42.html',
                    }
                ]
            }

        ];
        */
        var that = this;
        var data = that.options.data;
        var parent = that.options.elem;

        var ul = $("<ul/>").addClass("nav-list");
        $.each(data, function (_, item) {
            var li = $("<li/>");
            //<a href="#">实时监控<span class="menu-trig"></span></a>
            var a = $("<a />").attr("href", "#").text(item.text).attr("data-menu-url", $.trim(item.url)).attr("data-menu-text", item.text);
            if (typeof item.url === "undefined") {
                a.attr("disabled", "disabled");
            }

            var trig = $("<span />").addClass("menu-trig");
            a.append(trig);
            li.append(a);

            ul.append(li);

            if (typeof item.children === "undefined") {

                return;
            }
            else if (item.children.length == 1 && item.children[0].text === item.text) {
                //只有一个菜单,并且子菜单与主菜单相同. 
                // 例如:
                //首页 >> 首页  
                //用户权限 >> 用户权限
                a.attr("data-menu-url", item.children[0].url).removeAttr("disabled");
                return;
            }
            else {
                //有多个子菜单 或者 只有一个子菜单,但是子菜单与主菜单不是一个菜单.
                var ulSub = $("<ul/>");
                $.each(item.children, function (_, subItem) {
                    var lisub = $("<li/>");
                    var asub = $("<a />").attr("href", "#").text(subItem.text).attr("data-menu-url", $.trim(subItem.url)).attr("data-menu-text", subItem.text);
                    if (typeof subItem.url === "undefined") {
                        asub.attr("disabled", "disabled");
                    }
                    if (subItem.assembly === "_blank") {
                        asub.attr("target", "_blank");
                        asub.attr("href", $.trim(subItem.url));
                    }
                    lisub.append(asub);
                    ulSub.append(lisub);
                });

                li.append(ulSub);
            }



        });

        that.htmlDom = ul;
        $(parent).html(ul[0].outerHTML);
    };

    NeatNavList.prototype.initEvent = function () {
        var that = this;
        //var subMenuContainer = $(that.options.subMenuContainer);
        var options = that.options;
        var htmlDom = $(options.elem);

        $('.nav-list>li', htmlDom).hover(function () {

            var oW = $(this).width(); // 主菜单的li项目
            var $ul = $(this).find('ul'); //当前主菜单的字菜单

            var otrigW = $(this).find('.menu-trig').width(); //主菜单下的高亮显示条,用于标识当前主菜单
            var oNavListL = htmlDom.offset().left;  //主菜单容器div距离最左侧长度

            var oTL = $(this).offset().left - oNavListL; //在主菜单容器内,当前主菜单距离最左边的距离

            var oTR = htmlDom.width() - oTL - oW; //在主菜单容器内,当前主菜单距离最右边的距离

            //$(this).toggleClass("hover", true);

            if ($ul.find('li').length > 0) {

                $ul.show();

                var sum = 0; //当前主菜单下所有子菜单的总长度
                var oLeft = 0;
                for (var i = 0; i < $ul.find('li').length; i++) {
                    sum += $ul.find('li').eq(i).width();
                }
                $ul.width(sum);
                oLeft = (sum - oW) / 2;
                //if (oLeft > oTL) { //到达左侧边界
                //    oLeft = oTL;
                //    $ul.css('left', -oLeft + 'px');
                //    return;
                //}
                //if (oLeft > oTR) {
                //    $ul.css('right', -oTR + 'px');
                //    return;
                //}

                $ul.css('padding-left', (oNavListL + oTL + oW - oLeft) + 'px');
                $ul.css('left', -(oNavListL + oTL + oW) + 'px');

            }
        }, function () {

            //$(this).toggleClass("hover", false);

            $(this).find('ul').hide();

        });

        $('.nav-list>li', htmlDom).click(function (eventObj) {



            var currentA = $(this).find("a");

            if (currentA.attr("data-menu-url")) {

                $('.nav-list>li', htmlDom).toggleClass("selected", false);

                $(this).toggleClass("selected", true);

                $('.nav-list>li>ul>li', htmlDom).toggleClass("selected", false);
                eventObj.preventDefault();

                var clickedMenuData = {
                    current: {
                        url: currentA.attr("data-menu-url"),
                        text: currentA.attr("data-menu-text")
                    },
                    parent: null
                };
                that._fireClickEvent(clickedMenuData);
                eventObj.stopPropagation();
            }
            else {
                eventObj.preventDefault();
                eventObj.stopPropagation();
            }
        });

        $('.nav-list>li>ul>li', htmlDom).click(function (eventObj) {
            var currentA = $(this).find("a");
            var target = currentA.attr("target");
            if (target == "_blank") {
                var url = currentA.attr("href");
                window.open(url + "?__=" + new Date().valueOf().toString());
                return;
            }
            if (typeof $(this).find("a").attr("data-menu-url") !== "undefined") {

                $('.nav-list>li', htmlDom).toggleClass("selected", false);

                $(this).parent().parent().toggleClass("selected", true);


                $('.nav-list>li>ul>li', htmlDom).toggleClass("selected", false);
                $(this).toggleClass("selected", true);

                eventObj.preventDefault();
                var a = $(this).find("a");
                var parenta = $(this).parent().parent().find(">a");

                var clickedMenuData = {
                    current: {
                        url: a.attr("data-menu-url"),
                        text: a.attr("data-menu-text")
                    },
                    parent: {
                        url: parenta.attr("data-menu-url"),
                        text: parenta.attr("data-menu-text")
                    }
                };

                that._fireClickEvent(clickedMenuData);
                eventObj.stopPropagation();

            }

        });

    };
    NeatNavList.prototype._fireClickEvent = function (menuData) {
        if (typeof this.options.onMenuClicked === "function") {
            this.options.onMenuClicked(menuData);
        }
    };


    NeatNavList.prototype.initState = function () {

        var that = this;

        var options = that.options;
        var htmlDom = $(options.elem);

        var routerData = layui.router();

        if (routerData.path.length == 0) {
            //currentUrl = options.data[0].url;
            return;
        }

        var currentUrl = "/";

        currentUrl = currentUrl + routerData.path.join('/');



        //尝试处理一级菜单
        var testor1 = '.nav-list>li>a[data-menu-url^=\"' + currentUrl + '\"]';

        var testor1Result = $(testor1, htmlDom);

        if (testor1Result.length > 0) {
            testor1Result.parent().toggleClass("selected", true);

            return;
        }

        //尝试处理二级菜单
        var testor2 = '.nav-list>li>ul>li>a[data-menu-url^=\"' + currentUrl + '\"]';
        var testor2Result = $(testor2, htmlDom);
        if (testor2Result.length > 0) {

            testor2Result.parent().toggleClass("selected", true)
                .data("selected", true);

            testor2Result.parent().parent().parent().toggleClass("selected", true);

            return;
        }


    };

    //暴露接口
    exports('neatNavList', function (options) {

        var navList = new NeatNavList(options = options || {});
        var elem = $(options.elem);
        if (!elem[0]) {
            return hint.error('neatNavList 没有找到' + options.elem + '元素');
        }
        navList.init(elem);
        return navList;
    });
});