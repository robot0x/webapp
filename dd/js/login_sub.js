$(function(){
// 超出隐藏并显示 继续阅读 使用的是 jquery.dotdotdot.js
    var 
        reg = /\/view\/app\/\?m=(?:show|zk|scene)&id=(\d+)?(&ch=goodthing)?/i,
        // 第二中文章url 形如 http://c.diaox2.com/cms/diaodiao/articles/goodthing/893_893.html
        reg2 = /\/cms\/diaodiao\/articles\/(?:goodthing|firstpage|experience|weekend)\/\d+_(\d+)?\.html/i,
        toReplaceStr = "$1.html";
        // 从服务器端获取的json信息，在获取值得买ajax的success回调中赋值
        // alert(2);
  /***ajax请求区****/
  // 获取大家都再看
  $.ajax({
      url: "http://c.diaox2.com/view/app/?m=recommend",
      type: "GET",
      cache: true, //prevent the default parameter _=${timestamp}, CDN
      dataType: "jsonp",
      crossDomain: true,
      jsonpCallback: 'mycb', //override the &callback='jQuery123457676_253954801'
      jsonp: 'cb', //override the &'callback'=
      success: function (data) {
          var url, match, imgUrl,stringBuffer = [];
          $(".success-remove").remove();
          $.each(data.sort(function() {
             return Math.random() - 0.5;
          }).slice(0, 4), function(index, item){
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
            stringBuffer.push('<li class="f-l"><a href="article/',url,'"><img src="',item.thumb,'" alt="',item.title,'" width="144" height="144"><p>',item.title,'</p></a></li>');
          });
          document.getElementById('hot-list').innerHTML = stringBuffer.join('');
          $(".result-content").trigger("update");
      },
      error: function(data) {
        console.log("recmmend error!");
        console.log(data)
      }
  });

})

