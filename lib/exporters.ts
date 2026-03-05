import jsPDF from 'jspdf';
import { WebsiteAnalysis } from '@/types';
import { SCORING_FACTORS } from '@/lib/scoring/config';

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

  const pdf = new jsPDF('p', 'mm', 'a4');
  const margin = 16;
  const maxWidth = 178;
  let y = 20;

  const writeLine = (text: string, size = 10, bold = false) => {
    pdf.setFont('helvetica', bold ? 'bold' : 'normal');
    pdf.setFontSize(size);
    const lines = pdf.splitTextToSize(text, maxWidth);

    lines.forEach((line: string) => {
      if (y > 280) {
        pdf.addPage();
        y = 20;
      }
      pdf.text(line, margin, y);
      y += size <= 10 ? 5 : 7;
    });
  };

  writeLine('AI Website Grader Report', 16, true);
  y += 2;
  writeLine(`Website: ${analysis.url}`);
  writeLine(`Title: ${analysis.title}`);
  writeLine(`Generated: ${new Date(analysis.timestamp).toLocaleDateString()}`);
  writeLine(`Overall Score: ${analysis.overallScore}%`, 11, true);

  y += 4;
  writeLine('4-Factor Score Breakdown', 12, true);

  SCORING_FACTORS.forEach((factor) => {
    const result = analysis.factors[factor.key];
    writeLine(`${factor.label}: ${result.score}% (${result.status}) - Weight ${Math.round(factor.weight * 100)}%`);
  });

  y += 4;
  writeLine('Priority Recommendations', 12, true);
  analysis.recommendations.slice(0, 10).forEach((rec, idx) => {
    writeLine(`${idx + 1}. [${rec.priority.toUpperCase()}] ${rec.text}${rec.timeToImplement ? ` (${rec.timeToImplement})` : ''}`);
  });

  y += 4;
  writeLine('Factor Findings', 12, true);
  SCORING_FACTORS.forEach((factor) => {
    const result = analysis.factors[factor.key];
    writeLine(`${result.label} (${result.score}%)`, 11, true);
    if (result.findings.length === 0) {
      writeLine('No major issues detected.');
    } else {
      result.findings.slice(0, 4).forEach((finding) => writeLine(`- ${finding}`));
    }
  });

  pdf.save(`ai-grader-report-${analysis.url.replace(/[^a-z0-9]/gi, '-')}.pdf`);
}
