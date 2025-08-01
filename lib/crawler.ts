import * as cheerio from 'cheerio';
import { CrawledContent } from '@/types';
import { 
  analyzePerformanceMetrics, 
  performanceCache, 
  createCacheKey, 
  shouldUseCache 
} from './performance-apis';

export async function crawlWebsite(url: string): Promise<CrawledContent> {
  // Validate and normalize URL
  const normalizedUrl = normalizeUrl(url);
  
  // Fetch with timeout and error handling
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);
  
  try {
    const response = await fetch(normalizedUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'AI-Website-Grader/1.0 (+https://example.com/bot)',
      },
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const html = await response.text();
    
    // Fetch robots.txt info in parallel
    const robotsInfoPromise = fetchRobotsInfo(normalizedUrl);
    
    // Parse HTML content
    const content = await parseHtmlContent(html, normalizedUrl);
    
    // Add robots info
    content.robotsInfo = await robotsInfoPromise;
    
    return content;
    
  } catch (error) {
    clearTimeout(timeoutId);
    throw new Error(`Failed to crawl website: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function parseTextContent(text: string): Promise<CrawledContent> {
  // Handle manual text input as basic HTML
  const fakeHtml = `<html><body><div>${text.replace(/\n/g, '</p><p>')}</div></body></html>`;
  const content = await parseHtmlContent(fakeHtml, 'manual-input');
  
  // Add default values for manual input
  content.robotsInfo = {
    hasRobotsTxt: false,
    allowsAllBots: true,
    hasSpecificBotRules: false
  };
  
  // Add default mobile and schema info for manual input
  content.mobileInfo = {
    hasViewportMeta: false,
    hasTouchableElements: false,
    usesResponsiveImages: false,
    mobileOptimizedCSS: false
  };
  
  content.enhancedSchemaInfo = {
    jsonLdCount: 0,
    microdataCount: 0,
    schemaTypes: [],
    validationErrors: [],
    aiFriendlySchemas: [],
    conversationalElements: 0
  };
  
  // Add default markdown content for manual input
  content.markdownContent = text; // Use the original text as markdown
  
    // Add default UX info for manual input
  content.uxInfo = {
    hasNavigation: false,
    navigationStructure: [],
    formCount: 0,
    formFields: [],
    hasSearchBox: false,
    hasContactForm: false,
    hasErrorPages: false,
    accessibilityFeatures: [],
    interactiveElementsCount: 0,
    hasLoadingIndicators: false,
    hasSocialProof: false,
    socialElements: []
  };
  
  // Add default AI analysis data for manual input
  content.aiAnalysisData = {
    detectedEntities: {
      persons: [],
      organizations: [],
      locations: [],
      brands: []
    },
    answerFormats: {
      qaCount: 0,
      listCount: 0,
      stepByStepCount: 0,
      definitionCount: 0
    },
    authoritySignals: {
      authorBylines: [],
      publicationDates: [],
      credentialMentions: [],
      authorityLinks: []
    },
    factualIndicators: {
      citations: 0,
      statistics: 0,
      dates: [],
      sources: [],
      externalLinks: 0
    },
    botAccessibility: {
      aiBotDirectives: {
        gptBot: 'unspecified',
        googleExtended: 'unspecified',
        chatgptUser: 'unspecified',
        claudeWeb: 'unspecified',
        bingBot: 'unspecified',
        ccBot: 'unspecified',
        perplexityBot: 'unspecified'
      },
      metaRobotsAI: [],
      contentAvailability: 'full',
      botSimulation: {
        contentExtracted: text.split(' ').length, // Word count as content
        priorityContentFound: true, // Manual input is always priority
        structuredDataPresent: false,
        accessibilityScore: 80 // High score for manual input
      }
    },
    voiceSearchOptimization: {
      naturalLanguagePatterns: 0,
      conversationalContent: 0,
      questionFormats: 0,
      speakableContent: false
    }
  };

  return content;
}

// Performance analysis with caching
async function analyzePerformanceWithCaching(url: string, html: string): Promise<{
  coreWebVitals?: {
    lcp: number;
    fid: number;
    cls: number;
    score: number;
  };
  htmlValidation?: {
    errors: number;
    warnings: number;
    isValid: boolean;
    messages: Array<{
      type: 'error' | 'warning' | 'info';
      message: string;
      line?: number;
    }>;
  };
  accessibilityScore?: number;
  performanceScore?: number;
}> {
  // Check cache first (if not localhost)
  if (shouldUseCache(url)) {
    const cacheKey = createCacheKey(url, 'performance');
    const cached = performanceCache.get(cacheKey);
    if (cached) {
      return cached;
    }
  }
  
  // Perform analysis
  const metrics = await analyzePerformanceMetrics(url, html);
  
  // Cache results (if not localhost)
  if (shouldUseCache(url)) {
    const cacheKey = createCacheKey(url, 'performance');
    performanceCache.set(cacheKey, metrics, 300000); // Cache for 5 minutes
  }
  
  return metrics;
}

async function parseHtmlContent(html: string, url: string): Promise<CrawledContent> {
  const $ = cheerio.load(html) as cheerio.CheerioAPI;
  
  // Extract title
  const title = $('title').text().trim() || $('h1').first().text().trim() || 'Untitled';
  
  // Extract meta description
  const metaDescription = $('meta[name="description"]').attr('content') || '';
  
  // Extract headings with hierarchy
  const headings: { level: number; text: string }[] = [];
  $('h1, h2, h3, h4, h5, h6').each((_, element) => {
    const tagName = $(element).prop('tagName') || 'h1';
    const level = parseInt(tagName.substring(1));
    const text = $(element).text().trim();
    if (text) headings.push({ level, text });
  });
  
  // Extract paragraphs
  const paragraphs: string[] = [];
  $('p, div').each((_, element) => {
    const text = $(element).text().trim();
    if (text && text.length > 20) {
      paragraphs.push(text);
    }
  });
  
  // Extract images
  const images: { src: string; alt: string }[] = [];
  $('img').each((_, element) => {
    const src = $(element).attr('src') || '';
    const alt = $(element).attr('alt') || '';
    if (src) images.push({ src, alt });
  });
  
  // Extract links
  const links: { href: string; text: string; internal: boolean }[] = [];
  $('a[href]').each((_, element) => {
    const href = $(element).attr('href') || '';
    const text = $(element).text().trim();
    const internal = href.startsWith('/') || href.includes(new URL(url).hostname);
    if (href && text) links.push({ href, text, internal });
  });
  
  // Calculate word count
  const wordCount = $('body').text().split(/\s+/).length;
  
  // Extract schema markup
  const schemaMarkup: string[] = [];
  $('script[type="application/ld+json"]').each((_, element) => {
    const content = $(element).html();
    if (content) schemaMarkup.push(content.trim());
  });
  
  // Analyze mobile information
  const mobileInfo = analyzeMobileInfo($, html);
  
  // Analyze enhanced schema information
  const enhancedSchemaInfo = analyzeEnhancedSchemaInfo($, schemaMarkup);
  
  // Check for JavaScript dependency
  const hasJavaScriptDependency = analyzeJavaScriptDependency($, html);
  
  // Estimate load time (simplified for demo - in production this would be measured)
  const loadTime = estimateLoadTime(html, images.length);
  
  // Generate markdown content
  const markdownContent = generateMarkdownContent($, title);
  
  // Analyze UX information
  const uxInfo = analyzeUXInfo($, html);
  
  // Enhanced AI analysis
  const aiAnalysisData = analyzeAIContent($, html, { title, paragraphs, headings, links });
  
  // Performance analysis (async - may use free APIs)
  const performanceMetrics = await analyzePerformanceWithCaching(url, html);
  console.log('Performance Metrics from Crawler:', performanceMetrics);
  
  // Ensure aiAnalysisData is always defined with performance metrics
  const finalAIAnalysisData = aiAnalysisData ? {
    ...aiAnalysisData,
    performanceMetrics
  } : {
    detectedEntities: {
      persons: [],
      organizations: [],
      locations: [],
      brands: []
    },
    answerFormats: {
      qaCount: 0,
      listCount: 0,
      stepByStepCount: 0,
      definitionCount: 0
    },
    authoritySignals: {
      authorBylines: [],
      publicationDates: [],
      credentialMentions: [],
      authorityLinks: []
    },
    factualIndicators: {
      citations: 0,
      statistics: 0,
      dates: [],
      sources: [],
      externalLinks: 0
    },
          botAccessibility: {
        aiBotDirectives: {
          gptBot: 'unspecified' as const,
          googleExtended: 'unspecified' as const,
          chatgptUser: 'unspecified' as const,
          claudeWeb: 'unspecified' as const,
          bingBot: 'unspecified' as const,
          ccBot: 'unspecified' as const,
          perplexityBot: 'unspecified' as const
        },
        metaRobotsAI: [],
        contentAvailability: 'full' as const,
        botSimulation: {
          contentExtracted: 0,
          priorityContentFound: false,
          structuredDataPresent: false,
          accessibilityScore: 0
        }
      },
    voiceSearchOptimization: {
      naturalLanguagePatterns: 0,
      conversationalContent: 0,
      questionFormats: 0,
      speakableContent: false
    },
    performanceMetrics
  };

  return {
    title,
    metaDescription,
    headings,
    paragraphs,
    images,
    links,
    wordCount,
    html,
    url,
    schemaMarkup,
    loadTime,
    hasJavaScriptDependency,
    mobileInfo,
    enhancedSchemaInfo,
    markdownContent,
    uxInfo,
    aiAnalysisData: finalAIAnalysisData
  };
}

function analyzeJavaScriptDependency($: cheerio.CheerioAPI, html: string): boolean {
  // Check for script tags
  const scriptTags = $('script').length;
  
  // Check for common JS frameworks
  const hasReactVue = html.includes('react') || html.includes('vue') || html.includes('angular');
  
  // Check for dynamic content indicators
  const hasDynamicContent = html.includes('data-') || html.includes('ng-') || html.includes('v-');
  
  // Check for single page app indicators
  const isSPA = $('div[id="root"]').length > 0 || $('div[id="app"]').length > 0;
  
  return scriptTags > 3 || hasReactVue || hasDynamicContent || isSPA;
}

function estimateLoadTime(html: string, imageCount: number): number {
  // Simple estimation based on content size
  const htmlSize = html.length;
  
  // Base time in seconds
  let estimatedTime = 0.5; // Base 500ms
  
  // Add time based on HTML size
  if (htmlSize > 50000) estimatedTime += 0.5;
  if (htmlSize > 100000) estimatedTime += 1.0;
  
  // Add time based on image count
  estimatedTime += imageCount * 0.1;
  
  return Math.round(estimatedTime * 100) / 100; // Round to 2 decimal places
}

async function fetchRobotsInfo(url: string): Promise<CrawledContent['robotsInfo']> {
  try {
    const robotsUrl = new URL('/robots.txt', url).toString();
    const response = await fetch(robotsUrl);
    
    if (!response.ok) {
      return {
        hasRobotsTxt: false,
        allowsAllBots: true, // Assume allowed if no robots.txt
        hasSpecificBotRules: false
      };
    }
    
    const content = await response.text();
    const allowsAllBots = content.includes('User-agent: *') && content.includes('Allow: /');
    
    // Enhanced AI bot detection
    const aiBotNames = ['GPTBot', 'ChatGPT', 'CCBot', 'Google-Extended', 'Claude-Web', 'PerplexityBot', 'BingBot'];
    const hasSpecificBotRules = aiBotNames.some(bot => content.includes(bot));
    
    return {
      hasRobotsTxt: true,
      allowsAllBots,
      hasSpecificBotRules,
      content
    };
  } catch {
    return {
      hasRobotsTxt: false,
      allowsAllBots: true,
      hasSpecificBotRules: false
    };
  }
}

function analyzeMobileInfo($: cheerio.CheerioAPI, html: string): CrawledContent['mobileInfo'] {
  // Check for viewport meta tag
  const viewportMeta = $('meta[name="viewport"]');
  const hasViewportMeta = viewportMeta.length > 0;
  const viewportContent = viewportMeta.attr('content');
  
  // Check for responsive design indicators
  const usesResponsiveImages = $('img[srcset]').length > 0 || html.includes('picture');
  
  // Check for mobile-optimized CSS
  const mobileOptimizedCSS = html.includes('@media') || 
                            $('link[media*="screen"]').length > 0 ||
                            html.includes('responsive') ||
                            html.includes('mobile');
  
  // Check for touchable elements
  const hasTouchableElements = $('button').length > 0 || 
                              $('a').length > 0 || 
                              $('input[type="button"]').length > 0 ||
                              $('input[type="submit"]').length > 0;
  
  return {
    hasViewportMeta,
    viewportContent,
    hasTouchableElements,
    usesResponsiveImages,
    mobileOptimizedCSS
  };
}

function analyzeEnhancedSchemaInfo($: cheerio.CheerioAPI, schemaMarkup: string[]): CrawledContent['enhancedSchemaInfo'] {
  const jsonLdCount = schemaMarkup.length;
  
  // Count microdata elements
  const microdataCount = $('[itemscope]').length;
  
  // Extract schema types
  const schemaTypes: string[] = [];
  const validationErrors: string[] = [];
  
  schemaMarkup.forEach((schema, index) => {
    try {
      const parsed = JSON.parse(schema);
      
      // Extract @type values
      function extractTypes(obj: unknown): void {
        if (obj && typeof obj === 'object' && obj !== null) {
          const objRecord = obj as Record<string, unknown>;
          if (objRecord['@type']) {
            const type = Array.isArray(objRecord['@type']) ? objRecord['@type'] : [objRecord['@type']];
            type.forEach((t: unknown) => {
              if (typeof t === 'string' && !schemaTypes.includes(t)) {
                schemaTypes.push(t);
              }
            });
          }
          
          // Recursively check nested objects
          Object.values(objRecord).forEach(value => {
            if (typeof value === 'object') {
              extractTypes(value);
            }
          });
        }
      }
      
      extractTypes(parsed);
      
      // Basic validation
      if (!parsed['@context']) {
        validationErrors.push(`Schema ${index + 1}: Missing @context`);
      }
      
      if (!parsed['@type']) {
        validationErrors.push(`Schema ${index + 1}: Missing @type`);
      }
      
    } catch {
      validationErrors.push(`Schema ${index + 1}: Invalid JSON syntax`);
    }
  });
  
  // Enhanced AI-friendly schema analysis
  const aiFriendlySchemas: string[] = [];
  let conversationalElements = 0;
  
  // Check for AI-friendly schema types
  const aiFriendlyTypes = ['FAQPage', 'QAPage', 'HowTo', 'Article', 'NewsArticle', 'BlogPosting', 'Recipe', 'Guide'];
  schemaTypes.forEach(type => {
    if (aiFriendlyTypes.includes(type)) {
      aiFriendlySchemas.push(type);
    }
  });
  
  // Count conversational elements for AI optimization
  schemaMarkup.forEach(schema => {
    try {
      const data = JSON.parse(schema);
      
      // Count FAQ/Q&A elements
      if (data.mainEntity && Array.isArray(data.mainEntity)) {
        conversationalElements += data.mainEntity.length;
      } else if (data.mainEntity) {
        conversationalElements += 1;
      }
      
      // Count HowTo steps
      if (data['@type'] === 'HowTo' && data.step) {
        conversationalElements += Array.isArray(data.step) ? data.step.length : 1;
      }
      
      // Count recipe instructions
      if (data['@type'] === 'Recipe' && data.recipeInstructions) {
        conversationalElements += Array.isArray(data.recipeInstructions) ? data.recipeInstructions.length : 1;
      }
    } catch {
      // Invalid JSON, skip
    }
  });
  
  return {
    jsonLdCount,
    microdataCount,
    schemaTypes,
    validationErrors,
    aiFriendlySchemas: [...new Set(aiFriendlySchemas)], // Remove duplicates
    conversationalElements
  };
}

function normalizeUrl(url: string): string {
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`;
  }
  return url;
}

