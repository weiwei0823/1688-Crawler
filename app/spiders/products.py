"""
抓取1688产品列表数据
"""
import json
import random
import re
import time
from urllib.parse import urlencode

import execjs
import requests
from lxml import html
from typing import Dict, Any, Optional
from app.app.app import api_request
from app.app.get_isg import get_isg
from app.spiders.spider import get_html
import urllib
from urllib.parse import urlparse

with open("/Users/个人/电商/1688-Crawler/app/app/header_list.json") as f:
    HEADER_LIST = json.load(f)
cookie_json = {
    "cookie2": "1d2c4f04eb2278c58a73c37475d3e28a",
    "cna": "bi8zH7MGrnICAXjyE4zcfbSI",
}
cookie_json2 = {
    "taklid": "148b26b393df4548bc8ac69344b41e00",
    "tfstk": "gq2sY3Y8lree5vMvcfjed096ZwH4GMWrXniYqopwDAHtknaLDhEZM5kpJcmDWE3v62FI008vkoQgl-gLDG4NjAUXGzaS0xPZ7mFQSuhalojiDqUYlqPNYTrgjxDAz-6PUlDszcL0CxL4vAmqnhvAfTrgjHK6kgPdUnTeGdGtkrhTvXnrJIpv6rHpJm3pBmptDeII-2ntXd3xp2nrXcpYkxIQv2mtHqUx6MZpER9sYGg3fGPP0OfPDsRqJKpYdcGKTl3TflIqffa_X2i3JJ6t14EtRK_s_H-sJ0wdoFu0dkeTMzQe_VFScuPbPTpmx5U_pjwFmTqIC0wiQW76e4F7X7obngdjloEuE7Sr9LuWl9AXAbvxACjCAIA0Qqln9jn4B3ltxD7VAMOzmfnnADjCAIXE6DmUdMsBa8C..",
    "lid": "june0810",
    "ali_apache_track": "c_mid=b2b-4…557242665",
    "xlly_s": "1",
    "cookie1": "AnJ%2FiNIXk84XzL2WP%2BWw9phHd6yTswcxwOtWv0ZbgXE%3D",
    "cookie17": "Vyu4b0k2TK0%3D",
    "sg": "084",
    "csg": "21ba142c",
    "unb": "47684608",
    "_nk_": "june0810",
    "__cn_logon_id__": "june0810",
    "last_mid": "b2b-47684608",
    "__last_loginid__": "b2b-47684608",
    "__last_memberid__": "b2b-47684608",
    "_m_h5_tk": "44f80ac6003bdcffd4e7c3cbf76f66f1_1750590463880",
    "_m_h5_tk_enc": "d657f5f1e2afcbb46069413d2629f606",
    "_user_vitals_session_data_": "{\"user_line_track\":true,\"ul_session_id\":\"jd4xfy9hvvg\",\"last_page_id\":\"shop9i2i178378493.1688.com%2Fzg0pqg88lf\"}"
}
_M_H5_TK = "88a9db50e0325f9b8139edfd7041c7a6_1750772499089"
HEADERS = {
    'Cookie': "; ".join([f"{key}={value}" for key, value in cookie_json.items() if isinstance(value, str)]),
    **random.choice(HEADER_LIST)
}
APP_KEY = '12574478'


def get_milliseconds_timestamp() -> int:
    return int(time.time() * 1000)


def clean_header_value(value):
    return value.encode('latin-1', errors='ignore').decode('latin-1')


def get_sign_params(_m_h5_tk: str, data: str, t: int = 0) -> Dict[str, Any]:
    """
    生成API请求所需的签名参数。

    参数:
    _m_h5_tk (str): 存在cookie中，也可通过请求接口生成。
    data (str): 请求数据中的data参数值。
    """
    if _m_h5_tk == "":
        _m_h5_tk = _M_H5_TK
    if t == 0:
        t = get_milliseconds_timestamp()
    pre_sign_str = f'{_m_h5_tk.split("_")[0]}&{t}&{APP_KEY}&' + data
    sign_js_path = "/Users/个人/电商/1688-Crawler/app/app/sign.js"
    sign = execjs.compile(open(sign_js_path).read()).call('sign', pre_sign_str)
    return {
        "sign": sign,
        "t": t
    }


