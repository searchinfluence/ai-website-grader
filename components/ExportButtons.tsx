'use client';

import { useEffect, useMemo, useState } from 'react';
import { FileDown, FileText, Loader2, Printer, Share2 } from 'lucide-react';
import { WebsiteAnalysis } from '@/types';
import { createPrintReportUrl, generatePDFReport } from '@/lib/exporters';
import { useGoogleTagManager } from '@/hooks/useGoogleTagManager';
import EmailGateModal, { EmailGateValues } from './EmailGateModal';

interface ExportButtonsProps {
  analysis: WebsiteAnalysis;
  onExportMarkdown: () => void;
}

type ExportAction = 'pdf' | 'print' | 'share' | 'markdown';
type SavedLead = {
  email: string;
  name?: string;
  company?: string;
};

const LEAD_STORAGE_KEY = 'ai-grader-lead';

export default function ExportButtons({ analysis, onExportMarkdown }: ExportButtonsProps) {
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [isSharingReport, setIsSharingReport] = useState(false);
  const [lastShareUrl, setLastShareUrl] = useState<string | null>(null);
  const [savedLead, setSavedLead] = useState<SavedLead | null>(null);
  const [isGateOpen, setIsGateOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<ExportAction | null>(null);
  const [shareToast, setShareToast] = useState<{ tone: 'success' | 'error'; message: string } | null>(null);
  const { trackExport } = useGoogleTagManager();

  const copyText = async (text: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return;
    }

    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', 'true');
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    const copied = document.execCommand('copy');
    document.body.removeChild(textarea);
    if (!copied) {
      throw new Error('Unable to copy share link automatically.');
    }
  };

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LEAD_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<EmailGateValues>;
      if (parsed?.email) {
        setSavedLead({
          name: parsed.name,
          email: parsed.email,
          company: parsed.company
        });
      }
    } catch {
      setSavedLead(null);
    }
  }, []);

  const actionLabel = useMemo(() => {
    if (pendingAction === 'pdf') return 'PDF export';
    if (pendingAction === 'markdown') return 'markdown export';
    if (pendingAction === 'share') return 'share link';
    return 'print view';
  }, [pendingAction]);

  const exportPdf = async () => {
    setIsExportingPDF(true);
    try {
      trackExport('pdf');

      await generatePDFReport(analysis);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Failed to generate PDF: ${errorMessage}`);
    } finally {
      setIsExportingPDF(false);
    }
  };

  const printReport = () => {
    trackExport('print');
    const url = createPrintReportUrl(analysis, 'print');

    // Try opening in a new tab (direct URL — avoids most popup blockers)
    const printWindow = window.open(url, '_blank');
    if (!printWindow) {
      // Fallback: navigate in the same window
      // Store analysis for restoration when user comes back
      sessionStorage.setItem('ai-grader-analysis-backup', JSON.stringify(analysis));
      window.location.href = url;
    }
  };

  const shareReport = async () => {
    setIsSharingReport(true);
    try {
      const response = await fetch('/api/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ analysis })
      });

      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(data?.error || 'Failed to create share link.');
      }

      if (!data?.shareUrl) {
        throw new Error('Share URL was not returned.');
      }

      const shareUrl = data.shareUrl as string;
      await copyText(shareUrl);
      trackExport('share');
      setLastShareUrl(shareUrl);
      setShareToast({ tone: 'success', message: 'Share link copied to clipboard.' });
      setTimeout(() => {
        setShareToast((current) => (current?.message === 'Share link copied to clipboard.' ? null : current));
      }, 2400);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create share link.';
      setShareToast({ tone: 'error', message });
      setTimeout(() => {
        setShareToast((current) => (current?.tone === 'error' ? null : current));
      }, 3200);
    } finally {
      setIsSharingReport(false);
    }
  };

  const copyLatestShareLink = async () => {
    if (!lastShareUrl) return;

    try {
      await copyText(lastShareUrl);
      setShareToast({ tone: 'success', message: 'Share link copied to clipboard.' });
      setTimeout(() => {
        setShareToast((current) => (current?.message === 'Share link copied to clipboard.' ? null : current));
      }, 2400);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to copy share link automatically.';
      setShareToast({ tone: 'error', message });
      setTimeout(() => {
        setShareToast((current) => (current?.tone === 'error' ? null : current));
      }, 3200);
    }
  };

  const runAction = async (action: ExportAction) => {
    if (action === 'pdf') {
      await exportPdf();
      return;
    }

    if (action === 'markdown') {
      onExportMarkdown();
      return;
    }

    if (action === 'share') {
      await shareReport();
      return;
    }

    printReport();
  };

  const startGatedAction = async (action: ExportAction) => {
    if (savedLead?.email) {
      await runAction(action);
      return;
    }

    setPendingAction(action);
    setIsGateOpen(true);
  };

  const handleGateSubmit = async (values: EmailGateValues) => {
    // For print action, pre-open the window NOW (in user gesture context)
    // before the async fetch, so popup blockers don't block it
    let preOpenedWindow: Window | null = null;
    const actionToRun = pendingAction;

    let queuedPrintUrl = '';
    if (actionToRun === 'print' || actionToRun === 'pdf') {
      queuedPrintUrl = createPrintReportUrl(analysis, actionToRun, actionToRun === 'pdf');
      preOpenedWindow = window.open('', '_blank');
      if (preOpenedWindow) {
        preOpenedWindow.document.write(`<html><body style="font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0"><p>Preparing ${actionToRun === 'pdf' ? 'PDF export' : 'print view'}...</p></body></html>`);
      }
    }

    const response = await fetch('/api/leads', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(values)
    });

    const data = await response.json().catch(() => null);
    if (!response.ok) {
      // Close pre-opened window on error
      preOpenedWindow?.close();
      throw new Error(data?.error || 'Unable to save your details right now.');
    }

    localStorage.setItem(LEAD_STORAGE_KEY, JSON.stringify(values));
    setSavedLead(values);

    setPendingAction(null);
    setIsGateOpen(false);

    if (actionToRun) {
      if ((actionToRun === 'print' || actionToRun === 'pdf') && preOpenedWindow) {
        if (actionToRun === 'print') {
          trackExport('print');
        } else {
          trackExport('pdf');
        }
        preOpenedWindow.location.href = queuedPrintUrl;
      } else if (actionToRun === 'print') {
        // Fallback if popup was still blocked
        printReport();
      } else if (actionToRun === 'pdf') {
        await exportPdf();
      } else {
        await runAction(actionToRun);
      }
    }
  };

  return (
    <>
      <div className="export-button-group" style={{
        display: 'grid',
        gap: '12px',
        marginTop: '20px'
      }}>
        <button
          className="export-action-btn"
          onClick={() => void startGatedAction('pdf')}
          disabled={isExportingPDF}
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '12px 20px',
            background: 'linear-gradient(135deg, var(--si-orange) 0%, var(--orange-dark) 100%)',
            color: 'var(--white)',
            border: 'none',
            borderRadius: '8px',
            cursor: isExportingPDF ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 2px 8px rgba(230, 126, 34, 0.3)',
            opacity: isExportingPDF ? 0.6 : 1,
            fontSize: '14px',
            fontWeight: '600',
            fontFamily: 'var(--font-stack)'
          }}
          onMouseEnter={(e) => {
            if (!isExportingPDF) {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(230, 126, 34, 0.42)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(230, 126, 34, 0.3)';
          }}
        >
          {isExportingPDF ? (
            <Loader2 size={16} style={{ marginRight: '8px' }} />
          ) : (
            <FileDown size={16} style={{ marginRight: '8px' }} />
          )}
          {isExportingPDF ? 'Generating PDF...' : 'Export PDF'}
        </button>

        <button
          className="export-action-btn"
          onClick={() => void startGatedAction('markdown')}
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '12px 20px',
            background: 'linear-gradient(135deg, var(--si-medium-blue) 0%, var(--si-navy) 100%)',
            color: 'var(--white)',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 2px 8px rgba(1, 74, 97, 0.28)',
            fontSize: '14px',
            fontWeight: '600',
            fontFamily: 'var(--font-stack)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(1, 74, 97, 0.38)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(1, 74, 97, 0.28)';
          }}
        >
          <FileText size={16} style={{ marginRight: '8px' }} />
          Export Markdown
        </button>

        <button
          className="export-action-btn"
          onClick={() => void startGatedAction('share')}
          disabled={isSharingReport}
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '12px 20px',
            background: 'linear-gradient(135deg, var(--si-light-blue) 0%, var(--si-medium-blue) 100%)',
            color: 'var(--white)',
            border: 'none',
            borderRadius: '8px',
            cursor: isSharingReport ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 2px 8px rgba(78, 177, 205, 0.32)',
            opacity: isSharingReport ? 0.6 : 1,
            fontSize: '14px',
            fontWeight: '600',
            fontFamily: 'var(--font-stack)'
          }}
          onMouseEnter={(e) => {
            if (!isSharingReport) {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(78, 177, 205, 0.42)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(78, 177, 205, 0.32)';
          }}
        >
          {isSharingReport ? (
            <Loader2 size={16} style={{ marginRight: '8px' }} />
          ) : (
            <Share2 size={16} style={{ marginRight: '8px' }} />
          )}
          {isSharingReport ? 'Creating Link...' : 'Share Report'}
        </button>

        <button
          className="export-action-btn"
          onClick={() => void startGatedAction('print')}
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '12px 20px',
            background: 'linear-gradient(135deg, var(--si-green) 0%, #7daf53 100%)',
            color: 'var(--white)',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 2px 8px rgba(145, 195, 100, 0.34)',
            fontSize: '14px',
            fontWeight: '600',
            fontFamily: 'var(--font-stack)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(145, 195, 100, 0.42)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(145, 195, 100, 0.34)';
          }}
        >
          <Printer size={16} style={{ marginRight: '8px' }} />
          Print Report
        </button>
      </div>

      <p style={{ margin: '12px 0 0', color: 'var(--secondary-content)', fontSize: '0.86rem' }}>
        {savedLead?.email
          ? `Exports unlocked for ${savedLead.email}.`
          : 'PDF, markdown, share, and print actions will prompt once for contact details, then remain unlocked on this device.'}
      </p>

      {lastShareUrl && (
        <div style={{
          marginTop: '12px',
          padding: '12px 14px',
          borderRadius: '10px',
          border: '1px solid rgba(78, 177, 205, 0.28)',
          background: 'rgba(78, 177, 205, 0.08)',
          color: 'var(--content-text)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '6px' }}>
            <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700 }}>Latest share link</p>
            <button
              type="button"
              onClick={() => void copyLatestShareLink()}
              style={{
                border: '1px solid rgba(1, 74, 97, 0.24)',
                background: '#fff',
                color: 'var(--si-navy)',
                borderRadius: '8px',
                padding: '6px 10px',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Copy Link
            </button>
          </div>
          <p style={{ margin: 0, wordBreak: 'break-all', fontSize: '0.84rem' }}>
            <a href={lastShareUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--si-navy)', fontWeight: 600 }}>
              {lastShareUrl}
            </a>
          </p>
        </div>
      )}

      {shareToast && (
        <div
          role="status"
          aria-live="polite"
          style={{
          position: 'fixed',
          right: '20px',
          bottom: '20px',
          zIndex: 1250,
          borderRadius: '10px',
          border: `1px solid ${shareToast.tone === 'success' ? 'rgba(27, 115, 64, 0.4)' : 'rgba(231, 76, 60, 0.45)'}`,
          background: shareToast.tone === 'success' ? 'rgba(27, 115, 64, 0.95)' : 'rgba(127, 29, 29, 0.95)',
          color: '#fff',
          padding: '10px 14px',
          boxShadow: '0 12px 28px rgba(15,23,42,0.3)',
          maxWidth: '320px',
          fontSize: '0.9rem'
        }}>
          {shareToast.message}
        </div>
      )}

      <EmailGateModal
        isOpen={isGateOpen}
        actionLabel={actionLabel}
        initialValues={savedLead ? {
          name: savedLead.name,
          email: savedLead.email,
          company: savedLead.company
        } : undefined}
        onClose={() => {
          setIsGateOpen(false);
          setPendingAction(null);
        }}
        onSubmit={handleGateSubmit}
      />
    </>
  );
}
