import itertools
import json
from functools import reduce
from operator import concat

import requests
from bs4 import BeautifulSoup

base_url = "https://www.zikinf.com/annonces/liste.php"


def init_params(rub, page):
    return {"rub": rub, "page": page}


def fetch_page(url, parameters=None):
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) "
                      "Chrome/58.0.3029.110 Safari/537.3"
    }

    response = requests.get(url, params=parameters, headers=headers)

    if response.status_code == 200:
        return response.content
    else:
        print(f"Failed to fetch page: {url}")
        return None


def extract_data(html):
    soup = BeautifulSoup(html, "html.parser")

    data_elements = soup.find_all("a", class_="annonce")

    data_list = []

    for element in data_elements:
        title = element.findNext("span", class_="titre").text
        link = element.get("href")
        zikinfId = link.split("-")[1]
        price = element.findNext("span", class_="prix").text
        img = element.findNext("img", class_="photoFit")
        localisation = element.findNext("span", class_="ville").text
        if img:
            thumb = img.get("srcset").split(',')[1].split(' ')[0].strip()
        else:
            thumb = None

        data_dict = {
            "zikinfId": zikinfId,
            "title": title,
            "link": link,
            "price": price,
            "thumb": thumb,
            "localisation": localisation,
        }

        data_list.append(data_dict)
    return data_list


def main():
    global max_page
    data = []
    html = fetch_page(base_url, init_params(7, 1))

    if html:
        soup = BeautifulSoup(html, "html.parser")
        max_page = soup.find("li", class_="warped").findNext("a").text

    for i in range(int(max_page)):
        html = fetch_page(base_url, init_params(7, i + 1))
        if html:
            data_elements = extract_data(html)
            data.append(data_elements)

    print(json.dumps(list(itertools.chain.from_iterable(data))))


if __name__ == "__main__":
    main()
