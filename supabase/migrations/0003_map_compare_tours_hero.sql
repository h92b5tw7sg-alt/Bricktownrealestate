-- Map pins, "Today" photos for the rendering compare slider, 3D tours, and site-wide hero settings.

alter table properties add column if not exists lat double precision;
alter table properties add column if not exists lng double precision;

alter table property_media drop constraint if exists property_media_kind_check;
alter table property_media add constraint property_media_kind_check
  check (kind in ('photo','rendering','floor_plan','brochure','video','before','tour'));

create table if not exists site_settings (
  key        text primary key,
  value      text,
  updated_at timestamptz not null default now()
);
alter table site_settings enable row level security;

-- Approximate pin locations; drag to the exact spot in Admin → property → Map pin.
update properties set lat = v.lat, lng = v.lng
from (values
  ('PROP-001',    35.46685, -97.51240),
  ('PROP-002-UF', 35.46590, -97.51300),
  ('PROP-003',    35.46685, -97.50860),
  ('PROP-004',    35.46685, -97.50840),
  ('PROP-005',    35.46685, -97.50820),
  ('PROP-006',    35.46685, -97.50880),
  ('PROP-007',    35.46550, -97.50750),
  ('PROP-008',    35.45450, -97.52900),
  ('PROP-009',    35.46380, -97.51390),
  ('PROP-011',    35.46685, -97.51060),
  ('PROP-012',    35.46610, -97.51280)
) as v(code, lat, lng)
where properties.prop_code = v.code and properties.lat is null;
