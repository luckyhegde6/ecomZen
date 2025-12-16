import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../prisma/generated/index.js'

const connectionString = process.env.DATABASE_URL!

const globalForPrisma = global as unknown as { prisma: PrismaClient }

const prismaClientSingleton = () => {
  // If using Prisma Accelerate (starts with prisma+), do not use the adapter
  if (connectionString.startsWith('prisma+')) {
    return new PrismaClient({
      // @ts-ignore
      accelerateUrl: connectionString,
      log: ['warn', 'error'],
    })
  }

  // Otherwise use the PG adapter (for standard postgres connection strings)
  const pool = new Pool({ connectionString })
  const adapter = new PrismaPg(pool)
  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma


