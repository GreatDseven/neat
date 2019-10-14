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
    };

    SubPage.prototype.init = function () {
        var that = this;

        // 初始化监听事件
        that.initEventInfo();

        // 加载当前项目信息
        that.loadData(function () {
            // 加载项目类型
            that.loadAllProjectType();
        });

        // 关闭方法
        $('#deleBtn').on('click', function () {
            that.closeDialog();
        });

        $('#btnCancel').on('click', function () {
            that.closeDialog();
        });


        form.render();
    };

    // 加载所属单位列表
    SubPage.prototype.loadEnterprise = function () {
        var that = this;

        // 获取单位信息，并渲染单位列表
        commonDataApi.getEntByDomainId(base.getUserToken(), that.domainId, function (result) {
            laytpl($('#optEnterpriseTemplate').html()).render(result, function (html) {
                // 将模板数据添加到select组件上
                $('#slEnterpriseName').html(html);
                $('#slEnterpriseName').val(that.selectedEnterpriseId);

                form.render('select', 'form');
            });
        });
    };

    // 加载 当前数据
    SubPage.prototype.loadData = function (callback) {
        var that = this;
        var url = '/OpenApi/OsiItem/GetChildProType';
        var result =
               {
                   token: base.getUserToken(),
                   typeId: that.id
               };

        layui.neatDataApi.sendGet(url, result, function (result) {
            $('#txtProjectSubTypeName').val(result.typeName);
            $('input[name=txtEnterpriseName]').val(result.entName);
            that.selectedProjectTypeId = result.parentId;
            that.domainId = result.domainId;
            that.enterpriseId = result.entId;
            
            callback();

        }, function (result) {
            layer.msg('获取子类型失败', function () { that.closeDialog(); });
        });
    }

    // 获取搜索框中的项目类型集合
    SubPage.prototype.loadAllProjectType = function () {
        var that = this;

        commonDataApi.getProjectType('', base.getUserToken(), that.domainId, that.enterpriseId, function (result) {
            var resultData = {};
            resultData.data = result;

            laytpl($('#optProjectTypeTemplate').html()).render(resultData, function (html) {
                var parent = $("#slProjectType").html(html);
                $("#slProjectType").val(that.selectedProjectTypeId);
            });

            // 刷新下表单
            form.render('select', "form");
        });
    };

    // 初始化监听事件（from和table）
    SubPage.prototype.initEventInfo = function () {
        var that = this;

        // 项目类型称选中改变
        form.on('select(projectType)', function (data) {
            // 获取选中的项目类型
            that.projectTypeId = data.value
        });

        // 提交
        form.on('submit(filterSubmit)', function (data) {
            var url = '/OpenApi/OsiItem/UpdateChildProType?token=' + base.getUserToken();
            var result =
                {
                    typeId: that.id,
                    childTypeName: data.field.txtProjectSubTypeName,
                    parentTypeId: data.field.slProjectType,
                    enterpriseId: that.enterpriseId,
                    domainId: that.domainId
                };
            layui.neatDataApi.sendPost(url, result, function (result) {
                layer.msg('项目子类型保存成功', {
                    time: 5000, //5s后自动关闭
                    btn: ['确定']
                }, function () {
                    that.closeDialog();
                });
            }, function (errorMsg) {
                
                layer.msg('项目子类型保存失败' + errorMsg.message, {
                    time: 5000, //5s后自动关闭
                    btn: ['确定']
                }, function () { that.closeDialog(); });
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

    //关闭对话框
    SubPage.prototype.closeDialog = function () {
        var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
        parent.layer.close(index); //再执行关闭
    };

    exports('editProjectSubtypeDialog', new SubPage());
});