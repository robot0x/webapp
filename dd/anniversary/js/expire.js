/*********Bridge*******************/
var ddIsBridgeReady = false;
function connectWebViewJavascriptBridge(callback) {
    if (window.WebViewJavascriptBridge) {
        callback(WebViewJavascriptBridge);
    } else {
        document.addEventListener('WebViewJavascriptBridgeReady', function(ev) {
            callback(ev.bridge);
            if(! window.WebViewJavascriptBridge && ev.bridge) 
                window.WebViewJavascriptBridge = ev.bridge; //rare case happen?
        }, false);
    }
}
function bridgeInitCallback(bridge) {
    //要么是当时执行成功，要么是WebViewJavascriptBridgeReady设置的event callback里执行
    //事件：WebViewJavascriptBridgeReady
    try {
        bridge.init(function(data, responseCallback) {
            //这个函数是默认的handler，callHandler和registerHandler以外的事件发生了
            console.log('Default handler called?');
            console.log(data);
            if(responseCallback)    //typeof responseCallback === "function"
                responseCallback(data);
        });
        //bridge.init(function(message, def_handler) {return def_handler(message);});
    } catch(e){
        console.log('WebViewJavascriptBridge init fail');
        console.log(e);
    }
    ddIsBridgeReady = true;
    //Default Action
    ddGetAppEnv(envCallback, "");
    return true;
}
function ddGetAppEnv(callback, context_data) {
    //context_data是透传的，直接给callback用的，当然也可以不用
    if (! ddIsBridgeReady) {
        return false;
    }
    WebViewJavascriptBridge.callHandler('getAppEnv', {'caller' : 'ddiosjsbridge1.0'}, function(response) {
        callback(response, context_data);
    });
    return true;
}
function ddCheckLogin(callback, require_login) {
    /*检查login，如果require_login是true，那么app里会弹窗要登录*/
    //context用来传递一些额外的信息
    if (! ddIsBridgeReady) {
        return false;
    }
    WebViewJavascriptBridge.callHandler('checkLogin', require_login, function(response) {
            callback(response, require_login);
    });
    return true;
}
//global
var g_appVersion, g_uid, g_did, g_os, g_aid = 65535, g_myprize;
var g_acceptable = ['weibo', 'timeline'];
//var g_api = "http://121.42.141.74/dd_api/v2/coupon";
var g_api = "http://api.diaox2.com/v2/coupon";
//var g_address = "http://121.42.141.74/dd_api/v2/user/address";
var g_address = "http://api.diaox2.com/v2/user/address";

// 定义一个全局变量记录默认保存地址信息函数是否执行
var isDefaultSavaExec = false;
//Raw invoke
connectWebViewJavascriptBridge(bridgeInitCallback);

