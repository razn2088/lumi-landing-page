# viral-video-engine

Turns new WordPress articles into faceless, on-brand vertical videos (9:16) with AI voiceover, word-by-word karaoke captions, stock/clip b-roll, music, and a branded end card. Built to scale to more brands and social accounts by configuration alone.

## Pipeline

```
scan ──▶ generate ──▶ assets ──▶ render ──▶ (publish)
(WP REST)  (Claude)   (TTS +     (Remotion   (Plan 5,
           script +    clips +     -> MP4)     not built yet)
           caption     word-timings
           + hashtags)  + segments + music)
```

Each stage is a job in a DIY Supabase-backed queue (`jobs` table + `claim_job` with `SKIP LOCKED`, exponential backoff, dead-letter). Job types: `scan | generate | assets | render | publish`.

## CLIs

| Command | What it does |
|---|---|
| `npm run scan` | Pull new articles from each active brand's WordPress REST API; enqueue `generate` jobs. |
| `npm run process` | Drain `generate` (Claude script/caption/hashtags) and `assets` (voiceover + clips + word-timings + segments) jobs. Enqueues `render` jobs. |
| `npm run render` | Drain `render` jobs: bundle the Remotion project, render each post to a 1080x1920 MP4, upload to `video/{postId}.mp4`, mark the post `rendered`. |
| `npm run sync-music` | Mirror each brand's Google Drive music folder into `music/{brandId}/` in Storage (idempotent). |
| `npm test` / `npm run typecheck` | Vitest unit/integration suite / `tsc --noEmit`. |

## Architecture

- **Provider-adapter pattern** (the core extensibility pillar): capability interfaces (`LLMProvider`, `TTSProvider`, `StockProvider`, `MusicSource`) registered in a `ProviderRegistry` (`capability:key`) and called through a `ProviderRouter` with fallback chains. New AI tools plug in without touching the pipeline. Current adapters: Anthropic Claude (LLM), Google Cloud TTS v1beta1 with SSML `<mark>` timepoints (TTS), Pexels (Stock), Google Drive (MusicSource); each has a `fake` for tests.
- **Repositories** (`src/db`) abstract Postgres; an in-memory implementation backs the unit tests.
- **Rendering** (`remotion/`) is a Remotion v4 project consumed only at bundle time; `src/render/` holds the pure prop/timing logic. The render CLI references it via the entry-point path, so the rest of `src/` stays free of TSX.

## Setup

1. `npm install`
2. Copy `.env.example` to `.env` and fill in the keys (see that file for what each is for).
3. Apply the SQL migrations in `supabase/migrations/` (0001–0004) to your Supabase schema. With an isolated schema, qualify them (e.g. `alter table viral_video.posts ...`).
4. Create a public Storage bucket matching `STORAGE_BUCKET` (default `viral-video-assets`).
5. Seed `brands` rows (id, name, site_url, wp_api_base, niche, tone, and the render fields: handle, brand_color, logo_url, music_drive_folder_id).
6. Run the pipeline: `npm run scan` then `npm run process` then `npm run render`.

## Brand config (per-brand, in the `brands` table)

`id`, `name`, `site_url`, `wp_api_base`, `niche`, `tone`, `use_featured_image_beat`, `active`, plus render fields `handle`, `logo_url`, `brand_color` (hex accent), `music_drive_folder_id`. Adding a brand is config only.

## Status

Plans 1–3 are built and merged: scan, Claude text generation, assets (TTS/clips/word-timings/segments), and the Remotion renderer. Next: a review dashboard (Plan 4) and Instagram/TikTok publishing (Plan 5). Design + plans live in `../docs/superpowers/`.
