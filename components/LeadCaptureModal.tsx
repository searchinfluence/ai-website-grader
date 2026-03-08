'use client';

import { CSSProperties, FormEvent, useEffect, useState } from 'react';

type LeadCaptureValues = {
  name: string;
  email: string;
  company?: string;
};

interface LeadCaptureModalProps {
  isOpen: boolean;
  actionLabel: string;
  initialValues?: Partial<LeadCaptureValues>;
  onClose: () => void;
  onSubmit: (values: LeadCaptureValues) => Promise<void>;
}

export default function LeadCaptureModal({
  isOpen,
  actionLabel,
  initialValues,
  onClose,
  onSubmit
}: LeadCaptureModalProps) {
  const [name, setName] = useState(initialValues?.name || '');
  const [email, setEmail] = useState(initialValues?.email || '');
  const [company, setCompany] = useState(initialValues?.company || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setName(initialValues?.name || '');
    setEmail(initialValues?.email || '');
    setCompany(initialValues?.company || '');
    setError(null);
  }, [isOpen, initialValues?.name, initialValues?.email, initialValues?.company]);

  if (!isOpen) return null;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedCompany = company.trim();

    if (!trimmedName) {
      setError('Please add your name.');
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(trimmedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        name: trimmedName,
        email: trimmedEmail,
        company: trimmedCompany || undefined
      });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to submit your details right now.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 1000,
      background: 'rgba(0, 0, 0, 0.55)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '16px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '520px',
        background: 'var(--content-bg)',
        borderRadius: '12px',
        border: '1px solid var(--border-gray)',
        boxShadow: '0 24px 48px rgba(0, 0, 0, 0.25)',
        overflowX: 'hidden',
        overflowY: 'auto',
        maxHeight: 'calc(100vh - 32px)'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #1b7340 0%, #145832 100%)',
          color: '#fff',
          padding: '18px 20px'
        }}>
          <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Get your full report</h3>
          <p style={{ margin: '8px 0 0', fontSize: '0.9rem', opacity: 0.95 }}>
            Share a few details so we can send tips that help you act on this analysis.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
          <div style={{ display: 'grid', gap: '12px' }}>
            <label style={{ display: 'grid', gap: '6px' }}>
              <span style={{ fontWeight: 600, color: 'var(--content-text)' }}>Name</span>
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                autoComplete="name"
                disabled={isSubmitting}
                style={inputStyles}
              />
            </label>

            <label style={{ display: 'grid', gap: '6px' }}>
              <span style={{ fontWeight: 600, color: 'var(--content-text)' }}>Email</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                disabled={isSubmitting}
                style={inputStyles}
              />
            </label>

            <label style={{ display: 'grid', gap: '6px' }}>
              <span style={{ fontWeight: 600, color: 'var(--content-text)' }}>Company (optional)</span>
              <input
                type="text"
                value={company}
                onChange={(event) => setCompany(event.target.value)}
                autoComplete="organization"
                disabled={isSubmitting}
                style={inputStyles}
              />
            </label>
          </div>

          {error && (
            <p style={{ margin: '12px 0 0', color: 'var(--error-red)', fontSize: '0.88rem' }}>{error}</p>
          )}

          <div style={{
            marginTop: '18px',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px',
            flexWrap: 'wrap'
          }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              style={{
                border: '1px solid var(--border-gray)',
                background: 'transparent',
                color: 'var(--secondary-content)',
                borderRadius: '8px',
                padding: '10px 14px',
                cursor: isSubmitting ? 'not-allowed' : 'pointer'
              }}
            >
              Not now
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                border: 'none',
                background: 'linear-gradient(135deg, #1b7340 0%, #145832 100%)',
                color: '#fff',
                borderRadius: '8px',
                padding: '10px 14px',
                fontWeight: 700,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                opacity: isSubmitting ? 0.7 : 1
              }}
            >
              {isSubmitting ? 'Saving...' : `Continue to ${actionLabel}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const inputStyles: CSSProperties = {
  width: '100%',
  border: '1px solid var(--border-gray)',
  borderRadius: '8px',
  padding: '10px 12px',
  fontSize: '0.95rem',
  color: 'var(--content-text)',
  background: '#fff'
};
