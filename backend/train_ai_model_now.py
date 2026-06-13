"""
Simple script to train AI model from Mental disorder symptoms.xlsx
"""
import pandas as pd
import joblib
from pathlib import Path
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import warnings
warnings.filterwarnings('ignore')

print("="*70)
print("TRAINING MENTAL HEALTH AI MODEL")
print("="*70)

# Load dataset
dataset_path = Path(__file__).parent / 'datasets' / 'Mental disorder symptoms.xlsx'
print(f"\n1. Loading dataset from: {dataset_path}")

try:
    df = pd.read_excel(dataset_path, engine='openpyxl')
    print(f"   ✅ Dataset loaded! Shape: {df.shape}")
except Exception as e:
    print(f"   ❌ Error: {e}")
    exit(1)

# Show dataset info
print(f"\n2. Dataset Information:")
print(f"   Rows: {df.shape[0]}")
print(f"   Columns: {df.shape[1]}")
print(f"   Column names: {list(df.columns[:5])}... (showing first 5)")

# Find target column
target_col = None
for col in df.columns:
    if any(keyword in col.lower() for keyword in ['disorder', 'diagnosis', 'label', 'class']):
        target_col = col
        break

if target_col is None:
    target_col = df.columns[-1]
    print(f"   ⚠️  Assuming last column '{target_col}' is target")
else:
    print(f"   ✅ Found target column: '{target_col}'")

# Prepare data
print(f"\n3. Preparing data...")
X = df.drop(columns=[target_col])
y = df[target_col]

# Convert features to numeric
for col in X.columns:
    if X[col].dtype == 'object' or X[col].dtype == 'bool':
        X[col] = X[col].map({'Yes': 1, 'No': 0, 'yes': 1, 'no': 0, 
                             True: 1, False: 0, 'Y': 1, 'N': 0})
        X[col] = pd.to_numeric(X[col], errors='coerce')

X = X.fillna(0)
X = X.apply(pd.to_numeric, errors='coerce').fillna(0)

print(f"   ✅ Features: {X.shape[1]} columns")
print(f"   ✅ Target: {y.nunique()} unique disorders")
print(f"   Disorders: {list(y.unique())}")

# Split data
print(f"\n4. Splitting data...")
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)
print(f"   Training: {X_train.shape[0]} samples")
print(f"   Testing: {X_test.shape[0]} samples")

# Train model
print(f"\n5. Training Random Forest model...")
model = RandomForestClassifier(
    n_estimators=200,
    max_depth=15,
    min_samples_split=5,
    min_samples_leaf=2,
    random_state=42,
    n_jobs=-1,
    class_weight='balanced'
)

model.fit(X_train, y_train)
print(f"   ✅ Model trained!")

# Evaluate
print(f"\n6. Evaluating model...")
train_pred = model.predict(X_train)
test_pred = model.predict(X_test)

train_acc = accuracy_score(y_train, train_pred)
test_acc = accuracy_score(y_test, test_pred)

print(f"   Training Accuracy: {train_acc:.2%}")
print(f"   Test Accuracy: {test_acc:.2%}")

# Save model
print(f"\n7. Saving model...")
model_dir = Path(__file__).parent / 'models'
model_dir.mkdir(exist_ok=True)
model_path = model_dir / 'mental_model.joblib'

joblib.dump(model, model_path)
print(f"   ✅ Model saved to: {model_path}")
print(f"   File size: {model_path.stat().st_size / 1024:.2f} KB")

# Save feature names
feature_file = model_dir / 'feature_names.txt'
with open(feature_file, 'w') as f:
    f.write('\n'.join(X.columns))
print(f"   ✅ Feature names saved to: {feature_file}")

# Test model
print(f"\n8. Testing model...")
loaded_model = joblib.load(model_path)
print(f"   ✅ Model loaded successfully")
print(f"   Classes: {list(loaded_model.classes_)}")

print("\n" + "="*70)
print("✅ MODEL TRAINING COMPLETE!")
print("="*70)
print(f"\nFinal Accuracy: {test_acc:.2%}")
print(f"Model Location: {model_path}")
print(f"\nThe AI model is now ready to use!")
print("Restart your Django server to load the new model.")
print("="*70)
