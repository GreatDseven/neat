//巡检点 编辑 页面


layui.define(['jquery', 'layer', 'form', 'laytpl', 'treeview', 'laydate', 'element', 'table',
             'neat', 'neatDataApi', 'patrolPointDataApi', 'neatNavigator', 'commonDataApi'], function (exports) {



                 "use strict";
                 var $ = layui.$;

                 var form = layui.form;
                 var laytpl = layui.laytpl;

                 var layer = layui.layer;

                 var neat = layui.neat;

                 var neatDataApi = layui.neatDataApi;

                 var neatNavigator = layui.neatNavigator;

                 var commonDataApi = layui.commonDataApi;

                 var pageDataApi = layui.patrolPointDataApi;

                 var laydate = layui.laydate;

                 var table = layui.table;



                 //各个属性名称
                 var propertyNames = {
                     id: "id",
                     pointName: "pointName",
                     enterpriseName: "enterpriseName",

                     nfcBindStatus: "nfcBindingStatus",
                     qrCodeBindStatus: "qrBindingStatus",

                     projectType: "proTypeId",
                     projectSubType: "proChildTypeId",

                     enterpriseId: "enterpriseId",
                     buildingId: "buildingId",
                     keypartId: "keyPartId",
                     addr: "locationDes",

                     //项目列表的属性名
                     projectList: "pointProRelList",

                     //项目属性名
                     projectId: "itemId",
                     projectName: "itemName",
                     projectFlag: "flag"

                 }



                 var SubPage = function () {


                     this.pointId = neatNavigator.getUrlParam("pointId");
                     //this.currentNodeName = neatNavigator.getUrlParam("name");

                     this.pointInfo = null;

                     this.domainId = "";
                     this.enterpriseId = "";


                     this.optPrjType = "";
                     this.optSubType = "";

                     this.optEntId = '';
                     this.optBuildingId = "";
                     this.optKeyPartId = "";
                 };

                 //获取巡检单数据
                 SubPage.prototype._initPointInfo = function (callback) {

                     var that = this;

                     pageDataApi.getPointInfoById(neat.getUserToken(), this.pointId

                         , function (resultData) {
                             that.pointInfo = resultData;
                             callback();
                         }
                         , function () {
                             layer.msg("获取巡检点信息失败!", function () {
                                 that._closeDialog();
                             });

                         });


                 };




                 //关闭对话框
        SubPage.prototype._closeDialog = function () {
            var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
            parent.layer.close(index); //再执行关闭
        };


                 //初始化企业列表
                 SubPage.prototype._initEntList = function () {


                     var that = this;

                     form.on('select(optEntList)', function (data) {
                         //console.log(data.elem); //得到select原始DOM对象
                         //console.log(data.value); //得到被选中的值
                         //console.log(data.othis); //得到美化后的DOM对象
                         that.optEntId = data.value;
                         that._bindBuildingList();
                         that._bindPrjType();
                         that._bindPrjSubType();
                         that._bindTable();
                     });

                 };


                 //填充企业列表
                 SubPage.prototype._bindEntList = function (selectedValue) {


                     var that = this;

                     if (that.enterpriseId !== "") {


                         that.optEntId = that.enterpriseId;

                         //当前选中的是企业,所以根据 拿到 name和id直接绑定进去就可以了.

                         var entListData = [
                             {
                                 id: that.enterpriseId,
                                 name: that.pointInfo[propertyNames.enterpriseName]
                             }
                         ];

                         that._fillEntList(entListData, selectedValue);

                     }
                 };


                 //填充企业列表
                 SubPage.prototype._fillEntList = function (resultData, selectedValue) {
                     var d = {};
                     d.data = resultData;
                     d.selectedValue = selectedValue;

                     laytpl($("#optEntListTemplate").html()).render(d, function (html) {
                         var parent = $("#optEntList").html(html);
                         form.render('select', 'optEntListForm');
                     });
                 };

                 //初始化建筑列表
                 SubPage.prototype._initBuildingList = function () {

                     var that = this;

                     form.on('select(optBuilding)', function (data) {
                         //console.log(data.elem); //得到select原始DOM对象
                         //console.log(data.value); //得到被选中的值
                         //console.log(data.othis); //得到美化后的DOM对象

                         that.optBuildingId = data.value;
                         that._bindKeyPartList();

                     });
                 };

                 //绑定建筑列表
                 SubPage.prototype._bindBuildingList = function (selectedValue) {

                     var that = this;

                     if (that.optEntId === "") {
                         that._fillBuildingList([]);
                     }
                     else {

                         //根据企业的id获取建筑列表,然后绑定到select中.
                         commonDataApi.getBuildingByEntId(neat.getUserToken(), that.optEntId, function (resultData) {
                             that._fillBuildingList(resultData, selectedValue);
                         });
                     }
                 };

                 //为建筑物列表填充数据
                 SubPage.prototype._fillBuildingList = function (data, selectedValue) {
                     var d = {};
                     d.data = data;
                     d.selectedValue = selectedValue;
                     laytpl($("#optBuildingTemplate").html()).render(d, function (html) {
                         var parent = $("#optBuilding").html(html);
                         form.render('select', 'optBuildingForm');
                     });
                 };
                 //初始化部位列表
                 SubPage.prototype._initKeyPartList = function () {
                     var that = this;

                     form.on('select(optKeyPartList)', function (data) {
                         //console.log(data.elem); //得到select原始DOM对象
                         //console.log(data.value); //得到被选中的值
                         //console.log(data.othis); //得到美化后的DOM对象
                         that.optKeyPartId = data.value;

                     });
                 };

                 //绑定关键部位列表
                 SubPage.prototype._bindKeyPartList = function (selectedValue) {



                     var that = this;

                     if (that.optBuildingId === "") {
                         that._fillKeyPartList([]);
                     }
                     else {

                         //根据企业的id获取建筑列表,然后绑定到select中.
                         commonDataApi.getKeypartByBuildingId(neat.getUserToken(), that.optBuildingId, function (resultData) {
                             that._fillKeyPartList(resultData, selectedValue);
                         });
                     }
                 };
                 //向部位列表中填充数据
                 SubPage.prototype._fillKeyPartList = function (data, selectedValue) {
                     var d = {};
                     d.data = data;
                     d.selectedValue = selectedValue;
                     laytpl($("#optKeyPartListTemplate").html()).render(d, function (html) {
                         var parent = $("#optKeyPartList").html(html);
                         form.render('select', 'optKeyPartListForm');
                     });
                 };



                 //绑定 项目类型 数据
                 SubPage.prototype._bindPrjType = function (selectedValue) {

                     var that = this;

                     if (that.optEntId === "") {
                         that._fillPrjType([], selectedValue);
                     }
                     else {
                         var token = neat.getUserToken();
                         commonDataApi.getProjectType("", token, "", that.optEntId, function (resultData) {
                             that._fillPrjType(resultData, selectedValue);
                         });
                     }

                 };

                 //添加项目类型数据
                 SubPage.prototype._fillPrjType = function (resultData, selectedValue) {
                     var d = {};
                     d.data = resultData;
                     d.selectedValue = selectedValue;
                     laytpl($("#optPrjTypeTemplate").html()).render(d, function (html) {

                         var parent = $("#optPrjType").html(html);
                         form.render('select', 'optPrjTypeForm');
                     });
                 };

                 //初始化 项目类型
                 SubPage.prototype._initPrjType = function () {

                     var that = this;


                     form.on('select(optPrjType)', function (data) {
                         //console.log(data.elem); //得到select原始DOM对象
                         //console.log(data.value); //得到被选中的值
                         //console.log(data.othis); //得到美化后的DOM对象
                         that.optPrjType = data.value;


                         that._bindPrjSubType();
                         that._bindTable();
                     });



                 };
                 //初始化 项目子类型
                 SubPage.prototype._initPrjSubType = function () {

                     var that = this;


                     form.on('select(optSubType)', function (data) {
                         //console.log(data.elem); //得到select原始DOM对象
                         //console.log(data.value); //得到被选中的值
                         //console.log(data.othis); //得到美化后的DOM对象
                         that.optSubType = data.value;
                         that._bindTable();
                     });

                 };

                 //项目子类型 绑定数据
                 SubPage.prototype._bindPrjSubType = function (selectedValue) {

                     var that = this;


                     if (that.optPrjType === "") {
                         laytpl($("#optPrjSubTypeTemplate").html()).render({}, function (html) {

                             var parent = $("#optSubType").html(html);
                             form.render('select', 'optSubTypeForm');
                         });
                         return;
                     }

                     if (that.optEntId === "")
                         return;

                     var token = neat.getUserToken();

                     commonDataApi.getProChildType(token, "", that.optEntId, that.optPrjType, function (resultData) {

                         var d = {};
                         d.data = resultData;
                         d.selectedValue = selectedValue;
                         laytpl($("#optPrjSubTypeTemplate").html()).render(d, function (html) {

                             var parent = $("#optSubType").html(html);
                             form.render('select', 'optSubTypeForm');
                         });


                     });

                 };


                 //初始化项目表
                 SubPage.prototype._initTable = function () {

                     var that = this;
                     that.table = table.render({
                         elem: '#prjTable',
                         id: "prjTable",
                         data: [],
                         page: false,
                         limit: 100,
                         height: 180,
                         autoSort: false,
                         cols: [
                             [
                                 { field: 'name', title: '巡检项目名称', width: "680" },
                                 { field: 'flag', title: '是否启用', width: "120", templet: '#switchTpl' }
                             ]
                         ],
                     });


                     //监听是否启用
                     table.on('switch(prjTable)', function (obj) {

                         layer.tips(this.value + ' ' + this.name + '：' + obj.elem.checked, obj.othis);
                     });
                 }

                 //绑定项目表
                 SubPage.prototype._bindTable = function (selectedData) {

                     var that = this;

                     if (that.optEntId === "" || that.optSubType === "") {
                         that._fillTable([]);
                     }
                     else {
                         commonDataApi.GetOsiProjectItemsBySubjectType(neat.getUserToken(), "", that.optEntId, that.optSubType, function (resultData) {
                             that._fillTable(resultData, selectedData);
                         });
                     }

                 };

                 //项目表 填充数据
                 SubPage.prototype._fillTable = function (data,selectedData) {

                     var finalData = [];


                     function findFlagById( id) {

                         
                         var result = 2;

                         for (var i = 0; i < selectedData.length; i++) {
                             if (selectedData[i][propertyNames.projectId] == id) {
                                 
                                 return selectedData[i][propertyNames.projectFlag];
                             }
                         }
                         

                         return result;
                     }

                     $.each(data, function (_, item) {

                         
                         var flag = 2;

                         if (selectedData) {

                             flag = findFlagById(item.id);
                            
                         }
                         else {
                             //如果没有默认选中值,则表示是选择了一个新的子类型,加载新子类型的项目时,默认选中.
                             flag = 1;
                         }
                        
                         finalData.push({
                             id: item.id,
                             name: item.name,
                             flag: flag
                         });
                        

                     });


                     table.reload("prjTable", {
                         data: finalData,
                     });
                 };

                 //填充标签绑定状态
                 SubPage.prototype._fillBindStatus = function () {

                     var nfcStatus = this.pointInfo[propertyNames.nfcBindStatus];
                     var qrcodeStatus = this.pointInfo[propertyNames.qrCodeBindStatus];
                     if (nfcStatus) {
                         $("input[name='bind[nfc]']").attr("checked", true);
                     }
                     else {
                         $("input[name='bind[nfc]']").attr("checked", false);
                     }

                     if (qrcodeStatus) {
                         $("input[name='bind[qrcode]']").attr("checked", true);
                     }
                     else {
                         $("input[name='bind[qrcode]']").attr("checked", false);
                     }

                     form.render(null, "bindStatusForm");
                 };


                 SubPage.prototype._initSaveEvent = function () {

                     var that = this;
                     form.on('submit(btnSave)', function (formData) {

          

                         var prjItems = $("input[name='prjItems']");

                         if (prjItems.length === 0) {
                             layer.msg("请指定巡检项目");
                             return false;
                         }

                         $("#btnSave").attr("disabled", true);


                         var data = {
                             id:that.pointInfo[propertyNames.id],
                             pointName: $.trim(formData.field.txtPointName),
                             proTypeId: formData.field.optPrjType,
                             proChildTypeId: formData.field.optSubType,
                             enterpriseId: formData.field.optEntList,
                             buildingId: formData.field.optBuilding,
                             keyPartId: formData.field.optKeyPartList,
                             locationDes: $.trim(formData.field.txtAddr),
                             pointProRelList: []


                         };

                         $.each(prjItems, function (index, item) {

                             var id = $(item).data("prj-id");
                             var flag = $(item).val();
                             data.pointProRelList.push({
                                 itemId: id,
                                 flag: flag
                             });

                         });



                         var token = neat.getUserToken();

                         pageDataApi.updatePatrolPoint(token, data
                             , function (sd) { //保存成功


                                 layer.msg("保存成功!", { time: 1500 }, function () {

                                     that._closeDialog();

                                 });
                             }, function (fd) {//保存失败

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

                 SubPage.prototype._initVerify = function () {

                     var that = this;
                     //自定义验证规则
                     form.verify({
                         txtPointName: function (value) {
                             if (value.length === 0) {
                                 return "请输入巡检点名称";
                             } else if (value.length > 100) {
                                 return "巡检点名称超长(最长100字)";
                             }
                         },
                         optEntList: function (value) {
                             if (value.length === 0) {
                                 return "请选择所属单位";
                             }
                         },
                         optBuilding: function (value) {
                             if (value.length === 0) {
                                 return "请选择所属建筑";
                             }
                         },
                         optKeyPartList: function (value) {
                             if (value.length === 0) {
                                 return "请选择所属部位";
                             }
                         },
                         txtAddr: function (value) {
                             if (value.length === 0) {
                                 return "请输入详细位置";
                             }
                             else if (value.length > 100) {
                                 return "详细位置超长(最长100字)";
                             }
                         },
                         optPrjType: function (value) {
                             if (value.length === 0) {
                                 return "请选择项目类型";
                             }
                         },
                         optSubType: function (value) {
                             if (value.length === 0) {
                                 return "请选择项目子类型";
                             }
                         }

                     });

                 };

                 //初始化
                 SubPage.prototype.init = function () {

                     var that = this;

                     this._initPointInfo(function () {


                         that.enterpriseId = that.pointInfo[propertyNames.enterpriseId];
                         that.optBuildingId = that.pointInfo[propertyNames.buildingId];
                         that.optKeyPartId = that.pointInfo[propertyNames.keypartId];
                         that.optBuildingId = that.pointInfo[propertyNames.buildingId];


                         that.optPrjType = that.pointInfo[propertyNames.projectType];
                         that.optSubType = that.pointInfo[propertyNames.projectSubType];

                         //填充巡检点名称
                         $("#txtPointName").val(that.pointInfo[propertyNames.pointName]);

                         //填充绑定类型
                         that._fillBindStatus();

                         //填充企业列表,并选中相应的值
                         that._bindEntList(that.enterpriseId);

                         //填充建筑列表,并选中相应的值
                         that._bindBuildingList(that.optBuildingId);

                         //填充部位列表,并选中相应的值
                         that._bindKeyPartList(that.optKeyPartId);

                         //填充详细地址
                         $("#txtAddr").val(that.pointInfo[propertyNames.addr]);

                         //填充项目类型,并选中相应的值
                         that._bindPrjType(that.optPrjType);

                         //填充项目子类型,并选中相应的值
                         that._bindPrjSubType(that.optSubType);

                         that._initTable();

                         //填充项目列表,并选中相应的状态
                         that._bindTable(that.pointInfo[propertyNames.projectList]);



                         that._initEntList();
                         that._initBuildingList();
                         that._initKeyPartList();

                         that._initPrjType();
                         that._initPrjSubType();




                     })


                  

                     $("#btnCancel").on("click", function () {
                         that._closeDialog();
                     });


                     that._initSaveEvent();

                     that._initVerify();

                   
                     form.on('switch(useStatus)', function (data) {

                         if (this.checked) {
                             this.value = 1
                         }
                         else {
                             this.value = 2
                         }

                     });

                     form.render();

                 };



                
               



                 exports("pagePatrolPointEdit", new SubPage());

             });