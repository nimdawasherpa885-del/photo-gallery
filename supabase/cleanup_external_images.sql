-- Run this once if the old seed.sql was already applied.
-- It removes photos that were not uploaded to this project's gallery bucket,
-- and clears external album cover URLs. Deleting a photo also deletes its favorites.
begin;

delete from public.photos
where url not like 'https://iwuqthvuadtqrkqpbajl.supabase.co/storage/v1/object/public/gallery/%';

update public.albums
set cover_url = null
where cover_url is not null
  and cover_url not like 'https://iwuqthvuadtqrkqpbajl.supabase.co/storage/v1/object/public/gallery/%';

update public.profiles
set avatar = null
where avatar is not null
  and avatar not like 'https://iwuqthvuadtqrkqpbajl.supabase.co/storage/v1/object/public/gallery/%';

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'photos_url_gallery_only') then
    alter table public.photos
      add constraint photos_url_gallery_only
      check (url like 'https://iwuqthvuadtqrkqpbajl.supabase.co/storage/v1/object/public/gallery/%');
  end if;
  if not exists (select 1 from pg_constraint where conname = 'albums_cover_gallery_only') then
    alter table public.albums
      add constraint albums_cover_gallery_only
      check (cover_url is null or cover_url like 'https://iwuqthvuadtqrkqpbajl.supabase.co/storage/v1/object/public/gallery/%');
  end if;
end;
$$;

commit;
