 NexusFlow

 **Visual IoT Rule Builder & Real-Time Telemetry Processing Platform**

NexusFlow is a real-time IoT monitoring and rule-processing platform designed to process live turbine and sensor telemetry through configurable visual pipelines.

The platform combines a **React Flow-based visual rule builder**, **Node.js/Express backend**, **MongoDB Time-Series storage**, **RxJS stream processing**, and **WebSocket-based real-time communication**.

Users can define telemetry-processing pipelines such as:

**Data Source → Moving Average → Threshold → Action**

The backend processes incoming telemetry in real time, applies configured rules, and triggers actions when defined conditions are satisfied.

---

## 🚀 Project Status

**Current Milestone: Week 2 — Mid-Project Review Completed**

| Area                          | Status                    |
| ----------------------------- | ------------------------- |
| Backend API                   | ✅ Completed               |
| Authentication                | ✅ Completed               |
| Telemetry Ingestion           | ✅ Completed               |
| MongoDB Time-Series Storage   | ✅ Completed               |
| Telemetry Query APIs          | ✅ Completed               |
| WebSocket Telemetry Broadcast | ✅ Completed               |
| RxJS Stream Compiler          | ✅ Completed               |
| Custom Stream Operators       | ✅ Completed               |
| Pipeline Graph API            | ✅ Completed               |
| JWT Protected Graph APIs      | ✅ Completed               |
| Per-Device Stream Isolation   | ✅ Verified                |
| Load Testing                  | ✅ ~5,000 writes/sec       |
| Frontend Builder              | 🔄 Week 1–2 planned scope |
| Live Rule Runner              | ⏳ Week 3                  |
| Activity & Alerts             | ⏳ Week 3                  |
| Webhook/SMS Actions           | ⏳ Week 3–4                |
| Settings                      | ⏳ Week 4                  |

> **Verification:** Backend functionality listed as completed has been run and tested, including server startup, API routes, RxJS pipeline execution, WebSocket broadcasting, and ingestion load testing. Frontend functionality is documented according to the Week 1–2 project scope and should not be considered independently verified from this backend snapshot.

---

# ✨ Key Features

### 🔐 Authentication & Authorization

* User signup and login
* Password hashing using `bcryptjs`
* JWT-based authentication
* Protected backend APIs
* Current-user authentication endpoint
* Role information stored with user accounts

### 📡 Real-Time Telemetry

* Single telemetry ingestion
* Bulk telemetry ingestion
* MongoDB Time-Series collection
* Device-based telemetry history
* Telemetry statistics
* Time-based telemetry rollups
* Mock turbine/device registry
* Real-time WebSocket broadcasting

### ⚙️ Visual Rule Processing

NexusFlow represents rule pipelines as graph structures similar to React Flow.

Example:

```text
┌─────────────┐
│ Data Source │
└──────┬──────┘
       │
       ▼
┌────────────────┐
│ Moving Average │
└──────┬─────────┘
       │
       ▼
┌─────────────┐
│  Threshold  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Action    │
└─────────────┘
```

The backend compiler converts the graph definition into an RxJS `Observable` pipeline.

### 📊 Stream Operators

Implemented custom operators include:

* `rollingAverage(windowSize)`
* `threshold(operation, value)`
* `derivative()`

### 🔄 Pipeline Validation

The stream compiler validates:

* Invalid node references
* Missing nodes
* Missing node configuration
* Orphaned inputs
* Cyclic graphs
* Unconfigured Data Source nodes
* Missing Action Trigger nodes

### 🚀 Performance Testing

The telemetry simulator supports:

* Configurable ingestion rate
* Test duration
* HTTP keep-alive
* Backpressure detection
* Latency measurement
* Min latency
* Average latency
* P95 latency
* Maximum latency
* JSON load-test reports

Week 2 testing achieved approximately:

**4,950–5,000 telemetry writes/sec with 0 reported errors**

---

# 🏗️ System Architecture

```text
                    ┌──────────────────────┐
                    │   IoT Devices /      │
                    │ Turbine Sensors      │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │   Ingestion API      │
                    │ POST /api/ingest      │
                    └──────────┬───────────┘
                               │
                 ┌─────────────┴─────────────┐
                 ▼                           ▼
        ┌─────────────────┐        ┌─────────────────┐
        │ MongoDB         │        │ Telemetry Bus   │
        │ Time-Series DB  │        │     RxJS        │
        └────────┬────────┘        └────────┬────────┘
                 │                          │
                 ▼                          ▼
        ┌─────────────────┐        ┌─────────────────┐
        │ Telemetry APIs  │        │ Stream Compiler │
        │ Stats/History   │        │ Rule Pipeline   │
        │ Rollup          │        └────────┬────────┘
        └─────────────────┘                 │
                                            ▼
                                   ┌─────────────────┐
                                   │ Action Trigger  │
                                   └────────┬────────┘
                                            │
                                            ▼
                                   ┌─────────────────┐
                                   │ WebSocket Layer │
                                   │ Live Broadcast  │
                                   └─────────────────┘
```

