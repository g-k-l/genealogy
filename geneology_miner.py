import requests
import urllib.parse
from bs4 import BeautifulSoup
from time import sleep
import csv
from pymongo import MongoClient
from collections import OrderedDict
import json
import pickle
from concurrent import futures

'''PYTHON3'''

base_url = 'https://www.genealogy.math.ndsu.nodak.edu/id.php?id='
mirror_1 = 'http://www.genealogy.ams.org/id.php?id='
#id corresponds to an entry about a mathematician

def get_one_page(math_id):
    r = requests.get(base_url+str(math_id),headers={'User-Agent': 'Mozilla/5.0'})
    soup = BeautifulSoup(r.text, 'html.parser')

    if r.status_code == 404:
        print ('Something bad happened. We failed at: ', math_id)
        return
    if soup.findAll('p')[0].contents[0]=='You have specified an ID that does not exist in the database. Please back up and try again.':
        raise ValueError('This math_id does not correspond to a mathematician')
    return get_mathematician_info(math_id,soup), r.text

def get_mathematician_info(math_id, soup):
    '''
    INPUT:
        math_id: id used to get the mathematician's page on the site
    OUTPUT:
        d: a dictionary of information (about the mathematician with the math_id)
            collected from the site.
    '''
    d = OrderedDict()
    d['math_id'] = math_id
    main_content = soup.findAll('div',{'id':'mainContent'})

    try:
        d['name'] = main_content[0].div.h2.contents[0].strip()
    except (AttributeError, IndexError):
        d['name'] = ''
        print ('No name available for ', math_id)

    try:
        d['dissertation'] = soup.findAll('span',{'id':'thesisTitle'})[0].contents[0].strip()
    except (AttributeError, IndexError):
        d['dissertation'] = ''
        print ('No dissertation available for ', math_id)

    try:
        d['school'] = soup.findAll('span')[0].contents[1].contents[0]
    except (AttributeError, IndexError):
        d['school'] = ''
        print ('No school available for ', math_id)

    try:
        d['year_grad'] = soup.findAll('span')[0].contents[1].contents[0]
    except (AttributeError, IndexError):
        d['year_grad'] = ''
        print ('No year_grad available for ', math_id)

    d['descendants'] = []
    try:
        desc_table = main_content[0].div.table
        for item in desc_table.find_all("tr")[1:]:
            d['descendants'].append([td.get_text() for td in item.find_all("td")])
    except AttributeError:
        print ('No direct descendants for ', d['name'])

    return d


def main():
    client = MongoClient('localhost', 27017, w=1)
    db = client['geneology']
    tab = db['maths']
    print (tab)

    columns = ['math_id','name','dissertation','school','year_grad', 'descendants']
    with open('math_geneology.csv', 'w',newline='') as f:
        csv_writer = csv.DictWriter(f, fieldnames=columns,extrasaction='ignore')
        csv_writer.writeheader()

        with futures.ThreadPoolExecutor() as executor:
            parse_info_gen = executor.map(get_one_page, range(1, 202496))

        # with open('parse_info_gen.pkl','wb') as f:
            # pickle.dump(list(parse_info_gen),f)

        for parsed_info, raw_html in parse_info_gen:
            csv_writer.writerow(parsed_info)

            parsed_info['raw_html']=raw_html
            print(db.maths.insert_one(parsed_info).acknowledged)

        print ('Job Complete.')

if __name__ == '__main__':
    main()
    # client = MongoClient('localhost', 27017)
    # db = client['geneology']
    # tab = db['math_test']
    # parsed, raw = get_one_page(18233)
    # dump_to_mongo(db.geneology,parsed,raw)
