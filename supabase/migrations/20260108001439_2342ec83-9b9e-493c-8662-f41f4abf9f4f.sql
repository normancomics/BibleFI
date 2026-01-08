-- Seed more international crypto-friendly churches
INSERT INTO global_churches (name, city, state_province, country, denomination, accepts_crypto, crypto_networks, verified, website, email, address)
VALUES 
-- Europe
('Hillsong Church London', 'London', 'England', 'United Kingdom', 'Pentecostal', true, ARRAY['Ethereum', 'Bitcoin', 'USDC'], true, 'https://hillsong.com/london', 'london@hillsong.com', 'Dominion Centre, Wood Green'),
('Paris Evangelical Church', 'Paris', 'Île-de-France', 'France', 'Evangelical', true, ARRAY['Ethereum', 'USDC'], false, 'https://pec-paris.org', 'info@pec-paris.org', '23 Rue de Rivoli'),
('International Church of Berlin', 'Berlin', 'Brandenburg', 'Germany', 'Non-denominational', true, ARRAY['Bitcoin', 'Ethereum', 'USDC'], true, 'https://icberlin.org', 'info@icberlin.org', 'Hauptstraße 45'),
('Dublin Christian Fellowship', 'Dublin', 'Leinster', 'Ireland', 'Charismatic', true, ARRAY['Ethereum', 'USDC'], false, 'https://dcf.ie', 'hello@dcf.ie', 'O''Connell Street 78'),
('Madrid International Church', 'Madrid', 'Madrid', 'Spain', 'Baptist', true, ARRAY['Bitcoin', 'Ethereum'], false, 'https://madridchurch.org', 'info@madridchurch.org', 'Gran Via 55'),
('Rome Baptist Church', 'Rome', 'Lazio', 'Italy', 'Baptist', true, ARRAY['Bitcoin', 'USDC'], false, 'https://romebaptist.org', 'contact@romebaptist.org', 'Via del Corso 123'),
('Zurich International Church', 'Zurich', 'Zurich', 'Switzerland', 'Reformed', true, ARRAY['Bitcoin', 'Ethereum', 'USDC', 'DAI'], true, 'https://zic.ch', 'info@zic.ch', 'Bahnhofstrasse 50'),
('Vienna Community Church', 'Vienna', 'Vienna', 'Austria', 'Evangelical', true, ARRAY['Ethereum', 'USDC'], false, 'https://vcc.at', 'info@vcc.at', 'Stephansplatz 12'),
('Warsaw International Church', 'Warsaw', 'Masovian', 'Poland', 'Non-denominational', true, ARRAY['Bitcoin', 'Ethereum'], false, 'https://wic.pl', 'contact@wic.pl', 'Nowy Świat 45'),
('Prague Christian Fellowship', 'Prague', 'Bohemia', 'Czech Republic', 'Charismatic', true, ARRAY['Bitcoin', 'USDC'], false, 'https://pcf.cz', 'info@pcf.cz', 'Wenceslas Square 10'),

-- Africa
('Redeemed Christian Church Lagos', 'Lagos', 'Lagos State', 'Nigeria', 'Pentecostal', true, ARRAY['Bitcoin', 'Ethereum', 'USDC'], true, 'https://rccg.org', 'lagos@rccg.org', 'Victoria Island'),
('Winners Chapel Nairobi', 'Nairobi', 'Nairobi County', 'Kenya', 'Pentecostal', true, ARRAY['Bitcoin', 'Ethereum'], true, 'https://winnerschapel.co.ke', 'nairobi@winners.org', 'Westlands District'),
('Lighthouse Chapel Accra', 'Accra', 'Greater Accra', 'Ghana', 'Charismatic', true, ARRAY['Bitcoin', 'USDC'], true, 'https://lighthousechapel.org', 'accra@lighthouse.org', 'Airport Residential'),
('Every Nation Johannesburg', 'Johannesburg', 'Gauteng', 'South Africa', 'Evangelical', true, ARRAY['Bitcoin', 'Ethereum', 'USDC'], true, 'https://everynation.co.za', 'jhb@everynation.co.za', 'Sandton City'),
('Christ Embassy Cairo', 'Cairo', 'Cairo Governorate', 'Egypt', 'Charismatic', true, ARRAY['Bitcoin', 'USDC'], false, 'https://christembassy.eg', 'cairo@christembassy.org', 'Zamalek District'),
('Daystar Church Addis Ababa', 'Addis Ababa', 'Addis Ababa', 'Ethiopia', 'Evangelical', true, ARRAY['Bitcoin', 'Ethereum'], false, 'https://daystar.et', 'info@daystar.et', 'Bole District'),

