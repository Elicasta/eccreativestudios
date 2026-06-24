export async function POST() {
  return Response.json({
    ok: false,
    mode: "server-push-not-configured",
    message: "Add VAPID private key and a Supabase notification_devices table before server-side push can send from this endpoint.",
  }, { status: 501 });
}
