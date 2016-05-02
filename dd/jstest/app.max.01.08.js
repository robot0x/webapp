;
(function(document, undefined) {
    /*****************获取点赞收藏数********************/
    function doupdate(cids) {
        //if IE89, then jsonp else json
        $.ajax({
            url: "http://api.diaox2.com/v1/stat/all",
            data: {
                data: JSON.stringify({
                    "aids": cids
                })
            },
            dataType: 'jsonp',
            type: "GET",
            jsonp: 'cb',
            jsonpCallback: "cb99",
            cache: true,
            timeout: 20000
        }).done(update_success).fail(function(x, t, e) {
            console.log("update failed, with error " + e);
        });
    }

    function update_success(data) {
        if (data.result != "SUCCESS") {
            console.log('update invoked but server fail.');
            return false;
        } else {
            var elements = $(".unknown"),
                i, j, l = elements.elements,
                ele, res;
            for (i in data.res) {
                for (j = 0; j < elements.length; j++) {
                    ele = $(elements[j]);
                    if (i == ele.attr('data-id')) {
                        ele.text("阅读 " + data.res[i].click);
                        ele.addClass('known').removeClass('unknown');
                    }
                }
            }
        }
        return true;
    }

    function get_stat(count) {
        var eles = $(".unknown"),
            count = count || 100,
            cids = [],
            i = 0,
            l = eles.length,
            ele, longId;
        while (i < l) {
            ele = $(eles[i++]);
            longId = ele.attr('data-id');
            if (isNaN(longId)) {
                continue;
            }
            cids.push(+longId);
        }
        (function(input) {
            (function() {
                // 走一次网络，获取所有文章的点赞收藏数，因为最多的才365篇文章
                // 所以没必要每次获取100篇文章，分4次获取
                var pack = input.slice(0, count);
                input = input.slice(count);
                if (pack.length > 0) {
                    doupdate(pack);
                } else {
                    return true;
                }
            })()
        })(cids)
        return true;
    }

    /*****************获取点赞收藏数end********************/

    // dom Ready
    document.addEventListener('DOMContentLoaded', function() {

        // DOM一Ready，马上打统计
        var uid = $.cookie('DDuid');
        if (uid == undefined) {
            uid = -1;
        }
        // 添加统计
        add_access({
            "action": "navigate",
            "value": "Tag",
            "user": uid
        }, "log"); //log this

        /*****************位置保存及提取start******************/
        /*
           保存页面位置信息 & 驱使页面跳到历史位置 的组件
         */
        function SavePoint() {
            // 当前页面的滚动距离
            this.scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
            // 当前页面所属标签
            this.tag = document.title;
        }
        SavePoint.prototype = {
                // 修复构造器指针
                constructor: SavePoint,
                // 判断类型
                type: function(arg) {
                    var t = typeof arg,
                        s;
                    if (t === 'object') {
                        if (arg === null) {
                            return 'null';
                        } else {
                            s = Object.prototype.toString.call(arg);
                            return s.slice(8, -1).toLowerCase();
                        }
                    } else {
                        return t;
                    }
                },
                /*
                   根据传入的key获取保存在本地的value
                   支持本地存储的浏览器使用本地存错，否则使用cookie
                 */
                getDate: function(key) {
                    key = key || this.tag;
                    key = encodeURIComponent(key);
                    var arr, reg = new RegExp("(^| )" + key + "=([^;]*)(;|$)");
                    if (arr = document.cookie.match(reg)) {
                        return JSON.parse(decodeURIComponent(arr[2]));
                    } else {
                        return null;
                    }
                },
                /*
                   根据key把data保存在本地
                   支持本地存错的浏览器使用本地存储，否则使用cookie
                 */
                setData: function(key, data, days) {
                    // 设置cookie过期事件,默认是1天
                    var expire = new Date();
                    days = days || 1;
                    expire.setTime(expire.getTime() + (+days) * 24 * 60 * 60 * 1000);
                    document.cookie = encodeURIComponent(key) + "=" + encodeURIComponent(JSON.stringify(data)) + ";expires=" + expire.toGMTString();
                },
                // 保存页面位置信息到本地
                save: function(key, data) {
                    // fix bug1：每次保存前都再次获取一下当前页面位置，保证存入本地的位置是 跳转之前的位置
                    var scrollTop = (document.body.scrollTop || document.documentElement.scrollTop) || this.scrollTop;
                    // 根据不同的参数数量组装局部变量
                    if (arguments.length === 0) {
                        key = this.tag;
                        data = {
                            scrollTop: scrollTop
                        }
                    }
                    if (arguments.length === 1) {
                        data = key;
                        key = this.tag;
                    }
                    if (this.type(data) !== 'object') {
                        data = {
                            scrollTop: scrollTop
                        }
                    }
                    // console.log(data);
                    // 保存到本地
                    this.setData(key, data);
                },
                get: function(key) {
                    return this.getDate(key);
                },
                loadPoint: function() {
                    // 取出本地存储中的历史页面历史位置
                    // 跳转到历史位置
                    this.toPoint(this.get() ? this.get().scrollTop : 0);
                },
                toPoint: function(scrollTop) {
                    document.body.scrollTop = scrollTop;
                    document.documentElement.scrollTop = scrollTop;
                    initialScroll();
                }
            }
            /*****************位置保存及提取start******************/

        /*
           新版可能跟老版的listview顺序不一致（前20条是一致的）
           原因：
           新版的listview的顺序构建与allarticles的顺序是一致的，即每个卡片的cid，
           对应的顺序就是allatticles的cid的顺序
           但是发送ajax之后，返回的数据的顺序并不是allartics的顺序，所以会导致卡片和标题不对应
           的问题，卡片顺序对应allartices（标题），卡片上的图片和链接对应的是
           返回过来的json的顺序（跟老版相同）
           老版没有这个问题的原因在于：不需要事先构造listview，返回过来什么顺序就按照顺序重新插入dom就行
           解决办法是：返回的json数据不要按照allarticles的顺序更新dom，而是要把萝卜放到属于它的坑里
         */
        var
        // 卡片容器
            content = document.querySelector('.content'),
            // 每次load的卡片数
            LOAD_COUNT = 20,
            // 乾坤袋，用以收集循环中创建的dom
            flag = document.createDocumentFragment();
        // 删除前20条数据，因为前20条在php层已经渲染好了
        allarticles = allarticles.slice(LOAD_COUNT);
        console.time('dom操作;');
        var sequence = -1;
        allarticles.forEach(function(item, index) {
            // 分段标志，一段由20个卡片组成。钉钉子。
            if (index % LOAD_COUNT == 0) {
                sequence++
            }
            var articlecard = document.createElement('div'),
                hr = document.createElement('hr');
            articlecard.dataset.sequence = sequence;
            // 把分段标志作为calssName。钉钉子
            articlecard.className = 'articlecard';
            // http://cdn.uehtml.com/201402/1392662524764_1140x0.gif
            articlecard.innerHTML = '<img class="articleimg" src="images/placehold.gif"><span class="articletitle">' + infos[item] + '</span><span class="articleread unknown" data-id="' + item + '">阅读 ......</span>';
            hr.className = 'articlesep';
            flag.appendChild(articlecard);
            flag.appendChild(hr);
        });
        // 把乾坤袋中的dom一次性地插入到页面中
        content.appendChild(flag);
        console.timeEnd('dom操作;');



        /*
           bug1：生成savePoint对象时，保存的scroolTop，是生成该对象一瞬间时页面的位置
           所以导致在页面跳转前保存的其实是生成该对象一瞬间的位置，并不是页面当前的实际位置
           已修复
         */
        var savePoint = new SavePoint();
        /*
           解决在页面还没有完全加载的情况下点击listView中的卡片，跳转到正文页之后，
           在返回的话，就返回不到listView页了，而是返回到listView上面的页面
         */
        function toPage(url) {
            if (!url) {
                return;
            }
            var a = document.createElement('a');
            a.href = url;
            document.body.appendChild(a);
            a.click();
        }
        // 卡片的点击事件委托到卡片容器上
        // DOM加载完毕之后，绑定事件
        content.addEventListener('click', function(e) {
            var card = e.target,
                href,
                eventSourceElement = card;
            if (card.className.indexOf('articlecard') === -1) {
                card = card.parentNode;
            }
            var target = card.dataset.href;
            var className = eventSourceElement.className;
            if (className == undefined || className.length == 0) {
                className = "NONE";
            }

            $(card).toggleClass('sel');
            add_access({
                    "target": target,
                    "clickon": eventSourceElement.tagName,
                    "class": className,
                    "action": 'click',
                    "value": "tagrelcard"
                },
                "log",
                function() {
                    $(self).toggleClass('sel');
                    toPage(target);
                },
                function() {
                    $(self).toggleClass('sel');
                    console.log("click call with target " + target + " failed with error ");
                    toPage(target);
                }
            );
        }, false)



        /*
           1、取出所有卡片
           2、NodeList转Array
           3、删除前20个卡片。因为前20个卡片已经在php层处理好了，前端不需要管。
         */
        get_stat(allarticles.length);
        // 当前滚动距离
        var oldScrollTop = getScrollTop();
        // 假设当前分段是 sequence1
        var oldSequence;
        // 取出所有卡片
        var gridArray = content.querySelectorAll('.articlecard');
        var gridArrayLength = gridArray.length;
        var hr = content.querySelector('.articlesep');
        // 计算一个格子的高度
        var gridHeight = gridArray[0].offsetHeight + hr.offsetHeight;
        /*
           a、可视区的真实宽度和高度
           document.documentElement.clientWidth 
           document.documentElement.clientHeight

           都去掉滚动条的大小（一般是17像素），比如我的dell笔记本在chrome下，
           正常的可视区（即无滚动条）大小是1366*663，假如水平和垂直方向都有滚动条的话，这两个值
           的大小为 1349 * 646
           b、
           document.documentElement.offsetWidth   无滚动条 1366  有滚动条 1349 同a
           document.documentElement.offsetHeight  根据实际的html元素被撑开的大小
           c、
           window.innerWidth / window.innerHeight 
           （1）有滚动条 a + 17
           （2）无滚动条 a 
         */
        // 可视区的高度
        // bug:可视区高度计算错误
        // var viewportHeight = document.body.clientHeight;
        var viewportHeight = document.documentElement.clientHeight
            //var viewportHeight = window.innerHeight;
            // 20个格子的高度
        var INITIAL_LOAD_GRIDS_HEIGHT = LOAD_COUNT * gridHeight;
        /*
           页面加载时跳转到历史位置之后执行次方法 
           在SavePoint对象的toPoint方法中调用
         */
        function initialScroll() {
            var scrollTop = getScrollTop(),
                index, grid, sequence, index;
            if (scrollTop + viewportHeight < gridHeight * LOAD_COUNT) {
                return;
            }
            index = Math.floor((scrollTop + viewportHeight) / gridHeight);
            if (index >= gridArrayLength) {
                index = gridArrayLength - 1;
            }
            grid = gridArray[index];
            if (grid == null) {
                return;
            }
            sequence = +grid.dataset.sequence;
            /*
               在分段的边界，比如上一段的最后一个卡片或下一段的第一个卡片，
               当点击这两站卡片某个时，只会加载下一段的内容，
               已经修复。
               修复方法为：不论如何，加载2段的内容（即40条），把上一段的内容也加载出来。

               bug：如果历史记录位于第二段(sequence = 0)的话，则不加载第二段，原因为 begin= -20,end = 20，
               正常应该是 0 - 20
               allarticles.slice(-20,20) 返回一个空数组
             */
            if (grid.dataset.loaded == undefined) {
                if (sequence != 0) {
                    doAjaxAndUpdateDOM(allarticles.slice((sequence - 1) * LOAD_COUNT, (sequence + 1) * LOAD_COUNT));
                } else {
                    doAjaxAndUpdateDOM(allarticles.slice(sequence * LOAD_COUNT, (sequence + 1) * LOAD_COUNT));
                }
            }
        }
        window.onscroll = function() {
            savePoint.save();
            try {
                sessionStorage.setItem('scrollTop', getScrollTop());
            } catch (e) {
                console.log("webview或浏览器不支持sessionStorage")
            }
        }
        setInterval(function() {

            var newScrollTop = getScrollTop(),
                sub;
            // 如果当前滚动距离 + 可视区高度 < 20个格子的距离。说明是在前20个卡片上滚动
            if (newScrollTop + viewportHeight < gridHeight * LOAD_COUNT) {
                return;
            }
            // 方向
            sub = newScrollTop - oldScrollTop;
            if (sub === 0) {
                return;
            }
            (function(sub) {
                var index, grid, newSequence, begin, end,
                    /*
                       如果是向上滚动，那么以视口底部作为进入视口的线
                       如果是向下滚动，那么以视口顶部作为进入视口的线
                       index 为 线压的那张卡片的索引
                     */
                    topLineIndex = Math.floor(newScrollTop / gridHeight),
                    bottomLineIndex = Math.floor((newScrollTop + viewportHeight) / gridHeight),
                    topCard, bottomCard, topLineCardSequence, bottomLineCardSequence;

                if (bottomLineIndex >= gridArrayLength) {
                    bottomLineIndex = gridArrayLength - 1;
                }

                topCard = gridArray[topLineIndex],
                    bottomCard = gridArray[bottomLineIndex],
                    topLineCardSequence = topCard.dataset.sequence,
                    bottomLineCardSequence = bottomCard.dataset.sequence;


                if (topLineIndex !== 0 && topLineCardSequence != bottomLineCardSequence) {
                    if (topCard.dataset.loaded == undefined) {
                        begin = topLineCardSequence * LOAD_COUNT; // 截取开始位置
                        end = (topLineCardSequence + 1) * LOAD_COUNT; // 截取结束位置
                        doAjaxAndUpdateDOM(allarticles.slice(begin, end));
                    }
                    if (bottomCard.dataset.loaded == undefined) {
                        begin = bottomLineCardSequence * LOAD_COUNT; // 截取开始位置
                        end = (bottomLineCardSequence + 1) * LOAD_COUNT; // 截取结束位置
                        doAjaxAndUpdateDOM(allarticles.slice(begin, end));
                    }
                }

                if (sub > 0) {
                    index = bottomLineIndex
                } else {
                    index = topLineIndex;
                }
                // 根据索引取出索引处的卡片
                grid = gridArray[index];
                if (grid == null) {
                    return;
                }
                newSequence = +grid.dataset.sequence;
                if (newSequence != oldSequence && grid.dataset.loaded == undefined) {
                    begin = newSequence * LOAD_COUNT; // 截取开始位置
                    end = (newSequence + 1) * LOAD_COUNT; // 截取结束位置
                    doAjaxAndUpdateDOM(allarticles.slice(begin, end));
                }
                oldSequence = newSequence;
            })(sub);
            oldScrollTop = newScrollTop;
        }, 60);

        /*
           在pc端一个页面快速滚动到页面底部（滚动距离为9200）大概执行42-50次scroll事件 
           在webview中，同样的距离，快速滚到到页面底部，执行的scroll事件次数为8-9次，
           丢失了很多次scroll事件。。
           所以，在webview中，scroll事件丢失会导致很多片段加载不出来。。
           使用 定时器来模拟scroll事件，每 0.1 秒 检查一下滚动距离，如果滚动的距离发生了变化
           且钉子进入可视区，就发送ajax来更新片段
         */
        function doAjaxAndUpdateDOM(cids) {
            $.ajax({
                url: "http://api.diaox2.com/v2/meta",
                cache: true,
                timeout: 20000,
                type: "POST",
                dataType: "json",
                contentType: 'application/json',
                data: JSON.stringify({
                    "request_methods": ["specified_meta_data"],
                    "request_data": {
                        "specified_meta_data": {
                            "cids": cids
                        }
                    }
                })
            }).done(function(data) {
                data.res.specified_meta_data.meta_infos.forEach(function(everyMeta) {
                    var imgUrl = everyMeta.thumb_image_url,
                        url = everyMeta.url,
                        card = content.querySelector('span[data-id="' + everyMeta.cid + '"]').parentNode;
                    // 组装图片路径
                    if (imgUrl.indexOf('http') === -1) {
                        imgUrl = "http://a.diaox2.com/cms/sites/default/files/" + imgUrl;
                    }
                    if (url.indexOf('http') === -1) {
                        url = "http://c.diaox2.com" + url;
                    }
                    card.dataset.href = url;
                    card.querySelector('.articleimg').src = imgUrl;
                    card.dataset.loaded = true;
                    console.log('ajax success...');
                })
            }).fail(function(e) {
                // error 回调
                console.log('get meta error!!!');
            })
        }

        function getScrollTop() {
            return document.body.scrollTop || document.documentElement.scrollTop;
        }
        savePoint.loadPoint();
    }, false)
})(document);