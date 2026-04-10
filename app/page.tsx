'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ArrowLeft, BarChart3, HelpCircle, Target, Wrench, Zap } from 'lucide-react';
import URLAnalyzer from '@/components/URLAnalyzer';
import ScoreReport from '@/components/ScoreReport';
import AnalysisStatus from '@/components/AnalysisStatus';
import ResourcesSection from '@/components/ResourcesSection';
import { WebsiteAnalysis } from '@/types';
import { SCORING_FACTORS } from '@/lib/scoring/config';

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
                Get a free, instant analysis of your website&apos;s content structure,
                structured data, technical health, and on-page SEO -- scored across
                4 weighted factors with specific, prioritized recommendations you
                can act on today.
              </p>
              <p style={{ marginTop: '20px', fontSize: '1rem', color: 'var(--si-header-accent)' }}>
                <a href="https://www.searchinfluence.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--si-header-accent)', textDecoration: 'underline' }}>
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
                <ArrowLeft size={18} aria-hidden="true" />
                <span>Back to Analysis</span>
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
        paddingTop: '56px',
        paddingBottom: '20px'
      }}>
        <div className="container">
          <h2 style={{
            fontSize: '2rem',
            fontWeight: '800',
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
            <div className="feature-icon">
              <Target size={32} color="var(--orange-accent)" aria-hidden="true" />
            </div>
            <h3>4-Factor Scoring</h3>
            <p>Content structure, structured data, technical health, and page SEO -- each weighted and scored so you know exactly where to focus.</p>
          </div>
          <div className="feature">
            <div className="feature-icon">
              <Zap size={32} color="var(--orange-accent)" aria-hidden="true" />
            </div>
            <h3>Real Data, No Guesswork</h3>
            <p>Pulls live data from Google PageSpeed Insights for Core Web Vitals, checks your robots.txt, validates JSON-LD, and measures actual load times.</p>
          </div>
          <div className="feature">
            <div className="feature-icon">
              <BarChart3 size={32} color="var(--orange-accent)" aria-hidden="true" />
            </div>
            <h3>Specific Recommendations</h3>
            <p>Every recommendation names your domain, cites the actual numbers, and tells you how long the fix takes. Export as PDF or Markdown to share with your team.</p>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="faq-section" style={{ 
        background: 'var(--background-gray)', 
        padding: '48px 0',
        marginTop: '0'
      }}>
        <div className="container">
          <h2 style={{ 
            textAlign: 'center', 
            fontSize: '2.2rem', 
            fontWeight: 800, 
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
                <span style={{ marginRight: '15px', display: 'inline-flex', verticalAlign: 'middle' }}>
                  <HelpCircle size={20} style={{ color: 'var(--info-blue)' }} />
                </span>
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
                  <li>Businesses of all sizes improving discoverability in AI-driven search</li>
                  <li>Marketing teams prioritizing technical and content fixes by impact</li>
                  <li>Agencies and consultants delivering clear audits and action plans</li>
                  <li>Content teams improving answer-first structure for AI overviews</li>
                  <li>Web developers ensuring strong technical foundations and accessibility</li>
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
                <span style={{ marginRight: '15px', display: 'inline-flex', verticalAlign: 'middle' }}>
                  <Zap size={20} style={{ color: 'var(--orange-accent)' }} />
                </span>
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
                <span style={{ marginRight: '15px', display: 'inline-flex', verticalAlign: 'middle' }}>
                  <Target size={20} style={{ color: 'var(--success-green)' }} />
                </span>
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
                  <li><strong>Content Structure:</strong> Improve heading hierarchy, FAQ blocks, readability, and internal linking.</li>
                  <li><strong>Structured Data:</strong> Add JSON-LD and social metadata for rich result eligibility.</li>
                  <li><strong>Technical Health:</strong> Resolve crawlability, mobile foundation, and speed bottlenecks.</li>
                  <li><strong>Page SEO:</strong> Tighten title, meta description, URL quality, and image optimization.</li>
                  <li><strong>AI Overview Readiness:</strong> Strengthen answer-first sections and clear, scannable page structure.</li>
                  <li><strong>Execution Planning:</strong> Prioritize fixes by impact and effort from the recommendation list.</li>
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
                <span style={{ marginRight: '15px', display: 'inline-flex', verticalAlign: 'middle' }}>
                  <Wrench size={20} style={{ color: 'var(--orange-accent)' }} />
                </span>
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
                  <li><strong>Content Analysis:</strong> Main-content extraction, heading structure checks, and FAQ/Q&A detection</li>
                  <li><strong>Technical Assessment:</strong> Robots.txt, sitemap hints, canonical tags, and mobile readiness</li>
                  <li><strong>Accessibility Evaluation:</strong> ARIA attributes, semantic HTML, alt text coverage</li>
                  <li><strong>Structured Data Review:</strong> JSON-LD type extraction, parse validation, and social meta checks</li>
                  <li><strong>Page SEO Metrics:</strong> Title/meta length, H1 usage, URL cleanliness, and image format signals</li>
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
                <span style={{ marginRight: '15px', display: 'inline-flex', verticalAlign: 'middle' }}>
                  <BarChart3 size={20} style={{ color: 'var(--info-blue)' }} />
                </span>
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
                <p>Scores are calculated on a 0-100 scale across 4 weighted factors:</p>
                <ul style={{ marginTop: '15px', paddingLeft: '20px' }}>
                  <li><strong>80-95:</strong> Excellent - Strong implementation across most factors</li>
                  <li><strong>65-79:</strong> Good - Solid baseline with clear optimization opportunities</li>
                  <li><strong>45-64:</strong> Average - Multiple measurable gaps are limiting performance</li>
                  <li><strong>20-44:</strong> Poor - Foundational issues need immediate attention</li>
                </ul>
                <p style={{ marginTop: '15px' }}><strong>Priority Categories:</strong></p>
                <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
                  {SCORING_FACTORS.map((factor) => (
                    <li key={factor.key}>
                      <strong>{factor.label} ({Math.round(factor.weight * 100)}%):</strong> {factor.description}
                    </li>
                  ))}
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
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--white)', margin: '0 0 5px 0' }}>Search Influence</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--medium-gray)', margin: 0 }}>AI SEO Experts</p>
              </div>
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--dark-gray)', margin: '0 0 20px 0', maxWidth: '600px', marginLeft: 'auto', marginRight: 'auto' }}>
              20+ years of SEO expertise. Now helping organizations
              optimize for AI-powered search and traditional search alike.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', fontSize: '0.8rem', color: 'var(--dark-gray)' }}>
              <span>•</span>
              <a href="https://www.searchinfluence.com" target="_blank" rel="noopener noreferrer">
                Visit Search Influence
              </a>
              <span>•</span>
              <a href="https://github.com/searchinfluence/ai-website-grader" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--orange-accent)', textDecoration: 'none' }}>
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
