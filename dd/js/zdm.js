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

  function extractCoupon(meta) {
    var ret = '';
    if (!meta || !meta.coupon) {
      return ret;
    }
    // ((!meta.coupon.code || meta.coupon.code.length === 0) && (!meta.coupon.link || meta.coupon.link.length === 0) )
    var code = meta.coupon.code;
    var link = meta.coupon.link;
    // var tableHtmlString = `<table class="code-table" cellpadding="0" cellspacing="0">
    //                         <tbody>
    //                             <tr class="get-coupon">
    //                                 <td>领取优惠券</td>
    //                                 <td><a href="//www.diaox2.com/category/100003.html" target="_blank">满59元减3元优惠券</a></td>
    //                             </tr>
    //                             <tr class="copy-code">
    //                                 <td>优惠码</td>
    //                                 <td>
    //                                     <input class="code" type="text" value="EJOHOHOOGOJO" readonly></td>
    //                             </tr>
    //                             <tr class="copy-code">
    //                                 <td>优惠码</td>
    //                                 <td><input class="code" type="text" value="KHGSISBVNGLQ" readonly></td>
    //                             </tr>
    //                         </tbody>
    //                   </table>`;
    var linkHTMLString = '';
    var codeHTMLString = '';
    var i = 0;
    var l = 0;
    var hasLinkValue = false;
    var hasCodeValue = false;
    /**
     * APP内的：http://z.diaox2.com/view/app/?m=jfmall
     * 分享出的：http://z.diaox2.com/view/app/mall.html
     */
    if (link && link.length > 0) {
      linkHTMLString = '<tr class="get-coupon">';
      for (l = link.length; i < l; i++) {
        var ln = link[i];
        // 因为在PC站上用。优先使用urlpc字段，url字段作为保险。
        var url = ln.url;
        // 如果是我们自己的优惠券，则不显示
        if (!/.*diaox2\.com.*/i.test(url)) {
          linkHTMLString += '<td>领取优惠券</td><td><a target="_blank" href="' + ( link[i].urlpc || link[i].url ) + '">' + link[i].text + '</a></td>';
          // 保证hasLinkValue只会被赋值一次
          if (!hasLinkValue) {
            hasLinkValue = true;
          }
        }
      }
      linkHTMLString += '</tr>';
    }

    if (code && code.length > 0) {
      hasCodeValue = true;
      codeHTMLString = '<tr class="copy-code">';
      for (i = 0, l = code.length; i < l; i++) {
        codeHTMLString += '<td>优惠码</td><td><input class="code" type="text" value="' + code[i].code + '" readonly></td>'
      }
      codeHTMLString += '</tr>';
      // console.log('有优惠码');
    }

    if (hasLinkValue || hasCodeValue) {
      ret = '<table class="code-table" cellpadding="0" cellspacing="0"><tbody>';
      if (hasLinkValue) {
        ret += linkHTMLString;
      }
      if (hasCodeValue) {
        ret += codeHTMLString;
      }
      ret += '</tbody></table>'
      // console.log(meta);
    }

    return ret;
  }
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
        // console.log(data);
        if (data || data.state === 'SUCCESS') {
          res = data.res;
          meta_infos = res.meta_infos;
          meta_infos_from_server = meta_infos;
          arrayPrototypeFor.call(meta_infos, function(item) {
            cidList.push(item.cid);
          });
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
            var codeHTML = extractCoupon(everyMeta);
            // stringBuffer.push('<li class="result-item clearfix ', item[1] === 1 ? 'outdate' : '', '"><a target="_blank" href="', url, '"><div class="img-container f-l loading"><img src="', imgUrl, '" alt="', title, '" height="188" width="188"><span class="outdate-tag disnone">已过期</span></div><div class="result-detail f-l"><p class="result-title">', title, '</p><p class="result-price">', price, '</p><p class="result-content">', isIE8 ? title : summary, '</p><ul class="result-footer clearfix"><li class="date f-l">', getDateStr(date), '</li><li class="source f-l">', source, '</li><li class="view-result f-r"><p>查看详情</p></li><li class="buylink_site f-r">', buylink_site, '</li></ul></div></a></div>');
            // stringBuffer.push('<li class="result-item', item[1] === 1 ? 'outdate' : '', '"><div class="img-container f-l loading"><img src="', imgUrl, '" alt="', title, '" height="188" width="188"><span class="outdate-tag disnone">已过期</span></div><div class="result-detail f-l"><p class="result-title">', title, '</p><p class="result-price">', price, '</p><p class="result-content">', isIE8 ? title : summary, '</p><ul class="result-footer clearfix"><li class="date f-l">', getDateStr(date), '</li><li class="source f-l">', source, '</li><li class="view-result f-r"><p>查看详情</p></li><li class="buylink_site f-r">', buylink_site, '</li></ul></div></div>');
            stringBuffer.push('<li class="result-item clearfix', item[1] === 1 ? 'outdate' : '', '"><div class="img-container f-l loading"><a target="_blank" href="', url, '"><img src="', imgUrl, '" alt="', title, '" height="188" width="188"></a><span class="outdate-tag disnone">已过期</span></div><div class="result-detail f-l"><p class="result-title">', title, '</p><p class="result-price">', price, '</p><p class="result-content">', isIE8 ? title : summary, '</p>', codeHTML, '<ul class="result-footer clearfix"><li class="date f-l">', getDateStr(date), '</li><li class="source f-l">', source, '</li><li class="view-result f-r"><a target="_blank" href="', url, '"><p>查看详情</p></a></li><li class="buylink_site f-r">', buylink_site, '</li></ul></div></div>');
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

  function removeNode(node) {
    if (!node) return;
    var f = document.createDocumentFragment();
    f.appendChild(node);
    f.removeChild(node);
    return node;
  }
  // 复制字符串到剪切板
  function copyTextToClipboard(text, success, error) {
    success = success || function() {};
    error = error || function() {};
    // 如果是IE，就使用IE专有方式进行拷贝
    // 好处是可以直接复制而不用曲线救国，创建textarea来实现。
    if (window.clipboardData) {
      var successful = window.clipboardData.setData('Text', text);
      if (successful) {
        success();
      } else {
        error();
      }
    } else {
      var textArea = document.createElement('textarea');
      var styleArr = [
        'position:', 'fixed;',
        'top:', '0;',
        'left:', '0;',
        'padding:', '0;',
        // 针对safari10
        // 增大textarea的大小，否则的话在safari10中successful为true，
        // 但却什么也没拷贝
        'width:', '31px;',
        'height:', '21px;',
        'border:', 'none;',
        'outline:', 'none;',
        'boxShadow:', 'none;',
        'background:', 'transparent;',
        // 针对safari10
        // 因为增大了textarea的大小，故使用其他技巧隐藏之
        'opacity:', '0;',
        'z-index:', '-1;'
      ];
      textArea.style.cssText = styleArr.join('');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        var successful = document.execCommand('copy');
        var msg = successful ? 'successful' : 'unsuccessful';
        console.log('Copying text command was ' + msg);
        try {
          if (successful) {
            success();
          } else {
            error();
          }
        } catch (e) {
          console.log('执行success或error有异常！！！！！');
          console.error(e);
        }
      } catch (e) {
        console.log('Oops, unable to copy');
        error();
      }
      // 卸磨杀驴
      document.body.removeChild(textArea);
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
      resultItem = resultList.querySelector('.result-list > li'),
      frag = document.createDocumentFragment(), // 乾坤袋
      newNode, a, i = count = 0,length,j;
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

      // 删除code-table
      var codeTable = newNode.querySelector('code-table');
      if (codeTable) {
        // console.log('复制的有code-table');
        removeNode(codeTable);
      }

      /*
        2016-10-09
        李园宁提出一个bug，
        第二页中所有item的链接都是值得买列表中的第一个条目的链接。
        出现bug的原因在于：
          复制好的节点没有更新节点下的a标签的href属性，导致a标签还带着复制的href值
       */
      a = newNode.querySelectorAll('a');
      length = a.length;
      for(j = 0;j < length;j++){
         a[j].href = url;
      }
      newNode.querySelector('.result-title').innerHTML = everyMeta.title[0];
      newNode.querySelector('img').src = everyMeta.thumb_image_url;
      newNode.querySelector('.result-price').innerHTML = everyMeta.price == null ? '&nbsp;' : everyMeta.price;
      // 防止IE8下出现问题
      newNode.querySelector('.result-content').innerHTML = isIE8 ? everyMeta.title[0] : extractText(everyMeta.summary);

      var resultFooter = newNode.querySelector('.result-footer');

      resultFooter.querySelector('.date').innerHTML = getDateStr(everyMeta.pub_time * 1000);
      resultFooter.querySelector('.source').innerHTML = everyMeta.author.name;
      resultFooter.querySelector('.buylink_site').innerHTML = everyMeta.buylink_site || "";

      // 重新build一份code-table，插入到resultFooter前面
      var codeTableString = extractCoupon(everyMeta);
      if (codeTableString) {
        resultFooter.insertAdjacentHTML('beforebegin', codeTableString);
      }

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
  });

  function stickTip(msg, ele, ms) {
    if (!msg || !ele) return;
    // 先删后插
    var stick = document.querySelector('.stick-tip');
    var rect = ele.getBoundingClientRect();
    var rtop = rect.top;
    var rleft = rect.left;
    var rwidth = rect.width || ele.offsetWidth;
    var stick = document.querySelector('.stick-tip');
    if (stick) {
      removeNode(stick);
    }
    // document.body.insertAdjacentHTML('beforeend', '<div class="stick-tip"><div class="stick-tip-trangle-box"><i class="stick-tip-trangle"></i></div>'+msg+'</div>');
    document.body.insertAdjacentHTML('beforeend', '<div class="stick-tip">' + msg + '</div>');
    stick = document.querySelector('.stick-tip');

    // 计算stick的附着位置
    var w = stick.offsetWidth;
    var h = stick.offsetHeight;
    var top = rtop - h;
    var left = rleft + (rwidth - w) / 2;

    stick.style.cssText = 'left:' + left + 'px;top:' + top + 'px';
    setTimeout(function() {
      removeNode(stick);
    }, ms || 1800);

    function copyScroll() {
      removeNode(stick);
      window.removeEventListener('scroll', copyScroll);
      console.log('scroll');
    }
    window.addEventListener('scroll', copyScroll);
  }


  /**
   * APP内的：http://z.diaox2.com/view/app/?m=jfmall
   * 分享出的：http://z.diaox2.com/view/app/mall.html
   */
  $(document.body).on('click', '.code-table .code', function(e) {
    var self = this;
    copyTextToClipboard(this.value, function() {
      stickTip('拷贝成功', self);
    }, function() {
      var key = 'Ctrl-C';
      // 如果是Mac平台，提示用户使用 Command + C 复制
      if (/(Mac\s*)?OS\s*X/i.test(navigator.userAgent)) {
        key = '⌘-C';
      }
      self.select();
      stickTip('请使用' + key + '复制', self);
    })
  });

});