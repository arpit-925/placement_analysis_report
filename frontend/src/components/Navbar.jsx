import { NavLink, useNavigate } from 'react-router-dom';
import { FiBarChart2, FiUsers, FiCpu, FiHome, FiArrowLeft } from 'react-icons/fi';

export default function Navbar() {
  const navigate = useNavigate();

  return (
    <nav className="navbar" id="main-navbar">
      <div className="navbar-brand">
        <div className="brand-icon">🎓</div>
        <span>AKGEC PlaceAnalytics</span>
      </div>
      <ul className="navbar-links">
        <li>
          <button className="navbar-back-btn" onClick={() => navigate('/')} title="Back to role selection">
            <FiArrowLeft /> Home
          </button>
        </li>
        <li>
          <NavLink to="/student" end className={({ isActive }) => isActive ? 'active' : ''}>
            <FiHome /> Dashboard
          </NavLink>
        </li>
        <li>
          <NavLink to="/student/students" className={({ isActive }) => isActive ? 'active' : ''}>
            <FiUsers /> Students
          </NavLink>
        </li>
        <li>
          <NavLink to="/student/predict" className={({ isActive }) => isActive ? 'active' : ''}>
            <FiCpu /> Predict
          </NavLink>
        </li>
      </ul>
    </nav>
  );
}
