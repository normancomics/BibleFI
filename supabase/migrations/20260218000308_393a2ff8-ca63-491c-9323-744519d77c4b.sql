
-- Enrich Brooklyn Tabernacle with full address
UPDATE public.global_churches SET 
  address = '17 Smith St',
  accepts_fiat = true, accepts_cards = true, accepts_checks = true
WHERE id = '0c8fc393-0966-4ce0-bce6-83ab94cc85fc';

-- Enrich Hillsong Church NYC with postal code
UPDATE public.global_churches SET 
  postal_code = '10019',
  accepts_fiat = true, accepts_cards = true
WHERE id = '5371c419-7aa9-4d2e-a124-dde63c578ae8';

-- Enrich Redeemer Presbyterian with full details
UPDATE public.global_churches SET 
  address = '1166 Avenue of the Americas',
  denomination = 'Presbyterian (PCA)',
  postal_code = '10036',
  website = 'https://www.redeemer.com',
  phone = '(212) 808-4460',
  accepts_fiat = true, accepts_cards = true, accepts_checks = true
WHERE id = 'a1b5436f-d148-4a4e-81bb-1a26d84cdc68';

-- Remove duplicate Hillsong NYC entry (keeping the one with full address)
DELETE FROM public.global_churches WHERE id = '0a59cd1a-55f4-4e67-9899-64d82be24c59';
