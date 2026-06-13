"""
Train AI model with XGBoost to prevent overfitting
Compares Random Forest vs XGBoost performance
"""
import pandas as pd
import joblib
from pathlib import Path
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import accuracy_score, classification_report
import warnings
warnings.filterwarnings('ignore')

print("="*70)
print("CHECKING FOR OVERFITTING & TRAINING WITH XGBOOST")
print("="*70)

# Load dataset
dataset_path = Path(__file__).parent / 'datasets' / 'Mental disorder symptoms.xlsx'
print(f"\n1. Loading dataset...")
df = pd.read_excel(dataset_path, engine='openpyxl')
print(f"   ✅ Dataset loaded! Shape: {df.shape}")

# Find target column
target_col = None
for col in df.columns:
    if any(keyword in col.lower() for keyword in ['disorder', 'diagnosis', 'label']):
        target_col = col
        break
if target_col is None:
    target_col = df.columns[-1]

# Prepare data
print(f"\n2. Preparing data...")
X = df.drop(columns=[target_col])
y = df[target_col]

# Convert to numeric
for col in X.columns:
    if X[col].dtype == 'object' or X[col].dtype == 'bool':
        X[col] = X[col].map({'Yes': 1, 'No': 0, 'yes': 1, 'no': 0, 
                             True: 1, False: 0, 'Y': 1, 'N': 0})
        X[col] = pd.to_numeric(X[col], errors='coerce')
X = X.fillna(0)
X = X.apply(pd.to_numeric, errors='coerce').fillna(0)

print(f"   ✅ Features: {X.shape[1]}, Target: {y.nunique()} disorders")

# Split data
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

print("\n" + "="*70)
print("TESTING FOR OVERFITTING")
print("="*70)

# Test Random Forest (current model)
print("\n📊 Random Forest Performance:")
rf_model = RandomForestClassifier(
    n_estimators=200,
    max_depth=15,
    min_samples_split=5,
    min_samples_leaf=2,
    random_state=42,
    n_jobs=-1,
    class_weight='balanced'
)

rf_model.fit(X_train, y_train)
rf_train_acc = accuracy_score(y_train, rf_model.predict(X_train))
rf_test_acc = accuracy_score(y_test, rf_model.predict(X_test))
rf_diff = rf_train_acc - rf_test_acc

print(f"   Training Accuracy: {rf_train_acc:.2%}")
print(f"   Test Accuracy: {rf_test_acc:.2%}")
print(f"   Difference: {rf_diff:.2%}")

if rf_diff > 0.05:  # More than 5% difference
    print(f"   ⚠️  OVERFITTING DETECTED! (difference > 5%)")
else:
    print(f"   ✅ No significant overfitting (difference < 5%)")

# Cross-validation for Random Forest
print(f"\n   Cross-Validation (5-fold):")
rf_cv_scores = cross_val_score(rf_model, X, y, cv=5, scoring='accuracy')
print(f"   CV Scores: {[f'{s:.2%}' for s in rf_cv_scores]}")
print(f"   Mean CV Accuracy: {rf_cv_scores.mean():.2%} (+/- {rf_cv_scores.std():.2%})")

# Try XGBoost
print("\n" + "="*70)
print("TRAINING WITH XGBOOST")
print("="*70)

try:
    import xgboost as xgb
    print("\n✅ XGBoost is installed")
except ImportError:
    print("\n⚠️  XGBoost not installed. Installing now...")
    import subprocess
    subprocess.check_call(['pip', 'install', 'xgboost'])
    import xgboost as xgb
    print("✅ XGBoost installed successfully!")

print("\n📊 XGBoost Performance:")

# Train XGBoost
xgb_model = xgb.XGBClassifier(
    n_estimators=200,
    max_depth=6,  # Shallower than RF to prevent overfitting
    learning_rate=0.1,
    subsample=0.8,  # Use 80% of data per tree
    colsample_bytree=0.8,  # Use 80% of features per tree
    random_state=42,
    n_jobs=-1,
    eval_metric='mlogloss'
)

xgb_model.fit(X_train, y_train)
xgb_train_acc = accuracy_score(y_train, xgb_model.predict(X_train))
xgb_test_acc = accuracy_score(y_test, xgb_model.predict(X_test))
xgb_diff = xgb_train_acc - xgb_test_acc

