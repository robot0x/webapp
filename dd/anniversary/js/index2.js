/*****************Bridge*******************/
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
//global
var g_appVersion, g_uid, g_did, g_os, g_aid = 65535;
var g_acceptable = ['weibo', 'timeline'];
//Raw invoke
connectWebViewJavascriptBridge(bridgeInitCallback);

function envcallback(env_data, context_data) {
    /*
    @"app_name" : @"diaodiao",
    @"os"       : @"ios",
    @"version"  : @"1.0.1"
    @"uid"      : @"1.3之后，返回用户id"，需要的话参考这里
    */
    //注意，env_data，没有result == "YES"的设计
    var flag;
    try {
        if(typeof(env_data) != "object" || env_data.app_name != "diaodiao") {
            flag = false;
        } else {
            flag = true;
            g_appVersion = env_data.version;
            if(env_data.os && env_data.os == "ios") {
                g_os = "ios";
                g_uid = env_data.uid?env_data.uid:0;  //not-loggedin? = 0
                g_did = env_data.did?env_data.did:undefined;
            } else {
                g_os = "android";
                //g_uid -> checklogin
                g_did = "android";
            }

        }
    } catch(e) {
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
        } else {
            console.log("Not logged in, say sorry!");
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
    var tmp = {action:"get_activity_info", uid:g_uid, activity_id:g_aid};
    tmp["did"] = g_did; //ios:real android:"android"
    tmp["signature"] = "diaox2_query_coupon_" + g_uid + "_" + g_aid + "_" + g_did;
    tmp["signature"] = md5(tmp["signature"]);
    ajax({
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify(tmp),
        dataType: "json",
        url: "http://api.diaox2.com/v2/coupon",
        success: build_button, //todo, 根据返回值敲定按钮是否可点; 修改获奖区
        timeout: 8000,
        error: re_check //重试
    });
    return true;
}


function build_button(data) {
    try{
        if(data == undefined || data.state != "SUCCESS" || data.res == undefined) {
            //TODO: 提示获取活动信息失败? 直接重试? 退回到未登录
            //TODO: 如果回退到未登录，缺乏对应的DOM操作函数
            //after_login();
            // 退回到 未登录状态
            restart();
            return false;
        }
        //user_data
        //data.res.user_data[0];//默认
        //data.res.user_data[1];//wechat
        //data.res.user_data[2];//weibo
        //数值：0还没分享过，1已经分享过没抽奖，>=2抽过了
        if(data.res.user_data[0] == 1) {
            //只可能是1或>=2
            //TODO: 默认抽奖上！dom更新，绑定确认
            // 显示默认抽奖的按钮并绑定事件
            defaultPrize(function(){
                defaultChoujiang();
            });

            //注意，这里需要一起把微博微信的抽奖也置为可以，逻辑上肯定可以的
            //然后在抽奖的success函数里，显示微博/微信抽奖
        } else {
            //这里处理没有默认抽奖的
            if(data.res.user_data[1] >= 2) {
                //TODO: 微信不可用，等明天
                //TODO: 这里不需要显示"分享到xx再来一次"
                disableShareBtn(document.querySelector('.wx'), "您今天已经抽过");

            }
            if(data.res.user_data[2] >= 2) {
                //TODO: 微博不可用，等明天
                //TODO: 这里不需要显示"分享到xx再来一次"
                disableShareBtn(document.querySelector('.wb'), "您今天已经抽过");
            }
            if(data.res.user_data[1] == 0) {
                //绑定分享//TODO: 
                //onclick = "javascript:WebViewJavascriptBridge.callHandler('activeshare', get_share_meta('wechat'));"
                // changeToPrizeBtn(document.querySelector('.wx'), function(){WebViewJavascriptBridge.callHandler('activeshare',get_share_meta('wechat'));});
                document.querySelector('.wx').onclick = function(){
                    WebViewJavascriptBridge.callHandler('activeshare',get_share_meta('wechat'));
                }
            }
            if(data.res.user_data[1] == 1) {
                //TODO: 绑定抽奖
                changeToPrizeBtn(document.querySelector('.wx'), function(){choujiang(".wx");});
            }
            if(data.res.user_data[2] == 0) {
                //绑定分享//TODO
                //onclick = "javascript:WebViewJavascriptBridge.callHandler('activeshare', get_share_meta('weibo'));"
                // changeToPrizeBtn(document.querySelector('.wb'), function(){
                //     WebViewJavascriptBridge.callHandler('activeshare',get_share_meta('weibo'));
                // });
                // changeToPrizeBtn(document.querySelector('.wx'), function(){
                //     WebViewJavascriptBridge.callHandler('activeshare',get_share_meta('wechat'));
                // });
                document.querySelector('.wb').onclick = function(){
                    WebViewJavascriptBridge.callHandler('activeshare',get_share_meta('wechat'));
                }
            }
            if(data.res.user_data[2] == 1) {
                //TODO: 绑定抽奖
                changeToPrizeBtn(document.querySelector('.wb'), function(){choujiang(".wb")});
                changeToPrizeBtn(document.querySelector('.wx'), function(){choujiang(".wx")});
            }
            return true;
        }
        //activity_data
        //todo: build dom，根彦峰对函数
    } catch(e) {
        console.log(e);
        //TODO: 提示添加抽奖机会错误，重试
        return false;
    }
    return true;
}
function re_check(x,t,e) {
    console.log("get_activity_info有问题"); console.log(e);
    after_login();  //再来
}
function defaultChoujiang(){
    //抽奖ajax封装
    var jd = {action:"lucky_draw", activity_id:g_aid, uid:g_uid, did:g_did}
    jd["signature"] = "diaox2_query_coupon_" + g_uid + "_" + g_aid + "_" + g_did;
    jd["signature"] = md5(jd["signature"]);
    ajax({
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify(tmp),
        dataType: "json",
        url: "http://api.diaox2.com/v2/coupon",
        success: function(data) {
            if(data == undefined || data.state != "SUCCESS" || data.res == undefined) {
                 //TODO：报错，试作没有抽奖过，不动dom 提示默认抽奖失败
                 text(document.querySelector('.tip'),'抽奖失败 请重试');
                 return false;
             }
             if(data.res.ctype == 0) {
                 //TODO: 中奖，显示东西
                 // 直接调用中奖对话框
                 showWinningDialog(winningDialog,'恭喜您中奖了','您的奖品是：<span>Moto360</span>',function(e){
                    // 首先 调用 getData
                    // 发送ajax，保存信息
                    winningDialog.style.display = 'none';
                },function(e){
                    winningDialog.style.display = 'none';
                })
                 // data.res.user_data，用这个build中奖信息
                 return true;
             }
             if(data.res.ctype == 101) {
                 //TODO: 未抽中，提示用户未抽中即可
                 showRedCircleTip('很遗憾<br>您未能中奖');
                 return true;
             }
             // 不管抽没抽中，都显示 分享按钮
             sharePrize();
        },
        timeout: 8000,
        error: function(e) {
            //TODO: 失败了，不修改，用户可以重新点，但是需要出提示
            console.log('defaultChoujiang error');
        }
    });
}
function choujiang(from) {
    //抽奖ajax封装
    var jd = {action:"lucky_draw", activity_id:g_aid, uid:g_uid, did:g_did}
    jd["signature"] = "diaox2_query_coupon_" + g_uid + "_" + g_aid + "_" + g_did;
    jd["signature"] = md5(jd["signature"]);
    ajax({
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify(tmp),
        dataType: "json",
        url: "http://api.diaox2.com/v2/coupon",
        success: function(data) {
             //TODO: 根据from，和中奖的情况，操作DOM，显示中奖情况，置灰按钮
             //from 是按钮传递过来的 if from == "wb" / "wx"
             if(data == undefined || data.state != "SUCCESS" || data.res == undefined) {
                 //TODO：报错，试做没有抽奖过，不动dom
                 text(document.querySelector('.tip'),'抽奖失败 请重试');
                 return false;
             }
             if(data.res.ctype == 0) {
                 //TODO: 中奖，显示东西
                 winning(document.querySelector(from), "button TEXT", "tip TEXT");
                 // data.res.user_data，用这个build中奖信息
                 return true;
             }
             if(data.res.ctype == 101) {
                 //TODO: 未抽中，抽奖消耗了，按钮置灰，文案。。。
                 // winningFail(document.querySelector(from), "button TEXT", "tip TEXT");
                 // 未中奖
                 unwinning(document.querySelector(from));
                 return true;
             }
             //ctype == 102 以及任何其他数值
             // 没有抽奖资格，作弊，其他
             //TODO: 回退到未登录状态
        },
        timeout: 8000,
        error: function(e) {
            //TODO: 失败了，不修改，用户可以重新点，但是需要出提示
        }
    });
}
var share_callback = function(data){console.log("default!");};
function builder(context) {
    //生成函数，返回一个处理share_callback类型的函数，但是有闭包能访问context
    return function(data) {
        //app返回的是api的data.res，所以这里无需处理
        if(data == undefined || data.length == 0) {
            //没有数据，rare，客户端bug，分享失败//TODO
            //fail();
        } else {
            console.log(data);
            var ld;
            try {
                if(typeof data === "string")
                    ld = JSON.parse(data);
                else
                    ld = data;
            } catch(e) {
                //fail(); //数据错误，分享失败//TODO
                return false;
            }
            console.log(data);
            // == 1 重复抢
            if(data.ctype && data.ctype == 1) {
                console.log("用完了，置灰按钮");    //TODO
                return;
            }
            //没有券? + 抢完 + 未抢到
            if(data.ctype && (data.ctype == 2 || data.ctype == 4 || data.ctype == 6)) {
                console.log("需要重新分享");    //TODO
                return;
            }
            //没开始 + 结束
            if(data.ctype && (data.ctype == 3 || data.ctype == 5)) {
                console.log("错误的时间？跳转结束页面");    //TODO
                return;
            }
            //未正确分享 分享失败 或 获取Coupon失败
            if(data.ctype && data.ctype >= 1000) {
                console.log("需要重新分享");    //TODO
                return;
            }
            //ctype == 0 抢到
            if(data.code != undefined && data.code.length == 0) {
                if(context == undefined || context.length == 0) {
                    //通过右上角分享
                    console.log("anonymous share success");
                    if(data.stype == undefined) //android, no context //TODO
                        console.log("分享无效，请使用按钮分享"); //不会消耗ctype==0
                    else {   //ios, nocontext
                        //TODO:右上角没法disable，查看两个按钮状态
                        //没到这一步或者按钮已经不允许按
                        share_success(data.stype, data.code); //分享成功，合规的有效分享目的地
                    }
                } else {
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
    var jsondict = {"version": "2.0"};
    var title = "调调福利大放送！一周年10万元大抽奖！";

    var thumb = "http://c.diaox2.com/coupon/towel/images/towelthumb.jpg";
    var cover = "http://c.diaox2.com/coupon/towel/images/towelcover.jpg";
    var weibo_url = "http://c.diaox2.com/coupon/towel/share.html";
    var wechat_url = "http://c.diaox2.com/coupon/towel/share.html";

    jsondict["title"] = title;
    jsondict["weibo"] = "「" + title + "」@调调App工作室" + url;
    jsondict['wechat'] = "分享自 「调调」，全球品质好物推荐";
    jsondict['other'] = "分享自 「调调」，全球品质好物推荐";

    jsondict["pic"] = cover;    //wechat auto center slice

    jsondict['activity_id'] = g_aid;
    jsondict['action'] = "getcoupon";
    //修改全局share_callback定义
    share_callback = builder(context);
    jsondict['callback'] = 'share_callback';
    jsondict['target'] = g_acceptable;
    jsondict["url"] = wechat_url;   //默认使用分享到微信的那个
    if(context && context == "weibo") {
        jsondict['target'] = ['weibo'];
        jsondict["url"] = weibo_url;
    }
    //TODO:注：如果被封，那么这里就要写成包含message，文案也需要改？
    if(context && context == "wechat") {
        jsondict['target'] = ['timeline', ''];
        jsondict["url"] = wechat_url;
    }

    console.log(JSON.stringify(jsondict));
    if(context && context.length != 0)
        return JSON.stringify(jsondict);
    else
        return jsondict;
}
//app报告分享成功
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
        return false;
    }
    var jd = {action:"confirm_action",activity_id:g_aid, did:g_did,
        uid:g_uid, user_action:{token:code, type:t}};
    jd["signature"] = "diaox2_query_coupon_" + g_uid + "_" + g_aid + "_" + g_did;
    jd["signature"] = md5(jd["signature"]);
    ajax({
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify(jd),
        dataType: "json",
        url: "http://api.diaox2.com/v2/coupon",
        success: enable_choujiang(stype),    //TODO:根据返回值增加抽奖按钮可点性
        timeout: 8000,
        error: fail_share_check(stype)  //TODO:提示重新分享
    });
    return true;
}

var enable_choujiang = function(stype) {
    return function(data) {
        try{
            if(data == undefined || data.state != "SUCCESS" || data.res == undefined) {
                //TODO: 提示添加抽奖机会错误，重试
                return false;
            }
            if(data.res.action_status == "SUCCESS") {
                var tar = null;
                var selector = "";
                //data.res.user_data[0];//默认
                //data.res.user_data[1];//wechat
                //data.res.user_data[2];//weibo
                //参考stype，对 0 1 2操作
                //数值：0还没分享过，1已经分享过没抽奖，>=2抽过了
                if(stype == 1) {
                    tar = data.res.user_data[2];
                    selector = ".wb";
                }
                if(stype == 4) {
                    tar = data.res.user_data[1];
                    selector = ".wx";
                }
                if(stype == 2)  //TODO: 被封的时候打开这个, message
                    console.log('hehe');
                if(tar != undefined && tar != null)
                    if(tar == 0) {
                        console.log('绕过js限制，直接抽奖，作弊哟');
                        //TODO: 提示错误，修改绑定为分享，虽然应该就是分享
                        text(document.querySelector('.tip'),'无效的分享 请重新分享');
                        document.querySelector(selector).onclick = function(){
                            WebViewJavascriptBridge.callHandler('activeshare',get_share_meta('wechat'));
                        }
                    } else {
                        if(tar == 1) {
                            //TODO: 正确，机会+1，修改按钮文案 和 绑定
                            //TODO: 绑定抽奖
                            changeToPrizeBtn(document.querySelector(selector), function(){choujiang(selector)});

                        } else {
                            //tar >=2
                            //TODO:抽过了，禁止，修改为无法按钮
                            disableShareBtn(document.querySelector(selector),'文案？');
                        }
                    }
            } else {
                //TODO: 提示添加抽奖机会失败，重试
                text(document.querySelector(selector),'文案？');
                //此时按钮的绑定就是分享，不用动
                return false;
            }
        } catch(e) {
            console.log(e);
            //TODO: 提示添加抽奖机会错误，重试，此时按钮绑定就是分享，不用动
            return false;
        }
        return true;
    };
};
var fail_share_check = function(stype) {
    return function (e) {
        console.log(e);
        //TODO: 获取抽奖机会出现错误或者超时，提示重新分享
        //此时绑定不用修改
    };
};
//LIBs md5
function md5cycle(f,h){var g=f[0],e=f[1],j=f[2],i=f[3];g=ff(g,e,j,i,h[0],7,-680876936);i=ff(i,g,e,j,h[1],12,-389564586);j=ff(j,i,g,e,h[2],17,606105819);e=ff(e,j,i,g,h[3],22,-1044525330);g=ff(g,e,j,i,h[4],7,-176418897);i=ff(i,g,e,j,h[5],12,1200080426);j=ff(j,i,g,e,h[6],17,-1473231341);e=ff(e,j,i,g,h[7],22,-45705983);g=ff(g,e,j,i,h[8],7,1770035416);i=ff(i,g,e,j,h[9],12,-1958414417);j=ff(j,i,g,e,h[10],17,-42063);e=ff(e,j,i,g,h[11],22,-1990404162);g=ff(g,e,j,i,h[12],7,1804603682);i=ff(i,g,e,j,h[13],12,-40341101);j=ff(j,i,g,e,h[14],17,-1502002290);e=ff(e,j,i,g,h[15],22,1236535329);g=gg(g,e,j,i,h[1],5,-165796510);i=gg(i,g,e,j,h[6],9,-1069501632);j=gg(j,i,g,e,h[11],14,643717713);e=gg(e,j,i,g,h[0],20,-373897302);g=gg(g,e,j,i,h[5],5,-701558691);i=gg(i,g,e,j,h[10],9,38016083);j=gg(j,i,g,e,h[15],14,-660478335);e=gg(e,j,i,g,h[4],20,-405537848);g=gg(g,e,j,i,h[9],5,568446438);i=gg(i,g,e,j,h[14],9,-1019803690);j=gg(j,i,g,e,h[3],14,-187363961);e=gg(e,j,i,g,h[8],20,1163531501);g=gg(g,e,j,i,h[13],5,-1444681467);i=gg(i,g,e,j,h[2],9,-51403784);j=gg(j,i,g,e,h[7],14,1735328473);e=gg(e,j,i,g,h[12],20,-1926607734);g=hh(g,e,j,i,h[5],4,-378558);i=hh(i,g,e,j,h[8],11,-2022574463);j=hh(j,i,g,e,h[11],16,1839030562);e=hh(e,j,i,g,h[14],23,-35309556);g=hh(g,e,j,i,h[1],4,-1530992060);i=hh(i,g,e,j,h[4],11,1272893353);j=hh(j,i,g,e,h[7],16,-155497632);e=hh(e,j,i,g,h[10],23,-1094730640);g=hh(g,e,j,i,h[13],4,681279174);i=hh(i,g,e,j,h[0],11,-358537222);j=hh(j,i,g,e,h[3],16,-722521979);e=hh(e,j,i,g,h[6],23,76029189);g=hh(g,e,j,i,h[9],4,-640364487);i=hh(i,g,e,j,h[12],11,-421815835);j=hh(j,i,g,e,h[15],16,530742520);e=hh(e,j,i,g,h[2],23,-995338651);g=ii(g,e,j,i,h[0],6,-198630844);i=ii(i,g,e,j,h[7],10,1126891415);j=ii(j,i,g,e,h[14],15,-1416354905);e=ii(e,j,i,g,h[5],21,-57434055);g=ii(g,e,j,i,h[12],6,1700485571);i=ii(i,g,e,j,h[3],10,-1894986606);j=ii(j,i,g,e,h[10],15,-1051523);e=ii(e,j,i,g,h[1],21,-2054922799);g=ii(g,e,j,i,h[8],6,1873313359);i=ii(i,g,e,j,h[15],10,-30611744);j=ii(j,i,g,e,h[6],15,-1560198380);e=ii(e,j,i,g,h[13],21,1309151649);g=ii(g,e,j,i,h[4],6,-145523070);i=ii(i,g,e,j,h[11],10,-1120210379);j=ii(j,i,g,e,h[2],15,718787259);e=ii(e,j,i,g,h[9],21,-343485551);f[0]=add32(g,f[0]);f[1]=add32(e,f[1]);f[2]=add32(j,f[2]);f[3]=add32(i,f[3])}function cmn(h,e,d,c,g,f){e=add32(add32(e,h),add32(c,f));return add32((e<<g)|(e>>>(32-g)),d)}function ff(g,f,k,j,e,i,h){return cmn((f&k)|((~f)&j),g,f,e,i,h)}function gg(g,f,k,j,e,i,h){return cmn((f&j)|(k&(~j)),g,f,e,i,h)}function hh(g,f,k,j,e,i,h){return cmn(f^k^j,g,f,e,i,h)}function ii(g,f,k,j,e,i,h){return cmn(k^(f|(~j)),g,f,e,i,h)}function md51(c){txt="";var e=c.length,d=[1732584193,-271733879,-1732584194,271733878],b;for(b=64;b<=c.length;b+=64){md5cycle(d,md5blk(c.substring(b-64,b)))}c=c.substring(b-64);var a=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];for(b=0;b<c.length;b++){a[b>>2]|=c.charCodeAt(b)<<((b%4)<<3)}a[b>>2]|=128<<((b%4)<<3);if(b>55){md5cycle(d,a);for(b=0;b<16;b++){a[b]=0}}a[14]=e*8;md5cycle(d,a);return d}function md5blk(b){var c=[],a;for(a=0;a<64;a+=4){c[a>>2]=b.charCodeAt(a)+(b.charCodeAt(a+1)<<8)+(b.charCodeAt(a+2)<<16)+(b.charCodeAt(a+3)<<24)}return c}var hex_chr="0123456789abcdef".split("");function rhex(c){var b="",a=0;for(;a<4;a++){b+=hex_chr[(c>>(a*8+4))&15]+hex_chr[(c>>(a*8))&15]}return b}function hex(a){for(var b=0;b<a.length;b++){a[b]=rhex(a[b])}return a.join("")}function md5(a){return hex(md51(a))}function add32(d,c){return(d+c)&4294967295}if(md5("hello")!="5d41402abc4b2a76b9719d911017c592"){function add32(a,d){var c=(a&65535)+(d&65535),b=(a>>16)+(d>>16)+(c>>16);return(b<<16)|(c&65535)}};


/*****************全局变量*******************/
// 是否过期
var isExpire = false;
// 是否是第一次抽奖
var isFirst = false;
// 是否登录
var isLogin = true;
// 是否是最后一天
var isLastDay = false;
// 该用户是否中奖
var isWinning = true;

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
    // 显示 “查看我的奖品”
    viewMyPrize.style.visibility = "visible";
    // 移除 “点此立即登录按钮”
    btnContainer.removeChild(document.querySelector('.btn'));
    // 创建 “分享到微博” 按钮，并绑定事件
    createWBBtn(btnContainer,function(e){
        showRedCircleTip('抽奖机会+1');
        // shareFail();
        var target = e.target;
        // 分享按钮 变为 点此抽奖 按钮，并绑定事件
        changeToPrizeBtn(target,function(e){
            disableShareBtn(target);
            // 在这儿调用抽奖方法
            winning(this);
        });
    });
    // 创建 “分享到朋友圈” 按钮，并绑定事件
    createWXBtn(btnContainer,function(e){
        showRedCircleTip('抽奖机会+1');
        var target = e.target;
        changeToPrizeBtn(target,function(e){
            disableShareBtn(target);
            // winning(this);
            unwinning(this);
        });
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
// login();
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
function setDate(data){
    window.localStorage.setItem('winning_info',JSON.stringify(data));
}
// 获取本地数据
function getDate(){
    return JSON.parse(window.localStorage.getItem('winning_info'));
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
    var data = getDate();
    var name = which.querySelector('.name');
    var phone = which.querySelector('.phone');
    var addr = which.querySelector('.addr');
    if(data != null && data != 'null'){
       if(data.name){
         name.value = data.name;
       }
       if(data.phone){
        phone.value = data.phone;
       }
       if(data.addr){
        addr.value = data.addr;
       }
    }
    which.querySelector('.confirm').onclick = function(e){
        confirmCb.call(this,e);
        var obj = {};
        var nameVal = name.value.trim();
        var phoneVal = phone.value.trim();
        var addrVal = addr.value.trim();
        if(nameVal){
            obj.name = name.value;
        }
        if(phoneVal){
            obj.phone = phone.value;
        }
        if(addrVal){
            obj.addr = addr.value;
        }
        setDate(obj);
    }
    which.querySelector('.cancel').onclick = function(e){
        cancelCb.call(this,e);
    }
}   
/* 
  中奖了
  btn 被点击的 “点此抽奖按钮”
  btnText 更改后的按钮文本
  tipText 提示文本
*/

function winning(btn,btnText,tipText){
    var winningDialog = document.getElementById('winning'),
        tip = document.querySelector('.tip'),cls = btn.className,wb,wx,
        btnText = btnText || '今日机会已用完<br>明日再来',
        tipText = tipText || '分享到朋友圈和微博可各获得一次';
    tip.innerHTML = tipText;
    btn.innerHTML = btnText;
    // 绑定 winning-dialog上的 确认 取消 按钮的事件
    showWinningDialog(winningDialog,'恭喜您中奖了','您的奖品是：<span>Moto360</span>',function(e){
        // 首先 调用 getData
        // 发送ajax，保存信息
        winningDialog.style.display = 'none';
    },function(e){
        winningDialog.style.display = 'none';
    })
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
function showAttention(){
    document.querySelector('.attention').visibility = "visible";
}
// ajax函数
function ajax(opts){
     var xhr = new XMLHttpRequest(),
         method = opts.type || "GET",
         async = true,
         contentType = opts.contentType || 'application/x-www.form-urlencoded';
         data = opts.data || {},
         type = function (arg){
            var t = typeof arg,s;
            if(t === 'object'){
                if(arg === null){
                    return 'null';
                }else{
                    s = Object.prototype.toString.call(arg);
                    return s.slice(8,s.length-1).toLowerCase();
                }
            }else{
                return t;
            }
      };
     if(opts.async != undefined){
        async = opts.async;
     }
     xhr.open(method,opts.url,async);
     if(method.toUpperCase() === "POST"){
        xhr.setRequestHeader('Content-Type',contentType);
     }
     data = opts.data;
     if(data && type(data) == 'object'){
            data = (function(data){
                var str = '',prop;
                for(prop in data){
                    str += prop + "=" + data[prop] + "&";
                }
                return str;
            })(data);
    }
     xhr.send(data);
     xhr.onreadystatechange = function(){
        if(xhr.readyState === 4){
            if(xhr.status === 200){
                opts.success && opts.success(xhr.responseText);
            }else{
                opts.error && opts.error({readyState:xhr.readyState,status:xhr.status});
            }
        }else{
            opts.error && opts.error({readyState:xhr.readyState,status:xhr.status});
        }
     }
}
function text(obj,text){
    obj.innerHTML = text;
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
        var a = document.createElement(a);
        a.href = "javascript:void(0);";
        a.className = "login btn";
        text(a,'点此抽奖');
        a.onclick =function(e){
            callback.call(this,e);
        }
        btnContainer.appendChild(a);
}
/*****************DOMReady*******************/
document.addEventListener('DOMContentLoaded',function(){
    // 是否过期
    isExpire = false;
    // 是否是第一次抽奖
    isFirst = false;
    // 是否登录
    isLogin = true;
    // 是否是最后一天
    isLastDay = false;
    // 该用户是否中奖
    isWinning = true;

    // 如果已经过期，跳转到过期页
    if(isExpire){
        toExpirePage();
    }
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
    // 发送ajax 拉取中奖信息
    ajax({
        url:'http://121.42.141.74/dd_api/v2/coupon',
        type:"POST",
        contentType:'application/json',
        data:JSON.stringify({
            'uid':43,
            'activity_id':65535,
            'did':'7419E5E3-F353-4631-A673-601655E65F38',
            'action':'get_activity_info',
            'signature':'9b856f60079d062b1815349846a28353'
        }),
        success:function(data){
            // console.log(data);
            // 根据请求数据来渲染dom
            data = JSON.parse(data);
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
                    title:'文艺与科技完美结合的Kindle PW'
                },
                "DD1Y_KANKEN":{
                    src:'4kankenclassic210',
                    href:'http://c.diaox2.com/view/app/?m=show&id=1826',
                    name:'Kanken背包（多色）',
                    title:'瑞典皇室认证的高端品牌'
                },
                "DD1Y_JELLYCAT":{
                    src:'5jellycat',
                    href:'http://c.diaox2.com/view/app/?m=show&id=1055',
                    title:'星二代们的街拍利器'
                },
                "DD1Y_THERMOS":{
                    src:'6thermos210',
                    href:'http://product.suning.com/0070088095/126791051.html',
                    title:'日本的细致&德国的品质'
                },
                // 7 米菲兔子链接暂缺
                "DD1Y_MIFFY":{
                    src:'7miffy210',
                    href:'#',
                    title:'110年不倒还能继续卖萌兔子'
                },
                "DD1Y_STOSTO":{
                    src:'8zhenkongbeng210',
                    href:'https://detail.tmall.com/item.htm?id=45480518953',
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
                    title:'红点设计大奖的调调限量版指甲刀'
                },
                "DD1Y_SANTE":{
                    src:'11maipian210',
                    href:'http://c.diaox2.com/view/app/?m=show&id=3514',
                    title:'满溢浆果清香的sante干吃麦片'
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
                var l = winners.length;
                var winningArea = document.querySelector('.winning');
                var winningList = winningArea.querySelector('.winning-list');
                var ulStyle = '';

                if(attr == 'DD1Y_KANKEN'){
                    name = img.name;
                }
                if(winners && l){
                    viewMoreHTMLStr='<a href="javascript:void(0);" class="view-more">展开更多<i class="bottom-arrow"></i></a>';
                }else{
                    ulStyle = 'height:0;';
                }
                winners.forEach(function(item,index){
                    winnersHTMLStr += '<li>' + item.nick_name +'</li>';
                    if(index == 0){
                        for(var j = 0;j<40;j++){
                            winnersHTMLStr += '<li>liyanfeng' + (j+1) + '</li>';
                        }
                    }
                })
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
            })
        }
    })

    // loginCheck
    if(isLogin){
        // sharePrize();
    }else{ // 没有登录，给登录按钮添加事件
        var loginBtn = document.querySelector('.login');
        loginBtn.onclick = function(){
            alert(this.innerHTML);
        }
    }
    // 查看我的中奖信息点击事件
    var viewMyPrize = document.querySelector('.view-my-prize');
    viewMyPrize.onclick = function(){
        if(isWinning){ //中奖
            var winningDialog = document.getElementById('view_winning');
            showWinningDialog(winningDialog,'您已中的奖品有：<br>Moto360,DW手表', 
                '您每天都有两次抽奖机会哟<br>分享到朋友圈和微博可各获得一次',function(e){

                    winningDialog.style.display = 'none';
                },function(e){
                    winningDialog.style.display = 'none';
                })
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
    
   // 不是第一次抽奖
    if(!isFirst){
        (function(){
            var tip = document.querySelector('.tip'),
            btn = document.querySelector('.btn');
            // tip.innerHTML = '此活动分享至朋友圈或微博<br>每天获得两次抽奖机会';
        })()
    }
})
// 加载完毕移除加载动画
window.onload = function(){
    closeLoading();
}