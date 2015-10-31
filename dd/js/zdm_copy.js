$(function(){
// 超出隐藏并显示 继续阅读 使用的是 jquery.dotdotdot.js


/***全局变量区****/
    var 
        reg = /\/view\/app\/\?m=(?:show|zk|scene)&id=(\d+)?(&ch=goodthing)?/i,
        // 第二中文章url 形如 http://c.diaox2.com/cms/diaodiao/articles/goodthing/893_893.html
        reg2 = /\/cms\/diaodiao\/articles\/(?:goodthing|firstpage|experience|weekend)\/\d+_(\d+)?\.html/i,
        toReplaceStr = "$1.html";
       

/***全局变量区****end/

/***工具方法区****/
    
if(typeof Array.prototype.forEach != "function"){
    Array.prototype.forEach = function(fn){
      var i = 0,l = this.length;
      while(i<l){
          fn(this[i],i++);
      }
    }
}
// 随机从数组中取出数据
function randArray(data, len) {
  data.sort(function() {
    return Math.random() - 0.5;
  });
  return data.slice(0, len);
}
function getLocalTime(ms){ 
   return new Date(ms).toLocaleString().replace(/:\d{1,2}$/,' ');     
}
/***工具方法区****end/

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
        console.log("callback invoked!");
        var url, match, imgUrl,stringBuffer = [];
        $(".success-remove").remove();
        data = randArray(data,4);
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
          stringBuffer.push('<li class="f-l"><a href="',url,'"><img src="',item.thumb,'" alt="',item.title,'" width="144" height="144"><p>',item.title,'</p></a></li>');
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
// 获取值得买ajax
$.ajax({
    url: "http://api.diaox2.com/v3/zdm",
    type: "GET",
    cache: true, //prevent the default parameter _=${timestamp}, CDN
    dataType: "jsonp",
    crossDomain: true,
    data: {
      data: JSON.stringify({
        'method': 'get_all_pc'
      })
    },
    jsonpCallback: 'cb', //override the &callback='jQuery123457676_253954801'
    jsonp: 'cb', //override the &'callback'=
    success:function(data){
        
        var feed_list,cidList,attr,everyMeta,title,url,summary,resultContent,price,date,dateStr,minutes,dateObj,source,imgUrl,stringBuffer = [],
            // 
            isThisYear = function(ms){
                return new Date(ms).getFullYear() === new Date().getFullYear();
            },
            isToday = function(ms){
                var now = new Date();
                var date = new Date(ms);
                // 是同一年同一月同一日
                if(isThisYear() && now.getMonth() === date.getMonth() && now.getDate() === date.getDate()){
                    return true;
                } 
                return false;
            }
        if(data||data.state === 'SUCCESS'){
            meta_infos = data.res.meta_infos;
            for(attr in meta_infos){
                cidList.push(meta_infos[attr].cid);
            }
            feed_list = data.feed_list;
            feed_list.forEach(function(item,i){
                if(i > 35){
                    break;
                }
                var cid = item[0];
                var flag = item[1];
                var index = cid.indexOf(cidList);
                everyMeta = meta_infos[attr];
                url = everyMeta.url;
                summary = everyMeta.summary;
                resultContent = 'Date 对象保存以毫秒为单位表示特定时间段。如果某个参数的值大于其范围或为负数，则存储的其他值将做相应的调整。例如，如果指定 150 秒，JScript 将该数字重新定义为 2 分 30 秒。的撒打阿斯顿啊';
                price = everyMeta.price;
                date = everyMeta.pub_time * 1000;
                dateObj = new Date(date);
                source = everyMeta.author.name;
                imgUrl = everyMeta.thumb_image_url;
                title = everyMeta.title[0];
                dateStr = '';
                if(isThisYear){
                    if(isToday){
                        minutes = dateObj.getMinutes();
                        if(minutes<10){
                            minutes = '0'+minutes;
                        }
                        dateStr += dateObj.getHours()+":"+minutes;
                    }else{
                        dateStr += (dateObj.getMonth()+1)+"-"+dateObj.getDate();
                    }
                }else{
                    dateStr += dateObj.getFullYear() +"-"+(dateObj.getMonth()+1)+"-"+dateObj.getDate();
                }
                stringBuffer.push('<li class="result-item clearfix"><a target="_blank" href="',url,'" class="img-container f-l loading"><img src="',imgUrl,'" alt="',title,'" height="188" width="188"><span class="outdate disnone">已过期</span></a><div class="result-detail f-l"><a target="_blank" href="',url,'" class="result-title">',title,'</a><p class="result-price">',price == null?'&nbsp':price,'</p><p class="result-content">',resultContent,'<a target="_blank" class="readmore" href="',url,'">继续阅读</a></p><ul class="result-footer clearfix"><li class="date f-l">',dateStr,'</li><li class="source f-l">',source,'</li><li class="view-result f-r"><a target="_blank" href="',url,'">查看详情</a></li></ul></div></li>');

            })
            for(attr in meta_infos){
                if(attr > 35){
                    break;
                }
                everyMeta = meta_infos[attr];
                url = everyMeta.url;
                summary = everyMeta.summary;
                // 取出第一个p标签中除了 <br/> 之外所有的标签
                resultContent = 'Date 对象保存以毫秒为单位表示特定时间段。如果某个参数的值大于其范围或为负数，则存储的其他值将做相应的调整。例如，如果指定 150 秒，JScript 将该数字重新定义为 2 分 30 秒。的撒打阿斯顿啊';
                // resultContent = summary.match(/<p>(.+?)(<br\s*\/?>)?(\&nbsp;)?<\/p>/i);
                // console.log(summary);
                // if(resultContent == null){
                //     resultContent = summary;
                //     console.log('resultContent == null');
                // }else {
                //     resultContent = resultContent[1];
                //     console.log('resultContent.length === 1');
                // }
                // console.log(resultContent);
                // console.log(resultContent);
                price = everyMeta.price;
                date = everyMeta.pub_time * 1000;
                dateObj = new Date(date);
                source = everyMeta.author.name;
                imgUrl = everyMeta.thumb_image_url;
                title = everyMeta.title[0];
                dateStr = '';
                if(isThisYear){
                    if(isToday){
                        minutes = dateObj.getMinutes();
                        if(minutes<10){
                            minutes = '0'+minutes;
                        }
                        dateStr += dateObj.getHours()+":"+minutes;
                    }else{
                        dateStr += (dateObj.getMonth()+1)+"-"+dateObj.getDate();
                    }
                }else{
                    dateStr += dateObj.getFullYear() +"-"+(dateObj.getMonth()+1)+"-"+dateObj.getDate();
                }
                stringBuffer.push('<li class="result-item ',flag!==0?'outdate':'','clearfix"><a target="_blank" href="',url,'" class="img-container f-l loading"><img src="',imgUrl,'" alt="',title,'" height="188" width="188"><span class="outdate disnone">已过期</span></a><div class="result-detail f-l"><a target="_blank" href="',url,'" class="result-title">',title,'</a><p class="result-price">',price == null?'&nbsp':price,'</p><p class="result-content">',resultContent,'<a target="_blank" class="readmore" href="',url,'">继续阅读</a></p><ul class="result-footer clearfix"><li class="date f-l">',dateStr,'</li><li class="source f-l">',source,'</li><li class="view-result f-r"><a target="_blank" href="',url,'">查看详情</a></li></ul></div></li>');
                             // $('<li class="result-item clearfix"><a target="_blank" href="'+url+'" class="img-container f-l loading"><img src="'+imgUrl+'" alt="'+title+'" height="188" width="188"><span class="outdate disnone">已过期</span></a><div class="result-detail f-l"><a target="_blank" href="'+url+'" class="result-title">'+title+'</a><p class="result-price">'+(price == null?'&nbsp':price)+'</p><p class="result-content">'+resultContent+'<a target="_blank" class="readmore" href="'+url+'">继续阅读</a></p><ul class="result-footer clearfix"><li class="date f-l">'+dateStr+'</li><li class="source f-l">'+source+'</li><li class="view-result f-r"><a target="_blank" href="'+url+'">查看详情</a></li></ul></div></li>').appendTo($('.result-list'));
            }
            document.getElementById('result-list').innerHTML = stringBuffer.join('');
            $(".result-content").dotdotdot({
                    after: "a.readmore",
                    ellipsis: '......',
                    wrap : 'letter'
            });
        }else{
            console.log('zdm failed!');
            console.log(data);
        }
    },error: function(data) {
      console.log("zdm error!");
      console.log(data)
    }
})

/***ajax请求区 end****/
