#!/usr/bin/env python3
"""
Create mapping from questionnaire responses to model features
"""

def create_feature_mapping():
    """
    Map 19 questionnaire responses to 27 model features
    """
    
    # The 19 questionnaire questions
    questionnaire_questions = [
        "Over the past 2 weeks, how often have you felt little interest or pleasure in doing things?",
        "How often have you been bothered by feeling down, depressed, or hopeless?", 
        "How often have you had trouble falling or staying asleep, or sleeping too much?",
        "Over the past 2 weeks, how often have you felt tired or had little energy?",
        "How often have you been bothered by poor appetite or overeating?",
        "How often have you felt bad about yourself, or that you are a failure?",
        "How often have you had trouble concentrating on things?",
        "How often have you been bothered by feeling nervous, anxious, or on edge?",
        "How often have you not been able to stop or control worrying?",
        "How often have you been worrying too much about different things?",
        "How often have you had trouble relaxing?",
        "How often have you become easily annoyed or irritable?",
        "How often have you felt afraid as if something awful might happen?",
        "Have you had recurrent thoughts of death or suicide?",
        "Do you feel overwhelmed and unable to cope?",
        "Have you been feeling jumpy or easily startled?",
        "Have you lost interest in activities you once enjoyed?",
        "Have you experienced significant mood swings?",
        "Do you find it difficult to handle your daily responsibilities due to stress?"
    ]
    
    # The 27 model features
    model_features = [
        'feeling.nervous',
        'panic', 
        'breathing.rapidly',
        'sweating',
        'trouble.in.concentration',
        'having.trouble.in.sleeping',
        'having.trouble.with.work',
        'hopelessness',
        'anger',
        'over.react',
        'change.in.eating',
        'suicidal.thought',
        'feeling.tired',
        'close.friend',
        'social.media.addiction',
        'weight.gain',
        'introvert',
        'popping.up.stressful.memory',
        'having.nightmares',
        'avoids.people.or.activities',
        'feeling.negative',
        'trouble.concentrating',
        'blamming.yourself',
        'hallucinations',
        'repetitive.behaviour',
        'seasonally',
        'increased.energy'
    ]
    
    # Create mapping from questionnaire index to model feature indices
    # This maps each questionnaire response to one or more model features
    mapping = {
        # Q0: "felt little interest or pleasure" -> hopelessness, feeling.negative
        0: [7, 20],  # hopelessness, feeling.negative
        
        # Q1: "feeling down, depressed, or hopeless" -> hopelessness, feeling.negative
        1: [7, 20],  # hopelessness, feeling.negative
        
        # Q2: "trouble falling or staying asleep" -> having.trouble.in.sleeping
        2: [5],  # having.trouble.in.sleeping
        
        # Q3: "felt tired or had little energy" -> feeling.tired
        3: [12],  # feeling.tired
        
        # Q4: "poor appetite or overeating" -> change.in.eating
        4: [10],  # change.in.eating
        
        # Q5: "felt bad about yourself, failure" -> blamming.yourself, feeling.negative
        5: [22, 20],  # blamming.yourself, feeling.negative
        
        # Q6: "trouble concentrating" -> trouble.in.concentration, trouble.concentrating
        6: [4, 21],  # trouble.in.concentration, trouble.concentrating
        
        # Q7: "feeling nervous, anxious, on edge" -> feeling.nervous
        7: [0],  # feeling.nervous
        
        # Q8: "not able to stop or control worrying" -> feeling.nervous, panic
        8: [0, 1],  # feeling.nervous, panic
        
        # Q9: "worrying too much about different things" -> feeling.nervous
        9: [0],  # feeling.nervous
        
        # Q10: "trouble relaxing" -> feeling.nervous
        10: [0],  # feeling.nervous
        
        # Q11: "easily annoyed or irritable" -> anger, over.react
        11: [8, 9],  # anger, over.react
        
        # Q12: "felt afraid something awful might happen" -> panic
        12: [1],  # panic
        
        # Q13: "recurrent thoughts of death or suicide" -> suicidal.thought
        13: [11],  # suicidal.thought
        
        # Q14: "feel overwhelmed and unable to cope" -> hopelessness, having.trouble.with.work
        14: [7, 6],  # hopelessness, having.trouble.with.work
        
        # Q15: "feeling jumpy or easily startled" -> panic
        15: [1],  # panic
        
        # Q16: "lost interest in activities once enjoyed" -> hopelessness, avoids.people.or.activities
        16: [7, 19],  # hopelessness, avoids.people.or.activities
        
        # Q17: "significant mood swings" -> over.react, increased.energy
        17: [9, 26],  # over.react, increased.energy
        
        # Q18: "difficult to handle daily responsibilities" -> having.trouble.with.work
        18: [6]  # having.trouble.with.work
    }
    
    return mapping, model_features