function generateMarkdownContent(
  $: cheerio.CheerioAPI, 
  title: string
): string {
  let markdown = `# ${title}\n\n`;
  
  // Simulate real bot behavior: Start with the most important content first
  // Real bots prioritize content based on visual hierarchy, position, and semantic importance
  
  // 1. Extract and prioritize main content area (like a real bot would)
  const mainContent = $('main, article, .content, .main-content, #content, .post-content, .entry-content, .page-content, [role="main"]').first();
  const contentArea = mainContent.length > 0 ? mainContent : $('body');
  
  // 2. Remove elements that real bots typically ignore or deprioritize
  const elementsToRemove = [
    'nav', '.nav', '.navigation', '.navbar', '.menu', '.breadcrumb',
    'footer', '.footer', '.site-footer', '.page-footer',
    '.sidebar', '.widget', '.advertisement', '.ads', '.ad',
    '.social-share', '.share-buttons', '.related-posts',
    '.comments', '.comment-section', '.disqus',
    '.newsletter', '.subscribe', '.cta',
    'script', 'style', '.hidden', '[style*="display: none"]',
    '.cookie-notice', '.popup', '.modal', '.overlay'
  ];
  
  elementsToRemove.forEach(selector => {
    contentArea.find(selector).remove();
  });
  
  // 3. Simulate bot content prioritization (larger text, prominent position = higher priority)
  const contentElements: Array<{
    type: 'heading' | 'paragraph' | 'list' | 'blockquote' | 'div' | 'table' | 'image';
    content: string;
    level?: number;
    isOrdered?: boolean;
    priority: number; // Bot priority score
    position: number; // DOM position
  }> = [];
  
  let elementIndex = 0;
  
  // Process elements in document order (like a real bot)
  contentArea.find('h1, h2, h3, h4, h5, h6, p, ul, ol, blockquote, table, img, figure').each((_, element) => {
    const $el = $(element);
    const tagName = $el.prop('tagName')?.toLowerCase() || '';
    const text = $el.text().trim();
    
    // Skip empty elements, nested list items, and elements that are children of already processed elements
    if (!text || $el.parents('ul, ol').length > 0) return;
    
    // Skip if this element is inside a div that we're processing separately
    if ($el.parents('div').length > 0 && $el.parents('div').find('h1, h2, h3, h4, h5, h6, p, ul, ol, blockquote, table, img, figure').length > 1) {
      return;
    }
    
    // Calculate bot priority score (simulating how bots prioritize content)
    let priority = 50; // Base priority
    const content = text;
    
    if (tagName.startsWith('h')) {
      const level = parseInt(tagName.charAt(1));
      // Headings get slight priority boost but maintain document order
      priority = 55 + (6 - level); // H1 = 60, H2 = 59, etc.
      contentElements.push({
        type: 'heading',
        content,
        level,
        priority,
        position: elementIndex++
      });
    } else if (tagName === 'p') {
      // Paragraphs get slight priority based on length
      priority = 50 + Math.min(10, content.length / 50);
      
      contentElements.push({
        type: 'paragraph',
        content,
        priority,
        position: elementIndex++
      });
    } else if (tagName === 'ul' || tagName === 'ol') {
      const isOrdered = tagName === 'ol';
      const listItems: string[] = [];
      
      $el.find('li').each((_, item) => {
        const itemText = $(item).text().trim();
        if (itemText) {
          listItems.push(itemText);
        }
      });
      
      if (listItems.length > 0) {
        // Lists get slight priority boost
        priority = 52 + Math.min(8, listItems.length);
        
        contentElements.push({
          type: 'list',
          content: listItems.join('\n'),
          isOrdered,
          priority,
          position: elementIndex++
        });
      }
    } else if (tagName === 'blockquote') {
      // Blockquotes get slight priority boost
      priority = 53;
      contentElements.push({
        type: 'blockquote',
        content,
        priority,
        position: elementIndex++
      });
    } else if (tagName === 'table') {
      // Tables get slight priority boost
      const cells = $el.find('td, th').length;
      priority = 51 + Math.min(5, cells / 5);
      
      const tableContent = $el.find('td, th').map((_, cell) => $(cell).text().trim()).get().join(' | ');
      if (tableContent.length > 20) {
        contentElements.push({
          type: 'table',
          content: tableContent,
          priority,
          position: elementIndex++
        });
      }
    } else if (tagName === 'img' || tagName === 'figure') {
      // Images with good alt text get slight priority
      const $img = tagName === 'img' ? $el : $el.find('img');
      const src = $img.attr('src');
      const alt = $img.attr('alt') || '';
      const title = $img.attr('title') || '';
      
      if (src && (alt.length > 10 || title.length > 10)) {
        priority = 52;
        const caption = alt || title || 'Image';
        contentElements.push({
          type: 'image',
          content: `![${caption}](${src})`,
          priority,
          position: elementIndex++
        });
      }
    }
  });
  
  // 4. Sort by document order with intelligent prioritization (like real bots read)
  contentElements.sort((a, b) => {
    // Primary sort: document position (maintain reading order)
    if (a.position !== b.position) {
      return a.position - b.position;
    }
    // Secondary sort: priority (for elements at same position)
    return b.priority - a.priority;
  });
  
  // 5. Add Navigation Context section (like bots analyze site structure)
  const navigationContext = extractNavigationContext($);
  if (navigationContext) {
    markdown += `## Navigation Context (Bot-Analyzed)\n\n${navigationContext}\n\n`;
  }
  
  // 6. Add Technical SEO Signals section (like bots detect technical issues)
  const technicalSignals = extractTechnicalSignals($);
  if (technicalSignals) {
    markdown += `## Technical SEO Signals (Bot-Detected)\n\n${technicalSignals}\n\n`;
  }
  
  // 7. Add main content section (like bots extract primary content)
  markdown += `## Main Content (Bot-Extracted)\n\n`;
  
  contentElements.forEach(element => {
    if (element.type === 'heading' && element.level) {
      const prefix = '#'.repeat(element.level);
      markdown += `${prefix} ${element.content}\n\n`;
    } else if (element.type === 'paragraph') {
      markdown += `${element.content}\n\n`;
    } else if (element.type === 'list') {
      const lines = element.content.split('\n');
      lines.forEach((line, index) => {
        const prefix = element.isOrdered ? `${index + 1}. ` : '- ';
        markdown += `${prefix}${line}\n`;
      });
      markdown += '\n';
    } else if (element.type === 'blockquote') {
      markdown += `> ${element.content}\n\n`;
    } else if (element.type === 'table') {
      markdown += `**Table Data:** ${element.content}\n\n`;
    } else if (element.type === 'image') {
      markdown += `${element.content}\n\n`;
    } else if (element.type === 'div') {
      markdown += `${element.content}\n\n`;
    }
  });
  
  // 8. Add structured data (like bots extract)
  const structuredData = extractStructuredData($);
  if (structuredData.length > 0) {
    markdown += '## Structured Data (Bot-Extracted)\n\n';
    structuredData.forEach(item => {
      markdown += `- **${item.type}**: ${item.content}\n`;
    });
    markdown += '\n';
  }
  
  // 9. Add key links (like bots prioritize important links)
  const importantLinks = extractImportantLinks($);
  if (importantLinks.length > 0) {
    markdown += '## Key Links (Bot-Prioritized)\n\n';
    importantLinks.forEach(link => {
      markdown += `- [${link.text}](${link.href})\n`;
    });
    markdown += '\n';
  }
  
  return markdown;
}

