;(function(doc){
/*
 使用此插件有2个条件：
 1、给img套一个容器，class 为 img-container
 2、样式
    .img-container{
        display:block;
        width: xpx ;  //给设计图的宽度
        height: xpx ; //给设计图的高度
        overflow: hidden;
    }
    所有需要调整的img都不要加在行内加width和height属性
*/
  doc.addEventListener('DOMContentLoaded',function(){
    console.log('adjustimg begin loading ...');
  var 
   imgContainer = doc.querySelector(".img-container"),
   imgList = doc.querySelectorAll(".img-container img"),
   i = 0,ratio,
   width = imgContainer.offsetWidth,
   height = imgContainer.offsetHeight,
   scale = (width / height).toFixed(2),
   len = imgList.length;
   console.log("adjustimg loading ... "+len+" / " + width +" / "+height+" / "+scale);
   while(i < len){
        console.log(i);
        var img = imgList[i++];
        img.onreadystatechange = function(){
          console.log(this.readyState);
        }
        img.onload = function(){
           ratio = this.width / this.height;
           ratio = ratio.toFixed(2);
           console.log('onload inner');
           // 若比例相差不到 百分之二 就认为两者比例相同.直接把容器的宽高赋予图片
           if( Math.abs(scale - ratio) < 0.02 ){
              this.width = width;
              this.height = height;
              console.log("one:"+this.width+" / "+this.height);
           }else if(scale > ratio){
             // 若容器的比例大于图片的原始比例，说明原图是一张细长的图，此时，把宽度设置上去，把
             // 宽度按照比例设置 
             this.width = width;
             this.height = this.width / ratio;
             // 图片上移
             this.style.marginTop = -(this.height - height)/2 + "px" ;
             console.log("two:"+this.width+" / "+this.height);
           }else{
             // 此时图片是一张宽图
             this.height = height;
             this.width = this.height * ratio;
             // 图片右移
             this.style.marginLeft = -(this.width - width)/2 + "px";
           }
    }
  }
   console.log('adjustimg loaded ...');
  })
})(document);