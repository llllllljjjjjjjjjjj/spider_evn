//网页变量初始化
!function() {
    //固定随机数
    // onLeave = function(obj){
    //     obj.result = 1666654564456545
    // }
    // onLeave2 = function(obj){
    //     obj.result = 0.5
    // }
    // Date.now =ldvm.toolsFunc.hook(Date.now, undefined, false, function() {}, onLeave)
    // Date.prototype.getTime = ldvm.toolsFunc.hook(Date.prototype.getTime, undefined, false, function() {}, onLeave)
    // Math.random = ldvm.toolsFunc.hook(Math.random, undefined, false, function() {}, onLeave2)
    // let meta1 = document.createElement("meta");
    // let meta2 = document.createElement("meta");
    // let head = document.createElement("head");
    // meta2.content = "YV c1cGRDQjBZV2";
    // //meta2.parentNode = head--因为浏览器脱下来的set为undefined，要用自己的API
    // ldvm.toolsFunc.setProtoArr.call(meta2, "parentNode", head)
    // document.write('<input type="hidden" id="test" name="inputTag" value="666">');
    // function getValue(){
    //     let tag = document.getElementById("test");
    //     return `name: ${tag.name}, value:${tag.value}`;
    // }
    // console.log(getValue());

    //初始化cookie
    // ldvm.memory.globalVar.jsonCookie = {
    //     naem: "slj", 
    //     age: "sdljkf", 
    //     "": "abc",
    // }
    let body = document.createElement("body")
}()