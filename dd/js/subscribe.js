 function getCookie(key){
    var arr,reg = new RegExp("(^| )"+key+"=([^;]*)(;|$)");
    if(arr=document.cookie.match(reg)){
        return decodeURIComponent(arr[2]);
    }else{
        return null;
    }
}
function setCookie(key,value,days){
    // 设置cookie过期事件,默认是30天
    var expire = new Date();
    days = days || 30;
    expire.setTime(expire.getTime() + (+days)*24*60*60*1000);
    document.cookie = key + "="+ encodeURIComponent(value) + ";expires=" + expire.toGMTString();
};
function deleteCookie(key){
    var expire = new Date();
    expire.setTime(expire.getTime() - 1);
    var cval= getCookie(key);
    if(cval!=null)
    // 把toGMTString改成了toUTCString，两者等价。但是ECMAScript推荐使用toUTCString方法。toGMTString的存在仅仅是
    // 为了向下兼容
    document.cookie= key + "="+cval+";expires="+expire.toUTCString();
}
  /*
         * Javascript md5() 函数 用于生成字符串对应的md5值
         * 吴先成  www.51-n.com ohcc@163.com QQ:229256237
         * @param string string 原始字符串
         * @return string 加密后的32位md5字符串
        */
        function md5(string){
                function md5_RotateLeft(lValue, iShiftBits) {
                        return (lValue<<iShiftBits) | (lValue>>>(32-iShiftBits));
                }
                function md5_AddUnsigned(lX,lY){
                        var lX4,lY4,lX8,lY8,lResult;
                        lX8 = (lX & 0x80000000);
                        lY8 = (lY & 0x80000000);
                        lX4 = (lX & 0x40000000);
                        lY4 = (lY & 0x40000000);
                        lResult = (lX & 0x3FFFFFFF)+(lY & 0x3FFFFFFF);
                        if (lX4 & lY4) {
                                return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
                        }
                        if (lX4 | lY4) {
                                if (lResult & 0x40000000) {
                                        return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
                                } else {
                                        return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
                                }
                        } else {
                                return (lResult ^ lX8 ^ lY8);
                        }
                }         
                function md5_F(x,y,z){
                        return (x & y) | ((~x) & z);
                }
                function md5_G(x,y,z){
                        return (x & z) | (y & (~z));
                }
                function md5_H(x,y,z){
                        return (x ^ y ^ z);
                }
                function md5_I(x,y,z){
                        return (y ^ (x | (~z)));
                }
                function md5_FF(a,b,c,d,x,s,ac){
                        a = md5_AddUnsigned(a, md5_AddUnsigned(md5_AddUnsigned(md5_F(b, c, d), x), ac));
                        return md5_AddUnsigned(md5_RotateLeft(a, s), b);
                }; 
                function md5_GG(a,b,c,d,x,s,ac){
                        a = md5_AddUnsigned(a, md5_AddUnsigned(md5_AddUnsigned(md5_G(b, c, d), x), ac));
                        return md5_AddUnsigned(md5_RotateLeft(a, s), b);
                };
                function md5_HH(a,b,c,d,x,s,ac){
                        a = md5_AddUnsigned(a, md5_AddUnsigned(md5_AddUnsigned(md5_H(b, c, d), x), ac));
                        return md5_AddUnsigned(md5_RotateLeft(a, s), b);
                }; 
                function md5_II(a,b,c,d,x,s,ac){
                        a = md5_AddUnsigned(a, md5_AddUnsigned(md5_AddUnsigned(md5_I(b, c, d), x), ac));
                        return md5_AddUnsigned(md5_RotateLeft(a, s), b);
                };
                function md5_ConvertToWordArray(string) {
                        var lWordCount;
                        var lMessageLength = string.length;
                        var lNumberOfWords_temp1=lMessageLength + 8;
                        var lNumberOfWords_temp2=(lNumberOfWords_temp1-(lNumberOfWords_temp1 % 64))/64;
                        var lNumberOfWords = (lNumberOfWords_temp2+1)*16;
                        var lWordArray=Array(lNumberOfWords-1);
                        var lBytePosition = 0;
                        var lByteCount = 0;
                        while ( lByteCount < lMessageLength ) {
                                lWordCount = (lByteCount-(lByteCount % 4))/4;
                                lBytePosition = (lByteCount % 4)*8;
                                lWordArray[lWordCount] = (lWordArray[lWordCount] | (string.charCodeAt(lByteCount)<<lBytePosition));
                                lByteCount++;
                        }
                        lWordCount = (lByteCount-(lByteCount % 4))/4;
                        lBytePosition = (lByteCount % 4)*8;
                        lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80<<lBytePosition);
                        lWordArray[lNumberOfWords-2] = lMessageLength<<3;
                        lWordArray[lNumberOfWords-1] = lMessageLength>>>29;
                        return lWordArray;
                }; 
                function md5_WordToHex(lValue){
                        var WordToHexValue="",WordToHexValue_temp="",lByte,lCount;
                        for(lCount = 0;lCount<=3;lCount++){
                                lByte = (lValue>>>(lCount*8)) & 255;
                                WordToHexValue_temp = "0" + lByte.toString(16);
                                WordToHexValue = WordToHexValue + WordToHexValue_temp.substr(WordToHexValue_temp.length-2,2);
                        }
                        return WordToHexValue;
                };
                function md5_Utf8Encode(string){
                        string = string.replace(/\r\n/g,"\n");
                        var utftext = ""; 
                        for (var n = 0; n < string.length; n++) {
                                var c = string.charCodeAt(n); 
                                if (c < 128) {
                                        utftext += String.fromCharCode(c);
                                }else if((c > 127) && (c < 2048)) {
                                        utftext += String.fromCharCode((c >> 6) | 192);
                                        utftext += String.fromCharCode((c & 63) | 128);
                                } else {
                                        utftext += String.fromCharCode((c >> 12) | 224);
                                        utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                                        utftext += String.fromCharCode((c & 63) | 128);
                                } 
                        } 
                        return utftext;
                }; 
                var x=Array();
                var k,AA,BB,CC,DD,a,b,c,d;
                var S11=7, S12=12, S13=17, S14=22;
                var S21=5, S22=9 , S23=14, S24=20;
                var S31=4, S32=11, S33=16, S34=23;
                var S41=6, S42=10, S43=15, S44=21;
                string = md5_Utf8Encode(string);
                x = md5_ConvertToWordArray(string); 
                a = 0x67452301; b = 0xEFCDAB89; c = 0x98BADCFE; d = 0x10325476; 
                for (k=0;k<x.length;k+=16) {
                        AA=a; BB=b; CC=c; DD=d;
                        a=md5_FF(a,b,c,d,x[k+0], S11,0xD76AA478);
                        d=md5_FF(d,a,b,c,x[k+1], S12,0xE8C7B756);
                        c=md5_FF(c,d,a,b,x[k+2], S13,0x242070DB);
                        b=md5_FF(b,c,d,a,x[k+3], S14,0xC1BDCEEE);
                        a=md5_FF(a,b,c,d,x[k+4], S11,0xF57C0FAF);
                        d=md5_FF(d,a,b,c,x[k+5], S12,0x4787C62A);
                        c=md5_FF(c,d,a,b,x[k+6], S13,0xA8304613);
                        b=md5_FF(b,c,d,a,x[k+7], S14,0xFD469501);
                        a=md5_FF(a,b,c,d,x[k+8], S11,0x698098D8);
                        d=md5_FF(d,a,b,c,x[k+9], S12,0x8B44F7AF);
                        c=md5_FF(c,d,a,b,x[k+10],S13,0xFFFF5BB1);
                        b=md5_FF(b,c,d,a,x[k+11],S14,0x895CD7BE);
                        a=md5_FF(a,b,c,d,x[k+12],S11,0x6B901122);
                        d=md5_FF(d,a,b,c,x[k+13],S12,0xFD987193);
                        c=md5_FF(c,d,a,b,x[k+14],S13,0xA679438E);
                        b=md5_FF(b,c,d,a,x[k+15],S14,0x49B40821);
                        a=md5_GG(a,b,c,d,x[k+1], S21,0xF61E2562);
                        d=md5_GG(d,a,b,c,x[k+6], S22,0xC040B340);
                        c=md5_GG(c,d,a,b,x[k+11],S23,0x265E5A51);
                        b=md5_GG(b,c,d,a,x[k+0], S24,0xE9B6C7AA);
                        a=md5_GG(a,b,c,d,x[k+5], S21,0xD62F105D);
                        d=md5_GG(d,a,b,c,x[k+10],S22,0x2441453);
                        c=md5_GG(c,d,a,b,x[k+15],S23,0xD8A1E681);
                        b=md5_GG(b,c,d,a,x[k+4], S24,0xE7D3FBC8);
                        a=md5_GG(a,b,c,d,x[k+9], S21,0x21E1CDE6);
                        d=md5_GG(d,a,b,c,x[k+14],S22,0xC33707D6);
                        c=md5_GG(c,d,a,b,x[k+3], S23,0xF4D50D87);
                        b=md5_GG(b,c,d,a,x[k+8], S24,0x455A14ED);
                        a=md5_GG(a,b,c,d,x[k+13],S21,0xA9E3E905);
                        d=md5_GG(d,a,b,c,x[k+2], S22,0xFCEFA3F8);
                        c=md5_GG(c,d,a,b,x[k+7], S23,0x676F02D9);
                        b=md5_GG(b,c,d,a,x[k+12],S24,0x8D2A4C8A);
                        a=md5_HH(a,b,c,d,x[k+5], S31,0xFFFA3942);
                        d=md5_HH(d,a,b,c,x[k+8], S32,0x8771F681);
                        c=md5_HH(c,d,a,b,x[k+11],S33,0x6D9D6122);
                        b=md5_HH(b,c,d,a,x[k+14],S34,0xFDE5380C);
                        a=md5_HH(a,b,c,d,x[k+1], S31,0xA4BEEA44);
                        d=md5_HH(d,a,b,c,x[k+4], S32,0x4BDECFA9);
                        c=md5_HH(c,d,a,b,x[k+7], S33,0xF6BB4B60);
                        b=md5_HH(b,c,d,a,x[k+10],S34,0xBEBFBC70);
                        a=md5_HH(a,b,c,d,x[k+13],S31,0x289B7EC6);
                        d=md5_HH(d,a,b,c,x[k+0], S32,0xEAA127FA);
                        c=md5_HH(c,d,a,b,x[k+3], S33,0xD4EF3085);
                        b=md5_HH(b,c,d,a,x[k+6], S34,0x4881D05);
                        a=md5_HH(a,b,c,d,x[k+9], S31,0xD9D4D039);
                        d=md5_HH(d,a,b,c,x[k+12],S32,0xE6DB99E5);
                        c=md5_HH(c,d,a,b,x[k+15],S33,0x1FA27CF8);
                        b=md5_HH(b,c,d,a,x[k+2], S34,0xC4AC5665);
                        a=md5_II(a,b,c,d,x[k+0], S41,0xF4292244);
                        d=md5_II(d,a,b,c,x[k+7], S42,0x432AFF97);
                        c=md5_II(c,d,a,b,x[k+14],S43,0xAB9423A7);
                        b=md5_II(b,c,d,a,x[k+5], S44,0xFC93A039);
                        a=md5_II(a,b,c,d,x[k+12],S41,0x655B59C3);
                        d=md5_II(d,a,b,c,x[k+3], S42,0x8F0CCC92);
                        c=md5_II(c,d,a,b,x[k+10],S43,0xFFEFF47D);
                        b=md5_II(b,c,d,a,x[k+1], S44,0x85845DD1);
                        a=md5_II(a,b,c,d,x[k+8], S41,0x6FA87E4F);
                        d=md5_II(d,a,b,c,x[k+15],S42,0xFE2CE6E0);
                        c=md5_II(c,d,a,b,x[k+6], S43,0xA3014314);
                        b=md5_II(b,c,d,a,x[k+13],S44,0x4E0811A1);
                        a=md5_II(a,b,c,d,x[k+4], S41,0xF7537E82);
                        d=md5_II(d,a,b,c,x[k+11],S42,0xBD3AF235);
                        c=md5_II(c,d,a,b,x[k+2], S43,0x2AD7D2BB);
                        b=md5_II(b,c,d,a,x[k+9], S44,0xEB86D391);
                        a=md5_AddUnsigned(a,AA);
                        b=md5_AddUnsigned(b,BB);
                        c=md5_AddUnsigned(c,CC);
                        d=md5_AddUnsigned(d,DD);
                }
        return (md5_WordToHex(a)+md5_WordToHex(b)+md5_WordToHex(c)+md5_WordToHex(d)).toLowerCase();
}
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

