'use client';

import { useState } from 'react';
import { FileText, FileDown, Loader2, Printer } from 'lucide-react';
import { WebsiteAnalysis } from '@/types';
import { generatePDFReport, generateMarkdownReport } from '@/lib/exporters';
import { useGoogleTagManager } from '@/hooks/useGoogleTagManager';

interface ExportButtonsProps {
  analysis: WebsiteAnalysis;
  onExportMarkdown: () => void;
}

export default function ExportButtons({ analysis, onExportMarkdown }: ExportButtonsProps) {
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const { trackExport } = useGoogleTagManager();

  const handleExportPDF = async () => {
    setIsExportingPDF(true);
    try {
      console.log('Starting PDF export...');
      
      // Track PDF export
      trackExport('pdf');
      
      // Check if the report container exists
      const reportContainer = document.getElementById('report-container');
      if (!reportContainer) {
        throw new Error('Report container not found. Please ensure the analysis is complete.');
      }
      
      console.log('Report container found, waiting for render...');
      
      // Add a small delay to ensure the report is fully rendered
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Calling generatePDFReport...');
      await generatePDFReport(analysis);
      
      console.log('PDF export completed successfully');
    } catch (error) {
      console.error('PDF export failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Failed to generate PDF: ${errorMessage}`);
    } finally {
      setIsExportingPDF(false);
    }
  };

  const handlePrint = () => {
    // Track print export
    trackExport('print');
    
    // Create a print-friendly version of the report using markdown content
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to print the report');
      return;
    }

    // Generate markdown content
    generateMarkdownReport(analysis);
    
    // Helper function to round numbers
    const round = (num: number) => Math.round(num * 100) / 100;
    
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>AI Website Grader Report - ${analysis.title}</title>
        <style>
          body { 
            font-family: 'Courier New', monospace; 
            line-height: 1.6; 
            margin: 20px; 
            color: #333;
            font-size: 12px;
          }
          h1 { 
            color: #000; 
            border-bottom: 2px solid #000; 
            padding-bottom: 5px; 
            font-size: 18px;
            margin-top: 0;
          }
          h2 { 
            color: #000; 
            margin-top: 20px; 
            font-size: 16px;
            border-bottom: 1px solid #000;
            padding-bottom: 3px;
          }
          h3 { 
            color: #000; 
            margin-top: 15px; 
            font-size: 14px;
            font-weight: bold;
          }
          table { 
            border-collapse: collapse; 
            width: 100%; 
            margin: 15px 0; 
            font-size: 11px;
          }
          th, td { 
            border: 1px solid #000; 
            padding: 8px; 
            text-align: left; 
          }
          th { 
            background-color: #f0f0f0; 
            font-weight: bold; 
          }
          .score { 
            font-weight: bold; 
          }
          .status { 
            text-transform: capitalize; 
          }
          .section { 
            margin-bottom: 20px; 
          }
          .findings, .recommendations { 
            margin: 10px 0; 
          }
          .detailed-scores { 
            margin: 10px 0; 
          }
          .detailed-scores ul { 
            list-style: none; 
            padding-left: 0; 
          }
          .detailed-scores li { 
            margin: 3px 0; 
          }
          .improvements { 
            margin: 15px 0; 
          }
          .improvement-item { 
            border: 1px solid #000; 
            padding: 10px; 
            margin: 10px 0; 
          }
          .current { 
            background-color: #fff3cd; 
            border-left: 3px solid #ffc107; 
            padding: 8px; 
            margin: 8px 0; 
          }
          .improved { 
            background-color: #d4edda; 
            border-left: 3px solid #28a745; 
            padding: 8px; 
            margin: 8px 0; 
          }
          .reasoning { 
            background-color: #e2e3e5; 
            border-left: 3px solid #6c757d; 
            padding: 8px; 
            margin: 8px 0; 
          }
          .footer { 
            margin-top: 30px; 
            padding-top: 20px; 
            border-top: 1px solid #000; 
            font-size: 10px; 
            color: #666; 
          }
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <h1>AI Website Grader Report</h1>
        <p><strong>Powered by Search Influence - AI SEO Experts</strong></p>
        
        <div class="section">
          <h2>Website Information</h2>
          <p><strong>Website:</strong> ${analysis.url}</p>
          <p><strong>Title:</strong> ${analysis.title}</p>
          <p><strong>Generated:</strong> ${new Date(analysis.timestamp).toLocaleDateString()}</p>
          <p><strong>Overall Score:</strong> <span class="score">${round(analysis.overallScore)}%</span></p>
        </div>
        
        <div class="section">
          <h2>Executive Summary</h2>
          <p>This report analyzes your website's readiness for AI-powered search engines, chat interfaces, and modern search algorithms. The analysis focuses on factors that influence visibility in AI overviews, voice search results, and chatbot responses. Powered by Search Influence - AI SEO Experts.</p>
        </div>
        
        <div class="section">
          <h2>Score Breakdown</h2>
          <table>
            <thead>
              <tr>
                <th>Category</th>
                <th>Score</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>AI Optimization</strong></td>
                <td class="score">${round(analysis.aiOptimization.score)}%</td>
                <td class="status">${analysis.aiOptimization.status}</td>
              </tr>
              <tr>
                <td><strong>Content Quality</strong></td>
                <td class="score">${round(analysis.contentQuality.score)}%</td>
                <td class="status">${analysis.contentQuality.status}</td>
              </tr>
              <tr>
                <td><strong>Technical SEO</strong></td>
                <td class="score">${round(analysis.technicalSEO.score)}%</td>
                <td class="status">${analysis.technicalSEO.status}</td>
              </tr>
              <tr>
                <td><strong>E-E-A-T Signals</strong></td>
                <td class="score">${round(analysis.eeatSignals.score)}%</td>
                <td class="status">${analysis.eeatSignals.status}</td>
              </tr>
              <tr>
                <td><strong>Mobile Optimization</strong></td>
                <td class="score">${round(analysis.mobileOptimization.score)}%</td>
                <td class="status">${analysis.mobileOptimization.status}</td>
              </tr>
              <tr>
                <td><strong>Schema Analysis</strong></td>
                <td class="score">${round(analysis.schemaAnalysis.score)}%</td>
                <td class="status">${analysis.schemaAnalysis.status}</td>
              </tr>
              <tr>
                <td><strong>Technical Crawlability</strong></td>
                <td class="score">${round(analysis.technicalCrawlability.score)}%</td>
                <td class="status">${analysis.technicalCrawlability.status}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="section">
          <h2>AI Optimization (${round(analysis.aiOptimization.score)}%)</h2>
          <p><em>Optimized for AI search engines by Search Influence - AI SEO Experts</em></p>
          
          <div class="findings">
            <h3>Key Findings:</h3>
            <ul>
              ${analysis.aiOptimization.findings.map(finding => `<li>${finding}</li>`).join('')}
            </ul>
          </div>
          
          <div class="recommendations">
            <h3>Recommendations:</h3>
            <ul>
              ${analysis.aiOptimization.recommendations.map(rec => `<li>${rec}</li>`).join('')}
            </ul>
          </div>
          
          <div class="detailed-scores">
            <h3>Detailed Scores:</h3>
            <ul>
              <li><strong>Chunkability:</strong> ${round(analysis.aiOptimization.chunkability)}%</li>
              <li><strong>Q&A Format:</strong> ${round(analysis.aiOptimization.qaFormat)}%</li>
              <li><strong>Entity Recognition:</strong> ${round(analysis.aiOptimization.entityRecognition)}%</li>
              <li><strong>Factual Density:</strong> ${round(analysis.aiOptimization.factualDensity)}%</li>
              <li><strong>Semantic Clarity:</strong> ${round(analysis.aiOptimization.semanticClarity)}%</li>
            </ul>
          </div>
        </div>
        
        <div class="section">
          <h2>Content Quality (${round(analysis.contentQuality.score)}%)</h2>
          <p><em>Content optimization powered by Search Influence - AI SEO Experts</em></p>
          
          <div class="findings">
            <h3>Key Findings:</h3>
            <ul>
              ${analysis.contentQuality.findings.map(finding => `<li>${finding}</li>`).join('')}
            </ul>
          </div>
          
          <div class="recommendations">
            <h3>Recommendations:</h3>
            <ul>
              ${analysis.contentQuality.recommendations.map(rec => `<li>${rec}</li>`).join('')}
            </ul>
          </div>
          
          <div class="detailed-scores">
            <h3>Detailed Scores:</h3>
            <ul>
              <li><strong>Long-tail Keywords:</strong> ${round(analysis.contentQuality.longTailKeywords)}%</li>
              <li><strong>Comprehensive Coverage:</strong> ${round(analysis.contentQuality.comprehensiveCoverage)}%</li>
              <li><strong>Relevance to User Intent:</strong> ${round(analysis.contentQuality.relevanceToUserIntent)}%</li>
              <li><strong>Accuracy and Currency:</strong> ${round(analysis.contentQuality.accuracyAndCurrency)}%</li>
              <li><strong>Natural Language:</strong> ${round(analysis.contentQuality.naturalLanguage)}%</li>
            </ul>
          </div>
        </div>
        
        <div class="section">
          <h2>Technical SEO (${round(analysis.technicalSEO.score)}%)</h2>
          <p><em>Technical optimization by Search Influence - AI SEO Experts</em></p>
          
          <div class="findings">
            <h3>Key Findings:</h3>
            <ul>
              ${analysis.technicalSEO.findings.map(finding => `<li>${finding}</li>`).join('')}
            </ul>
          </div>
          
          <div class="recommendations">
            <h3>Recommendations:</h3>
            <ul>
              ${analysis.technicalSEO.recommendations.map(rec => `<li>${rec}</li>`).join('')}
            </ul>
          </div>
          
          <div class="detailed-scores">
            <h3>Detailed Scores:</h3>
            <ul>
              <li><strong>Heading Structure:</strong> ${round(analysis.technicalSEO.headingStructure)}%</li>
              <li><strong>Meta Info:</strong> ${round(analysis.technicalSEO.metaInfo)}%</li>
              <li><strong>Alt Text:</strong> ${round(analysis.technicalSEO.altText)}%</li>
              <li><strong>Links:</strong> ${round(analysis.technicalSEO.links)}%</li>
            </ul>
          </div>
        </div>
        
        <div class="section">
          <h2>E-E-A-T Signals (${round(analysis.eeatSignals.score)}%)</h2>
          <p><em>Expertise, Experience, Authoritativeness, Trustworthiness by Search Influence - AI SEO Experts</em></p>
          
          <div class="findings">
            <h3>Key Findings:</h3>
            <ul>
              ${analysis.eeatSignals.findings.map(finding => `<li>${finding}</li>`).join('')}
            </ul>
          </div>
          
          <div class="recommendations">
            <h3>Recommendations:</h3>
            <ul>
              ${analysis.eeatSignals.recommendations.map(rec => `<li>${rec}</li>`).join('')}
            </ul>
          </div>
          
          <div class="detailed-scores">
            <h3>Detailed Scores:</h3>
            <ul>
              <li><strong>Expertise & Experience:</strong> ${round(analysis.eeatSignals.expertiseExperience)}%</li>
              <li><strong>Authoritativeness:</strong> ${round(analysis.eeatSignals.authoritativeness)}%</li>
              <li><strong>Trustworthiness:</strong> ${round(analysis.eeatSignals.trustworthiness)}%</li>
            </ul>
          </div>
        </div>

        <div class="section">
          <h2>Mobile Optimization (${round(analysis.mobileOptimization.score)}%)</h2>
          <p><em>Mobile-first optimization by Search Influence - AI SEO Experts</em></p>

          <div class="findings">
            <h3>Key Findings:</h3>
            <ul>
              ${analysis.mobileOptimization.findings.map(finding => `<li>${finding}</li>`).join('')}
            </ul>
          </div>

          <div class="recommendations">
            <h3>Recommendations:</h3>
            <ul>
              ${analysis.mobileOptimization.recommendations.map(rec => `<li>${rec.text ? rec.text : rec}</li>`).join('')}
            </ul>
          </div>

          <div class="detailed-scores">
            <h3>Detailed Scores:</h3>
            <ul>
              <li><strong>Mobile Page Speed:</strong> ${round(analysis.mobileOptimization.mobilePageSpeed)}%</li>
              <li><strong>Touch Targets:</strong> ${round(analysis.mobileOptimization.touchTargets)}%</li>
              <li><strong>Viewport Configuration:</strong> ${round(analysis.mobileOptimization.viewportConfiguration)}%</li>
              <li><strong>Mobile Usability:</strong> ${round(analysis.mobileOptimization.mobileUsability)}%</li>
              <li><strong>Responsive Design:</strong> ${round(analysis.mobileOptimization.responsiveDesign)}%</li>
            </ul>
          </div>
        </div>

        <div class="section">
          <h2>Schema Analysis (${round(analysis.schemaAnalysis.score)}%)</h2>
          <p><em>Structured data optimization by Search Influence - AI SEO Experts</em></p>

          <div class="findings">
            <h3>Key Findings:</h3>
            <ul>
              ${analysis.schemaAnalysis.findings.map(finding => `<li>${finding}</li>`).join('')}
            </ul>
          </div>

          <div class="recommendations">
            <h3>Recommendations:</h3>
            <ul>
              ${analysis.schemaAnalysis.recommendations.map(rec => `<li>${rec.text ? rec.text : rec}</li>`).join('')}
            </ul>
          </div>

          <div class="detailed-scores">
            <h3>Detailed Scores:</h3>
            <ul>
              <li><strong>Schema Presence:</strong> ${round(analysis.schemaAnalysis.schemaPresence)}%</li>
              <li><strong>Schema Validation:</strong> ${round(analysis.schemaAnalysis.schemaValidation)}%</li>
              <li><strong>Rich Snippet Potential:</strong> ${round(analysis.schemaAnalysis.richSnippetPotential)}%</li>
              <li><strong>Structured Data Completeness:</strong> ${round(analysis.schemaAnalysis.structuredDataCompleteness)}%</li>
              <li><strong>JSON-LD Implementation:</strong> ${round(analysis.schemaAnalysis.jsonLdImplementation)}%</li>
            </ul>
          </div>
        </div>

        <div class="section">
          <h2>Technical Crawlability (${round(analysis.technicalCrawlability.score)}%)</h2>
          <p><em>AI bot accessibility analysis by Search Influence - AI SEO Experts</em></p>

          <div class="findings">
            <h3>Key Findings:</h3>
            <ul>
              ${analysis.technicalCrawlability.findings.map(finding => `<li>${finding}</li>`).join('')}
            </ul>
          </div>

          <div class="recommendations">
            <h3>Recommendations:</h3>
            <ul>
              ${analysis.technicalCrawlability.recommendations.map(rec => `<li>${rec.text ? rec.text : rec}</li>`).join('')}
            </ul>
          </div>

          <div class="detailed-scores">
            <h3>Detailed Scores:</h3>
            <ul>
              <li><strong>Robots Access:</strong> ${round(analysis.technicalCrawlability.robotsAccess)}%</li>
              <li><strong>Bot Accessibility:</strong> ${round(analysis.technicalCrawlability.botAccessibility)}%</li>
              <li><strong>Content Delivery:</strong> ${round(analysis.technicalCrawlability.contentDelivery)}%</li>
              <li><strong>JavaScript Dependency:</strong> ${round(analysis.technicalCrawlability.javascriptDependency)}%</li>
              <li><strong>Load Speed:</strong> ${round(analysis.technicalCrawlability.loadSpeed)}%</li>
            </ul>
          </div>
        </div>

        ${analysis.contentImprovements.length > 0 ? `
        <div class="section improvements">
          <h2>Priority Content Improvements</h2>
          <p><em>Strategic improvements recommended by Search Influence - AI SEO Experts</em></p>
          
          ${analysis.contentImprovements.map((improvement, index) => `
            <div class="improvement-item">
              <h3>${index + 1}. ${improvement.section}</h3>
              <div class="current">
                <strong>Current:</strong> ${improvement.current}
              </div>
              <div class="improved">
                <strong>Improved:</strong> ${improvement.improved}
              </div>
              <div class="reasoning">
                <strong>Why this helps:</strong> ${improvement.reasoning}
              </div>
            </div>
          `).join('')}
        </div>
        ` : ''}
        
        <div class="section">
          <h2>Next Steps</h2>
          <p><em>Powered by Search Influence - AI SEO Experts</em></p>
          <ol>
            <li><strong>Focus on AI Optimization</strong> - This is the most impactful area for future search visibility</li>
            <li><strong>Implement Priority Improvements</strong> - Start with the content improvements listed above</li>
            <li><strong>Monitor Progress</strong> - Re-run this analysis after implementing changes</li>
            <li><strong>Stay Updated</strong> - AI search algorithms evolve rapidly; regular audits are recommended</li>
          </ol>
        </div>
        
        <div class="footer">
          <p>Report generated by AI Website Grader - Optimizing content for the AI-powered search future. Powered by Search Influence - AI SEO Experts.</p>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    
    // Wait for content to load, then print
    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
    };
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexWrap: 'wrap', 
      gap: '12px',
      marginTop: '20px'
    }}>
      <button
        onClick={handleExportPDF}
        disabled={isExportingPDF}
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '12px 20px',
          background: 'linear-gradient(135deg, var(--orange-accent) 0%, var(--orange-dark) 100%)',
          color: 'var(--white)',
          border: 'none',
          borderRadius: '8px',
          cursor: isExportingPDF ? 'not-allowed' : 'pointer',
          transition: 'all 0.3s ease',
          boxShadow: '0 2px 8px rgba(230, 126, 34, 0.3)',
          opacity: isExportingPDF ? 0.6 : 1,
          fontSize: '14px',
          fontWeight: '600',
          fontFamily: 'var(--font-stack)'
        }}
        onMouseEnter={(e) => {
          if (!isExportingPDF) {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(230, 126, 34, 0.4)';
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(230, 126, 34, 0.3)';
        }}
      >
        {isExportingPDF ? (
          <Loader2 size={16} style={{ marginRight: '8px' }} />
        ) : (
          <FileDown size={16} style={{ marginRight: '8px' }} />
        )}
        {isExportingPDF ? 'Generating PDF...' : 'Export PDF'}
      </button>

      <button
        onClick={onExportMarkdown}
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '12px 20px',
          background: 'linear-gradient(135deg, var(--info-blue) 0%, #2980b9 100%)',
          color: 'var(--white)',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          boxShadow: '0 2px 8px rgba(52, 152, 219, 0.3)',
          fontSize: '14px',
          fontWeight: '600',
          fontFamily: 'var(--font-stack)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 4px 15px rgba(52, 152, 219, 0.4)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(52, 152, 219, 0.3)';
        }}
      >
        <FileText size={16} style={{ marginRight: '8px' }} />
        Export Markdown
      </button>

      <button
        onClick={handlePrint}
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '12px 20px',
          background: 'linear-gradient(135deg, var(--success-green) 0%, #229954 100%)',
          color: 'var(--white)',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          boxShadow: '0 2px 8px rgba(39, 174, 96, 0.3)',
          fontSize: '14px',
          fontWeight: '600',
          fontFamily: 'var(--font-stack)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 4px 15px rgba(39, 174, 96, 0.4)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(39, 174, 96, 0.3)';
        }}
      >
        <Printer size={16} style={{ marginRight: '8px' }} />
        Print Report
      </button>
    </div>
  );
} 