import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const styles = {
  nav: { background: 'linear-gradient(135deg, #0077b6, #00b4d8)', padding: '0 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '60px', boxShadow: '0 2px 10px rgba(0,0,0,0.15)' },
  brand: { color: 'white', fontWeight: '800', fontSize: '1.5rem', textDecoration: 'none', letterSpacing: '1px' },
  links: { display: 'flex', gap: '1.5rem', alignItems: 'center' },
  link: { color: 'rgba(255,255,255,0.9)', textDecoration: 'none', fontSize: '0.95rem', fontWeight: '500' },
  logoutBtn: { background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.4)', color: 'white', padding: '6px 16px', borderRadius: '20px', cursor: 'pointer', fontWeight: '500' }
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <nav style={styles.nav}>
      <Link to={user?.role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard'} style={styles.brand}>⚕ CELMED</Link>
      <div style={styles.links}>
        {user?.role === 'patient' && <Link to="/patient/dashboard" style={styles.link}>Dashboard</Link>}
        {user?.role === 'doctor' && <Link to="/doctor/dashboard" style={styles.link}>Dashboard</Link>}
        <Link to="/health-records" style={styles.link}>Health Records</Link>
        <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>{user?.name}</span>
        <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
      </div>
    </nav>
  );
}
