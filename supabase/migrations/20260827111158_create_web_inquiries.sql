-- Public website inquiries land here (anon INSERT only, admin reads).
-- Kept separate from `leads` so the public can never write into the CRM.
create table if not exists public.web_inquiries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  phone text,
  email text,
  location text,
  size text,
  status text,
  contact_pref text,
  energy text,
  message text,
  lang text,
  -- audit workflow
  audit_state text not null default 'new',   -- new | prepared | sent | rejected
  audit_result jsonb,
  processed_at timestamptz,
  converted_lead_id uuid references public.leads(id)
);

create index if not exists web_inquiries_state_idx on public.web_inquiries (audit_state, created_at desc);

alter table public.web_inquiries enable row level security;

-- The public site may only INSERT, never read.
drop policy if exists web_inquiries_anon_insert on public.web_inquiries;
create policy web_inquiries_anon_insert
  on public.web_inquiries for insert
  to anon
  with check (
    length(coalesce(name, '')) between 1 and 200
    and length(coalesce(message, '')) <= 4000
    and length(coalesce(phone, '')) <= 60
    and length(coalesce(email, '')) <= 200
    and audit_state = 'new'
    and audit_result is null
    and processed_at is null
    and converted_lead_id is null
  );

-- Admins (portal) get full access, same rule as the other tables.
drop policy if exists web_inquiries_admin_all on public.web_inquiries;
create policy web_inquiries_admin_all
  on public.web_inquiries for all
  to authenticated
  using (is_admin())
  with check (is_admin());