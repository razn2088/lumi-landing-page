-- supabase/migrations/0005_publish.sql
-- Instagram publishing: per-brand IG credentials + per-post publish results.
-- All nullable/defaulted so existing rows stay valid.
alter table brands add column if not exists ig_user_id text;
alter table brands add column if not exists ig_access_token text;
alter table brands add column if not exists ig_enabled boolean not null default false;

alter table posts add column if not exists ig_media_id text;
alter table posts add column if not exists ig_permalink text;
alter table posts add column if not exists last_publish_error text;
