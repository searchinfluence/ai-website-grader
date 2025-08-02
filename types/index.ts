export interface AnalysisScore {
  score: number; // 0-100
  status: 'excellent' | 'good' | 'needs-improvement' | 'poor' | 'critical';
  findings: string[];
  recommendations: RecommendationItem[];
}

export interface RecommendationItem {
  text: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
  implementation?: string; // Step-by-step guide
  codeExample?: string; // HTML/CSS/JS code examples
  tools?: string[]; // Recommended tools or resources
  expectedImpact?: 'high' | 'medium' | 'low';
  timeToImplement?: string; // e.g., "5 minutes", "1 hour", "1 day"
  testingInstructions?: string; // How to verify the fix worked
  resources?: string[]; // Links to documentation or guides
}

export interface TechnicalSEO extends AnalysisScore {
  headingStructure: number;
  metaInfo: number;
  altText: number;
  links: number;
  schemaMarkup: number;
  pageSpeed: number;
}

export interface TechnicalCrawlability extends AnalysisScore {
  robotsAccess: number;
  botAccessibility: number;
  contentDelivery: number;
  javascriptDependency: number;
  loadSpeed: number;
}

export interface ContentQuality extends AnalysisScore {
  longTailKeywords: number;
  comprehensiveCoverage: number;
  relevanceToUserIntent: number;
  accuracyAndCurrency: number;
  naturalLanguage: number;
}

export interface AIOptimization extends AnalysisScore {
  // Clean AI-focused metrics (no overlaps)
  semanticStructure: number;
  answerPotential: number;
  contentClarity: number;
  
  // Legacy metrics (maintained for compatibility)
  chunkability: number;
  qaFormat: number;
  entityRecognition: number;
  factualDensity: number;
  semanticClarity: number;
  contentStructureForAI: number;
  contextualRelevance: number;
}

export interface EEATSignals extends AnalysisScore {
  expertiseExperience: number;
  authoritativeness: number;
  trustworthiness: number;
  factualAccuracy: number;
}

export interface MobileOptimization extends AnalysisScore {
  mobilePageSpeed: number;
  touchTargets: number;
  viewportConfiguration: number;
  mobileUsability: number;
  responsiveDesign: number;
}

export interface SchemaAnalysis extends AnalysisScore {
  schemaPresence: number;
  schemaValidation: number;
  richSnippetPotential: number;
  structuredDataCompleteness: number;
  jsonLdImplementation: number;
}

export interface CrawledContent {
  title: string;
  metaDescription: string;
  headings: { level: number; text: string }[];
  paragraphs: string[];
  images: { src: string; alt: string }[];
  links: { href: string; text: string; internal: boolean }[];
  wordCount: number;
  html: string;
  url: string;
  robotsInfo?: {
    hasRobotsTxt: boolean;
    allowsAllBots: boolean;
    hasSpecificBotRules: boolean;
    content?: string;
  };
  schemaMarkup: string[];
  loadTime?: number;
  hasJavaScriptDependency: boolean;
  mobileInfo?: {
    hasViewportMeta: boolean;
    viewportContent?: string;
    hasTouchableElements: boolean;
    usesResponsiveImages: boolean;
    mobileOptimizedCSS: boolean;
  };
  enhancedSchemaInfo?: {
    jsonLdCount: number;
    microdataCount: number;
    schemaTypes: string[];
    validationErrors: string[];
    aiFriendlySchemas: string[]; // FAQPage, QAPage, HowTo, etc.
    conversationalElements: number;
  };
  markdownContent?: string;
  uxInfo?: {
    hasNavigation: boolean;
    navigationStructure: string[];
    formCount: number;
    formFields: string[];
    hasSearchBox: boolean;
    hasContactForm: boolean;
    hasErrorPages: boolean;
    accessibilityFeatures: string[];
    interactiveElementsCount: number;
    hasLoadingIndicators: boolean;
    hasSocialProof: boolean;
    socialElements: string[];
  };
  
  // Enhanced AI analysis data
  aiAnalysisData?: {
    // Entity and context data
    detectedEntities: {
      persons: string[];
      organizations: string[];
      locations: string[];
      brands: string[];
    };
    
    // Content analysis
    answerFormats: {
      qaCount: number;
      listCount: number;
      stepByStepCount: number;
      definitionCount: number;
    };
    
    // Authority and expertise signals
    authoritySignals: {
      authorBylines: string[];
      publicationDates: string[];
      lastModified?: string;
      credentialMentions: string[];
      authorityLinks: string[];
    };
    
    // Factual accuracy indicators
    factualIndicators: {
      citations: number;
      statistics: number;
      dates: string[];
      sources: string[];
      externalLinks: number;
    };
    
    // AI bot accessibility
    botAccessibility: {
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
    };
    
    // Voice and local search
    voiceSearchOptimization: {
      naturalLanguagePatterns: number;
      conversationalContent: number;
      questionFormats: number;
      speakableContent: boolean;
    };
    
    // Performance data (free APIs)
    performanceMetrics?: {
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
    };
  };
}

export interface WebsiteAnalysis {
  url: string;
  title: string;
  overallScore: number;
  timestamp: string;
  technicalSEO: TechnicalSEO;
  technicalCrawlability: TechnicalCrawlability;
  contentQuality: ContentQuality;
  aiOptimization: AIOptimization;
  mobileOptimization: MobileOptimization;
  schemaAnalysis: SchemaAnalysis;
  eeatSignals: EEATSignals;
  contentImprovements: ContentImprovement[];
  crawledContent: CrawledContent;
}

export interface ContentImprovement {
  section: string;
  current: string;
  improved: string;
  reasoning: string;
  priority: 'high' | 'medium' | 'low';
  implementation?: string;
  estimatedImpact?: 'high' | 'medium' | 'low';
} 