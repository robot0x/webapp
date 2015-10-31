
// var a= 1;

// function test(){
//     alert(a)
// }
// test();

// window.b = 3;
// this.test2 = function(){
//     alert(window.b)
// }
// window.test2();

function Person(){
    this.name = 'liyanfeng';
    this.i = 23;
    this.sayName = function(a,b,c){
        alert(this.name);
        alert(a + b + c);
    }
}
// Person.i = 33;
// var p = new Person();
// p.sayName(1,2,3);

// var name = 'window liyanfeng';
// p.sayName.call(window);
// var arr = [1,2,4]
// p.sayName.apply(window,arr);
// p.sayName.call(window,1,2,3);

// function test(){
//     console.log(arguments.callee);
//     alert(arguments.callee);
//     console.log(test.caller);
//     function t2(){
//         alert('t2');
//         console.log(t2.caller);
//     }
//     t2();
// }
// test();
// alert(Math.max.apply(window,[1,23,4]));
// function test(){
//     for(var i = 0;i<100;i++){
//         console.log(this.i);
//     }
// }
// test.call(Person);

var p = Person();
console.log(p);
// console.log(name);
sayName();


