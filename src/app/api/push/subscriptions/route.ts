import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth/guards';
import { listPushSubscriptionsForUser } from '@/lib/push-service';

export async function GET() {
  const auth = await requireUser();
  if (auth.response || !auth.user) {
    return auth.response;
  }

  try {
    const subscriptions = await listPushSubscriptionsForUser(auth.user.id);

    return NextResponse.json({ subscriptions });
  } catch (error) {
    console.error('Failed to load push subscriptions', error);
    return NextResponse.json({ error: 'Push-Geräte konnten nicht geladen werden.' }, { status: 500 });
  }
}