---

# 🛠️ Technology Stack

| Layer                  | Technology                            |
| ---------------------- | ------------------------------------- |
| Frontend               | React, Vite, React Flow, Tailwind CSS |
| Backend                | Node.js, Express.js                   |
| Language               | JavaScript / ESM                      |
| Reactive Processing    | RxJS 7                                |
| Realtime Communication | WebSocket (`ws`)                      |
| Database               | MongoDB 5.0+                          |
| Database Type          | MongoDB Time-Series                   |
| Authentication         | JWT                                   |
| Password Security      | bcryptjs                              |
| API Style              | REST                                  |
| Testing / Simulation   | Custom Telemetry Simulator            |

---

# 📁 Project Structure

```text
NexusFlow/
│
├── nexusflow-backend/
│   │
│   ├── src/
│   │   ├── server.js
│   │   │
│   │   ├── config/
│   │   │   ├── db.js
│   │   │   └── env.js
│   │   │
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── ingest.controller.js
│   │   │   ├── telemetry.controller.js
│   │   │   └── graph.controller.js
│   │   │
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── ingest.routes.js
│   │   │   ├── telemetry.routes.js
│   │   │   ├── device.routes.js
│   │   │   └── graph.routes.js
│   │   │
│   │   ├── middleware/
│   │   │   └── authMiddleware.js
│   │   │
│   │   ├── models/
│   │   │   ├── userModel.js
│   │   │   ├── telemetryModel.js
│   │   │   └── graphModel.js
│   │   │
│   │   ├── data/
│   │   │   └── deviceRegistry.js
│   │   │
│   │   ├── services/
│   │   │   ├── telemetryBus.js
│   │   │   ├── streamCompiler.js
│   │   │   └── operators/
│   │   │       └── customOperators.js
│   │   │
│   │   ├── websocket/
│   │   │   └── wsServer.js
│   │   │
│   │   └── scripts/
│   │       └── simulateTelemetry.js
│   │
│   ├── .env.example
│   ├── package.json
│   └── README.md
│
└── nexusflow-frontend/
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── lib/
        ├── context/
        ├── components/
        ├── data/
        └── pages/
```

---

# 🔐 Authentication

NexusFlow uses JWT-based authentication.

### Available Authentication APIs

```text
POST /api/auth/signup
POST /api/auth/login
GET  /api/auth/me
```

Authentication flow:

```text
User
 │
 ▼
Signup / Login
 │
 ▼
Password Verification
 │
 ▼
JWT Token
 │
 ▼
Protected API Requests
```

Passwords are securely hashed before being stored.

---

# 📡 Telemetry Ingestion

The backend provides APIs for both individual and bulk telemetry ingestion.

### Single Reading

```http
POST /api/ingest
```

### Bulk Readings

```http
POST /api/ingest/bulk
```

Incoming telemetry is stored in MongoDB's Time-Series collection and simultaneously published through the telemetry processing layer.

---

# 📈 Telemetry APIs

| Method | Endpoint                           | Purpose                  |
| ------ | ---------------------------------- | ------------------------ |
| GET    | `/api/telemetry/stats`             | Telemetry statistics     |
| GET    | `/api/telemetry/:deviceId/history` | Device telemetry history |
| GET    | `/api/telemetry/:deviceId/rollup`  | Aggregated telemetry     |
| GET    | `/api/devices`                     | Available devices        |

---

# 🔌 WebSocket Communication

NexusFlow exposes a WebSocket endpoint:

```text
ws://<host>:<port>/ws
```

When telemetry is ingested, the backend broadcasts the live reading to connected WebSocket clients.

This provides the foundation for real-time dashboard updates and future live rule execution.

---

# 🧩 Pipeline Graph API

Pipeline graphs are represented using nodes and edges.

Each graph can contain:

* Nodes
* Edges
* Owner
* Name
* Status

### Graph Endpoints

