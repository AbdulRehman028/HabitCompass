# Habit Tracker API

## 1) Create Supabase table
Run `server/supabase-schema.sql` in the Supabase SQL editor.

## 2) Configure env
Copy `.env.example` to `.env` and fill in Supabase values.
Set frontend keys `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` for login/signup.

## 3) Start API
`npm run dev:api`

## Endpoints
- `GET /health`
- `GET /api/progress/me` (requires Bearer access token)
- `PUT /api/progress/me` (requires Bearer access token)
