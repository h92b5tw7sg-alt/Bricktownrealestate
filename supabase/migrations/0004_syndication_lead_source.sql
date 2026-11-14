-- Listing syndication tracker, lead source on inquiries, and page views by source.
create table if not exists syndication (
  property_id uuid not null references properties(id) on delete cascade,
  platform    text not null,
  status      text not null default 'todo' check (status in ('todo','listed','paused','na')),
  url         text,
  updated_at  timestamptz not null default now(),
  primary key (property_id, platform)
);
alter table syndication enable row level security;

alter table inquiries add column if not exists utm_source text;

create table if not exists page_views (
  id          bigint generated always as identity primary key,
  property_id uuid references properties(id) on delete cascade,
  source      text not null default 'direct',
  viewed_at   timestamptz not null default now()
);
create index if not exists page_views_property on page_views(property_id, source, viewed_at desc);
alter table page_views enable row level security;
