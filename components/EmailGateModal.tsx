'use client';

import { FormEvent, useEffect, useState } from 'react';

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
    <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-slate-900/75 p-4">
      <div className="w-full max-w-xl overflow-hidden rounded-xl border border-slate-700 bg-slate-900 text-slate-100 shadow-2xl">
        <div className="border-b border-slate-700 bg-gradient-to-r from-[#1B7340] to-[#145832] px-6 py-5">
          <h3 className="text-xl font-bold">Get your full report</h3>
          <p className="mt-1 text-sm text-slate-100/90">
            Add your details to unlock exports and get practical next steps. No spam.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          <label className="block space-y-1">
            <span className="text-sm font-semibold text-slate-200">Name</span>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoComplete="name"
              disabled={isSubmitting}
              className="w-full rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-400 focus:border-[#1B7340] focus:outline-none focus:ring-2 focus:ring-[#1B7340]/30 disabled:cursor-not-allowed disabled:opacity-70"
            />
          </label>

          <label className="block space-y-1">
            <span className="text-sm font-semibold text-slate-200">Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              disabled={isSubmitting}
              className="w-full rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-400 focus:border-[#1B7340] focus:outline-none focus:ring-2 focus:ring-[#1B7340]/30 disabled:cursor-not-allowed disabled:opacity-70"
            />
          </label>

          <label className="block space-y-1">
            <span className="text-sm font-semibold text-slate-200">Company (optional)</span>
            <input
              type="text"
              value={company}
              onChange={(event) => setCompany(event.target.value)}
              autoComplete="organization"
              disabled={isSubmitting}
              className="w-full rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-400 focus:border-[#1B7340] focus:outline-none focus:ring-2 focus:ring-[#1B7340]/30 disabled:cursor-not-allowed disabled:opacity-70"
            />
          </label>

          {error && (
            <p className="rounded-md border border-red-500/40 bg-red-900/30 px-3 py-2 text-sm text-red-200">{error}</p>
          )}

          <div className="flex flex-wrap items-center justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-md border border-slate-600 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-slate-500 hover:text-slate-100 disabled:cursor-not-allowed disabled:opacity-70"
            >
              Not now
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-[#1B7340] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#145832] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? 'Saving...' : `Continue to ${actionLabel}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
