#!/usr/bin/env node

/**
 * Calibration Test Suite
 * Runs analysis on multiple URLs and compares scores
 */

const testUrls = [
  // Previous test sites
  'https://diviner.agency/',
  'https://www.grossmanlaw.net/',
  'https://highereducationseo.com/higher-ed-seo-why-it-matters-now-how-to-nail-it/',
  'https://wfrancklemd.com/breast/breast-augmentation/',
  'https://freeman.tulane.edu/',

  // Search Influence (our own page)
  'https://www.searchinfluence.com/services/higher-education-seo/',

  // New higher ed sites
  'https://upcea.edu/digital-marketing-strategy-higher-education-seo-paid-ads/',
  'https://www.oho.com/blog/seo-checklist-higher-education',
  'https://gofishdigital.com/services/owned/higher-education/'
];

async function analyzeUrl(url) {
  const fetch = (await import('node-fetch')).default;

  try {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`Analyzing: ${url}`);
    console.log('='.repeat(80));

    const response = await fetch('http://localhost:3000/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    // Display results
    console.log(`\nOVERALL SCORE: ${data.overallScore}%\n`);

    console.log('Factor Breakdown:');
    console.log(`  AI Optimization:      ${data.aiOptimization.score}%`);
    console.log(`  Content Quality:      ${data.contentQuality.score}%`);
    console.log(`  Technical SEO:        ${data.technicalSEO.score}%`);
    console.log(`  E-E-A-T Signals:      ${data.eeatSignals.score}%`);
    console.log(`  Mobile Optimization:  ${data.mobileOptimization.score}%`);
    console.log(`  Schema Analysis:      ${data.schemaAnalysis.score}%`);

    console.log('\nSub-scores with 100%:');
    const perfectScores = [];

    // Check AI Optimization
    Object.entries({
      'AI - Chunkability': data.aiOptimization.chunkability,
      'AI - Q&A Format': data.aiOptimization.qaFormat,
      'AI - Entity Recognition': data.aiOptimization.entityRecognition,
      'AI - Factual Density': data.aiOptimization.factualDensity,
      'AI - Semantic Clarity': data.aiOptimization.semanticClarity,
      'Content - Long-tail Keywords': data.contentQuality.longTailKeywords,
      'Content - Comprehensive Coverage': data.contentQuality.comprehensiveCoverage,
      'Content - Relevance': data.contentQuality.relevanceToUserIntent,
      'Content - Accuracy': data.contentQuality.accuracyAndCurrency,
      'Content - Natural Language': data.contentQuality.naturalLanguage,
      'Tech - Heading Structure': data.technicalSEO.headingStructure,
      'Tech - Meta Info': data.technicalSEO.metaInfo,
      'Tech - Alt Text': data.technicalSEO.altText,
      'Tech - Links': data.technicalSEO.links,
      'EEAT - Expertise': data.eeatSignals.expertiseExperience,
      'EEAT - Authoritativeness': data.eeatSignals.authoritativeness,
      'EEAT - Trustworthiness': data.eeatSignals.trustworthiness,
    }).forEach(([name, score]) => {
      if (score >= 100) {
        perfectScores.push(name);
      }
    });

    if (perfectScores.length > 0) {
      perfectScores.forEach(score => console.log(`  ✓ ${score}`));
    } else {
      console.log('  (none)');
    }

    console.log('\nSchema Detection:');
    console.log(`  Has Schema: ${data.schemaAnalysis.hasSchema || 'undefined'}`);
    console.log(`  Schema Types: ${data.schemaAnalysis.schemaTypes?.join(', ') || 'undefined'}`);
    console.log(`  Raw Schema Found: ${data.crawledContent.schemaMarkup?.length || 0} blocks`);

    // Check for suspicious scoring
    const warnings = [];
    if (data.overallScore >= 90) warnings.push('⚠️  Overall score very high (>= 90%)');
    if (perfectScores.length >= 5) warnings.push(`⚠️  Many perfect scores (${perfectScores.length} factors at 100%)`);
    if (data.schemaAnalysis.score > 50 && !data.schemaAnalysis.hasSchema && data.crawledContent.schemaMarkup?.length > 0) {
      warnings.push('⚠️  Schema detected in crawl but not parsed');
    }
    if (data.schemaAnalysis.score > 50 && data.crawledContent.schemaMarkup?.length === 0) {
      warnings.push('⚠️  Schema score high but no schema found');
    }

    if (warnings.length > 0) {
      console.log('\nWARNINGS:');
      warnings.forEach(w => console.log(`  ${w}`));
    }

    return {
      url,
      overallScore: data.overallScore,
      perfectScores: perfectScores.length,
      schemaIssue: data.crawledContent.schemaMarkup?.length > 0 && !data.schemaAnalysis.hasSchema,
      warnings: warnings.length
    };

  } catch (error) {
    console.error(`❌ Error analyzing ${url}:`, error.message);
    return { url, error: error.message };
  }
}

async function main() {
  console.log('🚀 Running Calibration Test Suite');
  console.log(`📋 Testing ${testUrls.length} URLs\n`);

  const results = [];

  for (const url of testUrls) {
    const result = await analyzeUrl(url);
    results.push(result);

    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  // Summary
  console.log('\n\n' + '='.repeat(80));
  console.log('📊 CALIBRATION SUMMARY');
  console.log('='.repeat(80));

  const successful = results.filter(r => !r.error);
  const avgScore = successful.reduce((sum, r) => sum + r.overallScore, 0) / successful.length;
  const highScores = successful.filter(r => r.overallScore >= 90);
  const totalPerfectScores = successful.reduce((sum, r) => sum + r.perfectScores, 0);
  const schemaIssues = successful.filter(r => r.schemaIssue);

  console.log(`\n✅ Successful: ${successful.length}/${testUrls.length}`);
  console.log(`📈 Average Score: ${avgScore.toFixed(1)}%`);
  console.log(`⚠️  Scores >= 90%: ${highScores.length} (${(highScores.length/successful.length*100).toFixed(0)}%)`);
  console.log(`💯 Total Perfect Sub-scores: ${totalPerfectScores}`);
  console.log(`🔍 Schema Detection Issues: ${schemaIssues.length}`);

  console.log('\n🎯 RECOMMENDATIONS:');
  if (avgScore >= 85) {
    console.log('  - Scoring appears too generous overall');
  }
  if (highScores.length >= testUrls.length / 2) {
    console.log('  - Too many sites scoring 90%+ (indicates grade inflation)');
  }
  if (totalPerfectScores > testUrls.length * 2) {
    console.log('  - Too many perfect sub-scores (should be rare)');
  }
  if (schemaIssues.length > 0) {
    console.log('  - Fix schema parsing (@graph detection is broken)');
  }

  console.log('\n📝 Detailed results saved to calibration-results.json');

  const fs = require('fs').promises;
  await fs.writeFile('calibration-results.json', JSON.stringify({
    timestamp: new Date().toISOString(),
    summary: { avgScore, highScores: highScores.length, totalPerfectScores, schemaIssues: schemaIssues.length },
    results
  }, null, 2));
}

main().catch(console.error);
