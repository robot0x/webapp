/*****************全局变量*******************/
// 是否过期
var isExpire = false;
// 是否是第一次抽奖
var isFirst = false;
// 是否登录
var isLogin = true;
// 是否是最后一天
var isLastDay = false;
// 该用户是否中奖
var isWinning = true;

var arrPrototype = Array.prototype;

/*****************全局函数*******************/

// 显示 loading 遮罩层
function showLoading(){
    document.querySelector('.mask').style.display = 'display';
}
// 关闭 loading 遮罩层
function closeLoading(){
    document.querySelector('.mask').style.display = "none";
}
/*
    parent 父容器
    callback 点击事件的回调
    text 按钮文本
*/
function createWBBtn(parent,callback,text){
    var shareWBBtn = document.createElement('a'),
        text = text || '分享到微博';
    parent.innerHTML = '';
    shareWBBtn.innerHTML = text;
    shareWBBtn.className = 'btn share-btn wb';
    shareWBBtn.href = 'javascript:void(0);';
    parent.appendChild(shareWBBtn);
    // “分享到微博”按钮 绑定事件
    shareWBBtn.onclick = function(e){
        callback(e);
    }
}
function createWXBtn(parent,callback,text){
    var shareWXBtn = document.createElement('a'),
        text = text || '分享到朋友圈';
    shareWXBtn.innerHTML = text;
    shareWXBtn.className = 'btn share-btn wx';
    shareWXBtn.href = 'javascript:void(0);'
    parent.appendChild(shareWXBtn);
    shareWXBtn.onclick = function(e){
        callback && callback.call(this,e);
    }
}
/*
    显示红色圆圈提示
    text 圆圈中的提示文本
    ms 多少毫秒关闭提示 默认是2000ms
*/
function showRedCircleTip(text,ms){
    var redCircleTip = document.querySelector('.red-circle-tip')
        ms = ms || 2000;
    redCircleTip.style.visibility = 'visible';
    redCircleTip.innerHTML = text;
    setTimeout(function(){
        redCircleTip.style.visibility = 'hidden';
    },ms)
}
/*
  分享成功之后，点击了那个按钮，就要把那个按钮变成 “点此抽奖”，并提示用户 抽奖机会+1
  which 被点击的按钮
  btnText 按钮文本 默认是 “点此抽奖”
  tipText 提示用户获得抽奖机会的文本 默认是 “抽奖机会+1”
*/
function changeToPrizeBtn(which,callback,btnText,tipText){
    var tip = document.querySelector('.tip'),
        tipText = tipText || '分享成功 马上去抽奖吧',
        btnText = btnText || '点此抽奖';
    which.style.cssText = "background:url(images/share-succ-bg.png) center center no-repeat;background-size:2.14rem .83rem";
    which.innerHTML = btnText;
    tip.innerHTML = tipText;
    tip.style.display = 'block';
    which.onclick = function(e){
        callback && callback.call(this,e);
    }
}

function disableShareBtn(which,text){
    var cls = which.className,wb,wx,text = text || '没中奖<br>明日再来';
    // 如果是最后一天，按钮 文案改成 '抽奖机会已用完'
    if(isLastDay){
      which.innerHTML = '抽奖机会已用完';
    }else{
      which.innerHTML = text;
    }
    which.style.cssText = 'background:url(images/fail-btn.png) center center no-repeat;background-size:2.14rem .83rem;font-size:.26rem;';
    which.onclick = null;
    // if(cls.indexOf('wx')!== -1){
    //     wb = document.querySelector('.wb');
    //     if(wb.getAttribute('style') == null){
    //         wb.innerHTML = '分享到微博<br>再抽一次';
    //     }
    // }else{
    //     wx = document.querySelector('.wx');
    //     if(wx.getAttribute('style') == null){
    //         wx.innerHTML = '分享到朋友圈<br>再抽一次';
    //     }
    // }
}   
/*
    两处地方调用本方法：
    1、用户已经登录，且还没有分享抽奖，直接调用该方法
    2、用户登录成功，且第一次抽奖已经使用，且分享抽奖还没有使用
*/
function sharePrize(){
    /*
      首先呼起遮罩层。
      然后发送ajax请求，根据请求到的数据
      1、来点亮按钮；
      2、更改文本；
      3、绑定事件；
      最后在ajax的success关闭遮罩层
    */
    var tip = document.querySelector('.tip'),
        btnContainer = document.querySelector('.btn-container'),
        viewMyPrize = document.querySelector('.view-my-prize');
    // 更改提示文本
    tip.innerHTML = '将此活动分享至朋友圈或微博<br>每天获得两次抽奖机会';
    // 显示 “查看我的奖品”
    viewMyPrize.style.visibility = "visible";
    // 移除 “点此立即登录按钮”
    btnContainer.removeChild(document.querySelector('.btn'));
    // 创建 “分享到微博” 按钮，并绑定事件
    createWBBtn(btnContainer,function(e){
        showRedCircleTip('抽奖机会+1');
        // shareFail();
        var target = e.target;
        // 分享按钮 变为 点此抽奖 按钮，并绑定事件
        changeToPrizeBtn(target,function(e){
            disableShareBtn(target);
            // 在这儿调用抽奖方法
            winning(this);
        });
    });
    // 创建 “分享到朋友圈” 按钮，并绑定事件
    createWXBtn(btnContainer,function(e){
        showRedCircleTip('抽奖机会+1');
        var target = e.target;
        changeToPrizeBtn(target,function(e){
            disableShareBtn(target);
            // winning(this);
            unwinning(this);
        });
    });

    // disableShareBtn(document.querySelector('.wb'));
    
    // changeToPrizeBtn(document.querySelector('.wb'),function(){
    // });
 }

