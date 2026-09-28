-- Run this once in Supabase: Project -> SQL Editor -> New query.

create table if not exists quote_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  category text not null,
  pickup text not null,
  dropoff text not null,
  timing text not null,
  details text not null,
  name text not null,
  email text not null,
  phone text,
  source_page text
);

alter table quote_requests enable row level security;

-- Public site visitors can submit a quote (insert), but cannot read, edit, or
-- delete anyone's submissions. Only you can read them from the Supabase dashboard
-- (Table Editor) or with the service_role key, which stays server-side only.
create policy "Public can submit quote requests"
  on quote_requests
  for insert
  to anon
  with check (true);
