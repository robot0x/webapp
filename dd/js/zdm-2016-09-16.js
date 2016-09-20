$(function() {
  // 超出隐藏并显示 继续阅读 使用的是 jquery.dotdotdot.js
  /***全局变量区****/
  var
    reg = /\/view\/app\/\?m=(?:show|zk|scene)&id=(\d+)?(&ch=goodthing)?/i,
    // 第二中文章url 形如 http://c.diaox2.com/cms/diaodiao/articles/goodthing/893_893.html
    reg2 = /\/cms\/diaodiao\/articles\/(?:goodthing|firstpage|experience|weekend)\/\d+_(\d+)?\.html/i,
    toReplaceStr = "$1.html",
    LOAD_COUNT = 30, // 每次加载的数目
    // 取出 数组原型对象，供工具方法区扩展工具方法
    arrayPrototype = Array.prototype,
    // 取出 字符串原型对象，供工具方法区扩展工具方法
    stringPrototype = String.prototype,
    arrayPrototypeFor = arrayPrototype.forEach,
    // 从服务器端获取的json信息，在获取值得买ajax的success回调中赋值
    meta_infos_from_server, isIE8 = isIE(8),
    isIE9 = isIE(9),
    cidList_from_server,
    // feed流列表，在获取值得买ajax的success回调中赋值
    feed_list_from_server;
  /***全局变量区****end/

  /***预处理区*****/
  if (isIE8 || isIE9) {
    var parent = document.querySelector('.main-content'),
      div = document.createElement('div');
    parent.removeChild(parent.querySelector('.rectangle-bounce'));
    div.innerHTML = '正在加载...';
    div.className = 'IE9LOADING'
    parent.appendChild(div);
  }
  /***预处理区end****/
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
    success: function(data) {
      var url, match, imgUrl, stringBuffer = [];
      $(".success-remove").remove();
      data = randArray(data, 4);
      $.each(data, function(index, item) {
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
        stringBuffer.push('<li class="f-l"><a href="article/', url, '"><img src="', item.thumb, '" alt="', item.title, '" width="144" height="144"><p>', item.title, '</p></a></li>');
      });
      document.getElementById('hot-list').innerHTML = stringBuffer.join('');
      $(".result-content").trigger("update");
    },
    error: function(data) {
      console.log("recmmend error!");
      console.log(data)
    }
  });
  // 获取值得买ajax
  $.ajax({
      url: "http://api.diaox2.com/v3/zdm",
      type: "GET",
      cache: true,
      dataType: "jsonp",
      crossDomain: true,
      data: {
        data: JSON.stringify({
          'method': 'get_all_pc'
        })
      },
      jsonpCallback: 'cb',
      jsonp: 'cb',
      success: function(data) {
        var res, meta_infos, feed_list, cidList = [],
          everyMeta, title, url, summary, price,
          date, source, imgUrl, stringBuffer = [],
          i = 0,
          count = 0,
          item;
        console.log(data);
        if (data || data.state === 'SUCCESS') {
          res = data.res;
          meta_infos = res.meta_infos;
          meta_infos_from_server = meta_infos;
          arrayPrototypeFor.call(meta_infos, function(item) {
            cidList.push(item.cid);
          })
          cidList_from_server = cidList;
          feed_list = res.feed_list;
          for (; i < feed_list.length; i++, count++) {
            item = feed_list[i];
            if (count > LOAD_COUNT - 1) {
              break;
            }
            everyMeta = meta_infos[cidList.indexOf(item[0])];
            url = everyMeta.url;
            summary = extractText(everyMeta.summary);
            price = everyMeta.price;
            if (price == null || price == 'null') {
              price = '&nbsp;';
            }
            date = everyMeta.pub_time * 1000;
            source = everyMeta.author.name;
            imgUrl = everyMeta.thumb_image_url;
            title = everyMeta.title[0];
            buylink_site = everyMeta.buylink_site || "";
            stringBuffer.push('<li class="result-item clearfix ', item[1] === 1 ? 'outdate' : '', '"><a target="_blank" href="', url, '"><div class="img-container f-l loading"><img src="', imgUrl, '" alt="', title, '" height="188" width="188"><span class="outdate-tag disnone">已过期</span></div><div class="result-detail f-l"><p class="result-title">', title, '</p><p class="result-price">', price, '</p><p class="result-content">', isIE8 ? title : summary, '</p><ul class="result-footer clearfix"><li class="date f-l">', getDateStr(date), '</li><li class="source f-l">', source, '</li><li class="view-result f-r"><p>查看详情</p></li><li class="buylink_site f-r">', buylink_site, '</li></ul></div></a></div>');
            feed_list.splice(i--, 1); // 插入之后就删除。供后续分页使用
          }
          feed_list_from_server = feed_list;
          document.getElementById('result-list').innerHTML = stringBuffer.join('');
          addDot('.result-content');
        } else {
          console.log('zdm failed!');
          console.log(data);
        }
      },
      error: function(data) {
        console.log("zdm error!");
        console.log(data)
      }
    })
    /***ajax请求区 end****/
    /***工具方法区****/
  if (typeof arrayPrototypeFor !== "function") {
    arrayPrototypeFor = function(fn) {
      var i = 0,
        l = this.length;
      while (i < l) {
        fn(this[i], i++);
      }
    }
  }
  if (typeof arrayPrototype.indexOf !== "function") {
    arrayPrototype.indexOf = function(item) {
      for (var i = 0, l = this.length; i < l && item !== this[i]; i++);
      return i === l ? -1 : i;
    }
  }
  if (typeof arrayPrototype.filter !== 'function') {
    arrayPrototype.filter = function(fn) {
      var result = [],
        each,
        i = 0,
        l = this.length;
      while (i < l) {
        each = this[i++];
        if (fn(each)) {
          result.push(each);
        }
      }
      return result;
    }
  }
  if (typeof stringPrototype.startsWith !== 'function') {
    stringPrototype.startsWith = function(s) {
      return this.indexOf(s) === 0;
    }
  }
  if (typeof stringPrototype.endsWith !== 'function') {
    stringPrototype.endsWith = function(s) {
      return this.indexOf === this.length - 1;
    }
  }
  // 随机从数组中取出数据
  function randArray(data, len) {
    return data.sort(function() {
      return Math.random() - 0.5;
    }).slice(0, len);
  }
  // 传入的时间戳是否是今年
  function isThisYear(ms) {
    return new Date(ms).getFullYear() === new Date().getFullYear();
  }
  // 传入的时间戳是否是今天
  function isToday(ms) {
    var now = new Date(),
      date = new Date(ms);
    // 是同一年同一月同一日
    if (isThisYear(ms) && now.getMonth() === date.getMonth() && now.getDate() === date.getDate()) {
      return true;
    }
    return false;
  }
  // 函数节流
  function throttle(method, context, ms) {
    clearTimeout(method.tId);
    method.tId = setTimeout(function() {
      method.call(context);
    }, ms);
  }
  /*
     修复dom0级事件只能绑定一次的问题。
     解决 惰性加载的onscroll事件回调覆盖回到顶部的onscroll事件回调的问题
   */
  function addEvent(obj, type, fn) {
    var initFn = obj['on' + type];
    if (initFn) {
      obj['on' + type] = function() {
        initFn();
        fn();
      }
    } else {
      obj['on' + type] = fn;
    }
  }
  // 切换loading条显示隐藏
  function toggleLoading(display) {
    var loading = document.querySelector('.rectangle-bounce');
    if (loading) {
      loading.style.display = display;
    }
  }
  // 判断IE版本
  function isIE(ver) {
    var b = document.createElement("b");
    b.innerHTML = "<!--[if IE " + ver + "]><i></i><![end if]-->"
    return b.getElementsByTagName('i').length === 1;
  }

  /*
      解析传进来的带标签的字符串，返回去掉标签之后的纯文本
  */
  function extractText(summary) {
    if (!summary) {
      return '';
    }
    // 如果传进来的本身就是纯本文，原样返回
    if (!summary.startsWith('<') && !summary.endsWith('>')) {
      return summary;
    } else {
      return summary.replace(/</g, "\n<")
        .replace(/>/g, ">\n")
        .replace(/\n\n/g, "\n")
        .replace(/^\n/g, "")
        .replace(/\n$/g, "")
        .split("\n").filter(function(item) {
          return !item.startsWith('<');
        }).join('').replace(/&nbsp;?|<br\s*\/*>|\s*/ig, '');
    }
  }
  /**
  获取时间格式串
  1、传入的时间戳不是今年的，返回 2014-10-13 (yy-MM-dd)
  2、传入的时间戳是今年的 
      若是今天的 返回 21:30 (hh:mm)
      不是今天的 返回 10-13 (MM-dd)
  */
  function getDateStr(ms) {
    var date = new Date(ms),
      dateStr = '';
    if (isThisYear(ms)) {
      if (isToday(ms)) {
        minutes = date.getMinutes();
        if (minutes < 10) {
          minutes = '0' + minutes;
        }
        dateStr += date.getHours() + ":" + minutes;
      } else {
        dateStr += (date.getMonth() + 1) + "-" + date.getDate();
      }
    } else {
      dateStr += date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
    }
    return dateStr;
  }

  function addDot(selector) {
    var opts = {
      ellipsis: '......',
      wrap: 'letter'
    };
    if (typeof selector === 'string') {
      $(selector).dotdotdot(opts);
    } else {
      selector.dotdotdot(opts);
    }
  }
  /***工具方法区end****/
  /****分页*****/
  function updateDOM() {
    if (feed_list_from_server.length === 0) {
      // 已经加载完毕
      toggleLoading('none');
      // TODO提示用户已经加载完毕 
      return;
    }
    var everyMeta, url, item,
      resultList = document.getElementById('result-list'),
      // 新节点的克隆模板
      resultItem = resultList.querySelector('.result-item'),
      frag = document.createDocumentFragment(), // 乾坤袋
      newNode, a, i = count = 0;
    for (; i < feed_list_from_server.length; i++, count++) {
      item = feed_list_from_server[i];
      if (count > LOAD_COUNT - 1) {
        break;
      }
      everyMeta = meta_infos_from_server[cidList_from_server.indexOf(item[0])];
      url = everyMeta.url;
      newNode = resultItem.cloneNode(true);
      // item[1]是flag字段 0 未过期 1 过期
      if (item[1] === 1) {
        $(newNode).addClass('outdate');
      } else {
        $(newNode).removeClass('outdate');
      }
      a = newNode.querySelector('a');
      a.href = url;
      a.querySelector('.result-title').innerHTML = everyMeta.title[0];
      a.querySelector('img').src = everyMeta.thumb_image_url;
      a.querySelector('.result-price').innerHTML = everyMeta.price == null ? '&nbsp;' : everyMeta.price;
      // 防止IE8下出现问题
      a.querySelector('.result-content').innerHTML = isIE8 ? everyMeta.title[0] : extractText(everyMeta.summary);
      a.querySelector('.result-footer .date').innerHTML = getDateStr(everyMeta.pub_time * 1000);
      a.querySelector('.result-footer .source').innerHTML = everyMeta.author.name;
      a.querySelector('.result-footer .buylink_site').innerHTML = everyMeta.buylink_site || "";
      frag.appendChild(newNode);
      feed_list_from_server.splice(i--, 1); // 插入之后就删除。供后续分页使用
    }
    resultList.appendChild(frag);
    addDot('.result-content');
  }
  addEvent(window, 'scroll', function() {
    var pageHeight = document.body.clientHeight,
      windowHeight = document.documentElement.offsetHeight,
      scrollTop = document.documentElement.scrollTop || document.body.scrollTop,
      plus = scrollTop + windowHeight;
    if (isIE9 || isIE8) {
      // 对于IE8 距离底部还有150px就认为滚动到底了，因为 plus 永远不等与 pageHeight
      // 对于IE9 因为没有loading效果，所以距离底部还有150px也认为滚动到底了
      if (Math.abs(plus - pageHeight) <= 150) {
        throttle(updateDOM, window, 700);
      }
    } else if (plus === pageHeight) {
      throttle(updateDOM, window, 700);
      toggleLoading('block');
    }
  })
})