/*
  在判断是否登录之后
  1、已经登录  调用 login
  2、还没有登录  调用 logout
*/
function login(){
    var tip = document.querySelector('.tip'),
        btn = document.querySelector('.btn'),
        viewMyPrize = document.querySelector('.view-my-prize');
    /*
      首先判断是否是第一次抽奖，如果是第一次抽奖，送一次抽奖机会
      否则 调用 sharePrize 方法来显示 分享按钮
    */
    // if(isFirst){
    //     // 隐藏提示文本
    //     tip.style.visibility = 'hidden';
    //     // 更改按钮文案
    //     btn.innerHTML = '点此抽奖';
    //     // 显示“查看我的奖品”
    //     viewMyPrize.style.visibility = 'visible';
    //     // 绑定“点此抽奖”按钮点击事件
    //     btn.onclick = function(){
    //         // 调用 抽奖方法
    //         winning();
    //     }
    // } else {
        // 显示分享按钮
        sharePrize();
    // }
}
// login();
// 未登录
function logout(){
    // 未登录的话，提示用户即可，不改变 按钮文案及按钮点击事件
    document.querySelector('.tip').innerHTML = '登录失败 请重新登录';
}
// 分享失败的回调
function shareFail(){
    document.querySelector('.tip').innerHTML = '分享失败 再试一次';
}
// 已经过期 跳转到过期页
function toExpirePage(){
     window.location.href = "expire.html";
}
// 保存用户填入的信息到本地
function setDate(data){
    window.localStorage.setItem('winning_info',JSON.stringify(data));
}
// 获取本地数据
function getDate(){
    return JSON.parse(window.localStorage.getItem('winning_info'));
}

/*
    显示对话框，
    which 要显示的对话框
    title 对话框的标题
    prizeText 中奖信息 形如  “您的奖品是：<span>Moto360</span>”
*/
function showWinningDialog(which,title,prizeText,confirmCb,cancelCb){
    which.style.display = 'block';
    which.querySelector('h2').innerHTML = title;
    which.querySelector('p').innerHTML = prizeText;
    var data = getDate();
    var name = which.querySelector('.name');
    var phone = which.querySelector('.phone');
    var addr = which.querySelector('.addr');
    if(data != null && data != 'null'){
       if(data.name){
         name.value = data.name;
       }
       if(data.phone){
        phone.value = data.phone;
       }
       if(data.addr){
        addr.value = data.addr;
       }
    }
    which.querySelector('.confirm').onclick = function(e){
        confirmCb.call(this,e);
        var obj = {};
        var nameVal = name.value.trim();
        var phoneVal = phone.value.trim();
        var addrVal = addr.value.trim();
        if(nameVal){
            obj.name = name.value;
        }
        if(phoneVal){
            obj.phone = phone.value;
        }
        if(addrVal){
            obj.addr = addr.value;
        }
        setDate(obj);
    }
    which.querySelector('.cancel').onclick = function(e){
        cancelCb.call(this,e);
    }
}   
/* 
  中奖了
  btn 被点击的 “点此抽奖按钮”
  btnText 更改后的按钮文本
  tipText 提示文本
*/

