import { ImageWithScrim } from '@/components/ImageWithScrim';
import { Reveal } from '@/components/Reveal';
import { getProductsBySubBrand } from '@/lib/cms';

const tierMeta: Record<string, string> = {
  'tando-si-ketek': '1 porsi',
  'tando-si-sedang': '2–3 porsi',
  'tando-si-gadang': '5–8 porsi',
};

/** TANDO MATO hamper tiers (used on /hadiah and by the page builder). */
export async function GiftTiers() {
  const tiers = await getProductsBySubBrand('tando-mato');
  return (
    <div className="grid gap-6 sm:grid-cols-3">
      {tiers.map((t, i) => (
        <Reveal key={t.id} delay={i * 0.07}>
          <article className="flex h-full flex-col overflow-hidden rounded-lg border border-teal/10 bg-cream-paper shadow-soft">
            <ImageWithScrim
              category="product"
              ratio="landscape"
              rounded={false}
              src={t.image}
              alt={`Hampers ${t.name} dari TANDO MATO — ${t.blurb}`}
            />
            <div className="flex flex-1 flex-col p-6">
              {tierMeta[t.id] && (
                <span className="text-label uppercase tracking-[0.14em] text-ink-soft">{tierMeta[t.id]}</span>
              )}
              <h3 className="mt-1 font-display text-heading text-teal">{t.name}</h3>
              <p className="mt-2 flex-1 text-caption text-ink-soft">{t.blurb}</p>
            </div>
          </article>
        </Reveal>
      ))}
    </div>
  );
}
