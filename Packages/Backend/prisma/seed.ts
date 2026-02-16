import { PrismaClient } from "@prisma/client";

import { seedSystem } from "./seeds/010_system.seed";
import { seedLocality } from "./seeds/020_locality.seed";
import { seedPricing } from "./seeds/030_pricing.seed";
import { seedUsers } from "./seeds/040_users.seed";
import { seedProfiles } from "./seeds/050_profiles.seed";
import { seedCommerceData } from "./seeds/060_commerce_data.seed";
import { seedOrdersTracking } from "./seeds/070_orders_tracking.seed";
import { seedFinance } from "./seeds/080_finance.seed";
import { seedNotificationsSupport } from "./seeds/090_notifications_support.seed";
import { seedDispatchQuotes } from "./seeds/100_dispatch_quotes.seed";
import { seedOrderCompletionAndStates } from "./seeds/110_orders_completion.seed";
import { seedLegalAndPublicLeads } from "./seeds/120_legal_leads.seed";
import { seedRuntimeObservability } from "./seeds/130_runtime_observability.seed";
import { seedRiderLedger } from "./seeds/140_rider_ledger.seed";
import { createSeedContext, runSeed } from "./seeds/_shared/context";

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const ctx = createSeedContext(prisma);

  await runSeed("010_system", ctx, seedSystem);
  await runSeed("020_locality", ctx, seedLocality);
  await runSeed("030_pricing", ctx, seedPricing);
  await runSeed("040_users", ctx, seedUsers);
  await runSeed("050_profiles", ctx, seedProfiles);
  await runSeed("060_commerce_data", ctx, seedCommerceData);
  await runSeed("070_orders_tracking", ctx, seedOrdersTracking);
  await runSeed("080_finance", ctx, seedFinance);
  await runSeed("090_notifications_support", ctx, seedNotificationsSupport);
  await runSeed("100_dispatch_quotes", ctx, seedDispatchQuotes);
  await runSeed("110_orders_completion", ctx, seedOrderCompletionAndStates);
  await runSeed("120_legal_leads", ctx, seedLegalAndPublicLeads);
  await runSeed("130_runtime_observability", ctx, seedRuntimeObservability);
  await runSeed("140_rider_ledger", ctx, seedRiderLedger);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    console.error("[seed] failed", error);
    await prisma.$disconnect();
    process.exit(1);
  });