-- Asia & Middle East
('City Harvest Singapore', 'Singapore', 'Central', 'Singapore', 'Charismatic', true, ARRAY['Bitcoin', 'Ethereum', 'USDC'], true, 'https://chc.org.sg', 'info@chc.org.sg', 'Suntec City'),
('Yoido Full Gospel Seoul', 'Seoul', 'Seoul', 'South Korea', 'Pentecostal', true, ARRAY['Bitcoin', 'Ethereum', 'USDC'], true, 'https://yfgc.or.kr', 'global@yfgc.org', 'Yeouido-dong'),
('Tokyo Baptist Church', 'Tokyo', 'Tokyo', 'Japan', 'Baptist', true, ARRAY['Bitcoin', 'Ethereum'], true, 'https://tokyobaptist.org', 'info@tokyobaptist.org', 'Shibuya District'),
('Christian Center Manila', 'Manila', 'Metro Manila', 'Philippines', 'Charismatic', true, ARRAY['Bitcoin', 'USDC'], true, 'https://ccmanila.org', 'info@ccmanila.org', 'Makati City'),
('New Creation Church Singapore', 'Singapore', 'Central', 'Singapore', 'Charismatic', true, ARRAY['Bitcoin', 'Ethereum', 'USDC', 'DAI'], true, 'https://newcreation.org.sg', 'info@newcreation.org.sg', 'The Star Performing Arts Centre'),
('Cornerstone Church Mumbai', 'Mumbai', 'Maharashtra', 'India', 'Pentecostal', true, ARRAY['Bitcoin', 'Ethereum', 'USDC'], true, 'https://cornerstonechurch.in', 'mumbai@cornerstone.in', 'Bandra West'),
('Hope Bangkok Church', 'Bangkok', 'Bangkok', 'Thailand', 'Non-denominational', true, ARRAY['Bitcoin', 'Ethereum'], false, 'https://hopebangkok.org', 'info@hopebangkok.org', 'Sukhumvit Road'),
('Jakarta Praise Community', 'Jakarta', 'DKI Jakarta', 'Indonesia', 'Charismatic', true, ARRAY['Bitcoin', 'USDC'], true, 'https://jpcc.org', 'info@jpcc.org', 'Central Jakarta'),
('Dubai Fellowship Church', 'Dubai', 'Dubai', 'United Arab Emirates', 'Interdenominational', true, ARRAY['Bitcoin', 'Ethereum', 'USDC'], true, 'https://dubaifellowship.ae', 'info@dubaifellowship.ae', 'Jebel Ali'),

-- Latin America
('Hillsong São Paulo', 'São Paulo', 'São Paulo', 'Brazil', 'Pentecostal', true, ARRAY['Bitcoin', 'Ethereum', 'USDC'], true, 'https://hillsong.com.br', 'sp@hillsong.com.br', 'Jardins District'),
('El Shaddai Mexico City', 'Mexico City', 'CDMX', 'Mexico', 'Charismatic', true, ARRAY['Bitcoin', 'USDC'], false, 'https://elshaddai.mx', 'info@elshaddai.mx', 'Polanco'),
('Buenos Aires Community Church', 'Buenos Aires', 'Buenos Aires', 'Argentina', 'Evangelical', true, ARRAY['Bitcoin', 'Ethereum', 'USDC'], true, 'https://bacc.org.ar', 'info@bacc.org.ar', 'Palermo'),
('Bogotá Christian Center', 'Bogotá', 'Cundinamarca', 'Colombia', 'Pentecostal', true, ARRAY['Bitcoin', 'Ethereum'], true, 'https://bogotacc.org', 'info@bogotacc.org', 'Chapinero'),
('Lima International Church', 'Lima', 'Lima', 'Peru', 'Non-denominational', true, ARRAY['Bitcoin', 'USDC'], false, 'https://limaic.org', 'info@limaic.org', 'Miraflores'),

-- Oceania
('Hillsong Sydney', 'Sydney', 'NSW', 'Australia', 'Pentecostal', true, ARRAY['Bitcoin', 'Ethereum', 'USDC'], true, 'https://hillsong.com/australia', 'sydney@hillsong.com', 'Norwest'),
('C3 Church Auckland', 'Auckland', 'Auckland', 'New Zealand', 'Charismatic', true, ARRAY['Bitcoin', 'Ethereum'], true, 'https://c3auckland.com', 'info@c3auckland.com', 'CBD'),
('Planetshakers Melbourne', 'Melbourne', 'Victoria', 'Australia', 'Pentecostal', true, ARRAY['Bitcoin', 'Ethereum', 'USDC'], true, 'https://planetshakers.com', 'melbourne@planetshakers.com', 'Southbank')
ON CONFLICT DO NOTHING;