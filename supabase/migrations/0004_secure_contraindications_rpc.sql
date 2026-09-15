-- 0004_secure_contraindications_rpc.sql
-- Restricts check_allergy_contraindication RPC to passport owners or clinicians/admins.

create or replace function check_allergy_contraindication(p_passport_id uuid, p_medication text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_is_owner boolean;
  v_is_clinician boolean;
begin
  select exists (
    select 1 from passports p where p.id = p_passport_id and p.user_id = auth.uid()
  ) into v_is_owner;

  v_is_clinician := is_clinician();

  if not (v_is_owner or v_is_clinician) then
    raise exception 'Unauthorized allergy contraindication access'
      using errcode = '42501';
  end if;

  return (
    select coalesce(jsonb_agg(jsonb_build_object(
      'substance', a.substance,
      'severity', a.severity,
      'reaction_notes', a.reaction_notes
    )), '[]'::jsonb)
    from allergies a
    where a.passport_id = p_passport_id
      and p_medication ilike '%' || a.substance || '%'
  );
end;
$$;

grant execute on function check_allergy_contraindication(uuid, text) to authenticated;
