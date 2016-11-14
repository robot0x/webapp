$(function() {

    function changeURL(url) {
        // reg = /\/view\/app\/\?m=(?:show|zk|scene)&id=(\d+)?/i,
        var reg = /\/view\/app\/\?m=(?:show|zk|scene)&id=(\d+)?(&ch=goodthing)?/i,
            // 第二中文章url 形如 http://c.diaox2.com/cms/diaodiao/articles/goodthing/893_893.html
            reg2 = /\/cms\/diaodiao\/articles\/(?:goodthing|firstpage|experience|weekend)\/\d+_(\d+)?\.html/i,
            toReplaceStr = "http://www.diaox2.com/article/$1.html",
            match;
        if (!url) {
            return url;
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
        return url;
    }
    /*
        不处理title数组的最后一个元素
    */
    function handleTitle(titleArray, ctype) {
        var ret = '';
        if (titleArray) {
            var i = 0,
                l = titleArray.length;
            if (l === 1) {
                ret = titleArray[0];
            } else {
                if (ctype == 3) {
                    while (i < l - 1) {
                        ret += titleArray[i++];
                    }
                } else {
                    while (i < l) {
                        ret += titleArray[i++];
                    }
                }
            }
        }
        return ret;
    }
    /*
        banner运动
    */
    var BannerPlay = function(opts) {
        this.bannerArea = opts.container;
        this.distance = opts.width;
        this.bannerList = this.bannerArea.find('.banner-list');
        this.list = $.makeArray(this.bannerList.children());
        this.autoPlay = true;
        this.hoverPausePlay = true;
        this.direction = opts.direction || "leftToRight";
        if (typeof opts.autoPlay == 'boolean') {
            this.autoPlay = opts.autoPlay;
        }
        if (typeof opts.hoverPausePlay == 'boolean') {
            this.hoverPausePlay = opts.hoverPausePlay;
        }
        this.start();
    }

    function throttle(method, context, interval) {
        // 参数的长度
        var argLen = arguments.length;
        // 第一次是否延迟（true:延迟ms毫秒再执行，false:马上执行），默认值false
        var firstDelay = false,
            // 参数数组中的第一个元素
            arg,
            // 本函数（throttle）执行的次数
            count,
            startTime,
            endTime;
        //开始组装参数
        if (argLen === 0 || argLen > 3) {
            return;
        } else if (argLen === 1) {
            arg = arguments[0];
            method = arg.method;
            context = arg.context || this;
            interval = arg.interval;
            if (typeof firstDelay === "boolean") {
                firstDelay = arg.firstDelay;
            }
        } else if (argLen === 2) {
            interval = context;
            context = this;
        }
        // 参数组装完毕
        if (firstDelay) {
            // 如果第一次需要延迟的话，就不记录次数了，每次都延迟即可
            clearTimeout(context.__throttle_timer__);
            context.__throttle_timer__ = setTimeout(function() {
                method.call(context);
            }, interval);
        } else {
            // 如果第一次不需要延迟的话
            // 取出回调执行的次数
            count = context.__throttle_count__;
            // 如果count为undefined或0，说明回调一次也没有执行过
            if (!count) {
                // 初始化 __throttle_count__ 初始值为0
                count = context.__throttle_count__ = 0;
                // 记录第一次执行回调的开始时间
                context.startTime = +new Date();
                // 马上执行回调
                method.call(context);
            }
            // 如果count的次数大于或等于1的话，说明至少是第二次执行了
            if (count >= 1) {
                // 取出上一次执行的时间点
                startTime = context.startTime;
                // 记录本次执行的时间点
                endTime = +new Date();
                // 把本次执行的时间点记录到startEnd，为下一次执行时所用
                context.startTime = endTime;
                // 间隔时间大于指定的时间，才执行回调
                if (endTime - startTime > interval) {
                    method.call(context);
                }
            }
            // 执行次数加1
            context.__throttle_count__++;
        }
    }
    
    BannerPlay.prototype = {
            constructor: BannerPlay,
            bindEvent: function() {
                var self = this;
                var distance = self.distance;
                var bannerList = $(self.bannerList);
                // 下一张的点击事件
                self.bannerArea.on('click', '.next', function() {
                        throttle(function() {
                            var left = parseInt(bannerList.css("left"));
                            bannerList.animate({
                                left: left - distance
                            }, function() {
                                /*
                                把数组中第一个元素移动到最后一个位置。并更新到页面上
                                */
                                var removedDOM = self.list.shift();
                                self.list.push(removedDOM);
                                /*
                                    更新到页面上
                                */
                                $(removedDOM).remove(); // 删除数组中第一个
                                bannerList.append(removedDOM); // 把删除的第一个元素append到数组的尾部
                                bannerList.css('left', 0);
                            });
                        }, this, 700);
                });
                    // 上一张的点击事件
                self.bannerArea.on('click', '.prev', function() {

                    /*
                        “上一张”切换动画结束时，dom才更新到页面，这样用户会看到页面出现“白板”，DOM更新完
                        之后才正常。
                        为了防止这种情况发生，需要在用户点击“上一张”时，马上更新dom，让“白板”出现再用户看不到
                        的地方，然后动画运动到left为0处。
                        这是跟“下一张”的不同之处，由于多张图片由左向右一次排列，所以“下一张”出现的“白版”
                        用户永远看不到
                    */
                    throttle(function() {

                        var left = parseInt(bannerList.css("left"));
                        /*
                        把数组中第一个元素移动到最后一个位置。并更新到页面上
                        */
                        var removedDOM = self.list.pop();
                        self.list.unshift(removedDOM);
                        /*
                            更新到页面上
                        */
                        $(removedDOM).remove(); // 删除数组中最后一个
                        $(self.list[1]).before(removedDOM); // 把删除的最后一个元素插入到第一个元素位置
                        bannerList.css('left', -distance);
                        bannerList.animate({
                            left: 0
                        });

                    }, this, 700);

                });
                
                if (this.hoverPausePlay) {
                    // 整个banner区的hover事件
                    $('.banner-container,.prev,.next').hover(function() {
                        self.stopPlay(); // 鼠标移入，停止播放
                    }, function() {
                        self.play(); // 鼠标移出，开始播放
                    })
                }
            },
            start: function() {
                if (this.autoPlay) {
                    this.play();
                }
                this.bindEvent();
            },
            stopPlay: function() {
                clearInterval(this.timer);
            },
            play: function() {
                var self = this;
                self.timer = setInterval(function() {
                    // 从左到右
                    if (self.direction === "leftToRight") {
                        self.bannerArea.find('.next').trigger('click');
                    } else {
                        self.bannerArea.find('.prev').trigger('click');
                    }
                }, 2000)
            }
        }
        /*
          判断IE浏览器版本
          可以判断IE6 7 8 9
          不能判断IE10 11
        */
    function isIE(ver) {
        var b = document.createElement("b");
        b.innerHTML = "<!--[if IE " + ver + "]><i></i><![end if]-->"
        return b.getElementsByTagName('i').length === 1;
    }

    if (isIE(6) || isIE(7) || isIE(8) || isIE(9)) {

        document.getElementById('wrapper').removeChild(document.getElementById('banner-area'));

    } else {

        // dom ready 之后首先填充banner
        $.ajax({
            url: "http://api.diaox2.com/v4/meta",
            timeout: 20000,
            type: "POST",
            dataType: "json",
            contentType: 'application/json',
            data: JSON.stringify({
                'is_grey': false,
                'request_methods': ['feed_order_data']
            })
        }).done(function(data) {
            var cids = data.res.feed_order_data.carousel;
            $.ajax({
                url: "http://api.diaox2.com/v4/meta",
                timeout: 20000,
                type: "POST",
                dataType: "json",
                contentType: 'application/json',
                data: JSON.stringify({
                    "is_grey": false,
                    "request_methods": ["specified_meta_data"],
                    "request_data": {
                        "specified_meta_data": {
                            "cids": cids
                        }
                    }
                })
            }).done(function(result) {
                var dataArray = result.res.specified_meta_data.meta_infos;
                var bannerList = document.getElementById('banner-list');
                var stringBuffer = [];
                for (var i = 0, l = dataArray.length; i < l; i++) {
                    var paddingData = dataArray[i];
                    stringBuffer.push('<li data-index="', i, '"><a href="', changeURL(paddingData.url), '" target="_blank"><img src="', paddingData.banner, '" alt="" width="490" height="317"><div><p>', handleTitle(paddingData.title, paddingData.ctype), '</p></div></a></li>')
                }
                bannerList.innerHTML = stringBuffer.join('');

                // 计算banner宽度
                var bannerList = $(bannerList);
                var bannerListLi = bannerList.find('li');
                var marginOfBannerListLi = bannerListLi.css("margin-right");
                var liBoxWidth = bannerListLi.width() + parseInt(marginOfBannerListLi);
                bannerList.css('width', i * liBoxWidth);

                new BannerPlay({
                    container: $('.banner-area'),
                    width: liBoxWidth,
                    direction: "leftToRight",
                    autoPlay: true, //default ture
                    hoverPausePlay: true // default true
                });

            }).error(function(x, h, t) {
                console.log(x);
                console.log(h);
                console.log(t);
            })
        }).error(function(x, h, t) {
            console.log(x);
            console.log(h);
            console.log(t);
        })
    }


    // header动态效果start
    var wrapper = $('#wrapper');
    var topHeader = wrapper.find('.top-header');
    var topHeaderHeight = topHeader.height();
    var bottomHeader = wrapper.find('.header');
    var bannerArea = wrapper.find('.banner-area');
    window.onscroll = function() {
            var scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
            if (scrollTop >= topHeaderHeight) {
                bottomHeader.addClass('fixed');
                bannerArea.css("margin-top", 50);
            } else {
                bottomHeader.removeClass('fixed');
                bannerArea.css("margin-top", 0);
            }
        }
        // header动态效果end



    var Pagination = function(opts) {
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
        this.state = 1; // 初始状态是1
        // 点击 “上一页”|“下一页”|页码 时的回调函数
        this.callback = opts.callback;
        if (this.totalCount == null && this.data && this.data.length > 0) {
            this.totalCount = this.data.length;
        }
        // 总的页数
        this.pageCount = Math.ceil(this.totalCount / this.countPerPage);
        // 启动分页
        this.start();
    }

    function getCookie(key) {
        var arr, reg = new RegExp("(^| )" + key + "=([^;]*)(;|$)");
        if (arr = document.cookie.match(reg)) {
            return decodeURIComponent(arr[2]);
        } else {
            return null;
        }
    }

    Pagination.prototype = {
        constructor: Pagination,
        /*
            根据传入的数据，生成底部的分页条。主要是DOM操作。
            在this.start中调用，是this.start中第一个执行的函数。所有的函数都在这个函数执行后的基础上调用
        */
        renderDOM: function() {
            var paginationMain = document.getElementById('pagination-main');
            var frag = document.createDocumentFragment();
            var pageCount = this.pageCount;
            // 计算页数
            if (pageCount <= 1) {
                return;
            }
            // 预处理A标签
            // <a href="javascript:void(0);" onclick="return false;" class="pagination-previous">上一页</a>
            var PreProcessingATag = function(aTag) {
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
            if (pageCount <= this.displayPageCount) {

                // 上一页 1 2 3 4 5 6 下一页
                for (var i = 0; i < pageCount; i++) {
                    var a = PreProcessingATag(document.createElement("a"));
                    a.innerHTML = i + 1;
                    a.className = "item";
                    a.title = i + 1;
                    frag.appendChild(a);
                }


            } else {
                // 上一页 1 2 3 4 5 6 ... N 下一页
                for (var i = 0; i < this.displayPageCount - 1; i++) {
                    var a = PreProcessingATag(document.createElement("a"));
                    a.innerHTML = i + 1;
                    a.className = "item";
                    a.title = i + 1;
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
            // 给当前页码添加样式
            this.current();
        },
        // 根据页码获取页码对应的状态
        getStateByPageNum: function(index) {
            if (index <= this.cut) {
                return 1;
            } else if (index > this.cut && index < this.pageCount - this.cut + 1) {
                return 2;
            } else if (index >= this.pageCount - this.cut + 1 && index <= this.pageCount) {
                return 3;
            }
        },
        /*
            在this.current中调用。根据当前的页码，计算所属的状态，然后更新state
        */
        calcState: function(index, oldCurrentIndex) {
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
        current: function(index) {
            // 1 首先，取消掉以前的current状态
            var oldCurrentDOM = this.appendTo.querySelector('.current');
            if (oldCurrentDOM) {
                oldCurrentDOM.className = "item";
            }
            // 2 其次，给当前的页码添加current状态
            index = index || this.currentIndex;
            var currentDOM = this.appendTo.querySelector('.item[title="' + index + '"]');
            if (currentDOM) {
                currentDOM.className = currentDOM.className + " current";
            }
            // 3 最后，更新currentIndex字段
            this.currentIndex = index;
            this.calcState(index, oldCurrentDOM == null ? 1 : oldCurrentDOM.title);
        },
        /*
            根据索引切分数据
        */
        sliceData: function(index) {
            index = index || this.currentIndex;
            var start = (index - 1) * this.countPerPage;
            var end = index * this.countPerPage;
            return this.data.slice(start, end);
        },
        toTop: function() {
            var self = this;
            $('html,body').animate({
                scrollTop: self.appendTo.offsetTop - 80
            }, "slow");
        },
        /*
            根据切分后的数据执行回调
        */
        changeDOM: function(data) {
            console.log('changeDOM exec...');
            // 更新分页条状态
            this.updatePaginationBar();
            // 执行 “上一页”|“下一页”|页码 的点击事件回调，把slice后的data作为参数传入
            this.callback.call(this, data);
            this.toTop();
        },
        clearPaginationBar: function() {
            document.getElementById('pagination-main').innerHTML = '';
        },
        stateOneUpdateDOM: function() {
            /* 状态1：
               上一页 1 2 3 4 5 6 ... N 下一页
            */
            // 清空分页条init
            this.clearPaginationBar();
            // 重新渲染DOM
            this.renderDOM();
            console.log('state 1 updateDOM');
        },
        stateTwoUpdateDOM: function() {

            this.clearPaginationBar();


            var paginationMain = document.getElementById('pagination-main');
            var frag = document.createDocumentFragment();
            var pageCount = this.pageCount;
            // 计算页数
            if (pageCount <= 1) {
                return;
            }
            // 预处理A标签
            // <a href="javascript:void(0);" onclick="return false;" class="pagination-previous">上一页</a>
            var PreProcessingATag = function(aTag) {
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
            // 1
            var one = PreProcessingATag(document.createElement("a"));
            one.innerHTML = one.title = 1;
            one.className = "item";
            frag.appendChild(one);

            var more = one.cloneNode(false);
            more.innerHTML = '...';
            more.className = "more";

            frag.appendChild(more);

            for (var i = this.currentIndex - 2; i <= (+this.currentIndex) + 2; i++) {
                var item = one.cloneNode(false);
                item.innerHTML = item.title = i;
                frag.appendChild(item);
            }

            frag.appendChild(more.cloneNode(true));

            var lastPage = one.cloneNode(false);
            lastPage.innerHTML = lastPage.title = this.pageCount;
            lastPage.className = "item";
            frag.appendChild(lastPage);

            // 添加下一页到文档碎片中
            frag.appendChild(nextPage);
            paginationMain.appendChild(frag);
            // 给当前页码添加样式
            this.current();

        },
        stateThreeUpdateDOM: function() {
            /*
            状态3（设N=62）：
            上一页 1 ... 57 58 59 60 61 62
            */
            this.clearPaginationBar();

            var paginationMain = document.getElementById('pagination-main');
            var frag = document.createDocumentFragment();
            var pageCount = this.pageCount;
            // 计算页数
            if (pageCount <= 1) {
                return;
            }
            // 预处理A标签
            // <a href="javascript:void(0);" onclick="return false;" class="pagination-previous">上一页</a>
            var PreProcessingATag = function(aTag) {
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

            // 1
            var one = PreProcessingATag(document.createElement("a"));
            one.innerHTML = one.title = 1;
            one.className = "item";
            frag.appendChild(one);

            var more = one.cloneNode(false);
            more.innerHTML = '...';
            more.className = "more";
            frag.appendChild(more);

            for (var i = pageCount - this.displayPageCount + 2; i <= pageCount; i++) {
                var item = one.cloneNode(false);
                item.innerHTML = item.title = i;
                frag.appendChild(item);
            }

            // 添加下一页到文档碎片中
            frag.appendChild(nextPage);
            paginationMain.appendChild(frag);
            // 给当前页码添加样式
            this.current();

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
        updatePaginationBar: function() {
            var x = this.currentIndex;
            // 如果页数小于7，就不需要在3中状态之间切换了，直接显示完所有的即可
            if (this.pageCount <= this.displayPageCount) {
                return;
            }
            // 不同的页码范围所对应的3中状态
            var oldState = this.getStateByPageNum(this.oldCurrentIndex);
            var state = this.getStateByPageNum(this.currentIndex);

            if (state === 1) {

                console.log("old state:" + oldState + " change to new state:" + state);
                if (state === oldState) {
                    return;
                }

                this.stateOneUpdateDOM();

            } else if (state === 2) {

                console.log("old state:" + oldState + " change to new state:" + state);
                this.stateTwoUpdateDOM();

            } else if (state === 3) {
                console.log("old state:" + oldState + " change to new state:" + state);
                if (state === oldState) {
                    return;
                }
                this.stateThreeUpdateDOM();
            }

        },
        /*
            根据生成的DOM，来绑定“上一页”|“下一页”|页码的相应的点击事件
            在this.start中调用
        */
        bindEvent: function() {
            var self = this;

            // 给“上一页” | "下一页" | 页码 的点击事件委托到容器上
            this.appendTo.onclick = function(e) {
                e = e || event;
                var target = e.target || e.srcElement;

                if (target.className === "pagination-previous") {
                    // 上一页 点击事件
                    var index = self.currentIndex;
                    if (index != 1) {
                        self.currentIndex--;
                        self.current();
                        self.changeDOM(self.sliceData());
                    }
                } else if (target.className === "pagination-next") {
                    // 下一页 点击事件
                    var index = self.currentIndex;

                    if (index != self.pageCount) {
                        self.currentIndex++;
                        self.current();
                        self.changeDOM(self.sliceData());
                    }
                } else if (target.className.indexOf("item") !== -1) {
                    if (target.className.indexOf("current") !== -1) {
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
        start: function() {
            // 生成分页条的DOM结构
            this.renderDOM();
            // 给“上一页” | "下一页" | 页码 绑定事件
            this.bindEvent();
        }
    }
    $.ajax({
        url: "http://c.diaox2.com/cms/diaodiao/pcsite/goodthing_feed_list2.json",
        dataType: 'jsonp',
        jsonp: 'cb', //这是发送到服务器的参数名。可不指定，jquery会默认把参数名变成callback
        jsonpCallback: "cb", //这是发送到服务器的参数值。这个名称必须与服务器传过来的 cb( josn ) 函数调用的函数名称一样
        success: function(result) {
            var list = result.goodthing_feed_list,
                contentList = document.getElementById('content-list'),
                documentFrag = document.createDocumentFragment(),
                goodthing, url, match, li, i = 0,
                l = list.length;

            console.log(result);
            var countPerPage = 24;
            // 显示第一页（24条）的内容
            while (i < countPerPage) {
                goodthing = list[i++];
                // 防止数组越界
                if (goodthing == null) {
                    continue;
                }
                url = changeURL(goodthing.url);
                li = document.createElement("li");

                // 由于首页的图片其比例跟好物和专刊的不一样，所以需要用adjust函数调整到居中
                var imgAdjust = '';
                var size = 'width="390" height="254"';
                if (goodthing.ctype == 1) {
                    // 只有首页长文需要调整
                    imgAdjust = 'onload="adjust(this);"'
                        // 使用adjust函数，必须不设定img的尺寸
                    size = '';
                }
                li.innerHTML = '<a href="' + url + '" target="_blank"><dl><dt class="loading"><div class="img-container"><img ' + imgAdjust + ' src="' + goodthing.cover_image_url + '" ' + size + '></div></dt><dd><h3><p>' + handleTitle(goodthing.title, goodthing.ctype) + '</p></h3><div class="icon-list clearfix"><img class="icon-author" width="30" height="30" src="http://c.diaox2.com/cms/diaodiao/' + goodthing.author.pic + '"></div></dd></dl></a>';
                documentFrag.appendChild(li);
            }
            contentList.appendChild(documentFrag);
            // 分页
            var pager = new Pagination({
                countPerPage: countPerPage, // 每页显示多少条
                // totalCount:list.length, // 总共有多少条数据
                data: list,
                displayPageCount: 7, // 分页条显示的分页标签的个数。默认是7个
                appendTo: document.getElementById('content-area'), // 分页条要插入的容器
                callback: function(data) {

                    var contentList = document.getElementById('content-list');
                    var list = contentList.children;

                    // IE8下children取到节点包含command节点，所以需要筛选出所有的元素节点
                    if (!-[1, ]) {
                        var nodeList = list;
                        list = [];
                        for (var i = 0, l = nodeList.length; i < l; i++) {
                            if (nodeList[i].nodeType == 1) {
                                list.push(nodeList[i]);
                            }
                        }
                    }

                    var l = list.length;
                    var i = 0;

                    function updateDOM(dom, paddingData) {
                        var a = dom.getElementsByTagName('a')[0];
                        var imgContainer = a.querySelector('.img-container');
                        var img = imgContainer.getElementsByTagName('img')[0];
                        var titleP = a.querySelector('h3 p');
                        var iconAuthor = a.querySelector('.icon-author');

                        dom.style.display = "block";
                        a.href = changeURL(paddingData.url);

                        if (paddingData.ctype == 1) {
                            img.removeAttribute('width');
                            img.removeAttribute('height');
                            img.onload = (function() {
                                adjust(this);
                            });
                        } else if (img.onload) {
                            img.width = imgContainer.offsetWidth;
                            img.height = imgContainer.offsetHeight;
                            img.removeAttribute('onload');
                            img.removeAttribute('style');
                        }
                        img.src = paddingData.cover_image_url;

                        titleP.innerHTML = handleTitle(paddingData.title, paddingData.ctype);
                        iconAuthor.src = "http://c.diaox2.com/cms/diaodiao/" + paddingData.author.pic;
                    }

                    // 如果分段数据长度等于每页的大小不需要删除多余的DOM
                    if (l === data.length) {
                        for (; i < l; i++) {
                            updateDOM(list[i], data[i]);
                        }
                    } else {
                        for (; i < l; i++) {
                            var eachDOM = list[i];
                            if (i < data.length) {
                                updateDOM(eachDOM, data[i]);
                            } else if (eachDOM) {
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