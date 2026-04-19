import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function AdminDisputes() {
  const [disputes, setDisputes] = useState([]);
  const { fetchWithAuth } = useAuth();

  useEffect(() => {
    fetchWithAuth('/admin/disputes')
      .then(res => setDisputes(res.data))
      .catch(console.error);
  }, []);

  const handleResolve = async (id, resolution) => {
    try {
      await fetchWithAuth(`/disputes/${id}/resolve`, {
        method: 'PATCH',
        data: { resolution }
      });
      setDisputes(d => d.filter(item => item.id !== id));
      alert('Dispute resolved: ' + resolution);
    } catch (e) {
      alert('Error: ' + (e.response?.data?.error || e.message));
    }
  };

  return (
    <div>
      <h2>Open Disputes</h2>
      <table style={{ marginTop: '2rem' }}>
        <thead>
          <tr>
            <th>Application ID</th>
            <th>Description</th>
            <th>Date Raised</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {disputes.map(d => (
            <tr key={d.id}>
              <td>{d.application_id}</td>
              <td>{d.description}</td>
              <td>{new Date(d.created_at).toLocaleDateString()}</td>
              <td className="flex gap-1" style={{ flexDirection: 'column' }}>
                <button className="btn btn-secondary" onClick={() => handleResolve(d.id, 'WORKER_FAVOUR')}>Worker Favour (+4.0)</button>
                <button className="btn btn-secondary" onClick={() => handleResolve(d.id, 'WORKER_FAULT')} style={{ borderColor: 'var(--score-unverified)', color: 'var(--score-unverified)' }}>Worker Fault (-6.0)</button>
              </td>
            </tr>
          ))}
          {disputes.length === 0 && (
            <tr><td colSpan="4" className="text-center" style={{ padding: '2rem' }}>No open disputes.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
