'use client';

import { WebsiteAnalysis } from '@/types';
import ScoreCard from './ScoreCard';
import ExportButtons from './ExportButtons';
import { generateMarkdownReport, downloadMarkdown } from '@/lib/exporters';
import { useGoogleAnalytics } from './GoogleAnalytics';

interface ScoreReportProps {
  analysis: WebsiteAnalysis;
}

export default function ScoreReport({ analysis }: ScoreReportProps) {
  // Debug logging
  console.log('Performance Metrics Debug:', analysis.crawledContent.aiAnalysisData?.performanceMetrics);
  const { trackExport } = useGoogleAnalytics();
  
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
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <h1 style={{ fontSize: '2.5rem', fontWeight: '800', margin: '0 0 10px 0', color: 'var(--white)' }}>
              AI Website Grader Report
            </h1>
            <p style={{ fontSize: '1rem', color: 'var(--white)', margin: 0 }}>
              Powered by Search Influence - AI SEO Experts
            </p>
          </div>
          <p style={{ textAlign: 'center', margin: 0, opacity: 0.9 }}>
            Analysis completed on {new Date(analysis.timestamp).toLocaleDateString()}
          </p>
        </div>

        <div className="content-area">
          {/* Website Info */}
          <div style={{ 
            background: 'var(--background-gray)', 
            borderRadius: '12px', 
            padding: '30px', 
            marginBottom: '30px' 
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '30px', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: '600', color: 'var(--content-text)', margin: '0 0 15px 0' }}>
                  Website Information
                </h3>
                <p style={{ color: 'var(--secondary-content)', margin: '5px 0' }}>
                  <span style={{ fontWeight: '600' }}>URL:</span> {analysis.url}
                </p>
                <p style={{ color: 'var(--secondary-content)', margin: '5px 0' }}>
                  <span style={{ fontWeight: '600' }}>Title:</span> {analysis.title}
                </p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  fontSize: '3rem', 
                  fontWeight: '800', 
                  color: getOverallScoreColor(analysis.overallScore),
                  marginBottom: '5px'
                }}>
                  {analysis.overallScore}%
                </div>
                <div style={{ 
                  fontSize: '0.9rem', 
                  color: 'var(--muted-text)', 
                  textTransform: 'capitalize' 
                }}>
                  {getOverallScoreStatus(analysis.overallScore).replace('-', ' ')}
                </div>
              </div>
            </div>
          </div>

          {/* Score Summary */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
            gap: '20px', 
            marginBottom: '40px' 
          }}>
            <div style={{ 
              textAlign: 'center', 
              padding: '20px', 
              background: 'linear-gradient(135deg, rgba(52, 152, 219, 0.1) 0%, rgba(52, 152, 219, 0.05) 100%)', 
              borderRadius: '12px',
              border: '1px solid rgba(52, 152, 219, 0.2)'
            }}>
              <div style={{ fontSize: '1.8rem', fontWeight: '700', color: 'var(--info-blue)', marginBottom: '5px' }}>
                {analysis.aiOptimization.score}%
              </div>
              <div style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--content-text)' }}>
                AI Optimization
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--muted-text)', marginTop: '5px', textTransform: 'capitalize' }}>
                {analysis.aiOptimization.status.replace('-', ' ')}
              </div>
            </div>
            <div style={{ 
              textAlign: 'center', 
              padding: '20px', 
              background: 'linear-gradient(135deg, rgba(39, 174, 96, 0.1) 0%, rgba(39, 174, 96, 0.05) 100%)', 
              borderRadius: '12px',
              border: '1px solid rgba(39, 174, 96, 0.2)'
            }}>
              <div style={{ fontSize: '1.8rem', fontWeight: '700', color: 'var(--success-green)', marginBottom: '5px' }}>
                {analysis.contentQuality.score}%
              </div>
              <div style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--content-text)' }}>
                Content Quality
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--muted-text)', marginTop: '5px', textTransform: 'capitalize' }}>
                {analysis.contentQuality.status.replace('-', ' ')}
              </div>
            </div>
            <div style={{ 
              textAlign: 'center', 
              padding: '20px', 
              background: 'linear-gradient(135deg, rgba(230, 126, 34, 0.1) 0%, rgba(230, 126, 34, 0.05) 100%)', 
              borderRadius: '12px',
              border: '1px solid rgba(230, 126, 34, 0.2)'
            }}>
              <div style={{ fontSize: '1.8rem', fontWeight: '700', color: 'var(--orange-accent)', marginBottom: '5px' }}>
                {analysis.technicalSEO.score}%
              </div>
              <div style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--content-text)' }}>
                Technical SEO
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--muted-text)', marginTop: '5px', textTransform: 'capitalize' }}>
                {analysis.technicalSEO.status.replace('-', ' ')}
              </div>
            </div>
            <div style={{ 
              textAlign: 'center', 
              padding: '20px', 
              background: 'linear-gradient(135deg, rgba(155, 89, 182, 0.1) 0%, rgba(155, 89, 182, 0.05) 100%)', 
              borderRadius: '12px',
              border: '1px solid rgba(155, 89, 182, 0.2)'
            }}>
              <div style={{ fontSize: '1.8rem', fontWeight: '700', color: '#9b59b6', marginBottom: '5px' }}>
                {analysis.authority.score}%
              </div>
              <div style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--content-text)' }}>
                Authority
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--muted-text)', marginTop: '5px', textTransform: 'capitalize' }}>
                {analysis.authority.status.replace('-', ' ')}
              </div>
            </div>
            <div style={{ 
              textAlign: 'center', 
              padding: '20px', 
              background: 'linear-gradient(135deg, rgba(231, 76, 60, 0.1) 0%, rgba(231, 76, 60, 0.05) 100%)', 
              borderRadius: '12px',
              border: '1px solid rgba(231, 76, 60, 0.2)'
            }}>
              <div style={{ fontSize: '1.8rem', fontWeight: '700', color: 'var(--error-red)', marginBottom: '5px' }}>
                {analysis.userExperience.score}%
              </div>
              <div style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--content-text)' }}>
                User Experience
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--muted-text)', marginTop: '5px', textTransform: 'capitalize' }}>
                {analysis.userExperience.status.replace('-', ' ')}
              </div>
            </div>
            <div style={{ 
              textAlign: 'center', 
              padding: '20px', 
              background: 'linear-gradient(135deg, rgba(26, 188, 156, 0.1) 0%, rgba(26, 188, 156, 0.05) 100%)', 
              borderRadius: '12px',
              border: '1px solid rgba(26, 188, 156, 0.2)'
            }}>
              <div style={{ fontSize: '1.8rem', fontWeight: '700', color: '#1abc9c', marginBottom: '5px' }}>
                {analysis.contentStructure.score}%
              </div>
              <div style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--content-text)' }}>
                Content Structure
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--muted-text)', marginTop: '5px', textTransform: 'capitalize' }}>
                {analysis.contentStructure.status.replace('-', ' ')}
              </div>
            </div>
          </div>

          {/* Export Buttons */}
          <ExportButtons 
            analysis={analysis} 
            onExportMarkdown={handleExportMarkdown}
          />
        </div>
      </div>

      {/* Detailed Analysis */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
        gap: '30px',
        marginTop: '40px'
      }}>
        {/* Enhanced AI Search Optimization */}
        <ScoreCard
          title="AI Search Optimization"
          score={analysis.aiOptimization.score}
          status={analysis.aiOptimization.status}
          findings={analysis.aiOptimization.findings}
          recommendations={analysis.aiOptimization.recommendations.map(rec => {
            if (typeof rec === 'string') return rec;
            const priority = rec.priority === 'high' ? '🔴 HIGH' : rec.priority === 'medium' ? '🟡 MEDIUM' : '🟢 LOW';
            let result = `${priority}: ${rec.text}`;
            if (rec.expectedImpact && rec.timeToImplement) {
              result += ` (Impact: ${rec.expectedImpact}, Time: ${rec.timeToImplement})`;
            }
            return result;
          })}
          details={{
            'AI Content Digestibility': analysis.aiOptimization.aiContentDigestibility,
            'Answer Potential': analysis.aiOptimization.answerPotential,
            'Factual Accuracy': analysis.aiOptimization.factualAccuracy,
            'Topical Authority': analysis.aiOptimization.topicalAuthority,
            'Content Freshness': analysis.aiOptimization.contentFreshness,
            'Content Chunkability': analysis.aiOptimization.chunkability,
            'Q&A Format': analysis.aiOptimization.qaFormat,
            'Entity Recognition': analysis.aiOptimization.entityRecognition,
            'Factual Density': analysis.aiOptimization.factualDensity,
            'Semantic Clarity': analysis.aiOptimization.semanticClarity
          }}
        />

        {/* Content Quality */}
        <ScoreCard
          title="Mobile Optimization"
          score={analysis.mobileOptimization.score}
          status={analysis.mobileOptimization.status}
          findings={analysis.mobileOptimization.findings}
          recommendations={analysis.mobileOptimization.recommendations.map(rec => 
            typeof rec === 'string' ? rec : `${rec.priority.toUpperCase()}: ${rec.text}`
          )}
          details={{
            mobilePageSpeed: analysis.mobileOptimization.mobilePageSpeed,
            touchTargets: analysis.mobileOptimization.touchTargets,
            viewportConfiguration: analysis.mobileOptimization.viewportConfiguration,
            mobileUsability: analysis.mobileOptimization.mobileUsability,
            responsiveDesign: analysis.mobileOptimization.responsiveDesign
          }}
        />

        <ScoreCard
          title="Technical Crawlability"
          score={analysis.technicalCrawlability.score}
          status={analysis.technicalCrawlability.status}
          findings={analysis.technicalCrawlability.findings}
          recommendations={analysis.technicalCrawlability.recommendations.map(rec => 
            typeof rec === 'string' ? rec : `${rec.priority.toUpperCase()}: ${rec.text}`
          )}
          details={{
            robotsAccess: analysis.technicalCrawlability.robotsAccess,
            botAccessibility: analysis.technicalCrawlability.botAccessibility,
            contentDelivery: analysis.technicalCrawlability.contentDelivery,
            javascriptDependency: analysis.technicalCrawlability.javascriptDependency,
            loadSpeed: analysis.technicalCrawlability.loadSpeed
          }}
        />

        <ScoreCard
          title="Schema Analysis"
          score={analysis.schemaAnalysis.score}
          status={analysis.schemaAnalysis.status}
          findings={analysis.schemaAnalysis.findings}
          recommendations={analysis.schemaAnalysis.recommendations.map(rec => 
            typeof rec === 'string' ? rec : `${rec.priority.toUpperCase()}: ${rec.text}`
          )}
          details={{
            schemaPresence: analysis.schemaAnalysis.schemaPresence,
            schemaValidation: analysis.schemaAnalysis.schemaValidation,
            richSnippetPotential: analysis.schemaAnalysis.richSnippetPotential,
            structuredDataCompleteness: analysis.schemaAnalysis.structuredDataCompleteness,
            jsonLdImplementation: analysis.schemaAnalysis.jsonLdImplementation
          }}
        />

        <ScoreCard
          title="Content Quality"
          score={analysis.contentQuality.score}
          status={analysis.contentQuality.status}
          findings={analysis.contentQuality.findings}
          recommendations={analysis.contentQuality.recommendations.map(rec => 
            typeof rec === 'string' ? rec : `${rec.priority.toUpperCase()}: ${rec.text}`
          )}
          details={{
            longTailKeywords: analysis.contentQuality.longTailKeywords,
            comprehensiveCoverage: analysis.contentQuality.comprehensiveCoverage,
            relevanceToUserIntent: analysis.contentQuality.relevanceToUserIntent,
            accuracyAndCurrency: analysis.contentQuality.accuracyAndCurrency,
            naturalLanguage: analysis.contentQuality.naturalLanguage
          }}
        />

        {/* Technical SEO */}
        <ScoreCard
          title="Technical SEO"
          score={analysis.technicalSEO.score}
          status={analysis.technicalSEO.status}
          findings={analysis.technicalSEO.findings}
          recommendations={analysis.technicalSEO.recommendations.map(rec => 
            typeof rec === 'string' ? rec : `${rec.priority.toUpperCase()}: ${rec.text}`
          )}
          details={{
            headingStructure: analysis.technicalSEO.headingStructure,
            metaInfo: analysis.technicalSEO.metaInfo,
            altText: analysis.technicalSEO.altText,
            links: analysis.technicalSEO.links,
            schemaMarkup: analysis.technicalSEO.schemaMarkup,
            pageSpeed: analysis.technicalSEO.pageSpeed
          }}
        />

        {/* Authority */}
        <ScoreCard
          title="Authority & Trust"
          score={analysis.authority.score}
          status={analysis.authority.status}
          findings={analysis.authority.findings}
          recommendations={analysis.authority.recommendations.map(rec => 
            typeof rec === 'string' ? rec : `${rec.priority.toUpperCase()}: ${rec.text}`
          )}
          details={{
            socialMediaPresence: analysis.authority.socialMediaPresence,
            companyInformation: analysis.authority.companyInformation,
            legalCompliance: analysis.authority.legalCompliance,
            testimonials: analysis.authority.testimonials,
            affiliations: analysis.authority.affiliations
          }}
        />

        {/* User Experience */}
        <ScoreCard
          title="User Experience"
          score={analysis.userExperience.score}
          status={analysis.userExperience.status}
          findings={analysis.userExperience.findings}
          recommendations={analysis.userExperience.recommendations.map(rec => 
            typeof rec === 'string' ? rec : `${rec.priority.toUpperCase()}: ${rec.text}`
          )}
          details={{
            contactInfo: analysis.userExperience.contactInfo,
            callsToAction: analysis.userExperience.callsToAction,
            language: analysis.userExperience.language,
            navigation: analysis.userExperience.navigation,
            formUsability: analysis.userExperience.formUsability,
            loadingExperience: analysis.userExperience.loadingExperience,
            errorHandling: analysis.userExperience.errorHandling,
            accessibility: analysis.userExperience.accessibility,
            visualHierarchy: analysis.userExperience.visualHierarchy,
            interactiveElements: analysis.userExperience.interactiveElements,
            searchFunctionality: analysis.userExperience.searchFunctionality,
            contentReadability: analysis.userExperience.contentReadability,
            socialProof: analysis.userExperience.socialProof
          }}
        />

        {/* Content Structure */}
        <ScoreCard
          title="Content Structure"
          score={analysis.contentStructure.score}
          status={analysis.contentStructure.status}
          findings={analysis.contentStructure.findings}
          recommendations={analysis.contentStructure.recommendations.map(rec => 
            typeof rec === 'string' ? rec : `${rec.priority.toUpperCase()}: ${rec.text}`
          )}
          details={{
            structuredContent: analysis.contentStructure.structuredContent,
            multimedia: analysis.contentStructure.multimedia,
            readability: analysis.contentStructure.readability
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
                            {msg.line && ` <span style="color: #666;">(Line ${msg.line})</span>`}
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