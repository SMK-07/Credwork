import React, { Component } from 'react';
import { AuthContext } from '../context/AuthContext';
import { UserRole } from '../types';

// Phase 10 — Navbar class component
export class Navbar extends Component {
  static contextType = AuthContext;
  declare context: React.ContextType<typeof AuthContext>;

  private handleLogout(): void {
    this.context.logout();
    window.location.href = '/login';
  }

  private getDashboardLink(): string {
    if (!this.context.user) return '/login';
    const roleMap: Record<UserRole, string> = {
      [UserRole.WORKER]: '/worker/profile',
      [UserRole.EMPLOYER]: '/employer/dashboard',
      [UserRole.ADMIN]: '/admin/verifications',
    };
    return roleMap[this.context.user.role];
  }

  public render(): React.ReactNode {
    const { isAuthenticated, user } = this.context;

    return (
      <nav className="navbar">
        <a href="/" className="navbar-brand">⚡ Credwork</a>

        <ul className="navbar-links">
          {isAuthenticated && user ? (
            <>
              <li>
                <a href={this.getDashboardLink()}>Dashboard</a>
              </li>
              {user.role === UserRole.WORKER && (
                <>
                  <li><a href="/worker/profile">My Profile</a></li>
                  <li><a href="/worker/jobs">Browse Jobs</a></li>
                </>
              )}
              {user.role === UserRole.EMPLOYER && (
                <li><a href="/employer/dashboard">Jobs</a></li>
              )}
              {user.role === UserRole.ADMIN && (
                <>
                  <li><a href="/admin/verifications">Verifications</a></li>
                  <li><a href="/admin/disputes">Disputes</a></li>
                </>
              )}
              <li>
                <button
                  id="logout-btn"
                  className="btn btn-ghost btn-sm"
                  onClick={() => this.handleLogout()}
                >
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li><a href="/login">Login</a></li>
              <li>
                <a href="/register" className="btn btn-primary btn-sm">Register</a>
              </li>
            </>
          )}
        </ul>
      </nav>
    );
  }
}
