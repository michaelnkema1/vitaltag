-- 0005_demo_seed.sql
-- Pre-populates demo accounts and sample medical data for testing.
-- Patient Demo: patient@vitaltag.demo / Password123!
-- Clinician Demo: clinician@vitaltag.demo / Password123!
-- Admin Demo: admin@vitaltag.demo / Password123!

-- 1. Ensure profile bootstrap trigger function never breaks auth.users inserts
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
  )
  on conflict (id) do update set
    full_name = coalesce(excluded.full_name, profiles.full_name),
    role = coalesce(excluded.role, profiles.role);
  return new;
exception
  when others then
    return new;
end;
$$;

do $$
declare
  v_patient_id uuid := 'a1111111-1111-1111-1111-111111111111';
  v_clinician_id uuid := 'c2222222-2222-2222-2222-222222222222';
  v_admin_id uuid := 'd3333333-3333-3333-3333-333333333333';
  v_passport_id uuid := 'b3333333-3333-3333-3333-333333333333';
  v_qr_token uuid := '11111111-1111-1111-1111-111111111111';
  v_encrypted_pw text;
begin
  -- 0. Global repair for any pre-existing auth.users with NULL values that break GoTrue scanner
  update auth.users set
    confirmation_token = coalesce(confirmation_token, ''),
    recovery_token = coalesce(recovery_token, ''),
    email_change_token_new = coalesce(email_change_token_new, ''),
    email_change_token_current = coalesce(email_change_token_current, ''),
    email_change = coalesce(email_change, ''),
    phone_change = coalesce(phone_change, ''),
    reauthentication_token = coalesce(reauthentication_token, ''),
    raw_app_meta_data = coalesce(raw_app_meta_data, '{"provider":"email","providers":["email"]}'::jsonb),
    raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb);

  -- Generate bcrypt hash for 'Password123!'
  v_encrypted_pw := crypt('Password123!', gen_salt('bf'));

  -- Clean up any corrupted or old demo user child records first to satisfy FK constraints
  delete from public.clinical_records where updated_by in (v_clinician_id, v_admin_id, v_patient_id) or passport_id = v_passport_id;
  delete from public.access_audit_log where accessed_by in (v_clinician_id, v_admin_id, v_patient_id) or passport_id = v_passport_id;
  delete from public.medication_holds where passport_id = v_passport_id;
  delete from public.allergies where passport_id = v_passport_id;
  delete from public.chronic_conditions where passport_id = v_passport_id;
  delete from public.ice_contacts where passport_id = v_passport_id;
  delete from public.passports where user_id in (v_patient_id, v_clinician_id, v_admin_id) or id = v_passport_id;

  -- Clean up demo auth.users and identities
  delete from auth.identities where user_id in (v_patient_id, v_clinician_id, v_admin_id);
  delete from auth.users where id in (v_patient_id, v_clinician_id, v_admin_id) or email in ('patient@vitaltag.demo', 'clinician@vitaltag.demo', 'admin@vitaltag.demo');

  -- 1. Create Patient User in auth.users & auth.identities
  insert into auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud,
    confirmation_token, recovery_token, email_change_token_new, email_change,
    phone, phone_change, email_change_token_current, reauthentication_token
  ) values (
    v_patient_id, '00000000-0000-0000-0000-000000000000',
    'patient@vitaltag.demo', v_encrypted_pw, now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"John Doe (Patient)","role":"patient"}'::jsonb,
    now(), now(), 'authenticated', 'authenticated',
    '', '', '', '', null, '', '', ''
  );

  insert into auth.identities (
    id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
  ) values (
    v_patient_id, v_patient_id,
    jsonb_build_object('sub', v_patient_id::text, 'email', 'patient@vitaltag.demo'),
    'email', v_patient_id::text, now(), now(), now()
  );

  insert into public.profiles (id, full_name, role)
  values (v_patient_id, 'John Doe (Patient)', 'patient')
  on conflict (id) do update set role = 'patient', full_name = 'John Doe (Patient)';

  -- 2. Create Clinician User in auth.users & auth.identities
  insert into auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud,
    confirmation_token, recovery_token, email_change_token_new, email_change,
    phone, phone_change, email_change_token_current, reauthentication_token
  ) values (
    v_clinician_id, '00000000-0000-0000-0000-000000000000',
    'clinician@vitaltag.demo', v_encrypted_pw, now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Dr. Sarah Jenkins","role":"clinician"}'::jsonb,
    now(), now(), 'authenticated', 'authenticated',
    '', '', '', '', null, '', '', ''
  );

  insert into auth.identities (
    id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
  ) values (
    v_clinician_id, v_clinician_id,
    jsonb_build_object('sub', v_clinician_id::text, 'email', 'clinician@vitaltag.demo'),
    'email', v_clinician_id::text, now(), now(), now()
  );

  insert into public.profiles (id, full_name, role)
  values (v_clinician_id, 'Dr. Sarah Jenkins', 'clinician')
  on conflict (id) do update set role = 'clinician', full_name = 'Dr. Sarah Jenkins';

  -- 3. Create Admin User in auth.users & auth.identities
  insert into auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud,
    confirmation_token, recovery_token, email_change_token_new, email_change,
    phone, phone_change, email_change_token_current, reauthentication_token
  ) values (
    v_admin_id, '00000000-0000-0000-0000-000000000000',
    'admin@vitaltag.demo', v_encrypted_pw, now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"System Administrator","role":"admin"}'::jsonb,
    now(), now(), 'authenticated', 'authenticated',
    '', '', '', '', null, '', '', ''
  );

  insert into auth.identities (
    id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
  ) values (
    v_admin_id, v_admin_id,
    jsonb_build_object('sub', v_admin_id::text, 'email', 'admin@vitaltag.demo'),
    'email', v_admin_id::text, now(), now(), now()
  );

  insert into public.profiles (id, full_name, role)
  values (v_admin_id, 'System Administrator', 'admin')
  on conflict (id) do update set role = 'admin', full_name = 'System Administrator';

  -- 4. Create Demo Passport for Patient
  insert into public.passports (id, user_id, qr_token, blood_group, weight_kg, height_cm, national_health_id)
  values (v_passport_id, v_patient_id, v_qr_token, 'O+', 74.5, 178.0, 'NHID-99482-GH');

  -- 5. Seed Allergies, Conditions, ICE Contacts for Demo Passport
  insert into public.allergies (passport_id, substance, severity, reaction_notes) values
    (v_passport_id, 'Penicillin', 'severe', 'Causes acute anaphylaxis and breathing difficulty'),
    (v_passport_id, 'Peanuts', 'moderate', 'Causes hives and facial swelling');

  insert into public.chronic_conditions (passport_id, condition_name, notes) values
    (v_passport_id, 'Asthma', 'Uses Albuterol inhaler PRN'),
    (v_passport_id, 'Type 1 Diabetes', 'Insulin-dependent since 2018');

  insert into public.ice_contacts (passport_id, name, relationship, phone, priority) values
    (v_passport_id, 'Jane Doe', 'Spouse', '+1-555-0199', 1),
    (v_passport_id, 'Marcus Doe', 'Brother', '+1-555-0288', 2);

  -- 6. Seed Tier 2 Clinical Ledger
  insert into public.clinical_records (passport_id, doctor_notes, diagnosis_history, prescriptions, updated_by) values
    (
      v_passport_id,
      'Patient presented with mild acute asthma exacerbation during routine checkup. Vitals stable. Responding well to inhaled bronchodilator therapy.',
      '["Type 1 Diabetes", "Asthma", "Allergic Rhinitis"]'::jsonb,
      '["Insulin Glargine 20 units QHS", "Albuterol HFA 90mcg 2 puffs q4h PRN"]'::jsonb,
      v_clinician_id
    );

end $$;
