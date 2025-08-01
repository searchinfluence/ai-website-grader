
import jsPDF from 'jspdf';
import { WebsiteAnalysis } from '@/types';

export function generateMarkdownReport(analysis: WebsiteAnalysis): string {
  const date = new Date(analysis.timestamp).toLocaleDateString();
  
  // Helper function to round numbers to 2 decimal places
  const round = (num: number) => Math.round(num * 100) / 100;
  
  return `# AI Website Grader Report

**Powered by [Search Influence](https://www.searchinfluence.com/) - AI SEO Experts**

**Website:** ${analysis.url}  
**Title:** ${analysis.title}  
**Generated:** ${date}  
**Overall Score:** ${round(analysis.overallScore)}%

## Executive Summary

This report analyzes your website's readiness for AI-powered search engines, chat interfaces, and modern search algorithms. The analysis focuses on factors that influence visibility in AI overviews, voice search results, and chatbot responses. Powered by [Search Influence](https://www.searchinfluence.com/) - AI SEO Experts.

## Score Breakdown

| Category | Score | Status |
|----------|-------|--------|
| **AI Optimization** | ${round(analysis.aiOptimization.score)}% | ${analysis.aiOptimization.status} |
| **Content Quality** | ${round(analysis.contentQuality.score)}% | ${analysis.contentQuality.status} |
| **Technical Crawlability** | ${round(analysis.technicalCrawlability.score)}% | ${analysis.technicalCrawlability.status} |
| **E-E-A-T Signals** | ${round(analysis.eeatSignals.score)}% | ${analysis.eeatSignals.status} |
| **Mobile Optimization** | ${round(analysis.mobileOptimization.score)}% | ${analysis.mobileOptimization.status} |
| **Schema Analysis** | ${round(analysis.schemaAnalysis.score)}% | ${analysis.schemaAnalysis.status} |
| **Technical SEO** | ${round(analysis.technicalSEO.score)}% | ${analysis.technicalSEO.status} |

## AI Optimization (${round(analysis.aiOptimization.score)}%)

*Optimized for AI search engines by [Search Influence](https://www.searchinfluence.com/) - AI SEO Experts*

### Key Findings:
${analysis.aiOptimization.findings.map(finding => `- ${finding}`).join('\n')}

### Recommendations:
${analysis.aiOptimization.recommendations.map(rec => `- **${rec.priority.toUpperCase()}**: ${rec.text}${rec.implementation ? '\n  *Implementation:* ' + rec.implementation.replace(/\n/g, '\n  ') : ''}`).join('\n')}

### Detailed Scores:
- **Chunkability:** ${round(analysis.aiOptimization.chunkability)}%
- **Q&A Format:** ${round(analysis.aiOptimization.qaFormat)}%
- **Entity Recognition:** ${round(analysis.aiOptimization.entityRecognition)}%
- **Factual Density:** ${round(analysis.aiOptimization.factualDensity)}%
- **Semantic Clarity:** ${round(analysis.aiOptimization.semanticClarity)}%
- **Content Structure for AI:** ${round(analysis.aiOptimization.contentStructureForAI)}%
- **Contextual Relevance:** ${round(analysis.aiOptimization.contextualRelevance)}%

## Mobile Optimization (${round(analysis.mobileOptimization.score)}%)

*Mobile-first optimization by [Search Influence](https://www.searchinfluence.com/) - AI SEO Experts*

### Key Findings:
${analysis.mobileOptimization.findings.map(finding => `- ${finding}`).join('\n')}

### Recommendations:
${analysis.mobileOptimization.recommendations.map(rec => `- **${rec.priority.toUpperCase()}**: ${rec.text}${rec.implementation ? '\n  *Implementation:* ' + rec.implementation.replace(/\n/g, '\n  ') : ''}`).join('\n')}

### Detailed Scores:
- **Mobile Page Speed:** ${round(analysis.mobileOptimization.mobilePageSpeed)}%
- **Touch Targets:** ${round(analysis.mobileOptimization.touchTargets)}%
- **Viewport Configuration:** ${round(analysis.mobileOptimization.viewportConfiguration)}%
- **Mobile Usability:** ${round(analysis.mobileOptimization.mobileUsability)}%
- **Responsive Design:** ${round(analysis.mobileOptimization.responsiveDesign)}%

## Technical Crawlability (${round(analysis.technicalCrawlability.score)}%)

*AI bot accessibility analysis by [Search Influence](https://www.searchinfluence.com/) - AI SEO Experts*

### Key Findings:
${analysis.technicalCrawlability.findings.map(finding => `- ${finding}`).join('\n')}

### Recommendations:
${analysis.technicalCrawlability.recommendations.map(rec => `- **${rec.priority.toUpperCase()}**: ${rec.text}${rec.implementation ? '\n  *Implementation:* ' + rec.implementation.replace(/\n/g, '\n  ') : ''}`).join('\n')}

### Detailed Scores:
- **Robots Access:** ${round(analysis.technicalCrawlability.robotsAccess)}%
- **Bot Accessibility:** ${round(analysis.technicalCrawlability.botAccessibility)}%
- **Content Delivery:** ${round(analysis.technicalCrawlability.contentDelivery)}%
- **JavaScript Dependency:** ${round(analysis.technicalCrawlability.javascriptDependency)}%
- **Load Speed:** ${round(analysis.technicalCrawlability.loadSpeed)}%

## Schema Analysis (${round(analysis.schemaAnalysis.score)}%)

*Structured data optimization by [Search Influence](https://www.searchinfluence.com/) - AI SEO Experts*

### Key Findings:
${analysis.schemaAnalysis.findings.map(finding => `- ${finding}`).join('\n')}

### Recommendations:
${analysis.schemaAnalysis.recommendations.map(rec => `- **${rec.priority.toUpperCase()}**: ${rec.text}${rec.implementation ? '\n  *Implementation:* ' + rec.implementation.replace(/\n/g, '\n  ') : ''}`).join('\n')}

### Detailed Scores:
- **Schema Presence:** ${round(analysis.schemaAnalysis.schemaPresence)}%
- **Schema Validation:** ${round(analysis.schemaAnalysis.schemaValidation)}%
- **Rich Snippet Potential:** ${round(analysis.schemaAnalysis.richSnippetPotential)}%
- **Structured Data Completeness:** ${round(analysis.schemaAnalysis.structuredDataCompleteness)}%
- **JSON-LD Implementation:** ${round(analysis.schemaAnalysis.jsonLdImplementation)}%

## Content Quality (${round(analysis.contentQuality.score)}%)

*Content optimization powered by [Search Influence](https://www.searchinfluence.com/) - AI SEO Experts*

### Key Findings:
${analysis.contentQuality.findings.map(finding => `- ${finding}`).join('\n')}

### Recommendations:
${analysis.contentQuality.recommendations.map(rec => `- **${rec.priority.toUpperCase()}**: ${rec.text}${rec.implementation ? '\n  *Implementation:* ' + rec.implementation.replace(/\n/g, '\n  ') : ''}`).join('\n')}

### Detailed Scores:
- **Long-tail Keywords:** ${round(analysis.contentQuality.longTailKeywords)}%
- **Comprehensive Coverage:** ${round(analysis.contentQuality.comprehensiveCoverage)}%
- **Relevance to User Intent:** ${round(analysis.contentQuality.relevanceToUserIntent)}%
- **Accuracy and Currency:** ${round(analysis.contentQuality.accuracyAndCurrency)}%
- **Natural Language:** ${round(analysis.contentQuality.naturalLanguage)}%

## Technical SEO (${round(analysis.technicalSEO.score)}%)

*Technical optimization by [Search Influence](https://www.searchinfluence.com/) - AI SEO Experts*

### Key Findings:
${analysis.technicalSEO.findings.map(finding => `- ${finding}`).join('\n')}

### Recommendations:
${analysis.technicalSEO.recommendations.map(rec => `- **${rec.priority.toUpperCase()}**: ${rec.text}${rec.implementation ? '\n  *Implementation:* ' + rec.implementation.replace(/\n/g, '\n  ') : ''}`).join('\n')}

### Detailed Scores:
- **Heading Structure:** ${round(analysis.technicalSEO.headingStructure)}%
- **Meta Info:** ${round(analysis.technicalSEO.metaInfo)}%
- **Alt Text:** ${round(analysis.technicalSEO.altText)}%
- **Links:** ${round(analysis.technicalSEO.links)}%
- **Schema Markup:** ${round(analysis.technicalSEO.schemaMarkup)}%
- **Page Speed:** ${round(analysis.technicalSEO.pageSpeed)}%

## E-E-A-T Signals (${round(analysis.eeatSignals.score)}%)

*Expertise, Experience, Authoritativeness, Trustworthiness by [Search Influence](https://www.searchinfluence.com/) - AI SEO Experts*

### Key Findings:
${analysis.eeatSignals.findings.map(finding => `- ${finding}`).join('\n')}

### Recommendations:
${analysis.eeatSignals.recommendations.map(rec => `- **${rec.priority.toUpperCase()}**: ${rec.text}${rec.implementation ? '\n  *Implementation:* ' + rec.implementation.replace(/\n/g, '\n  ') : ''}`).join('\n')}

### Detailed Scores:
- **Expertise & Experience:** ${round(analysis.eeatSignals.expertiseExperience)}%
- **Authoritativeness:** ${round(analysis.eeatSignals.authoritativeness)}%
- **Trustworthiness:** ${round(analysis.eeatSignals.trustworthiness)}%



## Performance Analysis (${analysis.crawledContent.aiAnalysisData?.performanceMetrics?.performanceScore ? round(analysis.crawledContent.aiAnalysisData.performanceMetrics.performanceScore) : 'N/A'}%)

*Real performance metrics from Google PageSpeed Insights and W3C HTML Validator*

### Core Web Vitals:
${analysis.crawledContent.aiAnalysisData?.performanceMetrics?.coreWebVitals ? `
- **Performance Score:** ${round(analysis.crawledContent.aiAnalysisData.performanceMetrics.coreWebVitals.score)}/100
- **LCP (Largest Contentful Paint):** ${analysis.crawledContent.aiAnalysisData.performanceMetrics.coreWebVitals.lcp}ms
- **FID (First Input Delay):** ${analysis.crawledContent.aiAnalysisData.performanceMetrics.coreWebVitals.fid}ms
- **CLS (Cumulative Layout Shift):** ${analysis.crawledContent.aiAnalysisData.performanceMetrics.coreWebVitals.cls}
` : '- Real Core Web Vitals data not available'}

### HTML Validation (W3C):
${analysis.crawledContent.aiAnalysisData?.performanceMetrics?.htmlValidation ? `
- **Status:** ${analysis.crawledContent.aiAnalysisData.performanceMetrics.htmlValidation.isValid ? '✅ Valid' : '❌ Invalid'}
- **Errors:** ${analysis.crawledContent.aiAnalysisData.performanceMetrics.htmlValidation.errors}
- **Warnings:** ${analysis.crawledContent.aiAnalysisData.performanceMetrics.htmlValidation.warnings}
${analysis.crawledContent.aiAnalysisData.performanceMetrics.htmlValidation.messages.length > 0 ? `
- **Sample Issues:**
${analysis.crawledContent.aiAnalysisData.performanceMetrics.htmlValidation.messages.slice(0, 5).map(msg => `  - ${msg.type.toUpperCase()}: ${msg.message}${msg.line ? ` (Line ${msg.line})` : ''}`).join('\n')}
${analysis.crawledContent.aiAnalysisData.performanceMetrics.htmlValidation.messages.length > 5 ? `  - ... and ${analysis.crawledContent.aiAnalysisData.performanceMetrics.htmlValidation.messages.length - 5} more issues` : ''}
` : ''}
` : '- HTML validation data not available'}

### Accessibility Analysis:
${analysis.crawledContent.aiAnalysisData?.performanceMetrics?.accessibilityScore !== undefined ? `
- **Score:** ${round(analysis.crawledContent.aiAnalysisData.performanceMetrics.accessibilityScore)}/100
- **Analysis:** Based on alt text coverage, ARIA attributes, semantic HTML, and form labels
` : '- Accessibility data not available'}

### Combined Performance Score:
${analysis.crawledContent.aiAnalysisData?.performanceMetrics?.performanceScore ? `
- **Overall Score:** ${round(analysis.crawledContent.aiAnalysisData.performanceMetrics.performanceScore)}/100
- **Weighting:** 40% Core Web Vitals, 30% HTML Validity, 30% Accessibility
` : '- Combined performance score not available'}

## Priority Content Improvements

*Strategic improvements recommended by [Search Influence](https://www.searchinfluence.com/) - AI SEO Experts*

${analysis.contentImprovements.map((improvement, index) => `
### ${index + 1}. ${improvement.section} - **${improvement.priority.toUpperCase()} PRIORITY**

**Current:** ${improvement.current}

**Improved:** ${improvement.improved}

**Why this helps:** ${improvement.reasoning}

${improvement.implementation ? `**Implementation Steps:**\n${improvement.implementation}` : ''}
`).join('\n')}

## Next Steps

*Powered by [Search Influence](https://www.searchinfluence.com/) - AI SEO Experts*

1. **Focus on AI Optimization** - This is the most impactful area for future search visibility
2. **Implement Priority Improvements** - Start with the content improvements listed above
3. **Monitor Progress** - Re-run this analysis after implementing changes
4. **Stay Updated** - AI search algorithms evolve rapidly; regular audits are recommended

---

*Report generated by [AI Website Grader](https://ai-grader.searchinfluence.com/) - Optimizing content for the AI-powered search future. Powered by [Search Influence](https://www.searchinfluence.com/) - AI SEO Experts.*`;
}

