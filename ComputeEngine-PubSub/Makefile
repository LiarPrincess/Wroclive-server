# -----------
# -- Node --
# -----------

.PHONY: start build watch

start:
	npm start

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
	zip ./pubsub.zip -r ./package.json ./package-lock.json ./GCP-Credentials.json ./tsconfig.json ./src ./scripts
	gcloud compute scp ./pubsub.zip backend:~
	rm ./pubsub.zip