// Helper function to extract structured data (like real bots do)
function extractStructuredData($: cheerio.CheerioAPI): Array<{type: string, content: string}> {
  const structuredData: Array<{type: string, content: string}> = [];
  
  // Extract JSON-LD structured data
  $('script[type="application/ld+json"]').each((_, script) => {
    try {
      const content = $(script).html();
      if (content) {
        const data = JSON.parse(content);
        if (data['@type']) {
          structuredData.push({
            type: 'JSON-LD',
            content: `${data['@type']}: ${data.name || data.title || 'Structured Data'}`
          });
        }
      }
    } catch {
      // Ignore invalid JSON
    }
  });
  
  // Extract microdata
  $('[itemtype]').each((_, element) => {
    const itemtype = $(element).attr('itemtype');
    const itemname = $(element).find('[itemprop="name"]').text().trim();
    if (itemtype && itemname) {
      structuredData.push({
        type: 'Microdata',
        content: `${itemtype.split('/').pop()}: ${itemname}`
      });
    }
  });
  
  // Extract meta tags (like bots do)
  $('meta[property^="og:"], meta[name^="twitter:"]').each((_, meta) => {
    const property = $(meta).attr('property') || $(meta).attr('name');
    const content = $(meta).attr('content');
    if (property && content) {
      structuredData.push({
        type: 'Meta Tag',
        content: `${property}: ${content}`
      });
    }
  });
  
  return structuredData.slice(0, 10); // Limit to most important
}

