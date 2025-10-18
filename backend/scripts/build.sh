#!/bin/bash

set -e

echo "🚀 Starting Managrr build process..."

# Build React frontend
echo "📦 Building React frontend..."
cd web
npm ci --production=false
npm run build

# Copy build to backend
echo "📁 Copying frontend build to backend..."
cd ..
rm -rf backend/ui
mkdir -p backend/ui
cp -r web/build/* backend/ui/

# Build Go backend
echo "🔨 Building Go backend..."
cd backend
go build -o app

echo "✅ Build complete!"