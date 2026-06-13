#!/usr/bin/env python3
"""
Analyze why AI confidence is low
"""

import joblib
import pandas as pd
import numpy as np

def analyze_confidence():
    """Analyze confidence levels for different input patterns"""
    
    print("🔍 Analyzing AI Confidence Levels")
    print("=" * 50)
    
    # Load the model
    model_path = "backend/models/mental_model.joblib"
    model_data = joblib.load(model_path)
    
    model = model_data['model']
    label_encoder = model_data['label_encoder']
    feature_columns = model_data['feature_columns']
    
    print(f"✅ Model loaded")
    print(f"Classes: {model_data['classes']}")
    
    # Test different scenarios
    scenarios = [
        {
            'name': 'All zeros (no symptoms)',
            'responses': [0] * 19
        },
        {
            'name': 'All low (1s)',
            'responses': [1] * 19
        },
        {
            'name': 'All moderate (2s)',
            'responses': [2] * 19
        },
        {
            'name': 'All high (3s)',
            'responses': [3] * 19
        },
        {
            'name': 'Strong anxiety pattern',
            'responses': [0, 0, 1, 1, 0, 0, 1, 3, 3, 3, 3, 2, 3, 0, 2, 2, 0, 1, 2]
        },
        {
            'name': 'Strong depression pattern',
            'responses': [3, 3, 3, 3, 2, 3, 2, 1, 1, 1, 1, 1, 1, 2, 3, 0, 3, 2, 3]
        },
        {
            'name': 'Mixed symptoms',
            'responses': [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2]
        }
    ]
    
    def map_questionnaire_to_features(questionnaire_responses):
        """Convert 19 questionnaire responses to 27 model features"""
        mapping = {
            0: [7, 20], 1: [7, 20], 2: [5], 3: [12], 4: [10],
            5: [22, 20], 6: [4, 21], 7: [0], 8: [0, 1], 9: [0],
            10: [0], 11: [8, 9], 12: [1], 13: [11], 14: [7, 6],
            15: [1], 16: [7, 19], 17: [9, 26], 18: [6]
        }
        
        features = [0] * 27
        
        for q_idx, response in enumerate(questionnaire_responses):
            if q_idx in mapping:
                # Lower threshold: 1+ becomes 1 (includes "several days")
                binary_response = 1 if response >= 1 else 0
                for feature_idx in mapping[q_idx]:
                    features[feature_idx] = max(features[feature_idx], binary_response)
        
        # Derived features
        if features[0] or features[1]:
            features[2] = 1
            features[3] = 1
        
        features[13] = 0 if features[19] else 1
        
        if features[19]:
            features[14] = 1
            features[16] = 1
        
        if features[10]:
            features[15] = 1
        
        if features[1] or features[0]:
            features[17] = 1
        
        if features[5] or features[17]:
            features[18] = 1
        
        if features[11] and features[7]:
            features[23] = 1
        
        if features[0] and features[4]:
            features[24] = 1
        
        features[25] = 0
        
        return features
    
    for scenario in scenarios:
        print(f"\n📊 Scenario: {scenario['name']}")
        print(f"Questionnaire: {scenario['responses']}")
        
        # Convert to model features
        model_features = map_questionnaire_to_features(scenario['responses'])
        active_count = sum(model_features)
        print(f"Active features: {active_count}/27")
        
        # Create DataFrame for prediction
        symptoms_df = pd.DataFrame([model_features], columns=feature_columns)
        
        # Get prediction and probabilities
        probabilities = model.predict_proba(symptoms_df)[0]
        confidence = max(probabilities)
        prediction_index = probabilities.argmax()
        prediction = label_encoder.inverse_transform([prediction_index])[0]
        
        print(f"🎯 Prediction: {prediction}")
        print(f"🎯 Confidence: {confidence:.3f} ({confidence*100:.1f}%)")
        
        # Show top 3 predictions
        top_3_indices = probabilities.argsort()[-3:][::-1]
        print("📈 Top 3 predictions:")
        for i, idx in enumerate(top_3_indices, 1):
            disorder = label_encoder.inverse_transform([idx])[0]
            prob = probabilities[idx]
            print(f"  {i}. {disorder}: {prob:.3f} ({prob*100:.1f}%)")
    
    print("\n" + "=" * 50)
    print("💡 Analysis:")
    print("- Low confidence often occurs with:")
    print("  1. All zeros (no clear symptoms)")
    print("  2. Mixed/ambiguous symptom patterns")
    print("  3. Symptoms that match multiple disorders")
    print("- High confidence occurs with:")
    print("  1. Clear, distinct symptom patterns")
    print("  2. Strong indicators of specific disorders")
    print("  3. Consistent symptom profiles")

if __name__ == "__main__":
    analyze_confidence()