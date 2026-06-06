-- supabase/migrations/0003_post_assets.sql
-- Adds asset columns populated by the assets stage (TTS voiceover + per-beat clips).
-- Columns are nullable: a post is created by the generate stage first, then the
-- assets stage fills these in. The row mapper treats a null voiceover_url as
-- "no assets yet" (post.assets === undefined).
alter table posts add column if not exists voiceover_url text;
alter table posts add column if not exists voiceover_duration_ms integer;
alter table posts add column if not exists clip_urls jsonb not null default '[]';
