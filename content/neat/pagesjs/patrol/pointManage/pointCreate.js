//巡检点创建页面


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



                 var SubPage = function () {

                     this.domainId = neatNavigator.getUrlParam("domainId");
                     this.enterpriseId = neatNavigator.getUrlParam("enterpriseId");
                     this.currentNodeName = neatNavigator.getUrlParam("name");

                     this.optPrjType = "";
                     this.optSubType = "";

                     this.optEntId = '';
                     this.optBuildingId = "";
                     this.optKeyPartId = "";
                 };




                 //关闭对话框
                 SubPage.prototype._closeDialog = function () {
                     var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
                     parent.layer.close(index); //再执行关闭
                 };


                 //初始化企业列表
                 SubPage.prototype._initEntList = function () {


                     var that = this;
                     if (that.domainId !== "") {
                         //当前选中的是中心,
                         //根据中心id获取中心下企业列表,然后绑定到select中.
                         commonDataApi.getEntByDomainId(neat.getUserToken(), that.domainId, function (resultData) {

                             var d = {};
                             d.data = resultData;
                             laytpl($("#optEntListTemplate").html()).render(d, function (html) {
                                 var parent = $("#optEntList").html(html);
                                 form.render('select', 'optEntListForm');
                             });


                         });

                     }
                     else if (that.enterpriseId !== "") {
                         that.optEntId = that.enterpriseId;

                         //当前选中的是企业,所以根据 拿到 name和id直接绑定进去就可以了.
                         var d = {};
                         d.data = [
                             {
                                 id: that.enterpriseId,
                                 name: that.currentNodeName
                             }
                         ];
                         laytpl($("#optEntListTemplate").html()).render(d, function (html) {
                             var parent = $("#optEntList").html(html);
                             form.render('select', 'optEntListForm');
                         });
                     }


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
                 SubPage.prototype._bindBuildingList = function () {

                     var that = this;

                     if (that.optEntId === "") {
                         that._fillBuildingList([]);
                     }
                     else {

                         //根据企业的id获取建筑列表,然后绑定到select中.
                         commonDataApi.getBuildingByEntId(neat.getUserToken(), that.optEntId, function (resultData) {
                             that._fillBuildingList(resultData);
                         });
                     }
                 };

                 //为建筑物列表填充数据
                 SubPage.prototype._fillBuildingList = function (data) {
                     var d = {};
                     d.data = data;
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
                 SubPage.prototype._bindKeyPartList = function () {



                     var that = this;

                     if (that.optBuildingId === "") {
                         that._fillKeyPartList([]);
                     }
                     else {

                         //根据企业的id获取建筑列表,然后绑定到select中.
                         commonDataApi.getKeypartByBuildingId(neat.getUserToken(), that.optBuildingId, function (resultData) {
                             that._fillKeyPartList(resultData);
                         });
                     }
                 };
                 //向部位列表中填充数据
                 SubPage.prototype._fillKeyPartList = function (data) {
                     var d = {};
                     d.data = data;
                     laytpl($("#optKeyPartListTemplate").html()).render(d, function (html) {
                         var parent = $("#optKeyPartList").html(html);
                         form.render('select', 'optKeyPartListForm');
                     });
                 };



                 //绑定 项目类型 数据
                 SubPage.prototype._bindPrjType = function () {

                     var that = this;

                     if (that.optEntId === "") {
                         that._fillPrjType([]);
                     }
                     else {
                         var token = neat.getUserToken();
                         commonDataApi.getProjectType("", token, "", that.optEntId, function (resultData) {
                             that._fillPrjType(resultData);
                         });
                     }

                 };

                 //添加项目类型数据
                 SubPage.prototype._fillPrjType = function (resultData) {
                     var d = {};
                     d.data = resultData;
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

                     laytpl($("#optPrjSubTypeTemplate").html()).render({}, function (html) {

                         var parent = $("#optSubType").html(html);
                         form.render('select', 'optSubTypeForm');
                     });

                     form.on('select(optSubType)', function (data) {
                         //console.log(data.elem); //得到select原始DOM对象
                         //console.log(data.value); //得到被选中的值
                         //console.log(data.othis); //得到美化后的DOM对象
                         that.optSubType = data.value;
                         that._bindTable();
                     });

                 };

                 //项目子类型 绑定数据
                 SubPage.prototype._bindPrjSubType = function () {

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
                         //initSort: {
                         //    field: that.currentSortColumn,
                         //    type: that.currentSortOrder
                         //},
                         cols: [
                             [
                                 { field: 'name', title: '巡检项目名称', width: "680" },
                                 { field: 'status', title: '是否启用', width: "120", templet: '#switchTpl' }
                             ]
                         ],
                     });


                     //监听是否启用
                     table.on('switch(prjTable)', function (obj) {

                         layer.tips(this.value + ' ' + this.name + '：' + obj.elem.checked, obj.othis);
                     });
                 }

                 //绑定项目表
                 SubPage.prototype._bindTable = function () {

                     var that = this;

                     if (that.optEntId === "" || that.optSubType === "") {
                         that._fillTable([]);
                     }
                     else {
                         commonDataApi.GetOsiProjectItemsBySubjectType(neat.getUserToken(), "", that.optEntId, that.optSubType, function (resultData) {
                             that._fillTable(resultData);
                         });
                     }

                 };

                 //项目表 填充数据
                 SubPage.prototype._fillTable = function (data) {
                     table.reload("prjTable", {
                         data: data,
                     });
                 };



                 //初始化
                 SubPage.prototype.init = function () {

                     var that = this;

                     this._initPrjType();
                     this._initPrjSubType();

                     this._initEntList();
                     this._initBuildingList();
                     this._initKeyPartList();

                     that._initTable();

                     $("#btnCancel").on("click", function () {
                         that._closeDialog();
                     });



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

                     form.on('submit(btnSave)', function (formData) {



                         var prjItems = $("input[name='prjItems']");

                         if (prjItems.length === 0) {
                             layer.msg("请指定巡检项目");
                             return false;
                         }

                         $("#btnSave").attr("disabled", true);

                         var data = {

                             pointName: $.trim(formData.field.txtPointName),
                             proTypeId: formData.field.optPrjType,
                             childTypeID: formData.field.optSubType,
                             entId: formData.field.optEntList,
                             buildingId: formData.field.optBuilding,
                             keypartId: formData.field.optKeyPartList,
                             locationDes: $.trim(formData.field.txtAddr),
                             childTypes: []
                         };

                         $.each(prjItems, function (index, item) {

                             var id = $(item).data("prj-id");
                             var flag = $(item).val();
                             data.childTypes.push({
                                 itemId: id,
                                 flag: flag
                             });

                         });



                         var token = neat.getUserToken();

                         pageDataApi.createPatrolPoint(token, data
                             , function (sd) {


                                 layer.msg("保存成功!", { time: 1500 }, function () {

                                     that._closeDialog();

                                 });
                             }, function (fd) {

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




                 exports("pagePatrolPointCreate", new SubPage());

             });