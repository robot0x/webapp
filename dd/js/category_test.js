$.extend({
  getParam:function(pName){
    var 
        url = window.location.href,
        arr = url.split("?"),
        param = {},
          paramArr,
          i=0,
          len,paramStr,paramKeyValue,paramKeyValueArr;
      if(arr.length>1){
         paramStr = arr[1];
    }
    if(paramStr){
      paramArr = paramStr.split("&");
      for(len = paramArr.length;i<len;i++){
        paramKeyValue = paramArr[i];
        paramKeyValueArr = paramKeyValue.split("=");
        param[paramKeyValueArr[0]] = decodeURIComponent(paramKeyValueArr[1]);
      }
    }
    return pName == null?param:param[pName];
  }
});
$(function() {
    var getId = function(){
       var classId = document.body.className,matchArr;
       if(classId){
          return classId.split("_")[0];
       }else{
          classId = $.getParam("tid");
          if(classId){
            return classId;
          }else{
            matchArr = window.location.href.match(/\d+/g);
            if(matchArr && matchArr.length){
              return matchArr[matchArr.length-1];
            }
          }
       }
    }
    var menu = new Menu($("#menu-list"), false),
        id = getId(),
        idList = menu.getIdList();
        if(id && idList && idList.indexOf(id)!==-1){
          menu.openById(id);
        }
})