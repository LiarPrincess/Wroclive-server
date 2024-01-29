# -----------
# -- Build --
# -----------

.PHONY: start build watch test coverage

start:
	npm start

build:
	./node_modules/.bin/tsc

watch:
	./node_modules/.bin/tsc -w

test:
	npm run-script test

test-watch:
	npm run-script test -- --watch

coverage:
	npm run-script test -- --coverage

# ------------
# -- Google --
# ------------

.PHONY: deploy log describe browse

deploy: build
	gcloud app deploy app.yaml

log:
	gcloud app logs tail

describe:
	gcloud projects describe wroclive

browse:
	gcloud app browse
