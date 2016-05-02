tricky = navigator.userAgent + "\n" + navigator.appVersion + "\n" + navigator.platform;
console.log(tricky);
//feature
/*if(-1 == $("html").attr("class").indexOf("dx2no-touch") || -1 == $("html").attr("class").indexOf("dx2csstransitions")) {
    window.location.href = "wap.html"
}
*/
//agent
if(tricky.indexOf("Android") != -1 || tricky.indexOf("iPhone") != -1 ||
    tricky.indexOf("JUC") != -1 || tricky.indexOf("MQQBrowser") != -1 ||
    tricky.indexOf("Xoom") != -1 || tricky.indexOf("Opera Mobi") != -1 || 
    tricky.indexOf("Fennec") != -1 || tricky.indexOf("iPad") != -1 ||
    tricky.indexOf("Nokia") != -1 || tricky.indexOf("BlackBerry") != -1 ||
    tricky.indexOf("wOSBrowser") != -1 || tricky.indexOf("IEMobile") != -1
    ) {
    window.location.href = "wapdown.php"
}