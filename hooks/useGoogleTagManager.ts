'use client';

type EventPayload = Record<string, unknown>;

export function useGoogleTagManager() {
  const pushEvent = (eventName: string, parameters: EventPayload = {}) => {
    if (typeof window !== 'undefined' && Array.isArray(window.dataLayer)) {
      window.dataLayer.push({
        event: eventName,
        ...parameters
      });
    }
  };

  const trackAnalysis = (url: string, analysisType: 'url' | 'text') => {
    pushEvent('analysis_started', {
      analysis_type: analysisType,
      url_analyzed: url,
      event_category: 'Analysis',
      event_label: analysisType
    });
  };

  const trackAnalysisComplete = (url: string, score: number, analysisType: 'url' | 'text') => {
    pushEvent('analysis_completed', {
      analysis_type: analysisType,
      url_analyzed: url,
      score,
      event_category: 'Analysis',
      event_label: analysisType,
      value: Math.round(score)
    });
  };

  const trackExport = (exportType: 'pdf' | 'markdown' | 'print') => {
    pushEvent('report_exported', {
      export_type: exportType,
      event_category: 'Export',
      event_label: exportType
    });
  };

  const trackError = (errorType: string, errorMessage: string) => {
    pushEvent('analysis_error', {
      error_type: errorType,
      error_message: errorMessage,
      event_category: 'Error',
      event_label: errorType
    });
  };

  const trackCTA = (ctaLocation: string, ctaAction: string) => {
    pushEvent('cta_clicked', {
      cta_location: ctaLocation,
      cta_action: ctaAction,
      event_category: 'CTA',
      event_label: ctaLocation
    });
  };

  return {
    trackEvent: pushEvent,
    trackAnalysis,
    trackAnalysisComplete,
    trackExport,
    trackError,
    trackCTA
  };
}

declare global {
  interface Window {
    dataLayer: EventPayload[];
  }
}

