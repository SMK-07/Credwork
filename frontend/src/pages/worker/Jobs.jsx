import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function WorkerJobs() {
  const [jobs, setJobs] = useState([]);
  const { fetchWithAuth } = useAuth();

  useEffect(() => {
    fetchWithAuth('/jobs').then(res => setJobs(res.data)).catch(console.error);
  }, []);

  const handleApply = async (jobId) => {
    try {
      await fetchWithAuth('/applications', {
        method: 'POST',
        data: { job_id: jobId }
      });
      alert('Applied successfully!');
    } catch (err) {
      alert('Error applying: ' + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div>
      <h2>Open Jobs</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1.5rem' }}>
        {jobs.map(job => (
          <div key={job.id} className="card" style={{ marginBottom: 0 }}>
            <h3>{job.title}</h3>
            <p style={{ color: 'var(--text-secondary)' }}>By: {job.Employer?.org_name}</p>
            <p style={{ margin: '1rem 0' }}>Requires: {job.required_skills?.join(', ') || 'General'}</p>
            <button className="btn" onClick={() => handleApply(job.id)}>Apply Now</button>
          </div>
        ))}
      </div>
    </div>
  );
}
