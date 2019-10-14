//巡检任务创建页面


layui.define(['jquery', 'layer', 'form', 'laytpl', 'treeview','laydate',
             'neat', 'neatDataApi', 'neatDataApi', 'neatTreeDataMaker', 'neatNavigator', 'commonDataApi', 'patrolPointDataApi', 'patrolTaskDataApi', "neatGroupDataMaker"], function (exports) {



                 "use strict";
                 var $ = layui.$;

                 var form = layui.form;
                 var laytpl = layui.laytpl;
                
                 var layer = layui.layer;

                 var neat = layui.neat;

                 var neatDataApi = layui.neatDataApi;

                 var treeDataMaker = layui.neatTreeDataMaker({
                     idPropertyName:"id",
                     parentIdPropertyName:"parentId",
                     namePropertyName:  "name",
                     childrenPropertyName: "nodes"

                 });

                 var neatNavigator = layui.neatNavigator;

                 var commonDataApi = layui.commonDataApi;

                 var pointDataApi = layui.patrolPointDataApi;

                 var taskDataApi = layui.patrolTaskDataApi;

                 var groupDataTools = layui.neatGroupDataMaker;

                 var laydate = layui.laydate;

                 
               
                 var SubPage = function () {

                     this.optFrequence = "";

                     this.startDate = null;
                     this.endDate = null;

                     this.domainId = neatNavigator.getUrlParam("domainId");
                     this.enterpriseId = neatNavigator.getUrlParam("enterpriseId");

                 };


                 //初始化任务执行频率
                 SubPage.prototype._initFrequency = function () {

                     var that = this;


                     //nodeId=79b8faa2-c960-41cc-8136-c76c3fb57043/nodeType=2
                     //获取频率
                     commonDataApi.getFrequency(neat.getUserToken(), that.domainId, that.enterpriseId, function (frequenceData) {

                         var d = {};
                         d.data = frequenceData;
                         laytpl($("#optFrequenceTemplate").html()).render(d, function (html) {

                             var parent = $("#optFrequence").html(html);
                             form.render('select', 'optFrequenceForm');
                         });


                     });

                     form.on('select(optFrequence)', function (data) {
                         //console.log(data.elem); //得到select原始DOM对象
                         //console.log(data.value); //得到被选中的值
                         //console.log(data.othis); //得到美化后的DOM对象
                         that.optFrequence = data.value;

                     });
                 };

                 //初始化任务执行人类型(角色或者人员)
                 SubPage.prototype._initExecutorType = function () {
                     var that = this;

                     commonDataApi.getTaskExecutorTypeData(function (resultData) {

                         var d = {};
                         d.data = resultData;
                         laytpl($("#optExecutorTypeTemplate").html()).render(d, function (html) {

                             var parent = $("#optExecutorType").html(html);
                             form.render('select', 'optExecutorTypeForm');
                         });


                     });

                     form.on('select(optExecutorType)', function (data) {
                         //console.log(data.elem); //得到select原始DOM对象
                         //console.log(data.value); //得到被选中的值
                         //console.log(data.othis); //得到美化后的DOM对象
                         that.optExecutorType = data.value;

                         that._bindExecutorList();

                     });
                 };

                 //初始化任务执行人/角色列表
                 SubPage.prototype._initExecutorList = function () {
                     var that = this;
                     form.on('select(optExecutorList)', function (data) {
                         //console.log(data.elem); //得到select原始DOM对象
                         //console.log(data.value); //得到被选中的值
                         //console.log(data.othis); //得到美化后的DOM对象
                         that.optExecutorList = data.value;

                     });
                 };

                 //绑定任务执行人/角色列表
                 SubPage.prototype._bindExecutorList = function () {
                     var that = this;

                     if (that.optExecutorType == "1") {//角色

                         taskDataApi.getPatrolTaskRoles(neat.getUserToken(), that.domainId, that.enterpriseId, function (roleData) {

                             var d = {};
                             d.data = groupDataTools.make(roleData, ["entName", "domainName"]);;
                             laytpl($("#optRoleListTemplate").html()).render(d, function (html) {

                                 var parent = $("#optExecutorList").html(html);
                                 form.render('select', 'optExecutorListForm');
                             });


                         });
                     }
                     else if (that.optExecutorType == "2") { //人员

                         taskDataApi.getPatrolTaskUsers(neat.getUserToken(), that.domainId, that.enterpriseId, function (roleData) {

                             var d = {};
                             d.data = groupDataTools.make(roleData, ["entName", "domainName"])
                             laytpl($("#optUserListTemplate").html()).render(d, function (html) {

                                 var parent = $("#optExecutorList").html(html);
                                 form.render('select', 'optExecutorListForm');
                             });


                         });
                     }
                     else {

                         laytpl($("#optExecutorListTemplate").html()).render({}, function (html) {

                             var parent = $("#optExecutorList").html(html);
                             form.render('select', 'optExecutorListForm');
                         });
                     }


                 };

                 // 获取今天
                 SubPage.prototype._getToday = function () {
                     var date = new Date();
                     return date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();

                 };

                 //初始化起止日期
                 SubPage.prototype._initDate = function () {

                     var that = this;

                     laydate.render({
                         elem: '#dateSpan', //指定元素
                         type: 'date',
                         range: "~",
                         min: this._getToday(),
                         format: "yyyy-MM-dd",
                         trigger: "click",
                         done: function (value, startDate, endDate) {

                             //console.log(value); //得到日期生成的值，如：2017-08-18
                             //console.log(startDate); //得到日期时间对象：{year: 2017, month: 8, date: 18, hours: 0, minutes: 0, seconds: 0}
                             //console.log(endDate); //得结束的日期时间对象，开启范围选择（range: true）才会返回。对象成员同上。

                             that.startDate = startDate;
                             that.endDate = endDate;
                         }

                     });

                 };

                 //初始化起止时间
                 SubPage.prototype._initTime = function () {

                     var that = this;

                     laydate.render({
                         elem: '#timeSpan', //指定元素
                         type: 'time',
                         range: "~",
                         format: "yyyy-MM-dd",
                         trigger: "click",
                         done: function (value, startTime, endTime) {

                             //console.log(value); //得到日期生成的值，如：2017-08-18
                             //console.log(startDate); //得到日期时间对象：{year: 2017, month: 8, date: 18, hours: 0, minutes: 0, seconds: 0}
                             //console.log(endDate); //得结束的日期时间对象，开启范围选择（range: true）才会返回。对象成员同上。

                             that.startTime = startTime;
                             that.endTime = endTime;
                         }

                     });

                 };

                 //关闭对话框
        SubPage.prototype._closeDialog = function () {
            var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
            parent.layer.close(index); //再执行关闭
        };

                 //初始化树
                 SubPage.prototype._initTree = function () {
                     var that = this;
                     pointDataApi.getPatrolPointTree(neat.getUserToken(),that.domainId,that.enterpriseId, function (treeRawData) {


                         if (treeRawData.length === 0) {
                             layer.msg("该单位下没有巡检点,请首先添加巡检点!", { time: 2000 }, function () {

                                 that._closeDialog();
                             });
                         }
                       
                         var finalTreeData = treeDataMaker.make(treeRawData, "");

                         that._bindTreeData(finalTreeData);
                     });
                 }

                 //给树绑定数据
                 SubPage.prototype._bindTreeData = function(treeData) {

                     // 加载树
                     var mytree = $('#treeview').treeview({
                         showCheckbox: true,
                         data: treeData,
                         onNodeChecked: function (event, data) {
                             $.each(data.nodes, function (_, item) {
                                 mytree.treeview('checkNode', [item.nodeId,{ silent: false }]);
                             });
                         }, 
                         onNodeUnchecked: function (event, data) {
                             $.each(data.nodes, function (_, item) {
                                 mytree.treeview('uncheckNode', [item.nodeId, { silent: false }]);
                             });
                         }
                         
                     });

                 }

                 //表单提交事件
                 SubPage.prototype._initFormSubmit = function () {

                     function splitDateTimeSpan(str) {
                         return str.split(" ~ ");
                     }

                     var that = this;
                     form.on('submit(btnSave)', function (formData) {

                         var points = that._getCheckedPoint();
                         if (points.length === 0) {

                             layer.msg("请选择巡检点!");
                             return false;
                         }

                        

                         var dateSpan = splitDateTimeSpan(formData.field.dateSpan);
                         var timeSpan = splitDateTimeSpan(formData.field.timeSpan);

                         if (dateSpan[0] == dateSpan[1] && timeSpan[0] == timeSpan[1]) {
                             layer.msg("起止日期和起止时间错误!");
                             return;
                         }


                         $("#btnSave").attr("disabled", true);
                         var postData = {

                             "taskName": $.trim(formData.field.txtTaskName),
                             "rateId": formData.field.optFrequence,
                             "entId": that.enterpriseId,
                             "beginDate": dateSpan[0],
                             "endDate": dateSpan[1],
                             "beginTime": timeSpan[0],
                             "endTime": timeSpan[1],
                             "taskDes": $.trim(formData.field.taskDesc),
                             "uId": formData.field.optExecutorList,
                             "uIdType": formData.field.optExecutorType,
                             "pointInfoIds": [
                                
                             ]

                         };

                         $.each(points, function (_, item) {

                             postData.pointInfoIds.push({
                                 itemId: item.id
                             });
                         });

                         var token = neat.getUserToken();

                         taskDataApi.addPatrolTask(token, postData
                             , function (sd) {//成功

                                 
                                 layer.msg("保存成功!", { time: 1500 }, function () {

                                     that._closeDialog();

                                 });

                             }, function (fd) {//失败
                                 $("#btnSave").attr("disabled", false);
                                 if (typeof fd.message ==="string"){
                                     layer.msg(fd.message);
                                 }
                                 else {
                                     layer.msg("保存失败!");
                                 }
                                     
                         });

                         return false;
                     });
                 };

                 //form表单校验
                 SubPage.prototype._initFormVerify = function () {


                     form.verify({
                         txtTaskName: function (value) {
                             if (value.length == 0) {
                                 return "请输入任务名称";
                             } else if (value.length > 100) {
                                 return "任务名称超长(最长100字)";
                             }
                         },
                         optFrequence: function (value) {
                             if (value.length == 0) {
                                 return "请选择巡检频率";
                             }
                         },
                        
                         dateSpan: function (value) {
                             if (value.length == 0) {
                                 return "请选择起止日期";
                             }
                         },
                         timeSpan: function (value) {
                             if (value.length == 0) {
                                 return "请选择起止时间";
                             }
                         },
                         optExecutorType: function (value) {
                             if (value.length == 0) {
                                 return "请选择巡检人类型";
                             }
                         },
                         optExecutorList: function (value) {
                             if (value.length == 0) {
                                 return "请选择角色名/人员名";
                             }
                         },
                         taskDesc: function (value) {
                             if (value.length == 0) {
                                 return "请输入任务描述";
                             }
                             else if (value.length > 500) {
                                 return "任务描述超长(最长500字)";
                             }
                         },



                     });
                 };

                 //获取已经勾选的巡检点
                 SubPage.prototype._getCheckedPoint = function () {
                     //先验证是否选择了巡检点

                     var checkedNodes = $('#treeview').treeview("getChecked");

                     var result = [];

                     $.each(checkedNodes, function (_, item) {
                         if (item.type == "5") { //type =5 表示为巡检点
                             result.push(item);
                         }
                     });

                     return result;


                 }


                //初始化
                 SubPage.prototype.init = function () {

                     var that = this;

                     that._initFrequency();
                     that._initExecutorType();
                     that._initExecutorList();
                     that._initDate();
                     that._initTime();
                     that._initTree();

                     that._initFormVerify();

                     that._initFormSubmit();


                     $("#btnCancel").on("click", function () {
                         that._closeDialog();
                     });


                     $("#btnCheckAll").on("click", function () {

                         $('#treeview').treeview('checkAll', { silent: true });

                     });
                     $("#btnUnCheckAll").on("click", function () {

                         $('#treeview').treeview('uncheckAll', { silent: true });

                     });


                     form.render();

                 };

 



                 exports("pagePatrolTaskCreate", new SubPage());

             });