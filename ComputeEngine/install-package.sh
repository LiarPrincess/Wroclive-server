#!/usr/bin/env bash

SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" &> /dev/null && pwd)

# .================================ IMPORTANT =================================.
# |                                                                            |
# |                       This script will be run on VM!                       |
# |                                                                            |
# '================================ IMPORTANT ================================='

# =======================
# === Extract archive ===
# =======================

echo "Extracting package"

PACKAGE_ZIP_PATH=$SCRIPT_DIR/package.zip
PACKAGE_PATH=$SCRIPT_DIR/package

rm -rf "$PACKAGE_PATH"
unzip -q "$PACKAGE_ZIP_PATH" -d "$SCRIPT_DIR"
echo

# ===============
# === Pub sub ===
# ===============

echo "Configuring pub-sub"
PUBSUB_PATH=$PACKAGE_PATH/pub-sub

cd "$PUBSUB_PATH"
npm i
cd "$SCRIPT_DIR"

echo

# ===============
# === Updater ===
# ===============

echo "Configuring updater"
UPDATER_PATH=$PACKAGE_PATH/updater

cd "$UPDATER_PATH"
npm i
cd "$SCRIPT_DIR"

echo

# =====================
# === Notifications ===
# =====================

echo "Configuring Notifications"
NOTIFICATIONS_PATH=$PACKAGE_PATH/notifications

cd "$NOTIFICATIONS_PATH"
npm i
cd "$SCRIPT_DIR"

echo

# ====================
# === Copy to root ===
# ====================

echo "Installing 'on-vm-startup.sh'"
rm "./on-vm-startup.sh"
mv "$PACKAGE_PATH/on-vm-startup.sh" "./on-vm-startup.sh"
chmod +x "./on-vm-startup.sh"

echo "Installing 'run-updater.sh'"
rm "./run-updater.sh"
mv "$PACKAGE_PATH/run-updater.sh" "./run-updater.sh"
chmod +x "./run-updater.sh"

echo "Installing pub-sub"
rm -r "./pub-sub"
mv "$PUBSUB_PATH" "./pub-sub"

echo "Installing updater"
rm -r "./updater"
mv "$UPDATER_PATH" "./updater"

echo "Installing notifications"
rm -r "./notifications"
mv "$NOTIFICATIONS_PATH" "./notifications"
