#!/usr/bin/env node

/**
 * Schema Validator Comparison Test
 * Runs sites through our grader and captures structured data scoring details
 * for comparison against validator.schema.org
 */

const fs = require('fs').promises;

const testSites = [
  // Rich schema - recipe sites / e-commerce
  { url: 'https://www.allrecipes.com/recipe/10813/best-chocolate-chip-cookies/', category: 'Rich schema (recipe)' },
  { url: 'https://www.amazon.com/', category: 'Rich schema (e-commerce)' },
  // Well-known sites with good schema
  { url: 'https://www.searchinfluence.com/', category: 'SI (known)' },
  { url: 'https://www.searchinfluence.com/services/higher-education-seo/', category: 'SI service page' },
  { url: 'https://highereducationseo.com/higher-ed-seo-why-it-matters-now-how-to-nail-it/', category: 'SI blog' },
  // Sites likely using GTM-injected schema
  { url: 'https://freeman.tulane.edu/', category: 'Higher ed (GTM likely)' },
  { url: 'https://upcea.edu/', category: 'Higher ed org' },
  // Small business / minimal schema
  { url: 'https://www.grossmanlaw.net/', category: 'Small biz (law firm)' },
  { url: 'https://wfrancklemd.com/', category: 'Small biz (medical)' },
  // Sites with likely broken or no schema
  { url: 'https://example.com/', category: 'Bare minimum' },
  // Plastic surgery (SI vertical)
  { url: 'https://plasticsurgeonseo.com/', category: 'PSSEO' },
  // Well-optimized tech sites
  { url: 'https://www.hubspot.com/', category: 'Enterprise SaaS' },
];

async function analyzeUrl(url) {
  const fetch = (await import('node-fetch')).default;
  
  try {
    const response = await fetch('http://localhost:3000/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      return { error: `HTTP ${response.status}` };
    }

    const data = await response.json();
    const sdFactor = data.factors?.structuredData || {};
    
    return {
      overallScore: data.overallScore,
      structuredDataScore: sdFactor.score,
      status: sdFactor.status,
      stats: sdFactor.stats || {},
      findings: sdFactor.findings || [],
      recommendations: sdFactor.recommendations || [],
    };
  } catch (err) {
    return { error: err.message };
  }
}

async function main() {
  console.log('=== Schema Validator Comparison Test ===\n');
  console.log(`Testing ${testSites.length} sites...\n`);
  
  const results = [];
  
  for (const site of testSites) {
    process.stdout.write(`Analyzing: ${site.url} ... `);
    const result = await analyzeUrl(site.url);
    
    if (result.error) {
      console.log(`ERROR: ${result.error}`);
      results.push({ ...site, error: result.error });
    } else {
      console.log(`SD Score: ${result.structuredDataScore} | Types: ${(result.stats.schemaTypes || []).join(', ') || 'none'}`);
      results.push({ ...site, ...result });
    }
  }
  
  // Summary table
  console.log('\n\n=== STRUCTURED DATA COMPARISON SUMMARY ===\n');
  console.log('| Site | Category | SD Score | JSON-LD Count | Schema Types | OG | Twitter | Rich Snippet? |');
  console.log('|------|----------|----------|---------------|-------------|-----|---------|---------------|');
  
  for (const r of results) {
    if (r.error) {
      console.log(`| ${new URL(r.url).hostname} | ${r.category} | ERROR | - | - | - | - | - |`);
      continue;
    }
    const host = new URL(r.url).hostname.replace('www.', '');
    const types = (r.stats.schemaTypes || []).join(', ') || 'none';
    console.log(`| ${host} | ${r.category} | ${r.structuredDataScore} | ${r.stats.jsonLdCount || 0} | ${types} | ${r.stats.hasOpenGraph ? '✅' : '❌'} | ${r.stats.hasTwitter ? '✅' : '❌'} | ${r.stats.richSnippetEligible ? '✅' : '❌'} |`);
  }
  
  // Sub-scores breakdown
  console.log('\n\n=== SUB-SCORE BREAKDOWN ===\n');
  console.log('| Site | Presence | Validation | Rich Snippet | Completeness | JSON-LD Impl |');
  console.log('|------|----------|------------|--------------|--------------|--------------|');
  
  for (const r of results) {
    if (r.error) continue;
    const host = new URL(r.url).hostname.replace('www.', '');
    const s = r.stats;
    console.log(`| ${host} | ${s.schemaPresence} | ${s.schemaValidation} | ${s.richSnippetPotential} | ${s.structuredDataCompleteness} | ${s.jsonLdImplementation} |`);
  }
  
  // Findings detail
  console.log('\n\n=== DETAILED FINDINGS ===\n');
  for (const r of results) {
    if (r.error) continue;
    const host = new URL(r.url).hostname.replace('www.', '');
    console.log(`\n--- ${host} (Score: ${r.structuredDataScore}) ---`);
    if (r.findings.length) {
      r.findings.forEach(f => console.log(`  📋 ${f}`));
    }
    if (r.stats.microdataTypes?.length) {
      console.log(`  🏷️  Microdata: ${r.stats.microdataTypes.join(', ')}`);
    }
    if (r.stats.rdfaTypes?.length) {
      console.log(`  🏷️  RDFa: ${r.stats.rdfaTypes.join(', ')}`);
    }
  }
  
  // Save results
  await fs.writeFile('test-results/schema-comparison.json', JSON.stringify(results, null, 2));
  console.log('\n\nResults saved to test-results/schema-comparison.json');
}

main().catch(console.error);
