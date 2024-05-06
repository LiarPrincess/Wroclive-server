#!/usr/bin/env bash

# Fail on 1st failed command
set -e

SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" &> /dev/null && pwd)
ROOT_DIR=$(dirname "$SCRIPT_DIR")

PACKAGE_DIRNAME=package
PACKAGE_PATH=$SCRIPT_DIR/$PACKAGE_DIRNAME

echo "Creating package"
echo "$PACKAGE_PATH"
rm -rf "$PACKAGE_PATH"
mkdir "$PACKAGE_PATH"
echo

# ==============
# === Common ===
# ==============

echo "Adding common files"
cp -R "$SCRIPT_DIR/common/" "$PACKAGE_PATH/"
echo

# ===============
# === Pub sub ===
# ===============

echo "Adding pub-sub"
PUBSUB_PATH=$PACKAGE_PATH/pub-sub

mkdir "$PUBSUB_PATH"

cd "$ROOT_DIR/ComputeEngine-PubSub"
npm install --quiet
rm -rf "./dist"
make build

cp -R "./package.json" \
      "./package-lock.json" \
      "./GCP-Credentials.json" \
      "./dist" \
      "$PUBSUB_PATH"

cd "$SCRIPT_DIR"
echo

# ===============
# === Updater ===
# ===============

echo "Adding updater"
UPDATER_PATH=$PACKAGE_PATH/updater

mkdir "$UPDATER_PATH"
mkdir "$UPDATER_PATH/data"

cd "$ROOT_DIR/ComputeEngine-Updater"
npm install --quiet
rm -rf "./dist"
make build

cp -R "./package.json" \
      "./package-lock.json" \
      "./GCP-Credentials.json" \
      "./dist" \
      "./sql" \
      "$UPDATER_PATH"

cd "$SCRIPT_DIR"
echo

# =====================
# === Notifications ===
# =====================

echo "Adding notifications"
NOTIFICATIONS_PATH=$PACKAGE_PATH/notifications

mkdir "$NOTIFICATIONS_PATH"

cd "$ROOT_DIR/ComputeEngine-Notifications"
npm install --quiet
rm -rf "./dist"
make build

cp -R "./package.json" \
      "./package-lock.json" \
      "./APN-Key.p8" \
      "./APN-Credentials.json" \
      "./GCP-Credentials.json" \
      "./Twitter-Credentials.json" \
      "./dist" \
      "$NOTIFICATIONS_PATH"

cd "$SCRIPT_DIR"
echo

# ===============
# === Archive ===
# ===============

echo "Creating archive"
ZIP_NAME=$PACKAGE_DIRNAME.zip

rm -f "$ZIP_NAME"
zip --quiet "$ZIP_NAME" -r "$PACKAGE_DIRNAME"
