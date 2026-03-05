#!/usr/bin/env node

const sites = [
  'https://www.searchinfluence.com/services/higher-education-seo/',
  'https://www.oho.com/blog/seo-checklist-higher-education',
  'https://gofishdigital.com/services/owned/higher-education/'
];

async function main() {
  const fetch = (await import('node-fetch')).default;

  for (const url of sites) {
    try {
      const response = await fetch('http://localhost:3000/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const analysis = await response.json();

      console.log(`\n${url}`);
      console.log(`Overall: ${analysis.overallScore}%`);
      console.log(`Factors: ${Object.entries(analysis.factors).map(([k, v]) => `${k}:${v.score}`).join(', ')}`);
    } catch (error) {
      console.error(`\n${url}`);
      console.error(`Error: ${error.message}`);
    }
  }
}

main();
