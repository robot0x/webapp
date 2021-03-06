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
    isSpecSearch = q.indexOf('礼物')!==-1,
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
          success: function(data) {
            console.log("热搜词接口的jsonp执行成功！！");
            hotWordArr = data.res.search.hot_slide_search_word;
            hotWordArr = randArray(hotWordArr, 5);
            $.each(hotWordArr, function(index, every) {
              $('<li class="hot-search-word f-l"><a href="' + window.location.href.split("?")[0] + '?q=' + every + '&t=h">' + every + '</a></li>').appendTo($hotSearchList);
            });
          }
        });
        $.ajax({
            url: "http://s.diaox2.com/ddsearch/q",
            dataType: 'jsonp',
            jsonp: 'cb',
            jsonpCallback: "cb2",
            cache:true,
            timeout: 20000,
            data: {
              data: JSON.stringify({
                "query": q,
                "from": "pc"
              })
            },
            error: function(e) {
              console.log("搜索接口的jsonp执行失败！！" + " " + e);
            },
            success: normalSearchSuccess
          });
  }else{
    $('.hot-search').hide();
    $('.present-area').css('display','block');
    $.ajax({
      url: "http://s.diaox2.com/view/app/gift_supply.php",
      dataType: 'jsonp',
      jsonp: 'cb',
      jsonpCallback: "cb4",
      cache:true,
      timeout: 80000,
      error: function(e) {
        console.log("搜索接口的jsonp执行失败！！" + " " + e);
      },
      success: specSearchSuccess
  });
      // 当前选中效果的切换
      var scenePrev,relationPrev,parent,$this,
      jsonDataFormServe,//全局变量，存储从服务器端拿到的json数据，在ajax的success回调中赋值
      // 不同的tag数组，格式为 {生日: Array[519], 圣诞节平安夜: Array[424], 新生儿: Array[2], 乔迁: Array[203], 新年: Array[444]…}
      tagList = {};
      // 礼物筛选器的点击处理
      $(document).on('click','.present-type li',function(){
          // 告白 老公男友 小清新 Geek 潮人 礼物 文艺范 200-500 500-800 
          // 区分4种
          $this = $(this);
          parent = $this.parent().parent();
          if(parent.hasClass('scene')){
            scenePrev&&scenePrev.removeClass('cur-select');
            $this.addClass('cur-select');
            scenePrev = $this;
          }else if(parent.hasClass('relation')){
            relationPrev&&relationPrev.removeClass('cur-select');
            $this.addClass('cur-select');
            relationPrev = $this;
          }else if(parent.hasClass('character') || parent.hasClass('price')){
            $this.toggleClass('cur-select');
          }
          renderDOMByIntersect();
      })
    }

  function renderDOMByIntersect(){
    var interList = intersect(),//得到交集
        meta_infos = jsonDataFormServe.meta_infos,
        meta_infos_arr = [];
    interList.forEach(function(item){
      meta_infos_arr.push(meta_infos[item]);
    })
    renderDOM(meta_infos_arr);
  }

  // 求交集
  function intersect(){
    var selectedKeywords =[];
    var curSelect = $('.scene .cur-select,.relation .cur-select,.character .cur-select');
    curSelect.each(function(index,item){
      selectedKeywords.push(item.innerHTML)
    })
    var aidsArray = [];
    for(var attr in tagList){
      aidsArray.push(tagList[attr]);
    }
    var newArray = [];
    var result =  aidsArray.reduce(function(prev,next){
      newArray.length = 0;//清空数组
      prev.forEach(function(item){
        next.forEach(function(item2){
          if(item === item2){
            newArray.push(item);
          }
        })
      })
      return newArray;
    })
    console.log(result);
    return result;
  }
  function renderDOM(meta_infos){
    var goodthingList = $('.goodthing-list'),
        attr ,imgUrl ,rendered_title,url,price,
        gift_tag_index = data.gift_tag_index;
    for(attr in meta_infos){
         everyMeta = meta_infos[attr];
         imgUrl = everyMeta.cover_image_url;
         rendered_title = everyMeta.rendered_title;
         price = everyMeta.price;
         if (everyMeta.has_buylink === false || everyMeta.price === "N/A") {
           price = "&nbsp";
         }
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
         if (imgUrl.indexOf("http") == -1) {
              imgUrl = "http://a.diaox2.com/cms/sites/default/files/" + imgUrl;
         }
         // 发布去除 http://www.diaox2.com/
         $('<li class="goodthing"><a href="http://www.diaox2.com/'+url+'" target="_blank"><div class="img-container"><img src="'+imgUrl+'" alt="'+rendered_title+'" onload="adjust(this)"></div><div class="goodthing-highlight"><h2><div>'+rendered_title+'</div></h2><ul class="icon-list clearfix"><li class="icon-item f-l"><span>'+price+'</span></li><li class="icon-item f-r"><i class="icon icon-s"></i><span>'+132+'</span></li><li class="icon-item f-r"><i class="icon icon-z"></i><span>'+123+'</span></li></ul></div></a></li>').appendTo(goodthingList);
      }

  }
   // 特殊query的success回调（搜索词中含有“礼物”，即认为是特殊query）
  function specSearchSuccess(data){
    //从服务器端拿到的数据赋值给这个全局变量
    jsonDataFormServe = data;
    var gift_tag_index = data.gift_tag_index;
    console.log(data);
    $.extend(tagList,gift_tag_index.scene,gift_tag_index.relation,gift_tag_index.character);
    console.log(tagList);
    //如果搜索词不是礼物，而是含有礼物的话（比如：礼物 生日），就不需要直接更新dom，需要先求交集再更新dom
    if(q !== '礼物'){
      return;
    }
    return;//加快调试速度，开发时，暂不更新dom
      renderDOM(data.meta_infos);
    }
  // 一般query的success回调
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
          imgUrl,
          $resultList = $('.result-list');
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
          if (everyMeta.has_buylink === false || everyMeta.price === "N/A") {
            price = "&nbsp";
          }
          // 发布去除 http://www.diaox2.com/
          $('<li class="result-item" data-pos='+(index+1)+'><a target="_blank" href="http://www.diaox2.com/' + url + '" class="imglink f-l"><div class="result-item-img-container loading"><img src="' + imgUrl + '" alt="'+rendered_keywords+'" width="188" height="188"></div></a><div class="result-item-detail f-l"><h2 class="detail-title"><a target="_blank" href="' + url + '">' + rendered_title + '</a></h2><ul class="detail-keywords clearfix">' + keywords_str +'</ul><div class="detail-author clearfix"><a class="detail f-l">' + price + '</a><div class="author f-l clearfix"><ul class="clearfix"><li class="author-face f-l"><a target="_blank" href="' + authorSrc + '"><span class="author-face-container"><img src="http://c.diaox2.com/cms/diaodiao/' + everyMeta.author.pic + '" width="20" height="20"></span></a></li><li class="author-name f-l"><a target="_blank" href="' + authorSrc + '">' + everyMeta.author.name + '</a></li></ul></div></div></div></li>').appendTo($resultList);
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