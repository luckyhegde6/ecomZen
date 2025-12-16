import 'dotenv/config'
import { Client } from 'pg'
import { fileURLToPath } from 'url'

export async function checkConnection() {
    if (!process.env.DATABASE_URL) {
        console.error('❌ DATABASE_URL is not set')
        process.exit(1)
    }

    let dbUrl: URL
    try {
        dbUrl = new URL(process.env.DATABASE_URL)
    } catch (e) {
        console.error('❌ DATABASE_URL is not a valid URL')
        process.exit(1)
    }

    console.log('🔍 Checking database connection configuration...')
    console.log(`Prototype: ${dbUrl.protocol}`)
    console.log(`Hostname: ${dbUrl.hostname}`)
    console.log(`Port: ${dbUrl.port}`)
    console.log(`Path: ${dbUrl.pathname}`)
    // Do not log username/password

    if (dbUrl.protocol !== 'postgres:' && dbUrl.protocol !== 'postgresql:') {
        if (dbUrl.protocol === 'prisma:' || dbUrl.protocol === 'prisma+postgres:') {
            console.log('⚡ Prisma Accelerate URL detected. Skipping raw pg connection check.')
            return true
        }
        console.warn(`⚠️ Warning: Protocol is "${dbUrl.protocol}". The pg driver typically expects "postgres:" or "postgresql:".`)
    }

    console.log('\n🔄 Attempting raw pg connection...')
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        connectionTimeoutMillis: 5000,
    })

    try {
        await client.connect()
        console.log('✅ Connection successful!')
        await client.end()
        return true
    } catch (err: any) {
        console.error('❌ Connection failed:', err.message)
        if (err.code) console.error('Error Code:', err.code)
        if (err.address) console.error('Address:', err.address)
        if (err.port) console.error('Port:', err.port)
        return false
    }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    checkConnection()
}
