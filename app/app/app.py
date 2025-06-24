import hashlib
import json
import random
import re
import time
from typing import Dict, Any, Optional
from urllib.parse import quote, unquote
from urllib.parse import quote_from_bytes, unquote_to_bytes
import execjs
import httpx
import requests
from loguru import logger
import asyncio

"""
使用说明：
1.1688加密的接口几乎都是用的sign参数配合cookie进行鉴权
2.sign参数生成需要4个参数，分别是_m_h5_tk、毫秒时间戳、app_key、请求参数data数据
3.请求时带上生成的sign值和用来生成sign的时间戳即可
4.有部分接口没有用sign进行鉴权，使用的是_tb_token_参数，这个值可以通过接口获取并且在初始化的cookie中
"""

APP_KEY = '12574478'
with open("/Users/个人/电商/1688-Crawler/app/app/header_list.json") as f:
    HEADER_LIST = json.load(f)
HEADERS = {
    'cookie': '',
    **random.choice(HEADER_LIST)
}
P_m_h5_tk = "1a86ed481734e07e7e095c4989b5159e_1749978332173"
P_m_h5_tk_enc = "f6da745930893bd3531d861a3eb52021"


def get_milliseconds_timestamp() -> int:
    return int(time.time() * 1000)


def md5_string(input_string):
    byte_data = input_string.encode('utf-8')
    md5_hash = hashlib.md5()
    md5_hash.update(byte_data)
    return md5_hash.hexdigest()


def jsonp_to_json(jsonp_data: str) -> Dict[str, Any] | None:
    try:
        match = re.match(r'.*?({.*}).*?', jsonp_data, re.S)
        if match:
            json_str = match.group(1)
            return json.loads(json_str)
        else:
            raise ValueError('Invalid JSONP format')
    except (json.JSONDecodeError, re.error):
        raise ValueError('Invalid Input')


def cookies_str_to_dict(cookies_str: str) -> Dict[str, str]:
    cookies_dict = {}
    if cookies_str:
        cookies_list = cookies_str.split('; ')
        for cookie in cookies_list:
            key, value = cookie.split('=', 1)
            cookies_dict[key] = value
    return cookies_dict


def dict_to_cookies_str(cookies_dict: Dict[str, str]) -> str:
    cookie_str = '; '.join([f"{key}={value}" for key, value in cookies_dict.items()])
    return cookie_str


def update_cookie(cookie_list) -> Dict[str, str]:
    cookies_dict = cookies_str_to_dict(HEADERS.get('cookie', {}))
    for cookie in cookie_list:
        cookies_dict[cookie['name']] = cookie['value']

    # 更新headers中的cookie
    new_cookie = dict_to_cookies_str(cookies_dict)
    HEADERS['cookie'] = new_cookie
    print(HEADERS)
    return HEADERS


def get_sign_params(_m_h5_tk: str, data: str) -> Dict[str, Any]:
    """
    生成API请求所需的签名参数。

    参数:
    _m_h5_tk (str): 存在cookie中，也可通过请求接口生成。
    data (str): 请求数据中的data参数值。
    """
    current_timestamp = get_milliseconds_timestamp()
    pre_sign_str = f'{_m_h5_tk.split("_")[0]}&{current_timestamp}&{APP_KEY}&' + data
    sign_js_path = 'sign.js'
    sign = execjs.compile(open(sign_js_path).read()).call('sign', pre_sign_str)
    # sign = md5_string(pre_sign_str)
    return {"sign": sign, "t": current_timestamp}


async def get_tb_token() -> None:
    params = {
        'group': 'tao',
        'target': 'https://work.1688.com/home/unReadMsgCount.htm?tbpm=1&callback=jQuery0',
    }
    async with httpx.AsyncClient() as client:
        timeout = httpx.Timeout(60.0, connect=60.0)
        response = await client.get('https://login.taobao.com/jump', params=params, headers=HEADERS,
                                    timeout=timeout, follow_redirects=False)
        cookies = response.cookies
        cookies_list = [{"name": k, "value": v} for k, v in cookies.items()]
        update_cookie(cookies_list)


async def get_cna() -> None:
    async with httpx.AsyncClient() as client:
        timeout = httpx.Timeout(60.0, connect=60.0)
        timestamp = str(int(time.time() * 1000))
        response = await client.get(f"https://log.mmstat.com/eg.js?t={timestamp}", headers=HEADERS, timeout=timeout)
        cookies = response.cookies
        cookies_list = [{"name": k, "value": v} for k, v in cookies.items()]
        update_cookie(cookies_list)


