// var opts = {
//     method:'GET',
//     url:"http://www.diaox2.com",
//     async:true,
//     data:{
//         id:"11",
//         name:"liyanfeng"
//     },
//     success:function(data){

//     },
//     error:function(msg){

//     }
// }

// function ajax(opts){
//      var xhr = new XMLHttpRequest(),
//          method = opts.method || "GET",
//          async = true,
//          postData = null,
//          data;
//      if(opts.async != undefined){
//         async = opts.async;
//      }
//      xhr.open(method,opts.url,async);
//      if(method.toUpperCase() === "POST"){
//         xhr.setRequestHeader('Content-Type','application/x-www.form-urlencoded');
//      }
//      data = opts.data;
//      if(data){
//         postData = (function(data){
//             var str = '',prop;
//             for(prop in data){
//                 str += prop + "=" + data[prop] + "&";
//             }
//             return str;
//         })(data);
//      }
//      xhr.send(postData);

//      xhr.onreadystatechange = function(){
//         if(xhr.readyState === 4){
//             if(xhr.status === 200){
//                 opts.success && opts.success(xhr.responseText);
//             }else{
//                 opts.error && opts.error({readyState:xhr.readyState,status:xhr.status});
//             }
//         }else{
//             opts.error && opts.error({readyState:xhr.readyState,status:xhr.status});
//         }
//      }
// }

// ajax函数
function ajax(opts){
     var xhr = new XMLHttpRequest(),
         method = opts.type || "GET",
         async = true,
         contentType = opts.contentType || 'application/x-www-form-urlencoded; charset=UTF-8';
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
