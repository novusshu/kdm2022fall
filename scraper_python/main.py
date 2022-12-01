import requests
from bs4 import BeautifulSoup

URL = "https://www.nsf.gov/pubs/2022/nsf22622/nsf22622.htm"
page = requests.get(URL)
soup = BeautifulSoup(page.content, "html.parser")
