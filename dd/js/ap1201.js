//Begin Of File
var api_ajax_timeout = 8000;
function getlongid() {
    var serverid = $('body').attr("id");
    if(serverid == undefined) {
        //strip ?cid=xxxxx //TODO: 参数
        var m = window.location.href.match(/\?[ac]?id=(\d+)/i);
        if(m == undefined ) {
            console.log("No serverid found! Can't get comment");
            //TODO: 可以调用get_comment_fail生成结构
            return serverid = -1;
        } else {
            serverid = Number(m[1]);
            if(serverid < 4294967296)
                serverid = serverid * 4294967296 + serverid;
        }
    }
    return serverid;
}
function getshortid() {
    var serverid = $('body').attr("id");
    if(serverid == undefined) {
        //strip ?cid=xxxxx //TODO: 参数
        var m = window.location.href.match(/\?[ac]?id=(\d+)/i);
        if(m == undefined ) {
            console.log("No serverid found! Can't get comment");
            //TODO: 可以调用get_comment_fail生成结构
            return serverid = -1;
        } else {
            serverid = m[1];
        }
    }
    return serverid & 0xffff;

}
var get_access_succeed = function(selector) {
    if(selector == undefined) {
        selector = "span.cardread";
    }
    return function(data) {
        if(typeof(data) == 'undefined') {
            console.log('get_access succeeded but no data receive!');
            return false;
        }
        console.log("get_access_succeed: print data -> ");
        console.log(data);
        if(data.result != "SUCCESS") {
            console.log('get_access invoked but server fail.');
            return false;
        } else {
            var elements = $(selector);
            for(var i in data.vote_status) {
                for(var j=0; j<elements.length; j++) {
                    //TODO: slice 数组，加速后续查找
                    //TODO: 增加标签，将来不更新这个卡片的阅读数
                    if(i == $(elements[j]).attr('data-id')) {
                        $(elements[j]).text("阅读 " + data.vote_status[i].access);
                    }
                }
                console.log('Id[' + i + '] has access:' + data.vote_status[i].access);
            }
        }
        console.log("selector in closure is : ");
        console.log(selector);
        return true;
    };
};
var get_access_fail = function(selector) {
    if(selector == undefined) {
        selector = "span.cardread";
    }
    return function(XMLHttpRequest, textStatus, errorThrown) {
        console.log("get_access failed, with error " + errorThrown);
        console.log("update " + selector + " to 阅读 ...?");
        return true;
    };
};
//100 id a time at most，返回实际发送的数量
function get_access(input_dict, selector, get_succeed, get_fail) {
    //一次获取多篇文章的阅读数，传入的要求是id，url不能带最后的/
    var target = 'http://api.diaox2.com/v1/contvote';
    var sent_count = 0;
    if(input_dict == undefined) {
        //get_access_fail("span.cardread"); //show 阅读 ...
        return false;
    }
    if(selector == undefined) {
        selector = "span.cardread";
    }
    if(get_succeed == undefined) {
        get_succeed = get_access_succeed(selector);
    }
    if(get_fail == undefined) {
        get_fail = get_access_fail(selector);
    }
    jQuery.support.cors = true;
    var local_dict = {"method": "get", "cids": []};
    //cids : [17179869188,240518168632,433791696997]
    if(input_dict.length <= 100) {
        local_dict['cids'] = input_dict;
        sent_count = input_dict.length;
    } else {
        local_dict['cids'] = input_dict.slice(0, 100);
        sent_count = 100;
    }
    var postdata = "";
    postdata = $.toJSON(local_dict);
    $.ajax
    ({
        type: "POST",
        contentType: "application/json",
        data: postdata,
        dataType: "json", //"html"
        url: target,
        //额外的变量，让success函数可以访问
        success: get_succeed,
        timeout: api_ajax_timeout,
        error: get_fail
    });
    console.log("Sent " + sent_count + " ids at this time!");
    return sent_count;
}
//用来记录访问日志的函数簇
var add_access_succeed = function(postdata) {
    return function(data) {
        if(typeof(data) == 'undefined') {
            console.log('add_access succeeded but no data receive!');
            return false;
        }
        console.log("access_succeed: print data -> ");
        console.log(data);
        if(data.result != "SUCCESS") {
            console.log('add_access invoked but server fail.');
            return false;
        } else {
            /*
                result: "SUCCESS"
                vote_status: Object
                    access: 1
                    down: 1
                    up: 5
            */
            if(postdata.indexOf('"method": "access"') != -1) {
                console.log('Now this article is read ' + data.vote_status.access + ' times.');
            } else {
                console.log('Now action logged!');
            }
        }
        console.log("postdata in closure is : ");
        console.log(postdata);
        return true;
    };
};
var add_access_fail = function(postdata) {
    return function(XMLHttpRequest, textStatus, errorThrown) {
        console.log("add_access failed, with error " + errorThrown);
        console.log("postdata in closure is : ");
        console.log(postdata);
        return true;
    };
};

