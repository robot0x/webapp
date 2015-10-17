/*
 使用方法:
 var getNum = new GetNum(function(){
    // 更新dom
 });
 getNum.getStat();
*/
var GetNum = function( opts, fnSuccess, fnFail ) {
    var url = "http://api.diaox2.com/v1/stat/all";
    // 如果1个参数，那么就是fnSuccess
    if(arguments.length === 1){
      this.opts = {url:url};
      this.fnSuccess = arguments[0];
    }else if(arguments.length === 2){
      var arg1 = arguments[0],
          arg2 = arguments[1];
      if(typeof arg1 === "function" && typeof arg2 === "function"){
        this.opts = {url:url};
        this.fnSuccess = arg1;
        this.fnFail = arg2;
      }else{
        this.opts = arg1;
        this.fnSuccess = arg2;
      }
    }else{
      this.opts = opts;
      this.fnSuccess = fnSuccess;
      this.fnFail = fnFail;
    }
}
GetNum.prototype = {

    constructor: GetNum,

    getStat: function() {
        var self = this;
        var className = self.opts.className || "unknown";
        var eles = $("." + self.opts.className);
        // author页 和 category页
        if (eles && eles.length) {
            var cids = [],
                i = 0,
                l = eles.length,
                ele;
            while (i < l) {
                ele = $(eles[i++]);
                if (isNaN(eles.attr('data-id'))) {
                    continue; 
                }
                cids.push(+eles.attr('data-id'));
            }
            (function(input) {
                (function() {
                    var pack = input.slice(0, 100);
                    input = input.slice(100);
                    if (pack.length > 0) {
                        self.doUpdate(pack);
                        setTimeout(arguments.callee, 2000); //2秒后调用下一波
                    } else {
                        console.log("timer is off, callback time");
                    }
                })()
            })(cids)

        } else { // article 页
            self.doUpdate( [ +$("body").attr('id') ] );
        }

    },
    doUpdate: function(cids) {
        var self = this;
        var jsonstr = JSON.stringify({
            "aids": cids
        });
        var fnFail = self.fnFail || function(x, t, e) {
                console.log("update failed, with error " + e);
            };
        jQuery.support.cors = true;
        $.ajax({
            dataType: "jsonp",
            crossDomain:true,
            cache:true,
            jsonp:'cb',
            jsonpCallback: 'cb',
            url: self.opts.url+"?data="+decodeURIComponent(jsonstr),
            success: self.fnSuccess,
            timeout: 8000,
            error: self.fnFail
        });
    }
}
