import { ServiceJsonLd } from '@/components/JsonLd';
import { TrackOnView } from '@/components/AnalyticsTracker';

/** Service entity + view event for this service page. */
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ServiceJsonLd name="Katering & acara Minang" description="Penyajian masakan Minang untuk acara keluarga maupun kantor, dari penawaran hingga hari-H." path="/katering" serviceType="Catering" brandSlugs={["dama-kapau"]} />
      <TrackOnView event="view_catering" />
      {children}
    </>
  );
}
