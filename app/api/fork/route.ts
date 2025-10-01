import { NextRequest } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const body = await request.json();
  return Response.json({ message: 'Forking not yet implemented in mock backend', request: body });
}
