import type { PrismaClient } from "@prisma/client";

export interface SeedContext {
  prisma: PrismaClient;
}

export type SeedRunner = (ctx: SeedContext) => Promise<void>;

export function createSeedContext(prisma: PrismaClient): SeedContext {
  return { prisma };
}

export async function runSeed(
  name: string,
  ctx: SeedContext,
  runner: SeedRunner,
): Promise<void> {
  const startedAt = Date.now();
  console.info(`[seed] ${name}: started`);
  await runner(ctx);
  const elapsed = Date.now() - startedAt;
  console.info(`[seed] ${name}: done (${elapsed}ms)`);
}

