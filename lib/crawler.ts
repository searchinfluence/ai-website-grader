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
      contentAvailability: 'full'
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
        gptBot: 'unspecified',
        googleExtended: 'unspecified',
        chatgptUser: 'unspecified',
        claudeWeb: 'unspecified',
        bingBot: 'unspecified',
        ccBot: 'unspecified',
        perplexityBot: 'unspecified'
      },
      metaRobotsAI: [],
      contentAvailability: 'full'
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
  }
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
  
  // Add headings and content in document order
  const contentElements: { type: 'heading' | 'paragraph'; content: string; level?: number }[] = [];
  
  // Extract main content area
  const mainContent = $('main, article, .content, .main-content, #content').first();
  const contentArea = mainContent.length > 0 ? mainContent : $('body');
  
  contentArea.find('h1, h2, h3, h4, h5, h6, p').each((_, element) => {
    const $el = $(element);
    const tagName = $el.prop('tagName')?.toLowerCase() || '';
    const text = $el.text().trim();
    
    if (text) {
      if (tagName.startsWith('h')) {
        const level = parseInt(tagName.charAt(1));
        contentElements.push({
          type: 'heading',
          content: text,
          level
        });
      } else if (tagName === 'p') {
        contentElements.push({
          type: 'paragraph',
          content: text
        });
      }
    }
  });
  
  // Convert to markdown
  contentElements.forEach(element => {
    if (element.type === 'heading' && element.level) {
      const prefix = '#'.repeat(element.level);
      markdown += `${prefix} ${element.content}\n\n`;
    } else if (element.type === 'paragraph') {
      markdown += `${element.content}\n\n`;
    }
  });
  
  // Add lists
  $('ul, ol').each((_, list) => {
    const $list = $(list);
    const isOrdered = $list.prop('tagName')?.toLowerCase() === 'ol';
    
    $list.find('li').each((index, item) => {
      const text = $(item).text().trim();
      if (text) {
        const prefix = isOrdered ? `${index + 1}. ` : '- ';
        markdown += `${prefix}${text}\n`;
      }
    });
    markdown += '\n';
  });
  
  // Add links section
  const links = $('a[href]').map((_, link) => {
    const $link = $(link);
    const href = $link.attr('href');
    const text = $link.text().trim();
    return { href, text };
  }).get();
  
  if (links.length > 0) {
    markdown += '## Links\n\n';
    links.slice(0, 10).forEach(link => { // Limit to first 10 links
      if (link.text && link.href) {
        markdown += `- [${link.text}](${link.href})\n`;
      }
    });
    markdown += '\n';
  }
  
  return markdown;
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
    contentAvailability: 'full' as 'full' | 'partial' | 'js-dependent'
  };
  
  // Meta robots AI-specific tags
  const metaRobots = $('meta[name="robots"], meta[name="googlebot"], meta[name="bingbot"]');
  metaRobots.each((_, element) => {
    const content = $(element).attr('content');
    const name = $(element).attr('name');
    if (content) {
      botAccessibility.metaRobotsAI.push(`${name}: ${content}`);
    }
  });
  
  // Content availability analysis
  const noscriptContent = $('noscript').length;
  const totalContent = html.length;
  const serverSideContent = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '').length;
  
  const contentRatio = serverSideContent / totalContent;
  
  if (contentRatio > 0.8) {
    botAccessibility.contentAvailability = 'full';
  } else if (contentRatio > 0.5 || noscriptContent > 0) {
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