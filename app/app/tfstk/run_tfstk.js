const {VM} = require('vm2');
const {JSDOM} = require('jsdom');
const fs = require('fs');


function getTfstk(type, originUrl) {
    let result_isg = "";
    // 1. 创建 jsdom 实例
    const dom = new JSDOM(`<!DOCTYPE html><html><body></body></html>`, {
        url: originUrl || 'https://example.com' // 设置域名，对Cookie操作很重要
    });
    const {window} = dom;
    let scriptContent = "";
    scriptContent = fs.readFileSync("/Users/个人/电商/1688-Crawler/app/app/tfstk/baxia-entry.js", {encoding: "utf-8"})
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
        const result_isg_str = vm.sandbox.document.cookie;
        result_isg = result_isg_str?.split("=")[1];
        console.log("isg=" + result_isg);
    } catch (err) {
        console.error('执行脚本时出错:', err);
    }
    return result_isg;
}

// Promise.all([
//     getIsg("isg_2"),
//     getIsg("sufei_data"),
// ]).then(resList => {
//     console.log("complete!!!")
// })
getTfstk()
