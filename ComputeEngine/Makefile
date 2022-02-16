.PHONY: package upload connect restart

package:
	chmod +x ./create-package.sh
	./create-package.sh

upload:
	gcloud compute scp ./package.zip ./install-package.sh backend:~

connect:
	gcloud compute ssh backend

restart:
	gcloud compute instances stop backend
	gcloud compute instances start backend
