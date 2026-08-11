# Getting Started

## Prerequisites

- Node.js 20+
- npm 10+
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

## Environment Setup

1. Create a Supabase project
2. Copy the URL and anon key to `.env.local`
3. Run migrations: `npx supabase db push`

## First Steps

1. Register an admin account
2. Configure organization settings
3. Add employees
4. Set up monitoring rules
