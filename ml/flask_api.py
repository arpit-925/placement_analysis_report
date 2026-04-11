from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import os

app = Flask(__name__)
CORS(app)

# ✅ Absolute path fix (IMPORTANT for Render)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "models")

print("🔄 Loading ML models from:", MODELS_DIR)

try:
    logistic_model = joblib.load(os.path.join(MODELS_DIR, 'logistic_regression.pkl'))
    random_forest_model = joblib.load(os.path.join(MODELS_DIR, 'random_forest.pkl'))
    salary_model = joblib.load(os.path.join(MODELS_DIR, 'salary_predictor.pkl'))
    scaler_class = joblib.load(os.path.join(MODELS_DIR, 'scaler_classification.pkl'))
    scaler_salary = joblib.load(os.path.join(MODELS_DIR, 'scaler_salary.pkl'))
    print("✅ Models loaded successfully!")
except Exception as e:
    print("❌ Model loading failed:", e)

FEATURE_NAMES = [
    'CGPA', 'DSA_Score', 'WebDev_Score', 'ML_Score',
    'Aptitude_Score', 'Communication_Score',
    'Internships', 'Projects', 'Hackathons'
]

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'service': 'ML API'})

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()

        features = np.array([[
            float(data.get('cgpa', 0)),
            float(data.get('dsa', 0)),
            float(data.get('webdev', 0)),
            float(data.get('ml', 0)),
            float(data.get('aptitude', 0)),
            float(data.get('communication', 0)),
            int(data.get('internships', 0)),
            int(data.get('projects', 0)),
            int(data.get('hackathons', 0))
        ]])

        features_scaled_class = scaler_class.transform(features)
        features_scaled_salary = scaler_salary.transform(features)

        rf_prob = random_forest_model.predict_proba(features_scaled_class)[0][1]
        placement_prob = round(float(rf_prob) * 100, 2)

        salary = float(salary_model.predict(features_scaled_salary)[0])
        salary = round(max(salary, 3.0), 2)

        return jsonify({
            "placement_probability": placement_prob,
            "placement_status": "Likely Placed" if placement_prob >= 50 else "At Risk",
            "expected_salary": salary
        })

    except Exception as e:
        print("🔥 Prediction error:", e)
        return jsonify({"error": str(e)}), 500

@app.route('/feature-importance', methods=['GET'])
def feature_importance():
    try:
        importances = random_forest_model.feature_importances_
        return jsonify({
            "feature_importance": [
                {"feature": name, "importance": float(imp)}
                for name, imp in zip(FEATURE_NAMES, importances)
            ]
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 10000))
    app.run(host='0.0.0.0', port=port)