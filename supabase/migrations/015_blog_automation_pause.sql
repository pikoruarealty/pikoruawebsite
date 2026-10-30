-- Admin pause for automated blog posting (/admin → Blogs, src/lib/ai/blogPipeline.ts).
--
-- A single row. While paused_until is in the future (or 'infinity' for "until
-- resumed") scheduled runs are skipped and logged as such; null or a past
-- time means posting is active. Dry runs still work while paused.

create table if not exists public.blog_automation_settings (
  id           boolean primary key default true check (id),
  paused_until timestamptz,
  updated_at   timestamptz not null default now()
);

insert into public.blog_automation_settings (id) values (true) on conflict (id) do nothing;
