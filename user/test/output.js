//全局对象配置
debugger 
ldvm = {
    "toolsFunc":{},//功能函数相关，插件
    "envFunc":{},//具体环境实现相关
    "config": {}, //配置相关
    "memory": {}, //内存相关
}
ldvm.config.proxy = false//是否开启代理
ldvm.config.print = true//是否输出日志
ldvm.memory.symbolProxy = Symbol("proxy")
ldvm.memory.filterProxyProp = [ldvm.memory.symbolProxy,Symbol.toPrimitive,  "eval", ]//需要过滤的属性
ldvm.memory.symbolData = Symbol("data"); // 保存当前对象上原型的属性
ldvm.memory.tag = []//存储tag标签

ldvm.memory.globalVar = {}
ldvm.memory.globalVar.jsonCookie = {}//存储全局变量
ldvm.memory.globalVar.gontList = ["SimHei", "SimSun", "NSimSun", "FangSong", "KaiTi"]//认为浏览器能够识别字体
//工具函数代码
//工具代码
!function(){
    
    //创建PluginArry
    ldvm.toolsFunc.createPluginArray = function createPluginArray(){
        let pluginArray = {};
        pluginArray = ldvm.toolsFunc.createProxyObj(pluginArray, PluginArray, "pluginArray");
        ldvm.toolsFunc.setProtoArr.call(pluginArray, "length", 0)
        return pluginArray;
    }
    //对PluginArry添加Plugin
    ldvm.toolsFunc.addPlugin = function addPlugin(plugin){
        let pluginArray = ldvm.memory.globalVar.pluginArray;
        if(pluginArray === undefined){
            pluginArray = ldvm.toolsFunc.createPluginArray();
        }
        let index = pluginArray.length;
        pluginArray[index] = plugin;
        Object.defineProperty(pluginArray, plugin.name, {
            value: plugin, 
            writable: false, 
            enumerable: false, 
            configurable: true
        });
        ldvm.toolsFunc.setProtoArr.call(pluginArray, "length", index+1)
        ldvm.memory.globalVar.pluginArray = pluginArray
        return pluginArray;
    }
    // 创建MimeTypeArray对象
    ldvm.toolsFunc.createMimeTypeArray = function createMimeTypeArray(){
        let mimeTypeArray = {};
        mimeTypeArray = ldvm.toolsFunc.createProxyObj(mimeTypeArray, MimeTypeArray, "mimeTypeArray");
        ldvm.toolsFunc.setProtoArr.call(mimeTypeArray, "length", 0);
        return mimeTypeArray;
    }
    //对mimeTypeArray添加mimeType
    ldvm.toolsFunc.addMimeType = function addMimeType(mimeType){
        let mimeTypeArray = ldvm.memory.globalVar.mimeTypeArray;
        if(mimeTypeArray === undefined){
            mimeTypeArray = ldvm.toolsFunc.createMimeTypeArray();
        }
        let index = mimeTypeArray.length;
        let flag = true;
        for(let i=0; i<index; i++){
            if(mimeTypeArray[i].type === mimeType.type){
                flag = false;
            }
        }
        if(flag){
            mimeTypeArray[index] = mimeType;
            Object.defineProperty(mimeTypeArray, mimeType.type, {
                value: mimeType, 
                writable: false, 
                enumerable: false, 
                configurable: true
            });
            ldvm.toolsFunc.setProtoArr.call(mimeTypeArray, "length", index+1);
        }
        ldvm.memory.globalVar.mimeTypeArray = mimeTypeArray;
        return mimeTypeArray;
    }   
    //创建MimeType
    ldvm.toolsFunc.createMimeType = function createMimeType(mimeTypeJson, plugin){
        let mimeType = {};
        //开始他没赋值回去而是只有=后面的
        mimeType = ldvm.toolsFunc.createProxyObj(mimeType, MimeType, "mimeType");
        ldvm.toolsFunc.setProtoArr.call(mimeType, "description", mimeTypeJson.description);
        ldvm.toolsFunc.setProtoArr.call(mimeType, "suffixes", mimeTypeJson.suffixes);
        ldvm.toolsFunc.setProtoArr.call(mimeType, "type", mimeTypeJson.type);
        ldvm.toolsFunc.setProtoArr.call(mimeType, "enabledPlugin", plugin);
        ldvm.toolsFunc.addMimeType(mimeType);
        return mimeType;
    }
    //创建Plugin
    ldvm.toolsFunc.createPlugin = function cteatePlugin(data) {
        let mimeTypes = data.mimeTypes;
        let plugin = {};
        //给plugin设置原型与代理并成为代理对象
        plugin = ldvm.toolsFunc.createProxyObj(plugin, Plugin, "plugin");
        //给plugin代理对象添加4个属性
        ldvm.toolsFunc.setProtoArr.call(plugin, "description", data.description);
        ldvm.toolsFunc.setProtoArr.call(plugin, "filename", data.filename);
        ldvm.toolsFunc.setProtoArr.call(plugin, "name", data.name);
        ldvm.toolsFunc.setProtoArr.call(plugin, "length", mimeTypes.length);
        //给plugin添加(数字作为对象名的对象)与(该对象中type对象的值为对象名且值指向自身的对象)，进而成为类数组
        for(let i=0; i<mimeTypes.length; i++){
            let mimeType = ldvm.toolsFunc.createMimeType(mimeTypes[i], plugin);
            plugin[i] = mimeType;
            Object.defineProperty(plugin, mimeTypes[i].type, {value: mimeType, writable: false, enumerable: true, configurable: true});
        }
        ldvm.toolsFunc.addPlugin(plugin)
        return plugin
    }

    //将字符串标签转化成JSON格式
    ldvm.toolsFunc.getTagJson = function parseTags(html) {
        html = html.trim().replace(/\s+/g, ' ');
        const result = [];
        const stack = [];
        let currentParent = null;

        const tagRegex = /<(\/?)([\w-]+)(\s[^>]*?)?(\/?)>/g;
        let match;

        while ((match = tagRegex.exec(html)) !== null) {
            const isClose = !!match[1];
            const tagName = match[2].toLowerCase();
            const attrStr = match[3] || '';
            const isSelfClose = !!match[4];

            const prop = {};
            const attrRegex = /([\w-]+)\s*=\s*["']([^"']*)["']/g;
            let attrMatch;
            while ((attrMatch = attrRegex.exec(attrStr)) !== null) {
            prop[attrMatch[1].toLowerCase()] = attrMatch[2];
            }

            const tag = { type: tagName, prop };

            if (isSelfClose || isClose) {
            if (currentParent) {
                if (!currentParent.children) currentParent.children = [];
                currentParent.children.push(tag);
            } else {
                result.push(tag);
            }
            if (isClose) stack.pop();
            continue;
            }

            if (currentParent) {
            if (!currentParent.children) currentParent.children = [];
            currentParent.children.push(tag);
            } else {
            result.push(tag);
            }
            stack.push(tag);
            currentParent = tag;
        }

        return result.length === 1 ? result[0] : result;
    }
    
    //按类型筛选你创建过的 DOM 元素，返回同类型的所有标签列表
    ldvm.toolsFunc.getCollection = function getCollection(type){
        let collection = [];
        for (let i = 0; i < ldvm.memory.tag.length; i++) {
            let tag = ldvm.memory.tag[i];
            if(ldvm.toolsFunc.getType(tag) === type){
                collection.push(tag);
            }
        }
        return collection;
    }
    
    // 获取原型对象上自身属性值
    ldvm.toolsFunc.getProtoArr = function getProtoArr(key){
        return this[ldvm.memory.symbolData] && this[ldvm.memory.symbolData][key];
    }

    ldvm.toolsFunc.setProtoArr = function setProtoArr(key, value){
        if(!(ldvm.memory.symbolData in this)){
            Object.defineProperty(this, ldvm.memory.symbolData, {
                enumerable: false,
                configurable: false,
                writable: true,
                value: {}
            });
        }
        this[ldvm.memory.symbolData][key] = value;
    }
    // 获取一个自增的ID
    ldvm.toolsFunc.getID = function getID(){
        if(ldvm.memory.ID === undefined){
            ldvm.memory.ID = 0;
        }
        ldvm.memory.ID += 1;
        return ldvm.memory.ID;
    }

    //设置实例对象的原型与代理
    ldvm.toolsFunc.createProxyObj = function createProxyObj(obj, proto, name){
        Object.setPrototypeOf(obj,proto.prototype);
        //ID是为了区分不同的div标签
        return ldvm.toolsFunc.proxy(obj, `${name}_ID(${ldvm.toolsFunc.getID()})`);
    }
    
    //hook
    ldvm.toolsFunc.hook = function(func, funcInfo, isDebug, onEnter, onLeave, isExec){
    //func-原函数
    //funcInfo-含objName(目标函数所属的对象的名)、funcName(目标函数在对象上的属性名)属性的对象
    //isDebug-布尔类型， 是否进行调试， 关键点定位， 回溯调用栈
    //onEnter-函数，原函数执行前的操作-输出入参、改原函数入参···
    //onLeave-函数，原函数执行后的操作-输出原函数的返回值、改原函数返回值
    //isExec-布尔类型，是否执行原函数，比如无限debugger
    if(typeof func !== 'function') {
        return func;
    }
    if(funcInfo === undefined) {
        funcInfo = {};
        funcInfo.objName = 'globalThis'
        funcInfo.funcName = func.name || ''
    }    
    if(isDebug === undefined) {
        isDebug = false
    }
    if(!onEnter) {
        onEnter = function (obj) {
            console.log(`{hook|${funcInfo.objName}[${funcInfo.funcName}]正在调用， 参数是${JSON.stringify(obj.args)}`)
        } 
    }
    if(!onLeave) {
        onLeave = function(obj) {
            console.log(`{hook|${funcInfo.objName}[${funcInfo.funcName}]正在调用， 返回值是${obj.result}`)

        }
    }
    if(isExec === undefined) {
        isExec = true
    }
    let hookFunc = function() {
        if(isDebug) {
            debugger
        }
        let obj = {}
        obj.args = []
        for(let i = 0; i < arguments.length; i++) {
            obj.args[i] = arguments[i];
        }
        onEnter.call(this, obj)
        let result
        if(isExec) {
            result = func.apply(this, obj.args)
        }
        obj.result = result
        onLeave.call(this, obj)
        return obj.result
    }
    //native化
    ldvm.toolsFunc.setNative(hookFunc, funcInfo.funcName)
    //函数重命名
    ldvm.toolsFunc.reNameFunc(hookFunc, funcInfo.funcName)
    return hookFunc
    }
    
    //代理器
    // ---获取类型
    ldvm.toolsFunc.getType = function (obj) {
        // 遇到代理对象直接返回类型，不调用 toString
        //   if (obj instanceof Proxy) {
        //     return '[object Proxy]'
        //   }
        return Object.prototype.toString.call(obj)
    }
    // ---过滤属性
    ldvm.toolsFunc.filterProxyProp = function filterProxyProp(prop) {
        for(let i = 0; i < ldvm.memory.filterProxyProp.length; i++) {
            if(ldvm.memory.filterProxyProp[i] === prop){
                return true
            }
        }
        return false
    }
    ldvm.toolsFunc.proxy = function (obj, objName) {
        //obj:原始对象
        //objName:原始对象名字
        if(!ldvm.config.proxy) {
            return obj 
        }
        //判断是否是已代理对象
        if (ldvm.memory.symbolProxy in obj) {
            return obj[ldvm.memory.symbolProxy];
        }
        
        
        let handler = {//有的看清类型即可
            //get拦截不到--Object.getOwnPropertyDescriptor().value,要用属性描述符拦截
            get: function (target, prop, receiver) {
                let result
                if (typeof prop === 'symbol' && Symbol.keyFor(prop) === undefined) {
                    return Reflect.get(target, prop, receiver);
                }
                console.log(`{[${objName}]正在获取[${prop.toString()}]}`)
                //typeof null缺陷--typeof null 是'object',用instanceof
                
                try{
                    result = Reflect.get(target, prop, receiver);
                    //输出对象有缺陷-console.log(`get|obj:[${objName}] -> [${prop.toString()}], ret: [${result}]`)
                    //是对象时，返回类型后， 继续递归调用
                    //是值时， 返回值
                    if (ldvm.toolsFunc.filterProxyProp(prop)) {
                        return result;
                    }
                    let type = ldvm.toolsFunc.getType(result)
                    if (
                        result !== null && 
                        (typeof result === 'object' || typeof result === 'function') &&
                        // ✅ 加这一行，防止重复代理（这才是关键）
                        !result[ldvm.memory.symbolProxy]
                    ) {
                        console.log(`get|obj:[${objName}] -> [${prop.toString()}], type: [${type}]`)
                        //递归代理
                        result = ldvm.toolsFunc.proxy(result, `${objName}.${prop.toString()}`)
                    
                    }else if(typeof result == "symbol"){
                        console.log(`get|obj:[${objName}] -> [${prop.toString()}], ret: [${result.toString()}]`)
                    }
                    else{
                        console.log(`get|obj:[${objName}] -> [${prop.toString()}], ret: [${result}]`)
                    }
                    //throw new Error("测试错误")
                    //resule换成JSON.stringify()--不能输出循环引用的对象···会报错
                }catch(e){
                    //undefined[prop]等错误
                    console.log(`{get|obj:[${objName}] -> [${prop.toString()}], error: [${e.message}]}`)
                    /*
                        不要在 Proxy 的 get 里打印 ${result}
                        对象会触发 toString / valueOf / Symbol.toPrimitive
                        → 都会再次触发 get 捕获器
                        → 读取不存在属性 → 返回 undefined → 报错
                        判断对象用：result !== null && typeof result === 'object'
                        比 instanceof 更安全，不会把 null 当成对象
                    
                    */
                
                }

                console.log(`{返回值：${result}}`)
                return result;
            },
            
            //不写 set：自带完整默认赋值行为
            // 写了 set：默认操作全部消失
            // 想恢复默认：必须手动调用 Reflect.set
            // 顺序必须是：(target, prop, value, receiver)
            set: function(target, prop, value, receiver) {
                let result;
                try{
                    result = Reflect.set(target, prop, value, receiver)
                    let type = ldvm.toolsFunc.getType(value)
                    if(value instanceof Object) {
                        console.log(`{set|obj:[${objName}] -> prop:[${prop.toString()}],type:[${type}]}`);
                    }
                    else if(typeof value === "symbol"){
                        console.log(`{set|obj:[${objName}] -> prop:[${prop.toString()}],value:[${value.toString()}]}`);
                    }
                    else {
                        console.log(`{set|obj:[${objName}] -> prop:[${prop.toString()}],value:[${value}]}`);
                    }
                }
                catch(e){
                    console.log(`{set|obj:[${objName}] -> prop:[${prop.toString()}],error:[${e.message}]}`)
                }
                return result
            },
            //拦截属性描符
            getOwnPropertyDescriptor: function(target, prop) {
                let result;
                try {
                    result = Reflect.getOwnPropertyDescriptor(target, prop)
                    let type = ldvm.toolsFunc.getType(result)
                    if ("constructor" !== prop) {
                        console.log(`{getOwnPropertyDescriptor|obj}:[${objName}] -> prop:[${prop.toString()}],type:[${type}]`);
                    }
                    
                    //如果result是对象，还要拦截对象属性描述符对象
                    if(typeof result !== "undefined") {
                        //所有对象的属性（包括内置对象的属性）都有PropertyDescriptor，只是你需要用 Object.getOwnPropertyDescriptor() 来读取它。
                        ldvm.toolsFunc.proxy(result, `${objName}.${prop.toString()}.PropertyDescriptor`)
                    }
                }
                catch(e){
                    console.log(`{getOwnPropertyDescriptor|obj:[${objName}] -> [${prop.toString()}], error: [${e.message}]}`)

                }
                return result
            },
            //拦截定义属性
            defineProperty: function(target, prop, descriptor) {
                let result
                try {
                    result = Reflect.defineProperty(target, prop, descriptor)
                    console.log(`{defineProperty|obj:[${objName}] -> prop:[${prop.toString()}]}`);
                }
                catch(e){
                    console.log(`{defineProperty|obj:[${objName}] -> [${prop.toString()}], error: [${e.message}]}`)

                }
                return result
            },
            //拦截函数，这里的的target指函数，前面的target指对象; thisArg-谁调用了函数
            apply: function(target, thisArg,  args) {
                let result
                try{
                    result = Reflect.apply(target, thisArg,args)
                    let type = ldvm.toolsFunc.getType(result)
                    if(result instanceof Object) {
                        //console.log(`{apply|function:[${objName}],args:[${arguments}],result:[${result}]}`);
                        //参数输出有点复杂--可能是对象，函数，列表等
                        console.log(`{apply|function:[${objName}],args:[${args}],type:[${result}]}`)
                    }
                    else if(typeof result ==='symbol') {
                        console.log(`{apply|function:[${objName}],args:[${args}],result:[${result.toString()}]}`)
                    }
                    else {
                        console.log(`{apply|function:[${objName}],args:[${args}],result:[${result}]}`)
                    }
                    
                }
                catch(e){
                    console.log(`{apply|function:[${objName}],args:[${args}],error:[${e.message}]}`);
                    
                }
                return result
            },
            //函数创建拦截
            construct: function(target, argArray, newTarget) {
                //target--函数对象
                //argArray--参数列表
                //newTarget--代理对象
                let result
                try{
                    result = Reflect.construct(target, argArray, newTarget)
                    let type = ldvm.toolsFunc.getType(result)
                    console.log(`{construct|function:[${objName}],type:[${type}]}`)
                }
                catch(e){
                    console.log(`{construct|function:[${objName}],error:[${e.message}]}`);
                }
                return result
            },
            //删除属性拦截
            deleteProperty: function(target, propKey) {
                let result = Reflect.deleteProperty(target, propKey)
                console.log(`{deleteProperty|obj:[${objName}] -> prop:[${propKey.toString()}], result:[${result}]}`)
                return result
            },
            has:function(target, propKey) {
                let result = Reflect.has(target, propKey)
                console.log(`{has|obj:[${objName}] -> prop:[${propKey.toString()}], result:[${result}]}`);
                return result
            },
            //遍历拦截
            ownKeys: function (target) {
            let result = Reflect.ownKeys(target);
            console.log(`{ownKeys|obj:[${objName}]}`);
            return result;
            },
            //获取原型对象
            getPrototypeOf: function(target) {
                let result = Reflect.getPrototypeOf(target);
                console.log(`{getPrototypeOf|obj:[${objName}]}`);
                return result;
            },
            //设置原型对象
            setPrototypeOf: function(target, proto) {
                let result = Reflect.setPrototypeOf(target, proto);
                console.log(`{setPrototypeOf|obj:[${objName}]}`);
                return result;
            },
            
            
            // preventExtensions: function(target) {
            //     let result = Reflect.preventExtensions(target);
            //     console.log(`{preventExtensions|obj:[${objName}]}`);
            //     return result;
            // },
            // isExtensible: function(target) {
            //     let result = Reflect.isExtensible(target);
            //     console.log(`{isExtensible|obj:[${objName}]}`);
            //     return result;
            // }
        };
        let proxyObj = new Proxy(obj, handler)
        //判断之前是否被代理
        Object.defineProperty(obj, ldvm.memory.symbolProxy,  {
            configurable: false, 
            enumerable: false, 
            writable: false, 
            value: proxyObj
        })
        return proxyObj
        
    }
    
    //env函数分发器
    // 修复后的 env 函数分发器
    ldvm.toolsFunc.dispatch = function dispatch(self, obj, objName, funcName, argList, defaultValue) {
        let name = `${objName}_${funcName}`;
        //实现只有document才能调用createElement
        
        if(Object.getOwnPropertyDescriptor(obj, "constructor") !== undefined){//obj是原型对象
            if(Object.getOwnPropertyDescriptor(self, "constructor") !== undefined){
                // self 不是实例对象
                return ldvm.toolsFunc.throwError('TypeError', 'Illegal invocation');
            }
        }
        try {
            // 检查环境函数是否存在
            if (typeof ldvm.envFunc[name] === "function") {
                return ldvm.envFunc[name].apply(self, argList);
            } else {
                console.log(`[${name} 正在执行]，错误信息: 环境函数未定义`);
                return defaultValue;
            }
        } catch (e) {
            if (defaultValue === undefined) {
                console.log(`[${name} 正在执行]，错误信息: ${e.message}`);
            }
            return defaultValue;
        }
    };
    
    //定义对象属性defineProperty
    ldvm.toolsFunc.defineProperty = function defineProperty(obj, prop, oldDescriptor) {
        let newDescriptor = {}
        //是否可配置与是否开启代理有关
        newDescriptor.configurable = ldvm.config.proxy || oldDescriptor.configurable
        newDescriptor.enumerable = oldDescriptor.enumerable
        if(oldDescriptor.hasOwnProperty("writable")){
            newDescriptor.writable = ldvm.config.proxy || oldDescriptor.writable;// 如果开启代理必须是true
        }
        if(oldDescriptor.hasOwnProperty("value")){
            let value = oldDescriptor.value;
            if(typeof value === "function"){
                ldvm.toolsFunc.safeFunc(value, prop);
            }
            newDescriptor.value = value;
        }
        if(oldDescriptor.hasOwnProperty("get")){
            let get = oldDescriptor.get;
            if(typeof get === "function"){
                ldvm.toolsFunc.safeFunc(get, `get ${prop}`);
            }
            newDescriptor.get = get;
        }
        if(oldDescriptor.hasOwnProperty("set")){
            let set = oldDescriptor.set;
            if(typeof set === "function"){
                ldvm.toolsFunc.safeFunc(set, `set ${prop}`);
            }
            newDescriptor.set = set;
        }
        Object.defineProperty(obj, prop, newDescriptor)
    }
    
    
    //函数native化
    !function (){
        const $toString = Function.prototype.toString;
        const symbol = Symbol(); // 独一无二的属性

        const myToString = function (){
            //调用者是函数---如果调用者有symbol属性则返回，如果调用者没该属性，则返回Function.prototype中的toString
            return typeof this === 'function' && this[symbol] || $toString.call(this);
        }

        function set_native(func, key, value){
            Object.defineProperty(func, key, {
                enumerable: false,
                configurable: true,
                writable: true,
                value: value
            });
        }

        delete Function.prototype.toString;
        set_native(Function.prototype, "toString", myToString);
        set_native(Function.prototype.toString, symbol, "function toString() { [native code] }");

        ldvm.toolsFunc.setNative = function (func, funcname) {
            set_native(func, symbol, `function ${funcname || func.name || ''}() { [native code] }`);
        }
        

    }();
    
    //对象重命名
    ldvm.toolsFunc.reNameObj = function(obj, name){
        Object.defineProperty(obj.prototype, Symbol.toStringTag, {
            configurable: true, 
            enumerable: false, 
            value: name,
            writable: false
        })
    }

    // 函数重命名(js补环境中，脱环境不写函数名,要把例如atob的name属性保护起来)
    ldvm.toolsFunc.reNameFunc = function reNameFunc(func, name) {
        Object.defineProperty(func, "name", {
            configurable: true,
            enumerable: false,
            writable: false,
            value: name
        });
    }
    
    //函数保护方法(native与重命名合并)
    ldvm.toolsFunc.safeFunc = function saveFunc(func, name) {
        ldvm.toolsFunc.setNative(func, name)
        ldvm.toolsFunc.reNameFunc(func, name)
    }

    //保护原型
    ldvm.toolsFunc.safeProto = function savePropto(obj, name) {
        ldvm.toolsFunc.reNameObj(obj, name)
        ldvm.toolsFunc.setNative(obj, name)
    }

    //new Window--抛出错误模拟
    ldvm.toolsFunc.throwError = function throwError(name, message) {
        let e = new Error()
        e.name = name 
        e.message = message
        e.stack = `TypeError: Illegal constructor\\n    at snippet://`
        throw e
    }

    //base64
    // 编码函数：字符串 -> Base64
    ldvm.toolsFunc.base64 = {}
    ldvm.toolsFunc.base64.base64encode = function base64encode(str) {
        // 先把字符串转成 UTF-8 编码的字节
        const utf8Bytes = unescape(encodeURIComponent(str));
        let base64 = '';
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
        const pad = '=';

        for (let i = 0; i < utf8Bytes.length; i += 3) {
            const a = utf8Bytes.charCodeAt(i);
            const b = utf8Bytes.charCodeAt(i + 1);
            const c = utf8Bytes.charCodeAt(i + 2);

            const chunk = (a << 16) | ((b || 0) << 8) | (c || 0);

            base64 += chars.charAt((chunk >> 18) & 0x3F);
            base64 += chars.charAt((chunk >> 12) & 0x3F);
            base64 += chars.charAt((chunk >> 6) & 0x3F);
            base64 += chars.charAt(chunk & 0x3F);
        }

        const padLen = 3 - (utf8Bytes.length % 3);
        if (padLen !== 3) {
            base64 = base64.slice(0, base64.length - padLen) + pad.repeat(padLen);
        }

        return base64;
    };

    // 解码函数：Base64 -> 原字符串
    ldvm.toolsFunc.base64.base64decode = function base64decode(str) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
        const pad = '=';
        str = str.replace(/\s/g, ''); // 去掉空格换行

        let bytes = [];
        for (let i = 0; i < str.length; i += 4) {
            const a = chars.indexOf(str[i]);
            const b = chars.indexOf(str[i + 1]);
            const c = chars.indexOf(str[i + 2]);
            const d = chars.indexOf(str[i + 3]);

            const chunk = (a << 18) | (b << 12) | ((c !== -1 ? c : 0) << 6) | (d !== -1 ? d : 0);

            bytes.push((chunk >> 16) & 0xFF);
            if (str[i + 2] !== pad) bytes.push((chunk >> 8) & 0xFF);
            if (str[i + 3] !== pad) bytes.push(chunk & 0xFF);
        }

        // 转成 UTF-8 字符串
        return decodeURIComponent(escape(String.fromCharCode(...bytes)));
    };
}()
//浏览器接口实现
!function () {
    
    ldvm.envFunc.HTMLElement_offsetHeight_get = function HTMLElement_offsetHeight_get() {
        //先拿到字体---是否可以识别
        let fontFamily = this.style.fontFamily;
        if (ldvm.memory.globalVar.fontList.indexOf(fontFamily) !== -1) {
            //可以识别
            return 666;
        } else {//不可识别
            return 999;
        }
    }

    ldvm.envFunc.HTMLElement_offsetWidth_get = function HTMLElement_offsetWidth_get() {
        let fontFamily = this.style.fontFamily;
        if (ldvm.memory.globalVar.fontList.indexOf(fontFamily) !== -1) {
            return 1666;
        } else {
            return 1999;
        }
    }

    ldvm.envFunc.Element_children_get = function Element_children_get() {
        return ldvm.toolsFunc.getProtoArr.call(this, "children");
    }
    ldvm.envFunc.Node_appendChild = function Node_appendChild() {
        let tag = arguments[0];
        let collection = [];
        collection.push(tag);

        ldvm.toolsFunc.createProxyObj(collection, HTMLCollection, "collection");
        //添加是可能对很多属性有改变，但是暂时先对应上一个
        ldvm.toolsFunc.setProtoArr.call(this, "children", collection);
    }
    ldvm.envFunc.Document_body_get = function Document_body_get() {
        let collection = ldvm.toolsFunc.getCollection('[object HTMLBodyElement]');
        return collection[0]
    }

    ldvm.envFunc.Element_innerHTML_set = function Element_innerHTML_set() {
        let htmlStr = arguments[0];
        //设置字体属性的位置
        let style = {
            "font-family": "mmll",
            "font-size": "160px",
            "fontFamily": "mmll"
        }
        //具体情况自己实现
        //例子<span lang="zh" style="font-family:mmll;font-size:160px">fontTest</span>
        let tagJson = {
            "type": "span",
            "prop": {
                "lang": "zh",
                "style": style,
                "textContent": "fontTest"
            }
        }
        let span = document.createElement(tagJson["type"]);
        for (const key in tagJson["prop"]) {
            ldvm.toolsFunc.setProtoArr.call(span, key, tagJson["prop"][key]);
        }
    }

    ldvm.envFunc.WebGLRenderingContext_canvas_get = function WebGLRenderingContext_canvas_get() {
        return ldvm.toolsFunc.getProtoArr.call(this, "canvas");
    }
    ldvm.envFunc.WebGLRenderingContext_createProgram = function WebGLRenderingContext_createProgram() {
        let program = {};
        program = ldvm.toolsFunc.createProxyObj(program, WebGLProgram, "program");
        return program;
    }
    ldvm.envFunc.WebGLRenderingContext_createBuffer = function WebGLRenderingContext_createBuffer() {
        let buffer = {}
        buffer = ldvm.toolsFunc.createProxyObj(buffer, WebGLBuffer, "buffer")
    }

    ldvm.envFunc.HTMLCanvasElement_toDataURL = function HTMLCanvasElement_toDataURL() {
        let type = ldvm.toolsFunc.getProtoArr.call(this, "type", type)
        if (type === "2d") {
            return ldvm.memory.globalVar.canvas_2d;
        } else if (type === "webgl") {
            return ldvm.memory.globalVar.canvas_webgl
        }


    }
    ldvm.envFunc.HTMLCanvasElement_getContext = function HTMLCanvasElement_getContext() {
        let type = arguments[0];
        let context = {};
        switch (type) {
            case "2d":
                context = ldvm.toolsFunc.createProxyObj(context, CanvasRenderingContext2D, "context_2d");
                ldvm.toolsFunc.createProxyObj(context, "canvas", this)
                ldvm.toolsFunc.setProtoArr.call(this, "type", type)
                break;
            case "webgl":
                context = ldvm.toolsFunc.createProxyObj(context, WebGLRenderingContext, "context_webgl");
                ldvm.toolsFunc.createProxyObj(context, "canvas", this)
                ldvm.toolsFunc.setProtoArr.call(this, "type", type)

                break;

            default:
                console.log(`HTMLCanvasElement_getContext_${type}未实现`);
                break;
        }
        return context;
    }
    ldvm.envFunc.HTMLElement_style_get = function HTMLElement_style_get() {
        let style = {};
        style = ldvm.toolsFunc.createProxyObj(style, CSSStyleDeclaration, "")
    }
    ldvm.envFunc.HTMLCanvasElement_width_set = function HTMLCanvasElement_width_set() {
    }

    ldvm.envFunc.HTMLCanvasElement_height_set = function HTMLCanvasElement_height_set() {
    }
    ldvm.envFunc.Plugin_namedItem = function Plugin_namedItem() {
        let name = arguments[0];
        return this[name];
    }

    ldvm.envFunc.Plugin_item = function Plugin_item() {
        let index = arguments[0];
        return this[index];
    }
    ldvm.envFunc.MimeTypeArray_namedItem = function MimeTypeArray_namedItem() {
        let name = arguments[0];
        return this[name];
    }

    ldvm.envFunc.MimeTypeArray_item = function MimeTypeArray_item() {
        let index = arguments[0];
        return this[index];
    }

    ldvm.envFunc.PluginArray_namedItem = function PluginArray_namedItem() {
        let name = arguments[0];
        return this[name];
    }

    ldvm.envFunc.PluginArray_item = function PluginArray_item() {
        let index = arguments[0];
        return this[index];
    }

    ldvm.envFunc.Plugin_description_get = function Plugin_description_get() {
        return ldvm.toolsFunc.getProtoArr.call(this, "description");
    }

    ldvm.envFunc.Plugin_filename_get = function Plugin_filename_get() {
        return ldvm.toolsFunc.getProtoArr.call(this, "filename");
    }

    ldvm.envFunc.Plugin_length_get = function Plugin_length_get() {
        return ldvm.toolsFunc.getProtoArr.call(this, "length");
    }

    ldvm.envFunc.MimeType_suffixes_get = function MimeType_suffixes_get() {
        return ldvm.toolsFunc.getProtoArr.call(this, "suffixes");
    }

    ldvm.envFunc.MimeType_enabledPlugin_get = function MimeType_enabledPlugin_get() {
        return ldvm.toolsFunc.getProtoArr.call(this, "enabledPlugin");
    }
    ldvm.envFunc.MimeTypeArray_length_get = function MimeTypeArray_length_get() {
        return ldvm.toolsFunc.getProtoArr.call(this, "length");
    }

    ldvm.envFunc.MimeType_type_get = function MimeType_type_get() {
        return ldvm.toolsFunc.getProtoArr.call(this, "type");
    }

    ldvm.envFunc.PluginArray_length_get = function PluginArray_length_get() {
        return ldvm.toolsFunc.getProtoArr.call(this, "length");
    }

    ldvm.envFunc.Plugin_name_get = function Plugin_name_get() {
        return ldvm.toolsFunc.getProtoArr.call(this, "name");
    }
    ldvm.envFunc.Navigator_mimeTypes_get = function Navigator_mimeTypes_get() {
        return ldvm.memory.globalVar.mimeTypeArray;
    }

    ldvm.envFunc.Navigator_plugins_get = function Navigator_plugins_get() {
        return ldvm.memory.globalVar.pluginArray
    }

    ldvm.envFunc.HTMLInputElement_value_get = function HTMLInputElement_value_get() {
        return ldvm.toolsFunc.getProtoArr.call(this, "value");
    }

    ldvm.envFunc.HTMLInputElement_value_set = function HTMLInputElement_value_set() {
        let value = arguments[0];
        ldvm.toolsFunc.setProtoArr.call(this, "value", value);
    }
    ldvm.envFunc.HTMLInputElement_name_get = function HTMLInputElement_name_get() {
        return ldvm.toolsFunc.getProtoArr.call(this, "name");
    }

    ldvm.envFunc.HTMLInputElement_name_set = function HTMLInputElement_name_set() {
        let value = arguments[0];
        ldvm.toolsFunc.setProtoArr.call(this, "name", value);
    }
    ldvm.envFunc.Element_id_get = function Element_id_get() {
        return ldvm.toolsFunc.getProtoArr.call(this, "id");
    }
    ldvm.envFunc.Element_id_set = function Element_id_set() {
        let id = arguments[0]
        ldvm.toolsFunc.setProtoArr.call(this, "id", id);
    }
    ldvm.envFunc.HTMLInputElement_type_set = function HTMLInputElement_type_set() {
        let value = arguments[0];
        ldvm.toolsFunc.setProtoArr.call(this, "type", value)
    }
    ldvm.envFunc.HTMLInputElement_type_get = function HTMLInputElement_type_get() {
        return ldvm.toolsFunc.getProtoArr.call(this, "type");
    }


    ldvm.envFunc.Node_removeChild = function Node_removeChild() {
    }


    ldvm.envFunc.Node_parentNode_get = function Node_parentNode_get() {
        return ldvm.toolsFunc.getProtoArr.call(this, "parentNode");
    }


    ldvm.envFunc.HTMLMetaElement_content_get = function HTMLMetaElement_content_get() {
        return ldvm.toolsFunc.getProtoArr.call(this, "content");
    }
    ldvm.envFunc.HTMLMetaElement_content_set = function HTMLMetaElement_content_set() {
        let value = arguments[0];
        return ldvm.toolsFunc.setProtoArr.call(this, "content", value);
    }


    ldvm.envFunc.HTMLDivElement_align_get = function HTMLDivElement_align_get() {
        return ldvm.toolsFunc.getProtoArr.call(this, "align");
    }
    ldvm.envFunc.HTMLDivElement_align_set = function HTMLDivElement_align_set() {
        let value = arguments[0];
        return ldvm.toolsFunc.setProtoArr.call(this, "align", value);
    }
    //只实现了div、meta、canvas、head、input、canvas、a
    ldvm.envFunc.Document_createElement = function Document_createElement() {
        let tagName = arguments[0].toLowerCase();
        let options = arguments[1];
        let tag = {};
        switch (tagName) {
            case "div":
                //设置实例对象的原型与代理    
                tag = ldvm.toolsFunc.createProxyObj(tag, HTMLDivElement, `${tagName}`);
                ldvm.memory.tag.push(tag);
                break;
            case "meta":
                tag = ldvm.toolsFunc.createProxyObj(tag, HTMLMetaElement, `${tagName}`);
                ldvm.memory.tag.push(tag);
                break
            case "head":
                tag = ldvm.toolsFunc.createProxyObj(tag, HTMLHeadElement, `${tagName}`);
                ldvm.memory.tag.push(tag);
                break
            case "input":
                tag = ldvm.toolsFunc.createProxyObj(tag, HTMLInputElement, `${tagName}`);
                ldvm.memory.tag.push(tag);
                break
            case "a":
                tag = ldvm.toolsFunc.createProxyObj(tag, HTMLAnchorElement, `${tagName}`);
                ldvm.memory.tag.push(tag)
            case "canvas":
                tag = ldvm.toolsFunc.createProxyObj(tag, HTMLCanvasElement, `${tagName}`)
                ldvm.memory.tag.push(tag)
            case "body":
                tag = ldvm.toolsFunc.createProxyObj(tag, HTMLBodyElement, `${tagName}`)
                ldvm.memory.tag.push(tag)
            case "span":
                tag = ldvm.toolsFunc.createProxyObj(tag, HTMLSpanElement, `${tagName}`)
                ldvm.memory.tag.push(tag)







            default:
                console.log(`Document_createElement_${tagName}未实现`);
                break;
        }
        return tag;
    }
    //只实现了meta
    ldvm.envFunc.Document_getElementsByTagName = function Document_getElementsByTagName() {
        let tagName = arguments[0].toLowerCase();
        let collection = []
        switch (tagName) {
            case "meta":
                collection = ldvm.toolsFunc.getCollection('[object HTMLMetaElement]');
                collection = ldvm.toolsFunc.createProxyObj(collection, HTMLCollection, `Document_getElementsByTagName_${tagName}`)
                break;
            default:
                console.log(`Document_getElementsByTagName_${tagName}未实现`);
                break;
        }
        return collection
    }
    ldvm.envFunc.Document_write = function Document_write() {
        let tagStr = arguments[0];
        let tagJson = ldvm.toolsFunc.getTagJson(tagStr)
        let tag = document.createElement(tagJson.type);
        for (const key in tagJson.prop) {
            //如果没有设置进去我们自己的API--setProtoArr设置
            tag[key] = tagJson.prop[key];
            if (tag[key] === undefined) {
                ldvm.toolsFunc.setProtoArr.call(tag, key, tagJson.prop[key]);
            }
        }
    };
    //返回同类标签中对应ID的标签
    ldvm.envFunc.Document_getElementById = function Document_getElementById() {
        let id = arguments[0];
        let tags = ldvm.memory.tag;
        for (let i = 0; i < tags.length; i++) {
            if (tags[i].id === id) {
                return tags[i];
            }
        }
        return null;
    };
    ldvm.envFunc.Document_cookie_get = function Document_cookie_get() {
        let jsonCookie = ldvm.memory.globalVar.jsonCookie;
        let tempCookie = ""
        for (const key in jsonCookie) {
            if (key === "") {
                tempCookie += `${jsonCookie[key]}; `

            }
            else {
                tempCookie += `${key}=${jsonCookie[key]}; `

            }
        }
        return tempCookie
    }
    ldvm.envFunc.Document_cookie_set = function Document_cookie_set() {
        let cookieValue = arguments[0];
        let index = cookieValue.indexOf(";");
        if (index !== -1) {
            cookieValue = cookieValue.substring(0, index)
        }
        if (cookieValue.indexOf("=") === -1) {
            ldvm.memory.globalVar.jsonCookie[""] = cookieValue.trim();
        } else {
            let item = cookieValue.split("=");
            let k = item[0];
            let v = item[1];
            ldvm.memory.globalVar.jsonCookie[k] = v;
        }
    }
    ldvm.envFunc.Window_top_get = function Window_top_get() {
        return window;
    };
    ldvm.envFunc.Window_self_get = function Window_self_get() {
        return window;
    };
    ldvm.envFunc.Window_parent_set = function Window_parent_set() {
        return window;
    };
    ldvm.envFunc.Window_self_set = function Window_self_set() { return window; };
    ldvm.envFunc.Storage_getItem = function Storage_getItem() {
        let keyname = arguments[0]
        let valuename = arguments[1]
        if (keyname in Storage) {
            return this[keyname]
        }
        return null
    }
    ldvm.envFunc.Storage_setItem = function Storage_setItem() {
        let keyname = arguments[0]
        let valuename = arguments[1]
        this[keyname] = valuename
        return null
    }
    ldvm.envFunc.Storage_key = function Storage_key() {
        let index = arguments[0];
        let i = 0;
        for (const key in this) {
            if (i === index) {
                return key;
            }
            i++;
        }
        return null
    }
    ldvm.envFunc.Storage_clear = function Storage_clear() {
        for (const key in this) {
            delete this[key];
        }
    }
    ldvm.envFunc.Storage_length_get = function Storage_length_get() {
        let i = 0;
        for (const key in Object.getOwnPropertyDescriptors(this)) {
            i++;
        }
        return i;
    }
    ldvm.envFunc.removeItem = function removeItem() {
        let keyname = arguments[0]
        delete this[keyname]
        return null

    }
}()

