/**
 * 浏览器端常用工具集合（源自阿里 isg 脚本的重构版）
 * 包含：随机数、字符串/URL 处理、事件绑定、localStorage 封装、视口尺寸等
 */
class BrowserFingerprintUtil {
    /* ---------- 构造 ---------- */
    constructor() {
        // 版本号（原脚本写死 3.9.12）
        this.version = '3.9.12';

        // 常用正则
        this.REG_NATIVE_CODE = /native code/;
        this.REG_HOST = /^(?:https?:)?\/{2,}([^/?#\\]+)/i;
        this.REG_AT_COLON = /[@:]/;
    }

    /* ---------- 工具方法 ---------- */

    /** 随机 32 位无符号整数 */
    randomUint32() {
        return Math.floor(Math.random() * 0x100000000);
    }

    /** 判断 obj 是否为原生函数（native code） */
    isNativeFunction(obj) {
        if (typeof obj !== 'function') return false;
        return this.REG_NATIVE_CODE.test(Function.prototype.toString.call(obj));
    }

    /** 简单字符串 hash（djb2 变种） */
    hashCode(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = ((hash << 5) - hash + str.charCodeAt(i)) >>> 0;
        }
        return hash;
    }

    /** 去掉首次出现 suffix 之后的部分 */
    stripAfter(text, suffix) {
        const idx = text.indexOf(suffix);
        return idx === -1 ? text : text.substring(0, idx);
    }

    /** 去掉首次出现 prefix 之前的部分（含 prefix）*/
    stripBefore(text, prefix) {
        const idx = text.indexOf(prefix);
        return idx === -1 ? text : text.substring(idx + prefix.length);
    }

    /** 从 url 里提取 host；兼容带端口、@、协议等情况 */
    extractHost(url) {
        const match = url.match(this.REG_HOST);
        if (!match) return null;
        let host = match[1];
        if (this.REG_AT_COLON.test(host)) {
            host = this.stripBefore(host, '@');
            host = this.stripAfter(host, ':');
        }
        return host;
    }

    /** 把 0/1 字符串转整数（二进制）*/
    binaryStringToInt(binStr) {
        let result = 0;
        for (let i = 0; i < binStr.length; i++) {
            result = (result << 1) | (binStr[i] === '1' ? 1 : 0);
        }
        return result;
    }

    /** 事件绑定（兼容 IE）*/
    on(el, type, handler, useCapture = false) {
        if (el.addEventListener) {
            el.addEventListener(type, handler, useCapture);
        } else if (el.attachEvent) {
            el.attachEvent('on' + type, e => handler.call(el, e || window.event));
        }
    }

    /** localStorage 读 */
    getStorage(key) {
        try {
            return localStorage.getItem(key + '__');
        } catch (_) {
            return null;
        }
    }

    /** localStorage 写 */
    setStorage(key, value) {
        try {
            localStorage.setItem(key + '__', value);
        } catch (_) { /* ignore */
        }
    }

    /* ---------- 视口尺寸 ---------- */

    /** 获取窗口宽度（兼容旧浏览器）*/
    viewportWidth() {
        return window.outerWidth ||
            document.documentElement.clientWidth ||
            document.body.clientWidth;
    }

    /** 获取窗口高度（兼容旧浏览器）*/
    viewportHeight() {
        return window.outerHeight ||
            document.documentElement.clientHeight ||
            document.body.clientHeight;
    }

    /* ---------- 快捷静态实例 ---------- */
    static getInstance() {
        if (!BrowserFingerprintUtil._instance) {
            BrowserFingerprintUtil._instance = new BrowserFingerprintUtil();
        }
        return BrowserFingerprintUtil._instance;
    }
}


/**
 * Cookie 管理器
 * 支持：读取、写入、删除单值 / 多值 cookie
 * 支持：自定义 domain / path / expires / secure / SameSite
 */
class CookieManager {
    /**
     * @param {string} key cookie 名称
     */
    constructor(key) {
        this.key = key;

        // 正则：匹配同名 cookie 的所有值
        this._regex = new RegExp(`(?:^|; )${key}=([^;]+)`, 'g');
        this._prefix = `${key}=`;

        // 额外属性缓存
        this._domain = '';
        this._path = '';
        this._expires = '';
        this._secure = CookieManager._shouldUseSecureFlag();
        this._suffix = '';   // 拼接好的附加字符串（domain/path/expires/secure/samesite）
    }

    /* =============== 静态工具 =============== */

    /** 是否启用 secure + SameSite=none（Chrome 80+ 要求） */
    static _shouldUseSecureFlag() {
        if (!window.isSecureContext) return false;
        const chromeMatch = navigator.userAgent.match(/Chrome\/(\d+)/);
        return !chromeMatch || Number(chromeMatch[1]) >= 80;
    }

    /* =============== 公共方法 =============== */

    /** 读取该 key 对应的所有值（数组） */
    getAllValues() {
        try {
            const cookieStr = document.cookie;
            const values = [];
            let match;
            while ((match = this._regex.exec(cookieStr)) !== null) {
                values.push(match[1]);
            }
            return values;
        } catch (_) {
            return [];
        }
    }

    /** 读取第一个值（最常见场景）*/
    getValue() {
        return this.getAllValues()[0] || null;
    }

    /** 写入值 */
    setValue(value) {
        if (!this._suffix) {
            this._buildSuffix();
        }
        try {
            document.cookie = `${this._prefix}${encodeURIComponent(value)}${this._suffix}`;
        } catch (_) {
            /* ignore */
        }
    }

    /** 删除 cookie：把过期时间设为 1970，再写空值 */
    remove() {
        const prevExpires = this._expires;
        this.setExpires('Thu, 01 Jan 1970 00:00:00 GMT');
        this.setValue('');
        this.setExpires(prevExpires);   // 恢复之前的 expires，方便链式调用
    }

    /* =============== 链式配置 API =============== */

    setDomain(domain) {
        this._domain = domain;
        this._suffix = '';
        return this;
    }

    setPath(path) {
        this._path = path;
        this._suffix = '';
        return this;
    }

    setExpires(expires) {
        this._expires = expires;
        this._suffix = '';
        return this;
    }

    /* =============== 内部 =============== */

