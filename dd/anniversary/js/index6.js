/***********Bridge*******************/
toExpirePage();
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
    //register
    WebViewJavascriptBridge.registerHandler("get_share_meta", function(data, responseCallback) {
        var result = get_share_meta(data);
        if(responseCallback)    //typeof responseCallback === "function"
            responseCallback(result);
    });

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
function saveDataDefault(ldata){
    if(ldata){
        var jd = {action:"add", activity_id:g_aid, uid:g_uid, did:g_did}
        jd["signature"] = "diaox2_grab_coupon_" + g_uid + "_" + g_aid + "_" + g_did;
        console.log("in saveDataDefault, use " + jd['signature'] + " to sign");
        jd["signature"] = md5(jd["signature"]);
        // 删除data中的state标志位，防止服务器端严格限制参数，导致保存不成功
        delete ldata.state;
        jd['address_info'] = ldata;
        console.log('prepare saving'); console.log(JSON.stringify(jd));
        $.ajax({
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify(jd),
            dataType: "json",
            url: g_address,
            success:function(data){
                console.log('登录之后保存地址ok');
                console.log(data);
                // 如果保存失败
                if(data.state !== 'SUCCESS' || data.result !== 'SUCCESS' || data.res.action_state !== 'SUCCESS'){
                    ldata.state = 'FAIL';
                }else{
                    ldata.state = 'SUCCESS';
                }
                // 存入本地
                setData(g_uid,ldata);
            },
            error:function(x,t,e){
                console.log(e); console.log('登录之后保存地址失败');
                ldata.state = 'FAIL';
                setData(g_uid,ldata);
            },
            timeout: 8000
        });
    }
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
                // 如果本地有数据，并且state是FAIL的话，需要从新发送ajax来保存数据
                if(data && (data.state == undefined || data.state !== 'SUCCESS')){
                    // 发送一次数据
                    if(!isDefaultSavaExec){
                        saveDataDefault(data);
                        isDefaultSavaExec = true;
                    }
                }
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
    if(flag) {
        //接着检查login情况
        //页面默认是loading状态，结束Loading，显示点击login的页面
        //showLogout();   //对函数名with彦峰
        closeLoading();
        //就算checklogin成功，这个页面也就很快一闪而过，也是符合交互预期的
        ddCheckLogin(CLcb, false);
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
        } else {
            console.log("Not logged in, say sorry!");
            if(flag == false)
                showAttention();
            //没登陆或取消，静默
        }
    }
    if(loggedin) {
        login(); //show default share_button DOM
        //onclick = "javascript:WebViewJavascriptBridge.callHandler('activeshare', get_share_meta('weibo'));"
        //onclick = "alert('正在获取活动信息');";
        showLoading();
        after_login();
    } else {
        //维持默认DOM，单个按钮，要求登陆
        return false;
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
    closeLoading();
    console.log("get_activity_info"); console.log(data);
    if(data == undefined || data.state != "SUCCESS" || data.res == undefined) {
        //提示获取活动信息失败
        //退到未登录
        showRedCircleTip('抱歉，服务器开小差了<br>请重试');
        restart();
        return false;
    }
    //先处理活动总体数据信息， 过期等
    var server_timestamp = data.res.server_timestamp;
    var start = data.res.activity_data.meta.start;
    var end = data.res.activity_data.meta.end;
    var day = data.res.activity_data.meta.day;
    if(+server_timestamp > +end + 7200){
        //TODO:超时2小时过期
        toExpirePage();
    }
    if(+day == 4){
        isLastDay = true;
    }

    var a_arr = [];
    if(data.res.user_data.awards)
        for(var i = 0; i < data.res.user_data.awards.length; i++) {
            var item = data.res.user_data.awards[i];
            var j = JSON.parse(item.award_info);
            a_arr.push(j.name);
        }
    g_myprize = a_arr.join(",");
    if(data.res.user_data.awards && data.res.user_data.awards.length != 0)
        isWinning = true;

    //user_data
    //data.res.user_data.status[0];//默认
    //data.res.user_data.status[1];//wechat
    //data.res.user_data.status[2];//weibo
    //数值：0还没分享过，1已经分享过没抽奖，>=2抽过了
    var st = data.res.user_data.status;
    if(st[0] == 1) {
        //只可能是1或>=2
        //显示默认抽奖的按钮并绑定事件
        defaultPrize(function(){
                defaultChoujiang();
                });
        //注意，这里需要一起把微博微信的抽奖也置为可以，逻辑上肯定可以的
        //然后在抽奖的success函数里，显示微博/微信抽奖
    } else {
        if(g_os != "ios")
            showAttention("（注意：必须点击下方按钮分享才可获得抽奖机会）");    //提醒安卓分享注意事宜
        //这里处理没有默认抽奖的
        if(st[1] >= 2) {
            //微信不可用，等明天
            //这里不需要显示"分享到xx再来一次"
            disableShareBtn(document.querySelector('.wx'), "今日机会已用完<br>明日再来");
        }
        if(st[2] >= 2) {
            //微博不可用，等明天
            //这里不需要显示"分享到xx再来一次"
            disableShareBtn(document.querySelector('.wb'), "今日机会已用完<br>明日再来");
        }
        //todo: 两个都不能抽，tip文案可以变为等明天，小问题
        if(st[1] == 0) {
            console.log('微信还需要分享');
            // 默认按钮就是绑定的分享
            // changeToPrizeBtn(document.querySelector('.wx'), function(){WebViewJavascriptBridge.callHandler('activeshare',get_share_meta('wechat'));});
            /*
            document.querySelector('.wx').onclick = function(){
                WebViewJavascriptBridge.callHandler('activeshare',get_share_meta('wechat'));
            }
            */
        }
        if(st[1] == 1) {
            //绑定抽奖，其实文案上要区分是不是分享过，显示'分享成功点此抽奖'
            changeToPrizeBtn(document.querySelector('.wx'), function(){choujiang(".wx");});
        }
        if(st[2] == 0) {
            console.log('微博还需要分享');
            //默认绑定就是分享
            /*
            document.querySelector('.wb').onclick = function(){
                WebViewJavascriptBridge.callHandler('activeshare',get_share_meta('wechat'));
            }
            */
        }
        if(st[2] == 1) {
            //绑定抽奖
            changeToPrizeBtn(document.querySelector('.wb'), function(){choujiang(".wb")});
        }
    }
    //activity_data这时候得到一份新的数据，更新页面获奖情况
    //更新Prize区域
    build_prize_all(data);
    //更新自己的奖品
    var a_arr = [];
    if(data.res.user_data.awards)
        for(var i = 0; i < data.res.user_data.awards.length; i++) {
            var item = data.res.user_data.awards[i];
            var j = JSON.parse(item.award_info);
            a_arr.push(j.name);
        }
    g_myprize = a_arr.join(",");
    if(data.res.user_data.awards && data.res.user_data.awards.length != 0)
        isWinning = true;
    return true;
}
function re_check(x,t,e) {
    console.log("get_activity_info有问题"); console.log(e);
    //在app内已登录，check登陆不会弹窗，返回登陆界面即可
    closeLoading();
    showRedCircleTip('获取活动信息超时<br>请重试');
    restart();
}
function defaultChoujiang(){
    //抽奖ajax封装
    var jd = {action:"lucky_draw", activity_id:g_aid, uid:g_uid, did:g_did}
    jd["signature"] = "diaox2_grab_coupon_" + g_uid + "_" + g_aid + "_" + g_did;
    jd["signature"] = md5(jd["signature"]);
    jd["user_action"] = {type: "free"};
    $.ajax({
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify(jd),
        dataType: "json",
        url: g_api,
        success: function(data) {
            console.log(data);
            if(data == undefined || data.state != "SUCCESS" || data.res == undefined) {
                //报错，当作没有抽奖过，不动dom 提示默认抽奖失败
                text(document.querySelector('.tip'), '抽奖出问题啦<br>请重试');
                return false;
            }
            if(data.res.ctype == 0) {
                //中奖，显示东西, 直接调用中奖对话框
                //data.res.user_data.awards，从这里面拿奖品名字
                console.log('默认抽中');
                var a_arr = [];
                if(data.res.user_data.awards)
                    for(var i = 0; i < data.res.user_data.awards.length; i++) {
                        var item = data.res.user_data.awards[i];
                        var j = JSON.parse(item.award_info);
                        a_arr.push(j.name);
                    }
                g_myprize = a_arr.join(",");
                if(data.res.user_data.awards && data.res.user_data.awards.length != 0)
                    isWinning = true;
                //用g_myprize修改dom //check
                var winningDialog = document.getElementById('winning');
                showWinningDialog(winningDialog,'恭喜您中奖了','您的奖品是：<span>' + g_myprize + '</span>',function(e){
                    // 发送ajax，保存信息
                    var name = winningDialog.querySelector('.name').value;
                    var phone = winningDialog.querySelector('.phone').value;
                    var addr = winningDialog.querySelector('.addr').value;
                    jd.action = 'add';
                    var ldata = {
                        'name':name,
                        'phone':phone,
                        'address':addr
                    };
                    jd.address_info = ldata;
                    $.ajax({
                        type: "POST",
                        contentType: "application/json",
                        data: JSON.stringify(jd),
                        dataType: "json",
                        url: g_address,
                        success:function(data){
                            showRedCircleTip('保存信息成功<br>不必重复填写');
                            winningDialog.style.display = 'none';
                            if(data.state !== 'SUCCESS' || data.result !== 'SUCCESS' || data.res.action_state !== 'SUCCESS'){
                                ldata.state = 'FAIL';
                            }else{
                                ldata.state = 'SUCCESS';
                            }
                            // 存入本地
                            setData(g_uid,ldata);
                        },
                        error:function(x,t,e){
                            console.log(e); console.log('添加地址失败');
                            showRedCircleTip('保存信息失败<br>请重试');
                            winningDialog.style.display = 'none';
                            ldata.state = 'FAIL';
                            setData(g_uid,ldata);
                         },
                        timeout: 8000
                    });}, function(e){
                    winningDialog.style.display = 'none';
                });
            }//if ctype == 0
            if(data.res.ctype == 101) {
                //未抽中，提示用户未抽中即可
                console.log('默认没抽中');
                showRedCircleTip('很遗憾<br>您未能中奖');
            }
            if(data.res.ctype == 102) {
                //没有抽奖资格？
                showRedCircleTip('您没有抽奖资格');
            }
            // 不管抽没抽中，或者没有抽奖资格，都显示下一步：分享抽奖按钮
            sharePrize();
        },
        timeout: 8000,
        error: function(e) {
            //失败了，不修改，用户可以重新点，但是需要出提示
            text(document.querySelector('.tip'), '抽奖出问题啦<br>请重试');
            console.log('defaultChoujiang error');
        }
    });
}   //function defaultchoujiang
function choujiang(from) {
    //from ==  ".wb" / ".wx" / undefined
    //抽奖ajax封装
    var jd = {action:"lucky_draw", activity_id:g_aid, uid:g_uid, did:g_did}
    jd["signature"] = "diaox2_grab_coupon_" + g_uid + "_" + g_aid + "_" + g_did;
    jd["signature"] = md5(jd["signature"]);
    if(from && from == ".wb")
        jd["user_action"] = {type:"weibo"};
    if(from && from == ".wx")
        jd["user_action"] = {type:"wechat_timeline"}
    if(from == undefined) {
        showRedCircleTip('抽奖来源有误<br>请重试');
        restart();
        return false;
    }

    $.ajax({
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify(jd),
        dataType: "json",
        url: g_api,
        success: function(data) {
            console.log(data);
            //根据from，和中奖的情况，操作DOM，显示中奖情况，置灰按钮
            //from 是按钮传递过来的 if from == ".wb" / ".wx" / undefined
            if(data == undefined || data.state != "SUCCESS" || data.res == undefined) {
            //报错，试做没有抽奖过，不动dom，可以继续点按钮抽
                text(document.querySelector('.tip'),'抽奖失败 请重试');
                return false;
            }
            if(data.res.ctype == 0) {
                //中奖，显示东西
                var a_arr = [];
                if(data.res.user_data.awards)
                    for(var i = 0; i < data.res.user_data.awards.length; i++) {
                        var item = data.res.user_data.awards[i];
                        var j = JSON.parse(item.award_info);
                        a_arr.push(j.name);
                    }
                g_myprize = a_arr.join(",");
                if(data.res.user_data.awards && data.res.user_data.awards.length != 0)
                    isWinning = true;
                //用g_myprize修改dom //check
                var winningDialog = document.getElementById('winning')
                showWinningDialog(winningDialog,'恭喜您中奖了','您的奖品是：<span>' + g_myprize + '</span>',function(e){
                    var name = winningDialog.querySelector('.name').value;
                    var phone = winningDialog.querySelector('.phone').value;
                    var addr = winningDialog.querySelector('.addr').value;
                    jd.action = "add";
                    var ldata = {
                        'name':name,
                        'phone':phone,
                        'address':addr
                    };
                    jd.address_info = ldata;
                    $.ajax({
                        type: "POST",
                        contentType: "application/json",
                        data: JSON.stringify(jd),
                        dataType: "json",
                        url: g_address,
                        success:function(data){
                            showRedCircleTip('保存信息成功<br>不必重复填写');
                            winningDialog.style.display = 'none';
                            if(data.state !== 'SUCCESS' || data.result !== 'SUCCESS' || data.res.action_state !== 'SUCCESS'){
                               ldata.state = 'FAIL';
                            }else{
                                ldata.state = 'SUCCESS';
                            }
                            // 存入本地
                            setData(g_uid,ldata);
                        },
                        error:function(x,t,e){
                            console.log(e); console.log('中奖信息保存失败');
                            showRedCircleTip('保存信息失败<br>请重试');
                            winningDialog.style.display = 'none';
                            ldata.state = "FAIL";
                            setData(g_uid,ldata);
                        },
                        timeout: 8000
                        });
                    },function(e){
                        winningDialog.style.display = 'none';
                });
                //按钮用过了，变灰之
                disableShareBtn(document.querySelector(from), "今日机会已用完<br>明日再来");
                return true;
            }
            if(data.res.ctype == 101) {
                //未抽中，抽奖消耗了，按钮置灰，文案。。。
                // winningFail(document.querySelector(from), "button TEXT", "tip TEXT");
                // 未中奖
                unwinning(document.querySelector(from));
                disableShareBtn(document.querySelector(from), "没中奖<br>明日再来");
                return true;
            }
            //ctype == 102 以及任何其他数值
            //没有抽奖资格，作弊，其他
            //回退到未登录状态
            showRedCircleTip('没有抽奖资格！');
            restart();
        },
        timeout: 8000,
        error: function(e) {
            //失败了，不修改，用户可以重新点，但是需要出提示
            console.log(e); console.log("难道抽奖超时了");
            text(document.querySelector('.tip'),'抽奖失败 请重试');
        }
    });
}   //function choujiang(from)
var share_callback = function(data){console.log("default!");};
function builder(context) {
    //生成函数，返回一个处理share_callback类型的函数，但是有闭包能访问context
    return function(data) {
        //app返回的是api的data.res，所以这里无需处理
        if(data == undefined) {
            //没有数据，rare，客户端bug，分享失败
            showRedCircleTip('分享失败<br>请重新分享');
            return false;
        } else {
            console.log(data);
            var ld;
            try {
                if(typeof data === "string")
                    ld = JSON.parse(data);
                else
                    ld = data;
            } catch(e) {
                //数据解析错误，分享失败
                showRedCircleTip('分享失败<br>请重新分享');
                return false;
            }
            // == 1 重复抢
            if(data.ctype && data.ctype == 1) {
                showRedCircleTip('您已经使用过<br>抽奖机会');
                var s;
                if((context && context == "weibo") || (data.stype && data.stype == 1))
                    s = ".wb";
                //TODO: 微信被封，这里需要考察stype == 2
                if((context && context == "wechat") || (data.stype && data.stype == 4))
                    s = ".wx";
                disableShareBtn(document.querySelector(s), "今日机会已用完<br>明日再来");
                return false;
            }
            //没有券? + 抢完 + 未抢到
            if(data.ctype && (data.ctype == 2 || data.ctype == 4 || data.ctype == 6)) {
                console.log("需要重新分享");
                showRedCircleTip('分享出现错误<br>请重新分享');
                return false;
            }
            //没开始 + 结束
            if(data.ctype && (data.ctype == 3 || data.ctype == 5)) {
                console.log("错误的时间？跳转结束页面");
                showRedCircleTip('活动时间异常<br>请重新分享');
                return false;
            }
            //未正确分享 分享失败 或 获取Coupon失败
            if(data.ctype && data.ctype >= 1000) {
                console.log("需要重新分享");
                showRedCircleTip('分享失败了<br>请重新分享');
                return false;
            }
            //ctype == 0 抢到
            if(data.code != undefined && data.code.length != 0 && data.ctype == 0) {
                if(context == undefined || context.length == 0) {
                    //通过右上角分享
                    console.log("anonymous share success");
                    if(data.stype == undefined) {//android, no context
                        showRedCircleTip('请在页面内<br>用按钮分享');
                        return false; //不会消耗ctype==0
                    } else {   //ios, nocontext
                        //右上角没法disable
                        //这里只判断分享目的地成功，无法判断是否真的有机会抽奖，作罢
                        share_success(data.stype, data.code);
                    }
                } else {
                    //通过按钮分享成功
                    console.log("button share success");
                    if(data.stype == undefined) {//android, context
                        if(context == "weibo")
                            share_success(1, data.code);
                        else
                            share_success(4, data.code);    //只区分weibo/wechat
                    } else    //ios, context
                        share_success(data.stype, data.code);   //stype != context在下面1001
                }
            }
        }
        return true;
    };
}
function get_share_meta(context) {
    console.log('get_share_meta called with ' + context);
    var jsondict = {"version": "2.0"};
    var title = "树林吃土惊坐起，调调正在送壕礼";

    var weibo_pic  = "http://www.yousixiang.cn/share/weibo_share.jpg";
    var wechat_pic  = "http://www.yousixiang.cn/share/wechat_share.png";
    var weibo_url = "http://www.yousixiang.cn/share/weibo.html";
    var wechat_url = "http://www.yousixiang.cn/share/wechat.html";

    jsondict["title"] = title;
    jsondict["weibo"] = "「来自10个国家的最美礼物，治愈剁手后的你，戳右侧链接免费领取」@调调App工作室" + weibo_url;
    jsondict['wechat'] = "分享自 「调调」，全球品质好物推荐";
    jsondict['other'] = "分享自 「调调」，全球品质好物推荐";


    jsondict['activity_id'] = g_aid;
    jsondict['action'] = "getcoupon";
    //修改全局share_callback定义
    share_callback = builder(context);
    jsondict['callback'] = 'share_callback';
    jsondict['target'] = g_acceptable;
    jsondict["url"] = wechat_url;   //默认使用分享到微信的那个
    jsondict["pic"] = weibo_pic;    //默认不使用icon图
    if(context && context == "weibo") {
        jsondict['target'] = ['weibo'];
        jsondict["url"] = weibo_url;
    }
    //TODO:注：如果被封，那么这里就要写成包含message，文案也需要改？
    if(context && context == "wechat") {
        jsondict['target'] = ['timeline', ''];
        jsondict["url"] = wechat_url;
        jsondict["pic"] = wechat_pic;
    }

    console.log(JSON.stringify(jsondict));
    if(context && context.length != 0)
        return jsondict;
    else
        return JSON.stringify(jsondict);
}
//app报告分享成功，开始用ajax真正检测是否有抽奖机会
function share_success(stype, code){
    //用stype来判定消耗的是哪个按钮
    var t = "";
    if(stype == 1) 
        t = "weibo";
    if(stype == 2)  //message //TODO：被封时候的应对，打开这个
        console.log("分享到message");
    if(stype == 4) 
        t = "wechat_timeline";
    if(t == undefined || t == "" || t.length == 0) {
        //分享成功但是目的有问题？
        showRedCircleTip('未知的分享目标<br>请重新分享');
        return false;
    }
    var jd = {action:"confirm_action",activity_id:g_aid, did:g_did,
        uid:g_uid, user_action:{token:code, type:t}};
    jd["signature"] = "diaox2_grab_coupon_" + g_uid + "_" + g_aid + "_" + g_did;
    jd["signature"] = md5(jd["signature"]);
    $.ajax({
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify(jd),
        dataType: "json",
        url: g_api,
        success: enable_choujiang(stype),
        timeout: 8000,
        error: fail_share_check(stype)
    });
    return true;
}

