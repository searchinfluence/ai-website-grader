'use client';

import { CSSProperties, useState } from 'react';
import { ScoringFactorKey, WebsiteAnalysis } from '@/types';
import { AlertCircle, AlertTriangle, ArrowRight, Database, FileText, Info, Lightbulb, Search, Settings, type LucideIcon } from 'lucide-react';
import ExportButtons from './ExportButtons';
import LeadCaptureModal from './LeadCaptureModal';
import { generateMarkdownReport, downloadMarkdown } from '@/lib/exporters';
import { useGoogleTagManager } from '@/hooks/useGoogleTagManager';
import { SCORING_FACTORS } from '@/lib/scoring/config';
import FactorCard from './report/FactorCard';
import FactorDetails from './report/FactorDetails';
import { formatRecommendationText } from '@/lib/utils/format';

interface ScoreReportProps {
  analysis: WebsiteAnalysis;
}

const FACTOR_THEME: Record<ScoringFactorKey, { accent: string; borderColor: string; gradient: string; icon?: LucideIcon }> = {
  contentStructure: {
    accent: 'var(--si-medium-blue)',
    borderColor: 'rgba(52, 144, 181, 0.32)',
    gradient: 'linear-gradient(135deg, rgba(52, 144, 181, 0.14) 0%, rgba(52, 144, 181, 0.05) 100%)',
    icon: FileText
  },
  structuredData: {
    accent: 'var(--si-green)',
    borderColor: 'rgba(145, 195, 100, 0.36)',
    gradient: 'linear-gradient(135deg, rgba(145, 195, 100, 0.16) 0%, rgba(145, 195, 100, 0.06) 100%)',
    icon: Database
  },
  technicalHealth: {
    accent: 'var(--si-orange)',
    borderColor: 'rgba(223, 89, 38, 0.34)',
    gradient: 'linear-gradient(135deg, rgba(223, 89, 38, 0.15) 0%, rgba(223, 89, 38, 0.05) 100%)',
    icon: Settings
  },
  pageSEO: {
    accent: 'var(--si-light-blue)',
    borderColor: 'rgba(78, 177, 205, 0.34)',
    gradient: 'linear-gradient(135deg, rgba(78, 177, 205, 0.15) 0%, rgba(78, 177, 205, 0.05) 100%)',
    icon: Search
  }
};

const priorityStyleMap = {
  high: { bg: 'rgba(231, 76, 60, 0.12)', border: 'rgba(231, 76, 60, 0.35)', text: 'var(--error-red)', label: 'High', icon: AlertTriangle },
  medium: { bg: 'rgba(230, 126, 34, 0.12)', border: 'rgba(230, 126, 34, 0.35)', text: 'var(--orange-accent)', label: 'Medium', icon: AlertCircle },
  low: { bg: 'rgba(39, 174, 96, 0.12)', border: 'rgba(39, 174, 96, 0.35)', text: 'var(--success-green)', label: 'Low', icon: Info }
} as const;

const brandPalette = [
  'var(--si-dark-navy)',
  'var(--si-navy)',
  'var(--si-medium-blue)',
  'var(--si-light-blue)',
  'var(--si-green)',
  'var(--si-orange)'
];

function getOverallScoreColor(score: number) {
  if (score >= 80) return 'var(--success-green)';
  if (score >= 60) return 'var(--info-blue)';
  if (score >= 40) return 'var(--orange-accent)';
  return 'var(--error-red)';
}

function getOverallScoreStatus(score: number) {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Needs Improvement';
  return 'Poor';
}

function getScoreInterpretation(score: number, lowestFactor: { label: string; score: number }) {
  if (score >= 80) return `Your website is well-optimized for AI search visibility. Focus on maintaining your strong foundation while improving ${lowestFactor.label} (${lowestFactor.score}%) to push your score even higher.`;
  if (score >= 60) return `Your website has a solid foundation but has clear optimization opportunities. Your biggest area for improvement is ${lowestFactor.label} (${lowestFactor.score}%). Addressing the high-priority recommendations below could raise your score significantly.`;
  if (score >= 40) return `Your website has multiple gaps affecting AI search visibility. ${lowestFactor.label} scored just ${lowestFactor.score}% and should be your first priority. Work through the high-priority recommendations to build a stronger foundation.`;
  return `Your website needs significant work to be competitive in AI search results. Start with ${lowestFactor.label} (${lowestFactor.score}%) and work through each high-priority recommendation systematically.`;
}

