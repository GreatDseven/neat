//智慧用电网关 升级界面


layui.define(['jquery', 'layer', 'form', 'laytpl', 'element', 'table', 'neat', 'neatDataApi', 'electricalDeviceDataApi', 'neatNavigator', 'commonDataApi','neatWindowManager'], function (exports) {



    "use strict";
    var $ = layui.$;
    var MODULE_NAME = "pageElectricalDeviceUpgrade";

    var form = layui.form;
    var laytpl = layui.laytpl;

    var layer = layui.layer;

    var neat = layui.neat;

    var table = layui.table;


    var neatNavigator = layui.neatNavigator;


    var pageDataApi = layui.electricalDeviceDataApi;




    // 返回的数据包含的属性
    var dataPropertyNames = {
        id: "id",
        version: "version",
        addTime: "datetime"
       
    };


    var SubPage = function () {

        this.id = "";

        this.fileList = [];

    };

    //初始化
    SubPage.prototype.init = function () {

        var that = this;


        this.id = neatNavigator.getUrlParam("id");

        this.initUpdateFileList();

        this.initButtonEvent();

        form.render();

    };

    // 初始化 升级文件列表
    SubPage.prototype.initUpdateFileList = function () {
        var that = this;

        pageDataApi.getUpdateFileList(neat.getUserToken()
            , function (result) {
                that.fileList = result;

                that.renderTable();

            }, function (failData) {

                layer.msg(failData.message, function () {

                    that.closeDialog();
                });

            });
    };


    // 渲染 升级文件列表
    SubPage.prototype.renderTable = function () {

        var that = this;

        var tmpl = '{{#  layui.each(d.data, function(index, item){}}'
            + '  <tr>'
            //      版本号
            + '     <td><span class="verion-name">{{ item.' + dataPropertyNames.version + ' }}</span></td>'
            //      添加时间
            + '     <td style="text-align:center;"><span class="add-time">{{ item.' + dataPropertyNames.addTime + '}}</span></td>'
            //      操作列
            + '     <td style="text-align:center;"><i data-file-id="{{item.' + dataPropertyNames.id + '}}" class="fa fa-upload update-file"><i></td>'
            + '  </tr>'
            + '{{#  }); }}';

        var d = {};
        d.data = this.fileList;

        laytpl(tmpl).render(d, function (html) {
            $("#resultTable").html(html);
            $("#resultTable").find(".update-file")
                .on("click", function () {
                    var fileId = $(this).data("file-id");
          
                    pageDataApi.addUpdateTask(neat.getUserToken(), that.id, fileId
                        , function () {
                            layer.msg("下发升级任务成功!", function () {
                                that.closeDialog();
                            });
                        }
                        , function (fd) {
                            if (typeof fd.message === "string") {
                                layer.msg(fd.message);
                            }
                            else {
                                layer.msg("下发升级任务失败!");
                            }
                        });
                });
        });

    };


    //关闭对话框
    SubPage.prototype.closeDialog = function () {
        var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
        parent.layer.close(index); //再执行关闭
    };


    SubPage.prototype.initButtonEvent = function () {

        var that = this;

        //版本管理按钮
        $("#btnShowUpdateFileMgr").on("click", function () {

            var url = "/pages/device/electricalDevice/ElectricalDeviceUpgradeFileManage.html?__="

                 + new Date().valueOf().toString();

            layui.neatWindowManager.openLayerInRootWindow({
                resize: false,
                type: 2,
                title: '升级版本文件管理',
                area: ["806px", "620px"],
                shade: [0.7, '#000'],
                content: url,
                end: function () {
                    that.initUpdateFileList();
                }
            });

            return false;
        });


    };

    exports(MODULE_NAME, new SubPage());

});