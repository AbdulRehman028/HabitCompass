# Habit Tracker API

## 1) Create Supabase table
Run `server/supabase-schema.sql` in the Supabase SQL editor.

## 2) Configure env
Copy `.env.example` to `.env` and fill in Supabase values.

## 3) Start API
`npm run dev:api`

## Endpoints
- `GET /health`
- `GET /api/progress/:clientId`
- `PUT /api/progress/:clientId`
