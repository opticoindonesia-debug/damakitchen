import type { StructureResolver } from 'sanity/structure';
import {
  CogIcon,
  TagIcon,
  PackageIcon,
  DocumentTextIcon,
  DocumentsIcon,
  StarIcon,
  HeartIcon,
  CommentIcon,
  HomeIcon,
  MasterDetailIcon,
} from '@sanity/icons';
import { BUILT_IN_PAGES, BUILT_IN_PAGE_IDS, builtInPageId, type BuiltInPageKey } from '@/lib/pages';

/**
 * Desk structure tuned for non-technical editors (WordPress-like):
 * Pengaturan Situs → Halaman Situs (the main pages, each a fixed document) →
 * Halaman Tambahan (new pages) → content collections.
 */
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Konten DAMA KITCHEN')
    .items([
      S.listItem()
        .title('Pengaturan Situs')
        .id('siteSettings')
        .icon(CogIcon)
        .child(S.document().schemaType('siteSettings').documentId('siteSettings')),
      S.divider(),
      S.listItem()
        .title('Halaman Situs')
        .id('halaman-situs')
        .icon(HomeIcon)
        .child(
          S.list()
            .title('Halaman Situs')
            .items(
              (Object.keys(BUILT_IN_PAGES) as BuiltInPageKey[]).map((key) =>
                S.listItem()
                  .title(`${BUILT_IN_PAGES[key].title}  (${BUILT_IN_PAGES[key].path})`)
                  .id(builtInPageId(key))
                  .icon(MasterDetailIcon)
                  .child(
                    S.document()
                      .schemaType('page')
                      .documentId(builtInPageId(key))
                      .title(BUILT_IN_PAGES[key].title),
                  ),
              ),
            ),
        ),
      S.listItem()
        .title('Halaman Tambahan')
        .id('halaman-tambahan')
        .icon(DocumentsIcon)
        .child(
          S.documentTypeList('page')
            .title('Halaman Tambahan')
            .filter('_type == "page" && !(_id in $builtIn)')
            .params({ builtIn: [...BUILT_IN_PAGE_IDS, ...BUILT_IN_PAGE_IDS.map((id) => `drafts.${id}`)] }),
        ),
      S.divider(),
      S.documentTypeListItem('subBrand').title('Sub-brand').icon(TagIcon),
      S.documentTypeListItem('product').title('Produk / Menu').icon(PackageIcon),
      S.documentTypeListItem('journalPost').title('Catatan Dapur (Artikel)').icon(DocumentTextIcon),
      S.divider(),
      S.documentTypeListItem('pillar').title('Pilar Brand').icon(StarIcon),
      S.documentTypeListItem('brandValue').title('Nilai Brand').icon(HeartIcon),
      S.documentTypeListItem('testimonial').title('Testimoni').icon(CommentIcon),
    ]);