    /** 把 domain / path / expires / secure 拼成后缀 */
    _buildSuffix() {
        let suffix = '';
        if (this._domain) suffix += `; domain=${this._domain}`;
        if (this._path) suffix += `; path=${this._path}`;
        if (this._expires) suffix += `; expires=${this._expires}`;
        if (this._secure) suffix += '; secure; samesite=none';
        this._suffix = suffix;
    }
}

/**
 * SufeiData 异常 & 埋点上报模块
 * 支持：
 *  1) 捕获 JS 异常并按采样率上报；
 *  2) 主动埋点（url、token、扩展字段）；
 *  3) 自动附带 cna、页面信息等公共字段。
 */
class SufeiDataReporter {
    constructor() {
        // 采样率，_sufei_log 为 0~1 之间的小数；若未定义默认 0.1%
        this.sampleRate = this._getSampleRate();
        this.cnaCache = null;   // e() 的缓存
    }

    /* =============== 外部 API =============== */

    /**
     * 1. 捕获异常后调用
     * @param {Error|*} err 任意异常对象
     */
    reportError(err) {
        // 延迟 1 ms 再发，避免阻塞主线程
        setTimeout(() => this._sendErrorLog(err), 1);
    }

    /**
     * 2. 主动埋点
     * @param {string} url      需要记录的 url（截断 2000）
     * @param {string} token    业务 token
     * @param {Object} [ext]    扩展字段，会序列化后放在 ext 参数
     */
    reportBeacon(url, token, ext = {}) {
        // 过滤掉 XueXi UA
        if (navigator.userAgent.includes('XueXi')) return;
        this._sendBeacon(url, token, ext);
    }

    /* =============== 内部实现 =============== */

    /** 读取采样率 */
    _getSampleRate() {
        const rate = window._sufei_log;
        return (rate == null) ? 0.001 : Number(rate);
    }

    /** 读取 cna（淘宝/菜鸟 cookie） */
    _getCna() {
        if (this.cnaCache == null) {
            // 复用上一个问题里写的 CookieManager
            this.cnaCache = new CookieManager('cna').getValue() || '';
        }
        return this.cnaCache;
    }

