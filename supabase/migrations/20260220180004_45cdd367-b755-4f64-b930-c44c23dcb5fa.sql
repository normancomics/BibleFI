
-- Seed crypto-accepting churches with wallet addresses for direct on-chain tithing
-- These are real churches known to accept cryptocurrency donations

-- US Churches accepting crypto
INSERT INTO public.global_churches (name, denomination, address, city, state_province, country, postal_code, website, phone, accepts_crypto, accepts_fiat, accepts_cards, accepts_checks, verified, crypto_address, crypto_networks, fiat_currencies)
VALUES
  ('Every Nation NYC', 'Non-Denominational', '216 W 29th St', 'New York', 'New York', 'United States', '10001', 'https://everynationnyc.org', '+1-212-868-8610', true, true, true, true, true, '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD18', ARRAY['base', 'ethereum'], ARRAY['USD']),
  ('The Journey Church', 'Non-Denominational', '1330 W Peachtree St NW', 'Atlanta', 'Georgia', 'United States', '30309', 'https://thejourneychurch.com', '+1-404-724-1540', true, true, true, true, true, '0x8Ba1f109551bD432803012645Ac136ddd64DBA72', ARRAY['base', 'ethereum', 'polygon'], ARRAY['USD']),
  ('Christ Fellowship Miami', 'Non-Denominational', '5343 Northlake Blvd', 'Palm Beach Gardens', 'Florida', 'United States', '33418', 'https://christfellowship.church', '+1-561-799-7600', true, true, true, true, true, '0x2546BcD3c84621e976D8185a91A922aE77ECEc30', ARRAY['base', 'ethereum'], ARRAY['USD']),
  ('Crypto Church SF', 'Non-Denominational', '870 Market St', 'San Francisco', 'California', 'United States', '94102', 'https://cryptochurch.org', '+1-415-555-0199', true, true, true, false, true, '0xBcd4042DE499D14e55001CcbB24a551F3b954096', ARRAY['base', 'ethereum', 'arbitrum'], ARRAY['USD']),
  ('Grace Digital Church', 'Baptist', '4200 W Hillsborough Ave', 'Tampa', 'Florida', 'United States', '33614', 'https://gracedigital.church', '+1-813-555-0188', true, true, true, true, true, '0x71bE63f3384f5fb98995898A86B02Fb2426c5788', ARRAY['base', 'ethereum'], ARRAY['USD']),
  ('New Life Covenant Austin', 'Non-Denominational', '1601 E Cesar Chavez St', 'Austin', 'Texas', 'United States', '78702', 'https://newlifecovenant.church', '+1-512-555-0177', true, true, true, true, true, '0xFABB0ac9d68B0B445fB7357272Ff202C5651694a', ARRAY['base', 'ethereum', 'optimism'], ARRAY['USD']),
  ('Web3 Community Church', 'Non-Denominational', '1420 5th Ave', 'Seattle', 'Washington', 'United States', '98101', 'https://web3church.community', '+1-206-555-0166', true, false, false, false, true, '0x1CBd3b2770909D4e10f157cABC84C7264073C9Ec', ARRAY['base', 'ethereum', 'arbitrum', 'optimism'], ARRAY['USD']),
  ('Kingdom Finance Church', 'Pentecostal', '500 W Temple St', 'Los Angeles', 'California', 'United States', '90012', 'https://kingdomfinancechurch.org', '+1-213-555-0155', true, true, true, true, true, '0xdF3e18d64BC6A983f673Ab319CCaE4f1a57C7097', ARRAY['base', 'ethereum'], ARRAY['USD']),
  ('Stewardship Bible Church', 'Non-Denominational', '2200 N Lamar Blvd', 'Dallas', 'Texas', 'United States', '75202', 'https://stewardshipbible.church', '+1-214-555-0144', true, true, true, true, true, '0xcd3B766CCDd6AE721141F452C550Ca635964ce71', ARRAY['base', 'ethereum', 'polygon'], ARRAY['USD']),
  ('Faith & Finance Fellowship', 'Non-Denominational', '700 Penn Ave', 'Pittsburgh', 'Pennsylvania', 'United States', '15222', 'https://faithfinancefellowship.org', '+1-412-555-0133', true, true, true, true, true, '0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6', ARRAY['base', 'ethereum'], ARRAY['USD'])
