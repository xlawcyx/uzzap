-- Uzzap complete Supabase SQL schema
begin;

create extension if not exists "pgcrypto";

-- Enums
do $$
begin
  if not exists (select 1 from pg_type where typname = 'chatroom_type') then
    create type public.chatroom_type as enum ('public', 'private', 'direct', 'discovery');
  end if;
  if not exists (select 1 from pg_type where typname = 'chatroom_member_role') then
    create type public.chatroom_member_role as enum ('admin', 'moderator', 'member');
  end if;
  if not exists (select 1 from pg_type where typname = 'buddy_status') then
    create type public.buddy_status as enum ('accepted', 'blocked');
  end if;
  if not exists (select 1 from pg_type where typname = 'buddy_request_status') then
    create type public.buddy_request_status as enum ('pending', 'accepted', 'declined');
  end if;
  if not exists (select 1 from pg_type where typname = 'message_type') then
    create type public.message_type as enum ('text', 'image', 'system');
  end if;
end $$;

-- Core tables
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  display_name text,
  avatar_url text,
  bio text,
  region text,
  status_message text,
  is_online boolean not null default false,
  last_seen timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint profiles_username_format check (username ~ '^[a-z0-9_\.]{3,30}$')
);

create table if not exists public.chatrooms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  slug text not null unique,
  type public.chatroom_type not null,
  category text,
  tags text[],
  region text,
  province text,
  language text,
  member_count integer not null default 0,
  online_count integer not null default 0,
  is_official boolean not null default false,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  last_activity_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.chatroom_members (
  id uuid primary key default gen_random_uuid(),
  chatroom_id uuid not null references public.chatrooms(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.chatroom_member_role not null default 'member',
  joined_at timestamptz not null default timezone('utc', now()),
  unique (chatroom_id, user_id)
);

create table if not exists public.buddies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  buddy_id uuid not null references public.profiles(id) on delete cascade,
  status public.buddy_status not null default 'accepted',
  created_at timestamptz not null default timezone('utc', now()),
  unique (user_id, buddy_id),
  constraint buddies_no_self check (user_id <> buddy_id)
);