function envCallback(env_data, context_data) {
    /*
    @"app_name" : @"diaodiao",
    @"os"       : @"ios",
    @"version"  : @"1.0.1"
    @"uid"      : @"1.3之后，返回用户id"，需要的话参考这里
    */
    //注意，env_data，没有result == "YES"的设计
    console.log("envcallback");
    var flag;
    try {
        if(typeof(env_data) != "object" || env_data.app_name != "diaodiao") {
            console.log('none diaox2 data');
            flag = false;
        } else {
            flag = true;
            g_appVersion = env_data.version;
            if(env_data.os && env_data.os == "ios") {
                g_os = "ios";
                g_uid = env_data.uid?env_data.uid:0;  //not-loggedin? = 0
                g_did = env_data.did?env_data.did:undefined;
                // 在获取g_uid之后，从本地取出数据
                var data = getData(g_uid);
                console.log(data);
            } else {
                g_os = "android";
                //g_uid -> checklogin
                g_did = "android";
            }
        }
    } catch(e) {
        console.log('exception in envcallback');
        flag = false;
    }
}
function CLcb(ret, flag) {
    console.log("checklogin callback");
    var loggedin = false;
    if(typeof ret != "object") {
        console.log("checkLogin return no obj?")
        //当作没login
    } else {
        if(ret.result == "YES") {
            //确实已经登录
            console.log(ret);
            //ret里面只有uid，android只在这里返回uid, getenv拿不到
            g_uid = ret.uid;
            loggedin = true;
            // 在获取g_uid之后，从本地取出数据
            var data = getData(g_uid);
            // 如果本地有数据，并且state是FAIL的话，需要从新发送ajax来保存数据
            if(data && (data.state == undefined || data.state !== 'SUCCESS')){
                // 发送一次数据
                if(!isDefaultSavaExec){
                    saveDataDefault(data);
                    isDefaultSavaExec = true;
                }
            }
        }
    }
    if(loggedin) {
        // login();
        showLoading();
        after_login();
    }
}
function after_login() {
    //知道是Login，无论是初始化时，还是用户被告知login时，都要执行
    // 使用uid/did(ios)/activity_id/signature取得info
    var tmp = {action:"get_activity_info", activity_id:g_aid};
    if(g_uid == undefined || g_uid == 0 || g_uid == "" || g_uid == null) {
        //不应该增加uid
        console.log("skip uid");
    } else 
        tmp["uid"] = g_uid;
    tmp["did"] = g_did; //ios:real android:"android"
    tmp["signature"] = "diaox2_grab_coupon_" + g_uid + "_" + g_aid + "_" + g_did;
    tmp["signature"] = md5(tmp["signature"]);
    console.log("使用如下参数来获取activiti_info");
    console.log(JSON.stringify(tmp));
    $.ajax({
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify(tmp),
        dataType: "json",
        url: g_api,
        success: build_button, //根据返回值敲定按钮是否可点; 修改获奖区
        timeout: 8000,
        error: re_check //重试
    });
    return true;
}
function build_button(data) {
    console.log("get_activity_info"); console.log(data);
    if(data == undefined || data.state != "SUCCESS" || data.res == undefined) {
        //提示获取活动信息失败
        //退到未登录
        showRedCircleTip('抱歉，服务器开小差了<br>请重试');
        return false;
    }
    //先处理活动总体数据信息， 过期等
    var server_timestamp = data.res.server_timestamp;
    var start = data.res.activity_data.meta.start;
    var end = data.res.activity_data.meta.end;
    var day = data.res.activity_data.meta.day;
    var a_arr = [];
    if(data.res.user_data.awards)
        for(var i = 0; i < data.res.user_data.awards.length; i++) {
            var item = data.res.user_data.awards[i];
            var j = JSON.parse(item.award_info);
            a_arr.push(j.name);
        }
    g_myprize = a_arr.join(",");
    if(data.res.user_data.awards && data.res.user_data.awards.length != 0){
        isWinning = true;
    }
        var viewmyprize = document.querySelector('.view-my-prize');
        viewmyprize.href = "javascript:void(0);";
        viewmyprize.onclick = function(){
            if(isWinning){ //中奖
                var winningDialog = document.getElementById('view_winning');
                //g_myprize;
                var jd = {action:"add", activity_id:g_aid, uid:g_uid, did:g_did}
                jd["signature"] = "diaox2_grab_coupon_" + g_uid + "_" + g_aid + "_" + g_did;
                jd["signature"] = md5(jd["signature"]);
                var text = '您每天都有两次抽奖机会哟<br>分享到朋友圈和微博可各获得一次';
                if(g_os != 'ios'){
                    // 把新样式添加到dialog
                    winningDialog.className = winningDialog.className + ' android';
                    // 如何是中奖的安卓用户，并且本地存储没有值，应该提示用户再次保存
                    var ldata = getData(g_uid);
                    if(ldata == null || ldata == ''){
                        text = '由于我们的失误，您的收货信息走丢了.<br>麻烦您重新填写一遍';
                    }
                }
                showWinningDialog(winningDialog,'您已中的奖品有：<br>' + g_myprize, 
                        text ,function(e){
                        console.log("Dialog OK");
                        // 发送ajax，保存信息
                        var name = winningDialog.querySelector('.name').value;
                        var phone = winningDialog.querySelector('.phone').value;
                        var addr = winningDialog.querySelector('.addr').value;
                        var ldata = {
                            'name':name,
                            'phone':phone,
                            'address':addr
                        };
                        jd.address_info = ldata;
                        console.log('viewmyprize.onclick -> data');
                        console.log(JSON.stringify(jd));
                        $.ajax({
                            type: "POST",
                            contentType: "application/json",
                            data: JSON.stringify(jd),
                            dataType: "json",
                            url: g_address,
                            success:function(data){
                                console.log('保存地址ok');
                                showRedCircleTip('保存信息成功<br>不必重复填写');
                                winningDialog.style.display = 'none';
                                // 如果保存失败
                                console.log(data);
                                if(data.state !== 'SUCCESS' || data.result !== 'SUCCESS' || data.res.action_state !== 'SUCCESS'){
                                    ldata.state = 'FAIL';
                                }else{
                                    ldata.state = 'SUCCESS';
                                }
                                // 存入本地
                                setData(g_uid,ldata);
                            },
                            error:function(x,t,e){
                                console.log(e); console.log('保存地址失败');
                                showRedCircleTip('保存信息失败<br>请重试');
                                winningDialog.style.display = 'none';
                                ldata.state = 'FAIL';
                                setData(g_uid,ldata);
                            },
                            timeout: 8000
                        });
                    },function(e){
                        console.log("Dialog cancle");
                        winningDialog.style.display = 'none';
                });
        }else{ // 未中奖
            var unwinningDialog = document.querySelector('.unwinning-dialog');
            confirm = unwinningDialog.querySelector('.confirm'),
                    cancel = unwinningDialog.querySelector('.cancel'),
                    unwinningDialog.style.display = 'block';
            confirm.onclick = cancel.onclick = function(){
                unwinningDialog.style.display = 'none';
            }
        }
     }
     closeLoading();
     viewmyprize.click();
}
function re_check(x,t,e) {
    console.log("get_activity_info有问题"); console.log(e);
    //在app内已登录，check登陆不会弹窗，返回登陆界面即可
    // closeLoading();
    showRedCircleTip('获取活动信息超时<br>请重试');
}
//LIBs md5
function md5cycle(f,h){var g=f[0],e=f[1],j=f[2],i=f[3];g=ff(g,e,j,i,h[0],7,-680876936);i=ff(i,g,e,j,h[1],12,-389564586);j=ff(j,i,g,e,h[2],17,606105819);e=ff(e,j,i,g,h[3],22,-1044525330);g=ff(g,e,j,i,h[4],7,-176418897);i=ff(i,g,e,j,h[5],12,1200080426);j=ff(j,i,g,e,h[6],17,-1473231341);e=ff(e,j,i,g,h[7],22,-45705983);g=ff(g,e,j,i,h[8],7,1770035416);i=ff(i,g,e,j,h[9],12,-1958414417);j=ff(j,i,g,e,h[10],17,-42063);e=ff(e,j,i,g,h[11],22,-1990404162);g=ff(g,e,j,i,h[12],7,1804603682);i=ff(i,g,e,j,h[13],12,-40341101);j=ff(j,i,g,e,h[14],17,-1502002290);e=ff(e,j,i,g,h[15],22,1236535329);g=gg(g,e,j,i,h[1],5,-165796510);i=gg(i,g,e,j,h[6],9,-1069501632);j=gg(j,i,g,e,h[11],14,643717713);e=gg(e,j,i,g,h[0],20,-373897302);g=gg(g,e,j,i,h[5],5,-701558691);i=gg(i,g,e,j,h[10],9,38016083);j=gg(j,i,g,e,h[15],14,-660478335);e=gg(e,j,i,g,h[4],20,-405537848);g=gg(g,e,j,i,h[9],5,568446438);i=gg(i,g,e,j,h[14],9,-1019803690);j=gg(j,i,g,e,h[3],14,-187363961);e=gg(e,j,i,g,h[8],20,1163531501);g=gg(g,e,j,i,h[13],5,-1444681467);i=gg(i,g,e,j,h[2],9,-51403784);j=gg(j,i,g,e,h[7],14,1735328473);e=gg(e,j,i,g,h[12],20,-1926607734);g=hh(g,e,j,i,h[5],4,-378558);i=hh(i,g,e,j,h[8],11,-2022574463);j=hh(j,i,g,e,h[11],16,1839030562);e=hh(e,j,i,g,h[14],23,-35309556);g=hh(g,e,j,i,h[1],4,-1530992060);i=hh(i,g,e,j,h[4],11,1272893353);j=hh(j,i,g,e,h[7],16,-155497632);e=hh(e,j,i,g,h[10],23,-1094730640);g=hh(g,e,j,i,h[13],4,681279174);i=hh(i,g,e,j,h[0],11,-358537222);j=hh(j,i,g,e,h[3],16,-722521979);e=hh(e,j,i,g,h[6],23,76029189);g=hh(g,e,j,i,h[9],4,-640364487);i=hh(i,g,e,j,h[12],11,-421815835);j=hh(j,i,g,e,h[15],16,530742520);e=hh(e,j,i,g,h[2],23,-995338651);g=ii(g,e,j,i,h[0],6,-198630844);i=ii(i,g,e,j,h[7],10,1126891415);j=ii(j,i,g,e,h[14],15,-1416354905);e=ii(e,j,i,g,h[5],21,-57434055);g=ii(g,e,j,i,h[12],6,1700485571);i=ii(i,g,e,j,h[3],10,-1894986606);j=ii(j,i,g,e,h[10],15,-1051523);e=ii(e,j,i,g,h[1],21,-2054922799);g=ii(g,e,j,i,h[8],6,1873313359);i=ii(i,g,e,j,h[15],10,-30611744);j=ii(j,i,g,e,h[6],15,-1560198380);e=ii(e,j,i,g,h[13],21,1309151649);g=ii(g,e,j,i,h[4],6,-145523070);i=ii(i,g,e,j,h[11],10,-1120210379);j=ii(j,i,g,e,h[2],15,718787259);e=ii(e,j,i,g,h[9],21,-343485551);f[0]=add32(g,f[0]);f[1]=add32(e,f[1]);f[2]=add32(j,f[2]);f[3]=add32(i,f[3])}function cmn(h,e,d,c,g,f){e=add32(add32(e,h),add32(c,f));return add32((e<<g)|(e>>>(32-g)),d)}function ff(g,f,k,j,e,i,h){return cmn((f&k)|((~f)&j),g,f,e,i,h)}function gg(g,f,k,j,e,i,h){return cmn((f&j)|(k&(~j)),g,f,e,i,h)}function hh(g,f,k,j,e,i,h){return cmn(f^k^j,g,f,e,i,h)}function ii(g,f,k,j,e,i,h){return cmn(k^(f|(~j)),g,f,e,i,h)}function md51(c){txt="";var e=c.length,d=[1732584193,-271733879,-1732584194,271733878],b;for(b=64;b<=c.length;b+=64){md5cycle(d,md5blk(c.substring(b-64,b)))}c=c.substring(b-64);var a=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];for(b=0;b<c.length;b++){a[b>>2]|=c.charCodeAt(b)<<((b%4)<<3)}a[b>>2]|=128<<((b%4)<<3);if(b>55){md5cycle(d,a);for(b=0;b<16;b++){a[b]=0}}a[14]=e*8;md5cycle(d,a);return d}function md5blk(b){var c=[],a;for(a=0;a<64;a+=4){c[a>>2]=b.charCodeAt(a)+(b.charCodeAt(a+1)<<8)+(b.charCodeAt(a+2)<<16)+(b.charCodeAt(a+3)<<24)}return c}var hex_chr="0123456789abcdef".split("");function rhex(c){var b="",a=0;for(;a<4;a++){b+=hex_chr[(c>>(a*8+4))&15]+hex_chr[(c>>(a*8))&15]}return b}function hex(a){for(var b=0;b<a.length;b++){a[b]=rhex(a[b])}return a.join("")}function md5(a){return hex(md51(a))}function add32(d,c){return(d+c)&4294967295}if(md5("hello")!="5d41402abc4b2a76b9719d911017c592"){function add32(a,d){var c=(a&65535)+(d&65535),b=(a>>16)+(d>>16)+(c>>16);return(b<<16)|(c&65535)}};
/*****************全局变量*******************/
// 是否是最后一天
// 该用户是否中奖
var isWinning = false;
var arrPrototype = Array.prototype;
/*****************全局函数*******************/
/*
   显示红色圆圈提示
   text 圆圈中的提示文本
   ms 多少毫秒关闭提示 默认是2000ms
 */
