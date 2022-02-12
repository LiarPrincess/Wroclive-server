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

# ------------
# -- Google --
# ------------

.PHONY: connect deploy restart

connect:
	gcloud compute ssh backend

deploy: build
	zip ./updater.zip -r ./package.json ./package-lock.json ./GCP-Credentials.json ./dist ./scripts ./sql
	gcloud compute scp ./updater.zip backend:~
	rm ./updater.zip

restart:
	gcloud compute instances stop backend
	gcloud compute instances start backend
