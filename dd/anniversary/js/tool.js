function type (arg){
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
}

function isNullObject(obj){
    if(type(obj) === 'function'){
        
    }
}
