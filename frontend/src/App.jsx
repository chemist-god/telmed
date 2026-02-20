import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import ConsultationChat from './pages/ConsultationChat';
import HealthRecords from './pages/HealthRecords';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import { useAuth } from './context/AuthContext';

export default function App() {
  const { user } = useAuth();
  return (
    <>
      {user && <Navbar />}
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/patient/dashboard" element={<ProtectedRoute role="patient"><PatientDashboard /></ProtectedRoute>} />
        <Route path="/doctor/dashboard" element={<ProtectedRoute role="doctor"><DoctorDashboard /></ProtectedRoute>} />
        <Route path="/consultation/:id" element={<ProtectedRoute><ConsultationChat /></ProtectedRoute>} />
        <Route path="/health-records" element={<ProtectedRoute><HealthRecords /></ProtectedRoute>} />
      </Routes>
    </>
  );
}