function winning(btn,btnText,tipText){
    var winningDialog = document.getElementById('winning'),
        tip = document.querySelector('.tip'),cls = btn.className,wb,wx,
        btnText = btnText || '今日机会已用完<br>明日再来',
        tipText = tipText || '分享到朋友圈和微博可各获得一次';
    tip.innerHTML = tipText;
    btn.innerHTML = btnText;
    // 绑定 winning-dialog上的 确认 取消 按钮的事件
    showWinningDialog(winningDialog,'恭喜您中奖了','您的奖品是：<span>Moto360</span>',function(e){
        // 首先 调用 getData
        // 发送ajax，保存信息
        winningDialog.style.display = 'none';
    },function(e){
        winningDialog.style.display = 'none';
    })
}
/*
  未中奖
  btn 被点击的 点此抽奖 按钮
  text 按钮更改后的文本
*/ 
function unwinning(btn,text){
    var tip = document.querySelector('.tip'),cls = btn.className,wb,wx,text = text || '没中奖<br>明日再来';
    tip.innerHTML = '您每天都有两次抽奖机会哟<br>分享到朋友圈和微博可各获得一次';
    btn.innerHTML = text;
    showRedCircleTip('很遗憾<br>您未能中奖');
}
// 抽奖失败
function winningFail(){
    document.querySelector('.tip').innerHTML = '抽奖失败 再试一次';
}

