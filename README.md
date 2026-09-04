NexusFlow

Visual IoT Rule Builder & Real-Time Telemetry Processing Platform

NexusFlow is a real-time IoT monitoring and rule-processing platform for ingesting, storing, processing, and visualizing turbine and sensor telemetry through configurable visual pipelines.

The platform combines a React + Vite frontend, React Flow visual rule builder, Node.js + Express backend, MongoDB Time-Series storage, RxJS stream processing, and WebSocket-based real-time communication.

A typical NexusFlow pipeline can be represented as:

Data Source → Moving Average → Threshold → Action

Telemetry is ingested by the backend, persisted as time-series data, published to the reactive processing layer, evaluated against configured pipeline rules, and exposed to connected clients through WebSocket communication.

📌 Project Overview

NexusFlow is designed around two complementary capabilities:

Real-time telemetry management

Receive single or bulk sensor readings.

Store telemetry in MongoDB Time-Series collections.

Query device history, statistics, and rollups.

Broadcast live telemetry through WebSockets.

Visual rule and stream processing

Represent automation logic as node-and-edge graphs.

Validate pipeline structure before execution.

Compile graph definitions into RxJS Observable pipelines.

Apply custom stream operators such as rolling averages, thresholds, and derivatives.

Trigger configured actions when rule conditions are satisfied.

NexusFlow provides an end-to-end foundation for real-time IoT telemetry management, visual rule pipelines, reactive stream processing, and real-time communication. The platform is structured to support further production hardening and integrations.

📊 Project Status

NexusFlow currently provides:

✅ Authentication and JWT authorization

✅ Telemetry ingestion and bulk ingestion

✅ MongoDB Time-Series telemetry storage

✅ Telemetry history, statistics, and rollups

✅ Device registry

✅ WebSocket real-time telemetry broadcasting

✅ Pipeline graph CRUD and deployment controls

✅ RxJS stream compilation

✅ Custom stream operators

✅ Graph validation

✅ Per-device stream isolation

✅ Telemetry simulation and performance reporting

🔄 Additional production integrations and hardening can be added as the platform evolves

✨ Key Features

🔐 Authentication & Authorization

User signup and login

Password hashing with bcryptjs

JWT-based authentication

Protected graph APIs

Current-user authentication endpoint

User role information stored with accounts

📡 Real-Time Telemetry

Single telemetry ingestion

Bulk telemetry ingestion

MongoDB Time-Series storage

Device-based telemetry history

Telemetry statistics

Time-based telemetry rollups

Mock turbine/device registry

WebSocket-based live telemetry broadcasting

🧩 Visual Rule Pipelines

NexusFlow represents processing rules as graph structures compatible with a visual node-based builder.

Example:

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
│    Action   │
└─────────────┘

The backend stream compiler validates the graph and converts it into an executable RxJS pipeline.

⚙️ Stream Operators

Implemented custom operators include:

rollingAverage(windowSize)

threshold(operation, value)

derivative()

✅ Pipeline Validation

The compiler validates common graph and configuration problems, including:

Invalid node references

Missing nodes

Missing node configuration

Orphaned inputs

Cyclic graphs

Unconfigured Data Source nodes

Missing Action Trigger nodes

🚀 Performance Testing

The telemetry simulator supports:

Configurable ingestion rate

Configurable test duration

HTTP keep-alive

Backpressure detection

Latency measurement

Minimum latency

Average latency

P95 latency

Maximum latency

JSON load-test reports

The telemetry simulator supports high-throughput ingestion testing with configurable rates, duration, latency measurements, and JSON performance reporting.

🏗️ System Architecture

                    ┌──────────────────────┐
                    │   IoT Devices /      │
                    │   Turbine Sensors    │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │    Ingestion API     │
                    │    POST /api/ingest  │
                    └──────────┬───────────┘
                               │
                    ┌──────────┴───────────┐
                    ▼                      ▼
           ┌─────────────────┐    ┌─────────────────┐
           │     MongoDB     │    │  Telemetry Bus  │
           │  Time-Series DB │    │      RxJS       │
           └────────┬────────┘    └────────┬────────┘
                    │                      │
                    ▼                      ▼
           ┌─────────────────┐    ┌─────────────────┐
           │ Telemetry APIs  │    │ Stream Compiler │
           │ Stats / History  │    │  Rule Pipeline  │
           │ / Rollup         │    └────────┬────────┘
           └─────────────────┘             │
                                           ▼
                                   ┌─────────────────┐
                                   │  Action Trigger │
                                   └────────┬────────┘
                                            │
                                            ▼
                                   ┌─────────────────┐
                                   │ WebSocket Layer │
                                   │ Live Broadcast  │
                                   └─────────────────┘

Data Processing Flow

Telemetry Source
      ↓
Ingestion API
      ↓
MongoDB Time-Series Storage
      ↓
Telemetry Bus
      ↓
RxJS Stream Compiler
      ↓
Pipeline Operators
      ↓
