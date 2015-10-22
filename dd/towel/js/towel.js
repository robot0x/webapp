// 分享成功
function success(url){
    var section1 = document.querySelector('.sect1');
    var img = section1.querySelector('img');
    var btn = section1.querySelector('.btn');
    img.src = 'images/share-succ-b1.png';
    btn.href = url;
}
// 分享
function share(){
    var section1 = document.querySelector('.sect1');
    var img = section1.querySelector('img');
    var btn = section1.querySelector('.btn');
    img.src = 'images/share-b1.png';
    btn.innerHTML = '下载调调，立即领取';
    btn.href = "http://www.diaox2.com/wapdown.php"
    section1.removeChild(section1.querySelector('.link'));
}
// 分享失败
function fail(){
    var section1 = document.querySelector('.sect1');
    var img = section1.querySelector('img');
    var btn = section1.querySelector('.btn');
    img.src = 'images/share-fail-b1.png';
    // btn.href = url;
}
// 活动结束
function end(){
    var section1 = document.querySelector('.sect1');
    var img = section1.querySelector('img');
    var btn = section1.querySelector('.btn');
    img.src = 'images/share-end-b1.png';
    // btn.href = url;
}