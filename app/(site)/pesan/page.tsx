import Link from 'next/link';
import { Section } from '@/components/Section';
import { ChannelButton } from '@/components/ChannelButton';
import { buildMetadata } from '@/lib/seo';
import { getSubBrands } from '@/lib/cms';

export const metadata = buildMetadata({
  title: 'Di mana memesan',
  description:
    'Satu tempat untuk semua kanal DAMA — kanal mana untuk lini apa, lengkap dengan tautan langsung.',
  path: '/pesan',
});

/** Plain-language note on which channel suits which need, per line. */
const channelNote: Record<string, string> = {
  'lamak-dama': 'Stok beku siap panas — paling praktis lewat Shopee atau TikTok Shop.',
  'warisan-dama': 'Dimasak fresh, jadi pre-order langsung lewat WhatsApp.',
  'hidang-basamo': 'Layanan acara — mulai dari obrolan penawaran di WhatsApp.',
  'dama-kapau': 'Harian via GoFood/GrabFood; pesanan banyak lewat WhatsApp.',
  'tando-mato': 'Paket musiman di Shopee; hampers custom lewat WhatsApp.',
};

export default async function PesanPage() {
  const subBrandList = await getSubBrands();
  return (
    <Section
      eyebrow="Di mana memesan"
      title="Pilih kanal sesuai kebutuhan"
      titleAs="h1"
      intro="Setiap lini punya kanal yang paling pas. Berikut panduan singkatnya — pilih yang paling nyaman untuk Anda."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        {subBrandList.map((sb) => (
          <article
            key={sb.slug}
            className="flex flex-col rounded-lg border border-teal/10 bg-cream-paper p-7 shadow-soft"
            style={{ borderTopColor: sb.markerHex, borderTopWidth: 3 }}
          >
            <div className="flex items-center gap-2.5">
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: sb.markerHex }}
                aria-hidden="true"
              />
              <Link href={`/${sb.slug}`} className="font-display text-heading text-teal hover:underline">
                {sb.name}
              </Link>
            </div>
            <p className="mt-3 text-caption text-ink-soft">{channelNote[sb.slug]}</p>
            <div className="mt-5 flex flex-wrap gap-3">
              {sb.channels.map((c) => (
                <ChannelButton key={c} channel={c} />
              ))}
            </div>
          </article>
        ))}
      </div>
    </Section>
  );
}
