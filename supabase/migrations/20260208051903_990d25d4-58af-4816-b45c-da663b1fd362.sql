-- Fix The Father's House in Leesburg, FL - correct website and phone
UPDATE global_churches 
SET website = 'https://thefathershouse.com', 
    phone = '(352) 315-1815',
    updated_at = now()
WHERE id = '7eeadad1-3b4a-4ff0-94d8-b64963a32dd7';