// Helper function to extract important links (like bots prioritize)
function extractImportantLinks($: cheerio.CheerioAPI): Array<{href: string, text: string}> {
  const links: Array<{href: string, text: string, importance: number}> = [];
  
  $('a[href]').each((_, link) => {
    const $link = $(link);
    const href = $link.attr('href');
    const text = $link.text().trim();
    
    if (href && text && text.length > 2) {
      let importance = 50; // Base importance
      
      // Links in main content are more important
      if ($link.closest('main, article, .content').length > 0) {
        importance += 20;
      }
      
      // Longer link text = more descriptive = more important
      if (text.length > 10) importance += 10;
      
      // Internal links are often more important
      if (href.startsWith('/') || href.startsWith('#')) {
        importance += 15;
      }
      
      // Links with specific classes/IDs might be important
      if ($link.hasClass('cta') || $link.hasClass('button') || $link.attr('id')?.includes('main')) {
        importance += 20;
      }
      
      links.push({ href, text, importance });
    }
  });
  
  // Sort by importance and return top links
  return links
    .sort((a, b) => b.importance - a.importance)
    .slice(0, 15)
    .map(({ href, text }) => ({ href, text }));
}

// Helper function to extract navigation context (like bots analyze site structure)
function extractNavigationContext($: cheerio.CheerioAPI): string {
  const sections: string[] = [];
  
  // Analyze main navigation
  const mainNav = $('nav, .nav, .navigation, header nav');
  if (mainNav.length > 0) {
    const navItems: string[] = [];
    mainNav.find('a').each((_, link) => {
      const text = $(link).text().trim();
      if (text && text.length > 2 && text.length < 30) {
        navItems.push(text);
      }
    });
    if (navItems.length > 0) {
      sections.push(`**Main Navigation**: ${navItems.slice(0, 8).join(', ')}`);
    }
  }
  
  // Analyze breadcrumbs
  const breadcrumbs = $('.breadcrumb, .breadcrumbs, [aria-label*="breadcrumb"]');
  if (breadcrumbs.length > 0) {
    const breadcrumbItems: string[] = [];
    breadcrumbs.find('a, span').each((_, item) => {
      const text = $(item).text().trim();
      if (text && text.length > 1 && text.length < 20) {
        breadcrumbItems.push(text);
      }
    });
    if (breadcrumbItems.length > 0) {
      sections.push(`**Breadcrumb Navigation**: ${breadcrumbItems.join(' > ')}`);
    }
  }
  
  // Analyze footer navigation
  const footerNav = $('footer, .footer');
  if (footerNav.length > 0) {
    const footerLinks: string[] = [];
    footerNav.find('a').each((_, link) => {
      const text = $(link).text().trim();
      if (text && text.length > 2 && text.length < 25) {
        footerLinks.push(text);
      }
    });
    if (footerLinks.length > 0) {
      sections.push(`**Footer Navigation**: ${footerLinks.slice(0, 6).join(', ')}`);
    }
  }
  
  // Analyze internal linking
  const internalLinks = $('a[href^="/"], a[href^="./"], a[href^="../"]').length;
  const externalLinks = $('a[href^="http"]').length;
  if (internalLinks > 0) {
    sections.push(`**Internal Links**: ${internalLinks} detected`);
  }
  if (externalLinks > 0) {
    sections.push(`**External Links**: ${externalLinks} detected`);
  }
  
  return sections.length > 0 ? sections.join('\n\n') : '';
}

