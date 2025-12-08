# AI Website Grader v3.0 - Search Influence

A comprehensive web application that analyzes websites for their readiness in AI-powered search engines, chat interfaces, and modern search algorithms. Built with Next.js 15, TypeScript, and a modern design system.

**Latest Update (v3.0)**: Critical fix implementing proper 7-factor weighted scoring system for accurate AI-readiness assessment.

**Powered by Search Influence** - AI-Driven SEO Experts for Higher Education and Healthcare.

[![Next.js](https://img.shields.io/badge/Next.js-15.4.5-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

## 🚀 Features

### Core Analysis Categories (7 Categories)
- **AI Optimization** (25% weight) - Most critical for future search visibility
  - Real Core Web Vitals from Google PageSpeed Insights
  - Semantic chunk analysis and answer-specific content detection
  - Factual accuracy scoring and topical authority measurement
  - AI bot accessibility analysis and voice search optimization

- **Content Quality** (18% weight) - Content foundation and expertise
  - Long-tail keyword usage and comprehensive topic coverage
  - Relevance to user intent and accuracy indicators
  - Natural language assessment and content freshness analysis
  - Original research and insights

- **Technical Crawlability** (16% weight) - AI bot accessibility
  - Robots.txt analysis for AI bots (GPTBot, Google-Extended, etc.)
  - JavaScript dependency assessment and content delivery analysis
  - Load speed optimization and bot accessibility scoring

- **E-E-A-T Signals** (12% weight) - Expertise, Experience, Authoritativeness, Trustworthiness
  - Author credentials and industry expertise demonstration
  - Domain authority metrics and industry recognition
  - Citations, sources, and external validation
  - Contact information and business verification

- **Mobile Optimization** (12% weight) - Mobile-first indexing
  - Mobile page speed and touch target analysis
  - Viewport configuration and responsive design assessment
  - Mobile usability and accessibility compliance

- **Schema Analysis** (10% weight) - AI-friendly structured data
  - AI-friendly schema detection (FAQ, Q&A, HowTo, Article)
  - Conversational schema analysis and semantic markup validation
  - Rich answer potential scoring and structured data optimization

- **Technical SEO** (7% weight) - Technical performance and SEO basics
  - Desktop performance (separate from mobile)
  - Title tags and meta descriptions
  - HTTPS implementation and technical standards compliance
  - Alt text for images and link quality assessment

### Key Features
- **Free API Integration**: Google PageSpeed Insights and W3C HTML Validator
- **Real Performance Data**: Actual Core Web Vitals (LCP, FID, CLS) from Google
- **Advanced AI Analysis**: Pattern-based entity recognition and semantic analysis
- **Comprehensive Validation**: W3C HTML validation with detailed error reporting
- **Mobile-First Analysis**: Mobile optimization and accessibility assessment
- **Professional Reports**: Detailed markdown exports with performance metrics
- **Modern Design**: Clean, professional interface with optimized spacing
- **Real-time Analysis**: Instant results with detailed breakdowns
- **Accessibility Focus**: Built-in accessibility analysis and compliance checking

## 🛠️ Technology Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Custom CSS with optimized design system
- **APIs**: Google PageSpeed Insights, W3C HTML Validator
- **HTML Parsing**: Cheerio with advanced pattern matching
- **Performance**: Parallel analysis processing with caching
- **Deployment**: Vercel-ready with environment variable support

## 📦 Installation

1. Clone the repository:
```bash
git clone https://github.com/willscott-v2/ai-website-grader.git
cd ai-website-grader
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## ⚡ Quick Start

Want to try it immediately? Click the button below to deploy your own instance:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/willscott-v2/ai-website-grader)

## 🚀 Deployment

### Direct Deployment (Recommended)
For immediate feedback and build error visibility:

```bash
# Deploy with automatic commit and push
npm run deploy

# Or with custom commit message
npm run deploy "Your commit message"

# Direct deployment only (no git operations)
npm run deploy:prod
```

### Manual Deployment
```bash
# Commit and push changes
git add .
git commit -m "Your changes"
git push origin main

# Trigger direct Vercel deployment
vercel --prod
```

### Deployment Script
The `deploy.sh` script automatically:
- Commits all changes (with optional custom message)
- Pushes to GitHub
- Triggers direct Vercel deployment
- Shows build progress and errors in console

## 🏗️ Project Structure

```
ai-website-grader/
├── app/
│   ├── api/analyze/
│   │   └── route.ts          # API endpoint for analysis
│   ├── globals.css           # Global styles with design system
│   ├── layout.tsx            # Root layout
│   ├── not-found.tsx         # 404 page
│   └── page.tsx              # Main application page
├── components/
│   ├── URLAnalyzer.tsx       # Main input component
│   ├── ScoreReport.tsx       # Comprehensive report display
│   ├── ScoreCard.tsx         # Individual score cards
│   └── ExportButtons.tsx     # Export functionality
├── lib/
│   ├── analysis-engine.ts    # Main analysis orchestration
│   ├── analyzer.ts           # Core analysis functions
│   ├── crawler.ts            # Website crawling logic
│   ├── exporters.ts          # PDF/Markdown export with clickable URLs
│   └── utils.ts              # Utility functions
├── types/
│   └── index.ts              # TypeScript definitions
├── public/                   # Static assets
├── vercel.json               # Vercel deployment config
└── DEPLOYMENT.md             # Deployment guide
```

## 🔧 Usage

### URL Analysis
1. Enter a website URL in the input field
2. Click "Analyze Website"
3. View comprehensive results with detailed breakdowns
4. Export results as PDF (with clickable URLs), Markdown, or Print

### Text Analysis
1. Switch to "Analyze Text" mode
2. Paste your website content (minimum 100 characters)
3. Get instant analysis of your content
4. Receive actionable recommendations

### Export Options
- **Export PDF**: Downloads a professional PDF with clickable URLs
- **Export Markdown**: Downloads a markdown file for documentation
- **Print Report**: Opens a print-friendly HTML version

### Understanding Scores
The scoring system emphasizes AI Optimization and Content Quality, which are critical for future search visibility:

- **65-100%**: Excellent - Well-optimized for AI search with strong content quality
- **55-64%**: Good - Solid foundation, minor improvements recommended
- **45-54%**: Average - Significant optimization opportunities
- **0-44%**: Needs Improvement - Major content and AI optimization required

**Note**: Scores are calibrated to provide realistic assessments. Even professional SEO agencies typically score 60-70%, as the system heavily weighs AI Optimization (25%) and Content Quality (18%).

## 🎯 AI Optimization Focus

This tool is specifically designed for the future of search, focusing on:

1. **Content Chunkability**: Breaking content into AI-processable chunks
2. **Q&A Format**: Structuring content for voice search and chatbots
3. **Entity Recognition**: Clear identification of people, places, and concepts
4. **Factual Density**: High information-to-fluff ratio
5. **Semantic Clarity**: Unambiguous language for AI systems

## 📊 Analysis Methodology

The scoring system uses weighted calculations with AI Optimization receiving the highest weight (25%) as it's most critical for future search visibility:

- AI Optimization: 25%
- Content Quality: 18%
- Technical Crawlability: 16%
- E-E-A-T Signals: 12%
- Mobile Optimization: 12%
- Schema Analysis: 10%
- Technical SEO: 7%

For detailed information about the weighting system, see [WEIGHTING_SYSTEM.md](WEIGHTING_SYSTEM.md).

## 🚀 Deployment

### Live Demo
🌐 **Live Application**: [Deploy to Vercel](https://vercel.com/new/clone?repository-url=https://github.com/willscott-v2/ai-website-grader)

### Vercel (Recommended)
1. Click the "Deploy to Vercel" button above, or
2. Push your code to GitHub
3. Connect your repository to Vercel
4. Deploy automatically

### Other Platforms
The application is built with Next.js and can be deployed to any platform that supports Node.js applications.

## 🔍 API Usage

The application includes a REST API endpoint for programmatic access:

```typescript
POST /api/analyze
Content-Type: application/json

{
  "url": "https://example.com",
  "textContent": "Optional text content for analysis"
}
```

Response:
```json
{
  "url": "https://example.com",
  "title": "Example Website",
  "overallScore": 75.00,
  "timestamp": "2024-01-01T00:00:00.000Z",
  "technicalSEO": { /* detailed analysis */ },
  "contentQuality": { /* detailed analysis */ },
  "aiOptimization": { /* detailed analysis */ },
  "authority": { /* detailed analysis */ },
  "userExperience": { /* detailed analysis */ },
  "contentImprovements": [ /* priority improvements */ ]
}
```

## 🎨 Design System

The application uses a modern design system with:
- **Color Palette**: Professional blues, oranges, and grays
- **Typography**: Clean, readable fonts
- **Components**: Consistent card layouts and spacing
- **Responsive Design**: Works on all device sizes
- **Accessibility**: WCAG compliant design

## 📄 Recent Updates

### Security Update - React2Shell (CVE-2025-66478) Fix (December 2025)
- 🔒 **SECURITY FIX**: Addressed React2Shell vulnerability (CVE-2025-66478) by upgrading affected dependencies
- ✅ **Next.js**: Upgraded from 15.4.5 to 15.4.8 (patched version)
- ✅ **React**: Upgraded from 19.1.0 to 19.1.2 (patched version)
- ✅ **React-DOM**: Upgraded from 19.1.0 to 19.1.2 (patched version)
- ✅ **Build Verification**: All builds passing with zero vulnerabilities detected
- 📝 **Impact**: Resolves critical security vulnerability affecting React Server Components and Next.js middleware

### v3.0 - Critical Scoring Fix (November 2025)
- 🔴 **CRITICAL FIX**: Corrected overall score calculation to use proper 7-factor weighted system
- ✅ **Scoring Accuracy**: Fixed bug where system used old 6-factor hybrid score instead of new weighted calculation
- ✅ **UI Improvements**: Updated all reports to accurately display 7-factor analysis breakdown
- ✅ **Better Differentiation**: Scores now properly distinguish between average (48%), good (60%), and excellent (65-70%) sites
- ✅ **Responsive Layout**: Added proper grid layout for 7 score cards across all screen sizes
- ✅ **Export Updates**: All export formats now include complete 7-factor analysis
- 📊 **Impact**: Average scores dropped 20-25 points to reflect realistic AI-readiness assessments

### Previous Updates (v2.0)
- ✅ **W3C HTML Validation**: Real-time HTML validation with detailed error reporting
- ✅ **Enhanced Content Extraction**: Improved markdown generation with full page content
- ✅ **Performance Metrics**: Real Core Web Vitals data from Google PageSpeed Insights
- ✅ **Multiple Export Options**: PDF, Markdown, and Print functionality
- ✅ **Professional Reports**: Detailed analysis with actionable recommendations
- ✅ **Modern Design System**: Clean, professional interface with optimized spacing
- ✅ **Free API Integration**: No signup required for core functionality

## 🗺️ Roadmap

### Completed ✅
- ✅ **Status Indicator**: Added real-time status updates with inspirational quotes during analysis
- ✅ **Email Announcement**: Created comprehensive email draft with subject lines, content, and social media posts
- ✅ **Page Crawling Logic Review**: 
  - ✅ Fixed missing content in markdown version of pages
  - ✅ Improved Content Structure scoring algorithm
  - ✅ Enhanced content capture for better analysis
  - ✅ Added support for more content types (lists, blockquotes, divs, images)

### Upcoming Features
- 🚀 **Performance Optimization**: Further improve analysis speed and accuracy
- 📊 **Enhanced Analytics**: Add more detailed reporting and insights
- 🔧 **API Improvements**: Expand API capabilities for enterprise use

## 🧪 Testing

The project includes comprehensive test suites to validate scoring accuracy:

### Test Scripts
```bash
# Test average (non-SEO-optimized) sites
node test-average-sites.js

# Test professional/SEO-optimized sites
node test-professional-sites.js

# Test calibration suite (original test set)
node test-calibration-sites.js

# Run full calibration suite
node run-calibration-suite.js
```

### Test Coverage
- **Average Sites**: 6 URLs testing typical websites (expected: 45-52%)
- **Professional Sites**: 4 URLs testing SEO-optimized content (expected: 60-70%)
- **Calibration Sites**: 9 URLs testing mixed quality sites (expected: 40-70% range)

### Validation Scripts Location
All test scripts are in the project root and use the local development API (localhost:3000). Make sure the dev server is running before executing tests.

### Expected Results
- Average sites: ~48% (reflects typical non-optimized content)
- Professional SEO sites: ~66% (strong technical SEO but content quality varies)
- Excellent AI-optimized sites: 70%+ (rare, requires both technical excellence and high content quality)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run test suites to validate changes
5. Submit a pull request

## 🔒 Security

### Security Updates

**React2Shell (CVE-2025-66478) - December 2025**
- **Vulnerability**: Critical security issue affecting React Server Components and Next.js middleware
- **Affected Packages**: 
  - `next`: versions 15.0.0 through 16.0.6
  - `react-server-dom-*`: versions 19.0.0, 19.1.0, 19.1.1, 19.2.0
- **Resolution**: 
  - Upgraded `next` from 15.4.5 → 15.4.8
  - Upgraded `react` from 19.1.0 → 19.1.2
  - Upgraded `react-dom` from 19.1.0 → 19.1.2
- **Verification**: All dependencies verified with `npm audit` showing zero vulnerabilities
- **References**: 
  - [Vercel React2Shell Security Bulletin](https://vercel.com/kb/bulletin/react2shell/)
  - [React2Shell Tech Briefing](https://react2shell.info/)

### Reporting Security Issues

If you discover a security vulnerability, please email security@searchinfluence.com instead of using the issue tracker.

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Built with Next.js and TypeScript
- Modern design system implementation
- Icons from Lucide React
- HTML parsing with Cheerio
- PDF generation with jsPDF
- Powered by Search Influence

---

**AI Website Grader v2.0** - Powered by Search Influence • Optimizing content for the AI-powered search future.

Visit [Search Influence](https://www.searchinfluence.com) for AI-driven SEO and digital advertising solutions.
