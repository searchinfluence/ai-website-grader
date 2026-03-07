'use client';

import { useEffect, useState } from 'react';
import { FileText, FileDown, Link2, Loader2, Printer } from 'lucide-react';
import { WebsiteAnalysis } from '@/types';
import { generatePDFReport } from '@/lib/exporters';
import { useGoogleTagManager } from '@/hooks/useGoogleTagManager';
import LeadCaptureModal from './LeadCaptureModal';

interface ExportButtonsProps {
  analysis: WebsiteAnalysis;
  onExportMarkdown: () => void;
  onShare?: () => Promise<void>;
}

const LEAD_STORAGE_KEY = 'ai-grader-export-lead';

export default function ExportButtons({ analysis, onExportMarkdown, onShare }: ExportButtonsProps) {
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [isGateOpen, setIsGateOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<'pdf' | 'print' | 'share' | null>(null);
  const [pendingActionCallback, setPendingActionCallback] = useState<(() => Promise<void> | void) | null>(null);
  const [capturedLead, setCapturedLead] = useState<{ name: string; email: string; company?: string } | null>(null);
  const [shareInProgress, setShareInProgress] = useState(false);
  const { trackExport } = useGoogleTagManager();

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LEAD_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as { name?: string; email?: string; company?: string };
      if (typeof parsed?.name === 'string' && typeof parsed?.email === 'string') {
        setCapturedLead({
          name: parsed.name,
          email: parsed.email,
          company: parsed.company
        });
      }
    } catch {
      setCapturedLead(null);
    }
  }, []);

  const requestLeadGate = (action: 'pdf' | 'print' | 'share', callback: () => Promise<void> | void) => {
    if (capturedLead) {
      void callback();
      return;
    }
    setPendingAction(action);
    setPendingActionCallback(() => callback);
    setIsGateOpen(true);
  };

  const handleExportPDF = async () => {
    setIsExportingPDF(true);
    try {
      trackExport('pdf');

      const reportContainer = document.getElementById('report-container');
      if (!reportContainer) {
        throw new Error('Report container not found. Please ensure the analysis is complete.');
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
      await generatePDFReport(analysis);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Failed to generate PDF: ${errorMessage}`);
    } finally {
      setIsExportingPDF(false);
    }
  };

  const handlePrint = async () => {
    trackExport('print');

    const printWindow = window.open('', '_blank', 'noopener');
    if (!printWindow) {
      alert('Please allow popups to print the report');
      return;
    }

    const key = `ai-report:${Date.now()}`;
    localStorage.setItem(key, JSON.stringify(analysis));
    printWindow.location.href = `/print-report?key=${encodeURIComponent(key)}`;
  };

  const handleShare = async () => {
    if (!onShare) return;
    setShareInProgress(true);
    try {
      trackExport('share');
      await onShare();
    } finally {
      setShareInProgress(false);
    }
  };

  const handleLeadSubmit = async (values: { name: string; email: string; company?: string }) => {
    const response = await fetch('/api/leads', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(values)
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error((data as { error?: string }).error || 'Unable to capture lead right now.');
    }

    localStorage.setItem(LEAD_STORAGE_KEY, JSON.stringify(values));
    setCapturedLead(values);
    setIsGateOpen(false);

    const callback = pendingActionCallback;
    setPendingAction(null);
    setPendingActionCallback(null);
    if (callback) {
      await callback();
    }
  };

  return (
    <>
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '12px',
        marginTop: '20px'
      }}>
        <button
          onClick={() => requestLeadGate('pdf', handleExportPDF)}
          disabled={isExportingPDF}
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '12px 20px',
            background: 'linear-gradient(135deg, var(--orange-accent) 0%, var(--orange-dark) 100%)',
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
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(230, 126, 34, 0.4)';
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
          onClick={onExportMarkdown}
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '12px 20px',
            background: 'linear-gradient(135deg, var(--info-blue) 0%, #2980b9 100%)',
            color: 'var(--white)',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 2px 8px rgba(52, 152, 219, 0.3)',
            fontSize: '14px',
            fontWeight: '600',
            fontFamily: 'var(--font-stack)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(52, 152, 219, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(52, 152, 219, 0.3)';
          }}
        >
          <FileText size={16} style={{ marginRight: '8px' }} />
          Export Markdown
        </button>

        <button
          onClick={() => requestLeadGate('print', handlePrint)}
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '12px 20px',
            background: 'linear-gradient(135deg, var(--success-green) 0%, #229954 100%)',
            color: 'var(--white)',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 2px 8px rgba(39, 174, 96, 0.3)',
            fontSize: '14px',
            fontWeight: '600',
            fontFamily: 'var(--font-stack)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(39, 174, 96, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(39, 174, 96, 0.3)';
          }}
        >
          <Printer size={16} style={{ marginRight: '8px' }} />
          Print Report
        </button>

        {onShare && (
          <button
            onClick={() => requestLeadGate('share', handleShare)}
            disabled={shareInProgress}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '12px 20px',
              background: 'linear-gradient(135deg, #2c3e50 0%, #1f2a36 100%)',
              color: 'var(--white)',
              border: 'none',
              borderRadius: '8px',
              cursor: shareInProgress ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 2px 8px rgba(44, 62, 80, 0.35)',
              opacity: shareInProgress ? 0.65 : 1,
              fontSize: '14px',
              fontWeight: '600',
              fontFamily: 'var(--font-stack)'
            }}
            onMouseEnter={(e) => {
              if (!shareInProgress) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(44, 62, 80, 0.45)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(44, 62, 80, 0.35)';
            }}
          >
            {shareInProgress ? (
              <Loader2 size={16} style={{ marginRight: '8px' }} />
            ) : (
              <Link2 size={16} style={{ marginRight: '8px' }} />
            )}
            {shareInProgress ? 'Creating Link...' : 'Share Link'}
          </button>
        )}
      </div>

      <LeadCaptureModal
        isOpen={isGateOpen}
        actionLabel={pendingAction === 'print' ? 'Print' : pendingAction === 'share' ? 'Share' : 'Export'}
        initialValues={capturedLead || undefined}
        onClose={() => {
          setIsGateOpen(false);
          setPendingAction(null);
          setPendingActionCallback(null);
        }}
        onSubmit={handleLeadSubmit}
      />
    </>
  );
}
