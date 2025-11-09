'use client';

import Script from 'next/script';

export default function GoogleTagManager() {
  return (
    <>
      {/* Google Tag Manager Script */}
      <Script id="google-tag-manager" strategy="afterInteractive">
        {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','GTM-4G43');`}
      </Script>
    </>
  );
}

// GTM noscript component for <body>
export function GoogleTagManagerNoScript() {
  return (
    <noscript>
      <iframe
        src="https://www.googletagmanager.com/ns.html?id=GTM-4G43"
        height="0"
        width="0"
        style={{ display: 'none', visibility: 'hidden' }}
      />
    </noscript>
  );
}

// Custom hook for tracking events via dataLayer
export function useGoogleTagManager() {
  const trackEvent = (eventName: string, parameters: Record<string, unknown> = {}) => {
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push({
        event: eventName,
        ...parameters
      });
    }
  };

  const trackAnalysis = (url: string, analysisType: 'url' | 'text') => {
    trackEvent('analysis_started', {
      analysis_type: analysisType,
      url_analyzed: url,
      event_category: 'Analysis',
      event_label: analysisType
    });
  };

  const trackAnalysisComplete = (url: string, score: number, analysisType: 'url' | 'text') => {
    trackEvent('analysis_completed', {
      analysis_type: analysisType,
      url_analyzed: url,
      score: score,
      event_category: 'Analysis',
      event_label: analysisType,
      value: Math.round(score)
    });
  };

  const trackExport = (exportType: 'pdf' | 'markdown' | 'print') => {
    trackEvent('report_exported', {
      export_type: exportType,
      event_category: 'Export',
      event_label: exportType
    });
  };

  const trackError = (errorType: string, errorMessage: string) => {
    trackEvent('analysis_error', {
      error_type: errorType,
      error_message: errorMessage,
      event_category: 'Error',
      event_label: errorType
    });
  };

  const trackCTA = (ctaLocation: string, ctaAction: string) => {
    trackEvent('cta_clicked', {
      cta_location: ctaLocation,
      cta_action: ctaAction,
      event_category: 'CTA',
      event_label: ctaLocation
    });
  };

  return {
    trackEvent,
    trackAnalysis,
    trackAnalysisComplete,
    trackExport,
    trackError,
    trackCTA
  };
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
  }
}
