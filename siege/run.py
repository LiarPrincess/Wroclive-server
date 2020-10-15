import time
import random
from multiprocessing import Process

from scenarios import FirstUseScenario, NextUseScenario
from wroclive_server import WrocliveServer

user_count = 5

def per_user(name):
  print(f'[{name}] Starting')

  server = WrocliveServer()

  # 'Next use' is more likely to occur
  scenarios = [
    FirstUseScenario(server),
    NextUseScenario(server),
    NextUseScenario(server),
    NextUseScenario(server)
  ]

  while True:
    scenario = random.choice(scenarios)
    print(f'[{name}] Running: {scenario.name}')
    scenario.run()

    sleep_duration_in_seconds = random.randint(5, 15)
    time.sleep(sleep_duration_in_seconds)

if __name__ == '__main__':
  for i in range(0, user_count):
    name = 'User ' + str(i)
    p = Process(target=per_user, args=(name,))
    p.start()

  # p.join()
