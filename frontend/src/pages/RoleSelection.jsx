import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUsers, FiUpload, FiBarChart2, FiCpu, FiArrowRight } from 'react-icons/fi';

export default function RoleSelection() {
  const navigate = useNavigate();

  return (
    <div className="role-page" id="role-selection-page">
      {/* Animated background orbs */}
      <div className="role-bg-orb role-bg-orb-1" />
      <div className="role-bg-orb role-bg-orb-2" />
      <div className="role-bg-orb role-bg-orb-3" />

      <motion.div
        className="role-container"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      >
        {/* Header */}
        <div className="role-header">
          <motion.div
            className="role-logo"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          >
            🎓
          </motion.div>
          <h1 className="role-title">AKGEC PlaceAnalytics</h1>
          <p className="role-subtitle">
            Placement Analysis & Student Skillset Mapping System
          </p>
        </div>

        {/* Role Cards */}
        <div className="role-cards">
          {/* Student Card */}
          <motion.button
            className="role-card role-card-student"
            onClick={() => navigate('/student')}
            whileHover={{ scale: 1.03, y: -6 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            id="role-student-btn"
          >
            <div className="role-card-glow role-card-glow-student" />
            <div className="role-card-icon role-card-icon-student">
              <FiUsers size={32} />
            </div>
            <h2 className="role-card-title">Enter as Student</h2>
            <p className="role-card-desc">
              View placement analytics, browse student records, and get personalized placement predictions.
            </p>
            <div className="role-card-features">
              <span><FiBarChart2 size={14} /> Analytics Dashboard</span>
              <span><FiUsers size={14} /> Student Records</span>
              <span><FiCpu size={14} /> Placement Prediction</span>
            </div>
            <div className="role-card-action">
              Continue <FiArrowRight />
            </div>
          </motion.button>

          {/* Teacher Card */}
          <motion.button
            className="role-card role-card-teacher"
            onClick={() => navigate('/teacher')}
            whileHover={{ scale: 1.03, y: -6 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            id="role-teacher-btn"
          >
            <div className="role-card-glow role-card-glow-teacher" />
            <div className="role-card-icon role-card-icon-teacher">
              <FiUpload size={32} />
            </div>
            <h2 className="role-card-title">Enter as Teacher</h2>
            <p className="role-card-desc">
              Upload student data files, generate analytics dashboards, and export comprehensive PDF reports.
            </p>
            <div className="role-card-features">
              <span><FiUpload size={14} /> File Upload</span>
              <span><FiBarChart2 size={14} /> Auto Analytics</span>
              <span>📄 PDF Reports</span>
            </div>
            <div className="role-card-action">
              Continue <FiArrowRight />
            </div>
          </motion.button>
        </div>

        <p className="role-footer">
          Ajay Kumar Garg Engineering College — Placement Cell
        </p>
      </motion.div>
    </div>
  );
}
