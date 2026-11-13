import { loadSettingDraft } from '@/lib/admin/settingsLoad';
import type { SiteSettingsData } from '@/lib/settings';
import { SiteSettingsEditor } from './SiteSettingsEditor';

export default async function SettingsPage() {
  const { data, hasChanges } = await loadSettingDraft('site');
  return <SiteSettingsEditor initial={data as SiteSettingsData} hasChanges={hasChanges} />;
}
