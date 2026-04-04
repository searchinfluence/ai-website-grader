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

  // Use markdownContent length if available (more reliable than paragraph
  // extraction for content-to-code ratio). Fall back to extracted text.
  const contentLength = content.markdownContent?.length || text.length;
  const contentToCodeRatio = content.html.length > 0 ? contentLength / content.html.length : 0;

  // ── Heading quality: reward depth and variety, not just H1 presence ────────
  const headingDepth = Math.min(content.headings.length, 12); // cap at 12 to avoid nav inflation
  // Cap heading jump penalty at 3 jumps worth — sites with deep chapter
  // structures (H2→H5) shouldn't be destroyed. The first 2 jumps matter
  // most; after that it's likely intentional sub-structure, not broken HTML.
  const cappedJumpPenalty = Math.min(headingJumps, 3) * 10;
  const headingScore = clamp(
    (h1Count === 1 ? 75 : h1Count === 0 ? 25 : 40) -
    cappedJumpPenalty +
    headingDepth * 2.5 +
    (content.headings.filter(h => h.level >= 2 && h.level <= 3).length >= 4 ? 10 : 0)
  );

  // Penalize word counts that come from nav-heavy pages with low content-to-code
  // ratio — but only when extractedWordCount confirms the content is actually thin.
  // A page with 3600 words and low ratio has real content + heavy HTML (Ahrefs).
  // A page with 1400 words and low ratio is probably mostly nav (LSU homepage).
  const extractionRatio = extractedWordCount > 0 ? extractedWordCount / Math.max(words, 1) : 1;
  const isNavInflated = contentToCodeRatio < 0.07 && extractionRatio < 0.5 && words > 600;
  const wordCountPenalty = isNavInflated ? 0.65 : 1.0;
  const adjustedWords = Math.round(words * wordCountPenalty);
  const wordScore = clamp(adjustedWords >= 1200 ? 95 : adjustedWords >= 900 ? 85 : adjustedWords >= 600 ? 70 : adjustedWords >= 400 ? 55 : adjustedWords >= 250 ? 40 : 25);

  // ── FAQ/Q&A: also reward educational list structure (numbered steps, definitions) ──
  const listElements = (content.html.match(/<(ol|dl)\b/gi) || []).length;
  const definitionLists = (content.html.match(/<dl\b/gi) || []).length;
  const educationalStructureBonus = Math.min(20, listElements * 5 + definitionLists * 8);
  const faqScore = clamp(
    (questionHeadings >= 5 ? 70 : questionHeadings >= 3 ? 55 : questionHeadings * 12) +
    (faqIndicators > 0 ? 25 : 0) +
    educationalStructureBonus
  );

  // ── Internal links: use content-area links, cap to avoid nav inflation ─────
  // Pages with huge nav menus can have 50+ internal links that don't reflect
  // actual in-body contextual linking. Cap the benefit and reward moderate counts.
  const contextualLinkEstimate = Math.min(internalLinks, 25); // cap nav inflation
  const internalLinkScore = clamp(
    contextualLinkEstimate >= 12 ? 90 :
    contextualLinkEstimate >= 8 ? 78 :
    contextualLinkEstimate >= 5 ? 65 :
    contextualLinkEstimate >= 2 ? 45 : 20
  );

  const ratioScore = clamp(contentToCodeRatio >= 0.2 ? 95 : contentToCodeRatio >= 0.15 ? 80 : contentToCodeRatio >= 0.1 ? 60 : contentToCodeRatio >= 0.06 ? 40 : 20);

  // ── Composite: increase heading + word + readability weight, reduce link weight ──
  const score = clamp(
    headingScore * 0.22 +
    wordScore * 0.22 +
    faqScore * 0.14 +
    internalLinkScore * 0.12 +
    altCoverage * 0.14 +
    readabilityScore * 0.12 +
    ratioScore * 0.04
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
