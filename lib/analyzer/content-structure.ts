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
  const extractedWordCount = text.split(/\s+/).filter(Boolean).length;
  // Count raw punctuation marks before clamping to 1, so we can detect
  // cases where paragraphs were joined without sentence-ending punctuation
  // (punctuation loss during text extraction).
  const rawPunctuationCount = (text.match(/[.!?]+/g) || []).length;
  let sentenceCount = Math.max(1, rawPunctuationCount);
  // Use extractedWordCount (from the same text as sentenceCount) to avoid
  // a mismatch where content.wordCount counts the full body but sentenceCount
  // only reflects the main-content extraction -- this mismatch was the root
  // cause of readabilityScore collapsing to 0 on sites with thin paragraph
  // extraction but a large body word count.
  const readabilityWordCount = extractedWordCount > 50 ? extractedWordCount : words;
  let wordsPerSentence = readabilityWordCount / sentenceCount;

  // Log when extraction yields near-empty text but wordCount is high
  // (indicates a body/paragraph extraction mismatch).
  if (words >= 400 && text.trim().length < 200) {
    console.warn(
      `[Content Structure] Main content extraction mismatch for ${content.url}: wordCount=${words}, extractedTextLength=${text.trim().length}, extractedWords=${extractedWordCount}`
    );
  }

  // Log when extracted text has words but almost no sentence-ending punctuation
  // -- this typically means paragraphs were joined in a way that dropped
  // trailing periods (punctuation loss in text extraction).
  if (extractedWordCount >= 100 && rawPunctuationCount === 0) {
    console.warn(
      `[Content Structure] Punctuation loss detected for ${content.url}: extractedWords=${extractedWordCount} but rawPunctuationCount=0 — sentence boundaries stripped during text extraction`
    );
  } else if (extractedWordCount >= 100 && rawPunctuationCount < Math.floor(extractedWordCount / 50)) {
    console.warn(
      `[Content Structure] Low punctuation density for ${content.url}: extractedWords=${extractedWordCount}, rawPunctuationCount=${rawPunctuationCount} — possible partial punctuation loss during text extraction`
    );
  }

  if (wordsPerSentence > 50) {
    sentenceCount = Math.max(1, Math.round(readabilityWordCount / 17));
    wordsPerSentence = readabilityWordCount / sentenceCount;
    console.warn(
      `[Content Structure] Readability fallback applied for ${content.url}: wordsPerSentence=${Math.round(readabilityWordCount / Math.max(1, rawPunctuationCount))} exceeded threshold — estimated sentence count=${sentenceCount}, wordCount=${words}, extractedWords=${extractedWordCount}, rawPunctuationCount=${rawPunctuationCount}`
    );
  }

  const readabilityScore = clamp(100 - Math.max(0, Math.abs(wordsPerSentence - 18) * 4));

  const contentToCodeRatio = content.html.length > 0 ? text.length / content.html.length : 0;

  const headingScore = clamp((h1Count === 1 ? 80 : h1Count === 0 ? 30 : 45) - headingJumps * 10 + Math.min(content.headings.length, 6) * 3);
  const wordScore = clamp(words >= 1200 ? 95 : words >= 900 ? 85 : words >= 600 ? 70 : words >= 400 ? 55 : words >= 250 ? 40 : 25);
  const faqScore = clamp((questionHeadings >= 3 ? 55 : questionHeadings * 12) + (faqIndicators > 0 ? 30 : 0));
  const internalLinkScore = clamp(internalLinks >= 12 ? 95 : internalLinks >= 8 ? 80 : internalLinks >= 5 ? 65 : internalLinks >= 2 ? 45 : 20);
  const ratioScore = clamp(contentToCodeRatio >= 0.2 ? 95 : contentToCodeRatio >= 0.15 ? 80 : contentToCodeRatio >= 0.1 ? 60 : contentToCodeRatio >= 0.06 ? 40 : 20);

  const score = clamp(
    headingScore * 0.2 +
    wordScore * 0.2 +
    faqScore * 0.12 +
    internalLinkScore * 0.16 +
    altCoverage * 0.16 +
    readabilityScore * 0.1 +
    ratioScore * 0.06
  );

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

  if (internalLinks < 5) {
    findings.push(`Only ${internalLinks} of ${totalLinks} links are internal contextual links.`);
    recommendations.push({
      text: `On ${hostLabel}, add ${Math.max(0, 6 - internalLinks)} more contextual internal links in-body (current internal links: ${internalLinks}).`,
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
      text: `On ${hostLabel}, write descriptive alt text for ${imagesMissingAlt} image(s) to raise coverage above 95% (currently ${clamp(altCoverage)}%).`,
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
      readabilityScore,
      contentToCodeRatio: Number(contentToCodeRatio.toFixed(3))
    }
  };
}
