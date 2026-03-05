'use client';

import { WebsiteAnalysis } from '@/types';
import ExportButtons from './ExportButtons';
import { generateMarkdownReport, downloadMarkdown } from '@/lib/exporters';
import { useGoogleTagManager } from '@/hooks/useGoogleTagManager';
import { SCORING_FACTORS } from '@/lib/scoring/config';
import FactorCard from './report/FactorCard';
import FactorDetails from './report/FactorDetails';

interface ScoreReportProps {
  analysis: WebsiteAnalysis;
}

export default function ScoreReport({ analysis }: ScoreReportProps) {
  const { trackExport } = useGoogleTagManager();

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

        <div className="content-area">
          <div style={{
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '16px',
            background: 'var(--background-gray)'
          }}>
            <p style={{ margin: '0 0 6px' }}><strong>URL:</strong> {analysis.url}</p>
            <p style={{ margin: '0 0 6px' }}><strong>Title:</strong> {analysis.title}</p>
            <p style={{ margin: 0 }}><strong>Overall Score:</strong> {analysis.overallScore}%</p>
          </div>

          <h2>4-Factor Score Breakdown</h2>
          <div style={{ display: 'grid', gap: '10px', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
            {SCORING_FACTORS.map((factor) => (
              <FactorCard key={factor.key} factor={analysis.factors[factor.key]} />
            ))}
          </div>

          <div style={{ marginTop: '20px', marginBottom: '20px' }}>
            <h2>Priority Recommendations</h2>
            <ul>
              {analysis.recommendations.map((recommendation, index) => (
                <li key={`priority-rec-${index}`}>
                  <strong>{recommendation.priority.toUpperCase()}:</strong> {recommendation.text}
                  {recommendation.timeToImplement ? ` (${recommendation.timeToImplement})` : ''}
                </li>
              ))}
            </ul>
          </div>

          <div style={{ display: 'grid', gap: '12px' }}>
            {SCORING_FACTORS.map((factor) => (
              <FactorDetails key={`details-${factor.key}`} factor={analysis.factors[factor.key]} />
            ))}
          </div>

          <ExportButtons analysis={analysis} onExportMarkdown={handleExportMarkdown} />
        </div>
      </div>
    </div>
  );
}
