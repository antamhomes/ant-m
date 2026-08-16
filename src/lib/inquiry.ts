/**
 * Sends the contact form to the `send-transactional-email` edge function with a
 * plain fetch. This mirrors exactly what supabase-js `functions.invoke` sends
 * (apikey + Bearer anon key), but keeps the whole supabase-js client out of the
 * bundle: the site only ever needs this one call.
 */
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

export type InquiryPayload = {
  templateName: string;
  recipientEmail: string;
  idempotencyKey: string;
  templateData: Record<string, string>;
};

export async function sendInquiry(payload: InquiryPayload): Promise<void> {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/send-transactional-email`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    let detail = "";
    try {
      detail = await res.text();
    } catch {
      /* ignore */
    }
    throw new Error(`send-transactional-email ${res.status}${detail ? `: ${detail.slice(0, 200)}` : ""}`);
  }
}
