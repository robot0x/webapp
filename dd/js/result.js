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
    // devprefix = "http://www.diaox2.com/",
    devprefix = "",
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
    };
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
          cache:true,
          success: function(data) {
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
            data:{data:JSON.stringify({"query":q,"from":"pc"})},
            cache:true,
            timeout: 20000,
            success: normalSearchSuccess
          });
  }else{
     /********** 工具方法区 start ************/
  // 去重方法
  Array.prototype.unique = function(){
    var n = {},r=[],i = 0,l = this.length; //n为hash表，r为临时数组
    for(; i < l; i++){ //遍历当前数组
      if (!n[this[i]]) {//如果hash表中没有当前项
        n[this[i]] = true; //存入hash表
        r.push(this[i]); //把当前数组的当前项push到临时数组里面
      }
    }
    return r;
  }
  // 数组遍历方法
  if(typeof Array.prototype.forEach !== "function"){
    Array.prototype.forEach = function(fn){
      var i = 0,l = this.length;
      while(i<l){
          fn(this[i],i++);
      }
    }
  }
  // 数组归并方法
if (typeof Array.prototype.reduce !== "function") {
  Array.prototype.reduce = function (callback, initialValue ) {
     var previous = initialValue, k = 0, length = this.length;
     if (typeof initialValue === "undefined") {
        previous = this[0];
        k = 1;
     }
    if (typeof callback === "function") {
      for (k; k < length; k++) {
         this.hasOwnProperty(k) && (previous = callback(previous, this[k], k, this));
      }
    }
    return previous;
  };
}

if(typeof Array.prototype.indexOf !== "function"){
  Array.prototype.indexOf = function(item){
    for(var i = 0,l = this.length;i < l && item !== this[i];i++);
    return i === l?-1:i;
  }
}
// 判断IE版本
function isIE(ver){
  var b = document.createElement("b");
  b.innerHTML = "<!--[if IE "+ver+"]><i></i><![end if]-->"
  return b.getElementsByTagName('i').length === 1;
}
/********** 工具方法区 end ************/
    $('.present').addClass('current-page');
    // IE9不支持 css3 animation 删除loading效果，简单的以文字提示用户正在加载
    if(isIE(9)){
      var parent = document.querySelector('.present-result'),
          div = document.createElement('div');
      parent.removeChild(parent.querySelector('.rectangle-bounce'));
      div.innerHTML = '正在加载...';
      div.className = 'IE9LOADING'
      parent.appendChild(div);
    }
    $('.hot-search').hide();
    $('.present-area').css('display','block');
    $.ajax({
      url: "http://s.diaox2.com/view/app/gift_supply.php",
      dataType: 'jsonp',
      jsonp: 'cb',
      jsonpCallback: "cb4",
      cache:true,
      timeout: 100000,//数据很大，设置的过期时间要长一些
      success: specSearchSuccess
  });
      // 当前选中效果的切换
      var scenePrev,relationPrev,parent,$this,
      LOAD_COUNT = 20,//常数。每次加载20条
      jsonDataFormServe,//全局变量，存储从服务器端拿到的json数据，在ajax的success回调中赋值
      // 不同的tag数组，格式为 {生日: Array[519], 圣诞节平安夜: Array[424], 新生儿: Array[2], 乔迁: Array[203], 新年: Array[444]…}
      tagList = {};
      // 礼物筛选器的点击处理
      function handler(){
          // 告白 老公男友 小清新 Geek 潮人 礼物 文艺范 200-500 500-800 
          // 区分4种
          $this = $(this);
          var dataGroup = this.getAttribute('data-group');
          if(dataGroup === 'scene'){
            if(scenePrev){
              scenePrev.removeClass('cur-select');
              if(scenePrev.attr('data-title') === $this.attr('data-title')){
                scenePrev = undefined;
                renderDOMByIntersect();
                return;
              }
            }
            $this.addClass('cur-select');
            scenePrev = $this;
          }else if(dataGroup === 'relation'){
            if(relationPrev){
              relationPrev.removeClass('cur-select');
              if(relationPrev.attr('data-title') === $this.attr('data-title')){
                relationPrev = undefined;
                renderDOMByIntersect();
                return;
              }
            }
            $this.addClass('cur-select');
            relationPrev = $this;
          }else if(dataGroup === 'character' || dataGroup === 'price'){
            // alert(dataGroup);
            $this.toggleClass('cur-select');
          }
          renderDOMByIntersect();
      }
      /*
        函数节流，防止用户疯狂点击
      */
      $(document).on('click','.present-type li',function(){
         throttle(handler,this,300);
      });
    }
  function renderDOMByIntersect(){
    var interList = intersect(),//得到交集
        meta_infos = jsonDataFormServe.meta_infos,
        meta_infos_obj = {}; // 要转成对象
    if(interList && interList.length){
      interList.forEach(function(item){
        if(meta_infos[item]){
          meta_infos_obj[item] = meta_infos[item];
        }
      })
      $('.no-result').hide();
      $('.no-result p.f-l').html('找不到<span class="target-word"></span>，换个关键词试试');
      renderDOM(meta_infos_obj);
    }else{
      var curSelect = document.querySelectorAll('.cur-select');
      // 两种情况，一种交集是空集，一种是没有选择任何条件
      if(curSelect.length){
        document.getElementById('goodthing-list').innerHTML = '';
        $('.no-result').show();
        $('.no-result p.f-l').text('没有结果，换个组合试试');
        toggleLoading('none');
      }else{
       // console.dir(meta_infos);
        renderDOM(meta_infos);
      }
    }
  }
   /*
   TODO
    1、缓存。提高性能
    2、分页。提高性能
    3、代码review。榨取性能。
    4、搜索点亮功能
    4、test
  */
  // 求并集（同一组）与交集并排序
  function intersect(){
    var 
        curSelect = $('.scene .cur-select,.relation .cur-select,.character .cur-select'),
        priceEleArr = $('.price .cur-select'),
        aids,
        metaResult,// 没有根据价格过滤，且没有排序的数组。
        result,// 最终return的结果
        price = [],// 价格
        selectedKeywords =[], // 被选中的关键字
        characterArr = [],// 同一组的关键字
        notCharacterArr = [], // 不同组的关键字
        characterArrList = [],// 属于一个data-group的关键字的二维数组。类似于aidsArray。求并集。
        aidsArray = [],// 二维数组，用来放置关键字对应的文章id数组。求交集。
        newArray = [];// 临时数组
    curSelect.each(function(index,item){
      if(item.getAttribute('data-group') === 'character'){
        characterArr.push(item.getAttribute('data-title'));
      }else{
        notCharacterArr.push(item.getAttribute('data-title'));
      }
    })
    // 求并集。先连接数组，再去重
    if(characterArr.length){
      characterArrList = [];
      characterArr.forEach(function(item){
        characterArrList.push(tagList[item]);
      })
      if(characterArrList.length === 1){
        aidsArray.push(characterArrList[0]);
      }else{
        aidsArray.push(characterArrList.reduce(function(prev,next){
           return prev.concat(next);
        }).unique());//放入数组中。供下面求交集
      }
    }

    // 根据价格区间筛选出符合条件的好物
    if(priceEleArr.length){
      priceEleArr.each(function(index,item){
        price.push(item.getAttribute('data-title'));
      })
    }
    // 根据价格区间获取数据
    if(price.length){
      aids = getAidsByPrice(price);
      // 放入数组中供下面求交集
      aidsArray.push(aids);
    }
    // 把选定的keywords对应的文章id放入数组中，和上面2个并集求交集
    notCharacterArr.forEach(function(item){
      aidsArray.push(tagList[item]);
    })
    // 求交集
    if(aidsArray.length){
      metaResult = aidsArray.reduce(function(prev,next){
          prev.forEach(function(item){
            next.forEach(function(item2){
              if(item === item2){
                newArray.push(item);
              }
            })
          })
          return newArray;
      })
    }
    return metaResult;
  }
  function isNullObject(obj){
     if(obj == null){
      return true;
     }
     for(var attr in obj){
      return false;
     }
     return true;
  }
  // TODO 为了提高性能需要做缓存（根据价格区间筛选出来的好物，没必要再次筛选一次）!
  function getAidsByPrice(price){
   // TODO 解析价格数组，变成价格区间
   // 组装筛选条件
   var 
      priceRange,has_buylink,attr,each,
      // 筛选出类似于 13.4，12,999等格式的价格
      reg = /\d+((\.|,)\d+)?/g,eachPrice,result = [],
      meta_infos = jsonDataFormServe.meta_infos;
   price.forEach(function(item){
      priceRange = item.split('-');
        for(attr in meta_infos){
          attr = +attr;
          each = meta_infos[attr];
          has_buylink = each.has_buylink;
          eachPrice = each.price;
          // 过滤没有购买链接和没有价格的
          if(!has_buylink || !eachPrice){
            continue;
          }
          eachPrice = eachPrice.match(reg);
          if(eachPrice && eachPrice.length){
            eachPrice = eachPrice[0];
            if(eachPrice.indexOf(',') !== -1){
              eachPrice = eachPrice.split(',').join('');
            }
            eachPrice = parseFloat(eachPrice);
          }
          if(eachPrice >= priceRange[0]){
              if(priceRange[1]){
                if(eachPrice < priceRange[1]){
                    if(result.indexOf(attr) === -1){
                      result.push(attr)
                    }
                }
              }else{
                  if(result.indexOf(attr) === -1){
                    result.push(attr)
                  }
             }
          }
        }
   })
   return result;
  }
  /* 
    needUpdateMeta 该对象用于分页。每次增加几条，就delete几条的属性，保证下次更新从这个对象中取的数据不重复
    在renderDOM中赋值，在updateDOM中使用
    调用时机：
    1、第一次加载全部时调用renderDOM
    2、求交集之后第一次加载调用的是renderDOM，以后加载就调用updateDOM方法了
  */
  var needUpdateMeta;
  function renderDOM(meta_infos){
    var 
        attr ,imgUrl ,rendered_title,url,price,
        goodthingList = document.getElementById('goodthing-list'),
        stringBuffer = [];
        gift_tag_index = data.gift_tag_index,
        count = 0,
        dataPos = 1;
        goodthingList.innerHTML = ''; // 清空 
        for(attr in meta_infos){
         attr = +attr;
         /*
            bug1
            筛选出来的好物，可能小于20条，例如 文艺范 和 500-800 交集只有18条好物，
            那么needUpdataMeta 就赋不了值
         */
         if(count++ === LOAD_COUNT){
          // needUpdateMeta = meta_infos;
          break;
         }
         // 第一次（加载所有）赋值。
         if(!needUpdateMeta){
          needUpdateMeta = meta_infos;
         }
         everyMeta = meta_infos[attr];
         if(everyMeta){
             imgUrl = everyMeta.cover_image_url;
             rendered_title = everyMeta.rendered_title;
             price = everyMeta.price;
             if (!everyMeta.has_buylink || price == null || price === "N/A") {
               price = "&nbsp";
             }
             url = everyMeta.url;
             if(url){
              match = url.match(reg);
                if (match && match.length) {
                  url = match[0].replace(reg, toReplaceStr);
                } else {
                  match = url.match(reg2);
                  if (match && match.length) {
                    url = match[0].replace(reg2, toReplaceStr);
                  }
              }
             }
             if (imgUrl&&imgUrl.indexOf("http") == -1) {
                  imgUrl = "http://a.diaox2.com/cms/sites/default/files/" + imgUrl;
             }
             // 发布去除 http://www.diaox2.com/
             // 优化。提高字符串拼接速度
             stringBuffer.push('<li class="goodthing" data-pos='+(dataPos++)+'><a href="',devprefix,url,'" target="_blank"><div class="img-container"><img src="',imgUrl,'" alt="',rendered_title,'" onload="adjust(this)"></div><div class="goodthing-highlight"><h2><div>',rendered_title,'</div></h2><ul class="icon-list clearfix unknown" data-id=',Math.pow(2,32)*attr + attr,'><li class="icon-item f-l"><span>',price,'</span></li><li class="icon-item f-r"><i class="icon icon-s"></i><span class="a-fav">...</span></li><li class="icon-item f-r"><i class="icon icon-z"></i><span class="a-up">...</span></li></ul></div></a></li>');
             // stringBuffer.push('<li class="goodthing"><a href="http://www.diaox2.com/',url,'" target="_blank"><div class="img-container"><img src="',imgUrl,'" alt="',rendered_title,'" onload="adjust(this)"></div><div class="goodthing-highlight"><h2><div>',rendered_title,'</div></h2><ul class="icon-list clearfix"><li class="icon-item f-l"><span>',price,'</span></li><li class="icon-item f-r"><i class="icon icon-s"></i><span>',132,'</span></li><li class="icon-item f-r"><i class="icon icon-z"></i><span>',123,'</span></li></ul></div></a></li>')
             // html += '<li class="goodthing"><a href="http://www.diaox2.com/'+url+'" target="_blank"><div class="img-container"><img src="'+imgUrl+'" alt="'+rendered_title+'" onload="adjust(this)"></div><div class="goodthing-highlight"><h2><div>'+rendered_title+'</div></h2><ul class="icon-list clearfix"><li class="icon-item f-l"><span>'+price+'</span></li><li class="icon-item f-r"><i class="icon icon-s"></i><span>'+132+'</span></li><li class="icon-item f-r"><i class="icon icon-z"></i><span>'+123+'</span></li></ul></div></a></li>';
            delete meta_infos[attr]; // 插入之后就删除。
         }
      }
        // 解决bug1 不管如何 都更新delete之后的meta_infos，保证needUpdateMeta最新
        needUpdateMeta = meta_infos;
        document.getElementById('goodthing-list').innerHTML = stringBuffer.join('');
        get_stat();
        // 添加统计
        // 委托到ul中，因为li一次加载不完
        $(goodthingList).on('click','li a',function(){
          var  
             dom = this.parentNode,
             href = this.href,
             pos = dom.getAttribute('data-pos'),
             curUrl = window.location.href,
             storage = localStorage,
             data = JSON.parse(storage.getItem('statisticsData')),
             search = data.click_data.search,
             i = 0,
             l = search.length,
             eachSearch,clickArr,newClick;
             if(curUrl.indexOf('&t=h') !== -1){
                for(;i<l;i++){
                  eachSearch = search[i];
                  if(eachSearch.query === q && eachSearch.from === 'pc_hotQueries'){
                     clickArr = eachSearch.click;
                     newClick = {
                      url:href,
                      pos:pos
                    }
                    clickArr.push(newClick);
                  }
                }
             }else{
              for(;i<l;i++){
                  eachSearch = search[i];
                  if(eachSearch.query === q){
                     clickArr = eachSearch.click;
                     newClick = {
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
  /*****************获取点赞收藏数********************/
  function doupdate(cids) {
    jQuery.support.cors = true;
    //if IE89, then jsonp else json
    $.ajax({
        url: "http://api.diaox2.com/v1/stat/all",
        data: {data: JSON.stringify({"aids": cids})},
        dataType: 'jsonp',
        type: "GET",
        jsonp: 'cb',
        jsonpCallback: "cb5",
        cache:true,
        timeout: 8000,
        success: update_success,
        error: function(x,t,e) {console.log("update failed, with error " + e);}    
    });
}
function update_success(data) {
    if(data.result != "SUCCESS") {
        console.log('update invoked but server fail.');
        return false;
    } else {
        var elements = $(".unknown"),i,j,l = elements.elements,ele,res;
        for(i in data.res) {
            for(j=0; j<elements.length; j++) {
                ele = $(elements[j]);
                if(i == ele.attr('data-id')) {
                    res = data.res[i];
                    ele.find('.a-fav').text(res.fav);
                    ele.find('.a-up').text(res.up);
                    ele.addClass('known').removeClass('unknown');
                }
            }
        }
    }
    return true;
}

function get_stat() {
    var eles = $(".unknown"),
        cids = [],i = 0,l = eles.length,ele,longId;
    while(i<l) {
        ele = $(eles[i++]);
        longId = ele.attr('data-id');
        if(isNaN(longId)){
            continue;   
        }
        cids.push(+longId);
    }

    (function(input){
      (function(){
        var pack = input.slice(0, LOAD_COUNT);
            input = input.slice(LOAD_COUNT);
            if(pack.length > 0) {
                doupdate(pack);
                setTimeout(arguments.callee, 2000);    //2秒后调用下一波
            } else {
                return true;
            }
      })()
    })(cids)
    return true;
}
  /*****************获取点赞收藏数end********************/
/*
  检查两个字符串是否包含有相同的部分
  如：七夕情人节  给老婆的情人节礼物|给老婆的七夕礼物  返回 true
*/
function checkStr(a,b){
    var i;
    for(i=0; i<=a.length-1; i++){
     if (a.indexOf(b.substr(i,1))!=-1){
        return true;  
      }else if (i==a.length-1){
        return false;
      }
  }
  return false;
}
  /*
    通过对礼物筛选框中的词进行筛选来触发不同keywords的点击事件
    支持自然语言，例如 给老公的生日礼物
    则会命中 老公男友 生日
    TODO
  */
  function triggerClickByQueryStatement(){
    var queryStatement = q.split('+').join(''),liArr = Array.prototype.slice.call(document.querySelectorAll('.present-type li'));
    /*
      函数只执行了一次，因为为了防止用户疯狂点击，我使用了函数节流，导致300ms之内不会触发2次点击，
      但是调用click方法会很快，触发事件的时间间隔一定是小于300ms的，所以导致只能执行第一个。
      解决办法是：直接调用handler，并把上下文赋值成每个li元素
    */
    liArr.forEach(function(item){
      if(queryStatement.indexOf(item.innerHTML)!== -1){
        handler.call(item);
      }
    })
  }
   // 特殊query的success回调（搜索词中含有“礼物”，即认为是特殊query）
  function specSearchSuccess(data){
    //从服务器端拿到的数据赋值给这个全局变量
    jsonDataFormServe = data;
    var gift_tag_index = data.gift_tag_index;
    $.extend(tagList, gift_tag_index.scene, gift_tag_index.relation, gift_tag_index.character);
    //如果搜索词不是礼物，而是含有礼物的话（比如：礼物 生日），就需要触发点击事件来调用renderDOM，而不是直接调用
    if(q !== '礼物'){
        triggerClickByQueryStatement();
        return;
    }
    // return;//加快调试速度，开发时，暂不更新dom
      renderDOM(data.meta_infos);
  }
  // 一般query的success回调
  function normalSearchSuccess(data) {
      // console.log("查询接口的jsonp执行成功！！");
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
          stringBuffer = [],
          imgUrl;
        $.each(aids, function(index, every) {
          everyMeta = meta_infos[every];
          //清空keyword串，保证每条文章的keyword串都是全新的
          authorSrc = keywords_str = "";
          var hasPrice = everyMeta.price;
          if (!hasPrice) {
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
          // if(authorSrc == null){
            // console.log(index);
          // }
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
          // 没有 知道价格，但有购买链接的情况
          if (everyMeta.has_buylink === false || everyMeta.price === "N/A") {
            price = "&nbsp";
          }
          // 发布去除 http://www.diaox2.com/
          // 优化。提高字符串拼接速度
          // console.log(url);
          // 如果是站内链接，且没有价格
          if( !hasPrice && /^\/?article\/\d+\.html/.test(url) ){
            price = "&nbsp";
          }
          stringBuffer.push('<li class="result-item" data-pos=',index+1,'><a target="_blank" href="',devprefix,url,'" class="imglink f-l"><div class="result-item-img-container loading"><img src="',imgUrl,'" alt="',rendered_keywords,'" width="188" height="188"></div></a><div class="result-item-detail f-l"><h2 class="detail-title"><a target="_blank" href="',url,'">',rendered_title,'</a></h2><ul class="detail-keywords clearfix">',keywords_str,'</ul><div class="detail-author clearfix"><a class="detail f-l">',price,'</a><div class="author f-l clearfix"><ul class="clearfix"><li class="author-face f-l"><a target="_blank" href="',authorSrc, '"><span class="author-face-container"><img src="http://c.diaox2.com/cms/diaodiao/',everyMeta.author.pic, '" width="20" height="20"></span></a></li><li class="author-name f-l"><a target="_blank" href="',authorSrc,'">',everyMeta.author.name,'</a></li></ul></div></div></div></li>');
        })
          document.getElementById('result-list').innerHTML = stringBuffer.join('');
      } else {
        $(".no-result").find(".target-word").html("“" + (q == undefined ? "" : q) + "”");
        $(".no-result").addClass("disblk");
      }
      // 最后给每条搜索结果加上点击事件，用以统计点击
      var resultItem = $('.result-item'),
          pos = resultItem.attr('data-pos'),
          url = resultItem.find('.imglink ').attr('href');
            resultItem.on('click','a.imglink,.detail-title a',function(e){
         var  
             dom = e.delegateTarget,
             href = this.href,
             pos = dom.getAttribute('data-pos'),
             curUrl = window.location.href,
             storage = localStorage,
             data = JSON.parse(storage.getItem('statisticsData')),
             search = data.click_data.search,
             i = 0,
             l = search.length,
             eachSearch,clickArr,newClick;
             if(curUrl.indexOf('&t=h') !== -1){
                for(;i<l;i++){
                  eachSearch = search[i];
                  if(eachSearch.query === q && eachSearch.from === 'pc_hotQueries'){
                     clickArr = eachSearch.click;
                     newClick = {
                      url:href,
                      pos:pos
                    }
                    clickArr.push(newClick);
                  }
                }
             }else{
              for(;i<l;i++){
                  eachSearch = search[i];
                  if(eachSearch.query === q){
                     clickArr = eachSearch.click;
                     newClick = {
                      url:href,
                      pos:pos
                    }
                    clickArr.push(newClick);
                  }
                }
             }
             storage.setItem('statisticsData',JSON.stringify(data));
      });
    }
  // 获取热门专题
  $.ajax({
    url: "http://c.diaox2.com/cms/diaodiao/pcsite/zk_feed_list.json",
    type: "GET",
    dataType: 'jsonp',
    jsonp: 'cb',
    jsonpCallback: "cb",
    cache:true,
    timeout: 20000,
    success: function(result) {
      var list = result.goodthing_feed_list,
        url,stringBuffer = [],
        stringBuffer;
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
        var title = item.title,
          i = 0,
          len = item.title.length,
          titleStr = titleStr2 = "";
        if (len === 2) {
          titleStr = title[0];
          titleStr2 = title[1];
        } else {
          for (; i < len - 1; i++) {
            titleStr = titleStr + title[i] + "<br>";
          }
          titleStr2 = title[len - 1];
        }
         stringBuffer.push('<li class="loading"><a target="_blank" href="',url,'"><img src="',item.cover_image_url,'" alt="',titleStr.replace(/<br\s*\/>/g,'').replace(/\"/g,"&quot;"),'" width="277" height="180"><p>',titleStr,'</p><span>',titleStr2,'</span><div class="black-musk"></div></a></li>');
      });
        document.getElementById('special').innerHTML = stringBuffer.join('');
    }
  });
   var curUrl = window.location.href,
        storage = localStorage,
        statisticsData = storage.getItem('statisticsData'),//取出统计数据
        data = statisticsData?JSON.parse(statisticsData):{},
        from;
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
          contentType:'application/json',
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
  function toggleLoading(display){
    var loading =  document.querySelector('.rectangle-bounce');
    if(loading){
      loading.style.display = display;
    }
  }
  /*
    懒加载更新dom，在 onscroll 事件中调用
  */
   function updateDOM(){
    // 如果已经加载完毕，直接返回
    if(isNullObject(needUpdateMeta)){
      toggleLoading('none');
      return;
    }
    var 
        attr ,imgUrl ,rendered_title,url,price,
        goodthingList = document.getElementById('goodthing-list'),
        // 新节点的克隆模板
        goodthing = goodthingList.querySelector('.goodthing'),
        frag = document.createDocumentFragment(), // 乾坤袋
        stringBuffer = [],
        // 新节点（li）的相关dom
        newNode,a,img,goodthingHighlight,spanPrice,iconList,
        gift_tag_index = data.gift_tag_index,
        count = 0;
        for(attr in needUpdateMeta){
          if(!attr || isNaN(attr) || count++ === LOAD_COUNT){
            break;
          }
         // 深克隆一个节点
         newNode = goodthing.cloneNode(true);
         a = newNode.querySelector('a');
         img = a.querySelector('.img-container img');
         goodthingHighlight = a.querySelector('.goodthing-highlight h2 div');
         iconList = a.querySelector('.icon-list');
         spanPrice = iconList.querySelector('.f-l span');
         everyMeta = needUpdateMeta[attr];
         if(everyMeta) {
             imgUrl = everyMeta.cover_image_url;
             rendered_title = everyMeta.rendered_title;
             price = everyMeta.price;
             if (!everyMeta.has_buylink || price == null || price === "N/A") {
               price = "&nbsp";
             }
             url = everyMeta.url;
             if(url){
              match = url.match(reg);
                if (match && match.length) {
                  url = match[0].replace(reg, toReplaceStr);
                } else {
                  match = url.match(reg2);
                  if (match && match.length) {
                    url = match[0].replace(reg2, toReplaceStr);
                  }
              }
             }
             if (imgUrl&&imgUrl.indexOf("http") == -1) {
                  imgUrl = "http://a.diaox2.com/cms/sites/default/files/" + imgUrl;
             }
             // 删除经过处理加上的属性，防止后续加载的图片变形
             img.removeAttribute('width');
             img.removeAttribute('height');
             img.removeAttribute('style');  
             newNode.setAttribute('data-pos',dataPos++);
             // 发布取出 www.diaox2.com
             a.href = devprefix+url;
             img.src = imgUrl;
             img.alt = rendered_title;
             iconList.className = 'icon-list clearfix unknown';
             iconList.setAttribute('data-id',Math.pow(2,32) * attr + (+attr));
             goodthingHighlight.innerHTML = rendered_title;
             spanPrice.innerHTML = price;
             frag.appendChild(newNode);
         }
         // 插入之后就删除。偷了个懒。
         delete needUpdateMeta[attr]; 
      }
       // 把乾坤袋收集的dom元素插入到页面
        goodthingList.appendChild(frag);
        get_stat();
    }
 /*
   函数节流：
   防止onscroll满足条件时执行两次
   可以防止onscroll执行过快
   可以防止用户点击过快
  */
  function throttle(method,context,ms){
      clearTimeout(method.tId);
      method.tId=setTimeout(function(){
          method.call(context);
      },ms);
  }
  /*
    修复dom0级事件只能绑定一次的问题。
    解决 惰性加载的onscroll事件回调覆盖回到顶部的onscroll事件回调的问题
  */
  function addEvent(obj,type,fn){
    var initFn = obj['on'+type];
    if(initFn){
      obj['on'+type] = function(){
        initFn();
        fn();
      }
    }else{
      obj['on'+type] = fn;
    }
  }
  if(isSpecSearch){

    addEvent(window,'scroll',function(){
    // 如果没有礼物好物，直接返回
      if(!document.querySelector('.goodthing')){
        return;
      }
      var pageHeight = document.body.clientHeight,
          windowHeight = document.documentElement.offsetHeight,
          scrollTop = document.documentElement.scrollTop || document.body.scrollTop,
          plus = scrollTop + windowHeight;
        if(isIE(9) || isIE(8)){
          // 对于IE8 距离底部还有150px就认为滚动到底了，因为 plus 永远不等与 pageHeight
          // 对于IE9 因为没有loading效果，所以距离底部还有150px也认为滚动到底了
          if(Math.abs(plus - pageHeight) <= 150){
            throttle(updateDOM,window,700);
          }
        }else if(plus === pageHeight){
          throttle(updateDOM,window,700);
          toggleLoading('block');
        }
    })
  }
})