"""
Train AI model using the actual Mental disorder symptoms.xlsx dataset
"""

import pandas as pd
import numpy as np
import joblib
from pathlib import Path
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score, confusion_matrix
import warnings
warnings.filterwarnings('ignore')

def load_dataset():
    """Load the Mental disorder symptoms dataset"""
    dataset_path = Path(__file__).parent / 'datasets' / 'Mental disorder symptoms.xlsx'
    
    print(f"Loading dataset from: {dataset_path}")
    
    try:
        # Try reading the Excel file
        df = pd.read_excel(dataset_path)
        print(f"✓ Dataset loaded successfully!")
        print(f"  Shape: {df.shape}")
        print(f"  Columns: {len(df.columns)}")
        
        return df
    except Exception as e:
        print(f"✗ Error loading dataset: {e}")
        print("\nTrying alternative methods...")
        
        # Try with openpyxl engine
        try:
            df = pd.read_excel(dataset_path, engine='openpyxl')
            print(f"✓ Dataset loaded with openpyxl!")
            return df
        except:
            pass
        
        # Try with xlrd engine
        try:
            df = pd.read_excel(dataset_path, engine='xlrd')
            print(f"✓ Dataset loaded with xlrd!")
            return df
        except:
            pass
        
        raise Exception("Could not load dataset with any method")

def explore_dataset(df):
    """Explore and understand the dataset structure"""
    print("\n" + "="*60)
    print("DATASET EXPLORATION")
    print("="*60)
    
    print(f"\nDataset Shape: {df.shape}")
    print(f"Rows: {df.shape[0]}, Columns: {df.shape[1]}")
    
    print("\nColumn Names:")
    for i, col in enumerate(df.columns, 1):
        print(f"  {i}. {col}")
    
    print("\nFirst few rows:")
    print(df.head())
    
    print("\nData types:")
    print(df.dtypes)
    
    print("\nMissing values:")
    print(df.isnull().sum())
    
    # Check for target column (disorder/diagnosis)
    possible_target_cols = ['disorder', 'diagnosis', 'label', 'class', 'target', 'disease']
    target_col = None
    
    for col in df.columns:
        if any(keyword in col.lower() for keyword in possible_target_cols):
            target_col = col
            break
    
    if target_col:
        print(f"\n✓ Found target column: '{target_col}'")
        print(f"\nDisorder distribution:")
        print(df[target_col].value_counts())
    else:
        print("\n⚠ Could not automatically identify target column")
        print("Please specify which column contains the disorder labels")
    
    return target_col

def prepare_data(df, target_col=None):
    """Prepare data for training"""
    print("\n" + "="*60)
    print("DATA PREPARATION")
    print("="*60)
    
    # If target column not specified, try to find it
    if target_col is None:
        # Look for common target column names
        possible_names = ['disorder', 'diagnosis', 'label', 'class', 'target', 'disease', 
                         'mental_disorder', 'condition']
        
        for col in df.columns:
            if any(name in col.lower() for name in possible_names):
                target_col = col
                break
        
        # If still not found, assume last column is target
        if target_col is None:
            target_col = df.columns[-1]
            print(f"⚠ Assuming last column '{target_col}' is the target")
    
    print(f"Target column: '{target_col}'")
    
    # Separate features and target
    X = df.drop(columns=[target_col])
    y = df[target_col]
    
    print(f"\nFeatures shape: {X.shape}")
    print(f"Target shape: {y.shape}")
    
    # Handle non-numeric features
    print("\nProcessing features...")
    
    # Convert boolean/Yes-No to binary
    for col in X.columns:
        if X[col].dtype == 'object' or X[col].dtype == 'bool':
            # Try to convert Yes/No, True/False to 1/0
            X[col] = X[col].map({'Yes': 1, 'No': 0, 'yes': 1, 'no': 0, 
                                 True: 1, False: 0, 'TRUE': 1, 'FALSE': 0,
                                 'Y': 1, 'N': 0, 'y': 1, 'n': 0})
            
            # If still has NaN, try to convert to numeric
            if X[col].isnull().any():
                X[col] = pd.to_numeric(X[col], errors='coerce')
    
    # Fill any remaining NaN with 0
    X = X.fillna(0)
    
    # Ensure all features are numeric
    X = X.apply(pd.to_numeric, errors='coerce').fillna(0)
    
    print(f"✓ Features prepared: {X.shape[1]} features")
    print(f"  Feature names: {list(X.columns[:5])}... (showing first 5)")
    
    # Clean target labels
    y = y.astype(str).str.strip()
    
    print(f"\n✓ Target prepared")
    print(f"  Unique disorders: {y.nunique()}")
    print(f"  Disorders: {list(y.unique())}")
    
    return X, y, list(X.columns)

