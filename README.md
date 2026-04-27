# HabitCompass

HabitCompass is a full-stack habit tracking product focused on consistency, visual feedback, and secure per-user cloud persistence.

## Brand Identity

### Brand Name
HabitCompass

### Brand Promise
Build habits that survive busy weeks.

### Brand Voice
- Calm
- Motivational
- Practical
- Clear over clever

### Typography System
- Display font: Fraunces
- UI/body font: Manrope

### Color Palette
- Ink: `#0f172a`
- Clay accent: `#f59e0b`
- Sage accent: `#16a34a`
- Fog border/background: `#e2e8f0`
- Surface background: `#f8fafc`

## What Is Implemented Today

### Core Product
- Public landing page at `/`
- Login page at `/login`
- Signup page at `/signup`
- Dashboard (Today view) at `/dashboard` with daily check-in
- Monthly tracker route at `/overview` (basic grid)
- Weekly tracker route at `/habit-tracker` (goals, targets, categories, tags)
- Monthly habit tracker grid (simple 10x7 grid)
- Weekly tracker with goals/targets by category
- Score graph grid with connected line rendering
- Insights dashboard at `/insights` (weekly analytics)
- Onboarding wizard at `/onboarding` for new users
- Streak Engine panel on the dashboard overview
- Per-user data persistence in Supabase through authenticated API calls
- Global toast notifications for user-facing status and error messages

### Auth and Session
- Supabase email/password signup
- Supabase email/password login
- Session-protected dashboard overview and monthly tracker routes
- Local-only sign out so logging out in one browser does not revoke sessions in other browsers

### Data Persistence
- Frontend calls authenticated backend endpoints
- Backend verifies bearer token with Supabase Auth
- Progress is stored by Supabase user id in `tracker_progress`
- Toasts show load/save/session issues to the user instead of only logging to console

### UX and Quality
- Responsive landing page and auth pages
- Responsive dashboard and tracker panels
- Consistent brand typography and palette
- Centralized state with Redux Toolkit
- Prop drilling removed from the tracker feature area

## Implemented Feature 1: Streak Engine

### Goal
Show streak progress in a way that is visually clear, branded, and easy to understand for each habit.

### What It Shows
- Current streak
- Longest streak
- Weekly streak
- Monthly chain
- Selected habit focus
- A `Don't break the chain` visual timeline

### How It Works
- It uses the existing tracker monthly data already stored in Redux state.
- No new backend/API route is required for this first streak feature.
- No database migration is required for this first streak feature because the logic is derived from the existing monthly tracker snapshot.
- Streak calculations are isolated in a reusable helper so the UI stays clean and maintainable.

### Streak Rules Used
- Current streak: consecutive completed days ending at the latest tracked day.
- Longest streak: longest consecutive run of completed days in the month.
- Weekly streak: consecutive weeks with at least 5 completed days.
- Monthly chain: consecutive completed days from the beginning of the month.

### UI/UX Notes
- Habit selector chips let the user switch between habits.
- Metric cards summarize the selected habit.
- The chain visual is responsive and scrollable on smaller screens.
- The styling follows the HabitCompass brand palette and typography.

### Definition of Done for This Feature
- [x] UI shipped and responsive on mobile and desktop
- [x] Backend/API support implemented if needed
- [x] Database schema/migration documented when needed
- [x] State integration completed using Redux Toolkit
- [x] Error states show clear user-facing toasts
- [x] Auth and access rules validated
- [x] Lint and build pass
- [x] README updated with the new scope

## Current Architecture

### High-Level
1. Next.js frontend handles UI, auth screens, dashboard overview, monthly tracker route, and client state.
2. Express API handles authenticated read/write of progress.
3. Supabase provides Auth + Postgres storage.

### Data Flow
1. User logs in via Supabase Auth from the frontend.
2. Frontend gets an access token from the Supabase session.
3. Frontend calls the Express API with `Authorization: Bearer <token>`.
4. API verifies the token with Supabase and gets the user id.
5. API reads or writes the `tracker_progress` row for that user id.

## Repository Structure

```text
habit-tracker/
  app/
    page.tsx                # Public landing page
    login/page.tsx          # Login page
    signup/page.tsx         # Signup page
    dashboard/page.tsx      # Protected Today dashboard (daily check-in)
    monthly-tracker/page.tsx # Protected monthly tracker (simple grid)
    weekly-tracker/page.tsx # Protected weekly tracker (goals/targets)
    insights/page.tsx       # Protected insights (weekly analytics)
    onboarding/page.tsx     # Protected onboarding wizard
    tracker-app.tsx         # Monthly tracker composition shell
    weekly-tracker-app.tsx  # Weekly tracker composition shell
    providers.tsx           # Redux provider + global toasts
    layout.tsx              # Root layout + brand fonts
    globals.css             # Global styles + tokens

  components/
    common/
      AuthShell.tsx         # Reusable auth layout
      MarkSymbol.tsx        # Cell symbols
      ToastViewport.tsx     # Global toast UI
    core/
      tracker/
        BasicHabitTrackerTable.tsx    # Simple weekly grid (monthly view)
        HabitTrackerTable.tsx         # Enhanced grid with goals/targets/categories/tags (weekly view)
        ScoreGraphTable.tsx
        ScorePreview.tsx
        StreakEnginePanel.tsx
        TrackerFooter.tsx
        TrackerHeader.tsx
        constants.ts
        streakEngine.ts

  store/
    store.ts                # Redux store
    hooks.ts                # Typed Redux hooks
    trackerSlice.ts         # Tracker logic + load/save thunks
    uiSlice.ts              # Global toast state

  lib/
    supabaseBrowser.ts      # Frontend Supabase client

  server/
    index.js                # Express API
    supabaseClient.js       # Backend Supabase client
    supabase-schema.sql     # DB schema for progress table
    README.md               # API-specific notes
```

