# -----------
# -- Build --
# -----------

start:
	npm start

build:
	./node_modules/.bin/tsc

watch:
	./node_modules/.bin/tsc -w

# ------------
# -- Google --
# ------------

.PHONY: deploy log describe browse

deploy: build
	gcloud app deploy

log:
	gcloud app logs tail -s default

describe:
	gcloud projects describe wroclive

browse:
	gcloud app browse
