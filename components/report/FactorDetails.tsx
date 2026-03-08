import { useState } from 'react';
import { ScoringFactorResult } from '@/types';
import { AlertCircle, AlertTriangle, ChevronDown, Info, type LucideIcon } from 'lucide-react';
import { formatRecommendationText } from '@/lib/utils/format';

interface FactorDetailsProps {
  factor: ScoringFactorResult;
  accent: string;
  borderColor: string;
  gradient: string;
  icon?: LucideIcon;
  defaultOpen?: boolean;
}

const priorityStyleMap = {
  high: { label: 'High', bg: 'rgba(231, 76, 60, 0.12)', border: 'rgba(231, 76, 60, 0.35)', text: 'var(--error-red)', icon: AlertTriangle },
  medium: { label: 'Medium', bg: 'rgba(230, 126, 34, 0.12)', border: 'rgba(230, 126, 34, 0.35)', text: 'var(--orange-accent)', icon: AlertCircle },
  low: { label: 'Low', bg: 'rgba(39, 174, 96, 0.12)', border: 'rgba(39, 174, 96, 0.35)', text: 'var(--success-green)', icon: Info }
} as const;

const statusCopy: Record<ScoringFactorResult['status'], string> = {
  excellent: 'Excellent',
  good: 'Good',
  'needs-improvement': 'Needs Improvement',
  poor: 'Poor',
  critical: 'Critical'
};

const STAT_LABELS: Record<string, string> = {
  wordCount: 'Word Count',
  h1Count: 'H1 Tags',
  headingJumps: 'Heading Level Skips',
  questionHeadings: 'Question Headings',
  faqIndicators: 'FAQ Sections',
  internalLinks: 'Internal Links',
  totalLinks: 'Total Links',
  imagesMissingAlt: 'Images Missing Alt',
  totalImages: 'Total Images',
  altCoverage: 'Alt Text Coverage',
  readabilityScore: 'Readability Score',
  contentToCodeRatio: 'Content-to-Code Ratio',
  jsonLdCount: 'JSON-LD Blocks',
  validSchemaBlocks: 'Valid Schema Blocks',
  schemaTypeCount: 'Schema Types Found',
  schemaTypes: 'Schema Types',
  hasOpenGraph: 'Open Graph Tags',
  hasTwitter: 'Twitter Card Tags',
  richSnippetEligible: 'Rich Snippet Eligible',
  https: 'HTTPS',
  robotsPresent: 'robots.txt Present',
  allowsBots: 'Allows Bot Crawling',
  hasSitemapHint: 'Sitemap Reference',
  hasCanonical: 'Canonical Tag',
  hasHreflang: 'Hreflang Tags',
  hasViewport: 'Viewport Meta',
  hasResponsiveCss: 'Responsive CSS',
  pageSpeedScore: 'PageSpeed Score',
  loadTimeMs: 'Load Time (ms)',
  titleLength: 'Title Length',
  descriptionLength: 'Meta Description Length',
  pathDepth: 'URL Path Depth',
  hasQuery: 'Has Query Parameters',
  pathIsClean: 'Clean URL Path',
  webpImages: 'WebP Images'
};

function formatStatValueWithKey(key: string, value: unknown): string {
  if (typeof value === 'number') {
    if (['altCoverage', 'readabilityScore', 'pageSpeedScore'].includes(key)) return `${Math.round(value)}%`;
    if (key === 'loadTimeMs') return `${Math.round(value)}ms`;
    if (key === 'contentToCodeRatio') return `${(value * 100).toFixed(1)}%`;
    if (['titleLength', 'descriptionLength'].includes(key)) return `${value} chars`;
    return Number.isFinite(value) ? `${Math.round(value * 100) / 100}` : 'N/A';
  }

  if (typeof value === 'boolean') {
    return value ? '✓ Yes' : '✗ No';
  }

  if (Array.isArray(value)) {
    return value.length ? (typeof value[0] === 'string' ? value.join(', ') : `${value.length} items`) : 'None';
  }

  if (value === null || value === undefined || value === '') {
    return 'N/A';
  }

  return String(value);
}

