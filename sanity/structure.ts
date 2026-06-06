import type { StructureResolver } from 'sanity/structure';

/** Desk structure: site settings as a singleton, then the collections. */
export const structure: StructureResolver = (S) =>
  S.list()
    .title('DAMA KITCHEN')
    .items([
      S.listItem()
        .title('Pengaturan Situs')
        .id('siteSettings')
        .child(S.document().schemaType('siteSettings').documentId('siteSettings')),
      S.divider(),
      S.documentTypeListItem('subBrand').title('Sub-brand'),
      S.documentTypeListItem('product').title('Produk / Menu'),
      S.documentTypeListItem('journalPost').title('Catatan Dapur'),
      S.documentTypeListItem('page').title('Halaman'),
      S.divider(),
      S.documentTypeListItem('pillar').title('Pilar Brand'),
      S.documentTypeListItem('brandValue').title('Nilai Brand'),
      S.documentTypeListItem('testimonial').title('Testimoni'),
    ]);
