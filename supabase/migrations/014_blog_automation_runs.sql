-- Automated blog publishing (/api/cron/auto-blog, src/lib/ai/blogPipeline.ts).
--
-- review_notes: why the quality gate held an AI draft for review (shown in
-- /admin). Null for manual posts and for drafts that passed every check.
--
-- blog_automation_runs: one row per pipeline run, so a run is observable
-- (what happened and why), idempotent (a second trigger in the same window is
-- skipped) and recoverable (a crashed 'running' row is expired by the next run).

alter table public.blogs add column if not exists review_notes text;

create table if not exists public.blog_automation_runs (
  id            bigserial primary key,
  started_at    timestamptz not null default now(),
  finished_at   timestamptz,
  status        text not null default 'running'
                check (status in ('running', 'published', 'held', 'skipped', 'failed')),
  trigger       text not null default 'cron',
  pillar        text,
  reason        text,
  blog_id       text references public.blogs (id) on delete set null,
  source_url    text,
  source_title  text,
  checks        jsonb,
  model         text,
  usage         jsonb
);

-- At most one run in progress at a time (concurrency guard).
create unique index if not exists blog_automation_runs_one_running
  on public.blog_automation_runs ((true)) where status = 'running';

create index if not exists blog_automation_runs_started_at_idx
  on public.blog_automation_runs (started_at desc);
