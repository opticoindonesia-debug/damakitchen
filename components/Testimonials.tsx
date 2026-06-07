import type { Testimonial } from '@/content/testimonials';
import { Section } from './Section';
import { Reveal } from './Reveal';

/**
 * Calm testimonials row (§8). Honest, real-voice quotes — customers have names.
 */
export function Testimonials({ items }: { items: Testimonial[] }) {
  if (!items.length) return null;
  return (
    <Section eyebrow="Kata mereka" title="Cerita dari yang sudah mencoba">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((t, i) => (
          <Reveal key={`${t.name}-${i}`} delay={(i % 3) * 0.06}>
            <figure className="flex h-full flex-col rounded-lg border border-teal/10 bg-cream-paper p-7 shadow-soft">
              <blockquote className="flex-1 font-display text-body-lg italic text-teal">
                “{t.quote}”
              </blockquote>
              <figcaption className="mt-5 text-caption text-ink-soft">
                <span className="font-medium text-ink">{t.name}</span>
                {t.context ? ` · ${t.context}` : ''}
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
