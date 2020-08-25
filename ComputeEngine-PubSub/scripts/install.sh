# Assuming that we already have 'pubsub.zip' in current dir

# Unpack package
unzip ./pubsub.zip -d ./pubsub-new
rm ./pubsub.zip

# Compile
cd ./pubsub-new/
npm i
cd ..

# Replace old (that involves killing currently running instance)
rm -r ./pubsub
mv ./pubsub-new ./pubsub

# Copy scripts to HOME
cp ./pubsub/scripts/install.sh ./install-pubsub.sh
chmod +x ./install-pubsub.sh

cp ./pubsub/scripts/run.sh ./run-pubsub.sh
chmod +x ./run-pubsub.sh

cp ./pubsub/scripts/on-vm-startup.sh ./on-vm-startup.sh
chmod +x ./on-vm-startup.sh

echo
echo All done. Remember to restart VM to apply changes.