var enable_choujiang = function(stype) {
    //stype == 1/2/4 weibo/message/timeline
    return function(data) {
        if(data == undefined || data.state != "SUCCESS" || data.res == undefined) {
            //提示添加抽奖机会错误，重试
            console.log(data); console.log('增加抽奖机会返回空');
            showRedCircleTip('增加抽奖机会<br>出问题，请重试');
            return false;
        }
        if(data.res.action_status == "SUCCESS") {
            var tar = null;
            var selector;
            //data.res.user_data[0];//默认
            //data.res.user_data[1];//wechat
            //data.res.user_data[2];//weibo
            //参考stype，对 0 1 2操作
            //数值：0还没分享过，1已经分享过没抽奖，>=2抽过了
            if(stype == 1) {
                tar = data.res.user_data.status[2];
                selector = ".wb";
            }
            if(stype == 4) {
                tar = data.res.user_data.status[1];
                selector = ".wx";
            }
            if(stype == 2)  //TODO: 被封的时候打开这个, message
                console.log('hehe 2 found');
            if(tar != undefined && tar != null)
                if(tar == 0) {
                    console.log('绕过js限制，直接抽奖，作弊哟');
                    //提示错误，修改绑定为分享，虽然应该就是分享
                    text(document.querySelector('.tip'),'无效的分享 请重新分享');
                    /*
                    document.querySelector(selector).onclick = function()
                        WebViewJavascriptBridge.callHandler('activeshare',get_share_meta('wechat'));
                    */
                    return false;
                } else {
                    if(tar == 1) {
                        //正确，机会+1，修改按钮文案 和 绑定
                        //绑定抽奖
                        showRedCircleTip('抽奖机会+1');
                        changeToPrizeBtn(document.querySelector(selector), function(){choujiang(selector)});

                    } else {
                        //tar >=2
                        //抽过了，禁止，修改为无法按钮
                        disableShareBtn(document.querySelector(selector),'今日机会已用完<br>明日再来');
                    }
                }
        } else {    //data.res.action_status != "SUCCESS"
            //机制fail，非数据fail，提示添加抽奖机会失败，重试
            text(document.querySelector(selector),'申请抽奖机会失败<br>请重试');
            //此时按钮的绑定就是分享，不用动
            return false;
        }
        return true;
    };
};
var fail_share_check = function(stype) {
    return function (e) {
        console.log(e);
        //获取抽奖机会出现错误或者超时，提示重新分享
        showRedCircleTip('增加抽奖机会超时<br>请重新分享');
        //此时绑定不用修改
    };
};
//LIBs md5
function md5cycle(f,h){var g=f[0],e=f[1],j=f[2],i=f[3];g=ff(g,e,j,i,h[0],7,-680876936);i=ff(i,g,e,j,h[1],12,-389564586);j=ff(j,i,g,e,h[2],17,606105819);e=ff(e,j,i,g,h[3],22,-1044525330);g=ff(g,e,j,i,h[4],7,-176418897);i=ff(i,g,e,j,h[5],12,1200080426);j=ff(j,i,g,e,h[6],17,-1473231341);e=ff(e,j,i,g,h[7],22,-45705983);g=ff(g,e,j,i,h[8],7,1770035416);i=ff(i,g,e,j,h[9],12,-1958414417);j=ff(j,i,g,e,h[10],17,-42063);e=ff(e,j,i,g,h[11],22,-1990404162);g=ff(g,e,j,i,h[12],7,1804603682);i=ff(i,g,e,j,h[13],12,-40341101);j=ff(j,i,g,e,h[14],17,-1502002290);e=ff(e,j,i,g,h[15],22,1236535329);g=gg(g,e,j,i,h[1],5,-165796510);i=gg(i,g,e,j,h[6],9,-1069501632);j=gg(j,i,g,e,h[11],14,643717713);e=gg(e,j,i,g,h[0],20,-373897302);g=gg(g,e,j,i,h[5],5,-701558691);i=gg(i,g,e,j,h[10],9,38016083);j=gg(j,i,g,e,h[15],14,-660478335);e=gg(e,j,i,g,h[4],20,-405537848);g=gg(g,e,j,i,h[9],5,568446438);i=gg(i,g,e,j,h[14],9,-1019803690);j=gg(j,i,g,e,h[3],14,-187363961);e=gg(e,j,i,g,h[8],20,1163531501);g=gg(g,e,j,i,h[13],5,-1444681467);i=gg(i,g,e,j,h[2],9,-51403784);j=gg(j,i,g,e,h[7],14,1735328473);e=gg(e,j,i,g,h[12],20,-1926607734);g=hh(g,e,j,i,h[5],4,-378558);i=hh(i,g,e,j,h[8],11,-2022574463);j=hh(j,i,g,e,h[11],16,1839030562);e=hh(e,j,i,g,h[14],23,-35309556);g=hh(g,e,j,i,h[1],4,-1530992060);i=hh(i,g,e,j,h[4],11,1272893353);j=hh(j,i,g,e,h[7],16,-155497632);e=hh(e,j,i,g,h[10],23,-1094730640);g=hh(g,e,j,i,h[13],4,681279174);i=hh(i,g,e,j,h[0],11,-358537222);j=hh(j,i,g,e,h[3],16,-722521979);e=hh(e,j,i,g,h[6],23,76029189);g=hh(g,e,j,i,h[9],4,-640364487);i=hh(i,g,e,j,h[12],11,-421815835);j=hh(j,i,g,e,h[15],16,530742520);e=hh(e,j,i,g,h[2],23,-995338651);g=ii(g,e,j,i,h[0],6,-198630844);i=ii(i,g,e,j,h[7],10,1126891415);j=ii(j,i,g,e,h[14],15,-1416354905);e=ii(e,j,i,g,h[5],21,-57434055);g=ii(g,e,j,i,h[12],6,1700485571);i=ii(i,g,e,j,h[3],10,-1894986606);j=ii(j,i,g,e,h[10],15,-1051523);e=ii(e,j,i,g,h[1],21,-2054922799);g=ii(g,e,j,i,h[8],6,1873313359);i=ii(i,g,e,j,h[15],10,-30611744);j=ii(j,i,g,e,h[6],15,-1560198380);e=ii(e,j,i,g,h[13],21,1309151649);g=ii(g,e,j,i,h[4],6,-145523070);i=ii(i,g,e,j,h[11],10,-1120210379);j=ii(j,i,g,e,h[2],15,718787259);e=ii(e,j,i,g,h[9],21,-343485551);f[0]=add32(g,f[0]);f[1]=add32(e,f[1]);f[2]=add32(j,f[2]);f[3]=add32(i,f[3])}function cmn(h,e,d,c,g,f){e=add32(add32(e,h),add32(c,f));return add32((e<<g)|(e>>>(32-g)),d)}function ff(g,f,k,j,e,i,h){return cmn((f&k)|((~f)&j),g,f,e,i,h)}function gg(g,f,k,j,e,i,h){return cmn((f&j)|(k&(~j)),g,f,e,i,h)}function hh(g,f,k,j,e,i,h){return cmn(f^k^j,g,f,e,i,h)}function ii(g,f,k,j,e,i,h){return cmn(k^(f|(~j)),g,f,e,i,h)}function md51(c){txt="";var e=c.length,d=[1732584193,-271733879,-1732584194,271733878],b;for(b=64;b<=c.length;b+=64){md5cycle(d,md5blk(c.substring(b-64,b)))}c=c.substring(b-64);var a=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];for(b=0;b<c.length;b++){a[b>>2]|=c.charCodeAt(b)<<((b%4)<<3)}a[b>>2]|=128<<((b%4)<<3);if(b>55){md5cycle(d,a);for(b=0;b<16;b++){a[b]=0}}a[14]=e*8;md5cycle(d,a);return d}function md5blk(b){var c=[],a;for(a=0;a<64;a+=4){c[a>>2]=b.charCodeAt(a)+(b.charCodeAt(a+1)<<8)+(b.charCodeAt(a+2)<<16)+(b.charCodeAt(a+3)<<24)}return c}var hex_chr="0123456789abcdef".split("");function rhex(c){var b="",a=0;for(;a<4;a++){b+=hex_chr[(c>>(a*8+4))&15]+hex_chr[(c>>(a*8))&15]}return b}function hex(a){for(var b=0;b<a.length;b++){a[b]=rhex(a[b])}return a.join("")}function md5(a){return hex(md51(a))}function add32(d,c){return(d+c)&4294967295}if(md5("hello")!="5d41402abc4b2a76b9719d911017c592"){function add32(a,d){var c=(a&65535)+(d&65535),b=(a>>16)+(d>>16)+(c>>16);return(b<<16)|(c&65535)}};


