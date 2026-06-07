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
} from '@sanity/icons';

/**
 * Desk structure tuned for non-technical editors:
 * the most-used items first, friendly Indonesian titles, and the settings
 * singleton pinned at the top.
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
      S.documentTypeListItem('subBrand').title('Sub-brand').icon(TagIcon),
      S.documentTypeListItem('product').title('Produk / Menu').icon(PackageIcon),
      S.documentTypeListItem('journalPost').title('Catatan Dapur (Artikel)').icon(DocumentTextIcon),
      S.documentTypeListItem('page').title('Halaman').icon(DocumentsIcon),
      S.divider(),
      S.documentTypeListItem('pillar').title('Pilar Brand').icon(StarIcon),
      S.documentTypeListItem('brandValue').title('Nilai Brand').icon(HeartIcon),
      S.documentTypeListItem('testimonial').title('Testimoni').icon(CommentIcon),
    ]);
