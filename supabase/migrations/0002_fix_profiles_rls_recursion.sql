-- Fixes: "infinite recursion detected in policy for relation 'profiles'"
-- (Postgres error 42P17), hit by any query that needed to evaluate a
-- clinician/admin role check -- including a plain passport insert, since
-- Postgres plans all applicable policies together and the passports
-- "clinicians read" policy itself subqueries profiles.
--
-- Root cause: several policies checked the caller's role with
--   exists (select 1 from profiles me where me.id = auth.uid() and me.role in (...))
-- which subqueries profiles from within a policy that itself protects
-- profiles (or, via other tables' clinician-read policies, indirectly
-- requires re-evaluating profiles' own policies). Postgres's RLS planner
-- expands this as one combined expression, so any self-reference recurses
-- indefinitely regardless of which row would actually match.
--
-- Fix: move the role check into a SECURITY DEFINER function. Functions
-- like this run as their owner (the migration role), which bypasses RLS,
-- so the internal profiles lookup never re-triggers policy evaluation.

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

drop policy if exists "profiles: clinicians read all" on profiles;
create policy "profiles: clinicians read all" on profiles
  for select using (is_clinician());

drop policy if exists "passports: clinicians read" on passports;
create policy "passports: clinicians read" on passports
  for select using (is_clinician());

do $$
declare
  t text;
begin
  foreach t in array array['allergies', 'chronic_conditions', 'ice_contacts']
  loop
    execute format('drop policy if exists "%1$s: clinicians read" on %1$s;', t);
    execute format(
      'create policy "%1$s: clinicians read" on %1$s for select using (is_clinician());',
      t
    );
  end loop;
end $$;

drop policy if exists "clinical_records: clinicians only" on clinical_records;
create policy "clinical_records: clinicians only" on clinical_records
  for all using (is_clinician()) with check (is_clinician());

drop policy if exists "access_audit_log: clinicians read" on access_audit_log;
create policy "access_audit_log: clinicians read" on access_audit_log
  for select using (is_clinician());

drop policy if exists "medication_holds: clinicians read" on medication_holds;
create policy "medication_holds: clinicians read" on medication_holds
  for select using (is_clinician());
