
# frontend-interview

A full-stack Todo List application built with **NestJS** (backend) and **React 19 + Vite** (frontend).

## Project Structure

```plaintext
.
├── backend/           # NestJS API — Todo List CRUD operations
├── frontend/          # React 19 + Vite + TailwindCSS — Todo List UI
└── .devcontainer/     # Dev container configuration for VS Code
```

## Getting Started

### Option 1: Dev Container (recommended)

This is the easiest way to get everything running with zero local setup.

1. Install [VS Code](https://code.visualstudio.com/) and the [Dev Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) extension.
2. Open this repository in VS Code.
3. When prompted, click **"Reopen in Container"** — or run `Cmd+Shift+P` → `Dev Containers: Reopen in Container`.
4. Wait for the container to build. Dependencies install automatically, and the frontend dev server starts on its own.

Once ready:

| Service  | URL                          |
|----------|------------------------------|
| Frontend | http://localhost:5173        |
| Backend  | http://localhost:4000        |
| API Docs | http://localhost:4000/api/docs |

### Option 2: Local Development

Requires [Node.js](https://nodejs.org/) installed on your machine.

**Start the backend:**

```bash
cd backend
npm install
npm run start:dev
```

**Start the frontend** (in a separate terminal):

```bash
cd frontend
npm install
npm run dev
```

The frontend proxies `/api` requests to the backend automatically.

## Testing

### Frontend (Vitest + React Testing Library)

```bash
cd frontend
npm run test          # watch mode
npm run test:run      # single run
```

### Backend (Jest + Supertest)

```bash
cd backend
npm run test          # unit tests (watch mode)
npm run test:cov      # unit tests with coverage
npm run test:e2e      # end-to-end tests
```

## API Documentation

The backend exposes auto-generated Swagger documentation at [http://localhost:4000/api/docs](http://localhost:4000/api/docs) once the server is running.

