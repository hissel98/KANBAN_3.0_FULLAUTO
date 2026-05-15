# Kanban 3.0 — Full Auto

## Setup

### 1. Supabase
1. Create project at [supabase.com](https://supabase.com)
2. Copy Project URL + Anon Key from Settings → API
3. Add to Vercel environment variables (see below)

### 2. Vercel
1. Import this repo at [vercel.com](https://vercel.com)
2. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Deploy — every push to main auto-deploys

### 3. Local Dev
```bash
cp .env.local.example .env.local
# Fill in your Supabase credentials
npm install
npm run dev
```

## Architecture
- OpenClaw Agent (Project Manager)
  → Codex CLI (Coding Agent)
  → Git Push
  → Vercel Auto-Deploy
  → Supabase (Database + Auth)