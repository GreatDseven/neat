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

        this.projectTypeId = '';
        this.selectEnterpriseId = '';
    };

    SubPage.prototype.init = function () {
        var that = this;

        // 初始化监听事件
        that.initEventInfo();

        // 加载项目类型
        that.loadAllProjectType();

        $("#deptName").val(that.currentNodeName);

        $('#btnCancel').on('click', function () {
            var index = parent.layer.getFrameIndex(window.name);
            parent.layer.close(index);
        });

        $('#username').val(base.getCurrentUserInfo());
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

    // 初始化监听事件（from和table）
    SubPage.prototype.initEventInfo = function () {
        var that = this;

        // 单位名称选中改变
        form.on('select(enterpriseName)', function (data) {
            // 获取选中的项目类型
            that.selectEnterpriseId = data.value
        });

        // 项目类型称选中改变
        form.on('select(projectType)', function (data) {
            // 获取选中的项目类型
            that.projectTypeId = data.value
        });

        // 提交
        form.on('submit(filterSubmit)', function (data) {
            var url = '/OpenApi/OsiItem/AddChildProType?token=' + base.getUserToken();
            var result =
                {
                    childTypeName: data.field.txtProjectSubTypeName,
                    parentTypeId: data.field.slProjectType,
                    enterpriseId: that.enterpriseId,
                    domainId: that.domainId
                };
            layui.neatDataApi.sendPost(url, result, function (result) {
                layer.msg('项目类型添加成功', {
                    time: 5000, //5s后自动关闭
                    btn: ['确定']
                }, function () {
                    that.closeDialog();
                });
            }, function (errorMsg) {
                layer.msg('项目子类型添加失败' + errorMsg.message, {
                    time: 5000, //5s后自动关闭
                    btn: ['确定']
                }, function () { that.closeDialog() });
            });
        });

        //自定义验证规则
        form.verify({
            projectSubTypeName: function (value) {
                if (value.length == 0) {
                    return '请输入项目子类型';
                }
                else if (value.length < 3) {
                    return '项目子类型至少得3个字符';
                }
            }
          , projectType: function (value) {
              if (value.length == 0) {
                  return '请选择项目类型';
              }
          }
          , content: function (value) {
              layedit.sync(editIndex);
          }
        });
    };

    // 关闭当前对话框
    SubPage.prototype.closeDialog = function () {
        var index = parent.layer.getFrameIndex(window.name);
        parent.layer.close(index);
    };

    exports('createProjectSubtypeDialog', new SubPage());
});