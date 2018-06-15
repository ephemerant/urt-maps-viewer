import urllib2, time

key = 'YOUR KEY HERE'

url = 'http://api.urtjumpers.com/?key={0}&liste=maps&format=json'.format(key)

with open('maps.json', 'w') as f:
    f.write('{ "maps": ' + (urllib2.urlopen(url)).read() + '}')
