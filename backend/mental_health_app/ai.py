import logging
from pathlib import Path
from django.conf import settings
from .translations import get_disorder_translation, DISORDER_TRANSLATIONS

logger = logging.getLogger(__name__)

MODEL_DATA = None

# Candidate locations to look for the model
CANDIDATES = [
    Path(settings.BASE_DIR) / 'models' / 'mental_model.joblib',
    Path(settings.BASE_DIR) / 'backend' / 'models' / 'mental_model.joblib',
    Path(__file__).resolve().parent.parent / 'models' / 'mental_model.joblib',
]

for p in CANDIDATES:
    try:
        if p.exists() and p.stat().st_size > 0:
            import joblib
            MODEL_DATA = joblib.load(p)
            logger.info("Loaded mental model from %s", p)
            logger.info("Model features: %d", MODEL_DATA.get('n_features', 'unknown'))
            logger.info("Model classes: %s", MODEL_DATA.get('classes', 'unknown'))
            break
    except Exception:
        logger.exception("Failed to load model from %s", p)
        MODEL_DATA = None

if MODEL_DATA is None:
    logger.warning("mental_model.joblib not found or failed to load.")

def reload_model():
    """
    Attempt to reload the model if it wasn't loaded initially.
    Returns True if successful, False otherwise.
    """
    global MODEL_DATA
    
    if MODEL_DATA is not None:
        return True  # Already loaded
    
    logger.info("Attempting to reload model...")
    
    for p in CANDIDATES:
        try:
            if p.exists() and p.stat().st_size > 0:
                import joblib
                MODEL_DATA = joblib.load(p)
                logger.info("Successfully reloaded mental model from %s", p)
                logger.info("Model features: %d", MODEL_DATA.get('n_features', 'unknown'))
                logger.info("Model classes: %s", MODEL_DATA.get('classes', 'unknown'))
                return True
        except Exception as e:
            logger.exception("Failed to reload model from %s: %s", p, e)
    
    logger.error("Failed to reload model from any candidate location")
    return False

def translate_disorder_name(disorder_name, target_language='en'):
    """
    Translate disorder name from any language to target language
    """
    # First, find the English equivalent of the disorder
    english_name = None
    
    # Check if it's already in English
    if disorder_name in DISORDER_TRANSLATIONS['en'].values():
        english_name = disorder_name
    else:
        # Search through all languages to find the English equivalent
        for lang, translations in DISORDER_TRANSLATIONS.items():
            for eng_key, translated_name in translations.items():
                if translated_name == disorder_name:
                    english_name = eng_key
                    break
            if english_name:
                break
    
    # If we found the English name, translate to target language
    if english_name:
        return get_disorder_translation(english_name, target_language)
    
    # If not found, return original
    return disorder_name

