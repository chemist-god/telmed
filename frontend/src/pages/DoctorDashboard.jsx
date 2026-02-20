import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const styles = {
  page: { padding: '2rem', maxWidth: '1100px', margin: '0 auto', background: '#f0f7ff', minHeight: 'calc(100vh - 60px)' },
  title: { fontSize: '1.8rem', fontWeight: '700', color: '#0077b6', margin: 0 },
  subtitle: { color: '#6c757d', marginTop: '0.3rem' },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', margin: '1.5rem 0' },
  stat: { background: 'white', borderRadius: '12px', padding: '1.2rem', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,119,182,0.1)' },
  statNum: { fontSize: '2rem', fontWeight: '800', color: '#0077b6' },
  statLabel: { color: '#6c757d', fontSize: '0.85rem', marginTop: '0.2rem' },
  section: { background: 'white', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 2px 8px rgba(0,119,182,0.1)' },
  sectionTitle: { fontSize: '1.2rem', fontWeight: '600', color: '#0077b6', marginBottom: '1rem', borderBottom: '2px solid #e8f4fd', paddingBottom: '0.5rem', marginTop: 0 },
  card: { border: '1px solid #e8f4fd', borderRadius: '10px', padding: '1rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  acceptBtn: { padding: '6px 16px', background: '#2f9e44', color: 'white', border: 'none', borderRadius: '20px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' },
  viewBtn: { padding: '6px 16px', background: '#0077b6', color: 'white', border: 'none', borderRadius: '20px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' },
  badge: (status) => ({ padding: '3px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600', background: status === 'active' ? '#d3f9d8' : status === 'pending' ? '#fff3cd' : status === 'completed' ? '#d0ebff' : '#fde8e8', color: status === 'active' ? '#2f9e44' : status === 'pending' ? '#e67700' : status === 'completed' ? '#1971c2' : '#c92a2a' })
};

export default function DoctorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [consultations, setConsultations] = useState([]);

  useEffect(() => {
    api.get('/consultations').then(r => setConsultations(r.data));
  }, []);

  const handleAccept = async (e, id) => {
    e.stopPropagation();
    const res = await api.patch(`/consultations/${id}/status`, { status: 'active' });
    setConsultations(prev => prev.map(c => c._id === id ? res.data : c));
    navigate(`/consultation/${id}`);
  };

  const pending = consultations.filter(c => c.status === 'pending');
  const active = consultations.filter(c => c.status === 'active');
  const completed = consultations.filter(c => c.status === 'completed');

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Doctor Dashboard</h1>
      <p style={styles.subtitle}>Welcome, Dr. {user?.name} {user?.specialization ? `· ${user.specialization}` : ''}</p>

      <div style={styles.statsRow}>
        <div style={styles.stat}><div style={styles.statNum}>{consultations.length}</div><div style={styles.statLabel}>Total</div></div>
        <div style={styles.stat}><div style={styles.statNum}>{pending.length}</div><div style={styles.statLabel}>Pending</div></div>
        <div style={styles.stat}><div style={styles.statNum}>{active.length}</div><div style={styles.statLabel}>Active</div></div>
        <div style={styles.stat}><div style={styles.statNum}>{completed.length}</div><div style={styles.statLabel}>Completed</div></div>
      </div>

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Pending Requests ({pending.length})</h2>
        {pending.length === 0 ? <p style={{ color: '#6c757d', textAlign: 'center', padding: '1rem' }}>No pending consultations</p> : pending.map(c => (
          <div key={c._id} style={styles.card}>
            <div>
              <div style={{ fontWeight: '600' }}>{c.patient?.name}</div>
              <div style={{ color: '#6c757d', fontSize: '0.85rem' }}>{c.symptoms?.slice(0, 80)}</div>
              <div style={{ color: '#adb5bd', fontSize: '0.8rem', marginTop: '2px' }}>{new Date(c.createdAt).toLocaleDateString()} · {c.type}</div>
            </div>
            <button onClick={(e) => handleAccept(e, c._id)} style={styles.acceptBtn}>Accept</button>
          </div>
        ))}
      </div>

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Active Consultations ({active.length})</h2>
        {active.length === 0 ? <p style={{ color: '#6c757d', textAlign: 'center', padding: '1rem' }}>No active consultations</p> : active.map(c => (
          <div key={c._id} style={{ ...styles.card, cursor: 'pointer' }} onClick={() => navigate(`/consultation/${c._id}`)}>
            <div>
              <div style={{ fontWeight: '600' }}>{c.patient?.name}</div>
              <div style={{ color: '#6c757d', fontSize: '0.85rem' }}>{c.symptoms?.slice(0, 80)}</div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span style={styles.badge('active')}>active</span>
              <button style={styles.viewBtn} onClick={() => navigate(`/consultation/${c._id}`)}>Open</button>
            </div>
          </div>
        ))}
      </div>

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Completed ({completed.length})</h2>
        {completed.length === 0 ? <p style={{ color: '#6c757d', textAlign: 'center', padding: '1rem' }}>No completed consultations yet</p> : completed.map(c => (
          <div key={c._id} style={{ ...styles.card, cursor: 'pointer' }} onClick={() => navigate(`/consultation/${c._id}`)}>
            <div>
              <div style={{ fontWeight: '600' }}>{c.patient?.name}</div>
              <div style={{ color: '#6c757d', fontSize: '0.85rem' }}>{c.symptoms?.slice(0, 80)}</div>
              <div style={{ color: '#adb5bd', fontSize: '0.8rem' }}>{c.endedAt ? new Date(c.endedAt).toLocaleDateString() : ''}</div>
            </div>
            <span style={styles.badge('completed')}>completed</span>
          </div>
        ))}
      </div>
    </div>
  );
}
