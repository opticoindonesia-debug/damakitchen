import 'server-only';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { settings } from '@/lib/db/schema';
import { DEFAULT_NAVIGATION, DEFAULT_SITE, cleanNavigation, cleanSiteSettings, cleanTheme } from '@/lib/settings';

/** Working copy of a settings singleton (with defaults filled in) for the admin forms. */
export async function loadSettingDraft(key: 'site' | 'theme' | 'navigation') {
  const [row] = await db.select().from(settings).where(eq(settings.key, key)).limit(1);
  const raw = (row?.draft ?? row?.published ?? {}) as Record<string, unknown>;
  const data =
    key === 'site'
      ? cleanSiteSettings({ ...DEFAULT_SITE, ...raw }).data
      : key === 'theme'
        ? cleanTheme(raw)
        : cleanNavigation(Object.keys(raw).length ? raw : DEFAULT_NAVIGATION).data;
  return { data, hasChanges: row?.hasChanges ?? false };
}
