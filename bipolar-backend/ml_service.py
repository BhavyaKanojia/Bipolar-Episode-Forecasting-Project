import os
import pickle
import pandas as pd
from config import Config

class MLService:
    def __init__(self):
        self.model = None
        self.label_encoder = None
        self.load_models()

    def load_models(self):
        if os.path.exists(Config.MODEL_PATH) and os.path.exists(Config.ENCODER_PATH):
            with open(Config.MODEL_PATH, "rb") as f:
                self.model = pickle.load(f)
            with open(Config.ENCODER_PATH, "rb") as f:
                self.label_encoder = pickle.load(f)
        else:
            raise FileNotFoundError("Model or Label Encoder pickle files not found.")

    def format_input(self, mood_val, energy_val, sleep_hours):
        """
        Maps user daily logs into features required by the Random Forest model:
        Sadness, Euphoric, Exhausted, Sleep dissorder, Mood Swing, Optimisim
        """
        return {
            "Sadness": "Usually" if mood_val == 0 else ("Sometimes" if mood_val == 1 else "Seldom"),
            "Euphoric": "Usually" if mood_val == 2 else ("Sometimes" if mood_val == 1 else "Seldom"),
            "Exhausted": "Usually" if energy_val < 4 else ("Sometimes" if energy_val < 7 else "Seldom"),
            "Sleep dissorder": "Usually" if (sleep_hours < 5 or sleep_hours > 9) else "Seldom",
            "Mood Swing": "YES" if (mood_val == 0 or mood_val == 2) else "NO",
            "Optimisim": energy_val
        }

    def predict_from_features(self, feature_dict):
        """
        Runs model prediction and extracts TRUE probabilities for all 4 psychiatric classes:
        ['Bipolar Type-1', 'Bipolar Type-2', 'Depression', 'Normal']
        """
        input_df = pd.DataFrame([feature_dict])
        input_df = pd.get_dummies(input_df)
        
        # Align with training columns
        model_columns = self.model.feature_names_in_
        input_df = input_df.reindex(columns=model_columns, fill_value=0)

        # Make prediction and probability distribution
        prediction = self.model.predict(input_df)
        probabilities = self.model.predict_proba(input_df)[0]
        
        # Map each class name to its exact probability from the ML model
        classes = self.label_encoder.classes_
        class_probs = {cls: round(float(prob) * 100, 1) for cls, prob in zip(classes, probabilities)}
        
        disorder = self.label_encoder.inverse_transform(prediction)[0]
        
        # Authentic risk scores derived directly from the model's probabilities
        bipolar1_prob = class_probs.get("Bipolar Type-1", 0.0)
        bipolar2_prob = class_probs.get("Bipolar Type-2", 0.0)
        depression_prob = class_probs.get("Depression", 0.0)
        normal_prob = class_probs.get("Normal", 0.0)

        # Mania Risk: Bipolar 1 (full mania) + hypomanic aspect of Bipolar 2
        mania_risk = round(min(100.0, bipolar1_prob + (0.5 * bipolar2_prob)))
        
        # Depression Risk: Unipolar Depression + depressive aspect of Bipolar 2
        depression_risk = round(min(100.0, depression_prob + (0.6 * bipolar2_prob)))
        
        # Overall risk level
        highest_risk = max(mania_risk, depression_risk)
        if highest_risk >= 50:
            risk_level = "High"
        elif highest_risk >= 25:
            risk_level = "Moderate"
        else:
            risk_level = "Low"

        confidence = round(float(max(probabilities)) * 100)

        return {
            "disorder": disorder,
            "mood_stability": "Stable" if disorder == "Normal" else disorder,
            "mania_probability": mania_risk,
            "depression_risk": depression_risk,
            "confidence": confidence,
            "next_episode_risk": risk_level,
            "class_probabilities": class_probs,
            "raw_probabilities": {
                "bipolar_1": bipolar1_prob,
                "bipolar_2": bipolar2_prob,
                "depression": depression_prob,
                "normal": normal_prob
            }
        }

    def predict_log(self, mood_val, energy_val, sleep_hours):
        feature_dict = self.format_input(mood_val, energy_val, sleep_hours)
        return self.predict_from_features(feature_dict)

ml_service = MLService()
