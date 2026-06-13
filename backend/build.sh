#!/usr/bin/env bash
set -o errexit

echo "=== Installing Python dependencies ==="
pip install -r requirements.txt

echo "=== Building frontend ==="
cd ../frontend
rm -rf node_modules
npm install
npm run build
cd ../backend

echo "=== Django setup ==="
python manage.py collectstatic --no-input
python manage.py migrate

echo "=== Done ==="
