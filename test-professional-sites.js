/**
 * Test Suite - Professional SEO-Optimized Sites
 * Tests sites that should score 75-95% with proper SEO optimization
 */

const testURLs = [
  'https://www.searchinfluence.com/',
  'https://www.searchinfluence.com/services/higher-education-seo/',
  'https://moz.com/learn/seo/what-is-seo',
  'https://backlinko.com/hub/seo/title-tag',
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
    return data; // API returns the full analysis object directly
  } catch (error) {
    console.error(`❌ Error analyzing ${url}:`, error.message);
    return null;
  }
}

async function runTests() {
  console.log('🔍 Testing Professional SEO-Optimized Sites');
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
        score: analysis.overallScore,
        analysis,
      });

      console.log(`OVERALL SCORE: ${analysis.overallScore}%\n`);
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
  console.log('📊 PROFESSIONAL SITES SUMMARY');
  console.log('================================================================================\n');

  const successful = results.filter(r => r.score !== null);
  console.log(`✅ Successful: ${successful.length}/${testURLs.length}`);

  if (successful.length > 0) {
    const avgScore = Math.round(
      successful.reduce((sum, r) => sum + r.score, 0) / successful.length
    );
    console.log(`📈 Average Score: ${avgScore}%\n`);

    console.log('📝 Individual Scores:');
    successful.forEach(r => {
      console.log(`  ${r.url}: ${r.score}%`);
    });
  }

  console.log('');
}

runTests().catch(console.error);
