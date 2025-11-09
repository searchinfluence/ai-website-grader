/**
 * Test Suite - Calibration Sites (Original Test Set)
 * Re-tests the original calibration sites with updated 7-factor scoring
 */

const testURLs = [
  'https://diviner.agency/',
  'https://www.grossmanlaw.net/',
  'https://highereducationseo.com/higher-ed-seo-why-it-matters-now-how-to-nail-it/',
  'https://wfrancklemd.com/breast/breast-augmentation/',
  'https://freeman.tulane.edu/',
  'https://www.searchinfluence.com/services/higher-education-seo/',
  'https://upcea.edu/digital-marketing-strategy-higher-education-seo-paid-ads/',
  'https://www.oho.com/blog/seo-checklist-higher-education',
  'https://gofishdigital.com/services/owned/higher-education/',
];

async function analyzeSite(url) {
  try {
    const response = await fetch('http://localhost:3000/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`❌ Error analyzing ${url}:`, error.message);
    return null;
  }
}

async function runTests() {
  console.log('🔍 Testing Calibration Sites (Original Test Set)');
  console.log('📋 Testing', testURLs.length, 'URLs\n');

  const results = [];

  for (const url of testURLs) {
    console.log('================================================================================');
    console.log(`Analyzing: ${url}`);
    console.log('================================================================================\n');

    const analysis = await analyzeSite(url);

    if (analysis) {
      results.push({
        url: url.replace(/^https?:\/\/(www\.)?/, ''),
        newScore: analysis.overallScore,
        oldScore: analysis.hybridAnalysis.finalScore,
        analysis,
      });

      console.log(`NEW 7-Factor Score: ${analysis.overallScore}%`);
      console.log(`OLD Hybrid Score:   ${analysis.hybridAnalysis.finalScore}%`);
      console.log(`Difference:         ${analysis.overallScore - analysis.hybridAnalysis.finalScore > 0 ? '+' : ''}${analysis.overallScore - analysis.hybridAnalysis.finalScore}%\n`);

      console.log('Factor Breakdown:');
      console.log(`  AI Optimization:         ${analysis.aiOptimization.score}%`);
      console.log(`  Content Quality:         ${analysis.contentQuality.score}%`);
      console.log(`  Technical Crawlability:  ${analysis.technicalCrawlability.score}%`);
      console.log(`  E-E-A-T Signals:         ${analysis.eeatSignals.score}%`);
      console.log(`  Mobile Optimization:     ${analysis.mobileOptimization.score}%`);
      console.log(`  Schema Analysis:         ${analysis.schemaAnalysis.score}%`);
      console.log(`  Technical SEO:           ${analysis.technicalSEO.score}%`);
      console.log('');
    } else {
      console.log('❌ Failed to analyze\n');
    }
  }

  // Summary
  console.log('\n================================================================================');
  console.log('📊 CALIBRATION SITES COMPARISON SUMMARY');
  console.log('================================================================================\n');

  const successful = results.filter(r => r.newScore !== null);
  console.log(`✅ Successful: ${successful.length}/${testURLs.length}`);

  if (successful.length > 0) {
    const avgNewScore = Math.round(
      successful.reduce((sum, r) => sum + r.newScore, 0) / successful.length
    );
    const avgOldScore = Math.round(
      successful.reduce((sum, r) => sum + r.oldScore, 0) / successful.length
    );

    console.log(`📈 NEW Average Score (7-Factor): ${avgNewScore}%`);
    console.log(`📈 OLD Average Score (Hybrid):   ${avgOldScore}%`);
    console.log(`📊 Average Difference:           ${avgNewScore - avgOldScore > 0 ? '+' : ''}${avgNewScore - avgOldScore}%\n`);

    console.log('📝 Individual Comparisons:');
    successful.forEach(r => {
      const diff = r.newScore - r.oldScore;
      console.log(`  ${r.url}: ${r.newScore}% (was ${r.oldScore}%, ${diff > 0 ? '+' : ''}${diff}%)`);
    });
  }

  console.log('');
}

runTests().catch(console.error);
