import React, { Component } from 'react';
import { AuthContext } from '../context/AuthContext';
import { apiClient } from '../api/ApiClient';
import { UserRole } from '../types';

interface State {
  email: string;
  password: string;
  loading: boolean;
  error: string;
}

// Phase 10 — Login page class component
export class LoginPage extends Component<Record<string, never>, State> {
  static contextType = AuthContext;
  declare context: React.ContextType<typeof AuthContext>;

  constructor(props: Record<string, never>) {
    super(props);
    this.state = { email: '', password: '', loading: false, error: '' };
  }

  private async handleLogin(): Promise<void> {
    const { email, password } = this.state;
    if (!email || !password) {
      this.setState({ error: 'Email and password are required' });
      return;
    }
    this.setState({ loading: true, error: '' });
    try {
      const res = await apiClient.post<{ token: string; userId: string; role: UserRole }>(
        '/auth/login',
        { email, password },
      );
      this.context.login(res.token, res.userId, res.role);
      const redirect =
        res.role === UserRole.WORKER
          ? '/worker/profile'
          : res.role === UserRole.EMPLOYER
          ? '/employer/dashboard'
          : '/admin/verifications';
      window.location.href = redirect;
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      this.setState({
        error: axiosErr.response?.data?.error ?? 'Login failed',
        loading: false,
      });
    }
  }

  private handleKeyDown(e: React.KeyboardEvent): void {
    if (e.key === 'Enter') this.handleLogin();
  }

  public render(): React.ReactNode {
    const { email, password, loading, error } = this.state;

    return (
      <div className="auth-container animate-fade-in">
        <div className="auth-card">
          <div className="auth-logo">⚡ Credwork</div>
          <h2 className="auth-title">Welcome back</h2>
          <p className="auth-subtitle">Sign in to your account</p>

          {error && <div className="alert alert-error mb-4">⚠ {error}</div>}

          <div className="form-group">
            <label className="form-label" htmlFor="login-email">Email Address</label>
            <input
              id="login-email"
              type="email"
              className="form-input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => this.setState({ email: e.target.value })}
              onKeyDown={(e) => this.handleKeyDown(e)}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              className="form-input"
              placeholder="Your password"
              value={password}
              onChange={(e) => this.setState({ password: e.target.value })}
              onKeyDown={(e) => this.handleKeyDown(e)}
            />
          </div>

          <button
            id="login-btn"
            className="btn btn-primary btn-full btn-lg"
            onClick={() => this.handleLogin()}
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign in →'}
          </button>

          <p className="text-center text-muted text-sm mt-4">
            Don't have an account? <a href="/register">Register</a>
          </p>
        </div>
      </div>
    );
  }
}
