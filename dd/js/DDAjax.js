/*
 发送ajax的封装组件。基于jquery。
 思路：调用这个组件，发送ajax请求，屏蔽浏览器差异，支持option跨域就使用option跨域，
      不支持的话，使用jsonp跨域。
 主要是兼容IE8、IE9
*/
var DDAjax = function(opts,fnSuccess,fnFail){
     /*
       利用IE浏览器能识别注释节点中的元素节点的特性并结合IE的官方HACK，来判断浏览器是否是IE，且能判断版本
       注意（亲自测试得出的结论）：只能判断低版本浏览器，如 IE5 IE6 IE7 IE8 IE9
                             IE10 IE11 Edge浏览器无法获得正确结果。
       判断是否是IE浏览器：直接调用方法即可
       判断是否是某个版本的IE浏览器：调用方法并把版本号传入.
                                例如判断是否是IE8:isIE(8)
                                判断是否是IE9:isIE(9)
        contentType: 'application/json',//若是没有这个属性的话，就不会发送options请求
      */
    var isIE = function(ver){
        var b = document.createElement("b");
        b.innerHTML = "<!--[if IE "+ver+"]><i></i><![end if]-->"
        return b.getElementsByTagName('i').length === 1;
    };
    var notSupportOptionAjax = isIE(8) || isIE(9);
    // 根据是否支持option请求跨域来装配ajax参数
    if(!notSupportOptionAjax && opts.dataType !== "jsonp"){ //支持option跨域
        console.log("options x domain;")
        var supportOpts = {
            type: "GET",
            contentType: "application/json",
            dataType: "json",
            cache:true
        };
        opts = $.extend({},supportOpts,opts||{});
        console.log(opts);
    }else{ //不支持option请求跨域或明确指定需要jsonp跨域。就使用jsonp跨域
         var defaultOpts = {
            dataType: "jsonp",
            timeout:8000,//默认8秒超时
            crossDomain:true,//默认跨域
            cache:true,//默认缓存
            jsonp:'cb',
            jsonpCallback: 'cb'
        };
        opts = $.extend({},defaultOpts,opts||{});
        opts.type = "GET";//JSOP跨域只能使用get方式
        console.log(opts);
     }
    opts.success = fnSuccess;
    opts.error = fnFail;
    $.ajax(opts);//根据装配好的参数，发送ajax请求
}
// var ddAjax = new DDAjax({
//     url:"http://s.diaox2.com/ddsearch/q",
//     type:"POST",
//     data: JSON.stringify({query:"com",from:"pc"}),
//     // url:"http://115.28.38.122/cms/diaodiao/pcsite/goodthing_feed_list.json",
//     cache:false,
//     dataType: "jsonp"
// },function(data){
//    console.log("success");
//    console.log(data);
// },function(e){
//    console.log("failed");
//    console.log(e);
// });