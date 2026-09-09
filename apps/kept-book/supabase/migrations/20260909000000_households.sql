-- Kept Book: household recipe box.
-- Apply in Supabase when this app leaves the local file store.
-- RLS is in this file on purpose. GRANT is not enough.

create table if not exists public.households (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 80),
  invite_code text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.members (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 60),
  created_at timestamptz not null default now(),
  unique (household_id, user_id)
);

create table if not exists public.recipes (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  created_by_member_id uuid not null references public.members (id),
  title text not null check (char_length(title) between 1 and 120),
  from_whom text not null check (char_length(from_whom) between 1 and 80),
  course text not null check (course in ('starters', 'mains', 'sides', 'sweets', 'other')),
  story text not null default '',
  servings text not null default '',
  ingredients jsonb not null default '[]'::jsonb,
  steps jsonb not null default '[]'::jsonb,
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.books (
  household_id uuid primary key references public.households (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 80),
  dedication text not null default '',
  updated_at timestamptz not null default now()
);

create index if not exists recipes_household_id_idx on public.recipes (household_id);
create index if not exists members_household_id_idx on public.members (household_id);
create index if not exists members_user_id_idx on public.members (user_id);

alter table public.households enable row level security;
alter table public.members enable row level security;
alter table public.recipes enable row level security;
alter table public.books enable row level security;

create or replace function public.current_household_ids()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select household_id from public.members where user_id = auth.uid();
$$;

create or replace function public.open_household(p_name text, p_display_name text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  hid uuid;
  code text;
begin
  if auth.uid() is null then
    raise exception 'not signed in';
  end if;
  if char_length(trim(p_name)) < 1 or char_length(trim(p_display_name)) < 1 then
    raise exception 'name required';
  end if;
  code := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));
  insert into public.households (name, invite_code)
  values (trim(p_name), code)
  returning id into hid;
  insert into public.members (household_id, user_id, display_name)
  values (hid, auth.uid(), trim(p_display_name));
  insert into public.books (household_id, title)
  values (hid, trim(p_name) || ' cookbook');
  return hid;
end;
$$;

create or replace function public.join_household(p_code text, p_display_name text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  hid uuid;
begin
  if auth.uid() is null then
    raise exception 'not signed in';
  end if;
  if char_length(trim(p_display_name)) < 1 then
    raise exception 'name required';
  end if;
  select id into hid
  from public.households
  where invite_code = upper(regexp_replace(p_code, '[^A-Za-z0-9]', '', 'g'));
  if hid is null then
    raise exception 'invalid invite';
  end if;
  insert into public.members (household_id, user_id, display_name)
  values (hid, auth.uid(), trim(p_display_name))
  on conflict (household_id, user_id) do update
    set display_name = excluded.display_name;
  return hid;
end;
$$;

revoke all on function public.current_household_ids() from public;
revoke all on function public.open_household(text, text) from public;
revoke all on function public.join_household(text, text) from public;
grant execute on function public.current_household_ids() to authenticated;
grant execute on function public.open_household(text, text) to authenticated;
grant execute on function public.join_household(text, text) to authenticated;

create policy households_select_member
  on public.households
  for select
  to authenticated
  using (id in (select public.current_household_ids()));

create policy members_select_same_kitchen
  on public.members
  for select
  to authenticated
  using (household_id in (select public.current_household_ids()));

create policy recipes_select_same_kitchen
  on public.recipes
  for select
  to authenticated
  using (household_id in (select public.current_household_ids()));

create policy recipes_insert_same_kitchen
  on public.recipes
  for insert
  to authenticated
  with check (
    household_id in (select public.current_household_ids())
    and created_by_member_id in (
      select id from public.members
      where user_id = auth.uid() and household_id = recipes.household_id
    )
  );

create policy recipes_update_same_kitchen
  on public.recipes
  for update
  to authenticated
  using (household_id in (select public.current_household_ids()))
  with check (household_id in (select public.current_household_ids()));

create policy books_select_same_kitchen
  on public.books
  for select
  to authenticated
  using (household_id in (select public.current_household_ids()));

create policy books_update_same_kitchen
  on public.books
  for update
  to authenticated
  using (household_id in (select public.current_household_ids()))
  with check (household_id in (select public.current_household_ids()));