function showRedCircleTip(text,ms){
    var redCircleTip = document.querySelector('.red-circle-tip')
        ms = ms || 2000;
    redCircleTip.style.visibility = 'visible';
    redCircleTip.innerHTML = text;
    setTimeout(function(){
        redCircleTip.style.visibility = 'hidden';
    },ms)
}
// 保存用户填入的信息到本地
function setData(key,data){
    var storage = window.localStorage;
    var cook = document.cookie;
    data = data || {};
    key = key + '';
    // 如果支持 localStorage 就使用，否则使用cookie
    if(storage){
        storage.setItem(key,JSON.stringify(data));
    }else if(cook){
        var setCookie = function(key,value,days){
            // 设置cookie过期事件,默认是5天
            var expire = new Date();
            days = days || 5;
            expire.setTime(expire.getTime() + (+days)*24*60*60*1000);
            document.cookie = key + "="+ encodeURIComponent(value) + ";expires=" + expire.toGMTString();
        };
        setCookie(key,JSON.stringify(data));
    }
}
// 获取本地数据
function getData(key){
    var storage = window.localStorage;
    var cook = document.cookie;
    if(storage){
        return JSON.parse(window.localStorage.getItem(key+''));
    }else if(cook){
        var getCookie = function(key){
            var arr,reg = new RegExp("(^| )"+key+"=([^;]*)(;|$)");
            if(arr=document.cookie.match(reg)){
                return decodeURIComponent(arr[2]);
            }else{
                return null;
            }
        };
        return JSON.parse(getCookie(key));
    }
    return null
}
/*
   显示对话框，
   which 要显示的对话框
   title 对话框的标题
   prizeText 中奖信息 形如  “您的奖品是：<span>Moto360</span>”
 */
