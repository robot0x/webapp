$(function(){
        
    // 修复IE8及一下不支持console
    if(!(window.console && console.log)){
        console = {
            log: function() {},
            debug: function() {},
            info: function() {},
            warn: function() {},
            error: function() {}
        };
    }
    // header动态效果start
    var wrapper = $('.wrapper');
    var topHeader = wrapper.find('.top-header');
    var topHeaderHeight = topHeader.height();
    var bottomHeader = wrapper.find('.header');
    var bannerArea = wrapper.find('.banner-area');
    window.onscroll = function(){
        var scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
        if(scrollTop>= topHeaderHeight){
            bottomHeader.addClass('fixed');
            bannerArea.css("margin-top",50);
        }else{
            bottomHeader.removeClass('fixed');
            bannerArea.css("margin-top",0);
        }
    }
    // header动态效果end
    // 计算banner宽度
    var bannerList = $('.banner-list');
    var bannerListLi = bannerList.find('li');
    var marginOfBannerListLi = bannerListLi.css("margin-right");
    var liBoxWidth = bannerListLi.width() + parseInt(marginOfBannerListLi);
    var calcWidthOfBannerList = bannerListLi.length * liBoxWidth;
    bannerList.css('width',calcWidthOfBannerList);
    /*
        banner运动
    */
    var BannerPlay = function(opts){
        this.bannerArea = opts.container;
        this.distance = opts.width;
        this.bannerList = this.bannerArea.find('.banner-list');
        this.list = $.makeArray(this.bannerList.children());
        this.autoPlay = true;
        this.hoverPausePlay = true;
        this.direction = opts.direction || "leftToRight";
        if(typeof opts.autoPlay == 'boolean'){
            this.autoPlay = opts.autoPlay;
        }
        if(typeof opts.hoverPausePlay == 'boolean'){
            this.hoverPausePlay = opts.hoverPausePlay;
        }
        this.start();
    }
    BannerPlay.prototype = {
        constructor:BannerPlay,
        bindEvent:function(){
            var self = this;
            var distance = self.distance;
            var bannerList = $(self.bannerList);
            // 下一张的点击事件
            self.bannerArea.on('click','.next',function(){
                var left = parseInt(bannerList.css("left"));
                bannerList.animate({left:left-distance},function(){
                    /*
                    把数组中最后一个元素移动到最后一个位置。并更新到页面上
                    */
                    var removedDOM = self.list.shift();
                    self.list.push(removedDOM);
                    /*
                        更新到页面上
                    */                
                    $(removedDOM).remove();// 删除数组中第一个
                    bannerList.append(removedDOM);// 把删除的第一个元素append到数组的尾部
                    bannerList.css('left',0);
                });
            })
            // 上一张的点击事件
            self.bannerArea.on('click','.prev',function(){

                /*
                    “上一张”切换动画结束时，dom才更新到页面，这样用户会看到页面出现“白板”，DOM更新完
                    之后才正常。
                    为了防止这种情况发生，需要在用户点击“上一张”时，马上更新dom，让“白板”出现再用户看不到
                    的地方，然后动画运动到left为0处。
                    这是跟“下一张”的不同之处，由于多张图片由左向右一次排列，所以“下一张”出现的“白版”
                    用户永远看不到
                */  
                var left = parseInt(bannerList.css("left"));
                /*
                把数组中第一个元素移动到最后一个位置。并更新到页面上
                */
                var removedDOM = self.list.pop();
                self.list.unshift(removedDOM);
                /*
                    更新到页面上
                */                
                $(removedDOM).remove();// 删除数组中最后一个
                $(self.list[1]).before(removedDOM);// 把删除的最后一个元素插入到第一个元素位置
                bannerList.css('left',-distance);
                bannerList.animate({left:0});
            })
            if(this.hoverPausePlay){
                // 整个banner区的hover事件
                $('.banner-container,.prev,.next').hover(function(){
                    self.stopPlay();// 鼠标移入，停止播放
                },function(){
                    // function throttle(method,context,ms){
                    //   clearTimeout(self.tId);
                    //   self.tId=setTimeout(function(){
                    //       method.call(context);
                    //   },ms);
                    // }
                    // throttle(function(){
                    //     self.bannerArea.find('.next').trigger('click');
                    // },null,500)
                    self.play(); // 鼠标移出，开始播放
                })
            }
        },
        start:function(){
            if(this.autoPlay){
                this.play();
            }
            this.bindEvent();
        },
        stopPlay:function(){
            clearInterval(this.timer);
        },
        play:function(){
            var self = this;
            self.timer = setInterval(function(){
                // 从左到右
                if(self.direction === "leftToRight"){
                    self.bannerArea.find('.next').trigger('click');
                }else{
                    self.bannerArea.find('.prev').trigger('click');
                }
            },2000)
        }
    }
    new BannerPlay({
        container:$('.banner-area'),
        width:liBoxWidth,
        direction:"leftToRight",
        autoPlay:true,//default ture
        hoverPausePlay:true // default true
    });
     var Pagination = function(opts){
        // 每页条数
        this.countPerPage = opts.countPerPage;
        // 数据总数
        this.totalCount = opts.totalCount;
        // 控制 ... 出现的位置 默认是4
        this.cut = opts.cut || 4;
        // 分页条显示的页码 默认是7
        this.displayPageCount = opts.displayPageCount || 7;
        // 分页条所在的容器
        this.appendTo = opts.appendTo;
        // 供分页的数据
        this.data = opts.data;
        // 当前页码  从1开始
        this.currentIndex = 1; 
        // 上一次的状态。在calcState中赋值。在updatePaginationBar中使用
        // 作用是：只有状态变了，才更新整个分页条的DOM
        this.oldCurrentIndex = 1; 
        /*
            state = 1
            上一页 1 2 3 4 5 6 ... N 下一页

            state = 2
            上一页 1 ... 3 4 5 6 7 ... N 下一页

            state = 3（设N=62）
            上一页 1 ... 57 58 59 60 61 62
        */
        this.state = 1;// 初始状态是1
        // 点击 “上一页”|“下一页”|页码 时的回调函数
        this.callback = opts.callback;
        if(this.totalCount == null && this.data && this.data.length > 0  ){
            this.totalCount = this.data.length;
        }
        // 总的页数
        this.pageCount = Math.ceil(this.totalCount / this.countPerPage);
        // 启动分页
        this.start();
    }
    Pagination.prototype = {
        constructor:Pagination,
        initPaginationBar:function(){
            this.renderDOM();
        },
        /*
            根据传入的数据，生成底部的分页条。主要是DOM操作。
            在this.start中调用，是this.start中第一个执行的函数。所有的函数都在这个函数执行后的基础上调用
        */
        renderDOM:function(){
            var paginationContainer = document.createElement('div');
            var pagination = document.createElement('div');
            var paginationMain = document.createElement('p');
            var frag = document.createDocumentFragment();
            var pageCount = this.pageCount;
            // 计算页数
            if(pageCount <= 1){
                return;
            }
            paginationContainer.className = "pagination-container";
            pagination.className = "pagination";
            paginationMain.className = "pagination-main";
            
            // 预处理A标签
            // <a href="javascript:void(0);" onclick="return false;" class="pagination-previous">上一页</a>
            var PreProcessingATag = function(aTag){
                aTag.href = "javascript:void(0);";
                aTag.onclick = "return false;";
                return aTag;
            }
            // 创建 上一页 按钮
            var previousPage = PreProcessingATag(document.createElement("a"));
            // 创建 下一页 按钮 浅拷贝 上一页 按钮即可
            var nextPage = previousPage.cloneNode(false);
            previousPage.className = "pagination-previous";
            previousPage.innerHTML = "上一页";
            nextPage.className = "pagination-next";
            nextPage.innerHTML = "下一页";
            // 添加上一页到文档碎片中
            frag.appendChild(previousPage);
            if(pageCount <= this.displayPageCount - 1){

                // 上一页 1 2 3 4 5 6 下一页
                for(var i = 0;i<pageCount;i++){
                    var a = PreProcessingATag(document.createElement("a"));
                    a.innerHTML = i+1;
                    a.className = "item";
                    a.title = i+1;
                    frag.appendChild(a);
                }


            }else{
                // 上一页 1 2 3 4 5 6 ... N 下一页
                for(var i = 0;i< this.displayPageCount - 1;i++){
                    var a = PreProcessingATag(document.createElement("a"));
                    a.innerHTML = i+1;
                    a.className = "item";
                    a.title = i+1;
                    frag.appendChild(a);
                }
                 var more = PreProcessingATag(document.createElement("a"));
                 more.innerHTML = '...';
                 more.className = "more";
                 frag.appendChild(more);

                 var lastPage = PreProcessingATag(document.createElement("a"));
                 lastPage.innerHTML = pageCount;
                 lastPage.className = "item";
                 lastPage.title = pageCount;
                 frag.appendChild(lastPage);
            }
            
            // 添加下一页到文档碎片中
            frag.appendChild(nextPage);
            paginationMain.appendChild(frag);
            pagination.appendChild(paginationMain);
            paginationContainer.appendChild(pagination);
            this.appendTo.appendChild(paginationContainer);
            // 给当前页码添加样式
            this.current();
        },
        // 根据页码获取页码对应的状态
        getStateByPageNum:function(index){
            if(index <= this.cut){
                return 1;
            }else if(index > this.cut && index < this.pageCount - this.cut + 1){
                return 2;
            }else if(index >= this.pageCount - this.cut + 1 && index <= this.pageCount){
                return 3;
            }
        },
        /*
            在this.current中调用。根据当前的页码，计算所属的状态，然后更新state
        */
        calcState:function(index,oldCurrentIndex){
            index = index || this.currentIndex;
            this.state = this.getStateByPageNum(index);
            this.oldCurrentIndex = oldCurrentIndex;
        },
        /*
            更新分页条中页码的选中状态，并更新currentIndex字段
            在bindEvent和renderDOM中调用
            bindEvent：根据“上一页”|“下一页”|“页码”的点击情况，来更新页码选中状态，并更新currentIndex字段
            renderDOM：选中状态初始化
        */
        current:function(index){
            // 1 首先，取消掉以前的current状态
            var oldCurrentDOM = this.appendTo.querySelector('.current');
            if(oldCurrentDOM){
                oldCurrentDOM.className = "item";
            }
            // 2 其次，给当前的页码添加current状态
            index = index || this.currentIndex;
            var currentDOM =  this.appendTo.querySelector('.item[title="'+index+'"]');
            if(currentDOM){
                currentDOM.className = currentDOM.className+ " current";
            }
            // 3 最后，更新currentIndex字段
            this.currentIndex = index;
            this.calcState(index,oldCurrentDOM == null ? 1 : oldCurrentDOM.title);
        },
        /*
            根据索引切分数据
        */
        sliceData:function(index){
            index = index || this.currentIndex;
            var start = (index-1)*this.countPerPage;
            var end = index * this.countPerPage;
            return this.data.slice(start,end);
        },
        toTop:function(){
            var self = this;
            $('html,body').animate({
                scrollTop: self.appendTo.offsetTop - 80
            },"slow");
        },
        /*
            根据切分后的数据执行回调
        */
        changeDOM:function(data){
            // 更新分页条状态
            this.updatePaginationBar();
            // 执行 “上一页”|“下一页”|页码 的点击事件回调，把slice后的data作为参数传入
            this.callback.call(this,data);
            // this.toTop();
        },
        stateOneUpdateDOM:function(){
           /* 状态1：
              上一页 1 2 3 4 5 6 ... N 下一页
           */
            this.clearPaginationBar();
            this.initPaginationBar();
            console.log('state 1 updateDOM');
        },
        stateTwoUpdateDOM:function(){
            console.log('state 2 updateDOM');
        },
        stateThreeUpdateDOM:function(){
            console.log('state 3 updateDOM');
        },
        /*
            更新分页条
            分页条共有3中状态

            状态1：
            上一页 1 2 3 4 5 6 ... N 下一页
            状态2：
            上一页 1 ... 3 4 5 6 7 ... N 下一页
            状态3（设N=62）：
            上一页 1 ... 57 58 59 60 61 62

            有如下关系，设X为页码，N为页数
            a、当  4 >= X 时，为状态1
            b、当  4 < X < N-4+1 时，为状态2
            c、当  N-4+1 <= X <= N 时，为状态3 

            下面要做的有两件事儿：
            1、根据不同页码，更新到对应的状态
            2、不同的状态中，计算页码，填入页码位置
        */
        updatePaginationBar:function(){
            var x = this.currentIndex;
            // 不同的页码范围所对应的3中状态
            var oldState = this.getStateByPageNum(this.oldCurrentIndex);
            var state = this.getStateByPageNum(this.currentIndex);

            if(state === 1){

                console.log("old state:"+oldState +" change to new state:"+state);
                if(state === oldState){
                    return;
                }

                this.stateOneUpdateDOM();


            }else if(state === 2){
                console.log("old state:"+oldState +" change to new state:"+state);
                if(state === oldState){
                    return;
                }
                this.stateTwoUpdateDOM();

            }else if(state === 3){
                console.log("old state:"+oldState +" change to new state:"+state);
                if(state === oldState){
                    return;
                }
                this.stateThreeUpdateDOM();
            }

            // if(x <= this.cut){
            //     // 如果本身就是状态1，那么直接返回
            //     if(this.getStateByPageNum(this.oldCurrentIndex) === 1){
            //         // return;
            //         console.log('I am still state 1');
            //     }else{

            //         console.log("old state:"+this.getStateByPageNum(this.oldCurrentIndex) +" change to new state:1");

            //         if(this.getStateByPageNum(x) === 2){
            //             this.stateTwoUpdateDOM();
            //         }else if(this.getStateByPageNum(x) === 3){
            //             this.stateThreeUpdateDOM();
            //         }


            //     }


            // }else if(x > this.cut && x < this.pageCount - this.cut + 1){

            //     if(this.getStateByPageNum(this.oldCurrentIndex) === 2){
            //         console.log('I am still state 2')
            //     }else{
            //         console.log("old state:"+this.getStateByPageNum(this.oldCurrentIndex) +" change to new state:2");
            //         if(this.getStateByPageNum(x) === 1){
            //             this.stateOneUpdateDOM();
            //         }else if(this.getStateByPageNum(x) === 3){
            //             this.stateThreeUpdateDOM();
            //         }
            //     }

            // }else if(x >= this.pageCount - this.cut + 1 && x <= this.pageCount){

            //     if(this.getStateByPageNum(this.oldCurrentIndex) === 3){
            //         // return;
            //         console.log('I am still state 3');
            //     }else{
            //         console.log("old state:"+this.getStateByPageNum(this.oldCurrentIndex) +" change to new state:3");
            //         if(this.getStateByPageNum(x) === 1){
            //             this.stateOneUpdateDOM();
            //         }else if(this.getStateByPageNum(x) === 2){
            //             this.stateTwoUpdateDOM();
            //         }
            //     }
            // }


        },
        /*
            根据生成的DOM，来绑定“上一页”|“下一页”|页码的相应的点击事件
            在this.start中调用
        */
        bindEvent:function(){
            var self = this;
           
            // 给“上一页” | "下一页" | 页码 的点击事件委托到容器上
            this.appendTo.onclick = function(e){
                e = e || event;
                var target = e.target || e.srcElement;

                if(target.className === "pagination-previous"){
                    // 上一页 点击事件
                    var index = self.currentIndex;
                    if(index !== 1){
                        self.currentIndex--;
                        self.current();
                        self.changeDOM(self.sliceData());
                    }

                }else if(target.className === "pagination-next"){
                    // 下一页 点击事件
                    var index = self.currentIndex;


                    if(index !== self.pageCount){
                        self.currentIndex++;
                        self.current();
                        self.changeDOM(self.sliceData());
                    }
                    
                }else if(target.className.indexOf("item") !== -1 ){
                    if(target.className.indexOf("current") !== -1){
                        return;
                    }
                    self.current(target.title);
                    self.changeDOM(self.sliceData());
                }

            }
        },
        /*
           组件的入口函数
        */
        start:function(){
            // 生成分页条的DOM结构
            // this.renderDOM();
            // 给“上一页” | "下一页" | 页码 绑定事件
            this.bindEvent();
        }
    }
    function changeURL(url){
        // reg = /\/view\/app\/\?m=(?:show|zk|scene)&id=(\d+)?/i,
        var reg = /\/view\/app\/\?m=(?:show|zk|scene)&id=(\d+)?(&ch=goodthing)?/i,
        // 第二中文章url 形如 http://c.diaox2.com/cms/diaodiao/articles/goodthing/893_893.html
            reg2 = /\/cms\/diaodiao\/articles\/(?:goodthing|firstpage|experience|weekend)\/\d+_(\d+)?\.html/i,
            toReplaceStr = "http://www.diaox2.com/article/$1.html",
            match;
        if(!url){
            return url;
        }
        match = url.match(reg);
        if(match && match.length){
             url = match[0].replace(reg,toReplaceStr);
        }else{
            match = url.match(reg2);
            if(match && match.length){
                 url = match[0].replace(reg2,toReplaceStr);
            }
        }
        return url;
    }
    $.ajax({
        url: "http://c.diaox2.com/cms/diaodiao/pcsite/goodthing_feed_list.json",
        dataType:'jsonp',
        jsonp:'cb',//这是发送到服务器的参数名。可不指定，jquery会默认把参数名变成callback
        jsonpCallback:"cb",//这是发送到服务器的参数值。这个名称必须与服务器传过来的 cb( josn ) 函数调用的函数名称一样
        success:function(result){
            serverData = result;
            var list = result.goodthing_feed_list,
                contentList = document.getElementById('content-list'),
                documentFrag = document.createDocumentFragment(),
                goodthing,url,match,li,i = 0,l = list.length;
                
            var countPerPage = 24;
            // 显示第一页（24条）的内容
            while(i < countPerPage){
                goodthing = list[i++];
                // 防止数组越界
                if(goodthing == null){
                    continue ;
                }
                url = changeURL(goodthing.url);
                li = document.createElement("li");
                li.innerHTML = '<dl><dt class="loading"><a href="'+url+'" class="img-container" target="_blank"><img src="'+goodthing.cover_image_url+'" width="390" height="254"></a></dt><dd><p><a href="'+goodthing.url+'" target="_blank">'+goodthing.title[0]+'</a></p><div class="icon-list clearfix"><a href="javascript:void(0);" target="_blank"><img class="icon-author" width="20" height="20" src="http://c.diaox2.com/cms/diaodiao/'+goodthing.author.pic+'"></a></div></dd></dl>';
                // li.innerHTML = '<dl><dt class="loading"><a href="'+url+'" class="img-container" target="_blank"><img src="'+goodthing.cover_image_url+'" width="390" height="254"></a></dt><dd><p><a href="'+goodthing.url+'" target="_blank">'+goodthing.title[0]+'</a></p><div class="icon-list clearfix"><img class="icon-clock" width="20" height="20" src="images/clock.png"><span class="date">一天前</span><a href="javascript:void(0);" target="_blank"><img class="icon-author" width="20" height="20" src="http://c.diaox2.com/cms/diaodiao/'+goodthing.author.pic+'"></a></div></dd></dl>';
                documentFrag.appendChild(li);
            }
            contentList.appendChild(documentFrag);
            // 分页
            var pager = new Pagination({
                countPerPage:countPerPage, // 每页显示多少条
                // totalCount:list.length, // 总共有多少条数据
                data:list,
                displayPageCount:7, // 分页条显示的分页标签的个数。默认是7个
                appendTo:document.getElementById('content-area'), // 分页条要插入的容器
                callback:function(data){
                    
                    var contentList = document.getElementById('content-list');
                    var list = contentList.children;
                    var l = list.length;
                    var i = 0;

                    function updateDOM(dom,paddingData){
                        var a = dom.querySelector('.img-container');
                        var href = changeURL(paddingData.url);
                        var dd = dom.getElementsByTagName('dd')[0];

                        // var ddA = dd.getElementsByTagName('p')[0].children[0];
                        var ddA = dd.querySelector("p").querySelector("a");
                        dom.style.display = "block";
                        a.href = href;
                        a.children[0].src = paddingData.cover_image_url;
                       
                        ddA.href = href;
                        ddA.innerHTML = paddingData.title[0];
                        dd.querySelector('.icon-author').src = "http://c.diaox2.com/cms/diaodiao/"+paddingData.author.pic;
                    }

                    // 如果分段数据长度等于每页的大小不需要删除多余的DOM
                    if(l === data.length){
                        for(;i<l;i++){
                           updateDOM(list[i],data[i]);
                        }
                    }else{
                        for(;i<l;i++){
                            var eachDOM = list[i];
                            if(i < data.length){
                                updateDOM(eachDOM,data[i]);
                            }else if(eachDOM){
                                // 隐藏超出数据的DOM
                                eachDOM.style.display = "none";
                            }
                        }
                    }
                }
            });
        }
    });
});