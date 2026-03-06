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
    return <main style={{ padding: '24px', fontFamily: 'Arial, sans-serif' }}>Print data not found.</main>;
  }

  const factorRows = SCORING_FACTORS.map((factor) => ({
    name: factor.label,
    score: analysis.factors[factor.key].score,
    status: analysis.factors[factor.key].status
  }));
  const scoreColor = getScoreColor(analysis.overallScore);

  return (
    <main style={{ padding: '24px', fontFamily: 'Arial, sans-serif', color: '#111' }}>
      <header style={{ borderBottom: '2px solid #dbe3ec', paddingBottom: '14px', marginBottom: '18px' }}>
        <p style={{ margin: '0 0 6px', fontSize: '0.86rem', color: '#5b6775', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Search Influence
        </p>
        <h1 style={{ margin: '0 0 6px', fontSize: '1.8rem' }}>AI Website Grader Report</h1>
        <p style={{ margin: 0, color: '#4d5966', fontSize: '0.92rem' }}>
          AI SEO Performance Summary
        </p>
      </header>

      <section style={{
        display: 'flex',
        gap: '20px',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        border: '1px solid #e2e8ef',
        borderRadius: '10px',
        padding: '14px 16px'
      }}>
        <div style={{ flex: 1 }}>
          <p style={{ margin: '0 0 8px' }}><strong>Website:</strong> {analysis.url}</p>
          <p style={{ margin: '0 0 8px' }}><strong>Title:</strong> {analysis.title || 'Untitled page'}</p>
          <p style={{ margin: 0 }}><strong>Date:</strong> {new Date(analysis.timestamp).toLocaleDateString()}</p>
        </div>
        <div style={{
          width: '94px',
          height: '94px',
          borderRadius: '999px',
          border: `7px solid ${scoreColor}`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: scoreColor,
          flexShrink: 0
        }}>
          <strong style={{ fontSize: '1.6rem', lineHeight: 1 }}>{analysis.overallScore}</strong>
          <span style={{ fontSize: '0.78rem', letterSpacing: '0.05em' }}>SCORE</span>
        </div>
      </section>

      <h2 style={{ margin: '0 0 10px', fontSize: '1.25rem' }}>Score Breakdown</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '18px', border: '1px solid #d9e1ea' }}>
        <thead>
          <tr style={{ background: '#f4f7fb' }}>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #d9e1ea', padding: '8px 10px' }}>Factor</th>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #d9e1ea', padding: '8px 10px' }}>Score</th>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #d9e1ea', padding: '8px 10px' }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {factorRows.map((row) => (
            <tr key={row.name}>
              <td style={{ borderBottom: '1px solid #ebf0f5', padding: '8px 10px' }}>{row.name}</td>
              <td style={{ borderBottom: '1px solid #ebf0f5', padding: '8px 10px', fontWeight: 700 }}>{row.score}%</td>
              <td style={{ borderBottom: '1px solid #ebf0f5', padding: '8px 10px', textTransform: 'capitalize' }}>{row.status}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 style={{ margin: '0 0 10px', fontSize: '1.25rem' }}>Top Recommendations</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '18px', border: '1px solid #d9e1ea' }}>
        <thead>
          <tr style={{ background: '#f4f7fb' }}>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #d9e1ea', padding: '8px 10px', width: '15%' }}>Priority</th>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #d9e1ea', padding: '8px 10px', width: '20%' }}>Category</th>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #d9e1ea', padding: '8px 10px' }}>Recommendation</th>
          </tr>
        </thead>
        <tbody>
          {analysis.recommendations.slice(0, 8).map((item, index) => (
            <tr key={`${item.category}-${index}`}>
              <td style={{ borderBottom: '1px solid #ebf0f5', padding: '8px 10px', textTransform: 'uppercase', fontWeight: 700 }}>{item.priority}</td>
              <td style={{ borderBottom: '1px solid #ebf0f5', padding: '8px 10px' }}>{item.category}</td>
              <td style={{ borderBottom: '1px solid #ebf0f5', padding: '8px 10px' }}>{item.text}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 style={{ margin: '0 0 10px', fontSize: '1.25rem' }}>Additional Recommendations</h2>
      <ul style={{ marginTop: 0, paddingLeft: '20px' }}>
        {analysis.recommendations.slice(0, 12).map((rec, index) => (
          <li key={`rec-${index}`} style={{ marginBottom: '6px' }}>{getRecommendationText(rec)}</li>
        ))}
      </ul>

      <footer style={{
        marginTop: '24px',
        borderTop: '1px solid #dbe3ec',
        paddingTop: '10px',
        fontSize: '0.82rem',
        color: '#5b6775',
        textAlign: 'center'
      }}>
        Generated by AI Website Grader - searchinfluence.com
      </footer>
    </main>
  );
}
