
var eleMenuOn = null, eleListBox = $("#listBox"), tempList = $("#tempChoList").html()
    , clMenuOn = "cho_link_on";

String.prototype.temp = function(obj) {
    return this.replace(/\$\w+\$/gi, function(matchs) {
        var returns = obj[matchs.replace(/\$/g, "")];       
        return (returns + "") == "undefined"? "": returns;
    });
};
var eleMenus = $("#choMenu a").bind("click", function(event) {
    // 取出 area=pudong
    var query = this.href.split("?")[1];
    if (history.pushState && query && !$(this).hasClass(clMenuOn)) {
        eleMenuOn && eleMenuOn.removeClass("cho_link_on");
        eleMenuOn = $(this).addClass("cho_link_on");
        // 列表区
        eleListBox.html('<div class="cho_loading"></div>');
        $.ajax({
            url: this.href,
            dataType: "json",
            success: function(data) {
                var html = '';
                if ($.isArray(data)) {
                    $.each(data, function(i, obj) {
                        html += tempList.temp(obj);
                    }); 
                }
                eleListBox.html(html || '<div class="tc cr pt30">丫的没数据啊！</div>');   
            },
            error: function() {
                eleListBox.html('<div class="tc cr pt30">数据获取失败！</div>');   
            }
        });
        
        // history处理
        var title = "上海3月开盘项目汇总-" + $(this).text().replace(/\d+$/, "");
        document.title = title;
        if (event && /\d/.test(event.button)) {         
            history.pushState({ title: title }, title, location.href.split("?")[0] + "?" + query);
        }
    }
    return false;
});

var fnHashTrigger = function(target) {
    var query = location.href.split("?")[1], eleTarget = target || null;
    if (typeof query == "undefined") {
        if (eleTarget = eleMenus.get(0)) {
            history.replaceState(null, document.title, location.href.split("#")[0] + "?" + eleTarget.href.split("?")[1]) + location.hash;   
            fnHashTrigger(eleTarget);
        }
    } else {
        eleMenus.each(function() {
            if (eleTarget === null && this.href.split("?")[1] === query) {
                eleTarget = this;
            }
        });
        
        if (!eleTarget) {
            history.replaceState(null, document.title, location.href.split("?")[0]);    
            fnHashTrigger();
        } else {             
            $(eleTarget).trigger("click");
        }       
    }   
};
if (history.pushState) {
    window.addEventListener("popstate", function() {
        fnHashTrigger();                                                                
    });
    
    // 默认载入
    fnHashTrigger();
}