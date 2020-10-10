INTERNAL_FUNCTION=--runtime nodejs12 --region europe-west3 --ingress-settings internal-only

# -----------
# -- Build --
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

.PHONY: deploy log

# Remember to add entry in 'index.js'!
deploy: build
	gcloud functions deploy backendStart --trigger-topic backend-start $(INTERNAL_FUNCTION)
	gcloud functions deploy backendStop  --trigger-topic backend-stop  $(INTERNAL_FUNCTION)

logs:
	gcloud functions logs read
