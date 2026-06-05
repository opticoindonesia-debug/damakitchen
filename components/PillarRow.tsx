import { pillars } from '@/content/pillars';
import { pillarIconMap } from './icons';
import { Reveal } from './Reveal';

/**
 * The four brand pillars as a calm 4-up line-icon row (§5.3).
 */
export function PillarRow() {
  return (
    <ul className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
      {pillars.map((pillar, i) => {
        const Icon = pillarIconMap[pillar.icon];
        return (
          <Reveal as="li" key={pillar.title} delay={i * 0.07}>
            <div className="text-terracotta">
              <Icon width={32} height={32} />
            </div>
            <h3 className="mt-4 font-display text-heading text-teal">{pillar.title}</h3>
            <p className="mt-2 text-caption text-ink-soft">{pillar.desc}</p>
          </Reveal>
        );
      })}
    </ul>
  );
}
