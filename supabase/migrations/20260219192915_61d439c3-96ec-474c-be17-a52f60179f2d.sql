
-- =============================================
-- BATCH SEED: More US Major Cities
-- =============================================

-- Seattle, WA
INSERT INTO public.global_churches (name, denomination, address, city, state_province, country, postal_code, website, phone, accepts_fiat, accepts_cards, accepts_checks, verified)
VALUES
('Mars Hill Church', 'Non-Denominational', '1401 NW Leary Way', 'Seattle', 'Washington', 'United States', '98107', 'https://marshillchurch.org', '(206) 816-3500', true, true, true, true),
('The City Church', 'Non-Denominational', '333 Elliott Ave W', 'Seattle', 'Washington', 'United States', '98119', 'https://thecitychurch.com', '(206) 285-6400', true, true, false, true),
('Quest Church', 'Evangelical Covenant', '1415 NW 62nd St', 'Seattle', 'Washington', 'United States', '98107', 'https://questchurch.com', '(206) 721-0141', true, true, false, true);

-- Denver, CO
INSERT INTO public.global_churches (name, denomination, address, city, state_province, country, postal_code, website, phone, accepts_fiat, accepts_cards, accepts_checks, verified)
VALUES
('Red Rocks Church', 'Non-Denominational', '11 Yosemite St', 'Denver', 'Colorado', 'United States', '80230', 'https://redrockschurch.com', '(303) 759-1822', true, true, true, true),
('Denver Community Church', 'Non-Denominational', '1595 Pearl St', 'Denver', 'Colorado', 'United States', '80203', 'https://denvercommunitychurch.com', '(303) 355-3771', true, true, false, true);

-- Nashville, TN
INSERT INTO public.global_churches (name, denomination, address, city, state_province, country, postal_code, website, phone, accepts_fiat, accepts_cards, accepts_checks, verified)
VALUES
('Cross Point Church', 'Non-Denominational', '224 Franklin Rd', 'Nashville', 'Tennessee', 'United States', '37064', 'https://crosspoint.tv', '(615) 234-3322', true, true, true, true),
('Christ Church Nashville', 'Anglican', '15354 Old Hickory Blvd', 'Nashville', 'Tennessee', 'United States', '37211', 'https://christchurchnashville.org', '(615) 333-0892', true, true, true, true);

-- Miami, FL
INSERT INTO public.global_churches (name, denomination, address, city, state_province, country, postal_code, website, phone, accepts_fiat, accepts_cards, accepts_checks, verified)
VALUES
('Vous Church', 'Non-Denominational', '1801 NE Miami Ct', 'Miami', 'Florida', 'United States', '33132', 'https://vouschurch.com', '(786) 615-1010', true, true, false, true),
('Trinity Church Miami', 'Non-Denominational', '651 NW 1st St', 'Miami', 'Florida', 'United States', '33128', 'https://trinitymiami.com', '(305) 374-5683', true, true, true, true);

-- Portland, OR
INSERT INTO public.global_churches (name, denomination, address, city, state_province, country, postal_code, website, phone, accepts_fiat, accepts_cards, accepts_checks, verified)
VALUES
('Bridgetown Church', 'Non-Denominational', '815 SE Hawthorne Blvd', 'Portland', 'Oregon', 'United States', '97214', 'https://bridgetown.church', '(503) 231-8794', true, true, true, true),
('Door of Hope', 'Non-Denominational', '2000 NE Killingsworth St', 'Portland', 'Oregon', 'United States', '97211', 'https://doorofhopepdx.org', '(503) 284-6039', true, true, false, true);

-- Minneapolis, MN
INSERT INTO public.global_churches (name, denomination, address, city, state_province, country, postal_code, website, phone, accepts_fiat, accepts_cards, accepts_checks, verified)
VALUES
('Bethlehem Baptist Church', 'Baptist', '720 13th Ave S', 'Minneapolis', 'Minnesota', 'United States', '55415', 'https://bethlehem.church', '(612) 338-7653', true, true, true, true);