def train_model(X, y):
    """Train the Random Forest model"""
    print("\n" + "="*60)
    print("MODEL TRAINING")
    print("="*60)
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    print(f"\nTraining set: {X_train.shape[0]} samples")
    print(f"Test set: {X_test.shape[0]} samples")
    
    # Train Random Forest
    print("\nTraining Random Forest Classifier...")
    model = RandomForestClassifier(
        n_estimators=200,
        max_depth=15,
        min_samples_split=5,
        min_samples_leaf=2,
        random_state=42,
        n_jobs=-1,
        class_weight='balanced'  # Handle imbalanced classes
    )
    
    model.fit(X_train, y_train)
    print("✓ Model trained!")
    
    # Evaluate
    print("\n" + "="*60)
    print("MODEL EVALUATION")
    print("="*60)
    
    # Training accuracy
    train_pred = model.predict(X_train)
    train_accuracy = accuracy_score(y_train, train_pred)
    print(f"\nTraining Accuracy: {train_accuracy:.2%}")
    
    # Test accuracy
    y_pred = model.predict(X_test)
    test_accuracy = accuracy_score(y_test, y_pred)
    print(f"Test Accuracy: {test_accuracy:.2%}")
    
    # Classification report
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred))
    
    # Confusion matrix
    print("\nConfusion Matrix:")
    cm = confusion_matrix(y_test, y_pred)
    print(cm)
    
    # Feature importance
    print("\nTop 10 Most Important Features:")
    feature_importance = pd.DataFrame({
        'feature': X.columns,
        'importance': model.feature_importances_
    }).sort_values('importance', ascending=False)
    
    for idx, row in feature_importance.head(10).iterrows():
        print(f"  {row['feature']}: {row['importance']:.4f}")
    
    return model, test_accuracy

def save_model(model, output_path):
    """Save the trained model"""
    output_path = Path(output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    joblib.dump(model, output_path)
    print(f"\n✓ Model saved to: {output_path}")
    print(f"  File size: {output_path.stat().st_size / 1024:.2f} KB")

def test_model(model_path, feature_names):
    """Test the saved model"""
    print("\n" + "="*60)
    print("MODEL TESTING")
    print("="*60)
    
    model = joblib.load(model_path)
    
    print(f"\n✓ Model loaded successfully")
    print(f"  Classes: {list(model.classes_)}")
    print(f"  Number of features: {len(feature_names)}")
    
    # Create test cases (all zeros, all ones, random)
    test_cases = [
        {
            'name': 'No symptoms',
            'symptoms': [0] * len(feature_names)
        },
        {
            'name': 'All symptoms',
            'symptoms': [1] * len(feature_names)
        },
        {
            'name': 'Random symptoms',
            'symptoms': np.random.randint(0, 2, len(feature_names)).tolist()
        }
    ]
    
    print("\nTest Predictions:")
    for test in test_cases:
        prediction = model.predict([test['symptoms']])[0]
        probabilities = model.predict_proba([test['symptoms']])[0]
        confidence = max(probabilities)
        print(f"  {test['name']}: {prediction} (confidence: {confidence:.2%})")

def main():
    print("="*60)
    print("MENTAL HEALTH AI MODEL TRAINING")
    print("Using Real Dataset: Mental disorder symptoms.xlsx")
    print("="*60)
    
    try:
        # Load dataset
        df = load_dataset()
        
        # Explore dataset
        target_col = explore_dataset(df)
        
        # Prepare data
        X, y, feature_names = prepare_data(df, target_col)
        
        # Train model
        model, accuracy = train_model(X, y)
        
        # Save model to multiple locations
        save_locations = [
            Path(__file__).parent / 'mental_health_app' / 'ai_models' / 'mental_model.joblib',
            Path(__file__).parent / 'models' / 'mental_model.joblib',
        ]
        
        for location in save_locations:
            save_model(model, location)
        
        # Test model
        test_model(save_locations[0], feature_names)
        
        # Save feature names for reference
        feature_file = Path(__file__).parent / 'mental_health_app' / 'ai_models' / 'feature_names.txt'
        feature_file.parent.mkdir(parents=True, exist_ok=True)
        with open(feature_file, 'w') as f:
            f.write('\n'.join(feature_names))
        print(f"\n✓ Feature names saved to: {feature_file}")
        
        print("\n" + "="*60)
        print("✅ MODEL TRAINING COMPLETE!")
        print("="*60)
        print(f"\nFinal Test Accuracy: {accuracy:.2%}")
        print(f"Model saved and ready to use!")
        print("\nRestart your Django server to load the new model:")
        print("  .\.venv\Scripts\python.exe manage.py runserver")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        
        print("\n" + "="*60)
        print("TROUBLESHOOTING")
        print("="*60)
        print("\nIf you see 'No module named openpyxl', install it:")
        print("  .\.venv\Scripts\python.exe -m pip install openpyxl")
        print("\nIf you see 'No module named xlrd', install it:")
        print("  .\.venv\Scripts\python.exe -m pip install xlrd")

if __name__ == '__main__':
    main()
