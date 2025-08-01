import { CrawledContent, TechnicalSEO, ContentQuality, AIOptimization, Authority, UserExperience, ContentStructure, TechnicalCrawlability, MobileOptimization, SchemaAnalysis, RecommendationItem } from '@/types';

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
  
  // Analyze long-tail keywords
  const longTailKeywords = analyzeLongTailKeywords(content.paragraphs);
  if (longTailKeywords < 70) {
    findings.push('Limited use of long-tail keywords and conversational phrases');
    recommendations.push(createRecommendation(
      'Incorporate more long-tail keywords and conversational phrases',
      'high',
      'keyword-optimization',
      '1. Research 15-20 long-tail keywords using tools like Answer the Public\n2. Focus on question-based phrases (how, what, why, where)\n3. Include conversational terms for voice search\n4. Use keywords naturally in content\n5. Target specific user intent rather than broad terms'
    ));
  }
  
  // Analyze content depth
  const comprehensiveCoverage = analyzeContentDepth(content);
  if (comprehensiveCoverage < 70) {
    findings.push('Content lacks comprehensive coverage of the topic');
    recommendations.push(createRecommendation(
      'Expand content to provide comprehensive topic coverage',
      'high',
      'content-depth',
      '1. Aim for 1500+ words for pillar content\n2. Include background information and context\n3. Add step-by-step guides and how-tos\n4. Include examples and case studies\n5. Provide actionable takeaways\n6. Answer related questions and subtopics'
    ));
  }
  
  // Analyze relevance
  const relevanceToUserIntent = analyzeRelevance(content);
  if (relevanceToUserIntent < 70) {
    findings.push('Content may not fully address user search intent');
    recommendations.push(createRecommendation(
      'Better align content with user search intent',
      'high',
      'user-intent',
      '1. Analyze search intent for target keywords\n2. Include practical examples and advice\n3. Answer common user questions directly\n4. Use Google\'s "People also ask" for insights\n5. Match content format to intent (informational, transactional, etc.)'
    ));
  }
  
  // Analyze accuracy indicators
  const accuracyAndCurrency = analyzeAccuracy(content);
  if (accuracyAndCurrency < 70) {
    findings.push('Content lacks indicators of accuracy and currency');
    recommendations.push(createRecommendation(
      'Add credibility and freshness indicators',
      'medium',
      'credibility',
      '1. Include publication and last updated dates\n2. Add author information and credentials\n3. Cite authoritative sources with links\n4. Include expert quotes and statistics\n5. Add references and footnotes where appropriate'
    ));
  }
  
  // Analyze natural language
  const naturalLanguage = analyzeNaturalLanguage(content.paragraphs);
  if (naturalLanguage < 70) {
    findings.push('Language could be more natural and conversational');
    recommendations.push(createRecommendation(
      'Use more natural, conversational language',
      'medium',
      'language-style',
      '1. Write in active voice\n2. Use contractions and personal pronouns\n3. Match how your audience speaks\n4. Avoid overly technical jargon\n5. Write as if explaining to a friend'
    ));
  }
  
  const score = Math.round((longTailKeywords + comprehensiveCoverage + relevanceToUserIntent + accuracyAndCurrency + naturalLanguage) / 5);
  const status = getScoreStatus(score);
  
  return {
    score,
    status,
    findings,
    recommendations,
    longTailKeywords,
    comprehensiveCoverage,
    relevanceToUserIntent,
    accuracyAndCurrency,
    naturalLanguage
  };
}

