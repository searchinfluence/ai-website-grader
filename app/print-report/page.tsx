'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { WebsiteAnalysis } from '@/types';
import { SCORING_FACTORS } from '@/lib/scoring/config';

function getRecommendationText(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }

  if (value && typeof value === 'object' && 'text' in value && typeof value.text === 'string') {
    return value.text;
  }

  return 'Recommendation unavailable';
}

function getScoreColor(score: number): string {
  if (score >= 80) return '#1f8f4f';
  if (score >= 60) return '#1f6fb2';
  if (score >= 40) return '#e67e22';
  return '#c0392b';
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

  useEffect(() => {
    const key = searchParams.get('key');
    if (!key) return;

    try {
      const raw = localStorage.getItem(key);
      if (!raw) return;

      const parsed = JSON.parse(raw) as WebsiteAnalysis;
      setAnalysis(parsed);
      localStorage.removeItem(key);
    } catch {
      setAnalysis(null);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!analysis) return;

    const timer = setTimeout(() => {
      window.print();
    }, 300);

    return () => clearTimeout(timer);
  }, [analysis]);

  if (!analysis) {
    return (
      <main style={{ padding: '24px', fontFamily: 'Arial, sans-serif', textAlign: 'center', marginTop: '40px' }}>
        <p>Print data not found.</p>
        <button
          onClick={() => window.history.back()}
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
          ← Back to Report
        </button>
      </main>
    );
  }

  const factorRows = SCORING_FACTORS.map((factor) => ({
    name: factor.label,
    score: analysis.factors[factor.key].score,
    status: analysis.factors[factor.key].status,
    weight: Math.round(factor.weight * 100)
  }));
  const scoreColor = getScoreColor(analysis.overallScore);
  const scoreInterpretation = analysis.overallScore >= 80
    ? 'Excellent — This site is well-optimized for AI search engines.'
    : analysis.overallScore >= 60
      ? 'Good — Solid foundation with room for improvement.'
      : analysis.overallScore >= 40
        ? 'Needs Work — Several areas require attention for AI visibility.'
        : 'Critical — Major gaps in AI search readiness.';

  return (
    <main className="print-root" style={{ padding: '0', fontFamily: "'Open Sans', Arial, sans-serif", color: '#012c3a' }}>
      {/* Screen-only toolbar */}
      <div className="print-toolbar" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 28px',
        background: '#f0f4f7',
        borderBottom: '1px solid #dde3e8'
      }}>
        <button
          onClick={() => window.history.back()}
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
          ← Back to Report
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
          🖨️ Print Again
        </button>
      </div>
      {/* Branded header */}
      <header style={{
        background: '#012c3a',
        color: '#fff',
        padding: '20px 28px 16px',
        marginBottom: '0',
        position: 'relative'
      }}>
        <div style={{ borderBottom: '3px solid #91c364', paddingBottom: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/search-influence-logo.png" alt="Search Influence" style={{ height: '32px', width: 'auto', marginBottom: '10px' }} />
              <h1 style={{ margin: '0 0 4px', fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.01em' }}>AI Website Grader Report</h1>
              <p style={{ margin: 0, color: '#4eb1cd', fontSize: '0.88rem', fontWeight: 300 }}>
                AI SEO Performance Summary
              </p>
            </div>
            <div style={{ textAlign: 'right', fontSize: '0.82rem', color: '#9ab8c8', paddingTop: '4px' }}>
              <p style={{ margin: 0 }}>{new Date(analysis.timestamp).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Score hero section */}
      <section style={{
        display: 'flex',
        gap: '24px',
        alignItems: 'center',
        padding: '20px 28px',
        background: '#f8fafb',
        borderBottom: '1px solid #e2e8ef'
      }}>
        <div style={{
          width: '110px',
          height: '110px',
          borderRadius: '999px',
          border: `8px solid ${scoreColor}`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: scoreColor,
          flexShrink: 0,
          background: '#fff'
        }}>
          <strong style={{ fontSize: '2rem', lineHeight: 1 }}>{analysis.overallScore}</strong>
          <span style={{ fontSize: '0.72rem', letterSpacing: '0.08em', fontWeight: 600 }}>/ 100</span>
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ margin: '0 0 6px', fontSize: '0.92rem', color: '#4d5966' }}>
            <strong style={{ color: '#012c3a' }}>Website:</strong> {analysis.url}
          </p>
          <p style={{ margin: '0 0 6px', fontSize: '0.92rem', color: '#4d5966' }}>
            <strong style={{ color: '#012c3a' }}>Title:</strong> {analysis.title || 'Untitled page'}
          </p>
          <p style={{ margin: '8px 0 0', fontSize: '0.88rem', color: scoreColor, fontWeight: 600 }}>
            {scoreInterpretation}
          </p>
        </div>
        {/* Mini factor bars */}
        <div style={{ width: '200px', flexShrink: 0 }}>
          {factorRows.map((row) => {
            const barColor = getScoreColor(row.score);
            return (
              <div key={row.name} style={{ marginBottom: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#4d5966', marginBottom: '2px' }}>
                  <span>{row.name}</span>
                  <span style={{ fontWeight: 700, color: barColor }}>{row.score}%</span>
                </div>
                <div style={{ background: '#e8ecf0', borderRadius: '3px', height: '6px', overflow: 'hidden' }}>
                  <div style={{ width: `${row.score}%`, height: '100%', background: barColor, borderRadius: '3px', transition: 'width 0.3s' }} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <div style={{ padding: '0 28px' }}>
      <h2 style={{ margin: '20px 0 10px', fontSize: '1.15rem', fontWeight: 800, color: '#012c3a', borderLeft: '4px solid #3490b5', paddingLeft: '10px' }}>Score Breakdown</h2>
      <table className="print-section" style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '18px' }}>
        <thead>
          <tr style={{ background: '#012c3a' }}>
            <th style={{ textAlign: 'left', padding: '9px 12px', color: '#fff', fontSize: '0.85rem', fontWeight: 700 }}>Factor</th>
            <th style={{ textAlign: 'left', padding: '9px 12px', color: '#fff', fontSize: '0.85rem', fontWeight: 700 }}>Score</th>
            <th style={{ textAlign: 'left', padding: '9px 12px', color: '#fff', fontSize: '0.85rem', fontWeight: 700 }}>Status</th>
            <th style={{ textAlign: 'left', padding: '9px 12px', color: '#fff', fontSize: '0.85rem', fontWeight: 700 }}>Weight</th>
          </tr>
        </thead>
        <tbody>
          {factorRows.map((row, idx) => (
            <tr key={row.name} style={{ background: idx % 2 === 0 ? '#f5f8fc' : '#fff' }}>
              <td style={{ borderBottom: '1px solid #e8ecf0', padding: '9px 12px', fontWeight: 600 }}>{row.name}</td>
              <td style={{ borderBottom: '1px solid #e8ecf0', padding: '9px 12px', fontWeight: 700, color: getScoreColor(row.score) }}>{row.score}%</td>
              <td style={{ borderBottom: '1px solid #e8ecf0', padding: '9px 12px', textTransform: 'capitalize' }}>{row.status}</td>
              <td style={{ borderBottom: '1px solid #e8ecf0', padding: '9px 12px' }}>{row.weight}%</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 className="print-page-break" style={{ margin: '20px 0 10px', fontSize: '1.15rem', fontWeight: 800, color: '#012c3a', borderLeft: '4px solid #df5926', paddingLeft: '10px' }}>Top Recommendations</h2>
      <div className="print-section" style={{ marginBottom: '18px' }}>
        {analysis.recommendations.map((item, index) => {
          const priorityColor = item.priority === 'high' ? '#df5926' : item.priority === 'medium' ? '#3490b5' : '#91c364';
          return (
            <div key={`${item.category}-${index}`} style={{
              display: 'flex',
              gap: '10px',
              alignItems: 'flex-start',
              padding: '10px 0',
              borderBottom: '1px solid #eef1f4'
            }}>
              <span style={{
                background: priorityColor,
                color: '#fff',
                fontSize: '0.68rem',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '10px',
                textTransform: 'uppercase',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                marginTop: '2px'
              }}>{item.priority}</span>
              <div>
                <p style={{ margin: '0 0 2px', fontSize: '0.88rem', fontWeight: 600, color: '#012c3a' }}>{item.text}</p>
                <p style={{ margin: 0, fontSize: '0.78rem', color: '#7f8c8d' }}>{item.category}{item.timeToImplement ? ` • Est. ${item.timeToImplement}` : ''}</p>
              </div>
            </div>
          );
        })}
      </div>

      <section className="print-section print-page-break">
        <h2 style={{ margin: '20px 0 12px', fontSize: '1.15rem', fontWeight: 800, color: '#012c3a', borderLeft: '4px solid #91c364', paddingLeft: '10px' }}>Detailed Factor Analysis</h2>
        <div style={{ display: 'grid', gap: '14px' }}>
          {SCORING_FACTORS.map((factor) => {
            const result = analysis.factors[factor.key];
            const factorScoreColor = getScoreColor(result.score);
            return (
              <article key={`print-factor-${factor.key}`} style={{
                border: '1px solid #e2e8ef',
                borderRadius: '10px',
                padding: '14px 16px',
                breakInside: 'avoid',
                borderLeft: `4px solid ${factorScoreColor}`
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#012c3a' }}>{result.label}</h3>
                  <span style={{
                    background: factorScoreColor,
                    color: '#fff',
                    padding: '3px 10px',
                    borderRadius: '12px',
                    fontSize: '0.82rem',
                    fontWeight: 700
                  }}>{result.score}%</span>
                </div>
                <div style={{ fontSize: '0.86rem' }}>
                  <p style={{ margin: '0 0 4px', fontWeight: 700, color: '#014a61', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Findings</p>
                  <ul style={{ margin: '0 0 10px', paddingLeft: '18px', color: '#3a4a59' }}>
                    {(result.findings.length ? result.findings : ['No major issues detected.']).map((finding, index) => (
                      <li key={`print-finding-${factor.key}-${index}`} style={{ marginBottom: '3px' }}>{finding}</li>
                    ))}
                  </ul>
                  <p style={{ margin: '0 0 4px', fontWeight: 700, color: '#014a61', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Recommendations</p>
                  <ul style={{ margin: 0, paddingLeft: '18px', color: '#3a4a59' }}>
                    {(result.recommendations.length ? result.recommendations.map((rec) => rec.text) : ['No additional recommendations for this factor.'])
                      .map((recommendation, index) => (
                        <li key={`print-factor-rec-${factor.key}-${index}`} style={{ marginBottom: '3px' }}>{recommendation}</li>
                      ))}
                  </ul>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section style={{
        margin: '24px 0',
        padding: '16px 20px',
        background: '#3490b5',
        borderRadius: '10px',
        color: '#fff',
        textAlign: 'center'
      }}>
        <p style={{ margin: '0 0 4px', fontSize: '1.05rem', fontWeight: 700 }}>Ready to improve your AI search visibility?</p>
        <p style={{ margin: 0, fontSize: '0.88rem', fontWeight: 300 }}>Contact Search Influence for a comprehensive AI SEO strategy  →  searchinfluence.com</p>
      </section>
      </div>

      <footer style={{
        background: '#014a61',
        padding: '10px 28px',
        fontSize: '0.78rem',
        color: '#fff',
        display: 'flex',
        justifyContent: 'space-between'
      }}>
        <span>Generated by AI Website Grader  •  searchinfluence.com</span>
        <span>Confidential</span>
      </footer>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;600;700;800&display=swap');

        @page {
          size: A4;
          margin: 0;
        }

        html, body {
          font-family: 'Open Sans', Arial, sans-serif !important;
        }

        @media print {
          .print-toolbar {
            display: none !important;
          }

          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: #fff !important;
            color: #012c3a !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .print-root {
            padding: 0 !important;
            max-width: 100% !important;
          }

          .print-section {
            break-inside: avoid;
            page-break-inside: avoid;
          }

          .print-page-break {
            break-before: page;
            page-break-before: always;
          }

          .print-page-break:first-child {
            break-before: auto;
            page-break-before: auto;
          }
        }

        @media screen {
          .print-root {
            max-width: 800px;
            margin: 0 auto;
            box-shadow: 0 2px 20px rgba(0,0,0,0.1);
          }
        }
      `}</style>
    </main>
  );
}
