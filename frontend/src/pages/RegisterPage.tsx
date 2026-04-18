import React, { Component } from 'react';
import { AuthContext } from '../context/AuthContext';
import { apiClient } from '../api/ApiClient';
import { UserRole } from '../types';

interface State {
  email: string;
  password: string;
  role: UserRole;
  orgName: string;
  skills: string;
  loading: boolean;
  error: string;
}

// Phase 10 — Register page class component refactored for email/password
export class RegisterPage extends Component<Record<string, never>, State> {
  static contextType = AuthContext;
  declare context: React.ContextType<typeof AuthContext>;

  constructor(props: Record<string, never>) {
    super(props);
    this.state = {
      email: '',
      password: '',
      role: UserRole.WORKER,
      orgName: '',
      skills: '',
      loading: false,
      error: '',
    };
  }

  private async handleRegister(): Promise<void> {
    const { email, password, role, orgName, skills } = this.state;
    if (!email || !email.includes('@')) {
      this.setState({ error: 'Please enter a valid email address' });
      return;
    }
    if (!password || password.length < 6) {
      this.setState({ error: 'Password must be at least 6 characters' });
      return;
    }
    this.setState({ loading: true, error: '' });

    try {
      const payload: Record<string, unknown> = { email, password, role };
      if (role === UserRole.EMPLOYER) payload.orgName = orgName || 'My Organisation';
      if (role === UserRole.WORKER) {
        payload.skills = skills.split(',').map((s) => s.trim()).filter(Boolean);
      }

      const res = await apiClient.post<{ token: string; userId: string; role: UserRole }>(
        '/auth/register',
        payload,
      );

      this.context.login(res.token ?? '', res.userId, res.role);
      const redirect = res.role === UserRole.WORKER
        ? '/worker/profile'
        : res.role === UserRole.EMPLOYER
        ? '/employer/dashboard'
        : '/admin/verifications';
      window.location.href = redirect;
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      this.setState({
        error: axiosErr.response?.data?.error ?? 'Registration failed',
        loading: false,
      });
    }
  }

  public render(): React.ReactNode {
    const { email, password, role, orgName, skills, loading, error } = this.state;

    return (
      <div className="auth-container animate-fade-in">
        <div className="auth-card">
          <div className="auth-logo"> Credwork</div>
          <h2 className="auth-title">Create Account</h2>
          <p className="auth-subtitle">Join India's trust-first labour platform</p>

          {error && (
            <div className="alert alert-error mb-4"> {error}</div>
          )}

          <div className="animate-fade-in">
            <div className="form-group">
              <label className="form-label" htmlFor="register-email">Email Address</label>
              <input
                id="register-email"
                type="email"
                className="form-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => this.setState({ email: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">I am a...</label>
              <div className="role-selector">
                {[UserRole.WORKER, UserRole.EMPLOYER].map((r) => (
                  <button
                    key={r}
                    id={`role-${r.toLowerCase()}`}
                    type="button"
                    className={`role-option ${role === r ? 'active' : ''}`}
                    onClick={() => this.setState({ role: r })}
                  >
                    <div className="role-option-icon">
                      {r === UserRole.WORKER ? '' : ''}
                    </div>
                    <div className="role-option-label">{r}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="register-password">Password</label>
              <input
                id="register-password"
                type="password"
                className="form-input"
                placeholder="Min. 6 characters"
                value={password}
                onChange={(e) => this.setState({ password: e.target.value })}
              />
            </div>

            {role === UserRole.WORKER && (
              <div className="form-group">
                <label className="form-label" htmlFor="skills-input">Skills (comma-separated)</label>
                <input
                  id="skills-input"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Plumbing, Electrical, Painting"
                  value={skills}
                  onChange={(e) => this.setState({ skills: e.target.value })}
                />
              </div>
            )}

            {role === UserRole.EMPLOYER && (
              <div className="form-group">
                <label className="form-label" htmlFor="org-name">Organisation Name</label>
                <input
                  id="org-name"
                  type="text"
                  className="form-input"
                  placeholder="Your company name"
                  value={orgName}
                  onChange={(e) => this.setState({ orgName: e.target.value })}
                />
              </div>
            )}

            <button
              id="register-submit-btn"
              className="btn btn-primary btn-full btn-lg mt-4"
              onClick={() => this.handleRegister()}
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Create Account ✓'}
            </button>
            <p className="text-center text-muted text-sm mt-4">
              Already have an account? <a href="/login">Login</a>
            </p>
          </div>
        </div>
      </div>
    );
  }
}
