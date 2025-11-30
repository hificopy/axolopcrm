-- Affiliate System Database Schema for Axolop CRM
-- Run this in your Supabase SQL Editor

-- ================================
-- 1. AFFILIATES TABLE
-- ================================
CREATE TABLE IF NOT EXISTS affiliates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referral_code VARCHAR(20) UNIQUE NOT NULL,
  commission_rate DECIMAL(5,2) DEFAULT 40.00,
  total_referrals INT DEFAULT 0,
  successful_referrals INT DEFAULT 0,
  total_earnings DECIMAL(10,2) DEFAULT 0.00,
  pending_earnings DECIMAL(10,2) DEFAULT 0.00,
  paid_earnings DECIMAL(10,2) DEFAULT 0.00,
  payment_method VARCHAR(50),
  payment_email VARCHAR(255),
  payment_details JSONB,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ================================
-- 2. AFFILIATE CLICKS TABLE
-- ================================
CREATE TABLE IF NOT EXISTS affiliate_clicks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  affiliate_id UUID NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
  referral_code VARCHAR(20) NOT NULL,
  ip_address INET,
  user_agent TEXT,
  referer_url TEXT,
  landing_page TEXT,
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),
  utm_content VARCHAR(100),
  utm_term VARCHAR(100),
  clicked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_affiliate_clicks
    FOREIGN KEY (affiliate_id)
    REFERENCES affiliates(id)
    ON DELETE CASCADE
);

-- ================================
-- 3. AFFILIATE REFERRALS TABLE
-- ================================
CREATE TABLE IF NOT EXISTS affiliate_referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  affiliate_id UUID NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
  referred_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referral_code VARCHAR(20) NOT NULL,
  ip_address INET,
  user_agent TEXT,
  source_url TEXT,
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),
  status VARCHAR(20) DEFAULT 'trial',
  conversion_date TIMESTAMP WITH TIME ZONE,
  trial_start_date TIMESTAMP WITH TIME ZONE,
  trial_end_date TIMESTAMP WITH TIME ZONE,
  first_payment_date TIMESTAMP WITH TIME ZONE,
  subscription_id VARCHAR(100),
  customer_lifetime_value DECIMAL(10,2) DEFAULT 0.00,
  total_commission_earned DECIMAL(10,2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_affiliate_referrals
    FOREIGN KEY (affiliate_id)
    REFERENCES affiliates(id)
    ON DELETE CASCADE
);

-- ================================
-- 4. AFFILIATE COMMISSIONS TABLE
-- ================================
CREATE TABLE IF NOT EXISTS affiliate_commissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  affiliate_id UUID NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
  referral_id UUID REFERENCES affiliate_referrals(id) ON DELETE SET NULL,
  type VARCHAR(50) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  subscription_id VARCHAR(100),
  payment_period_start TIMESTAMP WITH TIME ZONE,
  payment_period_end TIMESTAMP WITH TIME ZONE,
  description TEXT,
  metadata JSONB,
  paid_at TIMESTAMP WITH TIME ZONE,
  payout_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_affiliate_commissions
    FOREIGN KEY (affiliate_id)
    REFERENCES affiliates(id)
    ON DELETE CASCADE
);

-- ================================
-- 5. AFFILIATE PAYOUTS TABLE
-- ================================
CREATE TABLE IF NOT EXISTS affiliate_payouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  affiliate_id UUID NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  payment_method VARCHAR(50),
  transaction_id VARCHAR(100),
  notes TEXT,
  processed_by UUID REFERENCES auth.users(id),
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_affiliate_payouts
    FOREIGN KEY (affiliate_id)
    REFERENCES affiliates(id)
    ON DELETE CASCADE
);

-- ================================
-- 6. AFFILIATE MATERIALS TABLE
-- ================================
CREATE TABLE IF NOT EXISTS affiliate_materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL,
  content TEXT,
  file_url TEXT,
  thumbnail_url TEXT,
  is_active BOOLEAN DEFAULT true,
  download_count INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================
-- INDEXES
-- ================================
CREATE INDEX idx_affiliates_user_id ON affiliates(user_id);
CREATE INDEX idx_affiliates_referral_code ON affiliates(referral_code);
CREATE INDEX idx_affiliate_clicks_affiliate_id ON affiliate_clicks(affiliate_id);
CREATE INDEX idx_affiliate_clicks_clicked_at ON affiliate_clicks(clicked_at);
CREATE INDEX idx_affiliate_referrals_affiliate_id ON affiliate_referrals(affiliate_id);
CREATE INDEX idx_affiliate_referrals_referred_user ON affiliate_referrals(referred_user_id);
CREATE INDEX idx_affiliate_referrals_status ON affiliate_referrals(status);
CREATE INDEX idx_affiliate_commissions_affiliate_id ON affiliate_commissions(affiliate_id);
CREATE INDEX idx_affiliate_commissions_status ON affiliate_commissions(status);
CREATE INDEX idx_affiliate_payouts_affiliate_id ON affiliate_payouts(affiliate_id);
CREATE INDEX idx_affiliate_payouts_status ON affiliate_payouts(status);

-- ================================
-- ROW LEVEL SECURITY (RLS)
-- ================================

-- Enable RLS on all tables
ALTER TABLE affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_materials ENABLE ROW LEVEL SECURITY;

-- Affiliates: Users can only see/update their own affiliate account
CREATE POLICY "Users can view their own affiliate account"
  ON affiliates FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own affiliate account"
  ON affiliates FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own affiliate account"
  ON affiliates FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Affiliate Clicks: Affiliates can view their own clicks
