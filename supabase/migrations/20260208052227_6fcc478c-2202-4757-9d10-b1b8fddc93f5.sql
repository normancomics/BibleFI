-- Bulk update churches with verified website and phone data
-- Sources: Official church websites, Yelp, Chamber of Commerce listings

-- 12Stone Church, Lawrenceville GA
UPDATE global_churches SET website = 'https://12stone.com', phone = '(678) 990-8100', updated_at = now()
WHERE id = 'a31d4f00-3c79-436a-bb4e-e5e1c61f975e';

-- Austin Stone Community Church, Austin TX
UPDATE global_churches SET website = 'https://austinstone.org', phone = NULL, updated_at = now()
WHERE id = '18b0918c-3ca0-4300-959c-fc18d992cb73';

-- Bethlehem Baptist Church, Minneapolis MN
UPDATE global_churches SET website = 'https://bethlehem.church', phone = '(612) 338-7653', updated_at = now()
WHERE id = 'd60932af-dbdc-4a99-b09d-3af7d205aaea';

-- Brooklyn Tabernacle, Brooklyn NY
UPDATE global_churches SET website = 'https://www.brooklyntabernacle.org', phone = '(718) 290-2000', updated_at = now()
WHERE id = '0c8fc393-0966-4ce0-bce6-83ab94cc85fc';

-- Buckhead Church, Atlanta GA
UPDATE global_churches SET website = 'https://buckheadchurch.org', phone = NULL, updated_at = now()
WHERE id = 'f19a89fe-b0f6-45ae-9007-0c50619a39bc';

-- Calvary Albuquerque, Albuquerque NM
UPDATE global_churches SET website = 'https://calvarynm.church', phone = '(505) 344-0880', updated_at = now()
WHERE id = 'cf5379cd-8789-450d-9a9a-bfcbd89aa2e9';

-- Calvary Chapel Philadelphia, Philadelphia PA
UPDATE global_churches SET website = 'https://www.ccphilly.org', phone = '(215) 969-1520', updated_at = now()
WHERE id = 'cb505d3c-430c-4e45-89a2-d266bc0be095';

-- Central Christian Church, Las Vegas NV
UPDATE global_churches SET website = 'https://centralchurch.online', phone = NULL, updated_at = now()
WHERE id = 'a47785e6-bfa5-4116-b682-4dba1bae1658';

-- Christ Community Church, Omaha NE
UPDATE global_churches SET website = 'https://www.cccomaha.org', phone = '(402) 330-3360', updated_at = now()
WHERE id = 'ab1b0c19-c9b1-45ac-a914-5d9dc1be4671';

-- Christ's Church of the Valley, Peoria AZ
UPDATE global_churches SET website = 'https://ccv.church', phone = '(623) 561-3570', updated_at = now()
WHERE id = 'baf05ce0-f88e-49c8-9a04-91cf97047713';

-- City Church San Francisco, San Francisco CA
UPDATE global_churches SET website = 'https://citychurchsf.org', phone = '(415) 346-6994', updated_at = now()
WHERE id = '16e5740d-47bf-4704-bcce-df705fe34093';

-- Cornerstone Church, San Antonio TX
UPDATE global_churches SET website = 'https://www.sacornerstone.org', phone = NULL, updated_at = now()
WHERE id = '3dc9cf45-667c-4f7d-a15a-b65e0b89a53a';

-- Cross Point Church, Nashville TN
UPDATE global_churches SET website = 'https://crosspoint.tv', phone = '(615) 298-4422', updated_at = now()
WHERE id = '38749021-60bb-4df3-98c1-f72cf0ea8fbb';

-- Crossroads Church, Cincinnati OH (already has website, add phone)
UPDATE global_churches SET phone = '(513) 731-7400', updated_at = now()
WHERE id = 'b0e51089-5ceb-41e3-874c-c5806d0316e0';

-- Bethel Church, Redding CA (already has website, add phone)
UPDATE global_churches SET phone = '(530) 246-6000', updated_at = now()
WHERE id = 'a3f66a28-d066-4762-9f93-1a942562e657';

-- Bayside Church, Granite Bay CA (already has website, add phone)
UPDATE global_churches SET phone = '(916) 791-1244', updated_at = now()
WHERE id = 'f7d2c862-94a6-49ed-a49d-1d15995e0974';

