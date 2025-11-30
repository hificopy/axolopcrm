-- ========================================
-- MEETINGS PUBLISHING SYSTEM MIGRATION
-- Add publishing functionality to booking_links
-- Similar to forms publishing system
-- ========================================

-- Add publishing fields to booking_links table
ALTER TABLE public.booking_links 
ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS published_slug TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS published_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS published_version INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS publish_history JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS user_agency_alias TEXT,
ADD COLUMN IF NOT EXISTS design_settings JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS booking_questions JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS total_bookings INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS conversion_rate NUMERIC DEFAULT 0;

-- Add indexes for publishing fields
CREATE INDEX IF NOT EXISTS idx_booking_links_published_slug ON public.booking_links(published_slug);
CREATE INDEX IF NOT EXISTS idx_booking_links_is_published ON public.booking_links(is_published);
CREATE INDEX IF NOT EXISTS idx_booking_links_published_at ON public.booking_links(published_at);

-- Create meeting bookings table to track individual bookings
CREATE TABLE IF NOT EXISTS public.meeting_bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_link_id UUID REFERENCES public.booking_links(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  meeting_type TEXT DEFAULT 'phone',
  duration_minutes INTEGER NOT NULL,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'UTC',
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'cancelled', 'completed', 'no_show')),
  meeting_url TEXT,
  calendar_event_id TEXT,
  notes TEXT,
  custom_fields JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for meeting_bookings
ALTER TABLE public.meeting_bookings ENABLE ROW LEVEL SECURITY;

-- Create meeting analytics table
CREATE TABLE IF NOT EXISTS public.meeting_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_link_id UUID REFERENCES public.booking_links(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  total_bookings INTEGER DEFAULT 0,
  confirmed_bookings INTEGER DEFAULT 0,
  completed_bookings INTEGER DEFAULT 0,
  cancelled_bookings INTEGER DEFAULT 0,
  no_shows INTEGER DEFAULT 0,
  conversion_rate NUMERIC DEFAULT 0,
  show_rate NUMERIC DEFAULT 0,
  revenue_generated NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(booking_link_id, date)
);

-- Enable RLS for meeting_analytics
ALTER TABLE public.meeting_analytics ENABLE ROW LEVEL SECURITY;

-- Update RLS policies for booking_links to include published access
DROP POLICY IF EXISTS "Users can view agency booking_links" ON public.booking_links;
DROP POLICY IF EXISTS "Anyone can view active booking links" ON public.booking_links;

CREATE POLICY "Anyone can view published booking links" 
  ON public.booking_links FOR SELECT 
  USING (is_published = true);

CREATE POLICY "Users can view agency booking_links"
  ON public.booking_links FOR SELECT
  USING (
    agency_id = current_setting('app.current_agency_id')::uuid 
    OR user_id = auth.uid()
  );

CREATE POLICY "Users can insert agency booking_links"
  ON public.booking_links FOR INSERT
  WITH CHECK (
    agency_id = current_setting('app.current_agency_id')::uuid 
    OR user_id = auth.uid()
  );

CREATE POLICY "Users can update agency booking_links"
  ON public.booking_links FOR UPDATE
  USING (
    agency_id = current_setting('app.current_agency_id')::uuid 
    OR user_id = auth.uid()
  );

CREATE POLICY "Users can delete agency booking_links"
  ON public.booking_links FOR DELETE
  USING (
    agency_id = current_setting('app.current_agency_id')::uuid 
    OR user_id = auth.uid()
  );

-- RLS policies for meeting_bookings
CREATE POLICY "Users can view own meeting bookings" ON public.meeting_bookings
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Agency can view meeting bookings" ON public.meeting_bookings
  FOR SELECT USING (
    booking_link_id IN (
      SELECT id FROM booking_links 
      WHERE agency_id = current_setting('app.current_agency_id')::uuid
    )
  );

CREATE POLICY "Users can insert meeting bookings" ON public.meeting_bookings
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own meeting bookings" ON public.meeting_bookings
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Agency can update meeting bookings" ON public.meeting_bookings
  FOR UPDATE USING (
    booking_link_id IN (
      SELECT id FROM booking_links 
      WHERE agency_id = current_setting('app.current_agency_id')::uuid
    )
  );

-- RLS policies for meeting_analytics
CREATE POLICY "Users can view own meeting analytics" ON public.meeting_analytics
  FOR SELECT USING (
    booking_link_id IN (
      SELECT id FROM booking_links 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Agency can view meeting analytics" ON public.meeting_analytics
  FOR SELECT USING (
    booking_link_id IN (
      SELECT id FROM booking_links 
      WHERE agency_id = current_setting('app.current_agency_id')::uuid
    )
  );

CREATE POLICY "Users can insert meeting analytics" ON public.meeting_analytics
  FOR INSERT WITH CHECK (
    booking_link_id IN (
      SELECT id FROM booking_links 
      WHERE user_id = auth.uid()
    )
  );

-- Function to update booking link statistics
CREATE OR REPLACE FUNCTION update_booking_link_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update total bookings count
  UPDATE public.booking_links 
  SET 
    total_bookings = (
      SELECT COUNT(*) 
      FROM public.meeting_bookings 
      WHERE booking_link_id = NEW.booking_link_id
    ),
    conversion_rate = CASE 
      WHEN (
        SELECT COUNT(*) 
        FROM public.meeting_bookings 
        WHERE booking_link_id = NEW.booking_link_id
      ) > 0 
      THEN (
        SELECT COUNT(*) * 100.0 / (
          SELECT COUNT(*) 
          FROM public.meeting_bookings 
          WHERE booking_link_id = NEW.booking_link_id
        )
        FROM public.meeting_bookings 
        WHERE booking_link_id = NEW.booking_link_id 
        AND status IN ('completed', 'confirmed')
      ) 
      ELSE 0 
    END,
    updated_at = now()
  WHERE id = NEW.booking_link_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update stats
DROP TRIGGER IF EXISTS trigger_update_booking_link_stats ON public.meeting_bookings;
CREATE TRIGGER trigger_update_booking_link_stats
  AFTER INSERT OR UPDATE OR DELETE ON public.meeting_bookings
  FOR EACH ROW EXECUTE FUNCTION update_booking_link_stats();

-- Function to generate unique slug for published booking links
CREATE OR REPLACE FUNCTION generate_unique_booking_slug(base_slug TEXT)
RETURNS TEXT AS $$
DECLARE
  new_slug TEXT;
  counter INTEGER := 1;
BEGIN
  new_slug := base_slug;
  
  -- Check if slug exists and generate unique one
  WHILE EXISTS (SELECT 1 FROM public.booking_links WHERE published_slug = new_slug) LOOP
    new_slug := base_slug || '-' || counter;
    counter := counter + 1;
  END LOOP;
  
  RETURN new_slug;
END;
$$ LANGUAGE plpgsql;

RAISE NOTICE '✅ Meetings publishing system migration completed';
RAISE NOTICE '   - Added publishing fields to booking_links';
RAISE NOTICE '   - Created meeting_bookings table';
RAISE NOTICE '   - Created meeting_analytics table';
RAISE NOTICE '   - Updated RLS policies';
RAISE NOTICE '   - Created triggers and functions';