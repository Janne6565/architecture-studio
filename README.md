# Architecture Studio

A visual editor for designing, documenting, and sharing software architecture diagrams — right in your browser.

## Features

- **Rich node library** — Pre-built components for frontend, backend, datastores, DevOps, messaging, monitoring, auth, and external services
- **Connection types** — REST, WebSocket, gRPC, GraphQL, MQTT, and more with directional control
- **Import/Export** — Save and share diagrams as JSON, or export as PNG, SVG, JPG, or WebP
- **Custom types** — Create your own node and edge types with custom icons and colors
- **Grouping & layers** — Organize nodes into groups with a hierarchical layers panel
- **Undo/Redo** — Full history support
- **Dark mode** — Light and dark themes
- **No backend required** — Everything is stored locally in your browser

## Getting started

```sh
# Install dependencies
bun install

# Start the dev server
bun run dev
```

The app runs at `http://localhost:8080` by default.

## Tech stack

- React + TypeScript
- Vite
- XyFlow (graph visualization)
- shadcn/ui + Tailwind CSS

## Docker

```sh
docker build -t architecture-studio .
docker run -p 8080:80 architecture-studio
```
