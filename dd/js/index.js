$(function(){
        var 
        doc = document,
        // 首先计算 bannerUl的宽度，使其能容纳所有的条目
        oBannerBoxUl = $(".banner-box-ul"),
        oBannerBoxUlLi = oBannerBoxUl.children(),
        width = oBannerBoxUlLi.width(),
        len = oBannerBoxUlLi.length,
        oPrevBtn = $('.prev-btn'),
        oNextBtn = $('.next-btn'),
        // reg = /\/view\/app\/\?m=(?:show|zk|scene)&id=(\d+)?/i,
        reg = /\/view\/app\/\?m=(?:show|zk|scene)&id=(\d+)?(&ch=goodthing)?/i,
        // 第二中文章url 形如 http://c.diaox2.com/cms/diaodiao/articles/goodthing/893_893.html
        reg2 = /\/cms\/diaodiao\/articles\/(?:goodthing|firstpage|experience|weekend)\/\d+_(\d+)?\.html/i,
        toReplaceStr = "article/$1.html",
        oSearchInput = doc.getElementById("search-input"),
        $oSearchInput = $(oSearchInput),
        oDeleteAll = doc.getElementById("deleteAll"),
        $oDeleteAll = $(oDeleteAll),
        UA = navigator.userAgent,
        //当前索引
        index = 0;
// 判断来访设备，若是移动设备，跳转到下载页
if(/iphone|ipad|android|mobile|phone/i.test(UA)){
    window.location.href = "download.html";
}
// 动态计算宽度 
oBannerBoxUl.css("width",len*width),
    oNextBtn.on('click',function(){
            if(++index === len){
            index = 0;
            }
            oBannerBoxUl.animate({left:-width * index});
            });
oPrevBtn.on('click',function(){
        if(--index === -1){
        index = len-1;
        }
        oBannerBoxUl.animate({left:-width * index});
        });
$.ajax({
url: "http://c.diaox2.com/cms/diaodiao/pcsite/goodthing_feed_list.json",
dataType:'jsonp',
jsonp:'cb',//这是发送到服务器的参数名。可不指定，jquery会默认把参数名变成callback
jsonpCallback:"cb",//这是发送到服务器的参数值。这个名称必须与服务器传过来的 cb( josn ) 函数调用的函数名称一样
success:function(result){
var list = result.goodthing_feed_list,a,url,match;
$(".banner-show .loading").each(function(index,every){
    a = $(every).find("a"),url;
    goodthing = list[index];
    url = goodthing.url;
    match = url.match(reg);
    if(match && match.length){
    url = match[0].replace(reg,toReplaceStr);
    }else{
    match = url.match(reg2);
    if(match && match.length){
    url = match[0].replace(reg2,toReplaceStr);
    }
    }
    a.attr("href",url);
    a.find("img").attr("src",goodthing.cover_image_url);
    a.find("img").attr("alt",goodthing.title);
    a.find("p").html(goodthing.title);
    })
}
});
// 加入收藏
$('.add').click(function() {
        if (window.sidebar && window.sidebar.addPanel) { // Mozilla Firefox Bookmark
        try{
        window.sidebar.addPanel(document.title,window.location.href,''); 
        }catch(e){
        alert('请按 ' + (navigator.userAgent.toLowerCase().indexOf('mac') != - 1 ? 'Command/Cmd' : 'CTRL') + ' + D 加入收藏');
        }
        } else if(window.external && ('AddFavorite' in window.external)) { // IE Favorite
        try{
        window.external.AddFavorite(location.href,document.title); 
        }catch(e){
        alert('请按 ' + (navigator.userAgent.toLowerCase().indexOf('mac') != - 1 ? 'Command/Cmd' : 'CTRL') + ' + D 加入收藏');
        }
        } else if(window.opera && window.print) { // Opera Hotlist
        this.title=document.title;
        return true;
        } else { // webkit - safari/chrome
        alert('请按 ' + (navigator.userAgent.toLowerCase().indexOf('mac') != - 1 ? 'Command/Cmd' : 'CTRL') + ' + D 加入收藏');
        }
        });
});
