import React, { Component, ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { UserRole } from '../types';

// Phase 9 — PrivateRoute as class component
// Redirects to /login if not authenticated
// Accepts allowedRoles prop to restrict access by role

interface Props {
  children: ReactNode;
  allowedRoles?: UserRole[];
}

export class PrivateRoute extends Component<Props> {
  static contextType = AuthContext;
  declare context: React.ContextType<typeof AuthContext>;

  public render(): ReactNode {
    const { isAuthenticated, user } = this.context;
    const { children, allowedRoles } = this.props;

    if (!isAuthenticated || !user) {
      return <Navigate to="/login" replace />;
    }

    if (allowedRoles && allowedRoles.length > 0) {
      if (!allowedRoles.includes(user.role)) {
        // Redirect to appropriate dashboard based on role
        const dashboardMap: Record<UserRole, string> = {
          [UserRole.WORKER]: '/worker/profile',
          [UserRole.EMPLOYER]: '/employer/dashboard',
          [UserRole.ADMIN]: '/admin/verifications',
        };
        return <Navigate to={dashboardMap[user.role] ?? '/login'} replace />;
      }
    }

    return <>{children}</>;
  }
}
