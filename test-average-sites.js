#!/usr/bin/env node

const sites = [
  'https://diviner.agency/',
  'https://www.grossmanlaw.net/',
  'https://freeman.tulane.edu/'
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
      console.log(`Recommendation count: ${analysis.recommendations.length}`);
    } catch (error) {
      console.error(`\n${url}`);
      console.error(`Error: ${error.message}`);
    }
  }
}

main();
