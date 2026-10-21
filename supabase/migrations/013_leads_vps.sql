-- Leads are now written directly by /api/leads (no Brevo). Align the table
-- with what the forms actually submit so no valid lead is rejected.

-- The lead-capture popup submits source = 'popup'.
alter table public.leads
  drop constraint if exists leads_source_check;

alter table public.leads
  add constraint leads_source_check
  check (source in ('discovery', 'enquiry', 'callback', 'consultation', 'whatsapp', 'contact', 'popup'));

-- Discovery and contact forms allow the commercial add-on categories.
alter table public.leads
  drop constraint if exists leads_category_check;

alter table public.leads
  add constraint leads_category_check
  check (category in (
    'apartment',
    'penthouse',
    'villa',
    'bungalow',
    'plot',
    'residential-investment',
    'office',
    'showroom'
  ));

-- Discovery lets the visitor pick several locations; `location` keeps the
-- first one for the existing check constraint and filters.
alter table public.leads
  add column if not exists locations text[];
