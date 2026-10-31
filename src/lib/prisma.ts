import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// If the in-memory cached instance is outdated (e.g. from before schema generation), discard it.
if (
  globalForPrisma.prisma &&
  !("verificationCode" in (globalForPrisma.prisma as unknown as Record<string, unknown>))
) {
  globalForPrisma.prisma = undefined;
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
