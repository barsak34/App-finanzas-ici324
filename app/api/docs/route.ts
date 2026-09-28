import { NextResponse } from 'next/server';
import { swaggerSpec } from '@/lib/swagger-spec';

/**
 * GET /api/docs
 * Devuelve la especificación OpenAPI 3.0 en formato JSON
 */
export async function GET() {
  return NextResponse.json(swaggerSpec, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
    },
  });
}
