import { site } from '@/content/site';
import { getSettings } from '@/lib/cms';
import { AI_TRAINING_BOTS, indexingEnabled } from '@/lib/indexing';

export const dynamic = 'force-dynamic';

/**
 * robots.txt, evaluated at request time (so SITE_INDEXING works without a rebuild).
 * Production: all search & answer-engine crawlers may crawl the public site
 * (admin, APIs and redirect helpers excluded). AI *training* crawlers are
 * blocked only if the owner switches that off in Pengaturan situs.
 * Staging (SITE_INDEXING != true): everything disallowed + noindex headers.
 */
export async function GET() {
  const text = (body: string) => new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=3600' } });
  if (!indexingEnabled()) return text('# Staging — not for indexing\nUser-agent: *\nDisallow: /\n');
  const allowTraining = await getSettings()
    .then((s) => s.site.allowAiTraining)
    .catch(() => true);
  const lines = ['User-agent: *', 'Allow: /', 'Disallow: /admin', 'Disallow: /api/', 'Disallow: /go/', ''];
  if (!allowTraining) {
    lines.push('# AI model-training crawlers (owner opted out). Search/answer crawlers remain allowed.');
    for (const bot of AI_TRAINING_BOTS) lines.push(`User-agent: ${bot}`);
    lines.push('Disallow: /', '');
  }
  lines.push(`Sitemap: ${site.url.replace(/\/$/, '')}/sitemap.xml`, '');
  return text(lines.join('\n'));
}
