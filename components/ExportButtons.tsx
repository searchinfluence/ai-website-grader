'use client';

import { useState } from 'react';
import { FileText, FileDown, Loader2, Printer } from 'lucide-react';
import { WebsiteAnalysis } from '@/types';
import { generatePDFReport } from '@/lib/exporters';
import { useGoogleTagManager } from '@/hooks/useGoogleTagManager';

interface ExportButtonsProps {
  analysis: WebsiteAnalysis;
  onExportMarkdown: () => void;
}

export default function ExportButtons({ analysis, onExportMarkdown }: ExportButtonsProps) {
  const [isExportingPDF, setIsExportingPDF] = useState(false);
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
    </div>
  );
}
