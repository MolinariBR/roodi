-- CreateEnum
CREATE TYPE "auth_identity_provider" AS ENUM ('local', 'google', 'facebook', 'apple');

-- CreateEnum
CREATE TYPE "bank_account_type" AS ENUM ('corrente', 'poupanca');

-- CreateEnum
CREATE TYPE "credit_entry_type" AS ENUM ('credit', 'debit', 'reservation', 'release', 'adjustment');

-- CreateEnum
CREATE TYPE "dispatch_offer_decision" AS ENUM ('pending', 'accepted', 'rejected', 'no_response', 'expired');

-- CreateEnum
CREATE TYPE "lead_type" AS ENUM ('commerce', 'rider', 'partnership', 'other');

-- CreateEnum
CREATE TYPE "legal_document_type" AS ENUM ('termos', 'privacidade', 'cookies');

-- CreateEnum
CREATE TYPE "notification_channel" AS ENUM ('in_app', 'push');

-- CreateEnum
CREATE TYPE "order_confirmation_status" AS ENUM ('not_generated', 'generated', 'validated');

-- CreateEnum
CREATE TYPE "order_status" AS ENUM ('created', 'searching_rider', 'rider_assigned', 'to_merchant', 'at_merchant', 'waiting_order', 'to_customer', 'at_customer', 'finishing_delivery', 'completed', 'canceled');

-- CreateEnum
CREATE TYPE "payment_capture_method" AS ENUM ('pix', 'credit_card');

-- CreateEnum
CREATE TYPE "payment_provider" AS ENUM ('infinitepay');

-- CreateEnum
CREATE TYPE "payment_status" AS ENUM ('pending', 'approved', 'failed', 'canceled');

-- CreateEnum
CREATE TYPE "product_status" AS ENUM ('active', 'paused', 'hidden');

-- CreateEnum
CREATE TYPE "rider_document_type" AS ENUM ('rg', 'cnh', 'cpf', 'residence_proof', 'vehicle_proof');

-- CreateEnum
CREATE TYPE "rider_vehicle_type" AS ENUM ('bicicleta', 'moto', 'carro');

-- CreateEnum
CREATE TYPE "ticket_priority" AS ENUM ('low', 'medium', 'high', 'urgent');

-- CreateEnum
CREATE TYPE "ticket_status" AS ENUM ('open', 'in_progress', 'resolved', 'closed');

-- CreateEnum
CREATE TYPE "tracking_event_type" AS ENUM ('order_created', 'rider_assigned', 'rider_accepted', 'rider_to_merchant', 'rider_at_merchant', 'waiting_order', 'rider_to_customer', 'rider_at_customer', 'finishing_delivery', 'completed', 'canceled');

-- CreateEnum
CREATE TYPE "urgency_type" AS ENUM ('padrao', 'urgente', 'agendado');

-- CreateEnum
CREATE TYPE "user_role" AS ENUM ('admin', 'commerce', 'rider');

