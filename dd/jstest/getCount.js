/******************************* article inner js start **********************************/
g_relsearch = ["\u6574\u7406", "\u6536\u7eb3\u76d2"];

function update_success(data) {
    if (data.result != "SUCCESS") {
        console.log('update invoked but server fail.');
        console.log(data);
        return false;
    } else {
        var elements = $(".zs-box");
        var aid = $('body').attr('id');
        elements.find('.a-fav').text(data.res[aid].fav);
        elements.find('.a-up').text(data.res[aid].up);
    }
    return true;
}

function doupdate(cids) {
    var jsonstr = JSON.stringify({
        "aids": cids
    });
    jQuery.support.cors = true;
    $.ajax({
        type: "POST",
        contentType: "application/json",
        data: jsonstr,
        dataType: "json",
        url: "http://api.diaox2.com/v1/stat/all",
        success: update_success,
        timeout: 8000,
        error: function(x, t, e) {
            console.log("update failed, with error " + e);
        }
    });
    console.log("Sent data in get_stat is : " + jsonstr);
}

function get_stat() {
    doupdate([+$("body").attr('id')]);
    return true;
}
/******************************** article inner js end ***********************************/

/******************************* author inner js start **********************************/
//set a global var
favall = upall = comall = 0;

function update_success(data) {
    if (data.result != "SUCCESS") {
        console.log('update invoked but server fail.');
        return false;
    } else {
        var elements = $(".unknown");
        for (var i in data.res) {
            favall += Number(data.res[i].fav);
            upall += Number(data.res[i].up);
            for (var j = 0; j < elements.length; j++) {
                var $ele = $(elements[j]);
                if (i == $ele.attr('data-id')) {
                    $ele.find('.a-fav').text(data.res[i].fav);
                    $ele.find('.a-up').text(data.res[i].up);
                    $ele.find('.a-com').text(data.res[i].comment);
                    $ele.addClass('known').removeClass('unknown');
                }
            }
        }
        //更新全局
        $('#favall').text(favall);
        $('#upall').text(upall);
    }
    return true;
}

function doupdate(cids) {
    var jsondict = {
        "aids": cids
    }
    var jsonstr = JSON.stringify(jsondict);
    jQuery.support.cors = true;
    $.ajax({
        type: "POST",
        contentType: "application/json",
        data: jsonstr,
        dataType: "json",
        url: "http://api.diaox2.com/v1/stat/all",
        success: update_success,
        timeout: 8000,
        error: function(x, t, e) {
            console.log("update failed, with error " + e);
        }
    });
    console.log("Sent data in get_stat is : " + jsonstr);
}

function get_stat() {
    var eles = $(".unknown");
    var cids = [];
    for (var i = 0; i < eles.length; i++) {
        if (isNaN($(eles[i]).attr('data-id'))) {
            continue; //esc those may crash api
        }
        cids.push(Number($(eles[i]).attr('data-id')));
    }
    timely_update_read = function(input) {
        //get_access(cids, selector, get_access_succeed, get_access_fail);
        //注意，需要100 100的来
        ofunc = function() {
            var pack = input.slice(0, 100);
            input = input.slice(100);
            if (pack.length > 0) {
                doupdate(pack);
                setTimeout(ofunc, 2000); //2秒后调用下一波
            } else {
                console.log("timer is off, callback time");
                return true;
            }
        };
        ofunc();
    };

    timely_update_read(cids);
    return true;
}
// 改写的get_stat2
function get_stat2() {
    var eles = $(".unknown"),cids = [],
        i = 0,l = eles.length,ele; 
    while (i < l) {
        ele = $(eles[i++]);
        if (isNaN(eles.attr('data-id'))) {
            continue; //esc those may crash api
        }
        cids.push(+eles.attr('data-id'));
    }
    (function(input) {
        (function() {
            var pack = input.slice(0, 100);
            input = input.slice(100);
            if (pack.length > 0) {
                doupdate(pack);
                setTimeout(arguments.callee, 2000); //2秒后调用下一波
            } else {
                console.log("timer is off, callback time");
                return true;
            }
        })()
    })(cids)
}
/******************************* author inner js end **********************************/
function update_success(data) {
    if (data.result != "SUCCESS") {
        console.log('update invoked but server fail.');
        return false;
    } else {
        var elements = $(".unknown");
        /*
            data.res[cid] {"fav": xxx, "up": xxx, "comment": xxx}
        */
        for (var i in data.res) {
            for (var j = 0; j < elements.length; j++) {
                if (i == $(elements[j]).attr('data-id')) {
                    $(elements[j]).find('.a-fav').text(data.res[i].fav);
                    $(elements[j]).find('.a-up').text(data.res[i].up);
                    $(elements[j]).find('.a-com').text(data.res[i].comment);
                    $(elements[j]).addClass('known').removeClass('unknown');
                }
            }
        }
    }
    return true;
}

