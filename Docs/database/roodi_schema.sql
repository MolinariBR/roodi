-- Roodi Database Contract (PostgreSQL)
-- Version: 1.0.0
-- Date: 2026-02-14
-- Source of truth: Docs/01..09, Docs/openapi/roodi.openapi.yaml, Docs/API-INFINITY-PAY.md

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
DO $$ BEGIN CREATE TYPE user_role AS ENUM ('admin', 'commerce', 'rider'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE user_status AS ENUM ('active', 'suspended', 'blocked', 'pending_verification'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE auth_identity_provider AS ENUM ('local', 'google', 'facebook', 'apple'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE TYPE urgency_type AS ENUM ('padrao', 'urgente', 'agendado'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE order_status AS ENUM (
  'created',
  'searching_rider',
  'rider_assigned',
  'to_merchant',
  'at_merchant',
  'waiting_order',
  'to_customer',
  'at_customer',
  'finishing_delivery',
  'completed',
  'canceled'
); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE tracking_event_type AS ENUM (
  'order_created',
  'rider_assigned',
  'rider_accepted',
  'rider_to_merchant',
  'rider_at_merchant',
  'waiting_order',
  'rider_to_customer',
  'rider_at_customer',
  'finishing_delivery',
  'completed',
  'canceled'
); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE order_confirmation_status AS ENUM ('not_generated', 'generated', 'validated'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE dispatch_offer_decision AS ENUM ('pending', 'accepted', 'rejected', 'no_response', 'expired'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE TYPE ticket_status AS ENUM ('open', 'in_progress', 'resolved', 'closed'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE ticket_priority AS ENUM ('low', 'medium', 'high', 'urgent'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE TYPE payment_provider AS ENUM ('infinitepay'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE payment_status AS ENUM ('pending', 'approved', 'failed', 'canceled'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE payment_capture_method AS ENUM ('pix', 'credit_card'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE TYPE product_status AS ENUM ('active', 'paused', 'hidden'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE credit_entry_type AS ENUM ('credit', 'debit', 'reservation', 'release', 'adjustment'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE TYPE notification_channel AS ENUM ('in_app', 'push'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE TYPE rider_vehicle_type AS ENUM ('bicicleta', 'moto', 'carro'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE rider_document_type AS ENUM ('rg', 'cnh', 'cpf', 'residence_proof', 'vehicle_proof'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE bank_account_type AS ENUM ('corrente', 'poupanca'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE TYPE lead_type AS ENUM ('commerce', 'rider', 'partnership', 'other'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE legal_document_type AS ENUM ('termos', 'privacidade', 'cookies'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---------------------------------------------------------------------------
-- Core identity / auth
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role user_role NOT NULL,
  status user_status NOT NULL DEFAULT 'active',
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  password_hash TEXT,
  phone_number TEXT,
  whatsapp TEXT,
  profile_picture_url TEXT,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_users_email UNIQUE (email),
  CONSTRAINT ck_users_email_lower CHECK (email = lower(email))
);

CREATE TABLE IF NOT EXISTS user_identities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider auth_identity_provider NOT NULL,
  provider_user_id TEXT NOT NULL,
  provider_email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_user_identity_provider UNIQUE (provider, provider_user_id),
  CONSTRAINT uq_user_identity_per_user UNIQUE (user_id, provider)
);

CREATE TABLE IF NOT EXISTS auth_refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  jti TEXT NOT NULL,
  token_hash TEXT NOT NULL,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  revoked_reason TEXT,
  user_agent TEXT,
  ip_address INET,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_auth_refresh_jti UNIQUE (jti)
);

CREATE INDEX IF NOT EXISTS idx_auth_refresh_user_expires ON auth_refresh_tokens (user_id, expires_at DESC);
CREATE INDEX IF NOT EXISTS idx_auth_refresh_active ON auth_refresh_tokens (user_id, revoked_at) WHERE revoked_at IS NULL;

CREATE TABLE IF NOT EXISTS auth_otp_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  otp_hash TEXT NOT NULL,
  challenge_type TEXT NOT NULL DEFAULT 'password_reset',
  max_attempts SMALLINT NOT NULL DEFAULT 5,
  attempts SMALLINT NOT NULL DEFAULT 0,
  resend_count SMALLINT NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ NOT NULL,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT ck_auth_otp_attempts_non_negative CHECK (attempts >= 0),
  CONSTRAINT ck_auth_otp_max_attempts_positive CHECK (max_attempts > 0)
);

CREATE INDEX IF NOT EXISTS idx_auth_otp_email ON auth_otp_challenges (email, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_auth_otp_expires ON auth_otp_challenges (expires_at);

CREATE TABLE IF NOT EXISTS auth_otp_attempts (
  id BIGSERIAL PRIMARY KEY,
  challenge_id UUID NOT NULL REFERENCES auth_otp_challenges(id) ON DELETE CASCADE,
  attempted_code TEXT,
  success BOOLEAN NOT NULL,
  ip_address INET,
  user_agent TEXT,
  attempted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_auth_otp_attempts_challenge ON auth_otp_attempts (challenge_id, attempted_at DESC);

-- ---------------------------------------------------------------------------
-- User profile domain (users)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS rider_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  rider_code TEXT NOT NULL,
  rank_level TEXT,
  rating NUMERIC(4,2) DEFAULT 0,
  completed_deliveries INTEGER NOT NULL DEFAULT 0,
  online_minutes_total INTEGER NOT NULL DEFAULT 0,
  is_online BOOLEAN NOT NULL DEFAULT FALSE,
  cooldown_until TIMESTAMPTZ,
  last_status_change_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_rider_profiles_code UNIQUE (rider_code),
  CONSTRAINT ck_rider_profiles_rating CHECK (rating >= 0 AND rating <= 5)
);

CREATE TABLE IF NOT EXISTS commerce_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  commerce_code TEXT NOT NULL,
  trade_name TEXT NOT NULL,
  legal_name TEXT,
  tax_id TEXT,
  rank_level TEXT,
  rating NUMERIC(4,2) DEFAULT 0,
  is_open BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_commerce_profiles_code UNIQUE (commerce_code)
);

CREATE TABLE IF NOT EXISTS user_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  address_type TEXT NOT NULL,
  cep TEXT,
  state TEXT,
  city TEXT,
  neighborhood TEXT,
  street TEXT,
  number TEXT,
  complement TEXT,
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_addresses_user ON user_addresses (user_id, address_type);

CREATE TABLE IF NOT EXISTS user_bank_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  bank_name TEXT,
  agency TEXT,
  account TEXT,
  account_type bank_account_type,
  pix_key TEXT,
  is_primary BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_bank_accounts_user ON user_bank_accounts (user_id, is_primary DESC);

CREATE TABLE IF NOT EXISTS rider_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rider_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  document_type rider_document_type NOT NULL,
  document_number TEXT,
  file_url TEXT,
  validation_status TEXT NOT NULL DEFAULT 'pending',
  validated_by_user_id UUID REFERENCES users(id),
  validated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rider_documents_user_type ON rider_documents (rider_user_id, document_type);

CREATE TABLE IF NOT EXISTS rider_vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rider_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vehicle_type rider_vehicle_type NOT NULL,
  brand TEXT,
  model TEXT,
  vehicle_year INTEGER,
  plate TEXT,
  validation_status TEXT NOT NULL DEFAULT 'pending',
  is_primary BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rider_vehicles_user ON rider_vehicles (rider_user_id, is_primary DESC);

-- ---------------------------------------------------------------------------
-- System domain
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS system_flags (
  flag_key TEXT PRIMARY KEY,
  enabled BOOLEAN NOT NULL,
  description TEXT,
  updated_by_user_id UUID REFERENCES users(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS system_runtime_state (
  singleton_id SMALLINT PRIMARY KEY DEFAULT 1,
  maintenance_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  maintenance_message TEXT,
  expected_back_at TIMESTAMPTZ,
  min_supported_app_version TEXT,
  force_update_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  updated_by_user_id UUID REFERENCES users(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT ck_system_runtime_singleton CHECK (singleton_id = 1)
);

CREATE TABLE IF NOT EXISTS system_runtime_history (
  id BIGSERIAL PRIMARY KEY,
  maintenance_enabled BOOLEAN NOT NULL,
  maintenance_message TEXT,
  expected_back_at TIMESTAMPTZ,
  min_supported_app_version TEXT,
  force_update_enabled BOOLEAN NOT NULL,
  updated_by_user_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- Locality + pricing domain
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS locality_bairros (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  name TEXT NOT NULL,
  normalized_name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_locality_bairro UNIQUE (city, state, normalized_name)
);

CREATE TABLE IF NOT EXISTS locality_bairro_matrix (
  id BIGSERIAL PRIMARY KEY,
  origin_bairro_id UUID NOT NULL REFERENCES locality_bairros(id) ON DELETE CASCADE,
  destination_bairro_id UUID NOT NULL REFERENCES locality_bairros(id) ON DELETE CASCADE,
  distance_m INTEGER NOT NULL,
  duration_s INTEGER NOT NULL,
  source_provider TEXT NOT NULL DEFAULT 'local_bairro_matrix',
  source_metadata JSONB,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_locality_matrix_pair UNIQUE (origin_bairro_id, destination_bairro_id),
  CONSTRAINT ck_locality_matrix_distance_positive CHECK (distance_m > 0),
  CONSTRAINT ck_locality_matrix_duration_positive CHECK (duration_s > 0)
);

CREATE INDEX IF NOT EXISTS idx_locality_matrix_origin ON locality_bairro_matrix (origin_bairro_id);
CREATE INDEX IF NOT EXISTS idx_locality_matrix_destination ON locality_bairro_matrix (destination_bairro_id);

CREATE TABLE IF NOT EXISTS pricing_rule_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version_code TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT FALSE,
  effective_from TIMESTAMPTZ NOT NULL,
  effective_to TIMESTAMPTZ,
  minimum_charge_brl NUMERIC(10,2) NOT NULL,
  max_distance_km NUMERIC(5,2) NOT NULL,
  notes TEXT,
  created_by_user_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_pricing_rule_version_code UNIQUE (version_code),
  CONSTRAINT ck_pricing_rule_minimum_non_negative CHECK (minimum_charge_brl >= 0),
  CONSTRAINT ck_pricing_rule_max_distance_positive CHECK (max_distance_km > 0)
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_pricing_active_rule ON pricing_rule_versions (is_active) WHERE is_active = TRUE;

CREATE TABLE IF NOT EXISTS pricing_zone_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_version_id UUID NOT NULL REFERENCES pricing_rule_versions(id) ON DELETE CASCADE,
  zone SMALLINT NOT NULL,
  min_km NUMERIC(5,2) NOT NULL,
  max_km NUMERIC(5,2) NOT NULL,
  base_value_brl NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_pricing_zone_by_version UNIQUE (rule_version_id, zone),
  CONSTRAINT ck_pricing_zone_range CHECK (min_km <= max_km),
  CONSTRAINT ck_pricing_zone_value_non_negative CHECK (base_value_brl >= 0)
);

CREATE TABLE IF NOT EXISTS pricing_urgency_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_version_id UUID NOT NULL REFERENCES pricing_rule_versions(id) ON DELETE CASCADE,
  urgency urgency_type NOT NULL,
  addon_brl NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_pricing_urgency_by_version UNIQUE (rule_version_id, urgency)
);

CREATE TABLE IF NOT EXISTS pricing_conditional_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_version_id UUID NOT NULL REFERENCES pricing_rule_versions(id) ON DELETE CASCADE,
  condition_key TEXT NOT NULL,
  addon_brl NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_pricing_conditional_by_version UNIQUE (rule_version_id, condition_key),
  CONSTRAINT ck_pricing_conditional_key CHECK (condition_key IN ('sunday', 'holiday', 'rain', 'peak'))
);

CREATE TABLE IF NOT EXISTS pricing_peak_windows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_version_id UUID NOT NULL REFERENCES pricing_rule_versions(id) ON DELETE CASCADE,
  start_hour SMALLINT NOT NULL,
  end_hour SMALLINT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT ck_pricing_peak_hour CHECK (start_hour BETWEEN 0 AND 23 AND end_hour BETWEEN 0 AND 23)
);

CREATE TABLE IF NOT EXISTS pricing_holidays (
  holiday_date DATE PRIMARY KEY,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  commerce_user_id UUID NOT NULL REFERENCES users(id),
  origin_bairro_id UUID NOT NULL REFERENCES locality_bairros(id),
  destination_bairro_id UUID NOT NULL REFERENCES locality_bairros(id),
  urgency urgency_type NOT NULL,
  requested_at_iso TIMESTAMPTZ NOT NULL,
  distance_m INTEGER,
  duration_s INTEGER,
  eta_min INTEGER,
  zone SMALLINT,
  base_zone_brl NUMERIC(10,2),
  urgency_brl NUMERIC(10,2),
  sunday_brl NUMERIC(10,2),
  holiday_brl NUMERIC(10,2),
  rain_brl NUMERIC(10,2),
  peak_brl NUMERIC(10,2),
  total_brl NUMERIC(10,2),
  is_raining BOOLEAN,
  climate_source TEXT,
  climate_confidence TEXT,
  distance_time_provider TEXT,
  climate_provider TEXT,
  fallback_used BOOLEAN,
  distance_time_latency_ms INTEGER,
  climate_latency_ms INTEGER,
  success BOOLEAN NOT NULL DEFAULT TRUE,
  error_code TEXT,
  error_message TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT ck_quotes_distance_positive CHECK (distance_m IS NULL OR distance_m > 0),
  CONSTRAINT ck_quotes_duration_positive CHECK (duration_s IS NULL OR duration_s > 0)
);

CREATE INDEX IF NOT EXISTS idx_quotes_commerce_created ON quotes (commerce_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quotes_origin_destination ON quotes (origin_bairro_id, destination_bairro_id);

CREATE TABLE IF NOT EXISTS quote_provider_attempts (
  id BIGSERIAL PRIMARY KEY,
  quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  domain_key TEXT NOT NULL CHECK (domain_key IN ('distance_time', 'climate')),
  provider_id TEXT NOT NULL,
  attempt_no SMALLINT NOT NULL,
  success BOOLEAN NOT NULL,
  latency_ms INTEGER,
  error_code TEXT,
  response_sample JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_quote_attempt UNIQUE (quote_id, domain_key, provider_id, attempt_no)
);

CREATE INDEX IF NOT EXISTS idx_quote_attempts_quote ON quote_provider_attempts (quote_id, domain_key, attempt_no);

-- ---------------------------------------------------------------------------
-- Commerce domain
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS commerce_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  commerce_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  email TEXT,
  cep TEXT,
  state TEXT,
  city TEXT,
  neighborhood TEXT,
  street TEXT,
  number TEXT,
  complement TEXT,
  notes TEXT,
  last_order_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_commerce_clients_owner ON commerce_clients (commerce_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_commerce_clients_search ON commerce_clients (commerce_user_id, name, phone_number);

CREATE TABLE IF NOT EXISTS commerce_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  commerce_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price_brl NUMERIC(10,2) NOT NULL,
  stock INTEGER,
  sold_count INTEGER NOT NULL DEFAULT 0,
  status product_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT ck_commerce_products_price_non_negative CHECK (price_brl >= 0),
  CONSTRAINT ck_commerce_products_stock_non_negative CHECK (stock IS NULL OR stock >= 0)
);

CREATE INDEX IF NOT EXISTS idx_commerce_products_owner ON commerce_products (commerce_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_commerce_products_status ON commerce_products (commerce_user_id, status);

-- ---------------------------------------------------------------------------
-- Orders + dispatch + tracking domain
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_code TEXT NOT NULL,
  commerce_user_id UUID NOT NULL REFERENCES users(id),
  rider_user_id UUID REFERENCES users(id),
  client_id UUID REFERENCES commerce_clients(id),
  quote_id UUID REFERENCES quotes(id),
  status order_status NOT NULL,
  urgency urgency_type NOT NULL,
  origin_bairro_id UUID REFERENCES locality_bairros(id),
  destination_bairro_id UUID REFERENCES locality_bairros(id),
  recipient_name TEXT,
  recipient_phone TEXT,
  destination_cep TEXT,
  destination_state TEXT,
  destination_city TEXT,
  destination_neighborhood TEXT,
  destination_street TEXT,
  destination_number TEXT,
  destination_complement TEXT,
  notes TEXT,
  distance_m INTEGER,
  duration_s INTEGER,
  eta_min INTEGER,
  zone SMALLINT,
  base_zone_brl NUMERIC(10,2),
  urgency_brl NUMERIC(10,2),
  sunday_brl NUMERIC(10,2),
  holiday_brl NUMERIC(10,2),
  rain_brl NUMERIC(10,2),
  peak_brl NUMERIC(10,2),
  total_brl NUMERIC(10,2),
  confirmation_code_required BOOLEAN NOT NULL DEFAULT TRUE,
  confirmation_code_status order_confirmation_status NOT NULL DEFAULT 'not_generated',
  payment_status payment_status NOT NULL DEFAULT 'pending',
  payment_required BOOLEAN NOT NULL DEFAULT TRUE,
  payment_confirmed_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,
  cancel_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_orders_code UNIQUE (order_code),
  CONSTRAINT ck_orders_distance_positive CHECK (distance_m IS NULL OR distance_m > 0),
  CONSTRAINT ck_orders_duration_positive CHECK (duration_s IS NULL OR duration_s > 0),
  CONSTRAINT ck_orders_total_non_negative CHECK (total_brl IS NULL OR total_brl >= 0)
);

CREATE INDEX IF NOT EXISTS idx_orders_commerce_status_created ON orders (commerce_user_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_rider_status_created ON orders (rider_user_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status_created ON orders (payment_status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status_created ON orders (status, created_at DESC);

CREATE TABLE IF NOT EXISTS order_product_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES commerce_products(id),
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price_brl NUMERIC(10,2) NOT NULL,
  total_price_brl NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT ck_order_product_snapshot_qty_positive CHECK (quantity > 0)
);

CREATE INDEX IF NOT EXISTS idx_order_product_snapshots_order ON order_product_snapshots (order_id);

CREATE TABLE IF NOT EXISTS order_status_transitions (
  from_status order_status NOT NULL,
  to_status order_status NOT NULL,
  PRIMARY KEY (from_status, to_status)
);

CREATE TABLE IF NOT EXISTS order_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  event_type tracking_event_type NOT NULL,
  actor_user_id UUID REFERENCES users(id),
  actor_role user_role,
  note TEXT,
  payload JSONB,
  occurred_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_events_order_time ON order_events (order_id, occurred_at ASC);
CREATE INDEX IF NOT EXISTS idx_order_events_type_time ON order_events (event_type, occurred_at DESC);

CREATE TABLE IF NOT EXISTS dispatch_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  zone_label TEXT,
  batch_number INTEGER NOT NULL,
  top_limit SMALLINT NOT NULL,
  opened_at TIMESTAMPTZ NOT NULL,
  closed_at TIMESTAMPTZ,
  winner_offer_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_dispatch_batch_order_number UNIQUE (order_id, batch_number),
  CONSTRAINT ck_dispatch_top_limit_positive CHECK (top_limit > 0)
);

CREATE TABLE IF NOT EXISTS dispatch_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID NOT NULL REFERENCES dispatch_batches(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  rider_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  position_in_queue INTEGER,
  offered_at TIMESTAMPTZ NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  decision dispatch_offer_decision NOT NULL DEFAULT 'pending',
  decision_reason TEXT,
  decided_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT ck_dispatch_offer_expiration CHECK (expires_at > offered_at)
);

CREATE INDEX IF NOT EXISTS idx_dispatch_offers_order ON dispatch_offers (order_id, offered_at DESC);
CREATE INDEX IF NOT EXISTS idx_dispatch_offers_rider ON dispatch_offers (rider_user_id, offered_at DESC);

ALTER TABLE dispatch_batches
  ADD CONSTRAINT fk_dispatch_batches_winner_offer
  FOREIGN KEY (winner_offer_id) REFERENCES dispatch_offers(id);

CREATE TABLE IF NOT EXISTS order_confirmation_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
  code_hash TEXT NOT NULL,
  code_last4 TEXT,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  attempts_count SMALLINT NOT NULL DEFAULT 0,
  max_attempts SMALLINT NOT NULL DEFAULT 5,
  validated_at TIMESTAMPTZ,
  validated_by_rider_user_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT ck_order_confirmation_max_attempts_positive CHECK (max_attempts > 0),
  CONSTRAINT ck_order_confirmation_attempts_non_negative CHECK (attempts_count >= 0)
);

CREATE INDEX IF NOT EXISTS idx_order_confirmation_order ON order_confirmation_codes (order_id);

-- ---------------------------------------------------------------------------
-- Credits + payments domain
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS credits_wallets (
  commerce_user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  balance_brl NUMERIC(12,2) NOT NULL DEFAULT 0,
  reserved_brl NUMERIC(12,2) NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT ck_credits_wallet_non_negative CHECK (balance_brl >= 0 AND reserved_brl >= 0),
  CONSTRAINT ck_credits_wallet_reserved_lte_balance CHECK (reserved_brl <= balance_brl)
);

CREATE TABLE IF NOT EXISTS credits_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  commerce_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id),
  entry_type credit_entry_type NOT NULL,
  amount_brl NUMERIC(12,2) NOT NULL,
  balance_after_brl NUMERIC(12,2) NOT NULL,
  reference_type TEXT,
  reference_id UUID,
  reason TEXT,
  created_by_user_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT ck_credits_ledger_amount_non_zero CHECK (amount_brl <> 0)
);

CREATE INDEX IF NOT EXISTS idx_credits_ledger_commerce_time ON credits_ledger (commerce_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_credits_ledger_order ON credits_ledger (order_id);

CREATE TABLE IF NOT EXISTS payment_intents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  commerce_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  provider payment_provider NOT NULL DEFAULT 'infinitepay',
  purpose TEXT NOT NULL DEFAULT 'credit_purchase',
  status payment_status NOT NULL DEFAULT 'pending',
  amount_brl NUMERIC(12,2) NOT NULL,
  amount_cents INTEGER NOT NULL,
  provider_handle TEXT NOT NULL,
  order_nsu TEXT NOT NULL,
  checkout_url TEXT,
  redirect_url TEXT,
  webhook_url TEXT,
  request_payload JSONB,
  response_payload JSONB,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_payment_intents_order_nsu UNIQUE (order_nsu),
  CONSTRAINT ck_payment_intents_amount_positive CHECK (amount_brl > 0 AND amount_cents > 0)
);

CREATE INDEX IF NOT EXISTS idx_payment_intents_commerce ON payment_intents (commerce_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payment_intents_order ON payment_intents (order_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payment_intents_status ON payment_intents (status, created_at DESC);

CREATE TABLE IF NOT EXISTS payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_intent_id UUID NOT NULL REFERENCES payment_intents(id) ON DELETE CASCADE,
  provider payment_provider NOT NULL,
  status payment_status NOT NULL,
  invoice_slug TEXT,
  transaction_nsu TEXT,
  capture_method payment_capture_method,
  amount_cents INTEGER NOT NULL,
  paid_amount_cents INTEGER,
  installments INTEGER,
  receipt_url TEXT,
  provider_payload JSONB,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_payment_transactions_nsu UNIQUE (provider, transaction_nsu)
);

CREATE INDEX IF NOT EXISTS idx_payment_transactions_intent ON payment_transactions (payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions (status, created_at DESC);

CREATE TABLE IF NOT EXISTS payment_webhook_events (
  id BIGSERIAL PRIMARY KEY,
  provider payment_provider NOT NULL,
  event_key TEXT NOT NULL DEFAULT 'payment.approved',
  invoice_slug TEXT,
  transaction_nsu TEXT,
  order_nsu TEXT,
  idempotency_key TEXT NOT NULL,
  payload JSONB NOT NULL,
  processing_status TEXT NOT NULL DEFAULT 'received',
  error_message TEXT,
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  CONSTRAINT uq_payment_webhook_idempotency UNIQUE (idempotency_key)
);

CREATE INDEX IF NOT EXISTS idx_payment_webhook_order_nsu ON payment_webhook_events (order_nsu, received_at DESC);

CREATE TABLE IF NOT EXISTS order_financials (
  order_id UUID PRIMARY KEY REFERENCES orders(id) ON DELETE CASCADE,
  freight_platform_brl NUMERIC(12,2) NOT NULL,
  rider_repass_brl NUMERIC(12,2) NOT NULL,
  platform_commission_brl NUMERIC(12,2) NOT NULL,
  charged_at TIMESTAMPTZ,
  repass_status TEXT NOT NULL DEFAULT 'pending',
  repass_paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT ck_order_financials_formula CHECK (freight_platform_brl = rider_repass_brl + platform_commission_brl)
);

CREATE TABLE IF NOT EXISTS rider_wallets (
  rider_user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  balance_brl NUMERIC(12,2) NOT NULL DEFAULT 0,
  pending_brl NUMERIC(12,2) NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT ck_rider_wallet_non_negative CHECK (balance_brl >= 0 AND pending_brl >= 0)
);

CREATE TABLE IF NOT EXISTS rider_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rider_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id),
  entry_type TEXT NOT NULL,
  amount_brl NUMERIC(12,2) NOT NULL,
  balance_after_brl NUMERIC(12,2) NOT NULL,
  reference_type TEXT,
  reference_id UUID,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT ck_rider_ledger_amount_non_zero CHECK (amount_brl <> 0)
);

CREATE INDEX IF NOT EXISTS idx_rider_ledger_rider_time ON rider_ledger (rider_user_id, created_at DESC);

-- ---------------------------------------------------------------------------
-- Notifications domain
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notification_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_key TEXT NOT NULL,
  channel notification_channel NOT NULL,
  title_template TEXT NOT NULL,
  body_template TEXT NOT NULL,
  template_version INTEGER NOT NULL DEFAULT 1,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  updated_by_user_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_notification_template_version UNIQUE (event_key, channel, template_version)
);

CREATE TABLE IF NOT EXISTS user_notification_settings (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  delivery BOOLEAN NOT NULL DEFAULT TRUE,
  payment BOOLEAN NOT NULL DEFAULT TRUE,
  promotions BOOLEAN NOT NULL DEFAULT FALSE,
  app_updates BOOLEAN NOT NULL DEFAULT TRUE,
  security BOOLEAN NOT NULL DEFAULT TRUE,
  support BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_key TEXT,
  channel notification_channel NOT NULL DEFAULT 'in_app',
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  payload JSONB,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_created ON notifications (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications (user_id, read_at);

-- ---------------------------------------------------------------------------
-- Support domain
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS support_faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  updated_by_user_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by_user_id UUID NOT NULL REFERENCES users(id),
  order_id UUID REFERENCES orders(id),
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  status ticket_status NOT NULL DEFAULT 'open',
  priority ticket_priority NOT NULL DEFAULT 'medium',
  assigned_to_user_id UUID REFERENCES users(id),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets (status, priority, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_support_tickets_creator ON support_tickets (created_by_user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS support_ticket_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  author_user_id UUID NOT NULL REFERENCES users(id),
  message TEXT NOT NULL,
  internal_note BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_support_ticket_messages_ticket ON support_ticket_messages (ticket_id, created_at ASC);

-- ---------------------------------------------------------------------------
-- Public (landing) domain
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_type lead_type NOT NULL,
  name TEXT NOT NULL,
  contact TEXT NOT NULL,
  message TEXT,
  source TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS legal_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doc_type legal_document_type NOT NULL,
  version TEXT NOT NULL,
  content TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT FALSE,
  updated_by_user_id UUID REFERENCES users(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_legal_documents_version UNIQUE (doc_type, version)
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_legal_documents_active ON legal_documents (doc_type, is_active) WHERE is_active = TRUE;

-- ---------------------------------------------------------------------------
-- Cross-cutting audit / observability
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGSERIAL PRIMARY KEY,
  request_id TEXT,
  actor_user_id UUID REFERENCES users(id),
  actor_role user_role,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  before_data JSONB,
  after_data JSONB,
  metadata JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs (entity_type, entity_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs (actor_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_request ON audit_logs (request_id);

COMMIT;
