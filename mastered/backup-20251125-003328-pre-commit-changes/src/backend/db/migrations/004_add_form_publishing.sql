-- ========================================
-- FORM PUBLISHING SYSTEM MIGRATION
-- Adds publishing capabilities to forms
-- ========================================

-- Add publishing fields to forms table
ALTER TABLE forms
ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS published_version INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS published_slug VARCHAR(255),
ADD COLUMN IF NOT EXISTS publish_history JSONB DEFAULT '[]'::jsonb;

-- Add user_id column if it doesn't exist (for backwards compatibility)
ALTER TABLE forms
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.users(id) ON DELETE CASCADE;

-- Add agency_alias to users table for agency subpages
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS agency_alias VARCHAR(100) UNIQUE;

-- Create index on published_slug for fast public form lookup
CREATE INDEX IF NOT EXISTS idx_forms_published_slug ON forms(published_slug);
CREATE INDEX IF NOT EXISTS idx_forms_published_at ON forms(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_forms_user_published ON forms(user_id, published_slug) WHERE published_slug IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_agency_alias ON public.users(agency_alias);

-- Create composite index for public form lookup by agency alias and slug
CREATE INDEX IF NOT EXISTS idx_forms_public_lookup ON forms(user_id, published_slug, is_published) WHERE is_published = true;

-- Add constraint to ensure slug is unique per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_forms_user_slug_unique
ON forms(user_id, published_slug)
WHERE published_slug IS NOT NULL AND deleted_at IS NULL;

-- Function to generate unique slug for a form
CREATE OR REPLACE FUNCTION generate_form_slug(form_title TEXT, form_user_id UUID)
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
  slug_exists BOOLEAN;
BEGIN
  -- Convert title to slug format
  base_slug := LOWER(TRIM(form_title));
  base_slug := REGEXP_REPLACE(base_slug, '[^a-z0-9\s-]', '', 'g');
  base_slug := REGEXP_REPLACE(base_slug, '\s+', '-', 'g');
  base_slug := REGEXP_REPLACE(base_slug, '-+', '-', 'g');
  base_slug := TRIM(BOTH '-' FROM base_slug);

  -- Limit slug length
  IF LENGTH(base_slug) > 100 THEN
    base_slug := SUBSTRING(base_slug, 1, 100);
  END IF;

  -- If slug is empty, use 'form'
  IF base_slug = '' OR base_slug IS NULL THEN
    base_slug := 'form';
  END IF;

  final_slug := base_slug;

  -- Check if slug exists for this user and increment if needed
  LOOP
    SELECT EXISTS(
      SELECT 1 FROM forms
      WHERE user_id = form_user_id
        AND published_slug = final_slug
        AND deleted_at IS NULL
    ) INTO slug_exists;

    EXIT WHEN NOT slug_exists;

    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;

  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Function to generate unique agency alias for a user
CREATE OR REPLACE FUNCTION generate_agency_alias(user_name TEXT, user_email TEXT)
RETURNS TEXT AS $$
DECLARE
  base_alias TEXT;
  final_alias TEXT;
  counter INTEGER := 0;
  alias_exists BOOLEAN;
BEGIN
  -- Try to use name first, fallback to email username
  IF user_name IS NOT NULL AND user_name != '' THEN
    base_alias := LOWER(TRIM(user_name));
  ELSE
    base_alias := LOWER(SPLIT_PART(user_email, '@', 1));
  END IF;

  -- Convert to URL-friendly format
  base_alias := REGEXP_REPLACE(base_alias, '[^a-z0-9\s-]', '', 'g');
  base_alias := REGEXP_REPLACE(base_alias, '\s+', '-', 'g');
  base_alias := REGEXP_REPLACE(base_alias, '-+', '-', 'g');
  base_alias := TRIM(BOTH '-' FROM base_alias);

  -- Limit length
  IF LENGTH(base_alias) > 50 THEN
    base_alias := SUBSTRING(base_alias, 1, 50);
  END IF;

  -- If alias is empty, use 'agency'
  IF base_alias = '' OR base_alias IS NULL THEN
    base_alias := 'agency';
  END IF;

  final_alias := base_alias;

  -- Check if alias exists and increment if needed
  LOOP
    SELECT EXISTS(
      SELECT 1 FROM public.users WHERE agency_alias = final_alias
    ) INTO alias_exists;

    EXIT WHEN NOT alias_exists;

    counter := counter + 1;
    final_alias := base_alias || counter;
  END LOOP;

  RETURN final_alias;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate agency_alias for new users if not provided
CREATE OR REPLACE FUNCTION auto_generate_agency_alias()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.agency_alias IS NULL THEN
    NEW.agency_alias := generate_agency_alias(NEW.name, NEW.email);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_auto_generate_agency_alias ON public.users;

CREATE TRIGGER trigger_auto_generate_agency_alias
  BEFORE INSERT ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_agency_alias();

-- Backfill agency_alias for existing users
UPDATE public.users
SET agency_alias = generate_agency_alias(name, email)
WHERE agency_alias IS NULL;

COMMENT ON COLUMN forms.published_at IS 'Timestamp when the form was last published';
COMMENT ON COLUMN forms.published_version IS 'Version number of the published form (increments on each publish)';
COMMENT ON COLUMN forms.published_slug IS 'URL-friendly slug for accessing the published form';
COMMENT ON COLUMN forms.publish_history IS 'Array of publish events with timestamps, versions, and form snapshots';
COMMENT ON COLUMN public.users.agency_alias IS 'URL-friendly alias for agency subpages (e.g., /{alias}/{form-slug})';