// Helper function to extract technical SEO signals (like bots detect technical issues)
function extractTechnicalSignals($: cheerio.CheerioAPI): string {
  const signals: string[] = [];
  
  // Meta tags analysis
  const title = $('title').text().trim();
  const metaDescription = $('meta[name="description"]').attr('content');
  const ogTitle = $('meta[property="og:title"]').attr('content');
  const ogDescription = $('meta[property="og:description"]').attr('content');
  
  if (title) {
    signals.push(`**Title Tag**: ✅ Present (${title.length} characters)`);
  } else {
    signals.push(`**Title Tag**: ❌ Missing`);
  }
  
  if (metaDescription) {
    signals.push(`**Meta Description**: ✅ Present (${metaDescription.length} characters)`);
  } else {
    signals.push(`**Meta Description**: ❌ Missing`);
  }
  
  if (ogTitle || ogDescription) {
    signals.push(`**Open Graph Tags**: ✅ Present`);
  } else {
    signals.push(`**Open Graph Tags**: ❌ Missing`);
  }
  
  // Structured data analysis
  const jsonLd = $('script[type="application/ld+json"]').length;
  const microdata = $('[itemtype]').length;
  
  if (jsonLd > 0) {
    signals.push(`**JSON-LD Structured Data**: ✅ ${jsonLd} script(s) detected`);
  } else {
    signals.push(`**JSON-LD Structured Data**: ❌ Not detected`);
  }
  
  if (microdata > 0) {
    signals.push(`**Microdata**: ✅ ${microdata} item(s) detected`);
  } else {
    signals.push(`**Microdata**: ❌ Not detected`);
  }
  
  // Canonical and hreflang
  const canonical = $('link[rel="canonical"]').attr('href');
  const hreflang = $('link[rel="alternate"][hreflang]').length;
  
  if (canonical) {
    signals.push(`**Canonical URL**: ✅ Present`);
  } else {
    signals.push(`**Canonical URL**: ❌ Missing`);
  }
  
  if (hreflang > 0) {
    signals.push(`**Hreflang Tags**: ✅ ${hreflang} language(s) detected`);
  } else {
    signals.push(`**Hreflang Tags**: ❌ Not detected`);
  }
  
  // Robots and sitemap
  const robots = $('meta[name="robots"]').attr('content');
  const sitemap = $('link[rel="sitemap"]').length || $('a[href*="sitemap"]').length;
  
  if (robots) {
    signals.push(`**Robots Meta**: ✅ "${robots}"`);
  } else {
    signals.push(`**Robots Meta**: ❌ Not specified`);
  }
  
  if (sitemap > 0) {
    signals.push(`**Sitemap Reference**: ✅ Detected`);
  } else {
    signals.push(`**Sitemap Reference**: ❌ Not detected`);
  }
  
  return signals.length > 0 ? signals.join('\n\n') : '';
}

