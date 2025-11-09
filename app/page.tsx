'use client';

import { useState } from 'react';
import Image from 'next/image';
import URLAnalyzer from '@/components/URLAnalyzer';
import ScoreReport from '@/components/ScoreReport';
import AnalysisStatus from '@/components/AnalysisStatus';
import ResourcesSection from '@/components/ResourcesSection';
import { WebsiteAnalysis } from '@/types';

export default function Home() {
  const [analysis, setAnalysis] = useState<WebsiteAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAnalysisStart = () => {
    setIsLoading(true);
  };

  const handleAnalysisComplete = (analysisResult: WebsiteAnalysis) => {
    setAnalysis(analysisResult);
    setIsLoading(false);
  };

  const handleNewAnalysis = () => {
    setAnalysis(null);
  };

  return (
    <div>
      {/* Analysis Status Overlay */}
      <AnalysisStatus isVisible={isLoading} />
      
      {/* Header with Search Influence branding */}
      <header className="header">
        <div className="container">
          <div className="header-content">
            <div className="logo-section">
              <div className="logo-container">
                <a href="https://www.searchinfluence.com" target="_blank" rel="noopener noreferrer">
                  <Image src="/search-influence-logo.png" alt="Search Influence" className="si-logo" width={200} height={60} />
                </a>
              </div>
              <h1>AI Website Grader</h1>
              <div className="tagline">Optimize for AI-Powered Search</div>
            </div>
            <div className="header-description">
              <p>
                Analyze your website&apos;s readiness for AI-powered search engines, 
                chat interfaces, and modern search algorithms. Get actionable insights 
                to improve your visibility in AI overviews, voice search results, 
                and chatbot responses.
              </p>
              <p style={{ marginTop: '20px', fontSize: '1rem', color: 'var(--orange-accent)' }}>
                <a href="https://www.searchinfluence.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--orange-accent)', textDecoration: 'underline' }}>
                  Powered by Search Influence - AI SEO Experts
                </a>
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="main-section">
        <div className="container">
          {!analysis ? (
            <URLAnalyzer
              onAnalysisComplete={handleAnalysisComplete}
              onAnalysisStart={handleAnalysisStart}
              isLoading={isLoading}
            />
          ) : (
            <div>
              {/* Back Button */}
              <button
                onClick={handleNewAnalysis}
                className="back-btn"
              >
                Back to Analysis
              </button>
              
              {/* Report */}
              <ScoreReport analysis={analysis} />
            </div>
          )}
        </div>
      </div>

      {/* Resources Section */}
      <ResourcesSection />

      {/* About Section Header */}
      <div style={{
        background: 'var(--lighter-blue)',
        paddingTop: '60px',
        paddingBottom: '20px'
      }}>
        <div className="container">
          <h2 style={{
            fontSize: '2rem',
            fontWeight: '600',
            color: 'var(--white)',
            textAlign: 'center',
            margin: '0',
          }}>
            About The AI Website Grader
          </h2>
        </div>
      </div>

      {/* Features Section */}
      <div className="features" style={{ paddingTop: '40px' }}>
        <div className="container">
          <div className="feature">
            <div className="feature-icon">🎯</div>
            <h3>Advanced AI Search Optimization</h3>
            <p>Real Core Web Vitals, semantic chunk analysis, answer-specific content detection, factual accuracy scoring, and AI bot accessibility analysis.</p>
          </div>
          <div className="feature">
            <div className="feature-icon">⚡</div>
            <h3>Free API Integration</h3>
            <p>Google PageSpeed Insights for real performance data, W3C HTML validation, accessibility analysis, and comprehensive technical assessment.</p>
          </div>
          <div className="feature">
            <div className="feature-icon">📊</div>
            <h3>Professional Insights & Exports</h3>
            <p>9-category scoring system, detailed HTML validation reports, mobile optimization analysis, and downloadable markdown reports.</p>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="faq-section" style={{ 
        background: 'var(--background-gray)', 
        padding: '40px 0',
        marginTop: '40px'
      }}>
        <div className="container">
          <h2 style={{ 
            textAlign: 'center', 
            fontSize: '2.2rem', 
            fontWeight: '800', 
            color: 'var(--dark-blue)', 
            marginBottom: '40px' 
          }}>
            Frequently Asked Questions
          </h2>
          
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            {/* FAQ Item 1 */}
            <details style={{ 
              marginBottom: '16px',
              background: 'var(--content-bg)',
              borderRadius: '12px',
              border: '1px solid var(--border-color)',
              overflow: 'hidden'
            }}>
              <summary style={{ 
                padding: '25px 30px',
                cursor: 'pointer',
                fontSize: '1.1rem',
                fontWeight: '600',
                color: 'var(--content-text)',
                backgroundColor: 'var(--content-bg)',
                borderBottom: '1px solid var(--border-color)',
                listStyle: 'none',
                position: 'relative'
              }}>
                <span style={{ marginRight: '15px' }}>❓</span>
                What is the AI Website Grader and who is it for?
                <span style={{ 
                  position: 'absolute', 
                  right: '30px', 
                  top: '50%', 
                  transform: 'translateY(-50%)',
                  fontSize: '1.2rem',
                  transition: 'transform 0.3s ease'
                }}>▼</span>
              </summary>
              <div style={{ padding: '25px 30px', color: 'var(--secondary-content)', lineHeight: '1.6' }}>
                <p>The AI Website Grader is a sophisticated analysis tool designed for <strong>digital marketers, SEO professionals, web developers, and business owners</strong> who want to optimize their websites for AI-powered search engines and modern search algorithms.</p>
                <p style={{ marginTop: '15px' }}>It&apos;s particularly valuable for:</p>
                <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
                  <li>Higher education institutions optimizing for student search behavior</li>
                  <li>Healthcare organizations improving patient information discoverability</li>
                  <li>E-commerce sites optimizing for voice search and AI assistants</li>
                  <li>Content creators wanting to rank in AI overviews and featured snippets</li>
                  <li>Web developers ensuring technical excellence and accessibility</li>
                </ul>
              </div>
            </details>

            {/* FAQ Item 2 */}
            <details style={{ 
              marginBottom: '16px',
              background: 'var(--content-bg)',
              borderRadius: '12px',
              border: '1px solid var(--border-color)',
              overflow: 'hidden'
            }}>
              <summary style={{ 
                padding: '25px 30px',
                cursor: 'pointer',
                fontSize: '1.1rem',
                fontWeight: '600',
                color: 'var(--content-text)',
                backgroundColor: 'var(--content-bg)',
                borderBottom: '1px solid var(--border-color)',
                listStyle: 'none',
                position: 'relative'
              }}>
                <span style={{ marginRight: '15px' }}>⚡</span>
                What makes this different from other SEO tools?
                <span style={{ 
                  position: 'absolute', 
                  right: '30px', 
                  top: '50%', 
                  transform: 'translateY(-50%)',
                  fontSize: '1.2rem',
                  transition: 'transform 0.3s ease'
                }}>▼</span>
              </summary>
              <div style={{ padding: '25px 30px', color: 'var(--secondary-content)', lineHeight: '1.6' }}>
                <p>Unlike traditional SEO tools, the AI Website Grader is specifically designed for the <strong>AI-powered search future</strong>:</p>
                <ul style={{ marginTop: '15px', paddingLeft: '20px' }}>
                  <li><strong>Real Performance Data:</strong> Uses Google PageSpeed Insights API for actual Core Web Vitals</li>
                  <li><strong>AI-Specific Analysis:</strong> Evaluates content for AI processing, semantic understanding, and answer potential</li>
                  <li><strong>Free API Integration:</strong> No paid subscriptions required - uses free APIs for professional-grade analysis</li>
                  <li><strong>Comprehensive Validation:</strong> W3C HTML validation with detailed error reporting</li>
                  <li><strong>Future-Focused:</strong> Optimized for AI overviews, voice search, and chatbot responses</li>
                  <li><strong>Accessibility First:</strong> Built-in accessibility analysis for inclusive design</li>
                </ul>
              </div>
            </details>

            {/* FAQ Item 3 */}
            <details style={{ 
              marginBottom: '16px',
              background: 'var(--content-bg)',
              borderRadius: '12px',
              border: '1px solid var(--border-color)',
              overflow: 'hidden'
            }}>
              <summary style={{ 
                padding: '25px 30px',
                cursor: 'pointer',
                fontSize: '1.1rem',
                fontWeight: '600',
                color: 'var(--content-text)',
                backgroundColor: 'var(--content-bg)',
                borderBottom: '1px solid var(--border-color)',
                listStyle: 'none',
                position: 'relative'
              }}>
                <span style={{ marginRight: '15px' }}>🎯</span>
                What specific use cases does this tool address?
                <span style={{ 
                  position: 'absolute', 
                  right: '30px', 
                  top: '50%', 
                  transform: 'translateY(-50%)',
                  fontSize: '1.2rem',
                  transition: 'transform 0.3s ease'
                }}>▼</span>
              </summary>
              <div style={{ padding: '25px 30px', color: 'var(--secondary-content)', lineHeight: '1.6' }}>
                <p>The AI Website Grader addresses key challenges in modern digital marketing:</p>
                <ul style={{ marginTop: '15px', paddingLeft: '20px' }}>
                  <li><strong>AI Overview Optimization:</strong> Improve chances of appearing in Google&apos;s AI-generated overviews</li>
                  <li><strong>Voice Search Readiness:</strong> Optimize content for natural language queries and voice assistants</li>
                  <li><strong>Featured Snippet Targeting:</strong> Structure content to appear in answer boxes and featured snippets</li>
                  <li><strong>Technical Performance:</strong> Identify and fix Core Web Vitals issues affecting search rankings</li>
                  <li><strong>Accessibility Compliance:</strong> Ensure content is accessible to all users and AI systems</li>
                  <li><strong>Content Quality Assessment:</strong> Evaluate content depth, authority, and factual accuracy</li>
                  <li><strong>Mobile Optimization:</strong> Ensure mobile-first indexing compliance and user experience</li>
                  <li><strong>Schema Markup Validation:</strong> Verify structured data implementation for rich snippets</li>
                </ul>
              </div>
            </details>

            {/* FAQ Item 4 */}
            <details style={{ 
              marginBottom: '16px',
              background: 'var(--content-bg)',
              borderRadius: '12px',
              border: '1px solid var(--border-color)',
              overflow: 'hidden'
            }}>
              <summary style={{ 
                padding: '25px 30px',
                cursor: 'pointer',
                fontSize: '1.1rem',
                fontWeight: '600',
                color: 'var(--content-text)',
                backgroundColor: 'var(--content-bg)',
                borderBottom: '1px solid var(--border-color)',
                listStyle: 'none',
                position: 'relative'
              }}>
                <span style={{ marginRight: '15px' }}>🔧</span>
                How does the analysis work and what data does it use?
                <span style={{ 
                  position: 'absolute', 
                  right: '30px', 
                  top: '50%', 
                  transform: 'translateY(-50%)',
                  fontSize: '1.2rem',
                  transition: 'transform 0.3s ease'
                }}>▼</span>
              </summary>
              <div style={{ padding: '25px 30px', color: 'var(--secondary-content)', lineHeight: '1.6' }}>
                <p>The analysis combines multiple data sources and advanced algorithms:</p>
                <ul style={{ marginTop: '15px', paddingLeft: '20px' }}>
                  <li><strong>Real Performance Data:</strong> Google PageSpeed Insights API for actual Core Web Vitals (LCP, FID, CLS)</li>
                  <li><strong>Professional Validation:</strong> W3C HTML Validator API for standards compliance</li>
                  <li><strong>Content Analysis:</strong> Advanced pattern matching for semantic structure, entity recognition, and answer potential</li>
                  <li><strong>Technical Assessment:</strong> Robots.txt analysis, schema markup validation, mobile optimization</li>
                  <li><strong>Accessibility Evaluation:</strong> ARIA attributes, semantic HTML, alt text coverage</li>
                  <li><strong>Authority Signals:</strong> Citation detection, external link analysis, author credentials</li>
                  <li><strong>User Experience Metrics:</strong> Navigation structure, form usability, loading experience</li>
                </ul>
                <p style={{ marginTop: '15px' }}>All analysis is performed using <strong>free APIs and intelligent pattern matching</strong> - no paid subscriptions required.</p>
              </div>
            </details>

            {/* FAQ Item 5 */}
            <details style={{ 
              marginBottom: '16px',
              background: 'var(--content-bg)',
              borderRadius: '12px',
              border: '1px solid var(--border-color)',
              overflow: 'hidden'
            }}>
              <summary style={{ 
                padding: '25px 30px',
                cursor: 'pointer',
                fontSize: '1.1rem',
                fontWeight: '600',
                color: 'var(--content-text)',
                backgroundColor: 'var(--content-bg)',
                borderBottom: '1px solid var(--border-color)',
                listStyle: 'none',
                position: 'relative'
              }}>
                <span style={{ marginRight: '15px' }}>📊</span>
                What do the scores mean and how should I interpret them?
                <span style={{ 
                  position: 'absolute', 
                  right: '30px', 
                  top: '50%', 
                  transform: 'translateY(-50%)',
                  fontSize: '1.2rem',
                  transition: 'transform 0.3s ease'
                }}>▼</span>
              </summary>
              <div style={{ padding: '25px 30px', color: 'var(--secondary-content)', lineHeight: '1.6' }}>
                <p>Scores are calculated on a 0-100 scale across 7 key categories:</p>
                <ul style={{ marginTop: '15px', paddingLeft: '20px' }}>
                  <li><strong>90-100:</strong> Excellent - Your content is well-optimized for AI search</li>
                  <li><strong>80-89:</strong> Good - Minor improvements can enhance performance</li>
                  <li><strong>70-79:</strong> Needs Improvement - Focus on priority recommendations</li>
                  <li><strong>Below 70:</strong> Requires Attention - Significant optimization needed</li>
                </ul>
                <p style={{ marginTop: '15px' }}><strong>Priority Categories:</strong></p>
                <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
                  <li><strong>AI Optimization (25%):</strong> Most important for future search visibility</li>
                  <li><strong>Mobile Optimization (20%):</strong> Critical for mobile-first indexing</li>
                  <li><strong>Technical Crawlability (16%):</strong> Ensures search engines can access your content</li>
                  <li><strong>Schema Analysis (12%):</strong> Improves rich snippet opportunities</li>
                </ul>
                <p style={{ marginTop: '15px' }}>Focus on improving lower-scoring categories first, especially those with high priority weights.</p>
              </div>
            </details>
          </div>
        </div>
      </div>

      {/* Footer with Search Influence branding */}
      <footer className="footer">
        <div className="container">
          <div className="text-center">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
              <div className="logo-container" style={{ margin: '0 15px 0 0' }}>
                <a href="https://www.searchinfluence.com" target="_blank" rel="noopener noreferrer">
                  <Image src="/search-influence-logo.png" alt="Search Influence" className="si-logo" width={200} height={60} />
                </a>
              </div>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: 'var(--white)', margin: '0 0 5px 0' }}>Search Influence</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--medium-gray)', margin: 0 }}>AI SEO Experts</p>
              </div>
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--dark-gray)', margin: '0 0 20px 0', maxWidth: '600px', marginLeft: 'auto', marginRight: 'auto' }}>
              Helping higher education institutions and healthcare organizations 
              increase visibility and drive measurable growth through AI-powered SEO strategies.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', fontSize: '0.8rem', color: 'var(--dark-gray)' }}>
              <span>•</span>
              <a href="https://www.searchinfluence.com" target="_blank" rel="noopener noreferrer">
                Visit Search Influence
              </a>
              <span>•</span>
              <a href="https://github.com/willscott-v2/ai-website-grader" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--orange-accent)', textDecoration: 'none' }}>
                AI Website Grader v3.0.0
              </a>
              <span>•</span>
              <a href="https://ai-grader.searchinfluence.com" target="_blank" rel="noopener noreferrer">
                AI Website Grader
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
