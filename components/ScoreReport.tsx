'use client';

import { ScoringFactorKey, WebsiteAnalysis } from '@/types';
import ExportButtons from './ExportButtons';
import { generateMarkdownReport, downloadMarkdown } from '@/lib/exporters';
import { useGoogleTagManager } from '@/hooks/useGoogleTagManager';
import { SCORING_FACTORS } from '@/lib/scoring/config';
import FactorCard from './report/FactorCard';
import FactorDetails from './report/FactorDetails';

interface ScoreReportProps {
  analysis: WebsiteAnalysis;
}

const FACTOR_THEME: Record<ScoringFactorKey, { accent: string; borderColor: string; gradient: string }> = {
  contentStructure: {
    accent: 'var(--info-blue)',
    borderColor: 'rgba(52, 152, 219, 0.28)',
    gradient: 'linear-gradient(135deg, rgba(52, 152, 219, 0.12) 0%, rgba(52, 152, 219, 0.04) 100%)'
  },
  structuredData: {
    accent: 'var(--success-green)',
    borderColor: 'rgba(39, 174, 96, 0.28)',
    gradient: 'linear-gradient(135deg, rgba(39, 174, 96, 0.12) 0%, rgba(39, 174, 96, 0.04) 100%)'
  },
  technicalHealth: {
    accent: 'var(--orange-accent)',
    borderColor: 'rgba(230, 126, 34, 0.28)',
    gradient: 'linear-gradient(135deg, rgba(230, 126, 34, 0.12) 0%, rgba(230, 126, 34, 0.04) 100%)'
  },
  pageSEO: {
    accent: '#8e44ad',
    borderColor: 'rgba(142, 68, 173, 0.28)',
    gradient: 'linear-gradient(135deg, rgba(142, 68, 173, 0.12) 0%, rgba(142, 68, 173, 0.04) 100%)'
  }
};

const priorityStyleMap = {
  high: { bg: 'rgba(231, 76, 60, 0.12)', border: 'rgba(231, 76, 60, 0.35)', text: 'var(--error-red)', label: 'High' },
  medium: { bg: 'rgba(230, 126, 34, 0.12)', border: 'rgba(230, 126, 34, 0.35)', text: 'var(--orange-accent)', label: 'Medium' },
  low: { bg: 'rgba(39, 174, 96, 0.12)', border: 'rgba(39, 174, 96, 0.35)', text: 'var(--success-green)', label: 'Low' }
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

export default function ScoreReport({ analysis }: ScoreReportProps) {
  const { trackExport } = useGoogleTagManager();
  const scoreColor = getOverallScoreColor(analysis.overallScore);

  const handleExportMarkdown = () => {
    trackExport('markdown');
    const markdown = generateMarkdownReport(analysis);
    const filename = `ai-grader-report-${analysis.url.replace(/[^a-z0-9]/gi, '-')}-${new Date().toISOString().split('T')[0]}.md`;
    downloadMarkdown(markdown, filename);
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
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '20px', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1.45rem', margin: '0 0 10px', color: 'var(--content-text)' }}>Website Information</h3>
                <p style={{ margin: '0 0 8px', color: 'var(--secondary-content)', wordBreak: 'break-word' }}><strong>URL:</strong> {analysis.url}</p>
                <p style={{ margin: 0, color: 'var(--secondary-content)', wordBreak: 'break-word' }}><strong>Title:</strong> {analysis.title || 'Untitled page'}</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', fontWeight: 800, color: scoreColor, lineHeight: 1 }}>{analysis.overallScore}%</div>
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

          <h2 style={{ margin: '0 0 12px', color: 'var(--content-text)', fontSize: '1.4rem', textAlign: 'center' }}>
            Analysis Score Breakdown
          </h2>
          <div style={{ display: 'grid', gap: '12px', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', marginBottom: '18px' }}>
            {SCORING_FACTORS.map((factor) => (
              <FactorCard
                key={factor.key}
                factor={analysis.factors[factor.key]}
                accent={FACTOR_THEME[factor.key].accent}
                borderColor={FACTOR_THEME[factor.key].borderColor}
                gradient={FACTOR_THEME[factor.key].gradient}
              />
            ))}
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
                return (
                  <article
                    key={`priority-rec-${index}`}
                    style={{
                      border: `1px solid ${priorityStyle.border}`,
                      borderLeft: `4px solid ${priorityStyle.text}`,
                      borderRadius: '10px',
                      padding: '12px',
                      background: priorityStyle.bg
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: priorityStyle.text }}>
                        {priorityStyle.label} Priority
                      </span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--muted-text)' }}>{recommendation.category}</span>
                    </div>
                    <p style={{ margin: 0, color: 'var(--content-text)' }}>{recommendation.text}</p>
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
                />
              );
            })}
          </div>

          <ExportButtons analysis={analysis} onExportMarkdown={handleExportMarkdown} />
        </div>
      </div>
    </div>
  );
}
