-- ============================================
-- Add Subscription Fields to Users Table
-- ============================================
-- Run this migration to enable Stripe subscription tracking

-- Add subscription-related columns
ALTER TABLE users
ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(20) DEFAULT 'none',
ADD COLUMN IF NOT EXISTS subscription_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS plan_id VARCHAR(50),
ADD COLUMN IF NOT EXISTS billing_cycle VARCHAR(20),
ADD COLUMN IF NOT EXISTS trial_end_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS subscription_start_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMP;

-- Add indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_subscription_status ON users(subscription_status);
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer ON users(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_users_plan_id ON users(plan_id);

-- Add comments for documentation
COMMENT ON COLUMN users.subscription_status IS 'Subscription status: none, trial, active, canceled, past_due';
COMMENT ON COLUMN users.subscription_id IS 'Stripe subscription ID';
COMMENT ON COLUMN users.stripe_customer_id IS 'Stripe customer ID';
COMMENT ON COLUMN users.plan_id IS 'Plan ID: sales, build, scale';
COMMENT ON COLUMN users.billing_cycle IS 'Billing cycle: monthly, yearly';
COMMENT ON COLUMN users.trial_end_date IS 'When the trial ends (14 days from start)';
COMMENT ON COLUMN users.subscription_start_date IS 'When subscription started';
COMMENT ON COLUMN users.subscription_end_date IS 'When subscription ended (if canceled)';

-- Subscription status values:
-- 'none' - no subscription
-- 'trial' - in 14-day trial
-- 'active' - paying subscriber
-- 'canceled' - subscription canceled
-- 'past_due' - payment failed
