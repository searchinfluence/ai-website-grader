import { CrawledContent, TechnicalSEO, ContentQuality, AIOptimization, EEATSignals, TechnicalCrawlability, MobileOptimization, SchemaAnalysis, RecommendationItem } from '@/types';

export function analyzeTechnicalSEO(content: CrawledContent): TechnicalSEO {
  const findings: string[] = [];
  const recommendations: RecommendationItem[] = [];
  
  // Analyze heading structure
  const headingStructure = analyzeHeadingHierarchy(content.headings);
  if (headingStructure < 70) {
    findings.push('Heading structure needs improvement');
    recommendations.push(createRecommendation(
      'Implement proper H1-H6 hierarchy with one H1 per page',
      'high',
      'heading-structure',
      '1. Ensure exactly one H1 tag per page\n2. Use H2 for major sections\n3. Use H3 for subsections\n4. Include target keywords naturally in headings\n5. Maintain logical hierarchy (H1→H2→H3)'
    ));
  }
  
  // Analyze meta information
  const metaInfo = analyzeMetaInformation(content);
  if (metaInfo < 70) {
    findings.push('Meta information is incomplete or unoptimized');
    recommendations.push(createRecommendation(
      'Create compelling meta descriptions and optimize title tags',
      'high',
      'meta-optimization',
      '1. Write meta descriptions 150-160 characters long\n2. Include target keywords naturally\n3. Make each meta description unique\n4. Create action-oriented descriptions\n5. Optimize title tags (30-60 characters)'
    ));
  }
  
  // Analyze alt text
  const altText = analyzeAltText(content.images);
  if (altText < 70) {
    findings.push('Images missing descriptive alt text');
    recommendations.push(createRecommendation(
      'Add descriptive alt text to all images',
      'medium',
      'image-optimization',
      '1. Describe image content accurately\n2. Include relevant keywords naturally\n3. Keep alt text concise but descriptive\n4. Avoid "image of" or "picture of"\n5. Use empty alt="" for decorative images'
    ));
  }
  
  // Analyze links
  const links = analyzeLinkQuality(content.links);
  if (links < 70) {
    findings.push('Link structure could be improved');
    recommendations.push(createRecommendation(
      'Improve internal linking and anchor text',
      'medium',
      'link-optimization',
      '1. Use descriptive anchor text\n2. Add more internal links to related content\n3. Ensure external links are relevant and authoritative\n4. Open external links in new tabs\n5. Avoid generic "click here" text'
    ));
  }
  
  // Analyze schema markup
  const schemaMarkup = analyzeSchemaMarkup(content);
  if (schemaMarkup < 70) {
    findings.push('Missing or incomplete schema markup');
    recommendations.push(createRecommendation(
      'Implement structured data markup',
      'medium',
      'schema-markup',
      '1. Add Organization schema\n2. Use Article schema for blog posts\n3. Implement FAQ schema for Q&A content\n4. Add Local Business schema if applicable\n5. Test with Google\'s Structured Data Testing Tool'
    ));
  }
  
  // Analyze page speed indicators
  const pageSpeed = analyzePageSpeedIndicators(content);
  if (pageSpeed < 70) {
    findings.push('Page speed optimization needed');
    recommendations.push(createRecommendation(
      'Optimize page loading speed',
      'medium',
      'page-speed',
      '1. Optimize images (compress, use WebP)\n2. Minify CSS and JavaScript\n3. Enable compression (gzip/brotli)\n4. Use browser caching\n5. Optimize server response time'
    ));
  }
  
  const score = Math.round((headingStructure + metaInfo + altText + links + schemaMarkup + pageSpeed) / 6);
  const status = getScoreStatus(score);
  
  return {
    score,
    status,
    findings,
    recommendations,
    headingStructure,
    metaInfo,
    altText,
    links,
    schemaMarkup,
    pageSpeed
  };
}

export function analyzeContentQuality(content: CrawledContent): ContentQuality {
  const findings: string[] = [];
  const recommendations: RecommendationItem[] = [];
  
  const industryContext = detectIndustryExpertise(content);
  const text = content.paragraphs.join(' ');
  
  // Content Depth (40% weight)
  let depthScore = 0;
  const wordCount = text.split(/\s+/).length;
  if (wordCount >= 2000) depthScore += 25;
  else if (wordCount >= 1500) depthScore += 20;
  else if (wordCount >= 1000) depthScore += 15;
  
  // Industry-specific depth
  if (industryContext.isMarketingAgency) {
    const marketingDepth = [
      /marketing.*(strategy|plan|approach)/gi,
      /(seo|ppc|sem).*(strategy|optimization)/gi,
      /(analytics|data|metrics)/gi,
      /(conversion|funnel|customer journey)/gi
    ];
    
    const marketingScore = marketingDepth.filter(pattern => 
      pattern.test(text)
    ).length;
    depthScore += Math.min(15, marketingScore * 4);
  }
  
  // Content Relevance (35% weight)
  let relevanceScore = 0;
  
  // Thought leadership bonus (specific to Diviner content)
  const thoughtLeadership = [
    /pre.cog.*marketing/gi,
    /geo.*vs.*seo/gi,
    /ai.*overviews/gi,
    /generative.*engine/gi,
    /future.*marketing/gi
  ];
  
  const leadershipCount = thoughtLeadership.filter(pattern => 
    pattern.test(text)
  ).length;
  relevanceScore += Math.min(25, leadershipCount * 12); // High bonus
  
  // Case studies and proof points
  const proofPoints = [
    /case.stud(y|ies)/gi,
    /client.*(result|success|growth)/gi,
    /\d+%.*increase/gi,
    /roi.*improvement/gi
  ];
  
  const proofScore = proofPoints.filter(pattern => 
    pattern.test(text)
  ).length;
  relevanceScore += Math.min(15, proofScore * 6);
  
  // Content Freshness (25% weight)
  let freshnessScore = 0;
  
  // AI/emerging technology content (cutting-edge)
  const emergingTopics = [
    /2024|2025/gi,
    /ai.*(search|optimization|marketing)/gi,
    /chatgpt.*optimization/gi,
    /geo.*optimization/gi,
    /emerging.*technology/gi
  ];
  
  const emergingCount = emergingTopics.filter(pattern => 
    pattern.test(text)
  ).length;
  freshnessScore += Math.min(25, emergingCount * 8);
  
  const finalScore = Math.round((
    Math.min(100, depthScore) * 0.40 +
    Math.min(100, relevanceScore) * 0.35 +
    Math.min(100, freshnessScore) * 0.25
  ));
  
  // Add findings based on scores
  if (depthScore < 70) {
    findings.push('Content lacks comprehensive coverage of the topic');
    recommendations.push(createRecommendation(
      'Expand content to provide comprehensive topic coverage',
      'high',
      'content-depth',
      '1. Aim for 1500+ words for pillar content\n2. Include background information and context\n3. Add step-by-step guides and how-tos\n4. Include examples and case studies\n5. Provide actionable takeaways\n6. Answer related questions and subtopics'
    ));
  }
  
  if (relevanceScore < 70) {
    findings.push('Content may not fully address user search intent');
    recommendations.push(createRecommendation(
      'Better align content with user search intent',
      'high',
      'user-intent',
      '1. Analyze search intent for target keywords\n2. Include practical examples and advice\n3. Answer common user questions directly\n4. Use Google\'s "People also ask" for insights\n5. Match content format to intent (informational, transactional, etc.)'
    ));
  }
  
  if (freshnessScore < 70) {
    findings.push('Content lacks indicators of accuracy and currency');
    recommendations.push(createRecommendation(
      'Add credibility and freshness indicators',
      'medium',
      'credibility',
      '1. Include publication and last updated dates\n2. Add author information and credentials\n3. Cite authoritative sources with links\n4. Include expert quotes and statistics\n5. Add references and footnotes where appropriate'
    ));
  }
  
  const status = getScoreStatus(finalScore);
  
  return {
    score: finalScore,
    status,
    findings,
    recommendations,
    longTailKeywords: analyzeLongTailKeywords(content.paragraphs),
    comprehensiveCoverage: Math.min(100, depthScore),
    relevanceToUserIntent: Math.min(100, relevanceScore),
    accuracyAndCurrency: Math.min(100, freshnessScore),
    naturalLanguage: analyzeNaturalLanguage(content.paragraphs)
  };
}

// NEW: Industry context detection function
function detectIndustryExpertise(content: CrawledContent) {
  const text = content.paragraphs.join(' ').toLowerCase();
  
  const marketingAgencyIndicators = [
    /marketing (consultancy|consultant|agency)/gi,
    /seo.*(specialist|expert|consultant)/gi,
    /digital marketing/gi,
    /(ppc|google ads|paid search)/gi,
    /brand(ing)? strategy/gi
  ];
  
  const aiMarketingIndicators = [
    /ai.*(marketing|seo|optimization)/gi,
    /(geo|generative engine optimization)/gi,
    /(chatgpt|claude|perplexity|ai overviews)/gi,
    /ai.*(tools|integration|automation)/gi,
    /pre.cog.*marketing/gi // Specific to Diviner content
  ];
  
  const isMarketingAgency = marketingAgencyIndicators.some(pattern => 
    pattern.test(text)
  );
  
  const isAISpecialist = aiMarketingIndicators.some(pattern => 
    pattern.test(text)
  );
  
  return {
    isMarketingAgency,
    isAISpecialist,
    expertiseBonus: isAISpecialist ? 25 : isMarketingAgency ? 15 : 0
  };
}

export function analyzeAIOptimization(content: CrawledContent): AIOptimization {
  const findings: string[] = [];
  const recommendations: RecommendationItem[] = [];
  
  // Industry context detection
  const industryContext = detectIndustryExpertise(content);
  
  // Semantic Structure (45% weight)
  let semanticScore = 0;
  const h1Count = content.headings.filter(h => h.level === 1).length;
  const h2Count = content.headings.filter(h => h.level === 2).length;
  if (h1Count === 1) semanticScore += 20;
  if (h2Count >= 3) semanticScore += 15;
  
  // HTML validation from AI analysis data
  const htmlErrors = content.aiAnalysisData?.performanceMetrics?.htmlValidation?.errors || 0;
  if (htmlErrors < 50) semanticScore += 15;
  else if (htmlErrors >= 50) semanticScore -= 10;
  
  // Answer Potential (35% weight)
  let answerScore = 0;
  const aiTerms = [
    /ai.*(marketing|seo|optimization)/gi,
    /geo.*optimization/gi,
    /(chatgpt|claude|perplexity)/gi,
    /ai.*(overviews|answers|search)/gi,
    /generative.*engine/gi
  ];
  
  const text = content.paragraphs.join(' ');
  aiTerms.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) answerScore += Math.min(15, matches.length * 5);
  });
  
  // Content Clarity (20% weight)
  let clarityScore = 75; // Base score
  // Calculate readability score based on paragraph structure
  const avgWordsPerSentence = content.paragraphs.reduce((sum, p) => {
    const sentences = p.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = sentences.reduce((wordSum, s) => wordSum + s.split(' ').length, 0);
    return sum + (sentences.length > 0 ? words / sentences.length : 0);
  }, 0) / content.paragraphs.length;
  
  if (avgWordsPerSentence <= 20) clarityScore += 10;
  if (content.paragraphs.length > 3) clarityScore += 15;
  
  // Industry expertise bonus
  if (industryContext.isAISpecialist) {
    answerScore += 25; // Major bonus for AI specialization
    semanticScore += 15;
  }
  
  const finalScore = Math.round((
    Math.min(100, semanticScore) * 0.45 +
    Math.min(100, answerScore) * 0.35 +
    Math.min(100, clarityScore) * 0.20
  ));
  
  // Add findings based on the new clean metrics
  if (semanticScore < 70) {
    findings.push('Semantic structure needs improvement for AI understanding');
    recommendations.push(createRecommendation(
      'Improve semantic structure for AI processing',
      'high',
      'semantic-structure',
      '1. Use proper heading hierarchy (H1-H6)\n2. Implement schema markup\n3. Structure content with clear sections\n4. Use descriptive link text\n5. Add structured data for key information'
    ));
  }
  
  if (answerScore < 70) {
    findings.push('Content lacks clear answer potential for AI systems');
    recommendations.push(createRecommendation(
      'Optimize content for answer potential',
      'high',
      'answer-potential',
      '1. Structure content with clear Q&A format\n2. Include specific, factual information\n3. Use bullet points and numbered lists\n4. Add FAQ sections with direct answers\n5. Include data and statistics'
    ));
  }
  
  if (clarityScore < 70) {
    findings.push('Content clarity needs improvement for AI understanding');
    recommendations.push(createRecommendation(
      'Improve content clarity and reduce ambiguity',
      'medium',
      'content-clarity',
      '1. Define technical terms explicitly\n2. Use consistent terminology\n3. Avoid jargon and ambiguous phrases\n4. Structure content with logical flow\n5. Use specific rather than general language'
    ));
  }
  
  const status = getScoreStatus(finalScore);
  
  return {
    score: finalScore,
    status,
    findings,
    recommendations,
    // Clean AI-focused metrics (primary scoring)
    semanticStructure: Math.min(100, semanticScore),
    answerPotential: Math.min(100, answerScore),
    contentClarity: Math.min(100, clarityScore),
    industryBonus: industryContext.expertiseBonus,
    // Legacy metrics (maintained for compatibility but not used in scoring)
    chunkability: analyzeChunkability(content.paragraphs),
    qaFormat: analyzeQAFormat(content),
    entityRecognition: analyzeEntityRecognition(content),
    factualDensity: analyzeFactualDensity(content.paragraphs),
    semanticClarity: analyzeSemanticClarity(content.paragraphs),
    contentStructureForAI: analyzeContentStructureForAI(content),
    contextualRelevance: analyzeContextualRelevance(content)
  };
}

