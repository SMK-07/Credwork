import React, { Component } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AuthContext } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { PrivateRoute } from './components/PrivateRoute';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { WorkerProfilePage } from './pages/WorkerProfilePage';
import { WorkerJobsPage } from './pages/WorkerJobsPage';
import { EmployerDashboardPage } from './pages/EmployerDashboardPage';
import { EmployerJobDetailPage } from './pages/EmployerJobDetailPage';
import { AdminVerificationsPage } from './pages/AdminVerificationsPage';
import { AdminDisputesPage } from './pages/AdminDisputesPage';
import { UserRole } from './types';

// LandingRedirect: redirects authenticated users to their dashboard
class LandingRedirect extends Component {
  static contextType = AuthContext;
  declare context: React.ContextType<typeof AuthContext>;

  public render(): React.ReactNode {
    const { isAuthenticated, user } = this.context;
    if (!isAuthenticated || !user) return <Navigate to="/login" replace />;

    const roleMap: Record<UserRole, string> = {
      [UserRole.WORKER]: '/worker/profile',
      [UserRole.EMPLOYER]: '/employer/dashboard',
      [UserRole.ADMIN]: '/admin/verifications',
    };
    return <Navigate to={roleMap[user.role]} replace />;
  }
}

// JobDetailWrapper: extracts jobId from URL for EmployerJobDetailPage
interface JDWProps { path?: string }
class JobDetailWrapper extends Component<JDWProps> {
  public render(): React.ReactNode {
    // Extract jobId from window.location.pathname: /employer/job/:id
    const parts = window.location.pathname.split('/');
    const jobId = parts[parts.length - 1];
    return <EmployerJobDetailPage jobId={jobId} />;
  }
}

// Root App class component — wraps everything in AuthProvider + BrowserRouter
class App extends Component {
  public render(): React.ReactNode {
    return (
      <AuthProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <div className="page-wrapper">
            <Navbar />
            <main className="main-content">
              <Routes>
                {/* Public */}
                <Route path="/" element={<LandingRedirect />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Worker routes */}
                <Route
                  path="/worker/profile"
                  element={
                    <PrivateRoute allowedRoles={[UserRole.WORKER]}>
                      <WorkerProfilePage />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/worker/jobs"
                  element={
                    <PrivateRoute allowedRoles={[UserRole.WORKER]}>
                      <WorkerJobsPage />
                    </PrivateRoute>
                  }
                />

                {/* Employer routes */}
                <Route
                  path="/employer/dashboard"
                  element={
                    <PrivateRoute allowedRoles={[UserRole.EMPLOYER]}>
                      <EmployerDashboardPage />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/employer/job/:id"
                  element={
                    <PrivateRoute allowedRoles={[UserRole.EMPLOYER]}>
                      <JobDetailWrapper />
                    </PrivateRoute>
                  }
                />

                {/* Admin routes */}
                <Route
                  path="/admin/verifications"
                  element={
                    <PrivateRoute allowedRoles={[UserRole.ADMIN]}>
                      <AdminVerificationsPage />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/admin/disputes"
                  element={
                    <PrivateRoute allowedRoles={[UserRole.ADMIN]}>
                      <AdminDisputesPage />
                    </PrivateRoute>
                  }
                />

                {/* 404 fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
        </BrowserRouter>
      </AuthProvider>
    );
  }
}

export default App;