Condition Evaluation
      ↓
Action Trigger
      ↓
WebSocket / Client Layer

🛠️ Technology Stack

Layer

Technology

Frontend

React, Vite, React Flow, Tailwind CSS

Backend

Node.js, Express.js

Language

JavaScript / ESM

Reactive Processing

RxJS 7

Realtime Communication

WebSocket (ws)

Database

MongoDB 5.0+

Database Model

MongoDB Time-Series

Authentication

JWT

Password Security

bcryptjs

API Style

REST

Testing / Simulation

Custom Telemetry Simulator

📁 Project Structure

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

🔐 Authentication

NexusFlow uses JWT-based authentication to protect user-specific pipeline graph operations.

Authentication Endpoints

Method

Endpoint

Access

POST

/api/auth/signup

Public

POST

/api/auth/login

Public

GET

/api/auth/me

JWT Protected

Authentication Flow

User
  ↓
Signup / Login
  ↓
Password Verification
  ↓
JWT Token
  ↓
Protected API Request
  ↓
Backend Authorization

Passwords are hashed before storage, and protected endpoints require a valid JWT.

📡 Telemetry Ingestion

The backend provides APIs for individual and bulk telemetry ingestion.

Single Reading

POST /api/ingest

Bulk Readings

POST /api/ingest/bulk

Incoming telemetry is stored in the MongoDB Time-Series collection and published through the telemetry processing layer.

Telemetry Processing Concept

Incoming Reading
      ↓
Validation / Ingestion
      ↓
MongoDB Time-Series Storage
      ↓
Telemetry Bus
      ↓
Reactive Processing
      ↓
WebSocket Broadcast

📈 Telemetry APIs

Method

Endpoint

Purpose

GET

/api/telemetry/stats

Telemetry statistics

GET

/api/telemetry/:deviceId/history

Device telemetry history

GET

/api/telemetry/:deviceId/rollup

Aggregated telemetry

GET

/api/devices

Available devices

These APIs provide the foundation for telemetry dashboards, historical analysis, and device-level monitoring.

🔌 WebSocket Communication

NexusFlow exposes a WebSocket endpoint for real-time telemetry communication.

ws://<host>:<port>/ws

When telemetry is ingested, the backend broadcasts the live reading to connected WebSocket clients.

This enables real-time dashboard updates and provides the communication layer required for future live rule execution.

🧩 Pipeline Graph API

Pipeline definitions are represented as graph structures containing nodes and edges.

A graph can contain:

Nodes

Edges

Owner

Name

Status

Graph Endpoints

Method

Endpoint

Authentication

GET

/api/graphs

🔒 JWT

POST

/api/graphs

🔒 JWT

GET

/api/graphs/:id

🔒 JWT

PUT

/api/graphs/:id

🔒 JWT

DELETE

/api/graphs/:id

🔒 JWT

POST

/api/graphs/:id/deploy

🔒 JWT

POST

/api/graphs/:id/stop

🔒 JWT

All graph management APIs are protected using JWT authentication.

⚙️ RxJS Stream Compiler

The streamCompiler.js module converts a graph definition into an executable RxJS Observable pipeline.

Example

Telemetry
   ↓
Data Source
   ↓
Rolling Average
   ↓
Threshold
   ↓
Action Trigger

Before creating the stream, the compiler validates the graph structure and node configuration.

Supported Validation Scenarios

Valid pipeline compilation

Invalid graph references

Missing configuration

Pipeline structure validation

Cyclic graph detection

Missing required nodes

Per-device stream isolation

Rule Execution

A synthetic rising-value telemetry sequence successfully triggered the configured action 3 times, while below-threshold readings were ignored.

🧮 Custom Stream Operators

rollingAverage(windowSize)

Calculates a rolling average over the configured window of telemetry values.

Telemetry Values
      ↓
Sliding Window
      ↓
Average
      ↓
Next Operator

threshold(operation, value)

Evaluates telemetry against a configured threshold condition.

Conceptually:

value > threshold
value < threshold
value >= threshold
value <= threshold
value === threshold

The exact supported operations are determined by the backend implementation.

derivative()

Calculates the change between telemetry values over time and can be used to identify increasing or decreasing trends.

🚀 Performance & Load Testing

NexusFlow includes a telemetry simulation script for testing ingestion performance.

Example

npm run simulate -- --rate=5000 --duration=30 --report=./load-report.json

Test Flow

Telemetry Generation
       ↓
HTTP Keep-Alive
       ↓
Backend Ingestion
       ↓
Latency Measurement
       ↓
Performance Report

Supported Metrics

Target ingestion rate

Observed ingestion rate

Error count

Minimum latency

Average latency

P95 latency

Maximum latency

Configurable test duration

JSON performance report

🌐 Complete API Reference

Method

Route

Authentication

POST

/api/auth/signup

Public

POST

/api/auth/login

Public

GET

/api/auth/me

🔒 JWT

POST

/api/ingest

Public

POST

/api/ingest/bulk

