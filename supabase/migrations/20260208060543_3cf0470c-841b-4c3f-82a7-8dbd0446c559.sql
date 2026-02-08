
-- Create INSTEAD OF INSERT trigger so edge functions can insert through the api.global_churches view
CREATE OR REPLACE FUNCTION api.insert_global_church()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.global_churches (
    name, city, state_province, country, denomination, address,
    website, verified, accepts_crypto, accepts_fiat, accepts_cards, accepts_checks
  ) VALUES (
    NEW.name, NEW.city, NEW.state_province, NEW.country, NEW.denomination, NEW.address,
    NEW.website, NEW.verified, NEW.accepts_crypto, NEW.accepts_fiat, NEW.accepts_cards, NEW.accepts_checks
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_insert_global_church
INSTEAD OF INSERT ON api.global_churches
FOR EACH ROW EXECUTE FUNCTION api.insert_global_church();

-- Create INSTEAD OF UPDATE trigger for verify/enrich operations
CREATE OR REPLACE FUNCTION api.update_global_church()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.global_churches SET
    name = COALESCE(NEW.name, name),
    city = COALESCE(NEW.city, city),
    state_province = COALESCE(NEW.state_province, state_province),
    country = COALESCE(NEW.country, country),
    denomination = COALESCE(NEW.denomination, denomination),
    address = COALESCE(NEW.address, address),
    website = COALESCE(NEW.website, website),
    verified = COALESCE(NEW.verified, verified),
    accepts_crypto = COALESCE(NEW.accepts_crypto, accepts_crypto),
    accepts_fiat = COALESCE(NEW.accepts_fiat, accepts_fiat),
    updated_at = now()
  WHERE id = OLD.id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_update_global_church
INSTEAD OF UPDATE ON api.global_churches
FOR EACH ROW EXECUTE FUNCTION api.update_global_church();
