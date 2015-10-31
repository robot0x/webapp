$(function() {
    var
        doc = document,
        // 第一种文章url 形如 http://c.diaox2.com/view/app/?m=show&id=1234(&ch=goodthing)
        reg = /\/view\/app\/\?m=(?:show|zk|scene)&id=(\d+)?(&ch=goodthing)?/i,
        // 第二中文章url 形如 http://c.diaox2.com/cms/diaodiao/articles/goodthing/893_893.html
        reg2 = /\/cms\/diaodiao\/articles\/(?:goodthing|firstpage|experience|weekend)\/\d+_(\d+)?\.html/i,
        toReplaceStr = "$1.html",
        bannerContainer = doc.querySelector('.article-banner-container'),
        UA = navigator.userAgent,
        isWirelessDev = /iphone|mobile|phone|android|pad/i.test(UA);
    // 如果是小屏移动设备，那么就跳转到share页
    // 大屏移动设备及pc，比如ipad、androidPad、pc还是用pc页
    try {
        if (isWirelessDev && document.documentElement.offsetWidth < 600) {
            window.location.href = 'http://c.diaox2.com/share/' + document.body.id + '.html';
        }
    } catch (e) {
        console.log(e);
    }
    if (bannerContainer !== null) {
        var
            bannerList = bannerContainer.querySelector('.banner-list'),
            bannerListLi = bannerList.querySelectorAll('li'),
            len = bannerListLi.length,
            // 开关变量。若轮播的图片为一张，就不需要轮播效果，且左右两边也不需要切换按钮
            isOne = len === 1,
            index = 0,
            timer, flag = true,
            zIndex = maxZindex = len - 1,
            curLi,
            $bannerList = $(bannerList),
            $bannerContainer = $(bannerContainer),
            // 上一张
            $prevBtn = $bannerContainer.prev(),
            // 下一张
            $nextBtn = $bannerContainer.next(),
            // banner宽度
            bannerWidth = $bannerContainer.width();
        if (!isOne) {
            $(bannerListLi).each(function(index, every) {
                every.style.zIndex = zIndex--;
            });
            $prevBtn.on('click', function() {
                if (--index === -1) {
                    index = len - 1;
                }
                curLi = bannerListLi[index];
                curLi.style.left = -bannerWidth + "px";
                curLi.style.zIndex = ++maxZindex;
                $(curLi).animate({
                    left: 0
                });
            })
            $nextBtn.on('click', function() {
                if (++index === len) {
                    index = 0;
                }
                curLi = bannerListLi[index];
                curLi.style.left = bannerWidth + "px";
                curLi.style.zIndex = ++maxZindex;
                $(curLi).animate({
                    left: 0
                });
            })
            timer = setInterval(function() {
                $nextBtn.trigger('click');
            }, 1800);
            $(".article-banner").hover(function() {
                clearInterval(timer);
            }, function() {
                timer = setInterval(function() {
                    $nextBtn.trigger('click');
                }, 1800);
            })
        } else {
            $prevBtn.remove();
            $nextBtn.remove();
        }
    }

    function mycb(data) {
        console.log("callback invoked!");
        var hotList = $(".hot-list");
        $.each(data, function(index, item) {
            if (index > 3) return;
            $('<li class="f-l">' +
                '<a href="' + item.url.replace(reg, toReplaceStr) + '">' +
                '<img src="' + item.thumb + '" alt="' + item.title + '" width="144" height="144">' +
                '<p>' + item.title + '</p>' +
                '</a>' +
                '</li>').appendTo(hotList);
        });
    }

    function mycb(data) {
        console.log("callback invoked!");
        var hotList = $(".hot-list"),
            url, match, imgUrl;
        $(".success-remove").remove();
        $.each(data, function(index, item) {
            if (index > 3) return;
            url = item.url;
            imgUrl = item.thumb;
            if (imgUrl.indexOf("http") == -1) {
                imgUrl = "http://a.diaox2.com/cms/sites/default/files/" + imgUrl;
            }
            match = url.match(reg);
            if (match && match.length) {
                url = match[0].replace(reg, toReplaceStr);
            } else {
                match = url.match(reg2);
                if (match && match.length) {
                    url = match[0].replace(reg2, toReplaceStr);
                }
            }
            $('<li class="f-l">' +
                '<a href="' + url + '">' +
                '<img src="' + item.thumb + '" alt="' + item.title + '" width="144" height="144">' +
                '<p>' + item.title + '</p>' +
                '</a>' +
                '</li>').appendTo(hotList);
        });
    }
    $.ajax({
        //http://c.diaox2.com/view/app/?m=recommend&id=3217&callback=jQuery1113028636212670244277_1443079759695&_=1443079759696
        //http://api.diaox2.com/v1/stat/all?&cb=jQuery111308396169231273234_1443183199217&{%22a%22:1,%20%22b%22:2}
        url: "http://c.diaox2.com/view/app/?m=recommend&id=" + doc.body.className.split("_")[0],
        //url:"http://api.diaox2.com/v1/stat/all?",
        type: "GET",
        //data: '{"a":1, "b":2}',
        cache: true, //prevent the default parameter _=${timestamp}, CDN
        dataType: "jsonp",
        crossDomain: true,
        jsonpCallback: 'mycb', //override the &callback='jQuery123457676_253954801'
        jsonp: 'cb', //override the &'callback'=
        success: mycb,
        error: function(data) {
            console.log("recmmend error!");
            console.log(data)
        }
    });
    // 分享给好友功能相关的变量群
    var
        shareBox = doc.querySelector(".share-area"),
        shareWb = shareBox.querySelector(".share-wb"),
        shareList = shareBox.querySelector(".share-list"),
        cancle = shareList.querySelector("li.cancle a"),
        mask = doc.querySelector(".share-mask"),
        shareClose = doc.querySelector(".share-close"),
        share = doc.querySelector(".share"),
        shareWx = shareBox.querySelector(".share-wx"),
        bottomShare = doc.querySelector(".bottom-share"),
        $mask = $(mask),
        $shareClose = $(shareClose),
        $shareBox = $(shareBox),
        $share = $(share),
        $bottomShare = $(bottomShare),
        $shareWb = $(shareWb),
        $cancle = $(cancle),
        $shareWb = $(shareWx);
    // 分享给好友代码开始。分享给好友按钮点击处理事件
    $(shareWb).on("click", function() {
        $(shareList).animate({
            left: 0
        });
        $(shareWb).addClass("active");
        $(shareWx).removeClass("active");
    })
    $(shareWx).on("click", function() {
        $(shareList).animate({
            left: -800
        });
        $(shareWx).addClass("active");
        $(shareWb).removeClass("active");
    })

    function close() {
        $mask.toggleClass("disnone");
        $shareBox.animate({
            top: -450
        }, function() {
            $shareBox.toggleClass("disnone");
        })
    }
    // 开关变量，放置多次创建二维码。
    var isAlreadyCreateQRCode = false;
    // 创建二维码
    function createQRCode() {
        var pageName = document.body.id,
            matchArr, id;
        try {
            if (!pageName) {
                id = document.body.className.split("_")[0];
                if (id) {
                    pageName = id * Math.pow(2, 32) + (+id);
                    console.log(pageName);
                } else {
                    matchArr = window.location.href.match(/\d+/g);
                    if (matchArr && matchArr.length) {
                        pageName = matchArr[matchArr.length - 1];
                    }
                }
            }
            console.log(pageName);
        } catch (e) {
            console.log(e);
            pageName = window.location.href;
        }
        console.log(pageName);
        new QRCode(document.getElementById('qrcode'), "http://c.diaox2.com/share/" + pageName + ".html");
        isAlreadyCreateQRCode = true;
    }
    $cancle.on('click', close);
    $mask.on('click', close);
    $shareClose.on('click', close);
    $share.on("click", function() {
        $mask.toggleClass("disnone");
        $shareBox.toggleClass("disnone");
        !isAlreadyCreateQRCode && createQRCode();
        $shareBox.animate({
            top: doc.documentElement.scrollTop || doc.body.scrollTop + 100
        })
    });
    $bottomShare.on("click", function() {
        $mask.toggleClass("disnone");
        $shareBox.toggleClass("disnone");
        !isAlreadyCreateQRCode && createQRCode();
        $shareBox.animate({
            top: doc.documentElement.scrollTop || doc.body.scrollTop + 100
        })
    });
    var $method = $(".method"),
        tipsClass = "tt-ii-pp-s",
        $methodSpan = $method.find("span"),
        par;
    $methodSpan.hover(function() {
        par = this.parentNode;
        if (!$.contains(par, par.querySelector("." + tipsClass))) {
            $(par).css({
                "position": "relative",
                "z-index": 0
            }).append("<span class='" + tipsClass + "' style='position:absolute;top:-72%;left:25px;width:auto;font-size:14px;z-index:-1;'>" + this.innerHTML + "</span>");
        }
    }, function() {
        par = this.parentNode;
        $(par).find("." + tipsClass).remove();
    })
})

