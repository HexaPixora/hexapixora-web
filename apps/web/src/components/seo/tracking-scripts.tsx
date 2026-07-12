import React from "react";
import Script from "next/script";

/**
 * Injects analytics/marketing tags configured in Admin → Settings → Tracking.
 * Rendered from the (public) layout only, so the admin dashboard is never
 * tracked. Each tag is emitted only when its ID is present.
 *
 * GA4 & GTM auto-capture SPA route changes (GA4 via enhanced measurement's
 * history events; GTM via its own history trigger). The Meta Pixel fires an
 * initial PageView here — additional in-app navigations can be tracked with
 * custom events if needed.
 */
export function TrackingScripts({
  googleAnalyticsId,
  gtmId,
  metaPixelId,
}: {
  googleAnalyticsId?: string | null;
  gtmId?: string | null;
  metaPixelId?: string | null;
}) {
  const ga = googleAnalyticsId?.trim();
  const gtm = gtmId?.trim();
  const pixel = metaPixelId?.trim();

  if (!ga && !gtm && !pixel) return null;

  return (
    <>
      {/* Google Analytics 4 */}
      {ga && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${ga}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${ga}');
            `}
          </Script>
        </>
      )}

      {/* Google Tag Manager */}
      {gtm && (
        <>
          <Script id="gtm-init" strategy="afterInteractive">
            {`
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${gtm}');
            `}
          </Script>
          <noscript>
            {/* eslint-disable-next-line @next/next/no-sync-scripts */}
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtm}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
              title="gtm"
            />
          </noscript>
        </>
      )}

      {/* Meta (Facebook) Pixel */}
      {pixel && (
        <>
          <Script id="meta-pixel" strategy="afterInteractive">
            {`
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${pixel}');
              fbq('track', 'PageView');
            `}
          </Script>
          <noscript>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              height="1"
              width="1"
              style={{ display: "none" }}
              src={`https://www.facebook.com/tr?id=${pixel}&ev=PageView&noscript=1`}
              alt=""
            />
          </noscript>
        </>
      )}
    </>
  );
}
