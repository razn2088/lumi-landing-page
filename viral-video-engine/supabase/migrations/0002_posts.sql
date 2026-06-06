-- supabase/migrations/0002_posts.sql
create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null references articles(id),
  brand_id text not null references brands(id),
  script jsonb not null,
  caption text not null,
  hashtags jsonb not null default '[]',
  status text not null default 'pending_review',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (article_id)
);
create index if not exists posts_brand_status_idx on posts (brand_id, status);
