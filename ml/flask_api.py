from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import os

app = Flask(__name__)
CORS(app)

# ✅ Absolute path (important for Render)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "models")

print("🔄 Loading ML models from:", MODELS_DIR)

# ✅ Load models safely
try:
    logistic_model = joblib.load(os.path.join(MODELS_DIR, 'logistic_regression.pkl'))
    random_forest_model = joblib.load(os.path.join(MODELS_DIR, 'random_forest.pkl'))
    salary_model = joblib.load(os.path.join(MODELS_DIR, 'salary_predictor.pkl'))
    scaler_class = joblib.load(os.path.join(MODELS_DIR, 'scaler_classification.pkl'))
    scaler_salary = joblib.load(os.path.join(MODELS_DIR, 'scaler_salary.pkl'))
    print("✅ Models loaded successfully!")
except Exception as e:
    print("❌ Model loading failed:", e)
    raise e  # 🔥 Stop server if models fail

# Feature names
FEATURE_NAMES = [
    'CGPA', 'DSA_Score', 'WebDev_Score', 'ML_Score',
    'Aptitude_Score', 'Communication_Score',
    'Internships', 'Projects', 'Hackathons'
]

# ─────────────────────────────────────────────
# Root route (for quick testing)
# ─────────────────────────────────────────────
@app.route('/', methods=['GET'])
def home():
    return jsonify({
        "message": "ML API is running 🚀"
    })

# ─────────────────────────────────────────────
# Health check
# ─────────────────────────────────────────────
@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'ok',
        'service': 'ML API'
    })

# ─────────────────────────────────────────────
# Prediction API
# ─────────────────────────────────────────────
@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()

        # ✅ Validate request
        if not data:
            return jsonify({"error": "No input data provided"}), 400

        print("📥 Received input:", data)

        # ✅ Ensure model loaded
        if 'random_forest_model' not in globals():
            return jsonify({"error": "Model not loaded"}), 500

        # ✅ Extract features safely
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

        # ✅ Scale features
        features_scaled_class = scaler_class.transform(features)
        features_scaled_salary = scaler_salary.transform(features)

        # ✅ Prediction
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

# ─────────────────────────────────────────────
# Feature Importance
# ─────────────────────────────────────────────
@app.route('/feature-importance', methods=['GET'])
def feature_importance():
    try:
        importances = random_forest_model.feature_importances_

        return jsonify({
            "feature_importance": [
                {"feature": name, "importance": round(float(imp), 4)}
                for name, imp in zip(FEATURE_NAMES, importances)
            ]
        })

    except Exception as e:
        print("🔥 Feature importance error:", e)
        return jsonify({"error": str(e)}), 500

# ─────────────────────────────────────────────
# Run server
# ─────────────────────────────────────────────
if __name__ == '__main__':
    port = int(os.environ.get("PORT", 10000))
    app.run(host='0.0.0.0', port=port)