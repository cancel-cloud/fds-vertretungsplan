import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth/guards';
import { enforceSameOrigin } from '@/lib/security/request-integrity';
import { removePushSubscriptionForUser } from '@/lib/push-service';

export async function DELETE(req: NextRequest) {
  const invalidOriginResponse = enforceSameOrigin(req);
  if (invalidOriginResponse) {
    return invalidOriginResponse;
  }

  const auth = await requireUser();
  if (auth.response || !auth.user) {
    return auth.response;
  }

  try {
    const body = (await req.json()) as { endpoint?: string };
    const endpoint = String(body.endpoint ?? '').trim();

    if (!endpoint) {
      return NextResponse.json({ error: 'Endpoint fehlt.' }, { status: 400 });
    }

    await removePushSubscriptionForUser(auth.user.id, endpoint);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Failed to delete push subscription', error);
    return NextResponse.json({ error: 'Push-Subscription konnte nicht gelöscht werden.' }, { status: 500 });
  }
}
