
-- Add missing Florida churches: The Cross (Mount Dora), Life Church (Eustis), Faith Christian Fellowship (Tavares)
INSERT INTO global_churches (name, city, state_province, country, website, phone, denomination, accepts_fiat, verified)
VALUES
  ('The Cross', 'Mount Dora', 'Florida', 'United States', 'https://www.thecross.family', '(352) 602-4635', 'Non-denominational', true, true),
  ('Life Church', 'Eustis', 'Florida', 'United States', 'https://www.iamlifechurch.com', '(352) 308-8479', 'Non-denominational', true, true),
  ('Faith Christian Fellowship', 'Tavares', 'Florida', 'United States', 'https://www.fclakecounty.org', '(352) 508-5039', 'Non-denominational', true, true)
ON CONFLICT DO NOTHING;
