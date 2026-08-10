# API Documentation

Base URL (local): `http://localhost:5000/api`
Base URL (production): `https://smart-bus-tracking-abpb.onrender.com/api`

All protected routes require a header: `Authorization: Bearer <token>`

---

## Auth

### POST /auth/register
Register a new user. Public registration always creates `role: "passenger"` (backend enforces this regardless of what's sent).

**Body:**
```json
{ "name": "string", "email": "string", "password": "string", "phone": "string" }
```
**Response:** `201` — `{ success, token, user }`

### POST /auth/login
**Body:** `{ "email": "string", "password": "string" }`
**Response:** `200` — `{ success, token, user }`

### GET /auth/me
🔒 Protected. Returns the logged-in user's profile (password excluded).

### GET /auth/drivers
🔒 Admin only. Returns all users with `role: "driver"`.

### PUT /auth/drivers/:id
🔒 Admin only. Update a driver's info.

### DELETE /auth/drivers/:id
🔒 Admin only. Delete a driver.

---

## Stops

| Method | Endpoint | Access |
|---|---|---|
| GET | /stops | Public |
| GET | /stops/:id | Public |
| POST | /stops | Admin |
| PUT | /stops/:id | Admin |
| DELETE | /stops/:id | Admin |

**Create body:** `{ "stopName": "string", "longitude": number, "latitude": number }`

---

## Routes

| Method | Endpoint | Access |
|---|---|---|
| GET | /routes | Public |
| GET | /routes/:id | Public |
| POST | /routes | Admin |
| PUT | /routes/:id | Admin |
| DELETE | /routes/:id | Admin |

**Create body:**
```json
{
  "routeName": "string",
  "routeNumber": "string",
  "startPoint": "string",
  "endPoint": "string",
  "stops": [{ "stop": "stopId", "order": 1 }]
}
```

---

## Buses

| Method | Endpoint | Access |
|---|---|---|
| GET | /buses | Public |
| GET | /buses/:id | Public |
| POST | /buses | Admin |
| PUT | /buses/:id | Admin |
| DELETE | /buses/:id | Admin |

**Create body:**
```json
{
  "busNumber": "string",
  "busType": "college | private",
  "capacity": number,
  "assignedDriver": "userId",
  "currentRoute": "routeId"
}
```

---

## Trips (Driver Actions)

| Method | Endpoint | Access |
|---|---|---|
| GET | /trips/live-locations | Public |
| GET | /trips/my-status | Driver |
| POST | /trips/start | Driver |
| POST | /trips/stop | Driver |
| POST | /trips/update-location | Driver |

**Start body:** `{ "busId": "string", "routeId": "string" }`
**Stop body:** `{ "tripId": "string" }`
**Update-location body:** `{ "tripId": "string", "longitude": number, "latitude": number, "speed": number, "heading": number }`

---

## Notifications

| Method | Endpoint | Access |
|---|---|---|
| GET | /notifications | Protected |
| PUT | /notifications/favorite-stop | Protected |

---

## Socket.IO Events

**Client → Server:**
- `joinBusRoom(busId)` — subscribe to a specific bus's updates
- `leaveBusRoom(busId)`
- `joinAdminRoom()` — subscribe to all buses

**Server → Client:**
- `tripStarted` — `{ tripId, busId, routeId, startTime }`
- `tripStopped` — `{ tripId, busId, endTime }`
- `locationUpdate` — `{ busId, tripId, longitude, latitude, speed, heading, lastUpdated }`
- `etaUpdate` — `{ busId, tripId, etaList: [{ stopId, stopName, order, distanceMeters, etaSeconds, etaFormatted }] }`
- `busNearStop` — `{ busId, tripId, stopId, stopName, distanceMeters, message }`