-- CreateEnum
CREATE TYPE "user_status" AS ENUM ('active', 'suspended', 'blocked', 'pending_verification');

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" BIGSERIAL NOT NULL,
    "request_id" TEXT,
    "actor_user_id" UUID,
    "actor_role" "user_role",
    "action" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT,
    "before_data" JSONB,
    "after_data" JSONB,
    "metadata" JSONB,
    "ip_address" INET,
    "user_agent" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth_otp_attempts" (
    "id" BIGSERIAL NOT NULL,
    "challenge_id" UUID NOT NULL,
    "attempted_code" TEXT,
    "success" BOOLEAN NOT NULL,
    "ip_address" INET,
    "user_agent" TEXT,
    "attempted_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auth_otp_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth_otp_challenges" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID,
    "email" TEXT NOT NULL,
    "otp_hash" TEXT NOT NULL,
    "challenge_type" TEXT NOT NULL DEFAULT 'password_reset',
    "max_attempts" SMALLINT NOT NULL DEFAULT 5,
    "attempts" SMALLINT NOT NULL DEFAULT 0,
    "resend_count" SMALLINT NOT NULL DEFAULT 0,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "verified_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auth_otp_challenges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth_refresh_tokens" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "jti" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "issued_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "revoked_at" TIMESTAMPTZ(6),
    "revoked_reason" TEXT,
    "user_agent" TEXT,
    "ip_address" INET,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auth_refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commerce_clients" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "commerce_user_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "phone_number" TEXT NOT NULL,
    "email" TEXT,
    "cep" TEXT,
    "state" TEXT,
    "city" TEXT,
    "neighborhood" TEXT,
    "street" TEXT,
    "number" TEXT,
    "complement" TEXT,
    "notes" TEXT,
    "last_order_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "commerce_clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commerce_products" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "commerce_user_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price_brl" DECIMAL(10,2) NOT NULL,
    "stock" INTEGER,
    "sold_count" INTEGER NOT NULL DEFAULT 0,
    "status" "product_status" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "commerce_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commerce_profiles" (
    "user_id" UUID NOT NULL,
    "commerce_code" TEXT NOT NULL,
    "trade_name" TEXT NOT NULL,
    "legal_name" TEXT,
    "tax_id" TEXT,
    "rank_level" TEXT,
    "rating" DECIMAL(4,2) DEFAULT 0,
    "is_open" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "commerce_profiles_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "credits_ledger" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "commerce_user_id" UUID NOT NULL,
    "order_id" UUID,
    "entry_type" "credit_entry_type" NOT NULL,
    "amount_brl" DECIMAL(12,2) NOT NULL,
    "balance_after_brl" DECIMAL(12,2) NOT NULL,
    "reference_type" TEXT,
    "reference_id" UUID,
    "reason" TEXT,
    "created_by_user_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "credits_ledger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credits_wallets" (
    "commerce_user_id" UUID NOT NULL,
    "balance_brl" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "reserved_brl" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "credits_wallets_pkey" PRIMARY KEY ("commerce_user_id")
);

-- CreateTable
CREATE TABLE "dispatch_batches" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "order_id" UUID NOT NULL,
    "zone_label" TEXT,
    "batch_number" INTEGER NOT NULL,
    "top_limit" SMALLINT NOT NULL,
    "opened_at" TIMESTAMPTZ(6) NOT NULL,
    "closed_at" TIMESTAMPTZ(6),
    "winner_offer_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dispatch_batches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dispatch_offers" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "batch_id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "rider_user_id" UUID NOT NULL,
    "position_in_queue" INTEGER,
    "offered_at" TIMESTAMPTZ(6) NOT NULL,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "decision" "dispatch_offer_decision" NOT NULL DEFAULT 'pending',
    "decision_reason" TEXT,
    "decided_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dispatch_offers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "legal_documents" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "doc_type" "legal_document_type" NOT NULL,
    "version" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "updated_by_user_id" UUID,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "legal_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "locality_bairro_matrix" (
    "id" BIGSERIAL NOT NULL,
    "origin_bairro_id" UUID NOT NULL,
    "destination_bairro_id" UUID NOT NULL,
    "distance_m" INTEGER NOT NULL,
    "duration_s" INTEGER NOT NULL,
    "source_provider" TEXT NOT NULL DEFAULT 'local_bairro_matrix',
    "source_metadata" JSONB,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "locality_bairro_matrix_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "locality_bairros" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "normalized_name" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "locality_bairros_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_templates" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "event_key" TEXT NOT NULL,
    "channel" "notification_channel" NOT NULL,
    "title_template" TEXT NOT NULL,
    "body_template" TEXT NOT NULL,
    "template_version" INTEGER NOT NULL DEFAULT 1,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "updated_by_user_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notification_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "event_key" TEXT,
    "channel" "notification_channel" NOT NULL DEFAULT 'in_app',
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "payload" JSONB,
    "read_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_confirmation_codes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "order_id" UUID NOT NULL,
    "code_hash" TEXT NOT NULL,
    "code_last4" TEXT,
    "generated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "attempts_count" SMALLINT NOT NULL DEFAULT 0,
    "max_attempts" SMALLINT NOT NULL DEFAULT 5,
    "validated_at" TIMESTAMPTZ(6),
    "validated_by_rider_user_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_confirmation_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_events" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "order_id" UUID NOT NULL,
    "event_type" "tracking_event_type" NOT NULL,
    "actor_user_id" UUID,
    "actor_role" "user_role",
    "note" TEXT,
    "payload" JSONB,
    "occurred_at" TIMESTAMPTZ(6) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_financials" (
    "order_id" UUID NOT NULL,
    "freight_platform_brl" DECIMAL(12,2) NOT NULL,
    "rider_repass_brl" DECIMAL(12,2) NOT NULL,
    "platform_commission_brl" DECIMAL(12,2) NOT NULL,
    "charged_at" TIMESTAMPTZ(6),
    "repass_status" TEXT NOT NULL DEFAULT 'pending',
    "repass_paid_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_financials_pkey" PRIMARY KEY ("order_id")
);

