const {VM} = require('vm2');
const {JSDOM} = require('jsdom');
const fs = require('fs');

// 1. 创建 jsdom 实例
const dom = new JSDOM(`<!DOCTYPE html><html><body></body></html>`, {
    url: 'https://example.com' // 设置域名，对Cookie操作很重要
});
const {window} = dom;

scriptContent = fs.readFileSync("/Users/个人/电商/1688-Crawler/app/app/tfstk/awsc.js", {encoding: "utf-8"})
// 2. 创建 vm2 实例，注入 jsdom 的 window 和 document
const vm = new VM({
    sandbox: {
        window: window,
        document: window.document,
        navigator: window.navigator,
        location: window.location,
        setTimeout: window.setTimeout,
        console: console // 可选，允许沙盒内使用 console
    }
});

// 3. 准备在沙盒内运行的脚本，脚本最后返回所需的 Cookie
const scriptCode = scriptContent

// 4. 在沙盒中运行脚本并获取其返回值
try {
    const cookieData = vm.run(scriptCode);
    setTimeout(() => {
        console.log(vm.sandbox.document.cookie, "bbbbb")
    }, 3000);
    console.log('从沙盒中获取的 Cookie 数据:', cookieData);
} catch (err) {
    console.error('执行脚本时出错:', err);
}
