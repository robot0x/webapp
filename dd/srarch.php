<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8">      
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, user-scalable=yes, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0">
        <meta name="apple-mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-status-bar-style" content="black">
        <meta name="format-detection" content="telephone=no">
        <title>搜索结果页</title>
        <link rel="icon" href="http://a.diaox2.com/cms/diaodiao/assets/favicon.ico" type="image/x-icon" />
        <link rel="stylesheet" type="text/css" href="gift.css" />
        <script>
        <?php echo 'var g_method = "' . $_SERVER['REQUEST_METHOD'] . '";'; ?>
        <?php echo 'var g_post = ' . json_encode(file_get_contents("php://input"), JSON_HEX_APOS) . ';'; ?>
        <?php echo 'var g_get = \'' . json_encode($_GET, JSON_HEX_APOS) . '\';'; ?>
        </script>
        <script src="http://apps.bdimg.com/libs/jquery/2.1.1/jquery.min.js"></script>
        <script src="http://c.diaox2.com/cms/diaodiao/assets/jquery.cookie.min.js"></script>
        <script>
        (function(){var t=[].indexOf||function(t){for(var e=0,n=this.length;e<n;e++){if(e in this&&this[e]===t)return e}return-1},e=[].slice;(function(t,e){if(typeof define==="function"&&define.amd){return define("waypoints",["jquery"],function(n){return e(n,t)})}else{return e(t.jQuery,t)}})(window,function(n,r){var i,o,l,s,f,u,c,a,h,d,p,y,v,w,g,m;i=n(r);a=t.call(r,"ontouchstart")>=0;s={horizontal:{},vertical:{}};f=1;c={};u="waypoints-context-id";p="resize.waypoints";y="scroll.waypoints";v=1;w="waypoints-waypoint-ids";g="waypoint";m="waypoints";o=function(){function t(t){var e=this;this.$element=t;this.element=t[0];this.didResize=false;this.didScroll=false;this.id="context"+f++;this.oldScroll={x:t.scrollLeft(),y:t.scrollTop()};this.waypoints={horizontal:{},vertical:{}};this.element[u]=this.id;c[this.id]=this;t.bind(y,function(){var t;if(!(e.didScroll||a)){e.didScroll=true;t=function(){e.doScroll();return e.didScroll=false};return r.setTimeout(t,n[m].settings.scrollThrottle)}});t.bind(p,function(){var t;if(!e.didResize){e.didResize=true;t=function(){n[m]("refresh");return e.didResize=false};return r.setTimeout(t,n[m].settings.resizeThrottle)}})}t.prototype.doScroll=function(){var t,e=this;t={horizontal:{newScroll:this.$element.scrollLeft(),oldScroll:this.oldScroll.x,forward:"right",backward:"left"},vertical:{newScroll:this.$element.scrollTop(),oldScroll:this.oldScroll.y,forward:"down",backward:"up"}};if(a&&(!t.vertical.oldScroll||!t.vertical.newScroll)){n[m]("refresh")}n.each(t,function(t,r){var i,o,l;l=[];o=r.newScroll>r.oldScroll;i=o?r.forward:r.backward;n.each(e.waypoints[t],function(t,e){var n,i;if(r.oldScroll<(n=e.offset)&&n<=r.newScroll){return l.push(e)}else if(r.newScroll<(i=e.offset)&&i<=r.oldScroll){return l.push(e)}});l.sort(function(t,e){return t.offset-e.offset});if(!o){l.reverse()}return n.each(l,function(t,e){if(e.options.continuous||t===l.length-1){return e.trigger([i])}})});return this.oldScroll={x:t.horizontal.newScroll,y:t.vertical.newScroll}};t.prototype.refresh=function(){var t,e,r,i=this;r=n.isWindow(this.element);e=this.$element.offset();this.doScroll();t={horizontal:{contextOffset:r?0:e.left,contextScroll:r?0:this.oldScroll.x,contextDimension:this.$element.width(),oldScroll:this.oldScroll.x,forward:"right",backward:"left",offsetProp:"left"},vertical:{contextOffset:r?0:e.top,contextScroll:r?0:this.oldScroll.y,contextDimension:r?n[m]("viewportHeight"):this.$element.height(),oldScroll:this.oldScroll.y,forward:"down",backward:"up",offsetProp:"top"}};return n.each(t,function(t,e){return n.each(i.waypoints[t],function(t,r){var i,o,l,s,f;i=r.options.offset;l=r.offset;o=n.isWindow(r.element)?0:r.$element.offset()[e.offsetProp];if(n.isFunction(i)){i=i.apply(r.element)}else if(typeof i==="string"){i=parseFloat(i);if(r.options.offset.indexOf("%")>-1){i=Math.ceil(e.contextDimension*i/100)}}r.offset=o-e.contextOffset+e.contextScroll-i;if(r.options.onlyOnScroll&&l!=null||!r.enabled){return}if(l!==null&&l<(s=e.oldScroll)&&s<=r.offset){return r.trigger([e.backward])}else if(l!==null&&l>(f=e.oldScroll)&&f>=r.offset){return r.trigger([e.forward])}else if(l===null&&e.oldScroll>=r.offset){return r.trigger([e.forward])}})})};t.prototype.checkEmpty=function(){if(n.isEmptyObject(this.waypoints.horizontal)&&n.isEmptyObject(this.waypoints.vertical)){this.$element.unbind([p,y].join(" "));return delete c[this.id]}};return t}();l=function(){function t(t,e,r){var i,o;if(r.offset==="bottom-in-view"){r.offset=function(){var t;t=n[m]("viewportHeight");if(!n.isWindow(e.element)){t=e.$element.height()}return t-n(this).outerHeight()}}this.$element=t;this.element=t[0];this.axis=r.horizontal?"horizontal":"vertical";this.callback=r.handler;this.context=e;this.enabled=r.enabled;this.id="waypoints"+v++;this.offset=null;this.options=r;e.waypoints[this.axis][this.id]=this;s[this.axis][this.id]=this;i=(o=this.element[w])!=null?o:[];i.push(this.id);this.element[w]=i}t.prototype.trigger=function(t){if(!this.enabled){return}if(this.callback!=null){this.callback.apply(this.element,t)}if(this.options.triggerOnce){return this.destroy()}};t.prototype.disable=function(){return this.enabled=false};t.prototype.enable=function(){this.context.refresh();return this.enabled=true};t.prototype.destroy=function(){delete s[this.axis][this.id];delete this.context.waypoints[this.axis][this.id];return this.context.checkEmpty()};t.getWaypointsByElement=function(t){var e,r;r=t[w];if(!r){return[]}e=n.extend({},s.horizontal,s.vertical);return n.map(r,function(t){return e[t]})};return t}();d={init:function(t,e){var r;e=n.extend({},n.fn[g].defaults,e);if((r=e.handler)==null){e.handler=t}this.each(function(){var t,r,i,s;t=n(this);i=(s=e.context)!=null?s:n.fn[g].defaults.context;if(!n.isWindow(i)){i=t.closest(i)}i=n(i);r=c[i[0][u]];if(!r){r=new o(i)}return new l(t,r,e)});n[m]("refresh");return this},disable:function(){return d._invoke.call(this,"disable")},enable:function(){return d._invoke.call(this,"enable")},destroy:function(){return d._invoke.call(this,"destroy")},prev:function(t,e){return d._traverse.call(this,t,e,function(t,e,n){if(e>0){return t.push(n[e-1])}})},next:function(t,e){return d._traverse.call(this,t,e,function(t,e,n){if(e<n.length-1){return t.push(n[e+1])}})},_traverse:function(t,e,i){var o,l;if(t==null){t="vertical"}if(e==null){e=r}l=h.aggregate(e);o=[];this.each(function(){var e;e=n.inArray(this,l[t]);return i(o,e,l[t])});return this.pushStack(o)},_invoke:function(t){this.each(function(){var e;e=l.getWaypointsByElement(this);return n.each(e,function(e,n){n[t]();return true})});return this}};n.fn[g]=function(){var t,r;r=arguments[0],t=2<=arguments.length?e.call(arguments,1):[];if(d[r]){return d[r].apply(this,t)}else if(n.isFunction(r)){return d.init.apply(this,arguments)}else if(n.isPlainObject(r)){return d.init.apply(this,[null,r])}else if(!r){return n.error("jQuery Waypoints needs a callback function or handler option.")}else{return n.error("The "+r+" method does not exist in jQuery Waypoints.")}};n.fn[g].defaults={context:r,continuous:true,enabled:true,horizontal:false,offset:0,triggerOnce:false};h={refresh:function(){return n.each(c,function(t,e){return e.refresh()})},viewportHeight:function(){var t;return(t=r.innerHeight)!=null?t:i.height()},aggregate:function(t){var e,r,i;e=s;if(t){e=(i=c[n(t)[0][u]])!=null?i.waypoints:void 0}if(!e){return[]}r={horizontal:[],vertical:[]};n.each(r,function(t,i){n.each(e[t],function(t,e){return i.push(e)});i.sort(function(t,e){return t.offset-e.offset});r[t]=n.map(i,function(t){return t.element});return r[t]=n.unique(r[t])});return r},above:function(t){if(t==null){t=r}return h._filter(t,"vertical",function(t,e){return e.offset<=t.oldScroll.y})},below:function(t){if(t==null){t=r}return h._filter(t,"vertical",function(t,e){return e.offset>t.oldScroll.y})},left:function(t){if(t==null){t=r}return h._filter(t,"horizontal",function(t,e){return e.offset<=t.oldScroll.x})},right:function(t){if(t==null){t=r}return h._filter(t,"horizontal",function(t,e){return e.offset>t.oldScroll.x})},enable:function(){return h._invoke("enable")},disable:function(){return h._invoke("disable")},destroy:function(){return h._invoke("destroy")},extendFn:function(t,e){return d[t]=e},_invoke:function(t){var e;e=n.extend({},s.vertical,s.horizontal);return n.each(e,function(e,n){n[t]();return true})},_filter:function(t,e,r){var i,o;i=c[n(t)[0][u]];if(!i){return[]}o=[];n.each(i.waypoints[e],function(t,e){if(r(i,e)){return o.push(e)}});o.sort(function(t,e){return t.offset-e.offset});return n.map(o,function(t){return t.element})}};n[m]=function(){var t,n;n=arguments[0],t=2<=arguments.length?e.call(arguments,1):[];if(h[n]){return h[n].apply(null,t)}else{return h.aggregate.call(null,n)}};n[m].settings={resizeThrottle:100,scrollThrottle:30};return i.on("load.waypoints",function(){return n[m]("refresh")})})}).call(this);
        </script>
    </head>
    <body>
    <article>
        <section id="loading" style="display:block">
            <div id="circleG">
                <div id="circleG_1" class="circleG">
                </div>
                <div id="circleG_2" class="circleG">
                </div>
                <div id="circleG_3" class="circleG">
                </div>
            </div>
        </section>
        <section id="result" style="display:none;">
        <div id="searchresult">
            <div id="sr_last"></div>
        </div>
        <!--search result goes here, <== mock -->

    <div id="gift" style="display:none;">
        <hr class="articlesep" /><div id="menupadding" style="display:block"></div>
        <div class="botmenu" id="uniqmetnu">
            <div class="quater nosel" data-id="area">场景<img src="cut.png" /></div>
            <div class="quater nosel" data-id="people">关系<img src="cut.png" /></div>
            <div class="quater nosel" data-id="personality">性格<img src="cut.png" /></div>
            <div class="quater nosel" data-id="price">价格</div>
        </div>

        <div id="botarea">
            <div id="area" style="display:none;">
                <div id="area_inner" style="display:none;">
                    <div class="headbar">
                        <span onclick="clearall();">清除所有条件</span>
                        <i onclick="dropdown();">&nbsp;▼&nbsp;</i>
                    </div>
                    <div class="filters" data-id="1">
                    <!--flex要求4.4android以及7.1的safari-->
                        <div class="quater" data-id="七夕情人节"><div><div><span>情人节</span></div></div></div>
                        <div class="quater" data-id="告白"><div><div><span>告白</span></div></div></div>
                        <div class="quater" data-id="生日"><div><div><span>生日</span></div></div></div>
                        <div class="quater" data-id="纪念日"><div><div><span>纪念日</span></div></div></div>
                        <!--<td class="selected"><div style="display: flex; justify-content: center; align-items: center;">父亲节</div></td>-->
                        <div class="quater" data-id="新婚"><div><div><span>新婚</span></div></div></div>
                        <div class="quater" data-id="乔迁"><div><div><span>乔迁</span></div></div></div>
                        <div class="quater" data-id="感恩节"><div><div><span>感恩节</span></div></div></div>
                        <div class="quater" data-id="圣诞节平安夜"><div><div><span>圣诞节</span></div></div></div>
                    </div>
                    <div class="abovebar"></div>
                </div>
                <div class="botmenu">
                    <div class="quater yessel" data-id="area">场景</div>
                    <div class="quater nosel lcorner" data-id="people">关系<img src="cut.png" /></div>
                    <div class="quater nosel" data-id="personality">性格<img src="cut.png" /></div>
                    <div class="quater nosel" data-id="price">价格</div>
                </div>
            </div>

            <div id="people" style="display:none;">
                <div id="people_inner" style="display:block;">
                    <div class="headbar">
                        <span onclick="clearall();">清除所有条件</span>
                        <i onclick="dropdown();">&nbsp;▼&nbsp;</i>
                    </div>
                    <div class="clearfix"></div>
                    <div class="filters" data-id="2">
                        <div class="quater" data-id="爸爸"><div><div><span>爸爸</span></div></div></div>
                        <div class="quater" data-id="妈妈"><div><div><span>妈妈</span></div></div></div>
                        <div class="quater" data-id="老公男友"><div><div><span>老公男友</span></div></div></div>
                        <div class="quater" data-id="老婆女友"><div><div><span>老婆女友</span></div></div></div>
                        <div class="quater" data-id="基友"><div><div><span>基友</span></div></div></div>
                        <div class="quater" data-id="闺蜜"><div><div><span>闺蜜</span></div></div></div>
                        <div class="quater" data-id="朋友同事"><div><div><span>朋友同事</span></div></div></div>
                        <div class="quater" data-id="老板"><div><div><span>老板</span></div></div></div>
                    </div>
                    <div class="abovebar"></div>
                </div>
                <div class="botmenu">
                    <div class="quater nosel rcorner" data-id="area">场景</div>
                    <div class="quater yessel" data-id="people">关系</div>
                    <div class="quater nosel lcorner" data-id="personality">性格<img src="cut.png" /></div>
                    <div class="quater nosel" data-id="price">价格</div>
                </div>
            </div>

            <div id="personality" style="display:none;">
                <div id="personality_inner" style="display:block;">
                    <div class="headbar">
                        <span onclick="clearall();">清除所有条件</span>
                        <i onclick="dropdown();">&nbsp;▼&nbsp;</i>
                    </div>
                    <div class="clearfix"></div>
                    <div class="filters" data-id="3">
                        <div class="quater" data-id="二次元"><div><div><span>二次元</span></div></div></div>
                        <div class="quater" data-id="小清新"><div><div><span>小清新</span></div></div></div>
                        <div class="quater" data-id="萌萌哒"><div><div><span>萌萌哒</span></div></div></div>
                        <div class="quater" data-id="Geek"><div><div><span>Geek</span></div></div></div>
                        <div class="quater" data-id="潮人"><div><div><span>潮人</span></div></div></div>
                        <div class="quater" data-id="文艺范"><div><div><span>文艺范</span></div></div></div>
                        <div class="quater" data-id="搞怪"><div><div><span>搞怪</span></div></div></div>
                        <div class="quater" data-id="成熟"><div><div><span>成熟</span></div></div></div>
                    </div>
                    <div class="abovebar"></div>
                </div>
                <div class="botmenu">
                    <div class="quater nosel" data-id="area">场景<img src="cut.png" /></div>
                    <div class="quater nosel rcorner" data-id="people">关系</div>
                    <div class="quater yessel" data-id="personality">性格</div>
                    <div class="quater nosel lcorner" data-id="price">价格</div>
                </div>
            </div>

            <div id="price" style="display:none;">
                <div id="price_inner" style="display:block;">
                    <div class="headbar">
                        <span onclick="clearall();">清除所有条件</span>
                        <i onclick="dropdown();">&nbsp;▼&nbsp;</i>
                    </div>
                    <div class="clearfix"></div>
                    <div id="price_before"></div>
                    <div class="filters" id="needheight" data-id="4">
                        <div class="quater" data-id="1"><div><div><span>0-200</span></div></div></div>
                        <div class="quater" data-id="2"><div><div><span>200-500</span></div></div></div>
                        <div class="quater" data-id="4"><div><div><span>500-800</span></div></div></div>
                        <div class="quater" data-id="8"><div><div><span>800+</span></div></div></div>
                    </div>
                    <div id="price_after"></div>
                    <div class="abovebar"></div>
                </div>
                <div class="botmenu">
                    <div class="quater nosel" data-id="area">场景<img src="cut.png" /></div>
                    <div class="quater nosel" data-id="people">关系<img src="cut.png" /></div>
                    <div class="quater nosel rcorner" data-id="personality">性格</div>
                    <div class="quater yessel" data-id="price">价格</div>
                </div>

            </div>
        </div>
    </div>
        </section>

        <section id="noresult" style="display:none;">
        <!--no result search goes here-->
        <img src="http://c.diaox2.com/cms/diaodiao/assets/searchempty.png" />
        <p>找不到<font color="#e60012">呵呵哒</font></p>
        <p>换个关键词试试</p>
        </section>

        <section id="fail" style="display:none;">
        <!--fail search goes here-->
        <img src="http://c.diaox2.com/cms/diaodiao/assets/searchempty.png" />
        <p>网络不佳，暂时无法获取结果</p>
        <img id="refimg" src="http://c.diaox2.com/cms/diaodiao/assets/searchrefresh.png" onclick="location.reload();"/>
        </section>
    </article>
    </body>
        <script>
        var g_request;  //search request string
        var g_obj;  //search request obj
        var g_data; //search result
        function connectWebViewJavascriptBridge(callback) {
            if (window.WebViewJavascriptBridge) {
                callback(WebViewJavascriptBridge);
            } else {
                document.addEventListener('WebViewJavascriptBridgeReady', function(ev) {
                    callback(ev.bridge);
                    if(! window.WebViewJavascriptBridge && ev.bridge) 
                        window.WebViewJavascriptBridge = ev.bridge; //rare case happen?
                }, false);
            }
        }
        //注册点击搜索结果后app需要调用的接口
        function tellapp() {
            WebViewJavascriptBridge.registerHandler("dd_get_metas", function(data, responseCallback) {
                var result = dd_get_metas(data);
                if(responseCallback)    //typeof responseCallback === "function"
                    responseCallback(result);
            });
            return true;
        }
        function bridgeInitCallback(bridge) {
            //要么是当时执行成功，要么是WebViewJavascriptBridgeReady设置的event callback里执行
            //事件：WebViewJavascriptBridgeReady
            try {
                bridge.init(function(data, responseCallback) {
                    //这个函数是默认的handler，callHandler和registerHandler以外的事件发生了
                    console.log('Default handler called?');
                    console.log(data);
                    if(responseCallback)    //typeof responseCallback === "function"
                        responseCallback(data);
                });
                //bridge.init(function(message, def_handler) {return def_handler(message);});
            } catch(e){
                console.log('WebViewJavascriptBridge init fail');
                console.log(e);
            }
            tellapp();  //注册
            return true;
        }
        //Raw invoke
        connectWebViewJavascriptBridge(bridgeInitCallback);
        function iOS() {
            return navigator.userAgent.match(/iphone|ipod|ios|ipad/i)
        }
        //log
        function aas(data) {
            console.log("add_access succeeded!");
        }
        function aaf(x,t,e) {
            console.log("add_access failed, with error " + errorThrown);
        }
        function add_access(tag, option, tags) {
            var postdict = {"method": "log", "info": g_obj, "action": "switch_tag", "value": tag, "option": option, "all": tags};
            var postdata = JSON.stringify(postdict);
            jQuery.support.cors = true;
            $.ajax
            ({
                type: "POST",
                contentType: "application/json",
                data: postdata,
                dataType: "json",
                url: "http://api.diaox2.com/v1/contvote",
                success: aas,
                timeout: 5000,
                error: aaf
            });
            console.log("log => " + postdata);
        }
        function phtitle(text) {
            //外站结果可能有空字符
            return text.replace(/\s+/g, ' ')
                .replace(/<<<</g, '<font color="#e60012">')
                .replace(/>>>>/g, '</font>');
        }
        function phtag(data) {
            //[["须后水", 1], ["proraso", 0], ["男士", 0], ["意大利", 0]]
            var ret = ""
            if(data == undefined || data.length == 0)
                return ret;
            for(var i = 0; i < data.length; i++) {
                if(data[i][1] == 1)
                    ret += '<font color="#e60012">' + data[i][0] + '</font> ';
                else
                    ret += data[i][0] + ' ';
            }
            return ret;
        }
        function buildlevel1(data, index) {
            //with thumb and highlight
            var url;
            if(data.url.match(/^https?:/i))
                url = data.url;
            else
                url = "http://c.diaox2.com" + data.url; // /view/app/?m=
            var html = '<a href="' + url + '">';
            html += '<div class="articlecard" '; 
            html += 'data-index="' + index + '" data-cid="' + data.cid + '" data-ctype="' + data.ctype + '">';
            html += '<div class="leftdiv">';
            if(data.thumb_image_url.match(/^https?:\/\//i)) {
                html += '<img class="articleimg" src="' + data.thumb_image_url + '" />';
            } else {
                html += '<img class="articleimg" src="http://a.diaox2.com/cms/sites/default/files/' + data.thumb_image_url + '" />';
            }
            html += '</div><div class="rightdiv">';
            var title = phtitle(data.rendered_title);
            html += '<p class="articletitle">' + title + '</p>';
            var tag = phtag(data.rendered_keywords);
            html += '<p class="articletag">' + tag + '</p>';

            if((data.cid & 0xffffffff) >= 1000000)
                html += '<span class="articleread"><img src="http://c.diaox2.com/cms/diaodiao/assets/links.png" />全网结果</span>';
            else if (data.price != undefined && !data.price.match(/N\/A/i))
                html += '<span class="articleread">' + data.price + '</span>';
                //注意也可以依赖ctype判断，万一首页填写了价格呢？
            if((data.cid & 0xffffffff) >= 1000000)
                html += '<div class="articlesrc"><img src="http://c.diaox2.com/cms/diaodiao/' + data.author.pic + '" /><span>' + data.author.name + '</span></div>';
            else
                if(data.is_external == true)
                    //内部引用外部
                    html += '<div class="articlesrc"><img src="http://c.diaox2.com/cms/diaodiao/' + data.author.pic + '" /><span>' + data.author.name + '</span></div>';
                else
                    html += '<div class="articlesrc"><img src="http://c.diaox2.com/cms/diaodiao/assets/favicon.ico" /><span>' + data.author.name + '</span></div>';
            //NOTICE：价格/全网结果  <----> 作者名， 总长度未知，可能重叠
            html += "</div></div></a>";
            return html;
        }
        function dd_get_metas() {
            //return $.extend({}, g_data, {"order_list_start_pos":0, "order_list":[1234,1235,1236]});
            return JSON.stringify(g_data);
        }
        var g_gift;
        function gs(data) {
            g_gift = data;  //全局

            //点亮filters, load失败才用query自带的，这也没办法
            //if(!load()) {
                var tags = g_data.special_query.gift_tag_query_info.tags;
                var filters = $(".filters > .quater[data-id]");
                for(var i = 0; i < tags.length; i++) {
                    for(var j=0; j < filters.length; j++) {
                        if($(filters[j]).attr('data-id') == tags[i])
                            $(filters[j]).addClass('selected'); //safe, only 1 class
                    }
                }
            //}
            //根据命中的tags，拼出结果列表，这里不用保存
            $("#gift").fadeIn("fast");
            switchview(1);
            filter_result();
        }
        function ss(data) {
            var aid;
            console.log(data);
            document.title = '"' + g_obj.query + '" 的搜索结果';
            g_data = data;
            //gift流程
            if(data.special_query && data.special_query.query_type == "gift") {
                //先获取数据，成功后进入特型展示
                jQuery.support.cors = true;
                $.ajax({
                    type: "GET",
                    contentType: 'application/json',
                    dataType: "json",
                    url: "/view/gift_meta.json",
                    //url: "http://t.diaox2.com/view/gift_meta.0813.json",
                    success: gs,
                    error: sf(1),
                    timeout: 8000
                });
                switchview(1);
                env_for_gift(); //初始化各种东西
                switchview(0);
                return true;
            }

            //普通流程
            if(data['count'] == 0 || (data.aids.length && data.aids.length == 0)) {
                $('#noresult p')[0].innerHTML = '找不到<font color="#e60012">"' + g_obj.query + '"</font>'
                switchview(2);
                return true;
            }
            var i = data.aids.length ? data.aids.length : data.count;
            var html="";    //WARNING: MUST = "", otherwise html = undefined<a href=.... BUG!
            for(var j = 0; j < i - 1; j++) {
                aid = data.aids[j];
                html += buildlevel1(data.meta_infos[aid], j);
                html += '<hr class="articlesep">';
            }
            aid = data['aids'][j];
            html += buildlevel1(data['meta_infos'][aid], j);
            $('#searchresult').empty();
            $(html).appendTo("#searchresult");    //single append
            switchview(1);
            return true;
        }
        var sf = function (flag){
            return function (x, t, e) {
                console.log(e);
                document.title = flag?"没有找到礼物":"搜索失败";
                switchview(3);  //switch to "fail" page;
                return true;
            }
        };
        function s(word) {
            var target = "http://s.diaox2.com/ddsearch/q";
            //target = 'http://121.42.141.74:9998/q'; //gift
            switchview(0);  //show loading;
            g_data = [];
            //var loc = '{"query":"test","user_data": {"uid":100,"did":"XZXX-134134-SDDSD","from":"hot"}}';
            if(word != undefined) {
                g_obj = $.extend({}, JSON.parse(g_request), {"query": word});
                g_request = JSON.stringify(g_obj);
            }
            jQuery.support.cors = true;
            $.ajax({
                type: "POST",
                contentType: 'application/json',
                dataType: "json",
                data: g_request,   //alreay string
                //data: loc,
                url: target,
                success: ss,
                error: sf(),
                timeout: 15000
            });
            return true;
        }
        var g_secs = $('section');
        function switchview(sv) {
            //g_secs = ['#loading', '#result', '#noresult', '#fail'];
            g_secs.each(function(index, ele){$(ele).hide();});  //hide all
            $(g_secs[sv%4]).show(); //show
        }
        function clearall() {
            console.log('clearall invoked!');
            $('.selected').removeClass('selected');
            //save();
            filter_result();
        }
        //set ops
        (function(so){var uidList=[],uid;uidList.push(uid=function(){return this});so.pushUid=function(method){uidList.push(method);uid=method;return method};so.popUid=function(){var prev;uidList.length>1&&(prev=uidList.pop());uid=uidList[uidList.length-1];return prev||null};function process(a,b,evaluator){var hist=Object.create(null),out=[],ukey,k;a.forEach(function(value){ukey=uid.call(value);if(!hist[ukey]){hist[ukey]={value:value,freq:1}}});b.forEach(function(value){ukey=uid.call(value);if(hist[ukey]){if(hist[ukey].freq===1){hist[ukey].freq=3}}else{hist[ukey]={value:value,freq:2}}});if(evaluator){for(k in hist){if(evaluator(hist[k].freq)){out.push(hist[k].value)}}return out}else{return hist}}so.union=function(a,b){return process(a,b,function(freq){return true})};so.intersection=function(a,b){return process(a,b,function(freq){return freq===3})};so.difference=function(a,b){return process(a,b,function(freq){return freq<3})};so.complement=function(a,b){return process(a,b,function(freq){return freq===1})};so.equals=function(a,b){var max=0,min=Math.pow(2,53),key,hist=process(a,b);for(var key in hist){max=Math.max(max,hist[key].freq);min=Math.min(min,hist[key].freq)}return min===3&&max===3}})(window.setOps=window.setOps||Object.create(null));
        var giftlist = [];
        var giftpos = 0;
        function more() {
            var i = 0;  //每次增加20条
            var html = "", aid;
            var len = giftlist.length;
            var needbind = false;
            for(var i = 0; i < 20 && len > giftpos; i++, giftpos++) {
                aid = giftlist[giftpos].a;  //not g_gift.aids
                if(g_gift.meta_infos[aid] == undefined)
                    continue;
                try {
                    html += buildlevel1(g_gift.meta_infos[aid], giftpos);
                } catch (e) {
                    console.log(e);
                    continue;
                }
                html += '<hr class="articlesep">';
            }
            if(len > giftpos)
                needbind = true;
            $(html).insertBefore("#sr_last");
            if(needbind)
                window.setTimeout(function(){
                    $('#sr_last').prev().prev().prev().prev().prev().prev().prev().prev().waypoint(more, {offset: 'bottom-in-view', triggerOnce: true});    //last 4 article
                    }, 100);
            else
                $('#giftloading').remove(); //结束了
        }
        function filter_result() {
            var act1 = $('.filters[data-id=1] > .selected').attr('data-id');
            var act2 = $('.filters[data-id=2] > .selected').attr('data-id')
            var act3 = $('.filters[data-id=3] > .selected').map(function() {return $(this).attr('data-id');}).toArray();
            var act4 = $('.filters[data-id=4] > .selected').
                map(function() {return Number($(this).attr('data-id'));}).toArray().
                reduce(function(preVal, curVal){return preVal + curVal;}, 0);
            //notice, tofilter may be a jQuery obj, not an array, but alike, use .toArray()?

            //filter result['scene', 'relation', 'character', 'price']
            var tobuild = [];
            if(act1 == undefined) {
                tobuild = g_gift.aids;  //虽然如果带多query，g_data可能更小，但不可取
            } else {
                tobuild = g_gift.gift_tag_index.scene[act1];
            }
            if(act2 == undefined) {
                //noop
            } else {
                //intersect
                tobuild = setOps.intersection(tobuild,
                    g_gift.gift_tag_index.relation[act2]);
            }
            if(act3 == undefined || act3.length == 0) {
                //noop
            } else {
                var merged = [];
                for(var k=0;k<act3.length;k++)
                    merged = setOps.union(merged, g_gift.gift_tag_index.character[act3[k]]);
                tobuild = setOps.intersection(tobuild, merged);
            }
            var over = [];
            if(act4 == undefined || act4 == 0) {
                //noop
                over = tobuild;
            } else {
                for(var j=0;j<tobuild.length;j++) {
                    var price = g_gift.meta_infos[tobuild[j]].price;
                    if(price == undefined)
                        continue;   //略过没有价格的, 20150801，文荟：不出
                    var m = price.match(/\d+/);
                    if(m && m[0] != undefined)
                        price = Number(m[0]);
                    else
                        continue;   //略过无法识别的
                    if(act4 & 1) {
                        if(price <= 200) {
                            over.push(tobuild[j]);
                            continue;
                        }
                    }
                    if(act4 & 2) {
                        if(price >= 200 && price <=500) {
                            over.push(tobuild[j]);
                            continue;
                        }
                    }
                    if(act4 & 4) {
                        if(price >= 500 && price <=800) {
                            over.push(tobuild[j]);
                            continue;
                        }
                    }
                    if(act4 & 8) {
                        if(price >= 800)
                            over.push(tobuild[j]);
                    }
                }
            }
            giftlist = [];  //整合act1/2/3里面产生的权值，排序
            for(var j = 0; j < over.length; j++) {
                var score = 0;
                if(act1)
                    score = g_gift.tag_score_index.scene[act1][over[j]];
                if(act2)
                    score += g_gift.tag_score_index.relation[act2][over[j]];
                for(var i = 0; i < act3.length; i++) {
                    if(act3[i])
                        score += g_gift.tag_score_index.character[act3[i]][over[j]];
                }
                giftlist[j] = {"a": over[j], "b": score}
            }
            giftlist.sort(function(l, h){return h.b - l.b});
            //giftlist = over;
            giftpos = 0;   //start over
            var html = ""
            var len = giftlist.length;
            var needgo = false;
            $("#searchresult").empty(); //当筛选发生，清空是安全的
            if(len != 0) {
                html += '<div id="sr_last"></div><div class="articlecard" id="giftloading"><div style="display:table; width:100%; height: inherit;text-align:center;"><div style="display:table-cell;height: inherit;vertical-align: middle;"><p class="error">正在加载更多礼物...</p></div></div></div>'; //set insert anchor
                needgo = true;
            } else {
                html = '<div class="articlecard"><div style="display:table; width:100%; height: inherit;text-align:center;"><div style="display:table-cell;height: inherit;vertical-align: middle;"><p class="error">没有找到合适的礼物<br>修改筛选条件试试...</p></div></div></div>';
            }
            $(html).appendTo("#searchresult");    //single append
            if(needgo)
                more();
            switchview(1);

        }
        function calc_option_size() {
            //use real markup
            var dummy = $('<div id="dummy_inner"><div class="headbar"><span onclick="clearall();">清除所有条件</span><i onclick="dropdown();">&nbsp;▼&nbsp;</i></div><div class="clearfix"></div><div class="filters"><div class="quater"><div><div><span data-id="200">0-200</span></div></div></div><div class="quater"><div><div><span data-id="500">200-500</span></div></div></div><div class="quater"><div><div><span data-id="1000">500-1000</span></div></div></div><div class="quater"><div><div><span data-id="unlimit">1000+</span></div></div></div></div></div>').appendTo('#result');
            //quater width -> height, make rectangle;
            var w = $(dummy.find(".quater")[0]).css("width").split("px")[0];
            w = Math.ceil(Number(w) * 171 / 273);   //273 * 141
            var p = $(dummy.find(".quater > div")[0]).css("margin").split("px")[0];
            $(".quater > div").css("height", Number(w)-Number(p)*2+"px");
            var h = $(dummy.find(".headbar")[0]).css('height').split('px')[0];
            dummy.remove();
            //这里实现的略MAGIC了
            $("#price_before").css("height", Math.ceil(Number(w)/2-Number(w)/10)+"px");
            $("#price_after").css("height", Math.floor(Number(w)/2+Number(w)/10)+"px");
            $(".filters").css("height", Number(w)*2+"px");
            $("#needheight").css("height", w+"px");
            
            //$("#areapadding").css("height",Number(w)*2+Number(h)+"px");
            return w;
        }
        function calc_padding(option, target) {
            //$('#areapadding').css('display', 'block'); //should already showed
            //window.scrollTo(0,document.body.scrollHeight);
            var topad;
            if(option == 'none') {
                //$('#areapadding').css('display', 'none');
                $('#areapadding').slideUp("fast");
                return 0;
            } else {
                topad = $(target).height();
                var leftH= $('#result').height() - window.scrollY - window.innerHeight;
                if(leftH < topad) {
                    //$('#areapadding').show();
                    //window.scrollBy(0, $('#areapadding').height());
                    $('#areapadding').slideDown({start:function()
                    {
                        $('html, body').finish().animate({scrollTop:$('#areapadding').offset().top});
                    }, duration:200});
                }
            }
        }
        var dropped = true;
        function dropdown() {
            console.log('collapse menu called!');
            dropped = true;
            //$('#area_inner, #people_inner, #personality_inner, #price_inner').slideUp();
            $("#area, #people, #personality, #price").hide();
            //$("#areapadding").slideUp(100);
            $("#uniqmenu").show();
        }
        function choice(e) {
            var p = $(this).parent();   //.filters
            var part = p.attr('data-id');
            var has = $(this).hasClass("selected");
            if(part == 1 || part == 2) {    //场景和关系单选
                if(has) {
                    $(this).removeClass("selected");
                } else {
                    p.find(".selected").removeClass("selected");
                    $(this).addClass("selected");
                }
            } else {
                $(this).toggleClass("selected");
            }
            console.log('目标' + e.target.innerText);
            //此时，应该设置g_data为g_gift? 1. markup不依赖g_data判定是否礼物页
            //2. 需要给app传正确的meta
            g_data = g_gift;
            var tags = $(".selected").map(function() {return $(this).attr('data-id');}).toArray().join('_');    //'基友_生日_geek'
            add_access(e.target.innerText, has?"off":"on", tags);
            filter_result();
            //save();
        }
        function noselclick(e) {
            dropped = false;
            $("#uniqmenu").hide();
            var l = ['area', 'people', 'personality', 'price'];
            var r = $(this).attr('data-id');
            $("#" + r).fadeIn("fast");  //换菜单样式
            $("#" + r + "_inner").fadeIn("fast");   //筛选部分
            //calc_padding("block", "#"+r+"_inner");  //立即
            for(var i = 0; i < l.length; i++) {
                if(r != l[i])
                    $("#" + l[i]).fadeOut("fast");
            }
        }
        function yesselclick(e) {
            dropped = true;
            $("#uniqmenu").show();
            var r = $(this).attr('data-id');
            //complete后处理，也可以先撤销然后立即
            //calc_padding($('#' + r + '_inner').css('display')=="block"?"none":"block", "#"+r+"_inner");
            $('#' + r).fadeOut("fast");
            $('#' + r + '_inner').fadeOut("fast");
            //$('#' + r + '_inner').fadeToggle({complete: function (){calc_padding($('#' + r + '_inner').css('display'), "#"+r+"_inner");}});
            //calc_padding($('#' + r + '_inner').css('display'), "#"+r+"_inner");
        }
        function env_for_gift() {
            //菜单+heading+筛选尺寸
            var bw = $('body').width();
            $(".botmenu").width(bw+"px");
            $('#area_inner, #people_inner, #personality_inner, #price_inner').width(bw+"px");
            //$(".filters").width(bw+"px"); //修改filter有奇怪的效果, width 莫名扩大
            $(".headbar").width(bw+"px");
            //筛选区尺寸+底版padding尺寸
            console.log(calc_option_size());
            //菜单
            $('.nosel').bind("click", noselclick);
            $('.yessel').bind("click", yesselclick);
            //筛选
            $('.filters').on("click", ".quater", choice);

            //滚动清除，点击清除
            //on iOS < 7, scroll fires when scroll end
            window.onscroll = function() {
                if(dropped)
                    return;
                dropdown();
            };
            $("#result").on("touchstart, touchmove, click", ".articlecard", function(e){
                if(dropped)
                    return;
                dropdown();
                e.preventDefault();
            });
        }
        function save() {
            var filters = $(".selected").map(function() {return $(this).attr('data-id');}).toArray();
            var v;
            var k = g_obj['query'];
            if(filters == undefined || filters.length == 0) {
                v = "N/A";
            } else {
                var expiresDate= new Date();
                expiresDate.setTime(expiresDate.getTime() + (86400 * 500)); //0.5days
                v = filters.join('_');    //empty safe
            }
            $.cookie(k, v, {path: '/', domain: 'diaox2.com', expires: expiresDate});
            return true;
        }
        function load() {
            var k = g_obj['query'];
            var v = $.cookie(k);
            if(v == undefined || v.length == 0)
                return false;
            //点亮filters
            var tags;
            if(v == "N/A")
                tags = [];  //后面，所有条件都会被清掉
            else 
                tags = v.split('_');    //没有_分割的，只产生长度为1的数组
            var filters = $(".filters > .quater[data-id]");
            for(var j=0; j < filters.length; j++) {
                $(filters[j]).removeClass('selected');  //先清，再加
                for(var i = 0; i < tags.length; i++) {
                    if($(filters[j]).attr('data-id') == tags[i])
                        $(filters[j]).addClass('selected');
                }
            }
            return true;
        }
        $(function() {
            console.log(window.location.href);
            if(g_method == "GET") {
                console.log("Method is GET(" + typeof g_get + ") ==> " + JSON.stringify(g_get));
                if(g_get == "")
                    g_request = '{"query":" "}';
                else
                    g_request = g_get;
            } else {
                console.log("Method is POST(" + typeof g_post + ") ==> " + JSON.stringify(g_post));
                if(g_post == "")
                    g_request = '{"query":" "}';
                else
                    g_request = g_post
            }
            //避免显示0结果时，显示找不到undefined
            g_obj = $.extend({}, {"query": " "}, JSON.parse(g_request));
            s();  //start search
        });
        </script>
</html>