-- CreateTable
CREATE TABLE "order_product_snapshots" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "order_id" UUID NOT NULL,
    "product_id" UUID,
    "product_name" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unit_price_brl" DECIMAL(10,2) NOT NULL,
    "total_price_brl" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_product_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_status_transitions" (
    "from_status" "order_status" NOT NULL,
    "to_status" "order_status" NOT NULL,

    CONSTRAINT "order_status_transitions_pkey" PRIMARY KEY ("from_status","to_status")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "order_code" TEXT NOT NULL,
    "commerce_user_id" UUID NOT NULL,
    "rider_user_id" UUID,
    "client_id" UUID,
    "quote_id" UUID,
    "status" "order_status" NOT NULL,
    "urgency" "urgency_type" NOT NULL,
    "origin_bairro_id" UUID,
    "destination_bairro_id" UUID,
    "recipient_name" TEXT,
    "recipient_phone" TEXT,
    "destination_cep" TEXT,
    "destination_state" TEXT,
    "destination_city" TEXT,
    "destination_neighborhood" TEXT,
    "destination_street" TEXT,
    "destination_number" TEXT,
    "destination_complement" TEXT,
    "notes" TEXT,
    "distance_m" INTEGER,
    "duration_s" INTEGER,
    "eta_min" INTEGER,
    "zone" SMALLINT,
    "base_zone_brl" DECIMAL(10,2),
    "urgency_brl" DECIMAL(10,2),
    "sunday_brl" DECIMAL(10,2),
    "holiday_brl" DECIMAL(10,2),
    "rain_brl" DECIMAL(10,2),
    "peak_brl" DECIMAL(10,2),
    "total_brl" DECIMAL(10,2),
    "confirmation_code_required" BOOLEAN NOT NULL DEFAULT true,
    "confirmation_code_status" "order_confirmation_status" NOT NULL DEFAULT 'not_generated',
    "accepted_at" TIMESTAMPTZ(6),
    "completed_at" TIMESTAMPTZ(6),
    "canceled_at" TIMESTAMPTZ(6),
    "cancel_reason" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_intents" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "commerce_user_id" UUID NOT NULL,
    "provider" "payment_provider" NOT NULL DEFAULT 'infinitepay',
    "purpose" TEXT NOT NULL DEFAULT 'credit_purchase',
    "status" "payment_status" NOT NULL DEFAULT 'pending',
    "amount_brl" DECIMAL(12,2) NOT NULL,
    "amount_cents" INTEGER NOT NULL,
    "provider_handle" TEXT NOT NULL,
    "order_nsu" TEXT NOT NULL,
    "checkout_url" TEXT,
    "redirect_url" TEXT,
    "webhook_url" TEXT,
    "request_payload" JSONB,
    "response_payload" JSONB,
    "expires_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_intents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_transactions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "payment_intent_id" UUID NOT NULL,
    "provider" "payment_provider" NOT NULL,
    "status" "payment_status" NOT NULL,
    "invoice_slug" TEXT,
    "transaction_nsu" TEXT,
    "capture_method" "payment_capture_method",
    "amount_cents" INTEGER NOT NULL,
    "paid_amount_cents" INTEGER,
    "installments" INTEGER,
    "receipt_url" TEXT,
    "provider_payload" JSONB,
    "approved_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_webhook_events" (
    "id" BIGSERIAL NOT NULL,
    "provider" "payment_provider" NOT NULL,
    "event_key" TEXT NOT NULL DEFAULT 'payment.approved',
    "invoice_slug" TEXT,
    "transaction_nsu" TEXT,
    "order_nsu" TEXT,
    "idempotency_key" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "processing_status" TEXT NOT NULL DEFAULT 'received',
    "error_message" TEXT,
    "received_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed_at" TIMESTAMPTZ(6),

    CONSTRAINT "payment_webhook_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pricing_conditional_rules" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "rule_version_id" UUID NOT NULL,
    "condition_key" TEXT NOT NULL,
    "addon_brl" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pricing_conditional_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pricing_holidays" (
    "holiday_date" DATE NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pricing_holidays_pkey" PRIMARY KEY ("holiday_date")
);