-- Washington, DC
INSERT INTO public.global_churches (name, denomination, address, city, state_province, country, postal_code, website, phone, accepts_fiat, accepts_cards, accepts_checks, verified)
VALUES
('National Community Church', 'Assemblies of God', '770 M St SE', 'Washington', 'District of Columbia', 'United States', '20003', 'https://national.cc', '(202) 544-0014', true, true, true, true),
('The Falls Church Anglican', 'Anglican', '6565 Arlington Blvd', 'Falls Church', 'Virginia', 'United States', '22042', 'https://tfcanglican.org', '(703) 532-7600', true, true, true, true);

-- =============================================
-- CANADA
-- =============================================
INSERT INTO public.global_churches (name, denomination, address, city, state_province, country, postal_code, website, phone, accepts_fiat, accepts_cards, accepts_checks, verified)
VALUES
('The Meeting House', 'Brethren in Christ', '2700 Bristol Cir', 'Oakville', 'Ontario', 'Canada', 'L6H 6E1', 'https://themeetinghouse.com', '(905) 287-7000', true, true, true, true),
('C3 Church Toronto', 'Pentecostal', '100 Broadview Ave', 'Toronto', 'Ontario', 'Canada', 'M4M 3H3', 'https://c3toronto.com', '(416) 897-0030', true, true, false, true),
('Centre Street Church', 'Evangelical Missionary', '3900 2 St NE', 'Calgary', 'Alberta', 'Canada', 'T2E 9B1', 'https://centrestreet.com', '(403) 293-3900', true, true, true, true),
('Westside Church', 'Non-Denominational', '7540 4th St SW', 'Calgary', 'Alberta', 'Canada', 'T2V 1A1', 'https://westsidechurch.ca', '(403) 252-0636', true, true, false, true),
('Pacific Community Church', 'Non-Denominational', '1037 Pacific St', 'Vancouver', 'British Columbia', 'Canada', 'V6E 1P8', 'https://pacificcommunity.ca', '(604) 689-3344', true, true, false, true),
('Willingdon Church', 'Mennonite Brethren', '4812 Willingdon Ave', 'Burnaby', 'British Columbia', 'Canada', 'V5G 3H6', 'https://willchurch.com', '(604) 299-2377', true, true, true, true),
('Connexus Church', 'Non-Denominational', '200 Bayfield St', 'Barrie', 'Ontario', 'Canada', 'L4M 3B6', 'https://connexuschurch.com', '(705) 252-2232', true, true, false, true),
('Church of the Redeemer', 'Anglican', '162 Bloor St W', 'Toronto', 'Ontario', 'Canada', 'M5S 1M4', 'https://theredeemer.ca', '(416) 922-4948', true, true, true, true),
('Peoples Church', 'Non-Denominational', '374 Sheppard Ave E', 'Toronto', 'Ontario', 'Canada', 'M2N 3B6', 'https://peopleschurch.ca', '(416) 222-3344', true, true, true, true),
('St. Andrew''s Presbyterian Church', 'Presbyterian', '73 Simcoe St', 'Toronto', 'Ontario', 'Canada', 'M5J 1W9', 'https://standrewstoronto.org', '(416) 593-5600', true, true, true, true);

-- Montreal
INSERT INTO public.global_churches (name, denomination, address, city, state_province, country, postal_code, website, phone, accepts_fiat, accepts_cards, accepts_checks, verified)
VALUES
('Christ Church Cathedral Montreal', 'Anglican', '635 Sainte-Catherine St W', 'Montreal', 'Quebec', 'Canada', 'H3B 1B7', 'https://montrealcathedral.ca', '(514) 843-6577', true, true, true, true),
('Eglise Emmanuel', 'Baptist', '510 Boul St-Laurent', 'Montreal', 'Quebec', 'Canada', 'H2Y 2Y9', 'https://egliseemmanuel.ca', '(514) 844-3763', true, true, false, true);

-- =============================================
-- EUROPE
-- =============================================