/*****************全局变量*******************/
// 是否是最后一天
var isLastDay = false;
// 该用户是否中奖
var isWinning = false;

var arrPrototype = Array.prototype;

/*****************全局函数*******************/

// 显示 loading 遮罩层
function showLoading(){
    document.querySelector('.mask').style.display = 'display';
}
// 关闭 loading 遮罩层
function closeLoading(){
    document.querySelector('.mask').style.display = "none";
}
/*
   parent 父容器
   callback 点击事件的回调
   text 按钮文本
 */
function createWBBtn(parent,callback,text){
    var shareWBBtn = document.createElement('a'),
        text = text || '分享到微博';
    parent.innerHTML = '';
    shareWBBtn.innerHTML = text;
    shareWBBtn.className = 'btn share-btn wb';
    shareWBBtn.href = 'javascript:void(0);';
    parent.appendChild(shareWBBtn);
    // “分享到微博”按钮 绑定事件
    shareWBBtn.onclick = function(e){
        callback(e);
    }
}
function createWXBtn(parent,callback,text){
    var shareWXBtn = document.createElement('a'),
        text = text || '分享到朋友圈';
    shareWXBtn.innerHTML = text;
    shareWXBtn.className = 'btn share-btn wx';
    shareWXBtn.href = 'javascript:void(0);'
        parent.appendChild(shareWXBtn);
    shareWXBtn.onclick = function(e){
        callback && callback.call(this,e);
    }
}
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
/*
   分享成功之后，点击了那个按钮，就要把那个按钮变成 “点此抽奖”，并提示用户 抽奖机会+1
   which 被点击的按钮
   btnText 按钮文本 默认是 “点此抽奖”
   tipText 提示用户获得抽奖机会的文本 默认是 “抽奖机会+1”
 */
