# Strata Scanner — Setup Guide

## You only need 3 things to run this app:
1. A Neon database (free)
2. A NEXTAUTH_SECRET (generate in 10 seconds)
3. Your N8N webhook URL

---

## Local Development

### Step 1 — Install dependencies
```bash
npm install
```

### Step 2 — Create your .env.local file
```bash
copy .env.example .env.local
```

### Step 3 — Get your database (Neon) — free, 5 minutes
1. Go to https://neon.tech → sign up free
2. Click "New Project" → name it `strata-scanner`
3. Copy the **Connection string** shown on the dashboard
4. Paste it into `.env.local` as `DATABASE_URL`

### Step 4 — Generate NEXTAUTH_SECRET
Run this in your terminal:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```
Paste the output as `NEXTAUTH_SECRET` in `.env.local`

### Step 5 — Add N8N webhook URL
```
N8N_WEBHOOK_URL=https://n8n.srv990866.hstgr.cloud/webhook/business-card
```

### Step 6 — Push the database schema (run once)
```bash
npm run db:push
```

### Step 7 — Start the app
```bash
npm run dev
```
Open http://localhost:3000 — you'll see the Strata login screen.

---

## Your .env.local (only 3 real values needed)
```env
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-generated-secret
N8N_WEBHOOK_URL=https://n8n.srv990866.hstgr.cloud/webhook/business-card
```

---

## Deploy to Vercel

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/strata-scanner.git
git push -u origin main
```

### 2. Import to Vercel
1. Go to https://vercel.com → Add New Project → Import your repo
2. Add the 4 environment variables from `.env.local`
3. Change `NEXTAUTH_URL` to your Vercel URL (e.g. `https://strata-scanner.vercel.app`)
4. Click Deploy

That's it — auto-deploys on every git push.
