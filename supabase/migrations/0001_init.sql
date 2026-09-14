-- VitalTag core schema
-- Implements the two-tier access model described in the proposal:
--   Tier 1 (Emergency Crash Data): zero-login, exposed only through the
--     get_emergency_snapshot() RPC below, never through direct table grants.
--   Tier 2 (Full Clinical Ledger): RLS-gated to authenticated clinicians.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

create type user_role as enum ('patient', 'responder', 'clinician', 'admin');
create type allergy_severity as enum ('mild', 'moderate', 'severe');
create type hold_status as enum ('pending', 'fulfilled', 'expired', 'cancelled');

-- ---------------------------------------------------------------------------
-- profiles: one row per auth.users, carries the RBAC role
-- ---------------------------------------------------------------------------

create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  role user_role not null default 'patient',
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table profiles enable row level security;

-- SECURITY DEFINER so this bypasses RLS internally: a policy that
-- subqueries profiles directly from within profiles' own policy (or from
-- another table's clinician-read policy) makes Postgres's RLS planner
-- recurse indefinitely (error 42P17, "infinite recursion detected in
-- policy"). Routing the check through this function breaks the cycle.
create or replace function is_clinician()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role in ('clinician', 'admin')
  );
$$;

grant execute on function is_clinician() to authenticated;

create policy "profiles: read own" on profiles
  for select using (auth.uid() = id);

create policy "profiles: update own" on profiles
  for update using (auth.uid() = id);

create policy "profiles: clinicians read all" on profiles
  for select using (is_clinician());

-- ---------------------------------------------------------------------------
-- passports: the cloud-linked VitalTag pass. qr_token is the sole value
-- encoded in the physical card / QR image (a 128-bit random pointer, never
-- the medical data itself).
-- ---------------------------------------------------------------------------

create table passports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references profiles (id) on delete cascade,
  qr_token uuid not null unique default gen_random_uuid(),
  blood_group text not null check (blood_group in ('O+','O-','A+','A-','B+','B-','AB+','AB-','unknown')),
  weight_kg numeric(5,2),
  height_cm numeric(5,2),
  national_health_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index passports_user_id_idx on passports (user_id);

alter table passports enable row level security;

create policy "passports: owner full access" on passports
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "passports: clinicians read" on passports
  for select using (is_clinician());

-- ---------------------------------------------------------------------------
-- Tier 1 data: allergies, chronic conditions, ICE contacts.
-- Patients manage these directly; they are also the fields the emergency
-- RPC is allowed to surface to anonymous first responders.
-- ---------------------------------------------------------------------------

create table allergies (
  id uuid primary key default gen_random_uuid(),
  passport_id uuid not null references passports (id) on delete cascade,
  substance text not null,
  severity allergy_severity not null default 'moderate',
  reaction_notes text,
  created_at timestamptz not null default now()
);

create index allergies_passport_id_idx on allergies (passport_id);
alter table allergies enable row level security;

create table chronic_conditions (
  id uuid primary key default gen_random_uuid(),
  passport_id uuid not null references passports (id) on delete cascade,
  condition_name text not null,
  notes text,
  created_at timestamptz not null default now()
);

create index chronic_conditions_passport_id_idx on chronic_conditions (passport_id);
alter table chronic_conditions enable row level security;

create table ice_contacts (
  id uuid primary key default gen_random_uuid(),
  passport_id uuid not null references passports (id) on delete cascade,
  name text not null,
  relationship text not null,
  phone text not null,
  priority smallint not null default 1,
  created_at timestamptz not null default now()
);

create index ice_contacts_passport_id_idx on ice_contacts (passport_id);
alter table ice_contacts enable row level security;

-- Shared policy shape for the three Tier 1 child tables: owner manages
-- their own rows, clinicians can read.
do $$
declare
  t text;
begin
  foreach t in array array['allergies', 'chronic_conditions', 'ice_contacts']
  loop
    execute format($f$
      create policy "%1$s: owner full access" on %1$s
        for all using (
          exists (select 1 from passports p where p.id = %1$s.passport_id and p.user_id = auth.uid())
        ) with check (
          exists (select 1 from passports p where p.id = %1$s.passport_id and p.user_id = auth.uid())
        );
    $f$, t);

    execute format($f$
      create policy "%1$s: clinicians read" on %1$s
        for select using (is_clinician());
    $f$, t);
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- Tier 2 data: full clinical ledger. RLS restricts to clinicians only --
-- there is no "owner reads own record" bypass here by design; patients see
-- their clinical history through a clinician-mediated view, not directly,
-- matching "Restricted Hospital Terminal" in the proposal. Adjust later if
-- patient self-service access to Tier 2 is desired.
-- ---------------------------------------------------------------------------

