layui.define(["jquery", 'form', 'laytpl', 'commonDataApi', 'neatDataApi', 'neat', 'neatNavigator'], function (exports) {
  
    "use strict";

    var $ = layui.$;
    var form = layui.form;
    var laytpl = layui.laytpl;
    var commonDataApi = layui.commonDataApi;
    var neatDataApi = layui.neatDataApi;
    var neatNavigator = layui.neatNavigator;
    var base = layui.neat;

    var SubPage = function () {
        this.domainId = neatNavigator.getUrlParam("domainId");
        this.enterpriseId = neatNavigator.getUrlParam("enterpriseId");
        this.currentNodeName = neatNavigator.getUrlParam("name");
    };

    SubPage.prototype.init = function () {
        var that = this;

        // 初始化监听事件
        that.initEventInfo();

        // 加载项目类型
        that.loadAllProjectType();

        // 加载 项目类型
        that.loadData();


        $('#btnCancel').on('click', function () {
            that.closeDialog();
        });
    };

    // 获取搜索框中的项目类型集合
    SubPage.prototype.loadAllProjectType = function () {
        var that = this;

        commonDataApi.getProjectType('', base.getUserToken(), that.domainId, that.enterpriseId, function (result) {
            var resultData = {};
            resultData.data = result;

            laytpl($('#optProjectTypeTemplate').html()).render(resultData, function (html) {
                var parent = $("#slProjectType").html(html);
            });

            // 刷新下表单
            form.render('select', "form");
        });
    };

    SubPage.prototype.loadProjectSubtype = function (parentId) {
        var that = this;

        commonDataApi.getProChildType(base.getUserToken(), that.domainId, that.enterpriseId, parentId, function (result) {
            var resultData = {};
            resultData.data = result;

            laytpl($('#optProjectSubTypeTemplate').html()).render(resultData, function (html) {
                var parent = $("#slProjectSubtype").html(html);
            });

            // 刷新下表单
            form.render('select', "form");
        });
    }

    // 初始化监听事件（from和table）
    SubPage.prototype.initEventInfo = function () {
        var that = this;
        // 项目类型选中改变
        form.on('select(projectType)', function (data) {
            // 获取选中的项目类型
            that.loadProjectSubtype(data.value);
        });

        // 提交
        form.on('submit(filterSubmit)', function (data) {
            var url = '/OpenApi/OsiItem/AddOsiItem?token=' + base.getUserToken();
            var result =
                {
                    proName: data.field.projectName,
                    enterpriseId: that.enterpriseId,
                    domainId: that.domainId,
                    proTypeId: data.field.projectType,
                    proChildTypeId: data.field.projectSubtype,
                    desContent: data.field.discription
                };

            layui.neatDataApi.sendPost(url, result, function (result) {
                layer.msg('巡检项目添加成功', {
                    time: 5000, //5s后自动关闭
                    btn: ['确定']
                }, function () {
                    that.closeDialog();
                });
            }, function (errorMsg) {
                
                layer.msg('巡检项目添加失败' + errorMsg.message, {
                    time: 5000, //5s后自动关闭
                    btn: ['确定']
                }, function () { that.closeDialog(); });
            });
        });

        //自定义验证规则
        form.verify({
            projectType: function (value) {
                if (value.length == 0) {
                    return '请选择项目类型';
                }
            }
          , projectSubtype: function (value) {
              if (value.length == 0) {
                  return '请选择项目子类型';
              }
          }, projectName: function (value) {
              if (value.length == 0) {
                  return '请输入巡检项目名称';
              } else if (value.length < 2) {
                  return '巡检项目名称不能少于两个字'
              }
          }, discription: function (value) {
              if (value.length == 0) {
                  return '请输入项目描述';
              } else if (value.length < 5) {
                  return '项目描述不能少于5个字'
              }
          }
          , content: function (value) {
              layedit.sync(editIndex);
          }
        });
    };

    // 加载数据
    SubPage.prototype.loadData = function () {
        var that = this;
        $('#txtEnterpriseName').val(that.currentNodeName);
    }

    // 关闭当前的dialog
    SubPage.prototype.closeDialog = function () {
        var index = parent.layer.getFrameIndex(window.name);
        parent.layer.close(index);
    };

    exports('createProjectDialog', new SubPage());
});