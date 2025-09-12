
import execjs

# 读取 JavaScript 文件
with open(r'/Users/个人/电商/1688-Crawler/app/app/isg.js', 'r', encoding='utf-8') as f:
    js_code = f.read()

# 创建 JavaScript 执行环境
ctx = execjs.compile(js_code)

# 获取 Cookie 值
# 根据代码分析，Cookie 名称可能是 'cna' 或其他
try:
    # 方法1：直接调用 JavaScript 函数获取 Cookie
    # cookie_value = ctx.eval('document.cookie')
    print("所有 Cookie:", ctx)

    # 方法2：尝试获取特定 Cookie（如 'cna'）
    # # 从代码中可以看到有 new x('cna') 的操作
    # cna_cookie = ctx.eval('new x("cna").r()')
    # print("cna Cookie:", cna_cookie)

except Exception as e:
    print("执行出错:", e)

