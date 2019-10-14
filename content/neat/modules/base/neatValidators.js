layui.define([], function (exports) {

    "use strict";

    var MODULE_NAME = 'neatValidators';

    var Validators = function () { };

    //验证用户名
    // 验证规则：字母、数字、下划线组成，字母开头，4-16位。
    Validators.prototype.validateUserName = function (value) {
        var regex = /^[a-zA-Z][a-zA-Z0-9_]{3,15}$/;
        if (regex.test(value)) {
            return "";
        } else {
            return "格式错误,规则如下：由字母、数字、下划线组成，必须以字母开头，4-16位";
        }
    };

    //验证手机号
    // //验证规则：11位数字，以1开头。
    Validators.prototype.validateMobile = function (value) {
        var regex = /^1\d{10}$/
        if (regex.test(value)) {
            return "";
        } else {
            return "格式错误,请输入11位数字手机号";
        }
    };
    // 验证固定电话
    // 验证规则：
    // 1.区号+号码，区号以0开头，3位或4位  号码由7位或8位数字组成,区号与号码之间可以无连接符，也可以“-”连接
    Validators.prototype.validateTelephone = function (value) {
        var regex = /^0\d{2,3}-?\d{7,8}$/;
        if (regex.test(value)) {
            return "";
        } else {
            return "格式错误,请输入带区号的固定电话号码,例如:0335-3660317";
        }
    };

    // 验证联系方法,该联系方式可能为手机,也可能是固定电话.
    Validators.prototype.validateContactInfo = function (value) {
        var r1 = this.validateTelephone(value);
        var r2 = this.validateMobile(value);
       
        if (r1 !== "" && r2 !== "") {
            return "格式错误,请输入11位数字手机号 或 带区号的固定电话号码(例如:0335-3660317)";
        }
        else
        {
            return "";
        }
        
        
    };

    // 验证16进制6段的设备地址编码
    // 要求 必须是 ##.##.##.##.##.## 格式,其中 #是 0-9 A-F a-f 的字符.
    // 正确返回"",其他为错误
    Validators.prototype.validateHexCode6 = function (value) {

        var errMsg =  "编码错误";
        if (!value) {
            return errMsg;
        }
        var transformed = value.toString().toUpperCase();


        var regex = new RegExp(/^([0-9A-F]{2}\.){5}[0-9A-F]{2}$/g);

        if (regex.test(transformed) === false) {
            return errMsg;
        }

        var notValids = ["00.00.00.00.00.00", "FF.FF.FF.FF.FF.FF"];

        if (notValids.indexOf(transformed) != -1) {
            return errMsg;
        }

        return "";

    };

    // 验证16进制4段的设备地址编码
    // 要求 必须是 00.01.01.0#格式,其中 #是 1-7 的数字.
    // 正确返回"",其他为错误
    Validators.prototype.validateNEATWaterSignalCode = function (value) {

        var errMsg = "编码错误";
        if (!value) {
            return errMsg;
        }
        var transformed = value.toString();


        var regex = new RegExp(/^00\.01\.01\.0[1-7]$/g);

        if (regex.test(transformed) === false) {
            return errMsg;
        }

        return "";

    };

    // 验证16进制6段的设备地址编码无分隔符
    // 要求 必须是 ############ 格式,其中 #是 0-9 A-F a-f 的字符.
    // 正确返回"",其他为错误
    Validators.prototype.validateHexCode6NoSep = function (value) {

        var errMsg = "编码错误";
        if (!value) {
            return errMsg;
        }

        var transformed = value.toString().toUpperCase();


        var regex = new RegExp(/^[0-9A-F]{12}$/g);

        if (regex.test(transformed) === false) {
            return errMsg;
        }

        var notValids = ["000000000000", "FFFFFFFFFFFF"];

        if (notValids.indexOf(transformed) != -1) {
            return errMsg;
        }

        return "";

    };

    // 验证16进制.分隔的4段的地址编码
    // 要求 必须是 ##.##.##.## 格式,其中 #是 0-9 A-F a-f 的字符.
    // 正确返回"",其他为错误
    Validators.prototype.validateHexCode4 = function (value) {

        var errMsg = "编码错误";
        if (!value) {
            return errMsg;
        }
       
        var transformed = value.toString().toUpperCase();

        var regex = new RegExp(/^([0-9A-F]{2}\.){3}[0-9A-F]{2}$/g);

        if (regex.test(transformed) === false) {
            return errMsg;
        }

        return "";

    };


    // 验证16进制.分隔的2段的地址编码
    // 要求 必须是 ##.## 格式,其中 #是 0-9 A-F a-f 的字符.
    // 正确返回"",其他为错误
    Validators.prototype.validateHexCode2 = function (value) {

        var errMsg = "编码错误";
        if (!value) {
            return errMsg;
        }

        var transformed = value.toString().toUpperCase();


        var regex = new RegExp(/^[0-9A-F]{2}\.[0-9A-F]{2}$/g);

        if (regex.test(transformed) === false) {
            return errMsg;
        }

        return "";

    };

    //验证 15位imei号是否正确
    Validators.prototype.validateIMEI15 = function (para) {
        if(!para){
            para = "";

        }

        var imei = para.toString();

        if(imei.length != 15){
            return "IMEI错误";
        }

        var resultInt = 0;
        for (var i = 0; i < imei.length; i++) {  
            var a=  parseInt(imei.charAt(i));
            i++;  
            var  temp=parseInt(imei.charAt(i))*2;  
             var b= temp<10?temp:temp-9;  
            resultInt+=a+b;  
        } 

        if(parseInt(imei.charAt(14)) != resultInt ){
            return "IMEI错误";
        }
        else
        {
            return "";
        }

    };

   
    //验证 SIM卡号是否正确
    Validators.prototype.validateSIM = function (para) {
        if (!para) {
            para = "";

        }
        var sim = para.toString();

        if (sim.length == 16 || sim.length ==  20 || sim.length ==  19) {
            return "";
        }
        return "IMEI错误";
      
        
        
        //var luhnCheckSum = function (iccid) {
        //    var iccids = iccid.split(''), sum = 0, even = 0;
        //    for (var i in iccids) {
        //        i % 2 != 0 ? (sum += parseInt(iccids[i])) : (even = parseInt(iccids[i]) * 2, sum += even > 9 ? even - 9 : even);
        //    }
        //    return sum * 9 % 10;
        //};


    };

    // 验证10进制6段的设备地址编码,用于校验 UITD 的地址码
    // 要求 必须是 ###.###.###.###.###.### 格式,其中 #是 0-9 的字符.
    // 正确返回"",其他为错误
    Validators.prototype.validateDecCode6 = function (value) {

        var errMsg = "编码错误";
        if (!value) {
            return errMsg;
        }

        var transformed = value.toString();


        var regex = new RegExp(/^([0-9]{3}\.){5}[0-9]{3}$/g);

        if (regex.test(transformed) === false) {
            return errMsg;
        }

        var notValids = ["000.000.000.000.000.000", "255.255.255.255.255.255"];


        if (notValids.indexOf(transformed) != -1) {
            return errMsg;
        }

        var subCodes = transformed.split(".");

        var isSubCodeOK = true;

        layui.each(subCodes,function(_,v){
            if(!isSubCodeOK)
                return;
            var realVal = parseInt(v);
            if(isNaN(realVal) || realVal< 0 || realVal > 255){
                isSubCodeOK = false;
            }
        });

        if (!isSubCodeOK) {
            return errMsg;
        }

        return "";

    };

    // 验证10进制2段的主机地址编码
    // 要求 必须是 ###.### 格式,其中 #是 0-9 的字符,并且###的值在0-255之间.
    // 正确返回"",其他为错误
    Validators.prototype.validateDecCode2 = function (value) {

        var errMsg = "编码错误";
        if (!value) {
            return errMsg;
        }

        var transformed = value.toString();


        var regex = new RegExp(/^[0-9]{3}\.[0-9]{3}$/g);

        if (regex.test(transformed) === false) {
            return errMsg;
        }


        var subCodes = transformed.split(".");

        var isSubCodeOK = true;

        layui.each(subCodes, function (_, v) {
            if (!isSubCodeOK)
                return;
            var realVal = parseInt(v);
            if (isNaN(realVal) || realVal < 0 || realVal > 255) {
                isSubCodeOK = false;
            }
        });

        if (!isSubCodeOK) {
            return errMsg;
        }

        return "";

    };

    // 验证10进制4段的主机地址编码
    // 要求 必须是 ###.###.###.### 格式,其中 #是 0-9 的字符,并且###的值在0-255之间.
    // 正确返回"",其他为错误
    Validators.prototype.validateDecCode4 = function (value) {

        var errMsg = "编码错误";
        if (!value) {
            return errMsg;
        }

        var transformed = value.toString();


        var regex = new RegExp(/^[0-9]{3}\.[0-9]{3}\.[0-9]{3}\.[0-9]{3}$/g);

        if (regex.test(transformed) === false) {
            return errMsg;
        }


        var subCodes = transformed.split(".");

        var isSubCodeOK = true;

        layui.each(subCodes, function (_, v) {
            if (!isSubCodeOK)
                return;
            var realVal = parseInt(v);
            if (isNaN(realVal) || realVal < 0 || realVal > 255) {
                isSubCodeOK = false;
            }
        });

        if (!isSubCodeOK) {
            return errMsg;
        }

        return "";

    };


    // 验证 是否为正确的IPV4地址
    // 正确返回"",其他为错误
    Validators.prototype.validateIPV4 = function (value) {

        var errMsg = "IP错误";
        if (!value) {
            return errMsg;
        }

        var transformed = value.toString();


        var regex = new RegExp(/^([0-9]{1,3}\.){5}[0-9]{1,3}$/g);

        if (regex.test(transformed) === false) {
            return errMsg;
        }

       
        var subCodes = transformed.split(".");

        var isSubCodeOK = true;

        layui.each(subCodes, function (_, v) {
           
            var realVal = parseInt(v);
            if (isNaN(realVal) || realVal < 0 || realVal > 255) {
                isSubCodeOK = false;
            }
        });

        if (!isSubCodeOK) {
            return errMsg;
        }

        return "";

    };

    // 验证 是否为正确的IPV4地址
    // 正确返回"",其他为错误
    Validators.prototype.validatePort = function (value) {

        var errMsg = "端口号错误";
        var realVal = parseInt(value);
        if (isNaN(realVal) || realVal < 0 || realVal > 65535) {
            return errMsg;
        }
        return "";

    };



    ////验证产品编码
    ////value 的值假定为 00.08.26.E9.00.01 的格式,或者 000826E90001的格式.
    ////targetProductValue 的值假定为 471,470等产品类别码
    Validators.prototype.parseNEATAddrCode = function (value) {

        var errMsg = undefined;

        var filteredValue = value.replace(/\./g, "");
        if (filteredValue.length !== 12) {
            return errMsg;
        }

        var byteStrArray = [];

        for (var i = 0; i < 12; i += 2) {
            byteStrArray.push(filteredValue.slice(i, i + 2));
        }

        function toBitStr(val) {

            var arr = []; 
            for (var i = 0; i < 8; i++) {
                if (val >> i & 1) {
                    arr.push(1);
                }
                else {
                    arr.push(0);
                }
            }

            var result = arr.reverse().join("");
            return result;
        }

        var bitData = "";

        for ( i = 0; i < byteStrArray.length; i++) {
            var val = parseInt(byteStrArray[i], 16);
            if (isNaN(val)) {
                return errMsg;
            }
            else {

                bitData += toBitStr(val);
            }
        }

        var neatAddrCode = {
            reserved: parseInt(bitData.slice(0, 4), 2),
            productTypeCode: parseInt(bitData.slice(4, 16), 2),
            year: parseInt(bitData.slice(16, 23), 2),
            month: parseInt(bitData.slice(23, 27), 2),
            day: parseInt(bitData.slice(27, 32), 2),
            lotNo: parseInt(bitData.slice(32, 48), 2)
        };

        if (!neatAddrCode.productTypeCode) {
            return errMsg;
        }

        return neatAddrCode;

    };

    ////验证neat水网关的地址码
    ////成功返回true,
    ////失败返回false.
    Validators.prototype.isValidNEATWaterAddrCode = function (value) {
       
        var result = this.parseNEATAddrCode(value);
        if (!result) {
            return false;
        }
        if (result.productTypeCode == "480"
            || result.productTypeCode == "481"
            || result.productTypeCode == "482") {
            return true;
        }
        else {
            return false;
        }
    };
    

    ////验证产品编码
    ////value 的值假定为 00.08.26.E9.00.01 的格式,或者 000826E90001的格式.
    ////targetProductValues 的值假定为一个 产品类别码例如:471,或者是一个数组[480,481]
    Validators.prototype.validateNEATAddrCode = function (value, targetProductValues) {

        var errMsg = "错误";


        var neatAddrCode = this.parseNEATAddrCode(value);

        if (!neatAddrCode) {
            return errMsg;
        }

        if (typeof (targetProductValues) === "string" || typeof (targetProductValues) === "number" ) {
            if (neatAddrCode.productTypeCode != targetProductValues) {
                return errMsg;
            }
        }
        else if (targetProductValues instanceof Array) {
            if (targetProductValues.indexOf(neatAddrCode.productTypeCode ) ===-1){
                return errMsg;
            }
        }

        return "";
        

    };


    var instance = new Validators();

    exports(MODULE_NAME, instance);
});