ALTER TABLE "orders"
ADD COLUMN IF NOT EXISTS "payment_status" "payment_status" NOT NULL DEFAULT 'pending';

ALTER TABLE "orders"
ADD COLUMN IF NOT EXISTS "payment_required" BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE "orders"
ADD COLUMN IF NOT EXISTS "payment_confirmed_at" TIMESTAMPTZ(6);

ALTER TABLE "payment_intents"
ADD COLUMN IF NOT EXISTS "order_id" UUID;

CREATE INDEX IF NOT EXISTS "idx_orders_payment_status_created" ON "orders"("payment_status", "created_at" DESC);

CREATE INDEX IF NOT EXISTS "idx_payment_intents_order" ON "payment_intents"("order_id", "created_at" DESC);

DO $$ BEGIN
  ALTER TABLE "payment_intents"
  ADD CONSTRAINT "payment_intents_order_id_fkey"
  FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