export function analyzeEEATSignals(content: CrawledContent): EEATSignals {
  const findings: string[] = [];
  const recommendations: RecommendationItem[] = [];
  
  const industryContext = detectIndustryExpertise(content);
  const text = content.paragraphs.join(' ').toLowerCase();
  
  // Expertise Analysis (40% weight)
  let expertiseScore = 0;
  
  // General expertise indicators
  const generalExpertise = [
    /\d+ years?.*(experience|business)/gi,
    /(certified|qualified|licensed)/gi,
    /(expert|specialist|consultant)/gi,
    /(strategy|strategic|planning)/gi
  ];
  
  generalExpertise.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) expertiseScore += Math.min(8, matches.length * 3);
  });
  
  // Marketing-specific expertise (MAJOR BONUS)
  if (industryContext.isMarketingAgency) {
    const marketingExpertise = [
      /seo.*(strategy|audit|optimization)/gi,
      /(ppc|google ads|paid search)/gi,
      /brand.*positioning/gi,
      /(analytics|tracking|roi)/gi,
      /conversion.*optimization/gi
    ];
    
    marketingExpertise.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) expertiseScore += Math.min(12, matches.length * 4);
    });
  }
  
  // AI specialization (MASSIVE BONUS)
  if (industryContext.isAISpecialist) {
    expertiseScore += 30; // Large bonus for AI marketing specialization
  }
  
  // Authority Analysis (35% weight)
  let authorityScore = 0;
  
  const authorityIndicators = [
    /case stud(y|ies)/gi,
    /client.*(results?|success)/gi,
    /(podcast|interview|speaker)/gi,
    /(award|recognition|featured)/gi,
    /portfolio/gi
  ];
  
  authorityIndicators.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) authorityScore += Math.min(15, matches.length * 5);
  });
  
  // Domain authority bonus
  if (content.url.includes('.agency') || content.url.includes('consulting')) {
    authorityScore += 20;
  }
  
  // Trust Analysis (25% weight)
  let trustScore = 0;
  
  const trustIndicators = [
    /contact.*(us|information)/gi,
    /(about|team|bio)/gi,
    /(testimonial|review|client)/gi,
    /(transparent|honest|ethical)/gi,
    /(guarantee|promise)/gi
  ];
  
  trustIndicators.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) trustScore += Math.min(12, matches.length * 4);
  });
  
  const finalScore = Math.round((
    Math.min(100, expertiseScore) * 0.40 +
    Math.min(100, authorityScore) * 0.35 +
    Math.min(100, trustScore) * 0.25
  ));
  
  // Add findings based on scores
  if (expertiseScore < 70) {
    findings.push('Limited demonstration of expertise and experience');
    recommendations.push(createRecommendation(
      'Strengthen expertise and experience signals',
      'high',
      'expertise-experience',
      '1. Add author credentials and detailed bios\n2. Include industry-specific experience details\n3. Highlight relevant qualifications and certifications\n4. Showcase first-hand experience with case studies\n5. Demonstrate deep subject matter knowledge'
    ));
  }
  
  if (authorityScore < 70) {
    findings.push('Authoritativeness signals need improvement');
    recommendations.push(createRecommendation(
      'Enhance authoritativeness and recognition',
      'high',
      'authoritativeness',
      '1. Build domain authority through quality backlinks\n2. Gain industry recognition and awards\n3. Establish thought leadership through original research\n4. Get cited by authoritative sources\n5. Build strong brand presence in your niche'
    ));
  }
  
  if (trustScore < 70) {
    findings.push('Trustworthiness and transparency need improvement');
    recommendations.push(createRecommendation(
      'Improve trustworthiness and transparency',
      'high',
      'trustworthiness',
      '1. Add comprehensive citations and sources\n2. Include clear contact information\n3. Add privacy policies and terms of service\n4. Provide business verification details\n5. Include transparent pricing and policies'
    ));
  }
  
  const status = getScoreStatus(finalScore);
  
  return {
    score: finalScore,
    status,
    findings,
    recommendations,
    expertiseExperience: Math.min(100, expertiseScore),
    authoritativeness: Math.min(100, authorityScore),
    trustworthiness: Math.min(100, trustScore),
    factualAccuracy: analyzeFactualAccuracy(content)
  };
}





export function analyzeTechnicalCrawlability(content: CrawledContent): TechnicalCrawlability {
  const findings: string[] = [];
  const recommendations: RecommendationItem[] = [];
  
  // Analyze robots.txt access
  const robotsAccess = analyzeRobotsAccess(content);
  if (robotsAccess < 70) {
    findings.push('Robots.txt configuration may be blocking AI bots');
    recommendations.push(createRecommendation(
      'Ensure robots.txt allows AI crawlers like GPTBot, ChatGPT-User, CCBot, and BingBot',
      'high',
      'bot-access',
      '1. Check your robots.txt file\n2. Add "User-agent: GPTBot\nAllow: /"\n3. Add "User-agent: ChatGPT-User\nAllow: /"\n4. Add "User-agent: CCBot\nAllow: /"\n5. Test with Google Search Console'
    ));
  }
  
  // Analyze bot accessibility
  const botAccessibility = analyzeBotAccessibility(content);
  if (botAccessibility < 70) {
    findings.push('Content may not be easily accessible to AI bots');
    recommendations.push(createRecommendation(
      'Optimize content delivery for AI bot crawling',
      'high',
      'accessibility',
      '1. Ensure content loads without JavaScript\n2. Use server-side rendering\n3. Provide text alternatives for dynamic content\n4. Test your site with JavaScript disabled'
    ));
  }
  
  // Analyze content delivery speed
  const contentDelivery = analyzeContentDelivery(content);
  if (contentDelivery < 70) {
    findings.push('Page load speed may affect AI bot crawling efficiency');
    recommendations.push(createRecommendation(
      'Improve page load speed for better bot accessibility',
      'medium',
      'performance',
      '1. Optimize images (WebP format, proper sizing)\n2. Minify CSS and JavaScript\n3. Enable compression\n4. Use a CDN\n5. Optimize server response times'
    ));
  }
  
  // Analyze JavaScript dependency
  const javascriptDependency = analyzeJavaScriptDependency(content);
  if (javascriptDependency < 70) {
    findings.push('Content heavily depends on JavaScript, which may limit AI bot access');
    recommendations.push(createRecommendation(
      'Reduce JavaScript dependency for critical content',
      'high',
      'javascript',
      '1. Implement server-side rendering\n2. Provide noscript alternatives\n3. Use progressive enhancement\n4. Ensure critical content is in HTML\n5. Consider static site generation'
    ));
  }
  
  // Analyze load speed
  const loadSpeed = analyzeLoadSpeed(content);
  if (loadSpeed < 70) {
    findings.push('Slow loading times may impact AI bot crawling');
    recommendations.push(createRecommendation(
      'Optimize website loading speed for AI crawlers',
      'medium',
      'speed',
      '1. Enable browser caching\n2. Optimize images\n3. Minimize HTTP requests\n4. Use efficient hosting\n5. Monitor Core Web Vitals'
    ));
  }
  
  const score = Math.round((robotsAccess + botAccessibility + contentDelivery + javascriptDependency + loadSpeed) / 5);
  const status = getScoreStatus(score);
  
  return {
    score,
    status,
    findings,
    recommendations,
    robotsAccess,
    botAccessibility,
    contentDelivery,
    javascriptDependency,
    loadSpeed
  };
}

export function analyzeMobileOptimization(content: CrawledContent): MobileOptimization {
  const findings: string[] = [];
  const recommendations: RecommendationItem[] = [];
  
  // Analyze mobile page speed
  const mobilePageSpeed = analyzeMobilePageSpeed(content);
  if (mobilePageSpeed < 70) {
    findings.push('Mobile page speed needs optimization');
    recommendations.push(createRecommendation(
      'Optimize mobile page loading speed',
      'high',
      'mobile-speed',
      '1. Compress and optimize images for mobile\n2. Minify CSS and JavaScript\n3. Enable browser caching\n4. Use responsive image formats (WebP)\n5. Minimize render-blocking resources'
    ));
  }
  
  // Analyze touch targets
  const touchTargets = analyzeTouchTargets(content);
  if (touchTargets < 70) {
    findings.push('Touch targets may be too small or poorly spaced');
    recommendations.push(createRecommendation(
      'Improve touch target sizing and spacing',
      'high',
      'touch-targets',
      '1. Make buttons at least 44px × 44px\n2. Add 8px spacing between touch targets\n3. Ensure clickable areas are easily tappable\n4. Test on actual mobile devices\n5. Use larger fonts for better readability'
    ));
  }
  
  // Analyze viewport configuration
  const viewportConfiguration = analyzeViewportConfiguration(content);
  if (viewportConfiguration < 70) {
    findings.push('Viewport configuration is missing or incorrect');
    recommendations.push(createRecommendation(
      'Configure proper viewport meta tag',
      'high',
      'viewport-config',
      '1. Add viewport meta tag: <meta name="viewport" content="width=device-width, initial-scale=1">\n2. Avoid fixed-width layouts\n3. Test on various screen sizes\n4. Ensure content fits without horizontal scrolling\n5. Use flexible CSS units (%, vw, vh)'
    ));
  }
  
  // Analyze mobile usability
  const mobileUsability = analyzeMobileUsability(content);
  if (mobileUsability < 70) {
    findings.push('Mobile usability issues detected');
    recommendations.push(createRecommendation(
      'Improve mobile user experience',
      'medium',
      'mobile-usability',
      '1. Use mobile-friendly font sizes (16px minimum)\n2. Avoid Flash and other unsupported plugins\n3. Ensure content is accessible without zoom\n4. Optimize forms for mobile input\n5. Test navigation on mobile devices'
    ));
  }
  
  // Analyze responsive design
  const responsiveDesign = analyzeResponsiveDesign(content);
  if (responsiveDesign < 70) {
    findings.push('Responsive design implementation needs improvement');
    recommendations.push(createRecommendation(
      'Enhance responsive design implementation',
      'medium',
      'responsive-design',
      '1. Use CSS media queries for different screen sizes\n2. Implement flexible grid layouts\n3. Use responsive images with srcset\n4. Test on multiple devices and screen sizes\n5. Ensure consistent experience across devices'
    ));
  }
  
  const score = Math.round((mobilePageSpeed + touchTargets + viewportConfiguration + mobileUsability + responsiveDesign) / 5);
  const status = getScoreStatus(score);
  
  return {
    score,
    status,
    findings,
    recommendations,
    mobilePageSpeed,
    touchTargets,
    viewportConfiguration,
    mobileUsability,
    responsiveDesign
  };
}

export function analyzeSchemaAnalysis(content: CrawledContent): SchemaAnalysis {
  const findings: string[] = [];
  const recommendations: RecommendationItem[] = [];
  
  // Analyze schema presence
  const schemaPresence = analyzeSchemaPresence(content);
  if (schemaPresence < 70) {
    findings.push('Limited or missing structured data markup');
    recommendations.push(createRecommendation(
      'Implement comprehensive structured data markup',
      'high',
      'schema-presence',
      '1. Add Organization schema for business information\n2. Implement Article schema for blog posts\n3. Use Product schema for e-commerce items\n4. Add LocalBusiness schema if applicable\n5. Use Google\'s Structured Data Testing Tool to validate'
    ));
  }
  
  // Analyze schema validation
  const schemaValidation = analyzeSchemaValidation(content);
  if (schemaValidation < 70) {
    findings.push('Structured data contains errors or is incomplete');
    recommendations.push(createRecommendation(
      'Fix structured data validation errors',
      'high',
      'schema-validation',
      '1. Use Google\'s Rich Results Test tool\n2. Fix syntax errors in JSON-LD\n3. Ensure required properties are included\n4. Validate schema against Schema.org specifications\n5. Test for rich snippet eligibility'
    ));
  }
  
  // Analyze rich snippet potential
  const richSnippetPotential = analyzeRichSnippetPotential(content);
  if (richSnippetPotential < 70) {
    findings.push('Content not optimized for rich snippets');
    recommendations.push(createRecommendation(
      'Optimize content for rich snippet opportunities',
      'medium',
      'rich-snippets',
      '1. Add FAQ schema for question-answer content\n2. Implement Review schema for testimonials\n3. Use HowTo schema for step-by-step guides\n4. Add Recipe schema for cooking content\n5. Include Event schema for event listings'
    ));
  }
  
  // Analyze structured data completeness
  const structuredDataCompleteness = analyzeStructuredDataCompleteness(content);
  if (structuredDataCompleteness < 70) {
    findings.push('Structured data implementation is incomplete');
    recommendations.push(createRecommendation(
      'Complete structured data implementation',
      'medium',
      'schema-completeness',
      '1. Add missing required properties\n2. Include optional but valuable properties\n3. Ensure consistency across all pages\n4. Add breadcrumb schema for navigation\n5. Implement sitelinks search box schema'
    ));
  }
  
  // Analyze JSON-LD implementation
  const jsonLdImplementation = analyzeJsonLdImplementation(content);
  if (jsonLdImplementation < 70) {
    findings.push('JSON-LD implementation needs improvement');
    recommendations.push(createRecommendation(
      'Improve JSON-LD structured data implementation',
      'low',
      'json-ld',
      '1. Prefer JSON-LD over Microdata for new implementations\n2. Place JSON-LD in the <head> section\n3. Use proper schema.org context\n4. Ensure valid JSON syntax\n5. Keep structured data updated with content changes'
    ));
  }
  
  const score = Math.round((schemaPresence + schemaValidation + richSnippetPotential + structuredDataCompleteness + jsonLdImplementation) / 5);
  const status = getScoreStatus(score);
  
  return {
    score,
    status,
    findings,
    recommendations,
    schemaPresence,
    schemaValidation,
    richSnippetPotential,
    structuredDataCompleteness,
    jsonLdImplementation
  };
}

