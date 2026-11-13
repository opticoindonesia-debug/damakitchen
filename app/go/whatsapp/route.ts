import { getSettings } from '@/lib/cms';

export const dynamic = 'force-dynamic';

/**
 * Editors can type "whatsapp" as any button/menu link; it points here and is
 * redirected to the WhatsApp number currently set in Pengaturan Situs.
 */
export async function GET(req: Request) {
  const { site } = await getSettings();
  const text = new URL(req.url).searchParams.get('text')?.slice(0, 500) || site.whatsappMessage;
  return Response.redirect(`https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(text)}`, 302);
}
