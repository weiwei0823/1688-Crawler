import execjs


def get_isg():
    isg_value = ""
    # 读取 JavaScript 文件
    with open(r'/Users/个人/电商/1688-Crawler/app/app/isg/run_isg.js', 'r', encoding='utf-8') as f:
        js_code = f.read()

    # 创建 JavaScript 执行环境
    ctx = execjs.compile(js_code)

    # 获取 Cookie 值
    # 根据代码分析，Cookie 名称可能是 'cna' 或其他
    try:
        # 方法1：直接调用 JavaScript 函数获取 Cookie
        isg_value = ctx.eval('getIsg("sufei_data")')
    except Exception as e:
        print("执行出错:", e)
    return isg_value


if __name__ == '__main__':
    res = get_isg()
    print(res)
