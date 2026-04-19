import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

export default function Login() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const API_BASE = import.meta.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_BASE}/auth/login`, { phone, password });
      login(res.data.token, res.data.role);
      if (res.data.role === 'WORKER') navigate('/worker/profile');
      else if (res.data.role === 'EMPLOYER') navigate('/employer/dashboard');
      else navigate('/admin/verifications');
    } catch (err) {
      alert(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="card" style={{ maxWidth: '400px', margin: '4rem auto' }}>
      <h2 className="text-center">Credwork Login</h2>
      <form onSubmit={handleSubmit} style={{ marginTop: '2rem' }}>
        <input type="text" placeholder="Phone" value={phone} onChange={e => setPhone(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
        <button className="btn" style={{ width: '100%' }}>Login</button>
      </form>
      <div className="text-center" style={{ marginTop: '1rem' }}>
        <a href="/register" style={{ color: 'var(--accent-color)', textDecoration: 'none' }}>Need an account? Register</a>
      </div>
    </div>
  );
}
