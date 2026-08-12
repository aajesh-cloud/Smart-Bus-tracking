# 🚌 Smart Bus Tracking System

A full-stack, real-time college bus tracking system built with the MERN stack (MongoDB, Express, React, Node.js) and Socket.IO. Passengers track buses live on a map, drivers share GPS from their phone, and admins manage the entire fleet through a dashboard.

**Live Demo:**
- Passenger App: https://smart-bus-frontend-lyart.vercel.app/
- Driver App: https://smart-bus-driver.vercel.app/
- Backend API: https://smart-bus-tracking-abpb.onrender.com

## Features

**Passenger**
- Live map with real-time bus positions (Leaflet + OpenStreetMap)
- Road-following route lines (OSRM routing)
- Search buses by number, route, or destination
- Bus status (On Time / Delayed / Cancelled)
- Favorite-stop notifications (toast + notification bell)
- Dark/light theme toggle

**Driver**
- Mobile-optimized login
- Auto-detected assigned bus
- Start/Stop trip controls
- Continuous background GPS sharing (Browser Geolocation API)

**Admin**
- Dashboard with live stats
- Full CRUD: Buses, Routes, Stops, Drivers
- Role-based access control

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js, Express, MongoDB Atlas, Mongoose |
| Real-time | Socket.IO |
| Auth | JWT, bcryptjs |
| Passenger Frontend | React, Vite, React Router, Leaflet |
| Driver App | React, Vite, Browser Geolocation API |
| Routing | OSRM (road-following route lines) |
| Deployment | Render (backend), Vercel (frontend + driver app) |

## Project Structure
## Quick Start

See [`docs/Installation-Guide.md`](docs/Installation-Guide.md) for full setup instructions.

```bash
# Backend
cd backend && npm install && npm run dev

# Frontend (new terminal)
cd frontend && npm install && npm run dev

# Driver App (new terminal)
cd mobile-driver && npm install && npm run dev
```

## Documentation

- [API Documentation](docs/API-Documentation.md)
- [Installation Guide](docs/Installation-Guide.md)
- [Architecture Overview](docs/Architecture.md)
- [Database Design](docs/Database-Design.md)
- [Project Report](docs/Project-Report.md)

## Author

Built as a college project — full-stack development from scratch, covering backend APIs, real-time systems, authentication, mapping, and deployment.