$('.result-content').dotdotdot({
    ellipsis:'......',
    wrap:'letter'
});

function myTip(args){
      this.title = args.title || "提示";
      this.content = args.content;
      this.timeout = args.timeout;
    }

    myTip.prototype = {
      constructor:myTip,
      open:function(){
         this.tipDOM = $('<div class="tips-mask"><div class="tips">'+
                        '<h1 class="tips-title">'+this.title+'</h1>'+
                        '<p class="tips-content">'+this.content+
                        '</p>'+
                     '</div></div>');
         $(this.tipDOM).appendTo(document.body);
         var timeout = this.timeout;
         var self = this;
         if(timeout){
            setTimeout(function(){
                self.close();
            },timeout)
         }
      },
      close:function(){
        this.tipDOM.remove();
      },
      getTipDOM:function(){
        return this.tipDOM;
      }
    }

 var tip = new myTip({
      content:'需要订阅后才能阅读&nbsp;&nbsp;<span>5</span>秒后将自动<a target="_blank">跳转</a>'
 });

function isLogin(){
    var ret = getCookie('isLogin');
    if(!ret){
      ret = false;
    }else{
      ret = ret == "true" ? true : false;
    }
    return ret;
}

function reset(dom){
    $(dom).find(":text,:password").val('');
}

