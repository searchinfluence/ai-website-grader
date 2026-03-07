'use client';

import { useState } from 'react';
import { Check, Copy, FileText, FileDown, Loader2, Printer, Share2 } from 'lucide-react';
import { WebsiteAnalysis } from '@/types';
import { generatePDFReport } from '@/lib/exporters';
import { useGoogleTagManager } from '@/hooks/useGoogleTagManager';

interface ExportButtonsProps {
  analysis: WebsiteAnalysis;
  onExportMarkdown: () => void;
}

export default function ExportButtons({ analysis, onExportMarkdown }: ExportButtonsProps) {
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [isSharingReport, setIsSharingReport] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const { trackExport } = useGoogleTagManager();

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

  const handlePrint = () => {
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

  const handleShareReport = async () => {
    setIsSharingReport(true);
    setCopySuccess(false);
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

      trackExport('share');
      setShareUrl(data.shareUrl as string);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create share link.';
      alert(message);
      setShareUrl(null);
    } finally {
      setIsSharingReport(false);
    }
  };

  const handleCopyShareLink = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 1800);
    } catch {
      setCopySuccess(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: '12px',
      marginTop: '20px'
    }}>
      <button
        onClick={handleExportPDF}
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
        onClick={handleShareReport}
        disabled={isSharingReport}
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '12px 20px',
          background: 'linear-gradient(135deg, #6c5ce7 0%, #5f4dd6 100%)',
          color: 'var(--white)',
          border: 'none',
          borderRadius: '8px',
          cursor: isSharingReport ? 'not-allowed' : 'pointer',
          transition: 'all 0.3s ease',
          boxShadow: '0 2px 8px rgba(108, 92, 231, 0.28)',
          opacity: isSharingReport ? 0.6 : 1,
          fontSize: '14px',
          fontWeight: '600',
          fontFamily: 'var(--font-stack)'
        }}
        onMouseEnter={(e) => {
          if (!isSharingReport) {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(108, 92, 231, 0.35)';
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(108, 92, 231, 0.28)';
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
        onClick={handlePrint}
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

      {shareUrl && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.45)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1100,
          padding: '20px'
        }}>
          <div style={{
            width: 'min(680px, 100%)',
            background: 'var(--content-bg)',
            borderRadius: '12px',
            border: '1px solid var(--border-gray)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.18)',
            padding: '18px'
          }}>
            <h3 style={{ margin: '0 0 10px', color: 'var(--content-text)' }}>Share Report</h3>
            <p style={{ margin: '0 0 12px', color: 'var(--secondary-content)' }}>
              Anyone with this link can view the report for the next 30 days.
            </p>
            <div style={{
              border: '1px solid var(--border-gray)',
              borderRadius: '8px',
              background: 'var(--background-gray)',
              padding: '12px',
              marginBottom: '12px',
              fontSize: '0.9rem',
              color: 'var(--content-text)',
              wordBreak: 'break-all'
            }}>
              {shareUrl}
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShareUrl(null)}
                style={{
                  border: '1px solid var(--border-gray)',
                  background: 'transparent',
                  color: 'var(--content-text)',
                  borderRadius: '8px',
                  padding: '9px 12px',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                Close
              </button>
              <button
                onClick={handleCopyShareLink}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  border: 'none',
                  background: 'var(--success-green)',
                  color: 'white',
                  borderRadius: '8px',
                  padding: '9px 12px',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                {copySuccess ? <Check size={15} /> : <Copy size={15} />}
                {copySuccess ? 'Copied' : 'Copy Link'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
