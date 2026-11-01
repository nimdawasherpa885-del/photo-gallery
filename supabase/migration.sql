-- ============================================================
-- Lumina Photo Gallery — Supabase Migration
-- Run this entire script in the Supabase SQL Editor.
-- ============================================================

-- ── Extensions ───────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ── profiles ─────────────────────────────────────────────────
-- Mirrors auth.users; role is ALWAYS set to 'user' by the trigger.
-- Admins must be promoted manually via the Supabase dashboard.
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text not null,
  email       text not null,
  role        text not null default 'user' check (role in ('admin', 'user')),
  avatar      text,
  created_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Anyone can read profiles (needed for admin user list)
drop policy if exists "profiles_select" on public.profiles;
create policy "profiles_select" on public.profiles
  for select using (true);

-- Users can update only their own non-role fields
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id)
  with check (
    auth.uid() = id
    -- Prevent self-promotion: role must stay the same as what's already stored
    and role = (select role from public.profiles where id = auth.uid())
  );

-- ── Trigger: auto-create profile on signup ───────────────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    'user'   -- always 'user'; promote to admin via Supabase dashboard only
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── categories ───────────────────────────────────────────────
create table if not exists public.categories (
  id         uuid primary key default uuid_generate_v4(),
  name       text not null unique,
  created_at timestamptz not null default now()
);

alter table public.categories enable row level security;

drop policy if exists "categories_select" on public.categories;
create policy "categories_select" on public.categories for select using (true);
drop policy if exists "categories_insert_admin" on public.categories;
create policy "categories_insert_admin" on public.categories for insert
  with check ((select role from public.profiles where id = auth.uid()) = 'admin');
drop policy if exists "categories_update_admin" on public.categories;
create policy "categories_update_admin" on public.categories for update
  using ((select role from public.profiles where id = auth.uid()) = 'admin');
drop policy if exists "categories_delete_admin" on public.categories;
create policy "categories_delete_admin" on public.categories for delete
  using ((select role from public.profiles where id = auth.uid()) = 'admin');

-- Seed default categories
insert into public.categories (name) values
  ('Landscape'), ('Architecture'), ('Portrait'), ('Travel'), ('Street'), ('Minimal')
on conflict (name) do nothing;

-- ── albums ───────────────────────────────────────────────────
create table if not exists public.albums (
  id          uuid primary key default uuid_generate_v4(),
  title       text not null,
  description text,
  cover_url   text check (cover_url is null or cover_url like 'https://iwuqthvuadtqrkqpbajl.supabase.co/storage/v1/object/public/gallery/%'),
  category    text not null default 'General',
  created_at  timestamptz not null default now()
);

alter table public.albums enable row level security;

drop policy if exists "albums_select" on public.albums;
create policy "albums_select" on public.albums for select using (true);
drop policy if exists "albums_insert_admin" on public.albums;
create policy "albums_insert_admin" on public.albums for insert
  with check ((select role from public.profiles where id = auth.uid()) = 'admin');
drop policy if exists "albums_update_admin" on public.albums;
create policy "albums_update_admin" on public.albums for update
  using ((select role from public.profiles where id = auth.uid()) = 'admin');
drop policy if exists "albums_delete_admin" on public.albums;
create policy "albums_delete_admin" on public.albums for delete
  using ((select role from public.profiles where id = auth.uid()) = 'admin');

-- ── photos ───────────────────────────────────────────────────
create table if not exists public.photos (
  id            uuid primary key default uuid_generate_v4(),
  title         text not null,
  description   text,
  url           text not null check (url like 'https://iwuqthvuadtqrkqpbajl.supabase.co/storage/v1/object/public/gallery/%'),
  thumbnail_url text,
  category      text not null default 'General',
  album_id      uuid references public.albums(id) on delete set null,
  tags          text[] not null default '{}',
  likes         integer not null default 0,
  views         integer not null default 0,
  photographer  text not null default 'Curator',
  location      text,
  camera        text,
  resolution    text,
  created_at    timestamptz not null default now()
);

alter table public.photos enable row level security;

drop policy if exists "photos_select" on public.photos;
create policy "photos_select" on public.photos for select using (true);
drop policy if exists "photos_insert_admin" on public.photos;
create policy "photos_insert_admin" on public.photos for insert
  with check ((select role from public.profiles where id = auth.uid()) = 'admin');
drop policy if exists "photos_update_admin" on public.photos;
create policy "photos_update_admin" on public.photos for update
  using ((select role from public.profiles where id = auth.uid()) = 'admin');
drop policy if exists "photos_delete_admin" on public.photos;
create policy "photos_delete_admin" on public.photos for delete
  using ((select role from public.profiles where id = auth.uid()) = 'admin');

-- Allow any authenticated user to increment likes/views (non-admin writes)
drop policy if exists "photos_update_engagement" on public.photos;
create policy "photos_update_engagement" on public.photos for update
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

-- ── user_favorites ───────────────────────────────────────────
create table if not exists public.user_favorites (
  user_id    uuid not null references public.profiles(id) on delete cascade,
  photo_id   uuid not null references public.photos(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, photo_id)
);

alter table public.user_favorites enable row level security;

drop policy if exists "favorites_select_own" on public.user_favorites;
create policy "favorites_select_own" on public.user_favorites
  for select using (auth.uid() = user_id);
drop policy if exists "favorites_insert_own" on public.user_favorites;
create policy "favorites_insert_own" on public.user_favorites
  for insert with check (auth.uid() = user_id);
drop policy if exists "favorites_delete_own" on public.user_favorites;
create policy "favorites_delete_own" on public.user_favorites
  for delete using (auth.uid() = user_id);

-- ── Storage bucket: gallery ───────────────────────────────────
-- Create via dashboard OR uncomment if using supabase-js admin:
-- insert into storage.buckets (id, name, public) values ('gallery', 'gallery', true)
-- on conflict do nothing;

-- Storage RLS: public read, admin-only write
-- Run these after creating the bucket in the dashboard:

-- Allow public read of all objects in gallery bucket
drop policy if exists "gallery_storage_select" on storage.objects;
create policy "gallery_storage_select" on storage.objects
  for select using (bucket_id = 'gallery');

-- Allow admins to upload
drop policy if exists "gallery_storage_insert_admin" on storage.objects;
create policy "gallery_storage_insert_admin" on storage.objects
  for insert with check (
    bucket_id = 'gallery'
    and (select role from public.profiles where id = auth.uid()) = 'admin'
  );

-- Allow admins to delete
drop policy if exists "gallery_storage_delete_admin" on storage.objects;
create policy "gallery_storage_delete_admin" on storage.objects
  for delete using (
    bucket_id = 'gallery'
    and (select role from public.profiles where id = auth.uid()) = 'admin'
  );