function add_access(input_dict, method, succ_func, fail_func) {
    //有参数，则增加到post数据里；无参数，则post数据默认
    // url =>  ; action => ; value => ;
    var selflink = window.location.href;
    var url = "";
    if(-1 != selflink.indexOf("?")) {
        url = selflink.substring(0, selflink.indexOf("?"));
    } else {
        url = selflink;
    }
    var serverid = $('body').attr("id");
    var type = $('body').attr('data-type');
    var target = "";
    if(serverid == undefined) {
        target = 'http://api.diaox2.com/v1/contvote';
    } else {
        target = 'http://api.diaox2.com/v1/contvote/' + serverid;
    }
    var postdata = "";
    if(method == undefined) {
        method = "access";
    } else {
        console.log("method is: " + method); //"log", "access"
    }
    if(input_dict != undefined) {
        input_dict["method"] = method;
        input_dict["url"] = url;
    } else {
        var input_dict = {"method": "access", "url": url, "action": "none", "value": "none"};
    }
    input_dict['self'] = selflink;
    input_dict['referer'] = document.referrer;
    input_dict['type'] = type;
    input_dict['isIOS'] = navigator.userAgent.match(/iphone|ipod|ios|ipad/i)?'true':'false';
    //?from=timeline&isappinstalled=0
    //?from=groupmessage&isappinstalled=0
    if(selflink.indexOf("?from=timeline") != -1) {
        input_dict["wechat"] = 1;
        input_dict["timeline"] = 1;
    } else if (selflink.indexOf("?from=groupmessage") != -1) {
        input_dict["wechat"] = 1;
        input_dict["groupmessage"] = 1;
    }  else if (selflink.indexOf("?from=singlemessage") != -1) {
        input_dict["wechat"] = 1;
        input_dict["singlemessage"] = 1;
    }
    if (selflink.indexOf("&isappinstalled=0") != -1) {
        input_dict["installed"] = 0;
    } else if (selflink.indexOf("&isappinstalled=1") != -1) {
        input_dict["installed"] = 1;
    }
    // add agent detect to find wechat
    if (navigator.userAgent.match(/MicroMessenger/i)) {
        input_dict["wechat"] = 1;
    }
    if (navigator.userAgent.match(/weibo/i)) {
        input_dict["weibo"] = 1;    //weibo may 'eat' referer, use agent 
    }
    postdata = $.toJSON(input_dict);
    //console.log(target);
    if(succ_func == undefined) {
        var succ_func = add_access_succeed(postdata);
    }
    if(fail_func == undefined) {
        var fail_func = add_access_fail(postdata);
    }
    jQuery.support.cors = true;
    $.ajax
    ({
        type: "POST",
        contentType: "application/json",
        data: postdata,
        dataType: "json", //"html"
        url: target,
        //额外的变量，让success函数可以访问
        success: succ_func,
        timeout: api_ajax_timeout, 
        error: fail_func
    });
    console.log("Sent add access: " + postdata);
    return true;
}
//记录任意一个元素上的点击，然后再跳转的函数簇
//需要被点击对象拥有data-href这个属性，没有，则跳到#链接，安全。
var succ_click = function(selector, extra) {
    if(extra == undefined) {
        extra = "NONE";
    }
    return function(data) {
        $(selector).toggleClass('sel');
        console.log("click call with extra " + extra + " succeeded with data");
        console.log(data);
        window.location.href = extra;
        return true;
    };
};
var fail_click = function(selector, extra) {
    if(extra == undefined) {
        extra = "NONE";
    }
    return function(XMLHttpRequest, textStatus, errorThrown) {
        $(selector).toggleClass('sel');
        console.log("click call with extra " + extra + " failed with error " + errorThrown);
        window.location.href = extra;
        return true;
    };
};
function bind_log_click(selector, attr, value) {
    if(selector == undefined) {
        selector = ".relcard";  //default related card
    }
    if(attr == undefined) {
        attr = "data-href";
    }
    if(value == undefined) {
        value = 1;  //value = "buylink"
    }
    $(selector).unbind("click");    //无条件解除多余的绑定?
    $(selector).bind("click", function (e){
        e.stopPropagation();
        var target = $(this).attr(attr);
        if(target == undefined || target.length == 0) {
            target = "#";
        }
        console.log("Click on " + e.toElement.tagName + " with target " + target);
        //target = url.encode(target);
        var className = e.toElement.className;
        if(className == undefined || className.length == 0) {
            className = "NONE";
        }
        $(this).toggleClass('sel');
        console.log('clicked!');
        add_access(
            {"target": target, "clickon": e.toElement.tagName, "class": className, "action": 'click', "value": value},
            "log",
            succ_click(this, target),
            fail_click(this, target)
        );
        return true;
    });
}
//增加热门文章的函数簇
//默认在div#relcardlast前添加，且添加5个，返回列表里随机选
//添加失败的话，默认加入一个刷新用的文章卡片
var relwidth = -1;
var relheight = -1;
var add_hot_success = function(num, success_callback) {
    if(num == undefined || isNaN(num)) {
        num = 5;   //default num
    }
    if(relwidth == undefined || relwidth == -1 || relheight == undefined || relheight == -1) {
        //NOTICE:插入relcard，不必要插入图+mask+content等内部结构，但是一次插入两个/一行，可以渲染出正确的结构
        var dummy = $('<div class="bottomshadow"><div class="headgrayband"></div><div class="sephead"><div class="sepinner"><img src="/cms/diaodiao/assets/guesslike.png" /><span>猜你喜欢</span></div></div><div id="relcardlist"> <div class="half"><div class="relcard"></div></div><div class="half"><div class="relcard"></div></div> <div id="relcardlast" class="clearfix"></div></div></div>').insertBefore('.clearfix.last');
        relwidth = $('.relcard').width();
        //596*486 = 1.23 640/512 = 1.25, use 596*486 to gen mask
        //TODO: magic，根据好物封面设置的
        relheight = Math.ceil(relwidth/596 * 486);
        dummy.remove();
    }
    return function(data) {
        var i = 0;
        var localdict = new Array();
        //跳过页面上已经有的链接，注意，这里的操作和markup相关
        var values = $("div.relcard");
        var pos = 0;
        var cleanurl = "";
        pos = window.location.href.indexOf("#diaodiao");
        //TODO: windows.location.href有域名，但是拿过来的json数据，不一定有域名
        if(-1 == pos) {
            cleanurl = window.location.href;
        } else {
            cleanurl = window.location.href.slice(0, pos);
        }
        pos = cleanurl.indexOf(".html?");
        if(-1 == pos) {
            console.log("No op on url");
        } else {
            cleanurl = cleanurl.slice(0, pos) + ".html";
        }
        localdict[cleanurl] = 1;
        for(i=0; i<values.length; i++) {
            //NOTICE：如果改js MARKUP，这里也要改
            cleanurl = $(values[i]).attr("data-href");
            localdict[cleanurl] = 1;
        }
        i = 0;
        var j = 0;
        var html_str = "";
        while(i<num && j<data.length) {
            pos = Math.floor(Math.random()*data.length);    //随机
            if(data[pos].url in localdict || data[pos].thumb == "" || 
                data[pos].title == "" || data[pos].total == "") {
                j++;    //避免json中url条数过少，或者其他情况
                data.splice(pos, 1);
                continue;
            }
            //分享页面的判定，banner tpl 或 href 或 TODO:埋class=share
            if (window.location.href.match(/\/share(?:test)?\/\d+\.html/i)) {
                data[pos].url = "http://" + window.location.host + "/share/" + data[pos].serverid + ".html";
            }
            //v2.0 , 处理title space
            data[pos].title = data[pos].title.replace(/[ \t]{2,}/g, ' ');
            html_str += '<div class="half">';
            html_str += '<div class="relcard" data-href="' + data[pos].url + '" data-type="' + data[pos].type + '">\n';
            //html_str += '<div class="relcard" data-href="' + data[pos].url + '" data-type="' + data[pos].type + '"><a href="' + data[pos].url + '">\n';
            //TODO: 根据页面type，重新标定relheight，如果是首页，框应该长一些?
            //但这样很难兼容新的封面596 * 866 vs 640 * 640，活动720 * 300，专题640 * 416
            var imgstyle = 'style="width:' + relwidth + 'px; height:' + relheight + 'px;"';
            var imgsimplestyle = 'style="width:' + relwidth + 'px;';
            //参考markup，这个div有遮挡逻辑，图片过高不碍事，所以图片计算了新尺寸(TODO)也无所谓
            html_str += '<div class="relimage"' + imgstyle  + '>';
            //20150720，李园宁：首页的图和好物不一样，图需要把上面ps的日期遮掉
            var image, data_type;
            //20150727，李园宁：不用新封面
            /*
            if(data[pos].coverex.length > 1) {
                image = data[pos].coverex;
                data_type = "ex";
            } else {
                image = data[pos].cover;
                data_type = "";
            }
            */
            image = data[pos].cover;

            //20150720，李园宁：首页的图上浮处理markup，少量的首页上面有两行字，不管。
            imgsimplestyle += 'position:relative;';
            if(data[pos].type == "firstpage") {
                //322 width时，首页图需要80px;
                imgsimplestyle += 'top:-' + Math.floor(80*relwidth/322) + 'px;"';
            } else {
                imgsimplestyle += '"';
            }
            html_str += '<img src="/cms/diaodiao/assets/pixel.gif" data-src="' + image + '" ' + imgsimplestyle + '/></div>';
            html_str += '<div class="relmask"></div>';
            var title = data[pos].title.length > 26
                ?data[pos].title.slice(0, 24) + '...'
                :data[pos].title;   //[TODO] magic, or when DOM added, check height then ...
            html_str += '<div class="relcontent"><table><tbody><tr><td class="reltitle">' + title + '</td></tr></tbody></table></div>';
            //html_str += '</a></div></div>';
            html_str += '</div></div>';
            localdict[data[pos].url] = 1;   //避免重复选取
            i++; j++;
        }
        if(html_str.length > 0) {
            $('<div class="bottomshadow"><div class="headgrayband"></div><div class="sephead"><div class="sepinner"><img src="/cms/diaodiao/assets/guesslike.png" /><span>猜你喜欢</span></div></div><div id="relcardlist"><div id="relcardlast" class="clearfix"></div></div></div>').insertBefore('.clearfix.last');
            $(html_str).insertBefore('#relcardlast');
        }
        //必须用bind event，否则不执行。默认ready执行
        $(".relimage > img").lazy({bind: "event", delay: 0});
        //绑定和update读数，必须要在这里，ajax异步真正完成 //v200读数不用了
        if(success_callback != undefined) {
            success_callback();
        }
        return true;
    };
};
var add_hot_fail = function(num, prefix, success_callback, fail_callback) {
    return function (XMLHttpRequest, textStatus, errorThrown) {
        console.log('get hot article failed, with error:');
        console.log(errorThrown);

        if(fail_callback != undefined) {
            fail_callback();
        }
        return true;
    };
};
//初始化新增热门文章卡片的函数，不可调用多次，但无判断
function initHot(num, prefix, success_callback, fail_callback)
{
    jQuery.support.cors = true;
    if(num == undefined || isNaN(num)) {
        num = 5;
    } else if(num == 0) {
        return;
    }
    if(prefix == undefined) {
        prefix = "cms/diaodiao/articles/dynamic";
    }
    var selflink = window.location.href;
    //可能切换域名，ajax拼接地址, TODO:直接不写host？
    var regex = /^(?:https?:\/\/)?([^\/]+)\//;
    var rs = regex.exec(selflink);
    var host = "http://c.diaox2.com/";      //TODO：host这里过CDN了
    if(rs != undefined) {
        host = rs[0];
    }

    prefix = '/view/app/?m=recommend&id='
    // http://c.diaox2.com/view/app/?m=recommend&id=3095
    var targeturl = host + prefix + getshortid();
    //TODO: CDN hold result, result is enough long    //but only work with GET
    $.ajax
        ({
        type: "GET",
        contentType: "application/x-www-form-urlencoded",
        dataType: "JSON", //"html"
        url: targeturl,
        success: add_hot_success(num, success_callback),
        timeout: api_ajax_timeout,
        error: add_hot_fail(num, prefix, success_callback, fail_callback)
    });
    return true;
}
//刷新所有文章卡片的阅读数的函数
function update_read(selector, callback) {
    if(selector == undefined) {
        selector = "span.cardread";
    }
    var localdict = $(selector);
    var cids = [];
    for(var i=0;i<localdict.length;i++) {
        if(isNaN($(localdict[i]).attr('data-id'))){
            continue;   //esc those may crash api
        }
        //TODO: 略过标签，已经更新过的
        cids.push(Number($(localdict[i]).attr('data-id')));
    }
    //TODO: use sleep to simplify MAGIC!
    timely_update_read = function(input) {
        //get_access(cids, selector, get_access_succeed, get_access_fail);
        //注意，需要100 100的来
        ofunc = function(){
            var pack = input.slice(0, 100);
            input = input.slice(100);
            if(pack.length > 0) {
                get_access(pack, selector);
                setTimeout(ofunc, 2000);
            } else {
                console.log("timer is off, callback time");
                if(callback != undefined) {
                    callback(selector);
                }
                return true;
            }
        };
        ofunc();
    };

    timely_update_read(cids);
    return true;
}

