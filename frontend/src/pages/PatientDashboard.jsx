import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const styles = {
  page: { padding: '2rem', maxWidth: '1100px', margin: '0 auto', background: '#f0f7ff', minHeight: 'calc(100vh - 60px)' },
  header: { marginBottom: '2rem' },
  title: { fontSize: '1.8rem', fontWeight: '700', color: '#0077b6', margin: 0 },
  subtitle: { color: '#6c757d', marginTop: '0.3rem' },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' },
  stat: { background: 'white', borderRadius: '12px', padding: '1.5rem', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,119,182,0.1)' },
  statNum: { fontSize: '2.5rem', fontWeight: '800', color: '#0077b6' },
  statLabel: { color: '#6c757d', fontSize: '0.9rem', marginTop: '0.3rem' },
  section: { background: 'white', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 2px 8px rgba(0,119,182,0.1)' },
  sectionTitle: { fontSize: '1.2rem', fontWeight: '600', color: '#0077b6', marginBottom: '1rem', borderBottom: '2px solid #e8f4fd', paddingBottom: '0.5rem' },
  form: { display: 'grid', gap: '1rem' },
  input: { padding: '0.75rem', border: '1.5px solid #dee2e6', borderRadius: '8px', fontSize: '0.95rem', outline: 'none', width: '100%', boxSizing: 'border-box' },
  textarea: { padding: '0.75rem', border: '1.5px solid #dee2e6', borderRadius: '8px', fontSize: '0.95rem', outline: 'none', width: '100%', boxSizing: 'border-box', resize: 'vertical', minHeight: '80px' },
  select: { padding: '0.75rem', border: '1.5px solid #dee2e6', borderRadius: '8px', fontSize: '0.95rem', outline: 'none', width: '100%', boxSizing: 'border-box', background: 'white' },
  btn: { padding: '0.75rem 1.5rem', background: 'linear-gradient(135deg, #0077b6, #00b4d8)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '0.95rem' },
  consultCard: { border: '1px solid #e8f4fd', borderRadius: '10px', padding: '1rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', transition: 'box-shadow 0.2s' },
  badge: (status) => ({ padding: '3px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600', background: status === 'active' ? '#d3f9d8' : status === 'pending' ? '#fff3cd' : status === 'completed' ? '#d0ebff' : '#fde8e8', color: status === 'active' ? '#2f9e44' : status === 'pending' ? '#e67700' : status === 'completed' ? '#1971c2' : '#c92a2a' }),
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' },
  label: { fontWeight: '500', color: '#495057', fontSize: '0.9rem', marginBottom: '0.3rem', display: 'block' }
};

export default function PatientDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [consultations, setConsultations] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ symptoms: '', type: 'chat', doctorId: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/consultations').then(r => setConsultations(r.data));
    api.get('/consultations/available-doctors').then(r => setDoctors(r.data));
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/consultations', form);
      setConsultations(prev => [res.data, ...prev]);
      setShowForm(false);
      setForm({ symptoms: '', type: 'chat', doctorId: '' });
    } finally {
      setLoading(false);
    }
  };

  const total = consultations.length;
  const active = consultations.filter(c => c.status === 'active').length;
  const pending = consultations.filter(c => c.status === 'pending').length;

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>Welcome, {user?.name}</h1>
        <p style={styles.subtitle}>Manage your healthcare consultations</p>
      </div>

      <div style={styles.statsRow}>
        <div style={styles.stat}><div style={styles.statNum}>{total}</div><div style={styles.statLabel}>Total Consultations</div></div>
        <div style={styles.stat}><div style={styles.statNum}>{active}</div><div style={styles.statLabel}>Active</div></div>
        <div style={styles.stat}><div style={styles.statNum}>{pending}</div><div style={styles.statLabel}>Pending</div></div>
      </div>

      <div style={styles.section}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '2px solid #e8f4fd', paddingBottom: '0.5rem' }}>
          <h2 style={{ ...styles.sectionTitle, margin: 0, border: 'none', padding: 0 }}>New Consultation</h2>
          <button onClick={() => setShowForm(!showForm)} style={styles.btn}>{showForm ? 'Cancel' : '+ New Consultation'}</button>
        </div>
        {showForm && (
          <form onSubmit={handleCreate} style={styles.form}>
            <div>
              <label style={styles.label}>Symptoms / Reason</label>
              <textarea style={styles.textarea} value={form.symptoms} onChange={e => setForm({...form, symptoms: e.target.value})} placeholder="Describe your symptoms..." required />
            </div>
            <div style={styles.row}>
              <div>
                <label style={styles.label}>Consultation Type</label>
                <select style={styles.select} value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                  <option value="chat">Chat</option>
                  <option value="video">Video Call</option>
                  <option value="voice">Voice Call</option>
                </select>
              </div>
              <div>
                <label style={styles.label}>Select Doctor (optional)</label>
                <select style={styles.select} value={form.doctorId} onChange={e => setForm({...form, doctorId: e.target.value})}>
                  <option value="">Any Available Doctor</option>
                  {doctors.map(d => <option key={d._id} value={d._id}>Dr. {d.name} {d.specialization ? `- ${d.specialization}` : ''}</option>)}
                </select>
              </div>
            </div>
            <button type="submit" style={styles.btn} disabled={loading}>{loading ? 'Creating...' : 'Request Consultation'}</button>
          </form>
        )}
      </div>

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>My Consultations</h2>
        {consultations.length === 0 ? <p style={{ color: '#6c757d', textAlign: 'center', padding: '2rem' }}>No consultations yet. Create your first one!</p> : (
          consultations.map(c => (
            <div key={c._id} style={styles.consultCard} onClick={() => navigate(`/consultation/${c._id}`)}>
              <div>
                <div style={{ fontWeight: '600', color: '#212529' }}>{c.doctor ? `Dr. ${c.doctor.name}` : 'Awaiting Doctor'}</div>
                <div style={{ color: '#6c757d', fontSize: '0.85rem', marginTop: '2px' }}>{c.symptoms?.slice(0, 60)}{c.symptoms?.length > 60 ? '...' : ''}</div>
                <div style={{ color: '#adb5bd', fontSize: '0.8rem', marginTop: '4px' }}>{new Date(c.createdAt).toLocaleDateString()} · {c.type}</div>
              </div>
              <span style={styles.badge(c.status)}>{c.status}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