export async function generatePDFReport(analysis: WebsiteAnalysis): Promise<void> {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    throw new Error('PDF generation is only available in the browser');
  }

  try {
    // Helper function to round numbers
    const round = (num: number) => Math.round(num * 100) / 100;
    
    // Create PDF using jsPDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    let yPos = 20;
    const pageHeight = 280; // Leave margin for footer
    const margin = 20;
    const contentWidth = 170;
    
    // Helper function to check page breaks
    const checkPageBreak = (requiredSpace: number) => {
      if (yPos + requiredSpace > pageHeight) {
        pdf.addPage();
        yPos = 20;
        return true;
      }
      return false;
    };
    
    // Header
    checkPageBreak(20);
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text('AI Website Grader Report', margin, yPos);
    yPos += 15;
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Powered by Search Influence - AI SEO Experts', margin, yPos);
    // Add clickable link for Search Influence
    pdf.link(margin, yPos - 4, 60, 6, { url: 'https://www.searchinfluence.com/' });
    yPos += 15;
    
    // Website Information
    checkPageBreak(25);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Website Information:', margin, yPos);
    yPos += 8;
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Website: ${analysis.url}`, margin + 5, yPos);
    // Add clickable link for the analyzed website
    pdf.link(margin + 5, yPos - 4, 50, 6, { url: analysis.url });
    yPos += 6;
    pdf.text(`Title: ${analysis.title}`, margin + 5, yPos);
    yPos += 6;
    pdf.text(`Generated: ${new Date(analysis.timestamp).toLocaleDateString()}`, margin + 5, yPos);
    yPos += 6;
    pdf.text(`Overall Score: ${round(analysis.overallScore)}%`, margin + 5, yPos);
    yPos += 15;
    
    // Executive Summary
    checkPageBreak(30);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Executive Summary', margin, yPos);
    yPos += 10;
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    const summaryText = 'This report analyzes your website\'s readiness for AI-powered search engines, chat interfaces, and modern search algorithms. The analysis focuses on factors that influence visibility in AI overviews, voice search results, and chatbot responses. Powered by Search Influence - AI SEO Experts.';
    const summaryLines = pdf.splitTextToSize(summaryText, contentWidth);
    summaryLines.forEach((line: string) => {
      pdf.text(line, margin, yPos);
      yPos += 5;
    });
    // Add clickable link for Search Influence in summary
    pdf.link(margin + 120, yPos - 15, 60, 6, { url: 'https://www.searchinfluence.com/' });
    yPos += 10;
    
    // Score Breakdown
    checkPageBreak(40);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Score Breakdown', margin, yPos);
    yPos += 15;
    
    // Score table headers
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Category', margin, yPos);
    pdf.text('Score', margin + 80, yPos);
    pdf.text('Status', margin + 120, yPos);
    yPos += 8;
    
    // Table separator line
    pdf.line(margin, yPos, margin + 170, yPos);
    yPos += 8;
    
    // Score table rows
    pdf.setFontSize(10);
    const scores = [
      ['AI Optimization', round(analysis.aiOptimization.score), analysis.aiOptimization.status],
      ['Content Quality', round(analysis.contentQuality.score), analysis.contentQuality.status],
      ['Technical Crawlability', round(analysis.technicalCrawlability.score), analysis.technicalCrawlability.status],
      ['E-E-A-T Signals', round(analysis.eeatSignals.score), analysis.eeatSignals.status],
      ['Mobile Optimization', round(analysis.mobileOptimization.score), analysis.mobileOptimization.status],
      ['Schema Analysis', round(analysis.schemaAnalysis.score), analysis.schemaAnalysis.status],
      ['Technical SEO', round(analysis.technicalSEO.score), analysis.technicalSEO.status],
      
    ];
    
    scores.forEach((scoreData) => {
      const category = scoreData[0] as string;
      const score = scoreData[1] as number;
      const status = scoreData[2] as string;
      
      pdf.setFont('helvetica', 'bold');
      pdf.text(category, margin, yPos);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`${score}%`, margin + 80, yPos);
      pdf.text(status, margin + 120, yPos);
      yPos += 8;
    });
    yPos += 15;
    
    // Detailed Analysis Sections
    const sections = [
      {
        title: 'AI Optimization',
        data: analysis.aiOptimization,
        subtitle: 'Optimized for AI search engines by Search Influence - AI SEO Experts',
        detailedScores: [
          ['Chunkability', round(analysis.aiOptimization.chunkability)],
          ['Q&A Format', round(analysis.aiOptimization.qaFormat)],
          ['Entity Recognition', round(analysis.aiOptimization.entityRecognition)],
          ['Factual Density', round(analysis.aiOptimization.factualDensity)],
          ['Semantic Clarity', round(analysis.aiOptimization.semanticClarity)],
          ['Content Structure for AI', round(analysis.aiOptimization.contentStructureForAI)],
          ['Contextual Relevance', round(analysis.aiOptimization.contextualRelevance)]
        ]
      },
      {
        title: 'Mobile Optimization',
        data: analysis.mobileOptimization,
        subtitle: 'Mobile-first optimization by Search Influence - AI SEO Experts',
        detailedScores: [
          ['Mobile Page Speed', round(analysis.mobileOptimization.mobilePageSpeed)],
          ['Touch Targets', round(analysis.mobileOptimization.touchTargets)],
          ['Viewport Configuration', round(analysis.mobileOptimization.viewportConfiguration)],
          ['Mobile Usability', round(analysis.mobileOptimization.mobileUsability)],
          ['Responsive Design', round(analysis.mobileOptimization.responsiveDesign)]
        ]
      },
      {
        title: 'Technical Crawlability',
        data: analysis.technicalCrawlability,
        subtitle: 'AI bot accessibility analysis by Search Influence - AI SEO Experts',
        detailedScores: [
          ['Robots Access', round(analysis.technicalCrawlability.robotsAccess)],
          ['Bot Accessibility', round(analysis.technicalCrawlability.botAccessibility)],
          ['Content Delivery', round(analysis.technicalCrawlability.contentDelivery)],
          ['JavaScript Dependency', round(analysis.technicalCrawlability.javascriptDependency)],
          ['Load Speed', round(analysis.technicalCrawlability.loadSpeed)]
        ]
      },
      {
        title: 'Schema Analysis',
        data: analysis.schemaAnalysis,
        subtitle: 'Structured data optimization by Search Influence - AI SEO Experts',
        detailedScores: [
          ['Schema Presence', round(analysis.schemaAnalysis.schemaPresence)],
          ['Schema Validation', round(analysis.schemaAnalysis.schemaValidation)],
          ['Rich Snippet Potential', round(analysis.schemaAnalysis.richSnippetPotential)],
          ['Structured Data Completeness', round(analysis.schemaAnalysis.structuredDataCompleteness)],
          ['JSON-LD Implementation', round(analysis.schemaAnalysis.jsonLdImplementation)]
        ]
      },
      {
        title: 'Content Quality',
        data: analysis.contentQuality,
        subtitle: 'Content optimization powered by Search Influence - AI SEO Experts',
        detailedScores: [
          ['Long-tail Keywords', round(analysis.contentQuality.longTailKeywords)],
          ['Comprehensive Coverage', round(analysis.contentQuality.comprehensiveCoverage)],
          ['Relevance to User Intent', round(analysis.contentQuality.relevanceToUserIntent)],
          ['Accuracy and Currency', round(analysis.contentQuality.accuracyAndCurrency)],
          ['Natural Language', round(analysis.contentQuality.naturalLanguage)]
        ]
      },
      {
        title: 'Technical SEO',
        data: analysis.technicalSEO,
        subtitle: 'Technical optimization by Search Influence - AI SEO Experts',
        detailedScores: [
          ['Heading Structure', round(analysis.technicalSEO.headingStructure)],
          ['Meta Info', round(analysis.technicalSEO.metaInfo)],
          ['Alt Text', round(analysis.technicalSEO.altText)],
          ['Links', round(analysis.technicalSEO.links)],
          ['Schema Markup', round(analysis.technicalSEO.schemaMarkup)],
          ['Page Speed', round(analysis.technicalSEO.pageSpeed)]
        ]
      },
      {
        title: 'E-E-A-T Signals',
        data: analysis.eeatSignals,
        subtitle: 'Expertise, Experience, Authoritativeness, Trustworthiness by Search Influence - AI SEO Experts',
        detailedScores: [
          ['Expertise & Experience', round(analysis.eeatSignals.expertiseExperience)],
          ['Authoritativeness', round(analysis.eeatSignals.authoritativeness)],
          ['Trustworthiness', round(analysis.eeatSignals.trustworthiness)]
        ]
      },

    ];

    sections.forEach((section) => {
      checkPageBreak(80);
      
      // Section header
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${section.title} (${round(section.data.score)}%)`, margin, yPos);
      yPos += 8;
      
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'italic');
      pdf.text(section.subtitle, margin, yPos);
      // Add clickable link for Search Influence in section subtitle
      pdf.link(margin, yPos - 4, 60, 6, { url: 'https://www.searchinfluence.com/' });
      yPos += 8;
      
      // Key Findings
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Key Findings:', margin, yPos);
      yPos += 8;
      
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      section.data.findings.forEach(finding => {
        const lines = pdf.splitTextToSize(`• ${finding}`, contentWidth);
        lines.forEach((line: string) => {
          checkPageBreak(5);
          pdf.text(line, margin + 5, yPos);
          yPos += 5;
        });
        yPos += 2;
      });
      
      // Recommendations
      yPos += 5;
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Recommendations:', margin, yPos);
      yPos += 8;
      
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      section.data.recommendations.forEach(rec => {
        const recText = typeof rec === 'string' ? rec : `${rec.priority.toUpperCase()}: ${rec.text}`;
        const lines = pdf.splitTextToSize(`• ${recText}`, contentWidth);
        lines.forEach((line: string) => {
          checkPageBreak(5);
          pdf.text(line, margin + 5, yPos);
          yPos += 5;
        });
        yPos += 2;
      });
      
      // Detailed Scores
      yPos += 5;
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Detailed Scores:', margin, yPos);
      yPos += 8;
      
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      section.detailedScores.forEach(([label, score]) => {
        pdf.text(`• ${label}: ${score}%`, margin + 5, yPos);
        yPos += 5;
      });
      
      yPos += 10;
    });
    
    // Priority Content Improvements
    if (analysis.contentImprovements.length > 0) {
      checkPageBreak(40);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Priority Content Improvements', margin, yPos);
      yPos += 8;
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Strategic improvements recommended by Search Influence - AI SEO Experts', margin, yPos);
      yPos += 15;

      analysis.contentImprovements.forEach((improvement, index) => {
        checkPageBreak(40);
        
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`${index + 1}. ${improvement.section} - ${improvement.priority.toUpperCase()} PRIORITY`, margin, yPos);
        yPos += 8;
        
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        
        const currentLines = pdf.splitTextToSize(`Current: ${improvement.current}`, contentWidth);
        currentLines.forEach((line: string) => {
          checkPageBreak(5);
          pdf.text(line, margin + 5, yPos);
          yPos += 5;
        });
        yPos += 2;
        
        const improvedLines = pdf.splitTextToSize(`Improved: ${improvement.improved}`, contentWidth);
        improvedLines.forEach((line: string) => {
          checkPageBreak(5);
          pdf.text(line, margin + 5, yPos);
          yPos += 5;
        });
        yPos += 2;
        
        const reasoningLines = pdf.splitTextToSize(`Why this helps: ${improvement.reasoning}`, contentWidth);
        reasoningLines.forEach((line: string) => {
          checkPageBreak(5);
          pdf.text(line, margin + 5, yPos);
          yPos += 5;
        });
        yPos += 2;
        
        if (improvement.implementation) {
          const implementationLines = pdf.splitTextToSize(`Implementation: ${improvement.implementation}`, contentWidth);
          implementationLines.forEach((line: string) => {
            checkPageBreak(5);
            pdf.text(line, margin + 5, yPos);
            yPos += 5;
          });
          yPos += 2;
        }
        
        yPos += 8;
      });
    }
    
    // Next Steps
    checkPageBreak(30);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Next Steps', margin, yPos);
    yPos += 8;
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    const nextSteps = [
      'Focus on AI Optimization - This is the most impactful area for future search visibility',
      'Implement Priority Improvements - Start with the content improvements listed above',
      'Monitor Progress - Re-run this analysis after implementing changes',
      'Stay Updated - AI search algorithms evolve rapidly; regular audits are recommended'
    ];
    nextSteps.forEach((step, index) => {
      const lines = pdf.splitTextToSize(`${index + 1}. ${step}`, contentWidth);
      lines.forEach((line: string) => {
        checkPageBreak(5);
        pdf.text(line, margin + 5, yPos);
        yPos += 5;
      });
      yPos += 2;
    });
    
    // Footer
    yPos += 10;
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    const footerText = 'Report generated by AI Website Grader - Optimizing content for the AI-powered search future. Powered by Search Influence - AI SEO Experts.';
    const footerLines = pdf.splitTextToSize(footerText, contentWidth);
    footerLines.forEach((line: string) => {
      checkPageBreak(5);
      pdf.text(line, margin, yPos);
      yPos += 5;
    });
    
    // Add clickable links in footer
    pdf.link(margin + 120, yPos - 15, 60, 6, { url: 'https://www.searchinfluence.com/' });
    pdf.link(margin + 15, yPos - 15, 40, 6, { url: 'https://ai-grader.searchinfluence.com/' });

    // Add metadata
    pdf.setProperties({
      title: `AI Website Grader Report - ${analysis.title}`,
      subject: 'Website Analysis Report',
      author: 'AI Website Grader',
      creator: 'AI Website Grader'
    });

    // Download the PDF
    const fileName = `ai-grader-report-${analysis.url.replace(/[^a-z0-9]/gi, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);

    console.log('PDF generated and downloaded successfully');

  } catch (error) {
    console.error('Error generating PDF:', error);
    
    if (error instanceof Error) {
      throw new Error(`PDF generation failed: ${error.message}`);
    } else {
      throw new Error('Failed to generate PDF report. Please try again.');
    }
  }
}

export function downloadMarkdown(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
} 