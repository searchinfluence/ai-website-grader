'use client';

import { WebsiteAnalysis } from '@/types';
import ScoreCard from './ScoreCard';
import ExportButtons from './ExportButtons';
import { generateMarkdownReport, downloadMarkdown } from '@/lib/exporters';
import { useGoogleTagManager } from '@/hooks/useGoogleTagManager';

interface ScoreReportProps {
  analysis: WebsiteAnalysis;
}

export default function ScoreReport({ analysis }: ScoreReportProps) {
  // Debug logging
  console.log('Performance Metrics Debug:', analysis.crawledContent.aiAnalysisData?.performanceMetrics);
  const { trackExport } = useGoogleTagManager();
  
  const handleExportMarkdown = () => {
    // Track markdown export
    trackExport('markdown');
    
    const markdown = generateMarkdownReport(analysis);
    const filename = `ai-grader-report-${analysis.url.replace(/[^a-z0-9]/gi, '-')}-${new Date().toISOString().split('T')[0]}.md`;
    downloadMarkdown(markdown, filename);
  };

  const getOverallScoreColor = (score: number) => {
    if (score >= 80) return 'var(--success-green)';
    if (score >= 60) return 'var(--info-blue)';
    if (score >= 40) return 'var(--orange-accent)';
    return 'var(--error-red)';
  };

  const getOverallScoreStatus = (score: number) => {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'needs-improvement';
    return 'poor';
  };

  return (
    <div className="max-w-6xl mx-auto" id="report-container">
      {/* Header */}
      <div className="results">
        <div className="results-header">
          <div style={{ textAlign: 'center', marginBottom: '10px' }}>
            <h1 style={{ fontSize: '2.7rem', fontWeight: '800', margin: '0 0 5px 0', color: 'var(--white)' }}>
              AI Website Grader Report
            </h1>
            <p style={{ fontSize: '1.2rem', color: 'var(--white)', margin: 0 }}>
              Powered by Search Influence - AI SEO Experts
            </p>
          </div>
          <p style={{ textAlign: 'center', margin: 0, opacity: 0.9, fontSize: '1.125rem' }}>
            Analysis completed on {new Date(analysis.timestamp).toLocaleDateString()}
          </p>
        </div>

        <div className="content-area">
          {/* Website Info */}
          <div style={{ 
            background: 'var(--background-gray)', 
            borderRadius: '12px', 
            padding: '15px', 
            marginBottom: '15px' 
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '20px', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1.65rem', fontWeight: '600', color: 'var(--content-text)', margin: '0 0 10px 0' }}>
                  Website Information
                </h3>
                <p style={{ color: 'var(--secondary-content)', margin: '3px 0', fontSize: '1.275rem' }}>
                  <span style={{ fontWeight: '600' }}>URL:</span> {analysis.url}
                </p>
                <p style={{ color: 'var(--secondary-content)', margin: '3px 0', fontSize: '1.275rem' }}>
                  <span style={{ fontWeight: '600' }}>Title:</span> {analysis.title}
                </p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  fontSize: '3.75rem', 
                  fontWeight: '800', 
                  color: getOverallScoreColor(analysis.overallScore),
                  marginBottom: '3px'
                }}>
                  {analysis.overallScore}%
                </div>
                <div style={{ 
                  fontSize: '1.2rem', 
                  color: 'var(--muted-text)', 
                  textTransform: 'capitalize' 
                }}>
                  {getOverallScoreStatus(analysis.overallScore).replace('-', ' ')}
                </div>
              </div>
            </div>
          </div>

          {/* Score Overview Cards */}
          <div style={{ marginBottom: '8px' }}>
            <h3 style={{
              fontSize: '1.35rem',
              fontWeight: '600',
              color: 'var(--content-text)',
              marginBottom: '6px',
              textAlign: 'center',
              opacity: 0.8
            }}>
              Analysis Score Breakdown
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: '6px',
              marginBottom: '10px',
              maxWidth: '100%',
              overflow: 'hidden'
            }}>
              {/* AI Optimization */}
              <div style={{
                textAlign: 'center',
                padding: '6px',
                background: 'linear-gradient(135deg, rgba(52, 152, 219, 0.1) 0%, rgba(52, 152, 219, 0.05) 100%)',
                borderRadius: '12px',
                border: '1px solid rgba(52, 152, 219, 0.2)',
                borderLeft: '4px solid #3498db',
                minWidth: '0',
                wordWrap: 'break-word'
              }}>
                <div style={{ fontSize: '1.65rem', fontWeight: '700', color: 'var(--info-blue)', marginBottom: '1px' }}>
                  {analysis.aiOptimization.score}%
                </div>
                <div style={{ fontSize: '0.975rem', fontWeight: '600', color: 'var(--content-text)' }}>
                  AI Optimization
                </div>
              </div>

              {/* E-E-A-T Signals */}
              <div style={{
                textAlign: 'center',
                padding: '6px',
                background: 'linear-gradient(135deg, rgba(39, 174, 96, 0.1) 0%, rgba(39, 174, 96, 0.05) 100%)',
                borderRadius: '12px',
                border: '1px solid rgba(39, 174, 96, 0.2)',
                borderLeft: '4px solid #27ae60',
                minWidth: '0',
                wordWrap: 'break-word'
              }}>
                <div style={{ fontSize: '1.65rem', fontWeight: '700', color: 'var(--success-green)', marginBottom: '1px' }}>
                  {analysis.eeatSignals.score}%
                </div>
                <div style={{ fontSize: '0.975rem', fontWeight: '600', color: 'var(--content-text)' }}>
                  E-E-A-T Signals
                </div>
              </div>

              {/* Technical SEO */}
              <div style={{
                textAlign: 'center',
                padding: '6px',
                background: 'linear-gradient(135deg, rgba(230, 126, 34, 0.1) 0%, rgba(230, 126, 34, 0.05) 100%)',
                borderRadius: '12px',
                border: '1px solid rgba(230, 126, 34, 0.2)',
                borderLeft: '4px solid #e67e22',
                minWidth: '0',
                wordWrap: 'break-word'
              }}>
                <div style={{ fontSize: '1.65rem', fontWeight: '700', color: 'var(--orange-accent)', marginBottom: '1px' }}>
                  {analysis.technicalSEO.score}%
                </div>
                <div style={{ fontSize: '0.975rem', fontWeight: '600', color: 'var(--content-text)' }}>
                  Technical SEO
                </div>
              </div>

              {/* Content Quality */}
              <div style={{
                textAlign: 'center',
                padding: '6px',
                background: 'linear-gradient(135deg, rgba(155, 89, 182, 0.1) 0%, rgba(155, 89, 182, 0.05) 100%)',
                borderRadius: '12px',
                border: '1px solid rgba(155, 89, 182, 0.2)',
                borderLeft: '4px solid #9b59b6',
                minWidth: '0',
                wordWrap: 'break-word'
              }}>
                <div style={{ fontSize: '1.65rem', fontWeight: '700', color: '#9b59b6', marginBottom: '1px' }}>
                  {analysis.contentQuality.score}%
                </div>
                <div style={{ fontSize: '0.975rem', fontWeight: '600', color: 'var(--content-text)' }}>
                  Content Quality
                </div>
              </div>

              {/* Mobile Optimization */}
              <div style={{
                textAlign: 'center',
                padding: '6px',
                background: 'linear-gradient(135deg, rgba(231, 76, 60, 0.1) 0%, rgba(231, 76, 60, 0.05) 100%)',
                borderRadius: '12px',
                border: '1px solid rgba(231, 76, 60, 0.2)',
                borderLeft: '4px solid #e74c3c',
                minWidth: '0',
                wordWrap: 'break-word'
              }}>
                <div style={{ fontSize: '1.65rem', fontWeight: '700', color: 'var(--error-red)', marginBottom: '1px' }}>
                  {analysis.mobileOptimization.score}%
                </div>
                <div style={{ fontSize: '0.975rem', fontWeight: '600', color: 'var(--content-text)' }}>
                  Mobile Optimization
                </div>
              </div>

              {/* Schema Analysis */}
              <div style={{
                textAlign: 'center',
                padding: '6px',
                background: 'linear-gradient(135deg, rgba(46, 204, 113, 0.1) 0%, rgba(46, 204, 113, 0.05) 100%)',
                borderRadius: '12px',
                border: '1px solid rgba(46, 204, 113, 0.2)',
                borderLeft: '4px solid #2ecc71',
                minWidth: '0',
                wordWrap: 'break-word'
              }}>
                <div style={{ fontSize: '1.65rem', fontWeight: '700', color: '#2ecc71', marginBottom: '1px' }}>
                  {analysis.schemaAnalysis.score}%
                </div>
                <div style={{ fontSize: '0.975rem', fontWeight: '600', color: 'var(--content-text)' }}>
                  Schema Analysis
                </div>
              </div>

              {/* Technical Crawlability */}
              <div style={{
                textAlign: 'center',
                padding: '6px',
                background: 'linear-gradient(135deg, rgba(52, 73, 94, 0.1) 0%, rgba(52, 73, 94, 0.05) 100%)',
                borderRadius: '12px',
                border: '1px solid rgba(52, 73, 94, 0.2)',
                borderLeft: '4px solid #34495e',
                minWidth: '0',
                wordWrap: 'break-word'
              }}>
                <div style={{ fontSize: '1.65rem', fontWeight: '700', color: '#34495e', marginBottom: '1px' }}>
                  {analysis.technicalCrawlability.score}%
                </div>
                <div style={{ fontSize: '0.975rem', fontWeight: '600', color: 'var(--content-text)' }}>
                  Technical Crawlability
                </div>
              </div>
            </div>
          </div>

          {/* Analysis Summary */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(52, 152, 219, 0.05) 0%, rgba(39, 174, 96, 0.05) 100%)',
            borderRadius: '12px',
            padding: '15px',
            marginBottom: '15px',
            border: '1px solid rgba(52, 152, 219, 0.1)'
          }}>
            <h3 style={{
              fontSize: '1.2rem',
              fontWeight: '600',
              color: 'var(--content-text)',
              marginBottom: '10px',
              textAlign: 'center'
            }}>
              🚀 AI Search Optimization Analysis
            </h3>
            <p style={{
              color: 'var(--secondary-content)',
              fontSize: '1rem',
              lineHeight: '1.5',
              textAlign: 'center',
              margin: '0'
            }}>
              This analysis evaluates your website for modern AI-powered search engines and chat interfaces.
              We assess AI optimization, content authority (E-E-A-T), technical performance, content quality,
              mobile experience, structured data, and bot accessibility to determine your visibility in AI overviews
              and voice search results.
            </p>
          </div>

          {/* Export Buttons */}
          <ExportButtons 
            analysis={analysis} 
            onExportMarkdown={handleExportMarkdown}
          />
        </div>
      </div>

      {/* Detailed Analysis Cards */}
      <div
        className="score-cards-grid"
        style={{
          marginTop: '40px',
          maxWidth: '100%'
        }}
      >
        {/* AI Optimization */}
        <ScoreCard
          title="AI Optimization"
          score={analysis.aiOptimization.score}
          status={analysis.aiOptimization.status}
          findings={analysis.aiOptimization.findings}
          recommendations={analysis.aiOptimization.recommendations.map(rec =>
            `${rec.priority === 'high' ? '🔴' : rec.priority === 'medium' ? '🟡' : '🟢'} ${rec.priority.toUpperCase()}: ${rec.text}`
          )}
          details={{
            'Chunkability': analysis.aiOptimization.chunkability,
            'Q&A Format': analysis.aiOptimization.qaFormat,
            'Entity Recognition': analysis.aiOptimization.entityRecognition,
            'Factual Density': analysis.aiOptimization.factualDensity,
            'Semantic Clarity': analysis.aiOptimization.semanticClarity
          }}
        />

        {/* E-E-A-T Signals */}
        <ScoreCard
          title="E-E-A-T Signals"
          score={analysis.eeatSignals.score}
          status={analysis.eeatSignals.status}
          findings={analysis.eeatSignals.findings}
          recommendations={analysis.eeatSignals.recommendations.map(rec =>
            `${rec.priority === 'high' ? '🔴' : rec.priority === 'medium' ? '🟡' : '🟢'} ${rec.priority.toUpperCase()}: ${rec.text}`
          )}
          details={{
            'Expertise & Experience': analysis.eeatSignals.expertiseExperience,
            'Authoritativeness': analysis.eeatSignals.authoritativeness,
            'Trustworthiness': analysis.eeatSignals.trustworthiness,
            'Factual Accuracy': analysis.eeatSignals.factualAccuracy
          }}
        />

        {/* Technical SEO */}
        <ScoreCard
          title="Technical SEO"
          score={analysis.technicalSEO.score}
          status={analysis.technicalSEO.status}
          findings={analysis.technicalSEO.findings}
          recommendations={analysis.technicalSEO.recommendations.map(rec =>
            `${rec.priority === 'high' ? '🔴' : rec.priority === 'medium' ? '🟡' : '🟢'} ${rec.priority.toUpperCase()}: ${rec.text}`
          )}
          details={{
            'Heading Structure': analysis.technicalSEO.headingStructure,
            'Meta Info': analysis.technicalSEO.metaInfo,
            'Alt Text': analysis.technicalSEO.altText,
            'Links': analysis.technicalSEO.links,
            'Schema Markup': analysis.technicalSEO.schemaMarkup,
            'Page Speed': analysis.technicalSEO.pageSpeed
          }}
        />

        {/* Content Quality */}
        <ScoreCard
          title="Content Quality"
          score={analysis.contentQuality.score}
          status={analysis.contentQuality.status}
          findings={analysis.contentQuality.findings}
          recommendations={analysis.contentQuality.recommendations.map(rec =>
            `${rec.priority === 'high' ? '🔴' : rec.priority === 'medium' ? '🟡' : '🟢'} ${rec.priority.toUpperCase()}: ${rec.text}`
          )}
          details={{
            'Long-tail Keywords': analysis.contentQuality.longTailKeywords,
            'Comprehensive Coverage': analysis.contentQuality.comprehensiveCoverage,
            'Relevance to User Intent': analysis.contentQuality.relevanceToUserIntent,
            'Accuracy and Currency': analysis.contentQuality.accuracyAndCurrency,
            'Natural Language': analysis.contentQuality.naturalLanguage
          }}
        />

        {/* Mobile Optimization */}
        <ScoreCard
          title="Mobile Optimization"
          score={analysis.mobileOptimization.score}
          status={analysis.mobileOptimization.status}
          findings={analysis.mobileOptimization.findings}
          recommendations={analysis.mobileOptimization.recommendations.map(rec =>
            `${rec.priority === 'high' ? '🔴' : rec.priority === 'medium' ? '🟡' : '🟢'} ${rec.priority.toUpperCase()}: ${rec.text}`
          )}
          details={{
            'Mobile Page Speed': analysis.mobileOptimization.mobilePageSpeed,
            'Touch Targets': analysis.mobileOptimization.touchTargets,
            'Viewport Configuration': analysis.mobileOptimization.viewportConfiguration,
            'Mobile Usability': analysis.mobileOptimization.mobileUsability,
            'Responsive Design': analysis.mobileOptimization.responsiveDesign
          }}
        />

        {/* Schema Analysis */}
        <ScoreCard
          title="Schema Analysis"
          score={analysis.schemaAnalysis.score}
          status={analysis.schemaAnalysis.status}
          findings={analysis.schemaAnalysis.findings}
          recommendations={analysis.schemaAnalysis.recommendations.map(rec =>
            `${rec.priority === 'high' ? '🔴' : rec.priority === 'medium' ? '🟡' : '🟢'} ${rec.priority.toUpperCase()}: ${rec.text}`
          )}
          details={{
            'Schema Presence': analysis.schemaAnalysis.schemaPresence,
            'Schema Validation': analysis.schemaAnalysis.schemaValidation,
            'Rich Snippet Potential': analysis.schemaAnalysis.richSnippetPotential,
            'Structured Data Completeness': analysis.schemaAnalysis.structuredDataCompleteness,
            'JSON-LD Implementation': analysis.schemaAnalysis.jsonLdImplementation
          }}
        />

        {/* Technical Crawlability */}
        <ScoreCard
          title="Technical Crawlability"
          score={analysis.technicalCrawlability.score}
          status={analysis.technicalCrawlability.status}
          findings={analysis.technicalCrawlability.findings}
          recommendations={analysis.technicalCrawlability.recommendations.map(rec =>
            `${rec.priority === 'high' ? '🔴' : rec.priority === 'medium' ? '🟡' : '🟢'} ${rec.priority.toUpperCase()}: ${rec.text}`
          )}
          details={{
            'Robots Access': analysis.technicalCrawlability.robotsAccess,
            'Bot Accessibility': analysis.technicalCrawlability.botAccessibility,
            'Content Delivery': analysis.technicalCrawlability.contentDelivery,
            'JavaScript Dependency': analysis.technicalCrawlability.javascriptDependency,
            'Load Speed': analysis.technicalCrawlability.loadSpeed
          }}
        />
      </div>

      {/* Performance Metrics from Free APIs */}
      {analysis.crawledContent.aiAnalysisData?.performanceMetrics && (
        <div style={{
          marginTop: '40px',
          padding: '25px',
          backgroundColor: '#f0fff0',
          borderRadius: '12px',
          border: '1px solid #90ee90'
        }}>
          <h3 style={{ color: '#228b22', marginBottom: '20px', fontWeight: 'bold', fontSize: '1.4rem' }}>⚡ Performance Analysis</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            {/* Core Web Vitals */}
            {analysis.crawledContent.aiAnalysisData.performanceMetrics.coreWebVitals && (
              <div style={{ padding: '15px', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #b3e6b3' }}>
                <h4 style={{ color: '#333' }}>🎯 Core Web Vitals</h4>
                <p style={{ color: '#333' }}><strong>Performance Score:</strong> {analysis.crawledContent.aiAnalysisData.performanceMetrics.coreWebVitals.score}/100</p>
                <p style={{ color: '#333' }}><strong>LCP:</strong> {analysis.crawledContent.aiAnalysisData.performanceMetrics.coreWebVitals.lcp}ms</p>
                <p style={{ color: '#333' }}><strong>FID:</strong> {analysis.crawledContent.aiAnalysisData.performanceMetrics.coreWebVitals.fid}ms</p>
                <p style={{ color: '#333' }}><strong>CLS:</strong> {analysis.crawledContent.aiAnalysisData.performanceMetrics.coreWebVitals.cls}</p>
                <p style={{ fontSize: '12px', color: '#333', fontStyle: 'italic' }}>
                  ✅ Real Core Web Vitals data from Google PageSpeed Insights API
                </p>
              </div>
            )}
            
            {/* HTML Validation */}
            {analysis.crawledContent.aiAnalysisData.performanceMetrics.htmlValidation && (
              <div style={{ padding: '15px', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #b3e6b3' }}>
                <h4 style={{ color: '#333' }}>✅ HTML Validation (W3C)</h4>
                <p style={{ color: '#333' }}><strong>Status:</strong> {analysis.crawledContent.aiAnalysisData.performanceMetrics.htmlValidation.isValid ? '✅ Valid' : '❌ Invalid'}</p>
                <p style={{ color: '#333' }}><strong>Errors:</strong> {analysis.crawledContent.aiAnalysisData.performanceMetrics.htmlValidation.errors}</p>
                <p style={{ color: '#333' }}><strong>Warnings:</strong> {analysis.crawledContent.aiAnalysisData.performanceMetrics.htmlValidation.warnings}</p>
                
                {/* HTML Validation Details */}
                <details style={{ marginTop: '10px' }}>
                  <summary style={{ 
                    cursor: 'pointer', 
                    fontWeight: 'bold', 
                    color: '#d32f2f',
                    fontSize: '13px',
                    padding: '5px 0'
                  }}>
                    🔍 View Validation Details ({analysis.crawledContent.aiAnalysisData.performanceMetrics.htmlValidation.errors} errors, {analysis.crawledContent.aiAnalysisData.performanceMetrics.htmlValidation.warnings} warnings)
                  </summary>
                  <div style={{ 
                    marginTop: '8px', 
                    padding: '10px', 
                    backgroundColor: '#fff5f5', 
                    borderRadius: '6px', 
                    border: '1px solid #fed7d7',
                    maxHeight: '200px',
                    overflowY: 'auto'
                  }}>
                    {analysis.crawledContent.aiAnalysisData.performanceMetrics.htmlValidation.messages.length > 0 ? (
                      <ul style={{ fontSize: '12px', margin: '0', paddingLeft: '15px' }}>
                        {analysis.crawledContent.aiAnalysisData.performanceMetrics.htmlValidation.messages.slice(0, 10).map((msg, idx) => (
                          <li key={idx} style={{ 
                            color: msg.type === 'error' ? '#d32f2f' : '#f57c00',
                            marginBottom: '5px',
                            lineHeight: '1.4'
                          }}>
                            <strong>{msg.type.toUpperCase()}:</strong> {msg.message}
                            {msg.line && <span style={{ color: '#666' }}> (Line {msg.line})</span>}
                          </li>
                        ))}
                        {analysis.crawledContent.aiAnalysisData.performanceMetrics.htmlValidation.messages.length > 10 && (
                          <li style={{ color: '#666', fontStyle: 'italic' }}>
                            ... and {analysis.crawledContent.aiAnalysisData.performanceMetrics.htmlValidation.messages.length - 10} more issues
                          </li>
                        )}
                      </ul>
                    ) : (
                      <p style={{ color: '#666', fontStyle: 'italic', margin: '0' }}>
                        No detailed validation messages available
                      </p>
                    )}
                  </div>
                </details>
              </div>
            )}
            
            {/* Accessibility Score */}
            {analysis.crawledContent.aiAnalysisData.performanceMetrics.accessibilityScore !== undefined && (
              <div style={{ padding: '15px', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #b3e6b3' }}>
                <h4 style={{ color: '#333' }}>♿ Accessibility Analysis</h4>
                <p style={{ color: '#333' }}><strong>Score:</strong> {analysis.crawledContent.aiAnalysisData.performanceMetrics.accessibilityScore}/100</p>
                <p style={{ fontSize: '12px', color: '#333' }}>
                  Based on alt text coverage, ARIA attributes, semantic HTML, and form labels
                </p>
              </div>
            )}
            
            {/* Overall Performance */}
            {analysis.crawledContent.aiAnalysisData.performanceMetrics.performanceScore !== undefined && (
              <div style={{ padding: '15px', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #b3e6b3' }}>
                <h4 style={{ color: '#333' }}>📊 Combined Performance</h4>
                <p style={{ color: '#333' }}><strong>Overall Score:</strong> {analysis.crawledContent.aiAnalysisData.performanceMetrics.performanceScore}/100</p>
                <p style={{ fontSize: '12px', color: '#333' }}>
                  Weighted: 40% Core Web Vitals, 30% HTML Validity, 30% Accessibility
                </p>
              </div>
            )}
          </div>
          
          <div style={{ marginTop: '20px', padding: '20px', backgroundColor: '#d4edda', borderRadius: '8px', border: '2px solid #28a745' }}>
            <h4 style={{ color: '#155724', fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '15px' }}>🆓 API Status & Information</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
              <div style={{ padding: '10px', backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid #c3e6cb' }}>
                <p style={{ fontSize: '14px', margin: '5px 0', color: '#155724' }}>
                  <strong>W3C HTML Validator:</strong> ✅ Free validation service (no signup required)
                </p>
              </div>
              <div style={{ padding: '10px', backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid #c3e6cb' }}>
                <p style={{ fontSize: '14px', margin: '5px 0', color: '#155724' }}>
                  <strong>Google PageSpeed Insights:</strong> ✅ Optional free API (25,000 requests/day)
                </p>
              </div>
            </div>
            <div style={{ marginTop: '15px', padding: '12px', backgroundColor: '#c3e6cb', borderRadius: '6px', border: '1px solid #28a745' }}>
              <p style={{ fontSize: '14px', color: '#155724', fontWeight: 'bold', margin: '0' }}>
                ✅ Google PageSpeed Insights API key is configured and providing real Core Web Vitals data.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Performance Metrics Not Available */}
      {!analysis.crawledContent.aiAnalysisData?.performanceMetrics && (
        <div style={{
          marginTop: '40px',
          padding: '25px',
          backgroundColor: '#fff3cd',
          borderRadius: '12px',
          border: '1px solid #ffeaa7'
        }}>
          <h3 style={{ color: '#856404', marginBottom: '20px' }}>⚠️ Performance Analysis</h3>
          <p style={{ color: '#856404', margin: '10px 0' }}>
            Performance metrics are being loaded or are temporarily unavailable.
          </p>
          <p style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
            This may be due to API rate limits or temporary service issues. The analysis will continue with pattern-based scoring.
          </p>
        </div>
      )}

      {/* Page Content (Markdown) */}
      {analysis.crawledContent.markdownContent && (
        <div style={{ 
          marginTop: '40px',
          background: 'var(--content-bg)',
          borderRadius: '12px',
          padding: '40px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}>
          <details style={{ cursor: 'pointer' }}>
            <summary style={{ 
              fontSize: '2rem', 
              fontWeight: '700', 
              color: 'var(--content-text)', 
              margin: '0 0 20px 0',
              listStyle: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <span style={{ 
                transform: 'rotate(0deg)',
                transition: 'transform 0.2s ease',
                fontSize: '1.2rem'
              }}>
                ▶️
              </span>
              Page Content Structure (Markdown)
            </summary>
            
            {/* Copy and Download Buttons */}
            <div style={{
              display: 'flex',
              gap: '10px',
              marginBottom: '20px'
            }}>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(analysis.crawledContent.markdownContent || '');
                  // You could add a toast notification here
                }}
                style={{
                  background: 'var(--orange-accent)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#e65100'}
                onMouseOut={(e) => e.currentTarget.style.background = 'var(--orange-accent)'}
              >
                📋 Copy Markdown
              </button>
              
              <button
                onClick={() => {
                  const blob = new Blob([analysis.crawledContent.markdownContent || ''], { type: 'text/markdown' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `page-markdown-${analysis.url.replace(/[^a-z0-9]/gi, '-')}-${new Date().toISOString().split('T')[0]}.md`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                }}
                style={{
                  background: 'var(--info-blue)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#1976d2'}
                onMouseOut={(e) => e.currentTarget.style.background = 'var(--info-blue)'}
              >
                💾 Download Markdown
              </button>
            </div>
            <div style={{
              marginTop: '20px',
              background: '#1e1e1e',
              borderRadius: '8px',
              padding: '20px',
              overflow: 'auto',
              maxHeight: '400px',
              border: '1px solid var(--border-gray)'
            }}>
              <pre style={{
                margin: 0,
                color: '#d4d4d4',
                fontSize: '14px',
                lineHeight: '1.5',
                fontFamily: '"Fira Code", "Monaco", "Menlo", "Ubuntu Mono", monospace',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }}>
                <code>{analysis.crawledContent.markdownContent}</code>
              </pre>
            </div>
            <div style={{
              marginTop: '15px',
              padding: '12px',
              background: 'rgba(59, 130, 246, 0.1)',
              borderRadius: '6px',
              border: '1px solid rgba(59, 130, 246, 0.2)'
            }}>
              <p style={{
                margin: 0,
                fontSize: '0.9rem',
                color: 'var(--secondary-content)',
                lineHeight: '1.4'
              }}>
                💡 <strong>Pro Tip:</strong> This markdown representation shows how AI systems might parse and understand your content structure. 
                Well-organized content with clear headings and logical flow helps AI models provide better answers about your page.
              </p>
            </div>
          </details>
          
          <style jsx>{`
            details[open] summary span {
              transform: rotate(90deg);
            }
          `}</style>
        </div>
      )}

      {/* Content Improvements */}
      {analysis.contentImprovements.length > 0 && (
        <div style={{ 
          marginTop: '40px',
          background: 'var(--content-bg)',
          borderRadius: '12px',
          padding: '40px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--content-text)', margin: '0 0 30px 0' }}>
            Priority Content Improvements
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
            {analysis.contentImprovements.map((improvement, index) => (
              <div key={index} style={{ 
                border: '1px solid var(--border-gray)', 
                borderRadius: '12px', 
                padding: '25px' 
              }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                  <div style={{ 
                    width: '32px', 
                    height: '32px', 
                    background: 'var(--orange-accent)', 
                    color: 'var(--white)', 
                    borderRadius: '50%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    fontWeight: '700', 
                    fontSize: '0.9rem',
                    marginRight: '15px'
                  }}>
                    {index + 1}
                  </div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: 'var(--content-text)', margin: 0 }}>
                    {improvement.section}
                  </h3>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                  <div>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--content-text)', margin: '0 0 10px 0' }}>
                      Current Issue:
                    </h4>
                    <p style={{ 
                      fontSize: '0.9rem', 
                      color: 'var(--content-text)', 
                      background: 'rgba(231, 76, 60, 0.1)', 
                      padding: '15px', 
                      borderRadius: '8px', 
                      borderLeft: '4px solid var(--error-red)',
                      margin: 0
                    }}>
                      {improvement.current}
                    </p>
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--content-text)', margin: '0 0 10px 0' }}>
                      Recommended Action:
                    </h4>
                    <p style={{ 
                      fontSize: '0.9rem', 
                      color: 'var(--content-text)', 
                      background: 'rgba(39, 174, 96, 0.1)', 
                      padding: '15px', 
                      borderRadius: '8px', 
                      borderLeft: '4px solid var(--success-green)',
                      margin: 0
                    }}>
                      {improvement.improved}
                    </p>
                  </div>
                </div>
                <div style={{ marginTop: '20px' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--content-text)', margin: '0 0 10px 0' }}>
                    Why This Helps:
                  </h4>
                  <p style={{ fontSize: '0.9rem', color: 'var(--secondary-content)', margin: 0 }}>
                    {improvement.reasoning}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Next Steps */}
      <div style={{ 
        marginTop: '40px',
        background: 'linear-gradient(135deg, rgba(52, 152, 219, 0.15) 0%, rgba(52, 152, 219, 0.08) 100%)',
        borderRadius: '16px',
        padding: '40px',
        border: '2px solid rgba(52, 152, 219, 0.3)',
        boxShadow: '0 8px 32px rgba(52, 152, 219, 0.15)'
      }}>
        <h2 style={{ 
          fontSize: '2.2rem', 
          fontWeight: '800', 
          color: 'var(--content-text)', 
          margin: '0 0 30px 0',
          textAlign: 'center',
          background: 'linear-gradient(135deg, var(--info-blue) 0%, #2980b9 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          Next Steps
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '40px' }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '12px',
            padding: '30px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            border: '1px solid rgba(52, 152, 219, 0.2)'
          }}>
            <h3 style={{ 
              fontSize: '1.4rem', 
              fontWeight: '700', 
              color: 'var(--content-text)', 
              margin: '0 0 20px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <span style={{
                background: 'var(--info-blue)',
                color: 'white',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1rem',
                fontWeight: '600'
              }}>
                ⚡
              </span>
              Immediate Actions
            </h3>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
              <li style={{ 
                display: 'flex', 
                alignItems: 'flex-start', 
                marginBottom: '16px', 
                fontSize: '1rem', 
                color: 'var(--content-text)',
                lineHeight: '1.6'
              }}>
                <span style={{ 
                  color: 'var(--info-blue)', 
                  marginRight: '15px', 
                  fontWeight: '700',
                  fontSize: '1.1rem',
                  minWidth: '25px'
                }}>1.</span>
                <span style={{ fontWeight: '500' }}>
                  Focus on AI Optimization improvements first - this has the highest impact
                </span>
              </li>
              <li style={{ 
                display: 'flex', 
                alignItems: 'flex-start', 
                marginBottom: '16px', 
                fontSize: '1rem', 
                color: 'var(--content-text)',
                lineHeight: '1.6'
              }}>
                <span style={{ 
                  color: 'var(--info-blue)', 
                  marginRight: '15px', 
                  fontWeight: '700',
                  fontSize: '1.1rem',
                  minWidth: '25px'
                }}>2.</span>
                <span style={{ fontWeight: '500' }}>
                  Implement the priority content improvements listed above
                </span>
              </li>
              <li style={{ 
                display: 'flex', 
                alignItems: 'flex-start', 
                marginBottom: '16px', 
                fontSize: '1rem', 
                color: 'var(--content-text)',
                lineHeight: '1.6'
              }}>
                <span style={{ 
                  color: 'var(--info-blue)', 
                  marginRight: '15px', 
                  fontWeight: '700',
                  fontSize: '1.1rem',
                  minWidth: '25px'
                }}>3.</span>
                <span style={{ fontWeight: '500' }}>
                  Address technical SEO issues for better search visibility
                </span>
              </li>
            </ul>
          </div>
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '12px',
            padding: '30px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            border: '1px solid rgba(52, 152, 219, 0.2)'
          }}>
            <h3 style={{ 
              fontSize: '1.4rem', 
              fontWeight: '700', 
              color: 'var(--content-text)', 
              margin: '0 0 20px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <span style={{
                background: 'var(--success-green)',
                color: 'white',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1rem',
                fontWeight: '600'
              }}>
                📈
              </span>
              Long-term Strategy
            </h3>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
              <li style={{ 
                display: 'flex', 
                alignItems: 'flex-start', 
                marginBottom: '16px', 
                fontSize: '1rem', 
                color: 'var(--content-text)',
                lineHeight: '1.6'
              }}>
                <span style={{ 
                  color: 'var(--success-green)', 
                  marginRight: '15px', 
                  fontWeight: '700',
                  fontSize: '1.1rem',
                  minWidth: '25px'
                }}>1.</span>
                <span style={{ fontWeight: '500' }}>
                  Monitor your progress with regular re-analysis
                </span>
              </li>
              <li style={{ 
                display: 'flex', 
                alignItems: 'flex-start', 
                marginBottom: '16px', 
                fontSize: '1rem', 
                color: 'var(--content-text)',
                lineHeight: '1.6'
              }}>
                <span style={{ 
                  color: 'var(--success-green)', 
                  marginRight: '15px', 
                  fontWeight: '700',
                  fontSize: '1.1rem',
                  minWidth: '25px'
                }}>2.</span>
                <span style={{ fontWeight: '500' }}>
                  Stay updated with AI search algorithm changes
                </span>
              </li>
              <li style={{ 
                display: 'flex', 
                alignItems: 'flex-start', 
                marginBottom: '16px', 
                fontSize: '1rem', 
                color: 'var(--content-text)',
                lineHeight: '1.6'
              }}>
                <span style={{ 
                  color: 'var(--success-green)', 
                  marginRight: '15px', 
                  fontWeight: '700',
                  fontSize: '1.1rem',
                  minWidth: '25px'
                }}>3.</span>
                <span style={{ fontWeight: '500' }}>
                  Continuously improve content based on user feedback
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 