## API Endpoints

- `GET /health`
- `GET /api/progress/me` requires a bearer token
- `PUT /api/progress/me` requires a bearer token

## Database Schema

Current schema lives in [server/supabase-schema.sql](server/supabase-schema.sql).

- Table: `public.tracker_progress`
- Key fields:
  - `client_id` stores the authenticated Supabase user id
  - `snapshot` stores the monthly tracker JSON
  - `updated_at` stores the last save time

## Environment Variables

Use [.env.example](.env.example) as reference.

### Frontend
- `NEXT_PUBLIC_API_BASE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Backend
- `API_PORT`
- `CORS_ORIGIN`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

## Local Development

1. Install dependencies:

```bash
npm install
```

2. Configure `.env` from `.env.example`.

3. Run frontend:

```bash
npm run dev
```

4. Run backend:

```bash
npm run dev:api
```

5. Verify quality:

```bash
npm run lint
npm run build
```

## Deployment Plan

### Frontend
- Host on Vercel.

### Backend
- Host Express API on AWS free tier for the first 6 months.

### Database/Auth
- Supabase free tier initially.

### Cost Notes
- Coding features is free.
- Infrastructure can stay free at early scale.
- Paid needs usually appear with usage growth.
- Email reminders and push notifications are intentionally deferred for now.

## Feature Roadmap and Checklist

Legend:
- `[x]` Completed
- `[ ]` Planned
- `[~]` Deferred for now

### Foundation and Product Shell
- [x] Landing page with brand identity
- [x] Login and signup pages
- [x] Protected dashboard route
- [x] Per-user cloud persistence
- [x] Global toast notifications
- [x] Streak Engine (shown on dashboard overview)
- [x] Onboarding wizard for new users
- [x] Today dashboard (daily check-in focused)
- [x] Insights dashboard (weekly analytics)

### 15-Feature Plan

1. Streak Engine
- [x] Daily, weekly, monthly streaks per habit
- [x] Longest streak + current streak
- [x] `Don't break the chain` visual

2. Goals and Targets
- [x] Set weekly targets like 5/7 completions
- [x] Automatic progress bars by habit
- [x] Goal achieved badges

3. Habit Categories and Tags
- [x] Health, Work, Learning, Mindfulness
- [x] Filter and sort habits by category
- [x] Color coding for quick scanning

4. Smart Reminders
- [~] Email reminders deferred because they may require external services or paid tiers
- [~] Missed-day nudges deferred for the same reason
- [~] Weekly reminder digest deferred for the same reason

5. Insights Dashboard
- [x] Best day of week analysis
- [x] Completion rate trends
- [x] Top improving habit and at-risk habit indicators

6. User Journey Features
- [x] Onboarding wizard (/onboarding route)
- [x] Today dashboard redesign (focus on daily check-in)
- [ ] Bottom/side navigation redesign
- [ ] Daily quick-check UI
- [ ] Milestones and gamification

7. Milestones and Gamification
- [ ] XP model for consistency
- [ ] Achievement badges
- [ ] Level progression
- [ ] Monthly challenge mode

8. Templates Library
- [ ] Preset habit packs
- [ ] One-click apply template
- [ ] Save user-defined templates

9. Journal Notes per Day
- [ ] Daily note field
- [ ] Habit-day context notes
- [ ] Reflection history

10. Calendar and Time Views
- [ ] Weekly focus mode
- [ ] Month/week toggle

11. Collaboration
- [ ] Accountability partner link
- [ ] Shared progress snapshots
- [ ] Team challenge mode

12. Mobile-First and PWA
- [ ] Installable PWA
- [ ] Offline queueing
- [ ] Sync when online

13. Data Portability
- [ ] CSV export
- [ ] PDF export
- [ ] Data import/restore

14. Security and Account Settings
- [ ] Forgot password flow
- [ ] Change password flow
- [ ] Session/device overview

15. Product Analytics and Monitoring
- [ ] Basic internal usage events
- [ ] Error monitoring integration
- [ ] Retention dashboard

16. AI Coach Layer
- [ ] Rule-based coaching suggestions
- [ ] Weekly improvement suggestions
- [ ] Personalized next actions

## Priority Order for Next Builds

1. Goals and targets
2. Insights dashboard
3. Templates library
4. Journal notes
5. PWA offline support
6. Export/import
7. Security settings
8. Analytics
9. Collaboration
10. AI coach

## Definition of Done Template

For each upcoming feature, complete all points before marking done:

1. UI shipped and responsive on mobile and desktop.
2. Backend/API support implemented if needed.
3. Database schema or migration documented if needed.
4. State integration completed with Redux slices, selectors, or thunks.
5. Error states show clear user-facing toasts.
6. Auth and access rules validated.
7. Lint and build pass.
8. README updated with the new scope.

## Session Handover Notes

When starting a new session, read this file first and confirm:

1. Current phase and next priority feature.
2. Deferred items remain deferred unless budget changes.
3. Route map and auth flow assumptions are unchanged.
4. Environment variables are configured in both frontend and backend.

## Internal Documentation References

- API setup details: [server/README.md](server/README.md)
- API schema: [server/supabase-schema.sql](server/supabase-schema.sql)
- App state: [store/trackerSlice.ts](store/trackerSlice.ts)
- Global notifications: [store/uiSlice.ts](store/uiSlice.ts)
- Streak logic: [components/core/tracker/streakEngine.ts](components/core/tracker/streakEngine.ts)
- Streak UI: [components/core/tracker/StreakEnginePanel.tsx](components/core/tracker/StreakEnginePanel.tsx)