function changeToPrizeBtn(which,callback,btnText,tipText){
    var tip = document.querySelector('.tip'),
        tipText = tipText || '分享成功 马上去抽奖吧',
        btnText = btnText || '点此抽奖';
    which.style.cssText = "background:url(images/share-succ-bg.png) center center no-repeat;background-size:2.14rem .83rem";
    which.innerHTML = btnText;
    tip.innerHTML = tipText;
    tip.style.display = 'block';
    which.onclick = function(e){
        callback && callback.call(this,e);
    }
}

function disableShareBtn(which,text){
    var cls = which.className,wb,wx,text = text || '没中奖<br>明日再来';
    // 如果是最后一天，按钮 文案改成 '抽奖机会已用完'
    if(isLastDay){
        which.innerHTML = '抽奖机会已用完';
    }else{
        which.innerHTML = text;
    }
    which.style.cssText = 'background:url(images/fail-btn.png) center center no-repeat;background-size:2.14rem .83rem;font-size:.26rem;';
    which.onclick = null;
    // if(cls.indexOf('wx')!== -1){
    //     wb = document.querySelector('.wb');
    //     if(wb.getAttribute('style') == null){
    //         wb.innerHTML = '分享到微博<br>再抽一次';
    //     }
    // }else{
    //     wx = document.querySelector('.wx');
    //     if(wx.getAttribute('style') == null){
    //         wx.innerHTML = '分享到朋友圈<br>再抽一次';
    //     }
    // }
}   
/*
   两处地方调用本方法：
   1、用户已经登录，且还没有分享抽奖，直接调用该方法
   2、用户登录成功，且第一次抽奖已经使用，且分享抽奖还没有使用
 */
