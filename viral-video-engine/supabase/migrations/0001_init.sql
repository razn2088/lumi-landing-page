-- supabase/migrations/0001_init.sql
create extension if not exists pgcrypto;

create table if not exists brands (
  id text primary key,
  name text not null,
  site_url text not null,
  wp_api_base text not null,
  niche text not null default '',
  tone text not null default '',
  use_featured_image_beat boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists articles (
  id uuid primary key default gen_random_uuid(),
  brand_id text not null references brands(id),
  wp_post_id bigint not null,
  url text not null,
  title text not null,
  excerpt text not null default '',
  content text not null default '',
  image_urls jsonb not null default '[]',
  featured_image_url text,
  content_hash text not null,
  published_at timestamptz not null,
  detected_at timestamptz not null default now(),
  status text not null default 'new',
  unique (brand_id, content_hash)
);
create index if not exists articles_brand_published_idx on articles (brand_id, published_at desc);

create table if not exists jobs (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  status text not null default 'queued',
  attempts int not null default 0,
  max_attempts int not null default 5,
  idempotency_key text not null unique,
  payload jsonb not null default '{}',
  last_error text,
  run_after timestamptz not null default now(),
  locked_at timestamptz,
  locked_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists jobs_claim_idx on jobs (status, type, run_after);

-- Atomically claim one ready job of an allowed type (SKIP LOCKED).
create or replace function claim_job(p_types text[], p_worker text)
returns setof jobs
language plpgsql
set search_path = public
as $$
declare
  v_id uuid;
begin
  select id into v_id
  from jobs
  where status = 'queued'
    and type = any(p_types)
    and run_after <= now()
  order by run_after
  for update skip locked
  limit 1;

  if v_id is null then
    return;
  end if;

  return query
  update jobs
  set status = 'processing',
      attempts = attempts + 1,
      locked_at = now(),
      locked_by = p_worker,
      updated_at = now()
  where id = v_id
  returning *;
end;
$$;