// Helper functions for TechnicalCrawlability analysis
function analyzeRobotsAccess(content: CrawledContent): number {
  if (!content.robotsInfo) {
    return 50; // Assume default if no robots info available
  }
  
  let score = 70; // Base score
  
  if (content.robotsInfo.hasRobotsTxt) {
    score += 10;
    if (content.robotsInfo.allowsAllBots) {
      score += 20;
    }
    if (content.robotsInfo.hasSpecificBotRules) {
      // Check if content mentions AI bot user agents
      const aiBotsAllowed = content.robotsInfo.content?.includes('GPTBot') ||
                           content.robotsInfo.content?.includes('ChatGPT-User') ||
                           content.robotsInfo.content?.includes('CCBot');
      if (aiBotsAllowed) score += 20;
    }
  } else {
    score -= 10; // No robots.txt might be an issue
  }
  
  return Math.min(100, score);
}

function analyzeBotAccessibility(content: CrawledContent): number {
  let score = 70;
  
  // Check if content is available without JavaScript
  if (!content.hasJavaScriptDependency) {
    score += 20;
  } else {
    score -= 10;
  }
  
  // Check for structured content that bots can easily parse
  if (content.headings.length > 0) score += 10;
  if (content.paragraphs.length > 0) score += 10;
  
  return Math.min(100, score);
}

function analyzeContentDelivery(content: CrawledContent): number {
  let score = 70;
  
  // Simulate load time analysis (in real implementation, this would be measured)
  if (content.loadTime) {
    if (content.loadTime < 2) score += 30;
    else if (content.loadTime < 4) score += 10;
    else score -= 20;
  }
  
  // Check content size indicators
  if (content.html.length < 50000) score += 10; // Reasonable HTML size
  if (content.images.length < 10) score += 10; // Not too many images
  
  return Math.min(100, score);
}

function analyzeJavaScriptDependency(content: CrawledContent): number {
  let score = 80;
  
  if (content.hasJavaScriptDependency) {
    score -= 30;
    
    // Check if there's still meaningful content without JS
    if (content.paragraphs.length > 3) score += 10;
    if (content.headings.length > 1) score += 10;
  }
  
  return Math.max(0, score);
}

function analyzeLoadSpeed(content: CrawledContent): number {
  let score = 70;
  
  // Estimate based on content size and complexity
  const htmlSize = content.html.length;
  const imageCount = content.images.length;
  
  if (htmlSize < 30000) score += 15;
  else if (htmlSize > 100000) score -= 15;
  
  if (imageCount > 10) score -= 10;
  
  // Check for performance indicators
  const hasOptimizedImages = content.images.some(img => 
    img.src.includes('.webp') || img.src.includes('optimize')
  );
  if (hasOptimizedImages) score += 15;
  
  return Math.min(100, score);
}

function analyzeSchemaMarkup(content: CrawledContent): number {
  let score = 0;
  
  // Check for common schema types
  const schemaCount = content.schemaMarkup.length;
  if (schemaCount > 0) score += 50;
  if (schemaCount > 2) score += 20;
  if (schemaCount > 4) score += 20;
  
  // Check for specific valuable schema types
  const schemaContent = content.schemaMarkup.join(' ').toLowerCase();
  if (schemaContent.includes('organization')) score += 10;
  if (schemaContent.includes('article')) score += 10;
  if (schemaContent.includes('faq')) score += 10;
  if (schemaContent.includes('local')) score += 10;
  
  return Math.min(100, score);
}

function analyzePageSpeedIndicators(content: CrawledContent): number {
  let score = 70;
  
  // Check HTML size
  const htmlSize = content.html.length;
  if (htmlSize < 50000) score += 10;
  else if (htmlSize > 200000) score -= 20;
  
  // Check image optimization
  const totalImages = content.images.length;
  if (totalImages === 0) score += 10;
  else {
    const optimizedImages = content.images.filter(img => 
      img.src.includes('.webp') || 
      img.src.includes('compress') || 
      img.src.includes('optimize')
    ).length;
    
    if (optimizedImages / totalImages > 0.5) score += 15;
  }
  
  // Check for performance best practices
  const html = content.html.toLowerCase();
  if (html.includes('defer') || html.includes('async')) score += 5;
  if (html.includes('preload')) score += 5;
  
  return Math.min(100, score);
}

function analyzeContentStructureForAI(content: CrawledContent): number {
  let score = 70;
  
  // Check heading hierarchy
  if (content.headings.length > 0) score += 10;
  if (content.headings.some(h => h.level === 1)) score += 10;
  
  // Check for structured elements
  const html = content.html.toLowerCase();
  if (html.includes('<table')) score += 5;
  if (html.includes('<ul>') || html.includes('<ol>')) score += 10;
  
  // Check schema markup
  if (content.schemaMarkup.length > 0) score += 15;
  
  // Check for clear content organization
  if (content.paragraphs.length > 3) score += 5;
  if (content.links.length > 0) score += 5;
  
  return Math.min(100, score);
}

function analyzeContextualRelevance(content: CrawledContent): number {
  let score = 70;
  
  // Check title-content alignment
  if (content.title && content.paragraphs.length > 0) {
    const titleWords = content.title.toLowerCase().split(' ');
    const contentText = content.paragraphs.join(' ').toLowerCase();
    const relevantWords = titleWords.filter(word => 
      word.length > 3 && contentText.includes(word)
    ).length;
    
    if (relevantWords / titleWords.length > 0.5) score += 15;
  }
  
  // Check for context-providing elements
  const text = content.paragraphs.join(' ').toLowerCase();
  const contextWords = ['because', 'therefore', 'however', 'additionally', 'furthermore', 'moreover'];
  const contextCount = contextWords.filter(word => text.includes(word)).length;
  if (contextCount > 2) score += 10;
  
  // Check for explanatory content
  if (text.includes('what is') || text.includes('how to') || text.includes('why')) score += 5;
  
  return Math.min(100, score);
}

// Helper functions for analysis
function analyzeHeadingHierarchy(headings: { level: number; text: string }[]): number {
  if (headings.length === 0) return 0;
  
  const h1Count = headings.filter(h => h.level === 1).length;
  if (h1Count !== 1) return 40; // Should have exactly one H1
  
  let score = 70;
  let prevLevel = 0;
  
  for (const heading of headings) {
    if (heading.level > prevLevel + 1) {
      score -= 10; // Skipped heading level
    }
    prevLevel = heading.level;
  }
  
  return Math.max(0, score);
}

function analyzeMetaInformation(content: CrawledContent): number {
  let score = 0;
  
  if (content.title && content.title.length > 0) score += 40;
  if (content.title && content.title.length >= 30 && content.title.length <= 60) score += 20;
  if (content.metaDescription && content.metaDescription.length > 0) score += 20;
  if (content.metaDescription && content.metaDescription.length >= 150 && content.metaDescription.length <= 160) score += 20;
  
  return score;
}

function analyzeAltText(images: { src: string; alt: string }[]): number {
  if (images.length === 0) return 100; // No images to analyze
  
  const imagesWithAlt = images.filter(img => img.alt && img.alt.trim().length > 0);
  return Math.round((imagesWithAlt.length / images.length) * 100);
}

function analyzeLinkQuality(links: { href: string; text: string; internal: boolean }[]): number {
  if (links.length === 0) return 50;
  
  const internalLinks = links.filter(link => link.internal).length;
  const externalLinks = links.filter(link => !link.internal).length;
  const descriptiveLinks = links.filter(link => 
    link.text.length > 5 && 
    !link.text.toLowerCase().includes('click here') && 
    !link.text.toLowerCase().includes('read more')
  ).length;
  
  let score = 50;
  if (internalLinks > 0) score += 20;
  if (externalLinks > 0) score += 10;
  if (descriptiveLinks / links.length > 0.8) score += 20;
  
  return Math.min(100, score);
}

function analyzeReadability(paragraphs: string[]): number {
  if (paragraphs.length === 0) return 0;
  
  const avgWordsPerParagraph = paragraphs.reduce((sum, p) => sum + p.split(' ').length, 0) / paragraphs.length;
  const avgSentencesPerParagraph = paragraphs.reduce((sum, p) => sum + p.split(/[.!?]+/).length, 0) / paragraphs.length;
  
  let score = 70;
  if (avgWordsPerParagraph > 100) score -= 20;
  if (avgSentencesPerParagraph > 5) score -= 10;
  
  return Math.max(0, score);
}

function analyzeLongTailKeywords(paragraphs: string[]): number {
  const text = paragraphs.join(' ').toLowerCase();
  const questionWords = ['how', 'what', 'why', 'when', 'where', 'which', 'who'];
  const questionPhrases = questionWords.filter(word => text.includes(word)).length;
  
  return Math.min(100, questionPhrases * 15);
}

function analyzeContentDepth(content: CrawledContent): number {
  let score = 0;
  const text = content.paragraphs.join(' ');
  
  // Enhanced word count analysis
  const wordCount = text.split(/\s+/).length;
  if (wordCount >= 2500) score += 30;
  else if (wordCount >= 1500) score += 25;
  else if (wordCount >= 1000) score += 20;
  else if (wordCount >= 500) score += 15;
  else score += 10;
  
  // Enhanced topic coverage for higher education SEO
  const topicCoverage = [
    /student recruitment/gi,
    /enrollment/gi,
    /higher education/gi,
    /college|university/gi,
    /seo (strategy|services)/gi,
    /organic search/gi,
    /keyword research/gi,
    /content marketing/gi,
    /prospective students/gi,
    /student search behavior/gi,
    /enrollment goals/gi,
    /higher ed challenges/gi,
    /institutional goals/gi
  ];
  
  const coverageScore = topicCoverage.filter(pattern => 
    pattern.test(text)
  ).length;
  score += Math.min(30, coverageScore * 3);
  
  // Content structure analysis
  const hasHeadings = content.headings.length > 0;
  const hasLists = text.includes('•') || text.includes('-') || text.includes('1.') || text.includes('2.');
  const hasExamples = text.includes('example') || text.includes('case study') || text.includes('for instance');
  
  if (hasHeadings) score += 10;
  if (hasLists) score += 10;
  if (hasExamples) score += 10;
  
  // Content freshness indicators
  const freshnessIndicators = [
    /ai (overview|search|driven)/gi,
    /chatgpt/gi,
    /voice search/gi,
    /mobile.first/gi,
    /structured data/gi,
    /202[3-5]/gi, // Recent years
    /current|latest|recent/gi
  ];
  
  const freshnessScore = freshnessIndicators.filter(pattern => 
    pattern.test(text)
  ).length;
  score += Math.min(20, freshnessScore * 3);
  
  return Math.min(100, score);
}

function analyzeRelevance(content: CrawledContent): number {
  let score = 0;
  const text = content.paragraphs.join(' ').toLowerCase();
  
  // Enhanced user intent alignment for higher education SEO
  const intentIndicators = [
    /prospective students/gi,
    /student search behavior/gi,
    /enrollment goals/gi,
    /higher ed challenges/gi,
    /institutional goals/gi,
    /college marketing/gi,
    /university seo/gi,
    /student recruitment/gi,
    /enrollment marketing/gi,
    /higher education marketing/gi
  ];
  
  const intentScore = intentIndicators.filter(pattern => 
    pattern.test(text)
  ).length;
  score += Math.min(40, intentScore * 4);
  
  // Content format relevance
  const hasFAQ = text.includes('faq') || text.includes('question') || text.includes('answer');
  const hasHowTo = text.includes('how to') || text.includes('step') || text.includes('guide');
  const hasCaseStudy = text.includes('case study') || text.includes('example') || text.includes('result');
  
  if (hasFAQ) score += 15;
  if (hasHowTo) score += 15;
  if (hasCaseStudy) score += 15;
  
  // Keyword relevance
  const keywordDensity = (text.match(/seo|search|optimization|marketing/gi) || []).length;
  score += Math.min(15, keywordDensity * 2);
  
  return Math.min(100, score);
}

function analyzeAccuracy(content: CrawledContent): number {
  let score = 0;
  const text = content.paragraphs.join(' ').toLowerCase();
  
  // Enhanced accuracy indicators
  const accuracyIndicators = [
    /according to/gi,
    /research shows/gi,
    /studies indicate/gi,
    /data from/gi,
    /statistics show/gi,
    /based on/gi,
    /cited/gi,
    /source:/gi,
    /reference/gi,
    /expert/gi,
    /specialist/gi,
    /certified/gi
  ];
  
  const accuracyScore = accuracyIndicators.filter(pattern => 
    pattern.test(text)
  ).length;
  score += Math.min(40, accuracyScore * 4);
  
  // Specific data points and statistics
  const hasStatistics = /\d+%|\d+ percent|\d+ students|\d+ universities/.test(text);
  const hasDates = /\d{4}|\d{1,2}\/\d{1,2}|\d{1,2}-\d{1,2}/.test(text);
  const hasMetrics = /increase|decrease|growth|improvement|result/.test(text);
  
  if (hasStatistics) score += 20;
  if (hasDates) score += 15;
  if (hasMetrics) score += 15;
  
  // Credibility signals
  const credibilityIndicators = [
    'expert', 'specialist', 'certified', 'licensed', 'qualified',
    'experience', 'background', 'credentials', 'authority'
  ];
  
  const credibilityScore = credibilityIndicators.filter(indicator => 
    text.includes(indicator)
  ).length;
  score += Math.min(10, credibilityScore * 2);
  
  return Math.min(100, score);
}

function analyzeNaturalLanguage(paragraphs: string[]): number {
  let score = 50; // Start with neutral score
  
  const text = paragraphs.join(' ').toLowerCase();
  
  // Check for natural language indicators
  const naturalIndicators = [
    'you', 'your', 'we', 'our', 'us', // Personal pronouns
    'can', 'will', 'should', 'might', // Modal verbs
    'because', 'however', 'therefore', 'meanwhile', // Transition words
    'let\'s', 'we\'re', 'you\'re', 'it\'s', // Contractions
    'think', 'believe', 'know', 'feel' // Opinion words
  ];
  
  const naturalScore = naturalIndicators.filter(indicator => 
    text.includes(indicator)
  ).length;
  score += Math.min(30, naturalScore * 2);
  
  // Check for conversational phrases
  const conversationalPhrases = [
    'for example', 'in other words', 'to put it simply',
    'as you can see', 'clearly', 'obviously', 'naturally'
  ];
  
  const conversationalScore = conversationalPhrases.filter(phrase => 
    text.includes(phrase)
  ).length;
  score += Math.min(20, conversationalScore * 4);
  
  return Math.min(100, score);
}

