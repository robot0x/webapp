document.addEventListener('DOMContentLoaded',function(){
    var arrPrototype = Array.prototype;
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
                    href:'http://m.jd.hk/ware/view.action?wareId=1951113071',
                    title:'日本的细致&德国的品质'
                },
                "DD1Y_MIFFY":{
                    src:'7miffy210',
                    href:'https://shejimaogf.tmall.com/p/rd896755.htm?spm=a1z10.1-b.w5003-12598402709.1.R9BL4S',
                    title:'110年不倒还能继续卖萌兔子'
                },
                "DD1Y_STOSTO":{
                    src:'8zhenkongbeng210',
                    href:'http://www.stosto.com/goods.php?id=1941',
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
                    ulStyle = 'height:0;'
                }
                console.log(viewMoreHTMLStr);
                winners.forEach(function(item,index){
                    winnersHTMLStr += '<li>' + item.nick_name +'</li>';
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
},false)
window.onload = function(){
    document.querySelector('.mask').style.display = "none";
}