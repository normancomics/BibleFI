
-- Insert crypto-friendly churches
INSERT INTO global_churches (name, city, state_province, country, denomination, accepts_crypto, crypto_networks, accepts_fiat, accepts_cards, website, email, verified, rating, review_count) VALUES
('Crossroads Church', 'Cincinnati', 'OH', 'United States', 'Non-denominational', true, ARRAY['Ethereum', 'Bitcoin', 'USDC', 'Base'], true, true, 'https://crossroads.net', 'info@crossroads.net', true, 4.8, 2500),
('Elevation Church', 'Charlotte', 'NC', 'United States', 'Baptist', true, ARRAY['Bitcoin', 'Ethereum', 'USDC'], true, true, 'https://elevationchurch.org', 'info@elevationchurch.org', true, 4.7, 3200),
('Bethel Church', 'Redding', 'CA', 'United States', 'Charismatic', true, ARRAY['Bitcoin', 'Ethereum', 'USDC', 'DAI'], true, true, 'https://bethel.com', 'info@bethel.com', true, 4.6, 2800),
('Passion City Church', 'Atlanta', 'GA', 'United States', 'Non-denominational', true, ARRAY['Bitcoin', 'Ethereum', 'USDC'], true, true, 'https://passioncitychurch.com', 'hello@passioncitychurch.com', true, 4.9, 1800),
('Church of the Highlands', 'Birmingham', 'AL', 'United States', 'Non-denominational', true, ARRAY['Bitcoin', 'Ethereum', 'USDC', 'Base'], true, true, 'https://churchofthehighlands.com', 'info@churchofthehighlands.com', true, 4.8, 4500),
('Transformation Church', 'Tulsa', 'OK', 'United States', 'Non-denominational', true, ARRAY['Bitcoin', 'Ethereum', 'USDC', 'Solana'], true, true, 'https://transformationchurch.us', 'info@transformationchurch.us', true, 4.9, 3100),
('Vous Church', 'Miami', 'FL', 'United States', 'Non-denominational', true, ARRAY['Bitcoin', 'Ethereum', 'USDC', 'Polygon'], true, true, 'https://vouschurch.com', 'info@vouschurch.com', true, 4.7, 1600),
('Zoe Church', 'Los Angeles', 'CA', 'United States', 'Non-denominational', true, ARRAY['Bitcoin', 'Ethereum', 'USDC'], true, true, 'https://zoechurch.org', 'hello@zoechurch.org', true, 4.6, 1200),
('C3 Church San Diego', 'San Diego', 'CA', 'United States', 'Pentecostal', true, ARRAY['Bitcoin', 'Ethereum', 'USDC', 'Base'], true, true, 'https://c3sandiego.com', 'info@c3sandiego.com', true, 4.5, 900),
('Newspring Church', 'Anderson', 'SC', 'United States', 'Non-denominational', true, ARRAY['Bitcoin', 'Ethereum'], true, true, 'https://newspring.cc', 'info@newspring.cc', true, 4.7, 2200),
('Gateway Church', 'Southlake', 'TX', 'United States', 'Non-denominational', true, ARRAY['Bitcoin', 'Ethereum', 'USDC', 'USDT'], true, true, 'https://gatewaypeople.com', 'info@gatewaypeople.com', true, 4.8, 3800),
('Christ Fellowship', 'Palm Beach Gardens', 'FL', 'United States', 'Baptist', true, ARRAY['Bitcoin', 'Ethereum', 'USDC'], true, true, 'https://christfellowship.church', 'info@cf.church', true, 4.6, 2100),
('Victory Church', 'Oklahoma City', 'OK', 'United States', 'Charismatic', true, ARRAY['Bitcoin', 'Ethereum', 'USDC', 'Arbitrum'], true, true, 'https://victorychurch.org', 'info@victorychurch.org', true, 4.5, 1500),
('Central Church', 'Henderson', 'NV', 'United States', 'Non-denominational', true, ARRAY['Bitcoin', 'Ethereum', 'USDC', 'Base'], true, true, 'https://centralchurch.com', 'info@centralchurch.com', true, 4.7, 1900),
('Seacoast Church', 'Mount Pleasant', 'SC', 'United States', 'Non-denominational', true, ARRAY['Bitcoin', 'Ethereum', 'USDC'], true, true, 'https://seacoast.org', 'info@seacoast.org', true, 4.6, 1700),
('Dream City Church', 'Phoenix', 'AZ', 'United States', 'Pentecostal', true, ARRAY['Bitcoin', 'Ethereum', 'USDC', 'Solana'], true, true, 'https://dreamcitychurch.us', 'info@dreamcitychurch.us', true, 4.5, 2400),
('Faith Promise Church', 'Knoxville', 'TN', 'United States', 'Non-denominational', true, ARRAY['Bitcoin', 'Ethereum', 'USDC'], true, true, 'https://faithpromise.org', 'info@faithpromise.org', true, 4.7, 1300),
('The Rock Church', 'San Bernardino', 'CA', 'United States', 'Non-denominational', true, ARRAY['Bitcoin', 'Ethereum', 'USDC', 'Base'], true, true, 'https://therocksb.org', 'info@therocksb.org', true, 4.4, 1100),
('Living Faith Church Worldwide', 'Lagos', 'Lagos State', 'Nigeria', 'Charismatic', true, ARRAY['Bitcoin', 'Ethereum', 'USDC', 'USDT'], true, true, 'https://faithoyedepo.org', 'info@livingfaith.org', true, 4.8, 5200),
('Hillsong London', 'London', 'England', 'United Kingdom', 'Pentecostal', true, ARRAY['Bitcoin', 'Ethereum', 'USDC'], true, true, 'https://hillsong.com/uk', 'london@hillsong.com', true, 4.6, 2800),
('Mars Hill Bible Church', 'Grand Rapids', 'MI', 'United States', 'Non-denominational', true, ARRAY['Bitcoin', 'Ethereum', 'USDC'], true, true, 'https://marshillweb.org', 'info@marshillweb.org', true, 4.5, 1400),
('Mosaic Church', 'Los Angeles', 'CA', 'United States', 'Non-denominational', true, ARRAY['Bitcoin', 'Ethereum', 'USDC', 'Base'], true, true, 'https://mosaic.org', 'info@mosaic.org', true, 4.7, 1800),
('The Village Church', 'Flower Mound', 'TX', 'United States', 'Baptist', true, ARRAY['Bitcoin', 'Ethereum', 'USDC'], true, true, 'https://thevillagechurch.net', 'info@thevillagechurch.net', true, 4.8, 2600),
('Bayside Church', 'Granite Bay', 'CA', 'United States', 'Non-denominational', true, ARRAY['Bitcoin', 'Ethereum', 'USDC', 'DAI'], true, true, 'https://baysideonline.com', 'info@baysideonline.com', true, 4.6, 1900),
('Community Bible Church', 'San Antonio', 'TX', 'United States', 'Non-denominational', true, ARRAY['Bitcoin', 'Ethereum', 'USDC'], true, true, 'https://communitybible.com', 'info@communitybible.com', true, 4.7, 2100)
ON CONFLICT DO NOTHING;