CREATE POLICY "Affiliates can view their own clicks"
  ON affiliate_clicks FOR SELECT
  USING (
    affiliate_id IN (
      SELECT id FROM affiliates WHERE user_id = auth.uid()
    )
  );

-- Allow anonymous users to insert clicks (for tracking)
CREATE POLICY "Allow anonymous click tracking"
  ON affiliate_clicks FOR INSERT
  WITH CHECK (true);

-- Affiliate Referrals: Affiliates can view their own referrals
CREATE POLICY "Affiliates can view their own referrals"
  ON affiliate_referrals FOR SELECT
  USING (
    affiliate_id IN (
      SELECT id FROM affiliates WHERE user_id = auth.uid()
    )
  );

-- Affiliate Commissions: Affiliates can view their own commissions
CREATE POLICY "Affiliates can view their own commissions"
  ON affiliate_commissions FOR SELECT
  USING (
    affiliate_id IN (
      SELECT id FROM affiliates WHERE user_id = auth.uid()
    )
  );

-- Affiliate Payouts: Affiliates can view and create their own payouts
CREATE POLICY "Affiliates can view their own payouts"
  ON affiliate_payouts FOR SELECT
  USING (
    affiliate_id IN (
      SELECT id FROM affiliates WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Affiliates can create payout requests"
  ON affiliate_payouts FOR INSERT
  WITH CHECK (
    affiliate_id IN (
      SELECT id FROM affiliates WHERE user_id = auth.uid()
    )
  );

-- Affiliate Materials: Everyone can view active materials
CREATE POLICY "Everyone can view active materials"
  ON affiliate_materials FOR SELECT
  USING (is_active = true);

-- ================================
-- HELPER FUNCTIONS
-- ================================

-- Function to get pending workflow executions (referenced in automation-engine)
CREATE OR REPLACE FUNCTION get_pending_workflow_executions(p_limit INT DEFAULT 100)
RETURNS TABLE (
  id UUID,
  workflow_id UUID,
  trigger_data JSONB,
  status VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    we.id,
    we.workflow_id,
    we.trigger_data,
    we.status,
    we.created_at
  FROM automation_executions we
  WHERE we.status = 'pending'
  ORDER BY we.created_at ASC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================
-- INITIAL DATA
-- ================================

-- Insert sample marketing materials
INSERT INTO affiliate_materials (title, description, type, content, is_active)
VALUES
  (
    'Email Template: Introduction',
    'Introduce Axolop CRM to your network',
    'email_template',
    E'Subject: I found an amazing CRM that replaces 10+ tools\n\nHey {{name}},\n\nI wanted to share something that''s been a game-changer for my business.\n\nI recently started using Axolop CRM, and it''s replaced GoHighLevel, ClickUp, Notion, and about 7 other tools I was paying for.\n\nWhat makes it special:\n- Built-in AI Second Brain for notes and context\n- Full email marketing automation\n- Calendar scheduling\n- Forms and workflows\n- All for a fraction of what I was paying before\n\nThey''re offering a free trial if you want to check it out: {{affiliate_link}}\n\nLet me know if you have any questions!\n\nBest,\n{{your_name}}',
    true
  ),
  (
    'Social Media Post: LinkedIn',
    'Share on LinkedIn to reach professionals',
    'social_template',
    E'🚀 Just consolidated 10+ tools into one with @AxolopCRM\n\nHere''s what I replaced:\n✅ GoHighLevel → Axolop\n✅ ClickUp → Axolop\n✅ Notion → Axolop (AI Second Brain!)\n✅ Calendly → Axolop\n✅ Typeform → Axolop\n\nThe AI Second Brain feature alone is worth it - it remembers every customer interaction.\n\nIf you''re tired of paying for multiple tools, check it out: {{affiliate_link}}\n\n#CRM #ProductivityTools #AITools',
    true
  ),
  (
    'Blog Post Outline',
    'Write a comprehensive review',
    'content_template',
    E'Title: "How Axolop CRM Replaced 10 Tools and Saved Me $500/Month"\n\nOutline:\n1. The Tool Stack Problem\n   - List all tools you were using\n   - Total monthly cost\n   - Pain points of switching between tools\n\n2. Discovering Axolop\n   - What made you try it\n   - First impressions\n\n3. Key Features That Won Me Over\n   - AI Second Brain\n   - Email marketing\n   - Calendar & scheduling\n   - Form builder\n   - Workflow automation\n\n4. The Migration Process\n   - How long it took\n   - What worked well\n   - Challenges faced\n\n5. Results After 30 Days\n   - Time saved\n   - Money saved\n   - Productivity improvements\n\n6. Who Should Use Axolop\n   - Ideal customer profile\n   - Use cases\n\n7. Conclusion & Special Offer\n   - Your referral link\n   - Current promotion',
    true
  );

-- ================================
-- COMMENTS
-- ================================
COMMENT ON TABLE affiliates IS 'Stores affiliate program participants';
COMMENT ON TABLE affiliate_clicks IS 'Tracks clicks on affiliate links';
COMMENT ON TABLE affiliate_referrals IS 'Tracks users who signed up via affiliate links';
COMMENT ON TABLE affiliate_commissions IS 'Records commission payments earned by affiliates';
COMMENT ON TABLE affiliate_payouts IS 'Tracks payout requests and payments to affiliates';
COMMENT ON TABLE affiliate_materials IS 'Marketing materials and templates for affiliates';
