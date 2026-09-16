-- 0006_seed_pharmacies.sql
-- Seeds community partner pharmacies for post-triage telemetry & 60-minute medication holds

do $$
begin
  if not exists (select 1 from public.pharmacies limit 1) then
    insert into public.pharmacies (name, address, lat, lng, phone) values
      ('St. Jude Community Pharmacy', '142 Medical Center Blvd, Sector 4', 5.6037, -0.1870, '+233-30-277-1001'),
      ('CityCare Triage Dispensary', '88 Independence Ave, Downtown', 5.5560, -0.1969, '+233-30-266-2200'),
      ('MetroHealth 24/7 Pharmacy', '12 Ring Road Central, East Ridge', 5.5682, -0.1812, '+233-30-255-3344'),
      ('Apex Care Chemist & Triage', '45 Hospital Road, North Industrial Area', 5.5791, -0.2100, '+233-30-244-5566');
  end if;
end $$;