export default function ScoreReport({ analysis }: ScoreReportProps) {
  const { trackExport, trackCTA } = useGoogleTagManager();
  const [copiedRecIndex, setCopiedRecIndex] = useState<number | null>(null);
  const [markdownCopied, setMarkdownCopied] = useState(false);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [leadSubmitted, setLeadSubmitted] = useState(() => {
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem('ai-grader-lead');
    }
    return false;
  });
  const [showLeadToast, setShowLeadToast] = useState(false);
  const lowestScoringFactorKey = SCORING_FACTORS.reduce((lowestKey, factor) => {
    return analysis.factors[factor.key].score < analysis.factors[lowestKey].score ? factor.key : lowestKey;
  }, SCORING_FACTORS[0].key);
  const lowestFactor = analysis.factors[lowestScoringFactorKey];
  const scoreInterpretation = getScoreInterpretation(analysis.overallScore, {
    label: lowestFactor.label,
    score: lowestFactor.score
  });
  const scoreColor = getOverallScoreColor(analysis.overallScore);
  const clampedScore = Math.max(0, Math.min(100, analysis.overallScore));
  const gaugeSize = 120;
  const gaugeStrokeWidth = 8;
  const gaugeRadius = (gaugeSize - gaugeStrokeWidth) / 2;
  const gaugeCircumference = 2 * Math.PI * gaugeRadius;
  const gaugeTargetOffset = gaugeCircumference - (clampedScore / 100) * gaugeCircumference;
  const gaugeProgressStyle: CSSProperties = {
    strokeDasharray: gaugeCircumference,
    strokeDashoffset: gaugeCircumference,
    ['--gauge-circumference' as string]: gaugeCircumference,
    ['--gauge-target-offset' as string]: gaugeTargetOffset
  };

  const handleExportMarkdown = () => {
    trackExport('markdown');
    const markdown = generateMarkdownReport(analysis);
    const filename = `ai-grader-report-${analysis.url.replace(/[^a-z0-9]/gi, '-')}-${new Date().toISOString().split('T')[0]}.md`;
    downloadMarkdown(markdown, filename);
  };

  const handleCopyCode = async (code: string, index: number) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedRecIndex(index);
      setTimeout(() => setCopiedRecIndex((current) => (current === index ? null : current)), 1800);
    } catch {
      setCopiedRecIndex(null);
    }
  };

  const contentImprovements = (analysis.contentImprovements && analysis.contentImprovements.length > 0)
    ? analysis.contentImprovements
    : analysis.recommendations.slice(0, 3).map((recommendation, index) => ({
      section: `${recommendation.category} Improvement ${index + 1}`,
      current: `Gap identified in ${recommendation.category.toLowerCase()}: ${recommendation.text}`,
      improved: `Implement this action first: ${recommendation.text}`,
      reasoning: 'Addressing this issue improves crawlability, relevance, and AI answer quality for this page.',
      priority: recommendation.priority
    }));

  const crawledContent = analysis.crawledContent;
  const performanceMetrics = crawledContent?.aiAnalysisData?.performanceMetrics;

  const handleCopyMarkdown = async () => {
    if (!crawledContent?.markdownContent) return;
    try {
      await navigator.clipboard.writeText(crawledContent.markdownContent);
      setMarkdownCopied(true);
      setTimeout(() => setMarkdownCopied(false), 1800);
    } catch {
      setMarkdownCopied(false);
    }
  };

  const handleDownloadMarkdownContent = () => {
    if (!crawledContent?.markdownContent) return;
    const blob = new Blob([crawledContent.markdownContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `page-markdown-${analysis.url.replace(/[^a-z0-9]/gi, '-')}-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  };

  const immediateActions = [
    `Start with ${lowestFactor.label} (${lowestFactor.score}%) because it is your lowest-scoring factor.`,
    ...analysis.recommendations.slice(0, 2).map((recommendation) => formatRecommendationText(recommendation.text))
  ];

  const longTermStrategy = [
    'Re-run this analysis monthly to track score movement after each implementation sprint.',
    'Expand optimization work beyond this page to core templates and high-value conversion pages.',
    'Maintain a recurring content update process that aligns with AI search behavior and user intent shifts.'
  ];

  return (
    <div className="max-w-6xl mx-auto" id="report-container">
      <div className="results">
        <div className="results-header">
          <h1 style={{ margin: 0, textAlign: 'center' }}>AI Website Grader Report</h1>
          <p style={{ margin: '8px 0 0', textAlign: 'center', fontSize: '1.06rem', opacity: 0.95 }}>
            Powered by Search Influence — AI SEO Experts
          </p>
          <p style={{ margin: '10px 0 0', textAlign: 'center' }}>Analysis completed on {new Date(analysis.timestamp).toLocaleDateString()}</p>
        </div>

        <div className="content-area" style={{ maxHeight: 'none', overflow: 'visible' }}>
          <div style={{
            border: '1px solid var(--border-gray)',
            borderRadius: '12px',
            padding: '22px',
            marginBottom: '18px',
            background: 'var(--background-gray)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.08)'
          }}>
            <div className="report-score-header-grid">
              <div>
                <h3 style={{ fontSize: '1.45rem', margin: '0 0 10px', color: 'var(--content-text)' }}>Website Information</h3>
                <p style={{ margin: '0 0 8px', color: 'var(--secondary-content)', wordBreak: 'break-word' }}><strong>URL:</strong> {analysis.url}</p>
                <p style={{ margin: 0, color: 'var(--secondary-content)', wordBreak: 'break-word' }}><strong>Title:</strong> {analysis.title || 'Untitled page'}</p>
              </div>
              <div className="report-score-gauge-col">
                <div className="score-gauge-wrap">
                  <svg width={gaugeSize} height={gaugeSize} viewBox={`0 0 ${gaugeSize} ${gaugeSize}`} aria-hidden="true">
                    <circle
                      cx={gaugeSize / 2}
                      cy={gaugeSize / 2}
                      r={gaugeRadius}
                      fill="none"
                      stroke="#dee2e6"
                      strokeWidth={gaugeStrokeWidth}
                    />
                    <circle
                      className="score-gauge-progress"
                      cx={gaugeSize / 2}
                      cy={gaugeSize / 2}
                      r={gaugeRadius}
                      fill="none"
                      stroke={scoreColor}
                      strokeWidth={gaugeStrokeWidth}
                      strokeLinecap="round"
                      transform={`rotate(-90 ${gaugeSize / 2} ${gaugeSize / 2})`}
                      style={gaugeProgressStyle}
                    />
                  </svg>
                  <div className="score-gauge-center" style={{ color: scoreColor }}>{analysis.overallScore}%</div>
                </div>
                <div style={{
                  marginTop: '6px',
                  fontSize: '0.96rem',
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  color: scoreColor,
                  textTransform: 'uppercase'
                }}>
                  {getOverallScoreStatus(analysis.overallScore)}
                </div>
              </div>
            </div>
          </div>

          <div className="export-prominence-card">
            <div className="section-heading-shell" style={{ marginBottom: '14px' }}>
              <p className="section-heading-eyebrow section-heading-left">Report Actions</p>
              <h2 className="major-section-heading section-heading-left" style={{ marginBottom: '6px' }}>Share or Export This Report</h2>
              <p style={{ margin: 0, color: 'var(--secondary-content)', maxWidth: '60ch' }}>
                Save a branded PDF, export markdown for implementation teams, or generate a share link while the full analysis is still in view.
              </p>
            </div>
            <ExportButtons
              analysis={analysis}
              onExportMarkdown={handleExportMarkdown}
            />
          </div>

          <div style={{
            marginBottom: '18px',
            padding: '14px 16px',
            borderRadius: '10px',
            borderLeft: '4px solid var(--orange-accent)',
            borderTop: '1px solid var(--border-gray)',
            borderRight: '1px solid var(--border-gray)',
            borderBottom: '1px solid var(--border-gray)',
            background: 'rgba(255, 255, 255, 0.85)',
            display: 'flex',
            gap: '10px',
            alignItems: 'flex-start'
          }}>
            <Lightbulb size={18} style={{ color: 'var(--muted-text)', marginTop: '2px', flexShrink: 0 }} />
            <p style={{ margin: 0, color: 'var(--secondary-content)', fontSize: '0.95rem', lineHeight: 1.5 }}>
              {scoreInterpretation}
            </p>
          </div>

          <div className="section-heading-shell">
            <p className="section-heading-eyebrow">Four-Factor Overview</p>
            <h2 className="major-section-heading">Analysis Score Breakdown</h2>
          </div>
          <div className="factor-cards-grid" style={{ marginBottom: '18px' }}>
            {SCORING_FACTORS.map((factor) => (
              <FactorCard
                key={factor.key}
                factor={analysis.factors[factor.key]}
                accent={FACTOR_THEME[factor.key].accent}
                borderColor={FACTOR_THEME[factor.key].borderColor}
                gradient={FACTOR_THEME[factor.key].gradient}
                icon={FACTOR_THEME[factor.key].icon}
              />
            ))}
          </div>

          <div style={{
            marginBottom: '18px',
            padding: '16px',
            borderRadius: '12px',
            border: '1px solid rgba(1, 74, 97, 0.28)',
            background: 'linear-gradient(135deg, rgba(1, 44, 58, 0.12) 0%, rgba(1, 74, 97, 0.08) 100%)'
          }}>
            <h2 className="major-section-heading section-heading-left" style={{ marginBottom: '8px' }}>From Snapshot to Strategy</h2>
            <p style={{ margin: '0 0 12px', color: 'var(--secondary-content)' }}>
              This grader is a free single-page analysis. If you want deeper insight across templates, technical systems,
              and content priorities, we can provide a comprehensive AI visibility review.
            </p>
            <button
              onClick={() => {
                trackCTA('after-score-summary', leadSubmitted ? 'contact-redirect' : 'lead-modal-open');
                if (leadSubmitted) { window.open('https://www.searchinfluence.com/contact/', '_blank'); return; }
                setShowLeadModal(true);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 14px',
                borderRadius: '8px',
                background: 'var(--si-navy)',
                color: '#fff',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                fontSize: 'inherit'
              }}
            >
              Get Your Full AI Visibility Review <ArrowRight size={15} />
            </button>
          </div>

          <div style={{
            marginBottom: '20px',
            padding: '16px',
            borderRadius: '12px',
            border: '1px solid rgba(1, 74, 97, 0.22)',
            background: 'linear-gradient(135deg, rgba(1, 44, 58, 0.06) 0%, rgba(52, 144, 181, 0.08) 55%, rgba(78, 177, 205, 0.08) 100%)'
          }}>
            <h2 className="major-section-heading section-heading-left" style={{ marginBottom: '12px' }}>Priority Recommendations</h2>
            <div style={{ display: 'grid', gap: '10px' }}>
              {analysis.recommendations.map((recommendation, index) => {
                const priorityStyle = priorityStyleMap[recommendation.priority];
                const PriorityIcon = priorityStyle.icon;
                return (
                  <article
                    key={`priority-rec-${index}`}
                    className="recommendation-card"
                    style={{
                      border: `1px solid ${priorityStyle.border}`,
                      borderLeft: `4px solid ${priorityStyle.text}`,
                      borderRadius: '10px',
                      background: priorityStyle.bg
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: priorityStyle.text }}>
                        <PriorityIcon size={14} />
                        {priorityStyle.label} Priority
                      </span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--muted-text)' }}>{recommendation.category}</span>
                    </div>
                    <p style={{ margin: 0, color: 'var(--content-text)' }}>{formatRecommendationText(recommendation.text)}</p>
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
                      <p style={{ margin: '8px 0 0', color: 'var(--secondary-content)', fontSize: '0.84rem' }}>
                        Time to implement: {recommendation.timeToImplement}
                      </p>
                    )}
                  </article>
                );
              })}
            </div>
          </div>

          <h2 className="major-section-heading" style={{
            textAlign: 'left',
            marginBottom: '10px'
          }}>
            Detailed Factor Analysis
          </h2>
          <div className="factor-analysis-heading-card" style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
              <div>
                <p className="section-heading-eyebrow section-heading-left" style={{ marginBottom: '6px' }}>Deep Dive</p>
                <p style={{ margin: 0, color: 'var(--secondary-content)' }}>
                  The lowest-scoring factor opens by default. Each accordion preview includes status, findings, and visible sub-metric snapshots before expansion.
                </p>
              </div>
              <div className="brand-palette-strip" aria-hidden="true">
                {brandPalette.map((color, index) => (
                  <span key={`brand-palette-${index}`} style={{ background: color }} />
                ))}
              </div>
            </div>
          </div>
          <div style={{ display: 'grid', gap: '12px', marginBottom: '20px' }}>
            {SCORING_FACTORS.map((factor) => {
              const theme = FACTOR_THEME[factor.key];
              return (
                <FactorDetails
                  key={`details-${factor.key}`}
                  factor={analysis.factors[factor.key]}
                  accent={theme.accent}
                  borderColor={theme.borderColor}
                  gradient={theme.gradient}
                  icon={theme.icon}
                  defaultOpen={factor.key === lowestScoringFactorKey}
                />
              );
            })}
          </div>

          <section style={{ marginBottom: '24px' }}>
              <h2 className="major-section-heading" style={{ textAlign: 'left', marginBottom: '14px' }}>
                Performance Analysis
              </h2>
            {performanceMetrics ? (
              <div style={{
                border: '1px solid var(--border-gray)',
                borderRadius: '14px',
                padding: '18px',
                background: 'linear-gradient(135deg, rgba(1, 44, 58, 0.06) 0%, rgba(1, 74, 97, 0.08) 48%, rgba(78, 177, 205, 0.08) 100%)'
              }}>
                <div style={{ display: 'grid', gap: '12px', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
                  {performanceMetrics.coreWebVitals && (
                    <article style={{
                      borderRadius: '12px',
                      padding: '16px',
                      background: 'var(--content-bg)',
                      border: '1px solid rgba(145, 195, 100, 0.35)'
                    }}>
                      <h3 style={{ margin: '0 0 10px', color: 'var(--content-text)', fontSize: '1rem' }}>Core Web Vitals</h3>
                      <div style={{ display: 'grid', gap: '6px', color: 'var(--secondary-content)', fontSize: '0.93rem' }}>
                        <p style={{ margin: 0 }}><strong style={{ color: 'var(--content-text)' }}>Performance Score:</strong> {performanceMetrics.coreWebVitals.score}/100</p>
                        <p style={{ margin: 0 }}><strong style={{ color: 'var(--content-text)' }}>LCP:</strong> {performanceMetrics.coreWebVitals.lcp}ms</p>
                        <p style={{ margin: 0 }}><strong style={{ color: 'var(--content-text)' }}>FID:</strong> {performanceMetrics.coreWebVitals.fid}ms</p>
                        <p style={{ margin: 0 }}><strong style={{ color: 'var(--content-text)' }}>CLS:</strong> {performanceMetrics.coreWebVitals.cls}</p>
                      </div>
                      <p style={{ margin: '10px 0 0', color: 'var(--muted-text)', fontSize: '0.82rem' }}>
                        Real Core Web Vitals data from Google PageSpeed Insights API.
                      </p>
                    </article>
                  )}

                  {performanceMetrics.htmlValidation && (
                    <article style={{
                      borderRadius: '12px',
                      padding: '16px',
                      background: 'var(--content-bg)',
                      border: '1px solid rgba(52, 144, 181, 0.28)'
                    }}>
                      <h3 style={{ margin: '0 0 10px', color: 'var(--content-text)', fontSize: '1rem' }}>HTML Validation (W3C)</h3>
                      <div style={{ display: 'grid', gap: '6px', color: 'var(--secondary-content)', fontSize: '0.93rem' }}>
                        <p style={{ margin: 0 }}><strong style={{ color: 'var(--content-text)' }}>Status:</strong> {performanceMetrics.htmlValidation.isValid ? 'Valid' : 'Invalid'}</p>
                        <p style={{ margin: 0 }}><strong style={{ color: 'var(--content-text)' }}>Errors:</strong> {performanceMetrics.htmlValidation.errors}</p>
                        <p style={{ margin: 0 }}><strong style={{ color: 'var(--content-text)' }}>Warnings:</strong> {performanceMetrics.htmlValidation.warnings}</p>
                      </div>
                      <details style={{ marginTop: '12px' }}>
                        <summary style={{
                          cursor: 'pointer',
                          color: 'var(--si-medium-blue)',
                          fontWeight: 700,
                          fontSize: '0.88rem'
                        }}>
                          View Validation Details ({performanceMetrics.htmlValidation.errors} errors, {performanceMetrics.htmlValidation.warnings} warnings)
                        </summary>
                        <div style={{
                          marginTop: '10px',
                          maxHeight: '220px',
                          overflowY: 'auto',
                          borderRadius: '10px',
                          padding: '12px',
                          background: 'rgba(1, 44, 58, 0.04)',
                          border: '1px solid var(--border-gray)'
                        }}>
                          {performanceMetrics.htmlValidation.messages.length > 0 ? (
                            <ul style={{ margin: 0, paddingLeft: '18px', color: 'var(--secondary-content)', fontSize: '0.86rem' }}>
                              {performanceMetrics.htmlValidation.messages.slice(0, 10).map((message, index) => (
                                <li key={`html-validation-message-${index}`} style={{ marginBottom: '6px' }}>
                                  <strong style={{ color: message.type === 'error' ? 'var(--error-red)' : message.type === 'warning' ? 'var(--orange-accent)' : 'var(--si-medium-blue)' }}>
                                    {message.type.toUpperCase()}:
                                  </strong>{' '}
                                  {message.message}
                                  {message.line ? ` (Line ${message.line})` : ''}
                                </li>
                              ))}
                              {performanceMetrics.htmlValidation.messages.length > 10 && (
                                <li style={{ color: 'var(--muted-text)' }}>
                                  ... and {performanceMetrics.htmlValidation.messages.length - 10} more issues
                                </li>
                              )}
                            </ul>
                          ) : (
                            <p style={{ margin: 0, color: 'var(--muted-text)', fontSize: '0.86rem' }}>
                              No detailed validation messages available.
                            </p>
                          )}
                        </div>
                      </details>
                    </article>
                  )}

                  {performanceMetrics.accessibilityScore !== undefined && (
                    <article style={{
                      borderRadius: '12px',
                      padding: '16px',
                      background: 'var(--content-bg)',
                      border: '1px solid rgba(145, 195, 100, 0.35)'
                    }}>
                      <h3 style={{ margin: '0 0 10px', color: 'var(--content-text)', fontSize: '1rem' }}>Accessibility Score</h3>
                      <p style={{ margin: '0 0 8px', color: 'var(--secondary-content)', fontSize: '0.93rem' }}>
                        <strong style={{ color: 'var(--content-text)' }}>Score:</strong> {performanceMetrics.accessibilityScore}/100
                      </p>
                      <p style={{ margin: 0, color: 'var(--muted-text)', fontSize: '0.82rem' }}>
                        Based on alt text coverage, ARIA attributes, semantic HTML, and form labels.
                      </p>
                    </article>
                  )}

                  {performanceMetrics.performanceScore !== undefined && (
                    <article style={{
                      borderRadius: '12px',
                      padding: '16px',
                      background: 'var(--content-bg)',
                      border: '1px solid rgba(1, 74, 97, 0.26)'
                    }}>
                      <h3 style={{ margin: '0 0 10px', color: 'var(--content-text)', fontSize: '1rem' }}>Combined Performance</h3>
                      <p style={{ margin: '0 0 8px', color: 'var(--secondary-content)', fontSize: '0.93rem' }}>
                        <strong style={{ color: 'var(--content-text)' }}>Overall Score:</strong> {performanceMetrics.performanceScore}/100
                      </p>
                      <p style={{ margin: 0, color: 'var(--muted-text)', fontSize: '0.82rem' }}>
                        Weighted: 40% Core Web Vitals, 30% HTML Validity, 30% Accessibility.
                      </p>
                    </article>
                  )}
                </div>

                <div style={{
                  marginTop: '14px',
                  borderRadius: '12px',
                  padding: '16px',
                  border: '1px solid rgba(1, 74, 97, 0.22)',
                  background: 'rgba(255,255,255,0.72)'
                }}>
                  <h3 style={{ margin: '0 0 12px', color: 'var(--content-text)', fontSize: '1rem' }}>API Status & Information</h3>
                  <div style={{ display: 'grid', gap: '10px', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
                    <div style={{
                      borderRadius: '10px',
                      padding: '12px',
                      border: '1px solid var(--border-gray)',
                      background: 'var(--content-bg)'
                    }}>
                      <p style={{ margin: 0, color: 'var(--secondary-content)', fontSize: '0.9rem' }}>
                        <strong style={{ color: 'var(--content-text)' }}>W3C HTML Validator:</strong> Free validation service with no signup required.
                      </p>
                    </div>
                    <div style={{
                      borderRadius: '10px',
                      padding: '12px',
                      border: '1px solid var(--border-gray)',
                      background: 'var(--content-bg)'
                    }}>
                      <p style={{ margin: 0, color: 'var(--secondary-content)', fontSize: '0.9rem' }}>
                        <strong style={{ color: 'var(--content-text)' }}>Google PageSpeed Insights:</strong> Optional free API with daily request limits.
                      </p>
                    </div>
                  </div>
                  <div style={{
                    marginTop: '10px',
                    borderRadius: '10px',
                    padding: '12px',
                    background: 'rgba(52, 144, 181, 0.1)',
                    border: '1px solid rgba(52, 144, 181, 0.24)'
                  }}>
                    <p style={{ margin: 0, color: 'var(--secondary-content)', fontSize: '0.9rem' }}>
                      Real performance data is shown here when the upstream APIs respond successfully during crawl analysis.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{
                border: '1px solid var(--border-gray)',
                borderRadius: '14px',
                padding: '18px',
                background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.08) 0%, rgba(1, 74, 97, 0.04) 100%)'
              }}>
                <p style={{ margin: '0 0 8px', color: 'var(--content-text)', fontWeight: 700 }}>
                  Performance metrics are loading or unavailable.
                </p>
                <p style={{ margin: 0, color: 'var(--secondary-content)', fontSize: '0.92rem' }}>
                  This can happen when external services are rate-limited or temporarily unreachable. The rest of the report still uses the available crawl and scoring data.
                </p>
              </div>
            )}
          </section>

          {crawledContent?.markdownContent && (
            <section style={{ marginBottom: '24px' }}>
              <h2 className="major-section-heading" style={{ textAlign: 'left', marginBottom: '14px' }}>
                Page Content Structure (Markdown)
              </h2>
              <div style={{
                border: '1px solid var(--border-gray)',
                borderRadius: '14px',
                padding: '18px',
                background: 'linear-gradient(135deg, rgba(1, 44, 58, 0.08) 0%, rgba(1, 74, 97, 0.05) 100%)'
              }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '14px' }}>
                  <button
                    type="button"
                    onClick={handleCopyMarkdown}
                    style={{
                      border: '1px solid rgba(223, 89, 38, 0.32)',
                      background: 'rgba(223, 89, 38, 0.12)',
                      color: 'var(--content-text)',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      fontSize: '0.86rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    {markdownCopied ? 'Copied Markdown' : 'Copy Markdown'}
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadMarkdownContent}
                    style={{
                      border: '1px solid rgba(52, 144, 181, 0.32)',
                      background: 'rgba(52, 144, 181, 0.12)',
                      color: 'var(--content-text)',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      fontSize: '0.86rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Download Markdown
                  </button>
                </div>

                <div style={{
                  borderRadius: '12px',
                  padding: '16px',
                  background: '#111827',
                  border: '1px solid rgba(255,255,255,0.08)',
                  maxHeight: '400px',
                  overflow: 'auto'
                }}>
                  <pre style={{
                    margin: 0,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    color: '#d1d5db',
                    fontSize: '0.86rem',
                    lineHeight: 1.55,
                    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
                  }}>
                    <code>{crawledContent.markdownContent}</code>
                  </pre>
                </div>

                <div style={{
                  marginTop: '14px',
                  borderRadius: '10px',
                  padding: '12px',
                  background: 'rgba(52, 144, 181, 0.08)',
                  border: '1px solid rgba(52, 144, 181, 0.22)'
                }}>
                  <p style={{ margin: 0, color: 'var(--secondary-content)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                    <strong style={{ color: 'var(--content-text)' }}>Pro tip:</strong> Markdown highlights the heading hierarchy and content flow AI systems often rely on when interpreting a page, so this view helps you spot structural issues that are easy to miss in rendered HTML.
                  </p>
                </div>
              </div>
            </section>
          )}

          {contentImprovements.length > 0 && (
            <section style={{ marginBottom: '24px' }}>
              <h2 className="major-section-heading" style={{ textAlign: 'left', marginBottom: '14px' }}>
                Priority Content Improvements
              </h2>
              <div style={{ display: 'grid', gap: '14px' }}>
                {contentImprovements.map((improvement, index) => (
                  <article
                    key={`content-improvement-${index}`}
                    style={{
                      border: '1px solid var(--border-gray)',
                      borderRadius: '12px',
                      padding: '16px',
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(248, 250, 251, 0.96) 100%)',
                      boxShadow: '0 10px 22px rgba(1, 44, 58, 0.08)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '30px',
                          height: '30px',
                          background: 'var(--si-orange)',
                          color: 'var(--white)',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '0.86rem',
                          flexShrink: 0,
                          boxShadow: '0 6px 14px rgba(223, 89, 38, 0.24)'
                        }}>
                          {index + 1}
                        </div>
                        <h3 style={{ margin: 0, color: 'var(--content-text)', fontSize: '1.05rem' }}>{improvement.section}</h3>
                      </div>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '4px 10px',
                        borderRadius: '999px',
                        border: `1px solid ${priorityStyleMap[improvement.priority].border}`,
                        color: priorityStyleMap[improvement.priority].text,
                        background: priorityStyleMap[improvement.priority].bg,
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em'
                      }}>
                        {priorityStyleMap[improvement.priority].label} Priority
                      </span>
                    </div>
                    <div className="content-improvements-grid">
                      <div style={{
                        background: 'rgba(231, 76, 60, 0.06)',
                        borderLeft: '5px solid var(--error-red)',
                        border: '1px solid rgba(231, 76, 60, 0.14)',
                        borderRadius: '10px',
                        padding: '12px'
                      }}>
                        <h4 style={{ margin: '0 0 6px', color: 'var(--content-text)', fontSize: '0.84rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          Current Issue
                        </h4>
                        <p style={{ margin: 0, color: 'var(--secondary-content)', fontSize: '0.92rem' }}>{improvement.current}</p>
                      </div>
                      <div style={{
                        background: 'rgba(145, 195, 100, 0.14)',
                        borderLeft: '5px solid var(--si-green)',
                        border: '1px solid rgba(145, 195, 100, 0.22)',
                        borderRadius: '10px',
                        padding: '12px'
                      }}>
                        <h4 style={{ margin: '0 0 6px', color: 'var(--content-text)', fontSize: '0.84rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          Recommended Action
                        </h4>
                        <p style={{ margin: 0, color: 'var(--secondary-content)', fontSize: '0.92rem' }}>{improvement.improved}</p>
                      </div>
                    </div>
                    <p style={{ margin: '10px 0 0', color: 'var(--secondary-content)', fontSize: '0.9rem' }}>
                      <strong style={{ color: 'var(--content-text)' }}>Why this helps:</strong> {improvement.reasoning}
                    </p>
                  </article>
                ))}
              </div>
            </section>
          )}

          <section style={{
            marginBottom: '24px',
            borderRadius: '14px',
            border: '1px solid rgba(1, 74, 97, 0.28)',
            background: 'linear-gradient(135deg, rgba(1, 44, 58, 0.96) 0%, rgba(1, 74, 97, 0.92) 56%, rgba(52, 144, 181, 0.9) 100%)',
            padding: '20px'
          }}>
            <h2 className="major-section-heading" style={{ marginBottom: '14px', color: 'var(--white)' }}>Next Steps</h2>
            <p style={{ margin: '0 0 14px', color: 'rgba(255,255,255,0.82)', maxWidth: '64ch' }}>
              Use the actions below to turn the score snapshot into a prioritized implementation plan for this page and the broader site.
            </p>
            <div className="next-steps-grid">
              <div style={{
                background: 'rgba(255,255,255,0.92)',
                borderRadius: '12px',
                padding: '16px',
                border: '1px solid rgba(1, 74, 97, 0.18)'
              }}>
                <h3 style={{ margin: '0 0 10px', color: 'var(--content-text)', fontSize: '1.08rem' }}>Immediate Actions</h3>
                <ol style={{ margin: 0, paddingLeft: '18px', color: 'var(--secondary-content)' }}>
                  {immediateActions.map((action, index) => (
                    <li key={`immediate-action-${index}`} style={{ marginBottom: '8px' }}>{action}</li>
                  ))}
                </ol>
              </div>
              <div style={{
                background: 'rgba(255,255,255,0.92)',
                borderRadius: '12px',
                padding: '16px',
                border: '1px solid rgba(1, 74, 97, 0.18)'
              }}>
                <h3 style={{ margin: '0 0 10px', color: 'var(--content-text)', fontSize: '1.08rem' }}>Long-term Strategy</h3>
                <ol style={{ margin: 0, paddingLeft: '18px', color: 'var(--secondary-content)' }}>
                  {longTermStrategy.map((action, index) => (
                    <li key={`long-term-action-${index}`} style={{ marginBottom: '8px' }}>{action}</li>
                  ))}
                </ol>
              </div>
            </div>
          </section>

          <div style={{
            marginTop: '30px',
            padding: '24px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, rgba(1, 44, 58, 0.12) 0%, rgba(1, 74, 97, 0.08) 100%)',
            border: '1px solid rgba(1, 74, 97, 0.3)',
            textAlign: 'center'
          }}>
            <h2 className="major-section-heading" style={{ marginBottom: '10px' }}>
              Want a roadmap beyond this single page?
            </h2>
            <p style={{ margin: '0 0 16px', color: 'var(--secondary-content)', maxWidth: '650px', marginLeft: 'auto', marginRight: 'auto' }}>
              We&apos;ll turn this free page-level analysis into a comprehensive review with technical, content, and
              implementation priorities across your site.
            </p>
            <button
              onClick={() => {
                trackCTA('bottom-banner', leadSubmitted ? 'contact-redirect' : 'lead-modal-open');
                if (leadSubmitted) { window.open('https://www.searchinfluence.com/contact/', '_blank'); return; }
                setShowLeadModal(true);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '11px 16px',
                borderRadius: '8px',
                background: 'var(--si-navy)',
                color: '#fff',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                fontSize: 'inherit'
              }}
            >
              Get Your Full AI Visibility Review <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </div>

      <LeadCaptureModal
        isOpen={showLeadModal && !leadSubmitted}
        actionLabel="AI Visibility Review"
        onClose={() => setShowLeadModal(false)}
        onSubmit={async (values) => {
          const res = await fetch('/api/leads', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...values, source: 'visibility-review-cta' })
          });
          if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error(data.error || 'Something went wrong.');
          }
          localStorage.setItem('ai-grader-lead', JSON.stringify(values));
          setLeadSubmitted(true);
          setShowLeadModal(false);
          setShowLeadToast(true);
          setTimeout(() => setShowLeadToast(false), 4000);
          trackCTA('lead-modal', 'lead-submitted');
        }}
      />

      {showLeadToast && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 1100,
          background: 'var(--si-navy)',
          color: '#fff',
          padding: '14px 20px',
          borderRadius: '10px',
          fontWeight: 600,
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
          fontSize: '0.95rem'
        }}>
          Thanks! We&apos;ll be in touch.
        </div>
      )}
    </div>
  );
}
