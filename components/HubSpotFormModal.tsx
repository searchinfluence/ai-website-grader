'use client';

import { CSSProperties, useEffect, useId, useMemo, useRef } from 'react';
import Script from 'next/script';

export type HubSpotSubmittedValues = {
  name?: string;
  email?: string;
  company?: string;
};

interface HubSpotFormModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  formId?: string;
  onClose: () => void;
  onSubmitted: (values: HubSpotSubmittedValues) => Promise<void> | void;
}

declare global {
  interface Window {
    hbspt?: {
      forms: {
        create: (config: Record<string, unknown>) => void;
      };
    };
  }
}

function parseSubmittedValues(data: unknown): HubSpotSubmittedValues {
  const values = (data as { submissionValues?: Record<string, string> } | undefined)?.submissionValues || {};
  const firstName = values.firstname?.trim() || '';
  const lastName = values.lastname?.trim() || '';
  const combinedName = [firstName, lastName].filter(Boolean).join(' ').trim();

  return {
    name: combinedName || values.name?.trim() || undefined,
    email: values.email?.trim().toLowerCase() || undefined,
    company: values.company?.trim() || undefined
  };
}

function isHubSpotSubmissionSuccessEvent(event: Event): boolean {
  return event.type === 'hs-form-event:on-submission:success';
}

export default function HubSpotFormModal({
  isOpen,
  title,
  description,
  formId,
  onClose,
  onSubmitted
}: HubSpotFormModalProps) {
  const targetId = useId().replace(/:/g, '');
  const portalId = process.env.NEXT_PUBLIC_HUBSPOT_PORTAL_ID;
  const frameId = useMemo(() => `hubspot-form-${targetId}`, [targetId]);
  const hasHandledSubmitRef = useRef(false);

  const handleSubmitted = async (data: unknown) => {
    if (hasHandledSubmitRef.current) return;
    hasHandledSubmitRef.current = true;
    await onSubmitted(parseSubmittedValues(data));
  };

  useEffect(() => {
    if (!isOpen) {
      hasHandledSubmitRef.current = false;
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const onMessage = async (event: MessageEvent) => {
      if (event.data?.type !== 'hsFormCallback') return;
      if (event.data?.eventName !== 'onFormSubmitted' && event.data?.eventName !== 'onFormSubmit') return;
      await handleSubmitted(event.data?.data);
    };

    const onHubSpotSuccess = async (event: Event) => {
      if (!isHubSpotSubmissionSuccessEvent(event)) return;
      await handleSubmitted(undefined);
    };

    window.addEventListener('message', onMessage);
    window.addEventListener('hs-form-event:on-submission:success', onHubSpotSuccess);
    return () => {
      window.removeEventListener('message', onMessage);
      window.removeEventListener('hs-form-event:on-submission:success', onHubSpotSuccess);
    };
  }, [formId, isOpen]);

  if (!isOpen) return null;

  const isConfigured = Boolean(portalId && formId);

  return (
    <>
      <Script
        src={portalId ? `https://js.hsforms.net/forms/embed/${portalId}.js` : 'https://js.hsforms.net/forms/embed/v2.js'}
        strategy="afterInteractive"
      />

      <div style={overlayStyles}>
        <div style={containerStyles}>
          <div style={headerStyles}>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>{title}</h3>
            <p style={{ margin: '6px 0 0', fontSize: '0.92rem', color: 'rgba(255,255,255,0.9)' }}>
              {description}
            </p>
          </div>

          <div style={{ padding: '20px' }}>
            {!isConfigured ? (
              <p style={errorStyles}>HubSpot form is not configured yet. Add the HubSpot portal ID and form ID to continue.</p>
            ) : (
              <>
                <style>{`
                  #${frameId} .hs-richtext,
                  #${frameId} .submitted-message {
                    display: none !important;
                  }
                `}</style>
                <div
                  id={frameId}
                  className="hs-form-frame"
                  data-region="na1"
                  data-form-id={formId}
                  data-portal-id={portalId}
                />
              </>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button
                type="button"
                onClick={onClose}
                style={closeButtonStyles}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

const overlayStyles: CSSProperties = {
  position: 'fixed',
  inset: 0,
  zIndex: 1200,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'rgba(15, 23, 42, 0.75)',
  padding: '16px'
};

const containerStyles: CSSProperties = {
  width: '100%',
  maxWidth: '560px',
  maxHeight: 'calc(100vh - 32px)',
  overflowY: 'auto',
  overflowX: 'hidden',
  borderRadius: '12px',
  border: '1px solid #dbe4ee',
  background: '#ffffff',
  color: '#1e293b',
  boxShadow: '0 24px 48px rgba(15, 23, 42, 0.22)'
};

const headerStyles: CSSProperties = {
  borderBottom: '1px solid #dbe4ee',
  background: 'linear-gradient(135deg, #1b7340 0%, #145832 100%)',
  padding: '18px 20px'
};

const errorStyles: CSSProperties = {
  margin: 0,
  padding: '12px 14px',
  borderRadius: '8px',
  border: '1px solid rgba(239, 68, 68, 0.22)',
  background: '#fef2f2',
  color: '#b91c1c',
  fontSize: '0.9rem'
};

const closeButtonStyles: CSSProperties = {
  border: '1px solid var(--border-gray, #4b5563)',
  background: 'transparent',
  color: 'var(--secondary-content, #475569)',
  borderRadius: '8px',
  padding: '10px 16px',
  fontSize: '0.9rem',
  fontWeight: 600,
  cursor: 'pointer'
};
