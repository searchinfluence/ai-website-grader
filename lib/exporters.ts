import { WebsiteAnalysis } from '@/types';
import { SCORING_FACTORS } from '@/lib/scoring/config';

export type PrintReportMode = 'print' | 'pdf';

export function createPrintReportUrl(
  analysis: WebsiteAnalysis,
  mode: PrintReportMode = 'print',
  autoPrint = false
): string {
  const key = `ai-report:${Date.now()}`;
  localStorage.setItem(key, JSON.stringify(analysis));
  return `/print-report?key=${encodeURIComponent(key)}&mode=${encodeURIComponent(mode)}${autoPrint ? '&autoPrint=true' : ''}`;
}

export function generateMarkdownReport(analysis: WebsiteAnalysis): string {
  const date = new Date(analysis.timestamp).toLocaleDateString();
  const crawledContent = analysis.crawledContent;
  const performanceMetrics = crawledContent?.aiAnalysisData?.performanceMetrics;
  const contentImprovements = (analysis.contentImprovements && analysis.contentImprovements.length > 0)
    ? analysis.contentImprovements
    : analysis.recommendations.slice(0, 3).map((recommendation, index) => ({
      section: `${recommendation.category} Improvement ${index + 1}`,
      current: `Gap identified in ${recommendation.category.toLowerCase()}: ${recommendation.text}`,
      improved: `Implement this action first: ${recommendation.text}`,
      reasoning: 'Addressing this issue improves crawlability, relevance, and AI answer quality for this page.',
      priority: recommendation.priority
    }));

  const factorRows = SCORING_FACTORS.map((factor) => {
    const result = analysis.factors[factor.key];
    return `| **${factor.label}** | ${result.score}% | ${result.status} | ${Math.round(factor.weight * 100)}% |`;
  }).join('\n');

  const factorSections = SCORING_FACTORS.map((factor) => {
    const result = analysis.factors[factor.key];
    const findings = result.findings.length > 0
      ? result.findings.map((finding) => `- ${finding}`).join('\n')
      : '- No major issues detected.';

    const recommendations = result.recommendations.length > 0
      ? result.recommendations.map((rec) => `- **${rec.priority.toUpperCase()}**: ${rec.text}${rec.timeToImplement ? ` (${rec.timeToImplement})` : ''}`).join('\n')
      : '- No recommendations for this factor.';

    return `## ${result.label} (${result.score}%)\n\n### Findings\n${findings}\n\n### Recommendations\n${recommendations}\n`;
  }).join('\n');

  const priorityRecommendations = analysis.recommendations
    .map((rec) => `- **${rec.priority.toUpperCase()}** (${rec.category}): ${rec.text}${rec.timeToImplement ? ` (${rec.timeToImplement})` : ''}`)
    .join('\n');

  const performanceSection = performanceMetrics ? [
    '## Performance Analysis',
    performanceMetrics.coreWebVitals
      ? `- Core Web Vitals score: ${performanceMetrics.coreWebVitals.score}/100
- LCP: ${performanceMetrics.coreWebVitals.lcp}ms
- FID: ${performanceMetrics.coreWebVitals.fid}ms
- CLS: ${performanceMetrics.coreWebVitals.cls}`
      : null,
    performanceMetrics.htmlValidation
      ? `- HTML validation: ${performanceMetrics.htmlValidation.isValid ? 'Valid' : 'Invalid'}
- Errors: ${performanceMetrics.htmlValidation.errors}
- Warnings: ${performanceMetrics.htmlValidation.warnings}`
      : null,
    typeof performanceMetrics.accessibilityScore === 'number'
      ? `- Accessibility score: ${performanceMetrics.accessibilityScore}/100`
      : null,
    typeof performanceMetrics.performanceScore === 'number'
      ? `- Combined performance score: ${performanceMetrics.performanceScore}/100`
      : null
  ].filter(Boolean).join('\n\n') : '';

  const contentImprovementsSection = contentImprovements.length > 0
    ? `## Priority Content Improvements

${contentImprovements.map((item, index) => `### ${index + 1}. ${item.section}
- Priority: **${item.priority.toUpperCase()}**
- Current issue: ${item.current}
- Recommended change: ${item.improved}
- Why it matters: ${item.reasoning}`).join('\n\n')}`
    : '';

  const pageMarkdownSection = crawledContent?.markdownContent
    ? `## Page Content Structure (Markdown)

\`\`\`md
${crawledContent.markdownContent.trim()}
\`\`\``
    : '';

  return `# AI Website Grader Report

**Website:** ${analysis.url}  
**Title:** ${analysis.title}  
**Generated:** ${date}  
**Overall Score:** ${analysis.overallScore}%

## 4-Factor Score Breakdown

| Factor | Score | Status | Weight |
|---|---:|---|---:|
${factorRows}

## Priority Recommendations
${priorityRecommendations || '- No recommendations generated.'}

${factorSections}

${performanceSection ? `${performanceSection}\n\n` : ''}${contentImprovementsSection ? `${contentImprovementsSection}\n\n` : ''}${pageMarkdownSection ? `${pageMarkdownSection}\n\n` : ''}---
This report evaluates one page URL (not the entire site) using the v3 4-factor model.`;
}

export function downloadMarkdown(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function generatePDFReport(analysis: WebsiteAnalysis): Promise<void> {
  if (typeof window === 'undefined') {
    throw new Error('PDF generation is only available in the browser');
  }

  const url = createPrintReportUrl(analysis, 'pdf', true);
  const pdfWindow = window.open(url, '_blank');

  if (!pdfWindow) {
    sessionStorage.setItem('ai-grader-analysis-backup', JSON.stringify(analysis));
    window.location.href = url;
  }
}