/*
  显示 （注意：必须点击下方按钮分享才可获得抽奖机会）
  在某些安卓机型下，右上角的分享按钮分享之后，并不知道用户分享到哪儿了，需要提示用户
  使用下方的分享
*/
function showAttention(){
    document.querySelector('.attention').visibility = "visible";
}
// ajax函数
function ajax(opts){
     var xhr = new XMLHttpRequest(),
         method = opts.type || "GET",
         async = true,
         contentType = opts.contentType || 'application/x-www.form-urlencoded';
         data = opts.data || {},
         type = function (arg){
            var t = typeof arg,s;
            if(t === 'object'){
                if(arg === null){
                    return 'null';
                }else{
                    s = Object.prototype.toString.call(arg);
                    return s.slice(8,s.length-1).toLowerCase();
                }
            }else{
                return t;
            }
      };
     if(opts.async != undefined){
        async = opts.async;
     }
     xhr.open(method,opts.url,async);
     if(method.toUpperCase() === "POST"){
        xhr.setRequestHeader('Content-Type',contentType);
     }
     data = opts.data;
     if(data && type(data) == 'object'){
            data = (function(data){
                var str = '',prop;
                for(prop in data){
                    str += prop + "=" + data[prop] + "&";
                }
                return str;
            })(data);
    }
     xhr.send(data);
     xhr.onreadystatechange = function(){
        if(xhr.readyState === 4){
            if(xhr.status === 200){
                opts.success && opts.success(xhr.responseText);
            }else{
                opts.error && opts.error({readyState:xhr.readyState,status:xhr.status});
            }
        }else{
            opts.error && opts.error({readyState:xhr.readyState,status:xhr.status});
        }
     }
}
function text(obj,text){
    obj.innerHTML = text;
}
// 退回到用户未登录状态
function restart(tipText){
    var btnContainer = document.querySelector('.btn-container'),
        tipText = tipText || '您尚未登录 无法参与活动',
        tip = document.querySelector('.tip'),
        btnHtml = '<a href="javascript:ddCheckLogin(CLcb,true);" class="login btn">点此立即登录</a>';
    text(btnContainer,btnHtml);
    text(tip,tipText);
}
// 默认抽奖状态的dom操作
function defaultPrize(callback){
    var btnContainer = document.querySelector('.btn-container'),
        tip = document.querySelector('.tip'),
        viewMyPrize = document.querySelector('.view-my-prize');
        tip.style.visibility = 'hidden';
        viewMyPrize.style.visibility = 'visible';
        text(btnContainer,'');
        var a = document.createElement(a);
        a.href = "javascript:void(0);";
        a.className = "login btn";
        text(a,'点此抽奖');
        a.onclick =function(e){
            callback.call(this,e);
        }
        btnContainer.appendChild(a);
}
/*****************DOMReady*******************/
document.addEventListener('DOMContentLoaded',function(){
    // 是否过期
    isExpire = false;
    // 是否是第一次抽奖
    isFirst = false;
    // 是否登录
    isLogin = true;
    // 是否是最后一天
    isLastDay = false;
    // 该用户是否中奖
    isWinning = true;

    // 如果已经过期，跳转到过期页
    if(isExpire){
        toExpirePage();
    }
    // 调整奖品展示列表容器(ul)的宽度，使得能容纳下所有的奖品
    var prizes = document.querySelector('.prizes');
    (function(prizes){
        var prizesLi = prizes.querySelectorAll('li'),
            len = prizesLi.length,
            // 计算 ul.prizes 的宽度
            eachPrize = prizesLi[0],
            ow = eachPrize.offsetWidth,
            marginLeftAndRight = 2*len*Math.ceil(parseFloat(getComputedStyle(eachPrize,null).marginLeft));
        prizes.style.width = ow*prizesLi.length + marginLeftAndRight + "px";
    })(prizes)
    // 发送ajax 拉取中奖信息
    ajax({
        url:'http://121.42.141.74/dd_api/v2/coupon',
        type:"POST",
        contentType:'application/json',
        data:JSON.stringify({
            'uid':43,
            'activity_id':65535,
            'did':'7419E5E3-F353-4631-A673-601655E65F38',
            'action':'get_activity_info',
            'signature':'9b856f60079d062b1815349846a28353'
        }),
        success:function(data){
            // console.log(data);
            // 根据请求数据来渲染dom
            data = JSON.parse(data);
            var res = data.res;
            var activity_data = res.activity_data;
            var awards = activity_data.awards;
            var frag = document.createDocumentFragment();
            var li;
            var stringBuffer = [];
            // imgList 决定了奖品的顺序
            var imgList = {
                "DD1Y_MOTO360":{
                    src:'1moto360',
                    href:'http://www.motorola.com.cn/on/demandware.store/Sites-Motorola_CN-Site/zh_CN/Default-Start?utm_medium=app&utm_source=diaodiao&utm_campaign=pr_20151111',
                    title:'智能手表中的选美冠军'
                },
                "DD1Y_TOOTHBRUSH":{
                    src:'2tooth210',
                    href:'http://c.diaox2.com/view/app/?m=show&id=858',
                    title:'千颂伊同款的旗舰级电动牙刷HX9361'
                },
                "DD1Y_KINDLE":{
                    src:'3kindlepw210',
                    href:'http://c.diaox2.com/view/app/?m=show&id=3420',
                    title:'文艺与科技完美结合的Kindle PW'
                },
                "DD1Y_KANKEN":{
                    src:'4kankenclassic210',
                    href:'http://c.diaox2.com/view/app/?m=show&id=1826',
                    name:'Kanken背包（多色）',
                    title:'瑞典皇室认证的高端品牌'
                },
                "DD1Y_JELLYCAT":{
                    src:'5jellycat',
                    href:'http://c.diaox2.com/view/app/?m=show&id=1055',
                    title:'星二代们的街拍利器'
                },
                "DD1Y_THERMOS":{
                    src:'6thermos210',
                    href:'http://product.suning.com/0070088095/126791051.html',
                    title:'日本的细致&德国的品质'
                },
                // 7 米菲兔子链接暂缺
                "DD1Y_MIFFY":{
                    src:'7miffy210',
                    href:'#',
                    title:'110年不倒还能继续卖萌兔子'
                },
                "DD1Y_STOSTO":{
                    src:'8zhenkongbeng210',
                    href:'https://detail.tmall.com/item.htm?id=45480518953',
                    title:'质量与颜值并重的家用收纳真空泵'
                },
                "DD1Y_BSLR":{
                    src:'9bslr',
                    href:'http://c.diaox2.com/view/app/?m=show&id=418',
                    title:'风靡日本40年的必备手信'
                },
                "DD1Y_CLIPPER":{
                    src:'10nail210',
                    href:'http://c.diaox2.com/view/app/?m=show&id=3686',
                    title:'红点设计大奖的调调限量版指甲刀'
                },
                "DD1Y_SANTE":{
                    src:'11maipian210',
                    href:'http://c.diaox2.com/view/app/?m=show&id=3514',
                    title:'满溢浆果清香的sante干吃麦片'
                }
            }
            var index = 0;
            for(var attr in imgList){
                stringBuffer.length = 0;
                var each = awards[attr];
                var info = each.info;
                var img = imgList[attr];
                var price = info.price;
                var count = info.total;
                var winners = each.winners;
                var winnersHTMLStr = '';
                var viewMoreHTMLStr = '';
                var name = info.name;
                var l = winners.length;
                var winningArea = document.querySelector('.winning');
                var winningList = winningArea.querySelector('.winning-list');
                var ulStyle = '';

                if(attr == 'DD1Y_KANKEN'){
                    name = img.name;
                }
                if(winners && l){
                    viewMoreHTMLStr='<a href="javascript:void(0);" class="view-more">展开更多<i class="bottom-arrow"></i></a>';
                }else{
                    ulStyle = 'height:0;';
                }
                winners.forEach(function(item,index){
                    winnersHTMLStr += '<li>' + item.nick_name +'</li>';
                    if(index == 0){
                        for(var j = 0;j<40;j++){
                            winnersHTMLStr += '<li>liyanfeng' + (j+1) + '</li>';
                        }
                    }
                })
                stringBuffer.push('<a class="winning-block clearfix" target="_blank" href="',img.href,'"><img src="images/prize/',img.src,'.jpg" alt="奖品"><div class="prize-detail"><h2 class="prize-name">',name,'</h2><p class="prize-prize">价值￥',price,'</p><p class="prize-desc">',img.title,'</p><span class="right-arrow"></span></div></a><p class="winning-gays-count">数量：',l,'/',count,'</p><ul class="winning-gays clearfix" style="',ulStyle,'">',winnersHTMLStr,'</ul>',viewMoreHTMLStr,'<span class="bottom-line"></span></li>');
                li = document.createElement('li');
                li.innerHTML = stringBuffer.join('');
                frag.appendChild(li);
            }
            winningList.appendChild(frag);
            // 展开更多的点击事件
            var viewMore = document.querySelectorAll('.view-more');
            arrPrototype.forEach.call(viewMore,function(dom){
                dom.onclick = function(){
                    var ul = this.previousElementSibling;
                    var clsName = ul.className;
                    var bottomArrow = this.querySelector('i');
                    // 折叠
                    if(clsName.indexOf('opened')!==-1){

                        ul.removeAttribute('style');
                        bottomArrow.removeAttribute('style');
                        ul.className = ul.className.replace('opened','');
                        this.firstChild.nodeValue = '展开更多';
                        
                    }else{
                        // 展开
                        ul.style.cssText = 'overflow:visible;height:auto;';
                        ul.className = ul.className + ' opened';
                        bottomArrow.style.webkitTransform = 'rotate(180deg)';
                        bottomArrow.style.transform = 'rotate(180deg)';
                        this.firstChild.nodeValue = '收起';
                    }
                }
            })
        }
    })

    // loginCheck
    if(isLogin){
        // sharePrize();
    }else{ // 没有登录，给登录按钮添加事件
        var loginBtn = document.querySelector('.login');
        loginBtn.onclick = function(){
            alert(this.innerHTML);
        }
    }
    // 查看我的中奖信息点击事件
    var viewMyPrize = document.querySelector('.view-my-prize');
    viewMyPrize.onclick = function(){
        if(isWinning){ //中奖
            var winningDialog = document.getElementById('view_winning');
            showWinningDialog(winningDialog,'您已中的奖品有：<br>Moto360,DW手表', 
                '您每天都有两次抽奖机会哟<br>分享到朋友圈和微博可各获得一次',function(e){

                    winningDialog.style.display = 'none';
                },function(e){
                    winningDialog.style.display = 'none';
                })
        }else{ // 未中奖
            var unwinningDialog = document.querySelector('.unwinning-dialog');
            confirm = unwinningDialog.querySelector('.confirm'),
            cancel = unwinningDialog.querySelector('.cancel'),
            unwinningDialog.style.display = 'block';
            confirm.onclick = cancel.onclick = function(){
                unwinningDialog.style.display = 'none';
            }
        }
    }
    
   // 不是第一次抽奖
    if(!isFirst){
        (function(){
            var tip = document.querySelector('.tip'),
            btn = document.querySelector('.btn');
            // tip.innerHTML = '此活动分享至朋友圈或微博<br>每天获得两次抽奖机会';
        })()
    }
})
// 加载完毕移除加载动画
window.onload = function(){
    closeLoading();
}