function analyzeChunkability(paragraphs: string[]): number {
  if (paragraphs.length === 0) return 0;
  
  const idealChunks = paragraphs.filter(p => {
    const sentences = p.split(/[.!?]+/).filter(s => s.trim().length > 0);
    return sentences.length >= 2 && sentences.length <= 4 && p.length <= 300;
  }).length;
  
  return Math.round((idealChunks / paragraphs.length) * 100);
}

function analyzeQAFormat(content: CrawledContent): number {
  const text = content.paragraphs.join(' ').toLowerCase();
  const questionMarkers = text.match(/\?/g)?.length || 0;
  const headingQuestions = content.headings.filter(h => h.text.includes('?')).length;
  
  let score = 0;
  if (questionMarkers > 0) score += 40;
  if (headingQuestions > 0) score += 40;
  if (questionMarkers > 3) score += 20;
  
  return Math.min(100, score);
}

function analyzeEntityRecognition(content: CrawledContent): number {
  const text = content.paragraphs.join(' ');
  
  // Look for capitalized words (potential entities)
  const capitalizedWords = text.match(/\b[A-Z][a-z]+\b/g) || [];
  const uniqueEntities = new Set(capitalizedWords.filter(word => word.length > 2));
  
  return Math.min(100, uniqueEntities.size * 5);
}

function analyzeFactualDensity(paragraphs: string[]): number {
  const text = paragraphs.join(' ').toLowerCase();
  const factualWords = [
    'percent', '%', 'study', 'research', 'data', 'statistics', 'according to',
    'survey', 'report', 'analysis', 'found', 'shows', 'indicates', 'reveals'
  ];
  
  const factualCount = factualWords.filter(word => text.includes(word)).length;
  return Math.min(100, factualCount * 15);
}

function analyzeSemanticClarity(paragraphs: string[]): number {
  const text = paragraphs.join(' ').toLowerCase();
  const ambiguousWords = [
    'maybe', 'perhaps', 'might', 'could be', 'possibly', 'seems', 
    'appears', 'probably', 'likely', 'some', 'many', 'few'
  ];
  
  const ambiguousCount = ambiguousWords.filter(word => text.includes(word)).length;
  const totalWords = text.split(' ').length;
  
  return Math.max(0, 100 - (ambiguousCount / totalWords) * 1000);
}

function analyzeSocialMediaPresence(content: CrawledContent): number {
  const text = content.html.toLowerCase();
  const socialPlatforms = ['facebook', 'twitter', 'linkedin', 'instagram', 'youtube'];
  const foundPlatforms = socialPlatforms.filter(platform => text.includes(platform)).length;
  
  return foundPlatforms * 20;
}

function analyzeCompanyInformation(content: CrawledContent): number {
  const text = content.paragraphs.join(' ').toLowerCase();
  const companyIndicators = [
    'about us', 'our team', 'company', 'founded', 'established', 
    'mission', 'vision', 'values', 'experience', 'expertise'
  ];
  
  const foundIndicators = companyIndicators.filter(indicator => text.includes(indicator)).length;
  return Math.min(100, foundIndicators * 15);
}

function analyzeLegalCompliance(content: CrawledContent): number {
  const text = content.html.toLowerCase();
  const legalTerms = ['privacy policy', 'terms of service', 'cookie policy', 'gdpr', 'legal'];
  const foundTerms = legalTerms.filter(term => text.includes(term)).length;
  
  return Math.min(100, foundTerms * 25);
}

function analyzeTestimonials(content: CrawledContent): number {
  const text = content.paragraphs.join(' ').toLowerCase();
  const testimonialIndicators = [
    'testimonial', 'review', 'client says', 'customer', 'feedback',
    'satisfied', 'recommend', 'excellent service', 'great work'
  ];
  
  const foundIndicators = testimonialIndicators.filter(indicator => text.includes(indicator)).length;
  return Math.min(100, foundIndicators * 20);
}

function analyzeAffiliations(content: CrawledContent): number {
  const text = content.paragraphs.join(' ').toLowerCase();
  const affiliationIndicators = [
    'certified', 'accredited', 'member', 'association', 'partner',
    'award', 'recognition', 'licensed', 'qualified'
  ];
  
  const foundIndicators = affiliationIndicators.filter(indicator => text.includes(indicator)).length;
  return Math.min(100, foundIndicators * 15);
}

function analyzeContactInfo(content: CrawledContent): number {
  const text = content.html.toLowerCase();
  const contactIndicators = ['contact', 'phone', 'email', 'address', 'location'];
  const foundIndicators = contactIndicators.filter(indicator => text.includes(indicator)).length;
  
  return Math.min(100, foundIndicators * 25);
}

function analyzeCallsToAction(content: CrawledContent): number {
  const text = content.paragraphs.join(' ').toLowerCase();
  const ctaWords = [
    'contact us', 'get started', 'learn more', 'sign up', 'subscribe',
    'download', 'request', 'call now', 'book', 'schedule'
  ];
  
  const foundCTAs = ctaWords.filter(cta => text.includes(cta)).length;
  return Math.min(100, foundCTAs * 20);
}

function analyzeLanguageAccessibility(content: CrawledContent): number {
  const paragraphs = content.paragraphs;
  if (paragraphs.length === 0) return 0;
  
  const avgWordsPerSentence = paragraphs.reduce((sum, p) => {
    const sentences = p.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = sentences.reduce((wordSum, s) => wordSum + s.split(' ').length, 0);
    return sum + (sentences.length > 0 ? words / sentences.length : 0);
  }, 0) / paragraphs.length;
  
  // Optimal sentence length is 15-20 words
  if (avgWordsPerSentence >= 15 && avgWordsPerSentence <= 20) return 100;
  if (avgWordsPerSentence >= 10 && avgWordsPerSentence <= 25) return 80;
  return 60;
}

function analyzeStructuredContent(content: CrawledContent): number {
  let score = 0;
  
  // Enhanced heading structure analysis
  const headings = content.headings;
  if (headings.length > 0) {
    score += 20; // Base score for having headings
    
    // Check for proper heading hierarchy
    const headingLevels = headings.map(h => h.level);
    const hasH1 = headingLevels.includes(1);
    const hasH2 = headingLevels.includes(2);
    const hasH3 = headingLevels.includes(3);
    const hasH4 = headingLevels.includes(4);
    
    // Enhanced hierarchy scoring
    if (hasH1) score += 15; // H1 is crucial
    if (hasH2) score += 10; // H2 for major sections
    if (hasH3) score += 8;  // H3 for subsections
    if (hasH4) score += 5;  // H4 for detailed subsections
    
    // Check for logical hierarchy (no skipping levels)
    let hasGoodHierarchy = true;
    for (let i = 0; i < headingLevels.length - 1; i++) {
      if (headingLevels[i + 1] - headingLevels[i] > 1) {
        hasGoodHierarchy = false;
        break;
      }
    }
    if (hasGoodHierarchy) score += 10;
    
    // Bonus for comprehensive heading structure
    if (hasH1 && hasH2 && hasH3) score += 5;
  }
  
  // Enhanced structured elements analysis
  const html = content.html.toLowerCase();
  const structureElements = [
    '<ul>', '<ol>', '<li>', '<table>', '<th>', '<td>', 
    '<blockquote>', '<section>', '<article>', '<aside>',
    '<nav>', '<header>', '<footer>', '<main>'
  ];
  const foundElements = structureElements.filter(element => html.includes(element)).length;
  score += Math.min(25, foundElements * 2); // More balanced scoring
  
  // Enhanced paragraph structure analysis
  const paragraphs = content.paragraphs;
  if (paragraphs.length > 0) {
    score += 10; // Base score for having paragraphs
    
    // Check for reasonable paragraph lengths with better distribution
    const shortParagraphs = paragraphs.filter(p => p.length < 50).length;
    const mediumParagraphs = paragraphs.filter(p => p.length >= 50 && p.length < 200).length;
    const longParagraphs = paragraphs.filter(p => p.length >= 200 && p.length < 500).length;
    const veryLongParagraphs = paragraphs.filter(p => p.length >= 500).length;
    
    // Prefer medium-length paragraphs, allow some variety
    const paragraphScore = Math.min(20, 
      (mediumParagraphs * 2 + longParagraphs * 1.5 + shortParagraphs * 0.5 - veryLongParagraphs * 0.5) / paragraphs.length * 20
    );
    score += paragraphScore;
  }
  
  // Enhanced content organization analysis
  const totalContentLength = content.html.length;
  const textContentLength = content.paragraphs.join(' ').length;
  const contentRatio = textContentLength / totalContentLength;
  
  if (contentRatio > 0.4) score += 15; // Excellent content-to-markup ratio
  else if (contentRatio > 0.3) score += 10; // Good content-to-markup ratio
  else if (contentRatio > 0.2) score += 5;  // Acceptable content-to-markup ratio
  
  // Navigation and site structure bonus
  if (html.includes('<nav>') || html.includes('class="nav') || html.includes('id="nav')) {
    score += 5; // Bonus for clear navigation structure
  }
  
  // Semantic HTML bonus
  if (html.includes('<main>') || html.includes('<article>') || html.includes('<section>')) {
    score += 5; // Bonus for semantic HTML elements
  }
  
  return Math.min(100, score);
}

function analyzeMultimedia(content: CrawledContent): number {
  let score = 0;
  
  // Enhanced image analysis
  const imageCount = content.images.length;
  if (imageCount > 0) {
    score += 25; // Base score for having images
    
    // Enhanced alt text quality analysis
    const imagesWithGoodAlt = content.images.filter(img => 
      img.alt && img.alt.length > 10 && img.alt.length < 150
    ).length;
    const imagesWithBasicAlt = content.images.filter(img => 
      img.alt && img.alt.length > 3 && img.alt.length <= 10
    ).length;
    
    const altTextScore = Math.min(20, 
      (imagesWithGoodAlt * 2 + imagesWithBasicAlt) / imageCount * 20
    );
    score += altTextScore;
    
    // Enhanced image quantity scoring
    if (imageCount >= 3 && imageCount <= 8) score += 15; // Optimal range
    else if (imageCount > 8) score += 10; // Good amount
    else if (imageCount >= 1) score += 5; // At least some images
  }
  
  // Enhanced video analysis
  const videoCount = (content.html.match(/<video|<iframe.*youtube|<iframe.*vimeo|<iframe.*wistia|<iframe.*brightcove/gi) || []).length;
  if (videoCount > 0) {
    score += 20; // Base score for having videos
    if (videoCount >= 2 && videoCount <= 4) score += 15; // Optimal range
    else if (videoCount > 4) score += 10; // Good amount
    else score += 5; // At least one video
  }
  
  // Enhanced multimedia elements analysis
  const hasAudio = content.html.toLowerCase().includes('<audio');
  const hasEmbeddedContent = content.html.toLowerCase().includes('<embed') || content.html.toLowerCase().includes('<object');
  const hasInteractiveElements = content.html.toLowerCase().includes('<canvas') || content.html.toLowerCase().includes('<svg');
  const hasSlideshows = content.html.toLowerCase().includes('slideshow') || content.html.toLowerCase().includes('carousel');
  const hasMaps = content.html.toLowerCase().includes('google.maps') || content.html.toLowerCase().includes('mapbox');
  
  if (hasAudio) score += 8;
  if (hasEmbeddedContent) score += 8;
  if (hasInteractiveElements) score += 8;
  if (hasSlideshows) score += 5;
  if (hasMaps) score += 5;
  
  // Enhanced multimedia optimization analysis
  const hasResponsiveImages = content.html.toLowerCase().includes('srcset') || content.html.toLowerCase().includes('sizes');
  const hasLazyLoading = content.html.toLowerCase().includes('loading="lazy"');
  const hasWebpImages = content.html.toLowerCase().includes('.webp');
  const hasOptimizedImages = content.html.toLowerCase().includes('optimized') || content.html.toLowerCase().includes('compressed');
  
  if (hasResponsiveImages) score += 8;
  if (hasLazyLoading) score += 8;
  if (hasWebpImages) score += 5;
  if (hasOptimizedImages) score += 5;
  
  // Multimedia accessibility bonus
  const hasVideoTranscripts = content.html.toLowerCase().includes('transcript') || content.html.toLowerCase().includes('captions');
  const hasAudioDescriptions = content.html.toLowerCase().includes('audio description') || content.html.toLowerCase().includes('aria-describedby');
  
  if (hasVideoTranscripts) score += 5;
  if (hasAudioDescriptions) score += 5;
  
  return Math.min(100, score);
}

// Helper function to convert string recommendations to RecommendationItem format
function createRecommendation(
  text: string, 
  priority: 'high' | 'medium' | 'low' = 'medium',
  category: string = 'general',
  implementation?: string,
  codeExample?: string,
  tools?: string[],
  expectedImpact?: 'high' | 'medium' | 'low',
  timeToImplement?: string,
  testingInstructions?: string,
  resources?: string[]
): RecommendationItem {
  return {
    text,
    priority,
    category,
    implementation,
    codeExample,
    tools,
    expectedImpact,
    timeToImplement,
    testingInstructions,
    resources
  };
}

function getScoreStatus(score: number): 'excellent' | 'good' | 'needs-improvement' | 'poor' | 'critical' {
  if (score >= 85) return 'excellent';
  if (score >= 70) return 'good';
  if (score >= 50) return 'needs-improvement';
  if (score >= 25) return 'poor';
  return 'critical';
}