function sharePrize(){
    /*
       首先呼起遮罩层。
       然后发送ajax请求，根据请求到的数据
       1、来点亮按钮；
       2、更改文本；
       3、绑定事件；
       最后在ajax的success关闭遮罩层
     */
    var tip = document.querySelector('.tip'),
        btnContainer = document.querySelector('.btn-container'),
        viewMyPrize = document.querySelector('.view-my-prize');
    // 更改提示文本
    tip.innerHTML = '将此活动分享至朋友圈或微博<br>每天获得两次抽奖机会';
    tip.style.visibility = "visible";
    tip.style.display = "block";
    // 显示 “查看我的奖品”
    viewMyPrize.style.visibility = "visible";
    // 移除 “点此立即登录按钮”
    btnContainer.removeChild(document.querySelector('.btn'));
    // 创建 “分享到微博” 按钮，并绑定事件
    createWBBtn(btnContainer,function(e){
            WebViewJavascriptBridge.callHandler('activeshare', get_share_meta('weibo'));
            // showRedCircleTip('抽奖机会+1');
            // shareFail();
            // var target = e.target;
            // 分享按钮 变为 点此抽奖 按钮，并绑定事件
            /*
               changeToPrizeBtn(target,function(e){
               disableShareBtn(target);
            // 在这儿调用抽奖方法
            winning(this);
            });
             */
            });
    // 创建 “分享到朋友圈” 按钮，并绑定事件
    createWXBtn(btnContainer,function(e){
            //showRedCircleTip('抽奖机会+1');
            WebViewJavascriptBridge.callHandler('activeshare', get_share_meta('wechat'));
            /*
               var target = e.target;
               changeToPrizeBtn(target,function(e){
               disableShareBtn(target);
            // winning(this);
            unwinning(this);
            });
             */
            });

    // disableShareBtn(document.querySelector('.wb'));

    // changeToPrizeBtn(document.querySelector('.wb'),function(){
    // });
}

