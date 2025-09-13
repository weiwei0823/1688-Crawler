/******************************************************************
 *  SufeiData 单文件可执行版 ‑ 补全版
 *  在原 isg_2.js 基础上补齐 Battery、DeviceOrientation、localStorage、
 *  日志上报、Cookie 域名设置等逻辑，保持与 sufei_data.js 功能一致。
 *****************************************************************/
(function () {
    'use strict';

    /* ========================= 垫片层 ========================= */
    const win = globalThis;
    const doc = win.document || {cookie: '', referrer: '', title: ''};
    const nav = win.navigator || {
        userAgent: 'node', platform: 'node', language: 'en',
        webdriver: false, getBattery: null, vendor: ''
    };
    const scr = win.screen || {availWidth: 1920, availHeight: 1080};

    /* ======================== 工具函数 ======================== */
    const random32 = () => (Math.random() * 0xFFFFFFFF) >>> 0;
    const hashStr = str => {
        let h = 0;
        for (let i = 0; i < str.length; i++) {
            h = ((h << 5) - h + str.charCodeAt(i)) >>> 0;
        }
        return h;
    };
    const localGet = key => {
        try {
            return win.localStorage[key + '__'];
        } catch {
            return null;
        }
    };
    const localSet = (key, val) => {
        try {
            win.localStorage[key + '__'] = val;
        } catch {
        }
    };
    const log = msg => {
        if (Math.random() < 0.001) {
            new Image().src = '//gm.mmstat.com/fsp.1.1?msg=' + encodeURIComponent(msg);
        }
    };

    /* ======================== 核心 class ====================== */
    class CookieHandler {
        constructor(name) {
            this.name = name;
            this.domain = '';
            this.path = '';
            this.expires = '';
        }

        get() {
            const m = doc.cookie.match(new RegExp('(?:^|; )' + this.name + '=([^;]+)'));
            return m ? m[1] : '';
        }

        set(val, opts = {}) {
            let s = this.name + '=' + val;
            if (opts.domain) this.domain = opts.domain;
            if (opts.path) this.path = opts.path;
            if (opts.expires) this.expires = opts.expires;
            if (this.domain) s += '; domain=' + this.domain;
            if (this.path) s += '; path=' + this.path;
            if (this.expires) s += '; expires=' + this.expires;
            if (opts.secure) s += '; secure; samesite=none';
            try {
                doc.cookie = s;
            } catch {
            }
        }

        y(domain) {
            this.domain = domain;
        }

        A(path) {
            this.path = path;
        }

        x(expires) {
            this.expires = expires;
        }

        w() {
            this.x('Thu, 01 Jan 1970 00:00:00 GMT');
            this.set('');
        }
    }

    class BehaviorTracker {
        constructor() {
            this.mm = 0;
            this.md = 0;
            this.sc = 0;
            this.kd = 0;
            this.cl = 0;
            this.lastX = 0;
            this.lastY = 0;
            this.curX = 0;
            this.curY = 0;
            this.trustMouse = false;
            this.trustTouch = false;
            this.inVP = true;
            this.focused = true;
            this.inter = false;
            this.fs = false;
            this.battery = null;
            this.hasBat = false;
            this.hasDO = false;
            this.gamma = null;
        }

        startTracking() {
            win.addEventListener?.('mousemove', e => {
                this.mm++;
                this.curX = e.clientX;
                this.curY = e.clientY;
                this.trustMouse = e.isTrusted;
            }, true);
            win.addEventListener?.('mousedown', e => {
                this.md++;
                this.lastX = e.clientX;
                this.lastY = e.clientY;
                this.inVP = this._inVP(e.clientX, e.clientY);
            }, true);
            win.addEventListener?.('click', e => {
                this.cl++;
                this.trustMouse = e.isTrusted;
            }, true);
            win.addEventListener?.('keydown', () => this.kd++, true);
            win.addEventListener?.('scroll', () => this.sc++, true);
            win.addEventListener?.('focus', () => {
                this.focused = true;
                this.inter = true;
            });
            win.addEventListener?.('blur', () => this.focused = false);
            win.addEventListener?.('resize', () => this._resize());
            this._resize();

            /* ----- 电池状态 ----- */
            if (nav.getBattery) {
                nav.getBattery().then(b => {
                    this.battery = b;
                    this.hasBat = true;
                    b.addEventListener('levelchange', () => this.battery = b);
                    b.addEventListener('chargingchange', () => this.battery = b);
                }).catch(() => this.hasBat = false);
            }

            /* ----- 设备方向 ----- */
            if (win.DeviceOrientationEvent) {
                this.hasDO = true;
                win.addEventListener('deviceorientation', e => {
                    this.gamma = e.gamma;
                });
            }
        }

        _resize() {
            this.fs = Math.abs((scr.availWidth || 0) - (win.innerWidth || 0)) < 20;
        }

        _inVP(x, y) {
            const W = win.outerWidth || doc.documentElement?.clientWidth || 0;
            const H = win.outerHeight || doc.documentElement?.clientHeight || 0;
            return x >= 0 && y >= 0 && x <= W && y <= H;
        }

        getMouseMovements() {
            return this.mm;
        }

        getScrollEvents() {
            return this.sc;
        }

        getMouseDownEvents() {
            return this.md;
        }

        getKeyDownEvents() {
            return this.kd;
        }

        getClickEvents() {
            return this.cl;
        }

        getPointerData() {
            return {
                x: this.lastX || this.curX,
                y: this.lastY || this.curY,
                isTrusted: this.trustMouse || this.trustTouch
            };
        }

        getWindowDimensions() {
            return [win.innerWidth || 0, win.innerHeight || 0];
        }

        isInViewport() {
            return this.inVP;
        }

        isWindowFocused() {
            return this.focused;
        }

        hasUserInteracted() {
            return this.inter;
        }

        isWindowFullScreen() {
            return this.fs;
        }

        hasBatteryInfo() {
            return this.hasBat;
        }

        isCharging() {
            return this.battery ? this.battery.charging : true;
        }

        getBatteryLevel() {
            return this.battery ? Math.round(this.battery.level * 100) : 127;
        }

        hasOrientationData() {
            return this.hasDO && this.gamma !== null;
        }

        getOrientationGamma() {
            return this.hasDO && this.gamma !== null ? this.gamma + 90 : 255;
        }
    }

    class EnvironmentDetector {
        constructor() {
            this.arr = new Array(16).fill(0);
            this.arr[0] = this.hasWebDriver();
            this.arr[1] = this.hasWebGL();
            this.arr[2] = this.hasTouch();
            this.arr[3] = /zh-cn/i.test(nav.language || nav.systemLanguage);
            this.arr[4] = new Date().getTimezoneOffset() === -480;
        }

        hasWebDriver() {
            return !!nav.webdriver || ('$cdc_asdjflasutopfhvcZLmcfl_' in (win.document || {}));
        }

        hasWebGL() {
            try {
                const c = doc.createElement('canvas');
                const g = c.getContext('webgl');
                g?.getExtension('WEBGL_lose_context')?.loseContext();
                return !!g;
            } catch {
                return false;
            }
        }

        hasTouch() {
            return 'ontouchstart' in win;
        }

        getEnvironmentHash() {
            let h = 0;
            for (let v of this.arr) h = ((h << 5) - h + v) >>> 0;
            return h & 0xFF;
        }
    }

    class PlatformDetector {
        constructor() {
            this.pats = [/^Win32/, /^Win64/, /^Linux armv|^Linux aarch64/, /^Android/, /^iPhone/, /^iPad/, /^MacIntel/, /^Linux [ix]\d+/, /^ARM/, /^iPod/, /^BlackBerry/];
        }

        detectPlatform() {
            const p = nav.platform || 'node';
            for (let i = 0; i < this.pats.length; i++) if (this.pats[i].test(p)) return i + 1;
            return 0;
        }
    }

    class DataEncoder {
        constructor() {
            this.base = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
            this.map = Object.fromEntries([...this.base].map((c, i) => [c, i]));
        }

        checksum(d) {
            let c = 0;
            for (let b of d) c = ((c << 5) - c + b) & 0xFF;
            return c;
        }

        encode(d) {
            const cs = this.checksum(d);
            const out = [4, cs];
            let key = cs;
            for (let i = 0; i < d.length; i++) {
                out.push(d[i] ^ (key & 0xFF));
                key = ~(131 * key);
            }
            return this.base64(out);
        }

        base64(arr) {
            let r = '', i = 0, len = arr.length;
            while (i < len) {
                const a = arr[i++], b = arr[i++] || 0, c = arr[i++] || 0;
                const v = (a << 16) | (b << 8) | c;
                r += this.base[v >> 18] + this.base[(v >> 12) & 63] + this.base[(v >> 6) & 63] + this.base[v & 63];
            }
            return r;
        }
    }

    class DataCollector {
        constructor() {
            this.enc = new DataEncoder();
            this.pd = new PlatformDetector();
            this.ed = new EnvironmentDetector();
            this.struct = [2, 2, 4, 4, 4, 1, 1, 4, 4, 3, 2, 2, 2, 2, 2, 1, 2, 1, 1, 1, 1];
            this.pack = new (class {
                constructor(s) {
                    this.s = s;
                    this.v = new Array(s.length).fill(0);
                }

                set(i, val) {
                    this.v[i] = val;
                }

                toBinary() {
                    let r = [], p = 0;
                    for (let i = 0; i < this.s.length; i++) {
                        let n = this.v[i], l = this.s[i];
                        for (let j = 0; j < l; j++) r[p + l - 1 - j] = (n >> (8 * j)) & 0xFF;
                        p += l;
                    }
                    return r;
                }
            })(this.struct);
            this.sn = 0;
        }

        initialize(cna) {
            this.cna = cna || '';
        }

        collectData() {
            this.pack.set(0, ++this.sn);
            this.pack.set(2, Date.now() >>> 0);
            this.pack.set(5, 0);
            this.pack.set(6, this.pd.detectPlatform());
            this.pack.set(8, hashStr(nav.userAgent));
            this.pack.set(16, this.ed.getEnvironmentHash());
            const bin = this.pack.toBinary();
            return this.enc.encode(bin);
        }
    }

    /* ======================== 主入口 ======================== */
    class SufeiData {
        constructor() {
            this.ver = '3.9.12';
            this.cookie = new CookieHandler('isg');
            this.tracker = new BehaviorTracker();
            this.collector = new DataCollector();
            this.tracker.startTracking();
            this.collector.initialize(this.cookie.get());

            /* ----- 自动设置 Cookie domain ----- */
            const hostname = win.location?.hostname || '';
            if (hostname && hostname !== 'localhost' && !/^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
                this.cookie.y(hostname);
                this.cookie.A('/');
            }

            /* ----- 页面卸载时持久化 ----- */
            win.addEventListener?.('pagehide', () => {
                const token = this.collector.collectData();
                this.cookie.set(token);
                localSet('isg', token);
            });

            /* ----- 初始化时尝试读 localStorage ----- */
            const cached = localGet('isg');
            if (cached && !this.cookie.get()) this.cookie.set(cached);
        }

        getToken() {
            const token = this.collector.collectData();
            this.cookie.set(token);
            localSet('isg', token);
            return token;
        }
    }

    /* ==================== 挂到全局 ==================== */
    win.SufeiData = SufeiData;
})();

const sdk = new SufeiData();
sdk.getToken();
