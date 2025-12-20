# Desktop Agent Documentation

## Overview

Sentinela Desktop Agent is an Electron application for employee monitoring on desktop computers.

## Technology Stack

- **Framework**: Electron
- **Language**: TypeScript
- **Build**: electron-builder
- **Auto-update**: electron-updater

## Project Structure

```
desktop-agent/
├── src/
│   ├── main.ts            # Main process
│   ├── preload.ts         # Preload script
│   └── services/          # Services
│       ├── screenshot.ts  # Screen capture
│       ├── activity.ts    # Activity tracking
│       ├── sync.ts        # Data sync
│       └── config.ts      # Configuration
├── views/                 # HTML views
└── __tests__/            # Test files
```

## Features

- Screenshot capture
- Application tracking
- Idle time detection
- Geofencing
- Secure data storage
- Auto-updates

## Getting Started

```bash
cd desktop-agent
npm install
npm run dev
```

## Building

```bash
# Windows
npm run build:win

# macOS
npm run build:mac

# Linux
npm run build:linux
```

## Configuration

The agent stores configuration in:
- Windows: `%APPDATA%/sentinela-agent/config.json`
- macOS: `~/Library/Application Support/sentinela-agent/config.json`
- Linux: `~/.config/sentinela-agent/config.json`
