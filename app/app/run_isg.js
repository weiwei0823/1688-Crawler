const {VM} = require('vm2');
const {JSDOM} = require('jsdom');
const fs = require('fs');


async function getIsg(type, originUrl) {
    let result_isg = "";
    // 1. 创建 jsdom 实例
    const dom = new JSDOM(`<!DOCTYPE html><html><body></body></html>`, {
        url: originUrl || 'https://example.com' // 设置域名，对Cookie操作很重要
    });
    const {window} = dom;
    let scriptContent = "";
    if (type === "isg_2") {
        scriptContent = fs.readFileSync("/Users/个人/电商/1688-Crawler/app/app/isg_2.js", {encoding: "utf-8"})
    } else if (type === "sufei_data") {
        scriptContent = fs.readFileSync("/Users/个人/电商/1688-Crawler/app/app/sufei_data.js", {encoding: "utf-8"})
    }
    // 2. 创建 vm2 实例，注入 jsdom 的 window 和 document
    const sandbox = {
        window: window,
        Object: window.Object,
        Array: window.Array,
        Function: window.Function,
        Math: window.Math,
        Date: window.Date,
        RegExp: window.RegExp,
        encodeURIComponent: window.encodeURIComponent,
        document: window.document,
        navigator: window.navigator,
        location: window.location,
        setTimeout: window.setTimeout,
        history: window.history,
        screen: window.screen,
        Image: window.Image,
        btoa: window.btoa,
        canvas: window.canvas,
        localStorage: window.localStorage,
        isSecureContext: window.isSecureContext,
        console: console // 可选，允许沙盒内使用 console
    }
    const vm = new VM({sandbox});
    // 3. 准备在沙盒内运行的脚本，脚本最后返回所需的 Cookie
    const scriptCode = scriptContent

    // 4. 在沙盒中运行脚本并获取其返回值
    try {
        const cookieData = vm.run(scriptCode);
        result_isg = vm.sandbox.document.cookie;
        console.log(vm.sandbox.document.cookie, "---" + type);
        // console.log('从沙盒中获取的 Cookie 数据:', cookieData);
    } catch (err) {
        console.error('执行脚本时出错:', err);
    }
    return Promise.resolve(result_isg);
}

Promise.all([
    getIsg("isg_2"),
    getIsg("sufei_data"),
]).then(resList => {
    console.log("complete!!!")
})

