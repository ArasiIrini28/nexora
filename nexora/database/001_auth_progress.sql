-- Run once in the Supabase SQL editor. Supabase Auth owns password hashing.
begin;
create table if not exists public.nexora_profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 username text not null unique check (username ~ '^[a-z][a-z0-9_]{2,23}$'),
 full_name text not null check (char_length(full_name) between 1 and 100),
 created_at timestamptz not null default now()
);
create table if not exists public.nexora_progress (
 user_id uuid primary key references auth.users(id) on delete cascade,
 state jsonb not null default '{}'::jsonb,
 revision integer not null default 1,
 updated_at timestamptz not null default now(),
 check (octet_length(state::text) <= 250000)
);
alter table public.nexora_profiles enable row level security;
alter table public.nexora_progress enable row level security;
create policy "Read own profile" on public.nexora_profiles for select to authenticated using ((select auth.uid())=id);
create policy "Update own profile" on public.nexora_profiles for update to authenticated using ((select auth.uid())=id) with check ((select auth.uid())=id);
create policy "Read own progress" on public.nexora_progress for select to authenticated using ((select auth.uid())=user_id);
create policy "Insert own progress" on public.nexora_progress for insert to authenticated with check ((select auth.uid())=user_id);
create policy "Update own progress" on public.nexora_progress for update to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
revoke all on public.nexora_profiles, public.nexora_progress from anon;
revoke all on public.nexora_profiles, public.nexora_progress from authenticated;
grant select on public.nexora_profiles to authenticated;
grant update (full_name) on public.nexora_profiles to authenticated;
grant select,insert,update on public.nexora_progress to authenticated;

create or replace function public.nexora_new_user() returns trigger language plpgsql security definer set search_path='' as $$
begin
 insert into public.nexora_profiles(id,username,full_name)
 values(new.id,lower(trim(new.raw_user_meta_data->>'username')),trim(new.raw_user_meta_data->>'full_name'));
 return new;
end;$$;
revoke all on function public.nexora_new_user() from public;
create trigger nexora_create_profile after insert on auth.users for each row execute function public.nexora_new_user();

-- This lookup is intentionally NOT callable by anonymous or signed-in browsers.
-- The Node server calls it with the service-role key and never returns the email.
create or replace function public.nexora_login_email(p_username text) returns text language sql stable security definer set search_path='' as $$
 select u.email from auth.users u join public.nexora_profiles p on p.id=u.id where p.username=lower(trim(p_username)) limit 1;
$$;
revoke all on function public.nexora_login_email(text) from public,anon,authenticated;
grant execute on function public.nexora_login_email(text) to service_role;

-- Compare-and-swap prevents silently overwriting another device's newer progress.
create or replace function public.nexora_save_progress(p_state jsonb,p_revision integer)
returns setof public.nexora_progress language plpgsql security invoker set search_path='' as $$
begin
 if auth.uid() is null then raise exception 'not_authenticated'; end if;
 if jsonb_typeof(p_state)<>'object' or octet_length(p_state::text)>250000 then raise exception 'invalid_state'; end if;
 if p_revision=0 then
  return query insert into public.nexora_progress(user_id,state,revision) values(auth.uid(),p_state,1)
   on conflict(user_id) do nothing returning *;
 else
  return query update public.nexora_progress set state=p_state,revision=revision+1,updated_at=now()
   where user_id=auth.uid() and revision=p_revision returning *;
 end if;
 if not found then raise exception 'progress_conflict'; end if;
end;$$;
revoke all on function public.nexora_save_progress(jsonb,integer) from public,anon;
grant execute on function public.nexora_save_progress(jsonb,integer) to authenticated;
commit;