create table if not exists public.buddy_requests (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.profiles(id) on delete cascade,
  receiver_id uuid not null references public.profiles(id) on delete cascade,
  status public.buddy_request_status not null default 'pending',
  created_at timestamptz not null default timezone('utc', now()),
  unique (sender_id, receiver_id),
  constraint buddy_requests_no_self check (sender_id <> receiver_id)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  chatroom_id uuid not null references public.chatrooms(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  type public.message_type not null default 'text',
  metadata jsonb not null default '{}'::jsonb,
  is_deleted boolean not null default false,
  reply_to uuid references public.messages(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.message_reads (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.messages(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  read_at timestamptz,
  unique (message_id, user_id)
);

-- Utility functions + triggers
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end; $$;

create or replace function public.touch_chatroom_activity()
returns trigger language plpgsql as $$
begin
  update public.chatrooms
  set last_activity_at = timezone('utc', now())
  where id = new.chatroom_id;
  return new;
end; $$;

create or replace function public.refresh_chatroom_member_counts(p_chatroom_id uuid)
returns void language sql as $$
  update public.chatrooms c
  set member_count = coalesce(m.member_count, 0),
      online_count = coalesce(m.online_count, 0),
      updated_at = timezone('utc', now())
  from (
    select cm.chatroom_id,
           count(*)::int as member_count,
           count(*) filter (where p.is_online)::int as online_count
    from public.chatroom_members cm
    join public.profiles p on p.id = cm.user_id
    where cm.chatroom_id = p_chatroom_id
    group by cm.chatroom_id
  ) m
  where c.id = p_chatroom_id;

  update public.chatrooms c
  set member_count = 0,
      online_count = 0,
      updated_at = timezone('utc', now())
  where c.id = p_chatroom_id
    and not exists (select 1 from public.chatroom_members cm where cm.chatroom_id = p_chatroom_id);
$$;

create or replace function public.handle_chatroom_member_count_change()
returns trigger language plpgsql as $$
begin
  perform public.refresh_chatroom_member_counts(coalesce(new.chatroom_id, old.chatroom_id));
  return coalesce(new, old);
end; $$;

create or replace function public.handle_profile_presence_change()
returns trigger language plpgsql as $$
begin
  if old.is_online is distinct from new.is_online then
    update public.chatrooms c
    set online_count = sub.online_count,
        updated_at = timezone('utc', now())
    from (
      select cm.chatroom_id, count(*) filter (where p.is_online)::int as online_count
      from public.chatroom_members cm
      join public.profiles p on p.id = cm.user_id
      where cm.chatroom_id in (select chatroom_id from public.chatroom_members where user_id = new.id)
      group by cm.chatroom_id
    ) sub
    where c.id = sub.chatroom_id;
  end if;
  return new;
end; $$;

create or replace function public.handle_new_auth_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'display_name',
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end; $$;

-- Indexes
create index if not exists idx_chatrooms_type on public.chatrooms(type);
create index if not exists idx_chatrooms_category on public.chatrooms(category);
create index if not exists idx_chatrooms_member_count on public.chatrooms(member_count desc);
create index if not exists idx_chatrooms_last_activity on public.chatrooms(last_activity_at desc);
create index if not exists idx_chatrooms_created_at on public.chatrooms(created_at desc);
create index if not exists idx_chatrooms_region_province on public.chatrooms(region, province);
create index if not exists idx_chatroom_members_user on public.chatroom_members(user_id);
create index if not exists idx_chatroom_members_chatroom on public.chatroom_members(chatroom_id);
create index if not exists idx_buddies_user on public.buddies(user_id);
create index if not exists idx_buddy_requests_receiver on public.buddy_requests(receiver_id);
create index if not exists idx_messages_chatroom_created on public.messages(chatroom_id, created_at desc);

-- Trigger bindings
drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
drop trigger if exists set_chatrooms_updated_at on public.chatrooms;
create trigger set_chatrooms_updated_at before update on public.chatrooms for each row execute function public.set_updated_at();
drop trigger if exists chatroom_members_count_change on public.chatroom_members;
create trigger chatroom_members_count_change after insert or delete on public.chatroom_members for each row execute function public.handle_chatroom_member_count_change();
drop trigger if exists update_online_count_on_presence on public.profiles;
create trigger update_online_count_on_presence after update of is_online on public.profiles for each row execute function public.handle_profile_presence_change();
drop trigger if exists touch_chatroom_on_message on public.messages;
create trigger touch_chatroom_on_message after insert on public.messages for each row execute function public.touch_chatroom_activity();
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_auth_user_profile();

-- RLS
alter table public.profiles enable row level security;
alter table public.chatrooms enable row level security;
alter table public.chatroom_members enable row level security;
alter table public.messages enable row level security;
alter table public.message_reads enable row level security;
alter table public.buddies enable row level security;
alter table public.buddy_requests enable row level security;

drop policy if exists "profiles are viewable by authenticated users" on public.profiles;
create policy "profiles are viewable by authenticated users" on public.profiles for select to authenticated using (true);
drop policy if exists "users can insert own profile" on public.profiles;
create policy "users can insert own profile" on public.profiles for insert to authenticated with check (auth.uid() = id);
drop policy if exists "users can update own profile" on public.profiles;
create policy "users can update own profile" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "authenticated can view chatrooms" on public.chatrooms;
create policy "authenticated can view chatrooms" on public.chatrooms for select to authenticated using (
  type in ('public', 'discovery')
  or exists (select 1 from public.chatroom_members cm where cm.chatroom_id = chatrooms.id and cm.user_id = auth.uid())
);
drop policy if exists "authenticated can create chatrooms" on public.chatrooms;
create policy "authenticated can create chatrooms" on public.chatrooms for insert to authenticated with check (auth.uid() = created_by);
drop policy if exists "chatroom creator or admin can update" on public.chatrooms;
create policy "chatroom creator or admin can update" on public.chatrooms for update to authenticated using (
  created_by = auth.uid()
  or exists (select 1 from public.chatroom_members cm where cm.chatroom_id = chatrooms.id and cm.user_id = auth.uid() and cm.role in ('admin', 'moderator'))
) with check (true);

drop policy if exists "members can view memberships" on public.chatroom_members;
create policy "members can view memberships" on public.chatroom_members for select to authenticated using (
  user_id = auth.uid()
  or exists (select 1 from public.chatroom_members cm where cm.chatroom_id = chatroom_members.chatroom_id and cm.user_id = auth.uid())
  or exists (select 1 from public.chatrooms c where c.id = chatroom_members.chatroom_id and c.type in ('public', 'discovery'))
);
drop policy if exists "users can join themselves" on public.chatroom_members;
create policy "users can join themselves" on public.chatroom_members for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "users can leave themselves" on public.chatroom_members;
create policy "users can leave themselves" on public.chatroom_members for delete to authenticated using (user_id = auth.uid());

drop policy if exists "members can read messages" on public.messages;
create policy "members can read messages" on public.messages for select to authenticated using (
  exists (select 1 from public.chatroom_members cm where cm.chatroom_id = messages.chatroom_id and cm.user_id = auth.uid())
);
drop policy if exists "members can send messages" on public.messages;
create policy "members can send messages" on public.messages for insert to authenticated with check (
  sender_id = auth.uid() and exists (select 1 from public.chatroom_members cm where cm.chatroom_id = messages.chatroom_id and cm.user_id = auth.uid())
);
drop policy if exists "sender can soft delete own messages" on public.messages;
create policy "sender can soft delete own messages" on public.messages for update to authenticated using (sender_id = auth.uid()) with check (sender_id = auth.uid());

drop policy if exists "users can view own message reads" on public.message_reads;
create policy "users can view own message reads" on public.message_reads for select to authenticated using (user_id = auth.uid());
drop policy if exists "users can mark own message reads" on public.message_reads;
create policy "users can mark own message reads" on public.message_reads for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "users can update own message reads" on public.message_reads;
create policy "users can update own message reads" on public.message_reads for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "users can view own buddies" on public.buddies;
create policy "users can view own buddies" on public.buddies for select to authenticated using (user_id = auth.uid());
drop policy if exists "users can insert own buddy edges" on public.buddies;
create policy "users can insert own buddy edges" on public.buddies for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "users can delete own buddy edges" on public.buddies;
create policy "users can delete own buddy edges" on public.buddies for delete to authenticated using (user_id = auth.uid());

drop policy if exists "users can view relevant buddy requests" on public.buddy_requests;
create policy "users can view relevant buddy requests" on public.buddy_requests for select to authenticated using (sender_id = auth.uid() or receiver_id = auth.uid());
drop policy if exists "users can send buddy requests as sender" on public.buddy_requests;
create policy "users can send buddy requests as sender" on public.buddy_requests for insert to authenticated with check (sender_id = auth.uid());
drop policy if exists "sender or receiver can update buddy request" on public.buddy_requests;
create policy "sender or receiver can update buddy request" on public.buddy_requests for update to authenticated using (sender_id = auth.uid() or receiver_id = auth.uid()) with check (sender_id = auth.uid() or receiver_id = auth.uid());

-- Storage buckets + storage policies
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true) on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('message-images', 'message-images', true) on conflict (id) do nothing;

drop policy if exists "public can read avatar objects" on storage.objects;
create policy "public can read avatar objects" on storage.objects for select to public using (bucket_id = 'avatars');
drop policy if exists "authenticated can upload avatars" on storage.objects;
create policy "authenticated can upload avatars" on storage.objects for insert to authenticated with check (bucket_id = 'avatars' and owner = auth.uid());
drop policy if exists "authenticated can update own avatars" on storage.objects;
create policy "authenticated can update own avatars" on storage.objects for update to authenticated using (bucket_id = 'avatars' and owner = auth.uid()) with check (bucket_id = 'avatars' and owner = auth.uid());

drop policy if exists "public can read message images" on storage.objects;
create policy "public can read message images" on storage.objects for select to public using (bucket_id = 'message-images');
drop policy if exists "authenticated can upload message images" on storage.objects;
create policy "authenticated can upload message images" on storage.objects for insert to authenticated with check (bucket_id = 'message-images' and owner = auth.uid());
drop policy if exists "authenticated can update own message images" on storage.objects;
create policy "authenticated can update own message images" on storage.objects for update to authenticated using (bucket_id = 'message-images' and owner = auth.uid()) with check (bucket_id = 'message-images' and owner = auth.uid());

commit;
