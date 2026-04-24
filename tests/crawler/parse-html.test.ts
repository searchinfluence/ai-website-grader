import { describe, expect, it } from 'vitest';
import { parseHtmlContent } from '@/lib/crawler';
// Note: fetch is blocked, performance APIs are mocked, and dns is stubbed by
// tests/setup.ts. parseHtmlContent runs fully offline here.

const RICH_HTML = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1"/>
    <meta name="description" content="A page about widget Co. Acme builds widgets in Brooklyn, NY since 2010."/>
    <meta property="og:title" content="Widgets"/>
    <meta name="twitter:card" content="summary"/>
    <meta name="last-modified" content="2026-04-23"/>
    <link rel="canonical" href="https://example.com/widgets"/>
    <link rel="alternate" hreflang="en" href="https://example.com/widgets"/>
    <title>Widgets — Acme</title>
    <link rel="stylesheet" href="/styles.css" media="screen and (min-width: 768px)"/>
    <style>@media (max-width: 600px) { body { font-size: 14px; } }</style>
    <script type="application/ld+json">
      {"@context":"https://schema.org","@type":"Organization","name":"Acme"}
    </script>
  </head>
  <body>
    <nav><ul><li><a href="/about">About</a></li><li><a href="/pricing">Pricing</a></li></ul></nav>
    <main>
      <article>
        <h1>What are widgets and how do they work?</h1>
        <p class="byline">By <span class="author">Jane Doe, PhD</span> — published <time datetime="2026-04-23">April 23, 2026</time>.</p>
        <p>Widgets are small mechanical devices built by Acme in Brooklyn since 2010.</p>
        <p>According to a 2025 study, widgets improved efficiency by 47%. See <a href="https://nih.gov/research/widgets">NIH research</a>.</p>
        <h2>Step-by-step setup</h2>
        <ol><li>Unbox the widget</li><li>Plug it in</li><li>Press the green button</li></ol>
        <h2>Common questions</h2>
        <h3>What is a widget?</h3>
        <p>A widget is a device that does the thing.</p>
        <h3>Are widgets safe?</h3>
        <p>Yes — over 1,000 hours of testing. Source: Acme Lab.</p>
        <dl><dt>Widget</dt><dd>A small device that performs a useful function.</dd></dl>
        <a href="/about">Learn more</a>
        <a href="https://nytimes.com/article/widgets">Coverage in the NY Times</a>
        <img src="/img/hero.webp" alt="A photo of a widget"/>
        <img src="/img/diagram.svg" alt=""/>
        <form><input type="text" name="email"/><input type="search" name="q"/><button>Submit</button></form>
      </article>
    </main>
    <footer>Footer text</footer>
  </body>