export default function FactorDetails({ factor, accent, borderColor, gradient, icon: Icon, defaultOpen }: FactorDetailsProps) {
  const [copiedRecIndex, setCopiedRecIndex] = useState<number | null>(null);
  const entries = Object.entries(factor.stats ?? {});
  const previewStats = entries.slice(0, 3);
  const previewMetricColors = [
    'var(--si-dark-navy)',
    'var(--si-navy)',
    'var(--si-medium-blue)',
    'var(--si-light-blue)',
    'var(--si-green)',
    'var(--si-orange)'
  ];
  const handleCopyCode = async (code: string, index: number) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedRecIndex(index);
      setTimeout(() => setCopiedRecIndex((current) => (current === index ? null : current)), 1800);
    } catch {
      setCopiedRecIndex(null);
    }
  };

  return (
    <details open={defaultOpen} className="factor-details-accordion" style={{
      border: `1px solid ${borderColor}`,
      borderRadius: '12px',
      background: 'var(--content-bg)',
      overflow: 'hidden',
      boxShadow: '0 10px 26px rgba(0,0,0,0.08)'
    }}>
      <summary className="factor-details-summary" style={{
        cursor: 'pointer',
        listStyle: 'none',
        padding: '16px 18px',
        background: gradient,
        borderLeft: `5px solid ${accent}`
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--content-text)', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              {Icon && <Icon size={18} style={{ color: accent }} />}
              {factor.label}
            </h3>
            <div className="factor-summary-meta">
              <span style={{
                display: 'inline-flex',
                borderRadius: '999px',
                padding: '3px 9px',
                fontSize: '0.68rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                color: accent,
                border: `1px solid ${borderColor}`,
                background: 'rgba(255,255,255,0.72)'
              }}>
                {statusCopy[factor.status]}
              </span>
              <span style={{ fontSize: '0.82rem', color: 'var(--secondary-content)' }}>
                {factor.findings.length} key findings
              </span>
              <span style={{ fontSize: '0.82rem', color: 'var(--secondary-content)' }}>
                {factor.recommendations.length} recommendations
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <strong style={{ color: accent, fontSize: '1.5rem', lineHeight: 1 }}>{factor.score}%</strong>
            <ChevronDown className="factor-details-chevron" size={18} style={{ color: accent }} />
          </div>
        </div>
        {previewStats.length > 0 && (
          <div className="factor-summary-stats">
            {previewStats.map(([key, value], index) => (
              <span
                key={`${factor.key}-preview-stat-${key}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  borderRadius: '999px',
                  padding: '4px 8px',
                  fontSize: '0.72rem',
                  border: `1px solid ${borderColor}`,
                  background: 'rgba(255,255,255,0.82)',
                  color: 'var(--content-text)'
                }}
              >
                <span style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: previewMetricColors[index % previewMetricColors.length],
                  flexShrink: 0
                }} />
                <span style={{ color: 'var(--muted-text)' }}>
                  {STAT_LABELS[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase())}:
                </span>
                <strong>{formatStatValueWithKey(key, value)}</strong>
              </span>
            ))}
          </div>
        )}
      </summary>

      <section style={{ padding: '18px' }}>
        {entries.length > 0 && (
          <div style={{ marginBottom: '18px' }}>
            <h4 style={{ margin: '0 0 12px', color: 'var(--content-text)' }}>Metrics</h4>
            <div className="factor-details-metrics-grid">
              {entries.map(([key, value]) => (
                <div key={`${factor.key}-stat-${key}`} style={{
                  border: '1px solid var(--border-gray)',
                  borderRadius: '10px',
                  padding: '10px 12px',
                  background: 'var(--background-gray)'
                }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--muted-text)', marginBottom: '4px' }}>
                    {STAT_LABELS[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase())}
                  </div>
                  <div style={{ color: 'var(--content-text)', fontWeight: 700 }}>{formatStatValueWithKey(key, value)}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {factor.findings.length > 0 && (
          <div style={{ marginBottom: '18px' }}>
            <h4 style={{ margin: '0 0 12px', color: 'var(--content-text)' }}>Key Findings</h4>
            <div style={{ display: 'grid', gap: '8px' }}>
              {factor.findings.map((finding, index) => (
                <div key={`${factor.key}-finding-${index}`} style={{
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-gray)',
                  background: 'rgba(52, 152, 219, 0.06)',
                  color: 'var(--secondary-content)',
                  fontSize: '0.9rem'
                }}>
                  {finding}
                </div>
              ))}
            </div>
          </div>
        )}

        {factor.recommendations.length > 0 && (
          <div>
            <h4 style={{ margin: '0 0 12px', color: 'var(--content-text)' }}>Recommendations</h4>
            <div style={{ display: 'grid', gap: '10px' }}>
              {factor.recommendations.map((recommendation, index) => {
                const priorityStyle = priorityStyleMap[recommendation.priority];
                const PriorityIcon = priorityStyle.icon;
                return (
                  <article
                    key={`${factor.key}-rec-${index}`}
                    className="recommendation-card"
                    style={{
                      border: `1px solid ${priorityStyle.border}`,
                      borderLeft: `4px solid ${priorityStyle.text}`,
                      borderRadius: '10px',
                      background: priorityStyle.bg
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', marginBottom: '6px', alignItems: 'center' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        borderRadius: '999px',
                        padding: '3px 9px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        color: priorityStyle.text,
                        border: `1px solid ${priorityStyle.border}`,
                        background: 'rgba(255,255,255,0.7)'
                      }}>
                        <PriorityIcon size={13} />
                        {priorityStyle.label} Priority
                      </span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--muted-text)' }}>{recommendation.category}</span>
                    </div>
                    <p style={{ margin: 0, color: 'var(--content-text)', fontSize: '0.91rem', lineHeight: 1.5 }}>
                      {formatRecommendationText(recommendation.text)}
                    </p>
                    {recommendation.codeExample && (
                      <div style={{
                        marginTop: '10px',
                        background: '#1e293b',
                        borderRadius: '8px',
                        padding: '10px',
                        border: '1px solid rgba(255,255,255,0.08)'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
                          <button
                            type="button"
                            onClick={() => handleCopyCode(recommendation.codeExample as string, index)}
                            style={{
                              border: '1px solid rgba(255,255,255,0.2)',
                              background: 'rgba(255,255,255,0.08)',
                              color: '#e2e8f0',
                              borderRadius: '6px',
                              padding: '4px 8px',
                              fontSize: '0.75rem',
                              cursor: 'pointer'
                            }}
                          >
                            {copiedRecIndex === index ? 'Copied' : 'Copy'}
                          </button>
                        </div>
                        <pre style={{
                          margin: 0,
                          whiteSpace: 'pre-wrap',
                          overflowX: 'auto',
                          fontSize: '0.8rem',
                          lineHeight: 1.45,
                          color: '#e2e8f0',
                          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
                        }}>
                          <code>{recommendation.codeExample}</code>
                        </pre>
                      </div>
                    )}
                    {recommendation.timeToImplement && (
                      <p style={{ margin: '8px 0 0', fontSize: '0.8rem', color: 'var(--secondary-content)' }}>
                        Time to implement: {recommendation.timeToImplement}
                      </p>
                    )}
                  </article>
                );
              })}
            </div>
          </div>
        )}
      </section>
    </details>
  );
}