def api_request(
    req_type: str,
    api: str,
    params: Optional[Dict[str, Any]] = None,
    headers=None,
    data: Optional[str] = None,
    req_body: Optional[Dict[str, Any]] = None,
    _m_h5_tk: Optional[str] = 'undefined',
) -> Dict[str, Any] | str | None:
    """
    用于发送API请求并获取响应数据
    参数:
    api (str): 请求的API地址。
    params (Dict[str, Any]): 请求参数字典，注意请求参数中的t需要严格和用来签名获取sign的时间戳一致，否则鉴权失败。
    data (str): 用于生成签名的数据。
    _m_h5_tk (Optional[str]): 用于签名的参数值，来自响应cookie，如果未提供则默认为'undefined'。
    """
    if headers is None:
        headers = HEADERS
    sign_dict = get_sign_params(_m_h5_tk, data)
    params['t'] = sign_dict['t']
    params['sign'] = sign_dict['sign']
    if req_type == 'POST':
        req_body['data'] = data
        response = requests.post(api, headers=headers, data=req_body, params=params)
    else:
        response = requests.get(api, headers=headers, params=params)
    content = response.text
    if content.startswith('{'):
        res_json = response.json()
    else:
        res_json = jsonp_to_json(content)
    return res_json


async def fetch_company_data(store_id: str) -> Dict[str, Any] | None:
    """
    获取1688店铺企业信息。

    参数:
    data (str): 请求所需的数据，通常为JSON格式的字符串。

    返回:
    Dict[str, Any] | None: 解析后的JSON数据，如果请求失败则为None。
    """

    # 请求参数中data对应的数据
    data = json.dumps({
        "fcGroup": "cbu-seller-fc",
        "fcName": "factory-card-common-fn",
        "serviceName": "factoryCoreInfoService",
        "params": {
            "memberId": store_id,
            "extendParam": {
                "query": "",
                "trafficSource": "factory_card@detail_pc"
            }
        }
    })
    params = {
        'jsv': '2.6.1',
        'appKey': APP_KEY,
        't': '',
        'sign': '',
        'api': 'mtop.mbox.fc.common.gateway',
        'v': '2.0',
        'type': 'jsonp',
        'valueType': 'string',
        'dataType': 'jsonp',
        'timeout': '10000',
        'isSec': '0',
        'jsonpIncPrefix': 'mboxfc',
        'callback': 'mtopjsonpmboxfc1',
        'data': quote(data)
    }

    # API请求地址
    api = 'https://h5api.m.1688.com/h5/mtop.mbox.fc.common.gateway/2.0/'

    # 首次请求，获取_m_h5_tk
    _m_h5_tk = api_request('GET', api, params, data)

    # 使用获取到的_m_h5_tk发送实际的数据请求
    response_data = api_request('GET', api, params, data, _m_h5_tk=_m_h5_tk)
    logger.info(f"返回数据:{response_data}")
    return response_data


async def fetch_keywords(keywords: str):
    # API请求地址
    url = "https://h5api.m.1688.com/h5/mtop.relationrecommend.wirelessrecommend.recommend/2.0/"
    data = json.dumps({
        "appId": 32517,
        "params": json.dumps({
            "verticalProductFlag": "pcmarket",
            "searchScene": "pcOfferSearch",
            "charset": "GBK",
            "beginPage": 1,
            "pageSize": 60,
            "keywords": quote_from_bytes(keywords.encode('GBK')),
            "spm": "a26352.13672862.searchbox.0",
            "method": "getOfferList"
        })
    })
    params = {
        'jsv': "2.7.4",
        'appKey': APP_KEY,
        't': '',
        'sign': '',
        'api': 'mtop.relationrecommend.WirelessRecommend.recommend',
        'ignoreLogin': "true",
        "prefix": "h5api",
        'v': '2.0',
        'type': 'jsonp',
        'dataType': 'jsonp',
        'timeout': '20000',
        'jsonpIncPrefix': 'fetchTpp_32517_getOfferList',
        'callback': 'mtopjsonpfetchTpp_32517_getOfferList3',
        'data': quote(data)
    }

    # 首次请求，获取_m_h5_tk
    _m_h5_tk = P_m_h5_tk
    # 使用获取到的_m_h5_tk发送实际的数据请求
    response_data = api_request('GET', url, params, data, _m_h5_tk=_m_h5_tk)
    logger.info(f"返回数据:{response_data}")
    return response_data


def get_product_list():
    # API请求地址
    cookie_json = {
        "cookie2": "1d2c4f04eb2278c58a73c37475d3e28a",
        "cna": "bi8zH7MGrnICAXjyE4zcfbSI",
    }
    url = "https://zesugc.1688.com/page/index.htm?spm=a2615.7691456.wp_pc_common_topnav.0"
    cookie_header = "; ".join([f"{key}={value}" for key, value in cookie_json.items() if isinstance(value, str)])
    res = requests.get(url, headers={"Cookie": cookie_header})
    return res.text


async def init() -> None:
    # 初始化cookies参数值
    await get_cna()
    await get_tb_token()


if __name__ == '__main__':
    # 示例：请求1688店铺企业信息接口获取店铺信息
    # member_id = 'b2b-2369055617'  # 店铺ID
    # asyncio.run(init())
    # asyncio.run(fetch_company_data(member_id))
    print(get_product_list())
