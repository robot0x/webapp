(function(){

 function testSpeed(url,fileSize){
    var startTime,endTime,duration,speedBps,speedKbps,speedMbps;
    var download = new Image();
    var size = fileSize * 8;
    download.onload = function(){
        endTime = +new Date();
        duration = (endTime - startTime)/1000;
        speedBps = (size / duration).toFixed(2);
        speedKbps = (speedBps / 1024).toFixed(2);
        speedMbps = (speedKbps / 1024).toFixed(2);
        console.log("duration(ms):"+(endTime - startTime));
        console.log("duration(s):"+duration.toFixed(2));
        console.log("speedBps:"+speedBps);
        console.log("speedKbps:"+speedKbps);
        console.log("speedMbps:"+speedMbps);

    }
    startTime = +new Date();
    download.src = url + "?n=" + Math.random();
 }
 // testSpeed("http://t.diaox2.com/view/test/lyf/test_speed.jpeg",13129);
 testSpeed("http://t.diaox2.com/view/test/lyf/test_speed2.png",2660306);


})()