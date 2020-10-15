import time
import random

from wroclive_server import WrocliveServer

class Scenario:
  '''
  Base scenario (use as a mixin).
  '''

  @property
  def name(self):
    return 'Base scenario'

  def __init__(self, server: WrocliveServer):
    self.__server = server

  def run(self):
    print("Each scenario should override 'run()'")

  def get_lines(self):
    try:
      return self.__server.get_lines()
    except ValueError as e:
      print(e)
      return []

  def get_vehicle_locations(self, lines):
    try:
      return self.__server.get_vehicle_locations(lines)
    except ValueError as e:
      print(e)
      return []

  def wait_after_updating_vehicle_locations(self):
    time.sleep(5) # s

class FirstUseScenario(Scenario):
  '''
  1. Download lines
  2. Show all vehicles
  3. Update vehicle locations (multiple times, user is exploring app)
  '''

  @property
  def name(self):
    return 'First use scenario'

  def run(self):
    all_lines = self.get_lines()

    call_count = random.randint(1, 20)
    for _ in range(0, call_count):
      self.get_vehicle_locations(all_lines)
      self.wait_after_updating_vehicle_locations()

class NextUseScenario(Scenario):
  '''
  1. Open app with already selected lines
  2. Update vehicle locations (just a few times, since user knows what they are doing)
  '''

  @property
  def name(self):
    return 'Next use scenario'

  def __init__(self, server: WrocliveServer):
    super().__init__(server)
    self.all_lines = self.get_lines()

  def run(self):
    lines = self.__get_random_lines()

    call_count = random.randint(1, 5)
    for _ in range(0, call_count):
      self.get_vehicle_locations(lines)
      self.wait_after_updating_vehicle_locations()

  def __get_random_lines(self):
    # 'random.choices' can repeat, but that does not matter
    all_lines_count = len(self.all_lines)
    result_count = random.randint(1, all_lines_count)
    return random.choices(self.all_lines, k=result_count)
