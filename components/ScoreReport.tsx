'use client';

import { CSSProperties, useState } from 'react';
import { ScoringFactorKey, WebsiteAnalysis } from '@/types';
import { AlertCircle, AlertTriangle, ArrowRight, Database, FileText, Info, Lightbulb, Search, Settings, type LucideIcon } from 'lucide-react';
import ExportButtons from './ExportButtons';
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
    accent: 'var(--info-blue)',
    borderColor: 'rgba(52, 152, 219, 0.28)',
    gradient: 'linear-gradient(135deg, rgba(52, 152, 219, 0.12) 0%, rgba(52, 152, 219, 0.04) 100%)',
    icon: FileText
  },
  structuredData: {
    accent: 'var(--success-green)',
    borderColor: 'rgba(39, 174, 96, 0.28)',
    gradient: 'linear-gradient(135deg, rgba(39, 174, 96, 0.12) 0%, rgba(39, 174, 96, 0.04) 100%)',
    icon: Database
  },
  technicalHealth: {
    accent: 'var(--orange-accent)',
    borderColor: 'rgba(230, 126, 34, 0.28)',
    gradient: 'linear-gradient(135deg, rgba(230, 126, 34, 0.12) 0%, rgba(230, 126, 34, 0.04) 100%)',
    icon: Settings
  },
  pageSEO: {
    accent: '#8e44ad',
    borderColor: 'rgba(142, 68, 173, 0.28)',
    gradient: 'linear-gradient(135deg, rgba(142, 68, 173, 0.12) 0%, rgba(142, 68, 173, 0.04) 100%)',
    icon: Search
  }
};

const priorityStyleMap = {
  high: { bg: 'rgba(231, 76, 60, 0.12)', border: 'rgba(231, 76, 60, 0.35)', text: 'var(--error-red)', label: 'High', icon: AlertTriangle },
  medium: { bg: 'rgba(230, 126, 34, 0.12)', border: 'rgba(230, 126, 34, 0.35)', text: 'var(--orange-accent)', label: 'Medium', icon: AlertCircle },
  low: { bg: 'rgba(39, 174, 96, 0.12)', border: 'rgba(39, 174, 96, 0.35)', text: 'var(--success-green)', label: 'Low', icon: Info }
} as const;

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

  return (
    <div className="max-w-6xl mx-auto" id="report-container">
      <div className="results">
        <div className="results-header">
          <h1 style={{ margin: 0 }}>AI Website Grader Report</h1>
          <p style={{ margin: '8px 0 0' }}>Analysis completed on {new Date(analysis.timestamp).toLocaleDateString()}</p>
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

          <h2 style={{ margin: '0 0 12px', color: 'var(--content-text)', fontSize: '1.4rem', textAlign: 'center' }}>
            Analysis Score Breakdown
          </h2>
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
            border: '1px solid rgba(27, 115, 64, 0.32)',
            background: 'linear-gradient(135deg, rgba(27, 115, 64, 0.1) 0%, rgba(20, 88, 50, 0.08) 100%)'
          }}>
            <h3 style={{ margin: '0 0 8px', color: 'var(--content-text)' }}>From snapshot to strategy</h3>
            <p style={{ margin: '0 0 12px', color: 'var(--secondary-content)' }}>
              This grader is a free single-page analysis. If you want deeper insight across templates, technical systems,
              and content priorities, we can provide a comprehensive AI visibility review.
            </p>
            <a
              href="https://www.searchinfluence.com/contact/"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackCTA('after-score-summary', 'contact-click')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 14px',
                borderRadius: '8px',
                background: '#1B7340',
                color: '#fff',
                fontWeight: 700,
                textDecoration: 'none'
              }}
            >
              Get Your Full AI Visibility Review <ArrowRight size={15} />
            </a>
          </div>

          <div style={{
            marginBottom: '20px',
            padding: '16px',
            borderRadius: '12px',
            border: '1px solid rgba(52, 152, 219, 0.22)',
            background: 'linear-gradient(135deg, rgba(52, 152, 219, 0.06) 0%, rgba(39, 174, 96, 0.05) 100%)'
          }}>
            <h3 style={{ margin: '0 0 12px', color: 'var(--content-text)' }}>Priority Recommendations</h3>
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

          <h3 style={{ margin: '0 0 12px', color: 'var(--content-text)' }}>Detailed Factor Analysis</h3>
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
                  defaultOpen={false}
                />
              );
            })}
          </div>

          <ExportButtons
            analysis={analysis}
            onExportMarkdown={handleExportMarkdown}
          />

          <div style={{
            marginTop: '30px',
            padding: '24px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, rgba(27, 115, 64, 0.12) 0%, rgba(20, 88, 50, 0.08) 100%)',
            border: '1px solid rgba(27, 115, 64, 0.28)',
            textAlign: 'center'
          }}>
            <h3 style={{ margin: '0 0 10px', color: 'var(--content-text)', fontSize: '1.3rem' }}>
              Want a roadmap beyond this single page?
            </h3>
            <p style={{ margin: '0 0 16px', color: 'var(--secondary-content)', maxWidth: '650px', marginLeft: 'auto', marginRight: 'auto' }}>
              We&apos;ll turn this free page-level analysis into a comprehensive review with technical, content, and
              implementation priorities across your site.
            </p>
            <a
              href="https://www.searchinfluence.com/contact/"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackCTA('bottom-banner', 'contact-click')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '11px 16px',
                borderRadius: '8px',
                background: '#1B7340',
                color: '#fff',
                fontWeight: 700,
                textDecoration: 'none'
              }}
            >
              Get Your Full AI Visibility Review <ArrowRight size={15} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