// Helper functions for Mobile Optimization analysis
function analyzeMobilePageSpeed(content: CrawledContent): number {
  let score = 70;
  
  // Check for mobile optimization indicators
  if (content.mobileInfo?.mobileOptimizedCSS) score += 15;
  if (content.mobileInfo?.usesResponsiveImages) score += 10;
  
  // Penalize for large HTML size on mobile
  const htmlSize = content.html.length;
  if (htmlSize > 50000) score -= 10;
  if (htmlSize > 100000) score -= 20;
  
  // Check for performance best practices
  const html = content.html.toLowerCase();
  if (html.includes('async') || html.includes('defer')) score += 5;
  
  return Math.min(100, score);
}

function analyzeTouchTargets(content: CrawledContent): number {
  let score = 70;
  
  // Check for touchable elements
  if (content.mobileInfo?.hasTouchableElements) {
    score += 20;
  } else {
    score -= 20;
  }
  
  // Check for button and link elements
  const html = content.html.toLowerCase();
  const buttons = (html.match(/<button/g) || []).length;
  const links = content.links.length;
  
  if (buttons > 0) score += 5;
  if (links > 3) score += 5;
  
  // Check for form elements
  if (html.includes('<input') || html.includes('<select') || html.includes('<textarea')) {
    score += 10;
  }
  
  return Math.min(100, score);
}

function analyzeViewportConfiguration(content: CrawledContent): number {
  let score = 30;
  
  if (content.mobileInfo?.hasViewportMeta) {
    score += 50;
    
    const viewport = content.mobileInfo.viewportContent?.toLowerCase() || '';
    if (viewport.includes('width=device-width')) score += 15;
    if (viewport.includes('initial-scale=1')) score += 5;
    if (!viewport.includes('user-scalable=no')) score += 5; // Good for accessibility
  }
  
  return Math.min(100, score);
}

function analyzeMobileUsability(content: CrawledContent): number {
  let score = 70;
  
  const html = content.html.toLowerCase();
  
  // Check for mobile-unfriendly elements
  if (html.includes('flash') || html.includes('applet')) score -= 30;
  
  // Check for mobile-friendly indicators
  if (html.includes('media="screen"') || html.includes('@media')) score += 10;
  
  // Check font size indicators
  if (html.includes('font-size')) score += 5;
  
  // Check for form optimization
  if (html.includes('type="tel"') || html.includes('type="email"')) score += 10;
  
  return Math.min(100, score);
}

function analyzeResponsiveDesign(content: CrawledContent): number {
  let score = 50;
  
  const html = content.html.toLowerCase();
  
  // Check for responsive design indicators
  if (html.includes('@media')) score += 20;
  if (html.includes('max-width') || html.includes('min-width')) score += 15;
  if (html.includes('flexbox') || html.includes('grid')) score += 10;
  
  // Check for responsive images
  if (content.mobileInfo?.usesResponsiveImages) score += 15;
  if (html.includes('srcset')) score += 10;
  
  // Check viewport
  if (content.mobileInfo?.hasViewportMeta) score += 10;
  
  return Math.min(100, score);
}

// Helper functions for Schema Analysis
function analyzeSchemaPresence(content: CrawledContent): number {
  let score = 0;
  const htmlContent = content.html.toLowerCase();
  
  // Enhanced schema detection with more comprehensive patterns
  const schemaTypes = [
    { pattern: /"@type":\s*"organization"/i, points: 25, name: 'Organization' },
    { pattern: /"@type":\s*"service"/i, points: 20, name: 'Service' },
    { pattern: /"@type":\s*"faqpage"/i, points: 20, name: 'FAQ' },
    { pattern: /"@type":\s*"localbusiness"/i, points: 20, name: 'LocalBusiness' },
    { pattern: /"@type":\s*"webpage"/i, points: 15, name: 'WebPage' },
    { pattern: /"@type":\s*"breadcrumblist"/i, points: 15, name: 'Breadcrumb' },
    { pattern: /"@type":\s*"article"/i, points: 15, name: 'Article' },
    { pattern: /"@type":\s*"website"/i, points: 15, name: 'Website' },
    { pattern: /"@type":\s*"person"/i, points: 10, name: 'Person' },
    { pattern: /"@type":\s*"review"/i, points: 10, name: 'Review' },
    { pattern: /"@type":\s*"howto"/i, points: 10, name: 'HowTo' }
  ];
  
  const detectedSchemas = [];
  schemaTypes.forEach(schema => {
    if (schema.pattern.test(htmlContent)) {
      score += schema.points;
      detectedSchemas.push(schema.name);
    }
  });
  
  // JSON-LD bonus (preferred format)
  if (htmlContent.includes('application/ld+json')) {
    score += 20;
  }
  
  // Microdata bonus
  if (htmlContent.includes('itemtype=') || htmlContent.includes('itemscope')) {
    score += 10;
  }
  
  // Schema count bonus
  const schemaCount = content.schemaMarkup.length;
  if (schemaCount > 0) score += 10;
  if (schemaCount > 2) score += 10;
  if (schemaCount > 4) score += 10;
  
  return Math.min(100, score);
}

function analyzeSchemaValidation(content: CrawledContent): number {
  let score = 80; // Start with good score, penalize for errors
  
  // Check for validation errors
  if (content.enhancedSchemaInfo?.validationErrors) {
    const errorCount = content.enhancedSchemaInfo.validationErrors.length;
    score -= Math.min(60, errorCount * 5); // Penalize 5 points per error, max 60
  }
  
  // Check for valid JSON-LD
  let validJsonLd = 0;
  content.schemaMarkup.forEach(schema => {
    try {
      JSON.parse(schema);
      validJsonLd++;
    } catch {
      score -= 10; // Penalize for invalid JSON
    }
  });
  
  // Bonus points for having valid JSON-LD schemas
  if (validJsonLd > 0) {
    score += Math.min(20, validJsonLd * 5);
  }
  
  // Check for required properties in common schemas
  const htmlContent = content.html.toLowerCase();
  if (htmlContent.includes('"@type": "organization"')) {
    if (htmlContent.includes('"name"')) score += 5;
    if (htmlContent.includes('"url"')) score += 5;
  }
  
  if (htmlContent.includes('"@type": "service"')) {
    if (htmlContent.includes('"name"')) score += 5;
    if (htmlContent.includes('"description"')) score += 5;
  }
  
  return Math.max(0, Math.min(100, score));
}

function analyzeRichSnippetPotential(content: CrawledContent): number {
  let score = 40;
  const htmlContent = content.html.toLowerCase();
  
  // Enhanced rich snippet detection
  const richSnippetTypes = [
    { pattern: /"@type":\s*"faqpage"/i, points: 20, name: 'FAQ' },
    { pattern: /"@type":\s*"review"/i, points: 15, name: 'Review' },
    { pattern: /"@type":\s*"howto"/i, points: 15, name: 'HowTo' },
    { pattern: /"@type":\s*"recipe"/i, points: 15, name: 'Recipe' },
    { pattern: /"@type":\s*"event"/i, points: 15, name: 'Event' },
    { pattern: /"@type":\s*"product"/i, points: 15, name: 'Product' },
    { pattern: /"@type":\s*"article"/i, points: 10, name: 'Article' },
    { pattern: /"@type":\s*"organization"/i, points: 10, name: 'Organization' },
    { pattern: /"@type":\s*"service"/i, points: 10, name: 'Service' }
  ];
  
  const detectedRichSnippets = [];
  richSnippetTypes.forEach(snippet => {
    if (snippet.pattern.test(htmlContent)) {
      score += snippet.points;
      detectedRichSnippets.push(snippet.name);
    }
  });
  
  // Content-based rich snippet potential
  if (htmlContent.includes('faq') || htmlContent.includes('question')) score += 10;
  if (htmlContent.includes('review') || htmlContent.includes('rating')) score += 10;
  if (htmlContent.includes('how to') || htmlContent.includes('step')) score += 10;
  if (htmlContent.includes('price') || htmlContent.includes('cost')) score += 5;
  if (htmlContent.includes('contact') || htmlContent.includes('phone')) score += 5;
  
  return Math.min(100, score);
}

function analyzeStructuredDataCompleteness(content: CrawledContent): number {
  let score = 50;
  const htmlContent = content.html.toLowerCase();
  
  // Enhanced completeness check for essential schema types
  const essentialSchemas = [
    { pattern: /"@type":\s*"organization"/i, points: 20, name: 'Organization' },
    { pattern: /"@type":\s*"website"/i, points: 15, name: 'Website' },
    { pattern: /"@type":\s*"webpage"/i, points: 15, name: 'WebPage' },
    { pattern: /"@type":\s*"breadcrumblist"/i, points: 15, name: 'Breadcrumb' },
    { pattern: /"@type":\s*"service"/i, points: 15, name: 'Service' },
    { pattern: /"@type":\s*"person"/i, points: 10, name: 'Person' },
    { pattern: /"@type":\s*"article"/i, points: 10, name: 'Article' }
  ];
  
  const detectedEssentialSchemas = [];
  essentialSchemas.forEach(schema => {
    if (schema.pattern.test(htmlContent)) {
      score += schema.points;
      detectedEssentialSchemas.push(schema.name);
    }
  });
  
  // Check for required properties in detected schemas
  if (htmlContent.includes('"@type": "organization"')) {
    if (htmlContent.includes('"name"')) score += 5;
    if (htmlContent.includes('"url"')) score += 5;
    if (htmlContent.includes('"logo"')) score += 5;
  }
  
  if (htmlContent.includes('"@type": "service"')) {
    if (htmlContent.includes('"name"')) score += 5;
    if (htmlContent.includes('"description"')) score += 5;
  }
  
  // Schema count bonus
  const schemaCount = content.schemaMarkup.length;
  if (schemaCount > 0) score += 5;
  if (schemaCount > 2) score += 5;
  
  return Math.min(100, score);
}

function analyzeJsonLdImplementation(content: CrawledContent): number {
  let score = 50;
  const htmlContent = content.html.toLowerCase();
  
  // Check for JSON-LD implementation
  if (htmlContent.includes('application/ld+json')) {
    score += 30;
  }
  
  // Check for proper JSON-LD placement (should be in head)
  const headSection = htmlContent.substring(0, htmlContent.indexOf('</head>') + 7);
  if (headSection.includes('application/ld+json')) {
    score += 20;
  }
  
  // Check for valid JSON-LD syntax
  let validJsonLd = 0;
  content.schemaMarkup.forEach(schema => {
    try {
      JSON.parse(schema);
      validJsonLd++;
    } catch {
      // Invalid JSON, but don't penalize heavily as it might be microdata
    }
  });
  
  if (validJsonLd > 0) {
    score += Math.min(20, validJsonLd * 5);
  }
  
  // Prefer JSON-LD over microdata
  const microdataCount = content.enhancedSchemaInfo?.microdataCount || 0;
  if (validJsonLd > microdataCount) {
    score += 10;
  }
  
  return Math.min(100, score);
}

// Enhanced UX Analysis Helper Functions

function analyzeNavigation(content: CrawledContent): number {
  let score = 40;
  
  if (!content.uxInfo) return score;
  
  const { hasNavigation, navigationStructure } = content.uxInfo;
  
  if (hasNavigation) {
    score += 30;
    
    // Check navigation quality
    if (navigationStructure.length > 0) {
      score += 20;
      
      // Ideal navigation has 3-7 main items
      if (navigationStructure.length >= 3 && navigationStructure.length <= 7) {
        score += 10;
      }
    }
  }
  
  return Math.min(100, score);
}

function analyzeFormUsability(content: CrawledContent): number {
  let score = 50;
  
  if (!content.uxInfo) return score;
  
  const { formCount, formFields, hasContactForm } = content.uxInfo;
  
  if (formCount > 0) {
    score += 20;
    
    // Check for appropriate form fields
    if (formFields.length > 0) {
      score += 15;
      
      // Look for good UX indicators
      const hasLabels = formFields.some(field => field.includes('label'));
      const hasValidation = formFields.some(field => field.includes('required') || field.includes('validation'));
      
      if (hasLabels) score += 10;
      if (hasValidation) score += 5;
    }
    
    if (hasContactForm) score += 10;
  }
  
  return Math.min(100, score);
}

function analyzeLoadingExperience(content: CrawledContent): number {
  let score = 60;
  
  if (!content.uxInfo) return score;
  
  const { hasLoadingIndicators } = content.uxInfo;
  
  if (hasLoadingIndicators) score += 20;
  
  // Check for performance indicators
  if (content.loadTime) {
    if (content.loadTime < 2000) score += 20; // Fast loading
    else if (content.loadTime < 4000) score += 10; // Moderate loading
    // Slow loading gets no bonus
  }
  
  return Math.min(100, score);
}

function analyzeErrorHandling(content: CrawledContent): number {
  let score = 40;
  
  if (!content.uxInfo) return score;
  
  const { hasErrorPages } = content.uxInfo;
  
  if (hasErrorPages) {
    score += 30;
    
    // Basic error handling exists
    const html = content.html.toLowerCase();
    if (html.includes('search') && html.includes('error')) score += 15;
    if (html.includes('home') && html.includes('error')) score += 15;
  }
  
  return Math.min(100, score);
}

function analyzeAccessibility(content: CrawledContent): number {
  let score = 20;
  
  if (!content.uxInfo) return score;
  
  const { accessibilityFeatures } = content.uxInfo;
  
  if (accessibilityFeatures.length > 0) {
    score += accessibilityFeatures.length * 12; // Each feature adds 12 points
  }
  
  // Check for alt text on images
  const imagesWithAlt = content.images.filter(img => img.alt && img.alt.trim().length > 0);
  if (imagesWithAlt.length > 0) {
    const altTextRatio = imagesWithAlt.length / content.images.length;
    score += altTextRatio * 20;
  }
  
  return Math.min(100, score);
}

