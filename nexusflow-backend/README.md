# NexusFlow — Backend

Node.js + Express + MongoDB Time-Series + RxJS backend for NexusFlow, the
visual IoT rule engine. Implements the Week 1–4 backend scope from the
project plan: Time-Series ingestion, the RxJS Stream Compiler, live
WebSocket broadcast, and outbound alerting.

## Stack

- Node.js (ESM) + Express — REST API
- MongoDB 5.0+ native driver — Time-Series collection for telemetry
- RxJS 7 — Stream Compiler that turns a saved graph into live Observables
- ws — WebSocket server for live telemetry + alert broadcast
- axios — outbound webhook delivery

## Setup

```bash
npm install
cp .env.example .env     # point MONGO_URI at MongoDB 5.0+ (replica set or Atlas)
npm run dev               # http://localhost:4000
```

Requires a real MongoDB 5.0+ instance reachable at `MONGO_URI` — time-series
collections aren't available on older versions or on `mongodb-memory-server`.
On first boot the server provisions the `telemetry` time-series collection
and indexes automatically (see `src/config/db.js`).

## Live data — always on

The server auto-generates realistic telemetry for all 4 demo devices the
moment it boots (`AUTO_SIMULATE=true` by default in `.env.example`) — no
separate terminal needed. The Live Dashboard will show moving charts within
a couple of seconds of starting the backend.

- To turn it off (e.g. once real hardware is feeding the system), set
  `AUTO_SIMULATE=false` in `.env`.
- `npm run simulate` (the standalone high-throughput script, for the
  Ingestion Audit demo) still works independently — just don't run both at
  once, or readings will interleave.

## Real SMS delivery (Twilio)

By default `SMS_PROVIDER_MODE=mock` just logs alerts to the console — no
signup needed. To get real text messages when a rule fires:

1. Create a free Twilio trial account → https://www.twilio.com/try-twilio
2. From the Twilio Console, copy your **Account SID**, **Auth Token**, and
   your **Twilio phone number**.
3. In `.env`:
   ```
   SMS_PROVIDER_MODE=twilio
   TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   TWILIO_AUTH_TOKEN=your_auth_token
   TWILIO_FROM_NUMBER=+1xxxxxxxxxx
   ```
4. In the graph builder, set the SMS Alert node's **Target** to your phone
   number in E.164 format, e.g. `+919812345678` (no spaces/dashes).
5. Restart the backend and deploy the graph.

**Trial account note:** Twilio trial accounts can only text phone numbers
you've verified in the Twilio Console (Phone Numbers → Verified Caller
IDs) — verify your own number there first, or upgrade the account.

## Load-test the ingestion layer

Matches the plan's Mid Project Review deliverable ("demonstrate 5,000
writes/sec"):

```bash
npm run simulate                              # ~5,000 writes/sec, 30s
node src/scripts/simulateTelemetry.js --rate=8000 --duration=60 --batch=400
```

It drives the real `/api/ingest/bulk` endpoint and prints writes/sec each
second.

## How the pieces map to the project brief

| Brief module | Where |
|---|---|
| Time-Series Setup | `src/config/db.js`, `src/models/telemetryModel.js` |
| Ingestion API | `src/routes/ingest.routes.js`, `src/controllers/ingest.controller.js` |
| Stream Compiler | `src/services/streamCompiler.js` — parses a graph JSON into RxJS Observables |
| Math node operators | `src/services/operators/customOperators.js` (moving average, threshold, derivative) |
| Live rule execution | `src/services/telemetryBus.js` (shared bus) + `src/services/ruleRunner.js` (deploy/stop) |
| Webhooks & Alerting | `src/services/alerting/*`, `src/models/alertModel.js` |
| WebSocket broadcast | `src/websocket/wsServer.js` |

## REST API

**Auth**
- `POST /api/auth/signup` — `{ name, email, password }` → `{ user, token }`
- `POST /api/auth/login` — `{ email, password }` → `{ user, token }`
- `GET /api/auth/me` — requires `Authorization: Bearer <token>` → `{ user }`

Passwords are hashed with bcrypt; sessions are stateless JWTs (`JWT_SECRET` /
`JWT_EXPIRES_IN` in `.env`). All `/api/graphs` routes require a valid
Bearer token — ingestion and telemetry routes stay open so hardware
gateways and the simulator don't need a user session.

**Ingestion**
- `POST /api/ingest` — `{ deviceId, metric, unit, value, timestamp? }`
- `POST /api/ingest/bulk` — `{ readings: Reading[] }`

**Telemetry**
- `GET /api/telemetry/stats`
- `GET /api/telemetry/:deviceId/history?from=&to=&limit=`
- `GET /api/telemetry/:deviceId/rollup?minutes=60`

**Devices**
- `GET /api/devices`

**Graphs** (the JSON your React Flow canvas serializes)
- `GET /api/graphs` / `POST /api/graphs` / `GET /api/graphs/:id` / `PUT /api/graphs/:id` / `DELETE /api/graphs/:id`
- `POST /api/graphs/:id/deploy` — compiles the graph and subscribes it live
- `POST /api/graphs/:id/stop` — unsubscribes it

**Alerts**
- `GET /api/alerts?deviceId=&limit=`

**WebSocket**
- `ws://localhost:4000/ws` — pushes `{ type: "telemetry", payload }` and
  `{ type: "alert", payload }` messages, shaped to match what the frontend's
  Live Dashboard already expects.

## Connecting the frontend

In `nexusflow-frontend`, replace the mock `createTelemetryStream` /
`nodeLibrary` calls with:
1. A `WebSocket("ws://localhost:4000/ws")` subscription for `LiveChart` / `AlertFeed` data.
2. A `POST /api/graphs` + `POST /api/graphs/:id/deploy` call from the
   Canvas toolbar's "Compile & Run" button (`graphJson` in `Canvas.jsx` is
   already the exact payload shape this API expects).

## Try the compiler without any hardware

`src/services/streamCompiler.js` is pure and testable in isolation — feed it
a graph and push readings onto `telemetryBus.js` to see actions fire, with
no HTTP or MongoDB involved. This is the fastest way to sanity-check a new
Math Operation before wiring it into the UI.