class Products:
    # 分页数据
    def __extract_pagination(self, tree):
        pagination_html = tree.xpath('//div[contains(@class, "wp-paging-unit")]')
        if len(pagination_html) > 0:
            pagination_html = pagination_html[0]
        else:
            return {
                'total': len(self.__extract_product_info(tree)),
                'current_page': 1,
                'last_page': 1,
                'per_page': 20,
                'data': []
            }
        if 'new-pagination' in pagination_html.get('class'):
            current_page = int(pagination_html.xpath('.//li[@class="pagination"]/a[@class="current"]/text()')[0])
            last_page = int(pagination_html.xpath('.//em[@class="page-count"]/text()')[0])
            per_page = 16
            total = 16 * last_page
            return {
                'total': total,
                'current_page': current_page,
                'last_page': last_page,
                'per_page': per_page,
                'notice': '此分页产品总数total不一定准确',
                'data': []
            }
        else:
            total = int(pagination_html.xpath('.//em[@class="offer-count"]/text()')[0])
            current_page = int(pagination_html.xpath('.//li[@class="pagination"]/a[@class="current"]/text()')[0])
            last_page = int(pagination_html.xpath('.//em[@class="page-count"]/text()')[0])
        per_page = 20
        return {
            'total': total,
            'current_page': current_page,
            'last_page': last_page,
            'per_page': per_page,
            'data': []
        }

    # 产品数据
    def __extract_product_info(self, tree):
        product_items = tree.xpath('//div[contains(@data-spm, "offerlist")]/*')
        products = []
        for product_item in product_items:
            price_element = product_item.xpath('.//div[contains(@class, "price")]//em/text()')
            if price_element and '价格' not in price_element[0]:
                base_element = product_item.xpath('.//a[@class="title-link"]')[0]
                url = base_element.get('href')
                products.append({
                    'id': int(re.findall('offer/(\d+)', url)[0]),
                    'title': base_element.get('title'),
                    'price': float(price_element[0]),
                    'url': url
                })

        return products

    def __extract_shop_info(self, tree):
        shop_url_element = tree.xpath('//div[contains(@class, "base-info")]//a')[0]
        shop_url = shop_url_element.get('href')
        id = re.findall('https?://(.+)\.1688', shop_url)[0]
        title_element = shop_url_element.xpath('//div[@class="company-name"]')[0]
        title = title_element.get('title')

        # 联系人
        contactor = ''
        contactor_element = tree.xpath('//a[@class="membername"]/text()')
        if len(contactor_element) > 0:
            contactor = contactor_element[0].strip()

        # 电话
        telephone = ''
        telephone_element = tree.xpath('//dl/dt[starts-with(text(), "电")]/following-sibling::dd/text()')
        if len(telephone_element) > 0:
            telephone = telephone_element[0].strip()

        # 移动电话
        mobile = ''
        mobile_element = tree.xpath('//dl/dt[contains(text(), "移动电话")]/following-sibling::dd/text()')
        if len(mobile_element) > 0:
            mobile = mobile_element[0].strip()

        # 地址
        address = self.__extract_shop_address(tree)

        return {
            'id': id,
            'title': title,
            'contactor': contactor,
            'telephone': telephone,
            'mobile': mobile,
            'address': address
        }

    def __extract_shop_address(self, tree):
        address_array = tree.xpath('//span[@class="address_title"]/text()')
        if len(address_array) == 0:
            return {
                'country': '',
                'state': '',
                'city': '',
                'detail': '',
            }
        address_tuple = re.findall('地址：\s+(.+)\s+(.+)\s+(.+)\s+(.+)\S', address_array[0])[0]
        address = {
            'city': address_tuple[2],
            'detail': address_tuple[3]
        }
        if address_tuple[0] == ' ':
            address.update({
                'country': address_tuple[1],
                'state': address_tuple[2],
            })
        else:
            address.update({
                'country': address_tuple[0],
                'state': address_tuple[1],
            })
        return address

    def get_product_info(self, url):
        content = get_html(url, HEADERS)
        memberId = ""
        # 定义匹配memberId的正则表达式模式
        memberId_pattern = r'memberId=([^&\'"]+)'

        # 在字符串中搜索匹配项
        memberId_match = re.search(memberId_pattern, content)

        # 如果找到匹配项，返回第一个捕获组（memberId值）
        if memberId_match:
            memberId = memberId_match.group(1)
        product_list_data = f'{{"componentKey":"Wp_pc_common_offerlist","params":"{{\\"memberId\\":\\"{memberId}\\",\\"appdata\\":{{\\"sortType\\":\\"wangpu_score\\",\\"sellerRecommendFilter\\":false,\\"mixFilter\\":false,\\"tradenumFilter\\":false,\\"quantityBegin\\":null,\\"pageNum\\":1,\\"count\\":30}}}}"}}'
        sign_obj = get_sign_params("", product_list_data)
        sign = get_sign_params("", product_list_data, 1750586058757)
        print(sign)
        product_list_param = {
            'jsv': "2.7.0",
            'appKey': APP_KEY,
            't': sign_obj.get("t", ""),
            'sign': sign_obj.get("sign", ""),
            'api': 'mtop.alibaba.alisite.cbu.server.ModuleAsyncService',
            'v': '1.0',
            'type': 'json',
            'valueType': 'string',
            'dataType': 'jsonp',
            'timeout': '10000'
        }
        product_list_base_url = "https://h5api.m.1688.com/h5/mtop.alibaba.alisite.cbu.server.moduleasyncservice/1.0/"
        product_list_url = f"{product_list_base_url}?{urllib.parse.quote(urlencode(product_list_param))}"
        print(product_list_url)
        temp_headers = {
            'Cookie': clean_header_value(
                "; ".join([f"{key}={value}" for key, value in cookie_json2.items() if isinstance(value, str)])),
            **random.choice(HEADER_LIST)
        }
        parsed_url = urlparse(url)
        # 构建基础URL (scheme + netloc)
        origin = f"{parsed_url.scheme}://{parsed_url.netloc}"
        cookie_ict = {
            "cbu_mmid": "7E3C55520E991B9B8B42B526CEBFC53FB6E7C0E60C95213F59D482B4CCE147DB09F848C1F03189F222CD52D098667A9903418ACEDC5B1C734E940C8A17EF9E54",
            "cna": "9XfiIM0kuU4BASQOA2Aug0iy",
            "isg": get_isg(),
            "tfstk": "gV7sXwaEsADsCeTxGhVEReIHJBTVCWzPBjOAZs3ZMFLtv6dD6xHxksLKvCA9DN8N_91A3TjwBFPmcq1fp1uw3shXM989mGJ2QKTfiTs_UzzPs1YDX8yzzsFoOcL96ALv6SppZQVe6U7Gp7TDk8yEYqKgPEXTmOwRH6FB_CM9kCLxvWO2gVLvBnHKvQppkEK9M2pp_IntXKdYO6pHMEpAHEFBJpAvu7hWGl9G15WHh6Lon919dq3AWEx6hdoqlqTJ6hiG6psfcwO6fL-Ai4b5W95A7Nx3SV8cTg6fD9UI5t6G6ZKCuJldwFv62dbTgcvO7M_B7Nemq65BB3TFYk2w0F61qLxTxJXJV_SySaeIyKsOItxlu80MBsClrg87l2L6DgWZzL17ImGBqqdIjWNImmY9ZeblUX27AhdH1HPQOAImEq3qYZPIDcx9tCTzOWMOn",
            "xlly_s": "1",
            "__cn_logon__": "false",
            "taklid": "8471e9b2c1264348944618a739d884d1",
            "union": '{"amug_biz":"comad","amug_fl_src":"sem_baidu","creative_url":"https%3A%2F%2Fwww.1688.com%2Fzw%2Fhamlet.html%3Fscene%3D6%26cosite%3Dbaidujj_pz%26location%3Dre%26trackid%3D885662561117990122602%26","creative_time":1750929542524}',
            "ta_info": "810F8857EAA0364D6A55EA8951423B3990E054CD6431AA194F1B83B9E7936069199406F1EBC0FC88229D45EBB177D63F14A5CAB8BECF89771490FA03749186CB152A760AA86ACF60603F70A677F9F1815C41F50086C524BE947FD70979E0DE632A19A34DC27F1AE34597474615EEC31F8A0CFB78BA1469E5316E07CFCB72C1532E6B527467FD0BB74511D4DA7DCDC699A45B81D147428BA14EA682FF0CED73EF3E07A6463BD2F4ED",
            "_m_h5_tk": "09f744fde853933ae05fa370dbc47e0e_1752121589006",
            "_m_h5_tk_enc": "d50e3fbb40b2d7cd974d7e37db678444",
            "cookie2": "157ea9ba1027c8df6d53adc7a93980a2",
            "t": "c1b2151c8d6f8cc637e534ce41bbd4ad",
            "_tb_token_": "3038b763dbe4e",
            "_csrf_token": "1752040121509",
            "leftMenuModeTip": "shown",
            "_user_vitals_session_data_": '{"user_line_track":true,"ul_session_id":"eaz7sse29j4","last_page_id":"ziqier1030718789.1688.com%2F99u6f2hv7a7"}'
        }
        req_header = {
            "Host": "h5api.m.1688.com",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:139.0) Gecko/20100101 Firefox/139.0",
            "Accept": "application/json",
            "Accept-Language": "zh-CN,zh;q=0.8,zh-TW;q=0.7,zh-HK;q=0.5,en-US;q=0.3,en;q=0.2",
            "Accept-Encoding": "gzip, deflate, br, zstd",
            "Content-type": "application/x-www-form-urlencoded",
            "Content-Length": "421",
            "Origin": origin,
            "Connection": "keep-alive",
            "Referer": origin,
            "Cookie": "; ".join([f"{key}={value}" for key, value in cookie_ict.items() if isinstance(value, str)]),
            "TE": "trailers",
            **random.choice(HEADER_LIST)
        }
        print(temp_headers)
        product_list_content = requests.post(product_list_url, data=product_list_data,
                                             headers=req_header)
        print(product_list_content.text)


