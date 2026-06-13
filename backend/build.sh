#!/usr/bin/env bash
set -o errexit

echo "=== Installing Python dependencies ==="
pip install -r requirements.txt

echo "=== Installing Node.js and building frontend ==="
cd ../frontend
rm -rf node_modules
npm install
npm run build
cd ../backend

echo "=== Files in staticfiles after build ==="
find staticfiles -name "index.html" 2>/dev/null || echo "No index.html found yet"

echo "=== Running Django collectstatic ==="
python manage.py collectstatic --no-input

echo "=== Files in staticfiles after collectstatic ==="
find staticfiles -name "index.html" 2>/dev/null || echo "Still no index.html"

echo "=== Running Django migrations ==="
python manage.py migrate

echo "=== Done ==="