-- London, UK
INSERT INTO public.global_churches (name, denomination, address, city, state_province, country, postal_code, website, phone, accepts_fiat, accepts_cards, accepts_checks, verified)
VALUES
('HTB (Holy Trinity Brompton)', 'Anglican', 'Brompton Rd', 'London', 'England', 'United Kingdom', 'SW7 1JA', 'https://htb.org', '+44 20 7052 0200', true, true, false, true),
('Hillsong London', 'Pentecostal', 'Dominion Theatre, 268-269 Tottenham Court Rd', 'London', 'England', 'United Kingdom', 'W1T 7AQ', 'https://hillsong.com/london', '+44 20 7927 4250', true, true, false, true),
('All Souls Langham Place', 'Anglican', '2 All Souls Pl', 'London', 'England', 'United Kingdom', 'W1B 3DA', 'https://allsouls.org', '+44 20 7580 3522', true, true, false, true),
('KT London (Kings Throne)', 'Non-Denominational', '163 Praed St', 'London', 'England', 'United Kingdom', 'W2 1RH', 'https://ktlondon.com', '+44 20 7723 8150', true, true, false, true);

-- Paris, France
INSERT INTO public.global_churches (name, denomination, address, city, state_province, country, postal_code, website, phone, accepts_fiat, accepts_cards, accepts_checks, verified)
VALUES
('American Church in Paris', 'Interdenominational', '65 Quai d''Orsay', 'Paris', 'Île-de-France', 'France', '75007', 'https://acparis.org', '+33 1 40 62 05 00', true, true, false, true),
('Hillsong Paris', 'Pentecostal', '21 Rue Bergère', 'Paris', 'Île-de-France', 'France', '75009', 'https://hillsong.com/paris', '+33 1 85 08 50 50', true, true, false, true),
('Saint-Étienne-du-Mont', 'Roman Catholic', 'Place Sainte-Geneviève', 'Paris', 'Île-de-France', 'France', '75005', NULL, '+33 1 43 54 11 79', true, false, false, true);

-- Berlin, Germany
INSERT INTO public.global_churches (name, denomination, address, city, state_province, country, postal_code, website, phone, accepts_fiat, accepts_cards, accepts_checks, verified)
VALUES
('ICF Berlin', 'Non-Denominational', 'Schönhauser Allee 36', 'Berlin', 'Berlin', 'Germany', '10435', 'https://icf-berlin.de', '+49 30 4431 8800', true, true, false, true),
('Berlin Cathedral (Berliner Dom)', 'Evangelical', 'Am Lustgarten', 'Berlin', 'Berlin', 'Germany', '10178', 'https://berlinerdom.de', '+49 30 2026 9136', true, true, false, true);

-- Amsterdam, Netherlands
INSERT INTO public.global_churches (name, denomination, address, city, state_province, country, postal_code, website, phone, accepts_fiat, accepts_cards, accepts_checks, verified)
VALUES
('Hillsong Amsterdam', 'Pentecostal', 'Muziekgebouw aan ''t IJ, Piet Heinkade 1', 'Amsterdam', 'North Holland', 'Netherlands', '1019 BR', 'https://hillsong.com/amsterdam', '+31 20 520 0200', true, true, false, true),
('English Reformed Church Amsterdam', 'Reformed', 'Begijnhof 48', 'Amsterdam', 'North Holland', 'Netherlands', '1012 WV', 'https://ercadam.nl', '+31 20 624 9665', true, false, false, true);

-- Rome, Italy
INSERT INTO public.global_churches (name, denomination, address, city, state_province, country, postal_code, website, phone, accepts_fiat, accepts_cards, accepts_checks, verified)
VALUES
('St. Paul''s Within the Walls', 'Episcopal', 'Via Napoli 58', 'Rome', 'Lazio', 'Italy', '00184', 'https://stpaulsrome.it', '+39 06 488 3339', true, true, false, true);

