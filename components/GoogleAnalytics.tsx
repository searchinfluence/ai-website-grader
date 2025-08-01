'use client';

import Script from 'next/script';

interface GoogleAnalyticsProps {
  gaId: string;
}

export default function GoogleAnalytics({ gaId }: GoogleAnalyticsProps) {
  return (
    <>
      {/* Google Analytics Script */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}', {
            page_title: document.title,
            page_location: window.location.href,
            custom_map: {
              'custom_parameter_1': 'analysis_type',
              'custom_parameter_2': 'url_analyzed'
            }
          });
        `}
      </Script>
    </>
  );
}

// Custom hook for tracking events
export function useGoogleAnalytics() {
  const trackEvent = (eventName: string, parameters: Record<string, unknown> = {}) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', eventName, parameters);
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

  return {
    trackEvent,
    trackAnalysis,
    trackAnalysisComplete,
    trackExport,
    trackError
  };
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
  }
} 