//env相关代码

// EventTarget对象
EventTarget = function EventTarget(){}
ldvm.toolsFunc.safeProto(EventTarget, "EventTarget");
Object.setPrototypeOf(EventTarget.prototype, Object.prototype);
ldvm.toolsFunc.defineProperty(EventTarget.prototype, "addEventListener", {configurable:true, enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this, EventTarget.prototype, "EventTarget", "addEventListener", arguments)}});
ldvm.toolsFunc.defineProperty(EventTarget.prototype, "dispatchEvent", {configurable:true, enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this, EventTarget.prototype, "EventTarget", "dispatchEvent", arguments)}});
ldvm.toolsFunc.defineProperty(EventTarget.prototype, "removeEventListener", {configurable:true, enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this, EventTarget.prototype, "EventTarget", "removeEventListener", arguments)}});
ldvm.toolsFunc.defineProperty(EventTarget.prototype, "when", {configurable:true, enumerable:true, writable:true, value: function (){return ldvm.toolsFunc.dispatch(this, EventTarget.prototype, "EventTarget", "when", arguments)}});



WindowProperties = function WindowProperties(){}

//保护原型
// //native化-补Window.toString()
// ldvm.toolsFunc.setNative(WindowProperties, "WindowProperties")
// //补window.toString()--这是Window.prototype上的Symbol.toStringTag
// ldvm.toolsFunc.reNameObj(WindowProperties, "WindowProperties")
ldvm.toolsFunc.safeProto(WindowProperties, "WindowProperties")

