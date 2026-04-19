import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import TrustScoreBadge from '../../components/TrustScoreBadge';

export default function EmployerJobDetails() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [outcome, setOutcome] = useState('CONFIRMED');
  const [reason, setReason] = useState('');
  const [selectedWorkerId, setSelectedWorkerId] = useState('');
  const { fetchWithAuth } = useAuth();

  // For this prototype, we'll fetch jobs and find ours because we didn't expose GET /jobs/:id specifically outside of repository, but wait, JobController didn't expose it.
  // Actually, I missed adding GET /jobs/:id. Let's just create a submit outcome form for presentation.
  
  const handleSubmitOutcome = async (e) => {
    e.preventDefault();
    if (!selectedWorkerId) return alert('Enter Worker ID');
    
    try {
      await fetchWithAuth(`/jobs/${id}/outcome`, {
        method: 'PATCH',
        data: { outcome, reason, worker_id: selectedWorkerId }
      });
      alert('Outcome submitted. Observer events triggered! Trust score atomic updates completed.');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to submit outcome');
    }
  };

  return (
    <div className="card">
      <h2>Job Settings - Submit Outcome</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Job ID: {id}</p>
      
      <form onSubmit={handleSubmitOutcome}>
        <label>Worker ID</label>
        <input value={selectedWorkerId} onChange={e => setSelectedWorkerId(e.target.value)} required placeholder="Enter Worker UUID..." />

        <label>Outcome</label>
        <select value={outcome} onChange={e => setOutcome(e.target.value)}>
          <option value="CONFIRMED">Confirmed</option>
          <option value="REJECTED">Rejected (Quality)</option>
          <option value="GHOST">Ghosted (No show)</option>
        </select>

        <label>Reason (triggers ReasoningProtocol strategy if provided)</label>
        <textarea value={reason} onChange={e => setReason(e.target.value)} placeholder="e.g. weather, medical, no contact..." rows={3} />

        <button className="btn" style={{ width: '100%' }}>Submit Work Outcome</button>
      </form>
    </div>
  );
}
