# Database Design

## Collections & Relationships

```mermaid
erDiagram
    USER ||--o{ BUS : "assignedDriver"
    USER {
        ObjectId _id
        string name
        string email
        string password
        string role
        string licenseNumber
        ObjectId favoriteStop
    }
    BUS ||--o{ TRIP : "has"
    BUS {
        ObjectId _id
        string busNumber
        string busType
        number capacity
        ObjectId assignedDriver
        ObjectId currentRoute
        string status
    }
    ROUTE ||--o{ BUS : "currentRoute"
    ROUTE ||--o{ STOP : "contains (ordered)"
    ROUTE {
        ObjectId _id
        string routeName
        string routeNumber
        array stops
    }
    STOP {
        ObjectId _id
        string stopName
        object location
    }
    TRIP ||--|| LIVELOCATION : "has one active"
    TRIP {
        ObjectId _id
        ObjectId bus
        ObjectId driver
        ObjectId route
        date startTime
        date endTime
        string status
    }
    LIVELOCATION {
        ObjectId _id
        ObjectId bus
        ObjectId trip
        object location
        number speed
        number heading
    }
    NOTIFICATION {
        ObjectId _id
        ObjectId bus
        ObjectId trip
        ObjectId stop
        string message
        number distanceMeters
    }
```

## Design Decisions

**Single User model with a `role` field** — instead of separate User/Driver/Admin collections, one model serves all three, distinguished by `role: "passenger" | "driver" | "admin"`. Avoids duplicate login logic.

**Separate Trip vs LiveLocation** — Trip is a permanent historical record; LiveLocation is a single, constantly-overwritten "current position" document per bus (enforced via `unique: true` + upsert), since only the latest GPS point matters for live tracking.

**GeoJSON for locations** — Stop and LiveLocation store coordinates in GeoJSON `Point` format (`[longitude, latitude]`), enabling MongoDB's `2dsphere` geospatial indexing for future proximity queries.