# HabitCompass – Complete Production Deployment Guide

**HabitCompass** is a Next.js habit tracking application with a Node.js Express backend, deployed on Vercel (frontend) and AWS EC2 (backend).

---

## Table of Contents

1. [Overview](#1-overview)
2. [Prerequisites](#2-prerequisites)
3. [Environment Setup](#3-environment-setup)
4. [Supabase Configuration](#4-supabase-configuration)
5. [Frontend Deployment on Vercel](#5-frontend-deployment-on-vercel)
6. [Backend Deployment on EC2](#6-backend-deployment-on-ec2)
7. [Nginx + SSL/TLS Setup](#7-nginx--ssltls-setup)
8. [Post-Deploy Validation](#8-post-deploy-validation)
9. [Monitoring & Maintenance](#9-monitoring--maintenance)
10. [Troubleshooting](#10-troubleshooting)
11. [Rollback Procedures](#11-rollback-procedures)

---

## 1) Overview

### Architecture

```
┌─────────────────────────────────────────────────────┐
│                   User's Browser                     │
└──────────────────────┬──────────────────────────────┘
                       │
          ┌────────────┴──────────────┐
          │                           │
     ┌────▼─────┐              ┌──────▼──────┐
     │  Vercel  │              │ Supabase    │
     │Frontend  │              │Auth + PG    │
     │(Next.js) │              │             │
     └────┬─────┘              └─────────────┘
          │
          │ HTTPS
          │ API calls
          │
     ┌────▼──────────────┐
     │  AWS EC2          │
     │  Nginx + PM2      │
     │  Express API      │
     │  (Node.js)        │
     └────┬──────────────┘
          │
          │ Internal
          │
     ┌────▼──────────────┐
     │  Supabase         │
     │  Database         │
     │  (tracker_progress│
     │   table)          │
     └───────────────────┘
```

### Key Services

- **Vercel**: Hosts Next.js frontend, handles automatic deployments from GitHub.
- **EC2**: Hosts Express API on Ubuntu 22.04 with PM2 process manager.
- **Supabase**: PostgreSQL database + authentication (JWT tokens).
- **Nginx**: Reverse proxy on EC2 for API, handles SSL/TLS termination.

---

## 2) Prerequisites

### Accounts Needed

- **GitHub**: For version control and Vercel integration.
- **Vercel**: For automatic frontend deployment.
- **AWS**: EC2 instance and related services.
- **Supabase**: PostgreSQL + auth provider.
- **Domain Registrar**: To manage DNS (e.g., Route 53, Namecheap, GoDaddy).

### Local Development Tools

- **Node.js** 20+ LTS
- **npm** (comes with Node)
- **Git**
- **SSH client** (for EC2 access)

### Recommended Domain Setup

(Optional but highly recommended for production)

- `app.habitcompass.com` → Vercel frontend
- `api.habitcompass.com` → EC2 backend

---

## 3) Environment Setup

### 3.1 Frontend Environment Variables (Vercel)

In Vercel project settings, add the following environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
NEXT_PUBLIC_API_BASE_URL=https://api.habitcompass.com
```

**Notes:**
- Only `NEXT_PUBLIC_*` variables are exposed to the browser.
- Keep the Supabase **anon key** (not service role key) here.
- Update `NEXT_PUBLIC_API_BASE_URL` to match your backend domain.

### 3.2 Backend Environment Variables (EC2)

On your EC2 instance, create `server/.env`:

```env
API_PORT=4000
NODE_ENV=production
CORS_ORIGIN=https://app.habitcompass.com
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

**Notes:**
- Keep the service role key **secret and backed up**.
- Never commit `.env` to version control.
- Update `CORS_ORIGIN` to match your frontend domain.

### 3.3 Create `.env.example` Files (for repo)

**Root: `.env.example`**

```env
# Frontend only uses NEXT_PUBLIC_* variables
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
NEXT_PUBLIC_API_BASE_URL=https://api.habitcompass.com
```

**`server/.env.example`**

```env
API_PORT=4000
NODE_ENV=production
CORS_ORIGIN=https://app.habitcompass.com
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

---

## 4) Supabase Configuration

### 4.1 Create a Supabase Project

1. Go to [supabase.com](https://supabase.com).
2. Sign up or log in.
3. Create a new project (choose region close to your users).
4. Wait for provisioning (~2 minutes).

### 4.2 Run Database Schema

1. In Supabase, open **SQL Editor**.
2. Copy and paste contents of `server/supabase-schema.sql`.
3. Click **Run**.
4. Verify the `tracker_progress` table appears in Tables.

**Example schema** (from `server/supabase-schema.sql`):

```sql
create table if not exists public.tracker_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  snapshot jsonb not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique (user_id)
);

alter table public.tracker_progress enable row level security;

create policy "Users can manage their own progress" on tracker_progress
  for all using (auth.uid() = user_id);
```

### 4.3 Configure Auth URLs

1. Go to **Authentication → Settings**.
2. Set **Site URL** to `https://app.habitcompass.com` (production) or `http://localhost:3000` (development).
3. Add **Redirect URLs**:
   - `https://app.habitcompass.com/auth/callback`
   - `http://localhost:3000/auth/callback` (dev)
4. Save.

### 4.4 Get API Keys

1. Go to **Settings → API**.
2. Copy:
   - **Project URL**: Use in `NEXT_PUBLIC_SUPABASE_URL`
   - **Anon Key**: Use in `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Service Role Key**: Use in backend `SUPABASE_SERVICE_ROLE_KEY` (keep secret!)

---

## 5) Frontend Deployment on Vercel

### 5.1 Push Code to GitHub

```bash
git add .
git commit -m "Initial HabitCompass setup"
git push origin main
```

### 5.2 Connect GitHub to Vercel

1. Go to [vercel.com](https://vercel.com).
2. Click **Import Project**.
3. Select **Import Git Repository** and choose your repo.
4. Vercel auto-detects Next.js.
5. Add environment variables from section 3.1.
6. Click **Deploy**.

### 5.3 Add Custom Domain

1. In Vercel project, go to **Settings → Domains**.
2. Add `app.habitcompass.com`.
3. Vercel shows DNS records to add.
4. Update DNS records at your registrar:
   - Point `app.habitcompass.com` A record to Vercel IP.
   - Or use CNAME to Vercel domain.
5. DNS propagates in minutes to hours.

### 5.4 Auto-Deploy on Push

Vercel automatically deploys when you push to `main` (or configured branch).

To update production:

```bash
git add .
git commit -m "Update tracker notes UI"
git push origin main
```

Vercel rebuilds and deploys automatically.

---

## 6) Backend Deployment on EC2

### 6.1 Launch EC2 Instance

**In AWS Console:**

1. Go to EC2 Dashboard.
2. Click **Launch Instances**.
3. Choose **Ubuntu 22.04 LTS** (Free Tier eligible).
4. Instance type: `t3.micro` (or `t2.micro` for Free Tier).
5. Configure security group:
   - **SSH (22)**: Restrict to your IP only.
   - **HTTP (80)**: Allow from `0.0.0.0/0`.
   - **HTTPS (443)**: Allow from `0.0.0.0/0`.
6. Create or use existing key pair (download `.pem` file).
7. Launch.

### 6.2 Connect via SSH

```bash
chmod 600 /path/to/your-key.pem
ssh -i /path/to/your-key.pem ubuntu@YOUR_EC2_PUBLIC_IP
```

### 6.3 Install System Dependencies

```bash
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install Nginx
sudo apt install -y nginx

# Install PM2 globally
sudo npm install -g pm2
```

### 6.4 Clone Repository

```bash
# Create app directory
sudo mkdir -p /var/www/habitcompass
sudo chown -R ubuntu:ubuntu /var/www/habitcompass

# Clone repo
cd /var/www/habitcompass
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git .

# Install dependencies
npm install
```

Important: the trailing `.` in the `git clone` command clones the repo into the current folder. If you omit it, Git creates a nested folder like `/var/www/habitcompass/HabitCompass`, and `npm install` from `/var/www/habitcompass` will fail with `ENOENT` because `package.json` is one level deeper.

If you already cloned without the trailing dot, run:

```bash
cd /var/www/habitcompass/HabitCompass
npm install
```

### 6.5 Configure Backend Environment

```bash
# If the repo was cloned into a nested folder, use the repo root first:
cd /var/www/habitcompass/HabitCompass/server
cat > .env << EOF
API_PORT=4000
NODE_ENV=production
CORS_ORIGIN=https://app.habitcompass.com
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
EOF
```

Verify file created:

```bash
cat .env
```

### 6.6 Start Backend with PM2

From the repo root, `/var/www/habitcompass/HabitCompass`:

```bash
# Return to the repo root before starting PM2.
cd /var/www/habitcompass/HabitCompass

# Start the Express API
pm2 start npm --name "habitcompass-api" -- run start:api

# Save process list
pm2 save

# Enable auto-restart on reboot
pm2 startup
```

Copy and run the output from `pm2 startup` command.

The `pm2 startup` output is expected and only enables PM2 on reboot. After that, `pm2 status` should show the app as `online`. If it shows `errored`, run `pm2 logs habitcompass-api --lines 100` from the repo root to see the crash reason.

If the logs say `Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY`, make sure you are running the updated backend code that loads `server/.env`, then restart PM2 after pulling the latest changes.

Verify running:

```bash
pm2 status
pm2 logs habitcompass-api
```

### 6.7 Update Backend (Later)

When you push updates to GitHub:

```bash
cd /var/www/habitcompass
git pull
npm install
pm2 restart habitcompass-api
```

---

## 7) Nginx + SSL/TLS Setup

### 7.1 Configure Nginx as Reverse Proxy

Create Nginx config:

```bash
sudo nano /etc/nginx/sites-available/habitcompass-api
```

Add:

```nginx
server {
    listen 80;
    server_name api.habitcompass.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.habitcompass.com;

    # SSL certificates (will be added by Certbot)
    ssl_certificate /etc/letsencrypt/live/api.habitcompass.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.habitcompass.com/privkey.pem;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    location / {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site:

```bash
sudo ln -s /etc/nginx/sites-available/habitcompass-api /etc/nginx/sites-enabled/habitcompass-api

# Remove default config if present
sudo rm /etc/nginx/sites-enabled/default 2>/dev/null || true

# Test config
sudo nginx -t

# Reload Nginx
sudo systemctl restart nginx
```

### 7.2 Install SSL Certificate (Let's Encrypt)

```bash
sudo apt install -y certbot python3-certbot-nginx

# Request certificate
sudo certbot --nginx -d api.habitcompass.com
```

Follow prompts:
- Enter email for Let's Encrypt.
- Agree to terms.
- Choose "Redirect" to auto-redirect HTTP → HTTPS.

Verify Nginx config auto-updated:

```bash
sudo nginx -t
sudo systemctl restart nginx
```

### 7.3 Auto-Renew SSL Certificate

Certbot auto-renewal runs via systemd timer. Verify:

```bash
sudo systemctl status certbot.timer
```

---

## 8) Post-Deploy Validation

### 8.1 Frontend Checks

1. Open `https://app.habitcompass.com` in browser.
2. Verify page loads without errors.
3. Test signup/login flow.
4. Add a habit and mark cells.
5. Refresh page—data persists.
6. Check browser console (F12) for no errors or warnings.

### 8.2 Backend Checks

1. Test API health endpoint:

```bash
curl https://api.habitcompass.com/health
```

Expected response:

```json
{ "ok": true }
```

2. Test API with authentication (after logging in on frontend):

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://api.habitcompass.com/api/progress/me
```

3. Check SSL certificate:

```bash
curl -vI https://api.habitcompass.com/health 2>&1 | grep -i ssl
```

### 8.3 DNS Verification

```bash
nslookup app.habitcompass.com
nslookup api.habitcompass.com
```

Should resolve to correct IPs.

### 8.4 Comprehensive Checklist

- [ ] Frontend loads at `https://app.habitcompass.com`
- [ ] Backend health OK at `https://api.habitcompass.com/health`
- [ ] User can sign up with email.
- [ ] User can log in.
- [ ] Tracker data saves after page refresh.
- [ ] Notes persist after refresh.
- [ ] Clear All button works and persists.
- [ ] Custom date range works and persists.
- [ ] No CORS errors in browser console.
- [ ] No "duplicate key" warnings in console.
- [ ] SSL certificate is valid and auto-renewal is enabled.

---

## 9) Monitoring & Maintenance

### 9.1 Monitor Backend Processes

```bash
# Check all PM2 processes
pm2 status

# View recent logs
pm2 logs habitcompass-api --lines 50

# Continuous log follow
pm2 logs habitcompass-api
```

### 9.2 Monitor Server Resources

```bash
# Disk usage
df -h

# Memory usage
free -m

# CPU load
top
```

### 9.3 Monitor Nginx

```bash
# Check status
sudo systemctl status nginx

# View Nginx error log
sudo tail -n 50 /var/log/nginx/error.log

# View Nginx access log
sudo tail -n 50 /var/log/nginx/access.log
```

### 9.4 Restart Services

**Restart Express API:**

```bash
pm2 restart habitcompass-api
```

**Restart Nginx:**

```bash
sudo systemctl restart nginx
```

**Restart both:**

```bash
pm2 restart habitcompass-api && sudo systemctl restart nginx
```

### 9.5 Regular Maintenance Tasks

- **Weekly**: Check logs for errors.
- **Monthly**: Verify SSL certificate renewal (should be automatic).
- **Quarterly**: Update OS and packages:

```bash
sudo apt update && sudo apt upgrade -y
```

---

## 10) Troubleshooting

### 10.1 502 Bad Gateway

**Symptom:** Browser shows "502 Bad Gateway" at `api.habitcompass.com`.

**Fixes:**

1. Check API process is running:

```bash
pm2 status habitcompass-api
```

2. If stopped, restart:

```bash
pm2 restart habitcompass-api
```

3. Check API logs for errors:

```bash
pm2 logs habitcompass-api
```

4. Verify API listens on port 4000:

```bash
sudo netstat -tlnp | grep 4000
```

5. Check Nginx config:

```bash
sudo nginx -t
```

### 10.2 CORS Errors in Browser Console

**Symptom:** `Access-Control-Allow-Origin` error when calling API from frontend.

**Fixes:**

1. Verify backend `CORS_ORIGIN` matches frontend domain exactly.
2. Update `.env` if needed and restart:

```bash
pm2 restart habitcompass-api
```

3. Check frontend is sending correct `Authorization` header.
4. Verify requests use `https://api.habitcompass.com`, not `http://`.

### 10.3 SSL Certificate Issues

**Symptom:** Browser shows certificate warning or expired certificate message.

**Check certificate expiry:**

```bash
sudo certbot certificates
```

**Renew manually:**

```bash
sudo certbot renew --dry-run
sudo certbot renew
```

**Auto-renewal should be enabled via systemd timer** (installed during Certbot setup).

### 10.4 Auth/Login Failures

**Symptoms:**
- Signup fails.
- "Invalid redirect URL" error.
- Login redirects incorrectly.

**Fixes:**

1. Verify Supabase Auth settings:
   - Site URL: `https://app.habitcompass.com`
   - Redirect URLs include `https://app.habitcompass.com/auth/callback`

2. Verify frontend env vars are correct:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key_here
```

3. Redeploy frontend on Vercel if env vars changed.

### 10.5 Duplicate React Key Warnings

**Symptom:** Browser console shows "Encountered two children with the same key".

**Fix:** Ensure weekday labels are unique (e.g., `Su Mo Tu We Th Fr Sa`), not single-letter labels.

File to check: `components/core/tracker/BasicHabitTrackerTable.tsx`

---

## 11) Rollback Procedures

### 11.1 Frontend Rollback (Vercel)

**Method 1: Revert via Vercel Dashboard**

1. Go to Vercel project.
2. Click **Deployments**.
3. Find the last known-good deployment.
4. Click **⋮** (menu) and select **Promote to Production**.

**Method 2: Revert via Git & Redeploy**

```bash
# Locally
git revert HEAD
git push origin main

# Vercel auto-deploys
```

### 11.2 Backend Rollback (EC2)

**Check recent commits:**

```bash
cd /var/www/habitcompass
git log --oneline -n 10
```

**Revert to known-good commit:**

```bash
git checkout <GOOD_COMMIT_SHA>
npm install
pm2 restart habitcompass-api
pm2 logs habitcompass-api
```

**Create a rollback commit:**

```bash
git revert HEAD
git push origin main
```

Then push fix branch to verify, and merge to main when stable.

---

## 12) Additional Notes

### Performance Optimization (Future)

- Add caching headers to Nginx.
- Use CloudFront or Cloudflare CDN in front of Vercel.
- Implement database indexes in Supabase for large datasets.
- Monitor API response times and optimize slow queries.

### Security Hardening (Future)

- Enable 2FA on GitHub, Vercel, AWS, Supabase accounts.
- Rotate API keys and secrets quarterly.
- Set up AWS CloudTrail for audit logs.
- Add DDoS protection (AWS Shield, Cloudflare).
- Implement rate limiting in Express middleware.

### Scalability (Future)

- Auto-scale EC2 instances via AWS Auto Scaling Group.
- Use AWS RDS instead of Supabase Postgres for better control.
- Add Redis caching layer.
- Monitor with CloudWatch or Datadog.

---

## Contact & Support

For issues:
1. Check this guide's troubleshooting section.
2. Review logs (`pm2 logs`, Nginx error log).
3. Verify environment variables are correct.
4. Test API endpoint directly with `curl`.

---

**Document Version:** 1.0  
**Last Updated:** April 2026  
**Project:** HabitCompass

1. Next.js frontend (this repo root) serves UI.
2. Express API (`server/index.js`) provides authenticated persistence routes.
3. Supabase provides Auth + Postgres.

Request flow:
1. User logs in with Supabase from frontend.
2. Frontend sends bearer token to backend API.
3. Backend validates token and reads/writes `tracker_progress` in Supabase.

---

## 3) Repo and Runtime Facts

### Frontend scripts (root `package.json`)
- `npm run dev` -> Next dev
- `npm run build` -> Next production build
- `npm run start` -> Next production server
- `npm run lint` -> ESLint

### Backend scripts (root `package.json`)
- `npm run dev:api` -> starts API via `node server/index.js`
- `npm run start:api` -> starts API via `node server/index.js`

### Backend routes (`server/index.js`)
- `GET /health`
- `GET /api/progress/me` (requires Bearer token)
- `PUT /api/progress/me` (requires Bearer token)

---

## 4) Prerequisites

Accounts:
- GitHub
- Vercel
- AWS (for EC2)
- Supabase

Local tools:
- Node.js 20+
- npm
- Git

Optional but recommended:
- Domain with DNS control
  - `app.yourdomain.com` for frontend
  - `api.yourdomain.com` for backend

---

## 5) Environment Variables

This repo does not currently include `.env.example`, so use the templates below.

### 5.1 Frontend (Vercel Project Env Vars)

Set in Vercel Project Settings -> Environment Variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com
```

Notes:
- Only `NEXT_PUBLIC_*` variables should be exposed to frontend.
- Never put service role keys in frontend env.

### 5.2 Backend (EC2 `server/.env`)

Create `server/.env` on the server:

```env
API_PORT=4000
CORS_ORIGIN=https://app.yourdomain.com
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY
```

If you need to allow local development as well, run backend in dev with a local CORS origin (or update CORS logic to allow multiple origins).

---

## 6) Supabase Setup

1. Open Supabase SQL Editor.
2. Run schema from:
   - `server/supabase-schema.sql`
3. Verify table exists:
   - `public.tracker_progress`
4. Check Auth URL settings:
   - Site URL: `https://app.yourdomain.com`
   - Redirect URLs: include production + localhost dev URL(s)

Security checklist:
- Keep `SUPABASE_SERVICE_ROLE_KEY` backend-only.
- Do not commit `.env` files.
- Rotate keys if leaked.

---

## 7) Local Pre-Production Verification

From repo root:

```powershell
npm install
npm run lint
npm run build
```

Run local frontend:

```powershell
npm run dev
```

Run local backend (separate terminal):

```powershell
npm run dev:api
```

Manual checks:
1. Signup/login works.
2. Tracker updates save and reload correctly.
3. Browser console has no duplicate key warning.
4. `GET http://localhost:4000/health` returns `{ ok: true }`.

---

## 8) Deploy Frontend on Vercel

1. Push latest code to GitHub.
2. In Vercel, click New Project and import repo.
3. Framework should auto-detect as Next.js.
4. Add frontend env vars from section 5.1.
5. Deploy.
6. Add custom domain (`app.yourdomain.com`) in Vercel Domains.

After changing env vars, redeploy.

---

## 9) Deploy Backend on AWS EC2 + Nginx + PM2

This uses Ubuntu 22.04.

### 9.1 Create EC2 instance

Recommended starter:
- Instance: `t3.micro`
- Inbound rules:
  - SSH 22 from your IP only
  - HTTP 80 from anywhere
  - HTTPS 443 from anywhere

### 9.2 Connect via SSH

```bash
ssh -i /path/to/key.pem ubuntu@YOUR_EC2_PUBLIC_IP
```

### 9.3 Install dependencies

```bash
sudo apt update
sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs nginx
sudo npm install -g pm2
```

### 9.4 Clone repo and install

```bash
sudo mkdir -p /var/www/habit-tracker
sudo chown -R ubuntu:ubuntu /var/www/habit-tracker
cd /var/www/habit-tracker
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git .
npm install
```

If you cloned without the trailing `.` by mistake, `npm install` must be run inside the cloned repo directory instead of the parent folder.

### 9.5 Configure backend env

```bash
cd server
nano .env
```

Paste env from section 5.2 and save.

### 9.6 Start backend with PM2

Run from repo root:

```bash
cd /var/www/habit-tracker
pm2 start npm --name habit-api -- run start:api
pm2 save
pm2 startup
```

Run the command printed by `pm2 startup`, then verify:

```bash
pm2 status
pm2 logs habit-api --lines 100
```

### 9.7 Configure Nginx reverse proxy

```bash
sudo nano /etc/nginx/sites-available/habit-api
```

Add:

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable and reload:

```bash
sudo ln -s /etc/nginx/sites-available/habit-api /etc/nginx/sites-enabled/habit-api
sudo nginx -t
sudo systemctl restart nginx
```

### 9.8 DNS and HTTPS

DNS:
- Point `api.yourdomain.com` A record to EC2 public IP.

HTTPS:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d api.yourdomain.com
```

Choose automatic HTTP->HTTPS redirect when prompted.

---

## 10) Production Validation Checklist

After deploy:

1. Open `https://app.yourdomain.com`.
2. Signup/login works.
3. Habit actions save and persist after refresh.
4. Browser console has no key warnings.
5. API health works:
   - `https://api.yourdomain.com/health`
6. No CORS errors in console.

---

## 11) Updating Production Safely

### Frontend update

```powershell
git add .
git commit -m "frontend update"
git push
```

Vercel auto-deploys.

### Backend update

```bash
cd /var/www/habit-tracker
git pull
npm install
pm2 restart habit-api
pm2 logs habit-api --lines 100
```

---

## 12) Rollback Procedure

### Frontend rollback (Vercel)
1. Open Vercel Deployments.
2. Select last known good deployment.
3. Click Promote to Production.

### Backend rollback (EC2)

```bash
cd /var/www/habit-tracker
git log --oneline -n 10
git checkout <GOOD_COMMIT_SHA>
npm install
pm2 restart habit-api
```

Then create a proper rollback branch/commit when stable.

---

## 13) Monitoring and Operations

Useful commands:

```bash
pm2 status
pm2 logs habit-api --lines 200
sudo systemctl status nginx
sudo nginx -t
df -h
free -m
```

Restart services:

```bash
pm2 restart habit-api
sudo systemctl restart nginx
```

---

## 14) Common Problems and Fixes

### A) Duplicate key warning still appears

1. Ensure latest code includes `Su Mo Tu We Th Fr Sa` in `BasicHabitTrackerTable.tsx`.
2. Delete `.next` and restart dev server.
3. Hard-refresh browser.

### B) CORS errors

1. Check backend `CORS_ORIGIN` exactly matches frontend origin.
2. Ensure frontend uses correct `NEXT_PUBLIC_API_BASE_URL`.
3. Restart backend PM2 process.

### C) 502 Bad Gateway

1. Check PM2 process is online.
2. Confirm API listens on port `4000` (or your configured `API_PORT`).
3. Validate Nginx config and reload.

### D) Auth/redirect issues

1. Verify Supabase Site URL and Redirect URLs.
2. Confirm production URL uses `https`.

---

## 15) Recommended Improvements (Next)

1. Add `.env.example` files for root and `server/`.
2. Update backend CORS to support a whitelist array (dev + preview + prod origins).
3. Add CI checks: lint + build + smoke tests on pull requests.
4. Add uptime monitoring and alerting for `/health`.

---

This file is intended to be your single source of truth for production setup and ongoing operations.
