import { useState } from 'react';
import { FiCpu, FiSliders } from 'react-icons/fi';
import { predictPlacement } from '../services/api';

const defaultValues = {
  cgpa: 7.5,
  dsa: 60,
  webdev: 50,
  ml: 40,
  aptitude: 55,
  communication: 50,
  internships: 1,
  projects: 3,
  hackathons: 1
};

export default function PredictionForm({ onResult }) {
  const [form, setForm] = useState(defaultValues);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: parseFloat(value) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const result = await predictPlacement(form);
      onResult(result.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Prediction service unavailable. Make sure the Flask ML API is running.');
    } finally {
      setLoading(false);
    }
  };

  const sliders = [
    { key: 'cgpa', label: 'CGPA', min: 0, max: 10, step: 0.1 },
    { key: 'dsa', label: 'DSA Score', min: 0, max: 100, step: 1 },
    { key: 'webdev', label: 'Web Dev Score', min: 0, max: 100, step: 1 },
    { key: 'ml', label: 'ML Score', min: 0, max: 100, step: 1 },
    { key: 'aptitude', label: 'Aptitude Score', min: 0, max: 100, step: 1 },
    { key: 'communication', label: 'Communication', min: 0, max: 100, step: 1 },
  ];

  const selects = [
    { key: 'internships', label: 'Internships', options: [0, 1, 2, 3, 4] },
    { key: 'projects', label: 'Projects', options: [0, 1, 2, 3, 4, 5, 6, 7, 8] },
    { key: 'hackathons', label: 'Hackathons', options: [0, 1, 2, 3, 4, 5] },
  ];

  return (
    <div className="form-card" id="prediction-form">
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <FiSliders /> Student Profile
      </h2>
      <form onSubmit={handleSubmit}>
        {sliders.map(s => (
          <div className="form-group" key={s.key}>
            <label className="form-label">
              <span>{s.label}</span>
              <span className="label-value">{form[s.key]}</span>
            </label>
            <input
              type="range"
              className="form-slider"
              min={s.min}
              max={s.max}
              step={s.step}
              value={form[s.key]}
              onChange={(e) => handleChange(s.key, e.target.value)}
              style={{
                opacity: 0.3 + (form[s.key] / s.max) * 0.7
              }}
              id={`slider-${s.key}`}
            />
          </div>
        ))}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
          {selects.map(s => (
            <div className="form-group" key={s.key}>
              <label className="form-label">
                <span>{s.label}</span>
              </label>
              <select
                className="form-select"
                value={form[s.key]}
                onChange={(e) => handleChange(s.key, e.target.value)}
                id={`select-${s.key}`}
              >
                {s.options.map(o => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>
          ))}
        </div>

        {error && (
          <div style={{
            padding: '0.75rem 1rem',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '0.5rem',
            color: '#ef4444',
            fontSize: '0.875rem',
            marginTop: '0.5rem'
          }}>
            {error}
          </div>
        )}

        <button type="submit" className="btn-predict" disabled={loading} id="predict-btn">
          {loading ? (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }}></span>
              Analyzing...
            </span>
          ) : (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <FiCpu /> Predict Placement
            </span>
          )}
        </button>
      </form>
    </div>
  );
}
