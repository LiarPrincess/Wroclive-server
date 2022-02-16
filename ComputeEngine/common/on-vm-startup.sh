#!/usr/bin/env bash

export NODE_ENV=production

# We have to do 'cd' to properly resolve relative paths.
SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" &> /dev/null && pwd)

cd "/home/michal/pub-sub"
( node ./dist/app.js & )

cd "/home/michal/notifications"
( node ./dist/app.js & )

cd "$SCRIPT_DIR"
