/*****************全局变量*******************/
var uid;
var did;
var activity_id = 7;
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

/*****************全局函数*******************/
/*
    两处地方调用本方法：
    1、用户已经登录，且还没有分享抽奖，直接调用该方法
    2、用户登录成功，且第一次抽奖已经使用，且分享抽奖还没有使用
*/
function sharePrize(){
    var tip = document.querySelector('.tip'),
        btn = document.querySelector('.btn'),
        btnContainer = document.querySelector('.btn-container'),
        viewMyPrize = document.querySelector('.view-my-prize'),
        shareWXBtn = document.createElement('a'),
        shareWBBtn = document.createElement('a');
    tip.innerHTML = '将此活动分享至朋友圈或微博<br>每天获得两次抽奖机会';
    btnContainer.removeChild(btn);
    // 分享到微信按钮
    shareWXBtn.className = 'btn share-btn wx';
    shareWXBtn.innerHTML = '分享到朋友圈';
    shareWXBtn.href = 'javascript:void(0);';
    // 分享到微博按钮
    shareWBBtn.className='btn share-btn wb';
    shareWBBtn.innerHTML = '分享到微博';
    shareWBBtn.href = 'javascript:void(0);';

    btnContainer.appendChild(shareWXBtn);
    btnContainer.appendChild(shareWBBtn);

    shareWBBtn.onclick = function(){
        alert(this.innerHTML);
        // shareSuccess(this);
        // shareFail(this);
    }
    shareWXBtn.onclick = function(){
        alert(this.innerHTML);
        // shareSuccess(this);
        // shareFail(this);
    }
    viewMyPrize.style.visibility = "visible";
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
    if(isFirst){
        // 隐藏提示文本
        tip.style.visibility = 'hidden';
        // 更改按钮文案
        btn.innerHTML = '点此抽奖';
        // 显示“查看我的奖品”
        viewMyPrize.style.visibility = 'visible';
        // 绑定“点此抽奖”按钮点击事件
        btn.onclick = function(){
            // 调用 抽奖方法
            winning();
        }
    } else {
        // 显示分享按钮
        sharePrize();
    }
}
// 未登录
function logout(){
    // 未登录的话，提示用户即可，不改变 按钮文案及按钮点击事件
    document.querySelector('.tip').innerHTML = '登录失败 请重新登录';
}


// 登录成功的回调
function loginSuccess(){
    var tip = document.querySelector('.tip'),
        btn = document.querySelector('.btn'),
        viewMyPrize = document.querySelector('.view-my-prize');
    if(isFirst){
        tip.style.visibility = "hidden";
        btn.innerHTML = '点此抽奖';
        viewMyPrize.style.visibility = "visible";
        btn.onclick = function(){
            // alert('第一次抽奖');
            // winning();
            shareFail();
        }
    }else{
        sharePrize();
    }
}
// 登录失败的回调
function loginFail(){
    var tip = document.querySelector('.tip'),
        btn = document.querySelector('.btn');
    tip.innerHTML = '登录失败 请重新登录';
}

// 分享成功的回调
function shareSuccess(btn){
    var tip = document.querySelector('.winning-tip');
    btn.style.cssText = "background:url(images/share-succ-bg.png) center center no-repeat;";
    btn.innerHTML = '点此抽奖';
    tip.style.display = 'block';
    tip.style.opacity = "1";
    setTimeout(function(){
        tip.style.display = "none";
        tip.style.opacity = "0";
    },2000)
    // 点击抽奖
    btn.onclick = winning;
}

// 分享失败的回调
function shareFail(){
    var tip = document.querySelector('.winning-tip');
    tip.innerHTML = '分享失败 再试一次';
}
/*
 点击 “点此抽奖” 按钮触发的回调方法
*/
function winning(){
    alert('要抽奖了');
    // winningFail();
    // unwinning(this);
    winningSuccess(this);
}
/*
    抽奖之后，
    根据是否中奖，来控制按钮上面的文本
*/
function changeBtn(btn,text){
    var cls = btn.className,wb,wx,text = text || '没中奖<br>明日再来';
    if(isLastDay){
      btn.innerHTML = '抽奖机会已用完';
    }else{
      btn.innerHTML = text;
    }
    btn.style.cssText = 'background:url(images/fail-btn.png) center center no-repeat;background-size:2.14rem .83rem;font-size:.26rem;';
    btn.onclick = null;
    if(cls.indexOf('wx')!== -1){
        wb = document.querySelector('.wb');
        if(wb.getAttribute('style') == null){
            wb.innerHTML = '分享到微博<br>再抽一次';
        }
    }else{
        wx = document.querySelector('.wx');
        if(wx.getAttribute('style') == null){
            wx.innerHTML = '分享到微博<br>再抽一次';
        }
    }
}

