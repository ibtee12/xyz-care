import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL

if (!connectionString) {
  throw new Error("DIRECT_URL or DATABASE_URL must be set for Prisma.")
}

const adapter = new PrismaPg({ connectionString })

export const db = globalForPrisma.prisma ?? new PrismaClient({ adapter })

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db