def map_questionnaire_to_features(questionnaire_responses):
    """
    Convert 19 questionnaire responses to 27 model features
    
    Args:
        questionnaire_responses: List of 19 integers (0-3 scale)
            0 = Not at all
            1 = Several days
            2 = More than half the days
            3 = Nearly every day
    
    Returns:
        List of 27 integers for model input
    """
    # Mapping from questionnaire index to model feature indices
    mapping = {
        0: [7, 20],   # Q0: "felt little interest" -> hopelessness, feeling.negative
        1: [7, 20],   # Q1: "feeling down, depressed" -> hopelessness, feeling.negative
        2: [5],       # Q2: "trouble sleeping" -> having.trouble.in.sleeping
        3: [12],      # Q3: "felt tired" -> feeling.tired
        4: [10],      # Q4: "appetite changes" -> change.in.eating
        5: [22, 20],  # Q5: "felt bad about yourself" -> blamming.yourself, feeling.negative
        6: [4, 21],   # Q6: "trouble concentrating" -> trouble.in.concentration, trouble.concentrating
        7: [0],       # Q7: "feeling nervous" -> feeling.nervous
        8: [0, 1],    # Q8: "can't stop worrying" -> feeling.nervous, panic
        9: [0],       # Q9: "worrying too much" -> feeling.nervous
        10: [0],      # Q10: "trouble relaxing" -> feeling.nervous
        11: [8, 9],   # Q11: "easily annoyed" -> anger, over.react
        12: [1],      # Q12: "felt afraid" -> panic
        13: [11],     # Q13: "thoughts of death" -> suicidal.thought
        14: [7, 6],   # Q14: "feel overwhelmed" -> hopelessness, having.trouble.with.work
        15: [1],      # Q15: "feeling jumpy" -> panic
        16: [7, 19],  # Q16: "lost interest in activities" -> hopelessness, avoids.people.or.activities
        17: [9, 26],  # Q17: "mood swings" -> over.react, increased.energy
        18: [6]       # Q18: "difficult daily responsibilities" -> having.trouble.with.work
    }
    
    # Initialize all features to 0
    features = [0] * 27
    
    # Map questionnaire responses to features with improved threshold
    # Use threshold of 1+ (several days or more) instead of 2+ for better sensitivity
    for q_idx, response in enumerate(questionnaire_responses):
        if q_idx in mapping:
            # Lower threshold: 1+ becomes 1 (includes "several days")
            # This captures more symptoms and improves confidence
            binary_response = 1 if response >= 1 else 0
            
            # Set corresponding model features
            for feature_idx in mapping[q_idx]:
                # Use max to avoid overwriting higher values
                features[feature_idx] = max(features[feature_idx], binary_response)
    
    # Set derived features based on patterns
    # breathing.rapidly (index 2) - related to panic/anxiety
    if features[0] or features[1]:
        features[2] = 1
    
    # sweating (index 3) - related to anxiety
    if features[0] or features[1]:
        features[3] = 1
    
    # close.friend (index 13) - inverse of social isolation
    features[13] = 0 if features[19] else 1
    
    # social.media.addiction (index 14) - related to avoidance
    if features[19]:
        features[14] = 1
    
    # weight.gain (index 15) - related to eating changes
    if features[10]:
        features[15] = 1
    
    # introvert (index 16) - related to social avoidance
    if features[19]:
        features[16] = 1
    
    # popping.up.stressful.memory (index 17) - related to anxiety/trauma
    if features[1] or features[0]:
        features[17] = 1
    
    # having.nightmares (index 18) - related to sleep issues and trauma
    if features[5] or features[17]:
        features[18] = 1
    
    # hallucinations (index 23) - severe symptoms
    if features[11] and features[7]:
        features[23] = 1
    
    # repetitive.behaviour (index 24) - related to anxiety/OCD patterns
    if features[0] and features[4]:
        features[24] = 1
    
    # seasonally (index 25) - seasonal patterns (default to 0)
    features[25] = 0
    
    return features

