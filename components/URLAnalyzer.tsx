'use client';

import { useState, useRef } from 'react';
import { Search, FileText, Loader2, AlertCircle } from 'lucide-react';
import { WebsiteAnalysis } from '@/types';
import { useGoogleTagManager } from '@/hooks/useGoogleTagManager';

interface URLAnalyzerProps {
  onAnalysisComplete: (analysis: WebsiteAnalysis) => void;
  onAnalysisStart: () => void;
  isLoading: boolean;
}

export default function URLAnalyzer({ onAnalysisComplete, onAnalysisStart, isLoading }: URLAnalyzerProps) {
  const [inputMode, setInputMode] = useState<'url' | 'text'>('url');
  const [url, setUrl] = useState('');
  const [textContent, setTextContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const { trackAnalysis, trackAnalysisComplete, trackError } = useGoogleTagManager();

  const validateUrl = (url: string): boolean => {
    try {
      new URL(url.startsWith('http') ? url : `https://${url}`);
      return true;
    } catch {
      return false;
    }
  };

  const handleAnalyze = async () => {
    setError(null);
    
    if (inputMode === 'url') {
      if (!url.trim()) {
        setError('Please enter a URL');
        return;
      }
      if (!validateUrl(url)) {
        setError('Please enter a valid URL');
        return;
      }
    } else {
      if (!textContent.trim()) {
        setError('Please enter some content to analyze');
        return;
      }
      if (textContent.trim().length < 100) {
        setError('Please enter at least 100 characters of content');
        return;
      }
    }

    onAnalysisStart();

    // Track analysis start
    const analysisUrl = inputMode === 'url' ? url : 'text-content';
    trackAnalysis(analysisUrl, inputMode);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: inputMode === 'url' ? url : undefined,
          textContent: inputMode === 'text' ? textContent : undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Analysis failed');
      }

      const analysis = await response.json();
      
      // Track analysis completion
      trackAnalysisComplete(analysisUrl, analysis.overallScore, inputMode);
      
      onAnalysisComplete(analysis);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Analysis failed';
      setError(errorMessage);
      
      // Track error
      trackError('analysis_failed', errorMessage);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="form-card">
        {/* Input Mode Toggle */}
        <div className="input-mode-toggle">
          <button
            onClick={() => setInputMode('url')}
            className={inputMode === 'url' ? 'active' : ''}
          >
            <Search size={16} />
            Analyze URL
          </button>
          <button
            onClick={() => setInputMode('text')}
            className={inputMode === 'text' ? 'active' : ''}
          >
            <FileText size={16} />
            Analyze Text
          </button>
        </div>

        {/* URL Input */}
        {inputMode === 'url' && (
          <div className="form-group">
            <label htmlFor="url">Website URL</label>
            <div className="url-input-group">
              <input
                type="url"
                id="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !isLoading) {
                    handleAnalyze();
                  }
                }}
                placeholder="https://example.com"
                className="url-input"
                disabled={isLoading}
              />
              <button
                onClick={handleAnalyze}
                disabled={isLoading}
                className="analyze-btn"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                {isLoading ? (
                  <>
                    <Loader2 size={18} style={{ marginRight: '8px' }} />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Search size={18} style={{ marginRight: '8px', display: 'flex', alignItems: 'center' }} />
                    Analyze Website
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Text Input */}
        {inputMode === 'text' && (
          <div className="form-group">
            <label htmlFor="content">Content to Analyze</label>
            <textarea
              ref={textAreaRef}
              id="content"
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.ctrlKey && !isLoading) {
                  e.preventDefault();
                  handleAnalyze();
                }
              }}
              placeholder="Paste your website content here..."
              rows={8}
              disabled={isLoading}
              autoFocus={inputMode === 'text'}
              tabIndex={0}
              style={{ pointerEvents: 'auto' }}
            />
            <div className="char-count">
              {textContent.length} characters (minimum 100 required) • Press Ctrl+Enter to submit
            </div>
            <div style={{ marginTop: '20px' }}>
              <button
                onClick={handleAnalyze}
                disabled={isLoading}
                className="analyze-btn"
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                {isLoading ? (
                  <>
                    <Loader2 size={18} style={{ marginRight: '8px' }} />
                    Analyzing Content...
                  </>
                ) : (
                  <>
                    <FileText size={18} style={{ marginRight: '8px', display: 'flex', alignItems: 'center' }} />
                    Analyze Content
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="error">
            <div style={{ display: 'flex', alignItems: 'flex-start' }}>
              <AlertCircle size={20} style={{ marginRight: '12px', marginTop: '2px', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{error}</p>
                {error.includes('Please reload the page') && (
                  <div style={{ 
                    marginTop: '15px', 
                    padding: '15px', 
                    background: 'rgba(52, 152, 219, 0.1)', 
                    border: '1px solid var(--info-blue)', 
                    borderRadius: '6px' 
                  }}>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--info-blue)', fontWeight: '500' }}>
                      💡 <strong>Quick Fix:</strong> Please reload the page, then click the &quot;Analyze Text&quot; tab above and paste your website content directly.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Features List */}
        <div style={{ 
          marginTop: '40px', 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '30px', 
          fontSize: '0.9rem', 
          color: 'var(--light-gray)' 
        }}>
          <div>
            <h3 style={{ fontWeight: '600', color: 'var(--white)', marginBottom: '10px' }}>AI Optimization Focus:</h3>
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              <li>Content chunkability for AI processing</li>
              <li>Q&A format optimization</li>
              <li>Entity recognition and clarity</li>
              <li>Semantic structure analysis</li>
            </ul>
          </div>
          <div>
            <h3 style={{ fontWeight: '600', color: 'var(--white)', marginBottom: '10px' }}>Comprehensive Analysis:</h3>
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              <li>Technical SEO fundamentals</li>
              <li>Content quality assessment</li>
              <li>Authority and trust signals</li>
              <li>User engagement factors</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 