#!/bin/bash
set -e

echo "🔨 Building React frontend..."
cd ../frontend
npm install --production=false
npm run build

echo "📦 Copying build to Rails public folder..."
cd ../backend
rm -rf public/*
cp -r ../frontend/dist/* public/

echo "✅ Frontend build complete and copied to public/"
