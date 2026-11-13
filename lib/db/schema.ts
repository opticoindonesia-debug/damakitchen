/**
 * DAMA KITCHEN database schema (MySQL / MariaDB via Drizzle ORM).
 *
 * Conventions
 * - snake_case tables/columns, `created_at` / `updated_at` on every content table.
 * - Editorial documents (pages, articles, settings) keep a working copy
 *   (`draft`) and a published snapshot (`published`). The public site only
 *   ever reads the published snapshot, so drafts are never public.
 * - Catalog records (products, sub-brands, testimonials, …) are edited in
 *   place; their `status` / `visible` / `enabled` columns control visibility.
 * - Flexible, validated structures (page sections, SEO, image references) are
 *   JSON columns validated with zod on every write (see lib/validation.ts).
 */
import {
  boolean,
  customType,
  datetime,
  index,
  int,
  mediumtext,
  mysqlEnum,
  mysqlTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/mysql-core';

/**
 * JSON column that works on both MySQL (native JSON) and MariaDB (JSON is an
 * alias of LONGTEXT, so the driver returns a string we must parse).
 */
const json = customType<{ data: unknown; driverData: unknown }>({
  dataType: () => 'json',
  toDriver: (value) => JSON.stringify(value),
  fromDriver: (value) => (typeof value === 'string' ? JSON.parse(value) : value),
});

const longblob = customType<{ data: Buffer; driverData: Buffer }>({
  dataType: () => 'longblob',
});

const timestamps = {
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
};

// ── Auth ──────────────────────────────────────────────────────
export const adminUsers = mysqlTable('admin_users', {
  id: int('id').autoincrement().primaryKey(),
  email: varchar('email', { length: 190 }).notNull(),
  name: varchar('name', { length: 120 }).notNull(),
  /** scrypt$N$r$p$salt$hash — never plaintext. */
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  role: mysqlEnum('role', ['owner', 'editor']).notNull().default('editor'),
  isActive: boolean('is_active').notNull().default(true),
  lastLoginAt: datetime('last_login_at'),
  ...timestamps,
}, (t) => [uniqueIndex('admin_users_email_uq').on(t.email)]);

export const sessions = mysqlTable('sessions', {
  /** SHA-256 of the cookie token; the raw token is never stored. */
  id: varchar('id', { length: 64 }).primaryKey(),
  userId: int('user_id').notNull().references(() => adminUsers.id, { onDelete: 'cascade' }),
  expiresAt: datetime('expires_at').notNull(),
  ip: varchar('ip', { length: 64 }),
  userAgent: varchar('user_agent', { length: 255 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (t) => [index('sessions_user_idx').on(t.userId), index('sessions_expires_idx').on(t.expiresAt)]);

export const loginAttempts = mysqlTable('login_attempts', {
  id: int('id').autoincrement().primaryKey(),
  ip: varchar('ip', { length: 64 }).notNull(),
  email: varchar('email', { length: 190 }).notNull(),
  success: boolean('success').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (t) => [index('login_attempts_ip_idx').on(t.ip, t.createdAt), index('login_attempts_email_idx').on(t.email, t.createdAt)]);

// ── Media ─────────────────────────────────────────────────────
export const media = mysqlTable('media', {
  id: int('id').autoincrement().primaryKey(),
  /** Public file name, e.g. "k3f9a2-rendang.webp" → served at /media/<key>. Never changes. */
  storageKey: varchar('storage_key', { length: 160 }).notNull(),
  originalName: varchar('original_name', { length: 255 }).notNull(),
  mime: varchar('mime', { length: 80 }).notNull(),
  kind: mysqlEnum('kind', ['image', 'document']).notNull(),
  size: int('size').notNull(),
  width: int('width'),
  height: int('height'),
  /** Available responsive widths (images only), e.g. [640, 1280]. */
  variants: json('variants').$type<number[]>().notNull(),
  storage: mysqlEnum('storage', ['database', 'filesystem']).notNull(),
  checksum: varchar('checksum', { length: 64 }).notNull(),
  alt: varchar('alt', { length: 300 }).notNull().default(''),
  description: text('description'),
  folder: varchar('folder', { length: 80 }).notNull().default(''),
  /** Bumped on "replace" so caches refresh (ETag). */
  version: int('version').notNull().default(1),
  ...timestamps,
}, (t) => [uniqueIndex('media_key_uq').on(t.storageKey), index('media_folder_idx').on(t.folder), index('media_created_idx').on(t.createdAt)]);

/** File bytes when MEDIA_STORAGE=database (default — survives every redeploy). */
export const mediaBlobs = mysqlTable('media_blobs', {
  mediaId: int('media_id').notNull().references(() => media.id, { onDelete: 'cascade' }),
  /** "orig" or a width such as "640". */
  variant: varchar('variant', { length: 16 }).notNull(),
  mime: varchar('mime', { length: 80 }).notNull(),
  size: int('size').notNull(),
  data: longblob('data').notNull(),
}, (t) => [primaryKey({ columns: [t.mediaId, t.variant] })]);

// ── Pages (page builder) ──────────────────────────────────────
export const pages = mysqlTable('pages', {
  id: int('id').autoincrement().primaryKey(),
  /** Set for the 7 built-in pages (beranda, cerita, …); null for custom pages. */
  builtinKey: varchar('builtin_key', { length: 32 }),
  title: varchar('title', { length: 200 }).notNull(),
  /** Working-copy slug ('' for the home page). */
  slug: varchar('slug', { length: 160 }).notNull(),
  /** Working copy: { title, slug, sections, seo }. */
  draft: json('draft').$type<Record<string, unknown>>().notNull(),
  /** Live snapshot; null = never published / unpublished. */
  published: json('published').$type<Record<string, unknown> | null>(),
  publishedSlug: varchar('published_slug', { length: 160 }),
  status: mysqlEnum('status', ['draft', 'published']).notNull().default('draft'),
  hasChanges: boolean('has_changes').notNull().default(true),
  sortOrder: int('sort_order').notNull().default(0),
  publishedAt: datetime('published_at'),
  updatedBy: int('updated_by'),
  ...timestamps,
}, (t) => [
  uniqueIndex('pages_builtin_uq').on(t.builtinKey),
  uniqueIndex('pages_slug_uq').on(t.slug),
  uniqueIndex('pages_published_slug_uq').on(t.publishedSlug),
  index('pages_status_idx').on(t.status),
]);

// ── Catalog ───────────────────────────────────────────────────
export const subBrands = mysqlTable('sub_brands', {
  id: int('id').autoincrement().primaryKey(),
  slug: varchar('slug', { length: 60 }).notNull(),
  name: varchar('name', { length: 120 }).notNull(),
  shortName: varchar('short_name', { length: 60 }).notNull(),
  emotion: varchar('emotion', { length: 60 }).notNull(),
  lead: text('lead').notNull(),
  about: text('about').notNull(),
  howToOrder: text('how_to_order').notNull(),
  channelNote: text('channel_note'),
  markerHex: varchar('marker_hex', { length: 7 }).notNull(),
  heroImage: json('hero_image').$type<ImageRef | null>(),
  channels: json('channels').$type<string[]>().notNull(),
  faqs: json('faqs').$type<{ q: string; a: string }[]>().notNull(),
  crossSell: json('cross_sell').$type<string[]>().notNull(),
  extraSections: json('extra_sections').$type<Record<string, unknown>[]>().notNull(),
  seo: json('seo').$type<SeoFields>().notNull(),
  enabled: boolean('enabled').notNull().default(true),
  sortOrder: int('sort_order').notNull().default(0),
  ...timestamps,
}, (t) => [uniqueIndex('sub_brands_slug_uq').on(t.slug)]);

export const productCategories = mysqlTable('product_categories', {
  id: int('id').autoincrement().primaryKey(),
  slug: varchar('slug', { length: 80 }).notNull(),
  name: varchar('name', { length: 120 }).notNull(),
  sortOrder: int('sort_order').notNull().default(0),
  ...timestamps,
}, (t) => [uniqueIndex('product_categories_slug_uq').on(t.slug)]);

export const products = mysqlTable('products', {
  id: int('id').autoincrement().primaryKey(),
  slug: varchar('slug', { length: 160 }).notNull(),
  name: varchar('name', { length: 160 }).notNull(),
  subBrandId: int('sub_brand_id').references(() => subBrands.id, { onDelete: 'set null' }),
  categoryId: int('category_id').references(() => productCategories.id, { onDelete: 'set null' }),
  blurb: varchar('blurb', { length: 400 }).notNull().default(''),
  description: text('description'),
  /** Price in Rupiah (whole number); null = not shown. */
  price: int('price'),
  priceNote: varchar('price_note', { length: 120 }),
  availability: mysqlEnum('availability', ['available', 'preorder', 'seasonal', 'unavailable']).notNull().default('available'),
  status: mysqlEnum('status', ['draft', 'published', 'archived']).notNull().default('draft'),
  image: json('image').$type<ImageRef | null>(),
  gallery: json('gallery').$type<ImageRef[]>().notNull(),
  info: json('info').$type<string[]>().notNull(),
  imageCategory: varchar('image_category', { length: 20 }).notNull().default('food'),
  /** Extra order buttons, e.g. a specific Shopee listing. */
  orderLinks: json('order_links').$type<{ label: string; url: string }[]>().notNull(),
  seo: json('seo').$type<SeoFields>().notNull(),
  sortOrder: int('sort_order').notNull().default(0),
  ...timestamps,
}, (t) => [
  uniqueIndex('products_slug_uq').on(t.slug),
  index('products_status_idx').on(t.status, t.sortOrder),
  index('products_sub_brand_idx').on(t.subBrandId),
  index('products_category_idx').on(t.categoryId),
]);

// ── Articles (Catatan Dapur) ──────────────────────────────────
export const articleCategories = mysqlTable('article_categories', {
  id: int('id').autoincrement().primaryKey(),
  slug: varchar('slug', { length: 80 }).notNull(),
  name: varchar('name', { length: 120 }).notNull(),
  description: text('description'),
  sortOrder: int('sort_order').notNull().default(0),
  ...timestamps,
}, (t) => [uniqueIndex('article_categories_slug_uq').on(t.slug)]);

export const tags = mysqlTable('tags', {
  id: int('id').autoincrement().primaryKey(),
  slug: varchar('slug', { length: 80 }).notNull(),
  name: varchar('name', { length: 120 }).notNull(),
  ...timestamps,
}, (t) => [uniqueIndex('tags_slug_uq').on(t.slug)]);

export const articles = mysqlTable('articles', {
  id: int('id').autoincrement().primaryKey(),
  // Working copy
  title: varchar('title', { length: 200 }).notNull(),
  slug: varchar('slug', { length: 160 }).notNull(),
  excerpt: text('excerpt'),
  bodyHtml: mediumtext('body_html').notNull(),
  featuredImage: json('featured_image').$type<ImageRef | null>(),
  author: varchar('author', { length: 120 }),
  categoryId: int('category_id').references(() => articleCategories.id, { onDelete: 'set null' }),
  /** Display/publication date. */
  publishedAt: datetime('published_at'),
  relatedIds: json('related_ids').$type<number[]>().notNull(),
  seo: json('seo').$type<SeoFields>().notNull(),
  // Live snapshot
  published: json('published').$type<Record<string, unknown> | null>(),
  publishedSlug: varchar('published_slug', { length: 160 }),
  status: mysqlEnum('status', ['draft', 'published']).notNull().default('draft'),
  hasChanges: boolean('has_changes').notNull().default(true),
  updatedBy: int('updated_by'),
  ...timestamps,
}, (t) => [
  uniqueIndex('articles_slug_uq').on(t.slug),
  uniqueIndex('articles_published_slug_uq').on(t.publishedSlug),
  index('articles_status_idx').on(t.status, t.publishedAt),
]);

export const articleTags = mysqlTable('article_tags', {
  articleId: int('article_id').notNull().references(() => articles.id, { onDelete: 'cascade' }),
  tagId: int('tag_id').notNull().references(() => tags.id, { onDelete: 'cascade' }),
}, (t) => [primaryKey({ columns: [t.articleId, t.tagId] }), index('article_tags_tag_idx').on(t.tagId)]);

// ── Small collections ─────────────────────────────────────────
export const testimonials = mysqlTable('testimonials', {
  id: int('id').autoincrement().primaryKey(),
  name: varchar('name', { length: 120 }).notNull(),
  context: varchar('context', { length: 160 }).notNull().default(''),
  quote: text('quote').notNull(),
  visible: boolean('visible').notNull().default(true),
  sortOrder: int('sort_order').notNull().default(0),
  ...timestamps,
});

export const faqs = mysqlTable('faqs', {
  id: int('id').autoincrement().primaryKey(),
  question: varchar('question', { length: 300 }).notNull(),
  answer: text('answer').notNull(),
  groupKey: varchar('group_key', { length: 60 }).notNull().default('umum'),
  visible: boolean('visible').notNull().default(true),
  sortOrder: int('sort_order').notNull().default(0),
  ...timestamps,
}, (t) => [index('faqs_group_idx').on(t.groupKey, t.sortOrder)]);

/** Brand pillars and values (shown by the "Pilar" / "Nilai" data blocks). */
export const brandItems = mysqlTable('brand_items', {
  id: int('id').autoincrement().primaryKey(),
  kind: mysqlEnum('kind', ['pillar', 'value']).notNull(),
  title: varchar('title', { length: 160 }).notNull(),
  body: text('body').notNull(),
  icon: varchar('icon', { length: 40 }),
  visible: boolean('visible').notNull().default(true),
  sortOrder: int('sort_order').notNull().default(0),
  ...timestamps,
}, (t) => [index('brand_items_kind_idx').on(t.kind, t.sortOrder)]);

// ── Singletons: site, theme, navigation ───────────────────────
export const settings = mysqlTable('settings', {
  key: varchar('key', { length: 40 }).primaryKey(),
  draft: json('draft').$type<Record<string, unknown>>().notNull(),
  published: json('published').$type<Record<string, unknown> | null>(),
  hasChanges: boolean('has_changes').notNull().default(false),
  publishedAt: datetime('published_at'),
  updatedBy: int('updated_by'),
  ...timestamps,
});

export const redirects = mysqlTable('redirects', {
  id: int('id').autoincrement().primaryKey(),
  fromPath: varchar('from_path', { length: 255 }).notNull(),
  toPath: varchar('to_path', { length: 500 }).notNull(),
  statusCode: int('status_code').notNull().default(301),
  note: varchar('note', { length: 200 }),
  ...timestamps,
}, (t) => [uniqueIndex('redirects_from_uq').on(t.fromPath)]);

// ── Shared JSON shapes ────────────────────────────────────────
export interface ImageRef {
  mediaId?: number;
  url: string;
  alt?: string;
  caption?: string;
}

export interface SeoFields {
  title?: string;
  description?: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: ImageRef | null;
  noindex?: boolean;
}
