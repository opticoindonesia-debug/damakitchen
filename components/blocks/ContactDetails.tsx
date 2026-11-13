import { ChannelButton } from '@/components/ChannelButton';
import { getSettings } from '@/lib/cms';
import { socialHandle } from '@/lib/utils';

/** WhatsApp / email / phone / socials + service area & hours (from Pengaturan Situs). */
export async function ContactDetails({ showChannels = false }: { showChannels?: boolean }) {
  const { site } = await getSettings();
  const socials = [
    { label: 'Instagram', href: site.instagram },
    { label: 'TikTok', href: site.tiktok },
    { label: 'Threads', href: site.threads },
    { label: 'Facebook', href: site.facebook },
    { label: 'YouTube', href: site.youtube },
  ].filter((s) => s.href);
  const label = 'text-label font-semibold uppercase tracking-[0.18em] text-terracotta-deep';
  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <div className="space-y-8">
        <div>
          <h2 className={label}>WhatsApp</h2>
          <p className="mt-2 text-body text-ink-soft">Paling cepat untuk pesanan dan pertanyaan.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <ChannelButton channel="whatsapp" />
            {showChannels && (['shopee', 'tiktok', 'gofood', 'grab'] as const).map((c) => <ChannelButton key={c} channel={c} />)}
          </div>
        </div>

        {(site.email || site.phone) && (
          <div>
            <h2 className={label}>Email & telepon</h2>
            <ul className="mt-2 space-y-1">
              {site.email && (
                <li>
                  <a href={`mailto:${site.email}`} className="text-body text-teal underline underline-offset-4">
                    {site.email}
                  </a>
                </li>
              )}
              {site.phone && (
                <li>
                  <a href={`tel:${site.phone.replace(/[^+0-9]/g, '')}`} className="text-body text-teal underline underline-offset-4">
                    {site.phone}
                  </a>
                </li>
              )}
            </ul>
          </div>
        )}

        {socials.length > 0 && (
          <div>
            <h2 className={label}>Media sosial</h2>
            <ul className="mt-2 space-y-2 text-body text-teal">
              {socials.map((s) => (
                <li key={s.label}>
                  <a href={s.href} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
                    {s.label} {socialHandle(s.href)}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <aside className="rounded-lg border border-teal/10 bg-cream-paper p-8">
        <h2 className="font-display text-heading text-teal">Area layanan</h2>
        <p className="mt-3 text-body text-ink-soft">{site.serviceArea}</p>
        {site.address && (
          <>
            <h3 className="mt-6 font-display text-body-lg text-teal">Alamat</h3>
            <p className="mt-1 text-body text-ink-soft">{site.address}</p>
          </>
        )}
        {site.operatingHours && (
          <>
            <h3 className="mt-6 font-display text-body-lg text-teal">Jam operasional</h3>
            <p className="mt-1 text-body text-ink-soft">{site.operatingHours}</p>
          </>
        )}
      </aside>
    </div>
  );
}