//设置window原型 ,把window的原型设置为Window(大写)
Object.setPrototypeOf(WindowProperties.prototype, EventTarget.prototype)
Window = function Window(){
    //模拟浏览器new Window()报错--
    ldvm.toolsFunc.throwError("TypeError", "Illegal constructor")
}

// //native化-补Window.toString()
// ldvm.toolsFunc.setNative(Window, "Window")

// //补window.toString()--这是Window.prototype上的Symbol.toStringTag
// ldvm.toolsFunc.reNameObj(Window, "Window")

//保护Window原型
ldvm.toolsFunc.safeProto(Window, "Window")

Object.setPrototypeOf(Window.prototype, WindowProperties.prototype)


//浏览器访问不到WindowProperties,但是window补环境需要，所有补完原型链后删除



//window对象
//设置window原型 ,把window的原型设置为Window(大写)
window = globalThis
delete global
delete Buffer
delete globalThis[Symbol.toStringTag];


//删除WindowProperties.prototype.constructor--浏览器没有
delete WindowProperties.prototype.constructor

Object.setPrototypeOf(window, Window.prototype)
//console.log(window.__proto__, Object.getPrototypeOf(window),window.__proto__=== Object.getPrototypeOf(window))

//添加atob属性(内部有保护方法)
ldvm.toolsFunc.defineProperty(window, "atob", {
    configurable: true, 
    enumerable: true, 
    writable: true,
    value: function atob(str){
        return ldvm.toolsFunc.base64.base64decode(str)
    }
})

