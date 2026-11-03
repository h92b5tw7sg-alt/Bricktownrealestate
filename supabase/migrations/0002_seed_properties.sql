-- Seed from Brewer Master Control System (Properties sheet). Public fields only — no rents or tenant details.
-- Only the two known-available spaces start live; everything else is a draft until Brett publishes it.
insert into properties (prop_code, slug, name, address, zip, property_type, listing_type, status, published, sqft, acreage, floors, year_built, headline, description, highlights, sort) values
('PROP-005', '323-e-sheridan', '323 E Sheridan', '323 E Sheridan Ave', '73104', 'building', 'lease', 'available', true, 6687, null, null, null,
  'Vacant Sheridan Avenue space in the heart of Bricktown',
  'A 6,687 SF building on Bricktown''s main entertainment row — steps from the ballpark, the canal and Paycom Center. Ready for restaurant, bar, nightlife or retail concepts.',
  array['6,687 SF', 'Sheridan Avenue frontage', 'Walk to Chickasaw Bricktown Ballpark, the canal and Paycom Center', 'Neighbors include established nightlife and dining'], 10),
('PROP-002-UF', 'jim-brewer-building', 'Jim Brewer Building — Upper Floors', '101 E California Ave', '73104', 'space', 'lease', 'available', true, 31200, null, 3, 1950,
  'Two top floors of loft space across two adjoining brick buildings',
  'The upper two floors of the Jim Brewer Building — about 15,600 SF per building, roughly 31,200 SF combined — with exposed brick and true loft character. Lease one floor, one building, or all of it.',
  array['~31,200 SF combined (≈15,600 SF per building)', 'Exposed brick, loft ceilings', 'Two adjoining 1950 brick buildings', 'Office, studio, event or hospitality uses'], 20),
('PROP-001', '115-e-sheridan', '115 E Sheridan', '115 E Sheridan Ave', '73104', 'building', 'sale', 'available', false, 10328, null, null, null, null, null, '{}', 30),
('PROP-003', '315-e-sheridan', '315 E Sheridan', '315 E Sheridan Ave', '73104', 'building', 'sale_or_lease', 'available', false, 6790, null, null, null, null, null, '{}', 40),
('PROP-004', '319-e-sheridan', '319 E Sheridan', '319 E Sheridan Ave', '73104', 'building', 'sale_or_lease', 'available', false, 6775, null, null, null, null, null, '{}', 50),
('PROP-006', '311-e-sheridan', '311 E Sheridan', '311 E Sheridan Ave', '73104', 'building', 'sale_or_lease', 'available', false, 7000, null, null, null, null, null, '{}', 60),
('PROP-011', '201-e-sheridan', '201 E Sheridan', '201 E Sheridan Ave', '73104', 'building', 'sale_or_lease', 'available', false, 2772, null, null, null, null, null, '{}', 70),
('PROP-012', '104-e-california', '104 E California', '104 E California Ave', '73104', 'building', 'sale_or_lease', 'available', false, null, null, null, null, null, null, '{}', 80),
('PROP-007', 'bricktown-events-center', 'Bricktown Events Center', '425 Kings of Leon Ln', '73104', 'building', 'sale_or_lease', 'available', false, null, 0.8581, null, null, null, null, '{}', 90),
('PROP-008', '1120-s-mckinley', '1120 S McKinley', '1120 S McKinley Ave', null, 'building', 'sale', 'available', false, 16256, null, null, null, null, null, '{}', 100),
('PROP-009', '1-e-reno', '1 E Reno', '1 E Reno Ave', null, 'building', 'sale_or_lease', 'available', false, 19880, null, null, null, null, null, '{}', 110),
('PROP-010', 'parking-lot', 'Parking Lot', 'Parking lot — address TBD', null, 'parking', 'sale_or_lease', 'available', false, 7000, null, null, null, null, null, '{}', 120)
on conflict (prop_code) do nothing;
