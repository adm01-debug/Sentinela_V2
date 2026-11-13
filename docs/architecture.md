# Architecture

## Overview

Sentinela is a distributed system consisting of:

- Web Application (React SPA)
- REST API (Node.js)
- Desktop Agent (Electron)
- Mobile App (React Native)
- Database (PostgreSQL)
- Cache (Redis)
- Message Queue (RabbitMQ)

## Components

### Web Application

- React 18 with TypeScript
- Vite for build tooling
- Zustand for state management
- TanStack Query for data fetching
- TailwindCSS for styling

### API Server

- Node.js with Express
- PostgreSQL database
- Redis for caching/sessions
- JWT authentication
- WebSocket for real-time updates

### Desktop Agent

- Electron application
- Activity tracking
- Screenshot capture
- Auto-update support

### Mobile App

- React Native (Expo)
- Push notifications
- Biometric authentication

## Data Flow

1. Agent collects activity data
2. Data sent to API in batches
3. API processes and stores in DB
4. WebSocket notifies web clients
5. Dashboard updates in real-time

## Security

- TLS 1.3 for all connections
- JWT with short expiry
- Role-based access control
- Data encryption at rest
- Regular security audits
