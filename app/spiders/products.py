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
from app.spiders.spider import get_html
import urllib

with open(r"D:\开发代码\1688-Crawler\app\app\header_list.json") as f:
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
    sign_js_path = r'D:\开发代码\1688-Crawler\app\app\sign.js'
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

    def go(self, url):
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
        temp_headers2 = {
            "Host": "h5api.m.1688.com",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/116.0",
            "Accept": "application/json",
            "Accept-Language": "zh-CN,zh;q=0.8,zh-TW;q=0.7,zh-HK;q=0.5,en-US;q=0.3,en;q=0.2",
            "Accept-Encoding": "gzip, deflate, br",
            "Content-type": "application/x-www-form-urlencoded",
            "Content-Length": "421",
            "Origin": "https://shop5034f5f173m45.1688.com",
            "Connection": "keep-alive",
            "Referer": "https://shop5034f5f173m45.1688.com/",
            "Cookie": "cbu_mmid=7E3C55520E991B9B66A2ADA035045F9B7E7D133715B5C316DBB7DC21C5138C2A09F848C1F03189F222CD52D098667A991427C9AEF3E2395A1C5A8B9F38227BD5; ta_info=AFD8AC7EC60385DDF892BF50F5A485070F0E32C74BC576CA2C07BEDE66C882320929319BD16C3BD3E3A5B0429ECDB8228372814B677667621427C9AEF3E2395A41883B66E38082263AEDEA75593C1708B35AE744130682C9A298DB3B1D55A5B0B32C31388099E1D133B752B90CCD8BD49DA76459D73E00E7FA317F1E18287F750FFD96611F37DC01; _m_h5_tk=88a9db50e0325f9b8139edfd7041c7a6_1750772499089; _m_h5_tk_enc=01518139374262a2f4098e60c3bee866; cna=S3DhIOMqjwUBASQOA2BeCoUG; isg=BFpa_FEw5g8J1GqjFg--2ri4qAB8i95lCKigCmTTcO241_sRTB00dZsspyPLHFb9; tfstk=gpri0DDkaPu_yOfKJki1zs2UEY78fcijESKxMmhV8XlBXSntDHyE3Yzv7tgwTXPKUFuq7xJeLXVj6VnZDmA0wXGTkt6sutVThn34DjEDCkVkDhC15--m2m5RwgI8CRnj0_FQ9AReCxHkuxRx7pREDx4obId4CRiXd_CR2ge6nPjiYmo4gM8EFX8wQFPqY2kjThk2bxRFKXGEQxuwbBRE3YAq3SoVKJlI3ml4gVW3LFQp0bq4Ak5dQMvA58n4xA0iaJ0W03D62VlrjX-qdkDGbbyZtn-xZS_OOJ2Os3wKfPPoe5Iej72azSzzdsxo_ze7eo0B3nuL85Zn-yIytvaUBrr_sKxqClE-obgh3ngxYu3zo5CB0fUuLW08vBK-Y8znxglv8UrxEnMFHkYXJVkIKbduD3YPcKjek9XHPNgZdAC8D9Y25Qt2DeBhKU9j7vMOe; xlly_s=1; cookie2=16b1ad8e4825d89afacaf4a08582eb43; t=ee86223d1517a19866dfcc0b47922006; _tb_token_=ef67e57b1594e; __cn_logon__=true; taklid=c3e60c82f6c94b75942c94ed2d7aa6ac; _csrf_token=1750762375107; leftMenuModeTip=shown; 3pc_partitioned=true; dnk=tb407764704159; uc1=existShop=false&cookie16=V32FPkk%2FxXMk5UvIbNtImtMfJQ%3D%3D&cookie15=UtASsssmOIJ0bQ%3D%3D&pas=0&cookie21=W5iHLLyFe3xm&cookie14=UoYby3NcyBjWbw%3D%3D; tracknick=tb407764704159; lid=tb407764704159; _l_g_=Ug%3D%3D; uc4=nk4=0%40FY4KoNqfWH7h1fuxlKhqBRtBu8XozskrcA%3D%3D&id4=0%40U2gp9rHMdWi31WhuZ80i%2Bs9rOkoxHrbV; unb=2220138943660; lgc=; cookie1=VAEMWgtwkkLS4HdRltRc37SaT1PZ1os2TgQqgfzkBas%3D; login=true; wk_cookie2=1f3761f822d26cc6e8e529259ced4f72; cookie17=UUpjNmLU6%2FkmhcqBwg%3D%3D; _nk_=tb407764704159; sgcookie=E100fHrjcHS%2BC02LHWaEstwpWcVG%2FBsseGUCIqIDObbwvbXY7GhxoF%2BBRuuGom97%2B5PDjn3U3keYfEmkFTQodLAfiFPWftqRq4ad%2FDETe33zkq8%3D; cancelledSubSites=empty; sg=90c; csg=fff67eeb; sn=; wk_unb=UUpjNmLU6%2FkmhcqBwg%3D%3D; __cn_logon_id__=tb407764704159; ali_apache_track=c_mid=b2b-22201389436609692f|c_lid=tb407764704159|c_ms=1; ali_apache_tracktmp=c_w_signed=Y; last_mid=b2b-22201389436609692f; _user_vitals_session_data_={\"user_line_track\":true,\"ul_session_id\":\"7wjba3sahvr\",\"last_page_id\":\"shop5034f5f173m45.1688.com%2Ff7flnzogk1\"}",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-site",
            "TE": "trailers"
        }
        print(temp_headers)
        product_list_content = requests.post(product_list_url, data=product_list_data,
                                             headers=temp_headers2)
        print(product_list_content.text)


if __name__ == '__main__':
    """
    '"memberId": "b2b-22014039174159cbd8",'
    "data=%7B%22componentKey%22%3A%22Wp_pc_common_offerlist%22%2C%22params%22%3A%22%7B%5C%22memberId%5C%22%3A%5C%22b2b-22014039174159cbd8%5C%22%2C%5C%22appdata%5C%22%3A%7B%5C%22sortType%5C%22%3A%5C%22wangpu_score%5C%22%2C%5C%22sellerRecommendFilter%5C%22%3Afalse%2C%5C%22mixFilter%5C%22%3Afalse%2C%5C%22tradenumFilter%5C%22%3Afalse%2C%5C%22quantityBegin%5C%22%3Anull%2C%5C%22pageNum%5C%22%3A1%2C%5C%22count%5C%22%3A30%7D%7D%22%7D"
    "https://h5api.m.1688.com/h5/mtop.alibaba.alisite.cbu.server.moduleasyncservice/1.0/?jsv=2.7.0&appKey=12574478&t=1750509771737&sign=441d66ec18a1c9955a1ab57c141d5a6b&api=mtop.alibaba.alisite.cbu.server.ModuleAsyncService&v=1.0&type=json&valueType=string&dataType=jsonp&timeout=10000"
    """
    product = Products()
    product.go("https://shop9i2i178378493.1688.com/page/index.htm?spm=a2615.7691456.wp_pc_common_topnav.0")
    # sign = get_sign_params(
    #     "0f730fa6a97cdc721c1905ea768db579_1750566243635",
    #     '{"componentKey":"Wp_pc_common_offerlist","params":"{\\"memberId\\":\\"b2b-22014039174159cbd8\\",\\"appdata\\":{\\"sortType\\":\\"wangpu_score\\",\\"sellerRecommendFilter\\":false,\\"mixFilter\\":false,\\"tradenumFilter\\":false,\\"quantityBegin\\":null,\\"pageNum\\":1,\\"count\\":30}}"}',
    #     1750557734376
    # )
