var sino = new Object();
/**
 * @type {string} 参数说明
 * delete 删除产品
 * return 放弃购买
 * update 更换产品
 * video  完成录制
 * close  退出
 */
sino.type = "";//存储confirm操作的方法
sino.obj = null;//存储删除产品的dom对象
/**
 * 简单的弹框，无线程堵塞
 * @param msg 弹框的内容  必选
 * @param href 弹框后跳转到那个页面  可选
 * @param time 弹框后多少毫秒进行跳转 可选
 */
sino.alert = function (msg, href, time,close) {
    $("#content").html(msg);
    $("#confirm").hide();
    $("#alert").show();
    $('#myModal').css('display', "block");
    if(close==undefined){
        if (href != undefined) {
            if (time == undefined) {//如果没给参数，默认1秒后跳转
                time = 1000;
            }
            setTimeout(function () {
                window.location.href = href;
            }, time);
        }
    }else{
         sino.type="close";
    }
}

/**
 * 简单的confirm，无线程堵塞
 * @param msg   内容
 * @param type 操作类型
 * @param obj  调用该事件的对象
 */
sino.confirm = function (msg, type, obj) {
    $("#content").html(msg);
    $("#alert").hide();
    $("#confirm").show();
    $('#myModal').css('display', "block");
    this.type = type;
    if (obj != undefined)
        this.obj = obj;
}
/**
 * 确认后做的事
 */
sino.ConfirmYes = function () {
    if (sino.type == "return") {
        notBuy();
    }
    if (sino.type == "delete") {
        deleteProduct(sino.obj);
    }
    if (sino.type == "video") {
        saveVideo();
    }
    if (sino.type == "replace") {
        replace();
        $('#myModal').hide();
    }
    if(sino.type=="deleteFile"){
        deleteFile(sino.obj);
    }
    if(sino.type=="deletePic"){
        delPic(sino.obj);
    }
}
/**
 * 关闭弹窗
 */
sino.No = function () {
    $('#myModal').hide();
    if(sino.type=="close"){
        $.get("sso/exitClient", function () {})
    }
    if($("#content").html().trim()=="您的登录已过期"){
        window.location.href="login.html";
    }
}

/**
 * 获取系统当前日期
 * @returns 2018-8-11
 */
sino.getDate = function (type) {
    var date = new Date();
    var yy = date.getFullYear().toString();
    var mm = (date.getMonth() + 1).toString();
    var dd = date.getDate().toString();
    if(type==undefined){
        return yy + "-" + mm + "-" + dd;
    }
    mm = mm < 10 ? '0'+mm : mm;
    var dd = date.getDate().toString();
    dd=dd<10?'0'+dd:dd;
    return yy   + mm + dd;

}

/**
 * 获取系统当前日期和时间
 * type 未定义就没符号
 * @returns 14:20:23
 */
sino.getDateTime = function (type) {
    var date = new Date();
    var yy = date.getFullYear().toString();
    var mm = (date.getMonth() + 1).toString();
    var dd = date.getDate().toString();
    var hh = date.getHours().toString();
    var nn = date.getMinutes().toString();
    var ss = date.getSeconds().toString();
    var hm=date.getMilliseconds();
    if(type){
        if(type=='1'){
            return yy+"-"+mm+"-"+dd+" "+hh+":"+nn+":"+ss;
        }
       return yy+"-"+mm+"-"+dd+"-"+hh+"-"+nn+"-"+ss;
    }else{
        return yy+mm+dd+hh+nn+ss+hm;
    }
}


/**
 * 将数值四舍五入(保留2位小数)后格式化成金额形式
 * @param num 数值(Number或者String)
 * @return 金额格式的字符串,如'1,234,567.45'
 */
sino.formatCurrency = function (obj) {
    var num = this.rmoney(obj.value);
    if (isNaN(num) || num <= 0 ) {
        obj.value="";
        checkCount();
        return;
    }
    num = num.toString().replace(/\$|\,/g, '');
    sign = (num == (num = Math.abs(num)));
    num = Math.floor(num * 100 + 0.50000000005);
    cents = num % 100;
    num = Math.floor(num / 100).toString();
    if (cents < 10) {
        cents = "0" + cents;
    }
    for (var i = 0; i < Math.floor((num.length - (1 + i)) / 3); i++) {
        num = num.substring(0, num.length - (4 * i + 3)) + ',' + num.substring(num.length - (4 * i + 3));
    }
    obj.value = (((sign) ? '' : '-') + num + '.' + cents);
    checkCount();
}


