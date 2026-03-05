import { ScoringFactorResult } from '@/types';

interface FactorDetailsProps {
  factor: ScoringFactorResult;
  accent: string;
  borderColor: string;
  gradient: string;
  defaultOpen?: boolean;
}

const priorityStyleMap = {
  high: { label: 'High', bg: 'rgba(231, 76, 60, 0.12)', border: 'rgba(231, 76, 60, 0.35)', text: 'var(--error-red)' },
  medium: { label: 'Medium', bg: 'rgba(230, 126, 34, 0.12)', border: 'rgba(230, 126, 34, 0.35)', text: 'var(--orange-accent)' },
  low: { label: 'Low', bg: 'rgba(39, 174, 96, 0.12)', border: 'rgba(39, 174, 96, 0.35)', text: 'var(--success-green)' }
} as const;

function formatStatValue(value: unknown): string {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? `${Math.round(value * 100) / 100}` : 'N/A';
  }

  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }

  if (Array.isArray(value)) {
    return value.length ? `${value.length} items` : 'None';
  }

  if (value && typeof value === 'object') {
    return `${Object.keys(value as Record<string, unknown>).length} fields`;
  }

  if (value === null || value === undefined || value === '') {
    return 'N/A';
  }

  return String(value);
}

export default function FactorDetails({ factor, accent, borderColor, gradient, defaultOpen }: FactorDetailsProps) {
  const entries = Object.entries(factor.stats ?? {});

  return (
    <details open={defaultOpen} style={{
      border: `1px solid ${borderColor}`,
      borderRadius: '12px',
      background: 'var(--content-bg)',
      overflow: 'hidden',
      boxShadow: '0 10px 26px rgba(0,0,0,0.08)'
    }}>
      <summary style={{
        cursor: 'pointer',
        listStyle: 'none',
        padding: '16px 18px',
        background: gradient,
        borderLeft: `5px solid ${accent}`
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--content-text)' }}>{factor.label}</h3>
            <p style={{ margin: '6px 0 0', fontSize: '0.88rem', color: 'var(--secondary-content)', textTransform: 'capitalize' }}>
              {factor.status.replace('-', ' ')} performance
            </p>
          </div>
          <strong style={{ color: accent, fontSize: '1.5rem', lineHeight: 1 }}>{factor.score}%</strong>
        </div>
      </summary>

      <section style={{ padding: '18px' }}>
        {entries.length > 0 && (
          <div style={{ marginBottom: '18px' }}>
            <h4 style={{ margin: '0 0 12px', color: 'var(--content-text)' }}>Metrics</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
              {entries.map(([key, value]) => (
                <div key={`${factor.key}-stat-${key}`} style={{
                  border: '1px solid var(--border-gray)',
                  borderRadius: '10px',
                  padding: '10px 12px',
                  background: 'var(--background-gray)'
                }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--muted-text)', marginBottom: '4px' }}>
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase())}
                  </div>
                  <div style={{ color: 'var(--content-text)', fontWeight: 700 }}>{formatStatValue(value)}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {factor.findings.length > 0 && (
          <div style={{ marginBottom: '18px' }}>
            <h4 style={{ margin: '0 0 12px', color: 'var(--content-text)' }}>Key Findings</h4>
            <div style={{ display: 'grid', gap: '8px' }}>
              {factor.findings.map((finding, index) => (
                <div key={`${factor.key}-finding-${index}`} style={{
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-gray)',
                  background: 'rgba(52, 152, 219, 0.06)',
                  color: 'var(--secondary-content)',
                  fontSize: '0.9rem'
                }}>
                  {finding}
                </div>
              ))}
            </div>
          </div>
        )}

        {factor.recommendations.length > 0 && (
          <div>
            <h4 style={{ margin: '0 0 12px', color: 'var(--content-text)' }}>Recommendations</h4>
            <div style={{ display: 'grid', gap: '10px' }}>
              {factor.recommendations.map((recommendation, index) => {
                const priorityStyle = priorityStyleMap[recommendation.priority];
                return (
                  <article
                    key={`${factor.key}-rec-${index}`}
                    style={{
                      border: `1px solid ${priorityStyle.border}`,
                      borderLeft: `4px solid ${priorityStyle.text}`,
                      borderRadius: '10px',
                      padding: '12px',
                      background: priorityStyle.bg
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', marginBottom: '6px', alignItems: 'center' }}>
                      <span style={{
                        borderRadius: '999px',
                        padding: '3px 9px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        color: priorityStyle.text,
                        border: `1px solid ${priorityStyle.border}`,
                        background: 'rgba(255,255,255,0.7)'
                      }}>
                        {priorityStyle.label} Priority
                      </span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--muted-text)' }}>{recommendation.category}</span>
                    </div>
                    <p style={{ margin: 0, color: 'var(--content-text)', fontSize: '0.91rem', lineHeight: 1.5 }}>
                      {recommendation.text}
                    </p>
                    {recommendation.timeToImplement && (
                      <p style={{ margin: '8px 0 0', fontSize: '0.8rem', color: 'var(--secondary-content)' }}>
                        Time to implement: {recommendation.timeToImplement}
                      </p>
                    )}
                  </article>
                );
              })}
            </div>
          </div>
        )}
      </section>
    </details>
  );
}
