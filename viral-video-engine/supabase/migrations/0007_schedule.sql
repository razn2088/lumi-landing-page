-- supabase/migrations/0007_schedule.sql
-- Scheduled publishing: when to publish an approved post (null = ASAP).
alter table posts add column if not exists publish_at timestamptz;
