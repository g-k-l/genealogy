import re
import requests
from time import sleep
from bs4 import BeautifulSoup
from pymongo import MongoClient
from concurrent.futures import ThreadPoolExecutor, as_completed

# might need to change this if you don't have default settings on MongoDB
client = MongoClient('localhost',27017)
db = client['geneology']
tab = db['phds2']

base_url = 'https://www.genealogy.math.ndsu.nodak.edu/id.php?id='

def scrape_by_incr(end=21000, req_lim=5):
    '''TODO: Parallelize, increment the id one by one to obtain the data'''
    exit_counter, counter = 0, 1
    while True:
        if exit_counter >= req_lim:
            print('No entry for awhile. Likely finished. Exiting...')
            print('Last ID claimed ', ctr)
            break
        if get_mathematician_info(counter)['name']=='':
            exit_counter = 0
        elif counter>end:
            exit_counter += 1


def scrape_by_tree(math_id, insert=True):
    '''TODO: pick a root mathematician and collect data starting from that root'''

    error_count = 0
    with ThreadPoolExecutor() as executor:
        future = executor.submit(get_mathematician_info, math_id, insert) #submit root for tasks
        next_futures = []
        while True:
            if future.done():
                try:
                    next_futures+= [executor.submit(get_mathematician_info, int(desc[0]), insert)
                                    for desc in future.result()['descendants']]
                except:
                    print("An error occurred: ", future.exception())
                try:
                    future = next_futures.pop(0)
                except (IndexError):
                    print("No more task at hand. Exiting...")
                    break


def get_mathematician_info(math_id, insert=True):
    ''''''
    req = requests.get(base_url+str(math_id),headers={'User-Agent': 'Mozilla/5.0'})
    soup = BeautifulSoup(req.text, 'html.parser')
    descs = get_descendants(soup)
    entry = {'math_id':math_id, 'name': get_name(soup), 'dissertation': get_dissertation(soup),
            'school': get_school(soup),'year_grad': get_year_grad(soup),'descendants': descs}

     #error will be thrown when the next part fails
    if insert:
        tab.insert_one(entry)

    return entry

# extractor functions
def get_name(soup):
    try:
        return soup.findAll('div',{'id':'mainContent'})[0].div.h2.contents[0].strip()
    except:
        return ''

def get_dissertation(soup):
    try:
        return soup.findAll('span',{'id':'thesisTitle'})[0].contents[0].strip()
    except:
        return ''

def get_school(soup):
    try:
        return soup.findAll('span')[0].contents[1].contents[0].strip()
    except:
        return ''

def get_year_grad(soup):
    try:
        return int(soup.findAll('span')[0].text[-4:])
    except:
        return ''

# list of (descendant id, descendant name)
def get_descendants(soup):
    try:
        desc_table = soup.findAll('div',{'id':'mainContent'})[0].div.table.findAll('a')
        return [(int(''.join(filter(lambda x: x.isdigit(), desc['href']))), desc.text)
                for desc in desc_table]
    except:
        return []

if __name__ == "__main__":
    scrape_by_tree(18231) # root is Gauss
