-- Normalise any Czech/intl phone spelling to E.164 digits without '+':
--   '773 526 869' -> '420773526869', '+420 792 531 486' -> '420792531486',
--   '00420…' -> '420…', already '420…' stays. Empty/null -> null.
create or replace function public.norm_phone(p text)
returns text language sql immutable as $$
  select case
    when p is null then null
    when regexp_replace(p, '\D', '', 'g') = '' then null
    when regexp_replace(p, '\D', '', 'g') ~ '^00' then substr(regexp_replace(p, '\D', '', 'g'), 3)
    when length(regexp_replace(p, '\D', '', 'g')) = 9 then '420' || regexp_replace(p, '\D', '', 'g')
    else regexp_replace(p, '\D', '', 'g')
  end;
$$;

-- Owner matching: by e-mail OR by phone (Supabase puts the phone claim in the JWT
-- as digits without '+'). Empty e-mail / phone never matches anything.
create or replace function public.my_client_ids()
returns setof uuid
language sql stable security definer set search_path to 'public' as $$
  with me as (
    select nullif(lower(auth.jwt()->>'email'), '') as e,
           public.norm_phone(auth.jwt()->>'phone') as p
  )
  select c.id
  from public.clients c, me
  where (me.e is not null and lower(c.email) = me.e)
     or (me.p is not null and public.norm_phone(c.phone) = me.p);
$$;