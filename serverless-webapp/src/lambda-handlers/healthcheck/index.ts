/**
 * FIXME #4
 * 1. Health Check
 * 2. Version
 */
export async function handler(event: any, _context: any) {
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event, undefined, 2),
    };
  }