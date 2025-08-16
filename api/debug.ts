// Standalone debug endpoint for Vercel deployment troubleshooting

export default async function handler(req: any, res: any) {
  try {
    // Check environment variables
    const dbUrl = process.env.DATABASE_URL;
    const nodeEnv = process.env.NODE_ENV;
    const jwtSecret = process.env.JWT_SECRET;

    // Basic database URL validation
    let dbStatus = 'unknown';
    let dbError: string | null = null;
    if (dbUrl && dbUrl.includes('postgres')) {
      dbStatus = 'url_valid';
    } else {
      dbStatus = 'url_invalid';
      dbError = 'DATABASE_URL not set or invalid';
    }

    const debugInfo = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
      environment: {
        NODE_ENV: nodeEnv || 'NOT_SET',
        DATABASE_URL: dbUrl ? 'SET' : 'NOT_SET',
        DATABASE_URL_LENGTH: dbUrl?.length || 0,
        DATABASE_URL_PREFIX: dbUrl?.substring(0, 30) || 'N/A',
        JWT_SECRET: jwtSecret ? 'SET' : 'NOT_SET'
      },
      database: {
        status: dbStatus,
        error: dbError
      },
      headers: {
        'user-agent': req.headers['user-agent'],
        'content-type': req.headers['content-type']
      }
    };

    res.status(200).json({
      status: 'debug-ok',
      info: debugInfo
    });
  } catch (error) {
    res.status(500).json({
      status: 'debug-error',
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : null
    });
  }
}