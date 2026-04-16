import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts';
import { FiUpload, FiArrowLeft, FiDownload, FiFile, FiX, FiUsers,
  FiTrendingUp, FiDollarSign, FiAward, FiCheckCircle, FiAlertTriangle } from 'react-icons/fi';
import { uploadFile } from '../services/teacherApi';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const PIE_COLORS = ['#10b981', '#ef4444'];
const BAR_COLORS = ['#667eea', '#764ba2', '#06b6d4', '#f59e0b', '#ef4444', '#f093fb', '#10b981', '#ec4899'];
const PACKAGE_COLORS = ['#64748b', '#667eea', '#10b981', '#f59e0b', '#ef4444'];

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const fileInputRef = useRef(null);
  const dashboardRef = useRef(null);

  const ACCEPTED = '.csv,.xlsx,.xls,.docx';

  // ── File handling ──────────────────────────────────────────────
  const handleFile = useCallback((f) => {
    if (!f) return;
    const ext = f.name.toLowerCase();
    if (!ext.endsWith('.csv') && !ext.endsWith('.xlsx') && !ext.endsWith('.xls') && !ext.endsWith('.docx')) {
      setError('Unsupported file type. Please upload CSV, XLSX, or DOCX files.');
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setError('File size exceeds 10MB limit.');
      return;
    }
    setFile(f);
    setError(null);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) handleFile(e.dataTransfer.files[0]);
  }, [handleFile]);

  const handleDragOver = useCallback((e) => { e.preventDefault(); setDragOver(true); }, []);
  const handleDragLeave = useCallback(() => setDragOver(false), []);

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const result = await uploadFile(file);
      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error || 'Failed to process the file.');
      }
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Upload failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setData(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ── PDF Export ─────────────────────────────────────────────────
  const handleDownloadPDF = async () => {
    if (!dashboardRef.current) return;
    try {
      // Temporarily add a class for PDF styling
      dashboardRef.current.classList.add('pdf-capture');

      const canvas = await html2canvas(dashboardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#0a0e1a',
        logging: false,
        windowWidth: 1400
      });

      dashboardRef.current.classList.remove('pdf-capture');

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = pdfWidth / imgWidth;
      const scaledHeight = imgHeight * ratio;

      let position = 0;
      let remainingHeight = scaledHeight;

      // Multi-page support
      while (remainingHeight > 0) {
        if (position > 0) pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, -position, pdfWidth, scaledHeight);
        remainingHeight -= pdfHeight;
        position += pdfHeight;
      }

      pdf.save(`Placement_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      console.error('PDF generation error:', err);
      setError('Failed to generate PDF. Please try again.');
    }
  };

  // ── Chart data prep ────────────────────────────────────────────
  const pieData = data ? [
    { name: 'Placed', value: data.analytics.overview.placedStudents },
    { name: 'Not Placed', value: data.analytics.overview.notPlacedStudents }
  ] : [];

  const branchData = data ? data.analytics.branchStats.map(b => ({
    name: b.branch,
    Placed: b.placed,
    'Not Placed': b.notPlaced
  })) : [];

  const packageData = data ? data.analytics.packageDistribution.map(p => ({
    name: p.label,
    Students: p.count
  })) : [];

  // ── Custom tooltip ──────────────────────────────────────────────
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="teacher-chart-tooltip">
          <p className="teacher-chart-tooltip-label">{label}</p>
          {payload.map((p, i) => (
            <p key={i} style={{ color: p.color }}>
              {p.name}: <strong>{p.value}</strong>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // ── Render ──────────────────────────────────────────────────────
  return (
    <div className="teacher-page" id="teacher-dashboard-page">
      {/* Top Bar */}
      <div className="teacher-topbar">
        <button className="teacher-back-btn" onClick={() => navigate('/')} id="teacher-back-btn">
          <FiArrowLeft /> Back to Home
        </button>
        <div className="teacher-topbar-brand">
          <span className="teacher-topbar-icon">👩‍🏫</span>
          <span>Teacher Dashboard</span>
        </div>
        {data && (
          <button className="teacher-download-btn" onClick={handleDownloadPDF} id="download-report-btn">
            <FiDownload /> Download Report
          </button>
        )}
      </div>

      {/* Upload Section (shown when no data) */}
      {!data && (
        <motion.div
          className="teacher-upload-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="teacher-upload-header">
            <h1 className="page-title">Upload Student Data</h1>
            <p className="page-subtitle">
              Upload a CSV, XLSX, or DOCX file containing student placement data to generate analytics
            </p>
          </div>

          <div
            className={`teacher-upload-zone ${dragOver ? 'drag-over' : ''} ${file ? 'has-file' : ''}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => !file && fileInputRef.current?.click()}
            id="upload-drop-zone"
          >
            <input
              type="file"
              ref={fileInputRef}
              accept={ACCEPTED}
              onChange={(e) => handleFile(e.target.files[0])}
              style={{ display: 'none' }}
              id="file-input"
            />

            {file ? (
              <div className="teacher-file-info">
                <div className="teacher-file-icon"><FiFile size={32} /></div>
                <div className="teacher-file-details">
                  <span className="teacher-file-name">{file.name}</span>
                  <span className="teacher-file-size">{(file.size / 1024).toFixed(1)} KB</span>
                </div>
                <button className="teacher-file-remove" onClick={(e) => { e.stopPropagation(); handleReset(); }}>
                  <FiX size={20} />
                </button>
              </div>
            ) : (
              <div className="teacher-upload-placeholder">
                <div className="teacher-upload-icon-wrapper">
                  <FiUpload size={40} />
                </div>
                <h3>Drop your file here</h3>
                <p>or click to browse</p>
                <span className="teacher-upload-formats">Supported: CSV, XLSX, DOCX (max 10MB)</span>
              </div>
            )}
          </div>

          {/* Error message */}
          <AnimatePresence>
            {error && (
              <motion.div
                className="teacher-error"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <FiAlertTriangle /> {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Upload button */}
          {file && !loading && (
            <motion.button
              className="teacher-upload-btn"
              onClick={handleUpload}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              id="upload-submit-btn"
            >
              <FiUpload /> Process & Analyze
            </motion.button>
          )}

          {/* Loading state */}
          {loading && (
            <div className="teacher-loading">
              <div className="spinner" />
              <p>Processing your data…</p>
            </div>
          )}

          {/* Format guide */}
          <div className="teacher-format-guide glass-card">
            <h3>📋 Expected Data Format</h3>
            <p>Your file should contain columns for student information. The system auto-detects common column names:</p>
            <div className="teacher-format-cols">
              <span className="teacher-format-tag">Name</span>
              <span className="teacher-format-tag">Branch / Department</span>
              <span className="teacher-format-tag">CGPA / Percentage</span>
              <span className="teacher-format-tag">Placement Status</span>
              <span className="teacher-format-tag">Company</span>
              <span className="teacher-format-tag">Salary / Package (LPA)</span>
              <span className="teacher-format-tag">Roll No</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Dashboard (shown after upload) */}
      {data && (
        <motion.div
          ref={dashboardRef}
          className="teacher-dashboard"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          id="teacher-dashboard-content"
        >
          {/* File info bar */}
          <div className="teacher-file-bar">
            <div className="teacher-file-bar-info">
              <FiCheckCircle className="teacher-file-bar-icon" />
              <span>Analyzed <strong>{data.totalRows}</strong> students from <strong>{data.fileName}</strong></span>
            </div>
            <button className="teacher-new-upload-btn" onClick={handleReset}>
              <FiUpload size={14} /> New Upload
            </button>
          </div>

          {/* Stats Cards */}
          <div className="teacher-stats-grid">
            <motion.div className="stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <div className="stat-card-icon"><FiUsers size={24} /></div>
              <div className="stat-card-label">Total Students</div>
              <div className="stat-card-value">{data.analytics.overview.totalStudents}</div>
            </motion.div>
            <motion.div className="stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <div className="stat-card-icon"><FiCheckCircle size={24} /></div>
              <div className="stat-card-label">Placed</div>
              <div className="stat-card-value">{data.analytics.overview.placedStudents}</div>
              <div className="stat-card-change">{data.analytics.overview.placementRate}% placement rate</div>
            </motion.div>
            <motion.div className="stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <div className="stat-card-icon"><FiTrendingUp size={24} /></div>
              <div className="stat-card-label">Avg Package</div>
              <div className="stat-card-value">₹{data.analytics.overview.avgPackage} <span style={{fontSize: '1rem', fontWeight: 400}}>LPA</span></div>
            </motion.div>
            <motion.div className="stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <div className="stat-card-icon"><FiAward size={24} /></div>
              <div className="stat-card-label">Highest Package</div>
              <div className="stat-card-value">₹{data.analytics.overview.maxPackage} <span style={{fontSize: '1rem', fontWeight: 400}}>LPA</span></div>
            </motion.div>
          </div>

          {/* Charts */}
          <div className="teacher-charts-grid">
            {/* Pie Chart */}
            <motion.div className="chart-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <div className="chart-title">
                <div className="chart-icon">📊</div>
                Placement Distribution
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(1)}%)`}
                    labelLine={true}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Branch Bar Chart */}
            <motion.div className="chart-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <div className="chart-title">
                <div className="chart-icon">📈</div>
                Branch-wise Placement
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={branchData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="Placed" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Not Placed" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Package Distribution */}
            <motion.div className="chart-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
              <div className="chart-title">
                <div className="chart-icon">💰</div>
                Package Distribution
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={packageData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="Students" radius={[4, 4, 0, 0]}>
                    {packageData.map((entry, index) => (
                      <Cell key={`pkg-${index}`} fill={PACKAGE_COLORS[index]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Top Companies */}
            {data.analytics.topCompanies.length > 0 && (
              <motion.div className="chart-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                <div className="chart-title">
                  <div className="chart-icon">🏢</div>
                  Top Recruiting Companies
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={data.analytics.topCompanies}
                    layout="vertical"
                    margin={{ top: 5, right: 20, left: 60, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis type="number" stroke="#64748b" fontSize={12} />
                    <YAxis dataKey="company" type="category" stroke="#64748b" fontSize={11} width={80} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" fill="#667eea" name="Hires" radius={[0, 4, 4, 0]}>
                      {data.analytics.topCompanies.map((entry, index) => (
                        <Cell key={`co-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>
            )}
          </div>

          {/* Data Table */}
          <motion.div
            className="glass-card teacher-table-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <div className="chart-title" style={{ marginBottom: '1rem' }}>
              <div className="chart-icon"><FiUsers size={16} /></div>
              Student Data ({data.students.length} records)
            </div>
            <div className="teacher-table-wrapper">
              <table className="data-table" id="teacher-data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Branch</th>
                    <th>CGPA</th>
                    <th>Status</th>
                    <th>Company</th>
                    <th>Package (LPA)</th>
                  </tr>
                </thead>
                <tbody>
                  {data.students.map((s, i) => (
                    <tr key={i}>
                      <td>{i + 1}</td>
                      <td style={{ color: '#f1f5f9', fontWeight: 500 }}>{s.Name}</td>
                      <td>
                        <span className="teacher-branch-tag">{s.Branch}</span>
                      </td>
                      <td style={{
                        fontWeight: 600,
                        color: s.CGPA >= 8 ? '#10b981' : s.CGPA >= 6 ? '#f59e0b' : '#ef4444'
                      }}>
                        {s.CGPA}
                      </td>
                      <td>
                        <span className={`status-badge ${s.Placement_Status === 'Placed' ? 'placed' : 'not-placed'}`}>
                          {s.Placement_Status}
                        </span>
                      </td>
                      <td>{s.Company !== '-' ? s.Company : '—'}</td>
                      <td style={{ fontWeight: 600, color: s.Salary_LPA > 0 ? '#10b981' : '#64748b' }}>
                        {s.Salary_LPA > 0 ? `₹${s.Salary_LPA}` : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Bottom Download Button */}
          <div className="teacher-bottom-actions">
            <button className="teacher-download-btn-large" onClick={handleDownloadPDF} id="download-report-btn-bottom">
              <FiDownload size={20} /> Download Full Report as PDF
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
