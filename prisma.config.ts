import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'

export default defineConfig({
    schema: 'prisma/schema.prisma',

    datasource: {
        url:
            env('DATABASE_URL') ||
            process.env.DATABASE_URL ||
            'postgresql://postgres:postgres@localhost:5432/ecomzen',
    },

    migrations: {
        path: 'prisma/migrations',
        seed: 'npx tsx prisma/seed.ts',
    },


})