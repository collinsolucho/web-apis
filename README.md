# Manus

Manus is a React Router + TypeScript demo application for a React Native learning experience. It combines a user registration flow, browser/device API explorations, and a WebRTC peer-to-peer test environment in a single app.

This project is designed as a learning/demo app for exploring how web apps can request browser permissions and use modern device capabilities such as camera, microphone, geolocation, contacts, Bluetooth, file access, and live communication features.

## What the project does

- Creates a user account with validation and password hashing
- Stores accounts in MongoDB
- Demonstrates browser permission and device API access patterns
- Includes a local and two-person WebRTC signaling test
- Provides a structure for exam/session metadata management

## Tech stack

- React Router 8
- React 19
- TypeScript
- Vite
- Tailwind CSS
- MongoDB via MongoDB Node driver
- WebSocket signaling server for peer calls

## Project structure

```bash
manus/
├── app/
│   ├── .server/
│   │   ├── mongo.ts
│   │   └── session.ts
│   ├── model/
│   │   └── database.ts
│   ├── routes/
│   │   ├── home.tsx
│   │   ├── exam.ts
│   │   ├── exam.teacher.tsx
│   │   └── api.exam-token.ts
│   ├── app.css
│   ├── root.tsx
│   ├── routes.ts
│   └── welcome/
├── public/
├── .env
├── Dockerfile
├── package.json
├── react-router.config.ts
├── signaling-server.mjs
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Main features

### 1. User registration flow

The landing page includes a form that collects:

- full name
- email
- department
- course
- password

The form validates input on both the client and server side. Passwords are hashed with Node crypto before being stored, and duplicate email entries are rejected by a unique MongoDB index.

### 2. Browser/device feature demos

The app includes cards that demonstrate browser access to:

- camera and microphone
- geolocation
- contacts
- OTP-related browser APIs
- Bluetooth
- file access

These are mostly educational examples and rely on browser permissions and HTTPS/local secure contexts.

### 3. WebRTC peer connection demo

The app includes a two-person WebRTC test flow using a simple signaling server:

- local participant joins a room
- second participant joins the same room
- signaling messages exchange SDP and ICE candidates
- media streams are connected peer-to-peer

The signaling server runs from `signaling-server.mjs` on port `3001`.

### 4. Exam/session metadata

There are exam-related server utilities for managing exam session records. These are used to track session metadata such as exam ID, title, teacher name, and status.

## Prerequisites

- Node.js 22+
- npm
- MongoDB connection string
- A browser that supports the device APIs you want to test

## Environment setup

Create a `.env` file in the project root and add your MongoDB connection string:

```bash
MONGODB_CONNECTION_STRING="your_mongodb_connection_string"
```

## Installation

```bash
npm install
```

## Running the app

Start the React Router app:

```bash
npm run dev
```

In another terminal, start the signaling server:

```bash
node signaling-server.mjs
```

Then open:

- app: `http://localhost:5173`
- signaling server: `ws://localhost:3001`

## Production build

```bash
npm run build
```

To run the production build:

```bash
npm run start
```

## Docker

```bash
docker build -t manus .
docker run -p 3000:3000 manus
```

## Notes

- Some browser APIs require user interaction and secure contexts.
- Camera, location, contacts, Bluetooth, and file APIs will only work in supported browsers and may require explicit permission.
- This project is a demo/learning app and not a full production-ready exam platform.

## License

This project does not include a custom license file. Please check your repository or organization policy before reusing it in production.
