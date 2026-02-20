import { useEffect, useRef, useState } from 'react';

const iceConfig = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

export default function VideoCall({ socket, consultationId, onClose }) {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const pcRef = useRef(null);
  const streamRef = useRef(null);
  const [status, setStatus] = useState('Initializing...');

  useEffect(() => {
    let pc;
    const start = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        streamRef.current = stream;
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;

        pc = new RTCPeerConnection(iceConfig);
        pcRef.current = pc;
        stream.getTracks().forEach(track => pc.addTrack(track, stream));

        pc.ontrack = (e) => {
          if (remoteVideoRef.current) remoteVideoRef.current.srcObject = e.streams[0];
          setStatus('Connected');
        };

        pc.onicecandidate = (e) => {
          if (e.candidate) socket.emit('video-signal', { consultationId, signal: { type: 'candidate', candidate: e.candidate } });
        };

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit('video-signal', { consultationId, signal: { type: 'offer', sdp: offer } });
        setStatus('Calling...');
      } catch (err) {
        setStatus('Camera/mic access denied');
      }
    };

    const handleSignal = async ({ signal }) => {
      if (!pcRef.current) return;
      try {
        if (signal.type === 'offer') {
          await pcRef.current.setRemoteDescription(new RTCSessionDescription(signal.sdp));
          const answer = await pcRef.current.createAnswer();
          await pcRef.current.setLocalDescription(answer);
          socket.emit('video-signal', { consultationId, signal: { type: 'answer', sdp: answer } });
        } else if (signal.type === 'answer') {
          await pcRef.current.setRemoteDescription(new RTCSessionDescription(signal.sdp));
        } else if (signal.type === 'candidate') {
          await pcRef.current.addIceCandidate(new RTCIceCandidate(signal.candidate));
        }
      } catch (err) {
        setStatus('Connection error: ' + err.message);
      }
    };

    socket.on('video-signal', handleSignal);
    start();

    return () => {
      socket.off('video-signal', handleSignal);
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
      if (pcRef.current) pcRef.current.close();
    };
  }, [socket, consultationId]);

  const styles = {
    overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
    videoContainer: { display: 'flex', gap: '1rem', marginBottom: '1rem' },
    video: { width: '400px', height: '300px', background: '#111', borderRadius: '8px', objectFit: 'cover' },
    localVideo: { width: '200px', height: '150px', background: '#111', borderRadius: '8px', objectFit: 'cover', border: '2px solid #00b4d8' },
    status: { color: '#90e0ef', marginBottom: '1rem', fontSize: '1rem' },
    closeBtn: { background: '#e63946', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '24px', cursor: 'pointer', fontWeight: '600', fontSize: '1rem' }
  };

  return (
    <div style={styles.overlay}>
      <p style={styles.status}>{status}</p>
      <div style={styles.videoContainer}>
        <video ref={remoteVideoRef} autoPlay playsInline style={styles.video} />
        <video ref={localVideoRef} autoPlay playsInline muted style={styles.localVideo} />
      </div>
      <button onClick={onClose} style={styles.closeBtn}>End Call</button>
    </div>
  );
}
