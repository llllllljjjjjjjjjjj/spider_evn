Window = function Function() {

}
console.log(Window.constructor);
console.log(Function.prototype === Object.prototype);
// 1. Object.prototype 是原型链的终点
console.log(Object.prototype.__proto__ === null); // true

// 2. Function.prototype 继承自 Object.prototype
console.log(Function.prototype.__proto__ === Object.prototype); // true

// 3. 普通函数的原型链
function fn() {}
console.log(fn.__proto__ === Function.prototype); // true
console.log(fn.__proto__.__proto__ === Object.prototype); // true
console.log(fn.__proto__.__proto__.__proto__ === null); // true

// 4. Function 构造函数本身的原型链
console.log(Function.__proto__ === Function.prototype); // true
console.log(Function.__proto__.__proto__ === Object.prototype); // true

// 5. Object 构造函数本身的原型链
console.log(Object.__proto__ === Function.prototype); // true
console.log(Object.__proto__.__proto__ === Object.prototype); // true

// 6. 你刚才的问题：Function.prototype 不等于 Object.prototype
console.log(Function.prototype === Object.prototype); // false