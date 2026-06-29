-- Run this once in Supabase → SQL Editor → New query → paste → Run.

-- 1) the key/value table the app reads & writes
create table if not exists public.kv (
  key         text primary key,
  value       jsonb,
  updated_at  timestamptz default now(),
  updated_by  text
);

alter table public.kv enable row level security;

drop policy if exists "authenticated full access" on public.kv;
create policy "authenticated full access"
  on public.kv
  for all
  to authenticated
  using (true)
  with check (true);

-- 2) storage bucket for the hotel map image (and any future uploaded images)
insert into storage.buckets (id, name, public)
values ('hub-media', 'hub-media', true)
on conflict (id) do nothing;

drop policy if exists "authenticated upload" on storage.objects;
create policy "authenticated upload"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'hub-media');

drop policy if exists "authenticated update" on storage.objects;
create policy "authenticated update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'hub-media');

drop policy if exists "public read" on storage.objects;
create policy "public read"
  on storage.objects for select
  to public
  using (bucket_id = 'hub-media');
