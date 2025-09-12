/*  生成并返回 isg cookie 值的最小实现  */
function generateIsg() {
    // 1. 工具函数
    const now = () => Date.now();
    const rand32 = () => Math.floor(Math.random() * 0xFFFFFFFF);
    const crc8 = (arr) => {
        let c = 0;
        for (let i = 0; i < arr.length; i++) c = (c << 5) - c + arr[i];
        return c & 0xFF;
    };

    // 2. base64url 编码
    const base64url = (bytes) => {
        const map = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
        let out = '', i = 0, len = bytes.length;
        while (i < len) {
            let a = bytes[i++], b = i < len ? bytes[i++] : 0, c = i < len ? bytes[i++] : 0;
            let n = (a << 16) | (b << 8) | c;
            out += map[n >> 18] + map[(n >> 12) & 63] + map[(n >> 6) & 63] + map[n & 63];
        }
        while (out[out.length - 1] === '=') out = out.slice(0, -1);
        return out;
    };

    // 3. 构造 16 字节 token
    function buildToken(oldBytes) {
        let b = oldBytes || new Uint8Array(16);
        b[0] = (now() / 1000 >>> 0) & 0xFF;
        b[1] = (now() / 1000 >>> 8) & 0xFF;
        b[2] = (now() / 1000 >>> 16) & 0xFF;
        b[3] = (now() / 1000 >>> 24) & 0xFF;
        b[4] = rand32() & 0xFF;
        b[5] = (rand32() >>> 8) & 0xFF;
        b[6] = (rand32() >>> 16) & 0xFF;
        b[7] = (rand32() >>> 24) & 0xFF;
        b[8] = crc8(navigator.userAgent.split('').map(c => c.charCodeAt(0))) & 0xFF;
        b[9] = navigator.userAgent.length & 0xFF;
        b[10] = (navigator.userAgent.length >>> 8) & 0xFF;
        b[11] = 0;
        b[12] = 0;
        b[13] = 0;
        b[14] = 0;
        b[15] = crc8(b.slice(0, 15));
        return b;
    }

    // 4. 主流程：生成并写 cookie，返回 token
    function writeIsgCookie() {
        const oldCookie = document.cookie.split('; ').find(r => r.startsWith('isg='));
        let oldBytes = null;
        if (oldCookie) {
            const str = oldCookie.split('=')[1];
            const raw = atob(str.replace(/-/g, '+').replace(/_/g, '/'));
            if (raw.length === 16) {
                oldBytes = new Uint8Array(raw.length);
                for (let i = 0; i < raw.length; i++) oldBytes[i] = raw.charCodeAt(i);
            }
        }
        // const expires = new Date(Date.now() + 86400 * 1000 * 365).toUTCString();
        // document.cookie = `isg=${token}; expires=${expires}; path=/; SameSite=None; Secure`;
        return base64url(buildToken(oldBytes));
    }

    // 5. 立即执行一次并绑定 pagehide
    // 返回 token
    return writeIsgCookie();
}

output.isg = generateIsg();

