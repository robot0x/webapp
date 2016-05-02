Array.from = Array.from || function(arr){
    if(!arr || !arr.length){
        return [];
    }
    return Array.prototype.slice.call(arr);
}
Array.isArray = Array.isArray || function(arr){
    if(!arr){
        return false;
    }
    
}