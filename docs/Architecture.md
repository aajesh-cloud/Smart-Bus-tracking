# System Architecture

## High-Level Overview

Three independent applications share one backend:

```mermaid
graph TD
    A[Passenger Frontend<br/>React + Vite] -->|REST API + WebSocket| D[Backend<br/>Express + Socket.IO]
    B[Driver App<br/>React + Vite] -->|REST API| D
    C[Admin Dashboard<br/>inside Passenger Frontend] -->|REST API| D
    D -->|Mongoose| E[(MongoDB Atlas)]
    D -->|Broadcasts| A
    B -->|Browser Geolocation API| B
```

## Data Flow: Live Location Update

```mermaid
sequenceDiagram
    participant Driver as Driver's Phone
    participant Backend as Express Server
    participant DB as MongoDB
    participant Passenger as Passenger's Browser

    Driver->>Backend: POST /trips/update-location
    Backend->>DB: Upsert LiveLocation
    Backend->>Backend: Calculate distance/ETA to each stop
    Backend-->>Passenger: Socket.IO emit "locationUpdate"
    Backend-->>Passenger: Socket.IO emit "etaUpdate"
    alt Bus near a stop
        Backend->>DB: Save Notification
        Backend-->>Passenger: Socket.IO emit "busNearStop"
    end
    Backend-->>Driver: 200 OK
```

## Why Three Separate Apps
- **Backend**: long-running Node process, required for persistent Socket.IO connections
- **Passenger Frontend**: desktop/mobile browser, map-heavy
- **Driver App**: mobile-first, GPS-focused, deliberately lightweight (no map library)

## Authentication Flow
JWT-based, stateless. Token issued on login/register, stored in `localStorage`, attached via `Authorization: Bearer <token>` header on every request (via axios interceptor). Role (`passenger`/`driver`/`admin`) embedded in token payload and re-verified against the database on every protected request.

## Real-Time Layer
Socket.IO rooms scope broadcasts: `bus-<busId>` rooms let passengers subscribe only to buses they're tracking; `admin-room` lets the admin dashboard see everything at once.