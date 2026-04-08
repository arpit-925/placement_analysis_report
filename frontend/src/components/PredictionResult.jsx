import { FiAlertTriangle, FiCheckCircle, FiArrowUp } from 'react-icons/fi';

export default function PredictionResult({ result }) {
  if (!result) return null;

  const prob = result.placement_probability || 0;
  const isPositive = prob >= 50;

  // Determine gauge gradient based on probability
  const gaugeGradient = isPositive
    ? 'linear-gradient(135deg, #10b981, #059669)'
    : 'linear-gradient(135deg, #ef4444, #dc2626)';

  return (
    <div className="result-card" id="prediction-result">
      {/* Probability Gauge */}
      <div className="probability-gauge">
        <div className="gauge-circle" style={{ background: gaugeGradient }}>
          <span className="gauge-value" style={{ color: isPositive ? '#10b981' : '#ef4444' }}>
            {prob}%
          </span>
        </div>
        <div className="gauge-label">
          {isPositive ? (
            <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <FiCheckCircle /> {result.placement_status}
            </span>
          ) : (
            <span style={{ color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <FiAlertTriangle /> {result.placement_status}
            </span>
          )}
        </div>
      </div>

      {/* Salary Display */}
      <div className="salary-display">
        <div className="salary-amount">₹{result.expected_salary} LPA</div>
        <div className="salary-label">Expected Annual Package</div>
      </div>

      {/* Model Comparison */}
      {result.model_results && (
        <div>
          <h3 style={{ fontSize: '0.875rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem', fontWeight: 600 }}>
            Model Results
          </h3>
          <div className="model-comparison">
            <div className="model-item">
              <h4>Logistic Regression</h4>
              <div className="model-prob" style={{ color: result.model_results.logistic_regression?.probability >= 50 ? '#10b981' : '#ef4444' }}>
                {result.model_results.logistic_regression?.probability}%
              </div>
            </div>
            <div className="model-item">
              <h4>Random Forest</h4>
              <div className="model-prob" style={{ color: result.model_results.random_forest?.probability >= 50 ? '#10b981' : '#ef4444' }}>
                {result.model_results.random_forest?.probability}%
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Skill Suggestions */}
      {result.skill_suggestions && result.skill_suggestions.length > 0 && (
        <div style={{ marginTop: '1.5rem' }}>
          <h3 style={{ fontSize: '0.875rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FiArrowUp /> Skill Improvement Suggestions
          </h3>
          <div className="suggestions-list">
            {result.skill_suggestions.map((s, i) => (
              <div className="suggestion-item" key={i}>
                <span className={`suggestion-priority ${s.priority}`}>{s.priority}</span>
                <div className="suggestion-content">
                  <h4>{s.skill}</h4>
                  <div className="suggestion-score">
                    Current: {s.current_score} → Recommended: {s.recommended_score} (Gap: {s.gap})
                  </div>
                  <p>{s.tip}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
