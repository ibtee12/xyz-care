import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const connectionString = process.env.DATABASE_URL || process.env.DIRECT_URL

if (!connectionString) {
  throw new Error("DATABASE_URL or DIRECT_URL must be set for Prisma.")
}

const adapter = new PrismaPg({ connectionString })

export const db = globalForPrisma.prisma ?? new PrismaClient({ adapter })

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db
