import { ServiceJsonLd } from '@/components/JsonLd';
import { TrackOnView } from '@/components/AnalyticsTracker';

/** Service entity + view event for this service page. */
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ServiceJsonLd name="Hampers & hadiah masakan Minang" description="Hampers masakan Minang TANDO MATO untuk hadiah personal maupun corporate gifting." path="/hadiah" serviceType="Food gifting" brandSlugs={["tando-mato"]} />
      <TrackOnView event="view_gifting" />
      {children}
    </>
  );
}
