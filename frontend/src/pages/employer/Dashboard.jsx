import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function EmployerDashboard() {
  const [jobs, setJobs] = useState([]);
  const [title, setTitle] = useState('');
  const { fetchWithAuth, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Only fetch jobs if employer profile is confirmed, wait we will just fetch all jobs and filter manually for simplicity, or 
    // usually we'd have a specific endpoint for employer's own jobs. Let's assume standard listing for proof of concept.
    fetchWithAuth('/jobs').then(res => setJobs(res.data)).catch(console.error);
  }, []);

  const handlePostJob = async (e) => {
    e.preventDefault();
    try {
      await fetchWithAuth('/jobs', {
        method: 'POST',
        data: { title, required_skills: [] }
      });
      setTitle('');
      // Refresh
      const res = await fetchWithAuth('/jobs');
      setJobs(res.data);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to post job');
    }
  };

  return (
    <div>
      <h2>Employer Dashboard</h2>
      
      <div className="card" style={{ marginTop: '2rem' }}>
        <h3>Post a New Job</h3>
        <form onSubmit={handlePostJob} className="flex gap-2" style={{ marginTop: '1rem' }}>
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Job Title" required style={{ marginBottom: 0 }} />
          <button className="btn" style={{ whiteSpace: 'nowrap' }}>Post Job</button>
        </form>
      </div>

      <h3 style={{ marginTop: '2rem' }}>Your Open Jobs</h3>
      {jobs.map(job => (
        <div key={job.id} className="card flex justify-between align-center">
          <div>
            <h4>{job.title}</h4>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.4rem' }}>Status: {job.status}</div>
          </div>
          <button className="btn btn-secondary" onClick={() => navigate(`/employer/job/${job.id}`)}>View Details</button>
        </div>
      ))}
    </div>
  );
}