-- CreateTable
CREATE TABLE "pricing_peak_windows" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "rule_version_id" UUID NOT NULL,
    "start_hour" SMALLINT NOT NULL,
    "end_hour" SMALLINT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pricing_peak_windows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pricing_rule_versions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "version_code" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "effective_from" TIMESTAMPTZ(6) NOT NULL,
    "effective_to" TIMESTAMPTZ(6),
    "minimum_charge_brl" DECIMAL(10,2) NOT NULL,
    "max_distance_km" DECIMAL(5,2) NOT NULL,
    "notes" TEXT,
    "created_by_user_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pricing_rule_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pricing_urgency_rules" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "rule_version_id" UUID NOT NULL,
    "urgency" "urgency_type" NOT NULL,
    "addon_brl" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pricing_urgency_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pricing_zone_rules" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "rule_version_id" UUID NOT NULL,
    "zone" SMALLINT NOT NULL,
    "min_km" DECIMAL(5,2) NOT NULL,
    "max_km" DECIMAL(5,2) NOT NULL,
    "base_value_brl" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pricing_zone_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public_leads" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "lead_type" "lead_type" NOT NULL,
    "name" TEXT NOT NULL,
    "contact" TEXT NOT NULL,
    "message" TEXT,
    "source" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "public_leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quote_provider_attempts" (
    "id" BIGSERIAL NOT NULL,
    "quote_id" UUID NOT NULL,
    "domain_key" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "attempt_no" SMALLINT NOT NULL,
    "success" BOOLEAN NOT NULL,
    "latency_ms" INTEGER,
    "error_code" TEXT,
    "response_sample" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quote_provider_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quotes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "commerce_user_id" UUID NOT NULL,
    "origin_bairro_id" UUID NOT NULL,
    "destination_bairro_id" UUID NOT NULL,
    "urgency" "urgency_type" NOT NULL,
    "requested_at_iso" TIMESTAMPTZ(6) NOT NULL,
    "distance_m" INTEGER,
    "duration_s" INTEGER,
    "eta_min" INTEGER,
    "zone" SMALLINT,
    "base_zone_brl" DECIMAL(10,2),
    "urgency_brl" DECIMAL(10,2),
    "sunday_brl" DECIMAL(10,2),
    "holiday_brl" DECIMAL(10,2),
    "rain_brl" DECIMAL(10,2),
    "peak_brl" DECIMAL(10,2),
    "total_brl" DECIMAL(10,2),
    "is_raining" BOOLEAN,
    "climate_source" TEXT,
    "climate_confidence" TEXT,
    "distance_time_provider" TEXT,
    "climate_provider" TEXT,
    "fallback_used" BOOLEAN,
    "distance_time_latency_ms" INTEGER,
    "climate_latency_ms" INTEGER,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "error_code" TEXT,
    "error_message" TEXT,
    "expires_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quotes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rider_documents" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "rider_user_id" UUID NOT NULL,
    "document_type" "rider_document_type" NOT NULL,
    "document_number" TEXT,
    "file_url" TEXT,
    "validation_status" TEXT NOT NULL DEFAULT 'pending',
    "validated_by_user_id" UUID,
    "validated_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rider_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rider_ledger" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "rider_user_id" UUID NOT NULL,
    "order_id" UUID,
    "entry_type" TEXT NOT NULL,
    "amount_brl" DECIMAL(12,2) NOT NULL,
    "balance_after_brl" DECIMAL(12,2) NOT NULL,
    "reference_type" TEXT,
    "reference_id" UUID,
    "reason" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rider_ledger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rider_profiles" (
    "user_id" UUID NOT NULL,
    "rider_code" TEXT NOT NULL,
    "rank_level" TEXT,
    "rating" DECIMAL(4,2) DEFAULT 0,
    "completed_deliveries" INTEGER NOT NULL DEFAULT 0,
    "online_minutes_total" INTEGER NOT NULL DEFAULT 0,
    "is_online" BOOLEAN NOT NULL DEFAULT false,
    "cooldown_until" TIMESTAMPTZ(6),
    "last_status_change_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rider_profiles_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "rider_vehicles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "rider_user_id" UUID NOT NULL,
    "vehicle_type" "rider_vehicle_type" NOT NULL,
    "brand" TEXT,
    "model" TEXT,
    "vehicle_year" INTEGER,
    "plate" TEXT,
    "validation_status" TEXT NOT NULL DEFAULT 'pending',
    "is_primary" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rider_vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rider_wallets" (
    "rider_user_id" UUID NOT NULL,
    "balance_brl" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "pending_brl" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rider_wallets_pkey" PRIMARY KEY ("rider_user_id")
);

