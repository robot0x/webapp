$(function(){
   var 
       doc = document,
       oCollectContentArea = doc.querySelector(".collect-content-area"),
       oCollectContentBox = oCollectContentArea.querySelector(".collect-content-box"),
       aCollectContentList = oCollectContentBox.querySelectorAll(".collect-content-list"),
       $aCollectContentList = $(aCollectContentList),
       $collectTagItem = $(doc.querySelectorAll(".connect-tag-item")),
       $collectContentBox = $(oCollectContentBox),
       iMainWidth = oCollectContentArea.offsetWidth,
       index , oList, i = 0, len = aCollectContentList.length,
       iFirstListHeight = aCollectContentList[0].offsetHeight;
   // 浮动布局转换成定位布局
   for(;i<len;i++){
      oList = aCollectContentList[i];
      oList.style.left = oList.offsetLeft + "px";
   }
   for(i=0;i<len;i++){
       oList = aCollectContentList[i];
       oList.style.position = "absolute";
   }
   // 把高度赋值给父容器，防止子容器绝对定位时高度塌陷
   oCollectContentBox.style.height = iFirstListHeight + "px";
   $collectTagItem.on('click',function(){
   	    $collectTagItem.removeClass("current-tag");
   	    var _this = $(this);
        _this.toggleClass("current-tag");
        index = _this.data("index");
        // TODO:是不是直接运动left即可？即不需要float转绝对定位
        $collectContentBox.animate({left:-index*iMainWidth,height:aCollectContentList[index].offsetHeight});
   })

   $aCollectContentList.find(".icon").on("click",function(event){
      var _this = $(this);
      event.preventDefault();
      if(!_this.hasClass("icon-p")){
         var next = _this.next();
         var text = next.text();
         if(_this.hasClass("icon-s")){
            _this.css("background-image","url(images/fav.png)");
            next.css("color","#ff0014");
            next.text(+text+1);
         }
         if(_this.hasClass("icon-z")){
           _this.css("background-image","url(images/like.png)");
           next.text(+text+1);
           next.css("color","#ff0014");
         }
      }
   })
})