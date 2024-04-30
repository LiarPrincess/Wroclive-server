# -----------
# -- Build --
# -----------

.PHONY: build watch test coverage

build:
	./node_modules/.bin/tsc

run: build
	node ./dist/app.js

watch:
	./node_modules/.bin/tsc -w

test:
	npm run-script test

coverage:
	npm run-script test -- --coverage