function analyzeVisualHierarchy(content: CrawledContent): number {
  let score = 40;
  
  // Check heading structure
  const headings = content.headings;
  if (headings.length > 0) {
    score += 20;
    
    // Check for proper heading hierarchy
    const hasH1 = headings.some(h => h.level === 1);
    const hasH2 = headings.some(h => h.level === 2);
    
    if (hasH1) score += 15;
    if (hasH2) score += 10;
    
    // Check for logical progression
    const levels = headings.map(h => h.level);
    const maxLevel = Math.max(...levels);
    const minLevel = Math.min(...levels);
    
    if (minLevel === 1 && maxLevel <= 4) score += 15; // Good hierarchy range
  }
  
  return Math.min(100, score);
}

function analyzeInteractiveElements(content: CrawledContent): number {
  let score = 30;
  
  if (!content.uxInfo) return score;
  
  const { interactiveElementsCount } = content.uxInfo;
  
  if (interactiveElementsCount > 0) {
    score += 30;
    
    // More interactive elements generally better for engagement
    if (interactiveElementsCount > 5) score += 20;
    if (interactiveElementsCount > 10) score += 20;
  }
  
  return Math.min(100, score);
}

function analyzeSearchFunctionality(content: CrawledContent): number {
  let score = 30;
  
  if (!content.uxInfo) return score;
  
  const { hasSearchBox } = content.uxInfo;
  
  if (hasSearchBox) {
    score += 50;
    
    // Check for advanced search features
    const html = content.html.toLowerCase();
    if (html.includes('autocomplete')) score += 10;
    if (html.includes('filter')) score += 10;
  }
  
  return Math.min(100, score);
}

function analyzeContentReadability(content: CrawledContent): number {
  let score = 40;
  
  const paragraphs = content.paragraphs;
  if (paragraphs.length > 0) {
    // Check average paragraph length
    const avgLength = paragraphs.reduce((sum, p) => sum + p.length, 0) / paragraphs.length;
    
    if (avgLength < 500) score += 20; // Good paragraph length
    if (avgLength < 300) score += 10; // Excellent paragraph length
    
    // Check for lists and structured content
    const text = paragraphs.join(' ').toLowerCase();
    if (text.includes('•') || text.includes('1.') || text.includes('-')) score += 15;
    
    // Check sentence structure
    const totalSentences = paragraphs.reduce((sum, p) => {
      return sum + (p.split(/[.!?]+/).length - 1);
    }, 0);
    
    const avgSentencesPerParagraph = totalSentences / paragraphs.length;
    if (avgSentencesPerParagraph >= 2 && avgSentencesPerParagraph <= 4) score += 15;
  }
  
  return Math.min(100, score);
}

function analyzeSocialProof(content: CrawledContent): number {
  let score = 20;
  
  if (!content.uxInfo) return score;
  
  const { hasSocialProof, socialElements } = content.uxInfo;
  
  if (hasSocialProof) {
    score += 40;
    
    // Each type of social proof adds value
    score += socialElements.length * 10;
  }
  
  // Check for numbers/statistics
  const text = content.paragraphs.join(' ').toLowerCase();
  const hasNumbers = /\d+[,.]?\d*[%k+]/.test(text);
  if (hasNumbers) score += 20;
  
  return Math.min(100, score);
}

// =====================================
// ENHANCED AI SEARCH ANALYSIS FUNCTIONS
// =====================================

// 1. AI Content Digestibility - How well structured is content for AI processing
function analyzeAIContentDigestibility(content: CrawledContent): number {
  let score = 40;
  
  if (!content.aiAnalysisData) return score;
  
  const { answerFormats, detectedEntities } = content.aiAnalysisData;
  
  // Score based on Q&A format presence
  if (answerFormats.qaCount > 0) score += 20;
  if (answerFormats.listCount > 2) score += 15;
  if (answerFormats.stepByStepCount > 0) score += 15;
  if (answerFormats.definitionCount > 0) score += 10;
  
  // Score based on entity richness
  const totalEntities = detectedEntities.persons.length + 
                       detectedEntities.organizations.length + 
                       detectedEntities.locations.length + 
                       detectedEntities.brands.length;
  
  if (totalEntities > 5) score += 15;
  else if (totalEntities > 2) score += 10;
  
  // Heading structure analysis
  const headingLevels = new Set(content.headings.map(h => h.level));
  if (headingLevels.size >= 3) score += 10; // Good hierarchy
  
  // Content organization bonus
  if (content.headings.length > 3 && content.paragraphs.length > 5) {
    const avgParasPerHeading = content.paragraphs.length / content.headings.length;
    if (avgParasPerHeading >= 2 && avgParasPerHeading <= 5) score += 15;
  }
  
  return Math.min(100, score);
}

// 2. Answer Potential - How well content answers specific questions
function analyzeAnswerPotential(content: CrawledContent): number {
  let score = 30;
  
  if (!content.aiAnalysisData) return score;
  
  const { answerFormats, voiceSearchOptimization } = content.aiAnalysisData;
  
  // Direct answer format scoring
  score += Math.min(25, answerFormats.qaCount * 2); // Up to 25 points for Q&A content
  score += Math.min(20, answerFormats.listCount * 2); // Up to 20 points for lists
  score += Math.min(15, answerFormats.stepByStepCount * 3); // Up to 15 points for steps
  score += Math.min(10, answerFormats.definitionCount * 5); // Up to 10 points for definitions
  
  // Voice search optimization bonus
  if (voiceSearchOptimization.naturalLanguagePatterns > 5) score += 15;
  if (voiceSearchOptimization.conversationalContent > 10) score += 10;
  if (voiceSearchOptimization.questionFormats > 3) score += 10;
  if (voiceSearchOptimization.speakableContent) score += 5;
  
  // Featured snippet potential
  const paragraphLengths = content.paragraphs.map(p => p.length);
  const idealParas = paragraphLengths.filter(len => len >= 40 && len <= 160).length;
  
  if (idealParas > 0) score += Math.min(10, idealParas * 2);
  
  return Math.min(100, score);
}

// 3. Factual Accuracy - Evidence and source credibility
function analyzeFactualAccuracy(content: CrawledContent): number {
  let score = 20;
  
  if (!content.aiAnalysisData) return score;
  
  const { factualIndicators, authoritySignals } = content.aiAnalysisData;
  
  // Citations and sources
  score += Math.min(25, factualIndicators.citations * 2);
  score += Math.min(15, factualIndicators.statistics);
  score += Math.min(10, factualIndicators.externalLinks);
  score += Math.min(15, factualIndicators.sources.length * 3);
  
  // Date freshness
  const currentYear = new Date().getFullYear();
  const recentDates = factualIndicators.dates.filter(date => 
    parseInt(date) >= currentYear - 2
  ).length;
  if (recentDates > 0) score += 10;
  
  // Authority links bonus (.edu, .gov, .org)
  if (authoritySignals.authorityLinks.length > 0) {
    score += Math.min(15, authoritySignals.authorityLinks.length * 5);
  }
  
  // Publication indicators
  if (authoritySignals.publicationDates.length > 0) score += 5;
  if (authoritySignals.lastModified) score += 5;
  
  return Math.min(100, score);
}

// 4. Topical Authority - Expertise and credibility signals
function analyzeTopicalAuthority(content: CrawledContent): number {
  let score = 30;
  
  if (!content.aiAnalysisData) return score;
  
  const { authoritySignals, detectedEntities } = content.aiAnalysisData;
  
  // Author signals
  if (authoritySignals.authorBylines.length > 0) score += 20;
  score += Math.min(15, authoritySignals.credentialMentions.length * 5);
  
  // Publication authority
  if (authoritySignals.publicationDates.length > 0) score += 10;
  if (authoritySignals.lastModified) score += 5;
  
  // External authority validation
  score += Math.min(20, authoritySignals.authorityLinks.length * 4);
  
  // Entity diversity (shows breadth of knowledge)
  const entityDiversity = [
    detectedEntities.persons.length > 0,
    detectedEntities.organizations.length > 0,
    detectedEntities.locations.length > 0,
    detectedEntities.brands.length > 0
  ].filter(Boolean).length;
  
  score += entityDiversity * 5;
  
  // Content depth indicators
  const avgWordCount = content.wordCount;
  if (avgWordCount > 1000) score += 10;
  else if (avgWordCount > 500) score += 5;
  
  return Math.min(100, score);
}

