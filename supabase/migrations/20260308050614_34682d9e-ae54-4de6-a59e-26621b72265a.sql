-- Create a full-access view for agent operations (service role only)
CREATE OR REPLACE VIEW api.global_churches_agent AS
SELECT * FROM public.global_churches;

-- Grant access
GRANT SELECT, INSERT, UPDATE ON api.global_churches_agent TO service_role;

-- Add INSTEAD OF triggers to allow write operations through the view
CREATE OR REPLACE FUNCTION api.global_churches_agent_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.global_churches (
    name, denomination, address, city, state_province, country, postal_code,
    website, phone, email, pastor_name, crypto_address, crypto_networks,
    fiat_currencies, verified, accepts_crypto, accepts_fiat, accepts_cards,
    accepts_checks, accepts_wire_transfer, has_tech_assistance,
    assistance_contact, assistance_languages, assistance_hours,
    coordinates, created_by, verified_by
  ) VALUES (
    NEW.name, NEW.denomination, NEW.address, NEW.city, NEW.state_province, NEW.country, NEW.postal_code,
    NEW.website, NEW.phone, NEW.email, NEW.pastor_name, NEW.crypto_address, NEW.crypto_networks,
    NEW.fiat_currencies, NEW.verified, NEW.accepts_crypto, NEW.accepts_fiat, NEW.accepts_cards,
    NEW.accepts_checks, NEW.accepts_wire_transfer, NEW.has_tech_assistance,
    NEW.assistance_contact, NEW.assistance_languages, NEW.assistance_hours,
    NEW.coordinates, NEW.created_by, NEW.verified_by
  ) RETURNING * INTO NEW;
  RETURN NEW;
END;
$$;

CREATE TRIGGER global_churches_agent_insert_trigger
  INSTEAD OF INSERT ON api.global_churches_agent
  FOR EACH ROW EXECUTE FUNCTION api.global_churches_agent_insert();

CREATE OR REPLACE FUNCTION api.global_churches_agent_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.global_churches SET
    name = COALESCE(NEW.name, OLD.name),
    verified = COALESCE(NEW.verified, OLD.verified),
    updated_at = COALESCE(NEW.updated_at, now())
  WHERE id = OLD.id
  RETURNING * INTO NEW;
  RETURN NEW;
END;
$$;

CREATE TRIGGER global_churches_agent_update_trigger
  INSTEAD OF UPDATE ON api.global_churches_agent
  FOR EACH ROW EXECUTE FUNCTION api.global_churches_agent_update();