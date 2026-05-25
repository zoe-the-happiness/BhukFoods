import webpush from "web-push";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";

let _configured = false;
function configure() {
  if (_configured) return;
  const pub = process.env.VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  const subj = process.env.VAPID_SUBJECT || "mailto:hello@bhukfoods.com";
  if (!pub || !priv) throw new Error("VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY not set");
  webpush.setVapidDetails(subj, pub, priv);
  _configured = true;
}

export type PushPayload = {
  title: string;
  body: string;
  url?: string;
  tag?: string;
};

/**
 * Send a push notification to every active subscription for the given user
 * IDs. Stale (410 / 404) subscriptions are deleted automatically.
 */
export async function sendPushToUsers(
  userIds: string[],
  payload: PushPayload,
): Promise<{ sent: number; failed: number; pruned: number }> {
  if (userIds.length === 0) return { sent: 0, failed: 0, pruned: 0 };
  configure();
  const admin = createSupabaseAdminClient();
  const { data: subs } = await admin
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth, user_id")
    .in("user_id", userIds);

  if (!subs || subs.length === 0) return { sent: 0, failed: 0, pruned: 0 };

  const body = JSON.stringify(payload);
  let sent = 0;
  let failed = 0;
  let pruned = 0;
  const toPrune: string[] = [];

  await Promise.all(
    subs.map(async (s) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: s.endpoint,
            keys: { p256dh: s.p256dh, auth: s.auth },
          },
          body,
        );
        sent++;
      } catch (err) {
        const status = (err as { statusCode?: number }).statusCode;
        if (status === 404 || status === 410) {
          toPrune.push(s.id);
        }
        failed++;
      }
    }),
  );
  if (toPrune.length > 0) {
    await admin.from("push_subscriptions").delete().in("id", toPrune);
    pruned = toPrune.length;
  }
  return { sent, failed, pruned };
}

/** Convenience: notify the admin (lookup by role). */
export async function sendPushToAdmin(payload: PushPayload) {
  const admin = createSupabaseAdminClient();
  const { data: rows } = await admin
    .from("profiles")
    .select("id")
    .eq("role", "admin")
    .eq("is_active", true);
  return sendPushToUsers((rows ?? []).map((r) => r.id), payload);
}

/** Convenience: notify all cooks. */
export async function sendPushToCooks(payload: PushPayload) {
  const admin = createSupabaseAdminClient();
  const { data: rows } = await admin
    .from("profiles")
    .select("id")
    .eq("role", "cook")
    .eq("is_active", true);
  return sendPushToUsers((rows ?? []).map((r) => r.id), payload);
}

/** Convenience: notify all active customers. */
export async function sendPushToAllCustomers(payload: PushPayload) {
  const admin = createSupabaseAdminClient();
  const { data: rows } = await admin
    .from("profiles")
    .select("id")
    .eq("role", "customer")
    .eq("is_active", true);
  return sendPushToUsers((rows ?? []).map((r) => r.id), payload);
}