export function analyzeAIOptimization(content: CrawledContent): AIOptimization {
  const findings: string[] = [];
  const recommendations: RecommendationItem[] = [];
  
  // Analyze chunkability - critical for AI systems
  const chunkability = analyzeChunkability(content.paragraphs);
  if (chunkability < 70) {
    findings.push('Content paragraphs are too long for optimal AI processing');
    recommendations.push(createRecommendation(
      'Optimize content structure for AI chunking',
      'high',
      'content-chunking',
      '1. Break paragraphs into 2-4 sentences each\n2. Use bullet points and numbered lists\n3. Add clear section breaks with headings\n4. Aim for 150-300 characters per chunk\n5. Ensure each chunk contains complete thoughts'
    ));
  }
  
  // Analyze Q&A format
  const qaFormat = analyzeQAFormat(content);
  if (qaFormat < 70) {
    findings.push('Content lacks clear question-answer formatting');
    recommendations.push(createRecommendation(
      'Structure content with clear Q&A formatting',
      'high',
      'qa-structure',
      '1. Add FAQ sections with clear questions\n2. Follow questions with direct, concise answers\n3. Use H3 headings for questions\n4. Implement FAQ schema markup\n5. Start headings with question words (How, What, Why)'
    ));
  }
  
  // Analyze entity recognition
  const entityRecognition = analyzeEntityRecognition(content);
  if (entityRecognition < 70) {
    findings.push('Limited use of clearly defined entities (people, places, brands)');
    recommendations.push(createRecommendation(
      'Improve entity recognition and definition',
      'medium',
      'entity-optimization',
      '1. Clearly mention specific names, dates, locations\n2. Define key industry terminology\n3. Include company names and brand references\n4. Add person titles and credentials\n5. Use specific rather than generic terms'
    ));
  }
  
  // Analyze factual density
  const factualDensity = analyzeFactualDensity(content.paragraphs);
  if (factualDensity < 70) {
    findings.push('Content has low fact-to-fluff ratio');
    recommendations.push(createRecommendation(
      'Increase factual density and information value',
      'high',
      'factual-content',
      '1. Include specific statistics and data points\n2. Add concrete examples and case studies\n3. Replace vague statements with specific details\n4. Cite research studies and sources\n5. Include measurable results and outcomes'
    ));
  }
  
  // Analyze semantic clarity
  const semanticClarity = analyzeSemanticClarity(content.paragraphs);
  if (semanticClarity < 70) {
    findings.push('Content contains ambiguous language that may confuse AI systems');
    recommendations.push(createRecommendation(
      'Improve semantic clarity and reduce ambiguity',
      'medium',
      'semantic-clarity',
      '1. Define technical terms explicitly\n2. Use consistent terminology throughout\n3. Avoid jargon and ambiguous phrases\n4. Structure content with logical flow\n5. Use specific rather than general language'
    ));
  }
  
  // Analyze content structure for AI
  const contentStructureForAI = analyzeContentStructureForAI(content);
  if (contentStructureForAI < 70) {
    findings.push('Content structure not optimized for AI understanding');
    recommendations.push(createRecommendation(
      'Optimize content structure for AI processing',
      'medium',
      'ai-structure',
      '1. Use consistent heading hierarchy\n2. Implement schema markup\n3. Structure data in tables when appropriate\n4. Use descriptive link text\n5. Add structured data for key information'
    ));
  }
  
  // Analyze contextual relevance
  const contextualRelevance = analyzeContextualRelevance(content);
  if (contextualRelevance < 70) {
    findings.push('Content lacks sufficient context for AI understanding');
    recommendations.push(createRecommendation(
      'Improve contextual relevance and clarity',
      'medium',
      'contextual-clarity',
      '1. Provide background context for complex topics\n2. Link related concepts explicitly\n3. Use transitional phrases between ideas\n4. Include relevant keywords naturally\n5. Connect information to user intent'
    ));
  }
  
  // NEW: Enhanced AI metrics using advanced pattern analysis
  const aiContentDigestibility = analyzeAIContentDigestibility(content);
  const answerPotential = analyzeAnswerPotential(content);
  const factualAccuracy = analyzeFactualAccuracy(content);
  const topicalAuthority = analyzeTopicalAuthority(content);
  const contentFreshness = analyzeContentFreshness(content);
  
  // Enhanced scoring with new AI search factors (weighted toward new metrics)
  const enhancedScore = Math.round((
    aiContentDigestibility * 0.25 +
    answerPotential * 0.20 +
    factualAccuracy * 0.15 +
    topicalAuthority * 0.15 +
    contentFreshness * 0.10 +
    (chunkability + qaFormat + entityRecognition + factualDensity + semanticClarity) * 0.15 / 5
  ));
  
  const score = enhancedScore;
  const status = getScoreStatus(score);
  
  return {
    score,
    status,
    findings,
    recommendations,
    // New enhanced metrics
    aiContentDigestibility,
    answerPotential,
    factualAccuracy,
    topicalAuthority,
    contentFreshness,
    // Legacy metrics (maintained for compatibility)
    chunkability,
    qaFormat,
    entityRecognition,
    factualDensity,
    semanticClarity,
    contentStructureForAI,
    contextualRelevance
  };
}

