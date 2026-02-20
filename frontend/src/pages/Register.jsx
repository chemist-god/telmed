import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const styles = {
  page: { minHeight: '100vh', background: 'linear-gradient(135deg, #0077b6 0%, #00b4d8 50%, #90e0ef 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' },
  card: { background: 'white', borderRadius: '16px', padding: '2.5rem', width: '100%', maxWidth: '480px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' },
  title: { textAlign: 'center', color: '#0077b6', marginBottom: '0.5rem', fontSize: '1.8rem', fontWeight: '800' },
  subtitle: { textAlign: 'center', color: '#6c757d', marginBottom: '2rem', fontSize: '0.95rem' },
  label: { display: 'block', marginBottom: '0.4rem', color: '#495057', fontWeight: '500', fontSize: '0.9rem' },
  input: { width: '100%', padding: '0.75rem 1rem', border: '1.5px solid #dee2e6', borderRadius: '8px', fontSize: '1rem', outline: 'none', boxSizing: 'border-box' },
  select: { width: '100%', padding: '0.75rem 1rem', border: '1.5px solid #dee2e6', borderRadius: '8px', fontSize: '1rem', outline: 'none', boxSizing: 'border-box', background: 'white' },
  group: { marginBottom: '1.2rem' },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' },
  btn: { width: '100%', padding: '0.85rem', background: 'linear-gradient(135deg, #0077b6, #00b4d8)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer', marginTop: '0.5rem' },
  error: { background: '#fff5f5', color: '#e63946', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem', border: '1px solid #ffc9c9' },
  link: { textAlign: 'center', marginTop: '1.5rem', color: '#6c757d', fontSize: '0.9rem' }
};

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'patient', specialization: '', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await register(form);
      navigate(user.role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>⚕ CELMED</h1>
        <p style={styles.subtitle}>Create your account</p>
        {error && <div style={styles.error}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div style={styles.group}>
            <label style={styles.label}>Full Name</label>
            <input style={styles.input} type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="John Doe" required />
          </div>
          <div style={styles.row}>
            <div style={styles.group}>
              <label style={styles.label}>Email</label>
              <input style={styles.input} type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="you@example.com" required />
            </div>
            <div style={styles.group}>
              <label style={styles.label}>Phone</label>
              <input style={styles.input} type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+1234567890" />
            </div>
          </div>
          <div style={styles.group}>
            <label style={styles.label}>Password</label>
            <input style={styles.input} type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="Min. 6 characters" required minLength={6} />
          </div>
          <div style={styles.group}>
            <label style={styles.label}>Role</label>
            <select style={styles.select} value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
              <option value="patient">Patient</option>
              <option value="doctor">Doctor</option>
            </select>
          </div>
          {form.role === 'doctor' && (
            <div style={styles.group}>
              <label style={styles.label}>Specialization</label>
              <input style={styles.input} type="text" value={form.specialization} onChange={e => setForm({...form, specialization: e.target.value})} placeholder="e.g., Cardiology, General Practice" />
            </div>
          )}
          <button type="submit" style={styles.btn} disabled={loading}>{loading ? 'Creating account...' : 'Create Account'}</button>
        </form>
        <p style={styles.link}>Already have an account? <Link to="/login" style={{ color: '#0077b6', fontWeight: '600' }}>Sign In</Link></p>
      </div>
    </div>
  );
}
