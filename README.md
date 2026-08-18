 NexusFlow — Project README 

Visual IoT rule-builder — drag-and-drop pipelines (React Flow) that read
live turbine/sensor telemetry, run it through an RxJS rule engine, and
fire actions (SMS / webhook) in real time.

**Scope of this README:** everything built through the end of **Week 2**
(Mid-Project Review). Week 3–4 (live rule execution, Activity/Alerts
pages, webhooks, Settings) is not covered here.

> ⚠️ **Verification note:** The **backend** section below reflects code
> that has actually been run and tested (server boot, every route hit,
> RxJS pipeline compiled and fired, 5,000 writes/sec load test). The
> **frontend** section describes what the Week 1–2 plan calls for —
> it has not been independently tested here, since no frontend code was
> provided alongside the backend.

---

## 1. Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React + Vite, React Flow (canvas), Tailwind CSS |
| Backend | Node.js (ESM) + Express |
| Realtime | RxJS 7 (Stream Compiler) + `ws` (WebSocket broadcast) |
| Database | MongoDB 5.0+ — Time-Series collection for telemetry |
| Auth | JWT (`jsonwebtoken` + `bcryptjs`) |

---

## 2. Repo Layout

```
nexusflow/
├── nexusflow-backend/
│   └── src/
│       ├── server.js
│       ├── config/        db.js · env.js
│       ├── controllers/   auth · ingest · telemetry · graph
│       ├── routes/        auth · ingest · telemetry · device · graph
│       ├── middleware/    authMiddleware.js
│       ├── models/        userModel · telemetryModel · graphModel
│       ├── data/          deviceRegistry.js
│       ├── services/      telemetryBus.js · streamCompiler.js ·
│       │                  operators/customOperators.js
│       ├── websocket/     wsServer.js
│       └── scripts/       simulateTelemetry.js
│
└── nexusflow-frontend/               (per plan — not in this repo yet)
    └── src/
        ├── main.jsx · App.jsx
        ├── lib/            api.js
        ├── context/        AuthContext.jsx
        ├── components/
        │   ├── auth/       AuthLayout.jsx
        │   └── builder/    Canvas.jsx · NodePalette.jsx · Inspector.jsx ·
        │                   nodes/DataSourceNode.jsx · nodes/MathOpNode.jsx ·
        │                   nodes/ActionNode.jsx
        ├── data/           mockGraph.js
        └── pages/          LoginPage.jsx · SignupPage.jsx · BuilderPage.jsx ·
                             DashboardPage.jsx · GraphsPage.jsx
```

---

## 3. Backend — What's Built (Week 1 + Week 2)

### Week 1 — Foundations (Auth + Ingestion + Canvas scaffolding)

**Database & Auth**
- `config/db.js` — MongoDB connection, auto-provisions the `telemetry`
  time-series collection + indexes on first boot
- `config/env.js` — central env-variable loader
- `models/telemetryModel.js` — time-series schema (metaField/timeField)
- `models/userModel.js` — user schema (name, email, hashed password, role)
- `controllers/auth.controller.js` + `routes/auth.routes.js` —
  `POST /api/auth/signup`, `POST /api/auth/login`, `GET /api/auth/me`

**Ingestion API**
- `server.js` — Express app entry point, mounts all routes, wraps in
  `http.createServer` so WebSocket can attach
- `controllers/ingest.controller.js` + `routes/ingest.routes.js` —
  `POST /api/ingest` (single reading), `POST /api/ingest/bulk`
- `controllers/telemetry.controller.js` + `routes/telemetry.routes.js` —
  `GET /api/telemetry/stats`, `GET /api/telemetry/:deviceId/history`,
  `GET /api/telemetry/:deviceId/rollup`
- `data/deviceRegistry.js` — mock turbine/sensor device list
- `routes/device.routes.js` — `GET /api/devices`
- `scripts/simulateTelemetry.js` — telemetry load generator
- `websocket/wsServer.js` — live broadcast of every ingested reading to
  connected WebSocket clients at `ws://<host>:<port>/ws`

