// prisma/seed.ts
import 'dotenv/config'
import bcrypt from 'bcrypt'
// import { PrismaClient, Prisma } from '@prisma/client' // Removed standard import
import { PrismaClient, Prisma } from './generated/index.js' // Added custom import
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import { checkConnection } from '../scripts/check-db-connection.ts'

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set')
}

const connectionString = process.env.DATABASE_URL
const isAccelerate = connectionString.startsWith('prisma://') || connectionString.startsWith('prisma+postgres://')


let prisma: PrismaClient

if (isAccelerate) {
    // Prisma 7 requires explicit 'accelerateUrl' or 'adapter'.
    prisma = new PrismaClient({
        accelerateUrl: connectionString,
        log: ['info'],
    })
} else {
    const pool = new Pool({ connectionString })
    const adapter = new PrismaPg(pool, {
        schema: 'public',
    })
    prisma = new PrismaClient({ adapter })
}

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'admin@example.com'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'admin123'
const BCRYPT_ROUNDS = Number(process.env.BCRYPT_ROUNDS ?? 10)

async function seedAdmin(tx: Prisma.TransactionClient) {
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, BCRYPT_ROUNDS)

    const admin = await tx.user.upsert({
        where: { email: ADMIN_EMAIL },
        update: {},
        create: {
            email: ADMIN_EMAIL,
            name: 'Admin User',
            password: passwordHash,
            mobile: '1234567890',
            address: '123 Main St',
            role: 'admin',
        },
    })

    console.log(`✔ Admin ready: ${admin.email}`)
}

async function seedProducts(tx: Prisma.TransactionClient) {
    const products = [
        {
            name: 'Classic White T-Shirt',
            slug: 'classic-white-tshirt',
            description: 'Premium cotton T-shirt with a clean look.',
            price: 69900,
            inventory: 50,
            images: [
                { url: '/uploads/sample-shirt-1.jpg', alt: 'White T-shirt front' },
                { url: '/uploads/sample-shirt-2.jpg', alt: 'White T-shirt back' },
            ],
            variants: [
                { sku: 'TSHIRT-WHITE-S', name: 'Small', price: 69900, inventory: 20 },
                { sku: 'TSHIRT-WHITE-M', name: 'Medium', price: 69900, inventory: 30 },
            ],
        },
        {
            name: 'Black Hoodie',
            slug: 'black-hoodie',
            description: 'Comfortable hoodie perfect for winter.',
            price: 129900,
            inventory: 30,
            images: [
                { url: '/uploads/sample-hoodie-1.jpg', alt: 'Black hoodie front' },
            ],
            variants: [
                { sku: 'HOODIE-BLACK-M', name: 'Medium', price: 129900, inventory: 15 },
                { sku: 'HOODIE-BLACK-L', name: 'Large', price: 129900, inventory: 15 },
            ],
        },
    ]

    for (const product of products) {
        await tx.product.upsert({
            where: { slug: product.slug },
            update: {},
            create: {
                name: product.name,
                slug: product.slug,
                description: product.description,
                price: product.price,
                inventory: product.inventory,
                isActive: true,
                images: { createMany: { data: product.images } },
                variants: { createMany: { data: product.variants } },
            },
        })

        console.log(`✔ Product ready: ${product.name}`)
    }
}

async function main() {
    console.log('🌱 Starting database seed...')

    // Verify connection first
    const isConnected = await checkConnection()
    if (!isConnected) {
        console.error('❌ Cannot connect to database. Aborting seed.')
        process.exit(1)
    }


    await prisma.$transaction(async (tx) => {
        await seedAdmin(tx)
        await seedProducts(tx)
    })

    console.log('🎉 Database seeded successfully')
}

main()
    .catch((err) => {
        console.error('❌ Seed failed:', err)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
