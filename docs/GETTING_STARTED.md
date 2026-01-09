# Getting Started

## Prerequisites

- Node.js 20+
- npm or yarn
- Supabase account

## Installation

```bash
# Clone the repository
git clone https://github.com/adm01-debug/sentinela.git
cd sentinela

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

## Configuration

1. Create a Supabase project
2. Copy your Supabase URL and anon key to `.env.local`
3. Run migrations: `npx supabase db push`

## First Steps

1. Access http://localhost:8080
2. Create an admin account
3. Configure your organization settings
4. Add your first employee

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run test` - Run tests
- `npm run lint` - Run linter
