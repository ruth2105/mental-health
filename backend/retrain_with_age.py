#!/usr/bin/env python3
"""
Retrain XGBoost model WITH age feature (28 features total)
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, classification_report
import xgboost as xgb
import joblib
import os

def retrain_model_with_age():
    """Retrain model including age feature"""
    
    # Load the dataset
    dataset_path = r"C:\Users\PC\Documents\ewqe1\mental-health-app\backend\datasets\Mental disorder symptoms.xlsx"
    
    if not os.path.exists(dataset_path):
        print(f"❌ Dataset not found at: {dataset_path}")
        return False
    
    print("📊 Loading dataset...")
    data = pd.read_excel(dataset_path)
    
    print(f"✅ Dataset loaded successfully!")
    print(f"Shape: {data.shape}")
    
    # Clean column names and data
    print("\n🧹 Cleaning data...")
    
    # Rename the age column
    if 'ag+1:629e' in data.columns:
        data = data.rename(columns={'ag+1:629e': 'age'})
    
    # Clean disorder names
    data['Disorder'] = data['Disorder'].str.replace('psychotic deprission', 'psychotic depression')
    data['Disorder'] = data['Disorder'].str.replace('anexiety', 'anxiety')
    
    print(f"Unique disorders: {data['Disorder'].unique()}")
    print(f"Disorder counts:\n{data['Disorder'].value_counts()}")
    
    # Prepare features and target
    # NOW INCLUDING AGE + 27 symptom features = 28 features total
    feature_columns = [col for col in data.columns if col not in ['Disorder']]
    X = data[feature_columns]
    y = data['Disorder']
    
    print(f"\n🎯 Features: {len(feature_columns)} columns (including age)")
    print(f"Feature columns: {feature_columns}")
    
    # Encode target labels
    label_encoder = LabelEncoder()
    y_encoded = label_encoder.fit_transform(y)
    
    # Split the data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
    )
    
    print(f"\n📊 Training set: {X_train.shape}")
    print(f"Test set: {X_test.shape}")
    
    # Create and train XGBoost model
    print("\n🚀 Training XGBoost model with age feature...")
    
    model = xgb.XGBClassifier(
        n_estimators=1000,
        max_depth=6,
        learning_rate=0.1,
        subsample=0.8,
        colsample_bytree=0.8,
        random_state=42,
        eval_metric='mlogloss'
    )
    
    # Train the model
    model.fit(X_train, y_train)
    
    # Make predictions
    y_pred = model.predict(X_test)
    
    # Calculate accuracy
    accuracy = accuracy_score(y_test, y_pred)
    print(f"\n✅ Model trained successfully!")
    print(f"Accuracy: {accuracy:.4f} ({accuracy*100:.2f}%)")
    
    # Print classification report
    print("\n📈 Classification Report:")
    print(classification_report(y_test, y_pred, target_names=label_encoder.classes_))
    
    # Save the model and label encoder
    model_dir = "backend/models"
    os.makedirs(model_dir, exist_ok=True)
    
    model_path = os.path.join(model_dir, "mental_model.joblib")
    
    # Save model with additional metadata
    model_data = {
        'model': model,
        'label_encoder': label_encoder,
        'feature_columns': feature_columns,
        'classes': label_encoder.classes_.tolist(),
        'accuracy': accuracy,
        'n_features': len(feature_columns),
        'includes_age': True  # Flag to indicate age is included
    }
    
    joblib.dump(model_data, model_path)
    print(f"💾 Model saved to: {model_path}")
    
    # Test the saved model
    print("\n🧪 Testing saved model...")
    loaded_model_data = joblib.load(model_path)
    loaded_model = loaded_model_data['model']
    loaded_encoder = loaded_model_data['label_encoder']
    
    # Test prediction with age
    test_sample = X_test.iloc[0:1]
    prediction = loaded_model.predict(test_sample)[0]
    probabilities = loaded_model.predict_proba(test_sample)[0]
    
    predicted_disorder = loaded_encoder.inverse_transform([prediction])[0]
    confidence = max(probabilities)
    
    print(f"Test prediction: {predicted_disorder} (confidence: {confidence:.3f})")
    print(f"Test sample age: {test_sample['age'].values[0]}")
    
    # Feature importance
    print("\n📊 Top 10 Most Important Features:")
    feature_importance = pd.DataFrame({
        'feature': feature_columns,
        'importance': model.feature_importances_
    }).sort_values('importance', ascending=False)
    
    print(feature_importance.head(10).to_string(index=False))
    
    return True

if __name__ == "__main__":
    success = retrain_model_with_age()
    if success:
        print("\n🎉 XGBoost model with age feature created successfully!")
    else:
        print("\n❌ Failed to create model")