// 中奖了
function winningSuccess(btn){
    var winningDialog = document.querySelector('.winning-dialog'),
        confirm = winningDialog.querySelector('.confirm'),
        cancel = winningDialog.querySelector('.cancel'),
        tip = document.querySelector('.tip'),cls = btn.className,wb,wx;
    tip.innerHTML = '分享到朋友圈和微博可各获得一次';
    winningDialog.style.display = 'block';
    changeBtn(btn,'今日机会已用完<br>明日再来');

    // 绑定 winning-dialog上的 确认 取消 按钮的事件
    function cancelCb(){
        winningDialog.style.display = 'none';
    }
    cancel.onclick = cancelCb;
    
    confirm.onclick = function(){
        cancelCb();
    }

}

// 已经过期
function toExpirePage(){
     window.location.href = "expire.html";
}

// 未中奖
function unwinning(btn){
    var tip = document.querySelector('.tip'),cls = btn.className,wb,wx;
    tip.innerHTML = '您每天都有两次抽奖机会哟<br>分享到朋友圈和微博可各获得一次';
    tip.innerHTML = '登录失败 请重新登录';
    changeBtn(btn);
}

// 抽奖失败
function winningFail(){
    document.querySelector('.tip').innerHTML = '抽奖失败 再试一次';
}

