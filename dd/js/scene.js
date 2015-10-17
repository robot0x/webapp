$(function(){
        // 分享给好友功能相关的变量群
        var
        doc = document,
        shareBox = doc.querySelector(".share-area"),
        shareWb = shareBox.querySelector(".share-wb"),
        shareList = shareBox.querySelector(".share-list"),
        cancle = shareList.querySelector("li.cancle a"),
        mask = doc.querySelector(".share-mask"),
        shareClose = doc.querySelector(".share-close"),
        share = doc.querySelector(".bottombar .share"),
        shareWx = shareBox.querySelector(".share-wx"),
        $mask = $(mask),
        $shareClose = $(shareClose),
        $shareBox = $(shareBox),
        $share = $(share),
        $shareWb = $(shareWb),
        $shareWb = $(shareWx),
        UA = navigator.userAgent,
        isWirelessDev = /iphone|mobile|phone|android|pad/i.test(UA);
        // 如果是小屏移动设备，那么就跳转到share页
        // 大屏移动设备及pc，比如ipad、androidPad、pc还是用pc页
        try{
            if(isWirelessDev && window.innerWidth < 600){
                window.location.href = 'http://c.diaox2.com/share/'+document.body.id+'.html';
             }
        }catch(e){
            console.log(e);
        }

        // 分享给好友代码开始。分享给好友按钮点击处理事件
        $cancle = $(cancle);
        $(shareWb).on("click", function() {
                $(shareList).animate({left:0});
                $(shareWb).addClass("active");
                $(shareWx).removeClass("active");
                })
$(shareWx).on("click", function() {
        $(shareList).animate({left: -800});
        $(shareWx).addClass("active");
        $(shareWb).removeClass("active");
        })

function close() {
    $mask.toggleClass("disnone");
    $shareBox.animate({top:-450}, function() {
$shareBox.toggleClass("disnone");
})
}
$cancle.on('click', close);
$mask.on('click', close);
$shareClose.on('click', close);
$share.on("click", function() {
        // alert(1);
        $mask.toggleClass("disnone");
        $shareBox.toggleClass("disnone");
        $shareBox.animate({
top: doc.documentElement.scrollTop || doc.body.scrollTop + 100
})
        })
})
function update_success(data) {
    if(data.result != "SUCCESS") {
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
    $.ajax
    ({
        type: "POST",
        contentType: "application/json",
        data: jsonstr,
        dataType: "json",
        url: "http://api.diaox2.com/v1/stat/all",
        success: update_success,
        timeout: 8000,
        error: function(x,t,e) {console.log("update failed, with error " + e);}
    });
    console.log("Sent data in get_stat is : " + jsonstr);
}
function get_stat() {
    var cids = [];
    cids.push(Number($("body").attr('id')));
    doupdate(cids);
    return true;
}

$(function(){
    var uid = $.cookie('DDuid');
    if(uid == undefined)
       uid = -1;
    logpage({"user": uid}); 

    $("img.lazy").lazy({
        combined: true,
        delay: 5000/*,
        enableThrottle: true,
        throttle: 100*/
    });
    get_stat();
});