/**
 * 把格式化后的金钱转成数值
 * @param money   123,245,221.00
 * @returns {number} 123245221.00
 */
sino.rmoney = function (money) {
    return parseFloat(money.replace(/[^\d\.-]/g, ""));
}

/**
 * @描述 从url中获取指定key的参数值
 * @param name 需要获取value的key
 */
sino.getUrlParam = function (name) {
    var url = window.location.href;
    var paramStr = url.substring(url.indexOf("?") + 1, url.length);
    var paramArray = paramStr.split("&");
    var value = "";
    for (var i = 0; !sino.checkIsNull(paramArray) && i < paramArray.length; i++) {
        var paramKeyValue = paramArray[i];
        if (paramKeyValue.indexOf(name) == 0) {
            value = paramKeyValue.substring(name.length + 1, paramKeyValue.length);
            break;
        }
    }
    return value;
}

/**
 * 判断参数是否为空
 * @param 参数
 * @returns  true  or  false
 */
sino.checkIsNull = function (data) {
    return data == undefined || data == "undefined" || data == null || data == "null" || data == '' || data.length == 0;
}
/**
 * 转义url传参中的/符号
 * @param url
 */
sino.replaceUrl = function (url) {
    var prefix = url.substring(0, url.indexOf('?'));
    url = url.substring(url.indexOf('?')).replace(new RegExp('/', "gm"), '%2F');
    return prefix + url;
}

/**
 * 创建视频目录
 * @param path
 * @returns {string}
 */
sino.createDirectory=function (path) {
    $.getJSON('http://'+ G.localIp + '/easyrecordHS/createDirectory?t='+ Math.random()+'&callback=?',{path:path});
};

/**
 *同步获取文件存储位置
 * @param type  文件类型
 * @returns 存储位置
 */
sino.getPath=function (type) {
    var path="";
    $.ajax({
        url: "/easyRecordHS/video/getPath",
        data: {codeType:type},
        async:false,
        type: "get",
        success: function (datas) {
                path=datas;
        }
    });
    return path;
}

/**
 * 把当前登录的员工存储全局变量中
 * 如果不存在则往里面存
 */
sino.setCuccrentUser=function () {
    console.log(G.agentCode);
        if(this.checkIsNull(G.agentCode)){
            $.ajax({
                url: "/easyRecordHS/sso/getSession",
                contentType: "application/json;",
                type: "post",
                success: function (result) {
                    if(result.success){
                        G.agentCode=result.data.agentCode;
                        G.agentName=result.data.name;
                        console.log("current agentCode="+G.agentCode);
                    }
                }
            });
        }
}

/**
 * 去保单号-符号
 */
sino.replaceBusiNum=function (busiNum) {
     busiNum=busiNum.replace(new RegExp('-', "gm"), '');
     return busiNum;
}


function banBackSpace(e){
    var ev = e || window.event;
    //各种浏览器下获取事件对象
    var obj = ev.relatedTarget || ev.srcElement || ev.target ||ev.currentTarget;
    //按下Backspace键
    if(ev.keyCode == 8){
        var tagName = obj.nodeName //标签名称
        //如果标签不是input或者textarea则阻止Backspace
        if(tagName!='INPUT' && tagName!='TEXTAREA'){
            return stopIt(ev);
        }
        var tagType = obj.type.toUpperCase();//标签类型
        //input标签除了下面几种类型，全部阻止Backspace
        if(tagName=='INPUT' && (tagType!='TEXT' && tagType!='TEXTAREA' && tagType!='PASSWORD')){
            return stopIt(ev);
        }
        //input或者textarea输入框如果不可编辑则阻止Backspace
        if((tagName=='INPUT' || tagName=='TEXTAREA') && (obj.readOnly==true || obj.disabled ==true)){
            return stopIt(ev);
        }
    }
}
function stopIt(ev){
    if(ev.preventDefault ){
        //preventDefault()方法阻止元素发生默认的行为
        ev.preventDefault();
    }
    if(ev.returnValue){
        //IE浏览器下用window.event.returnValue = false;实现阻止元素发生默认的行为
        ev.returnValue = false;
    }
    return false;
}

$(function(){
    //实现对字符码的截获，keypress中屏蔽了这些功能按键
    document.onkeypress = banBackSpace;
    //对功能按键的获取
    document.onkeydown = banBackSpace;
})