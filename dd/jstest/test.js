console.log('test.js');
console.log(document.getElementById('test').innerHTML);

function Person() {
    this.hi = function(){}
}
function One() {}
One.prototype = new People();
One.prototype.hi = function() {
    return "This is one"
}

function Two() {}
Two.prototype = new People();
Two.prototype.hi = function() {
    return "This is two"
}

var o = new One();
if(o instanceof People) {
    alert("hihi, o from People")
}
