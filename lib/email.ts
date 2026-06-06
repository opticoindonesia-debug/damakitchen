/**
 * Pluggable email adapter (§2, §15). v1 routes inquiries to WhatsApp; email is
 * optional. No provider is hardcoded — wire one here behind the env stub.
 *
 * TODO: choose a provider (e.g. Resend) and implement send(). Provide the API
 * key via INQUIRY_EMAIL_API_KEY and the destination via INQUIRY_EMAIL_TO.
 */

export interface InquiryEmail {
  subject: string;
  /** Plain-text body (already formatted on-voice). */
  text: string;
}

export async function sendInquiryEmail(payload: InquiryEmail): Promise<{ sent: boolean }> {
  const apiKey = process.env.INQUIRY_EMAIL_API_KEY;
  const to = process.env.INQUIRY_EMAIL_TO;

  if (!apiKey || !to) {
    // Not configured — that's fine for v1. WhatsApp is the primary channel.
    return { sent: false };
  }

  // TODO: implement the actual provider call here, e.g.:
  // await resend.emails.send({ from, to, subject: payload.subject, text: payload.text });
  void payload;
  return { sent: false };
}
