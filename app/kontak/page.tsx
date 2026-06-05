import { Section } from '@/components/Section';
import { ChannelButton } from '@/components/ChannelButton';
import { buildMetadata } from '@/lib/seo';
import { contact } from '@/content/channels';

export const metadata = buildMetadata({
  title: 'Kontak',
  description: 'Sapa DAMA lewat WhatsApp, email, atau media sosial. Kami senang mendengar dari Anda.',
  path: '/kontak',
});

export default function KontakPage() {
  return (
    <Section
      eyebrow="Kontak"
      title="Senang bisa menyapa Anda"
      intro="Cara tercepat menghubungi kami adalah lewat WhatsApp. Bisa juga lewat email atau media sosial."
    >
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="space-y-8">
          <div>
            <h2 className="text-label font-semibold uppercase tracking-[0.18em] text-terracotta">
              WhatsApp
            </h2>
            <p className="mt-2 text-body text-ink-soft">Paling cepat untuk pesanan dan pertanyaan.</p>
            <div className="mt-4">
              <ChannelButton channel="whatsapp" />
            </div>
          </div>

          <div>
            <h2 className="text-label font-semibold uppercase tracking-[0.18em] text-terracotta">
              Email
            </h2>
            <p className="mt-2">
              <a
                href={`mailto:${contact.email}`}
                className="text-body text-teal underline underline-offset-4"
              >
                {contact.email}
              </a>
            </p>
          </div>

          <div>
            <h2 className="text-label font-semibold uppercase tracking-[0.18em] text-terracotta">
              Media sosial
            </h2>
            <ul className="mt-2 space-y-2 text-body text-teal">
              <li>
                <a href={contact.instagram.href} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
                  Instagram {contact.instagram.handle}
                </a>
              </li>
              <li>
                <a href={contact.tiktok.href} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
                  TikTok {contact.tiktok.handle}
                </a>
              </li>
              <li>
                <a href={contact.threads.href} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
                  Threads {contact.threads.handle}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <aside className="rounded-lg border border-teal/10 bg-cream-paper p-8">
          <h2 className="font-display text-heading text-teal">Area layanan</h2>
          <p className="mt-3 text-body text-ink-soft">{contact.coverage}</p>
        </aside>
      </div>
    </Section>
  );
}