-- Madrid, Spain
INSERT INTO public.global_churches (name, denomination, address, city, state_province, country, postal_code, website, phone, accepts_fiat, accepts_cards, accepts_checks, verified)
VALUES
('Immanuel Baptist Church Madrid', 'Baptist', 'Calle de Hernández de Tejada 4', 'Madrid', 'Community of Madrid', 'Spain', '28027', 'https://ibcmadrid.com', '+34 91 407 4347', true, true, false, true);

-- Stockholm, Sweden
INSERT INTO public.global_churches (name, denomination, address, city, state_province, country, postal_code, website, phone, accepts_fiat, accepts_cards, accepts_checks, verified)
VALUES
('Hillsong Stockholm', 'Pentecostal', 'Slakthusplan 5', 'Stockholm', 'Stockholm', 'Sweden', '121 62', 'https://hillsong.com/stockholm', '+46 8 505 240 00', true, true, false, true);

-- Zurich, Switzerland
INSERT INTO public.global_churches (name, denomination, address, city, state_province, country, postal_code, website, phone, accepts_fiat, accepts_cards, accepts_checks, verified)
VALUES
('ICF Zurich', 'Non-Denominational', 'Maagpl. 11', 'Zurich', 'Zurich', 'Switzerland', '8005', 'https://icf.church', '+41 44 500 60 60', true, true, false, true);

-- =============================================
-- SOUTH AMERICA
-- =============================================

-- São Paulo, Brazil
INSERT INTO public.global_churches (name, denomination, address, city, state_province, country, postal_code, website, phone, accepts_fiat, accepts_cards, accepts_checks, verified)
VALUES
('Lagoinha Church São Paulo', 'Baptist', 'Av. Paulista 1159', 'São Paulo', 'São Paulo', 'Brazil', '01311-200', 'https://lagoinha.com', '+55 11 3262-0100', true, true, false, true),
('Comunidade da Graça', 'Non-Denominational', 'R. São Bento 365', 'São Paulo', 'São Paulo', 'Brazil', '01011-100', 'https://comunidadedagraca.com.br', '+55 11 3104-4440', true, true, false, true);

-- Buenos Aires, Argentina
INSERT INTO public.global_churches (name, denomination, address, city, state_province, country, postal_code, website, phone, accepts_fiat, accepts_cards, accepts_checks, verified)
VALUES
('Catedral Metropolitana de Buenos Aires', 'Roman Catholic', 'San Martín 27', 'Buenos Aires', 'Buenos Aires', 'Argentina', 'C1004AAA', 'https://catedralbuenosaires.org.ar', '+54 11 4331-2845', true, false, false, true),
('Iglesia El Encuentro', 'Pentecostal', 'Av. Rivadavia 3950', 'Buenos Aires', 'Buenos Aires', 'Argentina', 'C1204AAR', 'https://elencuentro.org', '+54 11 4981-5000', true, true, false, true);

-- Bogotá, Colombia
INSERT INTO public.global_churches (name, denomination, address, city, state_province, country, postal_code, website, phone, accepts_fiat, accepts_cards, accepts_checks, verified)
VALUES
('El Lugar de Su Presencia', 'Non-Denominational', 'Av. Cra 68 #23B-45', 'Bogotá', 'Cundinamarca', 'Colombia', '110931', 'https://supresencia.com', '+57 1 437-1010', true, true, false, true),
('Iglesia MCI (Misión Carismática Internacional)', 'Charismatic', 'Calle 22C #31-01', 'Bogotá', 'Cundinamarca', 'Colombia', '111321', 'https://mci12.com', '+57 1 288-7171', true, true, false, true);

-- Lima, Peru
INSERT INTO public.global_churches (name, denomination, address, city, state_province, country, postal_code, website, phone, accepts_fiat, accepts_cards, accepts_checks, verified)
VALUES
('Camino de Vida', 'Non-Denominational', 'Av. Aviación 3750', 'Lima', 'Lima', 'Peru', '15036', 'https://caminodevida.com', '+51 1 225-6150', true, true, false, true);