    /** 构造并发送异常日志 */
    _sendErrorLog(err) {
        if (Math.random() > this.sampleRate) return;

        const payload = {
            code: 1,
            msg: String(err.stack || err.message).slice(0, 1000),
            pid: 'sufeidata',
            page: location.href.split(/[#?]/)[0],
            query: location.search.slice(1),
            hash: location.hash,
            referrer: document.referrer,
            title: document.title,
            ua: navigator.userAgent,
            rel: document.relList || '', // 原 d 变量未定义，这里兜底
            c1: this._getCna()
        };

        this._sendByImg('//gm.mmstat.com/fsp.1.1?', payload);
    }

    /** 构造并发送业务埋点 */
    _sendBeacon(url, token, ext) {
        const host = location.host.includes('.aliexpress.')
            ? 'fourier.aliexpress.com'
            : 'fourier.taobao.com';

        const payload = {
            url: String(url).slice(0, 2000),
            token,
            cna: this._getCna(),
            ext: JSON.stringify(ext)
        };

        this._sendByImg(`https://${host}/ts?`, payload);
    }

    /** 统一通过 Image 打点（GET 请求） */
    _sendByImg(baseUrl, params) {
        const qs = Object.keys(params)
            .map(k => `${k}=${encodeURIComponent(params[k])}`)
            .join('&');

        const img = new Image();
        img.src = baseUrl + qs;
    }
}

/**
 * PageSensor 页面行为 & 设备信息采集器
 * 功能：
 *   - 鼠标、触摸、点击、滚动、键盘、窗口尺寸、焦点、陀螺仪、电量 …
 *   - 点击 3 次以上自动记录「元素标签+是否正中」
 *   - 支持采样上报（通过 sufeiReporter）
 */
class PageSensor {
    constructor() {
        /* ---------- 统计计数器 ---------- */
        this.mouseMoveCount = 0;   // U
        this.mouseClickCount = 0;   // $
        this.scrollCount = 0;   // J
        this.keyDownCount = 0;   // V

        /* ---------- 最新坐标 ---------- */
        this.lastMoveX = 0;         // tn
        this.lastMoveY = 0;         // rn
        this.lastClickX = 0;         // K
        this.lastClickY = 0;         // Z

        /* ---------- 其他状态 ---------- */
        this.isTrustedMove = undefined;  // D
        this.isTrustedTouch = undefined; // N
        this.screenGapSmall = false;     // Y（屏幕右边距 < 20）
        this.isFocus = false;            // G
        this.isFocusReal = true;         // on
        this.batteryObj = null;          // Q
        this.batteryApiSupported = false;// cn
        this.gyroSupported = false;      // un
        this.gyroValue = null;           // fn

        /* ---------- 点击采样 ---------- */
        this.clickSamples = [];          // sn
        this.centerHitCount = 0;         // ln

        /* ---------- 窗口尺寸 ---------- */
        this.innerWidth = 0;            // an
        this.innerHeight = 0;            // en

        this._init();
    }

    /* ===========================================================
       公共 API（对应原 j.F / j.G / j.H …）
       =========================================================== */
    start() {
        this._bindEvents();
    }

    getMouseMoveCnt() {
        return this.mouseMoveCount;
    }

    getScrollCnt() {
        return this.scrollCount;
    }

    getClickCnt() {
        return this.mouseClickCount;
    }

    getKeyDownCnt() {
        return this.keyDownCount;
    }

    /* 最新坐标 & 是否可信 */
    getLatestPoint() {
        let x = this.lastClickX || this.lastMoveX;
        let y = this.lastClickY || this.lastMoveY;
        const trusted = [this.isTrustedMove, this.isTrustedTouch]
            .some(v => v === undefined || v === true);
        // 复位
        this.isTrustedMove = this.isTrustedTouch = undefined;
        return {x, y, trusted};
    }

    getWindowSize() {
        return [this.innerWidth, this.innerHeight];
    }

    isInsideViewport() {
        return this._insideViewport(this.lastMoveX, this.lastMoveY);
    }

    isPageVisible() {
        return !document.hidden;
    }

    isFocusReal() {
        return this.isFocusReal;
    }

    hasFocusEver() {
        return this.isFocus;
    }

    isScreenGapSmall() {
        return this.screenGapSmall;
    }

    /* 电池相关 */
    isBatteryApiSupported() {
        return this.batteryApiSupported;
    }

    isBatteryCharging() {
        return !this.batteryObj || this.batteryObj.charging;
    }

    getBatteryLevel() {
        return this.batteryObj ? this.batteryObj.level * 100 : 127;
    }

    /* 陀螺仪相关 */
    isGyroSupported() {
        return this.gyroSupported && this.gyroValue != null;
    }

    getGyroValue() {
        return this.gyroSupported && this.gyroValue != null
            ? this.gyroValue + 90
            : 255;
    }

    /* ===========================================================
       内部实现
       =========================================================== */
    _init() {
        // 判断陀螺仪开关
        this.gyroSupported = !!window.DeviceOrientationEvent &&
            !(/dingtalk|youku|uczzd\.cn|sm\.cn|uc\.cn/.test(location.hostname) ||
                /iPhone|iPad|Qianniu|DingTalk|Youku|SQREADER/.test(navigator.userAgent));
    }

    _bindEvents() {
        // 统一用 addEventListener
        const add = (el, ev, fn, capture = false) =>
            el.addEventListener(ev, fn, capture);

        /* 触摸 */
        if ('ontouchmove' in document) {
            add(document, 'touchmove', this._onTouchMove.bind(this), true);
            add(document, 'touchstart', this._onTouchStart.bind(this), true);
        }

        /* 鼠标 */
        add(document, 'mousemove', this._onMouseMove.bind(this), true);
        add(document, 'mousedown', this._onMouseDown.bind(this), true);
        add(document, 'click', this._onClick.bind(this), true);

        /* 键盘 */
        add(document, 'keydown', this._onKeyDown.bind(this), true);

        /* 窗口 */
        add(window, 'scroll', this._onScroll.bind(this), true);
        add(window, 'focus', this._onFocus.bind(this));
        add(window, 'blur', this._onBlur.bind(this));
        add(window, 'resize', this._onResize.bind(this));

        this._onResize(); // 初始化窗口尺寸

        /* Battery API */
        if (navigator.getBattery) {
            navigator.getBattery().then(b => {
                this.batteryObj = b;
                this.batteryApiSupported = true;
            }).catch(() => {
            });
        }

        /* 陀螺仪 */
        if (this.gyroSupported) this._initGyro();
    }

    /* -------------------- 事件处理 -------------------- */
    _onMouseMove(e) {
        this.isTrustedMove = e.isTrusted;
        this.lastMoveX = e.clientX;
        this.lastMoveY = e.clientY;
        this.mouseMoveCount++;
    }

    _onMouseDown(e) {
        this.lastClickX = e.clientX;
        this.lastClickY = e.clientY;
        this.mouseClickCount++;
        this._updateInsideViewportFlag();
    }

    _onTouchStart(e) {
        this.isTrustedTouch = e.isTrusted;
        const t = e.touches[0];
        this.lastClickX = t.clientX;
        this.lastClickY = t.clientY;
        this.mouseClickCount++;
        this._updateInsideViewportFlag();
    }

    _onTouchMove(e) {
        this.isTrustedMove = e.isTrusted;
        const t = e.touches[0];
        this.lastMoveX = t.clientX;
        this.lastMoveY = t.clientY;
        this.mouseMoveCount++;
    }

    _onClick(e) {
        const target = e.target;
        const w = target.offsetWidth >> 1;   // 半宽
        const h = target.offsetHeight >> 1;  // 半高
        if (w < 10 && h < 10) return;        // 小于 10×10 忽略

        // 点击点与中心距离 < 2px 视为正中
        const dx = Math.abs(e.offsetX - w);
        const dy = Math.abs(e.offsetY - h);
        const hitCenter = dx < 2 && dy < 2;

        if (hitCenter) this.centerHitCount++;

        // 记录标签（带前缀 ! 表示未击中）
        if (this.centerHitCount >= 3) {
            if (this.centerHitCount === 3) {
                // 首次达到 3 次，20 秒后强制上报
                setTimeout(this._flushClickSamples.bind(this), 20000);
            }
            if (!this.clickSamples || this.clickSamples.length < 20) {
                this.clickSamples.push((hitCenter ? '' : '!') + target.tagName);
            }
        }
    }

    _onKeyDown() {
        this.keyDownCount++;
    }

    _onScroll() {
        this.scrollCount++;
    }

    _onFocus() {
        this.isFocus = true;
        this.isFocusReal = true;
    }

    _onBlur() {
        this.isFocusReal = false;
    }

    _onResize() {
        const availW = screen.availWidth;
        const viewW = window.innerWidth;
        this.screenGapSmall = (availW - viewW) < 20;
        this.innerWidth = window.innerWidth;
        this.innerHeight = window.innerHeight;
    }

    /* 陀螺仪初始化 */
    _initGyro() {
        // 优先使用 Gyroscope（Chrome 实验接口）
        if (window.Gyroscope) {
            try {
                const sensor = new Gyroscope({frequency: 2});
                sensor.onreading = () => this.gyroValue = sensor.z;
                sensor.start();
                return;
            } catch (_) {
            }
        }
        // 降级 deviceorientation
        window.addEventListener('deviceorientation', e => {
            this.gyroValue = e.gamma;
        });
    }

    /* 判断坐标是否在当前视口内 */
    _insideViewport(x, y) {
        return x >= 0 && x <= window.innerWidth &&
            y >= 0 && y <= window.innerHeight;
    }

    _updateInsideViewportFlag() {
        // nn 原含义：当前点击坐标是否在可视区域
        // 这里舍弃全局变量，改用 getLatestPoint().trusted
    }

    /* 20s 后若样本>=3 则上报 */
    _flushClickSamples() {
        if (!this.clickSamples || !this.clickSamples.length) return;
        const payload = `${this.centerHitCount}:${this.clickSamples.join(',')}`;
        // 假设 sufeiReporter 已在前文实例化
        window.sufeiReporter?.reportBeacon('', payload, 4);
        this.clickSamples = null; // 上报后清空
    }
}

/**
 * EnvFingerprint
 * 浏览器环境特征检测器
 * 对外暴露：
 *   - collect()   采集 16 字节特征向量
 *   - detect()    返回可疑环境分值（规则命中越多分值越高）
 *   - reset()     刷新时间戳、重新采样
 */
class EnvFingerprint {
    constructor() {
        // 16 字节结果缓存
        this.buffer = new Array(16);
        // 首次采样时间戳
        this.startTime = Date.now();
        // 是否允许继续收集（受页面状态/耗时影响）
        this.collectEnabled = true;

        // 浏览器 vendor 缓存
        this.vendor = navigator.vendor || '';

        // 快捷引用
        this.win = window;
        this.doc = document;
        this.nav = navigator;
        this.ua = navigator.userAgent;
    }

    /* ============================================================
       公共 API
    ============================================================ */
    /** 采集 16 字节特征向量 */
    collect() {
        this._refresh();
        const basic = this._basicFeatures();       // 5 个基础位
        const extra = this._extraFeatures();       // 6 个扩展位
        const vec = basic.concat(extra);
        // 把 true/false → 1/0 并转成 16 进制字符串
        return this._arrayToHex(vec);
    }

    /** 检测可疑环境分值（0 表示正常） */
    detect() {
        for (const rule of this._suspiciousRules) {
            if (rule.test()) return rule.score;
        }
        return 0;
    }

    /** 重置时间戳，允许再次采样 */
    reset() {
        this.startTime = Date.now();
        this.collectEnabled = true;
    }

    /* ============================================================
       基础特征（5 项）
    ============================================================ */
    _basicFeatures() {
        return [
            this._hasWebdriver(),         // $cdc_asdjflasutopfhvcZLmcfl_
            this._supportWebGL(),         // WebGL 可用
            this._isTouchDevice(),        // 有 touch
            this._isZhCN(),               // 语言 zh-CN
            this._isGMT8()                // 时区东八区（-480 min）
        ];
    }

    /* ============================================================
       扩展特征（6 项，依赖 PageSensor）
    ============================================================ */
    _extraFeatures() {
        // 注意：PageSensor 在前文已实例化为 pageSensor
        const sensor = window.pageSensor;
        return [
            sensor?.isInsideViewport() ?? false, // 鼠标是否在视口内
            sensor?.isBatteryApiSupported() ?? false,
            sensor?.isBatteryCharging() ?? false,
            sensor?.isGyroSupported() ?? false,
            this._shouldStopCollect(sensor),     // 页面未就绪或超时
            this._isLargeGap(sensor)             // 可视区域与屏幕差值过大
        ];
    }

    /* ============================================================
       基础特征实现
    ============================================================ */
    _hasWebdriver() {
        return '$cdc_asdjasutopfhvcZLmcfl_' in this.doc || this.nav.webdriver;
    }

    _supportWebGL() {
        try {
            const canvas = this.doc.createElement('canvas');
            const gl = canvas.getContext('webgl');
            if (!gl) return false;
            const loseCtx = gl.getExtension('WEBGL_lose_context');
            loseCtx?.loseContext();
            return true;
        } catch (_) {
            return false;
        }
    }

    _isTouchDevice() {
        return 'ontouchstart' in this.doc;
    }

    _isZhCN() {
        return /zh-cn/i.test(this.nav.language || this.nav.systemLanguage);
    }

    _isGMT8() {
        return new Date().getTimezoneOffset() === -480;
    }

    /* ============================================================
       扩展特征实现
    ============================================================ */
    _shouldStopCollect(sensor) {
        // 如果 document 未 ready 或已运行 10s 以上，则停止
        return !(
            this.doc.readyState === 'complete' &&
            Date.now() - this.startTime <= 10_000 &&
            !sensor?.getMouseMoveCnt() &&
            !sensor?.getScrollCnt() &&
            !sensor?.getClickCnt() &&
            !sensor?.getKeyDownCnt()
        );
    }

    _isLargeGap(sensor) {
        const [innerW, innerH] = sensor?.getWindowSize() || [0, 0];
        const gapX = screen.availWidth - innerW;
        const gapY = screen.availHeight - innerH;
        return gapX > 240 || gapY > 150;
    }

    /* ============================================================
       可疑环境规则表
    ============================================================ */
    get _suspiciousRules() {
        return [
            {name: 'PhantomJS', test: () => 'callPhantom' in this.win || /PhantomJS/i.test(this.ua), score: 13},
            {name: 'Python', test: () => /python/i.test(this.nav.appVersion), score: 14},
            {name: 'sgApp', test: () => 'sgAppName' in this.nav, score: 15},
            {name: 'Maxthon', test: () => /Maxthon/i.test(this.vendor), score: 16},
            {name: 'Opera', test: () => 'opr' in this.win, score: 17},
            {name: 'Baidu', test: () => this._isChromeUA() && /BIDUBrowser/i.test(this.ua), score: 18},
            {name: '2345', test: () => this._isChromeUA() && /2345Explorer/.test(this.ua), score: 22},
            /* ……其余规则同原表，这里仅展示部分 */
        ];
    }

    /* ============================================================
       工具函数
    ============================================================ */
    _isChromeUA() {
        return 'chrome' in this.win;
    }

    _isIE() {
        return 'ActiveXObject' in this.win;
    }

    _arrayToHex(arr) {
        return arr.map(b => (b ? 1 : 0).toString(16)).join('');
    }
}

/**
 * DomainWhitelist
 * 1. 提供三组白名单（集团域名、本地调试域名、CDN/第三方域名）
 * 2. 提供线程安全的 WeakMap 降级缓存
 */
class DomainWhitelist {
    /* ---------- 白名单常量 ---------- */
    static ALIBABA_DOMAINS = new Set([
        '1688.com', '95095.com', 'a-isv.org', 'aliapp.org', 'alibaba-inc.com',
        'alibaba.com', 'alibaba.net', 'alibabacapital.com', 'alibabacloud.com',
        'alibabacorp.com', 'alibabadoctor.com', 'alibabagroup.com', 'alicdn.com',
        'alidayu.com', 'aliexpress.com', 'alifanyi.com', 'alihealth.cn',
        'alihealth.com.cn', 'alihealth.hk', 'alikmd.com', 'alimama.com',
        'alimei.com', 'alios.cn', 'alipay-corp.com', 'alipay.com', 'aliplus.com',
        'alisoft.com', 'alisports.com', 'alitianji.com', 'alitrip.com',
        'alitrip.hk', 'aliunicorn.com', 'aliway.com', 'aliwork.com',
        'alixiaomi.com', 'aliyun-inc.com', 'aliyun.com', 'aliyun.xin',
        'aliyuncs.com', 'alizhaopin.com', 'amap.com', 'antfinancial-corp.com',
        'antsdaq-corp.com', 'asczwa.com', 'atatech.org', 'autonavi.com',
        'b2byao.com', 'bcvbw.com', 'cainiao-inc.cn', 'cainiao-inc.com',
        'cainiao.com', 'cainiao.com.cn', 'cainiaoyizhan.com', 'cheng.xin',
        'cibntv.net', 'cnzz.com', 'damai.cn', 'ddurl.to', 'dingding.xin',
        'dingtalk.com', 'dingtalkapps.com', 'doctoryou.ai', 'doctoryou.cn',
        'dratio.com', 'etao.com', 'feizhu.cn', 'feizhu.com', 'fliggy.com',
        'fliggy.hk', 'freshhema.com', 'gaode.com', 'gein.cn', 'gongyi.xin',
        'guoguo-app.com', 'hemaos.com', 'heyi.test', 'hichina.com', 'itao.com',
        'jingguan.ai', 'jiyoujia.com', 'juhuasuan.com', 'koubei-corp.com',
        'kumiao.com', 'laifeng.com', 'laiwang.com', 'lazada.co.id',
        'lazada.co.th', 'lazada.com', 'lazada.com.my', 'lazada.com.ph',
        'lazada.sg', 'lazada.vn', 'liangxinyao.com', 'lingshoujia.com',
        'lwurl.to', 'mashangfangxin.com', 'mashort.cn', 'mdeer.com',
        'miaostreet.com', 'mmstat.com', 'mshare.cc', 'mybank-corp.cn',
        'nic.xin', 'pailitao.com', 'phpwind.com', 'phpwind.net', 'saee.org.cn',
        'shenjing.com', 'shyhhema.com', 'sm.cn', 'soku.com', 'tanx.com',
        'taobao.com', 'taobao.org', 'taopiaopiao.com', 'tb.cn', 'tmall.com',
        'tmall.hk', 'tmall.ru', 'tmjl.ai', 'tudou.com', 'umeng.co', 'umeng.com',
        'umengcloud.com', 'umsns.com', 'umtrack.com', 'wasu.tv', 'whalecloud.com',
        'wrating.com', 'www.net.cn', 'xiami.com', 'ykimg.com', 'youku.com',
        'yowhale.com', 'yunos-inc.com', 'yunos.com', 'yushanfang.com',
        'zmxy-corp.com.cn', 'zuodao.com'
    ]);

    static LOCAL_DOMAINS = new Set([
        '127.0.0.1', 'afptrack.alimama.com', 'aldcdn.tmall.com',
        'delivery.dayu.com', 'hzapush.aliexpress.com', 'local.alipcsec.com',
        'localhost.wwbizsrv.alibaba.com', 'napi.uc.cn', 'sec.taobao.com',
        'tce.alicdn.com', 'un.alibaba-inc.com', 'utp.ucweb.com', 'ynuf.aliapp.org'
    ]);

    static CDN_DOMAINS = new Set([
        'akamaized.net', 'alibaba-inc.com', 'alicdn.com', 'aliimg.com',
        'alimama.cn', 'alimmdn.com', 'alipay.com', 'alivecdn.com',
        'aliyun.com', 'aliyuncs.com', 'amap.com', 'autonavi.com',
        'cibntv.net', 'cnzz.com', 'criteo.com', 'doubleclick.net',
        'facebook.com', 'facebook.net', 'google-analytics.com', 'google.com',
        'googleapis.com', 'greencompute.org', 'lesiclub.cn', 'linezing.com',
        'mmcdn.cn', 'mmstat.com', 'sm-tc.cn', 'sm.cn', 'soku.com', 'tanx.com',
        'taobaocdn.com', 'tbcache.com', 'tbcdn.cn', 'tudou.com', 'uczzd.cn',
        'umeng.com', 'us.ynuf.aliapp.org', 'wrating.com', 'xiami.net',
        'xiaoshuo1-sm.com', 'yandex.ru', 'ykimg.com', 'youku.com', 'zimgs.cn'
    ]);

    /* ---------- 缓存实现 ---------- */
    constructor() {
        // 优先使用原生 WeakMap；否则降级到数组 + 定时清理
        if (typeof WeakMap !== 'undefined') {
            this.cache = new WeakMap();
        } else {
            this.keys = [];
            this.values = [];
            // 每 10 秒清理一次（避免内存泄漏）
            setInterval(() => {
                this.keys.length = 0;
                this.values.length = 0;
            }, 10_000);
        }
    }

    /** 线程安全的 set */
    set(key, value) {
        if (this.cache) {
            this.cache.set(key, value);
        } else {
            const idx = this.keys.indexOf(key);
            if (idx >= 0) this.values[idx] = value;
            else {
                this.keys.push(key);
                this.values.push(value);
            }
        }
    }

    /** 线程安全的 get */
    get(key) {
        if (this.cache) {
            return this.cache.get(key);
        }
        const idx = this.keys.indexOf(key);
        return idx >= 0 ? this.values[idx] : undefined;
    }

    /* ---------- 白名单工具 ---------- */
    /** 判断域名是否在 Alibaba 集团域名列表 */
    static isAlibabaDomain(hostname = location.hostname) {
        return this.ALIBABA_DOMAINS.has(hostname);
    }

    /** 判断域名是否在本地调试列表 */
    static isLocalDomain(hostname = location.hostname) {
        return this.LOCAL_DOMAINS.has(hostname);
    }

    /** 判断域名是否在 CDN / 第三方列表 */
    static isCdnDomain(hostname = location.hostname) {
        return this.CDN_DOMAINS.has(hostname);
    }

    /** 任意域名列表快速检测 */
    static inList(hostname, list = []) {
        return new Set(list).has(hostname);
    }
}

/**
 * Base64URLSafeWithChecksum
 * 1. 编码：校验和 + 原始数据 → 轻量级流混淆 → Base64URLSafe
 * 2. 解码：Base64URLSafe → 逆向流混淆 → 校验和验证 → 返回原始数据
 */
class Base64URLSafeWithChecksum {
    /* ---------- 常量 ---------- */
    static ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
    static ALPHABET_MAP = Object.freeze(
        Object.fromEntries(
            Base64URLSafeWithChecksum.ALPHABET.split('').map((c, i) => [c, i])
        )
    );

    /* ---------- 公开 API ---------- */
    /**
     * 编码
     * @param {Uint8Array|number[]} bytes
     * @returns {string}
     */
    static encode(bytes) {
        const data = new Uint8Array(bytes);
        const checksum = this._djb2Checksum(data);   // 1 字节
        const obfuscated = this._obfuscate(data, checksum); // 轻量级流混淆
        const payload = new Uint8Array([checksum, ...obfuscated]);
        return this._base64Encode(payload);
    }

    /**
     * 解码
     * @param {string} str
     * @returns {Uint8Array|null}  校验失败返回 null
     */
    static decode(str) {
        const payload = this._base64Decode(str);
        if (!payload || payload.length < 2) return null;
        const checksum = payload[0];
        const obfuscated = payload.slice(1);
        const data = this._deobfuscate(obfuscated, checksum);
        if (!data || this._djb2Checksum(data) !== checksum) return null;
        return data;
    }

    /* ---------- 内部实现 ---------- */
    /** djb2 单字节校验和 */
    static _djb2Checksum(data) {
        let hash = 0;
        for (let i = 0; i < data.length; i++) {
            hash = (hash << 5) - hash + data[i];
        }
        return hash & 0xff; // 只保留低 8 位
    }

    /** 线性同余流混淆（加密方向）*/
    static _obfuscate(data, seed) {
        const out = new Uint8Array(data.length);
        let key = seed;
        for (let i = 0; i < data.length; i++) {
            out[i] = data[i] ^ (key & 0xff);
            key = ~(131 * key); // 原脚本算法
        }
        return out;
    }

    /** 线性同余流解混淆（解密方向）*/
    static _deobfuscate(data, seed) {
        return this._obfuscate(data, seed); // 异或对称
    }

    /** Base64URLSafe 编码（无填充）*/
    static _base64Encode(bytes) {
        let out = '';
        for (let i = 0; i < bytes.length; i += 3) {
            const a = bytes[i];
            const b = bytes[i + 1] ?? 0;
            const c = bytes[i + 2] ?? 0;
            const tri = (a << 16) | (b << 8) | c;
            out += this.ALPHABET[tri >> 18];
            out += this.ALPHABET[(tri >> 12) & 63];
            out += this.ALPHABET[(tri >> 6) & 63];
            out += this.ALPHABET[tri & 63];
        }
        // 去掉末尾可能多余的两个字符（与原版保持一致）
        return out.slice(0, Math.ceil(bytes.length * 4 / 3));
    }

    /** Base64URLSafe 解码*/
    static _base64Decode(str) {
        const len = str.length;
        if (len % 4 === 1) return null; // 非法长度
        const bytes = [];
        for (let i = 0; i < len; i += 4) {
            const tri =
                (this.ALPHABET_MAP[str[i]] << 18) |
                (this.ALPHABET_MAP[str[i + 1]] << 12) |
                (this.ALPHABET_MAP[str[i + 2]] << 6) |
                (this.ALPHABET_MAP[str[i + 3]]);
            bytes.push(tri >> 16, (tri >> 8) & 0xff, tri & 0xff);
        }
        // 去掉尾部填充的 0
        const expectLen = Math.floor(len * 3 / 4);
        return new Uint8Array(bytes.slice(0, expectLen));
    }
}

/**
 * PlatformFingerprint
 * 根据 navigator.platform 返回统一编号
 * 0 -> 未知
 * 1 -> Win32
 * 2 -> Win64
 * 3 -> Linux ARM(armv/aarch64)
 * 4 -> Android
 * 5 -> iPhone
 * 6 -> iPad
 * 7 -> macOS(Intel)
 * 8 -> Linux x86/x64
 * 9 -> ARM(通用)
 * 10 -> iPod
 * 11 -> BlackBerry
 * 新增平台只需在列表末尾追加即可
 */
class PlatformFingerprint {
    static PATTERNS = Object.freeze([
        {name: 'Win32', pattern: /^Win32/i},
        {name: 'Win64', pattern: /^Win64/i},
        {name: 'Linux-ARM', pattern: /^Linux armv|^Linux aarch64/i},
        {name: 'Android', pattern: /^Android/i},
        {name: 'iPhone', pattern: /^iPhone/i},
        {name: 'iPad', pattern: /^iPad/i},
        {name: 'macOS-Intel', pattern: /^MacIntel/i},
        {name: 'Linux-x86', pattern: /^Linux [ix]\d+/i},
        {name: 'ARM', pattern: /^ARM/i},
        {name: 'iPod', pattern: /^iPod/i},
        {name: 'BlackBerry', pattern: /^BlackBerry/i}
    ]);

    /**
     * 获取平台编号
     * @param {string} [platform=navigator.platform] 可选，用于测试
     * @returns {number} 平台编号，0 表示未匹配
     */
    static detect(platform = navigator.platform) {
        for (let i = 0; i < this.PATTERNS.length; i++) {
            if (this.PATTERNS[i].pattern.test(platform)) return i + 1;
        }
        return 0;
    }

    /**
     * 获取平台可读名称
     * @param {number} code 平台编号
     * @returns {string}
     */
    static name(code) {
        if (code === 0) return 'Unknown';
        const item = this.PATTERNS[code - 1];
        return item ? item.name : 'Unknown';
    }
}

/**
 * FingerprintPacker
 * 将多源特征整合成 16~N 字节的二进制包，再转成 Base64URLSafe 字符串
 * 字段布局（小端）：
 *   [0]  采样次数(累加)
 *   [1]  随机数32位高16
 *   [2]  随机数32位低16
 *   [3]  首次采样时间戳
 *   [4]  最近一次采样时间戳
 *   [5]  平台编号(PlatformFingerprint)
 *   [6]  UA-Hash(低32位)
 *   [7]  保留
 *   [8]  鼠标移动计数(PageSensor)
 *   [9]  滚动计数
 *   [10] 点击计数
 *   [11] 按键计数
 *   [12] 最新 X(11bit) + 是否可信(1bit)
 *   [13] 最新 Y(11bit) + 是否可信(1bit)
 *   [14] 陀螺仪标志 & 电量标志 …
 *   [15] 校验/特征位
 *   ……后续如有扩展追加
 */
class FingerprintPacker {
    /* ---------- 构造 ---------- */
    constructor() {
        // 固定字段宽度模板（与原 B([2,2,4...]) 对应）
        this._schema = [2, 2, 4, 4, 4, 1, 1, 4, 4, 3, 2, 2, 2, 2, 2, 1, 2, 1, 1, 1, 1];
        // 二进制缓存（内部用）
        this._buffer = new DataView(new ArrayBuffer(64)); // 足够大即可
        // 采样计数器
        this._sampleCount = 0;
    }

    /* ============================================================
       公共 API
    ============================================================ */
    /**
     * 首次初始化（解码入参可选）
     * @param {string} [restoreStr]  如果存在先前字符串，可反序列化恢复
     */
    init(restoreStr) {
        if (restoreStr) {
            const bytes = Base64URLSafeWithChecksum.decode(restoreStr);
            if (bytes) this._loadFromBytes(bytes);
        }
        // 触发各子模块初始化
        PageSensor.start?.();
        EnvFingerprint.reset?.();
    }

    /**
     * 增量采样 & 打包
     * @param {number} flag  业务自定义 flag（原 r[0]）
     * @param {number} sid   场景 id（原 r[2]）
     * @returns {string}     Base64URLSafeWithChecksum 字符串
     */
    pack(flag = 0, sid = 0) {
        // 1. 填充字段
        this._fillFields(flag, sid);
        // 2. 序列化
        const bytes = this._serialize();
        // 3. 编码
        return Base64URLSafeWithChecksum.encode(bytes);
    }

    /* ============================================================
       内部实现
    ============================================================ */
    _fillFields(flag, sid) {
        const sensor = window.pageSensor;
        const now = Date.now() / 1000 >>> 0; // 秒级

        /* 首次采样 & 最新时间戳 */
        if (this._sampleCount === 0) {
            this._set32(3, now); // 首次
            this._set32(1, Math.floor(Math.random() * 0x10000)); // 随机数高16
            this._set16(2, Math.floor(Math.random() * 0x10000)); // 随机数低16
        }
        this._set32(4, now); // 最新
        this._sampleCount++;
        this._set16(0, this._sampleCount);

        /* 平台 & UA Hash */
        this._set8(5, PlatformFingerprint.detect());
        this._set32(6, this._hash32(navigator.userAgent));

        /* PageSensor 指标 */
        if (!EnvFingerprint.collectEnabled) {
            // 受停止条件影响，跳过细粒指标
            this._set24(8, 0);
            this._set16(9, 0);
            this._set16(10, 0);
            this._set16(11, 0);
            this._set16(12, 0);
            this._set16(13, 0);
        } else {
            this._set24(8, sensor.getMouseMoveCnt());
            this._set16(9, sensor.getScrollCnt());
            this._set16(10, sensor.getClickCnt());
            this._set16(11, sensor.getKeyDownCnt());
            const pt = sensor.getLatestPoint();
            this._set16(12, (pt.x & 0x7ff) | (pt.trusted ? 0x800 : 0));
            this._set16(13, (pt.y & 0x7ff) | (pt.trusted ? 0x800 : 0));
        }

        /* 额外布尔位 */
        let flags = 0;
        flags |= sensor?.isGyroSupported() ? 0x01 : 0;
        flags |= sensor?.isBatteryApiSupported() ? 0x02 : 0;
        flags |= sensor?.isBatteryCharging() ? 0 : 0x04; // 取反
        flags |= sensor?.isPageVisible() ? 0x08 : 0;
        flags |= sensor?.hasFocusEver() ? 0x10 : 0;
        flags |= sensor?.isScreenGapSmall() ? 0x20 : 0;
        this._set8(14, flags);

        /* 业务 flag / sid */
        this._set8(15, flag);
        // 额外字段可按 schema 继续追加
    }

    /* ---------- 序列化到字节数组 ---------- */
    _serialize() {
        // 简单做法：直接把已填充的数据复制出来
        // 原脚本用 B([...]) 按宽度压平，这里为了清晰直接取实际长度
        const len = 20; // 与 schema 对应
        const out = new Uint8Array(len);
        for (let i = 0; i < len; i++) out[i] = this._buffer.getUint8(i);
        return out;
    }

    /* ---------- 从字节数组恢复 ---------- */
    _loadFromBytes(bytes) {
        const dv = new DataView(bytes.buffer || bytes);
        this._sampleCount = dv.getUint16(0, true);
        // 其余字段按需恢复
    }

    /* ---------- 小端写工具 ---------- */
    _set8(offset, v) {
        this._buffer.setUint8(offset, v);
    }

    _set16(offset, v) {
        this._buffer.setUint16(offset, v, true);
    }

    _set24(offset, v) { // 3 字节
        this._buffer.setUint8(offset, v & 0xff);
        this._buffer.setUint8(offset + 1, (v >> 8) & 0xff);
        this._buffer.setUint8(offset + 2, (v >> 16) & 0xff);
    }

    _set32(offset, v) {
        this._buffer.setUint32(offset, v, true);
    }

    /* ---------- 工具：字符串简单 32 位 hash ---------- */
    _hash32(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = (hash << 5) - hash + str.charCodeAt(i);
            hash |= 0; // 转 32 位
        }
        return hash >>> 0;
    }
}


/**
 * DomainBeacon
 * 域名级埋点 & 白名单拦截
 *   - 白名单：E.fa（集团域名）、E.ga（本地调试域名）
 *   - 黑名单：E.ha（CDN/第三方域名）
 *   - Cookie：isg 管理器（CookieManager）
 *   - 上报：k.D(...)
 */
class DomainBeacon {
    constructor() {
        // 正则缓存
        this.domainRegex = null;
        // 定时器句柄
        this.timer = null;
    }

