-- ============================================================================
-- DHA Overstay Appeal Management System — Supabase schema (prototype)
-- ============================================================================
-- Run this once in the Supabase SQL editor (or via `supabase db push`).
--
-- SECURITY NOTE: This prototype has no real authentication layer (see project
-- README). RLS is enabled with permissive policies so the demo works using
-- only the anon public key. This is NOT safe for production — before going
-- live, replace these policies with ones scoped to authenticated users/roles.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- users (demo directory of staff/applicant accounts — not Supabase Auth users)
-- ----------------------------------------------------------------------------
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  full_name text not null,
  role text not null check (role in (
    'applicant', 'assigner', 'adjudicator', 'supervisor',
    'deputy_director', 'director', 'chief_director', 'admin'
  )),
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- applications
-- ----------------------------------------------------------------------------
create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  ref_number text unique not null,
  status text not null default 'Submitted' check (status in (
    'Draft', 'Submitted', 'Assigned', 'Adjudicator Review', 'Supervisor Review',
    'Deputy Director Review', 'Director Review', 'Chief Director Review',
    'Pending Applicant Action', 'Approved', 'Rejected', 'Closed'
  )),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  name text not null,
  surname text not null,
  passport_number text not null,
  nationality text,
  country_of_residence text,
  port_of_exit text,
  form19_reference text,

  overstay_reference text,
  date_of_overstay date,
  appeal_reason text,
  appeal_reason_other text,

  declaration_signed boolean not null default false,
  signature_name text,

  payment_status text not null default 'Pending' check (payment_status in ('Pending', 'Paid')),
  service_fee numeric(10, 2) not null default 1500,

  applicant_email text not null,
  assigned_to text
);

create index if not exists idx_applications_status on public.applications(status);
create index if not exists idx_applications_applicant_email on public.applications(applicant_email);

-- ----------------------------------------------------------------------------
-- application_documents
-- ----------------------------------------------------------------------------
create table if not exists public.application_documents (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  type text not null check (type in ('Appeal Letter', 'Form 19', 'Supporting Document')),
  file_name text not null,
  storage_path text,
  size_kb integer not null default 0,
  uploaded_at timestamptz not null default now()
);

create index if not exists idx_application_documents_application_id on public.application_documents(application_id);

-- ----------------------------------------------------------------------------
-- application_comments
-- ----------------------------------------------------------------------------
create table if not exists public.application_comments (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  author text not null,
  role text not null,
  comment text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_application_comments_application_id on public.application_comments(application_id);

-- ----------------------------------------------------------------------------
-- application_assignments
-- ----------------------------------------------------------------------------
create table if not exists public.application_assignments (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  assigned_to text not null,
  assigned_by text,
  assigned_at timestamptz not null default now()
);

create index if not exists idx_application_assignments_application_id on public.application_assignments(application_id);

-- ----------------------------------------------------------------------------
-- application_status_history (audit trail)
-- ----------------------------------------------------------------------------
create table if not exists public.application_status_history (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  status text not null,
  changed_by text,
  role text,
  comments text,
  created_at timestamptz not null default now()
);

create index if not exists idx_application_status_history_application_id on public.application_status_history(application_id);

-- ----------------------------------------------------------------------------
-- application_document_requests ("Request Additional Documents" workflow)
-- ----------------------------------------------------------------------------
create table if not exists public.application_document_requests (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  missing_document_type text not null,
  comments text,
  requested_at timestamptz not null default now(),
  return_stage text not null,
  fulfilled boolean not null default false
);

create index if not exists idx_application_document_requests_application_id on public.application_document_requests(application_id);

-- ----------------------------------------------------------------------------
-- notifications
-- ----------------------------------------------------------------------------
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  message text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_notifications_application_id on public.notifications(application_id);

-- ----------------------------------------------------------------------------
-- decision_letters
-- ----------------------------------------------------------------------------
create table if not exists public.decision_letters (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  type text not null check (type in ('Approval', 'Rejection')),
  ref_number text not null,
  storage_path text,
  created_at timestamptz not null default now()
);

create index if not exists idx_decision_letters_application_id on public.decision_letters(application_id);

-- ----------------------------------------------------------------------------
-- keep updated_at current on applications
-- ----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_applications_updated_at on public.applications;
create trigger trg_applications_updated_at
  before update on public.applications
  for each row execute function public.set_updated_at();

-- ============================================================================
-- Row Level Security — permissive prototype policies (anon key, no auth)
-- ============================================================================
alter table public.users enable row level security;
alter table public.applications enable row level security;
alter table public.application_documents enable row level security;
alter table public.application_comments enable row level security;
alter table public.application_assignments enable row level security;
alter table public.application_status_history enable row level security;
alter table public.application_document_requests enable row level security;
alter table public.notifications enable row level security;
alter table public.decision_letters enable row level security;

do $$
declare
  t text;
begin
  for t in select unnest(array[
    'users', 'applications', 'application_documents', 'application_comments',
    'application_assignments', 'application_status_history',
    'application_document_requests', 'notifications', 'decision_letters'
  ])
  loop
    execute format('drop policy if exists "prototype_allow_all" on public.%I;', t);
    execute format(
      'create policy "prototype_allow_all" on public.%I for all using (true) with check (true);',
      t
    );
  end loop;
end $$;

-- ============================================================================
-- Storage bucket for uploaded documents & generated letters
-- ============================================================================
insert into storage.buckets (id, name, public)
values ('appeal-documents', 'appeal-documents', true)
on conflict (id) do nothing;

drop policy if exists "prototype_storage_allow_all" on storage.objects;
create policy "prototype_storage_allow_all" on storage.objects
  for all using (bucket_id = 'appeal-documents') with check (bucket_id = 'appeal-documents');
