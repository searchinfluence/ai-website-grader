#!/usr/bin/env node

const testUrls = [
  // Universities with MHA programs
  'https://online.lsu.edu/online-degree-programs/graduate/master-health-administration/',
  'https://academics.uky.edu/programs/masters/health-administration',
  'https://phhp.ufl.edu/academics/masters-programs/mha/',
  
  // Plumbers near Des Moines
  'https://willenborgplumbing.com/tankless-water-heaters',
  'https://www.handhplumbing.net/tankless-water-heaters-des-moines/',
  'https://thrasherservice.com/plumbing/water-heater-repair-installation/'
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

    console.log(`\nOVERALL SCORE: ${data.overallScore}%\n`);
    console.log('Factor Breakdown:');
    console.log(`  AI Optimization:      ${data.aiOptimization.score}%`);
    console.log(`  Content Quality:      ${data.contentQuality.score}%`);
    console.log(`  Technical SEO:        ${data.technicalSEO.score}%`);
    console.log(`  E-E-A-T Signals:      ${data.eeatSignals.score}%`);
    console.log(`  Mobile Optimization:  ${data.mobileOptimization.score}%`);
    console.log(`  Schema Analysis:      ${data.schemaAnalysis.score}%`);

    return {
      url,
      overallScore: data.overallScore
    };

  } catch (error) {
    console.error(`❌ Error analyzing ${url}:`, error.message);
    return { url, error: error.message };
  }
}

async function main() {
  console.log('🔍 Testing Average Sites (Non-SEO-Optimized)');
  console.log(`📋 Testing ${testUrls.length} URLs\n`);

  const results = [];

  for (const url of testUrls) {
    const result = await analyzeUrl(url);
    results.push(result);
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log('\n\n' + '='.repeat(80));
  console.log('📊 AVERAGE SITES SUMMARY');
  console.log('='.repeat(80));

  const successful = results.filter(r => !r.error);
  const avgScore = successful.reduce((sum, r) => sum + r.overallScore, 0) / successful.length;

  console.log(`\n✅ Successful: ${successful.length}/${testUrls.length}`);
  console.log(`📈 Average Score: ${avgScore.toFixed(1)}%`);
  console.log(`\n📝 Individual Scores:`);
  successful.forEach(r => {
    const domain = new URL(r.url).hostname;
    console.log(`  ${domain}: ${r.overallScore}%`);
  });
}

main().catch(console.error);