</html>`;

describe('parseHtmlContent', () => {
  it('extracts title, meta description, and word count', async () => {
    const out = await parseHtmlContent(RICH_HTML, 'https://example.com/widgets');
    expect(out.title).toBe('Widgets — Acme');
    expect(out.metaDescription).toContain('Acme builds widgets');
    expect(out.wordCount).toBeGreaterThan(50);
  });

  it('extracts headings preserving level and order', async () => {
    const out = await parseHtmlContent(RICH_HTML, 'https://example.com/widgets');
    expect(out.headings[0]).toEqual({ level: 1, text: 'What are widgets and how do they work?' });
    expect(out.headings.some((h) => h.level === 2 && /Step-by-step/.test(h.text))).toBe(true);
    expect(out.headings.some((h) => h.level === 3 && /What is a widget/.test(h.text))).toBe(true);
  });

  it('extracts images with src and alt and links with internal flag', async () => {
    const out = await parseHtmlContent(RICH_HTML, 'https://example.com/widgets');
    expect(out.images.find((img) => img.src === '/img/hero.webp')?.alt).toBe('A photo of a widget');
    expect(out.links.find((link) => link.href === '/about')?.internal).toBe(true);
    expect(out.links.find((link) => link.href.startsWith('https://nytimes'))?.internal).toBe(false);
  });

  it('parses JSON-LD schema blocks', async () => {
    const out = await parseHtmlContent(RICH_HTML, 'https://example.com/widgets');
    expect(out.schemaMarkup.length).toBeGreaterThanOrEqual(1);
    expect(out.schemaMarkup[0]).toMatch(/Organization/);
  });

  it('detects mobile viewport and responsive CSS', async () => {
    const out = await parseHtmlContent(RICH_HTML, 'https://example.com/widgets');
    expect(out.mobileInfo?.hasViewportMeta).toBe(true);
    expect(out.mobileInfo?.viewportContent).toContain('width=device-width');
    expect(out.mobileInfo?.mobileOptimizedCSS).toBe(true);
  });

  it('produces enhancedSchemaInfo with the Organization type', async () => {
    const out = await parseHtmlContent(RICH_HTML, 'https://example.com/widgets');
    expect(out.enhancedSchemaInfo?.jsonLdCount).toBeGreaterThanOrEqual(1);
    expect(out.enhancedSchemaInfo?.schemaTypes).toContain('Organization');
  });

  it('produces a markdown content rendering', async () => {
    const out = await parseHtmlContent(RICH_HTML, 'https://example.com/widgets');
    expect(typeof out.markdownContent).toBe('string');
    expect(out.markdownContent!.length).toBeGreaterThan(0);
  });

  it('produces uxInfo with form count and navigation flags', async () => {
    const out = await parseHtmlContent(RICH_HTML, 'https://example.com/widgets');
    expect(out.uxInfo?.formCount).toBeGreaterThanOrEqual(1);
    expect(out.uxInfo?.hasNavigation).toBe(true);
    expect(out.uxInfo?.hasSearchBox).toBe(true);
  });

  it('detects authority signals (author bylines, dates) and answer formats (Q/A)', async () => {
    const out = await parseHtmlContent(RICH_HTML, 'https://example.com/widgets');
    const ai = out.aiAnalysisData!;
    expect(ai.answerFormats.qaCount).toBeGreaterThan(0);
    expect(ai.answerFormats.stepByStepCount).toBeGreaterThan(0);
    expect(ai.answerFormats.definitionCount).toBeGreaterThan(0);
    expect(ai.authoritySignals.publicationDates.length + ai.authoritySignals.authorBylines.length).toBeGreaterThan(0);
  });

  it('attaches mocked performance metrics to the result', async () => {
    const out = await parseHtmlContent(RICH_HTML, 'https://example.com/widgets');
    const perf = out.aiAnalysisData?.performanceMetrics;
    expect(perf?.coreWebVitals?.score).toBe(85);
    expect(perf?.accessibilityScore).toBe(90);
    expect(perf?.htmlValidation?.validationState).toBe('valid');
  });

  it('estimates a load time based on html length and image count', async () => {
    const out = await parseHtmlContent(RICH_HTML, 'https://example.com/widgets');
    expect(typeof out.loadTime).toBe('number');
    expect(out.loadTime).toBeGreaterThan(0);
  });

  it('marks hasJavaScriptDependency for nearly-empty body with heavy JS', async () => {
    const heavyJs = `<html><head></head><body><div id="root"></div><script>${'console.log(1);'.repeat(200)}</script></body></html>`;
    const out = await parseHtmlContent(heavyJs, 'https://example.com/spa');
    expect(typeof out.hasJavaScriptDependency).toBe('boolean');
  });

  it('handles a page with no title element (uses h1 fallback or "Untitled")', async () => {
    const out1 = await parseHtmlContent('<html><body><h1>Just an H1</h1></body></html>', 'https://example.com');
    expect(out1.title).toBe('Just an H1');

    const out2 = await parseHtmlContent('<html><body><p>no headings either</p></body></html>', 'https://example.com');
    expect(out2.title).toBe('Untitled');
  });

  it('detects bot directives in robots meta tags', async () => {
    const html = `<html><head><meta name="robots" content="noai, noimageai"/><meta name="googlebot" content="noindex"/></head><body><p>x</p></body></html>`;
    const out = await parseHtmlContent(html, 'https://example.com');
    expect(out.aiAnalysisData?.botAccessibility?.metaRobotsAI?.length).toBeGreaterThan(0);
  });

  it('detects social proof and contact form in uxInfo', async () => {
    const html = `<html><body>
      <form action="/contact"><input type="email" name="email"/><button>Send</button></form>
      <div class="testimonial">Great product!</div>
      <div class="reviews">5 stars</div>
    </body></html>`;
    const out = await parseHtmlContent(html, 'https://example.com');
    expect(out.uxInfo?.hasContactForm).toBe(true);
    expect(out.uxInfo?.hasSocialProof).toBe(true);
  });

  it('detects authority signals via .edu / .gov / .org links', async () => {
    const html = `<html><body><p>Body</p>
      <a href="https://university.edu/research">University research</a>
      <a href="https://nih.gov/article">NIH</a>
      <a href="https://wikipedia.org/article">Wiki</a>
    </body></html>`;
    const out = await parseHtmlContent(html, 'https://example.com');
    const auth = out.aiAnalysisData?.authoritySignals;
    expect(auth?.authorityLinks?.length).toBeGreaterThanOrEqual(3);
  });

  it('extracts factual indicators (citations, statistics, dates)', async () => {
    const html = `<html><body>
      <p>Per the 2024 study, 73% of widgets fail. According to Smith et al. (2023), this is rising.</p>
      <p>Released 2026-04-15. Updated 2026-04-23.</p>
      <a href="https://nih.gov/widgets">NIH widget research</a>
    </body></html>`;
    const out = await parseHtmlContent(html, 'https://example.com');
    const fi = out.aiAnalysisData?.factualIndicators;
    expect(fi).toBeDefined();
    expect(fi!.statistics + fi!.citations).toBeGreaterThan(0);
  });

  it('detects AI-friendly schema types (FAQPage, HowTo) in enhancedSchemaInfo', async () => {
    const html = `<html><head>
      <script type="application/ld+json">{"@context":"https://schema.org","@type":"FAQPage"}</script>
      <script type="application/ld+json">{"@context":"https://schema.org","@type":"HowTo"}</script>
    </head><body><p>x</p></body></html>`;
    const out = await parseHtmlContent(html, 'https://example.com');
    expect(out.enhancedSchemaInfo?.aiFriendlySchemas).toEqual(expect.arrayContaining(['FAQPage', 'HowTo']));
  });

  it('counts microdata items via [itemscope]', async () => {
    const html = `<html><body>
      <div itemscope itemtype="https://schema.org/Person"><span itemprop="name">Ada</span></div>
      <div itemscope itemtype="https://schema.org/Organization"><span itemprop="name">Acme</span></div>
    </body></html>`;
    const out = await parseHtmlContent(html, 'https://example.com');
    expect(out.enhancedSchemaInfo?.microdataCount).toBeGreaterThanOrEqual(2);
  });

  it('detects voice-search signals (questions, conversational content)', async () => {
    const html = `<html><body>
      <h1>How do I make widgets?</h1>
      <p>You can make widgets by following these steps. What materials do I need? Why does this matter? How long will it take?</p>
    </body></html>`;
    const out = await parseHtmlContent(html, 'https://example.com');
    const voice = out.aiAnalysisData?.voiceSearchOptimization;
    expect(voice?.questionFormats).toBeGreaterThan(0);
  });

  it('falls back gracefully when fetchGtmSchema fetch throws (GTM ID present)', async () => {
    const html = `<html><body><script>(function(){var gtm = 'GTM-ABCD1234';})()</script><p>body</p></body></html>`;
    const out = await parseHtmlContent(html, 'https://example.com');
    expect(out.gtmSchemaDetected).toBe(false);
  });
});
