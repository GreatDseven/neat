layui.define(["jquery"], function (exports) {

    "use strict";
    var $ = layui.$;
    var MODULE_NAME = "neatSpeechSynthesis";


    var NeatSpeechSynthesis = function () {

        this.canSpeak = ('speechSynthesis' in window);

        if (!this.canSpeak)
            return;

    };

    //语音合成
    NeatSpeechSynthesis.prototype.speak = function (speech) {

        if (!this.canSpeak)
            return;

        try {
            var utterance = new SpeechSynthesisUtterance();

            utterance.lang = 'zh-CN';

            utterance.rate = 1.1;

            utterance.text = $.trim(speech);

        
            console.log("speak:" + utterance.text);
            window.speechSynthesis.speak(utterance);
        }
        catch (e) {
            console.log(e);
        }
    };


    var instance = new NeatSpeechSynthesis();

    //暴露接口
    exports(MODULE_NAME, instance);



});