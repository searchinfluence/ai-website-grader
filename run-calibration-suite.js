#!/usr/bin/env node

const fs = require('fs').promises;

const testUrls = [
  'https://diviner.agency/',
  'https://www.grossmanlaw.net/',
  'https://highereducationseo.com/higher-ed-seo-why-it-matters-now-how-to-nail-it/',
  'https://wfrancklemd.com/breast/breast-augmentation/',
  'https://freeman.tulane.edu/',
  'https://www.searchinfluence.com/services/higher-education-seo/',
  'https://upcea.edu/digital-marketing-strategy-higher-education-seo-paid-ads/',
  'https://www.oho.com/blog/seo-checklist-higher-education',
  'https://gofishdigital.com/services/owned/higher-education/'
];

function scoreTier(score) {
  if (score >= 80) return 'excellent';
  if (score >= 65) return 'good';
  if (score >= 45) return 'average';
  return 'poor';
}

async function analyzeUrl(url) {
  const fetch = (await import('node-fetch')).default;

  const response = await fetch('http://localhost:3000/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();

  const factors = Object.fromEntries(
    Object.entries(data.factors || {}).map(([key, value]) => [key, value.score])
  );

  const recommendationCount = Array.isArray(data.recommendations) ? data.recommendations.length : 0;

  return {
    url,
    overallScore: data.overallScore,
    tier: scoreTier(data.overallScore),
    factors,
    recommendationCount,
    recommendationsAreSpecific: (data.recommendations || []).every((rec) => {
      const text = (rec?.text || '').toLowerCase();
      return /\d|%|\bcurrent\b|\bmissing\b|\bdetected\b|\bhas\b/.test(text);
    })
  };
}

async function main() {
  console.log('Running 4-factor calibration suite...');

  const results = [];

  for (const url of testUrls) {
    try {
      const result = await analyzeUrl(url);
      results.push(result);
      console.log(`${result.url} -> ${result.overallScore}% (${result.tier})`);
    } catch (error) {
      results.push({ url, error: error.message });
      console.error(`${url} -> ERROR: ${error.message}`);
    }

    await new Promise((resolve) => setTimeout(resolve, 1500));
  }

  const successful = results.filter((result) => !result.error);
  const averageScore = successful.length > 0
    ? successful.reduce((sum, item) => sum + item.overallScore, 0) / successful.length
    : null;

  const summary = {
    timestamp: new Date().toISOString(),
    successful: successful.length,
    total: results.length,
    averageScore,
    recommendationCoverage: successful.filter((item) => item.recommendationCount >= 3).length,
    specificRecommendationCoverage: successful.filter((item) => item.recommendationsAreSpecific).length
  };

  const payload = { summary, results };
  await fs.writeFile('calibration-results.json', JSON.stringify(payload, null, 2));

  console.log('Saved results to calibration-results.json');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