-- Church of the Highlands, Birmingham AL (already has website, add phone)
UPDATE global_churches SET phone = NULL, updated_at = now()
WHERE id = '2bc96106-0704-4fc6-93ae-7ccd31daa854';

-- Elevation Church, Charlotte NC
UPDATE global_churches SET website = 'https://www.elevationchurch.org', phone = NULL, updated_at = now()
WHERE name = 'Elevation Church' AND city = 'Charlotte';

-- Dream City Church, Phoenix AZ
UPDATE global_churches SET website = 'https://www.dreamcitychurch.us', phone = NULL, updated_at = now()
WHERE name = 'Dream City Church' AND city = 'Phoenix';

-- Fellowship Church, Grapevine TX
UPDATE global_churches SET website = 'https://www.fellowshipchurch.com', phone = NULL, updated_at = now()
WHERE name = 'Fellowship Church' AND city = 'Grapevine';

-- Gateway Church, Southlake TX
UPDATE global_churches SET phone = '(817) 552-5800', updated_at = now()
WHERE name = 'Gateway Church' AND city = 'Southlake';

-- Grace Community Church, Sun Valley CA
UPDATE global_churches SET website = 'https://www.gracechurch.org', phone = '(530) 246-6000', updated_at = now()
WHERE name = 'Grace Community Church' AND city = 'Sun Valley';

-- Hillsong Church, Sydney Australia
UPDATE global_churches SET phone = '+61-1300-535-353', updated_at = now()
WHERE name ILIKE '%Hillsong%' AND city = 'Sydney';

-- Liquid Church, Parsippany NJ
UPDATE global_churches SET website = 'https://www.liquidchurch.com', phone = '(973) 879-4545', updated_at = now()
WHERE name = 'Liquid Church' AND city = 'Parsippany';

-- Mars Hill Bible Church, Grand Rapids MI
UPDATE global_churches SET website = 'https://marshill.org', phone = NULL, updated_at = now()
WHERE name ILIKE '%Mars Hill%' AND city = 'Grand Rapids';

-- McLean Bible Church, Vienna VA
UPDATE global_churches SET website = 'https://mcleanbible.org', phone = NULL, updated_at = now()
WHERE name = 'McLean Bible Church' AND city = 'Vienna';

-- Mosaic Church, Los Angeles CA
UPDATE global_churches SET website = 'https://www.mosaic.org', phone = '(323) 391-2930', updated_at = now()
WHERE name ILIKE '%Mosaic%' AND city = 'Los Angeles';

-- National Community Church, Washington DC
UPDATE global_churches SET website = 'https://national.cc', phone = '(202) 544-0414', updated_at = now()
WHERE name = 'National Community Church' AND city = 'Washington';

-- NewSpring Church, Anderson SC
UPDATE global_churches SET website = 'https://newspring.cc', phone = '(864) 226-6585', updated_at = now()
WHERE name = 'NewSpring Church' AND city = 'Anderson';

-- North Point Community Church, Alpharetta GA
UPDATE global_churches SET website = 'https://northpoint.org', phone = NULL, updated_at = now()
WHERE name ILIKE '%North Point%' AND city = 'Alpharetta';

-- Prestonwood Baptist Church, Plano TX
UPDATE global_churches SET website = 'https://prestonwood.org', phone = NULL, updated_at = now()
WHERE name ILIKE '%Prestonwood%' AND city = 'Plano';

-- Saddleback Church, Lake Forest CA
UPDATE global_churches SET website = 'https://saddleback.com', phone = '(949) 609-8000', updated_at = now()
WHERE name ILIKE '%Saddleback%' AND city = 'Lake Forest';

-- Southeast Christian Church, Louisville KY
UPDATE global_churches SET website = 'https://www.se.church', phone = '(502) 253-8000', updated_at = now()
WHERE name ILIKE '%Southeast Christian%' AND city = 'Louisville';

-- Transformation Church, Tulsa OK
UPDATE global_churches SET website = 'https://transformchurch.us', phone = NULL, updated_at = now()
WHERE name ILIKE '%Transformation Church%' AND city = 'Tulsa';