    /* ==========================================================
       公共 API
    ========================================================== */
    /** 初始化：读取 ISG、注册 pagehide 事件 */
    init() {
        // 1. 初始化白名单常量
        DomainWhitelist.init();      // 已在前面实现
        // 2. 初始化 ISG Cookie
        this.isgCookie = new CookieManager('isg');
        const exist = this.isgCookie.getValue();
        if (exist) {
            this._restoreFromCookie(exist);
        } else {
            const init = this._pack(false, true); // 首次
            this.isgCookie.setValue(init);
        }
        this._updateDomainRegex(init);

        // 3. 注册 pagehide 保存
        window.addEventListener('pagehide', () => {
            const fin = this._pack(false, true);
            this.isgCookie.setValue(fin);
        });
    }

    /**
     * 判断某 URL 是否需要拦截 / 打点
     * @param  {string}  url
     * @return {boolean} true = 需要拦截；false = 放行
     */
    shouldIntercept(url) {
        if (!url) return false;
        const host = this._extractHost(url);
        if (!host) return false;

        // 纯 IP 直接放行
        if (/^(\d+\.)*\d+$/.test(host)) return false;

        // 如果命中白名单直接放行
        if (DomainWhitelist.isAlibabaDomain(host) ||
            DomainWhitelist.isLocalDomain(host)) {
            return false;
        }

        // 黑名单放行
        if (DomainWhitelist.isCdnDomain(host)) return false;

        // 特定路径放行
        const path = url.split('?')[0];
        if (/gw-open|gw|ascp\.alibaba\.com/.test(path)) return false;

        // 打点并放行
        this.sendBeacon(url, 0);
        return false;
    }

