ALTER TABLE usage_limits
ADD COLUMN IF NOT EXISTS lifetime_generations integer NOT NULL DEFAULT 0;

CREATE OR REPLACE FUNCTION increment_lifetime_generations(p_user_id uuid, p_units integer)
RETURNS void AS $$
BEGIN
  INSERT INTO usage_limits (user_id, lifetime_generations)
  VALUES (p_user_id, p_units)
  ON CONFLICT (user_id)
  DO UPDATE SET lifetime_generations = usage_limits.lifetime_generations + p_units;
END;
$$ LANGUAGE plpgsql;
