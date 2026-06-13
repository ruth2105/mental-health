"""
Create a CatBoost AI model for mental health disorder prediction
This script trains a model on sample data and saves it as mental_model.joblib
"""

import numpy as np
import joblib
from pathlib import Path
from catboost import CatBoostClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score

# Define the disorders we want to predict
DISORDERS = ['Anxiety', 'Depression', 'Stress', 'Bipolar Disorder', 'Normal']

def generate_sample_data(n_samples=1000):
    """
    Generate synthetic training data for mental health prediction
    29 features (symptoms) -> 1 label (disorder)
    """
    np.random.seed(42)
    
    X = []
    y = []
    
    for _ in range(n_samples):
        # Generate random symptoms (0 or 1 for each of 29 questions)
        symptoms = np.random.randint(0, 2, size=29)
        
        # Create patterns for different disorders
        anxiety_score = symptoms[7:15].sum()  # Questions 8-15 are anxiety-related
        depression_score = symptoms[0:7].sum() + symptoms[20:27].sum()  # Depression questions
        stress_score = symptoms[26:29].sum()  # Stress questions
        bipolar_score = symptoms[14:21].sum()  # Bipolar questions
        
        # Determine disorder based on scores
        if anxiety_score >= 5:
            disorder = 'Anxiety'
        elif depression_score >= 7:
            disorder = 'Depression'
        elif bipolar_score >= 5:
            disorder = 'Bipolar Disorder'
        elif stress_score >= 2:
            disorder = 'Stress'
        else:
            disorder = 'Normal'
        
        X.append(symptoms)
        y.append(disorder)
    
    return np.array(X), np.array(y)

def train_model():
    """Train the CatBoost model"""
    print("🔄 Generating training data...")
    X, y = generate_sample_data(n_samples=2000)
    
    print(f"✓ Generated {len(X)} samples")
    print(f"  Disorders distribution:")
    unique, counts = np.unique(y, return_counts=True)
    for disorder, count in zip(unique, counts):
        print(f"    - {disorder}: {count}")
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    print("\n🔄 Training CatBoost model...")
    model = CatBoostClassifier(
        iterations=100,
        learning_rate=0.1,
        depth=6,
        loss_function='MultiClass',
        verbose=False,
        random_seed=42
    )
    
    model.fit(X_train, y_train)
    
    # Evaluate
    print("\n📊 Model Evaluation:")
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"  Accuracy: {accuracy:.2%}")
    
    print("\n  Classification Report:")
    print(classification_report(y_test, y_pred))
    
    return model

def save_model(model, output_path):
    """Save the trained model"""
    output_path = Path(output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    joblib.dump(model, output_path)
    print(f"\n✅ Model saved to: {output_path}")
    print(f"   File size: {output_path.stat().st_size / 1024:.2f} KB")

def test_model(model_path):
    """Test the saved model"""
    print("\n🧪 Testing saved model...")
    model = joblib.load(model_path)
    
    # Test with sample symptoms
    test_cases = [
        {
            'name': 'High Anxiety',
            'symptoms': [0, 0, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        },
        {
            'name': 'Depression',
            'symptoms': [1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0]
        },
        {
            'name': 'Normal',
            'symptoms': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        }
    ]
    
    for test in test_cases:
        prediction = model.predict([test['symptoms']])[0]
        if hasattr(model, 'predict_proba'):
            probabilities = model.predict_proba([test['symptoms']])[0]
            confidence = max(probabilities)
            print(f"  {test['name']}: {prediction} (confidence: {confidence:.2%})")
        else:
            print(f"  {test['name']}: {prediction}")

if __name__ == '__main__':
    print("=" * 60)
    print("Mental Health AI Model Training")
    print("=" * 60)
    
    # Train model
    model = train_model()
    
    # Save to multiple locations
    save_locations = [
        Path(__file__).parent / 'mental_health_app' / 'ai_models' / 'mental_model.joblib',
        Path(__file__).parent / 'models' / 'mental_model.joblib',
    ]
    
    for location in save_locations:
        save_model(model, location)
    
    # Test the model
    test_model(save_locations[0])
    
    print("\n" + "=" * 60)
    print("✅ Model training complete!")
    print("=" * 60)
    print("\nThe model is now ready to use in your Django app.")
    print("Restart your Django server to load the new model.")
