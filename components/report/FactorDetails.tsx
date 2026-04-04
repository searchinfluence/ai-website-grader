import { useState } from 'react';
import { ScoringFactorResult } from '@/types';
import { AlertCircle, AlertTriangle, ChevronDown, Info, type LucideIcon } from 'lucide-react';
import { formatRecommendationText } from '@/lib/utils/format';

interface FactorDetailsProps {
  factor: ScoringFactorResult;
  accent: string;
  borderColor: string;
  background: string;
  icon?: LucideIcon;
  defaultOpen?: boolean;
}

const priorityStyleMap = {
  high: { label: 'High', bg: 'rgba(1, 44, 58, 0.07)', border: 'rgba(1, 44, 58, 0.18)', text: 'var(--si-dark-navy)', icon: AlertTriangle },
  medium: { label: 'Medium', bg: 'rgba(223, 89, 38, 0.09)', border: 'rgba(223, 89, 38, 0.22)', text: 'var(--si-orange)', icon: AlertCircle },
  low: { label: 'Low', bg: 'rgba(145, 195, 100, 0.12)', border: 'rgba(145, 195, 100, 0.28)', text: 'var(--si-green)', icon: Info }
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
  hasResponsiveImages: 'Responsive Images',
  hasTouchableElements: 'Touch-Friendly Controls',
  mobileScore: 'Mobile Readiness',
  pageSpeedScore: 'PageSpeed Score',
  loadTimeMs: 'Load Time (ms)',
  htmlErrors: 'HTML Errors',
  htmlWarnings: 'HTML Warnings',
  htmlValidationScore: 'HTML Validation Score',
  accessibilityScore: 'Accessibility Score',
  normalizedAccessibilityScore: 'Accessibility Grade',
  titleLength: 'Title Length',
  descriptionLength: 'Meta Description Length',
  pathDepth: 'URL Path Depth',
  hasQuery: 'Has Query Parameters',
  pathIsClean: 'Clean URL Path',
  webpImages: 'WebP Images',
  altTextScore: 'Alt Text Grade',
  hasGraph: '@graph Detected',
  microdataTypes: 'Microdata Types',
  rdfaTypes: 'RDFa Types',
  schemaPresence: 'Schema Presence',
  schemaValidation: 'Schema Validation',
  richSnippetPotential: 'Rich Snippet Potential',
  structuredDataCompleteness: 'Schema Completeness',
  jsonLdImplementation: 'JSON-LD Implementation'
};

function formatStatValueWithKey(key: string, value: unknown): string {
  if (typeof value === 'number') {
    if (['altCoverage', 'readabilityScore', 'pageSpeedScore', 'mobileScore', 'htmlValidationScore', 'accessibilityScore', 'normalizedAccessibilityScore', 'altTextScore', 'schemaPresence', 'schemaValidation', 'richSnippetPotential', 'structuredDataCompleteness', 'jsonLdImplementation'].includes(key)) {
      return `${Math.round(value)}%`;
    }
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

function formatStatLabel(key: string): string {
  return STAT_LABELS[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase());
}

function getFindingPreview(finding?: string): string | null {
  if (!finding) return null;
  return finding.length > 110 ? `${finding.slice(0, 107).trimEnd()}...` : finding;
}

function getPreviewMetricValue(key: string, value: unknown): number | null {
  if (typeof value === 'boolean') return value ? 100 : 0;
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;

  if (['altCoverage', 'readabilityScore', 'pageSpeedScore', 'mobileScore', 'htmlValidationScore', 'accessibilityScore', 'normalizedAccessibilityScore', 'altTextScore', 'schemaPresence', 'schemaValidation', 'richSnippetPotential', 'structuredDataCompleteness', 'jsonLdImplementation'].includes(key)) {
    return Math.max(0, Math.min(100, value));
  }
  if (key === 'contentToCodeRatio') return Math.max(0, Math.min(100, value * 100));
  if (['titleLength', 'descriptionLength'].includes(key)) return Math.max(0, Math.min(100, (value / 160) * 100));
  if (key === 'loadTimeMs') return Math.max(0, Math.min(100, 100 - (value / 5000) * 100));
  if (value <= 1) return Math.max(0, Math.min(100, value * 100));
  if (value <= 100) return Math.max(0, Math.min(100, value));

  return null;
}

export default function FactorDetails({ factor, accent, borderColor, background, icon: Icon, defaultOpen }: FactorDetailsProps) {
  const [copiedRecIndex, setCopiedRecIndex] = useState<number | null>(null);
  const entries = Object.entries(factor.stats ?? {});
  const previewStats = entries.slice(0, 3);
  const topFindingPreview = getFindingPreview(factor.findings[0]);
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
      overflow: 'hidden'
    }}>
      <summary className="factor-details-summary" style={{
        cursor: 'pointer',
        listStyle: 'none',
        padding: '16px 18px',
        background: background,
        borderLeft: `5px solid ${accent}`
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--content-text)', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              {Icon && <Icon size={18} style={{ color: accent }} />}
              {factor.label}
            </h3>
            {topFindingPreview && (
              <p style={{ margin: '8px 0 0', color: 'var(--secondary-content)', fontSize: '0.86rem', lineHeight: 1.45 }}>
                {topFindingPreview}
              </p>
            )}
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
                {factor.findings.length} Key Findings
              </span>
              <span style={{ fontSize: '0.82rem', color: 'var(--secondary-content)' }}>
                {factor.recommendations.length} Recommendations
              </span>
              <span style={{ fontSize: '0.82rem', color: 'var(--secondary-content)' }}>
                Weight {Math.round(factor.weight * 100)}%
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
                className="factor-summary-stat-card"
                style={{
                  borderColor,
                  background: 'rgba(255,255,255,0.82)'
                }}
              >
                <span className="factor-summary-stat-label">
                  <span style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: previewMetricColors[index % previewMetricColors.length],
                    flexShrink: 0
                  }} />
                  {formatStatLabel(key)}
                </span>
                <strong style={{ color: 'var(--content-text)', fontSize: '0.74rem' }}>{formatStatValueWithKey(key, value)}</strong>
                {getPreviewMetricValue(key, value) !== null && (
                  <span className="factor-summary-stat-meter">
                    <span
                      style={{
                        width: `${getPreviewMetricValue(key, value)}%`,
                        background: previewMetricColors[index % previewMetricColors.length]
                      }}
                    />
                  </span>
                )}
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
                    {formatStatLabel(key)}
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
                  borderLeft: '4px solid rgba(78, 177, 205, 0.5)',
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', marginBottom: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
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
