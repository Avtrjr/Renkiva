#!/bin/bash

# Build script for Electron app
echo "Building MeshTV Electron app..."

# Build the web app first
echo "Building web application..."
npm run build

# Copy electron files to dist
echo "Preparing Electron files..."
mkdir -p dist-electron
cp -r electron dist-electron/
cp package.json dist-electron/

# Create a simple package.json for electron
cat > dist-electron/package.json << EOF
{
  "name": "meshtv-electron",
  "version": "1.0.0",
  "main": "electron/main.js",
  "scripts": {
    "start": "electron ."
  },
  "devDependencies": {
    "electron": "latest"
  }
}
EOF

echo "Electron build prepared in dist-electron/"
echo "To run: cd dist-electron && npm install && npm start"