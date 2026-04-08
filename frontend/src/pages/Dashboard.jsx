import { useState, useEffect } from 'react';
import StatsCards from '../components/StatsCards';
import PlacementByBranch from '../components/PlacementByBranch';
import SkillDemandChart from '../components/SkillDemandChart';
import CGPASalaryChart from '../components/CGPASalaryChart';
import SkillCorrelation from '../components/SkillCorrelation';
import TopCompanies from '../components/TopCompanies';
import { getAnalytics } from '../services/api';

export default function Dashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await getAnalytics();
      setAnalytics(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <div className="loading-text">Loading analytics dashboard...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="error-container">
          <h2>⚠️ Unable to Load Analytics</h2>
          <p>{error}</p>
          <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#64748b' }}>
            Make sure the backend server is running on port 5000 and the database is seeded.
          </p>
          <button className="retry-btn" onClick={fetchAnalytics}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container" id="dashboard-page">
      <div className="page-header">
        <h1 className="page-title">Placement Analytics Dashboard</h1>
        <p className="page-subtitle">
          Comprehensive placement analysis for Ajay Kumar Garg Engineering College
        </p>
      </div>

      <StatsCards overview={analytics?.overview} />

      <div className="charts-grid">
        <PlacementByBranch branchStats={analytics?.branchStats} />
        <SkillDemandChart skillComparison={analytics?.skillComparison} />
        <CGPASalaryChart cgpaSalary={analytics?.cgpaSalary} />
        <SkillCorrelation skillComparison={analytics?.skillComparison} />
      </div>

      <TopCompanies topCompanies={analytics?.topCompanies} />
    </div>
  );
}
