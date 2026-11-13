/*
 * End-to-end acceptance tests for the DAMA self-hosted CMS.
 * Run against a FRESH database (it performs the first-run setup), e.g. staging:
 *   node tests/e2e/make-fixtures.cjs
 *   BASE=https://staging.example SETUP_TOKEN=… node tests/e2e/acceptance.cjs
 * Requires the `playwright` package + Chromium (npx playwright install chromium).
 * WARNING: it edits content (headline, colors, nav, a product, articles) — never run on production.
 */
const { chromium, request } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE = process.env.BASE || 'http://127.0.0.1:3100';
const DIR = path.join(__dirname, 'fixtures');
const SETUP_TOKEN = process.env.SETUP_TOKEN || 'e2e-setup-token-abcdef123456';
const EMAIL = 'owner@dama.test';
const PASSWORD = 'Rendang-Sabar-2026!';
const results = [];
const record = (id, name, pass, detail = '') => {
  results.push({ id, name, pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'}  [${id}] ${name}${detail ? ' — ' + detail : ''}`);
};
async function check(id, name, fn) {
  try {
    const detail = await fn();
    record(id, name, true, typeof detail === 'string' ? detail : '');
  } catch (e) {
    record(id, name, false, (e && e.message ? e.message : String(e)).split('\n')[0].slice(0, 300));
  }
}
const assert = (c, msg) => {
  if (!c) throw new Error(msg);
};

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1400, height: 1000 } });
  const page = await ctx.newPage();
  page.on('dialog', (d) => d.accept(d.type() === 'prompt' ? d.defaultValue() || 'alt uji' : undefined));
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  const anon = await request.newContext({ baseURL: BASE, maxRedirects: 0 });
  const pub = async (p) => {
    const r = await anon.get(p);
    return { status: r.status(), html: await r.text(), headers: r.headers() };
  };
  const publish = async () => {
    const notice = page.locator('[role=status]').filter({ hasText: /Halaman diterbitkan|Artikel diterbitkan|Diterbitkan\. Perubahan/ });
    await page.getByRole('button', { name: 'Terbitkan', exact: true }).click();
    await notice.first().waitFor({ timeout: 20000 });
  };
  /** fetch from inside the admin page (Secure cookies are sent by the browser). */
  const adminFetch = (url, init) => page.evaluate(async ([u, i]) => {
    const r = await fetch(u, i);
    return { status: r.status, text: await r.text() };
  }, [url, init]);

  // ── 1. Login ──
  await check('AC1', 'Login to /admin (first-run setup + login)', async () => {
    await page.goto(`${BASE}/admin`);
    assert(page.url().includes('/admin/setup'), `expected setup redirect, got ${page.url()}`);
    await page.fill('#token', 'wrong-token-xxxxxxxxxxxx');
    await page.fill('#name', 'Pemilik DAMA');
    await page.fill('#email', EMAIL);
    await page.fill('#password', PASSWORD);
    await page.fill('#confirm', PASSWORD);
    await page.click('button[type=submit]');
    await page.getByText('Kode setup salah').waitFor();
    await page.fill('#token', SETUP_TOKEN);
    await page.fill('#password', PASSWORD);
    await page.fill('#confirm', PASSWORD);
    await page.click('button[type=submit]');
    await page.getByText('Akun siap').waitFor();
    await page.goto(`${BASE}/admin/login`);
    await page.fill('#email', EMAIL);
    await page.fill('#password', PASSWORD);
    await Promise.all([page.waitForURL(`${BASE}/admin`), page.click('button[type=submit]')]);
    assert((await page.textContent('h1')).includes('Selamat datang'), 'dashboard not shown');
  });

  const homeId = await (async () => {
    await page.goto(`${BASE}/admin/pages`);
    const href = await page.getByRole('link', { name: 'Beranda', exact: true }).getAttribute('href');
    return href.split('/').pop();
  })();
  const heroHeading = () => page.locator('input[id$="-heading"]').first();

  // ── 2 & 3. Homepage headline ──
  await check('AC2', 'Change homepage headline and publish', async () => {
    await page.goto(`${BASE}/admin/pages/${homeId}`);
    await heroHeading().fill('Masakan rumah, dari hati DAMA');
    await publish();
  });
  await check('AC3', 'Published homepage reflects the new headline', async () => {
    const { html } = await pub('/');
    assert(html.includes('Masakan rumah, dari hati DAMA'), 'headline not on public homepage');
    assert(/<h1[^>]*>Masakan rumah, dari hati DAMA<\/h1>/.test(html), 'headline is not the page h1');
  });

  // ── 4. Replace homepage image ──
  let heroMediaUrl = '';
  await check('AC4', 'Replace homepage images (upload via media picker)', async () => {
    await page.goto(`${BASE}/admin/pages/${homeId}`);
    await page.getByRole('button', { name: /Pilih foto|Ganti foto/ }).first().click();
    const dialog = page.getByRole('dialog', { name: 'Pilih dari media' });
    await dialog.locator('[data-testid=media-file-input]').setInputFiles(path.join(DIR, 'hero.jpg'));
    await dialog.waitFor({ state: 'detached', timeout: 30000 });
    await page.getByLabel('Foto: deskripsi foto').fill('Sepiring rendang hangat di meja keluarga');
    await publish();
    const { html } = await pub('/');
    const m = html.match(/src="(\/media\/[a-z0-9-]+-hero\.webp)\?w=1280"/);
    assert(m, 'uploaded hero image not rendered on homepage');
    heroMediaUrl = m[1];
    assert(html.includes('Sepiring rendang hangat di meja keluarga'), 'alt text missing');
    const img = await anon.get(`${heroMediaUrl}?w=640`);
    assert(img.status() === 200 && img.headers()['content-type'] === 'image/webp', `media fetch ${img.status()}`);
    return heroMediaUrl;
  });

  // ── 5 & 6. Products ──
  await check('AC5', 'Add and edit products', async () => {
    await page.goto(`${BASE}/admin/products/new`);
    await page.fill('#p-name', 'Rendang Uji E2E');
    await page.selectOption('#p-sb', { label: 'LAMAK DAMA' });
    await page.fill('#p-blurb', 'Rendang uji yang dimasak perlahan.');
    await page.fill('#p-price', '99000');
    await page.selectOption('select[aria-label="Status produk"]', 'published');
    await page.getByRole('button', { name: 'Simpan', exact: true }).click();
    await page.waitForURL(/\/admin\/products\/\d+$/, { timeout: 20000 });
    await page.fill('#p-name', 'Rendang Uji E2E Edit');
    await page.getByRole('button', { name: 'Simpan', exact: true }).click();
    await page.getByText('Produk disimpan').first().waitFor();
    const { status, html } = await pub('/menu/rendang-uji-e2e');
    assert(status === 200, `product page ${status}`);
    assert(html.includes('Rendang Uji E2E Edit') && html.includes('Rp 99.000'), 'edited name/price not public');
    assert(html.includes('"@type":"Product"') && html.includes('"price":99000'), 'Product JSON-LD missing');
  });
  await check('AC6', 'Change product prices', async () => {
    await page.goto(`${BASE}/admin/products`);
    const input = page.getByLabel('Harga Rendang', { exact: true });
    await input.fill('123456');
    await input.locator('xpath=..').getByRole('button', { name: 'Simpan' }).click();
    await page.getByText('Harga diperbarui').waitFor();
    const { html } = await pub('/menu');
    assert(html.includes('Rp 123.456'), 'new price not on /menu');
  });

  // ── 7. Article ──
  await check('AC7', 'Create and publish an article', async () => {
    await page.goto(`${BASE}/admin/articles`);
    await page.fill('#new-article', 'Rahasia rendang enam jam');
    await page.getByRole('button', { name: '+ Buat artikel' }).click();
    await page.waitForURL(/\/admin\/articles\/\d+$/);
    await page.fill('#a-excerpt', 'Kenapa kami memasak rendang perlahan.');
    const editor = page.locator('.ProseMirror');
    await editor.click();
    await page.keyboard.type('Rendang yang baik butuh kesabaran. ');
    await page.getByRole('button', { name: 'Tebal' }).click();
    await page.keyboard.type('Api kecil, hati besar.');
    await page.fill('#a-tags', 'rendang, resep');
    await publish();
    const { status, html } = await pub('/catatan-dapur/rahasia-rendang-enam-jam');
    assert(status === 200, `article ${status}`);
    assert(html.includes('<strong>Api kecil, hati besar.</strong>'), 'rich text not rendered');
    assert(html.includes('"@type":"BlogPosting"'), 'BlogPosting JSON-LD missing');
    const list = await pub('/catatan-dapur');
    assert(list.html.includes('Rahasia rendang enam jam'), 'not listed on /catatan-dapur');
  });

  // ── 8. Sections ──
  await check('AC8', 'Add, remove, hide and reorder sections', async () => {
    await page.goto(`${BASE}/admin/pages/${homeId}`);
    const items = page.locator('[data-testid=section-item]');
    const before = await items.count();
    await page.getByRole('button', { name: 'Tambah bagian' }).click();
    await page.getByRole('dialog', { name: 'Pilih jenis bagian' }).getByText('Teks', { exact: true }).click();
    await page.locator('input[id$="-heading"]').first().fill('Bagian Baru Uji');
    assert((await items.count()) === before + 1, 'section not added');
    // New section was inserted after the hero → move it to the top.
    await items.nth(1).getByRole('button', { name: 'Naikkan bagian' }).click();
    // Hide the essence quote, delete the pillars block.
    const quote = items.filter({ hasText: 'Masakan bukan sekadar makanan' });
    await quote.getByRole('button', { name: 'Sembunyikan bagian' }).click();
    const pillars = items.filter({ hasText: 'Empat hal yang tak kami tawar' });
    await pillars.getByRole('button', { name: 'Hapus bagian' }).click();
    assert((await items.count()) === before, 'section not removed');
    await publish();
    const { html } = await pub('/');
    const iNew = html.indexOf('Bagian Baru Uji');
    const iHero = html.indexOf('Masakan rumah, dari hati DAMA');
    assert(iNew > 0 && iNew < iHero, `order wrong (new ${iNew}, hero ${iHero})`);
    assert(!html.includes('Masakan bukan sekadar makanan'), 'hidden section still public');
    assert(!html.includes('Empat hal yang tak kami tawar'), 'deleted section still public');
  });

  // ── 9. Colors ──
  await check('AC9', 'Change global colors', async () => {
    await page.goto(`${BASE}/admin/appearance`);
    await page.fill('#color-primary', '#2A5D5D');
    await page.selectOption('#btn-shape', 'pill');
    await publish();
    const { html } = await pub('/');
    assert(html.includes('--c-teal-100:42 93 93'), 'primary color var not applied');
    assert(html.includes('--btn-radius:999px'), 'button shape not applied');
  });

  // ── 10. Navigation & footer ──
  await check('AC10', 'Change navigation and footer', async () => {
    await page.goto(`${BASE}/admin/navigation`);
    await page.getByLabel('Menu 1: tulisan').fill('Kisah Kami');
    await page.fill('#f-note', 'Catatan footer uji — by DAMA.');
    await publish();
    const { html } = await pub('/');
    assert(html.includes('>Kisah Kami<'), 'nav label not public');
    assert(html.includes('Catatan footer uji — by DAMA.'), 'footer note not public');
  });

  // ── 11. Preview ──
  await check('AC11', 'Preview before publishing (draft visible only in preview)', async () => {
    await page.goto(`${BASE}/admin/pages/${homeId}`);
    await heroHeading().fill('Judul Draf Pratinjau');
    await page.getByRole('button', { name: 'Simpan draf' }).click();
    await page.getByText('Draf tersimpan').first().waitFor();
    const [popup] = await Promise.all([page.waitForEvent('popup'), page.getByRole('button', { name: 'Pratinjau', exact: true }).click()]);
    await popup.waitForLoadState('domcontentloaded');
    const body = await popup.content();
    assert(body.includes('Judul Draf Pratinjau'), 'draft not shown in preview');
    assert(body.includes('Mode pratinjau'), 'preview banner missing');
    await popup.close();
    const { html } = await pub('/');
    assert(!html.includes('Judul Draf Pratinjau') && html.includes('Masakan rumah, dari hati DAMA'), 'draft leaked to public');
  });

  // ── 12. Drafts not public ──
  await check('AC12', 'Drafts are not public', async () => {
    await page.goto(`${BASE}/admin/articles`);
    await page.fill('#new-article', 'Artikel draf rahasia');
    await page.getByRole('button', { name: '+ Buat artikel' }).click();
    await page.waitForURL(/\/admin\/articles\/\d+$/);
    await page.goto(`${BASE}/admin/pages`);
    await page.fill('#new-page', 'Halaman Draf Rahasia');
    await page.getByRole('button', { name: '+ Buat halaman' }).click();
    await page.waitForURL(/\/admin\/pages\/\d+$/);
    const a = await pub('/catatan-dapur/artikel-draf-rahasia');
    const p = await pub('/halaman-draf-rahasia');
    const l = await pub('/catatan-dapur');
    assert(a.status === 404, `draft article status ${a.status}`);
    assert(p.status === 404, `draft page status ${p.status}`);
    assert(!l.html.includes('Artikel draf rahasia'), 'draft listed publicly');
    const s = await pub('/sitemap.xml');
    assert(!s.html.includes('artikel-draf-rahasia') && !s.html.includes('halaman-draf-rahasia'), 'draft in sitemap');
  });

  // ── 13. SEO ──
  let customPageId = '';
  await check('AC13', 'SEO metadata updates correctly', async () => {
    customPageId = page.url().split('/').pop();
    await page.getByRole('tab', { name: 'SEO' }).click();
    await page.fill('#seo-title', 'Judul SEO Uji | DAMA');
    await page.fill('#seo-desc', 'Deskripsi SEO uji untuk halaman ini.');
    await page.getByRole('tab', { name: 'Susunan & isi' }).click();
    await page.getByRole('button', { name: 'Tambah bagian' }).click();
    await page.getByRole('dialog', { name: 'Pilih jenis bagian' }).getByText('Hero (pembuka halaman)', { exact: true }).click();
    await page.locator('input[id$="-heading"]').first().fill('Halaman Uji SEO');
    await publish();
    const { status, html } = await pub('/halaman-draf-rahasia');
    assert(status === 200, `published page ${status}`);
    assert(html.includes('<title>Judul SEO Uji | DAMA</title>'), 'title tag wrong');
    assert(html.includes('<meta name="description" content="Deskripsi SEO uji untuk halaman ini."/>'), 'meta description wrong');
    assert(/<link rel="canonical" href="[^"]+\/halaman-draf-rahasia"\/>/.test(html), 'canonical wrong');
    assert(html.includes('property="og:title" content="Judul SEO Uji | DAMA"'), 'og:title wrong');
  });

  // ── 14. Sitemap ──
  await check('AC14', 'Sitemap includes published pages and articles', async () => {
    const s = await pub('/sitemap.xml');
    assert(s.html.includes('/catatan-dapur/rahasia-rendang-enam-jam'), 'article missing');
    assert(s.html.includes('/halaman-draf-rahasia'), 'custom page missing');
    assert(s.html.includes('/menu/rendang-uji-e2e'), 'product missing');
    assert(!s.html.includes('/artikel-draf-rahasia'), 'draft article present');
    assert(!s.html.includes('/hidang-basamo'), 'disabled sub-brand present');
    const r = await pub('/robots.txt');
    assert(r.html.includes('Disallow: /admin'), 'robots does not block /admin');
  });

  // ── 15. WhatsApp & inquiry ──
  await check('AC15', 'WhatsApp links and inquiry flows work', async () => {
    let r = await anon.get('/go/whatsapp');
    assert(r.status() === 302 && r.headers().location.startsWith('https://wa.me/6281181207201'), `wa redirect ${r.status()} ${r.headers().location}`);
    await page.goto(`${BASE}/admin/settings`);
    await page.fill('#s-whatsappNumber', '6281200000000');
    await publish();
    r = await anon.get('/go/whatsapp');
    assert(r.headers().location.startsWith('https://wa.me/6281200000000'), 'number change not applied');
    const visitor = await browser.newContext();
    const vp = await visitor.newPage();
    await vp.addInitScript(() => {
      window.__opened = [];
      window.open = (u) => { window.__opened.push(String(u)); return null; };
    });
    await vp.goto(`${BASE}/katering`);
    await vp.fill('#inq-jenis', 'Arisan keluarga');
    await vp.fill('#inq-tanggal', '2026-12-20');
    await vp.fill('#inq-pax', '40');
    await vp.fill('#inq-lokasi', 'Jakarta Selatan');
    await vp.locator('form').getByRole('button').last().click();
    await vp.getByText('Terima kasih').waitFor();
    const opened = await vp.evaluate(() => window.__opened);
    assert(opened[0] && opened[0].startsWith('https://wa.me/6281200000000?text=') && decodeURIComponent(opened[0]).includes('Arisan keluarga'), `inquiry link ${opened[0]}`);
    const pesan = await vp.goto(`${BASE}/pesan`).then((x) => x.text());
    assert(pesan.includes('wa.me/6281200000000'), 'channel WhatsApp button not updated');
    assert(!pesan.includes('Pesan via GoFood</a>'), 'disabled GoFood channel button rendered');
    assert(pesan.includes('Lihat di Shopee</a>'), 'Shopee button missing');
    await visitor.close();
    return opened[0].slice(0, 60);
  });

  // ── 17. Backup & restore (admin UI) ──
  const backupPath = path.join(DIR, 'acceptance-backup.json.gz');
  await check('AC17', 'Backup restores (download → change → restore via admin)', async () => {
    const b64 = await page.evaluate(async () => {
      const r = await fetch('/api/admin/backup');
      if (!r.ok) return 'ERR' + r.status;
      const buf = new Uint8Array(await r.arrayBuffer());
      let s = '';
      for (let i = 0; i < buf.length; i += 0x8000) s += String.fromCharCode(...buf.subarray(i, i + 0x8000));
      return btoa(s);
    });
    assert(!b64.startsWith('ERR'), `backup download ${b64}`);
    fs.writeFileSync(backupPath, Buffer.from(b64, 'base64'));
    await page.goto(`${BASE}/admin/products`);
    const input = page.getByLabel('Harga Rendang', { exact: true });
    await input.fill('1');
    await input.locator('xpath=..').getByRole('button', { name: 'Simpan' }).click();
    await page.getByText('Harga diperbarui').waitFor();
    assert((await pub('/menu')).html.includes('Rp 1<'), 'price change before restore not visible');
    await page.goto(`${BASE}/admin/backup`);
    await page.setInputFiles('#restore-file', backupPath);
    await page.fill('#restore-confirm', 'PULIHKAN');
    await page.getByRole('button', { name: 'Pulihkan sekarang' }).click();
    await page.getByText('Pemulihan berhasil').waitFor({ timeout: 60000 });
    const { html } = await pub('/menu');
    assert(html.includes('Rp 123.456') && !html.includes('Rp 1<'), 'price not restored');
    const img = await anon.get(`${heroMediaUrl}?w=640`);
    assert(img.status() === 200, 'media missing after restore');
    return `${(fs.statSync(backupPath).size / 1024).toFixed(0)} KB backup`;
  });

  // ── Security ──
  await check('SEC1', 'Unauthenticated admin access is blocked', async () => {
    const r1 = await anon.get('/admin/products');
    assert([302, 307].includes(r1.status()) && r1.headers().location.includes('/admin/login'), `admin page ${r1.status()}`);
    const r2 = await anon.get('/api/admin/media');
    assert(r2.status() === 401, `api ${r2.status()}`);
    const forged = await request.newContext({ baseURL: BASE, extraHTTPHeaders: { cookie: 'dama_admin=forged-token-value' } });
    const r3 = await forged.get('/api/admin/media');
    assert(r3.status() === 401, `forged cookie api ${r3.status()}`);
    const r4 = await forged.get('/api/admin/backup');
    assert(r4.status() === 401, `forged cookie backup ${r4.status()}`);
    const r5 = await forged.get('/admin/products', { maxRedirects: 0 });
    assert([302, 307].includes(r5.status()), `forged cookie admin page ${r5.status()}`);
    await forged.dispose();
  });
  await check('SEC2', 'Session cookie is HttpOnly, SameSite=Lax, Secure in production', async () => {
    const c = (await ctx.cookies()).find((x) => x.name === 'dama_admin');
    assert(c && c.httpOnly && c.sameSite === 'Lax' && c.secure, JSON.stringify(c));
  });
  await check('SEC3', 'Cross-origin (CSRF) upload with a valid session is rejected', async () => {
    const cookie = (await ctx.cookies()).find((x) => x.name === 'dama_admin');
    const evil = await request.newContext({ baseURL: BASE, extraHTTPHeaders: { cookie: `dama_admin=${cookie.value}`, origin: 'https://evil.example' } });
    const r = await evil.post('/api/admin/media', { multipart: { files: { name: 'a.png', mimeType: 'image/png', buffer: fs.readFileSync(path.join(DIR, 'product.png')) } } });
    assert(r.status() === 401, `cross-origin upload ${r.status()}`);
    const r2 = await evil.delete('/api/admin/media/1');
    assert(r2.status() === 401, `cross-origin delete ${r2.status()}`);
    await evil.dispose();
  });
  await check('SEC4', 'Upload validation (SVG, fake image, oversize rejected)', async () => {
    const up = (name, buffer, mimeType) =>
      page.evaluate(async ([n, b64, t]) => {
        const bin = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
        const fd = new FormData();
        fd.append('files', new File([bin], n, { type: t }));
        const r = await fetch('/api/admin/media', { method: 'POST', body: fd });
        return r.json();
      }, [name, buffer.toString('base64'), mimeType]);
    const svg = await up('evil.svg', fs.readFileSync(path.join(DIR, 'evil.svg')), 'image/svg+xml');
    assert(svg.results[0].error, 'svg accepted');
    const fake = await up('fake.jpg', fs.readFileSync(path.join(DIR, 'fake.jpg')), 'image/jpeg');
    assert(fake.results[0].error, 'fake image accepted');
    const big = await up('big.jpg', Buffer.alloc(9 * 1024 * 1024, 1), 'image/jpeg');
    assert(big.results[0].error, 'oversize accepted');
    const ok = await up('product.png', fs.readFileSync(path.join(DIR, 'product.png')), 'image/png');
    assert(ok.results[0].item && ok.results[0].item.mime === 'image/webp', 'valid png rejected');
    const r = await anon.get(ok.results[0].item.url);
    assert(r.headers()['x-content-type-options'] === 'nosniff' && /sandbox/.test(r.headers()['content-security-policy']), 'media security headers missing');
    // EXIF stripped from the uploaded JPEG
    const hero = await (await anon.get(heroMediaUrl)).body();
    assert(!hero.includes(Buffer.from('Exif')), 'EXIF metadata kept');
  });
  await check('SEC5', 'Rich text / section XSS is sanitized', async () => {
    await page.goto(`${BASE}/admin/pages/${customPageId}`);
    await page.getByRole('button', { name: 'Tambah bagian' }).click();
    await page.getByRole('dialog', { name: 'Pilih jenis bagian' }).getByText('Kutipan / testimoni tunggal', { exact: true }).click();
    await page.locator('textarea[id$="-quote"]').first().fill('<img src=x onerror=alert(1)><script>alert(2)</script>Kutipan aman');
    await publish();
    const { html } = await pub('/halaman-draf-rahasia');
    assert(!/<script>alert\(2\)/.test(html) && !/onerror=alert/.test(html), 'XSS payload rendered');
    assert(html.includes('Kutipan aman'), 'text missing');
  });
  await check('SEC6', 'Security headers present', async () => {
    const { headers } = await pub('/');
    assert(headers['x-frame-options'] === 'SAMEORIGIN', 'x-frame-options');
    assert(headers['x-content-type-options'] === 'nosniff', 'nosniff');
    assert(/frame-ancestors 'self'/.test(headers['content-security-policy'] || ''), 'csp');
    assert(!headers['x-powered-by'], 'x-powered-by exposed');
  });
  await check('SEC7', 'Login rate limiting locks out after repeated failures', async () => {
    const c2 = await browser.newContext();
    const p2 = await c2.newPage();
    let locked = false;
    for (let i = 0; i < 7 && !locked; i++) {
      await p2.goto(`${BASE}/admin/login`);
      await p2.fill('#email', 'attacker@dama.test');
      await p2.fill('#password', `wrong-password-${i}`);
      await p2.click('button[type=submit]');
      const msg = p2.locator('p[role=alert]').filter({ hasText: /salah|Terlalu banyak/ });
      await msg.waitFor();
      locked = (await msg.textContent()).includes('Terlalu banyak');
    }
    await c2.close();
    assert(locked, 'no lockout after 7 attempts');
  });

  console.log('\nBrowser page errors:', errors.length ? errors.slice(0, 5) : 'none');
  fs.writeFileSync(path.join(DIR, 'acceptance-results.json'), JSON.stringify({ heroMediaUrl, results }, null, 2));
  await browser.close();
  const failed = results.filter((r) => !r.pass).length;
  console.log(`\n${results.length - failed}/${results.length} passed`);
  process.exit(failed ? 1 : 0);
})();