Public

GET

/api/telemetry/stats

Public

GET

/api/telemetry/:deviceId/history

Public

GET

/api/telemetry/:deviceId/rollup

Public

GET

/api/devices

Public

GET

/api/graphs

🔒 JWT

POST

/api/graphs

🔒 JWT

GET

/api/graphs/:id

🔒 JWT

PUT

/api/graphs/:id

🔒 JWT

DELETE

/api/graphs/:id

🔒 JWT

POST

/api/graphs/:id/deploy

🔒 JWT

POST

/api/graphs/:id/stop

🔒 JWT

WS

/ws

Public

🚀 Local Development

Prerequisites

Install the following before starting the project:

Node.js

npm

MongoDB 5.0+ or MongoDB Atlas

Git

1. Clone the Repository

git clone <repository-url>
cd NexusFlow

Replace <repository-url> with the repository URL used by your team.

2. Backend Setup

cd nexusflow-backend
npm install

Create the environment file:

cp .env.example .env

Configure the required environment variables:

MONGO_URI=
MONGO_DB_NAME=
PORT=4000
CORS_ORIGIN=
JWT_SECRET=
JWT_EXPIRES_IN=

Environment Variables

Variable

Purpose

MONGO_URI

MongoDB connection string

MONGO_DB_NAME

Database name

PORT

Backend server port

CORS_ORIGIN

Allowed frontend origin

JWT_SECRET

Secret used for JWT signing

JWT_EXPIRES_IN

JWT expiration configuration

Never commit real secrets or production credentials to the repository.

3. Start the Backend

npm run dev

Default backend address:

http://localhost:4000

WebSocket endpoint:

ws://localhost:4000/ws

4. Frontend Setup

Open a second terminal:

cd nexusflow-frontend
npm install
npm run dev

The frontend is available at:

http://localhost:5173

The frontend API client should point to the running backend instance.

🧪 Telemetry Simulation

The backend includes a simulator for generating telemetry traffic.

Example:

npm run simulate -- --rate=5000 --duration=30 --report=./load-report.json

This is useful for:

Development

Backend testing

WebSocket testing

Stream-processing validation

Ingestion benchmarking

Performance reporting

⚠️ Known Limitations

The current milestone intentionally does not represent the complete production rule-execution workflow.

At the current stage:

Graph deploy/stop APIs are available.

The RxJS compiler can compile and execute validated pipelines.

Telemetry can be streamed and broadcast through WebSocket.

Full automatic connection between deployed graphs and the live telemetry stream is planned for future development.

Activity and alert persistence is planned for future development.

SMS and webhook delivery are planned for future development–4.

Frontend functionality should be verified separately when the frontend implementation is available.

These limitations reflect the current milestone rather than missing architectural direction.

🔒 Security Considerations

NexusFlow currently includes:

JWT-based authentication

Password hashing with bcryptjs

Protected graph management APIs

Environment-based configuration

Separation of credentials from source code through .env

For production deployment, additional hardening should be completed as part of the final milestone, including appropriate secret management, API security controls, validation, monitoring, and deployment configuration.

🔄 End-to-End Platform Flow

The platform supports the following end-to-end conceptual flow:

┌───────────────────────┐
│   IoT / Sensor Data   │
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│    Ingestion API      │
└───────────┬───────────┘
            │
       ┌────┴─────┐
       ▼          ▼
┌────────────┐  ┌───────────────┐
│  MongoDB   │  │ Telemetry Bus │
│ Time-Series│  │     RxJS      │
└────────────┘  └───────┬───────┘
                         │
                         ▼
                ┌─────────────────┐
                │ Stream Compiler │
                └────────┬────────┘
                         │
                         ▼
                ┌─────────────────┐
                │ Custom Operators│
                │ Avg / Threshold │
                │ / Derivative    │
                └────────┬────────┘
                         │
                         ▼
                ┌─────────────────┐
                │ Action Trigger  │
                └────────┬────────┘
                         │
                         ▼
                ┌─────────────────┐
                │ WebSocket Layer │
                └─────────────────┘

🎯 Project Summary

NexusFlow is a full-stack IoT telemetry and visual rule-processing platform that brings together telemetry ingestion, time-series storage, reactive stream processing, pipeline management, and real-time communication.

The platform is designed around the following workflow:

IoT / Sensor Data
       ↓
Telemetry Ingestion
       ↓
MongoDB Time-Series Storage
       ↓
Real-Time Telemetry Bus
       ↓
Visual Rule Graph
       ↓
RxJS Stream Processing
       ↓
Conditions & Operators
       ↓
Action Trigger
       ↓
Real-Time Client Communication

Its modular architecture separates authentication, telemetry management, pipeline management, stream processing, WebSocket communication, and frontend visualization, making the project suitable for development, evaluation, demonstration, and future production hardening.

📄 License

This project is currently developed as an internal project / learning and evaluation application.

NexusFlow

Building visual, real-time IoT automation pipelines.