create table clinical_records (
  id uuid primary key default gen_random_uuid(),
  passport_id uuid not null references passports (id) on delete cascade,
  diagnosis_history jsonb not null default '[]'::jsonb,
  prescriptions jsonb not null default '[]'::jsonb,
  lab_results jsonb not null default '[]'::jsonb,
  doctor_notes text,
  updated_by uuid references profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index clinical_records_passport_id_idx on clinical_records (passport_id);
alter table clinical_records enable row level security;

create policy "clinical_records: clinicians only" on clinical_records
  for all using (is_clinician()) with check (is_clinician());

-- ---------------------------------------------------------------------------
-- access_audit_log: every scan, tier 1 or tier 2, is logged. Tier 1 scans
-- are almost always anonymous (accessed_by is null) since the whole point
-- is zero-login responder access.
-- ---------------------------------------------------------------------------

create table access_audit_log (
  id uuid primary key default gen_random_uuid(),
  passport_id uuid not null references passports (id) on delete cascade,
  accessed_by uuid references profiles (id),
  tier smallint not null check (tier in (1, 2)),
  accessed_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb
);

create index access_audit_log_passport_id_idx on access_audit_log (passport_id);
alter table access_audit_log enable row level security;

create policy "access_audit_log: owner reads own" on access_audit_log
  for select using (
    exists (select 1 from passports p where p.id = access_audit_log.passport_id and p.user_id = auth.uid())
  );

create policy "access_audit_log: clinicians read" on access_audit_log
  for select using (is_clinician());

-- ---------------------------------------------------------------------------
-- Pharmacy network + post-triage medication holds
-- ---------------------------------------------------------------------------

create table pharmacies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text not null,
  lat double precision not null,
  lng double precision not null,
  phone text,
  created_at timestamptz not null default now()
);

alter table pharmacies enable row level security;

create policy "pharmacies: public read" on pharmacies
  for select using (true);

create table medication_holds (
  id uuid primary key default gen_random_uuid(),
  passport_id uuid not null references passports (id) on delete cascade,
  pharmacy_id uuid not null references pharmacies (id),
  medication_name text not null,
  status hold_status not null default 'pending',
  held_until timestamptz not null default (now() + interval '60 minutes'),
  created_at timestamptz not null default now()
);

create index medication_holds_passport_id_idx on medication_holds (passport_id);
alter table medication_holds enable row level security;

create policy "medication_holds: owner full access" on medication_holds
  for all using (
    exists (select 1 from passports p where p.id = medication_holds.passport_id and p.user_id = auth.uid())
  ) with check (
    exists (select 1 from passports p where p.id = medication_holds.passport_id and p.user_id = auth.uid())
  );

create policy "medication_holds: clinicians read" on medication_holds
  for select using (is_clinician());

-- ---------------------------------------------------------------------------
-- get_emergency_snapshot: the ONLY path to Tier 1 data for anonymous
-- responders. SECURITY DEFINER lets it bypass the RLS above (which has no
-- anon policies at all -- direct table access from anon is always denied)
-- while still hand-picking exactly the Tier 1 fields the proposal allows,
-- and it writes its own audit log row so every crash-data scan is tracked.
-- ---------------------------------------------------------------------------

create or replace function get_emergency_snapshot(p_token uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_passport passports%rowtype;
  v_result jsonb;
begin
  select * into v_passport from passports where qr_token = p_token;

  if not found then
    return null;
  end if;

  select jsonb_build_object(
    'blood_group', v_passport.blood_group,
    'allergies', coalesce((
      select jsonb_agg(jsonb_build_object(
        'substance', a.substance,
        'severity', a.severity,
        'reaction_notes', a.reaction_notes
      ))
      from allergies a where a.passport_id = v_passport.id
    ), '[]'::jsonb),
    'chronic_conditions', coalesce((
      select jsonb_agg(jsonb_build_object(
        'condition_name', c.condition_name,
        'notes', c.notes
      ))
      from chronic_conditions c where c.passport_id = v_passport.id
    ), '[]'::jsonb),
    'ice_contacts', coalesce((
      select jsonb_agg(jsonb_build_object(
        'name', ic.name,
        'relationship', ic.relationship,
        'phone', ic.phone
      ) order by ic.priority)
      from ice_contacts ic where ic.passport_id = v_passport.id
    ), '[]'::jsonb)
  ) into v_result;

  insert into access_audit_log (passport_id, accessed_by, tier, metadata)
  values (v_passport.id, auth.uid(), 1, jsonb_build_object('via', 'get_emergency_snapshot'));

  return v_result;
end;
$$;

-- Anonymous responders and logged-in users alike call this RPC; the
-- function body is the only thing that decides what comes back.
grant execute on function get_emergency_snapshot(uuid) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- check_allergy_contraindication: Module 3, the allergy cross-check engine.
-- Given a passport and a proposed medication name, flags a severe conflict
-- if it (case-insensitively) matches a recorded allergy substance.
-- ---------------------------------------------------------------------------

create or replace function check_allergy_contraindication(p_passport_id uuid, p_medication text)
returns jsonb
language sql
security definer
set search_path = public
as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'substance', a.substance,
    'severity', a.severity,
    'reaction_notes', a.reaction_notes
  )), '[]'::jsonb)
  from allergies a
  where a.passport_id = p_passport_id
    and p_medication ilike '%' || a.substance || '%';
$$;

grant execute on function check_allergy_contraindication(uuid, text) to authenticated;

-- ---------------------------------------------------------------------------
-- updated_at maintenance
-- ---------------------------------------------------------------------------

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at before update on profiles
  for each row execute function set_updated_at();

create trigger passports_set_updated_at before update on passports
  for each row execute function set_updated_at();

create trigger clinical_records_set_updated_at before update on clinical_records
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- New auth.users -> profiles bootstrap
-- ---------------------------------------------------------------------------

create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', 'Unnamed'),
    coalesce((new.raw_user_meta_data ->> 'role')::user_role, 'patient')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ---------------------------------------------------------------------------
-- Realtime: let clients subscribe to their own passport / Tier 1 tables
-- for the "cloud reactivity" sync described in the proposal.
-- ---------------------------------------------------------------------------

alter publication supabase_realtime add table passports, allergies, chronic_conditions, ice_contacts, medication_holds;