| Method | Endpoint                 | Auth |
| ------ | ------------------------ | ---- |
| GET    | `/api/graphs`            | 🔒   |
| POST   | `/api/graphs`            | 🔒   |
| GET    | `/api/graphs/:id`        | 🔒   |
| PUT    | `/api/graphs/:id`        | 🔒   |
| DELETE | `/api/graphs/:id`        | 🔒   |
| POST   | `/api/graphs/:id/deploy` | 🔒   |
| POST   | `/api/graphs/:id/stop`   | 🔒   |

All graph APIs are protected using JWT authentication.

---

# ⚙️ RxJS Stream Compiler

The `streamCompiler.js` module converts a graph definition into an executable RxJS stream.

Example pipeline:

```text
Telemetry
    ↓
Data Source
    ↓
Rolling Average
    ↓
Threshold
    ↓
Action Trigger
```

The compiler performs graph validation before creating the stream.

### Week 2 Validation

The following scenarios were tested:

* Valid pipeline compilation
* Rising telemetry sequence
* Threshold condition
* Multiple action triggers
* Per-device isolation
* Invalid graph references
* Missing configuration
* Pipeline structure validation

A synthetic rising-value telemetry sequence successfully triggered the configured action **3 times**, while remaining below-threshold readings were correctly ignored.

---

# 🧪 Load Testing

NexusFlow includes a telemetry simulation script for backend performance testing.

### Example

```bash
npm run simulate -- --rate=5000 --duration=30 --report=./load-report.json
```

The simulator supports:

```text
Telemetry Generation
        ↓
HTTP Keep-Alive
        ↓
Backend Ingestion
        ↓
Latency Measurement
        ↓
Performance Report
```

### Week 2 Result

```text
Target Rate       : 5,000 writes/sec
Observed Rate     : ~4,950–5,000 writes/sec
Errors            : 0 reported
Duration          : Configurable
Latency           : Min / Avg / P95 / Max
Report            : JSON supported
```

---

# 🌐 API Reference

| Method | Route                              | Authentication |
| ------ | ---------------------------------- | -------------- |
| POST   | `/api/auth/signup`                 | Public         |
| POST   | `/api/auth/login`                  | Public         |
| GET    | `/api/auth/me`                     | 🔒 JWT         |
| POST   | `/api/ingest`                      | Public         |
| POST   | `/api/ingest/bulk`                 | Public         |
| GET    | `/api/telemetry/stats`             | Public         |
| GET    | `/api/telemetry/:deviceId/history` | Public         |
| GET    | `/api/telemetry/:deviceId/rollup`  | Public         |
| GET    | `/api/devices`                     | Public         |
| GET    | `/api/graphs`                      | 🔒 JWT         |
| POST   | `/api/graphs`                      | 🔒 JWT         |
| GET    | `/api/graphs/:id`                  | 🔒 JWT         |
| PUT    | `/api/graphs/:id`                  | 🔒 JWT         |
| DELETE | `/api/graphs/:id`                  | 🔒 JWT         |
| POST   | `/api/graphs/:id/deploy`           | 🔒 JWT         |
| POST   | `/api/graphs/:id/stop`             | 🔒 JWT         |
| WS     | `/ws`                              | Public         |

---

# 🚀 Local Development

## Prerequisites

Make sure the following are installed:

* Node.js
* npm
* MongoDB 5.0+ or MongoDB Atlas
* Git

---

## Backend Setup

```bash
cd nexusflow-backend

npm install

cp .env.example .env
```

Configure:

```env
MONGO_URI=
MONGO_DB_NAME=
PORT=4000
CORS_ORIGIN=
JWT_SECRET=
JWT_EXPIRES_IN=
```

Start the development server:

```bash
npm run dev
```

Backend:

```text
http://localhost:4000
```

WebSocket:

```text
ws://localhost:4000/ws
```

---

## Frontend Setup

```bash
cd nexusflow-frontend

npm install

npm run dev
```

Frontend:

```text
http://localhost:5173
```

The frontend API client should point to the running backend instance.

---

# 📋 Week 1 — Foundation Milestone

### Completed

* [x] Node.js + Express backend setup
* [x] MongoDB connection
* [x] MongoDB Time-Series telemetry collection
* [x] User authentication
* [x] JWT authentication
* [x] Password hashing
* [x] Telemetry ingestion API
* [x] Bulk telemetry ingestion
* [x] Telemetry statistics API
* [x] Device history API
* [x] Telemetry rollup API
* [x] Device registry
* [x] WebSocket telemetry broadcast
* [x] Telemetry simulation

### Frontend Scope

* [ ] React/Vite application
* [ ] React Flow canvas
* [ ] Pan/zoom
* [ ] Protected routing
* [ ] Authentication UI

