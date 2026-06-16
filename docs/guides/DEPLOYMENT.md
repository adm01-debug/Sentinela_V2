# Deployment Guide

## Vercel (Recommended)

```bash
npm i -g vercel
vercel --prod
```

## Netlify

```bash
npm run build
netlify deploy --prod --dir=dist
```

## Docker

```bash
docker build -t sentinela .
docker run -p 3000:3000 sentinela
```

## Environment Variables

Set all `VITE_*` variables in your deployment platform.

## Health Check

`GET /api/health` returns `{ status: "ok" }`