//图片浏览，默认在div class="content"的后代里面找img
//ddPicBrowserMode
function gen_pic_info(selector, skiplist, dummypic) {
    if(selector == undefined) {
        selector = "div.content img";
    }
    //PHP模板拼写的这两个资源，就在本机，属于assets，没有全路径
    if(skiplist == undefined || typeof(skiplist) != "object") {
        skiplist = {"/cms/diaodiao/assets/cart.png": "1"};
    } else {
        skiplist["/cms/diaodiao/assets/cart.png"] = "1" ;
    }
    if(dummypic == undefined || typeof(dummypic) != "object") {
        dummypic = {"/cms/diaodiao/assets/pixel.gif" : "1"};
    } else {
        dummypic["/cms/diaodiao/assets/pixel.gif"] = "1";
    }
    var jsondict = {"urls": []};
    var pic_list = $(selector);
    var i = 0;
    var basetag = "contentimg";
    for(i = 0; i < pic_list.length; i++) {
        //要么是src已加载的图，要么是data-src还没有加载的图，先拿到正确的图片地址
        var imgsrc = $(pic_list[i]).attr("src");
        if(imgsrc in dummypic) {
            imgsrc = $(pic_list[i]).attr("data-src");
        }
        //检测是否在跳过列表
        if(imgsrc in skiplist) {
            pic_list.splice(i, 1);
            i--; //to balance splice
            continue;
        }
        //检测是否gif, TODO: skip for iOS
        if(imgsrc.substr(-4).toLowerCase() == ".gif") {
            pic_list.splice(i, 1);
            i--;
            continue;
        }
        /*
        var dummyimg = new Image();
        dummyimg.src = imgsrc;
        if(dummyimg.width < 320 || dummyimg.height < 100) {
            //这里是按照尺寸过滤
            continue
        }*/
        //生成id，方便跳转#
        var imgid = basetag + i;
        $(pic_list[i]).attr("id", imgid);
        //$(pic_list[i]).attr("title");//$(pic_list[i]).attr("alt");
        jsondict["urls"].push({"url": imgsrc, "id": imgid});
    }
    console.log("gen_pic_info: gen json ok");
    //toJSON: dict -> str
    //var jsonstr = $.toJSON(jsondict);   //JSON.parse: str->JSON
    //定义点击函数，本闭包内，可访问jsonstr信息
    function in_content_img_clickfunc() {
        var start = $(this).attr("id");
        if(start.length) {
            jsondict["current"] = start;
            console.log(jsondict);
            ddPicBrowserMode(jsondict, exit_pic_browser);
        } else {
            console.log("There is no id for '" + this + "'");
        }
        return true;
    }
    //绑定
    for(i = 0; i < pic_list.length; i++) {
        $(pic_list[i]).bind("click", in_content_img_clickfunc);
    }
    console.log("gen_pic_info: bind ok.");
    return true;
}

