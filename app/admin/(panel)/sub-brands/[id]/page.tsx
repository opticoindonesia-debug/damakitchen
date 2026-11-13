import { notFound } from 'next/navigation';
import { asc, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { subBrands } from '@/lib/db/schema';
import { formContext } from '@/lib/admin/context';
import { SubBrandEditor, type SubBrandForm } from './SubBrandEditor';

export default async function EditSubBrand({ params }: { params: { id: string } }) {
  const [ctx, all] = await Promise.all([formContext(), db.select({ slug: subBrands.slug, name: subBrands.name }).from(subBrands).orderBy(asc(subBrands.sortOrder))]);
  if (params.id === 'new') {
    const empty: SubBrandForm = { slug: '', name: '', shortName: '', emotion: '', lead: '', about: '', howToOrder: '', channelNote: '', markerHex: '#1F7A6E', heroImage: undefined, channels: ['whatsapp'], faqs: [], crossSell: [], extraSections: [], seo: {}, enabled: false };
    return <SubBrandEditor id={null} initial={empty} ctx={ctx} all={all} />;
  }
  const id = Number(params.id);
  if (!Number.isInteger(id)) notFound();
  const [r] = await db.select().from(subBrands).where(eq(subBrands.id, id)).limit(1);
  if (!r) notFound();
  const initial: SubBrandForm = {
    slug: r.slug,
    name: r.name,
    shortName: r.shortName,
    emotion: r.emotion,
    lead: r.lead,
    about: r.about,
    howToOrder: r.howToOrder,
    channelNote: r.channelNote ?? '',
    markerHex: r.markerHex,
    heroImage: r.heroImage ?? undefined,
    channels: r.channels,
    faqs: r.faqs,
    crossSell: r.crossSell,
    extraSections: r.extraSections as SubBrandForm['extraSections'],
    seo: r.seo ?? {},
    enabled: r.enabled,
  };
  return <SubBrandEditor id={r.id} initial={initial} ctx={ctx} all={all} />;
}
