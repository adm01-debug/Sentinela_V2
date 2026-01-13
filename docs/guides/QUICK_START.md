# Quick Start Guide

Get Sentinela up and running in 5 minutes.

## Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account

## Installation

```bash
git clone https://github.com/adm01-debug/sentinela.git
cd sentinela
npm install
cp .env.example .env.local
```

## Configuration

Edit `.env.local` with your Supabase credentials:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## Run Development Server

```bash
npm run dev
```

Visit `http://localhost:5173`

## First Steps
1. Create admin account
2. Add your first employee
3. Configure monitoring rules
4. View dashboard

## Next Steps
- [Full Installation Guide](./INSTALLATION.md)
- [Configuration Options](./CONFIGURATION.md)
- [First Employee Tutorial](../tutorials/FIRST_EMPLOYEE.md)