print(f"   Training Accuracy: {xgb_train_acc:.2%}")
print(f"   Test Accuracy: {xgb_test_acc:.2%}")
print(f"   Difference: {xgb_diff:.2%}")

if xgb_diff > 0.05:
    print(f"   ⚠️  OVERFITTING DETECTED! (difference > 5%)")
else:
    print(f"   ✅ No significant overfitting (difference < 5%)")

# Cross-validation for XGBoost
print(f"\n   Cross-Validation (5-fold):")
xgb_cv_scores = cross_val_score(xgb_model, X, y, cv=5, scoring='accuracy')
print(f"   CV Scores: {[f'{s:.2%}' for s in xgb_cv_scores]}")
print(f"   Mean CV Accuracy: {xgb_cv_scores.mean():.2%} (+/- {xgb_cv_scores.std():.2%})")

# Comparison
print("\n" + "="*70)
print("MODEL COMPARISON")
print("="*70)

print(f"\n{'Metric':<25} {'Random Forest':<20} {'XGBoost':<20}")
print("-" * 70)
print(f"{'Training Accuracy':<25} {rf_train_acc:<20.2%} {xgb_train_acc:<20.2%}")
print(f"{'Test Accuracy':<25} {rf_test_acc:<20.2%} {xgb_test_acc:<20.2%}")
print(f"{'Overfitting Gap':<25} {rf_diff:<20.2%} {xgb_diff:<20.2%}")
print(f"{'CV Mean Accuracy':<25} {rf_cv_scores.mean():<20.2%} {xgb_cv_scores.mean():<20.2%}")
print(f"{'CV Std Dev':<25} {rf_cv_scores.std():<20.2%} {xgb_cv_scores.std():<20.2%}")

# Determine best model
print("\n" + "="*70)
print("RECOMMENDATION")
print("="*70)

# Choose model with better generalization (lower overfitting + good test accuracy)
rf_score = rf_test_acc - (rf_diff * 0.5)  # Penalize overfitting
xgb_score = xgb_test_acc - (xgb_diff * 0.5)

if xgb_score > rf_score:
    best_model = xgb_model
    best_name = "XGBoost"
    best_acc = xgb_test_acc
    print(f"\n✅ RECOMMENDED: XGBoost")
    print(f"   Reason: Better generalization (less overfitting)")
    print(f"   Test Accuracy: {xgb_test_acc:.2%}")
    print(f"   Overfitting Gap: {xgb_diff:.2%}")
else:
    best_model = rf_model
    best_name = "Random Forest"
    best_acc = rf_test_acc
    print(f"\n✅ RECOMMENDED: Random Forest")
    print(f"   Reason: Better overall performance")
    print(f"   Test Accuracy: {rf_test_acc:.2%}")
    print(f"   Overfitting Gap: {rf_diff:.2%}")

# Save best model
print("\n" + "="*70)
print("SAVING BEST MODEL")
print("="*70)

model_dir = Path(__file__).parent / 'models'
model_path = model_dir / 'mental_model.joblib'

joblib.dump(best_model, model_path)
print(f"\n✅ {best_name} model saved to: {model_path}")
print(f"   File size: {model_path.stat().st_size / 1024:.2f} KB")

# Save model info
info_file = model_dir / 'model_info.txt'
with open(info_file, 'w') as f:
    f.write(f"Model Type: {best_name}\n")
    f.write(f"Test Accuracy: {best_acc:.2%}\n")
    f.write(f"Training Date: 2025-12-03\n")
    f.write(f"Overfitting Check: {'PASS' if (xgb_diff if best_name == 'XGBoost' else rf_diff) < 0.05 else 'WARNING'}\n")
print(f"✅ Model info saved to: {info_file}")

# Detailed classification report
print("\n" + "="*70)
print("DETAILED PERFORMANCE")
print("="*70)
print(f"\nClassification Report for {best_name}:")
print(classification_report(y_test, best_model.predict(X_test)))

print("\n" + "="*70)
print("✅ TRAINING COMPLETE!")
print("="*70)
print(f"\nBest Model: {best_name}")
print(f"Test Accuracy: {best_acc:.2%}")
print(f"Overfitting: {'Minimal' if (xgb_diff if best_name == 'XGBoost' else rf_diff) < 0.05 else 'Detected'}")
print(f"\nRestart Django server to use the new model!")
print("="*70)
