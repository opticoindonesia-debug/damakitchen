import { getSiteSettings } from '@/lib/cms';

/** Festive strip shown only while "Perayaan" is switched on in Pengaturan Situs. */
export async function SeasonalBanner() {
  const { seasonal } = await getSiteSettings();
  if (!seasonal.active) return null;
  return (
    <div className="border-b border-songketRed/20 bg-songketRed/10">
      <div className="container-dama flex flex-wrap items-center gap-x-3 gap-y-1 py-4">
        <span className="text-label font-semibold uppercase tracking-[0.16em] text-songketRed">{seasonal.label}</span>
        <span className="text-caption text-ink">{seasonal.message}</span>
      </div>
    </div>
  );
}