**Week 1 exit checklist**
- [x] Login/Signup working end-to-end
- [x] Time-series collection receiving mock data
- [x] Ingestion API + telemetry read API tested (stats, history, rollup)
- [x] WebSocket broadcasts live readings on ingest
- [ ] React Flow canvas renders with pan/zoom *(frontend — not verified here)*
- [ ] App shell + protected routing *(frontend — not verified here)*

### Week 2 — Logic Compiler & Node Library

**Compiler & Graph Persistence**
- `models/graphModel.js` — persisted pipeline graph schema (nodes, edges,
  owner, name, status)
- `controllers/graph.controller.js` + `routes/graph.routes.js` — graph
  CRUD, all routes JWT-protected:
  `GET/POST /api/graphs`, `GET/PUT/DELETE /api/graphs/:id`,
  `POST /api/graphs/:id/deploy`, `POST /api/graphs/:id/stop`
- `middleware/authMiddleware.js` — `requireAuth` JWT verification,
  protects graph + telemetry APIs

**Stream Engine**
- `services/streamCompiler.js` — compiles a React-Flow-shaped graph JSON
  into a live RxJS `Observable` pipeline. Validates: cycles, missing node
  references, orphaned inputs, unconfigured Data Source nodes, missing
  Action Trigger node.
- `services/operators/customOperators.js` — `rollingAverage(windowSize)`,
  `threshold(operation, value)`, `derivative()`
- `scripts/simulateTelemetry.js` (extended) — HTTP keep-alive agent,
  backpressure detection, latency stats (min/avg/p95/max), `--report`
  flag for a JSON load-test report

**Week 2 exit checklist / Mid-Review demo**
- [x] Graph compiles: Data Source → Moving Average → Threshold → Action
      fires correctly on real streamed data (tested with a synthetic
      rising-value sequence — action fired 3 times, correctly gated by
      the threshold)
- [x] Per-device isolation confirmed (unrelated device readings don't
      leak into a pipeline)
- [x] Ingestion load test: **~4,950–5,000 writes/sec sustained, 0 errors**
      (target 5,000/sec — see `--report` output)
- [ ] Save + reload a graph canvas → JSON → MongoDB round-trip
      *(graph persistence + the frontend's `useGraphHistory.js` —
      not independently re-tested here)*
- [ ] Dashboard shell with static KPI cards *(frontend — not verified here)*

---

## 4. Frontend — What the Plan Calls For (Week 1 + Week 2)

*(No frontend code was supplied — this section documents scope only.)*

**Week 1 — Canvas & Auth UI**
- Vite + React app scaffolding (`main.jsx`, `App.jsx`)
- `lib/api.js` — Axios/fetch client wired to the backend's `/api` routes
- `context/AuthContext.jsx` — login/logout/token state
- `pages/LoginPage.jsx`, `pages/SignupPage.jsx` — wired to
  `POST /api/auth/login` and `POST /api/auth/signup`
- `components/builder/Canvas.jsx` — React Flow canvas with pan/zoom
- `components/layout/AppShell.jsx`, `SideNav.jsx`, `TopBar.jsx`
- `components/auth/ProtectedRoute.jsx` — route guard

**Week 2 — Node Library & Dashboard Shell**
- `components/builder/nodes/DataSourceNode.jsx`, `MathOpNode.jsx`,
  `ActionNode.jsx` — custom React Flow node types
- `components/builder/NodePalette.jsx`, `Inspector.jsx`
- `pages/BuilderPage.jsx` — assembles NodePalette + Canvas + Inspector
- `lib/useGraphHistory.js` — canvas ⇄ JSON serialization, undo/redo
- `pages/DashboardPage.jsx` — KPI cards (Active Pipelines, Ingest Rate,
  Alerts Today, Devices Online)
- `pages/GraphsPage.jsx` — "Your Pipelines" list

---

## 5. API Reference (through Week 2)