if __name__ == '__main__':
    """
    '"memberId": "b2b-22014039174159cbd8",'
    "data=%7B%22componentKey%22%3A%22Wp_pc_common_offerlist%22%2C%22params%22%3A%22%7B%5C%22memberId%5C%22%3A%5C%22b2b-22014039174159cbd8%5C%22%2C%5C%22appdata%5C%22%3A%7B%5C%22sortType%5C%22%3A%5C%22wangpu_score%5C%22%2C%5C%22sellerRecommendFilter%5C%22%3Afalse%2C%5C%22mixFilter%5C%22%3Afalse%2C%5C%22tradenumFilter%5C%22%3Afalse%2C%5C%22quantityBegin%5C%22%3Anull%2C%5C%22pageNum%5C%22%3A1%2C%5C%22count%5C%22%3A30%7D%7D%22%7D"
    "https://h5api.m.1688.com/h5/mtop.alibaba.alisite.cbu.server.moduleasyncservice/1.0/?jsv=2.7.0&appKey=12574478&t=1750509771737&sign=441d66ec18a1c9955a1ab57c141d5a6b&api=mtop.alibaba.alisite.cbu.server.ModuleAsyncService&v=1.0&type=json&valueType=string&dataType=jsonp&timeout=10000"
    """
    product = Products()
    product.get_product_info(
        "https://ziqier1030718789.1688.com/page/creditdetail.htm?spm=a261y.7663282.shopNavigation.1.113571a5XwLNC6")
    # sign = get_sign_params(
    #     "0f730fa6a97cdc721c1905ea768db579_1750566243635",
    #     '{"componentKey":"Wp_pc_common_offerlist","params":"{\\"memberId\\":\\"b2b-22014039174159cbd8\\",\\"appdata\\":{\\"sortType\\":\\"wangpu_score\\",\\"sellerRecommendFilter\\":false,\\"mixFilter\\":false,\\"tradenumFilter\\":false,\\"quantityBegin\\":null,\\"pageNum\\":1,\\"count\\":30}}"}',
    #     1750557734376
    # )
