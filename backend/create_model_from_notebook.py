# create_model_from_notebook.py
from pathlib import Path
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from catboost import CatBoostClassifier
import joblib

def train_and_save_model():
    """
    Loads your Excel dataset, trains a CatBoost model, and saves it as mental_model.joblib
    """
    # Base directory (backend folder)
    BASE_DIR = Path(__file__).resolve().parent

    # --- 1. Load the dataset ---
    dataset_path = BASE_DIR / "datasets" / "Mental disorder symptoms.xlsx"
    if not dataset_path.exists():
        print(f"Error: Dataset not found at {dataset_path}")
        return

    df = pd.read_excel(dataset_path)
    print(f"Dataset loaded successfully from: {dataset_path}")

    # --- 2. Preprocess Data ---
    target_col = "Disorder"  # This is your target column
    X = df.drop(columns=[target_col])
    y = df[target_col].astype(str) # Ensure target is string type

    # Rename any problematic columns (if needed, copy from your notebook)
    rename_map = {
        'ag+1:629e': 'age', # Example of a messy column name
        'having.trouble.in.sleeping': 'trouble_sleeping',
        'having.trouble.with.work': 'trouble_with_work',
        'having.nightmares': 'nightmares'
    }
    X = X.rename(columns={k: v for k, v in rename_map.items() if k in X.columns})

    # Identify categorical features BEFORE filling missing values
    categorical_features_indices = np.where(X.dtypes == 'object')[0]

    # Fill missing values
    # For simplicity, we fill numeric NaNs with 0 and categorical NaNs with 'missing'
    for col in X.columns:
        if X[col].dtype == 'object':
            X[col].fillna('missing', inplace=True)
        else:
            X[col].fillna(0, inplace=True)

    # Split dataset
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # --- 3. Train CatBoost Model ---
    print("Training CatBoost model...")
    model = CatBoostClassifier(
        iterations=5000,
        learning_rate=0.05,
        depth=3,
        loss_function='MultiClass',
        verbose=100
    )
    # Pass the indices of categorical features to the model
    # This lets CatBoost use its optimized internal handling, which is more effective.
    model.fit(X_train, y_train, cat_features=categorical_features_indices)
    print("Model training complete.")

    # Validate
    preds = model.predict(X_test)
    accuracy = (preds.flatten() == y_test.values).mean()
    print(f"Validation Accuracy: {accuracy:.4f}")

    # --- 4. Save the model ---
    model_path = BASE_DIR / "mental_health_app" / "ai_models" / "mental_model.joblib"
    model_path.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, model_path)
    print(f"✅ Model saved successfully at: {model_path}")

if __name__ == "__main__":
    train_and_save_model()
