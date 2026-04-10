'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import ScoreReport from '@/components/ScoreReport';
import { WebsiteAnalysis } from '@/types';
import { normalizeWebsiteAnalysis } from '@/lib/normalize-analysis';

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
          const normalized = normalizeWebsiteAnalysis(data?.report);
          setAnalysis(normalized);
          setError(normalized ? null : 'Unable to load shared report.');
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
    return (
      <div>
        <SharedReportHeader />
        <main style={{ padding: '60px 20px', maxWidth: '1100px', margin: '0 auto', textAlign: 'center', color: 'var(--white)' }}>
          <p style={{ fontSize: '1.2rem' }}>Loading shared report...</p>
        </main>
        <SharedReportFooter />
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div>
        <SharedReportHeader />
        <main style={{ padding: '60px 20px', maxWidth: '1100px', margin: '0 auto', textAlign: 'center', color: 'var(--white)' }}>
          <p style={{ fontSize: '1.2rem' }}>{error || 'Report not found.'}</p>
        </main>
        <SharedReportFooter />
      </div>
    );
  }

  return (
    <div>
      <SharedReportHeader url={analysis.url} timestamp={analysis.timestamp} />

      <main style={{ padding: '24px 0 40px', background: 'var(--dark-blue)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 20px' }}>
          <ScoreReport analysis={analysis} />
        </div>
      </main>

      {/* CTA Section */}
      <div style={{
        background: 'var(--lighter-blue)',
        padding: '50px 0',
        textAlign: 'center',
        borderTop: '2px solid var(--orange-accent)',
      }}>
        <div className="container">
          <h2 style={{
            fontSize: '1.8rem',
            fontWeight: '800',
            color: 'var(--white)',
            margin: '0 0 12px 0',
          }}>
            Want to grade your own website?
          </h2>
          <p style={{
            fontSize: '1.1rem',
            color: 'var(--light-gray)',
            margin: '0 0 24px 0',
            maxWidth: '500px',
            marginLeft: 'auto',
            marginRight: 'auto',
          }}>
            Get a free, instant analysis with specific recommendations you can act on today.
          </p>
          <Link
            href="/"
            style={{
              display: 'inline-block',
              padding: '14px 36px',
              background: 'var(--orange-accent)',
              color: 'var(--white)',
              borderRadius: '8px',
              fontSize: '1.1rem',
              fontWeight: '600',
              textDecoration: 'none',
              transition: 'background 0.2s ease, transform 0.2s ease',
            }}
          >
            Grade Your Website Free
          </Link>
        </div>
      </div>

      <SharedReportFooter />
    </div>
  );
}

function SharedReportHeader({ url, timestamp }: { url?: string; timestamp?: string }) {
  return (
    <header className="header" style={{ padding: '24px 0' }}>
      <div className="container">
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          position: 'relative',
          zIndex: 1,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div className="logo-container" style={{ marginBottom: 0 }}>
              <a href="https://www.searchinfluence.com" target="_blank" rel="noopener noreferrer">
                <Image src="/search-influence-logo.png" alt="Search Influence" className="si-logo" width={200} height={60} />
              </a>
            </div>
            <div>
              <h1 style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--white)', margin: 0, lineHeight: 1.2 }}>
                AI Website Grader
              </h1>
              <div style={{ fontSize: '0.9rem', color: 'var(--orange-accent)', fontWeight: '600' }}>
                Optimize for AI-Powered Search
              </div>
            </div>
          </div>
          {url && (
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--light-gray)', marginBottom: '2px' }}>
                Report for
              </div>
              <div style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--white)' }}>
                {url}
              </div>
              {timestamp && (
                <div style={{ fontSize: '0.8rem', color: 'var(--medium-gray)', marginTop: '2px' }}>
                  {new Date(timestamp).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function SharedReportFooter() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="text-center">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
            <div className="logo-container" style={{ margin: '0 15px 0 0' }}>
              <a href="https://www.searchinfluence.com" target="_blank" rel="noopener noreferrer">
                <Image src="/search-influence-logo.png" alt="Search Influence" className="si-logo" width={200} height={60} />
              </a>
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: 'var(--white)', margin: '0 0 5px 0' }}>Search Influence</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--medium-gray)', margin: 0 }}>AI SEO Experts</p>
            </div>
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--dark-gray)', margin: '0 0 20px 0', maxWidth: '600px', marginLeft: 'auto', marginRight: 'auto' }}>
            20+ years of SEO expertise. Now helping organizations
            optimize for AI-powered search and traditional search alike.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', fontSize: '0.8rem', color: 'var(--dark-gray)' }}>
            <span>•</span>
            <a href="https://www.searchinfluence.com" target="_blank" rel="noopener noreferrer">
              Visit Search Influence
            </a>
            <span>•</span>
            <Link href="/" style={{ color: 'var(--orange-accent)', textDecoration: 'none' }}>
              AI Website Grader
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
