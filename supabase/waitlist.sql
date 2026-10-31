create table if not exists public.waitlist_signups (
  id bigint generated always as identity primary key,
  email text not null unique,
  created_at timestamptz not null default now(),
  constraint waitlist_signups_email_format
    check (email = lower(email) and email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$')
);

alter table public.waitlist_signups enable row level security;

create policy "Anyone can join the VEYRO waitlist"
  on public.waitlist_signups
  for insert
  to anon
  with check (true);
