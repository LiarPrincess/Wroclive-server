# -----------
# -- Build --
# -----------

.PHONY: build watch

build:
	./node_modules/.bin/tsc

watch:
	./node_modules/.bin/tsc -w

# ------------
# -- Google --
# ------------

.PHONY: connect deploy

connect:
	gcloud compute ssh backend

deploy:
	zip ./updater.zip -r ./package.json ./package-lock.json ./GCP-Credentials.json ./tsconfig.json ./src ./scripts
	gcloud compute scp ./updater.zip backend:~
	rm ./updater.zip
