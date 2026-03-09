'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { WebsiteAnalysis } from '@/types';
import { SCORING_FACTORS } from '@/lib/scoring/config';
import { normalizeWebsiteAnalysis } from '@/lib/normalize-analysis';

function getScoreColor(score: number): string {
  if (score >= 80) return '#91c364';
  if (score >= 70) return '#4eb1cd';
  if (score >= 50) return '#3490b5';
  return '#e67e22';
}

function getScoreSummary(score: number): string {
  if (score >= 80) return 'Excellent';
  if (score >= 70) return 'Good';
  if (score >= 50) return 'Needs Improvement';
  return 'Critical';
}

function formatStatLabel(key: string): string {
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, (value) => value.toUpperCase());
}

function formatStatValue(key: string, value: unknown): string {
  if (typeof value === 'number') {
    if (['altCoverage', 'readabilityScore', 'pageSpeedScore'].includes(key)) return `${Math.round(value)}%`;
    if (key === 'loadTimeMs') return `${Math.round(value)}ms`;
    if (key === 'contentToCodeRatio') return `${(value * 100).toFixed(1)}%`;
    if (['titleLength', 'descriptionLength'].includes(key)) return `${value} chars`;
    return `${Math.round(value * 100) / 100}`;
  }

  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }

  if (Array.isArray(value)) {
    return value.length ? value.join(', ') : 'None';
  }

  if (value === null || value === undefined || value === '') {
    return 'N/A';
  }

  return String(value);
}

export default function PrintReportPage() {
  return (
    <Suspense fallback={<main style={{ padding: '24px', fontFamily: 'Arial, sans-serif' }}>Loading...</main>}>
      <PrintReportContent />
    </Suspense>
  );
}

