import { ServiceJsonLd } from '@/components/JsonLd';
import { TrackOnView } from '@/components/AnalyticsTracker';

/** Service entity + view event for this service page. */
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ServiceJsonLd name="Layanan corporate DAMA KITCHEN" description="Nasi kotak Minang untuk acara kantor dan hampers corporate untuk klien maupun karyawan." path="/corporate" serviceType="Corporate catering & gifting" brandSlugs={["dama-kapau","tando-mato"]} />
      <TrackOnView event="view_corporate" />
      {children}
    </>
  );
}
