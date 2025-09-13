/**
 *  sufei_data.js – 反爬/埋点脚本
 *  作用：
 *    1. 采集浏览器指纹、行为特征（鼠标、键盘、滚动、电池等）
 *    2. 生成请求签名(token)并回传阿里系日志服务器
 *    3. 防自动化工具(PhantomJS、Selenium、Python 等)
 */

(function () {
    'use strict';

    /* ============================================================
     * 0. 工具函数
     * ============================================================ */
    const $win   = window;
    const $doc   = document;
    const $nav   = navigator;
    const $loc   = location;
    const $hist  = history;
    const $scr   = screen;

    /* --------------- 常用工具 --------------- */
    const Util = {
        now       : () => Date.now(),
        random    : () => Math.random(),
        floor     : Math.floor,
        abs       : Math.abs,
        hasNative : fn => Function.prototype.toString.call(fn).includes('[native code]'),

        /* URL */
        parseMainDomain(hostname) {
            const parts = hostname.split('.');
            const limit = Math.min(parts.length, 5);
            let   cur   = parts.pop();
            for (let i = 1; i < limit; i++) {
                cur = `${parts.pop()}.${cur}`;
            }
            return cur;
        },

        /* Cookie */
        setCookie(name, value, expireDays, path = '/', secure = false) {
            let expires = '';
            if (expireDays) {
                const date = new Date(Date.now() + expireDays * 864e5);
                expires = `; expires=${date.toUTCString()}`;
            }
            $doc.cookie = `${name}=${value}${expires}; path=${path}${secure ? '; secure; SameSite=None' : ''}`;
        },

        getCookie(name) {
            const m = $doc.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
            return m ? m[1] : null;
        },

        deleteCookie(name) {
            $doc.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
        },

        /* 发送 GET 请求 */
        ping(url, params = {}) {
            const img = new Image();
            const qs  = Object.keys(params)
                .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`)
                .join('&');
            img.src = `${url}${qs ? '?' + qs : ''}`;
        }
    };

    /* ============================================================
     * 1. 浏览器特征收集
     * ============================================================ */
    const Fingerprint = {
        /* 1.1 自动化检测 */
        isWebdriver() {
            return !!(Reflect.has($win, '$cdc_asdjflasutopfhvcZLmcfl_') || $nav.webdriver);
        },

        isPhantomJS() {
            return !!(Reflect.has($win, 'callPhantom') || /PhantomJS/i.test($nav.userAgent));
        },

        hasWebGL() {
            try {
                const canvas = $doc.createElement('canvas');
                const gl     = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
                return !!gl;
            } catch { return false; }
        },

        isTouchDevice() {
            return 'ontouchstart' in $doc;
        },

        isZhCN() {
            return /zh-cn/i.test($nav.language || $nav.systemLanguage);
        },

        timezoneOffset() {
            return (new Date()).getTimezoneOffset();
        },

        /* 1.2 环境特征位（0/1） */
        envBits() {
            return [
                this.isWebdriver(),                 // 0
                !this.hasWebGL(),                   // 1
                !this.isTouchDevice(),              // 2
                !this.isZhCN(),                     // 3
                this.timezoneOffset() !== -480      // 4  东八区
            ].map(b => b ? 1 : 0);
        }
    };

    /* ============================================================
     * 2. 行为采集
     * ============================================================ */
    const Behavior = {
        /* 计数器 */
        counters: {
            mouseMove : 0,
            mouseClick: 0,
            keyDown   : 0,
            scroll    : 0,
            touchMove : 0
        },

        /* 最近一次坐标 */
        lastMouse: { x: 0, y: 0 },

        /* 初始化监听器 */
        init() {
            const add = (el, type, fn, capture = false) =>
                el.addEventListener(type, fn, { passive: true, capture });

            /* 鼠标 */
            add($doc, 'mousemove',  e => (Behavior.lastMouse = { x: e.clientX, y: e.clientY }, Behavior.counters.mouseMove++));
            add($doc, 'mousedown',  e => Behavior.counters.mouseClick++);
            add($doc, 'keydown',    e => Behavior.counters.keyDown++);
            add($win, 'scroll',     e => Behavior.counters.scroll++);

            /* 触摸 */
            if (Fingerprint.isTouchDevice()) {
                add($doc, 'touchmove',  e => Behavior.counters.touchMove++);
            }

            /* 电池 */
            if ($nav.getBattery) {
                $nav.getBattery().then(b => (Behavior.battery = b)).catch(() => {});
            }
        },

        /* 获取行为摘要 */
        summary() {
            return {
                mouseMove : this.counters.mouseMove,
                mouseClick: this.counters.mouseClick,
                keyDown   : this.counters.keyDown,
                scroll    : this.counters.scroll,
                touchMove : this.counters.touchMove,
                battery   : this.battery ? Math.floor(this.battery.level * 100) : 127,
                charging  : this.battery ? this.battery.charging : true
            };
        }
    };

    /* ============================================================
     * 3. Token 生成
     * ============================================================ */
    const Token = {
        /* 3.1 字段定义 [字节数] */
        FIELDS: [2,2,4,4,4,1,1,4,4,3,2,2,2,2,2,1,2,1,1,1,1,1],
        buffer : [],

        /* 初始化 20-byte 数组 */
        init() {
            this.buffer = new Array(this.FIELDS.length).fill(0);
        },

        /* 3.2 填充数据 */
        fill(isFirst = false) {
            const b = this.buffer;
            const now = Util.now();
            /* 固定 */
            b[0]  = 0;                    // 版本
            b[1]  = Util.floor(Util.random() * 0x10000); // 随机
            b[2]  = Util.floor(now / 1000); // 秒级时间
            b[3]  = 0;                    // 预留
            b[4]  = isFirst ? 0 : Util.floor(Util.random() * 0x100000000);
            b[5]  = Fingerprint.envBits().reduce((a,v,i)=>a+(v<<i),0);
            b[6]  = 0;                    // 平台
            b[7]  = Util.floor(Util.random() * 0x100000000); // UA hash
            b[8]  = 0;                    // 扩展
            /* 行为 */
            const bh = Behavior.summary();
            b[9]  = bh.mouseMove;
            b[10] = bh.mouseClick;
            b[11] = bh.keyDown;
            b[12] = bh.scroll;
            b[13] = bh.touchMove;
            b[14] = 0;
            b[15] = bh.battery;
            b[16] = bh.charging ? 1 : 0;
            b[17] = 0;                    // 陀螺仪
            b[18] = 0;                    // 扩展
            b[19] = 0;
        },

        /* 3.3 序列化 + 简单加密 + Base64 */
        serialize() {
            const bytes = [];
            for (let i=0, off=0; i<this.FIELDS.length; off+=this.FIELDS[i], i++) {
                const len = this.FIELDS[i];
                let val = this.buffer[i];
                for (let j=len-1; j>=0; j--) {
                    bytes[off+j] = val & 0xff;
                    val >>>= 8;
                }
            }
            /* 简单异或 */
            const key = bytes[1];
            for (let i=2; i<bytes.length; i++) {
                bytes[i] ^= (key + i*131) & 0xff;
            }
            /* Base64 URL Safe */
            return btoa(String.fromCharCode(...bytes))
                .replace(/\+/g, '-')
                .replace(/\//g, '_')
                .replace(/=/g, '');
        },

        /* 主入口 */
        create(isFirst = false) {
            this.init();
            this.fill(isFirst);
            return this.serialize();
        }
    };

    /* ============================================================
     * 4. Cookie 管理
     * ============================================================ */
    const CookieName = 'isg';

    function loadInitialToken() {
        let token = Util.getCookie(CookieName);
        if (!token) token = localStorage.getItem(CookieName + '__');
        if (!token) token = Token.create(true);
        return token;
    }

    function saveToken(token, isPageHide = false) {
        Util.setCookie(CookieName, token, isPageHide ? 365 : null);
        localStorage.setItem(CookieName + '__', token);
    }

    /* ============================================================
     * 5. 日志回传
     * ============================================================ */
    function report(type, extra = {}) {
        const base = {
            code : 1,
            pid  : 'sufeidata',
            page : $loc.href.split(/[#?]/)[0],
            query: $loc.search.slice(1),
            hash : $loc.hash,
            ref  : $doc.referrer,
            title: $doc.title,
            ua   : $nav.userAgent,
            ...extra
        };
        Util.ping('//gm.mmstat.com/fsp.1.1', base);
    }

    /* ============================================================
     * 6. 启动流程
     * ============================================================ */
    function bootstrap() {
        /* 6.1 初始化行为采集 */
        Behavior.init();

        /* 6.2 读取 / 创建 token */
        const token = loadInitialToken();
        saveToken(token);

        /* 6.3 页面隐藏时刷新 token */
        window.addEventListener('pagehide', () => {
            saveToken(Token.create(false), true);
        });

        /* 6.4 错误上报 */
        window.addEventListener('error', e =>
            report('js_error', { msg: (e.message || e.reason || '').slice(0, 1000) })
        );
    }

    /* ============================================================
     * 7. 防止重复初始化
     * ============================================================ */
    if (!window._sufei_data2) {
        window._sufei_data2 = true;
        bootstrap();
    }
})();