function analyzeUXInfo($: cheerio.CheerioAPI, html: string): CrawledContent['uxInfo'] {
  // Navigation analysis
  const navElements = $('nav, .nav, .navigation, .navbar, .menu');
  const hasNavigation = navElements.length > 0;
  const navigationStructure: string[] = [];
  
  navElements.find('a, li').each((_, element) => {
    const text = $(element).text().trim();
    if (text && text.length < 50) { // Reasonable nav item length
      navigationStructure.push(text);
    }
  });
  
  // Form analysis
  const forms = $('form');
  const formCount = forms.length;
  const formFields: string[] = [];
  
  forms.find('input, textarea, select').each((_, field) => {
    const $field = $(field);
    const type = $field.attr('type') || $field.prop('tagName')?.toLowerCase() || 'input';
    const name = $field.attr('name') || $field.attr('id') || type;
    formFields.push(name);
  });
  
  // Search functionality
  const searchInputs = $('input[type="search"], input[name*="search"], input[id*="search"], input[placeholder*="search" i]');
  const hasSearchBox = searchInputs.length > 0;
  
  // Contact form detection
  const contactForms = $('form').filter((_, form) => {
    const formHtml = $(form).html()?.toLowerCase() || '';
    return formHtml.includes('contact') || formHtml.includes('email') || formHtml.includes('message');
  });
  const hasContactForm = contactForms.length > 0;
  
  // Error page detection (basic)
  const hasErrorPages = html.toLowerCase().includes('404') || html.toLowerCase().includes('error');
  
  // Accessibility features
  const accessibilityFeatures: string[] = [];
  if ($('[alt]').length > 0) accessibilityFeatures.push('Image alt attributes');
  if ($('[aria-label]').length > 0) accessibilityFeatures.push('ARIA labels');
  if ($('[role]').length > 0) accessibilityFeatures.push('ARIA roles');
  if ($('button, input[type="button"], input[type="submit"]').length > 0) accessibilityFeatures.push('Interactive buttons');
  if ($('[tabindex]').length > 0) accessibilityFeatures.push('Tab navigation');
  if ($('label').length > 0) accessibilityFeatures.push('Form labels');
  
  // Interactive elements
  const interactiveElements = $('button, input, select, textarea, a[href], [onclick], [onsubmit]');
  const interactiveElementsCount = interactiveElements.length;
  
  // Loading indicators
  const loadingIndicators = $('.loading, .spinner, .loader, [class*="load"]');
  const hasLoadingIndicators = loadingIndicators.length > 0;
  
  // Social proof elements
  const socialElements: string[] = [];
  if ($('.testimonial, .review, .rating').length > 0) socialElements.push('testimonials/reviews');
  if ($('.social, [class*="facebook"], [class*="twitter"], [class*="linkedin"]').length > 0) socialElements.push('social media links');
  if ($('.badge, .certification, .award').length > 0) socialElements.push('badges/certifications');
  if ($('.customer, .client, .partner').length > 0) socialElements.push('customer logos');
  
  const hasSocialProof = socialElements.length > 0;
  
  return {
    hasNavigation,
    navigationStructure: navigationStructure.slice(0, 10), // Limit to first 10
    formCount,
    formFields: formFields.slice(0, 20), // Limit to first 20
    hasSearchBox,
    hasContactForm,
    hasErrorPages,
    accessibilityFeatures,
    interactiveElementsCount,
    hasLoadingIndicators,
    hasSocialProof,
    socialElements
  };
}

// Enhanced AI Content Analysis using pattern-matching algorithms
function analyzeAIContent($: cheerio.CheerioAPI, html: string, basicContent: {
  title: string;
  paragraphs: string[];
  headings: { level: number; text: string }[];
  links: { href: string; text: string; internal: boolean }[];
}): CrawledContent['aiAnalysisData'] {
  const fullText = basicContent.paragraphs.join(' ') + ' ' + basicContent.headings.map((h: { level: number; text: string }) => h.text).join(' ');
  
  // 1. Advanced Entity Detection using Smart Patterns
  const detectedEntities = detectEntitiesAdvanced(fullText, html);
  
  // 2. Answer Format Analysis
  const answerFormats = analyzeAnswerFormats($, fullText);
  
  // 3. Authority and Expertise Signals
  const authoritySignals = detectAuthoritySignals($, html, fullText);
  
  // 4. Factual Accuracy Indicators
  const factualIndicators = analyzeFactualIndicators(fullText, basicContent.links);
  
  // 5. AI Bot Accessibility Analysis
  const botAccessibility = analyzeAIBotAccessibility($, html);
  
  // 6. Voice Search Optimization
  const voiceSearchOptimization = analyzeVoiceSearchOptimization(fullText, $);
  
  return {
    detectedEntities,
    answerFormats,
    authoritySignals,
    factualIndicators,
    botAccessibility,
    voiceSearchOptimization
  };
}

// 1. Advanced Entity Detection using Pattern Matching
function detectEntitiesAdvanced(text: string, html: string): {
  persons: string[];
  organizations: string[];
  locations: string[];
  brands: string[];
} {
  const entities = {
    persons: [] as string[],
    organizations: [] as string[],
    locations: [] as string[],
    brands: [] as string[]
  };
  
  // Person name patterns - Title Case with common patterns
  const personPatterns = [
    /\b(?:Dr\.?|Prof\.?|Mr\.?|Mrs\.?|Ms\.?|CEO|President|Director|Author|By)\s+([A-Z][a-z]+ [A-Z][a-z]+(?:\s[A-Z][a-z]+)?)\b/g,
    /\bwritten by\s+([A-Z][a-z]+ [A-Z][a-z]+(?:\s[A-Z][a-z]+)?)\b/gi,
    /\bauthor:\s*([A-Z][a-z]+ [A-Z][a-z]+(?:\s[A-Z][a-z]+)?)\b/gi
  ];
  
  personPatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach(match => {
        const name = match.replace(/^(?:Dr\.?|Prof\.?|Mr\.?|Mrs\.?|Ms\.?|CEO|President|Director|Author|By|written by|author:)\s*/i, '').trim();
        if (name && !entities.persons.includes(name)) {
          entities.persons.push(name);
        }
      });
    }
  });
  
  // Organization patterns
  const orgPatterns = [
    /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:Inc\.?|LLC|Corp\.?|Ltd\.?|Company|Corporation|University|College|Institute|Foundation|Organization)\b/g,
    /\b(?:University of|College of)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g
  ];
  
  orgPatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach(match => {
        if (!entities.organizations.includes(match)) {
          entities.organizations.push(match);
        }
      });
    }
  });
  
  // Location patterns
  const locationPatterns = [
    /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*),\s*([A-Z]{2}|\b[A-Z][a-z]+)\b/g, // City, State/Country
    /\bin\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*),\s*([A-Z]{2}|\b[A-Z][a-z]+)\b/g
  ];
  
  locationPatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach(match => {
        const location = match.replace(/^in\s+/i, '').trim();
        if (!entities.locations.includes(location)) {
          entities.locations.push(location);
        }
      });
    }
  });
  
  // Brand detection from structured data and meta tags
  const brandFromSchema = html.match(/"brand":\s*"([^"]+)"/g);
  if (brandFromSchema) {
    brandFromSchema.forEach(match => {
      const brand = match.match(/"([^"]+)"$/);
      if (brand && brand[1] && !entities.brands.includes(brand[1])) {
        entities.brands.push(brand[1]);
      }
    });
  }
  
  return entities;
}

