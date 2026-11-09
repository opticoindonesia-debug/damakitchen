import Link from 'next/link';
import { ChannelButton } from '@/components/ChannelButton';
import { getSubBrands } from '@/lib/cms';

/** Per-line "which channel for what" guide (used on /pesan and by the page builder). */
export async function ChannelMatrix() {
  const subBrandList = await getSubBrands();
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {subBrandList.map((sb) => (
        <article
          key={sb.slug}
          className="flex flex-col rounded-lg border border-teal/10 bg-cream-paper p-7 shadow-soft"
          style={{ borderTopColor: sb.markerHex, borderTopWidth: 3 }}
        >
          <div className="flex items-center gap-2.5">
            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: sb.markerHex }} aria-hidden="true" />
            <Link href={`/${sb.slug}`} className="font-display text-heading text-teal hover:underline">
              {sb.name}
            </Link>
          </div>
          {sb.channelNote && <p className="mt-3 text-caption text-ink-soft">{sb.channelNote}</p>}
          <div className="mt-5 flex flex-wrap gap-3">
            {sb.channels.map((c) => (
              <ChannelButton key={c} channel={c} />
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}
