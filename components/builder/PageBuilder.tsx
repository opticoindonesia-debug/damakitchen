import type { Section } from '@/lib/cms';
import { SeasonalBanner } from '@/components/blocks/SeasonalBanner';
import {
  CardsBlock,
  CtaBlock,
  DividerBlock,
  FaqBlock,
  FeaturesBlock,
  FormBlock,
  GalleryBlock,
  HeroBlock,
  QuoteSectionBlock,
  SplitBlock,
  TextBlock,
} from './blocks';
import { DataBlock } from './DataBlock';
import type { HeadingTag } from './shell';

/** True when a section renders a title that can serve as the page's <h1>. */
const hasHeading = (s: Section) =>
  Boolean(s.heading) ||
  (s._type === 'ctaSection' && Array.isArray(s.panels) && s.panels.length > 0);

/**
 * Renders a page from Studio sections. The first section with a heading gets
 * the page's single <h1>; all others use <h2> (correct heading order for SEO).
 */
export function PageBuilder({ sections, h1 = true }: { sections: Section[]; h1?: boolean }) {
  const visible = sections.filter((s) => s && !s.hidden);
  const firstHeading = h1 ? visible.findIndex(hasHeading) : -1;

  return (
    <>
      {visible.map((s, i) => {
        const headingAs: HeadingTag = i === firstHeading ? 'h1' : 'h2';
        const key = s._key ?? `${s._type}-${i}`;
        switch (s._type) {
          case 'heroSection':
            return <HeroBlock key={key} s={s} headingAs={headingAs} />;
          case 'textSection':
            return <TextBlock key={key} s={s} headingAs={headingAs} />;
          case 'splitSection':
            return <SplitBlock key={key} s={s} headingAs={headingAs} />;
          case 'quoteSection':
            return <QuoteSectionBlock key={key} s={s} />;
          case 'cardsSection':
            return <CardsBlock key={key} s={s} headingAs={headingAs} />;
          case 'featuresSection':
            return <FeaturesBlock key={key} s={s} headingAs={headingAs} />;
          case 'ctaSection':
            return <CtaBlock key={key} s={s} headingAs={headingAs} />;
          case 'faqSection':
            return <FaqBlock key={key} s={s} headingAs={headingAs} />;
          case 'gallerySection':
            return <GalleryBlock key={key} s={s} headingAs={headingAs} />;
          case 'formSection':
            return <FormBlock key={key} s={s} headingAs={headingAs} />;
          case 'dividerSection':
            return <DividerBlock key={key} s={s} />;
          case 'dataSection':
            return s.source === 'seasonalBanner' ? (
              <SeasonalBanner key={key} />
            ) : (
              <DataBlock key={key} s={s} headingAs={headingAs} />
            );
          default:
            return null;
        }
      })}
    </>
  );
}