export function analyzeAuthority(content: CrawledContent): Authority {
  const findings: string[] = [];
  const recommendations: RecommendationItem[] = [];
  
  // Analyze social media presence indicators
  const socialMediaPresence = analyzeSocialMediaPresence(content);
  if (socialMediaPresence < 70) {
    findings.push('Limited social media presence indicators');
    recommendations.push(createRecommendation(
      'Strengthen social media presence and social proof',
      'medium',
      'social-presence',
      '1. Add social media links in header/footer\n2. Include social sharing buttons\n3. Display follower counts where appropriate\n4. Add social media widgets or feeds\n5. Encourage content sharing and engagement'
    ));
  }
  
  // Analyze company information
  const companyInformation = analyzeCompanyInformation(content);
  if (companyInformation < 70) {
    findings.push('Company information could be more detailed');
    recommendations.push(createRecommendation(
      'Provide comprehensive company information',
      'medium',
      'company-info',
      '1. Add detailed About Us page\n2. Include team member bios and credentials\n3. Add company mission and values\n4. Include business hours and location\n5. Provide company history and milestones'
    ));
  }
  
  // Analyze legal compliance
  const legalCompliance = analyzeLegalCompliance(content);
  if (legalCompliance < 70) {
    findings.push('Legal compliance information may be missing');
    recommendations.push(createRecommendation(
      'Ensure legal compliance and transparency',
      'high',
      'legal-compliance',
      '1. Add privacy policy and terms of service\n2. Include cookie policy if applicable\n3. Add legal disclaimers where needed\n4. Provide contact info for legal inquiries\n5. Ensure GDPR/CCPA compliance if applicable'
    ));
  }
  
  // Analyze testimonials
  const testimonials = analyzeTestimonials(content);
  if (testimonials < 70) {
    findings.push('Limited social proof and testimonials');
    recommendations.push(createRecommendation(
      'Add more social proof and testimonials',
      'medium',
      'social-proof',
      '1. Include customer testimonials with photos\n2. Add case studies and success stories\n3. Display client logos and awards\n4. Include industry recognition\n5. Add review widgets or badges'
    ));
  }
  
  // Analyze affiliations
  const affiliations = analyzeAffiliations(content);
  if (affiliations < 70) {
    findings.push('Professional affiliations and certifications not prominently displayed');
    recommendations.push(createRecommendation(
      'Highlight professional credentials and affiliations',
      'low',
      'affiliations',
      '1. Display industry certifications prominently\n2. Include partner organization logos\n3. Highlight professional memberships\n4. Add award badges and recognition\n5. Include relevant credentials and licenses'
    ));
  }
  
  const score = Math.round((socialMediaPresence + companyInformation + legalCompliance + testimonials + affiliations) / 5);
  const status = getScoreStatus(score);
  
  return {
    score,
    status,
    findings,
    recommendations,
    socialMediaPresence,
    companyInformation,
    legalCompliance,
    testimonials,
    affiliations
  };
}

