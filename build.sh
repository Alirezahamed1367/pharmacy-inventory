#!/bin/bash
# Build script for Render
echo "Setting up PocketBase..."

# Download PocketBase
curl -L -o pocketbase.zip "https://github.com/pocketbase/pocketbase/releases/download/v0.30.1/pocketbase_0.30.1_linux_amd64.zip"
unzip pocketbase.zip
chmod +x pocketbase
rm pocketbase.zip

# Verify
ls -la
./pocketbase --version

echo "PocketBase setup complete!"