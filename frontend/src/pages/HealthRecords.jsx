import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const styles = {
  page: { padding: '2rem', maxWidth: '900px', margin: '0 auto', background: '#f0f7ff', minHeight: 'calc(100vh - 60px)' },
  title: { fontSize: '1.8rem', fontWeight: '700', color: '#0077b6', marginBottom: '0.3rem' },
  subtitle: { color: '#6c757d', marginBottom: '2rem' },
  section: { background: 'white', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 2px 8px rgba(0,119,182,0.1)' },
  sectionTitle: { fontSize: '1.2rem', fontWeight: '600', color: '#0077b6', marginBottom: '1rem', borderBottom: '2px solid #e8f4fd', paddingBottom: '0.5rem', marginTop: 0 },
  form: { display: 'grid', gap: '1rem' },
  input: { padding: '0.75rem', border: '1.5px solid #dee2e6', borderRadius: '8px', fontSize: '0.95rem', outline: 'none', width: '100%', boxSizing: 'border-box' },
  textarea: { padding: '0.75rem', border: '1.5px solid #dee2e6', borderRadius: '8px', fontSize: '0.95rem', outline: 'none', width: '100%', boxSizing: 'border-box', resize: 'vertical', minHeight: '80px' },
  btn: { padding: '0.75rem 1.5rem', background: 'linear-gradient(135deg, #0077b6, #00b4d8)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' },
  label: { fontWeight: '500', color: '#495057', fontSize: '0.9rem', marginBottom: '0.3rem', display: 'block' },
  card: { border: '1px solid #e8f4fd', borderRadius: '10px', padding: '1.25rem', marginBottom: '1rem' },
  cardTitle: { fontWeight: '600', color: '#0077b6', fontSize: '1rem', marginBottom: '0.5rem' },
  cardMeta: { color: '#6c757d', fontSize: '0.85rem', marginBottom: '0.75rem' },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }
};

export default function HealthRecords() {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ patientId: '', diagnosis: '', prescription: '', notes: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/health-records').then(r => setRecords(r.data));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/health-records', form);
      setRecords(prev => [res.data, ...prev]);
      setShowForm(false);
      setForm({ patientId: '', diagnosis: '', prescription: '', notes: '' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Health Records</h1>
      <p style={styles.subtitle}>{user?.role === 'doctor' ? "Your patients' health records" : 'Your medical history'}</p>

      {user?.role === 'doctor' && (
        <div style={styles.section}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: showForm ? '1rem' : 0, borderBottom: showForm ? '2px solid #e8f4fd' : 'none', paddingBottom: showForm ? '0.75rem' : 0 }}>
            <h2 style={{ ...styles.sectionTitle, margin: 0, border: 'none', padding: 0 }}>Create Health Record</h2>
            <button onClick={() => setShowForm(!showForm)} style={styles.btn}>{showForm ? 'Cancel' : '+ New Record'}</button>
          </div>
          {showForm && (
            <form onSubmit={handleSubmit} style={styles.form}>
              <div>
                <label style={styles.label}>Patient ID</label>
                <input style={styles.input} value={form.patientId} onChange={e => setForm({...form, patientId: e.target.value})} placeholder="Patient's user ID" required />
              </div>
              <div>
                <label style={styles.label}>Diagnosis</label>
                <input style={styles.input} value={form.diagnosis} onChange={e => setForm({...form, diagnosis: e.target.value})} placeholder="Primary diagnosis" required />
              </div>
              <div>
                <label style={styles.label}>Prescription</label>
                <textarea style={styles.textarea} value={form.prescription} onChange={e => setForm({...form, prescription: e.target.value})} placeholder="Medications and dosage..." />
              </div>
              <div>
                <label style={styles.label}>Notes</label>
                <textarea style={styles.textarea} value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="Additional notes..." />
              </div>
              <button type="submit" style={styles.btn} disabled={loading}>{loading ? 'Saving...' : 'Save Record'}</button>
            </form>
          )}
        </div>
      )}

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Records ({records.length})</h2>
        {records.length === 0 ? <p style={{ color: '#6c757d', textAlign: 'center', padding: '2rem' }}>No health records found.</p> : records.map(r => (
          <div key={r._id} style={styles.card}>
            <div style={styles.cardTitle}>{r.diagnosis}</div>
            <div style={styles.cardMeta}>
              {user?.role === 'doctor' ? `Patient: ${r.patient?.name}` : `Doctor: Dr. ${r.doctor?.name}`} · {new Date(r.recordDate).toLocaleDateString()}
            </div>
            {r.prescription && <div style={{ marginBottom: '0.5rem' }}><strong style={{ color: '#495057', fontSize: '0.85rem' }}>Prescription:</strong> <span style={{ color: '#6c757d', fontSize: '0.9rem' }}>{r.prescription}</span></div>}
            {r.notes && <div><strong style={{ color: '#495057', fontSize: '0.85rem' }}>Notes:</strong> <span style={{ color: '#6c757d', fontSize: '0.9rem' }}>{r.notes}</span></div>}
          </div>
        ))}
      </div>
    </div>
  );
}
