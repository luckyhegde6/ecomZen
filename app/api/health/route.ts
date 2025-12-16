import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const start = Date.now();
        // Simple query to verify DB connection
        await prisma.$queryRaw`SELECT 1`;
        const duration = Date.now() - start;

        const dbUrl = process.env.DATABASE_URL || '';
        const isAccelerate = dbUrl.startsWith('prisma+postgres://') || dbUrl.includes('accelerate.prisma-data.net');

        // Mask the URL: postgres://user:pass@host:port/db
        // We want: postgres://user:***@host:port/db
        let maskedUrl = 'Not Set';
        if (dbUrl) {
            try {
                // If it's a prisma+ URL, handle it carefully or just treat as string
                // Standard URL parsing might fail on custom protocols if not careful, 
                // but prisma+postgres works with new URL() usually.
                const parsed = new URL(dbUrl.replace('prisma+postgres://', 'postgres://'));
                parsed.password = '****';
                maskedUrl = parsed.toString().replace('postgres:', isAccelerate ? 'prisma+postgres:' : 'postgres:');
            } catch {
                maskedUrl = 'Invalid URL Format';
            }
        }

        return NextResponse.json(
            {
                status: 'ok',
                database: 'connected',
                connection: {
                    type: isAccelerate ? 'Remote (Prisma Accelerate)' : 'Local (Direct)',
                    url: maskedUrl
                },
                latency: `${duration}ms`,
                timestamp: new Date().toISOString()
            },
            { status: 200 }
        );
    } catch (error: any) {
        console.error('Healthcheck failed:', error);
        return NextResponse.json(
            {
                status: 'error',
                database: 'disconnected',
                error: error.message,
                timestamp: new Date().toISOString()
            },
            { status: 500 }
        );
    }
}
