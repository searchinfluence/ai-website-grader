import { CheckCircle, AlertCircle, XCircle, Info } from 'lucide-react';

interface ScoreCardProps {
  title: string;
  score: number;
  status: 'excellent' | 'good' | 'needs-improvement' | 'poor' | 'critical';
  findings: string[];
  recommendations: string[];
  details?: Record<string, number>;
}

export default function ScoreCard({ 
  title, 
  score, 
  status, 
  findings, 
  recommendations, 
  details 
}: ScoreCardProps) {
  // Helper function to round numbers to 2 decimal places
  const round = (num: number) => Math.round(num * 100) / 100;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent':
        return { bg: 'rgba(39, 174, 96, 0.1)', border: 'rgba(39, 174, 96, 0.3)', text: 'var(--success-green)' };
      case 'good':
        return { bg: 'rgba(52, 152, 219, 0.1)', border: 'rgba(52, 152, 219, 0.3)', text: 'var(--info-blue)' };
      case 'needs-improvement':
        return { bg: 'rgba(230, 126, 34, 0.1)', border: 'rgba(230, 126, 34, 0.3)', text: 'var(--orange-accent)' };
      case 'poor':
        return { bg: 'rgba(231, 76, 60, 0.1)', border: 'rgba(231, 76, 60, 0.3)', text: 'var(--error-red)' };
      case 'critical':
        return { bg: 'rgba(142, 68, 173, 0.1)', border: 'rgba(142, 68, 173, 0.3)', text: 'var(--error-red)' };
      default:
        return { bg: 'rgba(149, 165, 166, 0.1)', border: 'rgba(149, 165, 166, 0.3)', text: 'var(--dark-gray)' };
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent':
        return <CheckCircle size={18} />;
      case 'good':
        return <CheckCircle size={18} />;
      case 'needs-improvement':
        return <AlertCircle size={18} />;
      case 'poor':
        return <XCircle size={18} />;
      case 'critical':
        return <XCircle size={18} />;
      default:
        return <Info size={18} />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'var(--success-green)';
    if (score >= 60) return 'var(--info-blue)';
    if (score >= 40) return 'var(--orange-accent)';
    return 'var(--error-red)';
  };

  const statusColors = getStatusColor(status);

  return (
    <div style={{ 
      background: 'var(--content-bg)', 
      borderRadius: '12px', 
      boxShadow: '0 4px 15px rgba(0,0,0,0.1)', 
      border: '1px solid var(--border-gray)', 
      overflow: 'hidden',
      transition: 'all 0.3s ease'
    }}>
      {/* Header */}
      <div style={{ 
        padding: '25px', 
        borderBottom: '1px solid var(--border-gray)',
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: 'var(--content-text)', margin: 0 }}>
            {title}
          </h3>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            padding: '8px 12px', 
            borderRadius: '20px', 
            fontSize: '0.8rem', 
            fontWeight: '500', 
            border: `1px solid ${statusColors.border}`,
            background: statusColors.bg,
            color: statusColors.text
          }}>
            {getStatusIcon(status)}
            <span style={{ marginLeft: '6px', textTransform: 'capitalize' }}>
              {status.replace('-', ' ')}
            </span>
          </div>
        </div>
        <div style={{ marginTop: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ 
              fontSize: '2.5rem', 
              fontWeight: '800', 
              color: getScoreColor(score),
              marginRight: '20px'
            }}>
              {round(score)}%
            </span>
            <div style={{ flex: 1 }}>
              <div style={{ 
                width: '100%', 
                background: 'var(--border-gray)', 
                borderRadius: '10px', 
                height: '8px',
                overflow: 'hidden'
              }}>
                <div 
                  style={{ 
                    height: '8px', 
                    borderRadius: '10px', 
                    background: getScoreColor(score),
                    transition: 'all 0.3s ease',
                    width: `${round(score)}%`
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '25px' }}>
        {/* Findings */}
        {findings.length > 0 && (
          <div style={{ marginBottom: '25px' }}>
            <h4 style={{ 
              fontSize: '0.9rem', 
              fontWeight: '600', 
              color: 'var(--content-text)', 
              margin: '0 0 12px 0' 
            }}>
              Key Findings:
            </h4>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
              {findings.map((finding, index) => (
                <li key={index} style={{ 
                  fontSize: '0.85rem', 
                  color: 'var(--secondary-content)', 
                  display: 'flex', 
                  alignItems: 'flex-start',
                  marginBottom: '8px',
                  lineHeight: '1.5'
                }}>
                  <span style={{ color: 'var(--error-red)', marginRight: '8px', marginTop: '2px' }}>•</span>
                  {finding}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div style={{ marginBottom: '25px' }}>
            <h4 style={{ 
              fontSize: '0.9rem', 
              fontWeight: '600', 
              color: 'var(--content-text)', 
              margin: '0 0 12px 0' 
            }}>
              Recommendations:
            </h4>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
              {recommendations.map((recommendation, index) => (
                <li key={index} style={{ 
                  fontSize: '0.85rem', 
                  color: 'var(--secondary-content)', 
                  display: 'flex', 
                  alignItems: 'flex-start',
                  marginBottom: '8px',
                  lineHeight: '1.5'
                }}>
                  <span style={{ color: 'var(--success-green)', marginRight: '8px', marginTop: '2px' }}>•</span>
                  {recommendation}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Detailed Scores */}
        {details && Object.keys(details).length > 0 && (
          <div>
            <h4 style={{ 
              fontSize: '0.9rem', 
              fontWeight: '600', 
              color: 'var(--content-text)', 
              margin: '0 0 12px 0' 
            }}>
              Detailed Scores:
            </h4>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', 
              gap: '8px' 
            }}>
              {Object.entries(details).map(([key, value]) => (
                <div key={key} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  fontSize: '0.8rem',
                  padding: '6px 0'
                }}>
                  <span style={{ 
                    color: 'var(--secondary-content)', 
                    textTransform: 'capitalize',
                    fontWeight: '500'
                  }}>
                    {key.replace(/([A-Z])/g, ' $1').trim()}:
                  </span>
                  <span style={{ 
                    fontWeight: '600', 
                    color: getScoreColor(value) 
                  }}>
                    {round(value)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 