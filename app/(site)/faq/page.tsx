import Link from 'next/link';
import { Section } from '@/components/Section';
import { BreadcrumbJsonLd, JsonLdScript } from '@/components/JsonLd';
import { buildMetadata } from '@/lib/seo';
import { getFaqs, getSettings, getSubBrands } from '@/lib/cms';

export async function generateMetadata() {
  const { site } = await getSettings();
  return buildMetadata({
    title: 'Tanya Jawab',
    description: 'Jawaban singkat tentang DAMA KITCHEN: siapa kami, lini dan produk, area layanan, serta cara memesan dan meminta penawaran.',
    path: '/faq',
    siteName: site.siteName,
  });
}

/**
 * Answer-first FAQ hub. Every answer is visible HTML (no accordion) and comes
 * from verified admin data: Site Settings, the FAQ collection and each
 * sub-brand's FAQ. Nothing here is hard-coded marketing copy.
 */
export default async function FaqPage() {
  const [{ site }, subBrands, faqs] = await Promise.all([getSettings(), getSubBrands(), getFaqs()]);
  const channels = (['shopee', 'tiktok', 'gofood', 'grab'] as const).filter((c) => site.channels[c].enabled && site.channels[c].url);
  const channelNames: Record<string, string> = { shopee: 'Shopee', tiktok: 'TikTok Shop', gofood: 'GoFood', grab: 'GrabFood' };

  const about: { q: string; a: string; link?: { href: string; label: string } }[] = [
    { q: `Apa itu ${site.siteName}?`, a: site.organizationDescription, link: { href: '/cerita', label: 'Baca cerita DAMA' } },
    {
      q: `Apa arti "${site.tagline}"?`,
      a: `"${site.tagline}" adalah janji DAMA: masakan Minang autentik yang dimasak sepenuh hati, hingga orang yang menikmatinya merasa disayang.`,
    },
    {
      q: `Apa saja lini ${site.siteName}?`,
      a: subBrands.map((sb) => `${sb.name}: ${sb.lead}`).join(' '),
      link: { href: '/menu', label: 'Lihat menu' },
    },
    ...(site.serviceArea ? [{ q: 'Di mana DAMA melayani?', a: site.serviceArea, link: { href: '/kontak', label: 'Hubungi DAMA' } }] : []),
    {
      q: 'Bagaimana cara memesan?',
      a: `Pesan lewat WhatsApp DAMA${channels.length ? ` atau ${channels.map((c) => channelNames[c]).join(', ')}` : ''}. Setiap lini punya cara pesan yang paling cocok — lihat panduannya di halaman Di mana memesan.`,
      link: { href: '/pesan', label: 'Panduan memesan' },
    },
    {
      q: 'Bagaimana perusahaan meminta penawaran?',
      a: 'Isi formulir di halaman Corporate atau chat WhatsApp DAMA dengan kebutuhan, perkiraan jumlah, tanggal, dan lokasi.',
      link: { href: '/corporate', label: 'Minta penawaran corporate' },
    },
  ];

  const groups: { title: string; href?: string; items: { q: string; a: string }[] }[] = [];
  const general = faqs.filter(Boolean);
  if (general.length) groups.push({ title: 'Umum', items: general.map((f) => ({ q: f.q, a: f.a })) });
  for (const sb of subBrands) if (sb.faqs.length) groups.push({ title: sb.name, href: `/${sb.slug}`, items: sb.faqs });

  const all = [...about.map(({ q, a }) => ({ q, a })), ...groups.flatMap((g) => g.items)];

  return (
    <>
      <JsonLdScript
        data={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: all.map((x) => ({ '@type': 'Question', name: x.q, acceptedAnswer: { '@type': 'Answer', text: x.a } })),
        }}
      />
      <BreadcrumbJsonLd items={[{ name: 'Beranda', path: '/' }, { name: 'Tanya Jawab', path: '/faq' }]} />
      <Section eyebrow="Tanya jawab" title={`Tentang ${site.siteName}`} titleAs="h1" intro="Jawaban singkat untuk pertanyaan yang paling sering kami terima.">
        <div className="max-w-prose space-y-10">
          {about.map((x) => (
            <article key={x.q}>
              <h2 className="font-display text-heading text-teal">{x.q}</h2>
              <p className="mt-2 text-body-lg text-ink-soft">{x.a}</p>
              {x.link && (
                <Link href={x.link.href} className="mt-2 inline-block text-caption font-medium text-terracotta-deep underline underline-offset-4">
                  {x.link.label} →
                </Link>
              )}
            </article>
          ))}
        </div>
      </Section>
      {groups.map((g) => (
        <Section key={g.title} dividerAbove eyebrow="Tanya jawab" title={g.title}>
          <div className="max-w-prose space-y-8">
            {g.items.map((x) => (
              <article key={x.q}>
                <h3 className="font-display text-heading text-teal">{x.q}</h3>
                <p className="mt-2 text-body text-ink-soft">{x.a}</p>
              </article>
            ))}
            {g.href && (
              <Link href={g.href} className="inline-block text-caption font-medium text-terracotta-deep underline underline-offset-4">
                Selengkapnya tentang {g.title} →
              </Link>
            )}
          </div>
        </Section>
      ))}
    </>
  );
}
