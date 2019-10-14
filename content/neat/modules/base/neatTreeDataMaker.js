//构造 树控件需要的数据结构 的工具

//说明:
//有两种方法,可以让树,显示时某些个数据是勾选的.
//1.数据节点,自带一个bool型字段,默认该字段名称是checked
//2.调用make方法时,传入第三个参数,直接把选中的id列表以数组的方式传入

layui.define(['jquery'], function (exports) {
    "use strict";

    var $ = layui.$;

    var TreeDataMaker = function (options) { 
    
        this.idPropertyName="id";
        this.parentIdPropertyName = "parentID";
        this.namePropertyName = "name";

        this.childrenPropertyName = "nodes";

        this.checkedPropertyName = "isChecked";

        this._initOptions(options);
        
    };

    TreeDataMaker.prototype._initOptions = function (options) {

        if (typeof options === "undefined" || !options)
            return;

        if (typeof options.idPropertyName === "string" && options.idPropertyName !== "") {
            this.idPropertyName = options.idPropertyName;
        }

        if (typeof options.parentIdPropertyName === "string" && options.parentIdPropertyName !=="" ) {
            this.parentIdPropertyName = options.parentIdPropertyName;
        }

        if (typeof options.namePropertyName === "string" && options.namePropertyName !== "") {
            this.namePropertyName = options.namePropertyName;
        }

        if (typeof options.childrenPropertyName === "string" && options.childrenPropertyName !== "") {
            this.childrenPropertyName = options.childrenPropertyName;
        }

        if (typeof options.checkedPropertyName === "string" && options.checkedPropertyName !== "") {
            this.checkedPropertyName = options.checkedPropertyName;
        }

    };

    //构造 树控件需要的数据结构 
    TreeDataMaker.prototype.make = function (data, searchText,checkedItemIds) {

        /**
          var data = [{
            id:"f96c7500-a63d-44fd-8714-c40474dd8350",
            "parentID":"891200fd-360a-11e5-bee7-000ec6f9f8b3",
            "name":"海港区",
            "Type":1,
            "FullAccess":true
          }]

          //结果的结构,原有属性保留,加了一些属性,变成了树状结构
          var result = [
          {
                text: "Parent 1",
                nodes: [
                {
                    text: "Child 1",
                    nodes: [
                    {
                        text: "Grandchild 1"
                    },
                    {
                        text: "Grandchild 2"
                    }
                    ]
                },
                {
                    text: "Child 2"
                }
                ]
          }
         ];
         */

        var allDataDic = {};

        function getKey(id) {
            try{
                return "k" + id.replace(/-/g, "");
            }
            catch (e) {
               
                return 'k' + id;
            }
          
        }
        //把指定节点的父节点的matchSearch 设置为true
        function setParentMatchSearch(dataItem) {
            var parent = allDataDic[dataItem.parentKey];
            if (!parent)
                return;
            if (parent.matchSearch)
                return;
            parent.matchSearch = true;
            setParentMatchSearch(parent);
        }

       

        for (var index in data) {

            var dataItem = data[index];

            if (typeof dataItem[this.checkedPropertyName] != "undefined")
            {
                dataItem.state = {
                    checked: dataItem[this.checkedPropertyName]
                };
            }
            

            dataItem.key = getKey(dataItem[this.idPropertyName]);
            
            dataItem.parentKey = getKey(dataItem[this.parentIdPropertyName]);
            allDataDic[dataItem.key] = dataItem;
            //给节点名称赋值
            dataItem.text = dataItem[this.namePropertyName];
            //是否符合搜索结果
            dataItem.matchSearch = true;
            if (typeof (searchText) !== "undefined"
                && $.trim(searchText) !== "" ) {
                if (dataItem.text.indexOf(searchText) === -1) {
                    dataItem.matchSearch = false;
                } else {
                    dataItem.matchSearch = true;
                }

            }


        }

        //把数据设置为勾选选中状态
        if (Object.prototype.toString.call(checkedItemIds) === '[object Array]') {
            $.each(checkedItemIds, function (_, item) {
                var key = getKey(item);
                allDataDic[key].state = {
                    checked: true
                };
            });

        }

        //把所有的数据都根据已有的搜索值配置结果重新标记 matchSearch 属性
        for (var index2 in data) {
            var dataItem2 = data[index2];
            if (dataItem2.matchSearch) {
                setParentMatchSearch(dataItem2);
            }
        }

        for (var index3 in data) {
            var dataItem3 = data[index3];

            //不符合搜索条件的节点不要
            if (!dataItem3.matchSearch)
                continue;

            if (dataItem3.parentId === "" || dataItem3.parentId === null || dataItem3.parentId === dataItem3.id)
                continue;

            //拿到parentNode
            var parentNode = allDataDic[dataItem3.parentKey];


            if (!parentNode) {
                //没找到
                continue;
            }

            //做标记,这个节点已经被添加到父节点中了.
            dataItem3.haveParent = true;


            var childrenNodes = parentNode[this.childrenPropertyName]
            if (!childrenNodes) {
                parentNode[this.childrenPropertyName] = [];
            }
            //把当前节点加到父节点的节点中
            parentNode[this.childrenPropertyName].push(dataItem3);
        }

        var result = [];

        for (var index4 in allDataDic) {
            var item = allDataDic[index4];

            if (item.haveParent) {
                clearProperty(item);
                continue;
            }

            if (!item.matchSearch) {
                clearProperty(item);
                continue;
            }
                
            clearProperty(item);

            result.push(item);

        }

        function clearProperty(item) {
            delete item.haveParent;
            delete item.matchSearch;
            delete item.key;
            delete item.parentKey;
        }

        return result;

    };


   



    //暴露接口
    exports('neatTreeDataMaker', function (options) {
        return new TreeDataMaker(options);
    });
});