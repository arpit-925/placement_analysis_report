import { useState, useEffect } from 'react';
import { getStudents } from '../services/api';
import { FiSearch, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

export default function Students() {
  const [students, setStudents] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [branch, setBranch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchStudents();
  }, [page, branch, status]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 20 };
      if (branch) params.branch = branch;
      if (status) params.status = status;
      if (search) params.search = search;

      const res = await getStudents(params);
      setStudents(res.data);
      setPagination(res.pagination);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchStudents();
  };

  if (error) {
    return (
      <div className="page-container">
        <div className="error-container">
          <h2>⚠️ Unable to Load Students</h2>
          <p>{error}</p>
          <button className="retry-btn" onClick={fetchStudents}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container" id="students-page">
      <div className="page-header">
        <h1 className="page-title">Student Records</h1>
        <p className="page-subtitle">Browse, search, and filter student placement data</p>
      </div>

      <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
        <form onSubmit={handleSearch}>
          <div className="table-controls">
            <div style={{ position: 'relative', flex: 1, minWidth: '250px' }}>
              <FiSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input
                type="text"
                className="search-input"
                placeholder="Search by name, roll no, or company..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: '36px' }}
                id="search-input"
              />
            </div>
            <select
              className="filter-select"
              value={branch}
              onChange={(e) => { setBranch(e.target.value); setPage(1); }}
              id="branch-filter"
            >
              <option value="">All Branches</option>
              <option value="CSE">CSE</option>
              <option value="IT">IT</option>
              <option value="ECE">ECE</option>
              <option value="ME">ME</option>
              <option value="CE">CE</option>
              <option value="EE">EE</option>
            </select>
            <select
              className="filter-select"
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              id="status-filter"
            >
              <option value="">All Status</option>
              <option value="Placed">Placed</option>
              <option value="Not Placed">Not Placed</option>
            </select>
            <button type="submit" className="btn-predict" style={{ width: 'auto', marginTop: 0, padding: '0.65rem 1.5rem' }}>
              Search
            </button>
          </div>
        </form>
      </div>

      <div className="glass-card" style={{ overflow: 'auto' }}>
        {loading ? (
          <div className="loading-container" style={{ minHeight: '200px' }}>
            <div className="spinner"></div>
            <div className="loading-text">Loading students...</div>
          </div>
        ) : (
          <>
            <table className="data-table" id="students-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Roll No</th>
                  <th>Branch</th>
                  <th>CGPA</th>
                  <th>DSA</th>
                  <th>WebDev</th>
                  <th>ML</th>
                  <th>Aptitude</th>
                  <th>Internships</th>
                  <th>Projects</th>
                  <th>Status</th>
                  <th>Salary</th>
                  <th>Company</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s, i) => (
                  <tr key={s._id || i}>
                    <td style={{ color: '#f1f5f9', fontWeight: 500 }}>{s.Name}</td>
                    <td>{s.Roll_No}</td>
                    <td>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        background: 'rgba(102, 126, 234, 0.1)',
                        color: '#667eea',
                        fontSize: '0.75rem',
                        fontWeight: 600
                      }}>
                        {s.Branch}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600, color: s.CGPA >= 8 ? '#10b981' : s.CGPA >= 6 ? '#f59e0b' : '#ef4444' }}>
                      {s.CGPA}
                    </td>
                    <td>{s.DSA_Score}</td>
                    <td>{s.WebDev_Score}</td>
                    <td>{s.ML_Score}</td>
                    <td>{s.Aptitude_Score}</td>
                    <td>{s.Internships}</td>
                    <td>{s.Projects}</td>
                    <td>
                      <span className={`status-badge ${s.Placement_Status === 'Placed' ? 'placed' : 'not-placed'}`}>
                        {s.Placement_Status}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600, color: '#10b981' }}>
                      {s.Salary_LPA > 0 ? `₹${s.Salary_LPA}` : '-'}
                    </td>
                    <td>{s.Company !== 'Not Placed' ? s.Company : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {pagination && (
              <div className="pagination">
                <button
                  className="pagination-btn"
                  disabled={!pagination.hasPrev}
                  onClick={() => setPage(p => p - 1)}
                  id="prev-page"
                >
                  <FiChevronLeft /> Prev
                </button>
                <span className="pagination-info">
                  Page {pagination.currentPage} of {pagination.totalPages}
                  {' '}({pagination.totalRecords} records)
                </span>
                <button
                  className="pagination-btn"
                  disabled={!pagination.hasNext}
                  onClick={() => setPage(p => p + 1)}
                  id="next-page"
                >
                  Next <FiChevronRight />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
