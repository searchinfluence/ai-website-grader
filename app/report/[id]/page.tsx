'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import ScoreReport from '@/components/ScoreReport';
import { WebsiteAnalysis } from '@/types';

export default function SharedReportPage() {
  const params = useParams<{ id: string }>();
  const [analysis, setAnalysis] = useState<WebsiteAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reportId = useMemo(() => params?.id || '', [params]);

  useEffect(() => {
    if (!reportId) {
      setError('Report ID is missing.');
      setLoading(false);
      return;
    }

    let cancelled = false;
    const loadReport = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/share?id=${encodeURIComponent(reportId)}`, {
          cache: 'no-store'
        });
        if (!response.ok) {
          const data = await response.json().catch(() => null);
          throw new Error(data?.error || 'Unable to load shared report.');
        }

        const data = await response.json();
        if (!cancelled) {
          setAnalysis((data?.report || null) as WebsiteAnalysis | null);
          setError(null);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : 'Unable to load shared report.');
          setAnalysis(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadReport();
    return () => {
      cancelled = true;
    };
  }, [reportId]);

  if (loading) {
    return <main style={{ padding: '36px 20px', maxWidth: '1100px', margin: '0 auto' }}>Loading shared report...</main>;
  }

  if (error || !analysis) {
    return <main style={{ padding: '36px 20px', maxWidth: '1100px', margin: '0 auto' }}>{error || 'Report not found.'}</main>;
  }

  return (
    <main style={{ padding: '24px 0 40px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 20px' }}>
        <div style={{
          background: 'var(--content-bg)',
          border: '1px solid var(--border-gray)',
          borderRadius: '10px',
          padding: '14px 16px',
          marginBottom: '16px'
        }}>
          <strong>Report generated on {new Date(analysis.timestamp).toLocaleString()} for {analysis.url}</strong>
        </div>
        <ScoreReport analysis={analysis} />
      </div>
    </main>
  );
}

