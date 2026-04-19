import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Register() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('WORKER');
  const [orgName, setOrgName] = useState('');
  const navigate = useNavigate();

  const API_BASE = import.meta.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/auth/register`, { phone, password, role, org_name: orgName });
      navigate('/login');
    } catch (err) {
      alert(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div className="card" style={{ maxWidth: '400px', margin: '4rem auto' }}>
      <h2 className="text-center">Register to Credwork</h2>
      <form onSubmit={handleSubmit} style={{ marginTop: '2rem' }}>
        <input type="text" placeholder="Phone" value={phone} onChange={e => setPhone(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
        
        <select value={role} onChange={e => setRole(e.target.value)}>
          <option value="WORKER">Worker</option>
          <option value="EMPLOYER">Employer</option>
        </select>

        {role === 'EMPLOYER' && (
          <input type="text" placeholder="Organization Name" value={orgName} onChange={e => setOrgName(e.target.value)} required />
        )}

        <button className="btn" style={{ width: '100%' }}>Register</button>
      </form>
      <div className="text-center" style={{ marginTop: '1rem' }}>
        <a href="/login" style={{ color: 'var(--accent-color)', textDecoration: 'none' }}>Already have an account?</a>
      </div>
    </div>
  );
}
