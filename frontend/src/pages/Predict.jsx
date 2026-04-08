import { useState } from 'react';
import PredictionForm from '../components/PredictionForm';
import PredictionResult from '../components/PredictionResult';

export default function Predict() {
  const [result, setResult] = useState(null);

  return (
    <div className="page-container" id="predict-page">
      <div className="page-header">
        <h1 className="page-title">Placement Prediction</h1>
        <p className="page-subtitle">
          Enter your skills and profile to predict placement probability and expected salary
        </p>
      </div>

      <div className="predict-layout">
        <PredictionForm onResult={setResult} />
        {result ? (
          <PredictionResult result={result} />
        ) : (
          <div className="result-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.3 }}>🎯</div>
            <h3 style={{ color: '#64748b', fontWeight: 600, marginBottom: '0.5rem' }}>
              Ready to Predict
            </h3>
            <p style={{ color: '#475569', fontSize: '0.875rem', textAlign: 'center', maxWidth: '300px' }}>
              Adjust the sliders on the left to set your profile, then click "Predict Placement" to see your results.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
