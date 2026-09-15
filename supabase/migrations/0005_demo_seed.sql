-- 0005_demo_seed.sql
-- Pre-populates demo accounts and sample medical data for testing.
-- Patient Demo: patient@vitaltag.demo / Password123!
-- Clinician Demo: clinician@vitaltag.demo / Password123!

do $$
declare
  v_patient_id uuid := 'a1111111-1111-1111-1111-111111111111';
  v_clinician_id uuid := 'c2222222-2222-2222-2222-222222222222';
  v_passport_id uuid := 'p3333333-3333-3333-3333-333333333333';
  v_qr_token uuid := '11111111-1111-1111-1111-111111111111';
  v_encrypted_pw text;
begin
  -- Generate bcrypt hash for 'Password123!'
  v_encrypted_pw := crypt('Password123!', gen_salt('bf'));

  -- 1. Create Patient User in auth.users if not exists
  if not exists (select 1 from auth.users where email = 'patient@vitaltag.demo') then
    insert into auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
    ) values (
      v_patient_id, '00000000-0000-0000-0000-000000000000',
      'patient@vitaltag.demo', v_encrypted_pw, now(),
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"John Doe (Patient)","role":"patient"}',
      now(), now(), 'authenticated', 'authenticated'
    );

    insert into public.profiles (id, full_name, role)
    values (v_patient_id, 'John Doe (Patient)', 'patient')
    on conflict (id) do update set role = 'patient', full_name = 'John Doe (Patient)';
  end if;

  -- Get actual patient ID
  select id into v_patient_id from auth.users where email = 'patient@vitaltag.demo';

  -- 2. Create Clinician User in auth.users if not exists
  if not exists (select 1 from auth.users where email = 'clinician@vitaltag.demo') then
    insert into auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
    ) values (
      v_clinician_id, '00000000-0000-0000-0000-000000000000',
      'clinician@vitaltag.demo', v_encrypted_pw, now(),
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"Dr. Sarah Jenkins","role":"clinician"}',
      now(), now(), 'authenticated', 'authenticated'
    );

    insert into public.profiles (id, full_name, role)
    values (v_clinician_id, 'Dr. Sarah Jenkins', 'clinician')
    on conflict (id) do update set role = 'clinician', full_name = 'Dr. Sarah Jenkins';
  else
    select id into v_clinician_id from auth.users where email = 'clinician@vitaltag.demo';
    update public.profiles set role = 'clinician' where id = v_clinician_id;
  end if;

  -- 3. Create Demo Passport for Patient
  if not exists (select 1 from public.passports where user_id = v_patient_id) then
    insert into public.passports (id, user_id, qr_token, blood_group, weight_kg, height_cm, national_health_id)
    values (v_passport_id, v_patient_id, v_qr_token, 'O+', 74.5, 178.0, 'NHID-99482-GH')
    on conflict (user_id) do nothing;
  end if;

  select id into v_passport_id from public.passports where user_id = v_patient_id;

  -- 4. Seed Allergies, Conditions, ICE Contacts for Demo Passport
  if not exists (select 1 from public.allergies where passport_id = v_passport_id) then
    insert into public.allergies (passport_id, substance, severity, reaction_notes) values
      (v_passport_id, 'Penicillin', 'severe', 'Causes acute anaphylaxis and breathing difficulty'),
      (v_passport_id, 'Peanuts', 'moderate', 'Causes hives and facial swelling');

    insert into public.chronic_conditions (passport_id, condition_name, notes) values
      (v_passport_id, 'Asthma', 'Uses Albuterol inhaler PRN'),
      (v_passport_id, 'Type 1 Diabetes', 'Insulin-dependent since 2018');

    insert into public.ice_contacts (passport_id, name, relationship, phone, priority) values
      (v_passport_id, 'Jane Doe', 'Spouse', '+1-555-0199', 1),
      (v_passport_id, 'Marcus Doe', 'Brother', '+1-555-0288', 2);
  end if;

  -- 5. Seed Tier 2 Clinical Ledger
  if not exists (select 1 from public.clinical_records where passport_id = v_passport_id) then
    insert into public.clinical_records (passport_id, doctor_notes, diagnosis_history, prescriptions, updated_by) values
      (
        v_passport_id,
        'Patient presented with mild acute asthma exacerbation during routine checkup. Vitals stable. Responding well to inhaled bronchodilator therapy.',
        '["Type 1 Diabetes", "Asthma", "Allergic Rhinitis"]'::jsonb,
        '["Insulin Glargine 20 units QHS", "Albuterol HFA 90mcg 2 puffs q4h PRN"]'::jsonb,
        v_clinician_id
      );
  end if;

end $$;
