const { VM, VMScript } = require("vm2")
const fs = require("fs")
const path = require("path")
const user = require("../config/user.config.js")
const tools = require("../config/tools.config.js")
const env = require("../config/env.config.js")
const name = "test"

//清空日志
fs.writeFileSync(`./user/${name}/log.txt`, "")

//创建沙箱并导入模块
const vm = new VM({
    sandbox:{
        fs,
        _name_:name,
        path,
        __dirname: __dirname,
        // ✅ 强制注入 Proxy，解决报错
        Proxy: Proxy,
        Reflect: Reflect
    },
    // ✅ 允许修改全局，让 Proxy 能正常使用
    allowProxy: true
})

// 全部使用绝对路径，不会错
const configCode = fs.readFileSync(path.join(__dirname, "config/config.js"), 'utf8')
const toolsCode = tools.getCode()
const envCode = env.getCode()
const globalVarCode = tools.getFile("globalVar")
const userVarCode = user.getCode(name, "userVar")
const proxyObjCode = tools.getFile("proxyObj")
const debugCode = user.getCode(name, "input")
const asynCode = user.getCode(name, "async")

// 先定义 ld，解决 ld is not defined 错误
// const ldInit = `
// const ld = {
//     setNative: function() {}
// }
// `

const code = [
    // ldInit,
    "globalThis.Proxy = Proxy;", // ✅ 把 Proxy 挂到全局
    "globalThis.Reflect = Reflect;",
    configCode,
    toolsCode,
    envCode,
    globalVarCode,
    userVarCode,
    proxyObjCode,
    debugCode,
    asynCode
].join("\n")

//const logCode = fs.readFileSync("./tools/printLog.js")
const codeTest = [
    // ldInit,
    "globalThis.Proxy = Proxy;", // ✅ 把 Proxy 挂到全局
    "globalThis.Reflect = Reflect;",
    configCode,
    toolsCode,
    fs.readFileSync("./tools/printLog.js"),
    envCode,
    globalVarCode,
    userVarCode,
    proxyObjCode,
    debugCode,
    asynCode
].join("\n")

const script = new VMScript(codeTest, "./debugJS.js")
const result = vm.run(script)

// 输出目录也正确
const outputPath = path.join(__dirname, "user", name, "output.js")
fs.writeFileSync(outputPath, code, 'utf8')

console.log("执行成功！文件已输出到：" + outputPath)