import { PrismaClient } from "@prisma/client";

/** Render injects a non-SQLite DATABASE_URL. This app is SQLite-only. */
const SQLITE_URL = "file:./dev.db";
process.env.DATABASE_URL = SQLITE_URL;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: { db: { url: SQLITE_URL } },
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