-- Santiago, Chile
INSERT INTO public.global_churches (name, denomination, address, city, state_province, country, postal_code, website, phone, accepts_fiat, accepts_cards, accepts_checks, verified)
VALUES
('Catedral Metropolitana de Santiago', 'Roman Catholic', 'Plaza de Armas s/n', 'Santiago', 'Santiago Metropolitan', 'Chile', '8320000', NULL, '+56 2 2696-2777', true, false, false, true),
('Iglesia Metodista de Chile', 'Methodist', 'Av. Libertador Bernardo O''Higgins 834', 'Santiago', 'Santiago Metropolitan', 'Chile', '8320000', 'https://metodistadechile.cl', '+56 2 2688-4949', true, true, false, true);

-- =============================================
-- AUSTRALIA
-- =============================================
INSERT INTO public.global_churches (name, denomination, address, city, state_province, country, postal_code, website, phone, accepts_fiat, accepts_cards, accepts_checks, verified)
VALUES
('Hillsong Church Sydney', 'Pentecostal', '1-9 Solent Circuit', 'Sydney', 'New South Wales', 'Australia', '2153', 'https://hillsong.com/sydney', '+61 2 8853 5353', true, true, false, true),
('C3 Church Sydney', 'Pentecostal', '95 Oxford St, Darlinghurst', 'Sydney', 'New South Wales', 'Australia', '2010', 'https://c3churchglobal.com', '+61 2 9331 4166', true, true, false, true),
('St Andrew''s Cathedral Sydney', 'Anglican', 'Sydney Square', 'Sydney', 'New South Wales', 'Australia', '2000', 'https://cathedral.sydney.anglican.asn.au', '+61 2 9265 1661', true, true, false, true),
('Planetshakers Church', 'Pentecostal', '400 City Rd', 'Melbourne', 'Victoria', 'Australia', '3006', 'https://planetshakers.com', '+61 3 9676 9700', true, true, false, true),
('CityLife Church Melbourne', 'Pentecostal', '1 Dunlop Rd', 'Melbourne', 'Victoria', 'Australia', '3043', 'https://citylife.church', '+61 3 9335 5900', true, true, false, true),
('Influencers Church', 'Non-Denominational', '25 Grenfell St', 'Adelaide', 'South Australia', 'Australia', '5000', 'https://influencerschurch.com', '+61 8 8231 3088', true, true, false, true),
('Riverview Church Perth', 'Pentecostal', '9 Coode St', 'Perth', 'Western Australia', 'Australia', '6151', 'https://riverview.church', '+61 8 6166 4800', true, true, false, true),
('Citipointe Church Brisbane', 'Pentecostal', '322 Wecker Rd', 'Brisbane', 'Queensland', 'Australia', '4122', 'https://citipointe.com', '+61 7 3347 6100', true, true, false, true);

-- =============================================
-- ASIA
-- =============================================

-- Singapore
INSERT INTO public.global_churches (name, denomination, address, city, state_province, country, postal_code, website, phone, accepts_fiat, accepts_cards, accepts_checks, verified)
VALUES
('City Harvest Church', 'Charismatic', '1 Expo Dr', 'Singapore', NULL, 'Singapore', '486150', 'https://chc.org.sg', '+65 6890 9000', true, true, false, true),
('New Creation Church', 'Non-Denominational', '1 Stars Ave', 'Singapore', NULL, 'Singapore', '138507', 'https://newcreation.org.sg', '+65 6892 6700', true, true, false, true),
('Cornerstone Community Church', 'Non-Denominational', '321 New Upper Changi Rd', 'Singapore', NULL, 'Singapore', '467492', 'https://cornerstone.com.sg', '+65 6243 3500', true, true, false, true);

