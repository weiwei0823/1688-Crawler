!function (e, t) {
    var n = 10000,
        g_moduleConfig = {
            uabModule: {
                grey: [
                    'AWSC/uab/1.140.0/collina.js'
                ],
                stable: [
                    'AWSC/uab/1.140.0/collina.js'
                ],
                greyBr: [
                    'AWSC-br/uab/1.140.0/collina.js'
                ],
                stableBr: [
                    'AWSC-br/uab/1.140.0/collina.js'
                ],
                ratio: 10000,
                greyConfig: {
                },
                stableConfig: {
                }
            },
            fyModule: {
                grey: [
                    'AWSC/fireyejs/1.231.67/fireyejs.js'
                ],
                stable: [
                    'AWSC/fireyejs/1.231.61/fireyejs.js'
                ],
                greyBr: [
                    'AWSC-br/fireyejs/1.227.0/fireyejs.js'
                ],
                stableBr: [
                    'AWSC-br/fireyejs/1.227.0/fireyejs.js'
                ],
                ratio: 10000,
                greyConfig: {
                },
                stableConfig: {
                }
            },
            nsModule: {
                grey: [
                    'js/nc/60.js'
                ],
                stable: [
                    'js/nc/60.js'
                ],
                ratio: 10000,
                greyConfig: {
                },
                stableConfig: {
                }
            },
            umidPCModule: {
                grey: [
                    'AWSC/WebUMID/1.93.0/um.js'
                ],
                stable: [
                    'AWSC/WebUMID/1.93.0/um.js'
                ],
                greyBr: [
                    'AWSC-br/WebUMID/1.93.0/um.js'
                ],
                stableBr: [
                    'AWSC-br/WebUMID/1.93.0/um.js'
                ],
                ratio: 10000,
                greyConfig: {
                },
                stableConfig: {
                }
            },
            etModule: {
                grey: [
                    'AWSC/et/1.83.35/et_f.js',
                    'AWSC/et/1.83.35/et_f.js'
                ],
                stable: [
                    'AWSC/et/1.83.8/et_f.js',
                    'AWSC/et/1.83.8/et_f.js'
                ],
                greyBr: [
                    'AWSC-br/et/1.80.0/et_f.js',
                    'AWSC-br/et/1.80.1/et_n.js'
                ],
                stableBr: [
                    'AWSC-br/et/1.80.0/et_f.js',
                    'AWSC-br/et/1.80.1/et_n.js'
                ],
                ratio: 10000,
                greyConfig: {
                    whitelist: [
                        '*'
                    ]
                },
                stableConfig: {
                    whitelist: [
                        '*'
                    ]
                }
            },
            ncModule: {
                grey: [
                    'AWSC/nc/1.97.0/nc.js'
                ],
                stable: [
                    'AWSC/nc/1.97.0/nc.js'
                ],
                ratio: 10000,
                greyConfig: {
                },
                stableConfig: {
                }
            }
        },
        o = [
            {
                name: 'umidPCModule',
                features: [
                    'umpc',
                    'um',
                    'umh5'
                ],
                depends: [],
                sync: !1
            },
            {
                name: 'uabModule',
                features: [
                    'uab'
                ],
                depends: [],
                sync: !1
            },
            {
                name: 'fyModule',
                features: [
                    'fy'
                ],
                depends: [],
                sync: !1
            },
            {
                name: 'nsModule',
                features: [
                    'ns'
                ],
                depends: [],
                sync: !1
            },
            {
                name: 'etModule',
                features: [
                    'et'
                ],
                depends: [],
                sync: !1
            },
            {
                name: 'ncModule',
                features: [
                    'nc',
                    'nvc',
                    'ic'
                ],
                depends: [
                    'fy'
                ],
                sync: !1
            }
        ],
        r = navigator.userAgent,
        a = r.match(/Chrome\/(\d*)/);
    a &&
    (a = + a[1]);
    var i = r.match(/Edge\/([\d]*)/),
        s = r.match(/Safari\/([\d]*)/),
        c = r.match(/Firefox\/([\d]*)/),
        d = r.match(/MSIE|Trident/);
    function f() {
        var e = 'function%20javaEnabled%28%29%20%7B%20%5Bnative%20code%5D%20%7D';
        return 'WebkitAppearance' in document.documentElement.style &&
        escape(navigator.javaEnabled.toString()) === e ? !0 : !1
    }
    function l(t, o) {
        var r = 'AWSC_SPECIFY_' + t.toUpperCase() + '_ADDRESSES';
        if (e[r]) return e[r];
        var l = {
            normalAddresses: [],
            brAddresses: []
        };
        for (var u in g_moduleConfig) if (g_moduleConfig.hasOwnProperty(u) && u === t) {
            var m = g_moduleConfig[u],
                p = Math.ceil(Math.random() * n) <= m.ratio;
            l.normalAddresses = p ? m.grey.slice() : m.stable.slice(),
            m.stableBr &&
            m.greyBr &&
            (l.brAddresses = p ? m.greyBr.slice() : m.stableBr.slice()),
            'etModule' === t &&
            (
                i ? (l.normalAddresses.pop(), l.brAddresses.pop()) : a ? (l.normalAddresses.pop(), l.brAddresses.pop()) : s ||
                c ||
                d ? (l.normalAddresses.shift(), l.brAddresses.shift()) : f() ? (l.normalAddresses.pop(), l.brAddresses.pop()) : (l.normalAddresses.shift(), l.brAddresses.shift())
            );
            for (var g = 0; g < l.normalAddresses.length; g++) {
                var h = o ? 'https://' + o + '/' : y;
                (
                    'https://assets.alicdn.com/' === h ||
                    'https://lzd-g.slatic.net/' === h ||
                    'https://g.lazcdn.com/' === h ||
                    'https://assets.aliexpress-media.com/' === h
                ) &&
                (h += 'g/'),
                    l.normalAddresses[g] = h + l.normalAddresses[g],
                l.brAddresses[g] &&
                (l.brAddresses[g] = h + l.brAddresses[g])
            }
            return l
        }
    }
    var u = [],
        m = 'loading',
        p = 'loaded',
        g = 'timeout',
        h = 'unexpected',
        b = 'no such feature',
        v = new RegExp(
            '^([\\w\\d+.-]+:)?(?://(?:([^/?#@]*)@)?([\\w\\d\\-\\u0100-\\uffff.+%]*|\\[[^\\]]+\\])(?::([0-9]+))?)?([^?#]+)?(\\?[^#]*)?(#.*)?$'
        ),
        y = F(Y());
    function A(e, t, n) {
        try {
            var o = e + '=';
            t &&
            (o += '; domain=' + t + '; path= /;'),
                o += '; expires=Thu, 01 Jan 1970 00:00:00 GMT',
            n &&
            (o += '; SameSite=None; Secure', o += '; Partitioned'),
                document.cookie = o
        } catch (r) {
        }
    }
    try {
        var C = window.location.hostname,
            S = window.awscrprtrt ||
                1;
        if (
            Math.random() < S &&
            (
                C.indexOf('aliexpress.com') > - 1 ||
                C.indexOf('aliexpress.us') > - 1
            )
        ) {
            var w = /^(\d+\.)*\d+$/;
            if (!w.test(C)) {
                var j = '(^|\\.)' + C.replace(/\./g, '\\.') + '$',
                    _ = e.RegExp(j, 'i'),
                    x = C.split('.'),
                    T = x.length;
                if (T > 1) {
                    T = T > 5 ? 5 : T,
                        C = x.pop();
                    for (var k = 2; T >= k; k++) C = x.pop() + '.' + C,
                        A('tfstk', C, !1)
                }
            }
            function W() {
                var e = window.location.hostname;
                return e.indexOf('aliexpress.com') > - 1 ? 'aliexpress.com' : e.indexOf('aliexpress.us') > - 1 ? 'aliexpress.us' : null
            }
            var M = W(),
                U = {
                    key: '_baxia_sec_cookie_',
                    maxLength: 4096,
                    expires: 180,
                    domain: M,
                    path: '/',
                    secure: !1,
                    sameSite: 'Lax',
                    Partitioned: !1
                };
            function O(e) {
                for (
                    var t = encodeURIComponent(e) + '=',
                        n = document.cookie.split(';'),
                        o = 0;
                    o < n.length;
                    o++
                ) {
                    for (var r = n[o]; ' ' === r.charAt(0); ) r = r.substring(1);
                    if (0 === r.indexOf(t)) return decodeURIComponent(r.substring(t.length))
                }
                return null
            }
            function D(e) {
                if (e && 'string' == typeof e) {
                    var t = O('_baxia_sec_cookie_');
                    if (
                        t = t ? JSON.parse(decodeURIComponent(t)) : null,
                        t &&
                        t.hasOwnProperty(e)
                    ) return delete t[e],
                        E(t, U)
                }
            }
            function I(e, t, n) {
                var o = encodeURIComponent(e) + '=' + encodeURIComponent(t);
                if (n.expires) {
                    var r = new Date;
                    r.setTime(r.getTime() + 24 * n.expires * 60 * 60 * 1000),
                        o += '; expires=' + r.toUTCString()
                }
                n.domain &&
                (o += '; domain=' + n.domain),
                n.path &&
                (o += '; path=' + n.path),
                    n.Partitioned ? o += '; SameSite=None;Secure;Partitioned' : (
                        n.secure &&
                        (o += '; secure'),
                        n.sameSite &&
                        (o += '; samesite=' + n.sameSite)
                    ),
                    document.cookie = o
            }
            function E(e, t) {
                if (e && 'object' == typeof e) try {
                    var n = JSON.parse(JSON.stringify(t)),
                        o = encodeURIComponent(JSON.stringify(e));
                    if (o.length > n.maxLength) return;
                    I(n.key, o, n)
                } catch (r) {
                }
            }
            D('tfstk')
        }
    } catch (B) {
    }
    function F(e) {
        var t = 'https://g.alicdn.com/';
        if (!e) return t;
        if (
            location.href &&
            location.href.indexOf &&
            (
                location.href.indexOf('es.aliexpress.com') > - 1 ||
                location.href.indexOf('it.aliexpress.com') > - 1
            )
        ) return 'https://assets.aliexpress-media.com/';
        if (/aliexpress/.test(location.href)) return 'https://aeis.alicdn.com/';
        var n = v.exec(e);
        return n ? 'https://' + n[3] + (n[4] ? ':' + n[4] : '') + '/' : t
    }
    function Y() {
        for (
            var e = document.getElementsByTagName('script'),
                t = 0;
            t < e.length;
            t++
        ) {
            var n = e[t],
                o = n.hasAttribute ? n.src : n.getAttribute('src', 4);
            if (/\/awsc\.js/.test(o)) return o
        }
    }
    function R(e) {
        for (var t = void 0, n = 0; n < o.length; n++) {
            for (var r = o[n], a = 0; a < r.features.length; a++) if (r.features[a] === e) {
                t = r;
                break
            }
            if (t) break
        }
        return t
    }
    function N(e) {
        for (var t = 0; t < u.length; t++) {
            var n = u[t];
            if (n.name === e) return n
        }
    }
    function P(e) {
        for (var t = void 0, n = 0; n < o.length; n++) {
            var r = o[n];
            if (r.name === e) {
                t = r;
                break
            }
            if (t) break
        }
        return t
    }
    function q(e, n, o) {
        if (o) for (var r = 0; r < e.normalAddresses.length; r++) {
            var a = e.normalAddresses[r];
            t.write('<script src=' + a + '></script>')
        } else {
            function i(e, o, r) {
                for (var a = 0; a < e.length; a++) {
                    var i = e[a],
                        s = t.createElement('script');
                    s.async = !1,
                        s.src = i,
                        s.id = n;
                    var c = (new Date).getTime();
                    s.onerror = o ||
                        function () {
                            location.href &&
                            location.href.indexOf &&
                            (
                                location.href.indexOf('es.aliexpress.com') > - 1 ||
                                location.href.indexOf('it.aliexpress.com') > - 1
                            ) &&
                            J(
                                'loadjserr',
                                'loadid=' + n + '&time=' + ((new Date).getTime() - c),
                                'awsc_load'
                            )
                        };
                    var d = window.awscrprtrt ||
                        0.001;
                    Math.random() < d ? s.onload = r ||
                            function () {
                                J(
                                    'loadtime',
                                    'loadid=' + n + '&time=' + ((new Date).getTime() - c),
                                    'awsc_load'
                                )
                            }
                        : s.onload = r ||
                            function () {
                            };
                    var f = t.getElementsByTagName('script') [0];
                    f &&
                    f.parentNode ? f.parentNode.insertBefore(s, f) : (f = t.body || t.head, f && f.appendChild(s))
                }
            }
            i(e.normalAddresses)
        }
    }
    function J(t, n, o) {
        var r = 'https://acjs.aliyun.com/error?v=' + t + '&e=' + encodeURIComponent(n) + '&stack=' + encodeURIComponent(o) + '&version=1.0.0&log=awsc&href=' + encodeURIComponent(location.href),
            a = new Image,
            i = '_awsc_img_' + Math.floor(1000000 * Math.random());
        e[i] = a,
            a.onload = a.onerror = function () {
                try {
                    delete e[i]
                } catch (t) {
                    e[i] = null
                }
            },
            a.src = r
    }
    function $(e, t) {
        Math.random() < 0.0001 &&
        J(
            'awsc_state',
            'feature=' + e.name + '&state=' + e.state + '&href=' + encodeURIComponent(location.href)
        );
        for (var n = void 0; n = e.callbacks.shift(); ) try {
            if ('function' == typeof n) n(e.state, e.exportObj);
            else if ('object' == typeof n) {
                var o = e.exportObj;
                o &&
                'function' == typeof o.init &&
                o.init(n)
            }
        } catch (r) {
            if (t) throw r;
            J(e.name, r.message, r.stack)
        }
    }
    function L(e, t, n, o) {
        var r = R(e);
        if (!r) return 'function' == typeof t &&
        t(b),
            void 0;
        var a = n &&
                n.cdn,
            i = n &&
                n.sync,
            s = n &&
                n.timeout ||
                5000;
        if (0 !== r.depends.length) for (var c = 0; c < r.depends.length; c++) {
            var d = r.depends[c];
            n &&
            (delete n.sync, delete n.timeout, delete n.cdn),
                z(d, void 0, n)
        }
        var f = o ||
            {
            };
        f.module = r,
            f.name = e,
            f.state = m,
            f.callbacks = f.callbacks ||
                [],
            f.options = n,
        t &&
        f.callbacks.push(t),
            f.timeoutTimer = setTimeout(function () {
                f.state = g,
                    $(f, n && n.throwExceptionInCallback)
            }, s),
        o ||
        u.push(f);
        var p = r.sync;
        i &&
        (p = i);
        var h = l(r.name, a);
        q(h, 'AWSC_' + r.name, p)
    }
    function z(e, t, n) {
        var o = N(e);
        if (o) if (o.state === g) L(e, t, n, o);
        else if (o.state === p) {
            if ('function' == typeof t) t(o.state, o.exportObj);
            else if ('object' == typeof t) {
                var r = o.exportObj;
                r &&
                'function' == typeof r.init &&
                r.init(t)
            }
        } else o.state === m ? t &&
            o.callbacks.push(t) : void 0;
        else L(e, t, n)
    }
    function G(e, t, n) {
        var o = !1;
        try {
            var r = P(e);
            r ||
            void 0,
                r.moduleLoadStatus = p;
            for (var a = void 0, i = 0; i < u.length; i++) {
                var s = u[i];
                s.module === r &&
                s.name === t &&
                (
                    o = s.options &&
                        s.options.throwExceptionInCallback,
                        a = s,
                        clearTimeout(a.timeoutTimer),
                        delete a.timeoutTimer,
                        a.exportObj = n,
                        s.state === m ||
                        s.state === g ? (a.state = p, setTimeout(function () {
                            $(a, o)
                        }, 0)) : void 0
                )
            }
            a ||
            (
                a = {},
                    a.module = r,
                    a.name = t,
                    a.state = p,
                    a.exportObj = n,
                    a.callbacks = [],
                    u.push(a)
            )
        } catch (c) {
            if (o) throw c;
            J('awsc_error', c.message, c.stack)
        }
    }
    function H(e) {
        e.AWSCFY = function () {
        },
            e.AWSC.configFY = function (e, n, o, r) {
                return t(e, n, o, r)
            },
            e.AWSC.configFYSync = function (e, n) {
                return t(null, e, n)
            };
        function t(t, n, o, r) {
            var a = location.protocol + '//' + location.host + location.pathname,
                i = new e.AWSCFY;
            e._umopt_npfp = 0;
            var s = !1;
            i.umidToken = 'defaultToken1_um_not_loaded@@' + a + '@@' + (new Date).getTime(),
                e.AWSC.use(
                    'um',
                    function (e, t) {
                        'loaded' === e ? (
                            i.umidToken = 'defaultToken3_init_callback_not_called@@' + a + '@@' + (new Date).getTime(),
                                t.init(
                                    n,
                                    function (e, t) {
                                        'success' === e ? i.umidToken = t.tn : i.umidToken = 'defaultToken4_init_failed with ' + e + '@@' + a + '@@' + (new Date).getTime(),
                                            s = !0,
                                            f()
                                    }
                                )
                        ) : (
                            i.umidToken = 'defaultToken2_load_failed with ' + e + '@@' + a + '@@' + (new Date).getTime(),
                                s = !0,
                                f()
                        )
                    }
                );
            var c = !1;
            if (
                i.getUA = function () {
                    return 'defaultUA1_uab_not_loaded@@' + a + '@@' + (new Date).getTime()
                },
                    e.AWSC.use(
                        'uab',
                        function (e, t) {
                            c = !0,
                                'loaded' === e ? (
                                    i.uabModule = t,
                                        i.uabConfig = o,
                                        i.getUA = function () {
                                            return this.uabModule.getUA(this.uabConfig)
                                        }
                                ) : i.getUA = function () {
                                    return 'defaultUA2_load_failed with ' + e + '@@' + a + '@@' + (new Date).getTime()
                                },
                                f()
                        }
                    ),
                null != t
            ) var d = e.setTimeout(function () {
                f(!0)
            }, r ? r : 2000);
            function f(n) {
                null != t &&
                (c && s || n) &&
                (t(i), e.clearTimeout(d))
            }
            return null == t ? i : void 0
        }
    }
    function K(e) {
        var t = function () {
        };
        e.AWSC.configFYEx = function (e, t, o) {
            return n(e, t, o)
        },
            e.AWSC.configFYSyncEx = function (e) {
                return n(null, e)
            };
        function n(n, o, r) {
            var a = (location.protocol + '//' + location.host + location.pathname).substr(0, 128),
                i = new t;
            if (r = r || 5000, 'function' == typeof n) var s = e.setTimeout(function () {
                c()
            }, r);
            function c() {
                'function' == typeof n &&
                (n(i), e.clearTimeout(s))
            }
            return i.getFYToken = i.getUidToken = function () {
                return 'defaultFY1_fyjs_not_loaded@@' + a + '@@' + (new Date).getTime()
            },
                e.fyglobalopt = o,
                e.AWSC.use(
                    'fy',
                    function (e, t) {
                        'loaded' === e ? (
                            i.getFYToken = i.getUidToken = function () {
                                return 'defaultFY3_fyjs_not_initialized@@' + a + '@@' + (new Date).getTime()
                            },
                                i.fyObj = t,
                                t.init(
                                    o,
                                    function (e) {
                                        i.getFYToken = function (e) {
                                            return 'object' == typeof e &&
                                            e.reqUrl &&
                                            'string' == typeof e.reqUrl ? o.reqUrl = e.reqUrl : 'string' == typeof e &&
                                                (o.reqUrl = e),
                                                this.fyObj.getFYToken(o)
                                        },
                                            i.getUidToken = function () {
                                                return this.fyObj.getUidToken(o)
                                            },
                                            c()
                                    }
                                )
                        ) : (
                            i.getFYToken = i.getUidToken = function () {
                                return 'defaultFY2_load_failed with ' + e + '@@' + a + '@@' + (new Date).getTime()
                            },
                                c()
                        )
                    },
                    {
                        timeout: r
                    }
                ),
                'function' == typeof n ? void 0 : i
        }
    }
    function Q(e) {
        var t = g_moduleConfig.etModule,
            o = Math.ceil(Math.random() * n) <= t.ratio,
            r = o ? t.greyConfig.whitelist : t.stableConfig.whitelist,
            a = new RegExp(('^' + r.join('$|^') + '$').replace(/\*/g, '.*'));
        a.test(location.host + location.pathname) &&
        (window.etrprtrt = 0.01, e.__etModule || e.AWSC.use('et'))
    }
    var V = window.awscrprtrt ||
        0.01;
    Math.random() < V &&
    J('init', 'report', 'awsc');
    function X(e) {
        e.AWSC ||
        (
            e.AWSC = {},
                e.AWSC.use = z,
                e.AWSCInner = {},
                e.AWSCInner.register = G,
                H(e),
                K(e),
                Q(e)
        )
    }
    X(e)
}(window, document);