function showWinningDialog(which,title,prizeText,confirmCb,cancelCb){
    which.style.display = 'block';
    which.querySelector('h2').innerHTML = title;
    which.querySelector('p').innerHTML = prizeText;
    var data = getData(g_uid);
    var name = which.querySelector('.name');
    var phone = which.querySelector('.phone');
    var addr = which.querySelector('.addr');
    if(data != null && data != 'null'){
        if(data.name)
            name.value = data.name;
        if(data.phone)
            phone.value = data.phone;
        if(data.address)
            addr.value = data.address;
    }
    which.querySelector('.confirm').onclick = function(e){
        confirmCb.call(this,e);
        // 直接返回，因为本地数据已经在confirmCb中保存了
        return;
    }
    which.querySelector('.cancel').onclick = function(e){
        cancelCb.call(this,e);
    }
}
function text(obj, t){
    obj.style.visibility = "visible";
    obj.innerHTML = t;
}
document.addEventListener('DOMContentLoaded',function(){
    var viewMore = document.querySelectorAll('.view-more');
    arrPrototype.forEach.call(viewMore,function(dom){
            dom.onclick = function(){
            var ul = this.previousElementSibling;
            var clsName = ul.className;
            var bottomArrow = this.querySelector('i');
            // 折叠
            if(clsName.indexOf('opened')!==-1){

            ul.removeAttribute('style');
            bottomArrow.removeAttribute('style');
            ul.className = ul.className.replace('opened','');
            this.firstChild.nodeValue = '展开更多';

            }else{
            // 展开
            ul.style.cssText = 'overflow:visible;height:auto;';
            ul.className = ul.className + ' opened';
            bottomArrow.style.webkitTransform = 'rotate(180deg)';
            bottomArrow.style.transform = 'rotate(180deg)';
            this.firstChild.nodeValue = '收起';
            }
            }
    });
})