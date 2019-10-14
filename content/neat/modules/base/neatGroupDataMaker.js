//把列表数据,根据一个字段或者几个字段进行分组.

layui.define(['jquery'], function (exports) {
    "use strict";

    var $ = layui.$;

    var GroupDataMaker = function () { };


    //对数据 分组
    GroupDataMaker.prototype.make = function (data, categoryProps) {

        /**
          var data = [{
            id="",
            name="",
            domainName="",
            entName=''
            }];
           var  categoryProps = ["entName","domainName"];

          //结果的结构
          var result = [
          {
                groupName:"";
                children:[]
          },
           {
                groupName:"";
                children:[]
          }
         ];
         */


        var categoryPropertyName = '$categoryValue';

        //从对象中获取指定数据的值
        function getPropertyValue(item, propName) {
            if (!item || !propName) {
                return "";
            }

            if (typeof item[propName] === "undefined") {
                return "";
            }

            if (!item[propName] ) {
                return "";
            }

            return item[propName].toString();
        }
        //计算对象的分类属性值
        function setCategoryValue(item, properties) {
            var result = "";

            //从头开始,按优先级,第一个取到值的属性作为分类标准
            //例如  categoryProps = ["entName","domainName"] 时,
            //如果 item.entName 的属性值存在,那么 分类的类别名称就是 entName
            //如果 item.entName 的属性值不存在,再看看domainName的值
            for (var i = 0; i < properties.length; i++) {
                result = getPropertyValue(item, properties[i]);
                if (result !== "") {
                    item[categoryPropertyName] = result;
                    break;
                }
            }

        }
        //根据分类属性值排序
        function sortByCategoryValue(a, b) {
            return a[categoryPropertyName] >  b[categoryPropertyName]?1:-1;
        }

        var tmpResult = [];

        $.each(data, function (_, dataItem) {
            setCategoryValue(dataItem, categoryProps);
            tmpResult.push(dataItem);
        });

        tmpResult.sort(sortByCategoryValue);

        var result = [];

        var lastCategory = null;

        $.each(tmpResult, function (_, dataItem) {
            var currentCategory = dataItem[categoryPropertyName];

            //delete dataItem[categoryPropertyName];

            if (lastCategory === currentCategory) {
                result[result.length - 1].children.push(dataItem);
            }
            else
            {
                lastCategory = currentCategory;
                var agroup = {
                    groupName: currentCategory,
                    children: [dataItem]
                };
                result.push(agroup);
            }
        });

        return result;

    };
       



    //暴露接口
    exports('neatGroupDataMaker', new GroupDataMaker());
});