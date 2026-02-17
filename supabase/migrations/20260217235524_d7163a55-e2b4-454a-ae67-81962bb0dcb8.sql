
-- Enrich existing Times Square Church with full details
UPDATE public.global_churches SET 
  address = '1657 Broadway',
  website = 'https://tsc.nyc',
  phone = '(212) 541-6000',
  denomination = 'Non-denominational',
  accepts_fiat = true,
  accepts_cards = true,
  accepts_checks = true
WHERE id = '297de4df-5197-455a-8d3f-1348a4832681';

-- Insert Calvary Baptist Church in Midtown Manhattan
INSERT INTO public.global_churches (name, denomination, address, city, state_province, country, postal_code, website, phone, accepts_crypto, accepts_fiat, accepts_cards, accepts_checks, verified)
VALUES (
  'Calvary Baptist Church',
  'Baptist',
  '123 W 57th St',
  'New York',
  'New York',
  'United States',
  '10019',
  'https://calvarybaptist.org',
  '(212) 975-0170',
  false, true, true, true, true
);

-- Insert St. Patrick''s Cathedral in Midtown Manhattan
INSERT INTO public.global_churches (name, denomination, address, city, state_province, country, postal_code, website, phone, accepts_crypto, accepts_fiat, accepts_cards, accepts_checks, verified)
VALUES (
  'St. Patrick''s Cathedral',
  'Catholic',
  '5th Ave, between 50th & 51st St',
  'New York',
  'New York',
  'United States',
  '10022',
  'https://saintpatrickscathedral.org',
  '(212) 753-2261',
  false, true, true, true, true
);
