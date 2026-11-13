import { loadSettingDraft } from '@/lib/admin/settingsLoad';
import { formContext } from '@/lib/admin/context';
import type { NavigationData } from '@/lib/settings';
import { NavigationEditor } from './NavigationEditor';

export default async function NavigationPage() {
  const [{ data, hasChanges }, ctx] = await Promise.all([loadSettingDraft('navigation'), formContext()]);
  return <NavigationEditor initial={data as NavigationData} hasChanges={hasChanges} links={ctx.linkSuggestions} />;
}
