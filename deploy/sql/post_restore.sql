-- Run once against the `pikorua` database right after restoring the Supabase
-- dump (see docs/VPS_MIGRATION_PLAN.md, Phase 2c):
--   psql -v ON_ERROR_STOP=1 -d pikorua -f deploy/sql/post_restore.sql
-- Safe to re-run.

begin;

-- 1. Row Level Security is a Supabase/PostgREST concern. The DB is now only
--    reachable by the app's own role, so drop the policies and disable RLS.
do $$
declare
  p record;
  t record;
begin
  for p in select policyname, tablename from pg_policies where schemaname = 'public' loop
    execute format('drop policy if exists %I on public.%I', p.policyname, p.tablename);
  end loop;

  for t in select tablename from pg_tables where schemaname = 'public' loop
    execute format('alter table public.%I disable row level security', t.tablename);
  end loop;
end $$;

-- 2. Point stored media URLs at the VPS (Nginx serves MEDIA_DIR under /media).
do $$
declare
  old_base constant text := 'https://rwtueiruyktjzvsgdcoh.supabase.co/storage/v1/object/public/media';
  new_base constant text := 'https://www.pikorua.in/media';
begin
  -- text columns
  update public.properties set cover_image = replace(cover_image, old_base, new_base) where cover_image like '%' || old_base || '%';
  update public.blogs set cover_image = replace(cover_image, old_base, new_base) where cover_image like '%' || old_base || '%';
  update public.blogs set author_avatar = replace(author_avatar, old_base, new_base) where author_avatar like '%' || old_base || '%';
  update public.blogs set html_content = replace(html_content, old_base, new_base) where html_content like '%' || old_base || '%';
  update public.locations set hero_image = replace(hero_image, old_base, new_base) where hero_image like '%' || old_base || '%';

  -- text[] columns
  update public.properties
    set images = array(select replace(x, old_base, new_base) from unnest(images) as x)
    where array_to_string(images, ' ') like '%' || old_base || '%';
  update public.properties
    set description = array(select replace(x, old_base, new_base) from unnest(description) as x)
    where array_to_string(description, ' ') like '%' || old_base || '%';
  update public.blogs
    set content = array(select replace(x, old_base, new_base) from unnest(content) as x)
    where array_to_string(content, ' ') like '%' || old_base || '%';
  update public.locations
    set corridor_description = array(select replace(x, old_base, new_base) from unnest(corridor_description) as x)
    where array_to_string(corridor_description, ' ') like '%' || old_base || '%';

  -- jsonb columns
  update public.properties set image_alts = replace(image_alts::text, old_base, new_base)::jsonb where image_alts::text like '%' || old_base || '%';
  update public.pages set content = replace(content::text, old_base, new_base)::jsonb where content::text like '%' || old_base || '%';
  update public.blogs set faqs = replace(faqs::text, old_base, new_base)::jsonb where faqs::text like '%' || old_base || '%';
  update public.site_settings set social_links = replace(social_links::text, old_base, new_base)::jsonb where social_links::text like '%' || old_base || '%';
end $$;

commit;

-- 3. Lead-table fixes for direct lead saving (same as migration 013).
\ir ../../supabase/migrations/013_leads_vps.sql

-- 4. Sanity checks — all counts should be 0.
select 'properties' as tbl, count(*) as supabase_urls from public.properties where row_to_json(properties)::text like '%supabase.co%'
union all select 'blogs', count(*) from public.blogs where row_to_json(blogs)::text like '%supabase.co%'
union all select 'pages', count(*) from public.pages where row_to_json(pages)::text like '%supabase.co%'
union all select 'locations', count(*) from public.locations where row_to_json(locations)::text like '%supabase.co%';
