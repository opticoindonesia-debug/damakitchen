import { Section } from '@/components/Section';
import { ChannelButton } from '@/components/ChannelButton';
import { buildMetadata } from '@/lib/seo';
import { contact } from '@/content/channels';
import { getSiteSettings } from '@/lib/cms';

export const metadata = buildMetadata({
  title: 'Kontak',
  description: 'Sapa DAMA lewat WhatsApp, email, atau media sosial. Kami senang mendengar dari Anda.',
  path: '/kontak',
});

export default async function KontakPage() {
  const settings = await getSiteSettings();
  return (
    <Section
      eyebrow="Kontak"
      title="Senang bisa menyapa Anda"
      titleAs="h1"
      intro="Cara tercepat menghubungi kami adalah lewat WhatsApp. Bisa juga lewat email atau media sosial."
    >
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="space-y-8">
          <div>
            <h2 className="text-label font-semibold uppercase tracking-[0.18em] text-terracotta-deep">
              WhatsApp
            </h2>
            <p className="mt-2 text-body text-ink-soft">Paling cepat untuk pesanan dan pertanyaan.</p>
            <div className="mt-4">
              <ChannelButton channel="whatsapp" />
            </div>
          </div>

          <div>
            <h2 className="text-label font-semibold uppercase tracking-[0.18em] text-terracotta-deep">
              Email
            </h2>
            <p className="mt-2">
              <a
                href={`mailto:${settings.email}`}
                className="text-body text-teal underline underline-offset-4"
              >
                {settings.email}
              </a>
            </p>
          </div>

          <div>
            <h2 className="text-label font-semibold uppercase tracking-[0.18em] text-terracotta-deep">
              Media sosial
            </h2>
            <ul className="mt-2 space-y-2 text-body text-teal">
              <li>
                <a href={settings.instagram} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
                  Instagram {contact.instagram.handle}
                </a>
              </li>
              <li>
                <a href={settings.tiktok} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
                  TikTok {contact.tiktok.handle}
                </a>
              </li>
              <li>
                <a href={settings.threads} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
                  Threads {contact.threads.handle}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <aside className="rounded-lg border border-teal/10 bg-cream-paper p-8">
          <h2 className="font-display text-heading text-teal">Area layanan</h2>
          <p className="mt-3 text-body text-ink-soft">{settings.coverage}</p>
        </aside>
      </div>
    </Section>
  );
}
