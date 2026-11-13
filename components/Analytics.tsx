import Script from 'next/script';
import { AnalyticsTracker } from './AnalyticsTracker';

/**
 * Loads analytics only when IDs are configured on the server (no rebuild needed):
 *   GTM_ID=GTM-XXXX   → Google Tag Manager (configure GA4 inside GTM), or
 *   GA4_ID=G-XXXX     → GA4 directly (used only when GTM_ID is not set)
 *   CLARITY_ID=xxxx   → Microsoft Clarity (optional)
 * Without IDs nothing third-party loads and events are no-ops.
 */
const valid = {
  gtm: (v?: string) => (v && /^GTM-[A-Z0-9]{4,12}$/.test(v) ? v : undefined),
  ga4: (v?: string) => (v && /^G-[A-Z0-9]{4,14}$/.test(v) ? v : undefined),
  clarity: (v?: string) => (v && /^[a-z0-9]{6,20}$/.test(v) ? v : undefined),
};

export function AnalyticsScripts() {
  const gtm = valid.gtm(process.env.GTM_ID);
  const ga4 = gtm ? undefined : valid.ga4(process.env.GA4_ID);
  const clarity = valid.clarity(process.env.CLARITY_ID);
  // Bootstrap runs inline at parse time so events fired during hydration are
  // queued in dataLayer and processed once the tag library loads.
  const boot = gtm
    ? `window.dataLayer=window.dataLayer||[];window.dataLayer.push({'gtm.start':new Date().getTime(),event:'gtm.js'});`
    : ga4
      ? `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;window.__damaGtag=true;gtag('js',new Date());gtag('config','${ga4}',{send_page_view:false});`
      : '';
  return (
    <>
      {/* eslint-disable-next-line react/no-danger */}
      {boot && <script dangerouslySetInnerHTML={{ __html: boot }} />}
      {gtm && <Script src={`https://www.googletagmanager.com/gtm.js?id=${gtm}`} strategy="afterInteractive" />}
      {ga4 && <Script src={`https://www.googletagmanager.com/gtag/js?id=${ga4}`} strategy="afterInteractive" />}
      {clarity && (
        <Script id="clarity" strategy="afterInteractive">
          {`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","${clarity}");`}
        </Script>
      )}
      {/* Always mounted: captures first-touch UTM for inquiries; events are no-ops without IDs. */}
      <AnalyticsTracker />
    </>
  );
}