| Method | Route | Auth |
|---|---|---|
| POST | `/api/auth/signup` | – |
| POST | `/api/auth/login` | – |
| GET | `/api/auth/me` | ✅ |
| POST | `/api/ingest` | – |
| POST | `/api/ingest/bulk` | – |
| GET | `/api/telemetry/stats` | – |
| GET | `/api/telemetry/:deviceId/history` | – |
| GET | `/api/telemetry/:deviceId/rollup` | – |
| GET | `/api/devices` | – |
| GET | `/api/graphs` | ✅ |
| POST | `/api/graphs` | ✅ |
| GET | `/api/graphs/:id` | ✅ |
| PUT | `/api/graphs/:id` | ✅ |
| DELETE | `/api/graphs/:id` | ✅ |
| POST | `/api/graphs/:id/deploy` | ✅ |
| POST | `/api/graphs/:id/stop` | ✅ |
| WS | `/ws` | – |

---

## 6. Setup

### Backend

```bash
cd nexusflow-backend
npm install
cp .env.example .env      # set MONGO_URI (MongoDB 5.0+, replica set or Atlas)
npm run dev                # http://localhost:4000
```

Required env vars (see `.env.example`): `MONGO_URI`, `MONGO_DB_NAME`,
`PORT`, `CORS_ORIGIN`, `JWT_SECRET`, `JWT_EXPIRES_IN`.

Load-test the ingestion API:
```bash
npm run simulate -- --rate=5000 --duration=30 --report=./load-report.json
```

### Frontend

```bash
cd nexusflow-frontend
npm install
npm run dev                # http://localhost:5173
```

Frontend expects the backend at the URL configured in `lib/api.js`
(defaults to `http://localhost:4000`).

---

## 7. Known Gaps (as of end of Week 2)

- Frontend code/tests not present in this repo snapshot — scope above is
  from the project plan, not verified.
- Graph `deploy`/`stop` endpoints exist, but full live rule execution
  (connecting a deployed graph to the WebSocket telemetry stream) is a
  **Week 3** item (`services/ruleRunner.js`, `websocket/wsServer.js`
  rule-connect logic).
- Alerts, Activity log wiring, Settings page, and outbound
  SMS/webhook delivery are **Week 3–4** scope.

---

## 8. Module Ownership Map (Week 1–2 only)

Organized by module rather than by person, so the map stays accurate
regardless of who ends up touching which file.

| Module | Files |
|---|---|
| **Auth & Database** | `config/db.js`, `config/env.js`, `models/userModel.js`, `controllers/auth.controller.js`, `routes/auth.routes.js`, `middleware/authMiddleware.js` |
| **Ingestion & Telemetry** | `server.js`, `controllers/ingest.controller.js`, `routes/ingest.routes.js`, `controllers/telemetry.controller.js`, `routes/telemetry.routes.js`, `models/telemetryModel.js`, `data/deviceRegistry.js`, `routes/device.routes.js` |
| **Stream Engine & Realtime** | `services/telemetryBus.js`, `services/streamCompiler.js`, `services/operators/customOperators.js`, `websocket/wsServer.js`, `scripts/simulateTelemetry.js` |
| **Pipeline Graph API** | `models/graphModel.js`, `controllers/graph.controller.js`, `routes/graph.routes.js` |
| **Frontend — Auth & Shell** | `main.jsx`, `App.jsx`, `lib/api.js`, `context/AuthContext.jsx`, `components/auth/AuthLayout.jsx`, `components/auth/ProtectedRoute.jsx`, `pages/LoginPage.jsx`, `pages/SignupPage.jsx`, `components/layout/AppShell.jsx`, `SideNav.jsx`, `TopBar.jsx` |
| **Frontend — Canvas & Builder** | `components/builder/Canvas.jsx`, `NodePalette.jsx`, `Inspector.jsx`, node components (`DataSourceNode.jsx`, `MathOpNode.jsx`, `ActionNode.jsx`), `data/mockGraph.js`, `pages/BuilderPage.jsx`, `lib/useGraphHistory.js` |
| **Frontend — Dashboard & UX** | `pages/DashboardPage.jsx`, `pages/GraphsPage.jsx`, `index.css`, `tailwind.config.js`, `components/ui/States.jsx`, `ToastContainer.jsx`, `context/ToastContext.jsx` |
