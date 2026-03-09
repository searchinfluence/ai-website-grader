import { CrawledContent, RecommendationItem } from '@/types';
import { SCORING_FACTORS } from '@/lib/scoring/config';
import { FactorResult } from './types';
import { clamp, getMainContentText, toStatus } from './shared';

export function analyzeContentStructure(content: CrawledContent): FactorResult {
  const findings: string[] = [];
  const recommendations: RecommendationItem[] = [];
  const hostLabel = content.url === 'manual-input' ? 'this content input' : new URL(content.url).hostname;

  const words = content.wordCount || getMainContentText(content).split(/\s+/).filter(Boolean).length;
  const h1Count = content.headings.filter((heading) => heading.level === 1).length;
  const headingJumps = content.headings.reduce((count, heading, index) => {
    if (index === 0) return count;
    const previous = content.headings[index - 1];
    return heading.level - previous.level > 1 ? count + 1 : count;
  }, 0);

  const questionHeadings = content.headings.filter((heading) => heading.text.includes('?')).length;
  const faqIndicators = content.headings.filter((heading) => /faq|frequently asked/i.test(heading.text)).length;
  const totalLinks = content.links.length;
  const internalLinks = content.links.filter((link) => link.internal).length;

  const totalImages = content.images.length;
  const imagesMissingAlt = content.images.filter((image) => !image.alt || !image.alt.trim()).length;
  const altCoverage = totalImages === 0 ? 100 : ((totalImages - imagesMissingAlt) / totalImages) * 100;

  const text = getMainContentText(content);
  const sentenceCount = Math.max(1, (text.match(/[.!?]+/g) || []).length);
  const wordsPerSentence = words / sentenceCount;
  const readabilityScore = clamp(78 - Math.max(0, Math.abs(wordsPerSentence - 18) * 5));

  const contentToCodeRatio = content.html.length > 0 ? text.length / content.html.length : 0;

  const headingScore = clamp(
    (h1Count === 1 ? 72 : h1Count === 0 ? 8 : 22) -
    headingJumps * 18 +
    Math.min(content.headings.length, 6) * 2
  );
  const wordScore = clamp(words >= 1500 ? 82 : words >= 1200 ? 74 : words >= 900 ? 64 : words >= 700 ? 54 : words >= 500 ? 40 : words >= 300 ? 24 : 10);
  const faqScore = clamp((questionHeadings >= 4 ? 42 : questionHeadings * 8) + (faqIndicators > 0 ? 12 : 0));
  const internalLinkScore = clamp(internalLinks >= 15 ? 84 : internalLinks >= 10 ? 68 : internalLinks >= 6 ? 52 : internalLinks >= 3 ? 34 : internalLinks >= 1 ? 18 : 6);
  const altTextScore = clamp(
    altCoverage >= 98 ? 86 :
    altCoverage >= 95 ? 74 :
    altCoverage >= 90 ? 58 :
    altCoverage >= 75 ? 38 :
    altCoverage >= 50 ? 20 :
    5
  );
  const ratioScore = clamp(contentToCodeRatio >= 0.2 ? 78 : contentToCodeRatio >= 0.15 ? 66 : contentToCodeRatio >= 0.1 ? 52 : contentToCodeRatio >= 0.06 ? 34 : 16);

  let score = clamp(
    headingScore * 0.24 +
    wordScore * 0.22 +
    faqScore * 0.08 +
    internalLinkScore * 0.18 +
    altTextScore * 0.16 +
    readabilityScore * 0.08 +
    ratioScore * 0.04
  );

  if (h1Count !== 1) score = clamp(score - 12);
  if (headingJumps > 0) score = clamp(score - Math.min(12, headingJumps * 4));
  if (internalLinks < 3) score = clamp(score - 8);
  if (altCoverage < 98 && totalImages > 0) score = clamp(score - 6);

  if (h1Count !== 1 || headingJumps > 0) {
    findings.push(`Heading hierarchy has ${h1Count} H1 tag(s) and ${headingJumps} skipped levels.`);
    recommendations.push({
      text: `On ${hostLabel}, use exactly 1 H1 and remove ${headingJumps} heading-level skips detected in the current outline.`,
      priority: 'high',
      category: 'content-structure',
      timeToImplement: '~1 hour'
    });
  }

  if (words < 600) {
    findings.push(`Main content is thin at ${words} words.`);
    recommendations.push({
      text: `On ${hostLabel}, increase main content from ${words} words to at least 800 words with concrete examples and section-level detail.`,
      priority: words < 400 ? 'high' : 'medium',
      category: 'content-depth',
      timeToImplement: '~half day'
    });
  }

  if (internalLinks < 15) {
    findings.push(`Only ${internalLinks} of ${totalLinks} links are internal contextual links.`);
    recommendations.push({
      text: `On ${hostLabel}, add ${Math.max(0, 15 - internalLinks)} more contextual internal links in-body to reach a stronger internal-linking baseline (current internal links: ${internalLinks}).`,
      priority: 'medium',
      category: 'internal-linking',
      timeToImplement: '~30 min'
    });
  }

  if (questionHeadings < 3) {
    findings.push(`Q&A structure is weak with ${questionHeadings} question-form headings and ${faqIndicators} FAQ section indicator(s).`);
    recommendations.push({
      text: `On ${hostLabel}, add a real FAQ section with at least ${Math.max(0, 3 - questionHeadings)} additional question headings followed by direct answers.`,
      priority: 'medium',
      category: 'faq-structure',
      timeToImplement: '~1 hour',
      codeExample: `<section><h2>Frequently Asked Questions</h2><h3>What is ...?</h3><p>Answer...</p></section>`
    });
  }

  if (imagesMissingAlt > 0) {
    findings.push(`${imagesMissingAlt} of ${totalImages} images are missing alt text (${clamp(altCoverage)}% coverage).`);
    recommendations.push({
      text: `On ${hostLabel}, write descriptive alt text for ${imagesMissingAlt} image(s) to raise coverage above 98% (currently ${clamp(altCoverage)}%).`,
      priority: imagesMissingAlt > 5 ? 'high' : 'medium',
      category: 'image-alt-text',
      timeToImplement: '~30 min'
    });
  }

  return {
    key: 'contentStructure',
    label: 'Content Structure',
    weight: SCORING_FACTORS.find((factor) => factor.key === 'contentStructure')!.weight,
    score,
    status: toStatus(score),
    findings,
    recommendations,
    stats: {
      wordCount: words,
      h1Count,
      headingJumps,
      questionHeadings,
      faqIndicators,
      internalLinks,
      totalLinks,
      imagesMissingAlt,
      totalImages,
      altCoverage: clamp(altCoverage),
      altTextScore,
      readabilityScore,
      contentToCodeRatio: Number(contentToCodeRatio.toFixed(3))
    }
  };
}