//添加btoa属性(内部有保护方法)
ldvm.toolsFunc.defineProperty(window, "btoa", {
    configurable: true, 
    enumerable: true, 
    writable: true,
    value: function btoa(str){
        return ldvm.toolsFunc.base64.base64encode(str)
    }
})

//window原型Window的属性--（其他属性相同或者外面拿不到）
ldvm.toolsFunc.defineProperty(Window, "PERSISTENT", {
    configurable: false,
    enumerable: true,
    value: 1,
    writable: false
});
ldvm.toolsFunc.defineProperty(Window, "TEMPORARY", {
    configurable: false,
    enumerable: true,
    value: 0,
    writable: false
});

//Window.prototype--window原型对象属性
ldvm.toolsFunc.defineProperty(Window.prototype, "PERSISTENT", {
    configurable: false,
    enumerable: true,
    value: 1,
    writable: false
});
ldvm.toolsFunc.defineProperty(Window.prototype, "TEMPORARY", {
    configurable: false,
    enumerable: true,
    value: 0,
    writable: false
});

//定义name属性
ldvm.toolsFunc.defineProperty(window, "name", {
    configurable: true,
    enumerable: true,
    get: function () {},
    set: function () {}
});

ldvm.toolsFunc.defineProperty(window, "top", {configurable:false, enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this, window, "Window", "top_get", arguments)},set:undefined}); 
ldvm.toolsFunc.defineProperty(window, "self", {configurable:true, enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this, window, "Window", "self_get", arguments)},set: function (){return ldvm.toolsFunc.dispatch(this, window, "Window", "self_set", arguments)}}); 
ldvm.toolsFunc.defineProperty(window, "parent", {configurable:true, enumerable:true, get: function (){return ldvm.toolsFunc.dispatch(this, window, "Window", "parent_get", arguments)},set: function (){return ldvm.toolsFunc.dispatch(this, window, "Window", "parent_set", arguments)}}); 
eval = ldvm.toolsFunc.hook(eval, undefined, false, function(){}, function(){})

//全局变量初始化
!function () {
    let onEnter = function (obj) {
        try {
            ldvm.toolsFunc.printLog(obj.args);
        }
        catch (e) {

        }


    }
    console.log = ldvm.toolsFunc.hook(
        console.log,
        undefined,
        false,
        onEnter,
        function () { },
        ldvm.config.print
    );
    //对pluginArray创建5个plugin--name不同
    ldvm.toolsFunc.createPlugin({
        "description": "Portable Document Format",
        "filename": "internal-pdf-viewer",
        "name": "PDF Viewer",
        "mimeTypes": [{
            "description": "Portable Document Format",
            "suffixes": "pdf",
            "type": "application/pdf"
        }, {
            "description": "Portable Document Format",
            "suffixes": "pdf",
            "type": "text/pdf"
        }]
    })
    ldvm.toolsFunc.createPlugin({
        "description": "Portable Document Format",
        "filename": "internal-pdf-viewer",
        "name": "Chrome PDF Viewer",
        "mimeTypes": [{
            "description": "Portable Document Format",
            "suffixes": "pdf",
            "type": "application/pdf"
        }, {
            "description": "Portable Document Format",
            "suffixes": "pdf",
            "type": "text/pdf"
        }]
    })
    ldvm.toolsFunc.createPlugin({
        "description": "Portable Document Format",
        "filename": "internal-pdf-viewer",
        "name": "Chromium PDF Viewer",
        "mimeTypes": [{
            "description": "Portable Document Format",
            "suffixes": "pdf",
            "type": "application/pdf"
        }, {
            "description": "Portable Document Format",
            "suffixes": "pdf",
            "type": "text/pdf"
        }]
    })
    ldvm.toolsFunc.createPlugin({
        "description": "Portable Document Format",
        "filename": "internal-pdf-viewer",
        "name": "Microsoft Edge PDF Viewer",
        "mimeTypes": [{
            "description": "Portable Document Format",
            "suffixes": "pdf",
            "type": "application/pdf"
        }, {
            "description": "Portable Document Format",
            "suffixes": "pdf",
            "type": "text/pdf"
        }]
    })
    ldvm.toolsFunc.createPlugin({
        "description": "Portable Document Format",
        "filename": "internal-pdf-viewer",
        "name": "Chrome PDF Viewer",
        "mimeTypes": [{
            "description": "Portable Document Format",
            "suffixes": "pdf",
            "type": "application/pdf"
        }, {
            "description": "Portable Document Format",
            "suffixes": "pdf",
            "type": "text/pdf"
        }]
    })
    ldvm.toolsFunc.createPlugin({
        "description": "Portable Document Format",
        "filename": "internal-pdf-viewer",
        "name": "WebKit built-in PDF",
        "mimeTypes": [{
            "description": "Portable Document Format",
            "suffixes": "pdf",
            "type": "application/pdf"
        }, {
            "description": "Portable Document Format",
            "suffixes": "pdf",
            "type": "text/pdf"
        }]
    })

}();

//用户代码
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

//需要代理的对象
window = top = self = parent = ldvm.toolsFunc.proxy(window, "window")
document = ldvm.toolsFunc.proxy(document, "document")


//用户代码
// //需要调试的代码
// debugger
// console.log(window === top);
// console.log(self === top);
// console.log(window.self === top);
// console.log(top.window === top);
// console.log(top.window.self.top === self.top.window);
// console.log(document.createElement === document.createElement)
// console.log(eval.toString())
// console.log(window.eval.toString())
// console.log(window.toString())

// // 存入数据
// console.log(localStorage.setItem("name", "小明"),
// localStorage.setItem("age", 12),
// localStorage.setItem("height", 160),)

// // 打印每个返回值
// console.log("getItem(name):", localStorage.getItem("name"));
// console.log("再次getItem(name):", localStorage.getItem("name"));
// console.log("key(20):", localStorage.key(20));
// console.log("length:", localStorage.length);

// let a = document.createElement('div')
// a.align = "123"

// function getTag() {
//     var metas = document.getElementsByTagName("meta");
//     var meta = metas[metas.length - 1];
//     var value = meta.content;
//     meta.parentNode.removeChild(meta);
//     return atob(value + 'NnYzNWalkyVnpjdz09');
// }

// var x = getTag();
// console.log(atob(x));



// div1.xxxx = 1
// div2.xxxx = 2


// document.cookie = 'a = 1; b = 2'
// document.cookie = "abcdefghijklmnopqrstuvwxyz"
// console.log(document.cookie)
// navigator.plugins.item(0);
// navigator.plugins.namedItem("Chrome PDF Viewer");
// navigator.plugins[0].item(0);
// navigator.plugins[0].namedItem("application/pdf");
// navigator.mimeTypes.item(0);
// navigator.mimeTypes.namedItem("application/pdf");
//document.createElement("canvas")
var ne = "undefined" !== typeof e ? e : "undefined" !== typeof window ? window : "undefined" !== typeof self ? self : void 0
    , re = function (e) {
        return e && "undefined" != typeof Symbol && e.constructor === Symbol ? "symbol" : typeof e
    };