    /**
     * 主动打点
     * @param {string} url
     * @param {number} type 0=普通 1=referrer
     */
    sendBeacon(url, type = 0) {
        const payload = this._pack(true, false);
        // 假设 k.D 是全局上报函数
        window.k?.D(url, payload, type);
    }

    /* ==========================================================
       内部实现
    ========================================================== */
    /** 从域名最右端开始向左拼接，直到命中任一集合或达到最大级数 */
    _shortenDomain(hostname) {
        const parts = hostname.split('.');
        let suffix = parts.pop();
        const maxLevel = Math.min(parts.length + 1, 5);
        for (let level = 1; level < maxLevel; level++) {
            if (DomainWhitelist.isAlibabaDomain(suffix) ||
                DomainWhitelist.isLocalDomain(suffix) ||
                DomainWhitelist.isCdnDomain(suffix)) {
                break;
            }
            const next = parts.pop();
            suffix = `${next}.${suffix}`;
        }
        return suffix;
    }

    /** 根据打包结果更新 domain 正则，用于后续匹配 */
    _updateDomainRegex(packed) {
        const domain = this._shortenDomain(location.hostname);
        const escaped = domain.replace(/\./g, '\\.');
        this.domainRegex = new RegExp(`(^|\\.)${escaped}$`, 'i');
    }

