import React, { Component } from 'react';
import { apiClient } from '../api/ApiClient';
import { TrustScoreBadge } from '../components/TrustScoreBadge';
import { Job, Application, WorkerProfile, JobStatus, OutcomeType } from '../types';

interface Props {
  jobId: string;
}

interface State {
  job: Job | null;
  applications: Application[];
  workerProfiles: Record<string, WorkerProfile>;
  loading: boolean;
  error: string;
  assigningId: string | null;
  outcomeData: { applicationId: string; workerId: string; outcome: OutcomeType; reason: string } | null;
  submitting: boolean;
  msg: string;
}

// Phase 10 — Employer Job Detail page: applicants with trust scores, assign, confirm outcome
export class EmployerJobDetailPage extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      job: null,
      applications: [],
      workerProfiles: {},
      loading: true,
      error: '',
      assigningId: null,
      outcomeData: null,
      submitting: false,
      msg: '',
    };
  }

  async componentDidMount(): Promise<void> {
    const { jobId } = this.props;
    try {
      const [job, applications] = await Promise.all([
        apiClient.get<Job>(`/jobs/${jobId}`),
        apiClient.get<Application[]>(`/jobs/${jobId}/applications`),
      ]);
      this.setState({ job, applications });

      // Fetch worker profiles for trust scores
      const profiles: Record<string, WorkerProfile> = {};
      await Promise.all(
        applications.map(async (app) => {
          try {
            const profile = await apiClient.get<WorkerProfile>(
              `/workers/${app.workerId}/profile`,
            );
            profiles[app.workerId as string] = profile;
          } catch { /* worker profile unavailable */ }
        }),
      );
      this.setState({ workerProfiles: profiles, loading: false });
    } catch {
      this.setState({ error: 'Failed to load job details', loading: false });
    }
  }

  private async handleAssign(applicationId: string, workerId: string): Promise<void> {
    const { job } = this.state;
    if (!job) return;
    this.setState({ assigningId: applicationId, msg: '' });
    try {
      await apiClient.patch(`/jobs/${job._id}/assign`, { workerId });
      this.setState({ msg: 'Worker assigned!', assigningId: null });
      const updatedJob = await apiClient.get<Job>(`/jobs/${job._id}`);
      this.setState({ job: updatedJob });
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      this.setState({ msg: axiosErr.response?.data?.error ?? 'Assignment failed', assigningId: null });
    }
  }

  private async handleSubmitOutcome(): Promise<void> {
    const { outcomeData, job } = this.state;
    if (!outcomeData || !job) return;
    this.setState({ submitting: true, msg: '' });
    try {
      await apiClient.patch(`/jobs/${job._id}/outcome`, outcomeData);
      this.setState({ msg: 'Outcome recorded — trust score updating...', submitting: false, outcomeData: null });
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      this.setState({ msg: axiosErr.response?.data?.error ?? 'Failed', submitting: false });
    }
  }

  public render(): React.ReactNode {
    const { job, applications, workerProfiles, loading, error, assigningId, outcomeData, submitting, msg } = this.state;

    if (loading) return <div className="loading-container"><div className="spinner" /><p>Loading...</p></div>;
    if (error) return <div className="alert alert-error">{error}</div>;
    if (!job) return null;

    return (
      <div className="animate-fade-in">
        <div className="page-header">
          <a href="/employer/dashboard" className="btn btn-ghost btn-sm mb-4">← Back to Dashboard</a>
          <h1 className="page-title">{job.title}</h1>
          <div className="flex items-center gap-3 mt-2">
            <span className={`status-badge status-${job.status.toLowerCase()}`}>{job.status}</span>
            {job.requiredSkills.map((s) => (
              <span key={s} className="skill-tag">{s}</span>
            ))}
          </div>
        </div>

        {msg && (
          <div className={`alert mb-4 ${msg.includes('fail') || msg.includes('Failed') ? 'alert-error' : 'alert-success'}`}>
            {msg}
          </div>
        )}

        {/* Outcome modal */}
        {outcomeData && (
          <div className="card mb-6 animate-fade-in" style={{ borderColor: 'rgba(234,179,8,0.3)', background: 'rgba(234,179,8,0.05)' }}>
            <h3 className="mb-4">️ Record Outcome</h3>
            <div className="flex gap-3 mb-4" style={{ flexWrap: 'wrap' }}>
              {Object.values(OutcomeType).map((ot) => (
                <button
                  key={ot}
                  id={`outcome-${ot.toLowerCase()}`}
                  className={`btn btn-sm ${outcomeData.outcome === ot ? (ot === OutcomeType.CONFIRMED ? 'btn-success' : ot === OutcomeType.GHOST ? 'btn-danger' : 'btn-warning') : 'btn-ghost'}`}
                  onClick={() => this.setState({ outcomeData: { ...outcomeData, outcome: ot } })}
                >
                  {ot === OutcomeType.CONFIRMED ? '' : ot === OutcomeType.REJECTED ? '' : ''} {ot}
                </button>
              ))}
            </div>
            {(outcomeData.outcome === OutcomeType.REJECTED || outcomeData.outcome === OutcomeType.GHOST) && (
              <div className="form-group">
                <label className="form-label">Reason (optional)</label>
                <textarea
                  className="form-textarea"
                  placeholder="Describe what happened..."
                  value={outcomeData.reason}
                  onChange={(e) => this.setState({ outcomeData: { ...outcomeData, reason: e.target.value } })}
                  style={{ minHeight: '80px' }}
                />
              </div>
            )}
            <div className="flex gap-3">
              <button
                id="submit-outcome-btn"
                className="btn btn-primary"
                onClick={() => this.handleSubmitOutcome()}
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Confirm Outcome →'}
              </button>
              <button className="btn btn-ghost" onClick={() => this.setState({ outcomeData: null })}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Applicants Table */}
        <div className="card">
          <h3 className="mb-4">Applicants ({applications.length})</h3>
          {applications.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon"></div>
              <div className="empty-state-title">No applications yet</div>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Worker</th>
                    <th>Trust Score</th>
                    <th>Status</th>
                    <th>Applied</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app) => {
                    const profile = workerProfiles[app.workerId as string];
                    const isAssigned = job.status === JobStatus.ASSIGNED;
                    return (
                      <tr key={app._id}>
                        <td>{profile?.email ?? `Worker ${(app.workerId as string).slice(-6)}`}</td>
                        <td>
                          {profile ? (
                            <TrustScoreBadge score={profile.trustScore} size="sm" />
                          ) : '—'}
                        </td>
                        <td>
                          <span className={`status-badge status-${app.status.toLowerCase().replace('_', '-')}`}>
                            {app.status}
                          </span>
                        </td>
                        <td className="text-muted text-sm">
                          {new Date(app.appliedAt).toLocaleDateString('en-IN')}
                        </td>
                        <td>
                          <div className="flex gap-2">
                            {job.status === JobStatus.OPEN && (
                              <button
                                id={`assign-${app._id}`}
                                className="btn btn-primary btn-sm"
                                onClick={() => this.handleAssign(app._id, app.workerId as string)}
                                disabled={assigningId === app._id}
                              >
                                {assigningId === app._id ? '...' : 'Assign'}
                              </button>
                            )}
                            {isAssigned && job.assignedWorkerId?.toString() === app.workerId?.toString() && (
                              <button
                                id={`outcome-btn-${app._id}`}
                                className="btn btn-warning btn-sm"
                                onClick={() =>
                                  this.setState({
                                    outcomeData: {
                                      applicationId: app._id,
                                      workerId: app.workerId as string,
                                      outcome: OutcomeType.CONFIRMED,
                                      reason: '',
                                    },
                                  })
                                }
                              >
                                Record Outcome
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }
}
