"""
抓取1688产品数据
"""

import re
import json

from bs4 import BeautifulSoup
from lxml import html
from app.spiders.spider import get_html

headers = {
    'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
    'accept-encoding': 'gzip, deflate, br',
    'accept-language': 'zh-CN,zh;q=0.9,zh-TW;q=0.8,en-US;q=0.7,en;q=0.6,ja;q=0.5',
    'cache-control': 'max-age=0',
    'cookie': 'cna=6B2NFMQceWkCATy/9iZmJ/r2; ali_ab=60.191.246.38.1543910908671.4; lid=%E4%B9%89%E4%B9%8C2010; __last_userid__=375685501; hng=CN%7Czh-CN%7CCNY%7C156; UM_distinctid=16b40021a50161-08fe1f8fb068e8-37657e03-1fa400-16b40021a51abb; ali_apache_id=11.15.106.128.1564454978766.321081.5; h_keys="%u7537%u68c9%u670d#%u73a9%u5177#%u4e49%u4e4c%u5e02%u4e00%u6db5%u5236%u7ebf#%u91d1%u5b9d%u8d1d#%u4e00%u6db5%u5236%u7ebf#2017%u5723%u8bde%u9996%u9970#%u5723%u8bde%u9996%u9970#%u9996%u9970#%u7ea2%u85af#%u4e49%u4e4c%u817e%u535a%u793c%u54c1"; ad_prefer="2019/08/08 09:38:58"; ali_beacon_id=60.191.246.38.1566810215744.002451.6; ali_apache_track=c_mid=b2b-375685501ncisr|c_lid=%E4%B9%89%E4%B9%8C2010|c_ms=1|c_mt=2; taklid=9d140935ba3b4a8f9c20e255b4a99dd0; _csrf_token=1569548292989; cookie2=11e8d4b69091a1157b038c714385c9a6; t=4c47e32627e4d9d5c08008789ed65a34; _tb_token_=ab7d81831375; uc4=id4=0%40UgDLKslxx%2F5KKbIzCKEbS9CpADM%3D&nk4=0%40s5u8VZNrKh1Ipk4a6%2FKiHZj80A%3D%3D; __cn_logon__=false; alicnweb=homeIdttS%3D99025414611281355176293308315884802540%7Ctouch_tb_at%3D1569548305483%7ChomeIdttSAction%3Dtrue%7Clastlogonid%3D%25E4%25B9%2589%25E4%25B9%258C2010%7Cshow_inter_tips%3Dfalse; l=cBMFFQcuvPgtaQebKOfalurza77T5IRb4sPzaNbMiICP_j1y5CQAWZCBm382CnGVp626R3zP_tquBeYBc1bnLjDSik2H9; isg=BNTUjkpcdQqEKuDNKwS17J7fpRRMK8akMa0MD261lt_jWXSjlj_fp6CTWRHkoTBv',
    'sec-fetch-mode': 'navigate',
    'sec-fetch-site': 'same-origin',
    'sec-fetch-user': '?1',
    'upgrade-insecure-requests': '1',
    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.90 Safari/537.36',
}


def extract_type_data(json_data, type):
    type_dict = {
        "detail": "@ali/tdmod-od-pc-offer-description",
        "attribute": "@ali/tdmod-od-pc-attribute-new",
        "scale": "@ali/tdmod-od-pc-offer-cross",
        "discount": "@ali/tdmod-od-pc-offer-discount",
        "priceInfo": "@ali/tdmod-od-pc-offer-price",
        "service": "@ali/tdmod-od-pc-offer-service",
        "mainPic": "@ali/tdmod-pc-od-main-pic",
        "titleInfo": "@ali/tdmod-od-pc-offer-title",
        "tab": "@ali/tdmod-od-pc-offer-tab",
        "logistics": "@ali/tdmod-od-pc-offer-logistics",
        "orderInfo": "@ali/tdmod-pc-od-dsc-order",
    }
    """
    从JSON数据中提取特定componentType的detailUrl
    参数:
        json_data: dict格式的JSON数据
    返回:
        detailUrl的值 (字符串)，未找到时返回None
    """
    # 遍历所有组件
    for component_id, component_data in json_data['data'].items():
        if component_data.get('componentType') == type_dict[type]:
            return component_data.get('data')
    return {}


def extract_data_with_type(html_content):
    soup = BeautifulSoup(html_content, 'html.parser')
    result = []

    # 查找所有元素并按文档顺序处理
    for element in soup.find_all():
        if element.name == 'span':
            # 提取span文本并添加类型标识
            text = element.get_text(strip=True)
            if text:  # 确保文本不为空
                result.append({
                    "type": "txt",
                    "content": text
                })
        elif element.name == 'img':
            # 提取img的src并添加类型标识
            src = element.get('src')
            if src:
                # 清理URL：去除转义字符和多余引号
                clean_pattern = re.compile(r'\\*"')
                clean_url = clean_pattern.sub('', src)
                result.append({
                    "type": "img",
                    "content": clean_url
                })

    return result


class Product:
    def __filter(self, content):
        content = re.findall("<span>预估生产周期</span>", content)
        if len(content) > 0:
            return {
                'errcode': 101,
                'errmsg': '此产品为淘工厂类型，暂不支持抓取'
            }
        return {
            'errcode': 0
        }

    def __extract_data(self, tree):
        script = tree.xpath('//script[contains(., "window.__INIT_DATA")]/text()')[0]

        base_str = re.findall("window.__INIT_DATA=({[\s\S]*})", script)[0].replace('\"', '"')

        return json.loads(base_str)

    # 基本信息 & SKU
    def __extract_base_and_sku(self, tree):
        script = tree.xpath('//script[contains(., "window.__INIT_DATA")]/text()')[0]

        base_str = re.findall("window.__INIT_DATA=({[\s\S]*})", script)[0].replace('\"', '"')

        return json.loads(base_str)['globalData']

    # 图片
    def __extract_images(self, tree):
        return [item["fullPathImageURI"] for item in tree["images"]]

    def go(self, url):
        content = get_html(url, headers)

        filter_result = self.__filter(content)
        if filter_result['errcode'] != 0:
            return filter_result

        tree = html.fromstring(content)
        # 商品描述数据
        init_data = self.__extract_data(tree)
        detail_url = extract_type_data(init_data, "detail").get("detailUrl")
        detail_data = get_html(detail_url, headers)
        detail_json = extract_data_with_type(detail_data)

        product = self.__extract_base_and_sku(tree)
        result = dict()
        result['title'] = product["tempModel"]["offerTitle"]
        result["companyName"] = product["tempModel"]["companyName"]
        result["unit"] = product["tempModel"]["offerUnit"]
        result['images'] = self.__extract_images(product)
        result["order"] = product["orderParamModel"]["orderParam"]
        result["sku"] = product["skuModel"]
        result["detail"] = detail_json
        result["attribute"] = extract_type_data(init_data, "attribute")
        result["scale"] = extract_type_data(init_data, "scale")
        result["discount"] = extract_type_data(init_data, "discount")
        result["priceInfo"] = extract_type_data(init_data, "priceInfo")
        result["service"] = extract_type_data(init_data, "service")
        result["mainPic"] = extract_type_data(init_data, "mainPic")
        result["titleInfo"] = extract_type_data(init_data, "titleInfo")
        result["tab"] = extract_type_data(init_data, "tab")
        result["logistics"] = extract_type_data(init_data, "logistics")
        result["orderInfo"] = extract_type_data(init_data, "orderInfo")
        return result