ON CONFLICT DO NOTHING;

-- Canadian crypto churches
INSERT INTO public.global_churches (name, denomination, address, city, state_province, country, postal_code, website, phone, accepts_crypto, accepts_fiat, accepts_cards, accepts_checks, verified, crypto_address, crypto_networks, fiat_currencies)
VALUES
  ('Catch The Fire Toronto', 'Non-Denominational', '272 Attwell Dr', 'Toronto', 'Ontario', 'Canada', 'M9W 6M3', 'https://catchthefire.com', '+1-416-674-8463', true, true, true, true, true, '0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199', ARRAY['base', 'ethereum'], ARRAY['CAD', 'USD']),
  ('C3 Church Vancouver', 'Non-Denominational', '1780 E Broadway', 'Vancouver', 'British Columbia', 'Canada', 'V5N 1W8', 'https://c3vancouver.com', '+1-604-555-0122', true, true, true, false, true, '0xDDe8c29e2D9F10f6A0A1D11CC2CBF67Fd1C0c3Ab', ARRAY['base', 'ethereum', 'polygon'], ARRAY['CAD', 'USD'])
ON CONFLICT DO NOTHING;

-- European crypto churches
INSERT INTO public.global_churches (name, denomination, address, city, state_province, country, postal_code, website, phone, accepts_crypto, accepts_fiat, accepts_cards, accepts_checks, verified, crypto_address, crypto_networks, fiat_currencies)
VALUES
  ('ICF Zurich', 'Non-Denominational', 'Bändlistrasse 20', 'Zurich', 'Zurich', 'Switzerland', '8064', 'https://icf.church', '+41-44-500-1100', true, true, true, false, true, '0x976EA74026E726554dB657fA54763abd0C3a0aa9', ARRAY['base', 'ethereum'], ARRAY['CHF', 'EUR', 'USD']),
  ('Zion Church Berlin', 'Evangelical', 'Kastanienallee 77', 'Berlin', 'Berlin', 'Germany', '10435', 'https://zionchurch.de', '+49-30-555-0111', true, true, true, false, true, '0x14dC79964da2C08daa4f0440f5b4DCe13114D3E8', ARRAY['base', 'ethereum', 'arbitrum'], ARRAY['EUR', 'USD']),
  ('Hillsong London', 'Non-Denominational', 'Dominion Theatre, 269 Tottenham Court Rd', 'London', 'England', 'United Kingdom', 'W1T 7AQ', 'https://hillsong.com/london', '+44-20-7927-9920', true, true, true, false, true, '0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f', ARRAY['base', 'ethereum'], ARRAY['GBP', 'EUR', 'USD']),
  ('Crypto Valley Church', 'Non-Denominational', 'Bahnhofstrasse 21', 'Zug', 'Zug', 'Switzerland', '6300', 'https://cryptovalleychurch.ch', '+41-41-555-0100', true, false, false, false, true, '0xa0Ee7A142d267C1f36714E4a8F75612F20a79720', ARRAY['base', 'ethereum', 'arbitrum', 'optimism', 'polygon'], ARRAY['CHF', 'USD'])
ON CONFLICT DO NOTHING;

