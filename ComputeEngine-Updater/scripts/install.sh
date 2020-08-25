# Assuming that we already have 'updater.zip' in current dir

# Unpack package
unzip ./updater.zip -d ./updater-new
rm ./updater.zip

# Compile
cd ./updater-new/
npm i
npm run build
cd ..

# Replace old
rm -r ./updater
mv ./updater-new ./updater

# Copy scripts to HOME
cp ./updater/scripts/install.sh ./install-updater.sh
chmod +x ./install-updater.sh

cp ./updater/scripts/run.sh ./run-updater.sh
chmod +x ./run-updater.sh
