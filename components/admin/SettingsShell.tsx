'use client';

import { useCallback, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { discardSettings, publishSettings, saveSettingsDraft } from '@/app/admin/actions/settings';
import { Badge, Button, NoticeBar, PageHeader, confirmAction, useAction } from './ui';
import { AutosaveLabel, useAutosave } from './useAutosave';

/**
 * Shared draft → preview → publish frame for the settings singletons
 * (Tampilan, Menu & footer, Pengaturan situs).
 */
export function SettingsShell<T extends object>({
  settingKey,
  title,
  description,
  initial,
  hasChanges,
  previewPath = '/',
  extraActions,
  children,
}: {
  settingKey: 'site' | 'theme' | 'navigation';
  title: string;
  description: ReactNode;
  initial: T;
  hasChanges: boolean;
  previewPath?: string;
  extraActions?: (api: { setValue: (v: T) => void; run: ReturnType<typeof useAction>['run'] }) => ReactNode;
  children: (value: T, setValue: (v: T) => void) => ReactNode;
}) {
  const router = useRouter();
  const [value, setValue] = useState<T>(initial);
  const [changed, setChanged] = useState(hasChanges);
  const { busy, notice, setNotice, run } = useAction();

  const save = useCallback(async (v: T) => {
    const res = await saveSettingsDraft(settingKey, v);
    setChanged(true);
    if (!res.ok) setNotice({ tone: 'error', text: res.error, details: res.problems });
    return res.ok;
  }, [settingKey, setNotice]);
  const autosave = useAutosave(value, save);

  return (
    <div className="space-y-5">
      <PageHeader
        title={title}
        description={
          <span className="block space-y-1">
            <span className="block">{description}</span>
            <span className="flex flex-wrap items-center gap-2">
              {changed ? <Badge tone="amber">Ada perubahan belum terbit</Badge> : <Badge tone="green">Sama dengan website</Badge>}
              <AutosaveLabel state={autosave.state} />
            </span>
          </span>
        }
        actions={
          <>
            <Button busy={busy === 'preview'} onClick={async () => {
              const res = await run('preview', () => saveSettingsDraft(settingKey, value));
              if (res.ok) {
                autosave.markSaved();
                window.open(`/api/admin/preview/enable?path=${encodeURIComponent(previewPath)}`, '_blank', 'noopener');
              }
            }}>Pratinjau</Button>
            <Button variant="publish" busy={busy === 'publish'} onClick={async () => {
              const res = await run('publish', () => publishSettings(settingKey, value));
              if (res.ok) {
                setChanged(false);
                autosave.markSaved();
                if (res.data) setValue(res.data as T);
                router.refresh();
              }
            }}>Terbitkan</Button>
          </>
        }
      />
      <NoticeBar notice={notice} onClose={() => setNotice(null)} />
      {children(value, setValue)}
      <div className="flex flex-wrap gap-2 border-t border-stone-200 pt-4">
        {changed && (
          <Button onClick={async () => {
            if (!confirmAction('Buang perubahan yang belum diterbitkan?')) return;
            const res = await run('discard', () => discardSettings(settingKey));
            if (res.ok && res.data) {
              setValue(res.data as T);
              setChanged(false);
            }
          }}>Batalkan perubahan</Button>
        )}
        {extraActions?.({ setValue: (v) => { setValue(v); setChanged(true); }, run })}
      </div>
    </div>
  );
}
