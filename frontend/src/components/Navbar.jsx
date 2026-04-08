import { NavLink } from 'react-router-dom';
import { FiBarChart2, FiUsers, FiCpu, FiHome } from 'react-icons/fi';

export default function Navbar() {
  return (
    <nav className="navbar" id="main-navbar">
      <div className="navbar-brand">
        <div className="brand-icon">🎓</div>
        <span>AKGEC PlaceAnalytics</span>
      </div>
      <ul className="navbar-links">
        <li>
          <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>
            <FiHome /> Dashboard
          </NavLink>
        </li>
        <li>
          <NavLink to="/students" className={({ isActive }) => isActive ? 'active' : ''}>
            <FiUsers /> Students
          </NavLink>
        </li>
        <li>
          <NavLink to="/predict" className={({ isActive }) => isActive ? 'active' : ''}>
            <FiCpu /> Predict
          </NavLink>
        </li>
      </ul>
    </nav>
  );
}