def map_questionnaire_to_features(questionnaire_responses):
    """
    Convert 19 questionnaire responses to 27 model features
    
    Args:
        questionnaire_responses: List of 19 integers (0-3 scale)
    
    Returns:
        List of 27 integers for model input
    """
    mapping, model_features = create_feature_mapping()
    
    # Initialize all features to 0
    features = [0] * 27
    
    # Map questionnaire responses to features
    for q_idx, response in enumerate(questionnaire_responses):
        if q_idx in mapping:
            # Convert 0-3 scale to 0-1 binary (2+ becomes 1)
            binary_response = 1 if response >= 2 else 0
            
            # Set corresponding model features
            for feature_idx in mapping[q_idx]:
                features[feature_idx] = binary_response
    
    # Set some default values for unmapped features based on common patterns
    # These are features not directly covered by questionnaire
    
    # breathing.rapidly (index 2) - related to panic/anxiety
    if features[0] or features[1]:  # if feeling.nervous or panic
        features[2] = features[0] or features[1]
    
    # sweating (index 3) - related to anxiety
    if features[0] or features[1]:  # if feeling.nervous or panic
        features[3] = features[0] or features[1]
    
    # close.friend (index 13) - inverse of social isolation
    if features[19]:  # if avoids.people.or.activities
        features[13] = 0  # no close friends
    else:
        features[13] = 1  # has close friends
    
    # social.media.addiction (index 14) - related to avoidance
    if features[19]:  # if avoids.people.or.activities
        features[14] = 1
    
    # weight.gain (index 15) - related to eating changes
    if features[10]:  # if change.in.eating
        features[15] = 1
    
    # introvert (index 16) - related to social avoidance
    if features[19]:  # if avoids.people.or.activities
        features[16] = 1
    
    # popping.up.stressful.memory (index 17) - related to anxiety/trauma
    if features[1] or features[0]:  # if panic or nervous
        features[17] = 1
    
    # having.nightmares (index 18) - related to sleep issues and trauma
    if features[5] or features[17]:  # if sleep trouble or stressful memories
        features[18] = 1
    
    # hallucinations (index 23) - severe symptoms
    if features[11] and features[7]:  # if suicidal thoughts and hopelessness
        features[23] = 1
    
    # repetitive.behaviour (index 24) - related to anxiety/OCD patterns
    if features[0] and features[4]:  # if nervous and concentration trouble
        features[24] = 1
    
    # seasonally (index 25) - seasonal patterns (default to 0)
    features[25] = 0
    
    return features

if __name__ == "__main__":
    # Test the mapping
    mapping, model_features = create_feature_mapping()
    
    print("📊 Questionnaire to Model Feature Mapping:")
    print(f"Questionnaire questions: 19")
    print(f"Model features: {len(model_features)}")
    
    print("\n🔗 Mapping:")
    for q_idx, feature_indices in mapping.items():
        feature_names = [model_features[i] for i in feature_indices]
        print(f"Q{q_idx:2d} -> {feature_names}")
    
    # Test with sample responses
    print("\n🧪 Testing with sample responses:")
    sample_responses = [2, 3, 2, 2, 1, 2, 2, 3, 2, 2, 1, 2, 1, 0, 2, 1, 2, 1, 2]
    features = map_questionnaire_to_features(sample_responses)
    
    print(f"Input responses ({len(sample_responses)}): {sample_responses}")
    print(f"Output features ({len(features)}): {features}")
    
    # Show which features are active
    active_features = [model_features[i] for i, val in enumerate(features) if val == 1]
    print(f"Active features: {active_features}")