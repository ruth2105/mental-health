"""
Create a simple AI model for mental health disorder prediction using scikit-learn
This is faster and simpler than CatBoost for development
"""

import numpy as np
import joblib
from pathlib import Path
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score

# Define the disorders we want to predict
DISORDERS = ['Anxiety', 'Depression', 'Stress', 'Bipolar Disorder', 'Normal']

def generate_sample_data(n_samples=1000):
    """Generate synthetic training data"""
    np.random.seed(42)
    
    X = []
    y = []
    
    for _ in range(n_samples):
        symptoms = np.random.randint(0, 2, size=29)
        
        # Create patterns for different disorders
        anxiety_score = symptoms[7:15].sum()
        depression_score = symptoms[0:7].sum() + symptoms[20:27].sum()
        stress_score = symptoms[26:29].sum()
        bipolar_score = symptoms[14:21].sum()
        
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
    """Train the Random Forest model"""
    print("Generating training data...")
    X, y = generate_sample_data(n_samples=2000)
    
    print(f"Generated {len(X)} samples")
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    print("Training Random Forest model...")
    model = RandomForestClassifier(
        n_estimators=100,
        max_depth=10,
        random_state=42,
        n_jobs=-1
    )
    
    model.fit(X_train, y_train)
    
    # Evaluate
    print("\nModel Evaluation:")
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"Accuracy: {accuracy:.2%}")
    
    return model

def save_model(model, output_path):
    """Save the trained model"""
    output_path = Path(output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    joblib.dump(model, output_path)
    print(f"\nModel saved to: {output_path}")
    print(f"File size: {output_path.stat().st_size / 1024:.2f} KB")

def test_model(model_path):
    """Test the saved model"""
    print("\nTesting saved model...")
    model = joblib.load(model_path)
    
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
        probabilities = model.predict_proba([test['symptoms']])[0]
        confidence = max(probabilities)
        print(f"  {test['name']}: {prediction} (confidence: {confidence:.2%})")

if __name__ == '__main__':
    print("=" * 60)
    print("Mental Health AI Model Training (Random Forest)")
    print("=" * 60)
    
    model = train_model()
    
    save_locations = [
        Path(__file__).parent / 'mental_health_app' / 'ai_models' / 'mental_model.joblib',
        Path(__file__).parent / 'models' / 'mental_model.joblib',
    ]
    
    for location in save_locations:
        save_model(model, location)
    
    test_model(save_locations[0])
    
    print("\n" + "=" * 60)
    print("Model training complete!")
    print("=" * 60)
