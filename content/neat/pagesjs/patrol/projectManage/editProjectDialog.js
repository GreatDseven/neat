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
        this.id = neatNavigator.getUrlParam("id");
        this.domainId = neatNavigator.getUrlParam("domainId");
        this.enterpriseId = neatNavigator.getUrlParam("enterpriseId");


        this.selectedProjectTypeId = '';
        this.selectedProjectSubtypeId = '';
    };

    SubPage.prototype.init = function () {
        var that = this;

        // 初始化监听事件
        that.initEventInfo();

        // 加载当前项目信息
        that.loadData(function () {
            // 加载项目类型
            that.loadAllProjectType();

            that.loadProjectSubtype(that.selectedProjectTypeId);
        });


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
                $("#slProjectType").html(html);
                $("#slProjectType").val(that.selectedProjectTypeId);
                // 刷新下表单
                form.render('select', "form");
            });
        });
    };

    // 加载项目子类型
    SubPage.prototype.loadProjectSubtype = function (parentId) {
        var that = this;

        commonDataApi.getProChildType(base.getUserToken(), that.domainId, that.enterpriseId, parentId, function (result) {
            var resultData = {};
            resultData.data = result;

            laytpl($('#optProjectSubTypeTemplate').html()).render(resultData, function (html) {
                $("#slProjectSubtype").html(html);
                $("#slProjectSubtype").val(that.selectedProjectSubtypeId);
            });

            // 刷新下表单
            form.render('select', "form");
        });
    }

    // 加载 当前数据
    SubPage.prototype.loadData = function (callback) {
        var that = this;
        var url = '/OpenApi/OsiItem/GetOsiItem';
        var result =
               {
                   token: base.getUserToken(),
                   itemId: that.id
               };

        layui.neatDataApi.sendGet(url, result, function (result) {

            $('input[name=projectName]').val(result.proName);
            $('input[name=enterpriseName]').val(result.enterpriseName);
            $('textarea[name=discription]').val(result.desContent);
            that.selectedProjectTypeId = result.proTypeId;
            that.selectedProjectSubtypeId = result.proChildTypeId;

            callback();
        }, function (result) {
            layer.msg("获取巡检信息失败!", function () {
                that.closeDialog();
            });
        });
    }

    // 初始化监听事件（from和table）
    SubPage.prototype.initEventInfo = function () {
        var that = this;
        // 项目类型选中改变
        form.on('select(projectType)', function (data) {
            that.selectedProjectSubtypeId = '';
            // 获取选中的项目类型
            that.loadProjectSubtype(data.value);
        });

        // 提交
        form.on('submit(filterSubmit)', function (data) {
            var url = '/OpenApi/OsiItem/UpdateOsiItem?token=' + base.getUserToken();
            var result =
                {
                    proName: data.field.projectName,
                    enterpriseId: that.enterpriseId,
                    domainId: that.domainId,
                    proTypeId: data.field.projectType,
                    proChildTypeId: data.field.projectSubtype,
                    desContent: data.field.discription,
                    id: that.id
                };

            layui.neatDataApi.sendPost(url, result, function (result) {
                layer.msg('巡检项目保存成功', {
                    time: 5000, //5s后自动关闭
                    btn: ['确定']
                }, function () {
                    that.closeDialog();
                });
            }, function (errorMsg) {
                
                layer.msg('巡检项目保存失败' + errorMsg.message, {
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

    //关闭对话框
    SubPage.prototype.closeDialog = function () {
        var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
        parent.layer.close(index); //再执行关闭
    };


    exports('editProjectDialog', new SubPage());
});