export async function POST(request) {
  const body = await request.json().catch(() => ({}));

  return Response.json({
    ok: true,
    mode: "frontend-ready",
    message: "Subscription received. Persist this in Supabase notification_devices during backend wiring.",
    hasSubscription: Boolean(body.subscription?.endpoint),
  });
}
