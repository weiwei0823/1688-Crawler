!function () {
    "use strict";
    var a = location, o = document, e = function (e, c, m, t) {
        (void 0 === c && (c = 1), void 0 === m && (m = .1), void 0 === t && (t = "baxia-fast"), 0 >= m || Math.random() < m) && function (a, o) {
            var e = [];
            for (var c in a) e.push(c + "=" + encodeURIComponent(a[c]));
            (new Image).src = o + e.join("&")
        }({
            code: c,
            msg: e + "",
            pid: t,
            page: a.href.split(/[#?]/)[0],
            query: a.search.substr(1),
            hash: a.hash,
            referrer: o.referrer,
            title: o.title,
            ua: navigator.userAgent
        }, "//gm.mmstat.com/fsp.1.1?")
    };
    var c = ["alires", "pha_pageheader", "pha_header", "/punish", "fourier.taobao.com/assist", "fourier.alibaba.com/assist", "market.m.taobao.com/app/tbhome/common/index.html", ".sm.cn", ".sm-tc.cn", ".alipay.com", ".aliyun.com", ".aliexpress.us", ".aliexpress.com", "error.taobao.com", "sialiagames", "vntth", "qookkagames", "mobijoygames"];
    var m = document, t = window, i = "https://bdc.alibabachengdun.com/wcfg.json";
    location.hostname && location.hostname.indexOf("taobao.com") > -1 ? i = "https://umdc.taobao.com/wcfg.json" : location.hostname && location.hostname.indexOf("tmall.com") > -1 && (i = "https://umdc.tmall.com/wcfg.json");
    var n = function (a) {
        for (var o = m.cookie.split(";"), e = 0; o.length > e; e++) {
            var c = o[e].split("=");
            if (a.trim() === c[0].trim()) try {
                return decodeURIComponent(c[1])
            } catch (t) {
                return c[1]
            }
        }
        return null
    }, l = function (a) {
        "fireye" === (a = a || {}).name && t.AWSC && t.AWSC.configFYEx ? t.AWSC.configFYEx(function (o) {
            o && o.fyObj && o.fyObj.UBInit && o.fyObj.UBInit(a.params || {})
        }) : a.url && function (a, o, c, t) {
            if (!a) return o();
            var i = m.getElementsByTagName("script")[0], n = m.createElement("script");
            if (n.async = !0, n.src = a, t && (n.bxOriginUrl = t), a.indexOf("alicdn") > -1 && (n.crossOrigin = !0), n.onerror = function (o) {
                e("function:loadJS web_behavior_sample error. msg:" + a + "load error。props：" + JSON.stringify(c)), n.onerror = null
            }, o) {
                var l = !1;
                n.onload = n.onreadystatechange = function () {
                    l || n.readyState && !/loaded|complete/.test(n.readyState) || (n.onload = n.onreadystatechange = null, l = !0, o())
                }
            }
            i.parentNode.insertBefore(n, i)
        }(a.url, function () {
            e("function:web_behavior_sample request success", 12, .01, "spl")
        })
    }, r = document, s = 1, b = function (a, o, c) {
        if (!a) return o();
        var m = r.getElementsByTagName("script")[0], t = r.createElement("script");
        if (t.async = !0, t.src = a, (a.indexOf("alicdn") > -1 || a.indexOf("lazcdn") > -1 || a.indexOf("lzd-g.slatic.net") > -1) && (t.crossOrigin = !0), t.onerror = function (m) {
            5 > s ? (s++, b(a, o, c)) : (t.onerror = null, e("function:loadJS. msg:" + a + "load error。props：" + JSON.stringify(c)))
        }, o) {
            var i = !1;
            t.onload = t.onreadystatechange = function () {
                i || t.readyState && !/loaded|complete/.test(t.readyState) || (t.onload = t.onreadystatechange = null, i = !0, o())
            }
        }
        m.parentNode.insertBefore(t, m)
    }, u = function (a, o) {
        return !!a && a.indexOf(o) > -1
    }, d = function () {
        if (document.currentScript) return document.currentScript;
        var a = null, o = document.getElementsByTagName("script"), e = null;
        try {
            throw Error()
        } catch (t) {
            var c, m = (/.*at [^\(]*\((.*):.+:.+\)$/gi.exec(t.stack) || [!1])[1];
            for (c in o) if ((e = o[c]).src == m || "interactive" == e.readyState) return a = o[c], o[c]
        }
        return a
    }, p = window, h = function (a, o) {
        var e = p.__baxia__ || {};
        return a ? e[a] || o : e
    }, w = function (a, o) {
        p.__baxia__ = p.__baxia__ || {}, p.__baxia__[a] = o
    }, g = {"post.alibaba.com": ["/product/publish.htm"]};

    function f(a) {
        if (a) {
            var o = a.paramsType;
            !1 !== a.enableFireye && (!o || o.indexOf("uab") > -1 || o.indexOf("umid") > -1 || o.indexOf("pip") > -1) && (a.enableFireye = !0)
        }
        a && a.enableFireye && a.checkApiPath && function () {
            if (!h("loadFireye")) {
                var a = d(), o = a && a.src ? a.src.match(/https\:\/\/([^&]+).alicdn/) : [, "g"], c = o && o[1], m = "";
                -1 === ["laz-g-cdn", "aeis", "assets"].indexOf(c) && (c = "g"), m = "https://" + c + ".alicdn.com/", "assets" === c && (m += "g/"), w("loadFireye", !0), b(m + "AWSC/fireyejs/1.231.11/fireyejs.js", function () {
                    e("msg: load awsc success 1.231.11", "loadFireye", .01)
                }, null)
            }
        }()
    }

    var y = ["agi.taobao.com", "h5.aligenie.com", "alicrm.alibaba.com", "c2mbc.service.xixikf.cn", "cart.lazada.com.ph", "cheng.xin", "cnpassport.youku.com", "databank.tmall.com", "detail.i56.taobao.com", "detail.taobao.com", "detail.tmall.hk", "insight.tmall.com", "insights.alibaba.com", "item.manager.tmall.com", "jibu.taobao.com", "ltao.seller.taobao.com", "m.amap.com", "m.tb.cn", "mcn.guanghe.taobao.com", "mi.aliyun.com", "mltsm.tmall.com", "mos.miaostreet.com", "new.m.taobao.com", "orderwebs.yzcsoft.com", "play.tudou.com", "pre-www.aliyun.com", "qianniu.xiangqing.taobao.com", "qianwen-mobile.aliyun.com", "rate.taobao.com", "refund.m.taobao.com", "s.click.1688.com", "search.1688.com", "sf-item.taobao.com", "shop35699486.taobao.com", "sme.aliyun.com", "subway.simba.taobao.com", "susong-item.taobao.com", "tadget.taobao.com", "tao.1688.com", "we.taobao.com", "www.aliwork.com", "www.fliggy.com", "www.google.com", "www.jiaoyimao.com", "www.lazada.co.id", "www.youku.com", "x56.1688.com", "xinxiangyin.m.tmall.com", "xldesk.cainiao.com", "yeyingweishi.m.tmall.com", "zc-item.taobao.com", "zc-paimai.taobao.com", "acs.m.taobao.com", "aliance.1688.com", "b.cainiao.com", "detailskip.taobao.com", "dianxiaomi.taobao.com", "en.jiagle.com", "erp.yslcloud.com", "go.1688.com", "guide-acs.m.taobao.com", "h5api.m.1688.com", "h5api.m.taobao.com", "h5api.m.tmall.com", "healthcenter.taobao.com", "holmes.taobao.com", "hot.taobao.com", "item.publish.taobao.com", "kb-render.chuangyi.taobao.com", "kf.topchitu.com", "laputa.1688.com", "login.1688.com", "login.dingtalk.com", "m.baidu.com", "m.biubiu001.com", "market.aliyun.com", "one.alimama.com", "onetalk.alibaba.com", "page.sto.cn", "pages.lazada.co.th", "pages.lazada.com.ph", "pc.pay.youku.com", "piao.bjry.com", "render.alipay.com", "scenario-front.taobao.com", "search.damai.cn", "sellercenter.lazada.com.my", "sellercenter.lazada.sg", "share.biubiu001.com", "shop513049706.m.taobao.com", "shopsearch.taobao.com", "strategy.tmall.com", "stream-upload.taobao.com", "t.youku.com", "tb.ele.me", "tgc.tmall.com", "trade2.m.1688.com", "travelsearch.fliggy.com", "web.56xiniao.com", "www.alimama.com", "www.dataoke.com", "www.dingtalk.com", "www.en-sjgle.com", "www.iqiyi.com", "www.jiagle.com", "wwww.taobao.com", "xiangqing.wangpu.taobao.com", "acs.m.tmall.com", "ad.alimama.com", "ai.taobao.com", "bigsale.tmall.com", "boce.aliyun.com", "chuangyi.taobao.com", "creator.guanghe.taobao.com", "dashi.aliyun.com", "desk.cainiao.com", "developer.amap.com", "einvoice.taobao.com", "fly.cainiao.com", "fuwu.alimama.com", "gushi-gifts.en.alibaba.com", "h5api.m.goofish.com", "hzmy.alibaba.com", "ipassport.damai.cn", "item.manager.taobao.com", "item.upload.tmall.com", "kns.cnki.net", "lbs.amap.com", "list.tmall.com", "loginmyseller.taobao.com", "m.1688.com", "m.cphi.cn", "m.intl.taobao.com", "main.m.taobao.com", "mdskip.taobao.com", "member1.taobao.com", "pages.ltao.com", "profile.alibaba.com", "pub.alimama.com", "rd6.zhaopin.com", "saas.flight.fliggy.com", "sell.publish.tmall.com", "sell.taobao.com", "shop.m.taobao.com", "shop507234291.taobao.com", "shop588437233.taobao.com", "sourcing.alibaba.com", "stream-xiangqing.taobao.com", "stream.xiangqing.taobao.com", "studio.iot.aliyun.com", "tm.aliyun.com", "tradearchive.taobao.com", "translate.alibaba.com", "tuopaijl.m.tmall.com", "wuliu2.taobao.com", "www.cphi.cn", "www.goofish.com", "www.lazada.com.my", "www.taoguba.com.cn", "www.yicai.com", "yds.taobao.com", "ythxjzyy.maitix.com", "account-lingxi.aligames.com", "detail.tmall.com", "account.alibabacloud.com", "buyertrade.taobao.com", "fwzl-tickets.sto.cn", "refund2.taobao.com", "trade.taobao.com", "wuliu.taobao.com", "tbskip.taobao.com", "www.1688.com", "cart.taobao.com", "login.taobao.com", "m.jiaoyimao.com", "havanalogin.taobao.com", "hotel.fliggy.com", "m.p4psearch.1688.com", "myseller.taobao.com", "refund2.tmall.com", "upload.taobao.com", "www.baidu.com", "csplatform-ccs.aliyun.com", "item.upload.taobao.com", "router.publish.taobao.com", "shoucang.taobao.com", "v.youku.com", "account.aliyun.com", "2.taobao.com", "tongyi.aliyun.com", ".taobao.com", "1bp.taobao.com", "acs-m.lazada.co.id", "acs-m.lazada.co.th", "acs-m.lazada.com.ph", "acs.m.goofish.com", "adidas.tmall.com", "ai.alimebot.taobao.com", "ai.m.taobao.com", "ai.world.taobao.com", "air.tb.ele.me", "alihealth.service.xixikf.cn", "alipm.sale.tmall.com", "alisite-mobile.alibaba.com", "alsc-buy2.ele.me", "amap.com", "anta.tmall.com", "api.gj.dangxun.com", "arabic.alibaba.com", "auth.wms.cainiao.com", "baike.taobao.com", "baxia.dingtalk.com", "baxia.f09qgja1.com", "biaoju.cainiao.com", "biz.alibaba.com", "bosideng.tmall.com", "branding.alimama.com", "branding.taobao.com", "buy.m.tmall.com", "c.lazada.co.th", "c.lazada.com.ph", "cart.1688.com", "cart.lazada.co.th", "cashier.alibaba.com", "chaoshi.detail.tmall.com", "chinese.alibaba.com", "cn.bing.com", "common-buy.aliyun.com", "crm-martini.alibaba-inc.com", "crm.alibaba.com", "crm.aliyun-inc.com", "data.alibaba.com", "dayin.cainiao.com", "dc.console.aliyun.com", "decathlon.tmall.com", "detail.1688.com", "detail.damai.cn", "devata.aliyun-inc.com", "dispute.1688.com", "ditu.amap.com", "ditu.gaode.com", "dljjy.maitix.com", "dnss.cainiao.com", "domain.aliyun.com", "e.tb.cn", "ecrm.taobao.com", "edu.aliyun.com", "error.alibaba.com", "everyhelp.taobao.com", "ff.edongwang.com", "fila.tmall.com", "fn-tanx-src.1688.com", "french.alibaba.com", "fwzl-ticketsfront.sto.cn", "g-acs.m.goofish.com", "gaode.com", "german.alibaba.com", "gongxiao.tmall.com", "guanjia.1688.com", "h5.ele.me", "hao.360.com", "huaweistore.tmall.com", "hz-productposting.alibaba.com", "i.alibaba.com", "i.taobao.com", "inventorymanage.taobao.com", "inventorymanage.tmall.com", "item.taobao.com", "japanese.alibaba.com", "jscpa.maitix.com", "korean.alibaba.com", "ku.m.taobao.com", "l.facebook.com", "live.taobao.com", "login.alibaba.com", "login.mashangfangxin.com", "lshmy.tmall.com", "luban.taobao.com", "m.damai.cn", "m.facebook.com", "m.sm.cn", "m.sogou.com", "m.wandoujia.com", "mail-passport.aliyun.com", "maizuo.maitix.com", "melody.shop.ele.me", "member.jiaoyimao.com", "member1.tmall.com", "message.alibaba.com", "meta.m.taobao.com", "mind.1688.com", "mini.shyhhema.com", "miniapp-metadata.taobao.com", "mo.m.taobao.com", "mobiledesign.1688.com", "mos.m.taobao.com", "mp.youku.com", "mtop.damai.cn", "my.lazada.co.th", "nextone-fbt.alibaba-inc.com", "nextoneqn.m.taobao.com", "nike.tmall.com", "ntp.msn.cn", "offer.1688.com", "offer.alibaba.com", "p4p.1688.com", "p4psearch.1688.com", "page.sm.cn", "paimai.taobao.com", "passport.1688.com", "passport.alibabacloud.com", "passport.alipan.com", "passport.aliyun.com", "passport.cainiao.com", "passport.goofish.com", "passport.taobao.com", "peiqi.p.hemajs.com", "pinpai.1688.com", "pm123.taobao.com", "portal-h5.hemayx.cn", "portuguese.alibaba.com", "ppxk.tmall.com", "purchase.1688.com", "qianji.alibaba-inc.com", "qinquan.taobao.com", "qn.taobao.com", "qr.1688.com", "quark.sm.cn", "quick.taobao.com", "re.1688.com", "reg.taobao.com", "rfqposting.alibaba.com", "rights.taobao.com", "rongzi.1688.com", "rsc-api.ele.me", "rulechannel.alibaba.com", "russian.alibaba.com", "s.1688.com", "s.lazada.co.th", "s.lazada.com.ph", "s.taobao.com", "sale.1688.com", "sale.alibaba.com", "sale.taobao.com", "scan.quark.cn", "scp.tmall.com", "scportal.taobao.com", "sf.taobao.com", "shell.mkt.taobao.com", "shop239494884.taobao.com", "shop465965982.taobao.com", "show.1688.com", "show.re.taobao.com", "signin.aliyun.com", "sijipiao.fliggy.com", "site.sto.cn", "sjipiao.fliggy.com", "so.m.sm.cn", "spanish.alibaba.com", "superseckill.sale.tmall.com", "sycm.taobao.com", "t.taopiaopiao.com", "taobao.service.xixikf.cn", "taocaicai.m.taobao.com", "taolive.taobao.com", "tbzb.taobao.com", "tdi.tmall.com", "tmc.1688.com", "tongyi-passport.aliyun.com", "trade-acs.m.taobao.com", "trade.1688.com", "tu.taobao.com", "tui.taobao.com", "turkish.alibaba.com", "txd.m.taobao.com", "uf.alibaba.com", "ufuwu.1688.com", "ulifep.taobao.com", "unidesk.taobao.com", "uniqlo.tmall.com", "vt.quark.cn", "waimai-guide.ele.me", "waybill.wuliu.taobao.com", "wbh5.p.hemajs.com", "webview", "wia.amap.com", "widget.1688.com", "wm.m.sm.cn", "work.1688.com", "work.alibaba-inc.com", "world.taobao.com", "wp.m.1688.com", "wuliu.1688.com", "www.360.com", "www.91taohuo.com", "www.aliprice.com", "www.amap.com", "www.b2bcaigou.com", "www.daraz.com.bd", "www.daraz.com.np", "www.daraz.lk", "www.daraz.pk", "www.dianxiaomi.com", "www.hhczy.com", "www.iconfont.cn", "www.kdocs.cn", "www.lazada.co.th", "www.so.com", "www.sogou.com", "www2.alibaba.com", "xiaoer.alibaba-inc.com", "xiaomi.tmall.com", "youku.com", "youtube.com", "yuanshimuyu.tmall.com", "yz.m.sm.cn", "z.cainiao.com", "zhaoshang.tmall.com", "h5.ele.me", "ppe-h5.ele.me", "tb.ele.me", "pre-tb.ele.me", "market.m.taobao.com", "pre-market.m.taobao.com", "woos.ele.me", "ppe-woos.ele.me", "air.tb.ele.me", "pre-air.tb.ele.me", "r.ele.me", "ppe-r.ele.me", "im.ele.me", "ppe-im.ele.me", "nr.ele.me", "ppe-nr.ele.me", "orderrefund-next.ele.me", "ppe-orderrefund-next.ele.me", "page.ele.me", "pre-page.ele.me", "alsc-sre-saas-eleme.faas.ele.me", "ppe-alsc-sre-saas-eleme.faas.ele.me", "pre-alsc-sre-saas-eleme.faas.ele.me", "links.ele.me", "ele-invoice-assistant.faas.ele.me", "pages.tmall.com", "ppe-pages.tmall.com", "password.ele.me", "ppe-password.ele.me", "nr-settlement-h5.ele.me", "security-center.ele.me", "ppe-security-center.ele.me", "web.ele.me", "pre-web.ele.me"];
    var x = location.href || "", v = location.host || "", _ = !1;
    x.indexOf("loadBaxiaNewFun") > -1 && (_ = !0);
    try {
        !function () {
            var a = location.host || "";
            try {
                0 > y.indexOf(a) && b("https://g.alicdn.com/secdev/sufei_data/3.9.14/index.js", null, null)
            } catch (o) {
                e("sufei load error:  " + o.message || o)
            }
        }(), _ && b("https://g.alicdn.com/AWSC/et/1.82.8/et_f.js", function () {
            e("msg: load et success 1.82.8", "loadEt", .01)
        }, null), _ || !window.AWSC && function () {
            var a = location.host || location.hostname, o = g[a];
            o && o.indexOf(location.pathname) > -1 || b("https://g.alicdn.com/AWSC/AWSC/awsc.js", function () {
                e("msg: load awsc success", "loadAwsc", .01)
            }, null)
        }(), function () {
            for (var a = ["detail.m.tmall.com/item.htm", "h5.m.taobao.com/awp/core/detail.htm", "pages-g.m.taobao.com/wow/z/app/detail-next/item/index", "m.intl.taobao.com/detail/detail.html"], o = location.href || "", c = !1, m = 0; a.length > m; m++) if (o.indexOf(a[m]) > -1) {
                c = !0;
                break
            }
            o.indexOf("_____tmd_____") > -1 && (c = !1), o.indexOf("20250603_loadFy") > -1 && (c = !0), c && b("https://g.alicdn.com/AWSC/fireyejs/1.231.61/fireyejs.js", function () {
                e("msg: loadFy success 1.231.61", "loadFy", .01);
                try {
                    window.__fyModule && window.__fyModule.UBInit({
                        AsynSwitch: !0,
                        SyncSwitch: !0,
                        interval: 600,
                        TraceInterval: 10,
                        TraceMax: 300,
                        validTime: 3600
                    }), e("msg: init fy success 1.231.61", "loadFy", .01)
                } catch (a) {
                    e("msg: init fy error 1.231.61", "loadFy", .01)
                }
            }, null)
        }(), function () {
            var a, o, m, t = (Math.random() + "").replace("0.", "");
            try {
                var i = document.cookie.match(/cna=([^;]+)/), n = location.href || "",
                    l = "https://fourier.taobao.com/rp?ext=51&data=jm_" + (i && i[1]) + "&random=" + t + "&href=" + encodeURIComponent(n) + "&protocol=" + location.protocol + "&callback=jsonpCallback";
                (function () {
                    for (var a = location.href || "", o = 0; c.length > o; o++) if (a.indexOf(c[o]) > -1) return !0;
                    return !1
                })() || document.cookie.indexOf("xlly") > -1 || (a = l, o = document.createElement("script"), m = document.getElementsByTagName("head")[0], o.type = "text/javascript", o.charset = "UTF-8", o.src = a, m.appendChild(o))
            } catch (r) {
                e(r.message + "random=" + t, 12, 1, "spl")
            }
        }();
        try {
            !function () {
                if (function (a) {
                    return {
                        "www.taobao.com": !0,
                        "www.tmall.com": !0,
                        "s.taobao.com": !0,
                        "detail.tmall.com": !0,
                        "item.taobao.com": !0,
                        "chaoshi.tmall.com": !0
                    }[a] || /^shop[a-zA-Z0-9-]*\.taobao\.com$/.test(a)
                }(window.location.host)) {
                    var a = window.etSign && window.etSign();
                    a || (a = n("tfstk"));
                    var o = n("cookie2"), c = n("unb"), m = n("sgcookie"), r = n("cna"), s = window.location.href;
                    s && s.length > 512 && (s = s.substring(0, 512));
                    try {
                        var b = +new Date, u = localStorage.getItem("web_behavior_time"),
                            d = localStorage.getItem("web_behavior_jsArr_conf");
                        if (u && +u >= b) {
                            if (!d) return;
                            return d && "string" == typeof d && (d = JSON.parse(d)), void (d && d.length && setTimeout(function () {
                                l(d[0])
                            }, 300))
                        }
                    } catch (h) {
                        e("function:web_behavior_sample local init error", 12, 1, "spl")
                    }
                    var p = {ver: 2};
                    a && (p.bx_et = a), o && (p.cookie2 = o), m && (p.sgcookie = m), c && (p.unb = c), r && (p.cna = r), s && (p.href = s), function (a) {
                        a = a || {};
                        var o = [];
                        for (var e in a.data) o.push(encodeURIComponent(e) + "=" + encodeURIComponent(a.data[e]));
                        o.push(("v=" + Math.random()).replace(".", ""));
                        var c = o.join("&"), m = new XMLHttpRequest;
                        m.onreadystatechange = function () {
                            if (4 === m.readyState) {
                                var o = m.status;
                                o >= 200 && 300 > o ? a.success && a.success(m.responseText, m.responseXML) : a.error && a.error(o)
                            }
                        }, m.withCredentials = !0, "GET" === a.type ? (m.open("GET", a.url + "?" + c, !0), m.send(null)) : "POST" === a.type && (m.open("POST", a.url, !0), m.setRequestHeader("Content-Type", "application/x-www-form-urlencoded"), m.send(c))
                    }({
                        url: i, type: "GET", dataType: "json", data: p, success: function (a) {
                            try {
                                if (a && "string" == typeof a && (a = JSON.parse(a)), a && a.succ) {
                                    var o = a.dt, c = o.cacheAge, m = o.jsList;
                                    c && t.localStorage && (c = +c, localStorage.setItem("web_behavior_time", +new Date + 1e3 * c), m && m instanceof Array && (localStorage.setItem("web_behavior_jsArr_conf", JSON.stringify(m)), l(m[0])))
                                }
                            } catch (h) {
                                e("function:web_behavior_sample request error", 12, 1, "spl")
                            }
                        }, error: function (a) {
                            e("function:web_behavior_sample request net error", 12, 1, "spl")
                        }
                    })
                }
            }()
        } catch (F) {
            e("behaviorSample init error" + F.message, 12, 1, "spl")
        }
        try {
            if (_) var k = setInterval(function () {
                var a = h("options");
                a && (clearInterval(k), f(a))
            }, 30), j = setTimeout(function () {
                clearTimeout(j), clearInterval(k)
            }, 5e3)
        } catch (F) {
            e("init fireye error" + F.message, 12, 1, "spl")
        }
        var z = !1;
        if (x.indexOf("loadbaxiajs") > -1 || document.cookie.indexOf("loadbaxiajs") > -1) {
            var O = null;
            if (x.indexOf("_set_bx_v_") > -1) {
                var S = x.match(/_set_bx_v_=([^&]+)/);
                O = encodeURIComponent(S && S[1])
            }
            A(1, O), z = !0
        }
        var q = [];
        q.push("crm.simba.taobao.com"), q.push("7.alibaba-inc.com"), q.push("chaoshi.service.xixikf.cn"), q.push("taobao.service.xixikf.cn"), q.push("tongyi.aliyun.com/chat");
        for (var C = 0; q.length > C; C++) u(x, q[C]) && (z = !0);
        if (!self.baxiaCommon && !z) {
            e("init", "aplus_js_load", .01);
            var T = [];
            T.push({path: ".", ratio: 1, jsv: "2.5.31"});
            for (C = 0; T.length > C; C++) u(x, T[C].path) && A(T[C].ratio, T[C].jsv)
        }
    } catch (F) {
        e("err" + F.message, "aplus_js_baxia_err", 1)
    }
    var I = !1;

    function A(a, o) {
        if (void 0 === o && (o = "2.5.31"), a >= Math.random() && !I) {
            _ && (o = "2.5.29"), I = !0, e("baxiajs", "aplus_js_load", .01);
            var c = "//g.alicdn.com", m = self.goldlog;
            if (m && m.getCdnPath && (c = m.getCdnPath()), v && v.indexOf("www.miravia.") > -1 && (c = "//g.mdvcdn.com"), x.indexOf("_set_bx_v_") > -1) {
                var t = x.match(/_set_bx_v_=([^&]+)/);
                o = encodeURIComponent(t && t[1])
            }
            e("/sd/baxia/" + o + "/baxiaCommon.js", 13, .01), c = c + "/sd/baxia/" + o + "/baxiaCommon.js", x.indexOf("_set_bx_v_=debug") > -1 && (c = "http://localhost:8064/build/baxiaCommon.js"), b(c, null, null)
        }
    }
}();
