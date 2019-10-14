//构造 neatNavList 控件 需要的数据结构 的工具

layui.define(["jquery"], function (exports) {
    "use strict";

    var $ = layui.jquery;

    var MenuDataMaker = function () { };

    //构造 neatNavList 控件需要的数据结构 
    //
    //baseData中存在所有的一级菜单数据,
    //data是根据当前人的授权查询回来的菜单数据.
    //最终的结果逻辑:
    //一级菜单,无论是否有权限访问,都显示.
    //二级菜单,有权限才显示.
    MenuDataMaker.prototype.make = function (data, baseData) {

        /**
          var data = [{
            "id": "2c93bfe8-feb2-11e8-a374-c85b76a0162a",
            "name": "隐患处理",
            "description": "隐患处理",
            "styleId": "",
            "entryPoint": "/pages/patrol/hiddenDangerManage.html",
            "assembly": "",
            "sequence": 1,
            "parentId": "2cff926e-feaa-11e8-a374-c85b76a0162a"
            }]

          //结果的结构
          var result = [
          {
                text: "Parent 1",
                children: [
                {
                    text: "Child 1",
                    url:""
                },
                {
                    text: "Child 2",
                    url:""
                }
                ]
          }
         ];
         */

        var propertyNames = {
            assembly: "assembly",
            description: "description",
            entryPoint: "entryPoint",
            id: "id",
            name: "name",
            parentId: "parentId",
            sequence: "sequence",
            styleId: "styleId"

        };

        function sortMenu(a, b) {
            return a.sequence - b.sequence;
        }

        //一级菜单都是以这个为parentId的.
        var emptyGUID = "00000000-0000-0000-0000-000000000000";


        var map = new Map();

        var allMenuData = baseData.concat(data);

        //设置一级菜单
        $.each(allMenuData, function (_, item) {
            if (item[propertyNames.parentId] === emptyGUID) {

                map.set(item[propertyNames.id], {
                    text: item[propertyNames.name],
                    sequence: item[propertyNames.sequence],
                    url: item[propertyNames.entryPoint],
                    assembly: item[propertyNames.assembly]
                });
            }

        });

        //设置二级菜单
        $.each(allMenuData, function (_, item) {
            if (item[propertyNames.parentId] === emptyGUID) {
                return;
            }

            var parent = map.get(item[propertyNames.parentId]);
            if (typeof parent === "undefined") {
                return;
            }

            if (item[propertyNames.name] == parent[propertyNames.name]) {
                //和父级菜单同名称的不添加了.
                return;
            }

            if (typeof parent["children"] === "undefined") {
                parent.children = [];
            }
            parent.children.push({
                text: item[propertyNames.name],
                sequence: item[propertyNames.sequence],
                url: item[propertyNames.entryPoint],
                assembly: item[propertyNames.assembly]
            });

        });



        var result = [];

        map.forEach(function logMapElements(value, key, map) {
            result.push(value);
        });


        //为二级菜单排序
        $.each(result, function (_, item) {

            if (typeof item["children"] !== "undefined") {
                item.children.sort(sortMenu);
            }

        });

        //为一级菜单排序
        result.sort(sortMenu);

        return result;

    };




    //暴露接口
    exports('neatMenuDataMaker', new MenuDataMaker());
});