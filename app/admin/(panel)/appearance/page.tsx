import { loadSettingDraft } from '@/lib/admin/settingsLoad';
import { AppearanceEditor } from './AppearanceEditor';
import type { ThemeData } from '@/lib/settings';

export default async function AppearancePage() {
  const { data, hasChanges } = await loadSettingDraft('theme');
  return <AppearanceEditor initial={data as ThemeData} hasChanges={hasChanges} />;
}
