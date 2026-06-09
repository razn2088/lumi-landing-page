-- supabase/migrations/0006_connections.sql
-- Shared Meta System User token (one row) + the connected IG @handle per brand.
create table if not exists app_config (
  key text primary key,
  value text,
  updated_at timestamptz not null default now()
);
alter table brands add column if not exists ig_username text;
