#!/usr/bin/env python3
"""
Force load the model and check all paths
"""
import os
import sys
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

print("🔍 Checking Model Loading Issue")
print("=" * 50)

# Before Django setup
print("\n1️⃣ Before Django Setup:")
print(f"   Backend dir: {backend_dir}")
print(f"   Model file: {backend_dir / 'models' / 'mental_model.joblib'}")
print(f"   Exists: {(backend_dir / 'models' / 'mental_model.joblib').exists()}")

import django
django.setup()

# After Django setup
print("\n2️⃣ After Django Setup:")
from django.conf import settings
print(f"   BASE_DIR: {settings.BASE_DIR}")
print(f"   Model path 1: {Path(settings.BASE_DIR) / 'models' / 'mental_model.joblib'}")
print(f"   Exists: {(Path(settings.BASE_DIR) / 'models' / 'mental_model.joblib').exists()}")

# Check all candidate paths
print("\n3️⃣ Checking All Candidate Paths:")
from mental_health_app.ai import CANDIDATES
for i, p in enumerate(CANDIDATES, 1):
    print(f"   Path {i}: {p}")
    print(f"      Exists: {p.exists()}")
    if p.exists():
        print(f"      Size: {p.stat().st_size:,} bytes")

# Check MODEL_DATA
print("\n4️⃣ Checking MODEL_DATA:")
from mental_health_app.ai import MODEL_DATA
print(f"   Loaded: {MODEL_DATA is not None}")

if MODEL_DATA is None:
    print("\n❌ MODEL_DATA is None!")
    print("\n🔧 Attempting to manually load...")
    
    import joblib
    model_path = backend_dir / 'models' / 'mental_model.joblib'
    
    if model_path.exists():
        try:
            data = joblib.load(model_path)
            print(f"   ✅ Manual load successful!")
            print(f"   Features: {data.get('n_features')}")
            print(f"   Classes: {len(data.get('classes', []))}")
            
            # Now try the reload function
            print("\n🔄 Testing reload_model()...")
            from mental_health_app import ai
            ai.MODEL_DATA = None  # Force it to None
            success = ai.reload_model()
            print(f"   Reload successful: {success}")
            
        except Exception as e:
            print(f"   ❌ Manual load failed: {e}")
            import traceback
            traceback.print_exc()
    else:
        print(f"   ❌ Model file doesn't exist at: {model_path}")
else:
    print(f"   ✅ MODEL_DATA is loaded!")
    print(f"   Features: {MODEL_DATA.get('n_features')}")
    print(f"   Classes: {len(MODEL_DATA.get('classes', []))}")

print("\n" + "=" * 50)
