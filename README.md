# CELMED – Digital Healthcare Platform

**CELMED** is an AI-powered health intelligence network designed to transform patient care in Africa. It provides a decentralized, patient-owned health record system with real-time telemedicine consultations.

## Features (Phase 1 MVP)

- **Patient registration & login** – Secure JWT-based authentication
- **Doctor registration & login** – Role-based access control
- **Real-time consultations** – Chat, video (WebRTC), and voice via Socket.IO
- **Doctor's portal** – Accept/manage consultations, create health records
- **Patient dashboard** – Request consultations, view health records
- **EHR** – Electronic health records per patient

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js, Express, Socket.IO |
| Database | MongoDB (Mongoose) |
| Auth | JWT (HS256) |
| Frontend | React 18, Vite, React Router v6 |
| Real-time | Socket.IO client |
| Video | WebRTC (peer-to-peer) |

## Getting Started

### Prerequisites
- Node.js ≥ 18
- MongoDB (local or Atlas)

### Backend

```bash
cd backend
cp .env.example .env        # fill in MONGODB_URI and JWT_SECRET
npm install
npm run dev                 # starts on port 5000
```

### Frontend

```bash
cd frontend
npm install
npm run dev                 # starts on port 5173 (proxies API to :5000)
```

Open http://localhost:5173 in your browser.

## Project Structure

```
celmed/
├── backend/
│   ├── server.js              # Express + Socket.IO entry point
│   └── src/
│       ├── config/db.js       # MongoDB connection
│       ├── middleware/auth.js # JWT auth middleware
│       ├── models/            # User, Consultation, Message, HealthRecord
│       ├── routes/            # REST API routes
│       └── socket/handlers.js # Real-time event handlers
└── frontend/
    └── src/
        ├── context/AuthContext.jsx
        ├── pages/             # Login, Register, Dashboards, Chat, Records
        └── components/        # Navbar, ProtectedRoute, VideoCall
```

## Roadmap

| Phase | Timeline | Features |
|-------|----------|----------|
| **Phase 1** ✅ | 0–6 months | Patient/doctor auth, chat & video consultations, basic EHR |
| **Phase 2** | 6–12 months | Blockchain-anchored EHR, IPFS storage, ZKP privacy |
| **Phase 3** | 12–24 months | AI-driven clinical decision support, predictive analytics |

## Environment Variables

See `backend/.env.example` for required configuration.

## License

MIT