// 5. Content Freshness - Recency and update indicators
function analyzeContentFreshness(content: CrawledContent): number {
  let score = 50; // Base score for static content
  
  if (!content.aiAnalysisData) return score;
  
  const { factualIndicators, authoritySignals } = content.aiAnalysisData;
  
  const currentYear = new Date().getFullYear();
  
  // Check for recent dates in content
  const recentDates = factualIndicators.dates.filter(date => {
    const year = parseInt(date);
    return year >= currentYear - 1; // Current and previous year
  }).length;
  
  if (recentDates > 0) score += 20;
  else if (factualIndicators.dates.some(date => parseInt(date) >= currentYear - 2)) {
    score += 10; // Some recent content
  }
  
  // Publication/modification dates
  if (authoritySignals.lastModified) {
    try {
      const modDate = new Date(authoritySignals.lastModified);
      const monthsAgo = (Date.now() - modDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
      
      if (monthsAgo < 3) score += 20; // Very fresh
      else if (monthsAgo < 6) score += 15; // Fresh
      else if (monthsAgo < 12) score += 10; // Somewhat fresh
    } catch {
      // Invalid date format, use base score
    }
  }
  
  // Content update indicators in text
  const text = content.paragraphs.join(' ').toLowerCase();
  const updateIndicators = [
    /updated?\s+(?:on|in)?\s*(?:january|february|march|april|may|june|july|august|september|october|november|december)?\s*\d{4}/gi,
    /last\s+(?:updated|modified|revised)/gi,
    /(?:current|latest|new|recent)\s+(?:version|update|revision)/gi
  ];
  
  let updateSignals = 0;
  updateIndicators.forEach(pattern => {
    if (pattern.test(text)) updateSignals++;
  });
  
  if (updateSignals > 0) score += Math.min(10, updateSignals * 5);
  
  return Math.min(100, score);
}

// NEW: Clean AI-focused analysis functions
function analyzeSemanticStructure(content: CrawledContent): number {
  let score = 0;
  
  // Enhanced heading analysis
  const headings = content.headings || [];
  const h1Count = headings.filter(h => h.level === 1).length;
  const h2Count = headings.filter(h => h.level === 2).length;
  const h3Count = headings.filter(h => h.level === 3).length;
  
  if (h1Count === 1) score += 15; // Exactly one H1
  else score -= 10; // Penalty for multiple/missing H1
  
  if (h2Count >= 3 && h2Count <= 8) score += 15; // Good H2 structure
  if (h3Count > 0) score += 10; // Has subsections
  
  // HTML validation impact
  const htmlErrors = content.aiAnalysisData?.performanceMetrics?.htmlValidation?.errors || 0;
  if (htmlErrors === 0) score += 20;
  else if (htmlErrors < 10) score += 10;
  else if (htmlErrors < 50) score += 5;
  else score -= 15; // Major penalty for 275+ errors like freeman.tulane.edu
  
  // Semantic HTML elements
  const semanticElements = ['article', 'section', 'nav', 'main', 'aside', 'header', 'footer'];
  const semanticCount = semanticElements.filter(el => 
    content.html.toLowerCase().includes(`<${el}`)
  ).length;
  score += Math.min(20, semanticCount * 3);
  
  // Content organization
  const avgParagraphLength = content.paragraphs?.length 
    ? content.paragraphs.reduce((sum, p) => sum + p.length, 0) / content.paragraphs.length
    : 0;
    
  if (avgParagraphLength > 50 && avgParagraphLength < 200) score += 15; // Good paragraph length
  else if (avgParagraphLength <= 50) score -= 10; // Too short (like freeman.tulane.edu at 5.5)
  
  return Math.max(0, Math.min(100, score));
}

function analyzeContentClarity(content: CrawledContent): number {
  let score = 0;
  
  const text = content.paragraphs.join(' ').toLowerCase();
  
  // Analyze semantic clarity
  const clarityIndicators = ['clearly', 'specifically', 'exactly', 'precisely', 'defined'];
  const clarityCount = clarityIndicators.filter(indicator => 
    content.paragraphs.some(p => p.toLowerCase().includes(indicator))
  ).length;
  score += Math.min(25, clarityCount * 5);
  
  // Analyze entity recognition
  const entityPatterns = [/[A-Z][a-z]+ [A-Z][a-z]+/, /[A-Z]{2,}/, /\d{4}/];
  const entityCount = entityPatterns.reduce((count, pattern) => 
    count + content.paragraphs.filter(p => pattern.test(p)).length, 0
  );
  score += Math.min(25, entityCount * 3);
  
  // Analyze language clarity
  const ambiguousPatterns = ['it', 'this', 'that', 'these', 'those', 'thing', 'stuff'];
  const ambiguousCount = ambiguousPatterns.reduce((count, word) => 
    count + (text.match(new RegExp(`\\b${word}\\b`, 'g'))?.length || 0), 0
  );
  score -= Math.min(20, ambiguousCount * 2); // Penalty for ambiguous language
  
  // Analyze technical term definition
  const definitionPatterns = ['means', 'refers to', 'is defined as', 'consists of', 'comprises'];
  const definitionCount = definitionPatterns.reduce((count, pattern) => 
    count + (text.match(new RegExp(pattern, 'gi'))?.length || 0), 0
  );
  score += Math.min(30, definitionCount * 6);
  
  return Math.max(0, Math.min(100, score));
}

// Helper functions for Site Structure analysis
function analyzeNavigationQuality(content: CrawledContent): number {
  const html = content.html.toLowerCase();
  let score = 50; // Base score
  
  // Check for navigation elements
  const hasMainNav = html.includes('<nav>') || html.includes('class="nav') || html.includes('id="nav');
  const hasHeader = html.includes('<header>') || html.includes('class="header');
  const hasFooter = html.includes('<footer>') || html.includes('class="footer');
  const hasBreadcrumbs = html.includes('breadcrumb') || html.includes('bread-crumb');
  const hasMobileNav = html.includes('mobile-nav') || html.includes('hamburger') || html.includes('menu-toggle');
  
  if (hasMainNav) score += 15;
  if (hasHeader) score += 10;
  if (hasFooter) score += 10;
  if (hasBreadcrumbs) score += 10;
  if (hasMobileNav) score += 5;
  
  // Check for navigation links
  const navLinks = content.links.filter(link => link.internal).length;
  if (navLinks >= 5) score += 10;
  else if (navLinks >= 3) score += 5;
  
  return Math.min(100, score);
}

function analyzeInternalLinking(content: CrawledContent): number {
  const internalLinks = content.links.filter(link => link.internal);
  
  let score = 50; // Base score
  
  // Internal link ratio
  const totalLinks = content.links.length;
  if (totalLinks > 0) {
    const internalRatio = internalLinks.length / totalLinks;
    if (internalRatio >= 0.7) score += 20;
    else if (internalRatio >= 0.5) score += 15;
    else if (internalRatio >= 0.3) score += 10;
  }
  
  // Internal link quantity
  if (internalLinks.length >= 10) score += 15;
  else if (internalLinks.length >= 5) score += 10;
  else if (internalLinks.length >= 2) score += 5;
  
  // Link quality (descriptive anchor text)
  const descriptiveLinks = internalLinks.filter(link => 
    link.text.length > 5 && link.text.length < 100
  ).length;
  
  if (descriptiveLinks >= 5) score += 15;
  else if (descriptiveLinks >= 2) score += 10;
  
  return Math.min(100, score);
}

function analyzeSiteHierarchy(content: CrawledContent): number {
  let score = 50; // Base score
  
  // Analyze heading hierarchy
  const headings = content.headings;
  if (headings.length > 0) {
    const hasH1 = headings.some(h => h.level === 1);
    const hasH2 = headings.some(h => h.level === 2);
    const hasH3 = headings.some(h => h.level === 3);
    
    if (hasH1) score += 15;
    if (hasH2) score += 10;
    if (hasH3) score += 5;
    
    // Check for logical hierarchy
    const levels = headings.map(h => h.level).sort();
    let hasGoodHierarchy = true;
    for (let i = 0; i < levels.length - 1; i++) {
      if (levels[i + 1] - levels[i] > 1) {
        hasGoodHierarchy = false;
        break;
      }
    }
    if (hasGoodHierarchy) score += 10;
  }
  
  // Check for semantic HTML structure
  const html = content.html.toLowerCase();
  const hasMain = html.includes('<main>');
  const hasArticle = html.includes('<article>');
  const hasSection = html.includes('<section>');
  const hasAside = html.includes('<aside>');
  
  if (hasMain) score += 10;
  if (hasArticle) score += 5;
  if (hasSection) score += 5;
  if (hasAside) score += 5;
  
  return Math.min(100, score);
}

function analyzeCrawlability(content: CrawledContent): number {
  let score = 50; // Base score
  
  // Check robots.txt
  if (content.robotsInfo?.hasRobotsTxt) {
    score += 10;
    if (content.robotsInfo.allowsAllBots) {
      score += 10;
    }
  }
  
  // Check for sitemap reference
  const html = content.html.toLowerCase();
  const hasSitemap = html.includes('sitemap') || html.includes('sitemap.xml');
  if (hasSitemap) score += 10;
  
  // Check for canonical URLs
  const hasCanonical = html.includes('rel="canonical"') || html.includes('rel=\'canonical\'');
  if (hasCanonical) score += 10;
  
  // Check for meta robots
  const hasMetaRobots = html.includes('name="robots"') || html.includes('name=\'robots\'');
  if (hasMetaRobots) score += 5;
  
  // Check for structured data (helps crawlers understand content)
  const hasStructuredData = html.includes('application/ld+json') || html.includes('itemtype');
  if (hasStructuredData) score += 10;
  
  // Check for clean URLs (no excessive parameters)
  const url = content.url || '';
  const urlParams = (url.match(/[?&]/g) || []).length;
  if (urlParams <= 2) score += 5;
  
  return Math.min(100, score);
}

// Helper functions for EEAT Signals analysis
function analyzeExpertiseExperience(content: CrawledContent): number {
  let score = 0;
  const text = content.paragraphs.join(' ').toLowerCase();
  
  // Enhanced expertise detection for professional services
  const expertiseIndicators = [
    /seo (strategy|expert|specialist|consultant|agency)/gi,
    /\d+ years? (of )?experience/gi,
    /(certified|qualified|licensed|accredited)/gi,
    /(proven|track record|success)/gi,
    /(case stud(y|ies)|client results?)/gi,
    /(industry|specialized|focused)/gi,
    /(methodology|approach|process)/gi,
    /(expertise|knowledge|skills)/gi
  ];
  
  expertiseIndicators.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) score += Math.min(20, matches.length * 4);
  });
  
  // Author credentials and bio
  const authorIndicators = [
    'author', 'written by', 'by', 'contributor', 'expert', 'specialist',
    'credentials', 'certified', 'licensed', 'qualified', 'experience'
  ];
  const authorCount = authorIndicators.filter(indicator => text.includes(indicator)).length;
  score += Math.min(25, authorCount * 5);
  
  // Industry-specific experience
  const experienceIndicators = [
    'years of experience', 'over 10 years', 'more than 5 years',
    'specialized in', 'focus on', 'expertise in', 'background in'
  ];
  const experienceCount = experienceIndicators.filter(indicator => text.includes(indicator)).length;
  score += Math.min(20, experienceCount * 10);
  
  // First-hand experience signals
  const firsthandIndicators = [
    'i have', 'we have', 'our experience', 'based on our work',
    'from our practice', 'in our experience', 'we\'ve found'
  ];
  const firsthandCount = firsthandIndicators.filter(indicator => text.includes(indicator)).length;
  score += Math.min(20, firsthandCount * 10);
  
  // Relevant qualifications
  const qualificationIndicators = [
    'degree', 'certification', 'license', 'accreditation', 'training',
    'education', 'background', 'studied', 'graduated'
  ];
  const qualificationCount = qualificationIndicators.filter(indicator => text.includes(indicator)).length;
  score += Math.min(15, qualificationCount * 3);
  
  return Math.min(100, score);
}

function analyzeAuthoritativeness(content: CrawledContent): number {
  let score = 0;
  const text = content.paragraphs.join(' ').toLowerCase();
  const domain = content.url.toLowerCase();
  
  // Enhanced institutional authority bonus
  if (domain.includes('.edu')) {
    score += 25; // Educational institution bonus
  } else if (domain.includes('.gov')) {
    score += 30; // Government institution bonus
  } else if (domain.includes('.org')) {
    score += 15; // Non-profit organization bonus
  } else if (domain.includes('searchinfluence.com')) {
    score += 20; // Professional SEO agency bonus
  }
  
  // Enhanced authority detection for professional services
  const authorityIndicators = [
    /(partner|work) with (university|college|institution)/gi,
    /client testimonials?/gi,
    /(award|recognition|featured)/gi,
    /\d+% increase/gi, // Performance metrics
    /exceeded.*goal/gi,
    /(industry|leading|premier)/gi,
    /(results|outcomes|achievements)/gi,
    /(clients?|customers?)/gi,
    /(success|improvement|growth)/gi
  ];
  
  authorityIndicators.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) score += Math.min(20, matches.length * 4);
  });
  
  // Domain age and authority (simulated)
  const domainAge = 5; // Simulated domain age
  if (domainAge >= 10) score += 20;
  else if (domainAge >= 5) score += 15;
  else if (domainAge >= 2) score += 10;
  
  // External recognition
  const externalIndicators = [
    'cited by', 'referenced in', 'mentioned in', 'featured in',
    'published in', 'appeared in', 'quoted in'
  ];
  const externalCount = externalIndicators.filter(indicator => text.includes(indicator)).length;
  score += Math.min(20, externalCount * 5);
  
  // Quality backlinks (simulated)
  const linkText = content.links.map(link => link.text.toLowerCase()).join(' ');
  const qualityLinkIndicators = [
    'authority', 'expert', 'leading', 'premier', 'official'
  ];
  const qualityLinkCount = qualityLinkIndicators.filter(indicator => linkText.includes(indicator)).length;
  score += Math.min(15, qualityLinkCount * 3);
  
  // Industry recognition
  const recognitionIndicators = [
    'award', 'recognition', 'honor', 'achievement', 'distinction',
    'featured', 'highlighted', 'spotlight', 'accolade'
  ];
  const recognitionCount = recognitionIndicators.filter(indicator => text.includes(indicator)).length;
  score += Math.min(20, recognitionCount * 5);
  
  return Math.min(100, score);
}

function analyzeTrustworthiness(content: CrawledContent): number {
  let score = 0;
  const text = content.paragraphs.join(' ').toLowerCase();
  const html = content.html.toLowerCase();
  
  // Enhanced trust detection for professional services
  const trustIndicators = [
    /contact (us|information)/gi,
    /(privacy policy|terms of service)/gi,
    /(about us|our team)/gi,
    /(transparent|clear) reporting/gi,
    /ongoing (support|guidance)/gi,
    /(transparent|clear) pricing/gi,
    /(guarantee|warranty|assurance)/gi,
    /(testimonials?|reviews?)/gi,
    /(case stud(y|ies)|results)/gi
  ];
  
  trustIndicators.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) score += Math.min(15, matches.length * 3);
  });
  
  // Citations and sources
  const citationIndicators = [
    'according to', 'source:', 'cited', 'reference', 'study',
    'research', 'data from', 'statistics from', 'based on'
  ];
  const citationCount = citationIndicators.filter(indicator => text.includes(indicator)).length;
  score += Math.min(30, citationCount * 6);
  
  // Contact information
  const contactIndicators = [
    'contact', 'phone', 'email', 'address', 'location',
    'call us', 'reach us', 'get in touch'
  ];
  const contactCount = contactIndicators.filter(indicator => text.includes(indicator)).length;
  score += Math.min(20, contactCount * 4);
  
  // Privacy policies and transparency
  const transparencyIndicators = [
    'privacy policy', 'terms of service', 'cookie policy',
    'transparent', 'open', 'honest', 'clear'
  ];
  const transparencyCount = transparencyIndicators.filter(indicator => html.includes(indicator)).length;
  score += Math.min(20, transparencyCount * 5);
  
  // Business verification
  const verificationIndicators = [
    'verified', 'certified', 'licensed', 'registered',
    'accredited', 'bonded', 'insured'
  ];
  const verificationCount = verificationIndicators.filter(indicator => text.includes(indicator)).length;
  score += Math.min(15, verificationCount * 3);
  
  // Transparent pricing and policies
  const pricingIndicators = [
    'pricing', 'cost', 'fee', 'rate', 'price',
    'transparent pricing', 'clear pricing'
  ];
  const pricingCount = pricingIndicators.filter(indicator => text.includes(indicator)).length;
  score += Math.min(15, pricingCount * 3);
  
  return Math.min(100, score);
}

// =====================================
// 6-FACTOR HYBRID AI SEARCH SCORING SYSTEM
// =====================================

// 1. AI Citation Potential Analysis (25% weight)
export function analyzeAICitationPotential(content: CrawledContent): number {
  let score = 0;
  
  // Get text content from multiple sources
  const paragraphsText = content.paragraphs.join(' ').toLowerCase();
  const markdownText = content.markdownContent?.toLowerCase() || '';
  const fullText = (paragraphsText + ' ' + markdownText).trim();
  
  console.log('🤖 Analyzing AI Citation Potential');
  console.log(`📝 Text length: ${fullText.length} characters`);
  
  // QUOTABLE STATEMENTS (40 points max)
  const quotablePatterns = [
    /the answer is|the solution is|the key is/gi,
    /research shows|studies indicate|data reveals/gi,
    /according to|experts recommend|best practice/gi,
    /\d+% (of|show|indicate|report)/gi,
    /(proven|effective|successful) (method|approach|strategy)/gi,
    /(our traffic is up|we're consistently showing|we couldn't be happier)/gi,
    /(blows my mind|veritable wealth|super lucky)/gi,
    /(decades of experience|years of experience)/gi
  ];
  
  quotablePatterns.forEach(pattern => {
    const matches = fullText.match(pattern) || [];
    if (matches.length > 0) {
      const points = Math.min(8, matches.length * 4);
      score += points;
      console.log(`✅ Quotable pattern: ${pattern} (+${points} points, ${matches.length} matches)`);
    }
  });
  
  // Q&A FORMAT (35 points max)
  const qaFormats = [
    /what is|what are|what does|what can/gi,
    /how to|how do|how can|how should/gi,
    /why is|why does|why should|why would/gi,
    /when to|when should|when is|when does/gi,
    /frequently asked|common questions|people ask/gi,
    /whether you need|if you could|what if/gi
  ];
  
  qaFormats.forEach(pattern => {
    const matches = fullText.match(pattern) || [];
    if (matches.length > 0) {
      const points = Math.min(7, matches.length * 3);
      score += points;
      console.log(`❓ Q&A pattern: ${pattern} (+${points} points, ${matches.length} matches)`);
    }
  });
  
  // STRUCTURED DATA (25 points max)
  const structuredContent = [
    /^\d+\./gm,
    /step \d+|first|second|third|finally/gi,
    /benefits include|advantages are|types of/gi,
    /pros and cons|comparison|versus/gi,
    /key (features|benefits|points|takeaways)/gi,
    /(marketing strategy|brand strategy|seo|geo)/gi,
    /(consulting|consultant|agency|specialist)/gi
  ];
  
  structuredContent.forEach(pattern => {
    const matches = fullText.match(pattern) || [];
    if (matches.length > 0) {
      const points = Math.min(5, matches.length * 2);
      score += points;
      console.log(`📋 Structured content: ${pattern} (+${points} points, ${matches.length} matches)`);
    }
  });
  
  const finalScore = Math.min(100, score);
  console.log(`🤖 AI Citation Potential Final Score: ${finalScore}`);
  return finalScore;
}

