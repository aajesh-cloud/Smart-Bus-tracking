# Project Report: Smart Bus Tracking System

## 1. Introduction
The Smart Bus Tracking System is a full-stack web application enabling real-time tracking of college and private buses. It addresses the common problem of passengers not knowing when their bus will arrive, by providing live GPS-based tracking, ETA calculation, and proximity notifications.

## 2. Objectives
- Provide live, map-based bus tracking for passengers
- Enable drivers to broadcast GPS location from their phone browser
- Give administrators full control over buses, routes, stops, and drivers
- Implement real-time communication using WebSockets
- Deploy the system as a publicly accessible, working web application

## 3. System Overview
The system consists of three independently deployable applications communicating with a shared backend:
1. Passenger web application (map, search, notifications, admin dashboard)
2. Driver web application (trip controls, GPS sharing)
3. Backend REST API + WebSocket server

## 4. Technology Justification
- **MongoDB** was chosen for its flexible schema, native GeoJSON/geospatial support, and free cloud hosting via Atlas
- **Socket.IO** was chosen over plain WebSockets for its room-based broadcasting and automatic reconnection handling
- **Leaflet + OpenStreetMap** was chosen over Google Maps to avoid API key/billing requirements
- **JWT** was chosen for stateless authentication, avoiding server-side session storage

## 5. Key Features Implemented
[List each feature — reuse the Features section from README.md]

## 6. Challenges Faced & Solutions
- **MongoDB SRV DNS failures on mobile hotspot**: resolved by switching from `mongodb+srv://` to a standard `mongodb://` connection string with explicit shard hostnames
- **Mongoose 7+ middleware syntax change**: `pre("save")` hooks no longer accept a `next` callback in async functions; resolved by using implicit completion instead
- **Browser Geolocation requiring HTTPS on mobile**: resolved by deploying to Vercel (automatic HTTPS), rather than relying on local network IP testing
- **Coordinate order mismatch (GeoJSON vs Leaflet)**: standardized via a single `toLeafletCoords()` helper used everywhere

## 7. Testing
Full integration testing was performed across all three applications together (see Architecture doc), simulating a complete real-world flow: admin setup → driver trip → passenger live tracking → notification delivery.

## 8. Future Enhancements
- Push notifications (via service workers) instead of in-browser toasts only
- Historical trip analytics/reporting for admins
- Native mobile app wrapper (React Native) for the driver app
- Rate-limiting and refresh tokens for improved security

## 9. Conclusion
This project demonstrates a complete, working real-time full-stack system, covering backend API design, authentication, database modeling, WebSocket communication, geospatial calculations, responsive UI design, and cloud deployment.