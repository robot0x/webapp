$.extend({
  getParam: function() {
    var
      url = window.location.href,
      arr = url.split("?"),
      param = {},
      paramArr,
      i = 0,
      len, paramStr, paramKeyValue, paramKeyValueArr;
    if (arr.length > 1) {
      paramStr = arr[1];
    }
    if (paramStr) {
      paramArr = paramStr.split("&");
      for (len = paramArr.length; i < len; i++) {
        paramKeyValue = paramArr[i];
        paramKeyValueArr = paramKeyValue.split("=");
        param[paramKeyValueArr[0]] = decodeURIComponent(paramKeyValueArr[1]);
      }
    }
    return param;
  }
});
// 获取请求参数组件
$(function() {
  var param = $.getParam(),
    hotSearchList = document.querySelector(".hot-search-word-list"),
    $hotSearchList = $(hotSearchList),
    hotWord, hotWordArr, form,
    q = $.getParam().q,
    // 第一种文章url 形如 http://c.diaox2.com/view/app/?m=show&id=1234(&ch=goodthing)
    reg = /\/view\/app\/\?m=(?:show|zk|scene)&id=(\d+)?(&ch=goodthing)?/i,
    // 第二中文章url 形如 http://c.diaox2.com/cms/diaodiao/articles/goodthing/893_893.html
    reg2 = /\/cms\/diaodiao\/articles\/(?:goodthing|firstpage|experience|weekend)\/\d+_(\d+)?\.html/i,
    toReplaceStr = "article/$1.html",
    param = $.getParam(),
    isSpecSearch = q === '礼物',
    randArray = function(hotWordArr, len) {
      hotWordArr.sort(function() {
        return Math.random() - 0.5;
      });
      return hotWordArr.slice(0, len);
    }

  if (param && param.q) {
    document.title = param.q + "_" + document.title;
    $('#search-input').val(param.q);
  }
  if(!isSpecSearch){
      $('.hot-search').show();
      $('.present-area').css('display','none');

      // 获取热搜词
        $.ajax({
          url: "http://api.diaox2.com/v2/app/config",
          dataType: 'jsonp',
          type: "GET",
          jsonp: 'cb',
          jsonpCallback: "cb3",
          // timeout:20000,
          error: function(e) {
            console.log("热搜词接口的jsonp执行失败！！");
            console.log(e);
          },
          // contentType: 'application/json',//若是没有这个属性的话，就不会发送options请求
          success: function(data) {
            console.log("热搜词接口的jsonp执行成功！！");
            hotWordArr = data.res.search.hot_slide_search_word;
            hotWordArr = randArray(hotWordArr, 5);
            $.each(hotWordArr, function(index, every) {
              $('<li class="hot-search-word f-l"><a href="' + window.location.href.split("?")[0] + '?q=' + every + '&t=h">' + every + '</a></li>').appendTo($hotSearchList);
            });
          }
        });
  }else{
    $('.hot-search').hide();
    $('.present-area').css('display','block');
  }
  
  $.ajax({
    url: "http://s.diaox2.com/ddsearch/q",
    dataType: 'jsonp',
    jsonp: 'cb',
    jsonpCallback: "cb2",
    cache:true,// 防止 jquery 发送ajax请求时在后面带上时间戳，导致过不了cdn
    timeout: 20000,
    data: {
      data: JSON.stringify({
        "query": q,
        "from": "pc"
      })
    },
    // type:"POST",
    // dataType:"json",
    // contentType: 'application/json',//若是没有这个属性的话，就不会发送options请求
    // data:JSON.stringify({"query":q,"from":"pc"}),
    error: function(e) {
      console.log("搜索接口的jsonp执行失败！！" + " " + e);
    },
    success: !isSpecSearch?normalSearchSuccess:specSearchSuccess
    // success: !isSpecSearch?normalSearchSuccess(data):specSearchSuccess(data)
  });
  function specSearchSuccess(data){
    // alert('specSearchSuccess!')
    
  }
  function normalSearchSuccess(data) {
      console.log("查询接口的jsonp执行成功！！");
      if (data.count > 0) {
        var
          aids = data.aids,
          meta_infos = data.meta_infos,
          everyMeta,
          rendered_keywords,
          keywords_str = "",
          rendered_title,
          authorSrc,
          url, match,
          imgUrl;
        $.each(aids, function(index, every) {
          everyMeta = meta_infos[every];
          //清空keyword串，保证每条文章的keyword串都是全新的
          authorSrc = keywords_str = "";
          if (!everyMeta.price) {
            everyMeta.price = "<img width='15' height='15' style='margin-right:5px;' src='http://c.diaox2.com/cms/diaodiao/assets/links.png'>全网结果";
          }
          rendered_keywords = everyMeta.rendered_keywords;
          $.each(rendered_keywords, function(index, item) {
            if (index == 0 && item[0] == q) {
              keywords_str += '<li class="f-l"><span class="target-word">' + item[0] + '</span></li>'
            } else {
              keywords_str += '<li class="f-l">' + item[0] + '</li>';
            }
          })
          rendered_title = everyMeta.rendered_title;
          imgUrl = everyMeta.thumb_image_url;
          if (imgUrl.indexOf("http") == -1) {
            imgUrl = "http://a.diaox2.com/cms/sites/default/files/" + imgUrl;
          }
          authorSrc = everyMeta.author.src || everyMeta.author.url;
          if (authorSrc.indexOf("http") == -1) {
            authorSrc = "editor/" + authorSrc + ".html";
          }
          rendered_title = rendered_title.replace(/<<<<(.*?)>>>>/gi, "<span class='target-word'>$1</span>")
          url = everyMeta.url;
          match = url.match(reg);
          if (match && match.length) {
            url = match[0].replace(reg, toReplaceStr);
          } else {
            match = url.match(reg2);
            if (match && match.length) {
              url = match[0].replace(reg2, toReplaceStr);
            }
          }
          var price = everyMeta.price;
          // console.log(price);
          if (everyMeta.has_buylink === false || everyMeta.price === "N/A") {
            price = "&nbsp";
          }
          $('<li class="result-item" data-pos='+(index+1)+'>' +
            '<a target="_blank" href="' + url + '" class="imglink f-l">' +
            '<div class="result-item-img-container loading">' +
            '<img src="' + imgUrl + '" alt="'+rendered_keywords+'" width="188" height="188">' +
            '</div>' +
            '</a>' +
            '<div class="result-item-detail f-l">' +
            '<h2 class="detail-title"><a target="_blank" href="' + url + '">' + rendered_title + '</a></h2>' +
            '<ul class="detail-keywords clearfix">' + keywords_str +
            '</ul>' +
            '<div class="detail-author clearfix">' +
            '<a class="detail f-l">' + price + '</a>' +
            // '<a class="detail f-l">'+(everyMeta.price == "N/A"?"&nbsp":everyMeta.price)+'</a>'+
            '<div class="author f-l clearfix">' +
            '<ul class="clearfix">' +
            '<li class="author-face f-l">' +
            '<a target="_blank" href="' + authorSrc + '"><span class="author-face-container"><img src="http://c.diaox2.com/cms/diaodiao/' + everyMeta.author.pic + '" width="20" height="20"></span></a>' +
            '</li>' +
            '<li class="author-name f-l">' +
            '<a target="_blank" href="' + authorSrc + '">' + everyMeta.author.name + '</a>' +
            '</li>' +
            '</ul>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</li>').appendTo($('.result-list'));
        })
      } else {
        $(".no-result").find(".target-word").html("“" + (q == undefined ? "" : q) + "”");
        $(".no-result").addClass("disblk");
      }

      // 最后给每条搜索结果加上点击事件，用以统计点击
      var resultItem = $('.result-item');
      var pos = resultItem.attr('data-pos');
      var url = resultItem.find('.imglink ').attr('href');
      resultItem.on('click','a.imglink,.detail-title a',function(e){
         var dom = e.delegateTarget;
         var href = this.href;
         var pos = dom.getAttribute('data-pos');

         var curUrl = window.location.href;
         var storage = localStorage;
         var data = JSON.parse(storage.getItem('statisticsData'));
         var search = data.click_data.search;
         var i = 0;
         var l = search.length;
         if(curUrl.indexOf('&t=h') !== -1){
            for(;i<l;i++){
              var eachSearch = search[i];
              if(eachSearch.query === q && eachSearch.from === 'pc_hotQueries'){
                var clickArr = eachSearch.click;
                var newClick = {
                  url:href,
                  pos:pos
                }
                clickArr.push(newClick);
              }
            }
         }else{
          for(;i<l;i++){
              var eachSearch = search[i];
              if(eachSearch.query === q){
                var clickArr = eachSearch.click;
                var newClick = {
                  url:href,
                  pos:pos
                }
                clickArr.push(newClick);
              }
            }
         }
         storage.setItem('statisticsData',JSON.stringify(data));
      })
    }
  // 获取热门专题
  $.ajax({
    url: "http://c.diaox2.com/cms/diaodiao/pcsite/zk_feed_list.json",
    type: "GET",
    dataType: 'jsonp',
    jsonp: 'cb',
    jsonpCallback: "cb",
    timeout: 20000,
    error: function(e) {
      console.log("获取热门专题接口的jsonp执行失败！！");
      console.log(e);
    },
    success: function(result) {
      console.log("获取热门专题接口的jsonp执行成功！！");
      var list = result.goodthing_feed_list,
        url,
        special = $(".special");
      $.each(list, function(index, item) {
        if (index > 1) return;
        url = item.url;
        match = url.match(reg);
        if (match && match.length) {
          url = match[0].replace(reg, toReplaceStr);
        } else {
          match = url.match(reg2);
          if (match && match.length) {
            url = match[0].replace(reg2, toReplaceStr);
          }
        }
        // console.log(item.title.length);
        var title = item.title,
          i = 0,
          len = item.title.length,
          titleStr = titleStr2 = "";
        if (len === 2) {
          titleStr = title[0];
          titleStr2 = title[1];
        } else {
          for (; i < len - 1; i++) {
            // console.log(title[i]);
            titleStr = titleStr + title[i] + "<br>";
          }
          titleStr2 = title[len - 1];
        }
        $('<li class="loading">' +
          '<a target="_blank" href="' + url + '">' +
          '<img src="' + item.cover_image_url + '" alt="'+titleStr.replace('<br>','')+'" width="277" height="180">' +
          '<p>' + titleStr + '</p>' +
          '<span>' + titleStr2 + '</span>' +
          '<div class="black-musk"></div>' +
          '</a>' +
          '</li>').appendTo(special);
      });
    }
  });
  var curUrl = window.location.href;
  var storage = localStorage;
  var statisticsData = storage.getItem('statisticsData');//取出统计数据
  var data = statisticsData?JSON.parse(statisticsData):{};
  var from;
  if (!statisticsData){
      // 没有统计数据，就初始化统计数据
      data.method = 'log_search_click';
      data.click_data = {
          did:'',
          search:[]
      }
  }
  if(curUrl.indexOf('&t=h') !== -1){
      from = 'pc_hotQueries'
  }else{
      from = 'pc_searchResult'
  }
  var search = data.click_data.search;
  var newSearch = {
      query:q,
      from:from,
      click:[]
  };
  search.push(newSearch);
  storage.setItem('statisticsData',JSON.stringify(data));
  var postData = storage.getItem('statisticsData');
  window.onbeforeunload = function(){
    // 页面关闭或刷新往服务器推送数据！注意：一定要使用同步的方式发送，这样可以阻塞一会儿线程保证在关闭之前能推送出去
    if(postData){
        $.ajax({
          url: "http://api.diaox2.com/v2/ubs",
          type:"POST",
          async:false,
          contentType:'application/json',//若是没有这个属性的话，就不会发送options请求
          data:postData,
          success:function(data){
            localStorage.clear();
            localStorage.setItem('word:'+q,JSON.stringify(data));
          },
          error:function(xhr,t){
            localStorage.setItem('error_info',t);
            localStorage.setItem('error_info_status',xhr.status);
          }
      })
    }
  }
  document.getElementById("search-input").value = document.getElementById('search-input').value.replace(/\+/g, " ");
})