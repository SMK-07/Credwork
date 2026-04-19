import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function AdminVerifications() {
  const [verifications, setVerifications] = useState([]);
  const { fetchWithAuth } = useAuth();

  useEffect(() => {
    fetchWithAuth('/admin/verifications').then(res => setVerifications(res.data)).catch(console.error);
  }, []);

  const handleResolve = async (id, status) => {
    try {
      await fetchWithAuth(`/admin/verifications/${id}`, {
        method: 'PATCH',
        data: { status }
      });
      setVerifications(v => v.filter(item => item.id !== id));
      alert('Verification resolved as ' + status);
    } catch (e) {
      alert('Error: ' + (e.response?.data?.error || e.message));
    }
  };

  return (
    <div>
      <h2>Pending Verifications</h2>
      <table style={{ marginTop: '2rem' }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Type</th>
            <th>Document</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {verifications.map(v => (
            <tr key={v.id}>
              <td>{v.id}</td>
              <td>{v.doc_type}</td>
              <td>{v.doc_path}</td>
              <td className="flex gap-1">
                <button className="btn" onClick={() => handleResolve(v.id, 'APPROVED')} style={{ backgroundColor: 'var(--score-trusted)' }}>Approve</button>
                <button className="btn btn-secondary" onClick={() => handleResolve(v.id, 'REJECTED')} style={{ color: 'var(--score-unverified)', borderColor: 'var(--score-unverified)' }}>Reject</button>
              </td>
            </tr>
          ))}
          {verifications.length === 0 && (
            <tr><td colSpan="4" className="text-center" style={{ padding: '2rem' }}>No pending verifications.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
