import React, { Component } from 'react';
import { AuthContext } from '../context/AuthContext';
import { apiClient } from '../api/ApiClient';
import { TrustScoreBadge } from '../components/TrustScoreBadge';
import { WorkerProfile, ScoreEventType } from '../types';

interface State {
  profile: WorkerProfile | null;
  loading: boolean;
  appsLoading: boolean;
  error: string;
  applications: any[];
  uploadFile: File | null;
  uploadDocType: string;
  uploading: boolean;
  uploadMsg: string;
}

// Phase 10 — Worker Profile page class component
export class WorkerProfilePage extends Component<Record<string, never>, State> {
  static contextType = AuthContext;
  declare context: React.ContextType<typeof AuthContext>;

  constructor(props: Record<string, never>) {
    super(props);
    this.state = {
      profile: null,
      applications: [],
      loading: true,
      appsLoading: true,
      error: '',
      uploadFile: null,
      uploadDocType: 'Aadhaar',
      uploading: false,
      uploadMsg: '',
    };
  }

  async componentDidMount(): Promise<void> {
    const user = this.context.user;
    if (!user) return;
    try {
      const profile = await apiClient.get<WorkerProfile>(
        `/workers/${user.userId}/profile`,
      );
      this.setState({ profile, loading: false });
      
      // Fetch Applications
      const applications = await apiClient.get<any[]>('/applications/my');
      this.setState({ applications, appsLoading: false });
    } catch {
      this.setState({ error: 'Failed to load profile details', loading: false, appsLoading: false });
    }
  }

  private async handleUploadVerification(): Promise<void> {
    const { uploadFile, uploadDocType } = this.state;
    if (!uploadFile) {
      this.setState({ uploadMsg: 'Please select a file' });
      return;
    }
    this.setState({ uploading: true, uploadMsg: '' });
    const formData = new FormData();
    formData.append('document', uploadFile);
    formData.append('docType', uploadDocType);
    try {
      await apiClient.postForm('/workers/verify', formData);
      this.setState({ uploadMsg: 'Document submitted for review!', uploading: false });
    } catch {
      this.setState({ uploadMsg: 'Upload failed', uploading: false });
    }
  }

  private getEventLabel(type: ScoreEventType): string {
    const map: Record<ScoreEventType, string> = {
      [ScoreEventType.WORK_CONFIRMED]: ' Work Confirmed',
      [ScoreEventType.WORK_REJECTED]: ' Work Rejected',
      [ScoreEventType.GHOST]: ' Ghost',
      [ScoreEventType.DISPUTE_WON]: '️ Dispute Won',
      [ScoreEventType.DISPUTE_LOST]: '️ Dispute Lost',
    };
    return map[type] ?? type;
  }