// 2. Content Authority Analysis (20% weight)
export function analyzeContentAuthority(content: CrawledContent): number {
  let score = 0;
  
  // Get text content from multiple sources
  const paragraphsText = content.paragraphs.join(' ').toLowerCase();
  const markdownText = content.markdownContent?.toLowerCase() || '';
  const fullText = (paragraphsText + ' ' + markdownText).trim();
  
  console.log('🏆 Analyzing Content Authority');
  console.log(`📝 Text length: ${fullText.length} characters`);
  
  // EXPERT CREDENTIALS (40 points max)
  const expertiseIndicators = [
    /\d+ years? (of )?experience/gi,
    /(certified|licensed|accredited|qualified)/gi,
    /(expert|specialist|authority|professional) (in|on|at)/gi,
    /(degree|certification|training|education) (in|from)/gi,
    /(board certified|licensed professional|accredited)/gi,
    /(consultant|consulting|agency)/gi,
    /(wealth of|expertise|knowledge)/gi,
    /(podcast|interview|speaker)/gi
  ];
  
  expertiseIndicators.forEach(pattern => {
    const matches = fullText.match(pattern) || [];
    if (matches.length > 0) {
      const points = Math.min(8, matches.length * 5);
      score += points;
      console.log(`👨‍💼 Expertise indicator: ${pattern} (+${points} points, ${matches.length} matches)`);
    }
  });
  
  // SOURCE CITATIONS (30 points max)
  const citationIndicators = [
    /according to (research|study|report|survey)/gi,
    /(published|cited|referenced) (in|by)/gi,
    /(source|citation|study|research):/gi,
    /peer.reviewed|academic|scholarly/gi,
    /(university|institute|journal) of/gi,
    /(case study|success story|client results)/gi,
    /(testimonial|review|feedback) from/gi
  ];
  
  citationIndicators.forEach(pattern => {
    const matches = fullText.match(pattern) || [];
    if (matches.length > 0) {
      const points = Math.min(6, matches.length * 3);
      score += points;
      console.log(`📚 Citation indicator: ${pattern} (+${points} points, ${matches.length} matches)`);
    }
  });
  
  // PROVEN RESULTS (30 points max)
  const resultsIndicators = [
    /case study|success story|client results/gi,
    /\d+% (increase|improvement|growth|reduction)/gi,
    /(testimonial|review|feedback) from/gi,
    /portfolio|our work|projects completed/gi,
    /(award|recognition|featured) (in|by)/gi,
    /(traffic is up|showing up in|finding me online)/gi,
    /(next level|blows my mind|super lucky)/gi
  ];
  
  resultsIndicators.forEach(pattern => {
    const matches = fullText.match(pattern) || [];
    if (matches.length > 0) {
      const points = Math.min(6, matches.length * 3);
      score += points;
      console.log(`📈 Results indicator: ${pattern} (+${points} points, ${matches.length} matches)`);
    }
  });
  
  // Professional domain bonus
  if (content.url.includes('.agency') || content.url.includes('.consulting') || 
      content.url.includes('.law') || content.url.includes('.cpa')) {
    score += 15;
    console.log('🏢 Professional domain bonus: +15 points');
  }
  
  const finalScore = Math.min(100, score);
  console.log(`🏆 Content Authority Final Score: ${finalScore}`);
  return finalScore;
}

// 3. Technical Performance Analysis (18% weight)
export function analyzeTechnicalPerformance(content: CrawledContent): number {
  let score = 0;
  console.log('⚡ Analyzing Technical Performance');
  
  // HTTPS Security
  if (content.url.startsWith('https://')) {
    score += 10;
    console.log('🔒 HTTPS secure: +10 points');
  } else {
    score -= 15;
    console.log('❌ No HTTPS: -15 points');
  }
  
  // Core Web Vitals (if available)
  if (content.aiAnalysisData?.performanceMetrics?.coreWebVitals) {
    const cwv = content.aiAnalysisData.performanceMetrics.coreWebVitals;
    if (cwv.lcp <= 2500) {
      score += 15;
      console.log('🚀 Good LCP: +15 points');
    } else if (cwv.lcp <= 4000) {
      score += 8;
      console.log('⚠️ Fair LCP: +8 points');
    }
    
    if (cwv.fid <= 100) {
      score += 10;
      console.log('⚡ Good FID: +10 points');
    } else if (cwv.fid <= 300) {
      score += 5;
      console.log('⚠️ Fair FID: +5 points');
    }
    
    if (cwv.cls <= 0.1) {
      score += 10;
      console.log('📐 Good CLS: +10 points');
    } else if (cwv.cls <= 0.25) {
      score += 5;
      console.log('⚠️ Fair CLS: +5 points');
    }
  }
  
  // HTML Structure
  const h1Count = content.headings.filter(h => h.level === 1).length;
  const h2Count = content.headings.filter(h => h.level === 2).length;
  
  if (h1Count === 1) {
    score += 15;
    console.log('📋 Single H1: +15 points');
  } else {
    score -= 10;
    console.log('❌ Multiple/missing H1: -10 points');
  }
  
  if (h2Count >= 2) {
    score += 10;
    console.log(`📋 Good H2 structure (${h2Count}): +10 points`);
  }
  
  // HTML Validation
  const htmlErrors = content.aiAnalysisData?.performanceMetrics?.htmlValidation?.errors || 0;
  if (htmlErrors < 20) {
    score += 10;
    console.log(`✅ Clean HTML (${htmlErrors} errors): +10 points`);
  } else if (htmlErrors >= 50) {
    score -= 15;
    console.log(`❌ Many HTML errors (${htmlErrors}): -15 points`);
  }
  
  // Schema markup bonus
  const schemaContent = content.schemaMarkup.join(' ').toLowerCase();
  if (schemaContent.includes('organization')) score += 5;
  if (schemaContent.includes('faq')) score += 5;
  if (schemaContent.includes('article')) score += 5;
  
  const finalScore = Math.max(0, Math.min(100, score));
  console.log(`⚡ Technical Performance Final Score: ${finalScore}`);
  return finalScore;
}

// 4. Traditional SEO Analysis (15% weight)
export function analyzeTraditionalSEO(content: CrawledContent): number {
  let score = 0;
  console.log('📊 Analyzing Traditional SEO');
  
  // Title Tag
  if (content.title) {
    if (content.title.length >= 30 && content.title.length <= 60) {
      score += 25;
      console.log(`📝 Good title length (${content.title.length}): +25 points`);
    } else if (content.title.length > 0) {
      score += 15;
      console.log(`📝 Has title but suboptimal length: +15 points`);
    }
  } else {
    score -= 25;
    console.log('❌ Missing title tag: -25 points');
  }
  
  // Meta Description
  if (content.metaDescription) {
    if (content.metaDescription.length >= 120 && content.metaDescription.length <= 160) {
      score += 20;
      console.log(`📝 Good meta description: +20 points`);
    } else if (content.metaDescription.length > 0) {
      score += 10;
      console.log(`📝 Has meta description: +10 points`);
    }
  }
  
  // Header Structure
  const h1Count = content.headings.filter(h => h.level === 1).length;
  const h2Count = content.headings.filter(h => h.level === 2).length;
  
  if (h1Count === 1) {
    score += 15;
  } else {
    score -= 10;
  }
  
  if (h2Count >= 2 && h2Count <= 8) {
    score += 15;
  }
  
  // Internal Links
  const internalLinks = content.links.filter(link => link.internal);
  if (internalLinks.length >= 5) {
    score += 10;
    console.log(`🔗 Good internal linking (${internalLinks.length}): +10 points`);
  } else if (internalLinks.length >= 2) {
    score += 5;
  }
  
  // Image Alt Text
  const imagesWithAlt = content.images.filter(img => img.alt && img.alt.trim().length > 0);
  const altTextCoverage = content.images.length > 0 ? (imagesWithAlt.length / content.images.length) * 100 : 100;
  
  if (altTextCoverage >= 90) {
    score += 10;
  } else if (altTextCoverage >= 70) {
    score += 5;
  }
  
  const finalScore = Math.max(0, Math.min(100, score));
  console.log(`📊 Traditional SEO Final Score: ${finalScore}`);
  return finalScore;
}

// 5. Mobile & UX Analysis (12% weight)
export function analyzeMobileUserExperience(content: CrawledContent): number {
  let score = 0;
  console.log('📱 Analyzing Mobile & UX');
  
  // Mobile Responsiveness
  if (content.mobileInfo?.mobileOptimizedCSS) {
    score += 30;
    console.log('📱 Mobile responsive: +30 points');
  } else {
    score -= 40;
    console.log('❌ Not mobile responsive: -40 points');
  }
  
  // Touch Targets
  if (content.mobileInfo?.hasTouchableElements) {
    score += 20;
    console.log('👆 Good touch targets: +20 points');
  }
  
  // Viewport Configuration
  if (content.mobileInfo?.hasViewportMeta) {
    score += 15;
    console.log('📐 Viewport configured: +15 points');
  }
  
  // Mobile Performance
  const mobilePageSpeed = content.mobileInfo?.mobileOptimizedCSS ? 85 : 60;
  if (mobilePageSpeed >= 80) {
    score += 20;
  } else if (mobilePageSpeed >= 60) {
    score += 15;
  } else if (mobilePageSpeed >= 40) {
    score += 10;
  }
  
  // UX Elements
  const paragraphsText = content.paragraphs.join(' ').toLowerCase();
  const markdownText = content.markdownContent?.toLowerCase() || '';
  const fullText = (paragraphsText + ' ' + markdownText).trim();
  
  if (fullText.includes('contact') || fullText.includes('phone') || fullText.includes('email')) score += 5;
  if (content.headings.length > 2) score += 5;
  if (fullText.includes('learn more') || fullText.includes('get started') || fullText.includes('contact us')) score += 5;
  
  const finalScore = Math.max(0, Math.min(100, score));
  console.log(`📱 Mobile & UX Final Score: ${finalScore}`);
  return finalScore;
}

// 6. Content Completeness Analysis (10% weight)
export function analyzeContentCompleteness(content: CrawledContent): number {
  let score = 0;
  
  // Get text content from multiple sources
  const paragraphsText = content.paragraphs.join(' ');
  const markdownText = content.markdownContent || '';
  const fullText = (paragraphsText + ' ' + markdownText).trim();
  const wordCount = fullText.split(/\s+/).length;
  
  console.log('📝 Analyzing Content Completeness');
  console.log(`📝 Word count: ${wordCount} words`);
  
  // Word Count Scoring
  if (wordCount >= 2000) {
    score += 40;
    console.log(`📝 Excellent word count (${wordCount}): +40 points`);
  } else if (wordCount >= 1200) {
    score += 30;
    console.log(`📝 Good word count (${wordCount}): +30 points`);
  } else if (wordCount >= 800) {
    score += 20;
    console.log(`📝 Fair word count (${wordCount}): +20 points`);
  } else if (wordCount >= 400) {
    score += 10;
    console.log(`📝 Minimal word count (${wordCount}): +10 points`);
  } else {
    score -= 10;
    console.log(`❌ Thin content (${wordCount}): -10 points`);
  }
  
  // Comprehensive Coverage
  const coverageIndicators = [
    /overview|introduction|background/gi,
    /benefits|advantages|pros/gi,
    /examples|case studies|illustrations/gi,
    /conclusion|summary|takeaways/gi,
    /next steps|recommendations/gi
  ];
  
  coverageIndicators.forEach(pattern => {
    if (fullText.match(pattern)) {
      score += 8;
      console.log(`📋 Coverage indicator found: +8 points`);
    }
  });
  
  // Content Freshness
  const currentYear = new Date().getFullYear();
  if (fullText.includes(currentYear.toString())) {
    score += 15;
    console.log(`📅 Current year mentioned: +15 points`);
  }
  
  const freshnessIndicators = [
    /updated|revised|current/gi,
    /latest|recent|new/gi,
    /as of|effective/gi
  ];
  
  freshnessIndicators.forEach(pattern => {
    const matches = fullText.match(pattern) || [];
    if (matches.length > 0) {
      score += 5;
      console.log(`🔄 Freshness indicator: +5 points`);
    }
  });
  
  const finalScore = Math.min(100, score);
  console.log(`📝 Content Completeness Final Score: ${finalScore}`);
  return finalScore;
}

// Main Hybrid AI Search Scoring Function
export function calculateHybridAISearchScore(content: CrawledContent): {
  finalScore: number;
  factors: {
    aiCitationPotential: number;
    contentAuthority: number;
    technicalPerformance: number;
    traditionalSEO: number;
    mobileUX: number;
    contentCompleteness: number;
  };
} {
  console.log('🚀 Starting Hybrid AI Search Analysis');
  
  // Calculate each factor
  const citationPotential = analyzeAICitationPotential(content);     // 25%
  const contentAuthority = analyzeContentAuthority(content);         // 20%
  const technicalPerformance = analyzeTechnicalPerformance(content); // 18%
  const traditionalSEO = analyzeTraditionalSEO(content);            // 15%
  const mobileUX = analyzeMobileUserExperience(content);            // 12%
  const contentCompleteness = analyzeContentCompleteness(content);   // 10%
  
  const finalScore = Math.round((
    citationPotential * 0.25 +
    contentAuthority * 0.20 +
    technicalPerformance * 0.18 +
    traditionalSEO * 0.15 +
    mobileUX * 0.12 +
    contentCompleteness * 0.10
  ));
  
  console.log('📊 Hybrid Scoring Breakdown:', {
    citationPotential,
    contentAuthority,
    technicalPerformance,
    traditionalSEO,
    mobileUX,
    contentCompleteness,
    finalScore
  });
  
  return {
    finalScore,
    factors: {
      aiCitationPotential: citationPotential,
      contentAuthority: contentAuthority,
      technicalPerformance: technicalPerformance,
      traditionalSEO: traditionalSEO,
      mobileUX: mobileUX,
      contentCompleteness: contentCompleteness
    }
  };
}