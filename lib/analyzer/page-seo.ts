import { CrawledContent, RecommendationItem } from '@/types';
import { SCORING_FACTORS } from '@/lib/scoring/config';
import { FactorResult } from './types';
import { clamp, toStatus } from './shared';

export function analyzePageSeo(content: CrawledContent): FactorResult {
  const findings: string[] = [];
  const recommendations: RecommendationItem[] = [];
  const hostLabel = content.url === 'manual-input' ? 'this content input' : new URL(content.url).hostname;

  const titleLength = content.title.trim().length;
  const descriptionLength = (content.metaDescription || '').trim().length;
  const h1Count = content.headings.filter((heading) => heading.level === 1).length;

  const parsedUrl = new URL(content.url);
  const path = parsedUrl.pathname;
  const pathDepth = path.split('/').filter(Boolean).length;
  const hasQuery = Boolean(parsedUrl.search);
  const pathIsClean = /^\/[a-z0-9\-\/]*$/.test(path);

  const totalImages = content.images.length;
  const webpImages = content.images.filter((image) => /\.webp($|\?)/i.test(image.src)).length;
  const optimizedImageRatio = totalImages === 0 ? 1 : webpImages / totalImages;
  const imagesMissingAlt = content.images.filter((image) => !image.alt || !image.alt.trim()).length;

  const titleScore = clamp(titleLength >= 30 && titleLength <= 60 ? 100 : titleLength >= 20 && titleLength <= 70 ? 58 : titleLength > 0 ? 28 : 0);
  const descriptionScore = clamp(descriptionLength >= 120 && descriptionLength <= 160 ? 100 : descriptionLength >= 90 && descriptionLength <= 175 ? 56 : descriptionLength > 0 ? 26 : 0);
  const h1Score = clamp(h1Count === 1 ? 100 : h1Count === 0 ? 0 : h1Count === 2 ? 18 : 8);
  const urlScore = clamp((pathIsClean ? 62 : 28) + (pathDepth <= 2 ? 18 : pathDepth <= 4 ? 10 : 0) + (hasQuery ? 0 : 10));
  const imageScore = clamp(totalImages === 0 ? 72 : (100 - (imagesMissingAlt / totalImages) * 100) * 0.65 + optimizedImageRatio * 20);

  let score = clamp(
    titleScore * 0.12 +
    descriptionScore * 0.12 +
    h1Score * 0.36 +
    urlScore * 0.2 +
    imageScore * 0.2
  );

  if (h1Count === 0) score = clamp(score - 18);
  if (h1Count > 1) score = clamp(score - Math.min(20, h1Count * 5));
  if (titleLength === 0) score = clamp(score - 10);
  if (descriptionLength === 0) score = clamp(score - 8);

  if (titleLength < 30 || titleLength > 60) {
    findings.push(`Title length is ${titleLength} characters.`);
    recommendations.push({
      text: `Rewrite the ${hostLabel} title tag to 30-60 characters (currently ${titleLength}).`,
      priority: 'high',
      category: 'title-tag',
      timeToImplement: '~30 min'
    });
  }

  if (descriptionLength < 120 || descriptionLength > 160) {
    findings.push(`Meta description length is ${descriptionLength} characters.`);
    recommendations.push({
      text: `Adjust the ${hostLabel} meta description to 120-160 characters (currently ${descriptionLength}).`,
      priority: 'medium',
      category: 'meta-description',
      timeToImplement: '~30 min'
    });
  }

  if (h1Count !== 1) {
    findings.push(`Page has ${h1Count} H1 tag(s).`);
    recommendations.push({
      text: `Use exactly one H1 on ${hostLabel} (currently ${h1Count}).`,
      priority: 'high',
      category: 'h1',
      timeToImplement: '~30 min'
    });
  }

  if (!pathIsClean || pathDepth > 3 || hasQuery) {
    findings.push(`URL path quality issue detected (path depth ${pathDepth}, query params ${hasQuery ? 'present' : 'absent'}).`);
    recommendations.push({
      text: `Simplify the ${hostLabel} URL structure: current depth is ${pathDepth} levels${hasQuery ? ', has query parameters' : ''}${!pathIsClean ? ', contains non-clean characters' : ''}.`,
      priority: 'low',
      category: 'url-structure',
      timeToImplement: '~1 hour'
    });
  }

  if (imagesMissingAlt > 0 || optimizedImageRatio < 0.3) {
    findings.push(`Image SEO gap: ${imagesMissingAlt}/${totalImages} missing alt text and ${Math.round(optimizedImageRatio * 100)}% WebP usage.`);
    recommendations.push({
      text: `Improve ${hostLabel} image SEO by fixing ${imagesMissingAlt} missing alt attributes and increasing modern format usage above 30% (current ${Math.round(optimizedImageRatio * 100)}%).`,
      priority: 'medium',
      category: 'image-seo',
      timeToImplement: '~1 hour'
    });
  }

  return {
    key: 'pageSEO',
    label: 'Page SEO',
    weight: SCORING_FACTORS.find((factor) => factor.key === 'pageSEO')!.weight,
    score,
    status: toStatus(score),
    findings,
    recommendations,
    stats: {
      titleLength,
      descriptionLength,
      h1Count,
      pathDepth,
      hasQuery,
      pathIsClean,
      totalImages,
      webpImages,
      imagesMissingAlt
    }
  };
}
