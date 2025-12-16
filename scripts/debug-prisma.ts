
import nextEnv from '@next/env'
const { loadEnvConfig } = nextEnv

loadEnvConfig(process.cwd())

async function main() {
    const { prisma } = await import("../lib/prisma.ts")
    console.log("Testing Prisma findUnique with valid email...")
    try {
        const user = await prisma.user.findUnique({
            where: { email: "test@example.com" },
        })
        console.log("Success (valid email):", user)
    } catch (e) {
        console.error("Error (valid email):", e)
    }

    console.log("\nTesting Prisma findUnique with undefined email (should fail typescript but runtime check)...")
    try {
        // @ts-ignore
        const user = await prisma.user.findUnique({
            where: { email: undefined },
        })
        console.log("Success (undefined email):", user)
    } catch (e) {
        console.error("Error (undefined email):", e)
    }

    console.log("\nTesting Prisma findUnique with null email...")
    try {
        // @ts-ignore
        const user = await prisma.user.findUnique({
            where: { email: null as any },
        })
        console.log("Success (null email):", user)
    } catch (e) {
        console.error("Error (null email):", e)
    }

    console.log("\nTesting Prisma findUnique with non-string email...")
    try {
        // @ts-ignore
        const user = await prisma.user.findUnique({
            where: { email: 123 as any },
        })
        console.log("Success (number email):", user)
    } catch (e) {
        console.error("Error (number email):", e)
    }
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        // We don't need to disconnect explicitly with the driver adapter usually, but good practice in scripts
        // await prisma.$disconnect()
    })
