'use client';

import { CSSProperties, FormEvent, useEffect, useState } from 'react';

export type EmailGateValues = {
  name: string;
  email: string;
  company?: string;
};

interface EmailGateModalProps {
  isOpen: boolean;
  actionLabel: string;
  initialValues?: Partial<EmailGateValues>;
  onClose: () => void;
  onSubmit: (values: EmailGateValues) => Promise<void>;
}

export default function EmailGateModal({
  isOpen,
  actionLabel,
  initialValues,
  onClose,
  onSubmit
}: EmailGateModalProps) {
  const [name, setName] = useState(initialValues?.name || '');
  const [email, setEmail] = useState(initialValues?.email || '');
  const [company, setCompany] = useState(initialValues?.company || '');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setName(initialValues?.name || '');
    setEmail(initialValues?.email || '');
    setCompany(initialValues?.company || '');
    setError(null);
  }, [isOpen, initialValues?.company, initialValues?.email, initialValues?.name]);

  if (!isOpen) return null;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
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
      setError(submitError instanceof Error ? submitError.message : 'Unable to save your details right now.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={overlayStyles}>
      <div style={containerStyles}>
        <div style={headerStyles}>
          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>Get your full report</h3>
          <p style={{ margin: '6px 0 0', fontSize: '0.9rem', color: 'rgba(255,255,255,0.9)' }}>
            Add your details to unlock exports and get practical next steps. No spam.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '20px', display: 'grid', gap: '14px' }}>
          <label style={{ display: 'grid', gap: '6px' }}>
            <span style={labelStyles}>Name</span>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoComplete="name"
              disabled={isSubmitting}
              style={{
                ...inputStyles,
                ...(isSubmitting ? disabledInputStyles : {})
              }}
            />
          </label>

          <label style={{ display: 'grid', gap: '6px' }}>
            <span style={labelStyles}>Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              disabled={isSubmitting}
              style={{
                ...inputStyles,
                ...(isSubmitting ? disabledInputStyles : {})
              }}
            />
          </label>

          <label style={{ display: 'grid', gap: '6px' }}>
            <span style={labelStyles}>Company (optional)</span>
            <input
              type="text"
              value={company}
              onChange={(event) => setCompany(event.target.value)}
              autoComplete="organization"
              disabled={isSubmitting}
              style={{
                ...inputStyles,
                ...(isSubmitting ? disabledInputStyles : {})
              }}
            />
          </label>

          {error && (
            <p style={errorStyles}>{error}</p>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', flexWrap: 'wrap', paddingTop: '4px' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              style={{
                border: '1px solid var(--border-gray, #4b5563)',
                background: 'transparent',
                color: 'var(--secondary-content, #9ca3af)',
                borderRadius: '8px',
                padding: '10px 16px',
                fontSize: '0.9rem',
                fontWeight: 500,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                opacity: isSubmitting ? 0.7 : 1
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
                padding: '10px 16px',
                fontSize: '0.9rem',
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

const overlayStyles: CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 1200,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'rgba(15, 23, 42, 0.75)',
  padding: '16px'
};

const containerStyles: CSSProperties = {
  width: '100%',
  maxWidth: '520px',
  maxHeight: 'calc(100vh - 32px)',
  overflowY: 'auto',
  overflowX: 'hidden',
  borderRadius: '12px',
  border: '1px solid #d7e0e8',
  background: '#ffffff',
  color: '#0f172a',
  boxShadow: '0 24px 48px rgba(0, 0, 0, 0.35)'
};

const headerStyles: CSSProperties = {
  borderBottom: '1px solid var(--border-gray, #334155)',
  background: 'linear-gradient(135deg, #1b7340 0%, #145832 100%)',
  padding: '18px 20px'
};

const labelStyles: CSSProperties = {
  fontSize: '0.88rem',
  fontWeight: 600,
  color: '#0f172a'
};

const inputStyles: CSSProperties = {
  width: '100%',
  border: '1px solid #cbd5e1',
  borderRadius: '8px',
  padding: '10px 12px',
  fontSize: '0.95rem',
  color: '#0f172a',
  background: '#ffffff',
  outline: 'none',
  boxSizing: 'border-box'
};

const disabledInputStyles: CSSProperties = {
  cursor: 'not-allowed',
  opacity: 0.7
};

const errorStyles: CSSProperties = {
  margin: 0,
  padding: '8px 12px',
  borderRadius: '8px',
  border: '1px solid rgba(239, 68, 68, 0.4)',
  background: 'rgba(127, 29, 29, 0.3)',
  color: '#fca5a5',
  fontSize: '0.88rem'
};