---

# 📋 Week 2 — Stream Engine & Pipeline Management

### Completed

* [x] Pipeline graph data model
* [x] Graph CRUD APIs
* [x] JWT-protected graph APIs
* [x] Graph deploy/stop endpoints
* [x] RxJS stream compiler
* [x] Graph validation
* [x] Rolling average operator
* [x] Threshold operator
* [x] Derivative operator
* [x] Per-device stream isolation
* [x] Real telemetry stream processing
* [x] Synthetic rule execution test
* [x] Telemetry load testing
* [x] ~5,000 writes/sec ingestion benchmark
* [x] JSON performance report support

### Remaining / Not Independently Verified

* [ ] Frontend canvas persistence round-trip
* [ ] Dashboard KPI implementation
* [ ] Frontend automated verification

---

# 🗺️ Upcoming Development — Week 3 & Week 4

The following features are intentionally outside the Week 2 milestone.

## Week 3 — Live Rule Execution

Planned:

* Live deployed graph execution
* Rule runner service
* WebSocket → Rule Engine integration
* Real-time pipeline status
* Activity logging
* Alerts page
* Trigger history
* Rule execution monitoring

## Week 4 — Actions & Platform Settings

Planned:

* Webhook actions
* SMS notifications
* Settings page
* Notification configuration
* User preferences
* Production hardening
* Final integration testing

---

# 🧪 Current Verification Summary

| Test                      | Result                        |
| ------------------------- | ----------------------------- |
| Backend server startup    | ✅ Passed                      |
| Authentication APIs       | ✅ Tested                      |
| Telemetry ingestion       | ✅ Tested                      |
| Bulk ingestion            | ✅ Tested                      |
| Telemetry statistics      | ✅ Tested                      |
| Device history            | ✅ Tested                      |
| Telemetry rollup          | ✅ Tested                      |
| WebSocket broadcast       | ✅ Tested                      |
| Graph APIs                | ✅ Implemented                 |
| RxJS pipeline compilation | ✅ Tested                      |
| Threshold rule execution  | ✅ Tested                      |
| Per-device isolation      | ✅ Verified                    |
| Load test                 | ✅ ~5,000 writes/sec           |
| Frontend UI               | ⚠️ Not independently verified |
| Full live rule runner     | ⏳ Week 3                      |
| Alerts / Activity         | ⏳ Week 3                      |
| SMS / Webhooks            | ⏳ Week 3–4                    |

---

# 👥 Module Ownership

| Module                        | Main Components                                        |
| ----------------------------- | ------------------------------------------------------ |
| **Authentication & Security** | Auth APIs, JWT middleware, User Model                  |
| **Database**                  | MongoDB configuration, Time-Series telemetry model     |
| **Telemetry Ingestion**       | Ingestion APIs, telemetry controllers, device registry |
| **Realtime Processing**       | RxJS compiler, telemetry bus, custom operators         |
| **WebSocket**                 | Live telemetry broadcasting                            |
| **Pipeline Management**       | Graph model, graph controllers, graph routes           |
| **Load Testing**              | Telemetry simulator, performance reporting             |
| **Frontend Builder**          | React Flow canvas, nodes, palette, inspector           |
| **Frontend Dashboard**        | KPI cards, graphs, application shell                   |

---

# 📌 Known Limitations

The Week 2 milestone intentionally does not include the complete production rule-execution workflow.

Currently:

* Graph deploy/stop APIs are available.
* The RxJS compiler can compile and execute a validated pipeline.
* Telemetry can be streamed and broadcast through WebSocket.
* Full automatic connection between a deployed graph and the live telemetry WebSocket stream is planned for Week 3.
* Activity and alert persistence is planned for Week 3.
* SMS and webhook delivery are planned for Week 3–4.
* Frontend functionality should be verified separately when the frontend implementation is available.

---

# 🎯 Week 2 Milestone Summary

NexusFlow has completed its **backend foundation and core stream-processing layer** through Week 2.

The system can currently:

```text
Receive Telemetry
       ↓
Store Time-Series Data
       ↓
Publish Real-Time Events
       ↓
Compile Rule Graph
       ↓
Process Telemetry using RxJS
       ↓
Evaluate Conditions
       ↓
Trigger Configured Actions
```

The next milestone is to connect the validated stream engine with **deployed visual pipelines**, followed by real-time **Activity, Alerts, Webhook/SMS actions, and Settings**.

---

## 📄 License

This project is currently developed as an internal project / learning and evaluation application.

---

**NexusFlow — Building visual, real-time IoT automation pipelines.**
