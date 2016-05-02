 /*
    原生ajax函数。用法与jquery ajax一致。
    author:pod4g
    修改时间:2016,02,20
    版本:1.1
*/
function ajax(opts){
     var xhr,// 获取ajax对象
         method = opts.type || "GET", // 默认是GET方式
         async = true, // 默认是异步
         cache = true, // 默认缓存ajax结果，只有在JSONP时起作用
         contentType = opts.contentType || 'application/x-www.form-urlencoded',// 默认是表单提交数据格式
        
         /*
            
            一、 如果data是object，
                形如：
                data: {
                    "aids": 110,
                    "name":"李彦峰",
                    "age":26
                }    
                会转成 aids=110&name=李彦峰&age=26
            二、如果data是string
            
         */

         data = opts.data || {}, // 请求参数
         dataType = opts.dataType,
         type = function (arg){ 
            var t = typeof arg,s;
            if(t === 'object'){
                if(arg === null){
                    return 'null';
                }else{
                    s = Object.prototype.toString.call(arg);
                    return s.slice(8,-1).toLowerCase();
                }
            }else{
                return t;
            }
      },
      prop2prame = function(data){
        var ret = "",prop;
        if(!data ||  type(data) !== 'object'){
            return ret;
        }
        for(prop in data){
            var val = data[prop];
            if(type(val) === "array"){
                 for(var i = 0,l = val.length;i<l;i++){
                    ret += prop + "=" + val[i] + "&";
                 }
            }else{
                ret += prop + "=" + val + "&";
            }
        }
        return ret;
      };
      if(dataType && dataType.toLowerCase()==='jsonp'){
        var callbackParam = opts.jsonp || "callback";
        var callbackParamValue = opts.jsonpCallback || "__my_ajax__"+(+new Date())+"_"+Math.floor(Math.random()*10000);
        var url = opts.url;
        if(type(opts.cache) === "boolean"){
            cache = opts.cache;
        }

        var t = "";
        if(cache){
            t = "&_="+(+new Date());
        }
        var param = prop2prame(data);
        param = param.concat(callbackParam).concat("=").concat(callbackParamValue).concat(t);
        if(url.indexOf('?') == -1){
            param = "?"+param;
        }else{
            param = "&"+param;
        }
        var doJSONP = function(src,success){
            var __script__ = document.createElement("script");
                __script__.type = "text/javascript";
                __script__.src = src;
            window[callbackParamValue] = function(text){
                if(type(success) === "function"){
                    success(text);
                }
                // 执行完毕之后，磨除JSONP标记
                window[callbackParamValue] = undefined;
                document.body.removeChild(__script__);
             }
            document.body.appendChild(__script__);
            var timeout = opts.timeout;
            if(timeout > 0){
                setTimeout(function(){
                    window[callbackParamValue] = undefined;
                    document.body.removeChild(__script__);
                },timeout)
            }
        }
        doJSONP(opts.url+param,opts.success || function(){});
      }else{
             xhr = new XMLHttpRequest();
             if(opts.async != undefined){
                async = opts.async;
             }
             var url = opts.url;
             if(opts.cache != undefined){
                cache = opts.cache;
             }
             if(!cache){
                if(url.indexOf('?') == -1){
                    url += "?__my_ajax__="+(+new Date());
                }else{
                    url += "&__my_ajax__="+(+new Date());
                }
             }
             var errorHandler = opts.error;
        try{
             // console.log(opts);
             // 建立与服务端的连接
             xhr.open(method,opts.url,async);
             // 设置 POST 请求需要的header
             if(method.toUpperCase() === "POST"){
                xhr.setRequestHeader('Content-Type',contentType);
             }

             if(type(data) === "object"){
                 data = prop2prame( data );
             }
             // 发送参数
             xhr.send(data);
             /*
                error回调
                1、XMLHttpRequest
                2、textStatus: "timeout", "error", "notmodified" 和 "parsererror"。
                3、errorThrown
             */
             var errorHandler = opts.error;
             var successHandler = opts.success;
             xhr.onreadystatechange = function(){
                if(xhr.readyState === 4 && xhr.status === 200){
                    if(successHandler && type(successHandler) === "function"){
                        var arg = xhr.responseText;
                        /*
                            contentType：设置request header，content-type的值
                            dataType：希望服务器端返回过来的值的类型（xml, json, script, html）
                        */
                        if(dataType === "json"){
                            arg = JSON.parse(xhr.responseText);
                        }else if(dataType === "text" || dataType === "html" || dataType === "script"){
                            arg = xhr.responseText;
                        }else if(dataType === "xml"){
                            arg = xhr.responseXML;
                        }
                        successHandler(arg);
                    }
                }
                if(xhr.status !== 200){
                    errorHandler(xhr,"error","");
                }
             }
             // 设置过期
             var timeout = opts.timeout;
             if(async && timeout > 0){
                setTimeout(function(){
                    errorHandler(xhr,"timeout","");
                    xhr.abort();
                },timeout);
             }
        }catch(e){
            if(errorHandler && type(errorHandler) === "function"){
                errorHandler(xhr,"error",e);
            }
        }
         
      }
}