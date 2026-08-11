# Self-Hosting Guide
## Requirements
- PostgreSQL 14+
- Redis 6+
- Node.js 18+
- 4GB RAM minimum
## Installation
```bash
git clone https://github.com/adm01-debug/sentinela.git
cd sentinela
npm install
npm run build
```
## Database Setup
```bash
createdb sentinela
psql sentinela < schema.sql
```
## Configuration
Edit `.env` with your database credentials.
## Running
```bash
npm run start:prod
```
## Updates
```bash
git pull && npm install && npm run build
```
