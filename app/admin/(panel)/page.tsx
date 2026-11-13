import Link from 'next/link';
import { desc, eq, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { articles, media, pages, products, settings, subBrands, testimonials } from '@/lib/db/schema';
import { Card, LinkButton, StatusBadge } from '@/components/admin/ui';
import { setupTokenConfigured } from '@/lib/auth/setup';
import { storageDriver } from '@/lib/media';

async function count(table: any, where?: any) {
  const [r] = await db.select({ n: sql<number>`count(*)` }).from(table).where(where);
  return Number(r.n);
}

const fmt = (d: Date) => d.toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

export default async function Dashboard() {
  const [nPages, nProducts, nPublishedProducts, nArticles, nPublishedArticles, nMedia, nSubBrands] = await Promise.all([
    count(pages),
    count(products),
    count(products, eq(products.status, 'published')),
    count(articles),
    count(articles, eq(articles.status, 'published')),
    count(media),
    count(subBrands, eq(subBrands.enabled, true)),
  ]);

  const [recentPages, recentProducts, recentArticles, pending, pendingSettings] = await Promise.all([
    db.select({ id: pages.id, title: pages.title, status: pages.status, hasChanges: pages.hasChanges, updatedAt: pages.updatedAt }).from(pages).orderBy(desc(pages.updatedAt)).limit(5),
    db.select({ id: products.id, title: products.name, status: products.status, updatedAt: products.updatedAt }).from(products).orderBy(desc(products.updatedAt)).limit(5),
    db.select({ id: articles.id, title: articles.title, status: articles.status, hasChanges: articles.hasChanges, updatedAt: articles.updatedAt }).from(articles).orderBy(desc(articles.updatedAt)).limit(5),
    db.select({ id: pages.id, title: pages.title }).from(pages).where(eq(pages.hasChanges, true)),
    db.select({ key: settings.key }).from(settings).where(eq(settings.hasChanges, true)),
  ]);
  const [home] = await db.select({ id: pages.id }).from(pages).where(eq(pages.builtinKey, 'beranda')).limit(1);
  const placeholderTestimonials = await count(testimonials, sql`${testimonials.name} in ('Rina','Pak Hendra','Sari')`);

  const recent = [
    ...recentPages.map((r) => ({ ...r, kind: 'Halaman', href: `/admin/pages/${r.id}` })),
    ...recentProducts.map((r) => ({ ...r, hasChanges: false, kind: 'Produk', href: `/admin/products/${r.id}` })),
    ...recentArticles.map((r) => ({ ...r, kind: 'Artikel', href: `/admin/articles/${r.id}` })),
  ]
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    .slice(0, 8);

  const SETTING_LABEL: Record<string, string> = { site: 'Pengaturan situs', theme: 'Tampilan & warna', navigation: 'Menu & footer' };
  const SETTING_HREF: Record<string, string> = { site: '/admin/settings', theme: '/admin/appearance', navigation: '/admin/navigation' };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Selamat datang 👋</h1>
          <p className="mt-1 text-sm text-stone-600">Kelola isi website DAMA KITCHEN dari sini. Perubahan tayang setelah Anda klik <strong>Terbitkan</strong>.</p>
        </div>
        <LinkButton href="/" target="_blank" variant="secondary">
          Lihat website ↗
        </LinkButton>
      </div>

      {(setupTokenConfigured() || placeholderTestimonials > 0 || pending.length > 0 || pendingSettings.length > 0) && (
        <Card title="Perlu perhatian">
          <ul className="space-y-2 text-sm">
            {setupTokenConfigured() && (
              <li className="text-amber-800">⚠️ <strong>ADMIN_SETUP_TOKEN</strong> masih aktif di server. Hapus dari environment hPanel setelah akun dibuat (lihat Panduan, bab Keamanan).</li>
            )}
            {pending.map((p) => (
              <li key={p.id}>
                📝 Halaman <Link className="font-medium underline" href={`/admin/pages/${p.id}`}>{p.title}</Link> punya perubahan yang belum diterbitkan.
              </li>
            ))}
            {pendingSettings.map((s) => (
              <li key={s.key}>
                📝 <Link className="font-medium underline" href={SETTING_HREF[s.key] ?? '/admin'}>{SETTING_LABEL[s.key] ?? s.key}</Link> punya perubahan yang belum diterbitkan.
              </li>
            ))}
            {placeholderTestimonials > 0 && (
              <li>
                💬 {placeholderTestimonials} testimoni masih contoh (bukan pelanggan sungguhan). Ganti atau sembunyikan di{' '}
                <Link className="font-medium underline" href="/admin/collections">Testimoni</Link>.
              </li>
            )}
          </ul>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Halaman', value: nPages, href: '/admin/pages' },
          { label: 'Produk tayang', value: `${nPublishedProducts} / ${nProducts}`, href: '/admin/products' },
          { label: 'Artikel tayang', value: `${nPublishedArticles} / ${nArticles}`, href: '/admin/articles' },
          { label: 'File media', value: nMedia, href: '/admin/media' },
        ].map((s) => (
          <Link key={s.label} href={s.href} className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm hover:border-[#1F4D4D]/40">
            <p className="text-sm text-stone-500">{s.label}</p>
            <p className="mt-1 text-2xl font-semibold text-stone-900">{s.value}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card title="Terakhir diubah">
          <ul className="divide-y divide-stone-100">
            {recent.map((r) => (
              <li key={`${r.kind}-${r.id}`} className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-sm">
                <div>
                  <span className="mr-2 text-xs text-stone-500">{r.kind}</span>
                  <Link href={r.href} className="font-medium hover:underline">{r.title}</Link>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={r.status} hasChanges={r.hasChanges} />
                  <span className="text-xs text-stone-500">{fmt(r.updatedAt)}</span>
                </div>
              </li>
            ))}
          </ul>
        </Card>
        <Card title="Aksi cepat">
          <div className="grid gap-2">
            <LinkButton href={home ? `/admin/pages/${home.id}` : '/admin/pages'} variant="primary">Ubah Beranda</LinkButton>
            <LinkButton href="/admin/products/new">+ Produk baru</LinkButton>
            <LinkButton href="/admin/articles/new">+ Artikel baru</LinkButton>
            <LinkButton href="/admin/media">Unggah foto</LinkButton>
            <LinkButton href="/admin/appearance">Ubah warna</LinkButton>
            <LinkButton href="/admin/backup">Unduh cadangan</LinkButton>
          </div>
          <p className="mt-4 text-xs text-stone-500">
            {nSubBrands} sub-brand aktif · media disimpan di {storageDriver() === 'database' ? 'database' : 'folder server'}.
          </p>
        </Card>
      </div>
    </div>
  );
}