// 2. Answer Format Analysis for AI Digestibility
function analyzeAnswerFormats($: cheerio.CheerioAPI, text: string): {
  qaCount: number;
  listCount: number;
  stepByStepCount: number;
  definitionCount: number;
} {
  // Q&A format detection
  const qaPatterns = [
    /\b(?:what is|what are|how to|how do|why does|why do|when should|when do|where is|where can|which|who is)\b/gi,
    /\?.*\n.*\b(?:answer|solution|result|because|since|due to)\b/gi
  ];
  
  let qaCount = 0;
  qaPatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) qaCount += matches.length;
  });
  
  // List structures (ordered and unordered)
  const listCount = ($('ol').length + $('ul').length);
  
  // Step-by-step content detection
  const stepPatterns = [
    /\b(?:step \d+|step \w+)\b/gi,
    /\b\d+\.\s+(?:[A-Z])/g,
    /\b(?:first|second|third|fourth|fifth|next|then|finally|lastly)\b/gi
  ];
  
  let stepByStepCount = 0;
  stepPatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) stepByStepCount += matches.length;
  });
  
  // Definition detection
  const definitionPatterns = [
    /\b(?:definition|meaning|refers to|is defined as|can be defined as)\b/gi,
    /\b\w+\s+(?:is|are|means|refers to)\b/g
  ];
  
  let definitionCount = 0;
  definitionPatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) definitionCount += matches.length;
  });
  
  return {
    qaCount: Math.min(50, qaCount), // Cap to prevent inflated scores
    listCount,
    stepByStepCount: Math.min(20, stepByStepCount),
    definitionCount: Math.min(10, definitionCount)
  };
}

// 3. Authority and Expertise Signals Detection
function detectAuthoritySignals($: cheerio.CheerioAPI, html: string, text: string): {
  authorBylines: string[];
  publicationDates: string[];
  lastModified?: string;
  credentialMentions: string[];
  authorityLinks: string[];
} {
  const authoritySignals = {
    authorBylines: [] as string[],
    publicationDates: [] as string[],
    lastModified: undefined as string | undefined,
    credentialMentions: [] as string[],
    authorityLinks: [] as string[]
  };
  
  // Author byline detection
  const authorSelectors = [
    '.author', '.byline', '.writer', '.post-author',
    '[class*="author"]', '[class*="byline"]', '[class*="writer"]',
    'span[rel="author"]', '[itemprop="author"]'
  ];
  
  authorSelectors.forEach(selector => {
    $(selector).each((_, element) => {
      const authorText = $(element).text().trim();
      if (authorText && authorText.length > 2 && authorText.length < 100) {
        authoritySignals.authorBylines.push(authorText);
      }
    });
  });
  
  // Publication date extraction
  const dateSelectors = [
    'time[datetime]', '.date', '.published', '.post-date',
    '[class*="date"]', '[class*="published"]', '[itemprop="datePublished"]'
  ];
  
  dateSelectors.forEach(selector => {
    $(selector).each((_, element) => {
      const $element = $(element);
      const datetime = $element.attr('datetime') || $element.text();
      if (datetime) {
        authoritySignals.publicationDates.push(datetime.trim());
      }
    });
  });
  
  // Last modified detection
  const lastModSelectors = ['[itemprop="dateModified"]', '.modified', '.updated', '.last-updated'];
  lastModSelectors.forEach(selector => {
    const lastMod = $(selector).first();
    if (lastMod.length > 0) {
      authoritySignals.lastModified = lastMod.attr('datetime') || lastMod.text().trim();
    }
  });
  
  // Credential mentions
  const credentialPatterns = [
    /\b(?:PhD|Ph\.D\.|MD|M\.D\.|MBA|M\.B\.A\.|MS|M\.S\.|BS|B\.S\.|Professor|Dr\.|Doctor)\b/g,
    /\b(?:certified|licensed|board-certified|expert|specialist|consultant)\b/gi
  ];
  
  credentialPatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach(match => {
        if (!authoritySignals.credentialMentions.includes(match)) {
          authoritySignals.credentialMentions.push(match);
        }
      });
    }
  });
  
  // Authority links detection (.edu, .gov, .org)
  $('a[href*=".edu"], a[href*=".gov"], a[href*=".org"]').each((_, element) => {
    const href = $(element).attr('href');
    if (href && !authoritySignals.authorityLinks.includes(href)) {
      authoritySignals.authorityLinks.push(href);
    }
  });
  
  return authoritySignals;
}

// 4. Factual Accuracy Indicators
function analyzeFactualIndicators(text: string, links: { href: string; text: string; internal: boolean }[]): {
  citations: number;
  statistics: number;
  dates: string[];
  sources: string[];
  externalLinks: number;
} {
  // Citation patterns
  const citationPatterns = [
    /\[\d+\]/g, // [1], [2], etc.
    /\(\d{4}\)/g, // (2023), (2024), etc.
    /\(\w+,?\s*\d{4}\)/g, // (Smith, 2023)
    /\baccording to\b/gi,
    /\bas reported by\b/gi,
    /\bsource:\s*/gi
  ];
  
  let citations = 0;
  citationPatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) citations += matches.length;
  });
  
  // Statistics detection
  const statisticPatterns = [
    /\b\d+(?:\.\d+)?%/g, // Percentages
    /\$\d+(?:,\d{3})*(?:\.\d{2})?/g, // Currency
    /\b\d+(?:,\d{3})*\s+(?:people|users|customers|patients|studies|cases)\b/gi,
    /\b(?:increased|decreased|grew|dropped)\s+by\s+\d+/gi
  ];
  
  let statistics = 0;
  statisticPatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) statistics += matches.length;
  });
  
  // Date extraction for content freshness
  const datePattern = /\b(?:20[12]\d|19[89]\d)\b/g;
  const dates = text.match(datePattern) || [];
  
  // Source analysis
  const sourcePatterns = [
    /\bstudy by\b/gi,
    /\bresearch from\b/gi,
    /\bdata from\b/gi,
    /\breport by\b/gi,
    /\bpublished in\b/gi
  ];
  
  let sources = 0;
  sourcePatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) sources += matches.length;
  });
  
  // External links count
  const externalLinks = links.filter(link => !link.internal).length;
  
  return {
    citations: Math.min(50, citations),
    statistics: Math.min(30, statistics),
    dates: [...new Set(dates)].slice(0, 10), // Unique dates, max 10
    sources: sources.toString().split(',').slice(0, 5), // Convert to string array, max 5
    externalLinks: Math.min(100, externalLinks)
  };
}