function doupdate(cids) {
    var jsondict = {
        "aids": cids
    }
    var jsonstr = JSON.stringify(jsondict);
    jQuery.support.cors = true;
    $.ajax({
        type: "POST",
        contentType: "application/json",
        data: jsonstr,
        dataType: "json",
        url: "http://api.diaox2.com/v1/stat/all",
        success: update_success,
        timeout: 8000,
        error: function(x, t, e) {
            console.log("update failed, with error " + e);
        }
    });
    console.log("Sent data in get_stat is : " + jsonstr);
}

function get_stat() {
    var eles = $(".unknown");
    var cids = [];
    for (var i = 0; i < eles.length; i++) {
        if (isNaN($(eles[i]).attr('data-id'))) {
            continue; //esc those may crash api
        }
        cids.push(Number($(eles[i]).attr('data-id')));
    }
    timely_update_read = function(input) {
        //get_access(cids, selector, get_access_succeed, get_access_fail);
        //注意，需要100 100的来
        ofunc = function() {
            var pack = input.slice(0, 100);
            input = input.slice(100);
            if (pack.length > 0) {
                doupdate(pack);
                setTimeout(ofunc, 2000); //2秒后调用下一波
            } else {
                console.log("timer is off, callback time");
                return true;
            }
        };
        ofunc();
    };

    timely_update_read(cids);
    return true;
}
//bind_log_click(".articlecard", "data-href", "tagrelcard");    //TODO: pc
get_stat();

/************************************* new *****************************************/
function get_stat(){ 

  var eles = $(".unknown");
  // author页 和 category页
  if(eles && eles.length){ 
    var cids = [],
        i = 0,
        l = eles.length,
        ele; 
     while ( i < l ) {
        ele = $(eles[i++]);
        if (isNaN(eles.attr('data-id'))) {
            continue; //esc those may crash api
        }
        cids.push(+eles.attr('data-id'));
     }
     (function(input) {
        (function() {
            var pack = input.slice(0, 100);
            input = input.slice(100);
            if (pack.length > 0) {
                doupdate(pack);
                setTimeout(arguments.callee, 2000); //2秒后调用下一波
            } else {
                console.log("timer is off, callback time");
                return true;
            }
        })()
    })(cids)

  }else{ // article 页面
    doupdate( [ +$("body").attr('id') ] );
    return true;
  }
}
var GetNum = function(opts,fnSuccess){
   this.opts = opts;
   this.fnSuccess = fnSuccess;
}
GetNum.prototype = {
    constructor:getNum,
    doupdate:function(cids){
        var jsonstr = JSON.stringify({
               "aids": cids
        });
        jQuery.support.cors = true;
        $.ajax({
            type: "POST",
            contentType: "application/json",
            data: jsonstr,
            dataType: "json",
            url: this.opts.url,
            success: this.fnSuccess,
            timeout: 8000,
            error: function(x, t, e) {
                console.log("update failed, with error " + e);
            }
        });
        console.log("Sent data in get_stat is : " + jsonstr);

    }
    getStat: function(){
      var eles = $("."+this.opts.className);
      // author页 和 category页
      if(eles && eles.length){ 
        var cids = [],
            i = 0,
            l = eles.length,
            ele; 
         while ( i < l ) {
            ele = $(eles[i++]);
            if (isNaN(eles.attr('data-id'))) {
                continue; //esc those may crash api
            }
            cids.push(+eles.attr('data-id'));
         }
         (function(input) {
            (function() {
                var pack = input.slice(0, 100);
                input = input.slice(100);
                if (pack.length > 0) {
                    doupdate(pack);
                    setTimeout(arguments.callee, 2000); //2秒后调用下一波
                } else {
                    console.log("timer is off, callback time");
                    return true;
                }
            })()
        })(cids)

      }else{ // article 页面
        doupdate( [ +$("body").attr('id') ] );
        return true;
      }
    }
}
new getNum({
    url:"http://api.diaox2.com/v1/stat/all",
    className:"unknown"
},function(){
   
}).getStat();