export function analyzeUserExperience(content: CrawledContent): UserExperience {
  const findings: string[] = [];
  const recommendations: RecommendationItem[] = [];
  
  // Analyze contact information
  const contactInfo = analyzeContactInfo(content);
  if (contactInfo < 70) {
    findings.push('Contact information is not easily accessible');
    recommendations.push(createRecommendation(
      'Make contact information more prominent and accessible',
      'medium',
      'contact-accessibility',
      '1. Add contact info in header and footer\n2. Create a dedicated contact page\n3. Include phone, email, and address\n4. Add business hours and contact forms\n5. Make contact info visible on every page',
      '<div class="contact-info">\n  <h3>Contact Us</h3>\n  <p>📞 (555) 123-4567</p>\n  <p>📧 info@example.com</p>\n  <p>📍 123 Main St, City, State</p>\n</div>',
      ['Google My Business', 'Contact form plugins', 'Schema markup for LocalBusiness'],
      'medium',
      '1-2 hours',
      'Check if contact info appears in multiple places and is easily clickable on mobile',
      ['https://developers.google.com/search/docs/data-types/local-business', 'https://schema.org/LocalBusiness']
    ));
  }
  
  // Analyze calls to action
  const callsToAction = analyzeCallsToAction(content);
  if (callsToAction < 70) {
    findings.push('Calls-to-action could be more compelling and strategically placed');
    recommendations.push(createRecommendation(
      'Improve calls-to-action placement and effectiveness',
      'high',
      'cta-optimization',
      '1. Use action-oriented language (Get Started, Learn More)\n2. Make CTA buttons visually prominent\n3. Place CTAs at the end of sections\n4. Use contrasting colors for CTA buttons\n5. Test different CTA variations',
      '<button class="cta-button primary">\n  🚀 Get Started Free\n</button>\n\n<a href="/demo" class="cta-link">\n  👀 See Live Demo\n</a>',
      ['Hotjar', 'Google Optimize', 'Unbounce', 'Figma for design'],
      'high',
      '2-4 hours',
      'Use heatmaps to verify CTA clicks and A/B test different versions',
      ['https://blog.hubspot.com/marketing/call-to-action-examples', 'https://unbounce.com/conversion-rate-optimization/']
    ));
  }
  
  // Analyze language accessibility
  const language = analyzeLanguageAccessibility(content);
  if (language < 70) {
    findings.push('Language may not be accessible to all audiences');
    recommendations.push(createRecommendation(
      'Improve language accessibility and readability',
      'medium',
      'language-accessibility',
      '1. Use clear, simple language for target audience\n2. Avoid unnecessary jargon and technical terms\n3. Write in active voice\n4. Keep sentences concise (15-20 words)\n5. Define technical terms when necessary',
      '<!-- Instead of: -->\n<p>Utilize our comprehensive solution...</p>\n\n<!-- Use: -->\n<p>Use our complete tool to help you...</p>',
      ['Hemingway Editor', 'Grammarly', 'Readable.io'],
      'medium',
      '1-3 hours',
      'Run content through readability tools and aim for 8th grade reading level',
      ['https://hemingwayapp.com/', 'https://readable.com/']
    ));
  }
  
  // Analyze navigation structure
  const navigation = analyzeNavigation(content);
  if (navigation < 70) {
    findings.push('Navigation structure needs improvement for better user experience');
    recommendations.push(createRecommendation(
      'Enhance navigation structure and usability',
      'high',
      'navigation-optimization',
      '1. Use clear, descriptive menu labels\n2. Limit main navigation to 7±2 items\n3. Add breadcrumb navigation\n4. Include search functionality\n5. Make navigation sticky on scroll\n6. Add visual hierarchy with dropdowns',
      '<nav class="main-nav">\n  <ul>\n    <li><a href="/about">About</a></li>\n    <li><a href="/services">Services</a>\n      <ul class="dropdown">\n        <li><a href="/web-design">Web Design</a></li>\n        <li><a href="/seo">SEO</a></li>\n      </ul>\n    </li>\n  </ul>\n</nav>',
      ['TreeJack for navigation testing', 'OptimalSort for card sorting'],
      'high',
      '3-6 hours',
      'Conduct user testing to verify navigation clarity and findability',
      ['https://www.nngroup.com/articles/menu-design/', 'https://www.smashingmagazine.com/2013/12/redesigning-navigation/']
    ));
  }
  
  // Analyze form usability
  const formUsability = analyzeFormUsability(content);
  if (formUsability < 70) {
    findings.push('Forms need better usability and user experience');
    recommendations.push(createRecommendation(
      'Improve form design and usability',
      'medium',
      'form-optimization',
      '1. Use clear field labels and placeholders\n2. Group related fields together\n3. Provide real-time validation feedback\n4. Minimize required fields\n5. Add progress indicators for multi-step forms\n6. Use appropriate input types (email, tel, etc.)',
      '<form class="user-friendly-form">\n  <div class="field-group">\n    <label for="email">Email Address *</label>\n    <input type="email" id="email" required\n           placeholder="your@email.com">\n    <span class="validation-message"></span>\n  </div>\n</form>',
      ['Formik', 'React Hook Form', 'Typeform', 'Gravity Forms'],
      'medium',
      '2-4 hours',
      'Test form completion rates and monitor abandonment points',
      ['https://www.smashingmagazine.com/2018/08/ux-html5-mobile-form-part-1/', 'https://uxplanet.org/designing-more-efficient-forms-assistance-and-validation-f26a5241199d']
    ));
  }
  
  // Analyze loading experience
  const loadingExperience = analyzeLoadingExperience(content);
  if (loadingExperience < 70) {
    findings.push('Loading experience could be improved with better feedback');
    recommendations.push(createRecommendation(
      'Enhance loading states and perceived performance',
      'high',
      'loading-optimization',
      '1. Add loading spinners for async operations\n2. Use skeleton screens for content loading\n3. Implement progressive image loading\n4. Show progress bars for file uploads\n5. Prefetch critical resources\n6. Use service workers for offline experience',
      '<div class="skeleton-loader">\n  <div class="skeleton-header"></div>\n  <div class="skeleton-text"></div>\n  <div class="skeleton-image"></div>\n</div>\n\n<div class="loading-spinner">\n  <span>Loading...</span>\n</div>',
      ['React Suspense', 'Lottie for animations', 'LazyLoad libraries'],
      'high',
      '4-8 hours',
      'Monitor Core Web Vitals and user feedback on loading experience',
      ['https://web.dev/skeleton-screens/', 'https://uxplanet.org/how-to-design-better-loading-states-f1e4bbe0c3a6']
    ));
  }
  
  // Analyze error handling
  const errorHandling = analyzeErrorHandling(content);
  if (errorHandling < 70) {
    findings.push('Error handling and user feedback systems need improvement');
    recommendations.push(createRecommendation(
      'Implement comprehensive error handling and user feedback',
      'medium',
      'error-handling',
      '1. Create custom 404 and 500 error pages\n2. Add helpful navigation on error pages\n3. Include search functionality on error pages\n4. Use friendly, non-technical error messages\n5. Provide clear next steps for users\n6. Log errors for monitoring',
      '<div class="error-page">\n  <h1>Oops! Page not found</h1>\n  <p>The page you\'re looking for doesn\'t exist.</p>\n  <div class="error-actions">\n    <a href="/" class="btn">Go Home</a>\n    <a href="/contact" class="btn">Contact Us</a>\n  </div>\n  <div class="search-box">\n    <input type="search" placeholder="Search our site...">\n  </div>\n</div>',
      ['Sentry for error monitoring', 'LogRocket for user sessions'],
      'medium',
      '2-3 hours',
      'Monitor error page analytics and user behavior after errors',
      ['https://www.smashingmagazine.com/2009/01/404-error-pages-one-more-time/', 'https://uxplanet.org/error-handling-in-ux-design-useful-tips-and-best-practices-cc53c1f7a2c9']
    ));
  }
  
  // Analyze accessibility
  const accessibility = analyzeAccessibility(content);
  if (accessibility < 70) {
    findings.push('Accessibility features need significant improvement');
    recommendations.push(createRecommendation(
      'Implement comprehensive accessibility improvements',
      'high',
      'accessibility-enhancement',
      '1. Add alt text to all images\n2. Use proper heading hierarchy (h1-h6)\n3. Ensure sufficient color contrast (4.5:1 ratio)\n4. Add ARIA labels and roles\n5. Make site keyboard navigable\n6. Include focus indicators\n7. Test with screen readers',
      '<img src="chart.jpg" alt="Sales increased 25% from Q1 to Q2 2023">\n\n<button aria-label="Close dialog" class="close-btn">\n  <span aria-hidden="true">&times;</span>\n</button>\n\n<nav aria-label="Main navigation" role="navigation">',
      ['WAVE Web Accessibility Evaluator', 'axe DevTools', 'NVDA screen reader'],
      'high',
      '6-12 hours',
      'Run automated accessibility tests and manual screen reader testing',
      ['https://www.w3.org/WAI/WCAG21/quickref/', 'https://webaim.org/resources/']
    ));
  }
  
  // Analyze visual hierarchy
  const visualHierarchy = analyzeVisualHierarchy(content);
  if (visualHierarchy < 70) {
    findings.push('Visual hierarchy could be improved for better content scanning');
    recommendations.push(createRecommendation(
      'Enhance visual hierarchy and content organization',
      'medium',
      'visual-hierarchy',
      '1. Use consistent heading sizes and weights\n2. Implement proper typography scale\n3. Add sufficient white space between sections\n4. Use visual cues like colors and icons\n5. Group related content together\n6. Create clear content sections',
      '<h1 class="page-title">Main Heading (32px)</h1>\n<h2 class="section-title">Section Heading (24px)</h2>\n<h3 class="subsection-title">Subsection (20px)</h3>\n<p class="body-text">Body text (16px)</p>\n<p class="caption">Caption text (14px)</p>',
      ['Figma for design', 'Adobe XD', 'Typography scale generators'],
      'medium',
      '3-5 hours',
      'Use eye-tracking studies or heatmaps to verify scanning patterns',
      ['https://www.nngroup.com/articles/visual-hierarchy/', 'https://www.typescale.com/']
    ));
  }
  
  // Analyze interactive elements
  const interactiveElements = analyzeInteractiveElements(content);
  if (interactiveElements < 70) {
    findings.push('Interactive elements need better design and feedback');
    recommendations.push(createRecommendation(
      'Improve interactive element design and usability',
      'medium',
      'interactive-optimization',
      '1. Make clickable elements obviously clickable\n2. Use hover and focus states\n3. Ensure touch targets are at least 44px\n4. Provide immediate feedback on interactions\n5. Use consistent interaction patterns\n6. Add loading states for actions',
      'button {\n  padding: 12px 24px;\n  min-height: 44px;\n  min-width: 44px;\n  border-radius: 4px;\n  transition: all 0.2s ease;\n}\n\nbutton:hover {\n  background-color: #0056b3;\n  transform: translateY(-1px);\n}\n\nbutton:active {\n  transform: translateY(0);\n}',
      ['CSS transitions', 'Framer Motion', 'GSAP for animations'],
      'medium',
      '2-4 hours',
      'Test with users on different devices and monitor interaction analytics',
      ['https://material.io/design/interaction/', 'https://www.smashingmagazine.com/2012/02/finger-friendly-design-ideal-mobile-touchscreen-target-sizes/']
    ));
  }
  
  // Analyze search functionality
  const searchFunctionality = analyzeSearchFunctionality(content);
  if (searchFunctionality < 70) {
    findings.push('Search functionality is missing or needs improvement');
    recommendations.push(createRecommendation(
      'Implement or enhance search functionality',
      'medium',
      'search-enhancement',
      '1. Add prominent search box in header\n2. Include search suggestions/autocomplete\n3. Implement filters and sorting options\n4. Show search result counts\n5. Handle no-results cases gracefully\n6. Track search analytics',
      '<div class="search-container">\n  <input type="search" \n         placeholder="Search products, articles..."\n         class="search-input"\n         autocomplete="off">\n  <button class="search-btn">🔍</button>\n  <div class="search-suggestions"></div>\n</div>',
      ['Algolia', 'Elasticsearch', 'Lunr.js for client-side search'],
      'medium',
      '4-8 hours',
      'Monitor search success rates and most common search terms',
      ['https://www.nngroup.com/articles/search-interface/', 'https://blog.algolia.com/ux-search-best-practices/']
    ));
  }
  
  // Analyze content readability
  const contentReadability = analyzeContentReadability(content);
  if (contentReadability < 70) {
    findings.push('Content readability needs improvement');
    recommendations.push(createRecommendation(
      'Enhance content readability and structure',
      'medium',
      'readability-improvement',
      '1. Use shorter paragraphs (2-3 sentences)\n2. Add bullet points and numbered lists\n3. Implement proper line spacing (1.5x)\n4. Choose readable fonts (16px minimum)\n5. Ensure good contrast ratios\n6. Break up text with subheadings',
      'p {\n  font-size: 16px;\n  line-height: 1.6;\n  margin-bottom: 1rem;\n  max-width: 65ch; /* Optimal reading width */\n}\n\nul {\n  margin: 1rem 0;\n  padding-left: 1.5rem;\n}\n\nli {\n  margin-bottom: 0.5rem;\n}',
      ['Hemingway Editor', 'Readable.io', 'Google Fonts'],
      'medium',
      '2-3 hours',
      'Test with real users and measure reading completion rates',
      ['https://www.nngroup.com/articles/how-users-read-on-the-web/', 'https://practicaltypography.com/']
    ));
  }
  
  // Analyze social proof
  const socialProof = analyzeSocialProof(content);
  if (socialProof < 70) {
    findings.push('Social proof elements could be enhanced');
    recommendations.push(createRecommendation(
      'Add compelling social proof elements',
      'low',
      'social-proof',
      '1. Add customer testimonials with photos\n2. Display client logos or badges\n3. Show user counts or statistics\n4. Include customer reviews and ratings\n5. Add case studies and success stories\n6. Display social media followers',
      '<div class="testimonial">\n  <blockquote>\n    "This product increased our sales by 40%"\n  </blockquote>\n  <cite>\n    <img src="customer.jpg" alt="John Smith">\n    <span>John Smith, CEO of Example Corp</span>\n  </cite>\n</div>\n\n<div class="social-proof">\n  <span>Trusted by 10,000+ customers</span>\n  <div class="client-logos">...</div>\n</div>',
      ['Testimonial plugins', 'Review aggregation tools', 'Trustpilot'],
      'low',
      '3-6 hours',
      'Monitor conversion rates before and after adding social proof',
      ['https://cxl.com/blog/social-proof/', 'https://blog.hubspot.com/marketing/social-proof-examples']
    ));
  }
  
  const score = Math.round((
    contactInfo + callsToAction + language + navigation + formUsability + 
    loadingExperience + errorHandling + accessibility + visualHierarchy + 
    interactiveElements + searchFunctionality + contentReadability + socialProof
  ) / 13);
  
  const status = getScoreStatus(score);
  
  return {
    score,
    status,
    findings,
    recommendations,
    contactInfo,
    callsToAction,
    language,
    navigation,
    formUsability,
    loadingExperience,
    errorHandling,
    accessibility,
    visualHierarchy,
    interactiveElements,
    searchFunctionality,
    contentReadability,
    socialProof
  };
}

