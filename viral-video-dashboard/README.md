# viral-video-dashboard

Review queue for the viral-video-engine. Next.js (App Router) + Supabase. Watch each rendered video and Approve / Reject it.

## Setup
1. `npm install`
2. Copy `.env.example` to `.env.local` and fill in: Supabase URL, anon key, service-role key, `SUPABASE_SCHEMA=viral_video`, and `ALLOWED_EMAILS` (your Google email[s], comma-separated).
3. In the Supabase dashboard: Authentication -> Providers -> enable Google (add a Google OAuth client; set the authorized redirect to `https://<your-deploy>/auth/callback` and `http://localhost:3000/auth/callback` for local).
4. `npm run dev` and open http://localhost:3000 -> sign in with Google.

## Deploy (Vercel)
- Import `viral-video-dashboard/` as a Vercel project; set the same env vars in Vercel; add the production `/auth/callback` URL to Google + Supabase redirect allowlists.

## What it shows
Pending = videos rendered by the engine (`status = rendered`). Approve -> `approved` (awaits publishing, Plan 5). Reject -> `rejected`.
