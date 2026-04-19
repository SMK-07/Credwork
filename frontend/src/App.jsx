import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import WorkerProfile from './pages/worker/Profile';
import WorkerJobs from './pages/worker/Jobs';
import EmployerDashboard from './pages/employer/Dashboard';
import EmployerJob from './pages/employer/JobDetails';
import AdminVerifications from './pages/admin/Verifications';
import AdminDisputes from './pages/admin/Disputes';
import './index.css';

const PrivateRoute = ({ roles }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/login" />;
  return <Outlet />;
};

const NavBar = () => {
  const { user, logout } = useAuth();
  if (!user) return null;

  return (
    <nav className="navbar">
      <h2>Credwork</h2>
      <div className="nav-links">
        {user.role === 'WORKER' && (
          <>
            <a href="/worker/profile">Profile</a>
            <a href="/worker/jobs">Find Jobs</a>
          </>
        )}
        {user.role === 'EMPLOYER' && (
          <>
            <a href="/employer/dashboard">Dashboard</a>
          </>
        )}
        {user.role === 'ADMIN' && (
          <>
            <a href="/admin/verifications">Verifications</a>
            <a href="/admin/disputes">Disputes</a>
          </>
        )}
        <button className="btn btn-secondary" style={{marginLeft: '1.5rem'}} onClick={logout}>Logout</button>
      </div>
    </nav>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <NavBar />
        <div className="container">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route element={<PrivateRoute roles={['WORKER']} />}>
              <Route path="/worker/profile" element={<WorkerProfile />} />
              <Route path="/worker/jobs" element={<WorkerJobs />} />
            </Route>

            <Route element={<PrivateRoute roles={['EMPLOYER']} />}>
              <Route path="/employer/dashboard" element={<EmployerDashboard />} />
              <Route path="/employer/job/:id" element={<EmployerJob />} />
            </Route>

            <Route element={<PrivateRoute roles={['ADMIN']} />}>
              <Route path="/admin/verifications" element={<AdminVerifications />} />
              <Route path="/admin/disputes" element={<AdminDisputes />} />
            </Route>

            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