export function analyzeContentStructure(content: CrawledContent): ContentStructure {
  const findings: string[] = [];
  const recommendations: string[] = [];
  
  // Analyze structured content
  const structuredContent = analyzeStructuredContent(content);
  if (structuredContent < 70) {
    findings.push('Content structure could be more scannable');
    recommendations.push('Use more bullet points, numbered lists, clear sections, and structured formatting. Break up long paragraphs, use white space effectively, and organize content with clear headings and subheadings.');
  }
  
  // Analyze multimedia usage
  const multimedia = analyzeMultimedia(content);
  if (multimedia < 70) {
    findings.push('Limited use of multimedia elements');
    recommendations.push('Incorporate relevant images, videos, infographics, and interactive elements. Ensure all media is optimized, includes proper alt text, and enhances the user experience without slowing page load.');
  }
  
  // Analyze readability (moved from Technical SEO)
  const readability = analyzeReadability(content.paragraphs);
  if (readability < 70) {
    findings.push('Content readability needs improvement');
    recommendations.push('Use shorter sentences and paragraphs for better readability. Aim for 2-3 sentences per paragraph and use clear, simple language. Include subheadings and use formatting to highlight key points.');
  }
  
  const score = Math.round((structuredContent + multimedia + readability) / 3);
  const status = getScoreStatus(score);
  
  return {
    score,
    status,
    findings,
    recommendations: recommendations.map(rec => createRecommendation(rec, 'medium', 'content-structure')),
    structuredContent,
    multimedia,
    readability
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

// New function: Analyze site structure (navigation, internal linking, etc.)
export function analyzeSiteStructure(content: CrawledContent): {
  score: number;
  status: 'excellent' | 'good' | 'needs-improvement' | 'poor';
  findings: string[];
  recommendations: RecommendationItem[];
  navigationQuality: number;
  internalLinking: number;
  siteHierarchy: number;
  crawlability: number;
} {
  const findings: string[] = [];
  const recommendations: RecommendationItem[] = [];
  
  // Analyze navigation quality
  const navigationQuality = analyzeNavigationQuality(content);
  if (navigationQuality < 70) {
    findings.push('Navigation structure needs improvement');
    recommendations.push(createRecommendation(
      'Improve site navigation structure',
      'high',
      'navigation',
      '1. Create clear main navigation menu\n2. Add breadcrumb navigation\n3. Ensure mobile-friendly navigation\n4. Include footer navigation links\n5. Test navigation usability'
    ));
  }
  
  // Analyze internal linking
  const internalLinking = analyzeInternalLinking(content);
  if (internalLinking < 70) {
    findings.push('Internal linking strategy needs improvement');
    recommendations.push(createRecommendation(
      'Enhance internal linking strategy',
      'medium',
      'internal-linking',
      '1. Add more internal links to related content\n2. Use descriptive anchor text\n3. Create topic clusters\n4. Link to important pages from multiple locations\n5. Ensure no broken internal links'
    ));
  }
  
  // Analyze site hierarchy
  const siteHierarchy = analyzeSiteHierarchy(content);
  if (siteHierarchy < 70) {
    findings.push('Site hierarchy and structure needs improvement');
    recommendations.push(createRecommendation(
      'Improve site hierarchy and structure',
      'medium',
      'site-hierarchy',
      '1. Create logical URL structure\n2. Organize content in categories\n3. Use clear page titles\n4. Implement proper heading hierarchy\n5. Create sitemap.xml'
    ));
  }
  
  // Analyze crawlability
  const crawlability = analyzeCrawlability(content);
  if (crawlability < 70) {
    findings.push('Site crawlability issues detected');
    recommendations.push(createRecommendation(
      'Fix crawlability issues',
      'high',
      'crawlability',
      '1. Check robots.txt configuration\n2. Ensure no broken links\n3. Optimize page load speed\n4. Fix mobile usability issues\n5. Submit sitemap to search engines'
    ));
  }
  
  const score = Math.round((navigationQuality + internalLinking + siteHierarchy + crawlability) / 4);
  const status = getScoreStatus(score);
  
  return {
    score,
    status,
    findings,
    recommendations,
    navigationQuality,
    internalLinking,
    siteHierarchy,
    crawlability
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
  const wordCount = content.wordCount;
  const headingCount = content.headings.length;
  const paragraphCount = content.paragraphs.length;
  
  let score = 0;
  if (wordCount > 300) score += 30;
  if (wordCount > 800) score += 20;
  if (headingCount > 3) score += 25;
  if (paragraphCount > 5) score += 25;
  
  return Math.min(100, score);
}

function analyzeRelevance(content: CrawledContent): number {
  // Simple relevance check based on title-content alignment
  const titleWords = content.title.toLowerCase().split(' ');
  const contentText = content.paragraphs.join(' ').toLowerCase();
  
  const titleWordsInContent = titleWords.filter(word => 
    word.length > 3 && contentText.includes(word)
  ).length;
  
  return Math.min(100, (titleWordsInContent / titleWords.length) * 100);
}

function analyzeAccuracy(content: CrawledContent): number {
  const text = content.paragraphs.join(' ').toLowerCase();
  const accuracyIndicators = [
    'published', 'updated', 'author', 'source', 'research', 'study', 
    'data', 'statistics', 'according to', 'based on'
  ];
  
  const foundIndicators = accuracyIndicators.filter(indicator => text.includes(indicator)).length;
  return Math.min(100, foundIndicators * 12);
}

function analyzeNaturalLanguage(paragraphs: string[]): number {
  const text = paragraphs.join(' ').toLowerCase();
  const conversationalWords = [
    'you', 'your', 'we', 'our', 'can', 'will', 'should', 'would', 
    'here\'s', 'let\'s', 'that\'s', 'it\'s', 'don\'t', 'won\'t'
  ];
  
  const conversationalCount = conversationalWords.filter(word => text.includes(word)).length;
  return Math.min(100, conversationalCount * 8);
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

function getScoreStatus(score: number): 'excellent' | 'good' | 'needs-improvement' | 'poor' {
  if (score >= 80) return 'excellent';
  if (score >= 60) return 'good';
  if (score >= 40) return 'needs-improvement';
  return 'poor';
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
  
  const schemaCount = content.schemaMarkup.length;
  if (schemaCount > 0) score += 40;
  if (schemaCount > 2) score += 20;
  if (schemaCount > 4) score += 20;
  
  // Check for microdata
  if (content.enhancedSchemaInfo?.microdataCount && content.enhancedSchemaInfo.microdataCount > 0) {
    score += 20;
  }
  
  return Math.min(100, score);
}

function analyzeSchemaValidation(content: CrawledContent): number {
  let score = 80; // Start with good score, penalize for errors
  
  if (content.enhancedSchemaInfo?.validationErrors) {
    const errorCount = content.enhancedSchemaInfo.validationErrors.length;
    score -= errorCount * 10; // Penalize 10 points per error
  }
  
  // Check for valid JSON-LD
  let validJsonLd = 0;
  content.schemaMarkup.forEach(schema => {
    try {
      JSON.parse(schema);
      validJsonLd++;
    } catch {
      score -= 15; // Penalize for invalid JSON
    }
  });
  
  // Bonus points for having valid JSON-LD schemas
  if (validJsonLd > 0) {
    score += Math.min(10, validJsonLd * 2);
  }
  
  return Math.max(0, score);
}

function analyzeRichSnippetPotential(content: CrawledContent): number {
  let score = 40;
  
  const schemaTypes = content.enhancedSchemaInfo?.schemaTypes || [];
  const html = content.html.toLowerCase();
  
  // Check for rich snippet opportunities
  if (schemaTypes.includes('FAQ') || html.includes('faq')) score += 15;
  if (schemaTypes.includes('Review') || html.includes('review')) score += 10;
  if (schemaTypes.includes('Recipe') || html.includes('recipe')) score += 10;
  if (schemaTypes.includes('Event') || html.includes('event')) score += 10;
  if (schemaTypes.includes('Product') || html.includes('product')) score += 10;
  if (schemaTypes.includes('HowTo') || html.includes('how to')) score += 5;
  
  return Math.min(100, score);
}

function analyzeStructuredDataCompleteness(content: CrawledContent): number {
  let score = 50;
  
  const schemaTypes = content.enhancedSchemaInfo?.schemaTypes || [];
  
  // Check for essential schema types
  if (schemaTypes.includes('Organization')) score += 15;
  if (schemaTypes.includes('WebSite')) score += 10;
  if (schemaTypes.includes('WebPage')) score += 10;
  if (schemaTypes.includes('BreadcrumbList')) score += 10;
  
  // Check for completeness based on content type
  if (content.schemaMarkup.length > 0) {
    score += 5; // Base points for having any schema
  }
  
  return Math.min(100, score);
}

function analyzeJsonLdImplementation(content: CrawledContent): number {
  let score = 50;
  
  const jsonLdCount = content.enhancedSchemaInfo?.jsonLdCount || 0;
  const microdataCount = content.enhancedSchemaInfo?.microdataCount || 0;
  
  // Prefer JSON-LD over microdata
  if (jsonLdCount > 0) score += 30;
  if (jsonLdCount > microdataCount) score += 20;
  
  // Check for proper JSON-LD placement (should be in head)
  const html = content.html;
  const headSection = html.substring(0, html.indexOf('</head>') + 7);
  if (headSection.includes('application/ld+json')) score += 10;
  
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