def predict_disorder(symptoms_list, user_language='en', age=None):
    """
    symptoms_list: list or list-like of questionnaire responses (19 questions expected)
    user_language: preferred language for the response ('en', 'amharic', etc.)
    age: user's age (optional, defaults to 25 if not provided)
    returns dict {'prediction': str, 'confidence': float, 'recommendation': str} or {'error': ...}
    """
    if MODEL_DATA is None:
        # Try to reload the model
        logger.warning("Model not loaded, attempting to reload...")
        if not reload_model():
            return {'error': 'model_not_loaded'}

    # Comprehensive mapping from disorder to recommendation
    recommendation_map = {
        "anxiety": "Cognitive Behavioral Therapy (CBT) and relaxation techniques are highly effective for anxiety disorders. Consider mindfulness practices and stress management.",
        "MDD": "A combination of psychotherapy (like CBT or interpersonal therapy) and lifestyle adjustments is often effective for Major Depressive Disorder.",
        "PTSD": "Trauma-focused therapy such as EMDR or prolonged exposure therapy is recommended. Support groups can also be beneficial.",
        "ADHD": "Behavioral therapy, organizational skills training, and in some cases medication can help manage ADHD symptoms effectively.",
        "ASD": "Behavioral interventions, social skills training, and occupational therapy can help manage Autism Spectrum Disorder.",
        "bipolar": "Long-term treatment including mood stabilizers and psychotherapy is highly recommended for Bipolar Disorder.",
        "OCD": "Exposure and Response Prevention (ERP) therapy combined with CBT is the gold standard for OCD treatment.",
        "PDD": "Long-term psychotherapy and lifestyle changes are effective for Persistent Depressive Disorder.",
        "eating disorder": "Specialized eating disorder treatment including nutritional counseling and therapy is essential.",
        "sleeping disorder": "Sleep hygiene improvements, CBT for insomnia, and addressing underlying causes are recommended.",
        "Loneliness": "Social skills training, community engagement, and therapy can help address feelings of loneliness and isolation.",
        "psychotic depression": "Immediate professional intervention with medication and intensive therapy is crucial for psychotic depression.",
        "Default": "It is recommended to consult with a mental health professional for a comprehensive evaluation."
    }

    try:
        # Get model components
        model = MODEL_DATA['model']
        label_encoder = MODEL_DATA['label_encoder']
        feature_columns = MODEL_DATA['feature_columns']
        includes_age = MODEL_DATA.get('includes_age', False)
        
        logger.info(f"Received {len(symptoms_list)} questionnaire responses, age: {age}")
        logger.info(f"Model includes age: {includes_age}")
        
        # Convert questionnaire responses to model features
        if len(symptoms_list) == 19:
            # This is questionnaire format - convert to model features
            model_features = map_questionnaire_to_features(symptoms_list)
            logger.info(f"Mapped to {len(model_features)} symptom features")
        elif len(symptoms_list) == 27:
            # This is already in model format (27 symptoms)
            model_features = list(symptoms_list)
            logger.info("Using direct model features (27 symptoms)")
        elif len(symptoms_list) == 28:
            # This includes age already (age + 27 symptoms)
            model_features = list(symptoms_list)
            logger.info("Using direct model features (28 with age)")
        else:
            logger.warning(f"Unexpected input size: {len(symptoms_list)}, expected 19, 27, or 28")
            return {'error': 'invalid_input_size', 'details': f'Expected 19 questionnaire responses, 27 symptom features, or 28 features with age, got {len(symptoms_list)}'}
        
        # If model includes age and we have 27 features, add age at the beginning
        if includes_age and len(model_features) == 27:
            # Default age to 25 if not provided
            user_age = age if age is not None else 25
            # Age should be first feature
            model_features = [user_age] + model_features
            logger.info(f"Added age ({user_age}) to features, total: {len(model_features)}")
        
        # Convert to proper format for prediction
        import pandas as pd
        symptoms_df = pd.DataFrame([model_features], columns=feature_columns)
        
        # Get prediction and probabilities
        probabilities = model.predict_proba(symptoms_df)[0]
        confidence = round(max(probabilities), 3)
        prediction_index = probabilities.argmax()
        
        # Get the disorder name
        prediction = label_encoder.inverse_transform([prediction_index])[0]
        
        logger.info(f"Prediction: {prediction}, Confidence: {confidence}")

        recommendation = recommendation_map.get(prediction, recommendation_map["Default"])
        
        # Add confidence level interpretation
        if confidence >= 0.80:
            confidence_level = "high"
            confidence_message = "Our AI is highly confident in this assessment."
        elif confidence >= 0.60:
            confidence_level = "moderate"
            confidence_message = "Our AI has moderate confidence. We recommend professional consultation."
        else:
            confidence_level = "low"
            confidence_message = "Your symptoms show mixed patterns. We strongly recommend consulting with a licensed therapist for proper assessment."

        # Translate the prediction to the user's preferred language
        translated_prediction = translate_disorder_name(str(prediction), user_language)
        
        return {
            'prediction': translated_prediction, 
            'confidence': confidence, 
            'confidence_level': confidence_level,
            'confidence_message': confidence_message,
            'recommendation': recommendation
        }
    except Exception as e:
        logger.exception(f"Prediction failed: {e}")
        return {'error': 'prediction_failed', 'details': str(e)}

# alias for other code that expects a different name
def predict(text, user_language='en'):
    return predict_disorder(text, user_language)