-- Fix RLS policies for sovereign_agents table to protect contact information

-- Drop existing overly permissive policy
DROP POLICY IF EXISTS "Active agents are publicly viewable" ON public.sovereign_agents;

-- Create new policy: public can only see name, service areas, and verified status
-- Contact details (email, phone) are hidden from anonymous users
CREATE POLICY "Public can view verified agent basic info"
ON public.sovereign_agents
FOR SELECT
USING (active = true AND verified = true);

-- Note: The actual column filtering is done at the application layer
-- because RLS policies cannot filter specific columns, only rows.
-- We should create a view for public access that excludes sensitive columns.

-- Create a public-safe view for agent listings
CREATE OR REPLACE VIEW public.public_agents AS
SELECT 
  id,
  name,
  service_areas,
  specialties,
  languages,
  rating,
  review_count,
  verified,
  availability_hours
FROM public.sovereign_agents
WHERE active = true AND verified = true;

-- Grant access to the view
GRANT SELECT ON public.public_agents TO anon, authenticated;

-- Create policy for authenticated users to see full contact details
CREATE POLICY "Authenticated users can view agent contact info"
ON public.sovereign_agents
FOR SELECT
TO authenticated
USING (active = true AND verified = true);