#!/usr/bin/env bash

# Essentials
sudo apt-get update

# Unzip
sudo apt install unzip

# Node
sudo curl -sL https://deb.nodesource.com/setup_12.x | sudo bash -
sudo apt-get install -y nodejs

# Sqlite3
sudo apt-get install sqlite3
