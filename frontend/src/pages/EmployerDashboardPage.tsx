import React, { Component } from 'react';
import { apiClient } from '../api/ApiClient';
import { AuthContext } from '../context/AuthContext';
import { Job, JobStatus } from '../types';

interface State {
  jobs: Job[];
  loading: boolean;
  error: string;
  showForm: boolean;
  title: string;
  description: string;
  skills: string;
  posting: boolean;
  postMsg: string;
}

// Phase 10 — Employer Dashboard page class component
export class EmployerDashboardPage extends Component<Record<string, never>, State> {
  static contextType = AuthContext;
  declare context: React.ContextType<typeof AuthContext>;

  constructor(props: Record<string, never>) {
    super(props);
    this.state = {
      jobs: [],
      loading: true,
      error: '',
      showForm: false,
      title: '',
      description: '',
      skills: '',
      posting: false,
      postMsg: '',
    };
  }

  async componentDidMount(): Promise<void> {
    await this.fetchJobs();
  }

  private async fetchJobs(): Promise<void> {
    this.setState({ loading: true, error: '' });
    try {
      const jobs = await apiClient.get<Job[]>('/jobs/my');
      this.setState({ jobs, loading: false });
    } catch {
      this.setState({ error: 'Failed to load jobs', loading: false });
    }
  }

  private async handlePostJob(): Promise<void> {
    const { title, description, skills } = this.state;
    if (!title) {
      this.setState({ postMsg: 'Job title is required' });
      return;
    }
    this.setState({ posting: true, postMsg: '' });
    try {
      await apiClient.post('/jobs', {
        title,
        description,
        requiredSkills: skills.split(',').map((s) => s.trim()).filter(Boolean),
      });
      this.setState({ posting: false, showForm: false, title: '', description: '', skills: '', postMsg: '' });
      await this.fetchJobs();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      this.setState({ postMsg: axiosErr.response?.data?.error ?? 'Failed to post job', posting: false });
    }
  }

  private getStatusClass(status: JobStatus): string {
    const map: Record<JobStatus, string> = {
      [JobStatus.OPEN]: 'status-open',
      [JobStatus.ASSIGNED]: 'status-assigned',
      [JobStatus.COMPLETED]: 'status-completed',
      [JobStatus.CANCELLED]: 'status-cancelled',
    };
    return map[status];
  }

  public render(): React.ReactNode {
    const { jobs, loading, error, showForm, title, description, skills, posting, postMsg } = this.state;
    const openJobs = jobs.filter((j) => j.status === JobStatus.OPEN).length;
    const assigned = jobs.filter((j) => j.status === JobStatus.ASSIGNED).length;
    const completed = jobs.filter((j) => j.status === JobStatus.COMPLETED).length;

    return (
      <div className="animate-fade-in">
        <div className="page-header flex justify-between items-center" style={{ flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 className="page-title">Employer Dashboard</h1>
            <p className="page-subtitle">Manage your job postings and workers</p>
          </div>
          <button
            id="post-job-toggle"
            className="btn btn-primary"
            onClick={() => this.setState({ showForm: !showForm })}
          >
            {showForm ? '✕ Cancel' : '+ Post Job'}
          </button>
        </div>

        {/* Stats */}
        <div className="stats-grid mb-8">
          <div className="stat-card">
            <div className="stat-value">{jobs.length}</div>
            <div className="stat-label">Total Jobs</div>
          </div>
          <div className="stat-card">
            <div className="stat-value" style={{ color: '#22c55e' }}>{openJobs}</div>
            <div className="stat-label">Open</div>
          </div>
          <div className="stat-card">
            <div className="stat-value" style={{ color: '#8b85ff' }}>{assigned}</div>
            <div className="stat-label">Assigned</div>
          </div>
          <div className="stat-card">
            <div className="stat-value" style={{ color: '#00d2b4' }}>{completed}</div>
            <div className="stat-label">Completed</div>
          </div>
        </div>

        {/* Post Job Form */}
        {showForm && (
          <div className="card mb-6 animate-fade-in">
            <h3 className="mb-4"> Post a New Job</h3>
            {postMsg && (
              <div className={`alert mb-4 ${postMsg.includes('Failed') ? 'alert-error' : 'alert-success'}`}>
                {postMsg}
              </div>
            )}
            <div className="form-group">
              <label className="form-label" htmlFor="job-title">Job Title *</label>
              <input
                id="job-title"
                type="text"
                className="form-input"
                placeholder="e.g. Electrician needed for rewiring"
                value={title}
                onChange={(e) => this.setState({ title: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="job-description">Description</label>
              <textarea
                id="job-description"
                className="form-textarea"
                placeholder="Describe the work requirements..."
                value={description}
                onChange={(e) => this.setState({ description: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="job-skills">Required Skills (comma-separated)</label>
              <input
                id="job-skills"
                type="text"
                className="form-input"
                placeholder="e.g. Electrical, Safety, Tools"
                value={skills}
                onChange={(e) => this.setState({ skills: e.target.value })}
              />
            </div>
            <button
              id="post-job-submit"
              className="btn btn-primary"
              onClick={() => this.handlePostJob()}
              disabled={posting}
            >
              {posting ? 'Posting...' : 'Post Job →'}
            </button>
          </div>
        )}

        {error && <div className="alert alert-error mb-4">{error}</div>}

        {loading ? (
          <div className="loading-container">
            <div className="spinner" />
            <p>Loading jobs...</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"></div>
            <div className="empty-state-title">No jobs posted yet</div>
            <div className="empty-state-desc">Click "Post Job" to get started</div>
          </div>
        ) : (
          <div className="card">
            <h3 className="mb-4">Your Jobs</h3>
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Skills</th>
                    <th>Status</th>
                    <th>Posted</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job) => (
                    <tr key={job._id}>
                      <td style={{ fontWeight: 500 }}>{job.title}</td>
                      <td>
                        {job.requiredSkills.map((s) => (
                          <span key={s} className="skill-tag" style={{ marginRight: '4px' }}>{s}</span>
                        ))}
                      </td>
                      <td>
                        <span className={`status-badge ${this.getStatusClass(job.status)}`}>
                          {job.status}
                        </span>
                      </td>
                      <td className="text-muted text-sm">
                        {new Date(job.createdAt).toLocaleDateString('en-IN')}
                      </td>
                      <td>
                        <a
                          href={`/employer/job/${job._id}`}
                          id={`view-job-${job._id}`}
                          className="btn btn-ghost btn-sm"
                        >
                          View →
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  }
}
