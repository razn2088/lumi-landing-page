-- supabase/migrations/0004_render.sql
-- Render foundations: per-word timings + segments timeline on posts,
-- the rendered MP4 url, and brand render config. All nullable/defaulted
-- so existing rows stay valid; populated by the upgraded assets + render steps.
alter table posts add column if not exists word_timings jsonb not null default '[]';
alter table posts add column if not exists segments jsonb not null default '[]';
alter table posts add column if not exists video_url text;

alter table brands add column if not exists handle text not null default '';
alter table brands add column if not exists logo_url text;
alter table brands add column if not exists brand_color text not null default '#ffd60a';
alter table brands add column if not exists music_drive_folder_id text;
