#!/usr/bin/env bash
# Render build script — builds frontend then sets up Django backend
set -o errexit

echo "=== Installing Python dependencies ==="
pip install -r requirements.txt

echo "=== Installing Node.js and building frontend ==="
cd ../frontend
npm install
npm run build
cd ../backend

echo "=== Running Django collectstatic ==="
python manage.py collectstatic --no-input

echo "=== Running Django migrations ==="
python manage.py migrate

echo "=== Build complete ==="
