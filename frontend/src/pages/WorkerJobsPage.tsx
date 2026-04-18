import React, { Component } from 'react';
import { AuthContext } from '../context/AuthContext';
import { apiClient } from '../api/ApiClient';
import { Job } from '../types';

interface State {
  jobs: Job[];
  loading: boolean;
  error: string;
  skillFilter: string;
  applyingJobId: string | null;
  applyMsg: string;
}

// Phase 10 — Worker Jobs page class component
export class WorkerJobsPage extends Component<Record<string, never>, State> {
  static contextType = AuthContext;
  declare context: React.ContextType<typeof AuthContext>;

  constructor(props: Record<string, never>) {
    super(props);
    this.state = {
      jobs: [],
      loading: true,
      error: '',
      skillFilter: '',
      applyingJobId: null,
      applyMsg: '',
    };
  }

  async componentDidMount(): Promise<void> {
    await this.fetchJobs();
  }

  private async fetchJobs(): Promise<void> {
    const { skillFilter } = this.state;
    this.setState({ loading: true, error: '' });
    try {
      const params = skillFilter ? `?skill=${encodeURIComponent(skillFilter)}` : '';
      const jobs = await apiClient.get<Job[]>(`/jobs${params}`);
      this.setState({ jobs, loading: false });
    } catch {
      this.setState({ error: 'Failed to load jobs', loading: false });
    }
  }

  private async handleApply(jobId: string): Promise<void> {
    this.setState({ applyingJobId: jobId, applyMsg: '' });
    try {
      await apiClient.post('/applications', { jobId });
      this.setState({ applyMsg: 'Application submitted!', applyingJobId: null });
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      this.setState({
        applyMsg: axiosErr.response?.data?.error ?? 'Failed to apply',
        applyingJobId: null,
      });
    }
  }

  public render(): React.ReactNode {
    const { jobs, loading, error, skillFilter, applyingJobId, applyMsg } = this.state;

    return (
      <div className="animate-fade-in">
        <div className="page-header flex justify-between items-center" style={{ flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 className="page-title">Browse Jobs</h1>
            <p className="page-subtitle">Open positions matching your skills</p>
          </div>
        </div>

        {/* Skill Filter */}
        <div className="card mb-6" style={{ padding: '16px 24px' }}>
          <div className="flex items-center gap-3">
            <input
              id="skill-filter"
              type="text"
              className="form-input"
              placeholder="Filter by skill (e.g. Plumbing)"
              value={skillFilter}
              onChange={(e) => this.setState({ skillFilter: e.target.value })}
              style={{ maxWidth: '320px' }}
            />
            <button
              id="filter-btn"
              className="btn btn-secondary"
              onClick={() => this.fetchJobs()}
            >
               Search
            </button>
            {skillFilter && (
              <button
                className="btn btn-ghost"
                onClick={() => this.setState({ skillFilter: '' }, () => this.fetchJobs())}
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {applyMsg && (
          <div
            className={`alert mb-4 ${applyMsg.includes('submitted') ? 'alert-success' : 'alert-error'}`}
          >
            {applyMsg}
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
            <div className="empty-state-title">No open jobs found</div>
            <div className="empty-state-desc">
              {skillFilter ? `No jobs require "${skillFilter}"` : 'Check back later for new postings'}
            </div>
          </div>
        ) : (
          <div className="jobs-grid">
            {jobs.map((job) => (
              <div key={job._id} className="job-card">
                <div className="flex justify-between items-center mb-3">
                  <h3 style={{ color: 'var(--color-text)', fontSize: '1rem' }}>{job.title}</h3>
                  <span className="status-badge status-open">Open</span>
                </div>
                {job.description && (
                  <p className="text-muted text-sm mb-3" style={{ lineHeight: 1.5 }}>
                    {job.description}
                  </p>
                )}
                {job.requiredSkills.length > 0 && (
                  <div className="flex gap-1 mb-4" style={{ flexWrap: 'wrap' }}>
                    {job.requiredSkills.map((skill) => (
                      <span key={skill} className="skill-tag">{skill}</span>
                    ))}
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted">
                    {new Date(job.createdAt).toLocaleDateString('en-IN')}
                  </span>
                  <button
                    id={`apply-job-${job._id}`}
                    className="btn btn-primary btn-sm"
                    onClick={() => this.handleApply(job._id)}
                    disabled={applyingJobId === job._id}
                  >
                    {applyingJobId === job._id ? 'Applying...' : 'Apply →'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
}