  public render(): React.ReactNode {
    const { profile, loading, error, uploadFile, uploadDocType, uploading, uploadMsg } =
      this.state;

    if (loading) {
      return (
        <div className="loading-container">
          <div className="spinner" />
          <p>Loading profile...</p>
        </div>
      );
    }

    if (error) {
      return <div className="alert alert-error">{error}</div>;
    }

    if (!profile) return null;

    return (
      <div className="animate-fade-in">
        <div className="page-header">
          <h1 className="page-title">My Profile</h1>
          <p className="page-subtitle">Your trust record and work history</p>
        </div>

        {/* Score Hero */}
        <div
          className="card mb-8"
          style={{
            background: 'linear-gradient(135deg, rgba(108,99,255,0.12), rgba(0,210,180,0.06))',
            borderColor: 'rgba(108,99,255,0.2)',
          }}
        >
          <div className="flex items-center justify-between gap-6" style={{ flexWrap: 'wrap' }}>
            <div>
              <div
                className="trust-score-number mb-2"
                style={{
                  background: 'linear-gradient(135deg, #8b85ff, #00d2b4)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {profile.trustScore.toFixed(1)}
              </div>
              <div className="text-muted text-sm mb-3">Trust Score / 100</div>
              <TrustScoreBadge score={profile.trustScore} size="lg" />
            </div>
            <div>
              <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                <div className="stat-card">
                  <div className="stat-value">{profile.scoreHistory.length}</div>
                  <div className="stat-label">Events</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{profile.verified ? '✓' : '✗'}</div>
                  <div className="stat-label">Verified</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Skills */}
        <div className="card mb-6">
          <h3 className="mb-4">Skills</h3>
          {profile.skills.length > 0 ? (
            <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
              {profile.skills.map((skill) => (
                <span key={skill} className="skill-tag">{skill}</span>
              ))}
            </div>
          ) : (
            <p className="text-muted">No skills listed yet.</p>
          )}
        </div>

        {/* Upload Verification */}
        {!profile.verified && (
          <div className="card mb-6">
            <h3 className="mb-4"> Upload ID Verification</h3>
            <div className="form-group">
              <label className="form-label" htmlFor="doc-type">Document Type</label>
              <select
                id="doc-type"
                className="form-select"
                value={uploadDocType}
                onChange={(e) => this.setState({ uploadDocType: e.target.value })}
              >
                <option value="Aadhaar">Aadhaar Card</option>
                <option value="PAN">PAN Card</option>
                <option value="Voter ID">Voter ID</option>
                <option value="Passport">Passport</option>
                <option value="Driving Licence">Driving Licence</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="doc-upload">Document File</label>
              <input
                id="doc-upload"
                type="file"
                className="form-input"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={(e) => this.setState({ uploadFile: e.target.files?.[0] ?? null })}
              />
            </div>
            {uploadMsg && (
              <div className={`alert ${uploadMsg.includes('fail') ? 'alert-error' : 'alert-success'} mb-4`}>
                {uploadMsg}
              </div>
            )}
            <button
              id="upload-doc-btn"
              className="btn btn-primary"
              onClick={() => this.handleUploadVerification()}
              disabled={uploading || !uploadFile}
            >
              {uploading ? 'Uploading...' : 'Submit for Verification'}
            </button>
          </div>
        )}

        </div>

        {/* My Applications */}
        <div className="card mb-6">
          <h3 className="mb-6">My Applications</h3>
          {appsLoading ? (
            <div className="flex justify-center p-4"><div className="spinner" /></div>
          ) : applications.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-title">No applications yet</div>
              <div className="empty-state-desc">Apply for jobs to see them here</div>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Job Title</th>
                    <th>Applied On</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app) => (
                    <tr key={app._id}>
                      <td className="font-medium">{app.jobId?.title || 'Unknown Job'}</td>
                      <td className="text-muted text-sm">
                        {new Date(app.appliedAt).toLocaleDateString('en-IN')}
                      </td>
                      <td>
                        <span className={`status-badge status-${app.status.toLowerCase().replace('_', '-')}`}>
                          {app.status}
                        </span>
                        {app.outcome && (
                          <div className="text-xs mt-1" style={{ opacity: 0.8 }}>
                             {app.outcome === 'CONFIRMED' ? 'Verified Work' : app.outcome}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Score History */}
        <div className="card">
          <h3 className="mb-6">Score History</h3>
          {profile.scoreHistory.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon"></div>
              <div className="empty-state-title">No score events yet</div>
              <div className="empty-state-desc">Complete jobs to build your trust score</div>
            </div>
          ) : (
            profile.scoreHistory.map((event) => (
              <div key={event._id} className="score-event">
                <div>
                  <div className="font-medium">{this.getEventLabel(event.eventType)}</div>
                  {event.reason && (
                    <div className="text-muted text-sm">"{event.reason}"</div>
                  )}
                  <div className="text-xs text-muted mt-1">
                    {new Date(event.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
                  </div>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span
                    className={event.delta >= 0 ? 'score-delta-positive' : 'score-delta-negative'}
                  >
                    {event.delta >= 0 ? '+' : ''}{event.delta.toFixed(1)}
                  </span>
                  <span className="text-xs text-muted">
                    {event.scoreBefore.toFixed(1)} → {event.scoreAfter.toFixed(1)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }
}
