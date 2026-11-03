-- bricktownrealco.com — properties, media, inquiries, QR scan tracking
-- All tables are server-only (service role). RLS is on with no public policies.

create extension if not exists pgcrypto;

create table if not exists properties (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,
  prop_code     text unique,                       -- PROP-### from the Master Control System
  name          text not null,
  address       text not null,
  city          text not null default 'Oklahoma City',
  state         text not null default 'OK',
  zip           text,
  property_type text not null default 'building' check (property_type in ('building','space','land','parking')),
  listing_type  text not null default 'sale_or_lease' check (listing_type in ('sale','lease','sale_or_lease')),
  status        text not null default 'available' check (status in ('available','coming_soon','under_contract','leased','sold')),
  published     boolean not null default false,
  sqft          numeric,
  acreage       numeric,
  floors        int,
  year_built    int,
  zoning        text,
  price_display text,                               -- e.g. "$24/SF NNN" or "Call for pricing"
  headline      text,
  description   text,
  highlights    text[] not null default '{}',
  hero_url      text,
  sort          int not null default 100,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table if not exists property_media (
  id           uuid primary key default gen_random_uuid(),
  property_id  uuid not null references properties(id) on delete cascade,
  kind         text not null check (kind in ('photo','rendering','floor_plan','brochure','video')),
  url          text not null,
  storage_path text,
  caption      text,
  sort         int not null default 100,
  created_at   timestamptz not null default now()
);
create index if not exists property_media_property on property_media(property_id, kind, sort);

create table if not exists inquiries (
  id          uuid primary key default gen_random_uuid(),
  property_id uuid references properties(id) on delete set null,
  name        text not null,
  email       text,
  phone       text,
  company     text,
  interest    text not null default 'info' check (interest in ('lease','buy','tour','info')),
  message     text,
  source      text not null default 'web' check (source in ('web','qr')),
  handled     boolean not null default false,
  created_at  timestamptz not null default now()
);
create index if not exists inquiries_created on inquiries(created_at desc);
create index if not exists inquiries_property on inquiries(property_id);

create table if not exists qr_scans (
  id          bigint generated always as identity primary key,
  property_id uuid not null references properties(id) on delete cascade,
  scanned_at  timestamptz not null default now(),
  visitor     text,          -- salted hash of IP + day, for unique counts; no raw IPs stored
  user_agent  text
);
create index if not exists qr_scans_property on qr_scans(property_id, scanned_at desc);

create table if not exists rate_limits (
  key        text primary key,
  count      int not null,
  window_end timestamptz not null
);

create or replace function rate_limit(p_key text, p_max int, p_window_seconds int)
returns boolean language plpgsql security definer set search_path = public as $$
declare c int;
begin
  insert into rate_limits(key, count, window_end) values (p_key, 1, now() + make_interval(secs => p_window_seconds))
  on conflict (key) do update set
    count = case when rate_limits.window_end < now() then 1 else rate_limits.count + 1 end,
    window_end = case when rate_limits.window_end < now() then now() + make_interval(secs => p_window_seconds) else rate_limits.window_end end
  returning count into c;
  return c <= p_max;
end $$;

create or replace function property_stats()
returns table(property_id uuid, scans bigint, scans_7d bigint, unique_visitors bigint, inquiries bigint)
language sql stable security definer set search_path = public as $$
  select p.id,
    (select count(*) from qr_scans s where s.property_id = p.id),
    (select count(*) from qr_scans s where s.property_id = p.id and s.scanned_at > now() - interval '7 days'),
    (select count(distinct visitor) from qr_scans s where s.property_id = p.id),
    (select count(*) from inquiries i where i.property_id = p.id)
  from properties p;
$$;

create or replace function touch_updated_at() returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end $$;
drop trigger if exists properties_touch on properties;
create trigger properties_touch before update on properties for each row execute function touch_updated_at();

alter table properties     enable row level security;
alter table property_media enable row level security;
alter table inquiries      enable row level security;
alter table qr_scans       enable row level security;
alter table rate_limits    enable row level security;

revoke execute on function rate_limit(text,int,int) from public, anon, authenticated;
revoke execute on function property_stats() from public, anon, authenticated;

-- Public bucket for renderings, photos, floor plans and brochures
insert into storage.buckets (id, name, public, file_size_limit)
values ('property-media', 'property-media', true, 52428800)
on conflict (id) do nothing;
