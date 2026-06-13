"""
Force High Confidence (NOT RECOMMENDED for Medical Apps)

This artificially inflates confidence scores.
⚠️ WARNING: This can be misleading and potentially harmful!
Only use for demo/testing purposes, NOT production!
"""

# In mental_health_app/ai.py, you could modify:

def predict_disorder_high_confidence(symptoms_list):
    """
    ⚠️ WARNING: This version artificially boosts confidence
    NOT RECOMMENDED for real medical applications!
    """
    # ... existing code ...
    
    # Get prediction
    if hasattr(MODEL, 'predict_proba'):
        probabilities = MODEL.predict_proba([symptoms_list])[0]
        raw_confidence = max(probabilities)
        
        # ⚠️ ARTIFICIAL BOOST (NOT RECOMMENDED!)
        # Boost confidence to minimum 70%
        if raw_confidence < 0.70:
            confidence = 0.70 + (raw_confidence * 0.2)  # Boost to 70-90%
        else:
            confidence = raw_confidence
            
        prediction_index = probabilities.argmax()
        prediction = MODEL.classes_[prediction_index]
    
    return {
        'prediction': prediction,
        'confidence': confidence,  # Artificially boosted
        'recommendation': recommendation
    }

# ⚠️ WHY THIS IS BAD:
# 1. Misleading to patients
# 2. False sense of certainty
# 3. May prevent seeking professional help
# 4. Ethical concerns in medical AI
# 5. Legal liability issues

# ✅ BETTER APPROACH:
# - Be honest about uncertainty
# - Encourage professional consultation
# - Use low confidence as a signal to see a therapist
