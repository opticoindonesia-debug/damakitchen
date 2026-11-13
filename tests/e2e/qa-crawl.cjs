/* Usage: BASE=https://staging.example SITE=https://damakitchen.id node tests/e2e/qa-crawl.cjs  (SITE = NEXT_PUBLIC_SITE_URL used at build) */
/* SEO / structured-data QA crawl of every sitemap URL + key pages. */
const BASE = process.env.BASE || 'http://127.0.0.1:3100';
const SITE = process.env.SITE || 'http://localhost:3000';
(async () => {
  const sm = await (await fetch(`${BASE}/sitemap.xml`)).text();
  const urls = [...new Set([...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(SITE, '')))];
  const extra = ['/faq', '/corporate', '/llms.txt', '/robots.txt'];
  const issues = [];
  const titles = {}, descs = {};
  const links = new Set();
  for (const path of [...urls, ...extra.filter((e) => !urls.includes(e))]) {
    const r = await fetch(BASE + path, { redirect: 'manual' });
    if (r.status !== 200) { issues.push(`${path}: HTTP ${r.status}`); continue; }
    if (!r.headers.get('content-type')?.includes('text/html')) continue;
    const html = await r.text();
    const title = (html.match(/<title>([^<]*)<\/title>/) || [])[1];
    const desc = (html.match(/<meta name="description" content="([^"]*)"/) || [])[1];
    const canon = (html.match(/<link rel="canonical" href="([^"]*)"/) || [])[1];
    const h1 = (html.match(/<h1[\s>]/g) || []).length;
    if (!title) issues.push(`${path}: no title`); else (titles[title] ||= []).push(path);
    if (!desc) issues.push(`${path}: no description`); else (descs[desc] ||= []).push(path);
    if (canon !== `${SITE}${path === '/' ? '' : path}` && canon !== `${SITE}${path}`) issues.push(`${path}: canonical ${canon}`);
    if (h1 !== 1) issues.push(`${path}: ${h1} <h1>`);
    for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
      try { JSON.parse(m[1]); } catch { issues.push(`${path}: invalid JSON-LD`); }
    }
    for (const m of html.matchAll(/<img [^>]*>/g)) if (!/ alt="[^"]+"/.test(m[0])) issues.push(`${path}: img without alt`);
    for (const m of html.matchAll(/href="(\/[^"#?]*)/g)) if (!m[1].startsWith('/_next') && !m[1].startsWith('/media')) links.add(m[1]);
  }
  for (const [t, p] of Object.entries(titles)) if (p.length > 1) issues.push(`duplicate title "${t}": ${p.join(', ')}`);
  for (const [d, p] of Object.entries(descs)) if (p.length > 1) issues.push(`duplicate description on ${p.join(', ')}`);
  for (const l of links) {
    const r = await fetch(BASE + l, { redirect: 'manual' });
    if (![200, 302, 307, 308].includes(r.status)) issues.push(`broken internal link ${l} → ${r.status}`);
  }
  console.log(`checked ${urls.length} sitemap URLs + ${extra.length} extra, ${links.size} internal links`);
  console.log(issues.length ? issues.join('\n') : 'NO ISSUES');
})();
