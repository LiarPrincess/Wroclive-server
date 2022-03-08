# -----------
# -- Build --
# -----------

.PHONY: build watch test coverage

build:
	./node_modules/.bin/tsc

watch:
	./node_modules/.bin/tsc -w

test:
	npm run-script test

coverage:
	npm run-script test -- --coverage
