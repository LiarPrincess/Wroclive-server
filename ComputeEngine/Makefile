.PHONY: package upload connect restart

package:
	chmod +x ./create-package.sh
	./create-package.sh

# GCP broke sending multiple files at once…
upload:
	gcloud compute scp ./package.zip backend:~
	gcloud compute scp ./install-package.sh backend:~

connect:
	gcloud compute ssh backend

restart:
	gcloud compute instances stop backend
	gcloud compute instances start backend