-- CreateTable
CREATE TABLE "support_faqs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "category" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "updated_by_user_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "support_faqs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "support_ticket_messages" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "ticket_id" UUID NOT NULL,
    "author_user_id" UUID NOT NULL,
    "message" TEXT NOT NULL,
    "internal_note" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "support_ticket_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "support_tickets" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_by_user_id" UUID NOT NULL,
    "order_id" UUID,
    "subject" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "ticket_status" NOT NULL DEFAULT 'open',
    "priority" "ticket_priority" NOT NULL DEFAULT 'medium',
    "assigned_to_user_id" UUID,
    "resolved_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "support_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_flags" (
    "flag_key" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL,
    "description" TEXT,
    "updated_by_user_id" UUID,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "system_flags_pkey" PRIMARY KEY ("flag_key")
);

-- CreateTable
CREATE TABLE "system_runtime_history" (
    "id" BIGSERIAL NOT NULL,
    "maintenance_enabled" BOOLEAN NOT NULL,
    "maintenance_message" TEXT,
    "expected_back_at" TIMESTAMPTZ(6),
    "min_supported_app_version" TEXT,
    "force_update_enabled" BOOLEAN NOT NULL,
    "updated_by_user_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "system_runtime_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_runtime_state" (
    "singleton_id" SMALLINT NOT NULL DEFAULT 1,
    "maintenance_enabled" BOOLEAN NOT NULL DEFAULT false,
    "maintenance_message" TEXT,
    "expected_back_at" TIMESTAMPTZ(6),
    "min_supported_app_version" TEXT,
    "force_update_enabled" BOOLEAN NOT NULL DEFAULT false,
    "updated_by_user_id" UUID,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "system_runtime_state_pkey" PRIMARY KEY ("singleton_id")
);