//Add util to default calss
String.prototype.hashCode = function() {
  var hash = 0, i, chr, len;
  if (this.length == 0) return hash;
  for (i = 0, len = this.length; i < len; i++) {
    chr   = this.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};
//获得文章状态, TODO: 代码备份
function aa(X, t, e) {
    console.log("获取统计数据失败");
    console.log(e);
    console.log("response: " + X.responseText);
    if(target != undefined) {
        $(target).text("...");
    } else {
        $('span#cmt_num').text("...");
    }
    return true;
}
function get_article_status(ids, suc, fail) {
    var serverid = $('body').attr("id");
    if(serverid == undefined) {
        //strip ?cid=xxxxx //TODO: 参数
        var m = window.location.href.match(/\?[ac]?id=(\d+)/i);
        if(m == undefined ) {
            console.log("No serverid found! Can't get comment");
            //TODO: 可以调用get_comment_fail生成结构
            return false;
        } else
            serverid = m[1];
    }
    var jsondict = {
        "aids": ids
    }
    var jsonstr = JSON.stringify(jsondict);
    jQuery.support.cors = true;
    $.ajax
    ({
        type: "POST",
        contentType: "application/json",
        data: jsonstr,
        dataType: "json",
        url: "http://api.diaox2.com/v1/stat/all",
        success: suc, 
        timeout: 5000,
        error: fail
    });
    console.log("request sent : " + jsonstr);
    return true;
}


//End Of File