// ajax函数
function ajax(opts){
     var xhr = new XMLHttpRequest(),
         method = opts.method || "GET",
         async = true,
         postData = null,
         data;
     if(opts.async != undefined){
        async = opts.async;
     }
     if(method.toUpperCase() === "POST"){
        xhr.setRequestHeader('Content-Type','application/x-www.form-urlencoded');
     }
     data = opts.data;
     if(data){
        postData = (function(data){
            var str = '',prop;
            for(prop in data){
                str += prop + "=" + data[prop] + "&";
            }
            return str;
        })(data);
     }
     xhr.open(method,opts.url,async);
     xhr.send(postData);

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
            var winningDialog = document.querySelector('.winning-dialog');
                h2 = winningDialog.querySelector('h2'),
                p = winningDialog.querySelector('p'),
                confirm = winningDialog.querySelector('.confirm'),
                cancel = winningDialog.querySelector('.cancel');
            winningDialog.style.cssText = 'display:block;height:auto;';
            h2.style.cssText = 'font-size:.3rem;text-align:left;line-height:1.4;';
            h2.innerHTML = '您已中的奖品有：<br>Moto360,DW手表';
            p.style.cssText = 'font-size:.2rem;line-height:1.4;margin-top:.1rem;';
            p.innerHTML = '您每天都有两次抽奖机会哟<br>分享到朋友圈和微博可各获得一次';
            cancel.onclick = cancelCb;
            function cancelCb(){
                winningDialog.style.display = 'none';
            }
            confirm.onclick = function(){
                cancelCb();
            }
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
    // 展开更多的点击事件
    var viewMore = document.querySelectorAll('.view-more');
    for(var i = 0;i<viewMore.length;i++){
        viewMore[i].onclick = function(){
            var ul = this.previousElementSibling;
            ul.style.cssText = 'overflow:visible;height:auto;';
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
    document.querySelector('.mask').style.display = "none";
}


// index.html 初始是登录页
// (function(window){
//     document.addEventListener('DOMContentLoaded',function(){
//         // 是否过期
//         var isExpire = false;
//         // 是否是第一次抽奖
//         var isFirst = false;
//         // 是否登录
//         var isLogin = false;
//         // 是否是最后一天
//         var isLastDay = false;
//         // 如果已经过期，跳转到过期页
//         if(isExpire){
//             // window.location.href = "expire.html";
//             toExpirePage();
//         }
//         // 如果已经登录。直接到抽奖页
//         if(isLogin){
//             // sharePrize();

//         }else{ // 没有登录，给登录按钮添加事件
//             var loginBtn = document.querySelector('.login');
//             loginBtn.onclick = function(){
//                 alert(this.innerHTML);
//             }
//         }
//         // 该用户是否中奖
//         var isWinning = true;
//         // 查看我的中奖信息点击事件
//         var viewMyPrize = document.querySelector('.view-my-prize');
//         viewMyPrize.onclick = function(){
//             if(isWinning){ //中奖
//                 var winningDialog = document.querySelector('.winning-dialog');
//                     h2 = winningDialog.querySelector('h2'),
//                     p = winningDialog.querySelector('p'),
//                     confirm = winningDialog.querySelector('.confirm'),
//                     cancel = winningDialog.querySelector('.cancel');
//                 winningDialog.style.cssText = 'display:block;height:auto;';
//                 h2.style.cssText = 'font-size:.3rem;text-align:left;line-height:1.4;';
//                 h2.innerHTML = '您已中的奖品有：<br>Moto360,DW手表';
//                 p.style.cssText = 'font-size:.2rem;line-height:1.4;margin-top:.1rem;';
//                 p.innerHTML = '您每天都有两次抽奖机会哟<br>分享到朋友圈和微博可各获得一次';
//                 cancel.onclick = cancelCb;
//                 function cancelCb(){
//                     winningDialog.style.display = 'none';
//                 }
//                 confirm.onclick = function(){
//                     cancelCb();
//                 }
//             }else{ // 未中奖
//                 var unwinningDialog = document.querySelector('.unwinning-dialog');
//                 confirm = unwinningDialog.querySelector('.confirm'),
//                 cancel = unwinningDialog.querySelector('.cancel'),
//                 unwinningDialog.style.display = 'block';
//                 confirm.onclick = cancel.onclick = function(){
//                     unwinningDialog.style.display = 'none';
//                 }
//             }
//         }
//         var viewMore = document.querySelectorAll('.view-more');
//         for(var i = 0;i<viewMore.length;i++){
//             viewMore[i].onclick = function(){
//                 var ul = this.previousElementSibling;
//                 ul.style.cssText = 'overflow:visible;height:auto;';
//             }
//         }
//         // 如果不是第一次抽奖
//         if(!isFirst){
//             (function(){
//                 var tip = document.querySelector('.tip'),
//                 btn = document.querySelector('.btn'),
//                 viewMyPrize = document.querySelector('.view-my-prize');
//                 tip.innerHTML = '此活动分享至朋友圈或微博<br>每天获得两次抽奖机会';
//             })()
//         }
//         // /*
//         //     两处地方调用本方法：
//         //     1、用户已经登录，且还没有分享抽奖，直接调用该方法
//         //     2、用户登录成功，且第一次抽奖已经使用，且分享抽奖还没有使用
//         // */
//         // function sharePrize(){
//         //     var tip = document.querySelector('.tip'),
//         //         btn = document.querySelector('.btn'),
//         //         btnContainer = document.querySelector('.btn-container'),
//         //         viewMyPrize = document.querySelector('.view-my-prize'),
//         //         shareWXBtn = document.createElement('a'),
//         //         shareWBBtn = document.createElement('a');
//         //     tip.innerHTML = '将此活动分享至朋友圈或微博<br>每天获得两次抽奖机会';
//         //     btnContainer.removeChild(btn);
//         //     // 分享到微信按钮
//         //     shareWXBtn.className = 'btn share-btn wx';
//         //     shareWXBtn.innerHTML = '分享到朋友圈';
//         //     shareWXBtn.href = 'javascript:void(0);';
//         //     // 分享到微博按钮
//         //     shareWBBtn.className='btn share-btn wb';
//         //     shareWBBtn.innerHTML = '分享到微博';
//         //     shareWBBtn.href = 'javascript:void(0);';

//         //     btnContainer.appendChild(shareWXBtn);
//         //     btnContainer.appendChild(shareWBBtn);

//         //     shareWBBtn.onclick = function(){
//         //         // alert(this.innerHTML);
//         //         shareSuccess(this);
//         //     }
//         //     shareWXBtn.onclick = function(){
//         //         // alert(this.innerHTML);
//         //         shareSuccess(this);
//         //     }
//         //     viewMyPrize.style.visibility = "visible";
//         // }
//         // 登录成功的回调
//         // function loginSuccess(){
//         //     var tip = document.querySelector('.tip'),
//         //         btn = document.querySelector('.btn'),
//         //         viewMyPrize = document.querySelector('.view-my-prize');
//         //     if(isFirst){
//         //         tip.style.visibility = "hidden";
//         //         btn.innerHTML = '点此抽奖';
//         //         viewMyPrize.style.visibility = "visible";
//         //         btn.onclick = function(){
//         //             alert('第一次抽奖');
//         //             winning();
//         //         }
//         //     }else{
//         //         sharePrize();
//         //     }
//         // }
//         // 调用该方法相当于进入 登录成功页
//         loginSuccess();

//         // 登录失败的回调
//         // function loginFail(){
//         //     var tip = document.querySelector('.tip'),
//         //         btn = document.querySelector('.btn');
//         //     tip.innerHTML = '登录失败 请重新登录';
//         // }
//         // 调用该方法相当于进入 登录失败页
//         // loginFail();

//         // 分享成功的回调
//         // function shareSuccess(btn){
//         //     var tip = document.querySelector('.winning-tip');
//         //     btn.style.cssText = "background:url(images/share-succ-bg.png) center center no-repeat;";
//         //     btn.innerHTML = '点此抽奖';
//         //     tip.style.display = 'block';
//         //     tip.style.opacity = "1";
//         //     setTimeout(function(){
//         //         tip.style.display = "none";
//         //         tip.style.opacity = "0";
//         //     },2000)
//         //     // 点击抽奖
//         //     btn.onclick = winning;
//         // }

//         // 分享失败的回调
//         // function shareFail(){

//         // }

//         /*
//             点击 “点此抽奖” 按钮触发的回调方法
//         */
//         // function winning(){
//         //     alert('要抽奖了');
//         //     // winningFail();
//         //     // unwinning(this);
//         //     winningSuccess(this);
//         // }

//         // // 中奖了
//         // function winningSuccess(btn){
//         //     var winningDialog = document.querySelector('.winning-dialog'),
//         //         confirm = winningDialog.querySelector('.confirm'),
//         //         cancel = winningDialog.querySelector('.cancel'),
//         //         tip = document.querySelector('.tip'),cls = btn.className,wb,wx;
//         //     tip.innerHTML = '分享到朋友圈和微博可各获得一次';
//         //     winningDialog.style.display = 'block';
//         //     changeBtn(btn,'今日机会已用完<br>明日再来');

//         //     // 绑定 winning-dialog上的 确认 取消 按钮的事件
//         //     function cancelCb(){
//         //         winningDialog.style.display = 'none';
//         //     }
//         //     cancel.onclick = cancelCb;
            
//         //     confirm.onclick = function(){
//         //         cancelCb();
//         //     }

//         // }
//         /*
//             抽奖之后，
//             根据是否中奖，来控制按钮上面的文本
//         */
//         function changeBtn(btn,text){
//             var cls = btn.className,wb,wx,text = text || '没中奖<br>明日再来';
//             if(isLastDay){
//               btn.innerHTML = '抽奖机会已用完';
//             }else{
//               btn.innerHTML = text;
//             }
//             btn.style.cssText = 'background:url(images/fail-btn.png) center center no-repeat;background-size:2.14rem .83rem;font-size:.26rem;';
//             btn.onclick = null;
//             if(cls.indexOf('wx')!== -1){
//                 wb = document.querySelector('.wb');
//                 if(wb.getAttribute('style') == null){
//                     wb.innerHTML = '分享到微博<br>再抽一次';
//                 }
//             }else{
//                 wx = document.querySelector('.wx');
//                 if(wx.getAttribute('style') == null){
//                     wx.innerHTML = '分享到微博<br>再抽一次';
//                 }
//             }
//         }
//         // // 未中奖
//         // function unwinning(btn){
//         //     var tip = document.querySelector('.tip'),cls = btn.className,wb,wx;
//         //     tip.innerHTML = '您每天都有两次抽奖机会哟<br>分享到朋友圈和微博可各获得一次';
//         //     tip.innerHTML = '登录失败 请重新登录';
//         //     changeBtn(btn);
//         // }
//         // // 抽奖失败
//         // function winningFail(){
//         //     document.querySelector('.tip').innerHTML = '抽奖失败 再试一次';
//         // }
//         // 滑动
//         var prizes = document.querySelector('.prizes');
//         (function(prizes){
//             var prizesLi = prizes.querySelectorAll('li'),
//                 len = prizesLi.length,
//                 // 计算 ul.prizes 的宽度
//                 eachPrize = prizesLi[0],
//                 ow = eachPrize.offsetWidth,
//                 marginLeftAndRight = len*2*Math.ceil(parseFloat(getComputedStyle(eachPrize,null).marginLeft));
//             console.log(marginLeftAndRight);
//             prizes.style.width = ow*prizesLi.length + marginLeftAndRight + "px";
//         })(prizes)
        
//         // 记录手指放在DOM上的初始X坐标
//         var startX;
//         // 触摸开始
//         prizes.addEventListener('touchstart',function(e){

//             var  finger = e.targetTouches[0];
//             startX = finger.clientX;

//             console.log('touchstart X:'+ finger.clientX);
//             var dis = +this.dataset.dis;
//             if(dis){
//                 this.style.webkitTransform = "translate3d("+dis+"px,0,0)";
//                 this.style.transform = "translate3d("+dis+"px,0,0)";
//             }

//         })
//         var add = true;
//         // 手指移动
//         prizes.addEventListener('touchmove',function(e){
//             var finger = e.targetTouches[0];
//             var distance = finger.clientX - startX;
//             // 取出上一次移动的距离
//             // 本次移动的距离加上上次移动的距离
//             var dis = +this.dataset.dis;
//             if(add){
//                 distance += dis;
//                 add = false;
//             }
//             this.style.webkitTransform = "translate3d("+(distance)+"px,0,0)";
//             this.style.transform = "translate3d("+(distance)+"px,0,0)";
//             console.log('touchmove');

//         })
//         // 手指离开
//         prizes.addEventListener('touchend',function(e){
//             var finger = e.changedTouches[0];
//             var distance = finger.clientX - startX;
//             console.log(distance);
//             this.dataset.dis = distance;
//         })



// },false)
// })(window) 
