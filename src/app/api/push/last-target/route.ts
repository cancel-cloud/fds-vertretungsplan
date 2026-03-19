import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth/guards';
import { getLastPushTarget } from '@/lib/push-service';

export async function GET() {
  const auth = await requireUser();
  if (auth.response || !auth.user) {
    return auth.response;
  }

  return NextResponse.json(await getLastPushTarget(auth.user.id));
}
