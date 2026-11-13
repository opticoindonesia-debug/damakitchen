import { site as siteConst } from '@/content/site';
import { getJournalPosts, getPageSlugs, getProducts, getSettings, getSubBrands } from '@/lib/cms';
import { indexingEnabled } from '@/lib/indexing';

export const dynamic = 'force-dynamic';

/**
 * /llms.txt — a plain-language index of DAMA's published pages for AI
 * assistants (llmstxt.org format). Informational only; it is not a ranking
 * factor. Built from live published data, so it only lists working URLs.
 */
export async function GET() {
  const [{ site }, subBrands, products, articles, pageSlugs] = await Promise.all([getSettings(), getSubBrands(), getProducts(), getJournalPosts(), getPageSlugs()]);
  const U = siteConst.url.replace(/\/$/, '');
  const line = (title: string, path: string, note?: string) => `- [${title}](${U}${path})${note ? `: ${note}` : ''}`;
  const out = [
    `# ${site.siteName}`,
    '',
    `> ${site.organizationDescription}`,
    '',
    `Janji brand: ${site.tagline}. Spesialisasi: masakan Minang (Minangkabau). ${site.serviceArea}`.trim(),
    `Pemesanan: WhatsApp https://wa.me/${site.whatsappNumber}. Situs resmi: ${U}/`,
    '',
    '## Tentang',
    line('Cerita DAMA', '/cerita', 'asal-usul, nilai, dan janji Taraso Disayang'),
    line('Tanya jawab', '/faq', 'jawaban singkat tentang DAMA, lini, area layanan, dan cara memesan'),
    line('Kontak', '/kontak'),
    '',
    '## Lini (sub-brand)',
    ...subBrands.map((sb) => line(sb.name, `/${sb.slug}`, sb.lead)),
    '',
    '## Layanan',
    line('Katering & acara', '/katering'),
    line('Corporate (nasi kotak & hampers untuk perusahaan)', '/corporate'),
    line('Hadiah & hampers', '/hadiah'),
    line('Di mana memesan', '/pesan', 'kanal pemesanan per lini'),
    '',
    '## Menu',
    line('Seluruh menu', '/menu'),
    ...products.map((p) => line(p.name, `/menu/${p.slug}`, p.blurb)),
    ...(articles.length ? ['', '## Catatan Dapur (artikel)', line('Semua artikel', '/catatan-dapur'), ...articles.map((a) => line(a.title, `/catatan-dapur/${a.slug}`, a.excerpt))] : []),
    ...(pageSlugs.length ? ['', '## Halaman lain', ...pageSlugs.map((s) => line(s, `/${s}`))] : []),
    '',
  ].join('\n');
  return new Response(out, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
      ...(indexingEnabled() ? {} : { 'X-Robots-Tag': 'noindex' }),
    },
  });
}
