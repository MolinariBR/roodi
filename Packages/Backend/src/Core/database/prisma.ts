import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var __roodiPrisma: PrismaClient | undefined;
}

const createPrismaClient = (): PrismaClient => {
  return new PrismaClient();
};

export const prisma = globalThis.__roodiPrisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.__roodiPrisma = prisma;
}

