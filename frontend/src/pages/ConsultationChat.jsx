import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import VideoCall from '../components/VideoCall';

const styles = {
  page: { display: 'flex', height: 'calc(100vh - 60px)', background: '#f0f7ff' },
  sidebar: { width: '280px', background: 'white', padding: '1.5rem', borderRight: '1px solid #e8f4fd', overflowY: 'auto', flexShrink: 0 },
  main: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  chatHeader: { background: 'white', padding: '1rem 1.5rem', borderBottom: '1px solid #e8f4fd', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  messages: { flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  msgBubble: (isOwn) => ({ maxWidth: '70%', padding: '0.75rem 1rem', borderRadius: isOwn ? '16px 16px 4px 16px' : '16px 16px 16px 4px', background: isOwn ? 'linear-gradient(135deg, #0077b6, #00b4d8)' : 'white', color: isOwn ? 'white' : '#212529', alignSelf: isOwn ? 'flex-end' : 'flex-start', boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }),
  msgMeta: (isOwn) => ({ fontSize: '0.75rem', color: isOwn ? 'rgba(255,255,255,0.7)' : '#adb5bd', marginTop: '4px', textAlign: isOwn ? 'right' : 'left' }),
  inputArea: { background: 'white', padding: '1rem 1.5rem', borderTop: '1px solid #e8f4fd', display: 'flex', gap: '0.75rem' },
  input: { flex: 1, padding: '0.75rem 1rem', border: '1.5px solid #dee2e6', borderRadius: '24px', outline: 'none', fontSize: '0.95rem' },
  sendBtn: { padding: '0.75rem 1.5rem', background: 'linear-gradient(135deg, #0077b6, #00b4d8)', color: 'white', border: 'none', borderRadius: '24px', cursor: 'pointer', fontWeight: '600' },
  videoBtn: { padding: '6px 16px', background: '#2f9e44', color: 'white', border: 'none', borderRadius: '20px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' },
  completeBtn: { padding: '6px 16px', background: '#e63946', color: 'white', border: 'none', borderRadius: '20px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' },
  badge: (status) => ({ padding: '3px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600', display: 'inline-block', background: status === 'active' ? '#d3f9d8' : status === 'pending' ? '#fff3cd' : '#d0ebff', color: status === 'active' ? '#2f9e44' : status === 'pending' ? '#e67700' : '#1971c2' }),
  infoRow: { marginBottom: '1rem' },
  infoLabel: { fontSize: '0.75rem', color: '#adb5bd', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' },
  infoValue: { fontSize: '0.9rem', color: '#212529', marginTop: '2px' }
};

export default function ConsultationChat() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [consultation, setConsultation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [socket, setSocket] = useState(null);
  const [showVideo, setShowVideo] = useState(false);
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    api.get(`/consultations/${id}`).then(r => setConsultation(r.data));
    api.get(`/messages/${id}`).then(r => setMessages(r.data));

    const token = localStorage.getItem('token');
    const sock = io({ auth: { token } });
    sock.emit('join-consultation', id);
    sock.on('new-message', (msg) => setMessages(prev => [...prev, msg]));
    sock.on('typing', (data) => { if (data.userId !== user._id) setTyping(data.isTyping); });
    setSocket(sock);

    return () => sock.disconnect();
  }, [id]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    socket.emit('send-message', { consultationId: id, content: input });
    setInput('');
  };

  const handleComplete = async () => {
    const res = await api.patch(`/consultations/${id}/status`, { status: 'completed' });
    setConsultation(res.data);
  };

  const handleTyping = (val) => {
    setInput(val);
    socket?.emit('typing', { consultationId: id, isTyping: val.length > 0 });
  };

  const other = user?.role === 'doctor' ? consultation?.patient : consultation?.doctor;

  return (
    <div style={styles.page}>
      <div style={styles.sidebar}>
        <h3 style={{ color: '#0077b6', marginTop: 0, marginBottom: '1.5rem', fontSize: '1.1rem' }}>Consultation Info</h3>
        {consultation && (
          <>
            <div style={styles.infoRow}><div style={styles.infoLabel}>Status</div><div><span style={styles.badge(consultation.status)}>{consultation.status}</span></div></div>
            <div style={styles.infoRow}><div style={styles.infoLabel}>Type</div><div style={styles.infoValue}>{consultation.type}</div></div>
            <div style={styles.infoRow}><div style={styles.infoLabel}>{user?.role === 'doctor' ? 'Patient' : 'Doctor'}</div><div style={styles.infoValue}>{other ? (user?.role === 'patient' ? `Dr. ${other.name}` : other.name) : 'Not assigned'}</div></div>
            {user?.role === 'doctor' && consultation.patient && <div style={styles.infoRow}><div style={styles.infoLabel}>Patient Email</div><div style={styles.infoValue}>{consultation.patient.email}</div></div>}
            <div style={styles.infoRow}><div style={styles.infoLabel}>Symptoms</div><div style={styles.infoValue}>{consultation.symptoms || 'N/A'}</div></div>
            <div style={styles.infoRow}><div style={styles.infoLabel}>Started</div><div style={styles.infoValue}>{consultation.startedAt ? new Date(consultation.startedAt).toLocaleString() : 'N/A'}</div></div>
          </>
        )}
        {user?.role === 'doctor' && consultation?.status === 'active' && (
          <button onClick={handleComplete} style={{ ...styles.completeBtn, width: '100%', marginTop: '1rem', padding: '10px' }}>Mark Complete</button>
        )}
        <button onClick={() => navigate(-1)} style={{ width: '100%', padding: '10px', marginTop: '0.75rem', background: 'transparent', border: '1.5px solid #dee2e6', borderRadius: '8px', cursor: 'pointer', color: '#6c757d' }}>← Back</button>
      </div>

      <div style={styles.main}>
        <div style={styles.chatHeader}>
          <div>
            <div style={{ fontWeight: '600', color: '#212529' }}>{other ? (user?.role === 'patient' ? `Dr. ${other.name}` : other.name) : 'Consultation Chat'}</div>
            {typing && <div style={{ color: '#6c757d', fontSize: '0.8rem' }}>typing...</div>}
          </div>
          {consultation?.status === 'active' && (
            <button onClick={() => setShowVideo(true)} style={styles.videoBtn}>📹 Video Call</button>
          )}
        </div>

        <div style={styles.messages}>
          {messages.map((msg) => {
            const isOwn = String(msg.sender?._id) === String(user?._id);
            return (
              <div key={msg._id} style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={styles.msgBubble(isOwn)}>{msg.content}</div>
                <div style={styles.msgMeta(isOwn)}>{msg.sender?.name} · {new Date(msg.createdAt).toLocaleTimeString()}</div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={sendMessage} style={styles.inputArea}>
          <input style={styles.input} value={input} onChange={e => handleTyping(e.target.value)} placeholder={consultation?.status === 'active' ? 'Type a message...' : 'Consultation is not active'} disabled={consultation?.status !== 'active'} />
          <button type="submit" style={styles.sendBtn} disabled={consultation?.status !== 'active'}>Send</button>
        </form>
      </div>

      {showVideo && socket && <VideoCall socket={socket} consultationId={id} onClose={() => setShowVideo(false)} />}
    </div>
  );
}