-- Tokyo, Japan
INSERT INTO public.global_churches (name, denomination, address, city, state_province, country, postal_code, website, phone, accepts_fiat, accepts_cards, accepts_checks, verified)
VALUES
('Tokyo Baptist Church', 'Baptist', '9-2 Hachiyama-cho, Shibuya-ku', 'Tokyo', 'Tokyo', 'Japan', '150-0035', 'https://tokyobaptist.org', '+81 3 3461-8425', true, false, false, true),
('Tokyo Union Church', 'Interdenominational', '5-7-7 Jingumae, Shibuya-ku', 'Tokyo', 'Tokyo', 'Japan', '150-0001', 'https://tokyounionchurch.org', '+81 3 3400-0047', true, false, false, true);

-- Seoul, South Korea
INSERT INTO public.global_churches (name, denomination, address, city, state_province, country, postal_code, website, phone, accepts_fiat, accepts_cards, accepts_checks, verified)
VALUES
('Yoido Full Gospel Church', 'Assemblies of God', '15 Gukhoe-daero 76-gil, Yeongdeungpo-gu', 'Seoul', 'Seoul', 'South Korea', '07233', 'https://fgtv.com', '+82 2 783-4151', true, true, false, true),
('Myungsung Church', 'Presbyterian', '12 Cheonho-daero 89-gil, Gangdong-gu', 'Seoul', 'Seoul', 'South Korea', '05353', 'https://myungsung.org', '+82 2 2243-0001', true, true, false, true),
('Onnuri Church', 'Presbyterian', '98 Seosomun-ro, Jung-gu', 'Seoul', 'Seoul', 'South Korea', '04515', 'https://onnuri.org', '+82 2 3675-2000', true, true, false, true);

-- Manila, Philippines
INSERT INTO public.global_churches (name, denomination, address, city, state_province, country, postal_code, website, phone, accepts_fiat, accepts_cards, accepts_checks, verified)
VALUES
('Victory Church Manila', 'Non-Denominational', 'BGC, 29th St', 'Taguig', 'Metro Manila', 'Philippines', '1634', 'https://victory.org.ph', '+63 2 8858-6400', true, true, false, true),
('Christ''s Commission Fellowship', 'Non-Denominational', 'CCF Center, Frontera Verde', 'Pasig', 'Metro Manila', 'Philippines', '1604', 'https://ccf.org.ph', '+63 2 8571-2727', true, true, false, true);

-- Hong Kong
INSERT INTO public.global_churches (name, denomination, address, city, state_province, country, postal_code, website, phone, accepts_fiat, accepts_cards, accepts_checks, verified)
VALUES
('Island ECC', 'Non-Denominational', '1 Hysan Ave, Causeway Bay', 'Hong Kong', NULL, 'Hong Kong', NULL, 'https://islandecc.hk', '+852 2537 7377', true, true, false, true);

-- Mumbai, India
INSERT INTO public.global_churches (name, denomination, address, city, state_province, country, postal_code, website, phone, accepts_fiat, accepts_cards, accepts_checks, verified)
VALUES
('St. Thomas Cathedral Mumbai', 'Anglican', '3 Veer Nariman Rd, Fort', 'Mumbai', 'Maharashtra', 'India', '400001', 'https://stthomascathedral.com', '+91 22 2288-7720', true, false, false, true),
('New Life Fellowship Mumbai', 'Non-Denominational', 'Andheri West', 'Mumbai', 'Maharashtra', 'India', '400058', 'https://nlfindia.org', '+91 22 2639-2020', true, true, false, true);

-- Dubai, UAE
INSERT INTO public.global_churches (name, denomination, address, city, state_province, country, postal_code, website, phone, accepts_fiat, accepts_cards, accepts_checks, verified)
VALUES
('Holy Trinity Church Dubai', 'Anglican', 'Oud Metha', 'Dubai', 'Dubai', 'United Arab Emirates', NULL, 'https://htcdubai.org', '+971 4 337-0247', true, true, false, true),
('St. Mary''s Catholic Church Dubai', 'Roman Catholic', 'Oud Metha Rd', 'Dubai', 'Dubai', 'United Arab Emirates', NULL, 'https://stmarysdubai.com', '+971 4 337-0087', true, true, false, true);
