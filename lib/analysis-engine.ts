import { WebsiteAnalysis, CrawledContent, ContentImprovement, AnalysisScore } from '@/types';
import { crawlWebsite, parseTextContent } from './crawler';
import { 
  analyzeTechnicalSEO, 
  analyzeContentQuality, 
  analyzeAIOptimization, 
  analyzeTechnicalCrawlability,
  analyzeMobileOptimization,
  analyzeSchemaAnalysis,
  analyzeEEATSignals
} from './analyzer';
// Performance analysis functions are used in the crawler module

export async function analyzeWebsite(url: string, textContent?: string): Promise<WebsiteAnalysis> {
  let content: CrawledContent;
  
  try {
    if (textContent) {
      // Use provided text content
      content = await parseTextContent(textContent);
      content.title = content.title || 'Manual Content Analysis';
    } else {
      // Crawl the website
      content = await crawlWebsite(url);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Check if it's a crawling-related error
    if (errorMessage.includes('aborted') || errorMessage.includes('timeout') || errorMessage.includes('Failed to crawl')) {
      throw new Error(`Website crawling failed. This can happen due to:

• Website blocking automated requests
• Network connectivity issues  
• Website requiring JavaScript

💡 Solution: Please reload the page, then click the "Analyze Text" tab above and paste your website content directly.`);
    }
    
    throw new Error(`Failed to analyze website: ${errorMessage}`);
  }
  
  // Run all analyses in parallel for better performance
  const [
    technicalSEO,
    technicalCrawlability,
    contentQuality,
    aiOptimization,
    mobileOptimization,
    schemaAnalysis,
    eeatSignals
  ] = await Promise.all([
    Promise.resolve(analyzeTechnicalSEO(content)),
    Promise.resolve(analyzeTechnicalCrawlability(content)),
    Promise.resolve(analyzeContentQuality(content)),
    Promise.resolve(analyzeAIOptimization(content)),
    Promise.resolve(analyzeMobileOptimization(content)),
    Promise.resolve(analyzeSchemaAnalysis(content)),
    Promise.resolve(analyzeEEATSignals(content))
  ]);
  
  // Calculate weighted overall score
  const overallScore = calculateOverallScore({
    technicalSEO: technicalSEO.score,
    technicalCrawlability: technicalCrawlability.score,
    contentQuality: contentQuality.score,
    aiOptimization: aiOptimization.score,
    mobileOptimization: mobileOptimization.score,
    schemaAnalysis: schemaAnalysis.score,
    eeatSignals: eeatSignals.score
  });
  
  // Generate content improvements
  const contentImprovements = generateContentImprovements({
    url: textContent ? 'manual-input' : url,
    title: content.title,
    overallScore,
    timestamp: new Date().toISOString(),
    technicalSEO,
    technicalCrawlability,
    contentQuality,
    aiOptimization,
    mobileOptimization,
    schemaAnalysis,
    eeatSignals,
    contentImprovements: [],
    crawledContent: content
  });
  
  // Debug logging for performance metrics
  console.log('Analysis Engine - Performance Metrics:', content.aiAnalysisData?.performanceMetrics);
  
  return {
    url: textContent ? 'manual-input' : url,
    title: content.title,
    overallScore,
    timestamp: new Date().toISOString(),
    technicalSEO,
    technicalCrawlability,
    contentQuality,
    aiOptimization,
    mobileOptimization,
    schemaAnalysis,
    eeatSignals,
    contentImprovements,
    crawledContent: content
  };
}

export function calculateOverallScore(scores: {
  technicalSEO: number;
  technicalCrawlability: number;
  contentQuality: number;
  aiOptimization: number;
  mobileOptimization: number;
  schemaAnalysis: number;
  eeatSignals: number;
}): number {
  // 7-Factor AI Search Weighted Scoring Framework
  // Prioritizes factors that directly impact AI search rankings and content digestibility
  const weights = {
    aiOptimization: 0.25,          // 25% - AI content digestibility, answer potential, factual accuracy
    contentQuality: 0.18,          // 18% - Content foundation and expertise (increased from 10%)
    technicalCrawlability: 0.16,   // 16% - AI bot accessibility, content availability
    eeatSignals: 0.12,             // 12% - Expertise, Experience, Authoritativeness, Trustworthiness (NEW)
    mobileOptimization: 0.12,      // 12% - Mobile-first indexing, voice search readiness (decreased from 20%)
    schemaAnalysis: 0.10,          // 10% - AI-friendly structured data (decreased from 12%)
    technicalSEO: 0.07             // 7% - Technical performance and SEO basics (decreased from 8%)
  };
  
  const weightedScore = 
    scores.aiOptimization * weights.aiOptimization +
    scores.contentQuality * weights.contentQuality +
    scores.technicalCrawlability * weights.technicalCrawlability +
    scores.eeatSignals * weights.eeatSignals +
    scores.mobileOptimization * weights.mobileOptimization +
    scores.schemaAnalysis * weights.schemaAnalysis +
    scores.technicalSEO * weights.technicalSEO;
  
  return Math.round(weightedScore);
}

export function generateContentImprovements(analysis: WebsiteAnalysis): ContentImprovement[] {
  const improvements: ContentImprovement[] = [];
  
  // Comprehensive improvement mapping for each category
  const improvementStrategies = {
    'AI Optimization': {
      lowScore: (score: number) => score < 70,
      improvements: [
        {
          current: 'Content lacks structured Q&A format',
          improved: 'Add FAQ sections with clear questions and detailed answers. Use schema markup for FAQ pages to help AI understand your content structure.',
          reasoning: 'AI search engines prioritize content that directly answers user questions. FAQ format improves chunkability and semantic clarity.'
        },
        {
          current: 'Limited entity recognition and factual density',
          improved: 'Include specific facts, statistics, and named entities. Add industry-specific terminology and proper nouns that AI can recognize and index.',
          reasoning: 'Higher factual density helps AI understand your content\'s authority and relevance to specific search queries.'
        },
        {
          current: 'Content lacks semantic clarity',
          improved: 'Use clear, unambiguous language. Define technical terms, use consistent terminology, and structure content with logical flow.',
          reasoning: 'Semantic clarity helps AI understand context and relationships between concepts, improving search relevance.'
        }
      ]
    },
    'Content Quality': {
      lowScore: (score: number) => score < 75,
      improvements: [
        {
          current: 'Insufficient long-tail keyword coverage',
          improved: 'Research and incorporate 15-20 long-tail keywords naturally throughout your content. Focus on specific user intent and search queries.',
          reasoning: 'Long-tail keywords capture specific search intent and often have less competition, improving search visibility.'
        },
        {
          current: 'Content lacks comprehensive coverage',
          improved: 'Expand content to cover all aspects of the topic. Include background information, step-by-step guides, and address common questions.',
          reasoning: 'Comprehensive content satisfies user intent better and signals expertise to search engines.'
        },
        {
          current: 'Limited relevance to user intent',
          improved: 'Analyze search intent and align content with what users actually want to know. Include practical examples and actionable advice.',
          reasoning: 'Content that matches user intent receives higher engagement and better search rankings.'
        }
      ]
    },
    'Technical SEO': {
      lowScore: (score: number) => score < 80,
      improvements: [
        {
          current: 'Poor heading structure and hierarchy',
          improved: 'Implement proper H1-H6 hierarchy. Use H1 for main title, H2 for major sections, H3 for subsections. Include target keywords in headings.',
          reasoning: 'Proper heading structure helps search engines understand content organization and improves readability.'
        },
        {
          current: 'Missing or poor meta descriptions',
          improved: 'Create compelling meta descriptions (150-160 characters) that include target keywords and encourage clicks. Make each unique and descriptive.',
          reasoning: 'Meta descriptions appear in search results and influence click-through rates, which affects rankings.'
        },
        {
          current: 'Images missing alt text',
          improved: 'Add descriptive alt text to all images. Include relevant keywords naturally and describe the image content for accessibility.',
          reasoning: 'Alt text helps search engines understand image content and improves accessibility for users with screen readers.'
        }
      ]
    },
    'Technical Crawlability': {
      lowScore: (score: number) => score < 70,
      improvements: [
        {
          current: 'Robots.txt may be blocking AI crawlers',
          improved: 'Ensure robots.txt allows AI crawlers like GPTBot, ChatGPT-User, and CCBot. Add specific allow rules for AI user agents.',
          reasoning: 'Proper robots.txt configuration ensures AI crawlers can access and index your content for AI search results.'
        },
        {
          current: 'Content not optimized for bot accessibility',
          improved: 'Ensure content loads without JavaScript and provide text alternatives for dynamic content. Use server-side rendering.',
          reasoning: 'AI bots may have difficulty processing JavaScript-heavy content, so static content ensures better crawlability.'
        },
        {
          current: 'Slow loading times affecting bot crawling',
          improved: 'Optimize page speed by compressing images, minifying code, and improving server response times for better bot crawling.',
          reasoning: 'Faster loading pages are crawled more efficiently by AI bots, improving the chances of content being indexed.'
        }
      ]
    },
    'Mobile Optimization': {
      lowScore: (score: number) => score < 70,
      improvements: [
        {
          current: 'Mobile page speed needs optimization',
          improved: 'Optimize mobile page loading speed by compressing images, minifying CSS/JS, and enabling browser caching. Use WebP image format and minimize render-blocking resources.',
          reasoning: 'Mobile page speed is a critical ranking factor and affects user experience. Google uses mobile-first indexing, making mobile performance essential.'
        },
        {
          current: 'Touch targets too small or poorly spaced',
          improved: 'Ensure all buttons and clickable elements are at least 44px × 44px with 8px spacing between them. Make navigation thumb-friendly.',
          reasoning: 'Proper touch target sizing improves mobile usability and is considered by Google\'s mobile-friendly test algorithm.'
        },
        {
          current: 'Missing or incorrect viewport configuration',
          improved: 'Add proper viewport meta tag: <meta name="viewport" content="width=device-width, initial-scale=1">. Ensure content fits without horizontal scrolling.',
          reasoning: 'Proper viewport configuration is essential for responsive design and mobile-first indexing by search engines.'
        }
      ]
    },
    'Schema Analysis': {
      lowScore: (score: number) => score < 70,
      improvements: [
        {
          current: 'Limited or missing structured data markup',
          improved: 'Implement comprehensive JSON-LD structured data including Organization, WebSite, and content-specific schemas. Use Google\'s Structured Data Testing Tool to validate.',
          reasoning: 'Structured data helps search engines understand your content better and enables rich snippets, improving click-through rates.'
        },
        {
          current: 'Structured data contains validation errors',
          improved: 'Fix JSON-LD syntax errors and ensure all required properties are included. Test with Google\'s Rich Results Test tool.',
          reasoning: 'Valid structured data is essential for rich snippet eligibility and helps AI systems understand and categorize your content.'
        },
        {
          current: 'Missing rich snippet optimization opportunities',
          improved: 'Add FAQ schema for Q&A content, Review schema for testimonials, HowTo schema for guides, and Article schema for blog posts.',
          reasoning: 'Rich snippets increase visibility in search results and provide more context to AI systems processing your content.'
        }
      ]
    },
    'E-E-A-T Signals': {
      lowScore: (score: number) => score < 70,
      improvements: [
        {
          current: 'Limited expertise and experience signals',
          improved: 'Add author bios, credentials, and industry experience. Include team member profiles with relevant qualifications and expertise.',
          reasoning: 'Expertise signals help establish authority and trust with both users and search engines.'
        },
        {
          current: 'Missing authoritativeness indicators',
          improved: 'Display industry awards, certifications, and recognition. Include client testimonials and case studies that demonstrate authority.',
          reasoning: 'Authoritativeness signals build credibility and can improve search rankings for competitive keywords.'
        },
        {
          current: 'Insufficient trustworthiness signals',
          improved: 'Add privacy policies, terms of service, and contact information. Include business verification and security certifications.',
          reasoning: 'Trustworthiness signals are critical for user confidence and can positively impact search rankings.'
        }
      ]
    }
  };

  // Generate improvements for all categories that need them
  Object.entries(improvementStrategies).forEach(([category, strategy]) => {
    const categoryKey = category === 'AI Optimization' ? 'aiOptimization' : 
                       category === 'Content Quality' ? 'contentQuality' :
                       category === 'Technical SEO' ? 'technicalSEO' :
                       category === 'Technical Crawlability' ? 'technicalCrawlability' :
                       category === 'Mobile Optimization' ? 'mobileOptimization' :
                       category === 'Schema Analysis' ? 'schemaAnalysis' :
                       category === 'E-E-A-T Signals' ? 'eeatSignals' :
                       'aiOptimization'; // Default fallback
    
    const score = analysis[categoryKey as keyof WebsiteAnalysis] as AnalysisScore;
    
    if (strategy.lowScore(score.score)) {
      // Add multiple improvements for low-scoring areas
      strategy.improvements.forEach((improvement) => {
        improvements.push({
          section: category,
          current: improvement.current,
          improved: improvement.improved,
          reasoning: improvement.reasoning,
          priority: score.score < 50 ? 'high' : score.score < 70 ? 'medium' : 'low'
        });
      });
    }
  });

  // Add priority improvements for very low scores
  const criticalAreas = Object.entries(improvementStrategies).filter(([category]) => {
    const categoryKey = category === 'AI Optimization' ? 'aiOptimization' : 
                       category === 'Content Quality' ? 'contentQuality' :
                       category === 'Technical SEO' ? 'technicalSEO' :
                       category === 'Technical Crawlability' ? 'technicalCrawlability' :
                       category === 'Mobile Optimization' ? 'mobileOptimization' :
                       category === 'Schema Analysis' ? 'schemaAnalysis' :
                       category === 'E-E-A-T Signals' ? 'eeatSignals' :
                       'aiOptimization'; // Default fallback
    
    const score = analysis[categoryKey as keyof WebsiteAnalysis] as AnalysisScore;
    return score.score < 50;
  });

  if (criticalAreas.length > 0) {
    improvements.unshift({
      section: 'Priority Action',
      current: `Multiple areas scoring below 50%: ${criticalAreas.map(([cat]) => cat).join(', ')}`,
      improved: 'Focus on these critical areas first as they have the biggest impact on your search visibility and user experience.',
      reasoning: 'Areas scoring below 50% represent significant opportunities for improvement and should be addressed before optimizing higher-scoring areas.',
      priority: 'high'
    });
  }

  // Add overall strategy improvement
  if (analysis.overallScore < 70) {
    improvements.push({
      section: 'Overall Strategy',
      current: `Overall score of ${analysis.overallScore}% indicates room for improvement across multiple areas`,
      improved: 'Implement a comprehensive SEO strategy focusing on content quality, technical optimization, and user experience simultaneously.',
      reasoning: 'Holistic improvements across all areas will provide the best long-term results for search visibility and user engagement.',
      priority: analysis.overallScore < 50 ? 'high' : 'medium'
    });
  }

  return improvements;
} 