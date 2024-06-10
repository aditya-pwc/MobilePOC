#!/bin/bash

set -x
DEST=$CONFIGURATION_BUILD_DIR/$UNLOCALIZED_RESOURCES_FOLDER_PATH

# Enables iOS devices to get the IP address of the machine running Metro
if [[ "$CONFIGURATION" = *Debug* && ! "$PLATFORM_NAME" == *simulator ]]; then
  for num in 0 1 2 3 4 5 6 7 8; do
    IP=$(ipconfig getifaddr en${num})
    if [ ! -z "$IP" ]; then
      break
    fi
  done
  if [ -z "$IP" ]; then
    IP=$(ifconfig | grep 'inet ' | grep -v ' 127.' | grep -v ' 169.254.' |cut -d\   -f2  | awk 'NR==1{print $1}')
  fi

  echo "$IP" > "$DEST/ip.txt"
  exit 0;
fi

if [[ "$CONFIGURATION" = *Debug* && "$PLATFORM_NAME" == *simulator ]]; then
  echo "skipping."
  exit 0;
fi

if [[ "$SKIP_BUNDLING" ]]; then
  echo "SKIP_BUNDLING enabled; skipping."
  exit 0;
fi

# Path to react-native folder inside node_modules
REACT_NATIVE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/node_modules/react-native" && pwd)"
# Get the project root directory
PROJECT_ROOT=${PROJECT_ROOT:-"$REACT_NATIVE_DIR/../.."}
cd $PROJECT_ROOT || exit

# check and assign NODE_BINARY env
# shellcheck source=/dev/null
source "$REACT_NATIVE_DIR/scripts/node-binary.sh"

# Step 1: Build the common bundle
echo "Building common bundle..."
yarn build:common:ios

# Step 2: Build the SAVVY bundle
echo "Building savvy bundle..."
yarn build:savvy:ios

# Step 3: Build the Orderade bundle
echo "Building orderade bundle..."
yarn build:orderade:ios

echo "Build Completed"