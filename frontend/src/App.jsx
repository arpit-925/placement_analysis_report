import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import RoleSelection from './pages/RoleSelection';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Predict from './pages/Predict';
import TeacherDashboard from './pages/TeacherDashboard';

// Layout wrapper that shows Navbar for student routes
function StudentLayout() {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Role selection landing page */}
        <Route path="/" element={<RoleSelection />} />

        {/* Student routes — keep existing functionality intact */}
        <Route path="/student" element={<StudentLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="students" element={<Students />} />
          <Route path="predict" element={<Predict />} />
        </Route>

        {/* Teacher dashboard */}
        <Route path="/teacher" element={<TeacherDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
