#!/usr/bin/env node

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

async function main() {
  const fetch = (await import('node-fetch')).default;

  for (const url of testUrls) {
    try {
      const response = await fetch('http://localhost:3000/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const analysis = await response.json();
      console.log(`\n${url}`);
      console.log(`Overall: ${analysis.overallScore}%`);
      Object.entries(analysis.factors).forEach(([key, factor]) => {
        console.log(`  ${key}: ${factor.score}%`);
      });
      console.log(`Recommendations: ${analysis.recommendations.length}`);
    } catch (error) {
      console.error(`\n${url}`);
      console.error(`Error: ${error.message}`);
    }

    await new Promise((resolve) => setTimeout(resolve, 1500));
  }
}

main();
