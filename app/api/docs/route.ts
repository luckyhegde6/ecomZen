import { NextResponse } from 'next/server';
import swaggerSpec from '@/lib/swagger.json';

export async function GET(req: Request) {
  // 1. Check for Authorization header
  const authHeader = req.headers.get('authorization');

  if (!authHeader) {
    return new NextResponse('Authentication required', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Admin Access"',
      },
    });
  }

  // 2. Decode credentials
  const [scheme, credentials] = authHeader.split(' ');
  if (scheme !== 'Basic' || !credentials) {
    return new NextResponse('Invalid auth scheme', { status: 401 });
  }

  const [user, pwd] = Buffer.from(credentials, 'base64').toString().split(':');

  // 3. Verify against Env Vars (or defaults for safety if not set, though ideally should be set)
  const validUser = process.env.ADMIN_EMAIL || 'admin@example.com';
  const validPass = process.env.ADMIN_PASSWORD || 'admin123';

  if (user !== validUser || pwd !== validPass) {
    return new NextResponse('Invalid credentials', { status: 403 });
  }

  // 4. Serve the Docs
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>API Documentation</title>
      <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css" />
    </head>
    <body>
      <div id="swagger-ui"></div>
      <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js" crossorigin></script>
      <script>
        window.onload = () => {
          window.ui = SwaggerUIBundle({
            spec: ${JSON.stringify(swaggerSpec)},
            dom_id: '#swagger-ui',
          });
        };
      </script>
    </body>
    </html>
  `;

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html',
    },
  });
}
