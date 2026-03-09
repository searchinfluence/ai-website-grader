import { WebsiteAnalysis } from '@/types';
import { SCORING_FACTORS } from '@/lib/scoring/config';

export type PrintReportMode = 'print' | 'pdf';

export function createPrintReportUrl(analysis: WebsiteAnalysis, mode: PrintReportMode = 'print'): string {
  const key = `ai-report:${Date.now()}`;
  localStorage.setItem(key, JSON.stringify(analysis));
  return `/print-report?key=${encodeURIComponent(key)}&mode=${encodeURIComponent(mode)}`;
}

export function generateMarkdownReport(analysis: WebsiteAnalysis): string {
  const date = new Date(analysis.timestamp).toLocaleDateString();

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

  return `# AI Website Grader Report\n\n**Website:** ${analysis.url}  \n**Title:** ${analysis.title}  \n**Generated:** ${date}  \n**Overall Score:** ${analysis.overallScore}%\n\n## 4-Factor Score Breakdown\n\n| Factor | Score | Status | Weight |\n|---|---:|---|---:|\n${factorRows}\n\n## Priority Recommendations\n${priorityRecommendations || '- No recommendations generated.'}\n\n${factorSections}\n\n---\nThis report evaluates one page URL (not the entire site) using the v3 4-factor model.`;
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

  const url = createPrintReportUrl(analysis, 'pdf');
  const pdfWindow = window.open(url, '_blank');

  if (!pdfWindow) {
    sessionStorage.setItem('ai-grader-analysis-backup', JSON.stringify(analysis));
    window.location.href = url;
  }
}