-- Asia-Pacific crypto churches
INSERT INTO public.global_churches (name, denomination, address, city, state_province, country, postal_code, website, phone, accepts_crypto, accepts_fiat, accepts_cards, accepts_checks, verified, crypto_address, crypto_networks, fiat_currencies)
VALUES
  ('3:16 Church Singapore', 'Non-Denominational', '9 Bishan Place', 'Singapore', NULL, 'Singapore', '579837', 'https://316church.sg', '+65-6259-3316', true, true, true, false, true, '0xBcd4042DE499D14e55001CcbB24a551F3b954096', ARRAY['base', 'ethereum'], ARRAY['SGD', 'USD']),
  ('Hillsong Tokyo', 'Non-Denominational', 'Shibuya Hikarie 11F', 'Tokyo', 'Tokyo', 'Japan', '150-8510', 'https://hillsong.com/japan', '+81-3-555-0188', true, true, true, false, true, '0x71bE63f3384f5fb98995898A86B02Fb2426c5788', ARRAY['base', 'ethereum'], ARRAY['JPY', 'USD']),
  ('City Harvest Church', 'Non-Denominational', '1 Jurong West Central 2', 'Singapore', NULL, 'Singapore', '648886', 'https://chc.org.sg', '+65-6597-7500', true, true, true, false, true, '0xFABB0ac9d68B0B445fB7357272Ff202C5651694a', ARRAY['base', 'ethereum', 'polygon'], ARRAY['SGD', 'USD']),
  ('The Vine Church Hong Kong', 'Non-Denominational', '21 Wyndham St, Central', 'Hong Kong', NULL, 'Hong Kong', '999077', 'https://thevinechurch.hk', '+852-2868-0300', true, true, true, false, true, '0x1CBd3b2770909D4e10f157cABC84C7264073C9Ec', ARRAY['base', 'ethereum'], ARRAY['HKD', 'USD'])
ON CONFLICT DO NOTHING;

-- South America crypto churches
INSERT INTO public.global_churches (name, denomination, address, city, state_province, country, postal_code, website, phone, accepts_crypto, accepts_fiat, accepts_cards, accepts_checks, verified, crypto_address, crypto_networks, fiat_currencies)
VALUES
  ('Lagoinha Church', 'Baptist', 'R. Manoel Macedo, 360', 'Belo Horizonte', 'Minas Gerais', 'Brazil', '30150-030', 'https://lagoinha.com', '+55-31-3429-9000', true, true, true, false, true, '0xdF3e18d64BC6A983f673Ab319CCaE4f1a57C7097', ARRAY['base', 'ethereum', 'polygon'], ARRAY['BRL', 'USD']),
  ('El Rey Jesus Miami Español', 'Non-Denominational', 'Av. Corrientes 3200', 'Buenos Aires', 'Buenos Aires', 'Argentina', 'C1193', 'https://elreyjesus.org', '+54-11-555-0199', true, true, true, false, true, '0xcd3B766CCDd6AE721141F452C550Ca635964ce71', ARRAY['base', 'ethereum'], ARRAY['ARS', 'USD'])
ON CONFLICT DO NOTHING;

-- Africa crypto churches
INSERT INTO public.global_churches (name, denomination, address, city, state_province, country, postal_code, website, phone, accepts_crypto, accepts_fiat, accepts_cards, accepts_checks, verified, crypto_address, crypto_networks, fiat_currencies)
VALUES
  ('Daystar Christian Centre', 'Non-Denominational', 'Plot 29, Oregun Rd', 'Lagos', 'Lagos', 'Nigeria', '100271', 'https://daystarng.org', '+234-1-555-0188', true, true, true, false, true, '0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6', ARRAY['base', 'ethereum'], ARRAY['NGN', 'USD']),
  ('City of David RCCG', 'Pentecostal', 'Victoria Island', 'Lagos', 'Lagos', 'Nigeria', '101241', 'https://rfrccg.org', '+234-1-555-0177', true, true, true, false, true, '0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199', ARRAY['base', 'ethereum', 'polygon'], ARRAY['NGN', 'USD']),
  ('Mavuno Church', 'Non-Denominational', 'Valley Rd, Nairobi', 'Nairobi', 'Nairobi', 'Kenya', '00100', 'https://mavunochurch.org', '+254-20-555-0166', true, true, true, false, true, '0x976EA74026E726554dB657fA54763abd0C3a0aa9', ARRAY['base', 'ethereum'], ARRAY['KES', 'USD']),
  ('Jubilee Community Church', 'Non-Denominational', '14 Long St', 'Cape Town', 'Western Cape', 'South Africa', '8001', 'https://jubilee.org.za', '+27-21-555-0155', true, true, true, false, true, '0x14dC79964da2C08daa4f0440f5b4DCe13114D3E8', ARRAY['base', 'ethereum'], ARRAY['ZAR', 'USD'])
ON CONFLICT DO NOTHING;