function PrintReportContent() {
  const searchParams = useSearchParams();
  const [analysis, setAnalysis] = useState<WebsiteAnalysis | null>(null);
  const mode = searchParams.get('mode') === 'pdf' ? 'pdf' : 'print';
  const shouldAutoPrint = searchParams.get('autoPrint') === 'true';

  useEffect(() => {
    const key = searchParams.get('key');
    if (!key) return;

    try {
      const raw = localStorage.getItem(key);
      if (!raw) return;

      const parsed = normalizeWebsiteAnalysis(JSON.parse(raw));
      setAnalysis(parsed);
      localStorage.removeItem(key);
    } catch {
      setAnalysis(null);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!analysis) return;

    document.title = mode === 'pdf' ? 'AI Website Grader PDF Export' : 'AI Website Grader Print View';
  }, [analysis, mode]);

  useEffect(() => {
    if (!analysis || !shouldAutoPrint) return;

    const timer = setTimeout(() => {
      window.print();
    }, 300);

    return () => clearTimeout(timer);
  }, [analysis, shouldAutoPrint]);

  if (!analysis) {
    return (
      <main style={{ padding: '24px', fontFamily: 'Arial, sans-serif', textAlign: 'center', marginTop: '40px' }}>
        <p>Print data not found.</p>
        <button
          onClick={() => {
            if (window.history.length > 1) {
              window.history.back();
            } else {
              window.close();
              // Fallback if window.close() is blocked (not opened by script)
              setTimeout(() => { window.location.href = '/'; }, 200);
            }
          }}
          style={{
            marginTop: '12px',
            padding: '10px 20px',
            background: '#012c3a',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Back to Report
        </button>
      </main>
    );
  }

  const factorRows = SCORING_FACTORS.map((factor) => ({
    key: factor.key,
    name: factor.label,
    score: analysis.factors[factor.key].score,
    status: analysis.factors[factor.key].status,
    weight: Math.round(factor.weight * 100),
    findings: analysis.factors[factor.key].findings,
    recommendations: analysis.factors[factor.key].recommendations,
    stats: Object.entries(analysis.factors[factor.key].stats ?? {})
  }));
  const scoreColor = getScoreColor(analysis.overallScore);
  const performanceMetrics = analysis.crawledContent?.aiAnalysisData?.performanceMetrics;
  const contentImprovements = analysis.contentImprovements && analysis.contentImprovements.length > 0
    ? analysis.contentImprovements
    : analysis.recommendations.slice(0, 3).map((recommendation, index) => ({
      section: `${recommendation.category} Improvement ${index + 1}`,
      current: `Gap identified in ${recommendation.category}: ${recommendation.text}`,
      improved: `Implement this action first: ${recommendation.text}`,
      reasoning: 'Addressing this issue improves crawlability, relevance, and AI answer quality for this page.',
      priority: recommendation.priority
    }));

  return (
    <main className="print-root" style={{ padding: 0, fontFamily: "'Open Sans', Arial, sans-serif", color: '#012c3a', background: '#fff' }}>
      <style jsx global>{`
        @media screen {
          .print-only {
            display: none !important;
          }
        }

        @media print {
          html, body {
            margin: 0;
            padding: 0;
            background: #fff !important;
            color: #012c3a !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .print-toolbar {
            display: none !important;
          }

          .print-section,
          .print-factor-section,
          .print-panel {
            break-inside: avoid;
            page-break-inside: avoid;
          }

          .print-page-break {
            break-before: page;
            page-break-before: always;
          }

          .print-markdown {
            max-height: none !important;
            overflow: visible !important;
            white-space: pre-wrap !important;
          }

          @page {
            size: auto;
            margin: 0.5in;
          }
        }
      `}</style>

      <div
        className="print-toolbar"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px',
          padding: '10px 28px',
          background: '#f0f4f7',
          borderBottom: '1px solid #dde3e8',
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}
      >
        <button
          onClick={() => {
            if (window.history.length > 1) {
              window.history.back();
            } else {
              window.close();
              setTimeout(() => { window.location.href = '/'; }, 200);
            }
          }}
          style={{
            padding: '8px 16px',
            background: '#012c3a',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 600
          }}
        >
          Back to Report
        </button>
        <button
          onClick={() => window.print()}
          style={{
            padding: '8px 16px',
            background: '#91c364',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 600
          }}
        >
          {mode === 'pdf' ? 'Save as PDF' : 'Print Again'}
        </button>
      </div>

      <header
        style={{
          background: 'linear-gradient(135deg, #012c3a 0%, #014a61 58%, #3490b5 100%)',
          color: '#fff',
          padding: '24px 28px 18px',
          borderBottom: '4px solid #e67e22'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '24px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/search-influence-logo.png" alt="Search Influence" style={{ height: '34px', width: 'auto', marginBottom: '12px' }} />
            <h1 style={{ margin: '0 0 6px', fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.01em' }}>AI Website Grader Report</h1>
            <p style={{ margin: 0, color: '#d8eff6', fontSize: '0.94rem' }}>
              {mode === 'pdf'
                ? 'Search Influence branded export view for saving or sharing as PDF.'
                : 'Search Influence branded print summary for implementation and review.'}
            </p>
          </div>
          <div style={{ textAlign: 'right', fontSize: '0.84rem', color: '#d8eff6', minWidth: '220px' }}>
            <p style={{ margin: '0 0 4px' }}><strong style={{ color: '#fff' }}>Generated:</strong> {new Date(analysis.timestamp).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p style={{ margin: 0, wordBreak: 'break-word' }}><strong style={{ color: '#fff' }}>URL:</strong> {analysis.url}</p>
          </div>
        </div>
      </header>

      <section
        className="print-panel"
        style={{
          display: 'flex',
          gap: '24px',
          alignItems: 'center',
          padding: '22px 28px',
          background: '#f8fafb',
          borderBottom: '1px solid #e2e8ef',
          flexWrap: 'wrap'
        }}
      >
        <div
          style={{
            width: '116px',
            height: '116px',
            borderRadius: '999px',
            border: `8px solid ${scoreColor}`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: scoreColor,
            background: '#fff',
            flexShrink: 0
          }}
        >
          <strong style={{ fontSize: '2rem', lineHeight: 1 }}>{analysis.overallScore}</strong>
          <span style={{ fontSize: '0.72rem', letterSpacing: '0.08em', fontWeight: 700 }}>/ 100</span>
        </div>

        <div style={{ flex: '1 1 320px' }}>
          <p style={{ margin: '0 0 6px', fontSize: '0.95rem', color: '#4d5966' }}>
            <strong style={{ color: '#012c3a' }}>Page title:</strong> {analysis.title || 'Untitled page'}
          </p>
          <p style={{ margin: '0 0 10px', fontSize: '0.95rem', color: '#4d5966' }}>
            <strong style={{ color: '#012c3a' }}>Overall status:</strong> <span style={{ color: scoreColor, fontWeight: 700 }}>{getScoreSummary(analysis.overallScore)}</span>
          </p>
          <p style={{ margin: 0, color: '#4d5966', lineHeight: 1.55 }}>
            {mode === 'pdf'
              ? 'This export view includes the same full report content used for printing: score breakdown, priority recommendations, factor-by-factor findings, performance notes, content structure, and next steps.'
              : 'This print view includes the full report content: score breakdown, priority recommendations, factor-by-factor findings, performance notes, content structure, and next steps.'}
          </p>
        </div>

        <div style={{ width: '220px', flex: '1 1 220px' }}>
          {factorRows.map((row) => {
            const barColor = getScoreColor(row.score);
            return (
              <div key={row.key} style={{ marginBottom: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: '#4d5966', marginBottom: '2px', gap: '8px' }}>
                  <span>{row.name}</span>
                  <span style={{ fontWeight: 700, color: barColor }}>{row.score}%</span>
                </div>
                <div style={{ background: '#e8ecf0', borderRadius: '3px', height: '6px', overflow: 'hidden' }}>
                  <div style={{ width: `${row.score}%`, height: '100%', background: barColor, borderRadius: '3px' }} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <div style={{ padding: '0 28px 28px' }}>
        <section className="print-section" style={{ marginTop: '20px' }}>
          <h2 style={{ margin: '0 0 10px', fontSize: '1.15rem', fontWeight: 800, color: '#012c3a', borderLeft: '4px solid #3490b5', paddingLeft: '10px' }}>Score Breakdown</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#012c3a' }}>
                <th style={{ textAlign: 'left', padding: '9px 12px', color: '#fff', fontSize: '0.85rem', fontWeight: 700 }}>Factor</th>
                <th style={{ textAlign: 'left', padding: '9px 12px', color: '#fff', fontSize: '0.85rem', fontWeight: 700 }}>Score</th>
                <th style={{ textAlign: 'left', padding: '9px 12px', color: '#fff', fontSize: '0.85rem', fontWeight: 700 }}>Status</th>
                <th style={{ textAlign: 'left', padding: '9px 12px', color: '#fff', fontSize: '0.85rem', fontWeight: 700 }}>Weight</th>
              </tr>
            </thead>
            <tbody>
              {factorRows.map((row, index) => (
                <tr key={row.key} style={{ background: index % 2 === 0 ? '#f5f8fc' : '#fff' }}>
                  <td style={{ borderBottom: '1px solid #e8ecf0', padding: '9px 12px', fontWeight: 600 }}>{row.name}</td>
                  <td style={{ borderBottom: '1px solid #e8ecf0', padding: '9px 12px', fontWeight: 700, color: getScoreColor(row.score) }}>{row.score}%</td>
                  <td style={{ borderBottom: '1px solid #e8ecf0', padding: '9px 12px', textTransform: 'capitalize' }}>{row.status}</td>
                  <td style={{ borderBottom: '1px solid #e8ecf0', padding: '9px 12px' }}>{row.weight}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="print-section print-page-break" style={{ marginTop: '24px' }}>
          <h2 style={{ margin: '0 0 10px', fontSize: '1.15rem', fontWeight: 800, color: '#012c3a', borderLeft: '4px solid #e67e22', paddingLeft: '10px' }}>Priority Recommendations</h2>
          <div>
            {analysis.recommendations.map((item, index) => {
              const priorityColor = item.priority === 'high' ? '#e67e22' : item.priority === 'medium' ? '#3490b5' : '#91c364';
              return (
                <article
                  key={`${item.category}-${index}`}
                  className="print-panel"
                  style={{
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'flex-start',
                    padding: '12px 0',
                    borderBottom: '1px solid #eef1f4'
                  }}
                >
                  <span
                    style={{
                      width: '10px',
                      height: '10px',
                      marginTop: '7px',
                      borderRadius: '50%',
                      background: priorityColor,
                      flexShrink: 0
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', marginBottom: '4px' }}>
                      <strong style={{ color: '#012c3a' }}>{item.category}</strong>
                      <span style={{ color: priorityColor, fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>{item.priority} priority</span>
                    </div>
                    <p style={{ margin: '0 0 6px', color: '#334155', lineHeight: 1.55 }}>{item.text}</p>
                    {item.timeToImplement && (
                      <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem' }}>Time to implement: {item.timeToImplement}</p>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="print-page-break" style={{ marginTop: '24px' }}>
          <h2 style={{ margin: '0 0 12px', fontSize: '1.15rem', fontWeight: 800, color: '#012c3a', borderLeft: '4px solid #012c3a', paddingLeft: '10px' }}>Detailed Factor Analysis</h2>
          <div style={{ display: 'grid', gap: '14px' }}>
            {factorRows.map((row) => (
              <article
                key={`print-factor-${row.key}`}
                className="print-factor-section"
                style={{
                  border: '1px solid #dbe4ea',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  background: '#fff'
                }}
              >
                <div style={{ padding: '14px 16px', background: '#f6f9fb', borderBottom: '1px solid #dbe4ea' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <h3 style={{ margin: 0, color: '#012c3a', fontSize: '1rem' }}>{row.name}</h3>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                      <span style={{ color: getScoreColor(row.score), fontWeight: 800 }}>{row.score}%</span>
                      <span style={{ color: '#64748b', fontSize: '0.85rem', textTransform: 'capitalize' }}>{row.status}</span>
                      <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Weight {row.weight}%</span>
                    </div>
                  </div>
                </div>

                <div style={{ padding: '16px' }}>
                  {row.stats.length > 0 && (
                    <div className="print-panel" style={{ marginBottom: '14px' }}>
                      <h4 style={{ margin: '0 0 8px', color: '#012c3a', fontSize: '0.92rem' }}>Metrics</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '8px' }}>
                        {row.stats.map(([key, value]) => (
                          <div key={`${row.key}-stat-${key}`} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 10px', background: '#fbfdff' }}>
                            <div style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: '3px' }}>{formatStatLabel(key)}</div>
                            <div style={{ color: '#0f172a', fontWeight: 700, fontSize: '0.88rem' }}>{formatStatValue(key, value)}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {row.findings.length > 0 && (
                    <div className="print-panel" style={{ marginBottom: '14px' }}>
                      <h4 style={{ margin: '0 0 8px', color: '#012c3a', fontSize: '0.92rem' }}>Key Findings</h4>
                      <ul style={{ margin: 0, paddingLeft: '18px', color: '#334155' }}>
                        {row.findings.map((finding, index) => (
                          <li key={`${row.key}-finding-${index}`} style={{ marginBottom: '6px' }}>{finding}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {row.recommendations.length > 0 && (
                    <div className="print-panel">
                      <h4 style={{ margin: '0 0 8px', color: '#012c3a', fontSize: '0.92rem' }}>Recommendations</h4>
                      <div style={{ display: 'grid', gap: '8px' }}>
                        {row.recommendations.map((recommendation, index) => (
                          <div key={`${row.key}-recommendation-${index}`} style={{ borderLeft: `4px solid ${getScoreColor(recommendation.priority === 'high' ? 20 : recommendation.priority === 'medium' ? 60 : 85)}`, background: '#f8fafc', padding: '10px 12px', borderRadius: '8px' }}>
                            <p style={{ margin: '0 0 6px', color: '#0f172a' }}>{recommendation.text}</p>
                            <p style={{ margin: 0, color: '#64748b', fontSize: '0.82rem' }}>
                              {recommendation.category}{recommendation.timeToImplement ? ` • ${recommendation.timeToImplement}` : ''}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="print-page-break" style={{ marginTop: '24px' }}>
          <h2 style={{ margin: '0 0 12px', fontSize: '1.15rem', fontWeight: 800, color: '#012c3a', borderLeft: '4px solid #91c364', paddingLeft: '10px' }}>Performance Analysis</h2>
          {performanceMetrics ? (
            <div style={{ display: 'grid', gap: '12px' }}>
              {performanceMetrics.coreWebVitals && (
                <div className="print-panel" style={{ border: '1px solid #dbe4ea', borderRadius: '12px', padding: '14px 16px', background: '#fff' }}>
                  <h3 style={{ margin: '0 0 8px', color: '#012c3a', fontSize: '0.96rem' }}>Core Web Vitals</h3>
                  <p style={{ margin: '0 0 4px', color: '#334155' }}>Performance score: {performanceMetrics.coreWebVitals.score}/100</p>
                  <p style={{ margin: '0 0 4px', color: '#334155' }}>LCP: {performanceMetrics.coreWebVitals.lcp}ms</p>
                  <p style={{ margin: '0 0 4px', color: '#334155' }}>FID: {performanceMetrics.coreWebVitals.fid}ms</p>
                  <p style={{ margin: 0, color: '#334155' }}>CLS: {performanceMetrics.coreWebVitals.cls}</p>
                </div>
              )}
              {performanceMetrics.htmlValidation && (
                <div className="print-panel" style={{ border: '1px solid #dbe4ea', borderRadius: '12px', padding: '14px 16px', background: '#fff' }}>
                  <h3 style={{ margin: '0 0 8px', color: '#012c3a', fontSize: '0.96rem' }}>HTML Validation</h3>
                  <p style={{ margin: '0 0 4px', color: '#334155' }}>Status: {performanceMetrics.htmlValidation.isValid ? 'Valid' : 'Invalid'}</p>
                  <p style={{ margin: '0 0 4px', color: '#334155' }}>Errors: {performanceMetrics.htmlValidation.errors}</p>
                  <p style={{ margin: '0 0 8px', color: '#334155' }}>Warnings: {performanceMetrics.htmlValidation.warnings}</p>
                  {performanceMetrics.htmlValidation.messages.length > 0 && (
                    <ul style={{ margin: 0, paddingLeft: '18px', color: '#334155' }}>
                      {performanceMetrics.htmlValidation.messages.slice(0, 10).map((message, index) => (
                        <li key={`validation-message-${index}`} style={{ marginBottom: '4px' }}>
                          {message.type.toUpperCase()}: {message.message}{message.line ? ` (Line ${message.line})` : ''}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
              {performanceMetrics.accessibilityScore !== undefined && (
                <div className="print-panel" style={{ border: '1px solid #dbe4ea', borderRadius: '12px', padding: '14px 16px', background: '#fff' }}>
                  <h3 style={{ margin: '0 0 8px', color: '#012c3a', fontSize: '0.96rem' }}>Accessibility Score</h3>
                  <p style={{ margin: 0, color: '#334155' }}>{performanceMetrics.accessibilityScore}/100</p>
                </div>
              )}
              {performanceMetrics.performanceScore !== undefined && (
                <div className="print-panel" style={{ border: '1px solid #dbe4ea', borderRadius: '12px', padding: '14px 16px', background: '#fff' }}>
                  <h3 style={{ margin: '0 0 8px', color: '#012c3a', fontSize: '0.96rem' }}>Combined Performance Score</h3>
                  <p style={{ margin: 0, color: '#334155' }}>{performanceMetrics.performanceScore}/100</p>
                </div>
              )}
            </div>
          ) : (
            <div className="print-panel" style={{ border: '1px solid #dbe4ea', borderRadius: '12px', padding: '14px 16px', background: '#fff' }}>
              <p style={{ margin: 0, color: '#334155' }}>Performance metrics were unavailable during analysis, but the rest of the report remains valid.</p>
            </div>
          )}
        </section>

        {analysis.crawledContent?.markdownContent && (
          <section className="print-page-break" style={{ marginTop: '24px' }}>
            <h2 style={{ margin: '0 0 12px', fontSize: '1.15rem', fontWeight: 800, color: '#012c3a', borderLeft: '4px solid #4eb1cd', paddingLeft: '10px' }}>Page Content Structure (Markdown)</h2>
            <div className="print-panel print-markdown" style={{ border: '1px solid #dbe4ea', borderRadius: '12px', padding: '16px', background: '#f8fafc', maxHeight: 'none', overflow: 'visible' }}>
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: '#1e293b', fontSize: '0.84rem', lineHeight: 1.55 }}>
                <code>{analysis.crawledContent.markdownContent}</code>
              </pre>
            </div>
          </section>
        )}

        {contentImprovements.length > 0 && (
          <section className="print-page-break" style={{ marginTop: '24px' }}>
            <h2 style={{ margin: '0 0 12px', fontSize: '1.15rem', fontWeight: 800, color: '#012c3a', borderLeft: '4px solid #e67e22', paddingLeft: '10px' }}>Priority Content Improvements</h2>
            <div style={{ display: 'grid', gap: '12px' }}>
              {contentImprovements.map((improvement, index) => (
                <article key={`content-improvement-${index}`} className="print-panel" style={{ border: '1px solid #dbe4ea', borderRadius: '12px', padding: '14px 16px', background: '#fff' }}>
                  <h3 style={{ margin: '0 0 8px', color: '#012c3a', fontSize: '0.98rem' }}>{index + 1}. {improvement.section}</h3>
                  <p style={{ margin: '0 0 6px', color: '#334155' }}><strong>Current issue:</strong> {improvement.current}</p>
                  <p style={{ margin: '0 0 6px', color: '#334155' }}><strong>Recommended action:</strong> {improvement.improved}</p>
                  <p style={{ margin: 0, color: '#334155' }}><strong>Why this helps:</strong> {improvement.reasoning}</p>
                </article>
              ))}
            </div>
          </section>
        )}

        <section style={{ marginTop: '24px' }}>
          <h2 style={{ margin: '0 0 12px', fontSize: '1.15rem', fontWeight: 800, color: '#012c3a', borderLeft: '4px solid #012c3a', paddingLeft: '10px' }}>Next Steps</h2>
          <div style={{ display: 'grid', gap: '12px', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
            <div className="print-panel" style={{ border: '1px solid #dbe4ea', borderRadius: '12px', padding: '14px 16px', background: '#fff' }}>
              <h3 style={{ margin: '0 0 8px', color: '#012c3a', fontSize: '0.96rem' }}>Immediate Actions</h3>
              <ol style={{ margin: 0, paddingLeft: '18px', color: '#334155' }}>
                {analysis.recommendations.slice(0, 3).map((recommendation, index) => (
                  <li key={`print-next-step-immediate-${index}`} style={{ marginBottom: '6px' }}>{recommendation.text}</li>
                ))}
              </ol>
            </div>
            <div className="print-panel" style={{ border: '1px solid #dbe4ea', borderRadius: '12px', padding: '14px 16px', background: '#fff' }}>
              <h3 style={{ margin: '0 0 8px', color: '#012c3a', fontSize: '0.96rem' }}>Long-term Strategy</h3>
              <ol style={{ margin: 0, paddingLeft: '18px', color: '#334155' }}>
                <li style={{ marginBottom: '6px' }}>Re-run this analysis after each implementation sprint.</li>
                <li style={{ marginBottom: '6px' }}>Roll winning changes into other high-value templates and landing pages.</li>
                <li>Use this report to prioritize technical, content, and schema work with your team.</li>
              </ol>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
