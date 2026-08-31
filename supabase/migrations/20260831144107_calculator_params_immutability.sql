-- exactly one current model version
create unique index if not exists calculator_params_one_current on public.calculator_params (is_current) where is_current;

-- params of a version that has already produced a lead are immutable; create a new version instead
create or replace function public.calculator_params_guard() returns trigger language plpgsql as $$
begin
  if new.params is distinct from old.params
     and exists (select 1 from public.web_inquiries w where w.calc_model_version = old.model_version) then
    raise exception 'calculator_params.% is frozen: it has produced leads. Insert a new model_version instead.', old.model_version;
  end if;
  if new.model_version is distinct from old.model_version then
    raise exception 'model_version is immutable';
  end if;
  return new;
end $$;
drop trigger if exists calculator_params_guard on public.calculator_params;
create trigger calculator_params_guard before update on public.calculator_params
for each row execute function public.calculator_params_guard();

create or replace function public.calculator_params_no_delete() returns trigger language plpgsql as $$
begin
  if exists (select 1 from public.web_inquiries w where w.calc_model_version = old.model_version) then
    raise exception 'calculator_params.% is frozen: it has produced leads and cannot be deleted.', old.model_version;
  end if;
  return old;
end $$;
drop trigger if exists calculator_params_no_delete on public.calculator_params;
create trigger calculator_params_no_delete before delete on public.calculator_params
for each row execute function public.calculator_params_no_delete();