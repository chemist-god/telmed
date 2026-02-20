import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const styles = {
  page: { minHeight: '100vh', background: 'linear-gradient(135deg, #0077b6 0%, #00b4d8 50%, #90e0ef 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  card: { background: 'white', borderRadius: '16px', padding: '2.5rem', width: '100%', maxWidth: '420px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' },
  title: { textAlign: 'center', color: '#0077b6', marginBottom: '0.5rem', fontSize: '2rem', fontWeight: '800' },
  subtitle: { textAlign: 'center', color: '#6c757d', marginBottom: '2rem', fontSize: '0.95rem' },
  label: { display: 'block', marginBottom: '0.4rem', color: '#495057', fontWeight: '500', fontSize: '0.9rem' },
  input: { width: '100%', padding: '0.75rem 1rem', border: '1.5px solid #dee2e6', borderRadius: '8px', fontSize: '1rem', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' },
  group: { marginBottom: '1.2rem' },
  btn: { width: '100%', padding: '0.85rem', background: 'linear-gradient(135deg, #0077b6, #00b4d8)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer', marginTop: '0.5rem' },
  error: { background: '#fff5f5', color: '#e63946', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem', border: '1px solid #ffc9c9' },
  link: { textAlign: 'center', marginTop: '1.5rem', color: '#6c757d', fontSize: '0.9rem' }
};

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      navigate(user.role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>⚕ CELMED</h1>
        <p style={styles.subtitle}>Digital Healthcare Platform</p>
        {error && <div style={styles.error}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div style={styles.group}>
            <label style={styles.label}>Email Address</label>
            <input style={styles.input} type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="you@example.com" required />
          </div>
          <div style={styles.group}>
            <label style={styles.label}>Password</label>
            <input style={styles.input} type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="••••••••" required />
          </div>
          <button type="submit" style={styles.btn} disabled={loading}>{loading ? 'Signing in...' : 'Sign In'}</button>
        </form>
        <p style={styles.link}>Don't have an account? <Link to="/register" style={{ color: '#0077b6', fontWeight: '600' }}>Register</Link></p>
      </div>
    </div>
  );
}