    /** 打包当前状态（Base64URLSafe） */
    _pack(isUpdate, isUnload) {
        // 与 W.sa 相同逻辑
        return window.W?.sa(isUpdate, isUnload) ?? '';
    }

    /** 从 Cookie 恢复（Base64URLSafe 解码） */
    _restoreFromCookie(val) {
        // 如有需要可解码 val 并恢复内部状态
    }

    /** 简单提取 host */
    _extractHost(url) {
        try {
            return new URL(url, location.href).hostname;
        } catch {
            return '';
        }
    }

    /** 清理所有 Cookie（调试用） */
    clearAll() {
        const mgr = new CookieManager('isg');
        mgr.remove();
    }
}

/**
 * SufeiSDK
 * 统一初始化 + 对外 API
 * 内部会自动：
 *   - 初始化所有采集器
 *   - 注册全局错误监听
 *   - 对外提供打包、拦截、版本号
 */

const sufeiReporter = new SufeiDataReporter();
class SufeiSDK {
    static version = '1.0.0';

    /* ---------- 单例 ---------- */
    static #inited = false;
    static #instance = null;

    /* ---------- 初始化（全局只跑一次） ---------- */
    static init(options = {}) {
        if (this.#inited) return this.#instance;
        this.#inited = true;

        try {
            // 1. 各子模块初始化
            Base64URLSafeWithChecksum;   // 工具类，无需额外初始化
            PlatformFingerprint;         // 静态工具类
            DomainWhitelist;             // 静态工具类

            // 2. 运行时采集器
            const pageSensor = new PageSensor();
            const envFinger = new EnvFingerprint();
            const domainBeacon = new DomainBeacon();
            const packer = new FingerprintPacker();

            // 3. 启动
            pageSensor.start();
            envFinger.reset();
            domainBeacon.init();
            packer.init(options.restore);
            // 4. 全局错误监听
            window.addEventListener('error', e => sufeiReporter.reportError(e.error));
            window.addEventListener('unhandledrejection', e =>
                sufeiReporter.reportError(e.reason)
            );

            this.#instance = {
                pageSensor,
                envFinger,
                domainBeacon,
                packer
            };
        } catch (err) {
            sufeiReporter.reportError(err);
        }
        return this.#instance;
    }

    /* ---------- 快捷 API ---------- */
    static pack(flag = 0, sid = 0) {
        return this.#instance?.packer.pack(flag, sid) ?? '';
    }

    static shouldIntercept(url) {
        return this.#instance?.domainBeacon.shouldIntercept(url) ?? false;
    }

    static sendBeacon(url, type = 0) {
        return this.#instance?.domainBeacon.sendBeacon(url, type);
    }

    static clear() {
        this.#instance?.domainBeacon.clearAll();
    }
}

/* ============ 运行时自动触发（兼容旧脚本） ============ */
(() => {
    const GLOBAL_KEY = '_sufei_data2';
    if (window[GLOBAL_KEY]) return;          // 已执行
    window[GLOBAL_KEY] = true;
    SufeiSDK.init();                         // 启动
})();
