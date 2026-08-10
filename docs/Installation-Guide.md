# Installation Guide

## Prerequisites
- Node.js (LTS, v20+)
- Git
- A MongoDB Atlas account (free tier) — see Atlas setup below
- VS Code (recommended)

## 1. Clone the Repository
```bash
git clone https://github.com/aajesh-cloud/smart-bus-tracking.git
cd smart-bus-tracking
```

## 2. MongoDB Atlas Setup
1. Create a free cluster at https://www.mongodb.com/cloud/atlas
2. Create a database user (username + password)
3. Network Access → allow `0.0.0.0/0` (development)
4. Copy your connection string

## 3. Backend Setup
```bash
cd backend
npm install
```
Create `backend/.env`:
```env
PORT=5000
MONGO_URI=<your Atlas connection string>
JWT_SECRET=<generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))">
JWT_EXPIRES_IN=7d
```
Run:
```bash
npm run dev
```
Confirm: `✅ MongoDB Atlas connected successfully` and `🚀 Server running on http://localhost:5000`

## 4. Passenger Frontend Setup
```bash
cd frontend
npm install
```
Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```
Run:
```bash
npm run dev
```
Open http://localhost:5173

## 5. Driver App Setup
```bash
cd mobile-driver
npm install
```
Create `mobile-driver/.env` (same values as frontend's `.env`).
Run:
```bash
npm run dev
```
Open http://localhost:5174

## 6. Create Your First Admin
Use Postman or curl:
```bash
POST http://localhost:5000/api/auth/register
Body: { "name": "Admin", "email": "admin@example.com", "password": "admin123456", "role": "admin" }
```

## 7. Seed Basic Data
Log in as admin on the frontend → create Stops → create a Route (assign stops) → create a Driver → create a Bus (assign driver + route).

## Troubleshooting
See the main README or contact the project author. Common issues: MongoDB SRV DNS failures on mobile hotspots (use the standard `mongodb://` connection string with explicit shard hostnames instead of `mongodb+srv://`).