function update_success(data) {
    if (data.result != "SUCCESS") {
        console.log('update invoked but server fail.');
        console.log(data);
        return false;
    } else {
        var elements = $(".zs-box");
        var aid = $('body').attr('id');
        /*
           data.res[cid] {"fav": xxx, "up": xxx, "comment": xxx}
         */
        $(elements).find('.a-fav').text(data.res[aid].fav);
        $(elements).find('.a-up').text(data.res[aid].up);
    }
    return true;
}

function doupdate(cids) {
    var jsondict = {
        "aids": cids
    }
    var jsonstr = JSON.stringify(jsondict);
    jQuery.support.cors = true;
    $.ajax({
        type: "POST",
        contentType: "application/json",
        data: jsonstr,
        dataType: "json",
        url: "http://api.diaox2.com/v1/stat/all",
        success: update_success,
        timeout: 8000,
        error: function(x, t, e) {
            console.log("update failed, with error " + e);
        }
    });
    console.log("Sent data in get_stat is : " + jsonstr);
}

function get_stat() {
    var cids = [];
    cids.push(Number($("body").attr('id')));
    doupdate(cids);
    return true;
}

$(function() {
    var uid = $.cookie('DDuid');
    if (uid == undefined)
        uid = -1;
    logpage({
        "user": uid
    });

    $("img.lazy").each(function() {
        var tmp = $(this).attr('data-src');
        $(this).attr('src', tmp);
    });

    get_stat();
});