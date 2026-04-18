import React, { Component } from 'react';
import { apiClient } from '../api/ApiClient';
import { Verification, VerificationStatus } from '../types';

interface State {
  verifications: Verification[];
  loading: boolean;
  error: string;
  actionId: string | null;
  msg: string;
}

// Phase 10 — Admin Verifications page class component
export class AdminVerificationsPage extends Component<Record<string, never>, State> {
  constructor(props: Record<string, never>) {
    super(props);
    this.state = { verifications: [], loading: true, error: '', actionId: null, msg: '' };
  }

  async componentDidMount(): Promise<void> {
    await this.fetchVerifications();
  }

  private async fetchVerifications(): Promise<void> {
    this.setState({ loading: true, error: '' });
    try {
      const verifications = await apiClient.get<Verification[]>('/admin/verifications');
      this.setState({ verifications, loading: false });
    } catch {
      this.setState({ error: 'Failed to load verifications', loading: false });
    }
  }

  private async handleAction(id: string, action: 'approve' | 'reject', note?: string): Promise<void> {
    this.setState({ actionId: id, msg: '' });
    try {
      await apiClient.patch(`/admin/verifications/${id}`, { action, adminNote: note });
      this.setState({ msg: `Verification ${action}d successfully`, actionId: null });
      await this.fetchVerifications();
    } catch {
      this.setState({ msg: 'Action failed', actionId: null });
    }
  }

  public render(): React.ReactNode {
    const { verifications, loading, error, actionId, msg } = this.state;

    return (
      <div className="animate-fade-in">
        <div className="page-header">
          <h1 className="page-title">ID Verifications</h1>
          <p className="page-subtitle">Review and approve worker identity documents</p>
        </div>

        {msg && (
          <div className={`alert mb-4 ${msg.includes('fail') ? 'alert-error' : 'alert-success'}`}>
            {msg}
          </div>
        )}
        {error && <div className="alert alert-error mb-4">{error}</div>}

        {loading ? (
          <div className="loading-container"><div className="spinner" /><p>Loading...</p></div>
        ) : verifications.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"></div>
            <div className="empty-state-title">No pending verifications</div>
            <div className="empty-state-desc">All documents have been reviewed</div>
          </div>
        ) : (
          <div className="card">
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Worker ID</th>
                    <th>Document Type</th>
                    <th>Document</th>
                    <th>Status</th>
                    <th>Submitted</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {verifications.map((v) => (
                    <tr key={v._id}>
                      <td className="text-muted text-sm">{(v.workerId as string).slice(-8)}</td>
                      <td>{v.docType}</td>
                      <td>
                        <a
                          href={`/api/uploads/${v.docPath.split('/').pop()}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-ghost btn-sm"
                        >
                           View
                        </a>
                      </td>
                      <td>
                        <span
                          className={`status-badge ${
                            v.status === VerificationStatus.PENDING
                              ? 'status-pending'
                              : v.status === VerificationStatus.APPROVED
                              ? 'status-approved'
                              : 'status-rejected'
                          }`}
                        >
                          {v.status}
                        </span>
                      </td>
                      <td className="text-muted text-sm">
                        {new Date(v.createdAt).toLocaleDateString('en-IN')}
                      </td>
                      <td>
                        <div className="flex gap-2">
                          <button
                            id={`approve-${v._id}`}
                            className="btn btn-success btn-sm"
                            onClick={() => this.handleAction(v._id, 'approve')}
                            disabled={actionId === v._id || v.status !== VerificationStatus.PENDING}
                          >
                            ✓ Approve
                          </button>
                          <button
                            id={`reject-${v._id}`}
                            className="btn btn-danger btn-sm"
                            onClick={() => this.handleAction(v._id, 'reject')}
                            disabled={actionId === v._id || v.status !== VerificationStatus.PENDING}
                          >
                            ✕ Reject
                          </button>
                        </div>
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