$(document).on('click','.result-item a',function(e){
    
    // 如果已经登录，就不需要显示提示框了
    if(isLogin()){
        return;
    }
    // 如果已经存在了提示框，阻止跳转，直接返回
    if( $('.tips').length !== 0 ){
        e.preventDefault();
        return;
    }
    tip.open();

    var tipDOM = tip.getTipDOM();
    var tipA = tipDOM.find('a');
    reset(tipDOM);

    if(isLogin()){
        tipA.attr('href',this.href);
    }else{
        tipA.attr("target","_self");
        if(location.hash != "#login"){
            tipA.attr('href',location.href+"#login");
        }
    }
    
    var secondSpan = tipDOM.find('span');
    var second = +secondSpan.text();
    var timer = setInterval(function(){
      if(--second == 0){
        if(isLogin()){
         tipA.get(0).click();
        }else{
          location.hash = "login";
        }
        clearInterval(timer);
        tip.close();
      }else{
        secondSpan.text(second);
      }
    },1000);

    // 绑定 “跳转”按钮的点击事件
    tipA.click(function(){
        clearInterval(timer);
        tip.close();
    })


  e.preventDefault();
  // return false;
})

// 根据hash变化来切换是否显示登录区
function switchLogin(hash,isLogin){
  if(isLogin == undefined){
    isLogin = false;
  }

  if(hash === "#login" && !isLogin){
    $('#result-list').hide();
    $('.login-area').css('display','block');
  }else{
    $('#result-list').show();
    $('.login-area').css('display','none');
    $('.regist-area').css('display','none');
  }
}

