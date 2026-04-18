import React, { Component } from 'react';
import { apiClient } from '../api/ApiClient';
import { Dispute, DisputeStatus } from '../types';

interface State {
  disputes: Dispute[];
  loading: boolean;
  error: string;
  resolvingId: string | null;
  resolutionMap: Record<string, 'WORKER_FAVOUR' | 'WORKER_FAULT'>;
  msg: string;
}

// Phase 10 — Admin Disputes page class component
export class AdminDisputesPage extends Component<Record<string, never>, State> {
  constructor(props: Record<string, never>) {
    super(props);
    this.state = {
      disputes: [],
      loading: true,
      error: '',
      resolvingId: null,
      resolutionMap: {},
      msg: '',
    };
  }

  async componentDidMount(): Promise<void> {
    await this.fetchDisputes();
  }

  private async fetchDisputes(): Promise<void> {
    this.setState({ loading: true, error: '' });
    try {
      const disputes = await apiClient.get<Dispute[]>('/disputes');
      this.setState({ disputes, loading: false });
    } catch {
      this.setState({ error: 'Failed to load disputes', loading: false });
    }
  }

  private async handleResolve(id: string): Promise<void> {
    const resolution = this.state.resolutionMap[id];
    if (!resolution) {
      this.setState({ msg: 'Select a resolution first' });
      return;
    }
    this.setState({ resolvingId: id, msg: '' });
    try {
      await apiClient.patch(`/disputes/${id}/resolve`, { resolution });
      this.setState({ msg: `Dispute resolved: ${resolution}`, resolvingId: null });
      await this.fetchDisputes();
    } catch {
      this.setState({ msg: 'Failed to resolve dispute', resolvingId: null });
    }
  }

  public render(): React.ReactNode {
    const { disputes, loading, error, resolvingId, resolutionMap, msg } = this.state;

    return (
      <div className="animate-fade-in">
        <div className="page-header">
          <h1 className="page-title">Dispute Queue</h1>
          <p className="page-subtitle">Review and resolve worker-employer disputes</p>
        </div>

        <div className="stats-grid mb-8">
          <div className="stat-card">
            <div className="stat-value">{disputes.length}</div>
            <div className="stat-label">Total</div>
          </div>
          <div className="stat-card">
            <div className="stat-value" style={{ color: '#eab308' }}>
              {disputes.filter((d) => d.status === DisputeStatus.OPEN).length}
            </div>
            <div className="stat-label">Open</div>
          </div>
          <div className="stat-card">
            <div className="stat-value" style={{ color: '#22c55e' }}>
              {disputes.filter((d) => d.status === DisputeStatus.RESOLVED).length}
            </div>
            <div className="stat-label">Resolved</div>
          </div>
        </div>

        {msg && (
          <div className={`alert mb-4 ${msg.includes('fail') || msg.includes('Select') ? 'alert-error' : 'alert-success'}`}>
            {msg}
          </div>
        )}
        {error && <div className="alert alert-error mb-4">{error}</div>}

        {loading ? (
          <div className="loading-container"><div className="spinner" /><p>Loading...</p></div>
        ) : disputes.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">⚖️</div>
            <div className="empty-state-title">No disputes</div>
            <div className="empty-state-desc">All clear — no pending disputes</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {disputes.map((d) => (
              <div key={d._id} className="card">
                <div className="flex justify-between items-center mb-3" style={{ flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <span className="text-xs text-muted">Raised by: </span>
                    <span className="text-sm font-medium">{d.raisedByRole}</span>
                  </div>
                  <span
                    className={`status-badge ${
                      d.status === DisputeStatus.OPEN
                        ? 'status-open'
                        : d.status === DisputeStatus.UNDER_REVIEW
                        ? 'status-assigned'
                        : 'status-completed'
                    }`}
                  >
                    {d.status}
                  </span>
                </div>

                <p className="mb-4" style={{ color: 'var(--color-text)', lineHeight: 1.6 }}>
                  "{d.description}"
                </p>

                <div className="text-xs text-muted mb-4">
                  Filed: {new Date(d.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'long', year: 'numeric',
                  })}
                </div>

                {d.status !== DisputeStatus.RESOLVED && (
                  <div className="flex items-center gap-3" style={{ flexWrap: 'wrap' }}>
                    <select
                      id={`resolution-select-${d._id}`}
                      className="form-select"
                      style={{ maxWidth: '220px' }}
                      value={resolutionMap[d._id] ?? ''}
                      onChange={(e) =>
                        this.setState({
                          resolutionMap: {
                            ...resolutionMap,
                            [d._id]: e.target.value as 'WORKER_FAVOUR' | 'WORKER_FAULT',
                          },
                        })
                      }
                    >
                      <option value="">Select resolution...</option>
                      <option value="WORKER_FAVOUR">Worker's Favour (+4 pts)</option>
                      <option value="WORKER_FAULT">Worker's Fault (-6 pts)</option>
                    </select>
                    <button
                      id={`resolve-btn-${d._id}`}
                      className="btn btn-primary btn-sm"
                      onClick={() => this.handleResolve(d._id)}
                      disabled={resolvingId === d._id || !resolutionMap[d._id]}
                    >
                      {resolvingId === d._id ? 'Resolving...' : 'Resolve →'}
                    </button>
                  </div>
                )}

                {d.status === DisputeStatus.RESOLVED && d.resolution && (
                  <div className="alert alert-success" style={{ marginTop: 0 }}>
                    Resolved: {d.resolution}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
}