/*
   在判断是否登录之后
   1、已经登录  调用 login
   2、还没有登录  调用 logout
 */
function login(){
    var tip = document.querySelector('.tip'),
        btn = document.querySelector('.btn'),
        viewMyPrize = document.querySelector('.view-my-prize');
    /*
       首先判断是否是第一次抽奖，如果是第一次抽奖，送一次抽奖机会
       否则 调用 sharePrize 方法来显示 分享按钮
     */
    // if(isFirst){
    //     // 隐藏提示文本
    //     tip.style.visibility = 'hidden';
    //     // 更改按钮文案
    //     btn.innerHTML = '点此抽奖';
    //     // 显示“查看我的奖品”
    //     viewMyPrize.style.visibility = 'visible';
    //     // 绑定“点此抽奖”按钮点击事件
    //     btn.onclick = function(){
    //         // 调用 抽奖方法
    //         winning();
    //     }
    // } else {
    // 显示分享按钮
    sharePrize();
    // }
}
// 未登录
function logout(){
    // 未登录的话，提示用户即可，不改变 按钮文案及按钮点击事件
    document.querySelector('.tip').innerHTML = '登录失败 请重新登录';
}
// 分享失败的回调
function shareFail(){
    document.querySelector('.tip').innerHTML = '分享失败 再试一次';
}
// 已经过期 跳转到过期页
function toExpirePage(){
    window.location.href = "expire.html";
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

/*
   未中奖
   btn 被点击的 点此抽奖 按钮
   text 按钮更改后的文本
 */ 
function unwinning(btn,text){
    var tip = document.querySelector('.tip'),cls = btn.className,wb,wx,text = text || '没中奖<br>明日再来';
    tip.innerHTML = '您每天都有两次抽奖机会哟<br>分享到朋友圈和微博可各获得一次';
    btn.innerHTML = text;
    showRedCircleTip('很遗憾<br>您未能中奖');
}
// 抽奖失败
function winningFail(){
    document.querySelector('.tip').innerHTML = '抽奖失败 再试一次';
}

/*
   显示 （注意：必须点击下方按钮分享才可获得抽奖机会）
   在某些安卓机型下，右上角的分享按钮分享之后，并不知道用户分享到哪儿了，需要提示用户
   使用下方的分享
 */
function showAttention(t){
    if(t)
        document.querySelector('.attention').innerHTML = t;
    document.querySelector('.attention').style.visibility = "visible";
}
function text(obj, t){
    obj.style.visibility = "visible";
    obj.innerHTML = t;
}
// 退回到用户未登录状态
function restart(tipText){
    var btnContainer = document.querySelector('.btn-container'),
        tipText = tipText || '您尚未登录 无法参与活动',
        tip = document.querySelector('.tip'),
        btnHtml = '<a href="javascript:ddCheckLogin(CLcb,true);" class="login btn">点此立即登录</a>';
    text(btnContainer,btnHtml);
    text(tip,tipText);
}
// 默认抽奖状态的dom操作
function defaultPrize(callback){
    var btnContainer = document.querySelector('.btn-container'),
        tip = document.querySelector('.tip'),
        viewMyPrize = document.querySelector('.view-my-prize');
    tip.style.visibility = 'hidden';
    viewMyPrize.style.visibility = 'visible';
    text(btnContainer,'');
    var a = document.createElement("a");
    a.href = "javascript:void(0);";
    a.className = "login btn red-btn";
    text(a,'点此抽奖');
    a.onclick =function(e){
        callback.call(this,e);
    }
    btnContainer.appendChild(a);
}
// 页面得奖区域的build函数
function build_prize_all(data){
    console.log(data);
    // 根据请求数据来渲染dom
    //data = JSON.parse(data);
    document.querySelector(".winning-list").innerHTML = '';
    var res = data.res;
    var activity_data = res.activity_data;
    var awards = activity_data.awards;
    var frag = document.createDocumentFragment();
    var li;
    var stringBuffer = [];
    // imgList 决定了奖品的顺序
    var imgList = {
        "DD1Y_MOTO360":{
src:'1moto360',
    href:'http://www.motorola.com.cn/on/demandware.store/Sites-Motorola_CN-Site/zh_CN/Default-Start?utm_medium=app&utm_source=diaodiao&utm_campaign=pr_20151111',
    title:'智能手表中的选美冠军'
        },
        "DD1Y_TOOTHBRUSH":{
src:'2tooth210',
    href:'http://c.diaox2.com/view/app/?m=show&id=858',
    title:'千颂伊同款的旗舰级电动牙刷HX9361'
        },
        "DD1Y_KINDLE":{
src:'3kindlepw210',
    href:'http://c.diaox2.com/view/app/?m=show&id=3420',
    title:'文艺与科技的完美结合'
        },
        "DD1Y_KANKEN":{
src:'4kankenclassic210',
    href:'http://c.diaox2.com/view/app/?m=show&id=1826',
    name:'Kanken背包（多色）',
    title:'凹造型必备，能装又能「装」'
        },
        "DD1Y_JELLYCAT":{
src:'5jellycat',
    href:'http://c.diaox2.com/view/app/?m=show&id=1055',
    title:'星二代们的街拍利器'
        },
        "DD1Y_THERMOS":{
src:'6thermos210',
    href:'http://m.jd.hk/ware/view.action?wareId=1951113071',
    title:'日本的细致&德国的品质'
        },
        "DD1Y_MIFFY":{
src:'7miffy210',
    href:'http://c.diaox2.com/view/app/?m=show&id=3923',
    title:'60年不倒还能继续卖萌的兔子'
        },
        "DD1Y_STOSTO":{
src:'8zhenkongbeng210',
    href:'http://item.m.jd.com/product/1694001123.html',
    title:'质量与颜值并重的家用收纳真空泵'
        },
        "DD1Y_BSLR":{
src:'9bslr',
    href:'http://c.diaox2.com/view/app/?m=show&id=418',
    title:'风靡日本40年的必备手信'
        },
        "DD1Y_CLIPPER":{
src:'10nail210',
    href:'http://c.diaox2.com/view/app/?m=show&id=3686',
    title:'红点设计大奖 x 调调限量版'
        },
        "DD1Y_SANTE":{
src:'11maipian210',
    href:'http://c.diaox2.com/view/app/?m=show&id=3514',
    title:'满溢浆果清香的健康零食'
        }
    }
    var index = 0;
    for(var attr in imgList){
        stringBuffer.length = 0;
        var each = awards[attr];
        var info = each.info;
        var img = imgList[attr];
        var price = info.price;
        var count = info.total;
        var winners = each.winners;
        var winnersHTMLStr = '';
        var viewMoreHTMLStr = '';
        var name = info.name;
        var winningArea = document.querySelector('.winning');
        var winningList = winningArea.querySelector('.winning-list');
        var ulStyle = '';
        var l = 0;

        if(attr == 'DD1Y_KANKEN'){
            name = img.name;
        }
        if(winners && winners.length){
            viewMoreHTMLStr='<a href="javascript:void(0);" class="view-more">展开更多<i class="bottom-arrow"></i></a>';
            winners.forEach(function(item,index){
                winnersHTMLStr += '<li>' + item.nick_name +'</li>';
            })
            l = winners.length;
        }else{
            ulStyle = 'height:0;';
        }
        
        stringBuffer.push('<a class="winning-block clearfix" target="_blank" href="',img.href,'"><img src="images/prize/',img.src,'.jpg" alt="奖品"><div class="prize-detail"><h2 class="prize-name">',name,'</h2><p class="prize-prize">价值￥',price,'</p><p class="prize-desc">',img.title,'</p><span class="right-arrow"></span></div></a><p class="winning-gays-count">数量：',l,'/',count,'</p><ul class="winning-gays clearfix" style="',ulStyle,'">',winnersHTMLStr,'</ul>',viewMoreHTMLStr,'<span class="bottom-line"></span></li>');
        li = document.createElement('li');
        li.innerHTML = stringBuffer.join('');
        frag.appendChild(li);
    }
    winningList.appendChild(frag);
    // 展开更多的点击事件
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
}
/*****************DOMReady*******************/
document.addEventListener('DOMContentLoaded',function(){
        // 是否是最后一天
        isLastDay = false;
        // 该用户是否中奖
        isWinning = false;
        // 如果已经过期，跳转到过期页
        // 调整奖品展示列表容器(ul)的宽度，使得能容纳下所有的奖品
        var prizes = document.querySelector('.prizes');
        (function(prizes){
         var prizesLi = prizes.querySelectorAll('li'),
         len = prizesLi.length,
         // 计算 ul.prizes 的宽度
         eachPrize = prizesLi[0],
         ow = eachPrize.offsetWidth,
         marginLeftAndRight = 2*len*Math.ceil(parseFloat(getComputedStyle(eachPrize,null).marginLeft));
         prizes.style.width = ow*prizesLi.length + marginLeftAndRight + "px";
         })(prizes)
        //closeLoading();
        // 发送ajax 拉取中奖信息
        $.ajax({
            url:g_api,
            type:"POST",
            contentType:'application/json',
            data:JSON.stringify({
                'uid':43,
                'activity_id':65535,
                'did':'7419E5E3-F353-4631-A673-601655E65F38',
                'action':'get_activity_info',
                'signature':'9b856f60079d062b1815349846a28353'
            }),
            success: build_prize_all,
            timeout: 6000,
            error: function(x,t,e){console.log('默认拉取出问题');console.log(e);}
})

// 查看我的中奖信息点击事件
var viewMyPrize = document.querySelector('.view-my-prize');
viewMyPrize.onclick = function(){
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
}); 
//add event listener DOM ready
// 加载完毕移除加载动画
/*
window.onload = function(){
  closeLoading();
  }
*/