// 5. AI Bot Accessibility Analysis
function analyzeAIBotAccessibility($: cheerio.CheerioAPI, html: string): {
  aiBotDirectives: {
    gptBot: 'allowed' | 'disallowed' | 'unspecified';
    googleExtended: 'allowed' | 'disallowed' | 'unspecified';
    chatgptUser: 'allowed' | 'disallowed' | 'unspecified';
    claudeWeb: 'allowed' | 'disallowed' | 'unspecified';
    bingBot: 'allowed' | 'disallowed' | 'unspecified';
    ccBot: 'allowed' | 'disallowed' | 'unspecified';
    perplexityBot: 'allowed' | 'disallowed' | 'unspecified';
  };
  metaRobotsAI: string[];
  contentAvailability: 'full' | 'partial' | 'js-dependent';
  botSimulation: {
    contentExtracted: number;
    priorityContentFound: boolean;
    structuredDataPresent: boolean;
    accessibilityScore: number;
  };
} {
  const botAccessibility = {
    aiBotDirectives: {
      gptBot: 'unspecified' as 'allowed' | 'disallowed' | 'unspecified',
      googleExtended: 'unspecified' as 'allowed' | 'disallowed' | 'unspecified',
      chatgptUser: 'unspecified' as 'allowed' | 'disallowed' | 'unspecified',
      claudeWeb: 'unspecified' as 'allowed' | 'disallowed' | 'unspecified',
      bingBot: 'unspecified' as 'allowed' | 'disallowed' | 'unspecified',
      ccBot: 'unspecified' as 'allowed' | 'disallowed' | 'unspecified',
      perplexityBot: 'unspecified' as 'allowed' | 'disallowed' | 'unspecified'
    },
    metaRobotsAI: [] as string[],
    contentAvailability: 'full' as 'full' | 'partial' | 'js-dependent',
    botSimulation: {
      contentExtracted: 0,
      priorityContentFound: false,
      structuredDataPresent: false,
      accessibilityScore: 0
    }
  };
  
  // Simulate real bot behavior: Check for content that bots would actually extract
  const mainContent = $('main, article, .content, .main-content, #content, [role="main"]').first();
  const contentArea = mainContent.length > 0 ? mainContent : $('body');
  
  // Count extractable content (like a real bot would)
  const headings = contentArea.find('h1, h2, h3, h4, h5, h6').length;
  const paragraphs = contentArea.find('p').length;
  const lists = contentArea.find('ul, ol').length;
  const images = contentArea.find('img[alt]').length;
  const links = contentArea.find('a[href]').length;
  
  botAccessibility.botSimulation.contentExtracted = headings + paragraphs + lists + images + links;
  
  // Check for priority content (H1, main content area)
  botAccessibility.botSimulation.priorityContentFound = 
    contentArea.find('h1').length > 0 || 
    mainContent.length > 0;
  
  // Check for structured data (like real bots prioritize)
  const hasJsonLd = $('script[type="application/ld+json"]').length > 0;
  const hasMicrodata = $('[itemtype]').length > 0;
  const hasMetaTags = $('meta[property^="og:"], meta[name^="twitter:"]').length > 0;
  
  botAccessibility.botSimulation.structuredDataPresent = hasJsonLd || hasMicrodata || hasMetaTags;
  
  // Calculate accessibility score (simulating bot's ability to extract content)
  let accessibilityScore = 0;
  
  // Base score for having content
  if (botAccessibility.botSimulation.contentExtracted > 10) accessibilityScore += 30;
  if (botAccessibility.botSimulation.contentExtracted > 50) accessibilityScore += 20;
  
  // Priority content bonus
  if (botAccessibility.botSimulation.priorityContentFound) accessibilityScore += 25;
  
  // Structured data bonus
  if (botAccessibility.botSimulation.structuredDataPresent) accessibilityScore += 15;
  
  // Content quality indicators
  if (headings > 0) accessibilityScore += 10;
  if (paragraphs > 5) accessibilityScore += 10;
  
  botAccessibility.botSimulation.accessibilityScore = Math.min(100, accessibilityScore);
  
  // Meta robots AI-specific tags
  const metaRobots = $('meta[name="robots"], meta[name="googlebot"], meta[name="bingbot"]');
  metaRobots.each((_, element) => {
    const content = $(element).attr('content');
    const name = $(element).attr('name');
    if (content) {
      botAccessibility.metaRobotsAI.push(`${name}: ${content}`);
    }
  });
  
  // Enhanced content availability analysis (like real bots assess)
  const noscriptContent = $('noscript').length;
  const totalContent = html.length;
  const serverSideContent = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '').length;
  
  const contentRatio = serverSideContent / totalContent;
  
  // More sophisticated assessment
  if (contentRatio > 0.8 && botAccessibility.botSimulation.contentExtracted > 20) {
    botAccessibility.contentAvailability = 'full';
  } else if (contentRatio > 0.5 || noscriptContent > 0 || botAccessibility.botSimulation.contentExtracted > 10) {
    botAccessibility.contentAvailability = 'partial';
  } else {
    botAccessibility.contentAvailability = 'js-dependent';
  }
  
  return botAccessibility;
}

// 6. Voice Search Optimization Analysis
function analyzeVoiceSearchOptimization(text: string, $: cheerio.CheerioAPI): {
  naturalLanguagePatterns: number;
  conversationalContent: number;
  questionFormats: number;
  speakableContent: boolean;
} {
  // Natural language patterns for voice search
  const naturalLanguagePatterns = [
    /\bhow to\b/gi,
    /\bwhat is\b/gi,
    /\bwhere can I\b/gi,
    /\bwhen should\b/gi,
    /\bwhy does\b/gi,
    /\bnear me\b/gi,
    /\bbest way to\b/gi
  ];
  
  let naturalLanguageCount = 0;
  naturalLanguagePatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) naturalLanguageCount += matches.length;
  });
  
  // Conversational content detection
  const conversationalPatterns = [
    /\byou can\b/gi,
    /\byou should\b/gi,
    /\byou need\b/gi,
    /\blet's\b/gi,
    /\bwe'll\b/gi,
    /\bhere's\b/gi
  ];
  
  let conversationalContent = 0;
  conversationalPatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) conversationalContent += matches.length;
  });
  
  // Question format detection
  const questionCount = (text.match(/\?/g) || []).length;
  
  // Speakable content detection
  const speakableContent = $('[itemscope][itemtype*="speakable"]').length > 0 ||
                          $('[vocab*="speakable"]').length > 0;
  
  return {
    naturalLanguagePatterns: Math.min(20, naturalLanguageCount),
    conversationalContent: Math.min(30, conversationalContent),
    questionFormats: Math.min(15, questionCount),
    speakableContent
  };
} 