import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import TrustScoreBadge from '../../components/TrustScoreBadge';

export default function WorkerProfile() {
  const [profile, setProfile] = useState(null);
  const [history, setHistory] = useState([]);
  const { fetchWithAuth, user } = useAuth();
  // Using jwt decoded userId for URL instead of workerId for simplicity on frontend, or fetch generic profile route
  // Wait, backend route is: /workers/:id/profile. So we need the worker id or user id. We assume the backend expects user ID here based on our controller.

  useEffect(() => {
    // Decoding token manually or relying on backend. 
    // The backend uses req.params.id which we treat as user_id in findWorkerByUserId.
    const userId = JSON.parse(atob(user.token.split('.')[1])).userId;
    
    fetchWithAuth(`/workers/${userId}/profile`).then(res => setProfile(res.data)).catch(console.error);
    fetchWithAuth(`/workers/${userId}/score`).then(res => setHistory(res.data.history)).catch(console.error);
  }, []);

  if (!profile) return <div>Loading...</div>;

  return (
    <div className="card">
      <div className="flex justify-between align-center">
        <h2>My Profile</h2>
        <TrustScoreBadge score={profile.trust_score} />
      </div>
      <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>
        Phone: {profile.User?.phone} <br/>
        Verified: {profile.verified ? '✅ Yes' : '❌ No'}
      </p>

      <h3 style={{ marginTop: '2rem' }}>Score History</h3>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Type</th>
            <th>Delta</th>
            <th>Reason</th>
          </tr>
        </thead>
        <tbody>
          {history.map(ev => (
            <tr key={ev.id}>
              <td>{new Date(ev.created_at).toLocaleDateString()}</td>
              <td>{ev.event_type}</td>
              <td style={{ color: ev.delta > 0 ? 'var(--score-trusted)' : 'var(--score-unverified)' }}>
                {ev.delta > 0 ? '+' : ''}{ev.delta}
              </td>
              <td>{ev.reason}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