window.onhashchange = function(){
  var hash = location.hash;
  console.log(hash);
  switchLogin(hash,isLogin());
}
var hash = location.hash;

switchLogin(hash,isLogin());

// 登录按钮点击事件
$(document).on('click','.login-btn',function(e){
  var username = $('.username').val();
  var password = $('.password').val();

  if(username && password){
    username = username.trim();
    password = password.trim();
  }else{
    alert('帐号或密码不能为空，请重新填写');
    return;
  }
  $.ajax({
        url: "http://api.diaox2.com/v2/user",
        timeout: 20000,
        type:"POST",
        dataType:"json",
        contentType:'application/json',
        data:JSON.stringify({
            "user_register" :{
                "auth_type" :3,
                "auth_id" :md5(username+password),
                "auth_info":{
                    "platform" : "diaodiao",
                    "platform_head_pic" : "http://image-10005270.file.myqcloud.com/icon/mine.png",
                    "platform_nick_name" : username
                },
                "ctype" : 0,
                "did" : "127.0.0.1"
            }
        })
  }).done(function(data){
    if(data.result==="SUCCESS"){
        alert('登录成功');
        var is_login_from_index = getCookie('login_from_index');
        console.log(is_login_from_index);
        if(is_login_from_index){
            // 判断是从首页来的。使用完之后就清除。防止下次从资讯订阅链接过来
            deleteCookie('login_from_index');
            window.location.href = "index.html";
        }else{
            location.reload();
        }

        setCookie('isLogin',true);
        // location.hash = "done";
    }else{
        alert('账户名或密码错误，请重新输入');
    }
  }).error(function(x,h,t){
    alert('登录失败，请重试');
    console.error(x);
    console.error(h);
    console.error(t);
  })
})
// 注册按钮点击事件
$(document).on('click','.login-area .regist-btn',function(e){
    $('.login-area').hide();

  var registArea = $('.regist-area');
  registArea.show();
  reset(registArea);
  var registBtn = registArea.find('.regist-btn');


  registBtn.click(function(){
      var username = registArea.find('.username').val();
      var password = registArea.find('.password').val();
      var repwd = registArea.find('.repwd').val();
      var rUsername = /^[0-9A-Z]{6,10}$/ig;
      var rPassword = /^[0-9A-Z]{6,20}$/ig;

      if(!rUsername.test(username)){
          alert('用户名请填写6-10位字符，由字母和数字组成');
          return;
      }

      if(!rPassword.test(password)){
        alert('密码请填写6-20位字符，由字母和数字组成');
        return;
      }

      if(password !== repwd){
        alert('密码填写不一致，请重新填写');
        return;
      }

      $.ajax({
            url: "http://api.diaox2.com/v1/user_create",
            timeout: 20000,
            type:"POST",
            dataType:"json",
            contentType:'application/json',
            data:JSON.stringify( {
                "user_create" : {
                    "user_name"  : username,
                    "user_pass"  : password
                }
            })
      }).done(function(data){
        console.log(data);
        if(data.result==="SUCCESS"){
            alert('注册成功');
            setCookie('isLogin',true);
            $('.regist-area').hide();
            $('#result-list').show();
        }else{
          alert('用户名已经存在，请换个用户名试试');
        }
      }).error(function(x,h,t){
        alert('注册失败，请重试');
        console.error(x);
        console.error(h);
        console.error(t);
      })
  })
})

/***工具方法区end****/
})