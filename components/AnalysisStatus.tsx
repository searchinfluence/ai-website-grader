'use client';

import { useState, useEffect } from 'react';
import { Loader2, Brain, Search, Zap, Target, TrendingUp } from 'lucide-react';

interface AnalysisStatusProps {
  isVisible: boolean;
}

const analysisQuotes = [
  {
    text: "AI is not just about algorithms—it's about understanding human intent and delivering value at the right moment.",
    author: "AI Search Expert",
    icon: Brain
  },
  {
    text: "The future of search isn't about keywords—it's about semantic understanding and contextual relevance.",
    author: "Search Innovation",
    icon: Search
  },
  {
    text: "Every piece of content should be optimized for both humans and AI systems to discover and understand.",
    author: "Content Strategy",
    icon: Target
  },
  {
    text: "Performance isn't just speed—it's about creating seamless experiences that convert visitors into customers.",
    author: "UX Optimization",
    icon: Zap
  },
  {
    text: "The best SEO strategy is one that adapts to how people actually search and how AI actually understands.",
    author: "Digital Marketing",
    icon: TrendingUp
  },
  {
    text: "AI-powered search rewards content that's structured, factual, and genuinely helpful to users.",
    author: "AI SEO",
    icon: Brain
  },
  {
    text: "Your website's success in AI search depends on how well you answer the questions your audience is asking.",
    author: "Search Psychology",
    icon: Search
  },
  {
    text: "Technical excellence and content quality work together to create AI-friendly experiences.",
    author: "Technical SEO",
    icon: Zap
  }
];

export default function AnalysisStatus({ isVisible }: AnalysisStatusProps) {
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [fadeState, setFadeState] = useState<'in' | 'out'>('in');

  useEffect(() => {
    if (!isVisible) return;

    const quoteInterval = setInterval(() => {
      setFadeState('out');
      
      setTimeout(() => {
        setCurrentQuoteIndex((prev) => (prev + 1) % analysisQuotes.length);
        setFadeState('in');
      }, 300);
    }, 4000);

    return () => clearInterval(quoteInterval);
  }, [isVisible]);

  if (!isVisible) return null;

  const currentQuote = analysisQuotes[currentQuoteIndex];
  const IconComponent = currentQuote.icon;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(8px)'
    }}>
      <div style={{
        background: 'var(--content-bg)',
        borderRadius: '20px',
        padding: '40px',
        maxWidth: '600px',
        width: '90%',
        textAlign: 'center',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        border: '1px solid var(--border-gray)',
        opacity: fadeState === 'in' ? 1 : 0,
        transform: fadeState === 'in' ? 'translateY(0)' : 'translateY(20px)',
        transition: 'all 0.3s ease'
      }}>
        {/* Loading Animation */}
        <div style={{
          marginBottom: '30px',
          display: 'flex',
          justifyContent: 'center'
        }}>
          <div style={{
            position: 'relative',
            width: '80px',
            height: '80px'
          }}>
            <Loader2 
              size={80} 
              style={{
                color: 'var(--orange-accent)',
                animation: 'spin 2s linear infinite'
              }} 
            />
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: 'var(--content-bg)',
              borderRadius: '50%',
              width: '60px',
              height: '60px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <IconComponent size={24} style={{ color: 'var(--orange-accent)' }} />
            </div>
          </div>
        </div>

        {/* Status Text */}
        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: '600',
          color: 'var(--content-text)',
          marginBottom: '20px'
        }}>
          Analyzing Your Website...
        </h2>

        {/* Quote */}
        <div style={{
          marginBottom: '30px',
          padding: '20px',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '12px',
          border: '1px solid var(--border-gray)'
        }}>
          <blockquote style={{
            fontSize: '1.1rem',
            fontStyle: 'italic',
            color: 'var(--content-text)',
            margin: '0 0 15px 0',
            lineHeight: '1.6'
          }}>
            &ldquo;{currentQuote.text}&rdquo;
          </blockquote>
          <cite style={{
            fontSize: '0.9rem',
            color: 'var(--muted-text)',
            fontStyle: 'normal'
          }}>
            — {currentQuote.author}
          </cite>
        </div>

        {/* Progress Steps */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '20px',
          flexWrap: 'wrap'
        }}>
          {[
            { step: 'Crawling', icon: Search },
            { step: 'Analyzing', icon: Brain },
            { step: 'Optimizing', icon: Zap },
            { step: 'Scoring', icon: Target }
          ].map((item, index) => {
            const StepIcon = item.icon;
            return (
              <div key={index} style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'rgba(255, 152, 0, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid var(--orange-accent)'
                }}>
                  <StepIcon size={18} style={{ color: 'var(--orange-accent)' }} />
                </div>
                <span style={{
                  fontSize: '0.8rem',
                  color: 'var(--muted-text)',
                  fontWeight: '500'
                }}>
                  {item.step}
                </span>
              </div>
            );
          })}
        </div>

        {/* Powered by Search Influence */}
        <div style={{
          marginTop: '30px',
          padding: '15px',
          background: 'rgba(255, 152, 0, 0.05)',
          borderRadius: '8px',
          border: '1px solid rgba(255, 152, 0, 0.2)'
        }}>
          <p style={{
            fontSize: '0.9rem',
            color: 'var(--muted-text)',
            margin: 0
          }}>
            Powered by <strong style={{ color: 'var(--orange-accent)' }}>Search Influence</strong> - AI SEO Experts
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
} 