/**
 * Mirrors a website inquiry into the Antam owner portal (a separate Supabase
 * project) so every enquiry lands in one pipeline instead of only in an inbox.
 *
 * Deliberately fire-and-forget: the e-mail in `sendInquiry` is the delivery that
 * matters, so a failure here must never surface to the owner or block the form.
 * The portal key is a publishable anon key and the `web_inquiries` table grants
 * anon INSERT only (no SELECT), so nothing readable is exposed by shipping it.
 */
const PORTAL_URL = "https://lgjqhbdcjvxktdcqzeff.supabase.co";
const PORTAL_KEY = "sb_publishable_jwKs85PSRQcNGfbm32IYZw_guW0hWqE";

export type PortalInquiry = {
  name: string;
  phone?: string;
  email?: string;
  location?: string;
  size?: string;
  status?: string;
  contact_pref?: string;
  energy?: string;
  message?: string;
  lang: string;
  /** Verze konfigurace kalkulačky, pod kterou majitel číslo viděl. */
  calc_model_version?: string;
  /** Co majitel naklikal, včetně kbelíku velikosti a plochy, která šla do modelu. */
  calc_inputs?: Record<string, unknown>;
  /** Co mu web ukázal. Spolu s verzí to jde zpětně zrekonstruovat. */
  calc_result?: Record<string, unknown>;
};

export async function mirrorInquiryToPortal(row: PortalInquiry): Promise<void> {
  try {
    await fetch(`${PORTAL_URL}/rest/v1/web_inquiries`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: PORTAL_KEY,
        Authorization: `Bearer ${PORTAL_KEY}`,
        Prefer: "return=minimal",
      },
      body: JSON.stringify(row),
    });
  } catch {
    /* never let the portal mirror affect the form */
  }
}
