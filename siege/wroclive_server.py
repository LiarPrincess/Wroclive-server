import json
import urllib.request as request

class WrocliveServer:

  def get_lines(self):
    'Get all line definitions from the server'

    url = 'https://wroclive.app/api/v1/lines'
    response = self.__get(url)
    return response['data']

  def get_vehicle_locations(self, lines):
    'Get vehicle locations for given lines.'

    line_names_joined = ''
    for line in lines:
      name = line['name']
      line_names_joined += name + ';'

    url = f'https://wroclive.app/api/v1/vehicles?lines={line_names_joined}'

    response = self.__get(url)
    return response['data']

  def __get(self, url):
    # print(f"Getting '{url}'")
    response = request.urlopen(url)

    if response.status != 200:
      raise ValueError(f"Got {response.status} ({response.reason}) from '{url}'")

    content = response.read().decode('utf-8')
    content_json = json.loads(content)
    return content_json
