-- One passport per user. Without this, a masked read error (fixed in
-- 0002) let a stuck "create passport" form get resubmitted dozens of
-- times, each one silently succeeding and creating another row -- the
-- dashboard's .maybeSingle() read then breaks the moment more than one
-- row exists for a user.
alter table passports add constraint passports_user_id_key unique (user_id);
