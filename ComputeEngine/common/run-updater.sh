#!/usr/bin/env bash

# This script will be ran by pub-sub.
# Assuming that proper version of 'updater' is present in HOME.
cd ./updater
node ./dist/app.js
