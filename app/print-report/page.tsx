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

  return (
    <main style={{ padding: '20px', fontFamily: 'Arial, sans-serif', color: '#111' }}>
      <h1>AI Website Grader Report</h1>
      <p><strong>Website:</strong> {analysis.url}</p>
      <p><strong>Title:</strong> {analysis.title}</p>
      <p><strong>Date:</strong> {new Date(analysis.timestamp).toLocaleDateString()}</p>
      <p><strong>Overall Score:</strong> {analysis.overallScore}%</p>

      <h2>Score Breakdown</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc', padding: '6px' }}>Factor</th>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc', padding: '6px' }}>Score</th>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc', padding: '6px' }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {factorRows.map((row) => (
            <tr key={row.name}>
              <td style={{ borderBottom: '1px solid #eee', padding: '6px' }}>{row.name}</td>
              <td style={{ borderBottom: '1px solid #eee', padding: '6px' }}>{row.score}%</td>
              <td style={{ borderBottom: '1px solid #eee', padding: '6px', textTransform: 'capitalize' }}>{row.status}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Top Recommendations</h2>
      <ul>
        {analysis.recommendations.slice(0, 5).map((item, index) => (
          <li key={`${item.category}-${index}`}>
            <strong>{item.priority.toUpperCase()}:</strong> {item.text}
          </li>
        ))}
      </ul>

      <h2>Factor Recommendations</h2>
      <ul>
        {analysis.recommendations.slice(0, 12).map((rec, index) => (
          <li key={`rec-${index}`}>{getRecommendationText(rec)}</li>
        ))}
      </ul>
    </main>
  );
}
