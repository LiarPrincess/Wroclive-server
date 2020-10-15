This directory contains:
- preset to `Unix siege` tool + baseline - this will check burst performance to test how many request can we handle at the same time
- our tiny `siege module written in Python` - this will check if there are no problems when running server for a longer period of time (no restarts etc.)

# Unix siege

Run `make siege` to run standard `Unix siege` tool.

This is the baseline:

```
transactions: 12394 -  number of server hits
availability: 100.00
elapsed_time: 111.85 - duration of the entire siege test

data_transferred:  26.64 - sum of data transferred to every siege simulated user
response_time:      0.23 - average time it took to respond to each requests
transaction_rate: 110.81 - average number of transactions per second
throughput:         0.24 - average number of bytes transferred every second from the server
concurrency:       24.94 - average number of simultaneous connections, a number which rises as server performance decreases

successful_transactions: 12394 - number of times the server returned a code less then 400
failed_transactions:     0

longest_transaction:     0.67
shortest_transaction:    0.19
```

# Custom module written in Python

Run `make run` to run our custom siege module.

This module will simulate few users requesting different data from the server at the same time.

We will use following scenarios:
- user opens the app for the first time (download all lines + their locations)
- reopen running app (download locations for the selected lines)

Each 'user' runs in separate process to avoid GIL.