(function () {
    var e = function (e, t, n) {
        for (var r = [], i = 0; i++ < t;)
            r.push(e += n);
        return r
    }
        , t = function (e) {
            for (var t, n, r = String(e).replace(/[=]+$/, ""), o = r.length, a = 0, s = 0, u = []; s < o; s++)
                ~(n = i[r.charCodeAt(s)]) && (t = a % 4 ? 64 * t + n : n,
                    a++ % 4) && u.push(255 & t >> (-2 * a & 6));
            return u
        }
        , n = function (e) {
            return e >> 1 ^ -(1 & e)
        }
        , r = []
        , i = e(0, 43, 0).concat([62, 0, 62, 0, 63]).concat(e(51, 10, 1)).concat(e(0, 8, 0)).concat(e(0, 25, 1)).concat([0, 0, 0, 0, 63, 0]).concat(e(25, 26, 1))
        , o = function (e) {
            for (var r = [], i = new Int8Array(t(e)), o = i.length, a = 0; o > a;) {
                var s = i[a++]
                    , u = 127 & s;
                s >= 0 ? r.push(n(u)) : (u |= (127 & (s = i[a++])) << 7,
                    s >= 0 || (u |= (127 & (s = i[a++])) << 14,
                        s >= 0 || (u |= (127 & (s = i[a++])) << 21,
                            s >= 0 || (u |= (s = i[a++]) << 28))),
                    r.push(n(u)))
            }
            return r
        };
    return function (e, t) {
        var n = o(e)
            , i = function (e, t, o, s, u) {
                return function c() {
                    for (var l, f, h = [o, s, t, this, arguments, c, n, 0], d = void 0, p = e, g = []; ;)
                        try {
                            for (; ;)
                                switch (n[++p]) {
                                    case 0:
                                        h[n[++p]] = new h[n[++p]](h[n[++p]]);
                                        break;
                                    case 1:
                                        return h[n[++p]];
                                    case 2:
                                        for (l = [],
                                            f = n[++p]; f > 0; f--)
                                            l.push(h[n[++p]]);
                                        h[n[++p]] = a(p + n[++p], l, o, s, u);
                                        try {
                                            Object.defineProperty(h[n[p - 1]], "length", {
                                                value: n[++p],
                                                configurable: !0,
                                                writable: !1,
                                                enumerable: !1
                                            })
                                        } catch (m) { }
                                        break;
                                    case 3:
                                        h[n[++p]] = h[n[++p]] < h[n[++p]];
                                        break;
                                    case 4:
                                        h[n[++p]] += String.fromCharCode(n[++p]),
                                            h[n[++p]] += String.fromCharCode(n[++p]),
                                            h[n[++p]] = h[n[++p]][h[n[++p]]];
                                        break;
                                    case 5:
                                        h[n[++p]] = h[n[++p]] >= n[++p];
                                        break;
                                    case 6:
                                        h[n[++p]] = h[n[++p]] >> n[++p],
                                            h[n[++p]] = h[n[++p]][h[n[++p]]];
                                        break;
                                    case 7:
                                        h[n[++p]] = h[n[++p]] < n[++p];
                                        break;
                                    case 8:
                                        h[n[++p]] = h[n[++p]].call(d);
                                        break;
                                    case 9:
                                        h[n[++p]] = "",
                                            h[n[++p]] += String.fromCharCode(n[++p]),
                                            h[n[++p]] = n[++p];
                                        break;
                                    case 10:
                                        h[n[++p]] = h[n[++p]] | n[++p];
                                        break;
                                    case 11:
                                        h[n[++p]] = h[n[++p]] & n[++p],
                                            h[n[++p]] = h[n[++p]][h[n[++p]]];
                                        break;
                                    case 12:
                                        h[n[++p]] = {};
                                        break;
                                    case 13:
                                        h[n[++p]] = h[n[++p]] | h[n[++p]],
                                            h[n[++p]][h[n[++p]]] = h[n[++p]],
                                            p += h[n[++p]] ? n[++p] : n[(++p,
                                                ++p)];
                                        break;
                                    case 14:
                                        h[n[++p]] = d;
                                        break;
                                    case 15:
                                        h[n[++p]] = n[++p],
                                            h[n[++p]] = h[n[++p]][n[++p]],
                                            h[n[++p]] = n[++p];
                                        break;
                                    case 16:
                                        h[n[++p]] = !0;
                                        break;
                                    case 17:
                                        h[n[++p]] = h[n[++p]] === h[n[++p]];
                                        break;
                                    case 18:
                                        h[n[++p]] = h[n[++p]] / h[n[++p]];
                                        break;
                                    case 19:
                                        h[n[++p]][h[n[++p]]] = h[n[++p]],
                                            h[n[++p]] = "",
                                            h[n[++p]] += String.fromCharCode(n[++p]);
                                        break;
                                    case 20:
                                        h[n[++p]][n[++p]] = h[n[++p]],
                                            h[n[++p]][n[++p]] = h[n[++p]],
                                            h[n[++p]][n[++p]] = h[n[++p]];
                                        break;
                                    case 21:
                                        h[n[++p]] = h[n[++p]] * h[n[++p]];
                                        break;
                                    case 22:
                                        h[n[++p]] = ++h[n[++p]],
                                            h[n[++p]] = h[n[++p]];
                                        break;
                                    case 23:
                                        h[n[++p]] += String.fromCharCode(n[++p]),
                                            h[n[++p]] = h[n[++p]][h[n[++p]]],
                                            h[n[++p]] = h[n[++p]];
                                        break;
                                    case 24:
                                        h[n[++p]] = h[n[++p]] << n[++p];
                                        break;
                                    case 25:
                                        h[n[++p]] = re(h[n[++p]]);
                                        break;
                                    case 26:
                                        h[n[++p]] = h[n[++p]] | h[n[++p]];
                                        break;
                                    case 27:
                                        h[n[++p]] = n[++p];
                                        break;
                                    case 28:
                                        h[n[++p]] = h[n[++p]][n[++p]];
                                        break;
                                    case 29:
                                        h[n[++p]] = n[++p],
                                            h[n[++p]][n[++p]] = h[n[++p]],
                                            h[n[++p]] = n[++p];
                                        break;
                                    case 30:
                                        h[n[++p]] = h[n[++p]].call(d, h[n[++p]], h[n[++p]]);
                                        break;
                                    case 31:
                                        h[n[++p]] = n[++p],
                                            h[n[++p]] = n[++p],
                                            h[n[++p]] = n[++p];
                                        break;
                                    case 32:
                                        h[n[++p]] = n[++p],
                                            h[n[++p]][h[n[++p]]] = h[n[++p]];
                                        break;
                                    case 33:
                                        h[n[++p]] = h[n[++p]] === n[++p];
                                        break;
                                    case 34:
                                        h[n[++p]] = h[n[++p]] + n[++p];
                                        break;
                                    case 35:
                                        h[n[++p]] += String.fromCharCode(n[++p]);
                                        break;
                                    case 36:
                                        h[n[++p]] = "",
                                            h[n[++p]] += String.fromCharCode(n[++p]);
                                        break;
                                    case 37:
                                        h[n[++p]] = h[n[++p]][n[++p]],
                                            h[n[++p]] = h[n[++p]][n[++p]],
                                            h[n[++p]] = h[n[++p]][n[++p]];
                                        break;
                                    case 38:
                                        h[n[++p]] = "",
                                            h[n[++p]] += String.fromCharCode(n[++p]),
                                            h[n[++p]] += String.fromCharCode(n[++p]);
                                        break;
                                    case 39:
                                        h[n[++p]] += String.fromCharCode(n[++p]),
                                            h[n[++p]] = h[n[++p]] === h[n[++p]],
                                            p += h[n[++p]] ? n[++p] : n[(++p,
                                                ++p)];
                                        break;
                                    case 40:
                                        h[n[++p]] = h[n[++p]] > h[n[++p]];
                                        break;
                                    case 41:
                                        h[n[++p]] = h[n[++p]] - h[n[++p]];
                                        break;
                                    case 42:
                                        h[n[++p]] = h[n[++p]] << h[n[++p]];
                                        break;
                                    case 43:
                                        h[n[++p]] = h[n[++p]] & h[n[++p]];
                                        break;
                                    case 44:
                                        h[n[++p]] = h[n[++p]] & n[++p];
                                        break;
                                    case 45:
                                        h[n[++p]] = -h[n[++p]];
                                        break;
                                    case 46:
                                        for (l = [],
                                            f = n[++p]; f > 0; f--)
                                            l.push(h[n[++p]]);
                                        h[n[++p]] = i(p + n[++p], l, o, s, u);
                                        try {
                                            Object.defineProperty(h[n[p - 1]], "length", {
                                                value: n[++p],
                                                configurable: !0,
                                                writable: !1,
                                                enumerable: !1
                                            })
                                        } catch (v) { }
                                        break;
                                    case 47:
                                        p += h[n[++p]] ? n[++p] : n[(++p,
                                            ++p)];
                                        break;
                                    case 48:
                                        h[n[++p]][n[++p]] = h[n[++p]];
                                        break;
                                    case 49:
                                        h[n[++p]] = ~h[n[++p]];
                                        break;
                                    case 50:
                                        h[n[++p]] = h[n[++p]].call(h[n[++p]]);
                                        break;
                                    case 51:
                                        h[n[++p]] = h[n[++p]] ^ h[n[++p]];
                                        break;
                                    case 52:
                                        h[n[++p]] = ++h[n[++p]];
                                        break;
                                    case 53:
                                        h[n[++p]] = !1;
                                        break;
                                    case 54:
                                        h[n[++p]] = h[n[++p]] >>> n[++p];
                                        break;
                                    case 55:
                                        h[n[++p]][n[++p]] = h[n[++p]],
                                            h[n[++p]] = n[++p],
                                            h[n[++p]][n[++p]] = h[n[++p]];
                                        break;
                                    case 56:
                                        h[n[++p]] = Array(n[++p]);
                                        break;
                                    case 57:
                                        h[n[++p]] += String.fromCharCode(n[++p]),
                                            h[n[++p]] += String.fromCharCode(n[++p]),
                                            h[n[++p]][n[++p]] = h[n[++p]];
                                        break;
                                    case 58:
                                        h[n[++p]] = h[n[++p]] % h[n[++p]];
                                        break;
                                    case 59:
                                        h[n[++p]] = h[n[++p]][h[n[++p]]],
                                            h[n[++p]] = h[n[++p]][n[++p]];
                                        break;
                                    case 60:
                                        h[n[++p]] = h[n[++p]][n[++p]],
                                            h[n[++p]] = n[++p];
                                        break;
                                    case 61:
                                        h[n[++p]] = h[n[++p]] - n[++p];
                                        break;
                                    case 62:
                                        h[n[++p]] = h[n[++p]] + h[n[++p]];
                                        break;
                                    case 63:
                                        h[n[++p]] = !h[n[++p]];
                                        break;
                                    case 64:
                                        h[n[++p]][h[n[++p]]] = h[n[++p]];
                                        break;
                                    case 65:
                                        for (h[n[++p]] += String.fromCharCode(n[++p]),
                                            l = [],
                                            f = n[++p]; f > 0; f--)
                                            l.push(h[n[++p]]);
                                        h[n[++p]] = i(p + n[++p], l, o, s, u);
                                        try {
                                            Object.defineProperty(h[n[p - 1]], "length", {
                                                value: n[++p],
                                                configurable: !0,
                                                writable: !1,
                                                enumerable: !1
                                            })
                                        } catch (y) { }
                                        h[n[++p]][h[n[++p]]] = h[n[++p]];
                                        break;
                                    case 66:
                                        h[n[++p]] = h[n[++p]] - 0;
                                        break;
                                    case 67:
                                        h[n[++p]] = h[n[++p]].call(h[n[++p]], h[n[++p]]);
                                        break;
                                    case 68:
                                        h[n[++p]] = h[n[++p]][n[++p]],
                                            h[n[++p]] = h[n[++p]],
                                            h[n[++p]] = h[n[++p]] - 0;
                                        break;
                                    case 69:
                                        h[n[++p]] = h[n[++p]][h[n[++p]]],
                                            h[n[++p]] = h[n[++p]] + h[n[++p]];
                                        break;
                                    case 70:
                                        h[n[++p]] = n[++p] + h[n[++p]];
                                        break;
                                    case 71:
                                        h[n[++p]] = h[n[++p]] << h[n[++p]],
                                            h[n[++p]] = h[n[++p]] | h[n[++p]],
                                            h[n[++p]][h[n[++p]]] = h[n[++p]];
                                        break;
                                    case 72:
                                        h[n[++p]] = h[n[++p]].call(h[n[++p]], h[n[++p]], h[n[++p]]);
                                        break;
                                    case 73:
                                        h[n[++p]] = h[n[++p]] >> n[++p];
                                        break;
                                    case 74:
                                        h[n[++p]][h[n[++p]]] = h[n[++p]],
                                            h[n[++p]][h[n[++p]]] = h[n[++p]],
                                            h[n[++p]][h[n[++p]]] = h[n[++p]];
                                        break;
                                    case 75:
                                        h[n[++p]] = n[++p],
                                            h[n[++p]][n[++p]] = h[n[++p]],
                                            p += h[n[++p]] ? n[++p] : n[(++p,
                                                ++p)];
                                        break;
                                    case 76:
                                        h[n[++p]] = h[n[++p]].call(d, h[n[++p]]);
                                        break;
                                    case 77:
                                        h[n[++p]] = h[n[++p]];
                                        break;
                                    case 78:
                                        h[n[++p]] = h[n[++p]][h[n[++p]]];
                                        break;
                                    case 79:
                                        h[n[++p]] = h[n[++p]][n[++p]],
                                            h[n[++p]] = h[n[++p]] >> n[++p],
                                            h[n[++p]] = h[n[++p]] & n[++p];
                                        break;
                                    case 80:
                                        h[n[++p]] = "";
                                        break;
                                    case 81:
                                        h[n[++p]] += String.fromCharCode(n[++p]),
                                            h[n[++p]] += String.fromCharCode(n[++p]),
                                            h[n[++p]] += String.fromCharCode(n[++p]);
                                        break;
                                    case 82:
                                        h[n[++p]] += String.fromCharCode(n[++p]),
                                            h[n[++p]] = h[n[++p]][h[n[++p]]],
                                            p += h[n[++p]] ? n[++p] : n[(++p,
                                                ++p)]
                                }
                        } catch (A) {
                            if (g.length > 0 && (r = []),
                                r.push(p),
                                0 === g.length)
                                throw u ? u(A, h, r) : A;
                            p = g.pop(),
                                r.pop()
                        }
                }
            }
            , a = function (e, t, o, s, u) {
                return function c() {
                    for (var l, f, h = [o, s, t, this, arguments, c, n, 0], d = void 0, p = e, g = []; ;)
                        try {
                            for (; ;)
                                switch (n[++p]) {
                                    case 0:
                                        h[n[++p]] = new h[n[++p]](h[n[++p]]);
                                        break;
                                    case 1:
                                        return h[n[++p]];
                                    case 2:
                                        for (l = [],
                                            f = n[++p]; f > 0; f--)
                                            l.push(h[n[++p]]);
                                        h[n[++p]] = a(p + n[++p], l, o, s, u);
                                        try {
                                            Object.defineProperty(h[n[p - 1]], "length", {
                                                value: n[++p],
                                                configurable: !0,
                                                writable: !1,
                                                enumerable: !1
                                            })
                                        } catch (m) { }
                                        break;
                                    case 3:
                                        h[n[++p]] = h[n[++p]] < h[n[++p]];
                                        break;
                                    case 4:
                                        h[n[++p]] += String.fromCharCode(n[++p]),
                                            h[n[++p]] += String.fromCharCode(n[++p]),
                                            h[n[++p]] = h[n[++p]][h[n[++p]]];
                                        break;
                                    case 5:
                                        h[n[++p]] = h[n[++p]] >= n[++p];
                                        break;
                                    case 6:
                                        h[n[++p]] = h[n[++p]] >> n[++p],
                                            h[n[++p]] = h[n[++p]][h[n[++p]]];
                                        break;
                                    case 7:
                                        h[n[++p]] = h[n[++p]] < n[++p];
                                        break;
                                    case 8:
                                        h[n[++p]] = h[n[++p]].call(d);
                                        break;
                                    case 9:
                                        h[n[++p]] = "",
                                            h[n[++p]] += String.fromCharCode(n[++p]),
                                            h[n[++p]] = n[++p];
                                        break;
                                    case 10:
                                        h[n[++p]] = h[n[++p]] | n[++p];
                                        break;
                                    case 11:
                                        h[n[++p]] = h[n[++p]] & n[++p],
                                            h[n[++p]] = h[n[++p]][h[n[++p]]];
                                        break;
                                    case 12:
                                        h[n[++p]] = {};
                                        break;
                                    case 13:
                                        h[n[++p]] = h[n[++p]] | h[n[++p]],
                                            h[n[++p]][h[n[++p]]] = h[n[++p]],
                                            p += h[n[++p]] ? n[++p] : n[(++p,
                                                ++p)];
                                        break;
                                    case 14:
                                        h[n[++p]] = d;
                                        break;
                                    case 15:
                                        h[n[++p]] = n[++p],
                                            h[n[++p]] = h[n[++p]][n[++p]],
                                            h[n[++p]] = n[++p];
                                        break;
                                    case 16:
                                        h[n[++p]] = !0;
                                        break;
                                    case 17:
                                        h[n[++p]] = h[n[++p]] === h[n[++p]];
                                        break;
                                    case 18:
                                        h[n[++p]] = h[n[++p]] / h[n[++p]];
                                        break;
                                    case 19:
                                        h[n[++p]][h[n[++p]]] = h[n[++p]],
                                            h[n[++p]] = "",
                                            h[n[++p]] += String.fromCharCode(n[++p]);
                                        break;
                                    case 20:
                                        h[n[++p]][n[++p]] = h[n[++p]],
                                            h[n[++p]][n[++p]] = h[n[++p]],
                                            h[n[++p]][n[++p]] = h[n[++p]];
                                        break;
                                    case 21:
                                        h[n[++p]] = h[n[++p]] * h[n[++p]];
                                        break;
                                    case 22:
                                        h[n[++p]] = ++h[n[++p]],
                                            h[n[++p]] = h[n[++p]];
                                        break;
                                    case 23:
                                        h[n[++p]] += String.fromCharCode(n[++p]),
                                            h[n[++p]] = h[n[++p]][h[n[++p]]],
                                            h[n[++p]] = h[n[++p]];
                                        break;
                                    case 24:
                                        h[n[++p]] = h[n[++p]] << n[++p];
                                        break;
                                    case 25:
                                        h[n[++p]] = re(h[n[++p]]);
                                        break;
                                    case 26:
                                        h[n[++p]] = h[n[++p]] | h[n[++p]];
                                        break;
                                    case 27:
                                        h[n[++p]] = n[++p];
                                        break;
                                    case 28:
                                        h[n[++p]] = h[n[++p]][n[++p]];
                                        break;
                                    case 29:
                                        h[n[++p]] = n[++p],
                                            h[n[++p]][n[++p]] = h[n[++p]],
                                            h[n[++p]] = n[++p];
                                        break;
                                    case 30:
                                        h[n[++p]] = h[n[++p]].call(d, h[n[++p]], h[n[++p]]);
                                        break;
                                    case 31:
                                        h[n[++p]] = n[++p],
                                            h[n[++p]] = n[++p],
                                            h[n[++p]] = n[++p];
                                        break;
                                    case 32:
                                        h[n[++p]] = n[++p],
                                            h[n[++p]][h[n[++p]]] = h[n[++p]];
                                        break;
                                    case 33:
                                        h[n[++p]] = h[n[++p]] === n[++p];
                                        break;
                                    case 34:
                                        h[n[++p]] = h[n[++p]] + n[++p];
                                        break;
                                    case 35:
                                        h[n[++p]] += String.fromCharCode(n[++p]);
                                        break;
                                    case 36:
                                        h[n[++p]] = "",
                                            h[n[++p]] += String.fromCharCode(n[++p]);
                                        break;
                                    case 37:
                                        h[n[++p]] = h[n[++p]][n[++p]],
                                            h[n[++p]] = h[n[++p]][n[++p]],
                                            h[n[++p]] = h[n[++p]][n[++p]];
                                        break;
                                    case 38:
                                        h[n[++p]] = "",
                                            h[n[++p]] += String.fromCharCode(n[++p]),
                                            h[n[++p]] += String.fromCharCode(n[++p]);
                                        break;
                                    case 39:
                                        h[n[++p]] += String.fromCharCode(n[++p]),
                                            h[n[++p]] = h[n[++p]] === h[n[++p]],
                                            p += h[n[++p]] ? n[++p] : n[(++p,
                                                ++p)];
                                        break;
                                    case 40:
                                        h[n[++p]] = h[n[++p]] > h[n[++p]];
                                        break;
                                    case 41:
                                        h[n[++p]] = h[n[++p]] - h[n[++p]];
                                        break;
                                    case 42:
                                        h[n[++p]] = h[n[++p]] << h[n[++p]];
                                        break;
                                    case 43:
                                        h[n[++p]] = h[n[++p]] & h[n[++p]];
                                        break;
                                    case 44:
                                        h[n[++p]] = h[n[++p]] & n[++p];
                                        break;
                                    case 45:
                                        h[n[++p]] = -h[n[++p]];
                                        break;
                                    case 46:
                                        for (l = [],
                                            f = n[++p]; f > 0; f--)
                                            l.push(h[n[++p]]);
                                        h[n[++p]] = i(p + n[++p], l, o, s, u);
                                        try {
                                            Object.defineProperty(h[n[p - 1]], "length", {
                                                value: n[++p],
                                                configurable: !0,
                                                writable: !1,
                                                enumerable: !1
                                            })
                                        } catch (v) { }
                                        break;
                                    case 47:
                                        p += h[n[++p]] ? n[++p] : n[(++p,
                                            ++p)];
                                        break;
                                    case 48:
                                        h[n[++p]][n[++p]] = h[n[++p]];
                                        break;
                                    case 49:
                                        h[n[++p]] = ~h[n[++p]];
                                        break;
                                    case 50:
                                        h[n[++p]] = h[n[++p]].call(h[n[++p]]);
                                        break;
                                    case 51:
                                        h[n[++p]] = h[n[++p]] ^ h[n[++p]];
                                        break;
                                    case 52:
                                        h[n[++p]] = ++h[n[++p]];
                                        break;
                                    case 53:
                                        h[n[++p]] = !1;
                                        break;
                                    case 54:
                                        h[n[++p]] = h[n[++p]] >>> n[++p];
                                        break;
                                    case 55:
                                        h[n[++p]][n[++p]] = h[n[++p]],
                                            h[n[++p]] = n[++p],
                                            h[n[++p]][n[++p]] = h[n[++p]];
                                        break;
                                    case 56:
                                        h[n[++p]] = Array(n[++p]);
                                        break;
                                    case 57:
                                        h[n[++p]] += String.fromCharCode(n[++p]),
                                            h[n[++p]] += String.fromCharCode(n[++p]),
                                            h[n[++p]][n[++p]] = h[n[++p]];
                                        break;
                                    case 58:
                                        h[n[++p]] = h[n[++p]] % h[n[++p]];
                                        break;
                                    case 59:
                                        h[n[++p]] = h[n[++p]][h[n[++p]]],
                                            h[n[++p]] = h[n[++p]][n[++p]];
                                        break;
                                    case 60:
                                        h[n[++p]] = h[n[++p]][n[++p]],
                                            h[n[++p]] = n[++p];
                                        break;
                                    case 61:
                                        h[n[++p]] = h[n[++p]] - n[++p];
                                        break;
                                    case 62:
                                        h[n[++p]] = h[n[++p]] + h[n[++p]];
                                        break;
                                    case 63:
                                        h[n[++p]] = !h[n[++p]];
                                        break;
                                    case 64:
                                        h[n[++p]][h[n[++p]]] = h[n[++p]];
                                        break;
                                    case 65:
                                        for (h[n[++p]] += String.fromCharCode(n[++p]),
                                            l = [],
                                            f = n[++p]; f > 0; f--)
                                            l.push(h[n[++p]]);
                                        h[n[++p]] = i(p + n[++p], l, o, s, u);
                                        try {
                                            Object.defineProperty(h[n[p - 1]], "length", {
                                                value: n[++p],
                                                configurable: !0,
                                                writable: !1,
                                                enumerable: !1
                                            })
                                        } catch (y) { }
                                        h[n[++p]][h[n[++p]]] = h[n[++p]];
                                        break;
                                    case 66:
                                        h[n[++p]] = h[n[++p]] - 0;
                                        break;
                                    case 67:
                                        h[n[++p]] = h[n[++p]].call(h[n[++p]], h[n[++p]]);
                                        break;
                                    case 68:
                                        h[n[++p]] = h[n[++p]][n[++p]],
                                            h[n[++p]] = h[n[++p]],
                                            h[n[++p]] = h[n[++p]] - 0;
                                        break;
                                    case 69:
                                        h[n[++p]] = h[n[++p]][h[n[++p]]],
                                            h[n[++p]] = h[n[++p]] + h[n[++p]];
                                        break;
                                    case 70:
                                        h[n[++p]] = n[++p] + h[n[++p]];
                                        break;
                                    case 71:
                                        h[n[++p]] = h[n[++p]] << h[n[++p]],
                                            h[n[++p]] = h[n[++p]] | h[n[++p]],
                                            h[n[++p]][h[n[++p]]] = h[n[++p]];
                                        break;
                                    case 72:
                                        h[n[++p]] = h[n[++p]].call(h[n[++p]], h[n[++p]], h[n[++p]]);
                                        break;
                                    case 73:
                                        h[n[++p]] = h[n[++p]] >> n[++p];
                                        break;
                                    case 74:
                                        h[n[++p]][h[n[++p]]] = h[n[++p]],
                                            h[n[++p]][h[n[++p]]] = h[n[++p]],
                                            h[n[++p]][h[n[++p]]] = h[n[++p]];
                                        break;
                                    case 75:
                                        h[n[++p]] = n[++p],
                                            h[n[++p]][n[++p]] = h[n[++p]],
                                            p += h[n[++p]] ? n[++p] : n[(++p,
                                                ++p)];
                                        break;
                                    case 76:
                                        h[n[++p]] = h[n[++p]].call(d, h[n[++p]]);
                                        break;
                                    case 77:
                                        h[n[++p]] = h[n[++p]];
                                        break;
                                    case 78:
                                        h[n[++p]] = h[n[++p]][h[n[++p]]];
                                        break;
                                    case 79:
                                        h[n[++p]] = h[n[++p]][n[++p]],
                                            h[n[++p]] = h[n[++p]] >> n[++p],
                                            h[n[++p]] = h[n[++p]] & n[++p];
                                        break;
                                    case 80:
                                        h[n[++p]] = "";
                                        break;
                                    case 81:
                                        h[n[++p]] += String.fromCharCode(n[++p]),
                                            h[n[++p]] += String.fromCharCode(n[++p]),
                                            h[n[++p]] += String.fromCharCode(n[++p]);
                                        break;
                                    case 82:
                                        h[n[++p]] += String.fromCharCode(n[++p]),
                                            h[n[++p]] = h[n[++p]][h[n[++p]]],
                                            p += h[n[++p]] ? n[++p] : n[(++p,
                                                ++p)]
                                }
                        } catch (A) {
                            if (g.length > 0 && (r = []),
                                r.push(p),
                                0 === g.length)
                                throw u ? u(A, h, r) : A;
                            p = g.pop(),
                                r.pop()
                        }
                }
            };
        return t ? i : a
    }
}
)()("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", !1)(3944, [], ne, [void 0, 1732584193, 4023233417, 2562383102, 3285377520, !1, !0, 2147483648, 4294967295, 4294967296, 1518500249, 1859775393, 1894007588], void 0)();
var ie = ne._getSecuritySign;
delete ne._getSecuritySign;
var oe = "undefined" !== typeof e ? e : "undefined" !== typeof window ? window : "undefined" !== typeof self ? self : void 0;
(function () {
    var e = [];
    function t(e, t, n) {
        for (var r = [], i = 0; i++ < t;)
            r.push(e += n);
        return r
    }
    var n = t(0, 43, 0).concat([62, 0, 62, 0, 63]).concat(t(51, 10, 1)).concat(t(0, 8, 0)).concat(t(0, 25, 1)).concat([0, 0, 0, 0, 63, 0]).concat(t(25, 26, 1));
    function r(e) {
        for (var t, r, i = String(e).replace(/[=]+$/, ""), o = i.length, a = 0, s = 0, u = []; s < o; s++)
            ~(r = n[i.charCodeAt(s)]) && (t = a % 4 ? 64 * t + r : r,
                a++ % 4) && u.push(255 & t >> (-2 * a & 6));
        return u
    }
    function i(e) {
        return e >> 1 ^ -(1 & e)
    }
    var o = function (e) {
        for (var t = [], n = "undefined" != typeof Int8Array ? new Int8Array(r(e)) : r(e), o = n.length, a = 0; o > a;) {
            var s = n[a++]
                , u = 127 & s;
            s >= 0 ? t.push(i(u)) : (u |= (127 & (s = n[a++])) << 7,
                s >= 0 || (u |= (127 & (s = n[a++])) << 14,
                    s >= 0 || (u |= (127 & (s = n[a++])) << 21,
                        s >= 0 || (u |= (s = n[a++]) << 28))),
                t.push(i(u)))
        }
        return t
    };
    return function (t, n) {
        var r = o(t)
            , i = function (t, n, o, s, u) {
                return function c() {
                    for (var l, f, h = [o, s, n, this, arguments, c, r, 0], d = void 0, p = t, g = []; ;)
                        try {
                            for (; ;)
                                switch (r[++p]) {
                                    case 0:
                                        h[r[++p]] = h[r[++p]][h[r[++p]]],
                                            h[r[++p]] = h[r[++p]] + h[r[++p]];
                                        break;
                                    case 1:
                                        h[r[++p]] = !1;
                                        break;
                                    case 2:
                                        h[r[++p]] = h[r[++p]].call(h[r[++p]], h[r[++p]], h[r[++p]]);
                                        break;
                                    case 3:
                                        h[r[++p]] = h[r[++p]].call(h[r[++p]], h[r[++p]]);
                                        break;
                                    case 4:
                                        h[r[++p]] = h[r[++p]] & r[++p];
                                        break;
                                    case 5:
                                        h[r[++p]] = h[r[++p]] | h[r[++p]];
                                        break;
                                    case 6:
                                        for (l = [],
                                            f = r[++p]; f > 0; f--)
                                            l.push(h[r[++p]]);
                                        h[r[++p]] = i(p + r[++p], l, o, s, u);
                                        try {
                                            Object.defineProperty(h[r[p - 1]], "length", {
                                                value: r[++p],
                                                configurable: !0,
                                                writable: !1,
                                                enumerable: !1
                                            })
                                        } catch (e) { }
                                        break;
                                    case 7:
                                        h[r[++p]] = h[r[++p]][h[r[++p]]];
                                        break;
                                    case 8:
                                        h[r[++p]] = h[r[++p]] - 0;
                                        break;
                                    case 9:
                                        h[r[++p]] = h[r[++p]] ^ h[r[++p]];
                                        break;
                                    case 10:
                                        h[r[++p]][r[++p]] = h[r[++p]],
                                            h[r[++p]] = r[++p],
                                            h[r[++p]][r[++p]] = h[r[++p]];
                                        break;
                                    case 11:
                                        h[r[++p]] = new h[r[++p]];
                                        break;
                                    case 12:
                                        h[r[++p]] += String.fromCharCode(r[++p]),
                                            h[r[++p]] += String.fromCharCode(r[++p]);
                                        break;
                                    case 13:
                                        for (l = [],
                                            f = r[++p]; f > 0; f--)
                                            l.push(h[r[++p]]);
                                        h[r[++p]] = a(p + r[++p], l, o, s, u);
                                        try {
                                            Object.defineProperty(h[r[p - 1]], "length", {
                                                value: r[++p],
                                                configurable: !0,
                                                writable: !1,
                                                enumerable: !1
                                            })
                                        } catch (e) { }
                                        break;
                                    case 14:
                                        h[r[++p]] = h[r[++p]][r[++p]],
                                            h[r[++p]] = Array(r[++p]),
                                            h[r[++p]][r[++p]] = h[r[++p]];
                                        break;
                                    case 15:
                                        h[r[++p]] = h[r[++p]],
                                            h[r[++p]] = h[r[++p]];
                                        break;
                                    case 16:
                                        h[r[++p]] = h[r[++p]].call(h[r[++p]]);
                                        break;
                                    case 17:
                                        return h[r[++p]];
                                    case 18:
                                        h[r[++p]] += String.fromCharCode(r[++p]),
                                            h[r[++p]][r[++p]] = h[r[++p]];
                                        break;
                                    case 19:
                                        h[r[++p]] = h[r[++p]] + h[r[++p]],
                                            h[r[++p]] = h[r[++p]];
                                        break;
                                    case 20:
                                        h[r[++p]][r[++p]] = h[r[++p]],
                                            p += h[r[++p]] ? r[++p] : r[(++p,
                                                ++p)];
                                        break;
                                    case 21:
                                        h[r[++p]] = h[r[++p]] + r[++p];
                                        break;
                                    case 22:
                                        h[r[++p]] = new h[r[++p]](h[r[++p]]);
                                        break;
                                    case 23:
                                        p += h[r[++p]] ? r[++p] : r[(++p,
                                            ++p)];
                                        break;
                                    case 24:
                                        h[r[++p]][h[r[++p]]] = h[r[++p]];
                                        break;
                                    case 25:
                                        h[r[++p]] = "",
                                            h[r[++p]] += String.fromCharCode(r[++p]);
                                        break;
                                    case 26:
                                        h[r[++p]] = ++h[r[++p]];
                                        break;
                                    case 27:
                                        h[r[++p]] += String.fromCharCode(r[++p]);
                                        break;
                                    case 28:
                                        h[r[++p]] = "";
                                        break;
                                    case 29:
                                        for (l = [],
                                            f = r[++p]; f > 0; f--)
                                            l.push(h[r[++p]]);
                                        h[r[++p]] = h[r[++p]].apply(h[r[++p]], l);
                                        break;
                                    case 30:
                                        h[r[++p]] = h[r[++p]].call(d);
                                        break;
                                    case 31:
                                        h[r[++p]] = h[r[++p]],
                                            h[r[++p]] = h[r[++p]] >> r[++p],
                                            h[r[++p]] = h[r[++p]] & r[++p];
                                        break;
                                    case 32:
                                        h[r[++p]] = typeof h[r[++p]],
                                            h[r[++p]] = "";
                                        break;
                                    case 33:
                                        h[r[++p]] = h[r[++p]];
                                        break;
                                    case 34:
                                        h[r[++p]] = null;
                                        break;
                                    case 35:
                                        h[r[++p]] += String.fromCharCode(r[++p]),
                                            h[r[++p]] = h[r[++p]][r[++p]],
                                            h[r[++p]] = "";
                                        break;
                                    case 36:
                                        h[r[++p]] = d;
                                        break;
                                    case 37:
                                        for (h[r[++p]] = h[r[++p]][h[r[++p]]],
                                            l = [],
                                            f = r[++p]; f > 0; f--)
                                            l.push(h[r[++p]]);
                                        h[r[++p]] = i(p + r[++p], l, o, s, u);
                                        try {
                                            Object.defineProperty(h[r[p - 1]], "length", {
                                                value: r[++p],
                                                configurable: !0,
                                                writable: !1,
                                                enumerable: !1
                                            })
                                        } catch (e) { }
                                        h[r[++p]] = h[r[++p]].call(h[r[++p]], h[r[++p]]);
                                        break;
                                    case 38:
                                        h[r[++p]] = h[r[++p]][h[r[++p]]],
                                            h[r[++p]] = h[r[++p]][r[++p]];
                                        break;
                                    case 39:
                                        h[r[++p]] = r[++p],
                                            h[r[++p]][r[++p]] = h[r[++p]];
                                        break;
                                    case 40:
                                        h[r[++p]] = h[r[++p]].call(h[r[++p]], h[r[++p]], h[r[++p]], h[r[++p]]);
                                        break;
                                    case 41:
                                        h[r[++p]] = h[r[++p]].call(d, h[r[++p]], h[r[++p]]);
                                        break;
                                    case 42:
                                        h[r[++p]] = h[r[++p]][h[r[++p]]],
                                            h[r[++p]] = typeof h[r[++p]],
                                            h[r[++p]] = "";
                                        break;
                                    case 43:
                                        h[r[++p]] += String.fromCharCode(r[++p]),
                                            h[r[++p]] = r[++p],
                                            h[r[++p]] += String.fromCharCode(r[++p]);
                                        break;
                                    case 44:
                                        h[r[++p]] += String.fromCharCode(r[++p]),
                                            h[r[++p]] = h[r[++p]][h[r[++p]]];
                                        break;
                                    case 45:
                                        h[r[++p]] = h[r[++p]] << r[++p];
                                        break;
                                    case 46:
                                        return h[r[++p]] = d,
                                            h[r[++p]];
                                    case 47:
                                        h[r[++p]] = h[r[++p]][h[r[++p]]],
                                            h[r[++p]] = h[r[++p]] < h[r[++p]],
                                            p += h[r[++p]] ? r[++p] : r[(++p,
                                                ++p)];
                                        break;
                                    case 48:
                                        h[r[++p]] = h[r[++p]][r[++p]],
                                            h[r[++p]] = h[r[++p]][r[++p]];
                                        break;
                                    case 49:
                                        h[r[++p]] = h[r[++p]],
                                            h[r[++p]] = h[r[++p]][h[r[++p]]],
                                            h[r[++p]] = h[r[++p]] + h[r[++p]];
                                        break;
                                    case 50:
                                        h[r[++p]][r[++p]] = h[r[++p]];
                                        break;
                                    case 51:
                                        h[r[++p]] = !0;
                                        break;
                                    case 52:
                                        h[r[++p]] = h[r[++p]] === r[++p];
                                        break;
                                    case 53:
                                        h[r[++p]] = {};
                                        break;
                                    case 54:
                                        h[r[++p]] += String.fromCharCode(r[++p]),
                                            h[r[++p]] = h[r[++p]] === h[r[++p]],
                                            p += h[r[++p]] ? r[++p] : r[(++p,
                                                ++p)];
                                        break;
                                    case 55:
                                        h[r[++p]] = h[r[++p]].call(d, h[r[++p]]);
                                        break;
                                    case 56:
                                        h[r[++p]] = r[++p];
                                        break;
                                    case 57:
                                        h[r[++p]][r[++p]] = h[r[++p]],
                                            h[r[++p]] = h[r[++p]][r[++p]],
                                            h[r[++p]] = "";
                                        break;
                                    case 58:
                                        h[r[++p]] = Array(r[++p]);
                                        break;
                                    case 59:
                                        h[r[++p]] = h[r[++p]][r[++p]];
                                        break;
                                    case 60:
                                        h[r[++p]] = h[r[++p]] % h[r[++p]];
                                        break;
                                    case 61:
                                        h[r[++p]] = h[r[++p]] < h[r[++p]];
                                        break;
                                    case 62:
                                        h[r[++p]] = -h[r[++p]];
                                        break;
                                    case 63:
                                        h[r[++p]] = h[r[++p]] === h[r[++p]];
                                        break;
                                    case 64:
                                        h[r[++p]] = r[++p],
                                            h[r[++p]] = h[r[++p]],
                                            p += h[r[++p]] ? r[++p] : r[(++p,
                                                ++p)];
                                        break;
                                    case 65:
                                        h[r[++p]] = h[r[++p]] > h[r[++p]];
                                        break;
                                    case 66:
                                        h[r[++p]] = h[r[++p]],
                                            p += h[r[++p]] ? r[++p] : r[(++p,
                                                ++p)];
                                        break;
                                    case 67:
                                        h[r[++p]] = !h[r[++p]];
                                        break;
                                    case 68:
                                        h[r[++p]] = h[r[++p]],
                                            h[r[++p]] = h[r[++p]] + r[++p],
                                            h[r[++p]] = ""
                                }
                        } catch (t) {
                            if (g.length > 0 && (e = []),
                                e.push(p),
                                0 === g.length)
                                throw u ? u(t, h, e) : t;
                            p = g.pop(),
                                e.pop()
                        }
                }
            }
            , a = function (t, n, o, s, u) {
                return function c() {
                    for (var l, f, h = [o, s, n, this, arguments, c, r, 0], d = void 0, p = t, g = []; ;)
                        try {
                            for (; ;)
                                switch (r[++p]) {
                                    case 0:
                                        h[r[++p]] = h[r[++p]][h[r[++p]]],
                                            h[r[++p]] = h[r[++p]] + h[r[++p]];
                                        break;
                                    case 1:
                                        h[r[++p]] = !1;
                                        break;
                                    case 2:
                                        h[r[++p]] = h[r[++p]].call(h[r[++p]], h[r[++p]], h[r[++p]]);
                                        break;
                                    case 3:
                                        h[r[++p]] = h[r[++p]].call(h[r[++p]], h[r[++p]]);
                                        break;
                                    case 4:
                                        h[r[++p]] = h[r[++p]] & r[++p];
                                        break;
                                    case 5:
                                        h[r[++p]] = h[r[++p]] | h[r[++p]];
                                        break;
                                    case 6:
                                        for (l = [],
                                            f = r[++p]; f > 0; f--)
                                            l.push(h[r[++p]]);
                                        h[r[++p]] = i(p + r[++p], l, o, s, u);
                                        try {
                                            Object.defineProperty(h[r[p - 1]], "length", {
                                                value: r[++p],
                                                configurable: !0,
                                                writable: !1,
                                                enumerable: !1
                                            })
                                        } catch (e) { }
                                        break;
                                    case 7:
                                        h[r[++p]] = h[r[++p]][h[r[++p]]];
                                        break;
                                    case 8:
                                        h[r[++p]] = h[r[++p]] - 0;
                                        break;
                                    case 9:
                                        h[r[++p]] = h[r[++p]] ^ h[r[++p]];
                                        break;
                                    case 10:
                                        h[r[++p]][r[++p]] = h[r[++p]],
                                            h[r[++p]] = r[++p],
                                            h[r[++p]][r[++p]] = h[r[++p]];
                                        break;
                                    case 11:
                                        h[r[++p]] = new h[r[++p]];
                                        break;
                                    case 12:
                                        h[r[++p]] += String.fromCharCode(r[++p]),
                                            h[r[++p]] += String.fromCharCode(r[++p]);
                                        break;
                                    case 13:
                                        for (l = [],
                                            f = r[++p]; f > 0; f--)
                                            l.push(h[r[++p]]);
                                        h[r[++p]] = a(p + r[++p], l, o, s, u);
                                        try {
                                            Object.defineProperty(h[r[p - 1]], "length", {
                                                value: r[++p],
                                                configurable: !0,
                                                writable: !1,
                                                enumerable: !1
                                            })
                                        } catch (e) { }
                                        break;
                                    case 14:
                                        h[r[++p]] = h[r[++p]][r[++p]],
                                            h[r[++p]] = Array(r[++p]),
                                            h[r[++p]][r[++p]] = h[r[++p]];
                                        break;
                                    case 15:
                                        h[r[++p]] = h[r[++p]],
                                            h[r[++p]] = h[r[++p]];
                                        break;
                                    case 16:
                                        h[r[++p]] = h[r[++p]].call(h[r[++p]]);
                                        break;
                                    case 17:
                                        return h[r[++p]];
                                    case 18:
                                        h[r[++p]] += String.fromCharCode(r[++p]),
                                            h[r[++p]][r[++p]] = h[r[++p]];
                                        break;
                                    case 19:
                                        h[r[++p]] = h[r[++p]] + h[r[++p]],
                                            h[r[++p]] = h[r[++p]];
                                        break;
                                    case 20:
                                        h[r[++p]][r[++p]] = h[r[++p]],
                                            p += h[r[++p]] ? r[++p] : r[(++p,
                                                ++p)];
                                        break;
                                    case 21:
                                        h[r[++p]] = h[r[++p]] + r[++p];
                                        break;
                                    case 22:
                                        h[r[++p]] = new h[r[++p]](h[r[++p]]);
                                        break;
                                    case 23:
                                        p += h[r[++p]] ? r[++p] : r[(++p,
                                            ++p)];
                                        break;
                                    case 24:
                                        h[r[++p]][h[r[++p]]] = h[r[++p]];
                                        break;
                                    case 25:
                                        h[r[++p]] = "",
                                            h[r[++p]] += String.fromCharCode(r[++p]);
                                        break;
                                    case 26:
                                        h[r[++p]] = ++h[r[++p]];
                                        break;
                                    case 27:
                                        h[r[++p]] += String.fromCharCode(r[++p]);
                                        break;
                                    case 28:
                                        h[r[++p]] = "";
                                        break;
                                    case 29:
                                        for (l = [],
                                            f = r[++p]; f > 0; f--)
                                            l.push(h[r[++p]]);
                                        h[r[++p]] = h[r[++p]].apply(h[r[++p]], l);
                                        break;
                                    case 30:
                                        h[r[++p]] = h[r[++p]].call(d);
                                        break;
                                    case 31:
                                        h[r[++p]] = h[r[++p]],
                                            h[r[++p]] = h[r[++p]] >> r[++p],
                                            h[r[++p]] = h[r[++p]] & r[++p];
                                        break;
                                    case 32:
                                        h[r[++p]] = typeof h[r[++p]],
                                            h[r[++p]] = "";
                                        break;
                                    case 33:
                                        h[r[++p]] = h[r[++p]];
                                        break;
                                    case 34:
                                        h[r[++p]] = null;
                                        break;
                                    case 35:
                                        h[r[++p]] += String.fromCharCode(r[++p]),
                                            h[r[++p]] = h[r[++p]][r[++p]],
                                            h[r[++p]] = "";
                                        break;
                                    case 36:
                                        h[r[++p]] = d;
                                        break;
                                    case 37:
                                        for (h[r[++p]] = h[r[++p]][h[r[++p]]],
                                            l = [],
                                            f = r[++p]; f > 0; f--)
                                            l.push(h[r[++p]]);
                                        h[r[++p]] = i(p + r[++p], l, o, s, u);
                                        try {
                                            Object.defineProperty(h[r[p - 1]], "length", {
                                                value: r[++p],
                                                configurable: !0,
                                                writable: !1,
                                                enumerable: !1
                                            })
                                        } catch (e) { }
                                        h[r[++p]] = h[r[++p]].call(h[r[++p]], h[r[++p]]);
                                        break;
                                    case 38:
                                        h[r[++p]] = h[r[++p]][h[r[++p]]],
                                            h[r[++p]] = h[r[++p]][r[++p]];
                                        break;
                                    case 39:
                                        h[r[++p]] = r[++p],
                                            h[r[++p]][r[++p]] = h[r[++p]];
                                        break;
                                    case 40:
                                        h[r[++p]] = h[r[++p]].call(h[r[++p]], h[r[++p]], h[r[++p]], h[r[++p]]);
                                        break;
                                    case 41:
                                        h[r[++p]] = h[r[++p]].call(d, h[r[++p]], h[r[++p]]);
                                        break;
                                    case 42:
                                        h[r[++p]] = h[r[++p]][h[r[++p]]],
                                            h[r[++p]] = typeof h[r[++p]],
                                            h[r[++p]] = "";
                                        break;
                                    case 43:
                                        h[r[++p]] += String.fromCharCode(r[++p]),
                                            h[r[++p]] = r[++p],
                                            h[r[++p]] += String.fromCharCode(r[++p]);
                                        break;
                                    case 44:
                                        h[r[++p]] += String.fromCharCode(r[++p]),
                                            h[r[++p]] = h[r[++p]][h[r[++p]]];
                                        break;
                                    case 45:
                                        h[r[++p]] = h[r[++p]] << r[++p];
                                        break;
                                    case 46:
                                        return h[r[++p]] = d,
                                            h[r[++p]];
                                    case 47:
                                        h[r[++p]] = h[r[++p]][h[r[++p]]],
                                            h[r[++p]] = h[r[++p]] < h[r[++p]],
                                            p += h[r[++p]] ? r[++p] : r[(++p,
                                                ++p)];
                                        break;
                                    case 48:
                                        h[r[++p]] = h[r[++p]][r[++p]],
                                            h[r[++p]] = h[r[++p]][r[++p]];
                                        break;
                                    case 49:
                                        h[r[++p]] = h[r[++p]],
                                            h[r[++p]] = h[r[++p]][h[r[++p]]],
                                            h[r[++p]] = h[r[++p]] + h[r[++p]];
                                        break;
                                    case 50:
                                        h[r[++p]][r[++p]] = h[r[++p]];
                                        break;
                                    case 51:
                                        h[r[++p]] = !0;
                                        break;
                                    case 52:
                                        h[r[++p]] = h[r[++p]] === r[++p];
                                        break;
                                    case 53:
                                        h[r[++p]] = {};
                                        break;
                                    case 54:
                                        h[r[++p]] += String.fromCharCode(r[++p]),
                                            h[r[++p]] = h[r[++p]] === h[r[++p]],
                                            p += h[r[++p]] ? r[++p] : r[(++p,
                                                ++p)];
                                        break;
                                    case 55:
                                        h[r[++p]] = h[r[++p]].call(d, h[r[++p]]);
                                        break;
                                    case 56:
                                        h[r[++p]] = r[++p];
                                        break;
                                    case 57:
                                        h[r[++p]][r[++p]] = h[r[++p]],
                                            h[r[++p]] = h[r[++p]][r[++p]],
                                            h[r[++p]] = "";
                                        break;
                                    case 58:
                                        h[r[++p]] = Array(r[++p]);
                                        break;
                                    case 59:
                                        h[r[++p]] = h[r[++p]][r[++p]];
                                        break;
                                    case 60:
                                        h[r[++p]] = h[r[++p]] % h[r[++p]];
                                        break;
                                    case 61:
                                        h[r[++p]] = h[r[++p]] < h[r[++p]];
                                        break;
                                    case 62:
                                        h[r[++p]] = -h[r[++p]];
                                        break;
                                    case 63:
                                        h[r[++p]] = h[r[++p]] === h[r[++p]];
                                        break;
                                    case 64:
                                        h[r[++p]] = r[++p],
                                            h[r[++p]] = h[r[++p]],
                                            p += h[r[++p]] ? r[++p] : r[(++p,
                                                ++p)];
                                        break;
                                    case 65:
                                        h[r[++p]] = h[r[++p]] > h[r[++p]];
                                        break;
                                    case 66:
                                        h[r[++p]] = h[r[++p]],
                                            p += h[r[++p]] ? r[++p] : r[(++p,
                                                ++p)];
                                        break;
                                    case 67:
                                        h[r[++p]] = !h[r[++p]];
                                        break;
                                    case 68:
                                        h[r[++p]] = h[r[++p]],
                                            h[r[++p]] = h[r[++p]] + r[++p],
                                            h[r[++p]] = ""
                                }
                        } catch (t) {
                            if (g.length > 0 && (e = []),
                                e.push(p),
                                0 === g.length)
                                throw u ? u(t, h, e) : t;
                            p = g.pop(),
                                e.pop()
                        }
                }
            };
        return n ? i : a
    }
}
)()("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", !1)(6151, [], oe, [void 0, null, !0, !1], void 0)();


//用户代码
//异步执行代码