-- CreateTable
CREATE TABLE "user_addresses" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "address_type" TEXT NOT NULL,
    "cep" TEXT,
    "state" TEXT,
    "city" TEXT,
    "neighborhood" TEXT,
    "street" TEXT,
    "number" TEXT,
    "complement" TEXT,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_bank_accounts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "bank_name" TEXT,
    "agency" TEXT,
    "account" TEXT,
    "account_type" "bank_account_type",
    "pix_key" TEXT,
    "is_primary" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_bank_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_identities" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "provider" "auth_identity_provider" NOT NULL,
    "provider_user_id" TEXT NOT NULL,
    "provider_email" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_identities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_notification_settings" (
    "user_id" UUID NOT NULL,
    "delivery" BOOLEAN NOT NULL DEFAULT true,
    "payment" BOOLEAN NOT NULL DEFAULT true,
    "promotions" BOOLEAN NOT NULL DEFAULT false,
    "app_updates" BOOLEAN NOT NULL DEFAULT true,
    "security" BOOLEAN NOT NULL DEFAULT true,
    "support" BOOLEAN NOT NULL DEFAULT true,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_notification_settings_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "role" "user_role" NOT NULL,
    "status" "user_status" NOT NULL DEFAULT 'active',
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT,
    "phone_number" TEXT,
    "whatsapp" TEXT,
    "profile_picture_url" TEXT,
    "last_login_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_audit_logs_actor" ON "audit_logs"("actor_user_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_audit_logs_entity" ON "audit_logs"("entity_type", "entity_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_audit_logs_request" ON "audit_logs"("request_id");

-- CreateIndex
CREATE INDEX "idx_auth_otp_attempts_challenge" ON "auth_otp_attempts"("challenge_id", "attempted_at" DESC);

-- CreateIndex
CREATE INDEX "idx_auth_otp_email" ON "auth_otp_challenges"("email", "created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_auth_otp_expires" ON "auth_otp_challenges"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "uq_auth_refresh_jti" ON "auth_refresh_tokens"("jti");

-- CreateIndex
CREATE INDEX "idx_auth_refresh_user_expires" ON "auth_refresh_tokens"("user_id", "expires_at" DESC);

-- CreateIndex
CREATE INDEX "idx_commerce_clients_owner" ON "commerce_clients"("commerce_user_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_commerce_clients_search" ON "commerce_clients"("commerce_user_id", "name", "phone_number");

-- CreateIndex
CREATE INDEX "idx_commerce_products_owner" ON "commerce_products"("commerce_user_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_commerce_products_status" ON "commerce_products"("commerce_user_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "uq_commerce_profiles_code" ON "commerce_profiles"("commerce_code");

-- CreateIndex
CREATE INDEX "idx_credits_ledger_commerce_time" ON "credits_ledger"("commerce_user_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_credits_ledger_order" ON "credits_ledger"("order_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_dispatch_batch_order_number" ON "dispatch_batches"("order_id", "batch_number");

-- CreateIndex
CREATE INDEX "idx_dispatch_offers_order" ON "dispatch_offers"("order_id", "offered_at" DESC);

-- CreateIndex
CREATE INDEX "idx_dispatch_offers_rider" ON "dispatch_offers"("rider_user_id", "offered_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "uq_legal_documents_version" ON "legal_documents"("doc_type", "version");

-- CreateIndex
CREATE INDEX "idx_locality_matrix_destination" ON "locality_bairro_matrix"("destination_bairro_id");

-- CreateIndex
CREATE INDEX "idx_locality_matrix_origin" ON "locality_bairro_matrix"("origin_bairro_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_locality_matrix_pair" ON "locality_bairro_matrix"("origin_bairro_id", "destination_bairro_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_locality_bairro" ON "locality_bairros"("city", "state", "normalized_name");

-- CreateIndex
CREATE UNIQUE INDEX "uq_notification_template_version" ON "notification_templates"("event_key", "channel", "template_version");

-- CreateIndex
CREATE INDEX "idx_notifications_user_created" ON "notifications"("user_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_notifications_user_read" ON "notifications"("user_id", "read_at");

-- CreateIndex
CREATE UNIQUE INDEX "order_confirmation_codes_order_id_key" ON "order_confirmation_codes"("order_id");

-- CreateIndex
CREATE INDEX "idx_order_confirmation_order" ON "order_confirmation_codes"("order_id");

-- CreateIndex
CREATE INDEX "idx_order_events_order_time" ON "order_events"("order_id", "occurred_at");

-- CreateIndex
CREATE INDEX "idx_order_events_type_time" ON "order_events"("event_type", "occurred_at" DESC);

-- CreateIndex
CREATE INDEX "idx_order_product_snapshots_order" ON "order_product_snapshots"("order_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_orders_code" ON "orders"("order_code");

-- CreateIndex
CREATE INDEX "idx_orders_commerce_status_created" ON "orders"("commerce_user_id", "status", "created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_orders_rider_status_created" ON "orders"("rider_user_id", "status", "created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_orders_status_created" ON "orders"("status", "created_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "uq_payment_intents_order_nsu" ON "payment_intents"("order_nsu");

-- CreateIndex
CREATE INDEX "idx_payment_intents_commerce" ON "payment_intents"("commerce_user_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_payment_intents_status" ON "payment_intents"("status", "created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_payment_transactions_intent" ON "payment_transactions"("payment_intent_id");

-- CreateIndex
CREATE INDEX "idx_payment_transactions_status" ON "payment_transactions"("status", "created_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "uq_payment_transactions_nsu" ON "payment_transactions"("provider", "transaction_nsu");

-- CreateIndex
CREATE UNIQUE INDEX "uq_payment_webhook_idempotency" ON "payment_webhook_events"("idempotency_key");

-- CreateIndex
CREATE INDEX "idx_payment_webhook_order_nsu" ON "payment_webhook_events"("order_nsu", "received_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "uq_pricing_conditional_by_version" ON "pricing_conditional_rules"("rule_version_id", "condition_key");

-- CreateIndex
CREATE UNIQUE INDEX "uq_pricing_rule_version_code" ON "pricing_rule_versions"("version_code");

-- CreateIndex
CREATE UNIQUE INDEX "uq_pricing_urgency_by_version" ON "pricing_urgency_rules"("rule_version_id", "urgency");

-- CreateIndex
CREATE UNIQUE INDEX "uq_pricing_zone_by_version" ON "pricing_zone_rules"("rule_version_id", "zone");

-- CreateIndex
CREATE INDEX "idx_quote_attempts_quote" ON "quote_provider_attempts"("quote_id", "domain_key", "attempt_no");

-- CreateIndex
CREATE UNIQUE INDEX "uq_quote_attempt" ON "quote_provider_attempts"("quote_id", "domain_key", "provider_id", "attempt_no");

-- CreateIndex
CREATE INDEX "idx_quotes_commerce_created" ON "quotes"("commerce_user_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_quotes_origin_destination" ON "quotes"("origin_bairro_id", "destination_bairro_id");

-- CreateIndex
CREATE INDEX "idx_rider_documents_user_type" ON "rider_documents"("rider_user_id", "document_type");

-- CreateIndex
CREATE INDEX "idx_rider_ledger_rider_time" ON "rider_ledger"("rider_user_id", "created_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "uq_rider_profiles_code" ON "rider_profiles"("rider_code");

-- CreateIndex
CREATE INDEX "idx_rider_vehicles_user" ON "rider_vehicles"("rider_user_id", "is_primary" DESC);

-- CreateIndex
CREATE INDEX "idx_support_ticket_messages_ticket" ON "support_ticket_messages"("ticket_id", "created_at");

-- CreateIndex
CREATE INDEX "idx_support_tickets_creator" ON "support_tickets"("created_by_user_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_support_tickets_status" ON "support_tickets"("status", "priority", "created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_user_addresses_user" ON "user_addresses"("user_id", "address_type");

-- CreateIndex
CREATE INDEX "idx_user_bank_accounts_user" ON "user_bank_accounts"("user_id", "is_primary" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "uq_user_identity_per_user" ON "user_identities"("user_id", "provider");

-- CreateIndex
CREATE UNIQUE INDEX "uq_user_identity_provider" ON "user_identities"("provider", "provider_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_users_email" ON "users"("email");

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_user_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "auth_otp_attempts" ADD CONSTRAINT "auth_otp_attempts_challenge_id_fkey" FOREIGN KEY ("challenge_id") REFERENCES "auth_otp_challenges"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "auth_otp_challenges" ADD CONSTRAINT "auth_otp_challenges_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "auth_refresh_tokens" ADD CONSTRAINT "auth_refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "commerce_clients" ADD CONSTRAINT "commerce_clients_commerce_user_id_fkey" FOREIGN KEY ("commerce_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "commerce_products" ADD CONSTRAINT "commerce_products_commerce_user_id_fkey" FOREIGN KEY ("commerce_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "commerce_profiles" ADD CONSTRAINT "commerce_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "credits_ledger" ADD CONSTRAINT "credits_ledger_commerce_user_id_fkey" FOREIGN KEY ("commerce_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "credits_ledger" ADD CONSTRAINT "credits_ledger_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "credits_ledger" ADD CONSTRAINT "credits_ledger_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "credits_wallets" ADD CONSTRAINT "credits_wallets_commerce_user_id_fkey" FOREIGN KEY ("commerce_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "dispatch_batches" ADD CONSTRAINT "dispatch_batches_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "dispatch_batches" ADD CONSTRAINT "fk_dispatch_batches_winner_offer" FOREIGN KEY ("winner_offer_id") REFERENCES "dispatch_offers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "dispatch_offers" ADD CONSTRAINT "dispatch_offers_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "dispatch_batches"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "dispatch_offers" ADD CONSTRAINT "dispatch_offers_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "dispatch_offers" ADD CONSTRAINT "dispatch_offers_rider_user_id_fkey" FOREIGN KEY ("rider_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "legal_documents" ADD CONSTRAINT "legal_documents_updated_by_user_id_fkey" FOREIGN KEY ("updated_by_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "locality_bairro_matrix" ADD CONSTRAINT "locality_bairro_matrix_destination_bairro_id_fkey" FOREIGN KEY ("destination_bairro_id") REFERENCES "locality_bairros"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "locality_bairro_matrix" ADD CONSTRAINT "locality_bairro_matrix_origin_bairro_id_fkey" FOREIGN KEY ("origin_bairro_id") REFERENCES "locality_bairros"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "notification_templates" ADD CONSTRAINT "notification_templates_updated_by_user_id_fkey" FOREIGN KEY ("updated_by_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "order_confirmation_codes" ADD CONSTRAINT "order_confirmation_codes_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "order_confirmation_codes" ADD CONSTRAINT "order_confirmation_codes_validated_by_rider_user_id_fkey" FOREIGN KEY ("validated_by_rider_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "order_events" ADD CONSTRAINT "order_events_actor_user_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "order_events" ADD CONSTRAINT "order_events_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "order_financials" ADD CONSTRAINT "order_financials_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "order_product_snapshots" ADD CONSTRAINT "order_product_snapshots_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "order_product_snapshots" ADD CONSTRAINT "order_product_snapshots_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "commerce_products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "commerce_clients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_commerce_user_id_fkey" FOREIGN KEY ("commerce_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_destination_bairro_id_fkey" FOREIGN KEY ("destination_bairro_id") REFERENCES "locality_bairros"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_origin_bairro_id_fkey" FOREIGN KEY ("origin_bairro_id") REFERENCES "locality_bairros"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_quote_id_fkey" FOREIGN KEY ("quote_id") REFERENCES "quotes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_rider_user_id_fkey" FOREIGN KEY ("rider_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "payment_intents" ADD CONSTRAINT "payment_intents_commerce_user_id_fkey" FOREIGN KEY ("commerce_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_payment_intent_id_fkey" FOREIGN KEY ("payment_intent_id") REFERENCES "payment_intents"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "pricing_conditional_rules" ADD CONSTRAINT "pricing_conditional_rules_rule_version_id_fkey" FOREIGN KEY ("rule_version_id") REFERENCES "pricing_rule_versions"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "pricing_peak_windows" ADD CONSTRAINT "pricing_peak_windows_rule_version_id_fkey" FOREIGN KEY ("rule_version_id") REFERENCES "pricing_rule_versions"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "pricing_rule_versions" ADD CONSTRAINT "pricing_rule_versions_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "pricing_urgency_rules" ADD CONSTRAINT "pricing_urgency_rules_rule_version_id_fkey" FOREIGN KEY ("rule_version_id") REFERENCES "pricing_rule_versions"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "pricing_zone_rules" ADD CONSTRAINT "pricing_zone_rules_rule_version_id_fkey" FOREIGN KEY ("rule_version_id") REFERENCES "pricing_rule_versions"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "quote_provider_attempts" ADD CONSTRAINT "quote_provider_attempts_quote_id_fkey" FOREIGN KEY ("quote_id") REFERENCES "quotes"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_commerce_user_id_fkey" FOREIGN KEY ("commerce_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_destination_bairro_id_fkey" FOREIGN KEY ("destination_bairro_id") REFERENCES "locality_bairros"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_origin_bairro_id_fkey" FOREIGN KEY ("origin_bairro_id") REFERENCES "locality_bairros"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "rider_documents" ADD CONSTRAINT "rider_documents_rider_user_id_fkey" FOREIGN KEY ("rider_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "rider_documents" ADD CONSTRAINT "rider_documents_validated_by_user_id_fkey" FOREIGN KEY ("validated_by_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "rider_ledger" ADD CONSTRAINT "rider_ledger_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "rider_ledger" ADD CONSTRAINT "rider_ledger_rider_user_id_fkey" FOREIGN KEY ("rider_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "rider_profiles" ADD CONSTRAINT "rider_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "rider_vehicles" ADD CONSTRAINT "rider_vehicles_rider_user_id_fkey" FOREIGN KEY ("rider_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "rider_wallets" ADD CONSTRAINT "rider_wallets_rider_user_id_fkey" FOREIGN KEY ("rider_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "support_faqs" ADD CONSTRAINT "support_faqs_updated_by_user_id_fkey" FOREIGN KEY ("updated_by_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "support_ticket_messages" ADD CONSTRAINT "support_ticket_messages_author_user_id_fkey" FOREIGN KEY ("author_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "support_ticket_messages" ADD CONSTRAINT "support_ticket_messages_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "support_tickets"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_assigned_to_user_id_fkey" FOREIGN KEY ("assigned_to_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "system_flags" ADD CONSTRAINT "system_flags_updated_by_user_id_fkey" FOREIGN KEY ("updated_by_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "system_runtime_history" ADD CONSTRAINT "system_runtime_history_updated_by_user_id_fkey" FOREIGN KEY ("updated_by_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "system_runtime_state" ADD CONSTRAINT "system_runtime_state_updated_by_user_id_fkey" FOREIGN KEY ("updated_by_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_addresses" ADD CONSTRAINT "user_addresses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_bank_accounts" ADD CONSTRAINT "user_bank_accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_identities" ADD CONSTRAINT "user_identities_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_notification_settings" ADD CONSTRAINT "user_notification_settings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
