// lib/safe-prisma.ts (new helper)
import { prisma } from './prisma'

export async function safeFindProducts() {
  try {
    return await prisma.product.findMany({ include: { images: true } })
  } catch (err: unknown) {
    console.error('safeFindProducts: DB error', err instanceof Error ? err.message : err)
    return [] // fallback for build-time / offline
  }
}
