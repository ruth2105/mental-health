#!/usr/bin/env python3
"""
Create a compatible AI model for mental health disorder prediction
This creates the model in the format expected by the AI code
"""

import numpy as np
import joblib
from pathlib import Path
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score

def generate_sample_data(n_samples=2000):
    """Generate synthetic training data with proper feature mapping"""
    np.random.seed(42)
    
    # Feature names matching the AI code expectations (27 symptoms + age)
    feature_columns = [
        'age',  # Age feature (first)
        'feeling.nervous', 'panic', 'breathing.rapidly', 'sweating',
        'trouble.in.concentration', 'having.trouble.in.sleeping', 'having.trouble.with.work',
        'hopelessness', 'anger', 'over.react', 'change.in.eating', 'suicidal.thought',
        'feeling.tired', 'close.friend', 'social.media.addiction', 'weight.gain',
        'introvert', 'popping.up.stressful.memory', 'having.nightmares', 'avoids.people.or.activities',
        'feeling.negative', 'trouble.concentrating', 'blamming.yourself', 'hallucinations',
        'repetitive.behaviour', 'seasonally', 'increased.energy'
    ]
    
    # Disorders to predict
    disorders = ['anxiety', 'MDD', 'PTSD', 'bipolar', 'OCD', 'Loneliness', 'Normal']
    
    X = []
    y = []
    
    for _ in range(n_samples):
        # Generate age (18-80)
        age = np.random.randint(18, 81)
        
        # Generate symptoms (0 or 1 for binary features)
        symptoms = np.random.randint(0, 2, size=27)
        
        # Create realistic patterns for different disorders
        anxiety_symptoms = symptoms[0:4].sum()  # nervous, panic, breathing, sweating
        depression_symptoms = symptoms[6:8].sum() + symptoms[11:13].sum() + symptoms[19:21].sum()  # work trouble, hopelessness, tired, negative feelings
        ptsd_symptoms = symptoms[16:19].sum()  # stressful memories, nightmares
        bipolar_symptoms = symptoms[8:10].sum() + symptoms[26]  # anger, over-react, increased energy
        ocd_symptoms = symptoms[23:25].sum()  # repetitive behavior
        social_symptoms = symptoms[13:16].sum() + symptoms[19]  # social isolation, avoids people
        
        # Determine disorder based on symptom patterns
        if anxiety_symptoms >= 3:
            disorder = 'anxiety'
        elif depression_symptoms >= 3:
            disorder = 'MDD'
        elif ptsd_symptoms >= 2:
            disorder = 'PTSD'
        elif bipolar_symptoms >= 2:
            disorder = 'bipolar'
        elif ocd_symptoms >= 1:
            disorder = 'OCD'
        elif social_symptoms >= 2:
            disorder = 'Loneliness'
        else:
            disorder = 'Normal'
        
        # Combine age and symptoms
        features = [age] + symptoms.tolist()
        
        X.append(features)
        y.append(disorder)
    
    return np.array(X), np.array(y), feature_columns

def train_model():
    """Train the Random Forest model"""
    print("Generating training data...")
    X, y, feature_columns = generate_sample_data(n_samples=3000)
    
    print(f"Generated {len(X)} samples with {len(feature_columns)} features")
    print(f"Features: {feature_columns}")
    print(f"Disorders: {np.unique(y)}")
    
    # Encode labels
    label_encoder = LabelEncoder()
    y_encoded = label_encoder.fit_transform(y)
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
    )
    
    print("Training Random Forest model...")
    model = RandomForestClassifier(
        n_estimators=200,
        max_depth=15,
        min_samples_split=5,
        min_samples_leaf=2,
        random_state=42,
        n_jobs=-1
    )
    
    model.fit(X_train, y_train)
    
    # Evaluate
    print("\nModel Evaluation:")
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"Accuracy: {accuracy:.2%}")
    
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, target_names=label_encoder.classes_))
    
    # Create model data in the format expected by AI code
    model_data = {
        'model': model,
        'label_encoder': label_encoder,
        'feature_columns': feature_columns,
        'classes': label_encoder.classes_.tolist(),
        'accuracy': accuracy,
        'n_features': len(feature_columns),
        'includes_age': True  # This model includes age as first feature
    }
    
    return model_data

def save_model(model_data, output_path):
    """Save the trained model"""
    output_path = Path(output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    joblib.dump(model_data, output_path)
    print(f"\nModel saved to: {output_path}")
    print(f"File size: {output_path.stat().st_size / 1024:.2f} KB")

def test_model(model_path):
    """Test the saved model"""
    print("\nTesting saved model...")
    model_data = joblib.load(model_path)
    model = model_data['model']
    label_encoder = model_data['label_encoder']
    feature_columns = model_data['feature_columns']
    
    test_cases = [
        {
            'name': 'High Anxiety (25 year old)',
            'features': [25, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        },
        {
            'name': 'Depression (30 year old)',
            'features': [30, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0]
        },
        {
            'name': 'Normal (22 year old)',
            'features': [22, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        }
    ]
    
    for test in test_cases:
        prediction_idx = model.predict([test['features']])[0]
        probabilities = model.predict_proba([test['features']])[0]
        confidence = max(probabilities)
        disorder = label_encoder.inverse_transform([prediction_idx])[0]
        print(f"  {test['name']}: {disorder} (confidence: {confidence:.2%})")

if __name__ == '__main__':
    print("=" * 60)
    print("Mental Health AI Model Training (Compatible Format)")
    print("=" * 60)
    
    model_data = train_model()
    
    # Save to the location expected by AI code
    model_path = Path(__file__).parent / 'models' / 'mental_model.joblib'
    save_model(model_data, model_path)
    
    test_model(model_path)
    
    print("\n" + "=" * 60)
    print("Compatible model training complete!")
    print("The model is now ready for use by the AI prediction system.")
    print("=" * 60)