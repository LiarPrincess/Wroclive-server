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
	gcloud functions deploy backendStart --trigger-topic backend-start --runtime nodejs12 --region europe-west3 --ingress-settings internal-only
	gcloud functions deploy backendStop  --trigger-topic backend-stop  --runtime nodejs12 --region europe-west3 --ingress-settings internal-only

log:
	gcloud functions logs
